require('dotenv').config();

// Single place where environment variables are read.
// The rest of the app imports this file instead of touching process.env.
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = config;
