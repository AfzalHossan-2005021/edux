/**
 * CSRF Protection for Form Submissions
 * 
 * Implements double-submit cookie pattern for CSRF protection.
 */

import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'edux_csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Generate a signed CSRF token with expiry
 */
export function generateSignedCsrfToken() {
  const token = generateCsrfToken();
  const expiry = Date.now() + CSRF_TOKEN_EXPIRY;
  const data = `${token}:${expiry}`;
  
  // Sign the token
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  return `${data}:${signature}`;
}

/**
 * Verify a signed CSRF token
 */
export function verifyCsrfToken(signedToken) {
  if (!signedToken) return false;
  
  const parts = signedToken.split(':');
  if (parts.length !== 3) return false;
  
  const [token, expiry, signature] = parts;
  
  // Check expiry
  if (Date.now() > parseInt(expiry, 10)) {
    return false;
  }
  
  // Verify signature
  const data = `${token}:${expiry}`;
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  // Use timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Set CSRF cookie on response
 */
export function setCsrfCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.setHeader('Set-Cookie', [
    `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly=false; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=${CSRF_TOKEN_EXPIRY / 1000}`,
  ]);
}

/**
 * Get CSRF token from request
 */
export function getCsrfTokenFromRequest(req) {
  // Check header first (for AJAX requests)
  const headerToken = req.headers[CSRF_HEADER_NAME];
  if (headerToken) return headerToken;
  
  // Check body (for form submissions)
  if (req.body && req.body._csrf) {
    return req.body._csrf;
  }
  
  // Check query (for GET requests - not recommended for mutations)
  if (req.query && req.query._csrf) {
    return req.query._csrf;
  }
  
  return null;
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(req) {
  const cookies = req.cookies || {};
  return cookies[CSRF_COOKIE_NAME];
}

/**
 * Middleware to validate CSRF token
 */
export function withCsrfProtection(handler) {
  return async (req, res) => {
    // Skip CSRF check for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return handler(req, res);
    }
    
    // Get token from request
    const requestToken = getCsrfTokenFromRequest(req);
    const cookieToken = getCsrfTokenFromCookie(req);
    
    // Validate tokens match and are valid
    if (!requestToken || !cookieToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token missing',
        message: 'Security validation failed. Please refresh the page and try again.',
      });
    }
    
    if (requestToken !== cookieToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token mismatch',
        message: 'Security validation failed. Please refresh the page and try again.',
      });
    }
    
    // Verify the token signature
    if (!verifyCsrfToken(cookieToken)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token invalid or expired',
        message: 'Your session has expired. Please refresh the page and try again.',
      });
    }
    
    return handler(req, res);
  };
}

/**
 * API endpoint to get a new CSRF token
 * Use this for SPAs that need to fetch a token
 */
export function handleCsrfTokenRequest(req, res) {
  const token = generateSignedCsrfToken();
  setCsrfCookie(res, token);
  
  res.status(200).json({
    success: true,
    csrfToken: token,
  });
}

export default {
  generateCsrfToken,
  generateSignedCsrfToken,
  verifyCsrfToken,
  setCsrfCookie,
  getCsrfTokenFromRequest,
  getCsrfTokenFromCookie,
  withCsrfProtection,
  handleCsrfTokenRequest,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
};
