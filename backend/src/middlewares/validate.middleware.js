const AppError = require('../utils/AppError');

/**
 * Express middleware wrapping Zod schemas for request body validation.
 * Preserves unknown keys when schemas use .passthrough().
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body || {});
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    const message = firstIssue
      ? `${firstIssue.path.join('.') ? `${firstIssue.path.join('.')}: ` : ''}${firstIssue.message}`
      : 'Dữ liệu đầu vào không hợp lệ';
    return next(new AppError(message, 400, 'VALIDATION_ERROR', details));
  }
  req.body = result.data;
  return next();
};

module.exports = {
  validateBody,
};
