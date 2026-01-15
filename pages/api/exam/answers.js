/**
 * Exam Answers API
 * POST /api/exam/answers
 * 
 * Returns exam questions with correct answers for review
 * Only returns data if student has taken the exam
 */

const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { s_id, e_id } = req.body;

  // Validate required fields
  if (!s_id || !e_id) {
    return res.status(400).json({ message: 'Missing required fields: s_id and e_id' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // First check if student has taken this exam
    const takenResult = await connection.execute(
      `SELECT "marks", "status" 
       FROM EDUX."Takes" 
       WHERE "s_id" = :s_id AND "e_id" = :e_id`,
      { s_id, e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!takenResult.rows || takenResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'You must take this exam before viewing answers.',
        hasTaken: false 
      });
    }

    // Get exam info
    const examResult = await connection.execute(
      `SELECT e."e_id", e."marks" as "total_marks", e."duration", e."question_count",
              t."name" as "topic_name", c."title" as "course_title"
       FROM EDUX."Exams" e
       JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
       JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
       WHERE e."e_id" = :e_id`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Get questions with answers
    const questionsResult = await connection.execute(
      `SELECT q."q_id", q."q_description", q."serial",
              q."option_a", q."option_b", q."option_c", q."option_d",
              q."right_ans", q."marks"
       FROM EDUX."Questions" q
       WHERE q."e_id" = :e_id
       ORDER BY q."serial" ASC`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const examInfo = examResult.rows[0] || {};
    const studentResult = takenResult.rows[0];

    res.status(200).json({
      success: true,
      hasTaken: true,
      exam: {
        e_id: examInfo.e_id,
        totalMarks: examInfo.total_marks,
        duration: examInfo.duration,
        questionCount: examInfo.question_count,
        topicName: examInfo.topic_name,
        courseTitle: examInfo.course_title,
      },
      studentResult: {
        obtainedMarks: studentResult.marks,
        status: studentResult.status,
      },
      questions: questionsResult.rows || [],
    });
  } catch (error) {
    console.error('Exam answers error:', error.message);
    res.status(500).json({ message: 'An error occurred while fetching exam answers.' });
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}
