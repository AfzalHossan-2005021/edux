/**
 * User/Student Login API Endpoint
 * POST /api/auth/student/login
 * 
 * Authenticates student users with password verification
 * Includes rate limiting, audit logging, and session management
 */

import oracledb from 'oracledb';
import pool from '../../../../middleware/connectdb';
import { verifyPassword } from '../../../../lib/auth/password';
import { generateTokens } from '../../../../lib/auth/jwt';
import { setAuthCookies } from '../../../../lib/auth/cookies';
import { loginSchema, validateRequest } from '../../../../lib/validation/schemas';
import { loginRateLimiter, getClientIp } from '../../../../lib/auth/rateLimiter';
import { audit } from '../../../../lib/auth/auditLogger';
import { createSession } from '../../../../lib/auth/sessionManager';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  // Rate limiting check
  const clientIp = getClientIp(req);
  const email = req.body?.email?.toLowerCase() || '';
  const rateLimitKey = email || clientIp;
  
  const rateLimit = loginRateLimiter.check(rateLimitKey);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  
  if (rateLimit.limited) {
    res.setHeader('Retry-After', rateLimit.retryAfter);
    await audit.rateLimitExceeded(rateLimitKey, '/api/auth/student/login', req);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter / 60)} minutes.`,
      retryAfter: rateLimit.retryAfter,
    });
  }

  // Validate request body
  const validation = validateRequest(loginSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors,
    });
  }

  const { password } = validation.data;
  let connection;

  try {
    connection = await pool.acquire();

    // Get user by email - only students (check role field)
    const result = await connection.execute(
      `SELECT U."u_id", U."name", U."email", U."password", U."role", U."reg_date", 
              S."s_id", S."date_of_birth", S."gender", S."interests"
       FROM EDUX."Users" U
       INNER JOIN EDUX."Students" S ON U."u_id" = S."s_id"
       WHERE LOWER(U."email") = LOWER(:email) AND U."role" = 'student'`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Check if user exists and is a student
    if (!result.rows || result.rows.length === 0) {
      await audit.loginFailure(email, 'User not found', req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password - support both bcrypt and plaintext for legacy data
    let isPasswordValid = false;
    const storedPassword = user.password;

    if (storedPassword && storedPassword.startsWith('$2')) {
      // Bcrypt hashed password
      isPasswordValid = await verifyPassword(password, storedPassword);
    } else {
      // Plaintext comparison for legacy/sample data
      isPasswordValid = password === storedPassword;
    }

    if (!isPasswordValid) {
      await audit.loginFailure(email, 'Invalid password', req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Reset rate limiter on successful login
    loginRateLimiter.reset(rateLimitKey);

    // Create session for token rotation support
    const userAgent = req.headers['user-agent'];
    const session = await createSession(user.u_id, userAgent, clientIp);

    // Generate JWT tokens with session info
    const userData = {
      u_id: user.u_id,
      email: user.email,
      name: user.name,
      role: 'student',
      isStudent: true,
      isInstructor: false,
      isAdmin: false,
      sessionId: session.sessionId,
      tokenVersion: session.refreshTokenVersion,
    };

    const { accessToken, refreshToken } = generateTokens(userData);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Log successful login
    await audit.loginSuccess(user.u_id, user.email, req);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        u_id: user.u_id,
        name: user.name,
        email: user.email,
        role: 'student',
        isStudent: true,
        isInstructor: false,
        isAdmin: false,
        dob: user.date_of_birth,
        gender: user.gender,
        field: user.field,
      },
      accessToken,
    });

  } catch (error) {
    console.error('User login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        pool.release(connection);
      } catch (releaseError) {
        console.error('Connection release error:', releaseError);
      }
    }
  }
}
