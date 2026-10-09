const inventoryService = require('../services/inventoryService');
const asyncHandler = require('../utils/asyncHandler');
const { MODEL_LABEL } = require('../services/riskService');

const list = asyncHandler(async (req, res) => {
  const data = await inventoryService.list(req.validated.query);
  res.status(200).json({ success: true, data, meta: { count: data.length, riskModel: MODEL_LABEL } });
});

const get = asyncHandler(async (req, res) => {
  const data = await inventoryService.getById(req.validated.params.id);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await inventoryService.create(req.validated.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await inventoryService.update(req.validated.params.id, req.validated.body.unitsAvailable);
  res.status(200).json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  await inventoryService.remove(id);
  res.status(200).json({ success: true, data: { id } });
});

module.exports = { list, get, create, update, remove };
