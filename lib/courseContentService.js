/**
 * Course Content Service Layer
 * Business logic and utilities for course content operations
 */

import oracledb from 'oracledb';

/**
 * Get complete course structure with hierarchy
 */
export async function getCourseStructure(connection, courseId) {
  try {
    const result = await connection.execute(
      `SELECT 
        c."c_id", c."title", c."description", c."field", c."seat",
        c."approve_status", c."student_count", c."rating",
        i."i_id", u."name" as instructor_name
       FROM EDUX."Courses" c
       LEFT JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
       LEFT JOIN EDUX."Users" u ON i."i_id" = u."u_id"
       WHERE c."c_id" = :c_id`,
      { c_id: courseId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const course = result.rows[0];

    // Get topics
    const topicsResult = await connection.execute(
      `SELECT t."t_id", t."name", t."serial", t."weight"
       FROM EDUX."Topics" t
       WHERE t."c_id" = :c_id
       ORDER BY t."serial"`,
      { c_id: courseId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    course.topics = topicsResult.rows || [];

    // Get lectures and exams for each topic
    for (const topic of course.topics) {
      const lecturesResult = await connection.execute(
        `SELECT l."l_id", l."description", l."video", l."serial", l."weight"
         FROM EDUX."Lectures" l
         WHERE l."t_id" = :t_id
         ORDER BY l."serial"`,
        { t_id: topic.t_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      topic.lectures = lecturesResult.rows || [];

      const examsResult = await connection.execute(
        `SELECT e."e_id", e."question_count", e."marks", e."duration", e."weight"
         FROM EDUX."Exams" e
         WHERE e."t_id" = :t_id`,
        { t_id: topic.t_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      topic.exams = examsResult.rows || [];
    }

    return course;
  } catch (error) {
    console.error('Error getting course structure:', error);
    throw error;
  }
}

/**
 * Calculate course progress for a student
 */
export async function calculateCourseProgress(connection, studentId, courseId) {
  try {
    // Get total lectures in course
    const totalResult = await connection.execute(
      `SELECT COUNT(DISTINCT l."l_id") as total_lectures
       FROM EDUX."Lectures" l
       JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
       WHERE t."c_id" = :c_id`,
      { c_id: courseId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalLectures = totalResult.rows[0]?.total_lectures || 0;

    // Get completed lectures for student
    const completedResult = await connection.execute(
      `SELECT COUNT(DISTINCT lp."l_id") as completed_lectures
       FROM EDUX."LectureProgress" lp
       JOIN EDUX."Lectures" l ON lp."l_id" = l."l_id"
       JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
       WHERE lp."s_id" = :s_id AND t."c_id" = :c_id AND lp."completed" = 'Y'`,
      { s_id: studentId, c_id: courseId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const completedLectures = completedResult.rows[0]?.completed_lectures || 0;
    const progressPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    return {
      totalLectures,
      completedLectures,
      progressPercentage,
      remaining: totalLectures - completedLectures
    };
  } catch (error) {
    console.error('Error calculating course progress:', error);
    throw error;
  }
}

/**
 * Get topic progress for a student
 */
export async function getTopicProgress(connection, studentId, topicId) {
  try {
    const result = await connection.execute(
      `SELECT 
        COUNT(DISTINCT l."l_id") as total_lectures,
        COUNT(DISTINCT CASE WHEN lp."completed" = 'Y' THEN l."l_id" END) as completed_lectures,
        COUNT(DISTINCT e."e_id") as total_exams,
        COUNT(DISTINCT CASE WHEN t."s_id" IS NOT NULL THEN e."e_id" END) as attempted_exams
       FROM EDUX."Topics" top
       LEFT JOIN EDUX."Lectures" l ON top."t_id" = l."t_id"
       LEFT JOIN EDUX."LectureProgress" lp ON l."l_id" = lp."l_id" AND lp."s_id" = :s_id
       LEFT JOIN EDUX."Exams" e ON top."t_id" = e."t_id"
       LEFT JOIN EDUX."Takes" t ON e."e_id" = t."e_id" AND t."s_id" = :s_id
       WHERE top."t_id" = :t_id`,
      { s_id: studentId, t_id: topicId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || {
      total_lectures: 0,
      completed_lectures: 0,
      total_exams: 0,
      attempted_exams: 0
    };
  } catch (error) {
    console.error('Error getting topic progress:', error);
    throw error;
  }
}

/**
 * Get lecture details with student progress
 */
export async function getLectureWithProgress(connection, lectureId, studentId = null) {
  try {
    const result = await connection.execute(
      `SELECT l."l_id", l."description", l."video", l."serial", l."weight",
              t."t_id", t."name" as topic_name,
              c."c_id", c."title" as course_title
       FROM EDUX."Lectures" l
       JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
       JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
       WHERE l."l_id" = :l_id`,
      { l_id: lectureId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const lecture = result.rows[0];

    if (studentId) {
      const progressResult = await connection.execute(
        `SELECT lp."progress", lp."current_time", lp."completed", lp."last_watched"
         FROM EDUX."LectureProgress" lp
         WHERE lp."l_id" = :l_id AND lp."s_id" = :s_id`,
        { l_id: lectureId, s_id: studentId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      lecture.studentProgress = progressResult.rows ? progressResult.rows[0] : null;
    }

    return lecture;
  } catch (error) {
    console.error('Error getting lecture with progress:', error);
    throw error;
  }
}

/**
 * Get exam with questions
 */
export async function getExamWithQuestions(connection, examId, shuffle = false) {
  try {
    const examResult = await connection.execute(
      `SELECT e."e_id", e."question_count", e."marks", e."duration", e."weight",
              t."t_id", t."name" as topic_name
       FROM EDUX."Exams" e
       JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
       WHERE e."e_id" = :e_id`,
      { e_id: examId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!examResult.rows || examResult.rows.length === 0) {
      return null;
    }

    const exam = examResult.rows[0];

    const questionsResult = await connection.execute(
      `SELECT q."q_id", q."q_description", q."option_a", q."option_b", q."option_c", q."option_d",
              q."right_ans", q."marks", q."serial"
       FROM EDUX."Questions" q
       WHERE q."e_id" = :e_id
       ORDER BY q."serial"`,
      { e_id: examId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    exam.questions = questionsResult.rows || [];

    if (shuffle) {
      // Shuffle questions
      exam.questions = exam.questions.sort(() => Math.random() - 0.5);

      // Shuffle options for each question
      exam.questions = exam.questions.map(q => ({
        ...q,
        options: shuffleArray([q.option_a, q.option_b, q.option_c, q.option_d]),
        right_ans: q.right_ans // Keep original answer position
      }));
    }

    return exam;
  } catch (error) {
    console.error('Error getting exam with questions:', error);
    throw error;
  }
}

/**
 * Update lecture progress
 */
export async function updateLectureProgress(connection, studentId, lectureId, progress, currentTime, isComplete) {
  try {
    await connection.execute(
      `MERGE INTO EDUX."LectureProgress" lp
       USING (SELECT :s_id as s_id, :l_id as l_id FROM dual) t
       ON (lp."s_id" = t.s_id AND lp."l_id" = t.l_id)
       WHEN MATCHED THEN
         UPDATE SET 
           "progress" = :progress,
           "current_time" = :current_time,
           "completed" = CASE WHEN :is_complete = 1 OR lp."completed" = 'Y' THEN 'Y' ELSE 'N' END,
           "last_watched" = SYSDATE
       WHEN NOT MATCHED THEN
         INSERT ("s_id", "l_id", "progress", "current_time", "completed", "last_watched")
         VALUES (:s_id, :l_id, :progress, :current_time, CASE WHEN :is_complete = 1 THEN 'Y' ELSE 'N' END, SYSDATE)`,
      {
        s_id: studentId,
        l_id: lectureId,
        progress: progress || 0,
        current_time: currentTime || 0,
        is_complete: isComplete ? 1 : 0
      },
      { autoCommit: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating lecture progress:', error);
    throw error;
  }
}

/**
 * Helper function to shuffle array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get course statistics
 */
export async function getCourseStatistics(connection, courseId) {
  try {
    const result = await connection.execute(
      `SELECT 
        COUNT(DISTINCT t."t_id") as topic_count,
        COUNT(DISTINCT l."l_id") as lecture_count,
        COUNT(DISTINCT e."e_id") as exam_count,
        COUNT(DISTINCT q."q_id") as question_count,
        SUM(CASE WHEN l."l_id" IS NOT NULL THEN l."weight" ELSE 0 END) as total_lecture_weight,
        SUM(CASE WHEN e."e_id" IS NOT NULL THEN e."weight" ELSE 0 END) as total_exam_weight
       FROM EDUX."Topics" t
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
       LEFT JOIN EDUX."Questions" q ON e."e_id" = q."e_id"
       WHERE t."c_id" = :c_id`,
      { c_id: courseId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || {
      topic_count: 0,
      lecture_count: 0,
      exam_count: 0,
      question_count: 0
    };
  } catch (error) {
    console.error('Error getting course statistics:', error);
    throw error;
  }
}
