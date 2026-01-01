/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 */

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map();

// Configuration for different rate limit tiers
const RATE_LIMIT_CONFIG = {
  // Default limits for unauthenticated requests
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // Limits for authenticated users
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Stricter limits for AI endpoints (more resource intensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
  // Very strict limits for auth endpoints (prevent brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },
};

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get client identifier from request
 * @param {Object} req - Request object
 * @returns {string} - Client identifier
 */
function getClientId(req) {
  // Use user ID if authenticated, otherwise use IP
  const userId = req.user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP from various headers (handles proxies)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.socket?.remoteAddress || 
             req.connection?.remoteAddress ||
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check rate limit for a request
 * @param {string} clientId - Client identifier
 * @param {string} endpoint - Endpoint path
 * @param {Object} config - Rate limit configuration
 * @returns {Object} - Rate limit status
 */
function checkRateLimit(clientId, endpoint, config) {
  const key = `${clientId}:${endpoint}`;
  const now = Date.now();
  
  let data = rateLimitStore.get(key);
  
  if (!data || now > data.resetTime) {
    // Create new window
    data = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  data.count++;
  rateLimitStore.set(key, data);
  
  const remaining = Math.max(0, config.maxRequests - data.count);
  const isLimited = data.count > config.maxRequests;
  
  return {
    isLimited,
    remaining,
    resetTime: data.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Rate limiting middleware factory
 * @param {string} tier - Rate limit tier (default, authenticated, ai, auth)
 * @returns {Function} - Middleware function
 */
export function rateLimit(tier = 'default') {
  const config = RATE_LIMIT_CONFIG[tier] || RATE_LIMIT_CONFIG.default;
  
  return async (req, res, next) => {
    const clientId = getClientId(req);
    const endpoint = tier; // Use tier as endpoint group
    
    const result = checkRateLimit(clientId, endpoint, config);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (result.isLimited) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      });
    }
    
    // Continue to handler
    if (typeof next === 'function') {
      return next();
    }
  };
}

/**
 * HOC to wrap API handlers with rate limiting
 * @param {Function} handler - API route handler
 * @param {string} tier - Rate limit tier
 * @returns {Function} - Wrapped handler
 */
export function withRateLimit(handler, tier = 'default') {
  const rateLimiter = rateLimit(tier);
  
  return async (req, res) => {
    // Apply rate limiting
    const limited = await new Promise((resolve) => {
      rateLimiter(req, res, () => resolve(false));
      // If rate limiter returns response, we're limited
      if (res.headersSent) {
        resolve(true);
      }
    });
    
    if (limited || res.headersSent) {
      return;
    }
    
    return handler(req, res);
  };
}

/**
 * Combined middleware for auth endpoints
 */
export function authRateLimit() {
  return rateLimit('auth');
}

/**
 * Combined middleware for AI endpoints
 */
export function aiRateLimit() {
  return rateLimit('ai');
}

export default { rateLimit, withRateLimit, authRateLimit, aiRateLimit };
