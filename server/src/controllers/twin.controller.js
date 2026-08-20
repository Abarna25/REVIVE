const db = require('../repositories/database');
const { createRevenueRescueTwin } = require('../engines/twin.engine');
const { simulateAllStrategies } = require('../engines/scoring.engine');
const { evaluateSafetyGates } = require('../engines/safety.engine');

async function getTwin(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj || !caseObj.rescueTwin) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Revenue Rescue Twin not found for this case.' } });
    }
    res.json({ success: true, data: caseObj.rescueTwin });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function simulateTwin(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    const event = caseObj.revenueEvent;
    const twinData = createRevenueRescueTwin(event, req.body.customerProfile || {});
    const rescueTwin = await db.saveRescueTwin({ ...twinData, recoveryCaseId: caseObj.id });

    const simResults = simulateAllStrategies(rescueTwin, {
      failureReason: caseObj.rootCause || 'INSUFFICIENT_FUNDS',
      eventType: event ? event.eventType : 'PAYMENT_FAILED'
    });

    await db.saveSimulations(caseObj.id, simResults.simulations);

    const policy = await db.getMerchantPolicy(caseObj.merchantId);
    const safetyResult = evaluateSafetyGates(caseObj, simResults.recommendedStrategy, policy);
    await db.saveSafetyGates(caseObj.id, safetyResult.gates);

    await db.updateCase(caseObj.id, {
      status: 'SIMULATION_COMPLETED',
      selectedStrategy: simResults.recommendedStrategy.strategyType,
      predictedRecoveryProbability: simResults.recommendedStrategy.predictedRecoveryProbability,
      expectedNetRecoveryScore: simResults.recommendedStrategy.expectedNetRecoveryScore,
      interventionCost: simResults.recommendedStrategy.interventionCost
    });

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'TWIN_RE_SIMULATED',
      actorType: 'AI_ENGINE',
      description: `Re-simulated Rescue Twin. Strategy ${simResults.recommendedStrategy.strategyType} selected with ENRS ₹${simResults.recommendedStrategy.expectedNetRecoveryScore}.`
    });

    const updatedCase = await db.getCaseById(caseObj.id);

    res.json({
      success: true,
      data: {
        twin: rescueTwin,
        simulations: simResults.simulations,
        recommendedStrategy: simResults.recommendedStrategy,
        safetyResult,
        updatedCase
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SIMULATION_ERROR', message: err.message } });
  }
}

module.exports = {
  getTwin,
  simulateTwin
};
