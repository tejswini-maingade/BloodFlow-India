const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind a proxy (Elastic Beanstalk), this makes req.ip the real client address.
app.set('trust proxy', 1);

// Helmet's defaults assume HTTPS. On plain HTTP they would break the page:
//  - upgrade-insecure-requests makes browsers request our CSS/JS over https://
//  - HSTS tells browsers to refuse http:// for a year
// So both are OFF unless FORCE_HTTPS=true (set it once the site has a real certificate).
const https = config.forceHttps;
app.use(
  helmet({
    hsts: https,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'upgrade-insecure-requests': https ? [] : null,
      },
    },
  })
);

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

// Health check: used locally, by Docker, and by AWS Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'bloodflow-backend' });
});

app.use('/api', apiLimiter, routes);

// Serve the React app (only when a build exists).
if (config.staticDir) {
  const indexFile = path.join(config.staticDir, 'index.html');

  app.use(express.static(config.staticDir, { index: false, maxAge: '1h' }));

  // React Router handles URLs like /availability in the browser, so any other
  // page request must return index.html. Excluded on purpose:
  //  - /api and /health (they keep their JSON 404s)
  //  - paths with a file extension (a missing /app.js must be a 404, not HTML)
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path === '/api' || req.path.startsWith('/api/') || req.path === '/health') return next();
    if (path.extname(req.path)) return next();
    return res.sendFile(indexFile);
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
