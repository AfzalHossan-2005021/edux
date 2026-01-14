/**
 * Update Question API
 * POST - Update an existing question
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q_id, q_description, option_a, option_b, option_c, option_d, right_ans, marks } = req.body;

  if (!q_id || !q_description || !right_ans || !marks) {
    return res.status(400).json({ 
      success: false,
      message: 'Question ID, description, correct answer, and marks are required' 
    });
  }

  // Validate right_ans is 1-4
  if (!['1', '2', '3', '4'].includes(String(right_ans))) {
    return res.status(400).json({ 
      success: false,
      message: 'Correct answer must be 1, 2, 3, or 4' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `UPDATE EDUX."Questions" 
       SET "q_description" = :q_description,
           "option_a" = :option_a,
           "option_b" = :option_b,
           "option_c" = :option_c,
           "option_d" = :option_d,
           "right_ans" = :right_ans,
           "marks" = :marks
       WHERE "q_id" = :q_id`,
      {
        q_id,
        q_description,
        option_a: option_a || null,
        option_b: option_b || null,
        option_c: option_c || null,
        option_d: option_d || null,
        right_ans: String(right_ans),
        marks: parseInt(marks)
      },
      { autoCommit: true }
    );

    pool.release(connection);

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Error updating question:', error);
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
      message: 'Failed to update question',
      error: error.message 
    });
  }
}
