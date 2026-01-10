/**
 * Admin Login API Endpoint
 * POST /api/auth/admin/login
 * 
 * Authenticates admin users with password verification
 */

import oracledb from 'oracledb';
import pool from '../../../../middleware/connectdb';
import { verifyPassword } from '../../../../lib/auth/password';
import { generateTokens } from '../../../../lib/auth/jwt';
import { setAuthCookies } from '../../../../lib/auth/cookies';
import { loginSchema, validateRequest } from '../../../../lib/validation/schemas';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
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

  const { email, password } = validation.data;
  let connection;

  try {
    connection = await pool.acquire();

    // Get admin user by email (check role field and Admins table)
    const result = await connection.execute(
      `SELECT u."u_id", u."name", u."email", u."password", u."role", u."reg_date",
              a."a_id", a."admin_level", a."department"
       FROM EDUX."Users" u
       INNER JOIN EDUX."Admins" a ON u."u_id" = a."a_id"
       WHERE LOWER(u."email") = LOWER(:email) AND u."role" = 'admin'`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Check if admin user exists
    if (!result.rows || result.rows.length === 0) {
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
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT tokens with admin role
    const userData = {
      u_id: user.u_id,
      email: user.email,
      name: user.name,
      role: 'admin',
      isStudent: false,
      isInstructor: false,
      isAdmin: true,
    };

    const { accessToken, refreshToken } = generateTokens(userData);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        u_id: user.u_id,
        name: user.name,
        email: user.email,
        role: 'admin',
        isStudent: false,
        isInstructor: false,
        isAdmin: true,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Admin login error:', error);
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
