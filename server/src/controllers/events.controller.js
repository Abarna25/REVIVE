const db = require('../repositories/database');
const { detectRevenueRisk } = require('../engines/detection.engine');
const { createRevenueRescueTwin } = require('../engines/twin.engine');
const { simulateAllStrategies } = require('../engines/scoring.engine');
const { evaluateSafetyGates } = require('../engines/safety.engine');

async function getEvents(req, res) {
  try {
    const events = await db.getAllEvents();
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function getEventById(req, res) {
  try {
    const event = await db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Revenue event not found.' } });
    }
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function ingestEvent(req, res) {
  try {
    const rawData = req.body;
    const detected = detectRevenueRisk(rawData);

    const event = await db.createEvent({
      merchantId: rawData.merchantId || 'merchant-default-001',
      externalReferenceId: rawData.externalReferenceId || `REF_${Date.now()}`,
      eventType: detected.eventType || 'PAYMENT_FAILED',
      amount: parseFloat(detected.amount) || 5000,
      currency: detected.currency || 'INR',
      status: 'UNRESOLVED',
      occurredAt: rawData.occurredAt || new Date().toISOString(),
      rawMetadata: JSON.stringify(rawData.metadata || rawData)
    });

    const recoveryCase = await db.createCase({
      revenueEventId: event.id,
      merchantId: event.merchantId,
      status: 'DETECTED',
      rootCause: detected.failureReason
    });

    const twinData = createRevenueRescueTwin(event, rawData.customerProfile || {});
    const rescueTwin = await db.saveRescueTwin({ ...twinData, recoveryCaseId: recoveryCase.id });

    const simResult = simulateAllStrategies(rescueTwin, { failureReason: detected.failureReason, eventType: detected.eventType });
    await db.saveSimulations(recoveryCase.id, simResult.simulations);

    const policy = await db.getMerchantPolicy(event.merchantId);
    const safetyResult = evaluateSafetyGates(recoveryCase, simResult.recommendedStrategy, policy);
    await db.saveSafetyGates(recoveryCase.id, safetyResult.gates);

    await db.updateCase(recoveryCase.id, {
      status: 'SIMULATION_COMPLETED',
      selectedStrategy: simResult.recommendedStrategy.strategyType,
      predictedRecoveryProbability: simResult.recommendedStrategy.predictedRecoveryProbability,
      expectedNetRecoveryScore: simResult.recommendedStrategy.expectedNetRecoveryScore,
      interventionCost: simResult.recommendedStrategy.interventionCost
    });

    await db.addAuditLog({
      merchantId: event.merchantId,
      recoveryCaseId: recoveryCase.id,
      eventType: 'EVENT_INGESTED_TWIN_CREATED',
      actorType: 'SYSTEM',
      description: `Ingested ${detected.eventType} of ₹${event.amount}. Instantiated Revenue Rescue Twin and simulated 7 strategies.`
    });

    res.status(201).json({
      success: true,
      data: {
        event,
        recoveryCase: await db.getCaseById(recoveryCase.id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INGESTION_ERROR', message: err.message } });
  }
}

module.exports = {
  getEvents,
  getEventById,
  ingestEvent
};
