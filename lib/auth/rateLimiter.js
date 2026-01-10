/**
 * Rate Limiter for Authentication Endpoints
 * 
 * Provides in-memory rate limiting to prevent brute force attacks.
 * For production, consider using Redis for distributed rate limiting.
 */

// In-memory store for rate limiting
// Key: identifier (IP or email), Value: { count, resetTime }
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Auto-cleanup to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Rate limit configuration
 */
const defaultConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block after exceeding
  skipSuccessfulRequests: true, // Don't count successful logins
};

/**
 * Get client IP from request
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimiter(customConfig = {}) {
  const config = { ...defaultConfig, ...customConfig };

  return {
    /**
     * Check if request should be rate limited
     * @param {string} identifier - Unique identifier (IP, email, etc.)
     * @returns {Object} { limited: boolean, remaining: number, resetTime: number, retryAfter: number }
     */
    check(identifier) {
      const now = Date.now();
      const key = `rate:${identifier}`;
      const record = rateLimitStore.get(key);

      if (!record) {
        // First request - initialize
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false,
          blockUntil: 0,
        });
        return {
          limited: false,
          remaining: config.maxAttempts - 1,
          resetTime: now + config.windowMs,
          retryAfter: 0,
        };
      }

      // Check if blocked
      if (record.blocked && now < record.blockUntil) {
        return {
          limited: true,
          remaining: 0,
          resetTime: record.blockUntil,
          retryAfter: Math.ceil((record.blockUntil - now) / 1000),
        };
      }

      // Check if window has expired
      if (now > record.resetTime) {
        // Reset the window
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false,
          blockUntil: 0,
        });
        return {
          limited: false,
          remaining: config.maxAttempts - 1,
          resetTime: now + config.windowMs,
          retryAfter: 0,
        };
      }

      // Increment count
      record.count += 1;

      // Check if exceeded
      if (record.count > config.maxAttempts) {
        record.blocked = true;
        record.blockUntil = now + config.blockDurationMs;
        rateLimitStore.set(key, record);
        return {
          limited: true,
          remaining: 0,
          resetTime: record.blockUntil,
          retryAfter: Math.ceil(config.blockDurationMs / 1000),
        };
      }

      rateLimitStore.set(key, record);
      return {
        limited: false,
        remaining: config.maxAttempts - record.count,
        resetTime: record.resetTime,
        retryAfter: 0,
      };
    },

    /**
     * Reset rate limit for an identifier (e.g., after successful login)
     */
    reset(identifier) {
      const key = `rate:${identifier}`;
      rateLimitStore.delete(key);
    },

    /**
     * Get current status without incrementing
     */
    status(identifier) {
      const now = Date.now();
      const key = `rate:${identifier}`;
      const record = rateLimitStore.get(key);

      if (!record) {
        return {
          limited: false,
          remaining: config.maxAttempts,
          resetTime: 0,
          retryAfter: 0,
        };
      }

      if (record.blocked && now < record.blockUntil) {
        return {
          limited: true,
          remaining: 0,
          resetTime: record.blockUntil,
          retryAfter: Math.ceil((record.blockUntil - now) / 1000),
        };
      }

      if (now > record.resetTime) {
        return {
          limited: false,
          remaining: config.maxAttempts,
          resetTime: 0,
          retryAfter: 0,
        };
      }

      return {
        limited: record.count >= config.maxAttempts,
        remaining: Math.max(0, config.maxAttempts - record.count),
        resetTime: record.resetTime,
        retryAfter: 0,
      };
    },
  };
}

// Default rate limiter for login endpoints
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 failed attempts
  blockDurationMs: 30 * 60 * 1000, // 30 minute block
});

// Stricter rate limiter for signup endpoints (prevent spam accounts)
export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3, // 3 attempts per hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour block
});

// Rate limiter for password reset
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3, // 3 attempts per hour
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 hour block
});

/**
 * Middleware wrapper for rate limiting
 * @param {Object} rateLimiter - Rate limiter instance
 * @param {Function} getIdentifier - Function to get identifier from request
 */
export function withRateLimit(handler, rateLimiter = loginRateLimiter, getIdentifier = null) {
  return async (req, res) => {
    const identifier = getIdentifier 
      ? getIdentifier(req)
      : req.body?.email || getClientIp(req);

    const result = rateLimiter.check(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', defaultConfig.maxAttempts);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime);

    if (result.limited) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please try again later.',
        retryAfter: result.retryAfter,
        message: `Too many failed attempts. Please try again in ${Math.ceil(result.retryAfter / 60)} minutes.`,
      });
    }

    // Store rate limiter and identifier for potential reset on success
    req.rateLimiter = rateLimiter;
    req.rateLimitIdentifier = identifier;

    return handler(req, res);
  };
}

export { getClientIp };
export default createRateLimiter;
