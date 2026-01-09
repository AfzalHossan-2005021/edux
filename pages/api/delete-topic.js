/**
 * Delete Topic API
 * POST - Delete a topic (CASCADE deletes lectures and exams)
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id } = req.body;

  if (!t_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Topic ID is required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Delete topic (CASCADE will handle lectures and exams)
    const result = await connection.execute(
      `DELETE FROM EDUX."Topics" WHERE "t_id" = :t_id`,
      { t_id },
      { autoCommit: true }
    );

    pool.release(connection);

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
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
      message: 'Failed to delete topic',
      error: error.message 
    });
  }
}
