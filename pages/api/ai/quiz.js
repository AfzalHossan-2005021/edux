// AI Quiz Generation API

import { verifyAuth } from '../../../middleware/auth';
import quiz from '../../../lib/ai/quiz';
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    // Verify user is authenticated
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, topicId, lectureId, topic, difficulty, count, question, userAnswer, correctAnswer } = req.body;

    // Get database connection from pool
    connection = await pool.acquire();

    let result;

    switch (action) {
      case 'generate': {
        // Generate quiz questions for a topic
        if (!topic) {
          pool.release(connection);
          return res.status(400).json({ error: 'Topic is required' });
        }

        result = await quiz.generateQuizQuestions(topic, {
          difficulty: difficulty || 'medium',
          count: count || 5,
        });
        break;
      }

      case 'practice': {
        // Generate practice questions for a topic from database
        if (!topicId) {
          pool.release(connection);
          return res.status(400).json({ error: 'Topic ID is required' });
        }

        // Get topic details
        const topicResult = await connection.execute(
          `SELECT t."name", c."title"
           FROM EDUX."Topics" t
           JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
           WHERE t."t_id" = :topicId`,
          { topicId }
        );

        if (!topicResult.rows || topicResult.rows.length === 0) {
          pool.release(connection);
          return res.status(404).json({ error: 'Topic not found' });
        }

        const topicData = {
          name: topicResult.rows[0][0],
          courseName: topicResult.rows[0][1],
        };

        result = await quiz.generatePracticeQuestions(topicData, {
          difficulty: difficulty || 'medium',
          count: count || 5,
        });
        break;
      }

      case 'lecture': {
        // Generate quiz from lecture content
        if (!lectureId) {
          pool.release(connection);
          return res.status(400).json({ error: 'Lecture ID is required' });
        }

        // Get lecture details
        const lectureResult = await connection.execute(
          `SELECT l."description", t."name", c."title"
           FROM EDUX."Lectures" l
           JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
           JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
           WHERE l."l_id" = :lectureId`,
          { lectureId }
        );

        if (!lectureResult.rows || lectureResult.rows.length === 0) {
          pool.release(connection);
          return res.status(404).json({ error: 'Lecture not found' });
        }

        const lectureData = {
          name: lectureResult.rows[0][0],
          topicName: lectureResult.rows[0][1],
          courseName: lectureResult.rows[0][2],
        };

        result = await quiz.generateLectureQuiz(lectureData, count || 3);
        break;
      }

      case 'grade': {
        // Grade a user's answer
        if (!question || userAnswer === undefined) {
          pool.release(connection);
          return res.status(400).json({ error: 'Question and user answer are required' });
        }

        result = await quiz.gradeAnswer(question, userAnswer, correctAnswer);
        break;
      }

      default:
        pool.release(connection);
        return res.status(400).json({ error: 'Invalid action' });
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Quiz API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Quiz operation failed' });
  }
}
