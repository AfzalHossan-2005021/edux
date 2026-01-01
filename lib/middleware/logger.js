/**
 * Request/Response Logging Middleware
 * Provides detailed logging for API requests and responses
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Current log level from environment
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

/**
 * Check if a log level should be output
 * @param {string} level - Log level
 * @returns {boolean} - Whether to log
 */
function shouldLog(level) {
  return LOG_LEVELS[level] >= currentLogLevel;
}

/**
 * Format log message with timestamp
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string} - Formatted log message
 */
function formatLog(level, message, data = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  });
}

/**
 * Logger utility
 */
export const logger = {
  debug: (message, data) => {
    if (shouldLog('DEBUG')) {
      console.debug(formatLog('DEBUG', message, data));
    }
  },
  info: (message, data) => {
    if (shouldLog('INFO')) {
      console.info(formatLog('INFO', message, data));
    }
  },
  warn: (message, data) => {
    if (shouldLog('WARN')) {
      console.warn(formatLog('WARN', message, data));
    }
  },
  error: (message, data) => {
    if (shouldLog('ERROR')) {
      console.error(formatLog('ERROR', message, data));
    }
  },
};

/**
 * Generate unique request ID
 * @returns {string} - Request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get client info from request
 * @param {Object} req - Request object
 * @returns {Object} - Client info
 */
function getClientInfo(req) {
  return {
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
        req.socket?.remoteAddress || 
        'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: req.headers.referer || req.headers.referrer,
  };
}

/**
 * Sanitize request body for logging (remove sensitive data)
 * @param {Object} body - Request body
 * @returns {Object} - Sanitized body
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Request logging middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export function requestLogger(req, res, next) {
  // Generate and attach request ID
  req.requestId = generateRequestId();
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    query: req.query,
    body: sanitizeBody(req.body),
    client: getClientInfo(req),
    userId: req.user?.id,
  });

  // Store original end method
  const originalEnd = res.end.bind(res);

  // Override end to log response
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;

    // Log response
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    };

    if (res.statusCode >= 500) {
      logger.error('Server error response', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error response', logData);
    } else {
      logger.info('Request completed', logData);
    }

    return originalEnd(chunk, encoding);
  };

  // Set request ID header
  res.setHeader('X-Request-Id', req.requestId);

  if (typeof next === 'function') {
    next();
  }
}

/**
 * HOC to wrap API handlers with logging
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler
 */
export function withLogging(handler) {
  return async (req, res) => {
    // Generate and attach request ID
    req.requestId = generateRequestId();
    const startTime = Date.now();

    // Log incoming request
    logger.info('Incoming request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      query: req.query,
      body: sanitizeBody(req.body),
      client: getClientInfo(req),
    });

    // Set request ID header
    res.setHeader('X-Request-Id', req.requestId);

    try {
      await handler(req, res);
    } finally {
      const duration = Date.now() - startTime;

      // Log response
      const logData = {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
      };

      if (res.statusCode >= 500) {
        logger.error('Server error response', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('Client error response', logData);
      } else {
        logger.info('Request completed', logData);
      }
    }
  };
}

/**
 * Performance logging for slow queries
 * @param {string} operation - Operation name
 * @param {number} threshold - Threshold in ms
 * @returns {Function} - Timer function
 */
export function performanceTimer(operation, threshold = 1000) {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    
    if (duration > threshold) {
      logger.warn('Slow operation detected', {
        operation,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`,
      });
    } else {
      logger.debug('Operation completed', {
        operation,
        duration: `${duration}ms`,
      });
    }

    return duration;
  };
}

export default {
  logger,
  requestLogger,
  withLogging,
  performanceTimer,
};
