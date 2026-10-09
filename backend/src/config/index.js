require('dotenv').config();

const num = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // MVP/demo risk thresholds (units).
  risk: {
    lowMin: num(process.env.RISK_LOW_MIN, 20),       // >= 20 -> LOW
    mediumMin: num(process.env.RISK_MEDIUM_MIN, 10), // 10-19 -> MEDIUM
    highMin: num(process.env.RISK_HIGH_MIN, 5),      // 5-9   -> HIGH, < 5 -> CRITICAL
  },
  maxUnits: num(process.env.MAX_UNITS, 500),

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};

// Fail fast: a server without a signing secret must not start.
if (!config.jwt.secret || config.jwt.secret.length < 16) {
  throw new Error('JWT_SECRET is missing or too short (min 16 chars). See .env.example');
}

module.exports = config;
