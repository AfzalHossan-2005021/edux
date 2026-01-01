/**
 * Refresh token API endpoint
 * Issues new access token using refresh token
 */

import { verifyRefreshToken, generateTokens } from '../../lib/auth/jwt';
import { getTokensFromCookies, setAuthCookies } from '../../lib/auth/cookies';
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
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not found' 
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // Get current user data from database
    connection = await pool.acquire();
    
    const result = await connection.execute(
      `SELECT u.u_id, u.name, u.email, s.s_id, i.i_id
       FROM EDUX.USERS u
       LEFT JOIN EDUX.STUDENTS s ON u.u_id = s.s_id
       LEFT JOIN EDUX.INSTRUCTORS i ON u.u_id = i.i_id
       WHERE u.u_id = :u_id`,
      { u_id: decoded.u_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const userData = {
      u_id: user.U_ID,
      email: user.EMAIL,
      name: user.NAME,
      isStudent: user.S_ID ? true : false,
      isInstructor: user.I_ID ? true : false,
    };

    const newTokens = generateTokens(userData);

    // Set new cookies
    setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);

    return res.status(200).json({ 
      success: true, 
      message: 'Token refreshed successfully',
      accessToken: newTokens.accessToken,
      user: userData,
    });

  } catch (error) {
    console.error('Refresh token error:', error);
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
