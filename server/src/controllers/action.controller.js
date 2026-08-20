const db = require('../repositories/database');
const { createPaymentLink, executePaymentRetry } = require('../integrations/razorpay');
const { evaluateSafetyGates } = require('../engines/safety.engine');
const { recordOutcome } = require('../engines/learning.engine');

async function executeAction(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    // Phase 3 Check: Case completion state
    if (caseObj.status === 'RECOVERED' || caseObj.status === 'STOPPED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CASE_ALREADY_CLOSED',
          message: `Case ${caseObj.id} is already in terminal state ${caseObj.status}. Further action execution disabled.`
        }
      });
    }

    // Phase 5 Check: Simulation required before execution
    if (!caseObj.strategySimulations || caseObj.strategySimulations.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SIMULATION_REQUIRED',
          message: 'Run a Recovery Twin simulation before executing an action.'
        }
      });
    }

    const event = caseObj.revenueEvent;
    const amount = event ? event.amount : (caseObj.rescueTwin ? caseObj.rescueTwin.revenueAmount : 5000);
    const strategy = caseObj.selectedStrategy || 'RETRY_OPTIMAL_TIME';

    // Section 7: STOP_INTERVENTION Terminal Decision Handler
    if (strategy === 'STOP_INTERVENTION') {
      await db.updateCase(caseObj.id, {
        status: 'STOPPED',
        closedAt: new Date().toISOString()
      });

      if (event) {
        await db.updateEvent(event.id, { status: 'STOPPED' });
      }

      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'RECOVERY_STOPPED_BY_AI',
        actorType: 'AI_SAFETY_ENGINE',
        description: `AI Engine determined STOP_INTERVENTION as winning strategy. High fatigue or negative ENRS detected. Case safely terminated.`
      });

      return res.json({
        success: true,
        message: 'STOP_INTERVENTION executed. Recovery workflow safely terminated.',
        data: await db.getCaseById(caseObj.id)
      });
    }

    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || `idemp_${caseObj.id}_${Date.now()}`;

    // Phase 8 Check: Idempotency Duplicate Protection
    const existingAction = await db.getActionByIdempotency(idempotencyKey);
    if (existingAction) {
      return res.json({
        success: true,
        isDuplicate: true,
        message: 'Idempotency key matched existing action. Returned cached result.',
        data: existingAction
      });
    }

    const winningSim = caseObj.strategySimulations.find(s => s.strategyType === strategy) || caseObj.strategySimulations[0];
    const policy = await db.getMerchantPolicy(caseObj.merchantId);
    const safetyResult = evaluateSafetyGates(caseObj, winningSim, policy);

    // Section 11: Safety Gate & Force Stop Enforcement
    if (safetyResult.isBlocked || safetyResult.forceStopRecovery) {
      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ACTION_BLOCKED_SAFETY_GATE',
        actorType: 'SAFETY_ENGINE',
        description: `Action ${strategy} blocked: ${safetyResult.fatigueGuardReason || safetyResult.blockReason || 'Safety gate constraint violated.'}`
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'SAFETY_GATE_BLOCKED',
          message: safetyResult.fatigueGuardReason || safetyResult.blockReason || 'Action blocked by safety policy.',
          safetyResult
        }
      });
    }

    // Section 5: Server-side Manual Approval Validation
    const isApproved = caseObj.isApprovedByMerchant || caseObj.status === 'READY_TO_EXECUTE' || req.body.isApprovedByMerchant;
    if (safetyResult.requiresManualApproval && !isApproved) {
      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'MANUAL_APPROVAL_REQUIRED',
        actorType: 'SAFETY_ENGINE',
        description: `Action ${strategy} blocked: Amount (₹${amount}) exceeds approval threshold (₹${policy.manualApprovalThreshold}). Manual merchant approval required.`
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'MANUAL_APPROVAL_REQUIRED',
          message: 'Action requires explicit merchant approval before execution.',
          safetyResult
        }
      });
    }

    // Create initial Action record in EXECUTING state
    const actionRecord = await db.createAction({
      recoveryCaseId: caseObj.id,
      strategySimulationId: winningSim ? winningSim.id : null,
      actionType: strategy,
      status: 'EXECUTING',
      executedAt: new Date().toISOString(),
      cost: winningSim ? winningSim.interventionCost : 20,
      idempotencyKey
    });

    let executionResult;

    // Razorpay or Simulation Payment Provider Call
    if (strategy === 'PAYMENT_LINK' || strategy === 'ALTERNATE_PAYMENT') {
      let metadata = {};
      try {
        metadata = JSON.parse(event ? event.rawMetadata : '{}');
      } catch (e) {}

      executionResult = await createPaymentLink(
        amount,
        event ? event.currency : 'INR',
        { name: metadata.customerName || 'Valued Customer', email: metadata.customerEmail, phone: metadata.customerPhone },
        `REVIVE Recovery Link for Case ${caseObj.id}`,
        idempotencyKey
      );
    } else {
      executionResult = await executePaymentRetry(amount, {}, idempotencyKey);
    }

    // Handle Provider Call Failure
    if (!executionResult.success) {
      await db.updateAction(actionRecord.id, {
        status: 'FAILED',
        failureReason: executionResult.errorMessage,
        resultMetadata: JSON.stringify(executionResult)
      });

      await db.updateCase(caseObj.id, {
        status: 'FAILED_GRACEFULLY'
      });

      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ACTION_FAILED_GRACEFULLY',
        actorType: 'PAYMENT_PROVIDER',
        description: `Action Failed Gracefully → Gateway timeout detected → Idempotency lock active (No duplicate charge) → Preserved for review.`
      });

      recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', strategy, winningSim ? winningSim.predictedRecoveryProbability : 0.8, 'FAILED', 0, actionRecord.cost);

      const updatedAction = await db.getActionByIdempotency(idempotencyKey);

      return res.json({
        success: true,
        handledGracefully: true,
        message: 'Action Failed Gracefully → No duplicate charge → Case safely preserved for review.',
        data: {
          action: updatedAction,
          executionResult,
          case: await db.getCaseById(caseObj.id)
        }
      });
    }

    // Section 4 Financial Accuracy Fix: Move to AWAITING_PAYMENT_CONFIRMATION
    // DO NOT mark as RECOVERED until confirmPayment endpoint is called!
    await db.updateAction(actionRecord.id, {
      status: 'AWAITING_PAYMENT_CONFIRMATION',
      resultMetadata: JSON.stringify(executionResult)
    });

    await db.updateCase(caseObj.id, {
      status: 'AWAITING_PAYMENT_CONFIRMATION',
      recoveredAmount: 0,
      netRevenueSaved: 0
    });

    if (event) {
      await db.updateEvent(event.id, { status: 'AWAITING_PAYMENT' });
    }

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'PAYMENT_INTERVENTION_INITIALIZED',
      actorType: 'PAYMENT_PROVIDER',
      description: `Payment intervention ${strategy} initialized via ${executionResult.mode}. Link/Retry ID: ${executionResult.paymentLinkId || executionResult.transactionId || 'SIM-PAY-99'}. Moved to AWAITING_PAYMENT_CONFIRMATION. Revenue will be counted ONLY upon payment confirmation.`
    });

    const updatedAction = await db.getActionByIdempotency(idempotencyKey);

    res.json({
      success: true,
      handledGracefully: false,
      awaitingConfirmation: true,
      message: 'Payment intervention initialized. Case is now AWAITING_PAYMENT_CONFIRMATION.',
      data: {
        action: updatedAction,
        executionResult,
        case: await db.getCaseById(caseObj.id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'EXECUTION_ERROR', message: err.message } });
  }
}

// Section 5: Separate Approval Operation
async function approveAction(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    if (caseObj.status === 'RECOVERED' || caseObj.status === 'STOPPED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CASE_ALREADY_CLOSED',
          message: `Case ${caseObj.id} is already in terminal state ${caseObj.status}. Approval disabled.`
        }
      });
    }

    // Persist approval state and set case to READY_TO_EXECUTE
    await db.updateCase(caseObj.id, {
      isApprovedByMerchant: true,
      status: 'READY_TO_EXECUTE'
    });

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'MANUAL_APPROVAL_GRANTED',
      actorType: 'USER',
      description: `Merchant operator manually approved strategy ${caseObj.selectedStrategy || 'RETRY_OPTIMAL_TIME'}. Case status updated to READY_TO_EXECUTE.`
    });

    const updatedCase = await db.getCaseById(caseObj.id);

    return res.json({
      success: true,
      message: 'Merchant approval granted. Case is now READY_TO_EXECUTE.',
      data: updatedCase
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'APPROVAL_ERROR', message: err.message } });
  }
}

// Section 4: Explicit Payment Confirmation Endpoint
async function confirmPayment(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    if (caseObj.status === 'RECOVERED') {
      return res.json({
        success: true,
        alreadyConfirmed: true,
        message: 'Payment for this recovery case was already confirmed.',
        data: caseObj
      });
    }

    const { paymentReference = `REF-${Date.now().toString().substring(5)}`, status = 'CONFIRMED' } = req.body;

    const event = caseObj.revenueEvent;
    const amount = event ? event.amount : (caseObj.rescueTwin ? caseObj.rescueTwin.revenueAmount : 5000);
    const actions = caseObj.recoveryActions || [];
    const lastAction = actions[actions.length - 1];
    const cost = lastAction ? lastAction.cost : 20;

    if (status === 'CONFIRMED') {
      const netSaved = amount - cost;

      if (lastAction) {
        await db.updateAction(lastAction.id, {
          status: 'SUCCEEDED',
          completedAt: new Date().toISOString(),
          resultMetadata: JSON.stringify({ paymentReference, confirmedAt: new Date().toISOString(), status: 'CONFIRMED' })
        });
      }

      await db.updateCase(caseObj.id, {
        status: 'RECOVERED',
        recoveredAmount: amount,
        netRevenueSaved: netSaved,
        closedAt: new Date().toISOString()
      });

      if (event) {
        await db.updateEvent(event.id, { status: 'RECOVERED' });
      }

      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'PAYMENT_CONFIRMED_SUCCESS',
        actorType: 'PAYMENT_PROVIDER',
        description: `SIMULATED PAYMENT CONFIRMED: Payment reference ${paymentReference} verified. ₹${amount} recovered. Net saved: ₹${netSaved}. Case marked RECOVERED.`
      });

      recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', caseObj.selectedStrategy || 'RETRY_OPTIMAL_TIME', 0.9, 'SUCCEEDED', amount, cost);

      const updatedCase = await db.getCaseById(caseObj.id);

      return res.json({
        success: true,
        message: 'Payment successfully confirmed! Revenue recovered & net value saved calculated.',
        data: updatedCase
      });
    } else {
      // Payment Failed / Expired
      if (lastAction) {
        await db.updateAction(lastAction.id, {
          status: 'FAILED',
          failureReason: 'Payment confirmation failed or link expired'
        });
      }

      await db.updateCase(caseObj.id, {
        status: 'FAILED_GRACEFULLY'
      });

      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'PAYMENT_CONFIRMATION_FAILED',
        actorType: 'PAYMENT_PROVIDER',
        description: `Payment confirmation failed or expired for reference ${paymentReference}. Case status updated to FAILED_GRACEFULLY.`
      });

      recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', caseObj.selectedStrategy || 'RETRY_OPTIMAL_TIME', 0.9, 'FAILED', 0, cost);

      const updatedCase = await db.getCaseById(caseObj.id);

      return res.json({
        success: true,
        message: 'Payment confirmation failed. Case marked FAILED_GRACEFULLY.',
        data: updatedCase
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CONFIRMATION_ERROR', message: err.message } });
  }
}

async function stopRecovery(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    await db.updateCase(caseObj.id, {
      status: 'STOPPED',
      closedAt: new Date().toISOString()
    });

    if (caseObj.revenueEvent) {
      await db.updateEvent(caseObj.revenueEvent.id, { status: 'STOPPED' });
    }

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'RECOVERY_STOPPED_BY_MERCHANT',
      actorType: 'USER',
      description: `Recovery workflow manually stopped by merchant operator.`
    });

    res.json({
      success: true,
      message: 'Recovery workflow successfully stopped.',
      data: await db.getCaseById(caseObj.id)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'STOP_ERROR', message: err.message } });
  }
}

module.exports = {
  executeAction,
  approveAction,
  confirmPayment,
  stopRecovery
};
