/**
 * REVIVE™ Seed Data Generator
 * Populates 100+ realistic synthetic revenue events, Rescue Twins, Strategy Simulations,
 * Recovery Actions, Safety Gates, and Audit Logs for production-grade evaluation.
 */

const { detectRevenueRisk } = require('../src/engines/detection.engine');
const { diagnoseRevenueRisk } = require('../src/engines/diagnosis.engine');
const { createRevenueRescueTwin } = require('../src/engines/twin.engine');
const { simulateAllStrategies } = require('../src/engines/scoring.engine');
const { evaluateSafetyGates } = require('../src/engines/safety.engine');
const db = require('../src/repositories/database');

const CUSTOMER_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Mehta', 'Ananya Gupta', 'Vikram Singh',
  'Neha Reddy', 'Aditya Verma', 'Kavya Nair', 'Rahul Joshi', 'Sneha Kulkarni',
  'Siddharth Rao', 'Meera Kapoor', 'Karan Malhotra', 'Pooja Deshmukh', 'Amitabh Roy',
  'Divya Iyer', 'Manish Agarwal', 'Shruti Saxena', 'Harsh Vardhan', 'Deepika Pillai',
  'Nexus Infotech Ltd', 'Zenith Retail Pvt Ltd', 'Apex Cloud Solutions', 'Starlight Media'
];

const FAILURE_REASONS = [
  'INSUFFICIENT_FUNDS',
  'NETWORK_TIMEOUT',
  'BANK_SYSTEM_DOWN',
  'CARD_EXPIRED',
  'ISSUER_DECLINE',
  'CHECKOUT_DROPOFF',
  'INVOICE_OVERDUE'
];

const EVENT_TYPES = [
  'PAYMENT_FAILED',
  'PAYMENT_FAILED',
  'CHECKOUT_ABANDONED',
  'INVOICE_OVERDUE',
  'SUBSCRIPTION_FAILED'
];

async function seedDatabase() {
  console.log('🌱 Starting REVIVE™ Seed Generation (100+ Synthetic Events)...');

  // Clear existing in-memory data
  db.memoryStore.revenueEvents = [];
  db.memoryStore.recoveryCases = [];
  db.memoryStore.rescueTwins = [];
  db.memoryStore.strategySimulations = [];
  db.memoryStore.recoveryActions = [];
  db.memoryStore.safetyGates = [];
  db.memoryStore.auditLogs = [];

  const merchantId = 'merchant-default-001';

  // 1. Mandatory Demo Case (Failed ₹5,000 Payment Event)
  const demoEvent = await db.createEvent({
    id: 'evt_demo_001',
    merchantId,
    externalReferenceId: 'ORD_DEMO_5000',
    eventType: 'PAYMENT_FAILED',
    amount: 5000,
    currency: 'INR',
    status: 'IN_RECOVERY',
    occurredAt: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
    rawMetadata: JSON.stringify({
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      failureReason: 'INSUFFICIENT_FUNDS',
      previousAttempts: 1,
      customerHistoryScore: 0.88,
      engagementScore: 0.82,
      preferredTimeWindow: '19:00 - 21:00'
    })
  });

  const demoCase = await db.createCase({
    id: 'case_demo_001',
    revenueEventId: demoEvent.id,
    merchantId,
    status: 'ACTION_PENDING',
    rootCause: 'INSUFFICIENT_FUNDS',
    predictedRecoveryProbability: 0.84,
    selectedStrategy: 'RETRY_OPTIMAL_TIME',
    expectedNetRecoveryScore: 4030.00,
    recoveredAmount: 0,
    interventionCost: 20,
    netRevenueSaved: 0
  });

  const demoTwinData = createRevenueRescueTwin(demoEvent, { previousAttempts: 1 });
  const demoTwin = await db.saveRescueTwin({ ...demoTwinData, recoveryCaseId: demoCase.id });

  const demoSimResults = simulateAllStrategies(demoTwin, { failureReason: 'INSUFFICIENT_FUNDS', eventType: 'PAYMENT_FAILED' });
  await db.saveSimulations(demoCase.id, demoSimResults.simulations);

  const demoSafety = evaluateSafetyGates(demoCase, demoSimResults.recommendedStrategy);
  await db.saveSafetyGates(demoCase.id, demoSafety.gates);

  await db.addAuditLog({
    merchantId,
    recoveryCaseId: demoCase.id,
    eventType: 'PAYMENT_FAILURE_DETECTED',
    actorType: 'SYSTEM',
    description: 'Payment failure of ₹5,000 detected for Aarav Sharma (Reason: INSUFFICIENT_FUNDS).'
  });
  await db.addAuditLog({
    merchantId,
    recoveryCaseId: demoCase.id,
    eventType: 'TWIN_INSTANTIATED',
    actorType: 'AI_ENGINE',
    description: 'Revenue Rescue Twin initialized. Simulated 7 candidate strategies.'
  });
  await db.addAuditLog({
    merchantId,
    recoveryCaseId: demoCase.id,
    eventType: 'STRATEGY_SELECTED',
    actorType: 'AI_ENGINE',
    description: 'RETRY_OPTIMAL_TIME selected (ENRS: ₹4,030.00). Highest value safe strategy.'
  });

  // 2. Generate 115 Additional Synthetic Revenue Events
  for (let i = 2; i <= 116; i++) {
    const customerName = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    const eventType = EVENT_TYPES[i % EVENT_TYPES.length];
    const failureReason = FAILURE_REASONS[i % FAILURE_REASONS.length];

    // Amounts range from ₹1,200 to ₹45,000
    const amount = Math.round((1200 + (i * 370) % 43800) / 100) * 100;
    const hoursAgo = (i * 3) % 168; // within last 7 days
    const occurredAt = new Date(Date.now() - hoursAgo * 3600000).toISOString();

    const previousAttempts = (i % 4);
    const customerHistoryScore = 0.5 + ((i * 7) % 45) / 100;
    const engagementScore = 0.4 + ((i * 11) % 55) / 100;

    const event = await db.createEvent({
      id: `evt_syn_${1000 + i}`,
      merchantId,
      externalReferenceId: `REF_${2000 + i}`,
      eventType,
      amount,
      currency: 'INR',
      status: 'UNRESOLVED',
      occurredAt,
      rawMetadata: JSON.stringify({
        customerName,
        customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        failureReason,
        previousAttempts,
        customerHistoryScore,
        engagementScore
      })
    });

    const caseObj = await db.createCase({
      id: `case_syn_${1000 + i}`,
      revenueEventId: event.id,
      merchantId,
      status: 'DETECTED',
      rootCause: failureReason
    });

    const twinData = createRevenueRescueTwin(event, { customerHistoryScore, engagementScore, previousAttempts });
    const twin = await db.saveRescueTwin({ ...twinData, recoveryCaseId: caseObj.id });

    const simResults = simulateAllStrategies(twin, { failureReason, eventType });
    await db.saveSimulations(caseObj.id, simResults.simulations);

    const winningStrategy = simResults.recommendedStrategy;
    const safety = evaluateSafetyGates(caseObj, winningStrategy);
    await db.saveSafetyGates(caseObj.id, safety.gates);

    // Determine final state based on synthetic rules
    let caseStatus = 'RECOVERED';
    let recoveredAmount = 0;
    let cost = winningStrategy.interventionCost;
    let netSaved = 0;

    if (safety.forceStopRecovery || winningStrategy.strategyType === 'STOP_INTERVENTION') {
      caseStatus = 'STOPPED';
      event.status = 'STOPPED';
      await db.addAuditLog({
        merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'RECOVERY_STOPPED',
        actorType: 'SAFETY_ENGINE',
        description: `Recovery Fatigue Guard™ triggered. Intervention stopped (Reason: ${safety.fatigueGuardReason || 'Max attempts reached'}).`
      });
    } else if (safety.requiresManualApproval) {
      caseStatus = 'ESCALATED';
      event.status = 'ESCALATED';
      await db.addAuditLog({
        merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ESCALATED_MANUAL_REVIEW',
        actorType: 'SAFETY_ENGINE',
        description: `High-value revenue event (₹${amount}) flagged for manual review before execution.`
      });
    } else if (i % 9 === 0) {
      // Gracefully handled failure scenario case
      caseStatus = 'FAILED_GRACEFULLY';
      event.status = 'IN_RECOVERY';
      await db.createAction({
        recoveryCaseId: caseObj.id,
        actionType: winningStrategy.strategyType,
        status: 'FAILED',
        cost: winningStrategy.interventionCost,
        failureReason: 'Gateway response timeout (Simulated Error)',
        idempotencyKey: `FAIL_DEMO_${caseObj.id}`
      });
      await db.addAuditLog({
        merchantId,
        recoveryCaseId: caseObj.id,
        eventType: 'ACTION_FAILED_GRACEFULLY',
        actorType: 'PAYMENT_PROVIDER',
        description: `Action Failed Gracefully → Gateway timeout detected → Idempotency lock active (No duplicate charge) → Preserved for review.`
      });
    } else {
      // 78% of remaining cases recover successfully
      const isSuccessful = (i % 5 !== 0);
      if (isSuccessful) {
        caseStatus = 'RECOVERED';
        event.status = 'RECOVERED';
        recoveredAmount = amount;
        netSaved = amount - cost;
        caseObj.closedAt = new Date().toISOString();

        await db.createAction({
          recoveryCaseId: caseObj.id,
          actionType: winningStrategy.strategyType,
          status: 'SUCCEEDED',
          cost,
          idempotencyKey: `idemp_succ_${caseObj.id}`
        });
        await db.addAuditLog({
          merchantId,
          recoveryCaseId: caseObj.id,
          eventType: 'RECOVERY_SUCCEEDED',
          actorType: 'PAYMENT_PROVIDER',
          description: `Recovery action ${winningStrategy.strategyType} succeeded. Recovered ₹${amount}. Net revenue saved: ₹${netSaved}.`
        });
      } else {
        caseStatus = 'IN_RECOVERY';
        event.status = 'IN_RECOVERY';
      }
    }

    await db.updateCase(caseObj.id, {
      status: caseStatus,
      selectedStrategy: winningStrategy.strategyType,
      predictedRecoveryProbability: winningStrategy.predictedRecoveryProbability,
      expectedNetRecoveryScore: winningStrategy.expectedNetRecoveryScore,
      recoveredAmount,
      interventionCost: cost,
      netRevenueSaved: netSaved
    });
  }

  console.log(`✅ Seeded ${db.memoryStore.revenueEvents.length} Revenue Events and Recovery Cases successfully!`);
}

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
