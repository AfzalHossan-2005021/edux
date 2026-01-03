/**
 * Course Overview API
 * Provides comprehensive course information including structure, progress, and analytics
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { c_id, s_id } = req.body;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get course basic info
    const courseResult = await connection.execute(
      `SELECT c."c_id", c."title", c."description", c."field", c."seat", 
              c."student_count", c."rating", c."approve_status",
              i."i_id", u."name" as instructor_name, u."email" as instructor_email
       FROM EDUX."Courses" c
       JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
       JOIN EDUX."Users" u ON i."i_id" = u."u_id"
       WHERE c."c_id" = :c_id`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!courseResult.rows || courseResult.rows.length === 0) {
      pool.release(connection);
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Get topics with lecture count
    const topicsResult = await connection.execute(
      `SELECT t."t_id", t."name", t."serial", t."weight",
              COUNT(l."l_id") as lecture_count,
              COUNT(e."e_id") as exam_count
       FROM EDUX."Topics" t
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
       WHERE t."c_id" = :c_id
       GROUP BY t."t_id", t."name", t."serial", t."weight"
       ORDER BY t."serial"`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const topics = topicsResult.rows || [];

    // Get student progress if student ID provided
    let studentProgress = null;
    if (s_id) {
      const progressResult = await connection.execute(
        `SELECT e."progress", e."approve_status", e."date", e."end_date", e."grade"
         FROM EDUX."Enrolls" e
         WHERE e."s_id" = :s_id AND e."c_id" = :c_id`,
        { s_id, c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      studentProgress = progressResult.rows ? progressResult.rows[0] : null;

      // Get completed lectures count
      if (studentProgress) {
        const completedResult = await connection.execute(
          `SELECT COUNT(DISTINCT lp."l_id") as completed_lectures
           FROM EDUX."LectureProgress" lp
           WHERE lp."s_id" = :s_id AND lp."completed" = 'Y'`,
          { s_id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (completedResult.rows && completedResult.rows[0]) {
          studentProgress.completed_lectures = completedResult.rows[0].completed_lectures;
        }
      }
    }

    // Get course statistics
    const statsResult = await connection.execute(
      `SELECT 
        COUNT(DISTINCT t."t_id") as topic_count,
        COUNT(DISTINCT l."l_id") as lecture_count,
        COUNT(DISTINCT e."e_id") as exam_count,
        COUNT(DISTINCT q."q_id") as question_count
       FROM EDUX."Topics" t
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
       LEFT JOIN EDUX."Questions" q ON e."e_id" = q."e_id"
       WHERE t."c_id" = :c_id`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const stats = statsResult.rows ? statsResult.rows[0] : {};

    pool.release(connection);

    res.status(200).json({
      course,
      topics,
      statistics: stats,
      studentProgress,
      success: true
    });

  } catch (error) {
    console.error('Course overview error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to fetch course overview', details: error.message });
  }
}
