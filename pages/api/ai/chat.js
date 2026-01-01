// AI Chatbot API

import { verifyAuth } from '../../../middleware/auth';
import chatbot from '../../../lib/ai/chatbot';
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

    const { action, message, concept, question, topic, courseId, conversationHistory = [] } = req.body;

    // Get database connection from pool
    connection = await pool.acquire();

    let courseContext = null;
    if (courseId) {
      const courseResult = await connection.execute(
        `SELECT "c_id", "title", "description", "field"
         FROM EDUX."Courses" WHERE "c_id" = :courseId`,
        { courseId }
      );
      
      if (courseResult.rows.length > 0) {
        courseContext = {
          id: courseResult.rows[0][0],
          title: courseResult.rows[0][1],
          description: courseResult.rows[0][2],
          category: courseResult.rows[0][3],
        };
      }
    }

    let result;

    switch (action) {
      case 'chat': {
        // General chat with the AI assistant
        if (!message) {
          pool.release(connection);
          return res.status(400).json({ error: 'Message is required' });
        }

        result = await chatbot.chat(message, {
          conversationHistory,
          currentCourse: courseContext,
        });
        break;
      }

      case 'explain': {
        // Explain a concept
        if (!concept) {
          pool.release(connection);
          return res.status(400).json({ error: 'Concept is required' });
        }

        result = await chatbot.explainConcept(concept, {
          courseContext,
        });
        break;
      }

      case 'answer': {
        // Answer a question
        if (!question) {
          pool.release(connection);
          return res.status(400).json({ error: 'Question is required' });
        }

        result = await chatbot.answerQuestion(question, courseContext);
        break;
      }

      case 'tips': {
        // Get study tips
        if (!topic) {
          pool.release(connection);
          return res.status(400).json({ error: 'Topic is required' });
        }

        result = await chatbot.getStudyTips(topic);
        break;
      }

      case 'plan': {
        // Generate study plan
        const coursesResult = await connection.execute(
          `SELECT c."c_id", c."title", e."progress"
           FROM EDUX."Enrolls" e
           JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
           WHERE e."s_id" = :userId`,
          { userId: user.id }
        );

        const courses = coursesResult.rows?.map(row => ({
          id: row[0],
          title: row[1],
          progress: row[2] || 0,
        })) || [];

        result = await chatbot.generateStudyPlan(courses, req.body.preferences || {});
        break;
      }

      default:
        pool.release(connection);
        return res.status(400).json({ error: 'Invalid action' });
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Chatbot API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Chatbot operation failed' });
  }
}
