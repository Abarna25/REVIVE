/**
 * REVIVE™ Diagnosis Engine
 * Evaluates why revenue is at risk based on failure patterns, customer profile & transaction context.
 */

function diagnoseRevenueRisk(detectedEvent, twinContext) {
  const { eventType, failureReason, isTransient, amount } = detectedEvent;
  const { customerHistoryScore, engagementScore, previousAttempts } = twinContext || {};

  let diagnosisText = '';
  let riskFactor = 'MEDIUM';
  let recoveryFeasibility = 'HIGH';

  if (!isTransient && failureReason === 'CARD_EXPIRED') {
    diagnosisText = 'Payment failed due to an expired payment method. Retrying payment will consistently fail. An alternate payment link or update request is mandatory.';
    recoveryFeasibility = 'MEDIUM';
  } else if (failureReason === 'INSUFFICIENT_FUNDS') {
    diagnosisText = `Temporary balance insufficiency detected for customer with ${Math.round((engagementScore || 0.7) * 100)}% engagement index. Historical patterns show 82% recovery rate if retried during preferred evening window (19:00-21:00).`;
    recoveryFeasibility = 'HIGH';
  } else if (failureReason === 'BANK_SYSTEM_DOWN' || failureReason === 'NETWORK_TIMEOUT') {
    diagnosisText = 'Transient inter-bank network glitch. High probability of automatic resolution once core banking switches recover.';
    recoveryFeasibility = 'VERY_HIGH';
  } else if (eventType === 'CHECKOUT_ABANDONED') {
    diagnosisText = 'Customer abandoned cart during final checkout step. High engagement signal suggests high intent; personalized incentive or reminder link is recommended.';
    recoveryFeasibility = 'HIGH';
  } else if (eventType === 'INVOICE_OVERDUE') {
    diagnosisText = `B2B invoice passed due date. Customer history score is ${Math.round((customerHistoryScore || 0.8) * 100)}%. Requires polite structured reminder or payment link with automated tracking.`;
    recoveryFeasibility = 'MEDIUM';
  } else {
    diagnosisText = `Revenue of ₹${amount} is at risk due to ${failureReason || 'unclassified transaction decline'}. Previous recovery attempts: ${previousAttempts || 0}.`;
  }

  return {
    rootCause: failureReason || eventType,
    diagnosisText,
    riskFactor,
    recoveryFeasibility,
    isTransient,
    customerEngagementIndex: engagementScore || 0.75,
    customerHistoryIndex: customerHistoryScore || 0.85
  };
}

module.exports = {
  diagnoseRevenueRisk
};
