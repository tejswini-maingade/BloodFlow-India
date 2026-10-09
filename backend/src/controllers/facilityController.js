const facilityService = require('../services/facilityService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await facilityService.list(req.validated.query);
  res.status(200).json({ success: true, data, meta: { count: data.length } });
});

const get = asyncHandler(async (req, res) => {
  const data = await facilityService.getById(req.validated.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = { list, get };
