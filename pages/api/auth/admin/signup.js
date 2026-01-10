/**
 * Admin Signup API Endpoint
 * POST /api/auth/admin/signup
 * 
 * Creates a new admin account with secure password hashing
 * Requires a valid admin code for authorization
 */

import oracledb from 'oracledb';
import pool from '../../../../middleware/connectdb';
import { hashPassword } from '../../../../lib/auth/password';
import { generateTokens } from '../../../../lib/auth/jwt';
import { setAuthCookies } from '../../../../lib/auth/cookies';
import { adminSignupSchema, validateRequest } from '../../../../lib/validation/schemas';

// Admin secret code - should be stored in environment variables in production
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'EDUX_ADMIN_2024';

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
  const validation = validateRequest(adminSignupSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors,
    });
  }

  const { name, email, password, adminCode, adminLevel, department } = validation.data;

  // Verify admin code
  if (adminCode !== ADMIN_SECRET_CODE) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin authorization code',
    });
  }

  let connection;

  try {
    connection = await pool.acquire();

    // Check if email already exists
    const existingUser = await connection.execute(
      `SELECT "u_id" FROM EDUX."Users" WHERE LOWER("email") = LOWER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existingUser.rows && existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password);

    // Create admin user in Users table with role = 'admin'
    const result = await connection.execute(
      `INSERT INTO EDUX."Users" ("name", "email", "password", "role") 
       VALUES (:name, :email, :password, 'admin') 
       RETURNING "u_id" INTO :u_id`,
      {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        u_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const u_id = result.outBinds.u_id[0];

    if (!u_id) {
      await connection.execute('ROLLBACK');
      return res.status(500).json({
        success: false,
        message: 'Failed to create admin account',
      });
    }

    // Create admin record in Admins table
    await connection.execute(
      `INSERT INTO EDUX."Admins" ("a_id", "admin_level", "department") 
       VALUES (:a_id, :admin_level, :department)`,
      { 
        a_id: u_id,
        admin_level: adminLevel || 'standard',
        department: department || null,
      }
    );

    await connection.execute('COMMIT');

    // Generate JWT tokens with admin role
    const userData = {
      u_id,
      email: email.toLowerCase(),
      name,
      role: 'admin',
      isStudent: false,
      isInstructor: false,
      isAdmin: true,
    };

    const { accessToken, refreshToken } = generateTokens(userData);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        u_id,
        name,
        email: email.toLowerCase(),
        role: 'admin',
        isStudent: false,
        isInstructor: false,
        isAdmin: true,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    
    // Rollback on error
    if (connection) {
      try {
        await connection.execute('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
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
