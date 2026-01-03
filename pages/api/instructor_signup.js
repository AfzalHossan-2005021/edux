/**
 * Instructor Signup API Endpoint (Legacy/Backward Compatibility)
 * POST /api/instructor_signup
 * 
 * This endpoint maintains backward compatibility.
 * For new implementations, use: POST /api/auth/instructor/signup
 */

import oracledb from 'oracledb';
import pool from "../../middleware/connectdb";
import { hashPassword } from '../../lib/auth/password';
import { generateTokens } from '../../lib/auth/jwt';
import { setAuthCookies } from '../../lib/auth/cookies';
import { instructorSignupSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ 
            success: false, 
            message: `Method ${req.method} not allowed` 
        });
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
            `SELECT "u_id" FROM EDUX."Users" WHERE LOWER("email") = LOWER(:email)`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (existingUser.rows && existingUser.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'An account with this email already exists' 
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create instructor with hashed password
        const result = await connection.execute(
            `BEGIN
                :u_id := EDUX.CREATE_INSTRUCTOR(:name, :email, :password, :subject);
            END;`,
            {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                subject,
                u_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const u_id = result.outBinds.u_id;

        if (!u_id || u_id < 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create instructor account',
            });
        }

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
                subject,
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
            message: 'An error occurred during registration. Please try again.' 
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