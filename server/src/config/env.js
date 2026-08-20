const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  PAYMENT_MODE: process.env.PAYMENT_MODE || 'simulation',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODE: process.env.AI_MODE || 'enabled',
  DEMO_MODE: process.env.DEMO_MODE === 'true' || true,
};
