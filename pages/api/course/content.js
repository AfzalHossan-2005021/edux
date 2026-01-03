/**
 * Course Content Module API
 * Comprehensive API for managing exams, questions, and assessments
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    return handleGet(req, res);
  } else if (method === 'POST') {
    return handlePost(req, res);
  } else if (method === 'PUT') {
    return handlePut(req, res);
  } else if (method === 'DELETE') {
    return handleDelete(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  const { type, c_id, t_id, e_id } = req.query;

  let connection;
  try {
    connection = await pool.acquire();

    if (type === 'exams' && t_id) {
      // Get exams for a topic
      const examsResult = await connection.execute(
        `SELECT e."e_id", e."question_count", e."marks", e."duration", e."weight",
                COUNT(q."q_id") as actual_questions
         FROM EDUX."Exams" e
         LEFT JOIN EDUX."Questions" q ON e."e_id" = q."e_id"
         WHERE e."t_id" = :t_id
         GROUP BY e."e_id", e."question_count", e."marks", e."duration", e."weight"`,
        { t_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      pool.release(connection);
      return res.status(200).json({
        exams: examsResult.rows || [],
        success: true
      });
    }

    if (type === 'exam' && e_id) {
      // Get exam details with questions
      const examResult = await connection.execute(
        `SELECT e."e_id", e."question_count", e."marks", e."duration", e."weight",
                t."t_id", t."name" as topic_name
         FROM EDUX."Exams" e
         JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
         WHERE e."e_id" = :e_id`,
        { e_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!examResult.rows || examResult.rows.length === 0) {
        pool.release(connection);
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Get questions for exam
      const questionsResult = await connection.execute(
        `SELECT q."q_id", q."q_description", q."option_a", q."option_b", q."option_c", q."option_d",
                q."right_ans", q."marks", q."serial"
         FROM EDUX."Questions" q
         WHERE q."e_id" = :e_id
         ORDER BY q."serial"`,
        { e_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const exam = examResult.rows[0];
      exam.questions = questionsResult.rows || [];

      pool.release(connection);
      return res.status(200).json({
        exam,
        success: true
      });
    }

    // Get all content modules for course
    if (c_id) {
      const contentResult = await connection.execute(
        `SELECT 
          t."t_id", t."name" as topic_name,
          e."e_id", e."marks", e."duration", e."question_count",
          COUNT(q."q_id") as actual_questions
         FROM EDUX."Topics" t
         LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
         LEFT JOIN EDUX."Questions" q ON e."e_id" = q."e_id"
         WHERE t."c_id" = :c_id
         GROUP BY t."t_id", t."name", e."e_id", e."marks", e."duration", e."question_count"
         ORDER BY t."t_id", e."e_id"`,
        { c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      pool.release(connection);
      return res.status(200).json({
        content: contentResult.rows || [],
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid query parameters' });

  } catch (error) {
    console.error('Get content error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to fetch content', details: error.message });
  }
}

async function handlePost(req, res) {
  const { action, data, c_id, t_id, e_id } = req.body;

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'create_exam' && t_id) {
      const { question_count, marks, duration, weight } = data;

      if (!question_count || !marks) {
        pool.release(connection);
        return res.status(400).json({ error: 'Question count and marks are required' });
      }

      const result = await connection.execute(
        `INSERT INTO EDUX."Exams" ("t_id", "question_count", "marks", "duration", "weight")
         VALUES (:t_id, :question_count, :marks, :duration, :weight)
         RETURNING "e_id" INTO :e_id`,
        {
          t_id,
          question_count,
          marks,
          duration: duration || 60,
          weight: weight || 1,
          e_id: new oracledb.OutParam(oracledb.NUMBER)
        },
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(201).json({
        message: 'Exam created successfully',
        examId: result.outBinds.e_id,
        success: true
      });
    }

    if (action === 'add_question' && e_id) {
      const { question, options, correctAnswer, marks, serial } = data;

      if (!question || !Array.isArray(options) || options.length !== 4 || !correctAnswer) {
        pool.release(connection);
        return res.status(400).json({ error: 'Invalid question data' });
      }

      const result = await connection.execute(
        `INSERT INTO EDUX."Questions" ("e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial")
         VALUES (:e_id, :question, :opt1, :opt2, :opt3, :opt4, :correctAnswer, :marks, :serial)
         RETURNING "q_id" INTO :q_id`,
        {
          e_id,
          question,
          opt1: options[0],
          opt2: options[1],
          opt3: options[2],
          opt4: options[3],
          correctAnswer,
          marks: marks || 1,
          serial: serial || 1,
          q_id: new oracledb.OutParam(oracledb.NUMBER)
        },
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(201).json({
        message: 'Question added successfully',
        questionId: result.outBinds.q_id,
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Post content error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to create content', details: error.message });
  }
}

async function handlePut(req, res) {
  const { action, data, q_id, e_id } = req.body;

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'update_question' && q_id) {
      const { question, options, correctAnswer, marks } = data;

      const updateFields = [];
      const bindParams = { q_id };

      if (question !== undefined) {
        updateFields.push(`"q_description" = :question`);
        bindParams.question = question;
      }
      if (options && Array.isArray(options) && options.length === 4) {
        updateFields.push(`"option_a" = :opt1, "option_b" = :opt2, "option_c" = :opt3, "option_d" = :opt4`);
        bindParams.opt1 = options[0];
        bindParams.opt2 = options[1];
        bindParams.opt3 = options[2];
        bindParams.opt4 = options[3];
      }
      if (correctAnswer !== undefined) {
        updateFields.push(`"right_ans" = :correctAnswer`);
        bindParams.correctAnswer = correctAnswer;
      }
      if (marks !== undefined) {
        updateFields.push(`"marks" = :marks`);
        bindParams.marks = marks;
      }

      if (updateFields.length === 0) {
        pool.release(connection);
        return res.status(400).json({ error: 'No fields to update' });
      }

      await connection.execute(
        `UPDATE EDUX."Questions" SET ${updateFields.join(', ')} WHERE "q_id" = :q_id`,
        bindParams,
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Question updated successfully',
        success: true
      });
    }

    if (action === 'update_exam' && e_id) {
      const { marks, duration, weight } = data;

      const updateFields = [];
      const bindParams = { e_id };

      if (marks !== undefined) {
        updateFields.push(`"marks" = :marks`);
        bindParams.marks = marks;
      }
      if (duration !== undefined) {
        updateFields.push(`"duration" = :duration`);
        bindParams.duration = duration;
      }
      if (weight !== undefined) {
        updateFields.push(`"weight" = :weight`);
        bindParams.weight = weight;
      }

      if (updateFields.length === 0) {
        pool.release(connection);
        return res.status(400).json({ error: 'No fields to update' });
      }

      await connection.execute(
        `UPDATE EDUX."Exams" SET ${updateFields.join(', ')} WHERE "e_id" = :e_id`,
        bindParams,
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Exam updated successfully',
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Put content error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to update content', details: error.message });
  }
}

async function handleDelete(req, res) {
  const { type, e_id, q_id } = req.body;

  let connection;
  try {
    connection = await pool.acquire();

    if (type === 'question' && q_id) {
      await connection.execute(
        `DELETE FROM EDUX."Questions" WHERE "q_id" = :q_id`,
        { q_id },
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Question deleted successfully',
        success: true
      });
    }

    if (type === 'exam' && e_id) {
      // Delete all questions in exam first
      await connection.execute(
        `DELETE FROM EDUX."Questions" WHERE "e_id" = :e_id`,
        { e_id }
      );

      // Delete exam results
      await connection.execute(
        `DELETE FROM EDUX."Takes" WHERE "e_id" = :e_id`,
        { e_id }
      );

      // Delete exam
      await connection.execute(
        `DELETE FROM EDUX."Exams" WHERE "e_id" = :e_id`,
        { e_id },
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Exam deleted successfully',
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid delete request' });

  } catch (error) {
    console.error('Delete content error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to delete content', details: error.message });
  }
}
