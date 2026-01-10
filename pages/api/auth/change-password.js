/**
 * Password Change API Endpoint
 * POST /api/auth/change-password
 * 
 * Changes user password and optionally invalidates all other sessions
 */

import oracledb from 'oracledb';
import pool from '../../../middleware/connectdb';
import { withAuth } from '../../../middleware/authMiddleware';
import { verifyPassword, hashPassword } from '../../../lib/auth/password';
import { invalidateAllUserSessions } from '../../../lib/auth/sessionManager';
import { audit } from '../../../lib/auth/auditLogger';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  const { currentPassword, newPassword, invalidateOtherSessions = true } = req.body;
  const user = req.user;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters long',
    });
  }

  let connection;

  try {
    connection = await pool.acquire();

    // Get current password hash
    const result = await connection.execute(
      `SELECT "password" FROM EDUX."Users" WHERE "u_id" = :u_id`,
      { u_id: user.u_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const storedPassword = result.rows[0].password;

    // Verify current password
    let isPasswordValid = false;
    if (storedPassword && storedPassword.startsWith('$2')) {
      isPasswordValid = await verifyPassword(currentPassword, storedPassword);
    } else {
      // Plaintext comparison for legacy data
      isPasswordValid = currentPassword === storedPassword;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await connection.execute(
      `UPDATE EDUX."Users" SET "password" = :password WHERE "u_id" = :u_id`,
      { password: hashedPassword, u_id: user.u_id },
      { autoCommit: true }
    );

    // Invalidate all other sessions for security
    if (invalidateOtherSessions) {
      await invalidateAllUserSessions(user.u_id, user.sessionId);
    }

    // Log the password change
    await audit.passwordChange(user.u_id, user.email, req);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      sessionsInvalidated: invalidateOtherSessions,
    });

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while changing password',
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

export default withAuth(handler);
