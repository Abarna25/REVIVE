/**
 * REVIVE™ Recovery Fatigue Guard™ & Safety Engine
 * Evaluates merchant policies, stopping rules, and safety gates before any action execution.
 */

const DEFAULT_POLICY = {
  maxRetryAttempts: 3,
  maxReminders: 2,
  cooldownMinutes: 120,
  minRecoveryProbability: 0.20,
  minExpectedNetRecoveryScore: 100,
  maxAutonomousRecoveryAmount: 25000,
  maxInterventionCost: 500,
  manualApprovalThreshold: 10000
};

function evaluateSafetyGates(recoveryCase, recommendedStrategy, merchantPolicy = DEFAULT_POLICY) {
  const policy = { ...DEFAULT_POLICY, ...merchantPolicy };
  const twin = recoveryCase.rescueTwin || {};
  const amount = recoveryCase.revenueEvent ? recoveryCase.revenueEvent.amount : (twin.revenueAmount || 0);

  const gates = [];
  let requiresManualApproval = false;
  let isBlocked = false;
  let blockReason = null;
  let forceStopRecovery = false;
  let fatigueGuardReason = null;

  // 1. Recovery Fatigue Guard™ Evaluation
  const attempts = twin.previousAttempts || 0;
  const remindersSent = twin.remindersSent || 0;
  const prob = recommendedStrategy.predictedRecoveryProbability;

  if (attempts >= policy.maxRetryAttempts && (recommendedStrategy.strategyType === 'RETRY_NOW' || recommendedStrategy.strategyType === 'RETRY_OPTIMAL_TIME')) {
    gates.push({
      gateType: 'MAX_RETRY_LIMIT',
      passed: false,
      reason: `Attempt count (${attempts}) reached merchant limit (${policy.maxRetryAttempts}).`,
      thresholdValue: policy.maxRetryAttempts,
      actualValue: attempts
    });
    isBlocked = true;
    blockReason = `Max retries reached (${attempts}/${policy.maxRetryAttempts}).`;
  } else {
    gates.push({
      gateType: 'MAX_RETRY_LIMIT',
      passed: true,
      reason: `Attempts (${attempts}) within safety limit (${policy.maxRetryAttempts}).`,
      thresholdValue: policy.maxRetryAttempts,
      actualValue: attempts
    });
  }

  // Check Fatigue Guard Stopping Rule
  if (prob < policy.minRecoveryProbability && (attempts >= policy.maxRetryAttempts || remindersSent >= policy.maxReminders)) {
    forceStopRecovery = true;
    fatigueGuardReason = `Further intervention is predicted to have negative expected value (Recovery probability: ${(prob * 100).toFixed(0)}% < ${(policy.minRecoveryProbability * 100).toFixed(0)}% threshold) and may increase customer fatigue.`;
  }

  // 2. Minimum ENRS Check
  if (recommendedStrategy.expectedNetRecoveryScore < policy.minExpectedNetRecoveryScore && recommendedStrategy.strategyType !== 'STOP_INTERVENTION') {
    gates.push({
      gateType: 'MIN_ENRS',
      passed: false,
      reason: `ENRS (${recommendedStrategy.expectedNetRecoveryScore}) below minimum policy threshold (${policy.minExpectedNetRecoveryScore}).`,
      thresholdValue: policy.minExpectedNetRecoveryScore,
      actualValue: recommendedStrategy.expectedNetRecoveryScore
    });
    if (recommendedStrategy.expectedNetRecoveryScore <= 0) {
      forceStopRecovery = true;
      fatigueGuardReason = `Strategy ENRS is negative or zero (${recommendedStrategy.expectedNetRecoveryScore}). Recovery intervention stopped to protect merchant net revenue.`;
    }
  } else {
    gates.push({
      gateType: 'MIN_ENRS',
      passed: true,
      reason: `ENRS (${recommendedStrategy.expectedNetRecoveryScore}) satisfies policy threshold (${policy.minExpectedNetRecoveryScore}).`,
      thresholdValue: policy.minExpectedNetRecoveryScore,
      actualValue: recommendedStrategy.expectedNetRecoveryScore
    });
  }

  // 3. Minimum Recovery Probability Gate
  if (prob < policy.minRecoveryProbability && recommendedStrategy.strategyType !== 'STOP_INTERVENTION') {
    gates.push({
      gateType: 'MIN_RECOVERY_PROBABILITY',
      passed: false,
      reason: `Predicted recovery probability (${(prob * 100).toFixed(0)}%) is below minimum threshold (${(policy.minRecoveryProbability * 100).toFixed(0)}%).`,
      thresholdValue: policy.minRecoveryProbability,
      actualValue: prob
    });
  } else {
    gates.push({
      gateType: 'MIN_RECOVERY_PROBABILITY',
      passed: true,
      reason: `Probability (${(prob * 100).toFixed(0)}%) meets minimum threshold.`,
      thresholdValue: policy.minRecoveryProbability,
      actualValue: prob
    });
  }

  // 4. Maximum Autonomous Amount & Manual Approval Gate
  if (amount > policy.maxAutonomousRecoveryAmount) {
    gates.push({
      gateType: 'MAX_AUTONOMOUS_AMOUNT',
      passed: false,
      reason: `Amount (₹${amount}) exceeds maximum autonomous execution cap (₹${policy.maxAutonomousRecoveryAmount}).`,
      thresholdValue: policy.maxAutonomousRecoveryAmount,
      actualValue: amount
    });
    requiresManualApproval = true;
  } else {
    gates.push({
      gateType: 'MAX_AUTONOMOUS_AMOUNT',
      passed: true,
      reason: `Amount (₹${amount}) is within autonomous execution limit.`,
      thresholdValue: policy.maxAutonomousRecoveryAmount,
      actualValue: amount
    });
  }

  if (amount >= policy.manualApprovalThreshold) {
    gates.push({
      gateType: 'MANUAL_APPROVAL_REQUIRED',
      passed: false,
      reason: `Amount (₹${amount}) meets manual approval threshold (₹${policy.manualApprovalThreshold}). Human sign-off required.`,
      thresholdValue: policy.manualApprovalThreshold,
      actualValue: amount
    });
    requiresManualApproval = true;
  } else {
    gates.push({
      gateType: 'MANUAL_APPROVAL_REQUIRED',
      passed: true,
      reason: `Amount is below manual approval trigger threshold.`,
      thresholdValue: policy.manualApprovalThreshold,
      actualValue: amount
    });
  }

  const allPassed = gates.every(g => g.passed);

  return {
    allPassed,
    gates,
    requiresManualApproval,
    isBlocked,
    blockReason,
    forceStopRecovery,
    fatigueGuardReason,
    evaluatedAt: new Date().toISOString()
  };
}

module.exports = {
  evaluateSafetyGates,
  DEFAULT_POLICY
};
