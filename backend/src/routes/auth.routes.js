const router = require('express').Router();
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const schemas = require('../validators/schemas');
const authController = require('../controllers/authController');

router.post('/login', loginLimiter, validate(schemas.login), authController.login);

module.exports = router;
