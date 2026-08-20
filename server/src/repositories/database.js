/**
 * REVIVE™ Database Repository Layer
 * Manages Prisma queries with automatic fallback to in-memory store when DB is disconnected.
 */

const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// In-Memory Data Store (used for zero-config fallback and instant demo mode)
const memoryStore = {
  merchants: [
    {
      id: 'merchant-default-001',
      name: 'REVIVE Demo Merchant',
      email: 'admin@revive.io',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  policies: [
    {
      id: 'policy-default-001',
      merchantId: 'merchant-default-001',
      maxRetryAttempts: 3,
      maxReminders: 2,
      cooldownMinutes: 120,
      minRecoveryProbability: 0.20,
      minExpectedNetRecoveryScore: 100,
      maxAutonomousRecoveryAmount: 25000,
      maxInterventionCost: 500,
      manualApprovalThreshold: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  revenueEvents: [],
  recoveryCases: [],
  rescueTwins: [],
  strategySimulations: [],
  recoveryActions: [],
  safetyGates: [],
  auditLogs: []
};

// Check if Prisma database connection is available
let isPrismaAvailable = false;

async function checkDatabaseConnection() {
  if (!prisma) {
    isPrismaAvailable = false;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPrismaAvailable = true;
    return true;
  } catch (err) {
    console.warn('[DB Repository] Prisma PostgreSQL not connected. Using REVIVE™ In-Memory Store fallback.');
    isPrismaAvailable = false;
    return false;
  }
}

// Initialize check
checkDatabaseConnection();

// --- Merchant & Policy ---
async function getMerchantPolicy(merchantId = 'merchant-default-001') {
  if (isPrismaAvailable && prisma) {
    try {
      const policy = await prisma.recoveryPolicy.findFirst({ where: { merchantId } });
      if (policy) return policy;
    } catch (e) {
      console.warn('[DB Repository] Prisma policy lookup fallback');
    }
  }
  return memoryStore.policies[0];
}

async function updateMerchantPolicy(merchantId = 'merchant-default-001', updates) {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryPolicy.updateMany({
        where: { merchantId },
        data: updates
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma policy update fallback');
    }
  }
  const policy = memoryStore.policies[0];
  Object.assign(policy, updates, { updatedAt: new Date().toISOString() });
  return policy;
}

// --- Revenue Events ---
async function getAllEvents() {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.revenueEvent.findMany({
        orderBy: { occurredAt: 'desc' }
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma events fallback');
    }
  }
  return [...memoryStore.revenueEvents].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
}

async function getEventById(id) {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.revenueEvent.findUnique({ where: { id } });
    } catch (e) {
      console.warn('[DB Repository] Prisma event lookup fallback');
    }
  }
  return memoryStore.revenueEvents.find(e => e.id === id);
}

async function createEvent(data) {
  const event = {
    id: data.id || `evt_${uuidv4().substring(0, 8)}`,
    merchantId: data.merchantId || 'merchant-default-001',
    externalReferenceId: data.externalReferenceId || `ref_${uuidv4().substring(0, 8)}`,
    eventType: data.eventType || 'PAYMENT_FAILED',
    amount: parseFloat(data.amount) || 5000,
    currency: data.currency || 'INR',
    status: data.status || 'UNRESOLVED',
    occurredAt: data.occurredAt || new Date().toISOString(),
    rawMetadata: typeof data.rawMetadata === 'object' ? JSON.stringify(data.rawMetadata) : data.rawMetadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.revenueEvent.create({ data: event });
    } catch (e) {
      console.warn('[DB Repository] Prisma create event fallback');
    }
  }
  memoryStore.revenueEvents.push(event);
  return event;
}

async function updateEvent(id, data) {
  const updates = { ...data, updatedAt: new Date().toISOString() };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.revenueEvent.update({ where: { id }, data: updates });
    } catch (e) {
      console.warn('[DB Repository] Prisma updateEvent fallback');
    }
  }

  const event = memoryStore.revenueEvents.find(e => e.id === id);
  if (event) {
    Object.assign(event, updates);
  }
  return event;
}

// --- Recovery Cases & Twins ---
async function getAllCases() {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryCase.findMany({
        include: {
          revenueEvent: true,
          rescueTwin: true,
          strategySimulations: true,
          recoveryActions: true,
          safetyGates: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma cases fallback');
    }
  }

  return memoryStore.recoveryCases.map(rc => {
    const revenueEvent = memoryStore.revenueEvents.find(e => e.id === rc.revenueEventId);
    const rescueTwin = memoryStore.rescueTwins.find(t => t.recoveryCaseId === rc.id);
    const strategySimulations = memoryStore.strategySimulations.filter(s => s.recoveryCaseId === rc.id);
    const recoveryActions = memoryStore.recoveryActions.filter(a => a.recoveryCaseId === rc.id);
    const safetyGates = memoryStore.safetyGates.filter(g => g.recoveryCaseId === rc.id);

    return {
      ...rc,
      revenueEvent,
      rescueTwin,
      strategySimulations,
      recoveryActions,
      safetyGates
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getCaseById(id) {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryCase.findUnique({
        where: { id },
        include: {
          revenueEvent: true,
          rescueTwin: true,
          strategySimulations: true,
          recoveryActions: true,
          safetyGates: true,
          auditLogs: { orderBy: { createdAt: 'desc' } }
        }
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma getCaseById fallback');
    }
  }

  const rc = memoryStore.recoveryCases.find(c => c.id === id);
  if (!rc) return null;

  const revenueEvent = memoryStore.revenueEvents.find(e => e.id === rc.revenueEventId);
  const rescueTwin = memoryStore.rescueTwins.find(t => t.recoveryCaseId === rc.id);
  const strategySimulations = memoryStore.strategySimulations.filter(s => s.recoveryCaseId === rc.id);
  const recoveryActions = memoryStore.recoveryActions.filter(a => a.recoveryCaseId === rc.id);
  const safetyGates = memoryStore.safetyGates.filter(g => g.recoveryCaseId === rc.id);
  const auditLogs = memoryStore.auditLogs
    .filter(a => a.recoveryCaseId === rc.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    ...rc,
    revenueEvent,
    rescueTwin,
    strategySimulations,
    recoveryActions,
    safetyGates,
    auditLogs
  };
}

async function createCase(data) {
  const caseObj = {
    id: data.id || `case_${uuidv4().substring(0, 8)}`,
    revenueEventId: data.revenueEventId,
    merchantId: data.merchantId || 'merchant-default-001',
    status: data.status || 'DETECTED',
    rootCause: data.rootCause || null,
    predictedRecoveryProbability: data.predictedRecoveryProbability || null,
    selectedStrategy: data.selectedStrategy || null,
    expectedNetRecoveryScore: data.expectedNetRecoveryScore || null,
    recoveredAmount: data.recoveredAmount || 0,
    interventionCost: data.interventionCost || 0,
    netRevenueSaved: data.netRevenueSaved || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null
  };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryCase.create({ data: caseObj });
    } catch (e) {
      console.warn('[DB Repository] Prisma createCase fallback');
    }
  }
  memoryStore.recoveryCases.push(caseObj);
  return caseObj;
}

async function updateCase(id, data) {
  const updates = { ...data, updatedAt: new Date().toISOString() };
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryCase.update({ where: { id }, data: updates });
    } catch (e) {
      console.warn('[DB Repository] Prisma updateCase fallback');
    }
  }
  const caseObj = memoryStore.recoveryCases.find(c => c.id === id);
  if (caseObj) {
    Object.assign(caseObj, updates);
  }
  return caseObj;
}

// --- Rescue Twin ---
async function saveRescueTwin(twinData) {
  const twin = {
    id: twinData.id || `twin_${uuidv4().substring(0, 8)}`,
    recoveryCaseId: twinData.recoveryCaseId,
    revenueAmount: twinData.revenueAmount,
    customerHistoryScore: twinData.customerHistoryScore || 0.85,
    engagementScore: twinData.engagementScore || 0.75,
    recoveryFatigueScore: twinData.recoveryFatigueScore || 0.1,
    previousAttempts: twinData.previousAttempts || 0,
    preferredRecoveryWindow: twinData.preferredRecoveryWindow || '19:00 - 21:00',
    contextSnapshot: typeof twinData.contextSnapshot === 'object' ? JSON.stringify(twinData.contextSnapshot) : twinData.contextSnapshot,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.revenueRescueTwin.upsert({
        where: { recoveryCaseId: twin.recoveryCaseId },
        update: twin,
        create: twin
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma saveRescueTwin fallback');
    }
  }

  const existingIdx = memoryStore.rescueTwins.findIndex(t => t.recoveryCaseId === twin.recoveryCaseId);
  if (existingIdx >= 0) {
    memoryStore.rescueTwins[existingIdx] = twin;
  } else {
    memoryStore.rescueTwins.push(twin);
  }
  return twin;
}

// --- Strategy Simulations ---
async function saveSimulations(recoveryCaseId, simulations) {
  const records = simulations.map(s => ({
    id: s.id || `sim_${uuidv4().substring(0, 8)}`,
    recoveryCaseId,
    strategyType: s.strategyType,
    predictedRecoveryProbability: s.predictedRecoveryProbability,
    estimatedRecoveryAmount: s.estimatedRecoveryAmount,
    interventionCost: s.interventionCost,
    fatiguePenalty: s.fatiguePenalty,
    complianceRisk: s.complianceRisk || 0.0,
    expectedNetRecoveryScore: s.expectedNetRecoveryScore,
    isEligible: s.isEligible !== false,
    ineligibilityReason: s.ineligibilityReason || null,
    rank: s.rank || null,
    createdAt: new Date().toISOString()
  }));

  if (isPrismaAvailable && prisma) {
    try {
      await prisma.strategySimulation.deleteMany({ where: { recoveryCaseId } });
      await prisma.strategySimulation.createMany({ data: records });
      return records;
    } catch (e) {
      console.warn('[DB Repository] Prisma saveSimulations fallback');
    }
  }

  // Memory store update
  memoryStore.strategySimulations = memoryStore.strategySimulations.filter(s => s.recoveryCaseId !== recoveryCaseId);
  memoryStore.strategySimulations.push(...records);
  return records;
}

// --- Recovery Actions ---
async function createAction(actionData) {
  const action = {
    id: actionData.id || `act_${uuidv4().substring(0, 8)}`,
    recoveryCaseId: actionData.recoveryCaseId,
    strategySimulationId: actionData.strategySimulationId || null,
    actionType: actionData.actionType,
    status: actionData.status || 'PENDING',
    executedAt: actionData.executedAt || new Date().toISOString(),
    completedAt: actionData.completedAt || null,
    cost: actionData.cost || 0,
    resultMetadata: typeof actionData.resultMetadata === 'object' ? JSON.stringify(actionData.resultMetadata) : actionData.resultMetadata,
    failureReason: actionData.failureReason || null,
    idempotencyKey: actionData.idempotencyKey || `idemp_${uuidv4()}`,
    createdAt: new Date().toISOString()
  };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryAction.create({ data: action });
    } catch (e) {
      console.warn('[DB Repository] Prisma createAction fallback');
    }
  }

  memoryStore.recoveryActions.push(action);
  return action;
}

async function updateAction(id, data) {
  const updates = { ...data };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryAction.update({ where: { id }, data: updates });
    } catch (e) {
      console.warn('[DB Repository] Prisma updateAction fallback');
    }
  }

  const action = memoryStore.recoveryActions.find(a => a.id === id);
  if (action) {
    Object.assign(action, updates);
  }
  return action;
}

async function getActionByIdempotency(idempotencyKey) {
  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.recoveryAction.findUnique({ where: { idempotencyKey } });
    } catch (e) {
      console.warn('[DB Repository] Prisma idempotency lookup fallback');
    }
  }
  return memoryStore.recoveryActions.find(a => a.idempotencyKey === idempotencyKey);
}

// --- Safety Gates ---
async function saveSafetyGates(recoveryCaseId, gates) {
  const records = gates.map(g => ({
    id: g.id || `gate_${uuidv4().substring(0, 8)}`,
    recoveryCaseId,
    gateType: g.gateType,
    passed: g.passed,
    reason: g.reason,
    thresholdValue: g.thresholdValue !== undefined ? parseFloat(g.thresholdValue) : null,
    actualValue: g.actualValue !== undefined ? parseFloat(g.actualValue) : null,
    createdAt: new Date().toISOString()
  }));

  if (isPrismaAvailable && prisma) {
    try {
      await prisma.safetyGate.deleteMany({ where: { recoveryCaseId } });
      await prisma.safetyGate.createMany({ data: records });
      return records;
    } catch (e) {
      console.warn('[DB Repository] Prisma saveSafetyGates fallback');
    }
  }

  memoryStore.safetyGates = memoryStore.safetyGates.filter(g => g.recoveryCaseId !== recoveryCaseId);
  memoryStore.safetyGates.push(...records);
  return records;
}

// --- Audit Logs ---
async function addAuditLog(data) {
  const log = {
    id: data.id || `audit_${uuidv4().substring(0, 8)}`,
    merchantId: data.merchantId || 'merchant-default-001',
    recoveryCaseId: data.recoveryCaseId || null,
    eventType: data.eventType || 'SYSTEM_EVENT',
    actorType: data.actorType || 'SYSTEM',
    description: data.description,
    metadata: typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : data.metadata,
    createdAt: new Date().toISOString()
  };

  if (isPrismaAvailable && prisma) {
    try {
      return await prisma.auditLog.create({ data: log });
    } catch (e) {
      console.warn('[DB Repository] Prisma addAuditLog fallback');
    }
  }

  memoryStore.auditLogs.push(log);
  return log;
}

async function getAuditLogs(recoveryCaseId = null) {
  if (isPrismaAvailable && prisma) {
    try {
      const where = recoveryCaseId ? { recoveryCaseId } : {};
      return await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('[DB Repository] Prisma getAuditLogs fallback');
    }
  }

  if (recoveryCaseId) {
    return memoryStore.auditLogs
      .filter(l => l.recoveryCaseId === recoveryCaseId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return [...memoryStore.auditLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  memoryStore,
  checkDatabaseConnection,
  getMerchantPolicy,
  updateMerchantPolicy,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  saveRescueTwin,
  saveSimulations,
  createAction,
  updateAction,
  getActionByIdempotency,
  saveSafetyGates,
  addAuditLog,
  getAuditLogs
};
