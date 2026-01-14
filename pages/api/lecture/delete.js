/**
 * Delete Lecture API
 * POST - Delete a lecture
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { l_id } = req.body;

  if (!l_id) {
    return res.status(400).json({ 
      success: false,
      message: 'Lecture ID is required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `DELETE FROM EDUX."Lectures" WHERE "l_id" = :l_id`,
      { l_id },
      { autoCommit: true }
    );

    pool.release(connection);

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lecture:', error);
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
      message: 'Failed to delete lecture',
      error: error.message 
    });
  }
}
