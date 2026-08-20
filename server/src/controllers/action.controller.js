const db = require('../repositories/database');
const { createPaymentLink, executePaymentRetry } = require('../integrations/razorpay');
const { evaluateSafetyGates } = require('../engines/safety.engine');
const { recordOutcome } = require('../engines/learning.engine');
const { generatePersonalizedMessage } = require('../engines/ai.engine');
const { v4: uuidv4 } = require('uuid');

async function executeAction(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || `idemp_${caseObj.id}_${Date.now()}`;

    // Idempotency Check
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

    // Safety Gate Check
    if (safetyResult.isBlocked || (safetyResult.requiresManualApproval && !req.body.isApprovedByMerchant)) {
      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ACTION_BLOCKED_SAFETY_GATE',
        actorType: 'SAFETY_ENGINE',
        description: `Action ${strategy} blocked: ${safetyResult.blockReason || 'Manual approval required.'}`
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'SAFETY_GATE_BLOCKED',
          message: safetyResult.blockReason || 'Action requires explicit merchant approval.',
          safetyResult
        }
      });
    }

    // Record Action Pending
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

    // Razorpay or Simulation Execution Call
    if (strategy === 'PAYMENT_LINK' || strategy === 'ALTERNATE_PAYMENT') {
      let metadata = {};
      try {
        metadata = JSON.parse(event.rawMetadata || '{}');
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

    // Handle Graceful Failure Demo Scenario or API Failure
    if (!executionResult.success) {
      actionRecord.status = 'FAILED';
      actionRecord.failureReason = executionResult.errorMessage;
      actionRecord.resultMetadata = JSON.stringify(executionResult);

      await db.updateCase(caseObj.id, {
        status: 'FAILED_GRACEFULLY'
      });

      await db.addAuditLog({
        merchantId: caseObj.merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ACTION_FAILED_GRACEFULLY',
        actorType: 'PAYMENT_PROVIDER',
        description: `Action Failed Gracefully → No duplicate charge → Case safely preserved for review. (Error: ${executionResult.errorMessage})`
      });

      recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', strategy, winningSim ? winningSim.predictedRecoveryProbability : 0.8, 'FAILED', 0, actionRecord.cost);

      return res.json({
        success: true,
        handledGracefully: true,
        message: 'Action Failed Gracefully → No duplicate charge → Case safely preserved for review.',
        data: {
          action: actionRecord,
          executionResult,
          case: await db.getCaseById(caseObj.id)
        }
      });
    }

    // Success Path
    actionRecord.status = 'SUCCEEDED';
    actionRecord.completedAt = new Date().toISOString();
    actionRecord.resultMetadata = JSON.stringify(executionResult);

    const netSaved = amount - actionRecord.cost;

    await db.updateCase(caseObj.id, {
      status: 'RECOVERED',
      recoveredAmount: amount,
      netRevenueSaved: netSaved,
      closedAt: new Date().toISOString()
    });

    if (event) {
      await db.createEvent({ ...event, status: 'RECOVERED' });
    }

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'RECOVERY_COMPLETED',
      actorType: 'PAYMENT_PROVIDER',
      description: `Recovery action ${strategy} completed successfully via ${executionResult.mode}. Recovered ₹${amount}. Net saved: ₹${netSaved}.`
    });

    recordOutcome(caseObj.id, event ? event.eventType : 'PAYMENT_FAILED', strategy, winningSim ? winningSim.predictedRecoveryProbability : 0.8, 'SUCCEEDED', amount, actionRecord.cost);

    res.json({
      success: true,
      handledGracefully: false,
      data: {
        action: actionRecord,
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
