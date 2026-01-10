/**
 * Generic Login API Endpoint (Legacy/Backward Compatibility)
 * POST /api/login
 * 
 * This endpoint maintains backward compatibility and handles login for all user types.
 * For new implementations, use:
 * - POST /api/auth/user/login - for students
 * - POST /api/auth/instructor/login - for instructors
 * - POST /api/auth/admin/login - for admins
 */

import oracledb from 'oracledb';
import pool from '../../middleware/connectdb';
import { verifyPassword } from '../../lib/auth/password';
import { generateTokens } from '../../lib/auth/jwt';
import { setAuthCookies } from '../../lib/auth/cookies';
import { loginSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  // Validate input
  const validation = validateRequest(loginSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: validation.errors 
    });
  }

  const { email, password } = validation.data;
  let connection;

  try {
    connection = await pool.acquire();
    
    // Get user by email with role using new schema
    const result = await connection.execute(
      `SELECT U."u_id", U."name", U."email", U."password", U."role", U."reg_date",
              S."s_id", I."i_id", A."a_id"
       FROM EDUX."Users" U
       LEFT JOIN EDUX."Students" S ON U."u_id" = S."s_id"
       LEFT JOIN EDUX."Instructors" I ON U."u_id" = I."i_id"
       LEFT JOIN EDUX."Admins" A ON U."u_id" = A."a_id"
       WHERE LOWER(U."email") = LOWER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Check if user exists
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Verify password - support both bcrypt hashed and plaintext (for sample data)
    let isPasswordValid = false;
    const storedPassword = user.password;
    
    // Check if password is bcrypt hashed (starts with $2a$ or $2b$)
    if (storedPassword && storedPassword.startsWith('$2')) {
      isPasswordValid = await verifyPassword(password, storedPassword);
    } else {
      // Plaintext comparison for sample data
      isPasswordValid = password === storedPassword;
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Determine user role from the role field in Users table
    const role = user.role || 'student'; // Default to student for legacy data
    const isStudent = role === 'student' || !!user.s_id;
    const isInstructor = role === 'instructor' || !!user.i_id;
    const isAdmin = role === 'admin' || !!user.a_id;

    // Generate JWT tokens
    const userData = {
      u_id: user.u_id,
      email: user.email,
      name: user.name,
      role,
      isStudent,
      isInstructor,
      isAdmin,
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
        role,
        isStudent,
        isInstructor,
        isAdmin,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login. Please try again.' 
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
