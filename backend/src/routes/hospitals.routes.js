const router = require('express').Router();
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const c = require('../controllers/facilityController');

router.get('/', validate(schemas.facilityListQuery, 'query'), c.list);
router.get('/:id', validate(schemas.idParam, 'params'), c.get);

module.exports = router;
