const oracledb = require('oracledb');
import pool from '../../middleware/connectdb';
import { verifyPassword } from '../../lib/auth/password';
import { generateTokens } from '../../lib/auth/jwt';
import { setAuthCookies } from '../../lib/auth/cookies';
import { loginSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
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
    
    // Get user by email using the CHECK_USER procedure
    const result = await connection.execute(
      `BEGIN
        CHECK_USER(:email, :out_cursor);
      END;`,
      {
        email: email,
        out_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const cursor = result.outBinds.out_cursor;
    const rows = await cursor.getRows();
    await cursor.close();

    // Check if user exists
    if (!rows || rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = rows[0];

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

    // Generate JWT tokens
    const userData = {
      u_id: user.u_id,
      email: user.email,
      name: user.name,
      isStudent: user.s_id ? true : false,
      isInstructor: user.i_id ? true : false,
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
        isStudent: user.s_id ? true : false,
        isInstructor: user.i_id ? true : false,
      },
      accessToken, // Also return token for client-side storage if needed
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login' 
    });
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}
