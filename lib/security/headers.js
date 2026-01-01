/**
 * Security Headers and CSRF Protection for EduX
 */

import crypto from 'crypto';

/**
 * Generate a secure random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * CSRF Token Management
 */
const csrfTokens = new Map();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token);
    }
  }
}, 300000); // Every 5 minutes

/**
 * Generate CSRF token for a session
 */
export function generateCSRFToken(sessionId) {
  const token = generateToken();
  csrfTokens.set(token, {
    sessionId,
    expires: Date.now() + 3600000, // 1 hour
    created: Date.now(),
  });
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token, sessionId) {
  const data = csrfTokens.get(token);
  if (!data) return false;
  if (Date.now() > data.expires) {
    csrfTokens.delete(token);
    return false;
  }
  return data.sessionId === sessionId;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req, res, next) {
  // Skip for GET, HEAD, OPTIONS requests
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    if (typeof next === 'function') return next();
    return true;
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

  if (!token || !sessionId || !validateCSRFToken(token, sessionId)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing CSRF token',
    });
  }

  if (typeof next === 'function') return next();
  return true;
}

/**
 * Security Headers Configuration
 */
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature-Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Strict Transport Security (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

/**
 * Apply security headers middleware
 */
export function applySecurityHeaders(req, res, next) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      res.setHeader(key, value);
    }
  });
  
  if (typeof next === 'function') return next();
  return true;
}

/**
 * Input Sanitization utilities
 */
export const sanitize = {
  /**
   * Escape HTML special characters
   */
  html(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Remove potentially dangerous characters for SQL
   */
  sql(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/['";\-\-\/\*]/g, '');
  },

  /**
   * Sanitize for use in file paths
   */
  path(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[^a-zA-Z0-9_\-\.]/g, '');
  },

  /**
   * Remove all HTML tags
   */
  stripTags(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize email address
   */
  email(str) {
    if (typeof str !== 'string') return str;
    return str.toLowerCase().trim();
  },

  /**
   * Deep sanitize an object
   */
  object(obj, sanitizer = 'html') {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this[sanitizer](obj);
    if (Array.isArray(obj)) {
      return obj.map(item => this.object(item, sanitizer));
    }
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.path(key)] = this.object(value, sanitizer);
      }
      return sanitized;
    }
    return obj;
  },
};

/**
 * Validate and sanitize request body middleware
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize.object(req.body, 'html');
  }
  
  if (typeof next === 'function') return next();
  return true;
}

/**
 * Security middleware wrapper for API routes
 */
export function withSecurity(handler, options = {}) {
  const {
    csrf = false,
    sanitizeInput = true,
    headers = true,
  } = options;

  return async (req, res) => {
    // Apply security headers
    if (headers) {
      applySecurityHeaders(req, res);
    }

    // CSRF protection
    if (csrf) {
      const csrfResult = csrfProtection(req, res);
      if (res.headersSent) return;
    }

    // Sanitize input
    if (sanitizeInput) {
      sanitizeBody(req, res);
    }

    return handler(req, res);
  };
}

export default {
  generateToken,
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection,
  securityHeaders,
  applySecurityHeaders,
  sanitize,
  sanitizeBody,
  withSecurity,
};
