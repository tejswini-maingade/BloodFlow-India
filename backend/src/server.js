const app = require('./app');
const config = require('./config');

// Bind to 0.0.0.0 so the app is reachable from outside a container/VM
// (needed for Docker and Elastic Beanstalk).
app.listen(config.port, '0.0.0.0', () => {
  console.log(`BloodFlow backend running on port ${config.port} (${config.nodeEnv})`);
});
