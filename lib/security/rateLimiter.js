/**
 * Rate Limiter for EduX API
 * Protects against brute force and DDoS attacks
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimitConfig = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.',
  },
  
  // Search endpoints - allow more frequent access
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests. Please wait a moment.',
  },
  
  // File upload endpoints - strict limits
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'Upload limit reached. Please try again later.',
  },
  
  // General page requests
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: 'Too many requests.',
  },
};

/**
 * Get client identifier for rate limiting
 */
function getClientId(req) {
  // Check for forwarded IP (behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  
  // Optionally include user ID for authenticated requests
  const userId = req.headers['x-user-id'] || '';
  
  return `${ip}:${userId}`;
}

/**
 * Rate limiter middleware
 */
export function rateLimit(config = RateLimitConfig.api) {
  return async (req, res, next) => {
    const clientId = getClientId(req);
    const endpoint = req.url?.split('?')[0] || '/';
    const key = `${clientId}:${endpoint}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new record
      record = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    // Calculate remaining requests
    const remaining = Math.max(0, config.maxRequests - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    // Check if limit exceeded
    if (record.count > config.maxRequests) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        retryAfter,
      });
    }

    // Continue to handler
    if (typeof next === 'function') {
      return next();
    }
    return true;
  };
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(handler, config = RateLimitConfig.api) {
  return async (req, res) => {
    const limiter = rateLimit(config);
    const result = await limiter(req, res);
    
    if (result === true) {
      return handler(req, res);
    }
    // Response already sent by rate limiter
  };
}

/**
 * Sliding window rate limiter (more accurate but more memory)
 */
export function slidingWindowRateLimit(config = RateLimitConfig.api) {
  const windowStore = new Map();

  return async (req, res, next) => {
    const clientId = getClientId(req);
    const endpoint = req.url?.split('?')[0] || '/';
    const key = `${clientId}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let timestamps = windowStore.get(key) || [];
    
    // Remove expired timestamps
    timestamps = timestamps.filter(t => t > windowStart);
    
    // Add current request
    timestamps.push(now);
    windowStore.set(key, timestamps);

    const remaining = Math.max(0, config.maxRequests - timestamps.length);

    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (timestamps.length > config.maxRequests) {
      const oldestAllowed = timestamps[timestamps.length - config.maxRequests];
      const retryAfter = Math.ceil((oldestAllowed + config.windowMs - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        retryAfter,
      });
    }

    if (typeof next === 'function') {
      return next();
    }
    return true;
  };
}

/**
 * IP-based blocking for suspicious activity
 */
const blockedIPs = new Set();
const suspiciousActivity = new Map();

export function trackSuspiciousActivity(req, reason) {
  const ip = getClientId(req).split(':')[0];
  const now = Date.now();
  
  let record = suspiciousActivity.get(ip) || { count: 0, reasons: [], firstSeen: now };
  record.count++;
  record.reasons.push({ reason, timestamp: now });
  record.lastSeen = now;
  
  suspiciousActivity.set(ip, record);
  
  // Auto-block after multiple suspicious activities
  if (record.count >= 10) {
    blockedIPs.add(ip);
    console.warn(`Blocked IP ${ip} due to suspicious activity:`, record.reasons);
  }
}

export function isBlocked(req) {
  const ip = getClientId(req).split(':')[0];
  return blockedIPs.has(ip);
}

export function blockIP(ip) {
  blockedIPs.add(ip);
}

export function unblockIP(ip) {
  blockedIPs.delete(ip);
  suspiciousActivity.delete(ip);
}

/**
 * Middleware to check if IP is blocked
 */
export function checkBlocked(req, res, next) {
  if (isBlocked(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your IP has been blocked due to suspicious activity.',
    });
  }
  
  if (typeof next === 'function') {
    return next();
  }
  return true;
}

export default rateLimit;
