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

  const { e_id, marks, duration, question_count, weight } = req.body;

  if (!e_id || !marks || !duration || !question_count) {
    return res.status(400).json({ 
      success: false,
      message: 'Exam ID, marks, duration, and question count are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `UPDATE EDUX."Exams" 
       SET "marks" = :marks,
           "duration" = :duration,
           "question_count" = :question_count,
           "weight" = NVL(:weight, "weight")
       WHERE "e_id" = :e_id`,
      {
        e_id,
        marks: parseInt(marks),
        duration: parseInt(duration),
        question_count: parseInt(question_count),
        weight: weight || null
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
