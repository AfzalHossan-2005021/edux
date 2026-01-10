/**
 * Add Question API
 * POST - Create a new question for an exam
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { e_id, q_description, option_a, option_b, option_c, option_d, right_ans, marks } = req.body;

  if (!e_id || !q_description || !right_ans || !marks) {
    return res.status(400).json({ 
      success: false,
      message: 'Exam ID, question description, correct answer, and marks are required' 
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

    // Get next serial number for this exam
    const serialResult = await connection.execute(
      `SELECT NVL(MAX("serial"), 0) + 1 as next_serial 
       FROM EDUX."Questions" 
       WHERE "e_id" = :e_id`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextSerial = serialResult.rows[0]?.NEXT_SERIAL || 1;

    // Insert new question
    const result = await connection.execute(
      `INSERT INTO EDUX."Questions" ("e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial")
       VALUES (:e_id, :q_description, :option_a, :option_b, :option_c, :option_d, :right_ans, :marks, :serial)
       RETURNING "q_id" INTO :q_id`,
      {
        e_id,
        q_description,
        option_a: option_a || null,
        option_b: option_b || null,
        option_c: option_c || null,
        option_d: option_d || null,
        right_ans: String(right_ans),
        marks: parseInt(marks),
        serial: nextSerial,
        q_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    pool.release(connection);

    return res.status(201).json({
      success: true,
      message: 'Question added successfully',
      q_id: result.outBinds.q_id[0]
    });
  } catch (error) {
    console.error('Error adding question:', error);
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
      message: 'Failed to add question',
      error: error.message 
    });
  }
}
