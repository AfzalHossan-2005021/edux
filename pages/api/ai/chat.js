// AI Chatbot API
//
// When a courseId is supplied, 'chat' and 'answer' route through the RAG
// tutor: the answer is grounded in the course's indexed content and returns
// citations. Courses without an index fall back to the generic assistant.

import {verifyAuth} from '../../../middleware/auth';
import chatbot from '../../../lib/ai/chatbot';
import {answerQuestion} from '../../../lib/ai/rag';
import {executeQuery} from '../../../middleware/connectdb';

async function getCourseContext(courseId) {
  const result = await executeQuery(
      `SELECT "c_id", "title", "description", "field"
     FROM EDUX."Courses" WHERE "c_id" = :courseId`,
      {courseId},
  );
  const row = result.rows?.[0];
  if (!row) return null;
  return {
    id: row.c_id,
    title: row.title,
    description: row.description,
    category: row.field,
  };
}

/**
 * Grounded course Q&A with graceful fallback to the generic assistant when
 * the course has no retrieval index yet.
 */
async function groundedChat(courseId, message, conversationHistory, courseContext) {
  const result = await answerQuestion(courseId, message, {conversationHistory});

  if (result.status !== 'not_indexed') {
    return {
      success: true,
      message: result.answer,
      citations: result.citations,
      grounded: result.grounded ?? false,
      retrieval: result.retrieval,
      aiGenerated: true,
    };
  }

  const fallback = await chatbot.chat(message, {
    conversationHistory,
    currentCourse: courseContext,
  });
  return {...fallback, citations: [], grounded: false};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    // Verify user is authenticated
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({error: 'Unauthorized'});
    }

    const {action, message, concept, question, topic, courseId, conversationHistory = []} = req.body;

    const courseContext = courseId ? await getCourseContext(courseId) : null;

    let result;

    switch (action) {
      case 'chat': {
        if (!message) {
          return res.status(400).json({error: 'Message is required'});
        }

        if (courseContext) {
          result = await groundedChat(courseId, message, conversationHistory, courseContext);
        } else {
          result = await chatbot.chat(message, {
            conversationHistory,
            currentCourse: null,
          });
        }
        break;
      }

      case 'explain': {
        if (!concept) {
          return res.status(400).json({error: 'Concept is required'});
        }

        result = await chatbot.explainConcept(concept, {courseContext});
        break;
      }

      case 'answer': {
        if (!question) {
          return res.status(400).json({error: 'Question is required'});
        }

        if (courseContext) {
          result = await groundedChat(courseId, question, conversationHistory, courseContext);
        } else {
          result = await chatbot.answerQuestion(question, courseContext);
        }
        break;
      }

      case 'tips': {
        if (!topic) {
          return res.status(400).json({error: 'Topic is required'});
        }

        result = await chatbot.getStudyTips(topic);
        break;
      }

      case 'plan': {
        const coursesResult = await executeQuery(
            `SELECT c."c_id", c."title", e."progress"
           FROM EDUX."Enrolls" e
           JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
           WHERE e."s_id" = :userId`,
            {userId: user.id},
        );

        const courses = coursesResult.rows?.map((row) => ({
          id: row.c_id,
          title: row.title,
          progress: row.progress || 0,
        })) || [];

        result = await chatbot.generateStudyPlan(courses, req.body.preferences || {});
        break;
      }

      default:
        return res.status(400).json({error: 'Invalid action'});
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({error: 'Chatbot operation failed'});
  }
}
