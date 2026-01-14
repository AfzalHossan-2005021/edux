/**
 * Add Exam API
 * POST - Create a new exam for a topic
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id, duration, pass_pct } = req.body;

  if (!t_id || !duration || !pass_pct) {
    return res.status(400).json({ 
      success: false,
      message: 'Topic ID, duration, and pass percentage are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get next e_id
    const idResult = await connection.execute(
      `SELECT NVL(MAX("e_id"), 0) + 1 as next_id FROM EDUX."Exams"`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = idResult.rows[0]?.NEXT_ID || 1;

    // Insert new exam
    await connection.execute(
      `INSERT INTO EDUX."Exams" ("e_id", "t_id", "duration", "pass_pct")
       VALUES (:e_id, :t_id, :duration, :pass_pct)`,
      {
        e_id: nextId,
        t_id,
        duration: parseInt(duration),
        pass_pct: parseInt(pass_pct),
      },
      { autoCommit: true }
    );

    pool.release(connection);

    return res.status(201).json({
      success: true,
      message: 'Exam added successfully',
      e_id: nextId
    });
  } catch (error) {
    console.error('Error adding exam:', error);
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
      message: 'Failed to add exam',
      error: error.message 
    });
  }
}
