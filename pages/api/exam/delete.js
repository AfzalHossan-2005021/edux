/**
 * Delete Exam API
 * POST - Delete an exam (CASCADE deletes questions)
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { e_id } = req.body;

  if (!e_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Exam ID is required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Delete exam (CASCADE will handle questions)
    const result = await connection.execute(
      `DELETE
       FROM EDUX."Exams"
       WHERE "e_id" = :e_id`,
      { e_id },
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
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
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
      message: 'Failed to delete exam',
      error: error.message 
    });
  }
}
