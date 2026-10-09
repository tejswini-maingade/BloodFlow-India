const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const data = await authService.login(email, password);
  res.status(200).json({ success: true, data });
});

module.exports = { login };
