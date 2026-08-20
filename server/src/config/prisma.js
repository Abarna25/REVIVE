const { PrismaClient } = require('@prisma/client');
const config = require('./env');

let prisma;

if (config.DATABASE_URL) {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.DATABASE_URL,
        },
      },
      log: config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  } catch (error) {
    console.warn('[Prisma] Initialization failed, will use fallback memory engine:', error.message);
    prisma = null;
  }
} else {
  console.info('[Prisma] DATABASE_URL not set. Running with REVIVE™ Dual Memory Database Adapter.');
  prisma = null;
}

module.exports = prisma;
