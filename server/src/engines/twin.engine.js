/**
 * REVIVE™ Revenue Rescue Twin Engine
 * Creates and updates the digital Revenue Rescue Twin for a specific recovery event.
 */

function createRevenueRescueTwin(revenueEvent, existingHistory = {}) {
  const { id: revenueEventId, amount, eventType, rawMetadata } = revenueEvent;
  
  let metadata = {};
  try {
    metadata = typeof rawMetadata === 'string' ? JSON.parse(rawMetadata) : (rawMetadata || {});
  } catch (e) {
    metadata = {};
  }

  // Calculate default customer metrics based on metadata or synthetic profile
  const customerHistoryScore = existingHistory.customerHistoryScore ?? (metadata.customerHistoryScore || 0.85);
  const engagementScore = existingHistory.engagementScore ?? (metadata.engagementScore || 0.75);
  const previousAttempts = existingHistory.previousAttempts ?? (metadata.previousAttempts || 0);
  
  // Calculate fatigue score (increases with attempts and contact frequency)
  const fatigueFactor = Math.min(1.0, (previousAttempts * 0.3) + (metadata.remindersSent ? metadata.remindersSent * 0.2 : 0));
  const recoveryFatigueScore = existingHistory.recoveryFatigueScore ?? fatigueFactor;

  const preferredRecoveryWindow = metadata.preferredTimeWindow || '19:00 - 21:00';

  const contextSnapshot = {
    customerName: metadata.customerName || 'Enterprise Client / Customer',
    customerEmail: metadata.customerEmail || 'customer@example.com',
    customerPhone: metadata.customerPhone || '+919876543210',
    deviceType: metadata.deviceType || 'Mobile iOS',
    paymentMethod: metadata.paymentMethod || 'UPI / Credit Card',
    lastSuccessfulPayment: metadata.lastSuccessfulPayment || '2026-07-15T14:30:00Z',
    lifetimeValue: metadata.lifetimeValue || (amount * 12),
    cohortRecoveryRate: 0.78,
    failureCode: metadata.failureReason || 'INSUFFICIENT_FUNDS'
  };

  return {
    revenueEventId,
    revenueAmount: amount,
    eventType,
    customerHistoryScore,
    engagementScore,
    recoveryFatigueScore,
    previousAttempts,
    preferredRecoveryWindow,
    contextSnapshot: JSON.stringify(contextSnapshot)
  };
}

module.exports = {
  createRevenueRescueTwin
};
