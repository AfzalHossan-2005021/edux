/**
 * Update Lecture API
 * POST - Update an existing lecture
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { l_id, title, description, video, duration } = req.body;

  if (!l_id || !title || !description || !video || !duration) {
    return res.status(400).json({ 
      success: false,
      message: 'Lecture ID, title, description, video URL, and duration are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `UPDATE EDUX."Lectures" 
       SET "title" = :title,
           "description" = :description,
           "video" = :video,
           "duration" = :duration
       WHERE "l_id" = :l_id`,
      {
        l_id,
        title,
        description,
        video,
        duration
      },
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
      message: 'Lecture updated successfully'
    });
  } catch (error) {
    console.error('Error updating lecture:', error);
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
      message: 'Failed to update lecture',
      error: error.message 
    });
  }
}
