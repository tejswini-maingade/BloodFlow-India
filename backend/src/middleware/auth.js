const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// 401 = "we don't know who you are".
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required'));
  }
  try {
    // Pin the algorithm so a forged token can't pick a weaker one.
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

// 403 = "we know who you are, but you may not do this".
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : next(new ApiError(403, 'You do not have permission to perform this action'));

module.exports = { requireAuth, requireRole };
