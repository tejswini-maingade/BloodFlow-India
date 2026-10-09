const ApiError = require('../utils/ApiError');

// validate(schema, 'body' | 'query' | 'params')
// Cleaned, trusted data is placed on req.validated (never use the raw req.body).
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, details[0].message, details));
  }

  req.validated = { ...req.validated, [source]: result.data };
  return next();
};

module.exports = validate;
