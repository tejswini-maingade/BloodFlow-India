require('dotenv').config();

// Reads a number from an environment variable, with a safe fallback.
const num = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Single place where environment variables are read.
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // MVP/demo risk thresholds (units). Change here or via env, never in code elsewhere.
  risk: {
    lowMin: num(process.env.RISK_LOW_MIN, 20),      // >= 20  -> LOW
    mediumMin: num(process.env.RISK_MEDIUM_MIN, 10), // 10-19  -> MEDIUM
    highMin: num(process.env.RISK_HIGH_MIN, 5),      // 5-9    -> HIGH
                                                     // < 5    -> CRITICAL
  },
  maxUnits: num(process.env.MAX_UNITS, 500),
};

module.exports = config;
