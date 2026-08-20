/**
 * REVIVE™ Strategy Simulation & Scoring Engine
 * Evaluates candidate strategies, calculates predicted recovery probability, costs, fatigue penalties, and ENRS.
 *
 * Formula:
 * ENRS = (Predicted Recovery Probability × Revenue Amount) − Intervention Cost − Recovery Fatigue Penalty
 */

const STRATEGIES = [
  'RETRY_NOW',
  'RETRY_OPTIMAL_TIME',
  'PAYMENT_LINK',
  'ALTERNATE_PAYMENT',
  'PERSONALIZED_REMINDER',
  'MANUAL_ESCALATION',
  'STOP_INTERVENTION'
];

/**
 * Calculates baseline strategy parameters based on failure reason and twin context.
 */
function evaluateStrategyCandidate(strategyType, twin, eventDetails) {
  const amount = twin.revenueAmount;
  const failureReason = eventDetails.failureReason || 'NETWORK_TIMEOUT';
  const fatigueScore = twin.recoveryFatigueScore || 0;
  const attempts = twin.previousAttempts || 0;
  const engagement = twin.engagementScore || 0.7;

  let probability = 0.5;
  let cost = 10;
  let fatiguePenalty = fatigueScore * 200;
  let complianceRisk = 0.05;
  let isEligible = true;
  let ineligibilityReason = null;

  switch (strategyType) {
    case 'RETRY_NOW':
      cost = 15; // Payment gateway API charge / processing
      if (failureReason === 'NETWORK_TIMEOUT' || failureReason === 'BANK_SYSTEM_DOWN') {
        probability = 0.88;
      } else if (failureReason === 'INSUFFICIENT_FUNDS') {
        probability = 0.22; // Immediate retry for insufficient funds usually fails
        fatiguePenalty += 150;
      } else if (failureReason === 'CARD_EXPIRED') {
        probability = 0.0;
        isEligible = false;
        ineligibilityReason = 'Card has expired; instant payment retry will definitely fail.';
      } else {
        probability = 0.45;
      }
      if (attempts >= 3) {
        isEligible = false;
        ineligibilityReason = 'Maximum automatic retry attempts reached (Fatigue Guard constraint).';
      }
      break;

    case 'RETRY_OPTIMAL_TIME':
      cost = 20;
      if (failureReason === 'INSUFFICIENT_FUNDS') {
        probability = 0.84; // Retrying during salary/evening window has high success
      } else if (failureReason === 'BANK_SYSTEM_DOWN') {
        probability = 0.92;
      } else if (failureReason === 'CARD_EXPIRED') {
        probability = 0.0;
        isEligible = false;
        ineligibilityReason = 'Card is expired; time-shifted retry will not succeed.';
      } else {
        probability = 0.72;
      }
      fatiguePenalty *= 0.5; // Lower fatigue penalty because it respects user timing
      break;

    case 'PAYMENT_LINK':
      cost = 35; // SMS / WhatsApp API + Link gateway fee
      if (eventDetails.eventType === 'CHECKOUT_ABANDONED' || eventDetails.eventType === 'INVOICE_OVERDUE') {
        probability = 0.79 * engagement;
      } else if (failureReason === 'CARD_EXPIRED' || failureReason === 'ISSUER_DECLINE') {
        probability = 0.76;
      } else {
        probability = 0.65;
      }
      complianceRisk = 0.02;
      break;

    case 'ALTERNATE_PAYMENT':
      cost = 40;
      if (failureReason === 'CARD_EXPIRED' || failureReason === 'ISSUER_DECLINE') {
        probability = 0.85;
      } else {
        probability = 0.60;
      }
      break;

    case 'PERSONALIZED_REMINDER':
      cost = 25;
      probability = 0.58 * engagement;
      fatiguePenalty += 100;
      if (attempts >= 2) {
        fatiguePenalty += 300;
      }
      break;

    case 'MANUAL_ESCALATION':
      cost = 350; // Human agent operational cost
      probability = 0.68;
      if (amount < 2000) {
        isEligible = false;
        ineligibilityReason = 'Revenue amount too low to justify human agent operational cost.';
      }
      break;

    case 'STOP_INTERVENTION':
      cost = 0;
      probability = 0.0;
      fatiguePenalty = 0;
      complianceRisk = 0.0;
      // ENRS for STOP is 0
      break;

    default:
      break;
  }

  // Calculate Expected Recovery Amount
  const estimatedRecoveryAmount = probability * amount;

  // Calculate ENRS
  // ENRS = (Probability * Amount) - Cost - Fatigue Penalty
  let expectedNetRecoveryScore = (probability * amount) - cost - fatiguePenalty;
  
  if (strategyType === 'STOP_INTERVENTION') {
    expectedNetRecoveryScore = 0;
  }

  return {
    strategyType,
    predictedRecoveryProbability: Math.round(probability * 100) / 100,
    estimatedRecoveryAmount: Math.round(estimatedRecoveryAmount * 100) / 100,
    interventionCost: cost,
    fatiguePenalty: Math.round(fatiguePenalty * 100) / 100,
    complianceRisk,
    expectedNetRecoveryScore: Math.round(expectedNetRecoveryScore * 100) / 100,
    isEligible,
    ineligibilityReason
  };
}

/**
 * Runs simulation across all 7 candidate strategies and returns ranked results.
 */
function simulateAllStrategies(twin, eventDetails) {
  const results = STRATEGIES.map(strategyType => 
    evaluateStrategyCandidate(strategyType, twin, eventDetails)
  );

  // Rank eligible strategies by ENRS descending
  const eligible = results.filter(r => r.isEligible).sort((a, b) => b.expectedNetRecoveryScore - a.expectedNetRecoveryScore);
  const ineligible = results.filter(r => !r.isEligible);

  eligible.forEach((item, index) => {
    item.rank = index + 1;
  });

  ineligible.forEach(item => {
    item.rank = null;
  });

  const fullSimulations = [...eligible, ...ineligible];
  const recommendedStrategy = eligible.length > 0 ? eligible[0] : results.find(r => r.strategyType === 'STOP_INTERVENTION');

  return {
    simulations: fullSimulations,
    recommendedStrategy,
    winningENRS: recommendedStrategy ? recommendedStrategy.expectedNetRecoveryScore : 0
  };
}

module.exports = {
  simulateAllStrategies,
  evaluateStrategyCandidate,
  STRATEGIES
};
