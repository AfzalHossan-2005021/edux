/**
 * Update Topic API
 * POST - Update an existing topic
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id, name, description, serial, weight } = req.body;

  if (!t_id || !name) {
    return res.status(400).json({ 
      success: false,
      message: 'Topic ID and name are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `UPDATE EDUX."Topics" 
       SET "name" = :name,
           "serial" = NVL(:serial, "serial"),
           "weight" = NVL(:weight, "weight")
       WHERE "t_id" = :t_id`,
      {
        t_id,
        name,
        serial: serial || null,
        weight: weight || null
      },
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
      message: 'Topic updated successfully'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
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
      message: 'Failed to update topic',
      error: error.message 
    });
  }
}
