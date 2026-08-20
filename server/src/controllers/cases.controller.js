const db = require('../repositories/database');
const { diagnoseRevenueRisk } = require('../engines/diagnosis.engine');
const { generateAIExplanation } = require('../engines/ai.engine');
const { evaluateSafetyGates } = require('../engines/safety.engine');

async function getCases(req, res) {
  try {
    const cases = await db.getAllCases();
    res.json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function getCaseById(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }
    res.json({ success: true, data: caseObj });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function analyzeCase(req, res) {
  try {
    const caseObj = await db.getCaseById(req.params.id);
    if (!caseObj) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recovery case not found.' } });
    }

    const diagnosis = diagnoseRevenueRisk(
      {
        eventType: caseObj.revenueEvent ? caseObj.revenueEvent.eventType : 'PAYMENT_FAILED',
        failureReason: caseObj.rootCause || 'NETWORK_TIMEOUT',
        isTransient: true,
        amount: caseObj.revenueEvent ? caseObj.revenueEvent.amount : 5000
      },
      caseObj.rescueTwin
    );

    const winningSim = caseObj.strategySimulations.find(s => s.strategyType === caseObj.selectedStrategy) || caseObj.strategySimulations[0];
    const policy = await db.getMerchantPolicy(caseObj.merchantId);
    const safetyResult = evaluateSafetyGates(caseObj, winningSim, policy);

    const aiResult = await generateAIExplanation(caseObj, winningSim, caseObj.strategySimulations, safetyResult);

    await db.addAuditLog({
      merchantId: caseObj.merchantId,
      recoveryCaseId: caseObj.id,
      eventType: 'DIAGNOSIS_COMPLETED',
      actorType: 'AI_ENGINE',
      description: `Completed AI Diagnosis: ${diagnosis.diagnosisText}`
    });

    res.json({
      success: true,
      data: {
        caseId: caseObj.id,
        diagnosis,
        safetyResult,
        aiExplanation: aiResult
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ANALYSIS_ERROR', message: err.message } });
  }
}

module.exports = {
  getCases,
  getCaseById,
  analyzeCase
};
