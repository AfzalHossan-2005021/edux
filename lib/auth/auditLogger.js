/**
 * Audit Logger for Authentication Events
 * 
 * Logs security-relevant events for monitoring and compliance.
 */

import { executeQuery } from "@/middleware/connectdb";

/**
 * Audit event types
 */
export const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILURE: 'TOKEN_REFRESH_FAILURE',
  
  // Account events
  SIGNUP: 'SIGNUP',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  EMAIL_CHANGE: 'EMAIL_CHANGE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  
  // Session events
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_INVALIDATED: 'SESSION_INVALIDATED',
  ALL_SESSIONS_INVALIDATED: 'ALL_SESSIONS_INVALIDATED',
  
  // Security events
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CSRF_VALIDATION_FAILURE: 'CSRF_VALIDATION_FAILURE',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // Admin events
  ADMIN_USER_CREATE: 'ADMIN_USER_CREATE',
  ADMIN_USER_UPDATE: 'ADMIN_USER_UPDATE',
  ADMIN_USER_DELETE: 'ADMIN_USER_DELETE',
  ADMIN_ROLE_CHANGE: 'ADMIN_ROLE_CHANGE',
};

/**
 * Log severity levels
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
};

// In-memory log buffer for batch writing
const logBuffer = [];
const MAX_BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 30000; // 30 seconds

// Auto-flush buffer periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    flushLogBuffer();
  }, FLUSH_INTERVAL);
}

/**
 * Get client IP from request
 */
function getClientIp(req) {
  if (!req) return 'unknown';
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Get user agent from request
 */
function getUserAgent(req) {
  if (!req) return 'unknown';
  return req.headers?.['user-agent']?.substring(0, 500) || 'unknown';
}

/**
 * Create an audit log entry
 */
export async function logAuditEvent({
  eventType,
  userId = null,
  email = null,
  level = LogLevel.INFO,
  message = '',
  metadata = {},
  req = null,
}) {
  const logEntry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    eventType,
    level,
    userId,
    email,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    message,
    metadata: JSON.stringify(metadata),
  };
  
  // Add to buffer
  logBuffer.push(logEntry);
  
  // Console log for development
  if (process.env.NODE_ENV !== 'production') {
    const color = getLogColor(level);
    console.log(`${color}[AUDIT ${level}] ${eventType}: ${message}`, {
      userId,
      email,
      ip: logEntry.ipAddress,
    }, '\x1b[0m');
  }
  
  // Flush if buffer is full
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    await flushLogBuffer();
  }
  
  // For critical events, write immediately
  if (level === LogLevel.CRITICAL || level === LogLevel.ERROR) {
    await writeLogToDb(logEntry);
  }
  
  return logEntry;
}

/**
 * Generate a unique log ID
 */
function generateLogId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get console color for log level
 */
function getLogColor(level) {
  const colors = {
    DEBUG: '\x1b[90m',    // Gray
    INFO: '\x1b[36m',     // Cyan
    WARN: '\x1b[33m',     // Yellow
    ERROR: '\x1b[31m',    // Red
    CRITICAL: '\x1b[35m', // Magenta
  };
  return colors[level] || '\x1b[0m';
}

/**
 * Write a single log entry to database
 */
async function writeLogToDb(entry) {
  try {
    await executeQuery(`
      INSERT INTO EDUX."Audit_Logs" (
        "log_id", "timestamp", "event_type", "level", "u_id", "email",
        "ip_address", "user_agent", "message", "metadata"
      ) VALUES (
        :logId, :logTimestamp, :eventType, :logLevel, :userId, :email,
        :ipAddress, :userAgent, :logMessage, :metadata
      )
    `, {
      logId: entry.id,
      logTimestamp: new Date(entry.timestamp),
      eventType: entry.eventType,
      logLevel: entry.level,
      userId: entry.userId,
      email: entry.email,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      logMessage: entry.message?.substring(0, 1000) || '',
      metadata: entry.metadata?.substring(0, 4000) || '{}',
    });
  } catch (error) {
    // If DB not available, just log to console
    console.error('Failed to write audit log to DB:', error.message);
  }
}

/**
 * Flush the log buffer to database
 */
async function flushLogBuffer() {
  if (logBuffer.length === 0) return;
  
  const entries = logBuffer.splice(0, logBuffer.length);
  
  for (const entry of entries) {
    await writeLogToDb(entry);
  }
}

/**
 * Convenience functions for common events
 */
export const audit = {
  loginSuccess: (userId, email, req) =>
    logAuditEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId,
      email,
      level: LogLevel.INFO,
      message: `User logged in successfully`,
      req,
    }),
  
  loginFailure: (email, reason, req) =>
    logAuditEvent({
      eventType: AuditEventType.LOGIN_FAILURE,
      email,
      level: LogLevel.WARN,
      message: `Login failed: ${reason}`,
      metadata: { reason },
      req,
    }),
  
  logout: (userId, email, req) =>
    logAuditEvent({
      eventType: AuditEventType.LOGOUT,
      userId,
      email,
      level: LogLevel.INFO,
      message: `User logged out`,
      req,
    }),
  
  signup: (userId, email, role, req) =>
    logAuditEvent({
      eventType: AuditEventType.SIGNUP,
      userId,
      email,
      level: LogLevel.INFO,
      message: `New ${role} account created`,
      metadata: { role },
      req,
    }),
  
  passwordChange: (userId, email, req) =>
    logAuditEvent({
      eventType: AuditEventType.PASSWORD_CHANGE,
      userId,
      email,
      level: LogLevel.INFO,
      message: `Password changed`,
      req,
    }),
  
  tokenRefresh: (userId, req) =>
    logAuditEvent({
      eventType: AuditEventType.TOKEN_REFRESH,
      userId,
      level: LogLevel.DEBUG,
      message: `Token refreshed`,
      req,
    }),
  
  tokenRefreshFailure: (reason, req) =>
    logAuditEvent({
      eventType: AuditEventType.TOKEN_REFRESH_FAILURE,
      level: LogLevel.WARN,
      message: `Token refresh failed: ${reason}`,
      metadata: { reason },
      req,
    }),
  
  rateLimitExceeded: (identifier, endpoint, req) =>
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
      level: LogLevel.WARN,
      message: `Rate limit exceeded for ${endpoint}`,
      metadata: { identifier, endpoint },
      req,
    }),
  
  csrfFailure: (req) =>
    logAuditEvent({
      eventType: AuditEventType.CSRF_VALIDATION_FAILURE,
      level: LogLevel.WARN,
      message: `CSRF validation failed`,
      req,
    }),
  
  tokenReuseDetected: (userId, sessionId, req) =>
    logAuditEvent({
      eventType: AuditEventType.TOKEN_REUSE_DETECTED,
      userId,
      level: LogLevel.CRITICAL,
      message: `Refresh token reuse detected - potential security breach`,
      metadata: { sessionId },
      req,
    }),
  
  unauthorizedAccess: (userId, path, requiredRole, req) =>
    logAuditEvent({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId,
      level: LogLevel.WARN,
      message: `Unauthorized access attempt to ${path}`,
      metadata: { path, requiredRole },
      req,
    }),
  
  allSessionsInvalidated: (userId, email, reason, req) =>
    logAuditEvent({
      eventType: AuditEventType.ALL_SESSIONS_INVALIDATED,
      userId,
      email,
      level: LogLevel.INFO,
      message: `All sessions invalidated: ${reason}`,
      metadata: { reason },
      req,
    }),
};

/**
 * Query audit logs (for admin dashboard)
 */
export async function queryAuditLogs({
  userId = null,
  email = null,
  eventTypes = null,
  level = null,
  startDate = null,
  endDate = null,
  limit = 100,
  offset = 0,
}) {
  try {
    let sql = `
      SELECT "log_id", "timestamp", "event_type", "level", "u_id", "email",
             "ip_address", "user_agent", "message", "metadata"
      FROM EDUX."Audit_Logs"
      WHERE 1=1
    `;
    const params = {};
    
    if (userId) {
      sql += ` AND "u_id" = :userId`;
      params.userId = userId;
    }
    
    if (email) {
      sql += ` AND LOWER("email") = LOWER(:email)`;
      params.email = email;
    }
    
    if (eventTypes && eventTypes.length > 0) {
      sql += ` AND "event_type" IN (${eventTypes.map((_, i) => `:type${i}`).join(',')})`;
      eventTypes.forEach((type, i) => {
        params[`type${i}`] = type;
      });
    }
    
    if (level) {
      sql += ` AND "level" = :level`;
      params.level = level;
    }
    
    if (startDate) {
      sql += ` AND "timestamp" >= :startDate`;
      params.startDate = new Date(startDate);
    }
    
    if (endDate) {
      sql += ` AND "timestamp" <= :endDate`;
      params.endDate = new Date(endDate);
    }
    
    sql += ` ORDER BY "timestamp" DESC`;
    sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    params.offset = offset;
    params.limit = limit;
    
    const result = await executeQuery(sql, params);
    
    return result.rows?.map(row => ({
      id: row.LOG_ID,
      timestamp: row.TIMESTAMP,
      eventType: row.EVENT_TYPE,
      level: row.LEVEL,
      userId: row.U_ID,
      email: row.EMAIL,
      ipAddress: row.IP_ADDRESS,
      userAgent: row.USER_AGENT,
      message: row.MESSAGE,
      metadata: JSON.parse(row.METADATA || '{}'),
    })) || [];
  } catch (error) {
    console.error('Failed to query audit logs:', error.message);
    return [];
  }
}

export default {
  logAuditEvent,
  audit,
  queryAuditLogs,
  AuditEventType,
  LogLevel,
};
