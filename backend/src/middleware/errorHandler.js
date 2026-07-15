const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`मार्ग नहीं मिला: ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  } else {
    logger.warn(err.message, { path: req.originalUrl });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    },
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
