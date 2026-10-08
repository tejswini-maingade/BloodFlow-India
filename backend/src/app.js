const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');

const app = express();

// Security headers
app.use(helmet());

// Only allow the configured frontend origin
app.use(cors({ origin: config.corsOrigin }));

// Parse JSON request bodies
app.use(express.json());

// Health check: used locally, by Docker, and by AWS Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'bloodflow-backend',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

// Central error handler. Never leaks stack traces in production.
// (Express recognises error handlers by their 4 arguments.)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const message =
    config.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ success: false, error: { message } });
});

module.exports = app;
