/**
 * Update Exam API
 * POST - Update an existing exam
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { e_id, duration, pass_pct } = req.body;

  if (e_id == null || duration == null || pass_pct == null) {
    return res.status(400).json({ 
      success: false,
      message: 'Exam ID, duration, and pass percentage are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `UPDATE EDUX."Exams" 
       SET "duration" = :duration,
           "pass_pct" = :pass_pct
       WHERE "e_id" = :e_id`,
      {
        e_id,
        duration: parseInt(duration),
        pass_pct: parseInt(pass_pct)
      },
      { autoCommit: true }
    );

    pool.release(connection);

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Exam updated successfully'
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    if (connection) {
      try {
        await connection.rollback();
        pool.release(connection);
      } catch (e) {
        console.error('Rollback error:', e);
      }
    }
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update exam',
      error: error.message 
    });
  }
}
