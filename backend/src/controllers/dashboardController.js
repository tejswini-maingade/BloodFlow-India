const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');
const { MODEL_LABEL } = require('../services/riskService');

const get = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard();
  res.status(200).json({
    success: true,
    data,
    meta: {
      riskModel: MODEL_LABEL,
      dataNotice: 'Synthetic demo data. Not real hospital or blood bank records.',
    },
  });
});

module.exports = { get };
