/**
 * Course Structure API
 * Manages complete course hierarchy and organization
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    return handleGet(req, res);
  } else if (method === 'POST') {
    return handlePost(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  const { c_id } = req.query;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get course structure with all levels
    const structureResult = await connection.execute(
      `SELECT 
        c."c_id", c."title", c."description", c."field", c."seat", c."approve_status",
        t."t_id", t."name", t."description", t."weight", t."serial",
        l."l_id", l."description" as lecture_description, l."video", l."serial" as lecture_serial, l."weight" as lecture_weight,
        e."e_id", e."marks", e."duration", e."question_count", e."serial" as exam_serial
       FROM EDUX."Courses" c
       LEFT JOIN EDUX."Topics" t ON c."c_id" = t."c_id"
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
       WHERE c."c_id" = :c_id
       ORDER BY t."serial", l."serial", e."e_id"`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!structureResult.rows || structureResult.rows.length === 0) {
      pool.release(connection);
      return res.status(404).json({ error: 'Course not found' });
    }

    // Build hierarchical structure
    const course = {
      c_id: structureResult.rows[0].c_id,
      title: structureResult.rows[0].title,
      description: structureResult.rows[0].description,
      field: structureResult.rows[0].field,
      seat: structureResult.rows[0].seat,
      approve_status: structureResult.rows[0].approve_status,
      topics: []
    };

    const topicsMap = new Map();

    for (const row of structureResult.rows) {
      if (!row.t_id) continue;

      if (!topicsMap.has(row.t_id)) {
        topicsMap.set(row.t_id, {
          t_id: row.t_id,
          name: row.topic_name,
          serial: row.topic_serial,
          lectures: [],
          exams: []
        });
      }

      const topic = topicsMap.get(row.t_id);

      if (row.l_id && !topic.lectures.find(l => l.l_id === row.l_id)) {
        topic.lectures.push({
          l_id: row.l_id,
          description: row.lecture_description,
          video: row.video,
          serial: row.lecture_serial,
          weight: row.lecture_weight
        });
      }

      if (row.e_id && !topic.exams.find(e => e.e_id === row.e_id)) {
        topic.exams.push({
          e_id: row.e_id,
          marks: row.marks,
          duration: row.duration,
          question_count: row.question_count,
          serial: row.exam_serial
        });
      }
    }

    course.topics = Array.from(topicsMap.values()).sort((a, b) => a.serial - b.serial);

    // Add content statistics
    const stats = {
      total_topics: course.topics.length,
      total_lectures: course.topics.reduce((sum, t) => sum + t.lectures.length, 0),
      total_exams: course.topics.reduce((sum, t) => sum + t.exams.length, 0),
      total_questions: 0
    };

    // Get total questions
    const questionsResult = await connection.execute(
      `SELECT COUNT(DISTINCT q."q_id") as total_questions
       FROM EDUX."Questions" q
       JOIN EDUX."Exams" e ON q."e_id" = e."e_id"
       JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
       WHERE t."c_id" = :c_id`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (questionsResult.rows && questionsResult.rows[0]) {
      stats.total_questions = questionsResult.rows[0].total_questions;
    }

    pool.release(connection);

    res.status(200).json({
      course,
      statistics: stats,
      success: true
    });

  } catch (error) {
    console.error('Get structure error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to fetch course structure', details: error.message });
  }
}

async function handlePost(req, res) {
  const { c_id, action, data } = req.body;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'reorder_topics') {
      // Reorder topics by serial number
      const { topics } = data;

      if (!Array.isArray(topics)) {
        pool.release(connection);
        return res.status(400).json({ error: 'Topics array is required' });
      }

      for (const topic of topics) {
        await connection.execute(
          `UPDATE EDUX."Topics" SET "serial" = :serial WHERE "t_id" = :t_id`,
          { serial: topic.serial, t_id: topic.t_id },
          { autoCommit: true }
        );
      }

      pool.release(connection);
      return res.status(200).json({
        message: 'Topics reordered successfully',
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Post structure error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to update course structure', details: error.message });
  }
}
