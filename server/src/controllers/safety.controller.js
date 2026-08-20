const db = require('../repositories/database');
const { evaluateSafetyGates } = require('../engines/safety.engine');

async function getSafetyChecks(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }
    const policy = await db.getMerchantPolicy(caseObj.merchantId);
    const winningSim = caseObj.strategySimulations.find(s => s.strategyType === caseObj.selectedStrategy) || caseObj.strategySimulations[0];
    const safetyResult = evaluateSafetyGates(caseObj, winningSim, policy);

    res.json({ success: true, data: { policy, safetyResult } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function getPolicy(req, res) {
  try {
    const policy = await db.getMerchantPolicy('merchant-default-001');
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function updatePolicy(req, res) {
  try {
    const updated = await db.updateMerchantPolicy('merchant-default-001', req.body);
    await db.addAuditLog({
      merchantId: 'merchant-default-001',
      eventType: 'MERCHANT_POLICY_UPDATED',
      actorType: 'USER',
      description: 'Merchant updated autonomous recovery policy thresholds.'
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
}

module.exports = {
  getSafetyChecks,
  getPolicy,
  updatePolicy
};
