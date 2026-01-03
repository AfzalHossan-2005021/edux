/**
 * Refresh token API endpoint
 * Issues new access token using refresh token with token rotation
 */

import { verifyRefreshToken, generateTokens } from '../../lib/auth/jwt';
import { getTokensFromCookies, setAuthCookies, clearAuthCookies } from '../../lib/auth/cookies';
import { validateRefreshTokenVersion, rotateRefreshToken } from '../../lib/auth/sessionManager';
import { audit } from '../../lib/auth/auditLogger';
import pool from '../../middleware/connectdb';
const oracledb = require('oracledb');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let connection;

  try {
    const { refreshToken } = getTokensFromCookies(req);

    if (!refreshToken) {
      await audit.tokenRefreshFailure('No refresh token', req);
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not found' 
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      await audit.tokenRefreshFailure('Invalid token', req);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // Validate token version for rotation (if session info is available)
    if (decoded.sessionId && decoded.tokenVersion) {
      const validation = await validateRefreshTokenVersion(decoded.sessionId, decoded.tokenVersion);
      
      if (!validation.valid) {
        // Potential token theft detected - clear cookies and return error
        await audit.tokenReuseDetected(decoded.u_id, decoded.sessionId, req);
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: 'Session invalidated for security reasons',
          reason: validation.reason,
        });
      }
    }

    // Get current user data from database
    connection = await pool.acquire();
    
    const result = await connection.execute(
      `SELECT u."u_id", u."name", u."email", u."role", s."s_id", i."i_id"
       FROM EDUX."Users" u
       LEFT JOIN EDUX."Students" s ON u."u_id" = s."s_id"
       LEFT JOIN EDUX."Instructors" i ON u."u_id" = i."i_id"
       WHERE u."u_id" = :u_id`,
      { u_id: decoded.u_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      await audit.tokenRefreshFailure('User not found', req);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    const role = user.role || (user.s_id ? 'student' : user.i_id ? 'instructor' : null);

    // Rotate refresh token if session exists
    let newTokenVersion = 1;
    if (decoded.sessionId) {
      const rotated = await rotateRefreshToken(decoded.sessionId);
      if (rotated) {
        newTokenVersion = rotated.refreshTokenVersion;
      }
    }

    // Generate new tokens with updated version
    const userData = {
      u_id: user.u_id,
      email: user.email,
      name: user.name,
      role: role,
      isStudent: !!user.s_id || role === 'student',
      isInstructor: !!user.i_id || role === 'instructor',
      isAdmin: role === 'admin',
      sessionId: decoded.sessionId,
      tokenVersion: newTokenVersion,
    };

    const newTokens = generateTokens(userData);

    // Set new cookies
    setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);

    // Log successful refresh
    await audit.tokenRefresh(user.u_id, req);

    return res.status(200).json({ 
      success: true, 
      message: 'Token refreshed successfully',
      accessToken: newTokens.accessToken,
      user: {
        u_id: userData.u_id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isStudent: userData.isStudent,
        isInstructor: userData.isInstructor,
        isAdmin: userData.isAdmin,
      },
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    await audit.tokenRefreshFailure(error.message, req);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during token refresh' 
    });
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}
