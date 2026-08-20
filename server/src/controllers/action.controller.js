const db = require('../repositories/database');
const { createPaymentLink, executePaymentRetry } = require('../integrations/razorpay');
const { evaluateSafetyGates } = require('../engines/safety.engine');
const { recordOutcome } = require('../engines/learning.engine');
const { generatePersonalizedMessage } = require('../engines/ai.engine');

async function executeAction(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    // Phase 5 Check: Case completion state
    if (caseObj.status === 'RECOVERED' || caseObj.status === 'STOPPED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CASE_ALREADY_CLOSED',
          message: `Case ${caseObj.id} is already in state ${caseObj.status}. Further action execution disabled.`
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

    const event = caseObj.revenueEvent;
    const amount = event ? event.amount : (caseObj.rescueTwin ? caseObj.rescueTwin.revenueAmount : 5000);
    const strategy = caseObj.selectedStrategy || 'RETRY_OPTIMAL_TIME';

    const winningSim = caseObj.strategySimulations.find(s => s.strategyType === strategy) || caseObj.strategySimulations[0];
    const policy = await db.getMerchantPolicy(caseObj.merchantId);
    const safetyResult = evaluateSafetyGates(caseObj, winningSim, policy);

    // Phase 6 Check: Safety Gate & Force Stop Enforcement
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

    // Phase 7 Check: Server-side Manual Approval Validation
    const isApproved = caseObj.isApprovedByMerchant || req.body.isApprovedByMerchant;
    if (safetyResult.requiresManualApproval && !isApproved) {
      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'MANUAL_APPROVAL_REQUIRED',
        actorType: 'SAFETY_ENGINE',
        description: `Action ${strategy} blocked: Amount (₹${amount}) exceeds threshold. Manual merchant approval required.`
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

    // Razorpay or Simulation Payment Provider Execution Call
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

    // Phase 4: Persist Action Failure / Graceful Failure
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

    // Phase 4 & Phase 3: Persist Action Success & Update ORIGINAL Event Status
    await db.updateAction(actionRecord.id, {
      status: 'SUCCEEDED',
      completedAt: new Date().toISOString(),
      resultMetadata: JSON.stringify(executionResult)
    });

    const netSaved = amount - actionRecord.cost;

    await db.updateCase(caseObj.id, {
      status: 'RECOVERED',
      recoveredAmount: amount,
      netRevenueSaved: netSaved,
      closedAt: new Date().toISOString()
    });

    // Phase 3 Fix: Update ORIGINAL event status (No duplicate events created!)
    if (event) {
      await db.updateEvent(event.id, { status: 'RECOVERED' });
    }

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'RECOVERY_COMPLETED',
      actorType: 'PAYMENT_PROVIDER',
      description: `Recovery action ${strategy} completed successfully via ${executionResult.mode}. Recovered ₹${amount}. Net saved: ₹${netSaved}.`
    });

    recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', strategy, winningSim ? winningSim.predictedRecoveryProbability : 0.8, 'SUCCEEDED', amount, actionRecord.cost);

    const updatedAction = await db.getActionByIdempotency(idempotencyKey);

    res.json({
      success: true,
      handledGracefully: false,
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

async function approveAction(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    // Persist approval on case
    await db.updateCase(caseObj.id, {
      isApprovedByMerchant: true
    });

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'MANUAL_APPROVAL_GRANTED',
      actorType: 'USER',
      description: `Merchant manually approved execution for strategy ${caseObj.selectedStrategy}.`
    });

    req.body.isApprovedByMerchant = true;
    return executeAction(req, res);
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'APPROVAL_ERROR', message: err.message } });
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
  stopRecovery
};
