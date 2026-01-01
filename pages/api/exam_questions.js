const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"
import get_exam_question_query from "@/db/get_exam_question_query";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    const { e_id } = req.body;
    
    // Validate required fields
    if (!e_id) {
        return res.status(400).json({ message: 'Missing required field: e_id' });
    }

    let connection;
    try {
        connection = await pool.acquire();
        const result = await connection.execute(
            get_exam_question_query(e_id),
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Return empty array if no questions found
        res.status(200).json(result.rows || []);
    } catch (error) {
        console.error('Exam questions error:', error.message);
        res.status(500).json({ message: 'An error occurred while fetching exam questions.' });
    } finally {
        if (connection) {
            pool.release(connection);
        }
    }
}