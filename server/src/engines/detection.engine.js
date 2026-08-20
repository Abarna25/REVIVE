/**
 * REVIVE™ Detection Engine
 * Categorizes and parses incoming revenue-at-risk events.
 */

const REASON_MAPPING = {
  INSUFFICIENT_FUNDS: {
    category: 'TEMPORARY_LIQUIDITY',
    description: 'Customer bank account has insufficient balance at execution time.',
    transient: true,
    suggestedWindow: 'Evening (19:00 - 21:00)'
  },
  NETWORK_TIMEOUT: {
    category: 'TECHNICAL_TRANSIENT',
    description: 'Inter-bank gateway timeout or network drop during handshake.',
    transient: true,
    suggestedWindow: 'Immediate or 30-min retry'
  },
  BANK_SYSTEM_DOWN: {
    category: 'TECHNICAL_TRANSIENT',
    description: 'Core banking issuer switch is temporarily offline for maintenance.',
    transient: true,
    suggestedWindow: '4-6 hours post-failure'
  },
  CARD_EXPIRED: {
    category: 'PERMANENT_CREDENTIAL',
    description: 'Payment method card expiry date has passed.',
    transient: false,
    suggestedWindow: 'Requires new payment method link'
  },
  ISSUER_DECLINE: {
    category: 'POLICY_DECLINE',
    description: 'Card issuing bank blocked transaction due to risk velocity rules.',
    transient: false,
    suggestedWindow: 'Alternate payment method required'
  },
  CHECKOUT_DROPOFF: {
    category: 'ABANDONMENT',
    description: 'User initiated checkout process but exited prior to payment authorization.',
    transient: true,
    suggestedWindow: 'Within 2 hours via personalized link'
  },
  INVOICE_OVERDUE: {
    category: 'RECEIVABLE_OVERDUE',
    description: 'Invoice past net payment terms without recorded settlement.',
    transient: true,
    suggestedWindow: 'Escalated invoice payment link'
  }
};

function detectRevenueRisk(rawEvent) {
  const { eventType, amount, rawMetadata } = rawEvent;
  let metadata = {};
  
  try {
    metadata = typeof rawMetadata === 'string' ? JSON.parse(rawMetadata) : (rawMetadata || {});
  } catch (e) {
    metadata = {};
  }

  const rawReason = metadata.failureReason || metadata.abandonmentReason || 'NETWORK_TIMEOUT';
  const reasonDetails = REASON_MAPPING[rawReason] || {
    category: 'UNKNOWN_FAILURE',
    description: 'Unclassified payment failure event.',
    transient: true,
    suggestedWindow: 'Optimal predicted time'
  };

  const riskLevel = amount > 25000 ? 'HIGH' : amount > 5000 ? 'MEDIUM' : 'LOW';

  return {
    eventType,
    amount,
    currency: rawEvent.currency || 'INR',
    failureReason: rawReason,
    category: reasonDetails.category,
    description: reasonDetails.description,
    isTransient: reasonDetails.transient,
    suggestedWindow: reasonDetails.suggestedWindow,
    riskLevel,
    detectedAt: new Date().toISOString()
  };
}

module.exports = {
  detectRevenueRisk,
  REASON_MAPPING
};
