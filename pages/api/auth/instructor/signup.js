/**
 * Instructor Signup API Endpoint
 * POST /api/auth/instructor/signup
 * 
 * Creates a new instructor account with secure password hashing
 */

import oracledb from 'oracledb';
import pool from '../../../../middleware/connectdb';
import { hashPassword } from '../../../../lib/auth/password';
import { generateTokens } from '../../../../lib/auth/jwt';
import { setAuthCookies } from '../../../../lib/auth/cookies';
import { instructorSignupSchema, validateRequest } from '../../../../lib/validation/schemas';

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
  const validation = validateRequest(instructorSignupSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors,
    });
  }

  const { name, email, password, subject, expertise, qualification, bio } = validation.data;
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

    // Create user in Users table with role = 'instructor'
    const userResult = await connection.execute(
      `INSERT INTO EDUX."Users" ("name", "email", "password", "role") 
       VALUES (:name, :email, :password, 'instructor') 
       RETURNING "u_id" INTO :u_id`,
      {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        u_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const u_id = userResult.outBinds.u_id[0];

    if (!u_id) {
      await connection.execute('ROLLBACK');
      return res.status(500).json({
        success: false,
        message: 'Failed to create instructor account',
      });
    }

    // Create instructor record in Instructors table
    await connection.execute(
      `INSERT INTO EDUX."Instructors" ("i_id", "expertise", "qualification", "bio") 
       VALUES (:i_id, :expertise, :qualification, :bio)`,
      {
        i_id: u_id,
        expertise: expertise || subject || null,
        qualification: qualification || null,
        bio: bio || null,
      }
    );

    await connection.execute('COMMIT');

    // Generate JWT tokens
    const userData = {
      u_id,
      email: email.toLowerCase(),
      name,
      role: 'instructor',
      isStudent: false,
      isInstructor: true,
      isAdmin: false,
    };

    const { accessToken, refreshToken } = generateTokens(userData);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Instructor account created successfully',
      user: {
        u_id,
        name,
        email: email.toLowerCase(),
        expertise: expertise || subject,
        qualification,
        bio,
        role: 'instructor',
        isStudent: false,
        isInstructor: true,
        isAdmin: false,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Instructor signup error:', error);
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
