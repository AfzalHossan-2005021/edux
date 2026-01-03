/**
 * Auth module exports
 * Centralized authentication utilities
 */

// Password utilities
export { hashPassword, verifyPassword, validatePasswordStrength } from './password';

// JWT utilities
export { 
  generateAccessToken, 
  generateRefreshToken, 
  generateTokens, 
  verifyAccessToken, 
  verifyRefreshToken,
  decodeToken,
  isTokenExpired 
} from './jwt';

// Cookie utilities
export { 
  setAuthCookies, 
  clearAuthCookies, 
  getTokensFromCookies, 
  getAccessToken 
} from './cookies';

// Server-side auth HOCs
export {
  withServerSideAuth,
  withStudentAuth,
  withInstructorAuth,
  withAdminOnlyAuth,
} from './withServerSideAuth';

// Rate limiting
export {
  createRateLimiter,
  loginRateLimiter,
  signupRateLimiter,
  passwordResetRateLimiter,
  withRateLimit,
  getClientIp,
} from './rateLimiter';

// CSRF protection
export {
  generateCsrfToken,
  generateSignedCsrfToken,
  verifyCsrfToken,
  setCsrfCookie,
  getCsrfTokenFromRequest,
  getCsrfTokenFromCookie,
  withCsrfProtection,
  handleCsrfTokenRequest,
} from './csrf';

// Session management
export {
  generateSessionId,
  generateTokenFamily,
  createSession,
  getSession,
  rotateRefreshToken,
  validateRefreshTokenVersion,
  invalidateSession,
  invalidateAllUserSessions,
  getUserSessions,
  cleanupExpiredSessions,
} from './sessionManager';

// Audit logging
export {
  logAuditEvent,
  audit,
  queryAuditLogs,
  AuditEventType,
  LogLevel,
} from './auditLogger';
