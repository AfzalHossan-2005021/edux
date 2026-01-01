const oracledb = require('oracledb');
import pool from "../../middleware/connectdb";
import { hashPassword } from '../../lib/auth/password';
import { generateTokens } from '../../lib/auth/jwt';
import { setAuthCookies } from '../../lib/auth/cookies';
import { instructorSignupSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Validate input
    const validation = validateRequest(instructorSignupSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: validation.errors 
        });
    }

    const { name, email, password, subject } = validation.data;
    let connection;

    try {
        connection = await pool.acquire();

        // Check if email already exists
        const existingUser = await connection.execute(
            `SELECT "u_id" FROM EDUX."Users" WHERE "email" = :email`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existingUser.rows && existingUser.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create instructor with hashed password
        const result = await connection.execute(
            `BEGIN
                :u_id := CREATE_INSTRUCTOR(:name, :email, :password, :subject);
                commit;
            END;`,
            {
                name: name,
                email: email,
                password: hashedPassword,
                subject: subject,
                u_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const u_id = result.outBinds.u_id;

        // Generate JWT tokens
        const userData = {
            u_id: u_id,
            email: email,
            name: name,
            isStudent: false,
            isInstructor: true,
        };

        const { accessToken, refreshToken } = generateTokens(userData);

        // Set secure HTTP-only cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Return success response
        return res.status(201).json({ 
            success: true, 
            message: 'Instructor account created successfully',
            user: {
                u_id: u_id,
                name: name,
                email: email,
                isStudent: false,
                isInstructor: true,
            },
            accessToken,
        });

    } catch (error) {
        console.error('Instructor signup error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred during registration' 
        });
    } finally {
        if (connection) {
            pool.release(connection);
        }
    }
}