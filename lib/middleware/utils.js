/**
 * Middleware Utility Functions
 * 
 * These are utility functions that can be called inside API handlers
 * rather than wrapping them as HOCs (which can cause recursion issues).
 * 
 * Usage:
 *   import { checkRateLimit, getCached, setCached } from '@/lib/middleware/utils';
 *   
 *   export default async function handler(req, res) {
 *     // Check rate limit
 *     const rateLimitResult = checkRateLimit(req, 'default');
 *     if (!rateLimitResult.allowed) {
 *       return res.status(429).json({ error: 'Rate limit exceeded' });
 *     }
 *     
 *     // Check cache
 *     const cacheKey = `popular_courses`;
 *     const cached = getCached(cacheKey);
 *     if (cached) {
 *       return res.status(200).json(cached);
 *     }
 *     
 *     // ... do work ...
 *     
 *     setCached(cacheKey, result, 300); // cache for 5 minutes
 *     return res.status(200).json(result);
 *   }
 */

// ================== Rate Limiting ==================

const rateLimitStore = new Map();

const RATE_LIMITS = {
  default: { maxTokens: 30, refillRate: 0.5, windowMs: 60000 },
  auth: { maxTokens: 10, refillRate: 0.17, windowMs: 60000 },
  ai: { maxTokens: 20, refillRate: 0.33, windowMs: 60000 },
  strict: { maxTokens: 5, refillRate: 0.08, windowMs: 60000 },
};

function getClientIdentifier(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
  return ip;
}

/**
 * Check if request is within rate limits
 * @param {Object} req - Request object
 * @param {string} tier - Rate limit tier: 'default', 'auth', 'ai', 'strict'
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(req, tier = 'default') {
  const config = RATE_LIMITS[tier] || RATE_LIMITS.default;
  const clientId = getClientIdentifier(req);
  const key = `${clientId}:${tier}`;
  const now = Date.now();

  let bucket = rateLimitStore.get(key);
  
  if (!bucket) {
    bucket = {
      tokens: config.maxTokens,
      lastRefill: now,
    };
    rateLimitStore.set(key, bucket);
  }

  // Refill tokens based on time elapsed
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = (elapsed / 1000) * config.refillRate;
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if we have tokens available
  if (bucket.tokens < 1) {
    const resetTime = Math.ceil((1 - bucket.tokens) / config.refillRate);
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Consume a token
  bucket.tokens -= 1;
  rateLimitStore.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.floor(bucket.tokens),
    resetTime: 0,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastRefill > 300000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);


// ================== Caching ==================

const cacheStore = new Map();

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if not found/expired
 */
export function getCached(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  
  // Update access time for LRU
  entry.accessedAt = Date.now();
  return entry.value;
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
export function setCached(key, value, ttl = 300) {
  // Limit cache size (simple LRU-like)
  if (cacheStore.size >= 1000) {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [k, v] of cacheStore.entries()) {
      if (v.accessedAt < oldestTime) {
        oldestTime = v.accessedAt;
        oldestKey = k;
      }
    }
    
    if (oldestKey) {
      cacheStore.delete(oldestKey);
    }
  }
  
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + (ttl * 1000),
    accessedAt: Date.now(),
  });
}

/**
 * Delete cached value
 * @param {string} key - Cache key
 */
export function deleteCached(key) {
  cacheStore.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache() {
  cacheStore.clear();
}

/**
 * Get cache statistics
 * @returns {{ size: number, keys: string[] }}
 */
export function getCacheStats() {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}


// ================== Logging ==================

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function formatLog(level, message, data = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...data,
  });
}

/**
 * Log at debug level
 */
export function logDebug(message, data = {}) {
  if (currentLogLevel <= LOG_LEVELS.debug) {
    console.log(formatLog('debug', message, data));
  }
}

/**
 * Log at info level
 */
export function logInfo(message, data = {}) {
  if (currentLogLevel <= LOG_LEVELS.info) {
    console.log(formatLog('info', message, data));
  }
}

/**
 * Log at warn level
 */
export function logWarn(message, data = {}) {
  if (currentLogLevel <= LOG_LEVELS.warn) {
    console.warn(formatLog('warn', message, data));
  }
}

/**
 * Log at error level
 */
export function logError(message, data = {}) {
  if (currentLogLevel <= LOG_LEVELS.error) {
    console.error(formatLog('error', message, data));
  }
}

/**
 * Log API request
 */
export function logRequest(req) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logInfo('API Request', {
    requestId,
    method: req.method,
    url: req.url,
    query: req.query || {},
    userAgent: req.headers?.['user-agent'],
  });
  
  return requestId;
}

/**
 * Log API response
 */
export function logResponse(requestId, statusCode, duration) {
  logInfo('API Response', {
    requestId,
    statusCode,
    duration: `${duration}ms`,
  });
}


// ================== Error Handling ==================

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends ApiError {
  constructor(retryAfter = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Handle error and send appropriate response
 */
export function handleError(error, res) {
  logError('API Error', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.errors && { errors: error.errors }),
        ...(error.retryAfter && { retryAfter: error.retryAfter }),
      },
    });
  }

  // Generic error response
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
    },
  });
}


// ================== Request Helpers ==================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(body, fields) {
  const missing = fields.filter(field => !body || body[field] === undefined);
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      missing.map(field => ({ field, message: 'This field is required' }))
    );
  }
  
  return true;
}

/**
 * Validate request method
 */
export function validateMethod(req, allowed) {
  const methods = Array.isArray(allowed) ? allowed : [allowed];
  
  if (!methods.includes(req.method)) {
    throw new ApiError(
      `Method ${req.method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED'
    );
  }
  
  return true;
}

/**
 * Parse pagination parameters from query
 */
export function getPagination(query, defaults = { page: 1, limit: 10, maxLimit: 100 }) {
  const page = Math.max(1, parseInt(query.page) || defaults.page);
  const limit = Math.min(
    defaults.maxLimit,
    Math.max(1, parseInt(query.limit) || defaults.limit)
  );
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Create pagination response metadata
 */
export function createPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
