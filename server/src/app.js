/**
 * REVIVE™ Revenue Recovery Engine Backend Entry Point
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const db = require('./repositories/database');
const seedDatabase = require('../prisma/seed');

const eventsRoutes = require('./routes/events.routes');
const casesRoutes = require('./routes/cases.routes');
const twinRoutes = require('./routes/twin.routes');
const strategyRoutes = require('./routes/strategy.routes');
const actionRoutes = require('./routes/action.routes');
const safetyRoutes = require('./routes/safety.routes');
const auditRoutes = require('./routes/audit.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Production CORS configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || config.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS Policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Required for Cloud Deployment)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'REVIVE API',
    timestamp: new Date().toISOString(),
    paymentMode: config.PAYMENT_MODE,
    aiMode: config.AI_MODE,
    demoMode: config.DEMO_MODE,
    environment: config.NODE_ENV
  });
});

// API Routes
app.use('/api/events', eventsRoutes);
app.use('/api/recovery-cases', casesRoutes);
app.use('/api/recovery-cases', twinRoutes);
app.use('/api/recovery-cases', strategyRoutes);
app.use('/api/recovery-cases', actionRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/recovery-policy', safetyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', analyticsRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[REVIVE API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.'
    }
  });
});

const PORT = config.PORT;

// Smart Seeding Startup Handler
async function initializeServer() {
  const existingEvents = await db.getAllEvents();
  if (config.DEMO_MODE && existingEvents.length === 0) {
    console.log('[REVIVE Init] DEMO_MODE=true & Storage empty. Seeding 100+ synthetic demo events...');
    await seedDatabase();
  } else if (!config.DEMO_MODE) {
    console.log('[REVIVE Init] DEMO_MODE=false. Production environment active. Demo seeding disabled.');
  } else {
    console.log(`[REVIVE Init] Found ${existingEvents.length} existing records in storage. Duplicate seeding skipped.`);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 REVIVE™ Autonomous Revenue Recovery Engine Active!`);
    console.log(`📡 Listening on Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`💳 Payment Execution Mode: ${config.PAYMENT_MODE}`);
    console.log(`🧠 AI Engine Mode: ${config.AI_MODE}`);
    console.log(`🧪 Demo Seeding Mode: ${config.DEMO_MODE}`);
    console.log(`=======================================================`);
  });
}

initializeServer().catch(err => {
  console.error('[REVIVE Init Error]:', err);
});

module.exports = app;
