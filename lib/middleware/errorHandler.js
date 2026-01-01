/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_ERROR');
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Error logging with appropriate detail level
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 */
function logError(error, req) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
    },
    request: {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userId: req.user?.id,
    },
  };

  // Log stack trace for non-operational errors
  if (!error.isOperational) {
    errorLog.stack = error.stack;
    console.error('[CRITICAL ERROR]', JSON.stringify(errorLog, null, 2));
  } else if (error.statusCode >= 500) {
    console.error('[SERVER ERROR]', JSON.stringify(errorLog, null, 2));
  } else {
    console.warn('[CLIENT ERROR]', JSON.stringify(errorLog));
  }
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @param {boolean} isDev - Whether in development mode
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(error, isDev = false) {
  const response = {
    success: false,
    error: {
      message: error.isOperational ? error.message : 'An unexpected error occurred',
      code: error.code || 'INTERNAL_ERROR',
    },
  };

  // Include validation errors if present
  if (error instanceof ValidationError && error.errors) {
    response.error.details = error.errors;
  }

  // Include retry-after for rate limit errors
  if (error instanceof RateLimitError) {
    response.error.retryAfter = error.retryAfter;
  }

  // Include stack trace in development
  if (isDev && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Error handling middleware
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export function errorHandler(error, req, res) {
  // Log the error
  logError(error, req);

  // Determine status code
  const statusCode = error.statusCode || 500;
  
  // Format response
  const isDev = process.env.NODE_ENV !== 'production';
  const response = formatErrorResponse(error, isDev);

  // Send response
  return res.status(statusCode).json(response);
}

/**
 * HOC to wrap API handlers with error handling
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error, req, res);
    }
  };
}

/**
 * Async handler wrapper for cleaner error handling
 * @param {Function} fn - Async function
 * @returns {Function} - Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      errorHandler(error, req, res);
    });
  };
}

/**
 * Handle unhandled rejections and exceptions
 */
export function setupGlobalErrorHandlers() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]', {
      timestamp: new Date().toISOString(),
      reason: reason?.message || reason,
      stack: reason?.stack,
    });
  });

  process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]', {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
    // Give time for logging before exit
    setTimeout(() => process.exit(1), 1000);
  });
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  errorHandler,
  withErrorHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
};
