/**
 * REVIVE™ Automated Unit & Integration Test Suite
 * Built using Node.js native test runner (node:test & node:assert).
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const config = require('../src/config/env');
const db = require('../src/repositories/database');
const { detectRevenueRisk } = require('../src/engines/detection.engine');
const { createRevenueRescueTwin } = require('../src/engines/twin.engine');
const { evaluateStrategyCandidate } = require('../src/engines/scoring.engine');
const { evaluateSafetyGates } = require('../src/engines/safety.engine');
const actionController = require('../src/controllers/action.controller');

describe('REVIVE™ Engine Tests', () => {

  test('1. DEMO_MODE environment configuration logic', () => {
    assert.equal(typeof config.DEMO_MODE, 'boolean');
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

  test('7. Financial Accuracy: Payment execution moves to AWAITING_PAYMENT_CONFIRMATION with ₹0 recovered until confirmed', async () => {
    const event = await db.createEvent({ amount: 20000, eventType: 'PAYMENT_FAILED' });
    const caseObj = await db.createCase({
      revenueEventId: event.id,
      selectedStrategy: 'PAYMENT_LINK',
      status: 'SIMULATED'
    });

    await db.saveSimulations(caseObj.id, [{
      strategyType: 'PAYMENT_LINK',
      predictedRecoveryProbability: 0.85,
      expectedNetRecoveryScore: 16000,
      interventionCost: 50,
      isEligible: true
    }]);

    const req = { params: { id: caseObj.id }, headers: {}, body: { isApprovedByMerchant: true } };
    let jsonResult = null;
    const res = {
      json: (data) => { jsonResult = data; },
      status: () => res
    };

    await actionController.executeAction(req, res);

    assert.ok(jsonResult.success);
    assert.equal(jsonResult.awaitingConfirmation, true);
    assert.equal(jsonResult.data.case.status, 'AWAITING_PAYMENT_CONFIRMATION');
    assert.equal(jsonResult.data.case.recoveredAmount, 0);

    // Now test confirmPayment
    const reqConfirm = { params: { id: caseObj.id }, body: { paymentReference: 'REF-TEST-123', status: 'CONFIRMED' } };
    let confirmResult = null;
    const resConfirm = {
      json: (data) => { confirmResult = data; },
      status: () => resConfirm
    };

    await actionController.confirmPayment(reqConfirm, resConfirm);

    assert.ok(confirmResult.success);
    assert.equal(confirmResult.data.status, 'RECOVERED');
    assert.equal(confirmResult.data.recoveredAmount, 20000);
    assert.equal(confirmResult.data.netRevenueSaved, 19950); // 20000 - 50
  });

  test('8. STOP_INTERVENTION strategy safely terminates case without payment attempt', async () => {
    const event = await db.createEvent({ amount: 10000, eventType: 'PAYMENT_FAILED' });
    const caseObj = await db.createCase({
      revenueEventId: event.id,
      selectedStrategy: 'STOP_INTERVENTION',
      status: 'SIMULATED'
    });

    await db.saveSimulations(caseObj.id, [{
      strategyType: 'STOP_INTERVENTION',
      predictedRecoveryProbability: 0,
      expectedNetRecoveryScore: 0,
      interventionCost: 0,
      isEligible: true
    }]);

    const req = { params: { id: caseObj.id }, headers: {}, body: {} };
    let result = null;
    const res = {
      json: (data) => { result = data; },
      status: () => res
    };

    await actionController.executeAction(req, res);

    assert.ok(result.success);
    assert.equal(result.data.status, 'STOPPED');
  });

});
