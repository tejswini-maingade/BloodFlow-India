const config = require('../config');
const ApiError = require('../utils/ApiError');

// Translate known database errors into clean HTTP errors.
function fromPrismaError(err) {
  switch (err.code) {
    case 'P2002': return new ApiError(409, 'This facility already has an entry for that blood group');
    case 'P2003': return new ApiError(400, 'Referenced facility does not exist');
    case 'P2025': return new ApiError(404, 'Record not found');
    default: return null;
  }
}

function notFound(req, res) {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let apiError = null;

  if (err instanceof ApiError) apiError = err;
  else if (err.type === 'entity.parse.failed') apiError = new ApiError(400, 'Request body is not valid JSON');
  else if (err.type === 'entity.too.large') apiError = new ApiError(413, 'Request body too large');
  else if (err.name === 'PrismaClientKnownRequestError') apiError = fromPrismaError(err);

  if (apiError) {
    const error = { message: apiError.message };
    if (apiError.details) error.details = apiError.details;
    return res.status(apiError.status).json({ success: false, error });
  }

  // Unexpected error: log it on the server, never leak internals to the client in production.
  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: config.nodeEnv === 'production' ? 'Internal server error' : err.message },
  });
}

module.exports = { notFound, errorHandler };
