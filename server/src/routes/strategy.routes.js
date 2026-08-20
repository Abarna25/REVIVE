const express = require('express');
const router = express.Router();
const db = require('../repositories/database');

router.get('/:id/strategies', async (req, res) => {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found.' } });
    }
    res.json({ success: true, data: caseObj.strategySimulations || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
});

router.post('/:id/select-strategy', async (req, res) => {
  try {
    const { strategyType } = req.body;
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found.' } });
    }

    const sim = caseObj.strategySimulations.find(s => s.strategyType === strategyType);
    const updated = await db.updateCase(caseObj.id, {
      selectedStrategy: strategyType,
      predictedRecoveryProbability: sim ? sim.predictedRecoveryProbability : caseObj.predictedRecoveryProbability,
      expectedNetRecoveryScore: sim ? sim.expectedNetRecoveryScore : caseObj.expectedNetRecoveryScore
    });

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'STRATEGY_MANUALLY_OVERRIDDEN',
      actorType: 'USER',
      description: `Merchant selected strategy ${strategyType} manually.`
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
});

module.exports = router;
