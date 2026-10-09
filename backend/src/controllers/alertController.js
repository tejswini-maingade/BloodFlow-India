const alertService = require('../services/alertService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await alertService.list(req.validated.query.limit);
  res.status(200).json({ success: true, data, meta: { count: data.length } });
});

module.exports = { list };
