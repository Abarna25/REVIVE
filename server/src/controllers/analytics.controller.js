const db = require('../repositories/database');
const seedDatabase = require('../../prisma/seed');

async function getDashboardMetrics(req, res) {
  try {
    const cases = await db.getAllCases();

    if (cases.length === 0) {
      await seedDatabase();
    }

    const allCases = await db.getAllCases();
    let totalEventsAnalysed = allCases.length;
    let totalRevenueAtRisk = 0;
    let revenueRecovered = 0;
    let totalInterventionCost = 0;
    let casesStoppedByFatigueGuard = 0;
    let casesEscalated = 0;
    let failedActionsHandledGracefully = 0;

    const strategyStats = {};

    allCases.forEach(c => {
      const amount = c.revenueEvent ? c.revenueEvent.amount : (c.rescueTwin ? c.rescueTwin.revenueAmount : 0);
      totalRevenueAtRisk += amount;

      if (c.status === 'RECOVERED') {
        revenueRecovered += (c.recoveredAmount || amount);
      }

      totalInterventionCost += (c.interventionCost || 0);

      if (c.status === 'STOPPED') casesStoppedByFatigueGuard++;
      if (c.status === 'ESCALATED') casesEscalated++;
      if (c.status === 'FAILED_GRACEFULLY') failedActionsHandledGracefully++;

      const strategy = c.selectedStrategy || 'RETRY_OPTIMAL_TIME';
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { count: 0, recovered: 0, totalAmount: 0 };
      }
      strategyStats[strategy].count++;
      strategyStats[strategy].totalAmount += amount;
      if (c.status === 'RECOVERED') {
        strategyStats[strategy].recovered += (c.recoveredAmount || amount);
      }
    });

    const netRevenueSaved = Math.max(0, revenueRecovered - totalInterventionCost);
    const recoveryRate = totalRevenueAtRisk > 0 ? (revenueRecovered / totalRevenueAtRisk) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalEventsAnalysed,
          totalRevenueAtRisk: Math.round(totalRevenueAtRisk),
          revenueRecovered: Math.round(revenueRecovered),
          recoveryRate: Math.round(recoveryRate * 10) / 10,
          totalInterventionCost: Math.round(totalInterventionCost),
          netRevenueSaved: Math.round(netRevenueSaved),
          averageRecoveryHours: 4.2,
          casesStoppedByFatigueGuard,
          casesEscalated,
          failedActionsHandledGracefully
        },
        strategyStats,
        recentCases: allCases.slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: err.message } });
  }
}

async function getBatchPerformance(req, res) {
  try {
    const cases = await db.getAllCases();
    let totalRevenueAtRisk = 0;
    let revenueRecovered = 0;
    let totalInterventionCost = 0;
    let totalRecoveredCases = 0;
    let totalStoppedCases = 0;
    let totalEscalatedCases = 0;
    let totalGracefulFailures = 0;

    const eventTypePerformance = {};
    const strategyPerformance = {};

    cases.forEach(c => {
      const amount = c.revenueEvent ? c.revenueEvent.amount : 0;
      const eventType = c.revenueEvent ? c.revenueEvent.eventType : 'PAYMENT_FAILED';
      const strategy = c.selectedStrategy || 'RETRY_OPTIMAL_TIME';

      totalRevenueAtRisk += amount;

      if (c.status === 'RECOVERED') {
        revenueRecovered += (c.recoveredAmount || amount);
        totalRecoveredCases++;
      } else if (c.status === 'STOPPED') {
        totalStoppedCases++;
      } else if (c.status === 'ESCALATED') {
        totalEscalatedCases++;
      } else if (c.status === 'FAILED_GRACEFULLY') {
        totalGracefulFailures++;
      }

      totalInterventionCost += (c.interventionCost || 0);

      // Event Type Grouping
      if (!eventTypePerformance[eventType]) {
        eventTypePerformance[eventType] = { count: 0, atRisk: 0, recovered: 0 };
      }
      eventTypePerformance[eventType].count++;
      eventTypePerformance[eventType].atRisk += amount;
      if (c.status === 'RECOVERED') {
        eventTypePerformance[eventType].recovered += (c.recoveredAmount || amount);
      }

      // Strategy Grouping
      if (!strategyPerformance[strategy]) {
        strategyPerformance[strategy] = { count: 0, atRisk: 0, recovered: 0, cost: 0 };
      }
      strategyPerformance[strategy].count++;
      strategyPerformance[strategy].atRisk += amount;
      strategyPerformance[strategy].cost += (c.interventionCost || 0);
      if (c.status === 'RECOVERED') {
        strategyPerformance[strategy].recovered += (c.recoveredAmount || amount);
      }
    });

    const netRevenueSaved = revenueRecovered - totalInterventionCost;
    const overallRecoveryRate = totalRevenueAtRisk > 0 ? (revenueRecovered / totalRevenueAtRisk) * 100 : 0;

    res.json({
      success: true,
      data: {
        batchMetrics: {
          totalEvents: cases.length,
          totalRevenueAtRisk: Math.round(totalRevenueAtRisk),
          revenueRecovered: Math.round(revenueRecovered),
          netRevenueSaved: Math.round(netRevenueSaved),
          totalInterventionCost: Math.round(totalInterventionCost),
          overallRecoveryRate: Math.round(overallRecoveryRate * 10) / 10,
          totalRecoveredCases,
          totalStoppedCases,
          totalEscalatedCases,
          totalGracefulFailures
        },
        eventTypePerformance,
        strategyPerformance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'BATCH_ANALYTICS_ERROR', message: err.message } });
  }
}

async function resetSeedData(req, res) {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Database re-seeded with 100+ synthetic revenue events.',
      count: db.memoryStore.revenueEvents.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SEED_ERROR', message: err.message } });
  }
}

module.exports = {
  getDashboardMetrics,
  getBatchPerformance,
  resetSeedData
};
