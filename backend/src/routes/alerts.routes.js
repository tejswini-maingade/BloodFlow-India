const router = require('express').Router();
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const c = require('../controllers/alertController');

router.get('/', validate(schemas.alertsQuery, 'query'), c.list);

module.exports = router;
