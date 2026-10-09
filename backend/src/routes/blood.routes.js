const router = require('express').Router();
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const schemas = require('../validators/schemas');
const c = require('../controllers/bloodController');

const adminOnly = [requireAuth, requireRole('ADMIN')];

// Public (read-only)
router.get('/', validate(schemas.listQuery, 'query'), c.list);
router.get('/:id', validate(schemas.idParam, 'params'), c.get);

// Admin only. Auth runs BEFORE validation, so strangers get 401, not validation hints.
router.post('/', ...adminOnly, validate(schemas.createInventory), c.create);
router.put('/:id', ...adminOnly, validate(schemas.idParam, 'params'), validate(schemas.updateInventory), c.update);
router.delete('/:id', ...adminOnly, validate(schemas.idParam, 'params'), c.remove);

module.exports = router;
