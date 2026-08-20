/**
 * REVIVE™ AI Decision & Explanation Engine
 * Generates explainable, evidence-based AI reasoning and personalized recovery messages.
 * Uses Google Gemini API when available, with deterministic fallback explanations.
 */

const config = require('../config/env');

async function generateAIExplanation(caseDetails, selectedStrategy, simulations, safetyResult) {
  const { revenueEvent, rootCause, rescueTwin } = caseDetails;
  const amount = revenueEvent ? revenueEvent.amount : (rescueTwin ? rescueTwin.revenueAmount : 0);
  const currency = revenueEvent ? revenueEvent.currency : 'INR';
  const eventType = revenueEvent ? revenueEvent.eventType : 'PAYMENT_FAILED';
  const probability = selectedStrategy ? selectedStrategy.predictedRecoveryProbability : 0;
  const enrs = selectedStrategy ? selectedStrategy.expectedNetRecoveryScore : 0;

  // Attempt external Gemini API call if key is available
  if (config.AI_API_KEY && config.AI_MODE === 'enabled') {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.AI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are REVIVE AI, an explainable revenue recovery engine. Write a concise 2-sentence explanation for why strategy "${selectedStrategy ? selectedStrategy.strategyType : 'RETRY_OPTIMAL_TIME'}" was selected for a ${eventType} event of ${currency} ${amount}. Failure cause: ${rootCause}. Recovery probability: ${Math.round(probability * 100)}%. ENRS: ${enrs}. Do not use chain-of-thought or preamble. State decision and evidence-based reason.`
            }]
          }]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        return {
          source: 'GEMINI_AI_MODEL',
          explanationText: text.trim(),
          decisionSummary: `Selected ${selectedStrategy.strategyType} (ENRS: ₹${enrs})`
        };
      }
    } catch (err) {
      console.warn('[AIEngine] Gemini API request failed, falling back to deterministic explanation model:', err.message);
    }
  }

  // Deterministic Explainable Structured Explanation
  let reasoning = '';
  if (selectedStrategy.strategyType === 'RETRY_OPTIMAL_TIME') {
    reasoning = `This strategy has the highest valid Expected Net Recovery Score (ENRS: ₹${enrs}) because similar temporary bank failures historically recover with ${(probability * 100).toFixed(0)}% success rate during this customer's preferred evening window (${rescueTwin ? rescueTwin.preferredRecoveryWindow : '19:00-21:00'}).`;
  } else if (selectedStrategy.strategyType === 'PAYMENT_LINK') {
    reasoning = `Payment link selected as optimal recovery path. Direct retries are unlikely to succeed due to credential failure (${rootCause}). Interactive link yields projected recovery value of ₹${(selectedStrategy.estimatedRecoveryAmount).toFixed(0)} with minimal friction.`;
  } else if (selectedStrategy.strategyType === 'STOP_INTERVENTION') {
    reasoning = `Recovery intervention stopped by Recovery Fatigue Guard™. Customer intervention limits reached and predicted recovery probability is below policy safety threshold. Stopping protects merchant relationship and avoids unnecessary costs.`;
  } else if (selectedStrategy.strategyType === 'MANUAL_ESCALATION') {
    reasoning = `Escalated for human agent review. High-value revenue event (₹${amount}) exceeds autonomous execution safety threshold.`;
  } else {
    reasoning = `Selected ${selectedStrategy.strategyType} based on optimal ENRS (₹${enrs}) across ${simulations ? simulations.length : 7} simulated candidate strategies, subject to merchant safety constraints.`;
  }

  return {
    source: 'DETERMINISTIC_AI_ENGINE',
    explanationText: reasoning,
    decisionSummary: `Decision: ${selectedStrategy ? selectedStrategy.strategyType : 'STOP_INTERVENTION'} | ENRS: ₹${enrs}`,
    structuredRecord: {
      detection: `Revenue at risk: ${currency} ${amount} (${eventType})`,
      diagnosis: `Root Cause: ${rootCause || 'Transient system drop'}. Customer History Score: ${(rescueTwin ? rescueTwin.customerHistoryScore : 0.85) * 100}%`,
      simulatedPathsCount: simulations ? simulations.length : 7,
      selectedStrategy: selectedStrategy ? selectedStrategy.strategyType : 'STOP_INTERVENTION',
      reasoningText: reasoning,
      safetyChecksPassed: safetyResult ? safetyResult.allPassed : true,
      expectedOutcome: `Predicted Recovery Rate: ${(probability * 100).toFixed(0)}%, Expected Net Saved: ₹${enrs}`
    }
  };
}

function generatePersonalizedMessage(customerName, amount, strategyType, paymentUrl = '#') {
  if (strategyType === 'PAYMENT_LINK') {
    return `Hi ${customerName}, your transaction of ₹${amount} was paused due to a temporary bank delay. You can easily complete your payment here securely: ${paymentUrl}`;
  } else if (strategyType === 'ALTERNATE_PAYMENT') {
    return `Hi ${customerName}, we noticed your recent payment of ₹${amount} didn't go through. Try completing it using UPI or NetBanking here: ${paymentUrl}`;
  } else {
    return `Hi ${customerName}, we are attempting to complete your order of ₹${amount} automatically. No action needed from your side!`;
  }
}

module.exports = {
  generateAIExplanation,
  generatePersonalizedMessage
};
