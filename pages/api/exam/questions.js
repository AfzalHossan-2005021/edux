/**
 * Exam Questions API
 * GET questions for a specific exam
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { e_id } = req.query;

  if (!e_id) {
    return res.status(400).json({ error: 'Exam ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get exam details
    const examResult = await connection.execute(
      `SELECT e."e_id", e."marks", e."duration", e."question_count", e."weight", e."t_id"
       FROM EDUX."Exams" e
       WHERE e."e_id" = :e_id`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!examResult.rows || examResult.rows.length === 0) {
      pool.release(connection);
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    const exam = examResult.rows[0];

    // Get questions for this exam
    const result = await connection.execute(
      `SELECT q."q_id", q."q_description", 
              q."option_a", q."option_b", q."option_c", q."option_d",
              q."right_ans", q."marks", q."serial", q."e_id"
       FROM EDUX."Questions" q
       WHERE q."e_id" = :e_id
       ORDER BY q."serial"`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    pool.release(connection);

    return res.status(200).json({
      success: true,
      exam,
      questions: result.rows || []
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch questions' 
    });
  }
}
