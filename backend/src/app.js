const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind a proxy (Elastic Beanstalk), this makes req.ip the real client address,
// which the rate limiter needs. We'll confirm the exact value in Phase 6.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

// Health check: used locally, by Docker, and by AWS Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'bloodflow-backend' });
});

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
