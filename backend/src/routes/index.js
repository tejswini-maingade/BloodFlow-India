const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/blood', require('./blood.routes'));
// Phase 2C: /hospitals, /dashboard, /alerts

module.exports = router;
