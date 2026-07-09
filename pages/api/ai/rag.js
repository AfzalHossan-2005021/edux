// RAG Tutor API - grounded course Q&A and index management
//
// POST { action: 'ask' | 'status' | 'ingest' | 'transcript', ... }
//   ask        (any authenticated user)  { courseId, question, conversationHistory? }
//   status     (any authenticated user)  { courseId }
//   ingest     (owning instructor)       { courseId }
//   transcript (owning instructor)       { lectureId, content } - saves lecture
//              grounding text and re-indexes the course (cheap: unchanged
//              chunks reuse their stored embeddings)

import {verifyAuth} from '../../../middleware/auth';
import {executeQuery} from '../../../middleware/connectdb';
import {
  answerQuestion,
  ingestCourse,
  getIndexStatus,
  saveTranscript,
} from '../../../lib/ai/rag';

async function instructorOwnsCourse(userId, courseId) {
  const result = await executeQuery(
      `SELECT 1 FROM EDUX."Courses" WHERE "c_id" = :courseId AND "i_id" = :userId`,
      {courseId, userId},
  );
  return (result.rows || []).length > 0;
}

async function getCourseIdForLecture(lectureId) {
  const result = await executeQuery(
      `SELECT t."c_id" FROM EDUX."Lectures" l
     JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
     WHERE l."l_id" = :lectureId`,
      {lectureId},
  );
  return result.rows?.[0]?.c_id ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({error: 'Unauthorized'});
    }

    const {action, courseId, question, conversationHistory = [], lectureId, content, debug} = req.body;

    switch (action) {
      case 'ask': {
        if (!courseId || !question?.trim()) {
          return res.status(400).json({error: 'courseId and question are required'});
        }
        const result = await answerQuestion(courseId, question.trim(), {
          conversationHistory,
          includeSources: debug === true,
        });
        return res.status(200).json({success: true, ...result});
      }

      case 'status': {
        if (!courseId) {
          return res.status(400).json({error: 'courseId is required'});
        }
        const status = await getIndexStatus(courseId);
        return res.status(200).json({success: true, ...status});
      }

      case 'ingest': {
        if (!courseId) {
          return res.status(400).json({error: 'courseId is required'});
        }
        if (user.userType !== 'instructor' || !(await instructorOwnsCourse(user.id, courseId))) {
          return res.status(403).json({error: 'Only the course instructor can index a course'});
        }
        const stats = await ingestCourse(courseId);
        return res.status(200).json({success: true, ...stats});
      }

      case 'transcript': {
        if (!lectureId || !content?.trim()) {
          return res.status(400).json({error: 'lectureId and content are required'});
        }
        const lectureCourseId = await getCourseIdForLecture(lectureId);
        if (!lectureCourseId) {
          return res.status(404).json({error: 'Lecture not found'});
        }
        if (user.userType !== 'instructor' || !(await instructorOwnsCourse(user.id, lectureCourseId))) {
          return res.status(403).json({error: 'Only the course instructor can edit transcripts'});
        }
        await saveTranscript(lectureId, content.trim());
        const stats = await ingestCourse(lectureCourseId);
        return res.status(200).json({success: true, courseId: lectureCourseId, ...stats});
      }

      default:
        return res.status(400).json({error: 'Invalid action'});
    }
  } catch (error) {
    if (error.code === 'COURSE_NOT_FOUND') {
      return res.status(404).json({error: 'Course not found'});
    }
    console.error('RAG API error:', error);
    return res.status(500).json({error: 'RAG operation failed'});
  }
}
