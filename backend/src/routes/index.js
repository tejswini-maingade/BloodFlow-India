const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/blood', require('./blood.routes'));
router.use('/hospitals', require('./hospitals.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/alerts', require('./alerts.routes'));

module.exports = router;
