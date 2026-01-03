/**
 * Session Management with Token Rotation and Invalidation
 * 
 * Provides session tracking, refresh token rotation, and
 * the ability to invalidate all sessions.
 */

import crypto from 'crypto';
import { executeQuery } from '@/middleware/connectdb';

// In-memory session store (use Redis in production)
const sessionStore = new Map();

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a token family ID for refresh token rotation
 */
export function generateTokenFamily() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId, userAgent, ipAddress) {
  const sessionId = generateSessionId();
  const tokenFamily = generateTokenFamily();
  const createdAt = Date.now();
  const expiresAt = createdAt + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const session = {
    sessionId,
    userId,
    tokenFamily,
    userAgent,
    ipAddress,
    createdAt,
    expiresAt,
    lastUsedAt: createdAt,
    isValid: true,
    refreshTokenVersion: 1,
  };
  
  // Store in memory (for demo - use DB in production)
  sessionStore.set(sessionId, session);
  
  // Also try to store in database if available
  try {
    await executeQuery(`
      INSERT INTO EDUX."User_Sessions" (
        "session_id", "u_id", "token_family", "user_agent", "ip_address",
        "created_at", "expires_at", "last_used_at", "is_valid", "refresh_token_version"
      ) VALUES (
        :sessionId, :userId, :tokenFamily, :userAgent, :ipAddress,
        :createdAt, :expiresAt, :lastUsedAt, :isValid, :refreshTokenVersion
      )
    `, {
      sessionId,
      userId,
      tokenFamily,
      userAgent: userAgent?.substring(0, 500) || 'unknown',
      ipAddress: ipAddress || 'unknown',
      createdAt: new Date(createdAt),
      expiresAt: new Date(expiresAt),
      lastUsedAt: new Date(createdAt),
      isValid: 1,
      refreshTokenVersion: 1,
    });
  } catch (error) {
    // Table might not exist yet - continue with in-memory only
    console.log('Session DB not available, using in-memory store');
  }
  
  return session;
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId) {
  // Check memory first
  if (sessionStore.has(sessionId)) {
    return sessionStore.get(sessionId);
  }
  
  // Try database
  try {
    const result = await executeQuery(`
      SELECT "session_id", "u_id", "token_family", "user_agent", "ip_address",
             "created_at", "expires_at", "last_used_at", "is_valid", "refresh_token_version"
      FROM EDUX."User_Sessions"
      WHERE "session_id" = :sessionId
    `, { sessionId });
    
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return {
        sessionId: row.SESSION_ID,
        userId: row.U_ID,
        tokenFamily: row.TOKEN_FAMILY,
        userAgent: row.USER_AGENT,
        ipAddress: row.IP_ADDRESS,
        createdAt: new Date(row.CREATED_AT).getTime(),
        expiresAt: new Date(row.EXPIRES_AT).getTime(),
        lastUsedAt: new Date(row.LAST_USED_AT).getTime(),
        isValid: row.IS_VALID === 1,
        refreshTokenVersion: row.REFRESH_TOKEN_VERSION,
      };
    }
  } catch (error) {
    // DB not available
  }
  
  return null;
}

/**
 * Update session's last used time and rotate refresh token
 */
export async function rotateRefreshToken(sessionId) {
  const session = await getSession(sessionId);
  
  if (!session || !session.isValid) {
    return null;
  }
  
  // Check if session is expired
  if (Date.now() > session.expiresAt) {
    await invalidateSession(sessionId);
    return null;
  }
  
  // Increment refresh token version (rotation)
  session.refreshTokenVersion += 1;
  session.lastUsedAt = Date.now();
  
  // Update in memory
  sessionStore.set(sessionId, session);
  
  // Update in database
  try {
    await executeQuery(`
      UPDATE EDUX."User_Sessions"
      SET "refresh_token_version" = :version,
          "last_used_at" = :lastUsedAt
      WHERE "session_id" = :sessionId
    `, {
      version: session.refreshTokenVersion,
      lastUsedAt: new Date(session.lastUsedAt),
      sessionId,
    });
  } catch (error) {
    // DB not available
  }
  
  return session;
}

/**
 * Validate refresh token version
 * If version doesn't match, the token was likely stolen and reused
 */
export async function validateRefreshTokenVersion(sessionId, version) {
  const session = await getSession(sessionId);
  
  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }
  
  if (!session.isValid) {
    return { valid: false, reason: 'Session invalidated' };
  }
  
  if (Date.now() > session.expiresAt) {
    await invalidateSession(sessionId);
    return { valid: false, reason: 'Session expired' };
  }
  
  if (session.refreshTokenVersion !== version) {
    // Token reuse detected! Invalidate all sessions for this user
    console.warn(`Refresh token reuse detected for user ${session.userId}. Invalidating all sessions.`);
    await invalidateAllUserSessions(session.userId);
    return { valid: false, reason: 'Token reuse detected - all sessions invalidated' };
  }
  
  return { valid: true, session };
}

/**
 * Invalidate a single session
 */
export async function invalidateSession(sessionId) {
  // Update memory
  const session = sessionStore.get(sessionId);
  if (session) {
    session.isValid = false;
    sessionStore.set(sessionId, session);
  }
  
  // Update database
  try {
    await executeQuery(`
      UPDATE EDUX."User_Sessions"
      SET "is_valid" = 0
      WHERE "session_id" = :sessionId
    `, { sessionId });
  } catch (error) {
    // DB not available
  }
}

/**
 * Invalidate all sessions for a user
 * Used when password is changed or security concern
 */
export async function invalidateAllUserSessions(userId, exceptSessionId = null) {
  // Update memory
  for (const [id, session] of sessionStore.entries()) {
    if (session.userId === userId && id !== exceptSessionId) {
      session.isValid = false;
      sessionStore.set(id, session);
    }
  }
  
  // Update database
  try {
    if (exceptSessionId) {
      await executeQuery(`
        UPDATE EDUX."User_Sessions"
        SET "is_valid" = 0
        WHERE "u_id" = :userId AND "session_id" != :exceptSessionId
      `, { userId, exceptSessionId });
    } else {
      await executeQuery(`
        UPDATE EDUX."User_Sessions"
        SET "is_valid" = 0
        WHERE "u_id" = :userId
      `, { userId });
    }
  } catch (error) {
    // DB not available
  }
  
  return true;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId) {
  const sessions = [];
  
  // Check memory
  for (const session of sessionStore.values()) {
    if (session.userId === userId && session.isValid && Date.now() < session.expiresAt) {
      sessions.push({
        sessionId: session.sessionId,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
      });
    }
  }
  
  // If we have memory results, return them
  if (sessions.length > 0) {
    return sessions;
  }
  
  // Try database
  try {
    const result = await executeQuery(`
      SELECT "session_id", "user_agent", "ip_address", "created_at", "last_used_at"
      FROM EDUX."User_Sessions"
      WHERE "u_id" = :userId
        AND "is_valid" = 1
        AND "expires_at" > :now
      ORDER BY "last_used_at" DESC
    `, {
      userId,
      now: new Date(),
    });
    
    if (result.rows) {
      return result.rows.map(row => ({
        sessionId: row.SESSION_ID,
        userAgent: row.USER_AGENT,
        ipAddress: row.IP_ADDRESS,
        createdAt: new Date(row.CREATED_AT).getTime(),
        lastUsedAt: new Date(row.LAST_USED_AT).getTime(),
      }));
    }
  } catch (error) {
    // DB not available
  }
  
  return sessions;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const now = Date.now();
  
  // Clean memory
  for (const [id, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(id);
    }
  }
  
  // Clean database
  try {
    await executeQuery(`
      DELETE FROM EDUX."User_Sessions"
      WHERE "expires_at" < :now
    `, { now: new Date() });
  } catch (error) {
    // DB not available
  }
}

export default {
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
};
