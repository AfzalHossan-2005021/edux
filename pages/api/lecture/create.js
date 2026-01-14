/**
 * Add Lecture API
 * POST - Create a new lecture for a topic
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id, title, description, video, duration } = req.body;

  if (!t_id || !title || !description || !video || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Topic ID, title, description, video URL, and duration are required'
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get next l_id
    const idResult = await connection.execute(
      `SELECT NVL(MAX("l_id"), 0) + 1 as next_id FROM EDUX."Lectures"`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = idResult.rows[0]?.NEXT_ID || 1;

    // Get next serial
    const serialResult = await connection.execute(
      `SELECT NVL(MAX("serial"), 0) + 1 as next_serial 
         FROM EDUX."Lectures" 
         WHERE "t_id" = :t_id`,
      { t_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const lectureSerial = serialResult.rows[0]?.NEXT_SERIAL || 1;

    // Insert new lecture
    await connection.execute(
      `INSERT INTO EDUX."Lectures" ("l_id", "t_id", "title", "description", "video", "serial", "duration")
       VALUES (:l_id, :t_id, :title, :description, :video, :serial, :duration)`,
      {
        l_id: nextId,
        t_id,
        title,
        description,
        video,
        serial: lectureSerial,
        duration
      },
      { autoCommit: true }
    );

    pool.release(connection);

    return res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      l_id: nextId
    });
  } catch (error) {
    console.error('Error adding lecture:', error);
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
      message: 'Failed to add lecture',
      error: error.message
    });
  }
}
