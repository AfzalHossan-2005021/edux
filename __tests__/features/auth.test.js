/**
 * Unit Tests for Role-Based Authentication System
 */

import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../../lib/auth/jwt';
import { createRateLimiter, loginRateLimiter } from '../../lib/auth/rateLimiter';
import { generateCsrfToken, generateSignedCsrfToken, verifyCsrfToken } from '../../lib/auth/csrf';
import {
  createSession,
  getSession,
  invalidateSession,
  invalidateAllUserSessions,
  validateRefreshTokenVersion,
  rotateRefreshToken,
} from '../../lib/auth/sessionManager';

// Mock environment
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.CSRF_SECRET = 'test-csrf-secret';

describe('JWT Token Generation and Verification', () => {
  const testUser = {
    u_id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    isStudent: true,
    isInstructor: false,
    isAdmin: false,
  };

  test('should generate access and refresh tokens', () => {
    const { accessToken, refreshToken } = generateTokens(testUser);
    
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
  });

  test('should include role in access token', () => {
    const { accessToken } = generateTokens(testUser);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload).toBeDefined();
    expect(payload.role).toBe('student');
    expect(payload.u_id).toBe(1);
    expect(payload.email).toBe('test@example.com');
  });

  test('should include role flags in token', () => {
    const { accessToken } = generateTokens(testUser);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload.isStudent).toBe(true);
    expect(payload.isInstructor).toBe(false);
    expect(payload.isAdmin).toBe(false);
  });

  test('should verify valid access token', () => {
    const { accessToken } = generateTokens(testUser);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload).not.toBeNull();
    expect(payload.u_id).toBe(testUser.u_id);
  });

  test('should return null for invalid access token', () => {
    const payload = verifyAccessToken('invalid-token');
    expect(payload).toBeNull();
  });

  test('should verify valid refresh token', () => {
    const { refreshToken } = generateTokens(testUser);
    const payload = verifyRefreshToken(refreshToken);
    
    expect(payload).not.toBeNull();
    expect(payload.u_id).toBe(testUser.u_id);
    expect(payload.role).toBe('student');
  });

  test('should handle different roles correctly', () => {
    const instructorUser = { ...testUser, role: 'instructor', isStudent: false, isInstructor: true };
    const adminUser = { ...testUser, role: 'admin', isStudent: false, isAdmin: true };
    
    const { accessToken: instructorToken } = generateTokens(instructorUser);
    const { accessToken: adminToken } = generateTokens(adminUser);
    
    expect(verifyAccessToken(instructorToken).role).toBe('instructor');
    expect(verifyAccessToken(adminToken).role).toBe('admin');
  });
});

describe('Rate Limiter', () => {
  test('should allow requests within limit', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxAttempts: 5,
      blockDurationMs: 60000,
    });
    
    const result = limiter.check('test-user-1');
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(4);
  });

  test('should track multiple attempts', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxAttempts: 3,
      blockDurationMs: 60000,
    });
    
    const id = 'test-user-2';
    limiter.check(id); // 1st attempt - remaining: 2
    limiter.check(id); // 2nd attempt - remaining: 1
    const result = limiter.check(id); // 3rd attempt - remaining: 0
    
    expect(result.remaining).toBe(0);
    expect(result.limited).toBe(false);
  });

  test('should block after exceeding limit', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxAttempts: 2,
      blockDurationMs: 60000,
    });
    
    const id = 'test-user-3';
    limiter.check(id); // 1st
    limiter.check(id); // 2nd
    const result = limiter.check(id); // 3rd - should be blocked
    
    expect(result.limited).toBe(true);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  test('should reset limit for identifier', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxAttempts: 2,
      blockDurationMs: 60000,
    });
    
    const id = 'test-user-4';
    limiter.check(id);
    limiter.check(id);
    limiter.reset(id);
    
    const result = limiter.check(id);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(1);
  });

  test('should return status without incrementing', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxAttempts: 5,
      blockDurationMs: 60000,
    });
    
    const id = 'test-user-5';
    limiter.check(id); // remaining: 4
    
    const status = limiter.status(id);
    expect(status.remaining).toBe(4);
    
    // Status call shouldn't change remaining
    const status2 = limiter.status(id);
    expect(status2.remaining).toBe(4);
  });
});

describe('CSRF Protection', () => {
  test('should generate random CSRF token', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
  });

  test('should generate signed CSRF token with expiry', () => {
    const signedToken = generateSignedCsrfToken();
    const parts = signedToken.split(':');
    
    expect(parts.length).toBe(3);
    expect(parts[0].length).toBe(64); // token
    expect(parseInt(parts[1], 10)).toBeGreaterThan(Date.now()); // expiry in future
    expect(parts[2].length).toBe(64); // signature
  });

  test('should verify valid signed token', () => {
    const signedToken = generateSignedCsrfToken();
    expect(verifyCsrfToken(signedToken)).toBe(true);
  });

  test('should reject invalid token', () => {
    expect(verifyCsrfToken('invalid-token')).toBe(false);
    expect(verifyCsrfToken(null)).toBe(false);
    expect(verifyCsrfToken('')).toBe(false);
  });

  test('should reject tampered token', () => {
    const signedToken = generateSignedCsrfToken();
    const parts = signedToken.split(':');
    const tamperedToken = `tampered${parts[0].slice(8)}:${parts[1]}:${parts[2]}`;
    
    expect(verifyCsrfToken(tamperedToken)).toBe(false);
  });

  test('should reject expired token', () => {
    // Create a token with expired timestamp
    const token = generateCsrfToken();
    const expiredTime = Date.now() - 1000; // 1 second ago
    const expiredToken = `${token}:${expiredTime}:somesignature`;
    
    expect(verifyCsrfToken(expiredToken)).toBe(false);
  });
});

describe('Session Manager', () => {
  const testUserId = 999;
  const testUserAgent = 'Test Browser';
  const testIpAddress = '127.0.0.1';

  test('should create a new session', async () => {
    const session = await createSession(testUserId, testUserAgent, testIpAddress);
    
    expect(session).toBeDefined();
    expect(session.sessionId).toBeDefined();
    expect(session.userId).toBe(testUserId);
    expect(session.tokenFamily).toBeDefined();
    expect(session.isValid).toBe(true);
    expect(session.refreshTokenVersion).toBe(1);
  });

  test('should retrieve existing session', async () => {
    const created = await createSession(testUserId + 1, testUserAgent, testIpAddress);
    const retrieved = await getSession(created.sessionId);
    
    expect(retrieved).toBeDefined();
    expect(retrieved.sessionId).toBe(created.sessionId);
    expect(retrieved.userId).toBe(testUserId + 1);
  });

  test('should invalidate a session', async () => {
    const session = await createSession(testUserId + 2, testUserAgent, testIpAddress);
    await invalidateSession(session.sessionId);
    
    const retrieved = await getSession(session.sessionId);
    expect(retrieved.isValid).toBe(false);
  });

  test('should rotate refresh token', async () => {
    const session = await createSession(testUserId + 3, testUserAgent, testIpAddress);
    const originalVersion = session.refreshTokenVersion;
    
    const rotated = await rotateRefreshToken(session.sessionId);
    
    expect(rotated).toBeDefined();
    expect(rotated.refreshTokenVersion).toBe(originalVersion + 1);
  });

  test('should validate correct token version', async () => {
    const session = await createSession(testUserId + 4, testUserAgent, testIpAddress);
    
    const result = await validateRefreshTokenVersion(session.sessionId, session.refreshTokenVersion);
    
    expect(result.valid).toBe(true);
    expect(result.session).toBeDefined();
  });

  test('should reject incorrect token version', async () => {
    const session = await createSession(testUserId + 5, testUserAgent, testIpAddress);
    
    const result = await validateRefreshTokenVersion(session.sessionId, session.refreshTokenVersion + 1);
    
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Token reuse detected');
  });

  test('should invalidate all user sessions', async () => {
    const userId = testUserId + 10;
    const session1 = await createSession(userId, testUserAgent, testIpAddress);
    const session2 = await createSession(userId, testUserAgent, testIpAddress);
    
    await invalidateAllUserSessions(userId);
    
    const retrieved1 = await getSession(session1.sessionId);
    const retrieved2 = await getSession(session2.sessionId);
    
    expect(retrieved1.isValid).toBe(false);
    expect(retrieved2.isValid).toBe(false);
  });

  test('should invalidate all sessions except current', async () => {
    const userId = testUserId + 20;
    const session1 = await createSession(userId, testUserAgent, testIpAddress);
    const session2 = await createSession(userId, testUserAgent, testIpAddress);
    
    await invalidateAllUserSessions(userId, session1.sessionId);
    
    const retrieved1 = await getSession(session1.sessionId);
    const retrieved2 = await getSession(session2.sessionId);
    
    expect(retrieved1.isValid).toBe(true);
    expect(retrieved2.isValid).toBe(false);
  });
});

describe('Role-Based Access Control', () => {
  test('student role should have correct flags', () => {
    const user = {
      u_id: 1,
      email: 'student@test.com',
      name: 'Student',
      role: 'student',
    };
    const { accessToken } = generateTokens(user);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload.role).toBe('student');
    expect(payload.isStudent).toBe(true);
    expect(payload.isInstructor).toBe(false);
    expect(payload.isAdmin).toBe(false);
  });

  test('instructor role should have correct flags', () => {
    const user = {
      u_id: 2,
      email: 'instructor@test.com',
      name: 'Instructor',
      role: 'instructor',
    };
    const { accessToken } = generateTokens(user);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload.role).toBe('instructor');
    expect(payload.isStudent).toBe(false);
    expect(payload.isInstructor).toBe(true);
    expect(payload.isAdmin).toBe(false);
  });

  test('admin role should have correct flags', () => {
    const user = {
      u_id: 3,
      email: 'admin@test.com',
      name: 'Admin',
      role: 'admin',
    };
    const { accessToken } = generateTokens(user);
    const payload = verifyAccessToken(accessToken);
    
    expect(payload.role).toBe('admin');
    expect(payload.isStudent).toBe(false);
    expect(payload.isInstructor).toBe(false);
    expect(payload.isAdmin).toBe(true);
  });
});
