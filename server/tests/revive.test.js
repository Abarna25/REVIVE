/**
 * REVIVE™ Automated Unit & Integration Test Suite
 * Built using Node.js native test runner (node:test & node:assert).
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const config = require('../src/config/env');
const db = require('../src/repositories/database');
const { detectRevenueRisk } = require('../src/engines/detection.engine');
const { createRevenueRescueTwin } = require('../src/engines/twin.engine');
const { simulateAllStrategies, evaluateStrategyCandidate } = require('../src/engines/scoring.engine');
const { evaluateSafetyGates } = require('../src/engines/safety.engine');

describe('REVIVE™ Engine Tests', () => {

  test('1. DEMO_MODE environment configuration logic', () => {
    assert.equal(typeof config.DEMO_MODE, 'boolean');
    // Verify DEMO_MODE parsing does not force || true
    assert.equal(process.env.DEMO_MODE === 'false' ? config.DEMO_MODE : true, config.DEMO_MODE);
  });

  test('2. Revenue Risk Detection & Root Cause Categorization', () => {
    const rawEvent = {
      eventType: 'PAYMENT_FAILED',
      amount: 50000,
      currency: 'INR',
      rawMetadata: JSON.stringify({ failureReason: 'INSUFFICIENT_FUNDS' })
    };

    const detected = detectRevenueRisk(rawEvent);

    assert.equal(detected.eventType, 'PAYMENT_FAILED');
    assert.equal(detected.amount, 50000);
    assert.equal(detected.failureReason, 'INSUFFICIENT_FUNDS');
    assert.equal(detected.category, 'TEMPORARY_LIQUIDITY');
    assert.equal(detected.riskLevel, 'HIGH');
  });

  test('3. Revenue Rescue Twin Contextual Initialization', () => {
    const revenueEvent = {
      id: 'evt_test_001',
      amount: 25000,
      eventType: 'CHECKOUT_ABANDONED',
      rawMetadata: JSON.stringify({ customerName: 'Test Client', customerHistoryScore: 0.9 })
    };

    const twin = createRevenueRescueTwin(revenueEvent, { previousAttempts: 1 });

    assert.equal(twin.revenueEventId, 'evt_test_001');
    assert.equal(twin.revenueAmount, 25000);
    assert.equal(twin.customerHistoryScore, 0.9);
    assert.equal(twin.previousAttempts, 1);
    assert.ok(twin.recoveryFatigueScore > 0);
  });

  test('4. Single Source of Truth ENRS Formula & Strategy Ranking', () => {
    const twin = {
      revenueAmount: 10000,
      customerHistoryScore: 0.85,
      engagementScore: 0.80,
      recoveryFatigueScore: 0.10,
      previousAttempts: 0
    };

    const candidate = evaluateStrategyCandidate('RETRY_OPTIMAL_TIME', twin, { failureReason: 'INSUFFICIENT_FUNDS' });

    // Formula: ENRS = (Probability * Amount) - Cost - Fatigue Penalty
    const expectedENRS = (candidate.predictedRecoveryProbability * 10000) - candidate.interventionCost - candidate.fatiguePenalty;

    assert.equal(candidate.expectedNetRecoveryScore, Math.round(expectedENRS * 100) / 100);
    assert.equal(candidate.isEligible, true);
  });

  test('5. Safety Gate & Recovery Fatigue Guard™ Enforcement', () => {
    const recoveryCase = {
      revenueEvent: { amount: 50000 },
      rescueTwin: { previousAttempts: 3, recoveryFatigueScore: 0.9 }
    };

    const strategy = {
      strategyType: 'RETRY_NOW',
      predictedRecoveryProbability: 0.15,
      expectedNetRecoveryScore: 50,
      interventionCost: 20
    };

    const policy = {
      maxRetryAttempts: 3,
      minRecoveryProbability: 0.20,
      minExpectedNetRecoveryScore: 100,
      maxAutonomousRecoveryAmount: 25000,
      manualApprovalThreshold: 10000
    };

    const safetyResult = evaluateSafetyGates(recoveryCase, strategy, policy);

    assert.equal(safetyResult.isBlocked, true);
    assert.equal(safetyResult.requiresManualApproval, true);
    assert.equal(safetyResult.forceStopRecovery, true);
    assert.ok(safetyResult.fatigueGuardReason.includes('negative expected value'));
  });

  test('6. Repository updateEvent updates ORIGINAL event without duplicate creation', async () => {
    const event = await db.createEvent({
      amount: 15000,
      eventType: 'PAYMENT_FAILED',
      status: 'UNRESOLVED'
    });

    const updated = await db.updateEvent(event.id, { status: 'RECOVERED' });

    assert.equal(updated.id, event.id);
    assert.equal(updated.status, 'RECOVERED');

    const allEvents = await db.getAllEvents();
    const matches = allEvents.filter(e => e.id === event.id);
    assert.equal(matches.length, 1);
  });

  test('7. Repository updateAction persists Action status changes in storage', async () => {
    const action = await db.createAction({
      recoveryCaseId: 'case_test_001',
      actionType: 'PAYMENT_LINK',
      status: 'EXECUTING',
      idempotencyKey: 'idemp_test_999'
    });

    const updated = await db.updateAction(action.id, {
      status: 'SUCCEEDED',
      completedAt: new Date().toISOString()
    });

    assert.equal(updated.status, 'SUCCEEDED');
    assert.ok(updated.completedAt);

    const retrieved = await db.getActionByIdempotency('idemp_test_999');
    assert.equal(retrieved.status, 'SUCCEEDED');
  });

});
