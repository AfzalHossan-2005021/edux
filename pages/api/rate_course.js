const oracledb = require('oracledb');
import pool from "../../middleware/connectdb";
import { rateCourseSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Validate input
    const validation = validateRequest(rateCourseSchema, req.body);
    if (!validation.success) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: validation.errors 
        });
    }

    const { u_id, c_id, rating, review } = validation.data;
    let connection;

    try {
        connection = await pool.acquire();
        await connection.execute(
            `INSERT INTO EDUX."Feedbacks"("s_id", "c_id", "rating", "review", "date") VALUES (:u_id, :c_id, :rating, :review, SYSDATE)`,
            {
                u_id: u_id,
                c_id: c_id,
                rating: rating,
                review: review || null
            },
            { autoCommit: true }
        );
        res.status(200).json({ success: true, message: 'Rating submitted successfully.'});
    } catch (error) {
        console.error('Rate course error:', error);
        res.status(500).json({ success: false, message: 'An error occurred.' });
    } finally {
        if (connection) pool.release(connection);
    }
}