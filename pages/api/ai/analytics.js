// AI Analytics API

import { verifyAuth } from '../../../middleware/auth';
import analytics from '../../../lib/ai/analytics';
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

    const { action, period = 'weekly', courseId } = req.body;

    // Get database connection from pool
    connection = await pool.acquire();

    // Get user's enrolled courses with lecture_count
    const coursesResult = await connection.execute(
      `SELECT c."c_id", c."title", c."field",
              NVL(e."progress", 0) as progress,
              (SELECT COUNT(*) FROM EDUX."Lectures" l
              JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
               WHERE t."c_id" = c."c_id") as lecture_count
       FROM EDUX."Enrolls" e
       JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
       WHERE e."s_id" = :userId`,
      { userId: user.id }
    );
    
    const enrolledCourses = coursesResult.rows?.map(row => ({
      id: row.c_id,
      title: row.title,
      category: row.field,
      progress: row.PROGRESS,
      totalLectures: row.LECTURE_COUNT,
    })) || [];

    console.log('Enrolled courses:', enrolledCourses);

    // Get user's quiz results
    const quizResult = await connection.execute(
      `SELECT "marks"
       FROM EDUX."Takes"
       WHERE "s_id" = :userId`,
      { userId: user.id }
    );
    const quizResults = quizResult.rows?.map(row => ({
      score: row.marks,
    })) || [];

    // Get completed lectures
    const completedLecturesResult = await connection.execute(
      `SELECT l."title", l."description", l."duration"
       FROM EDUX."Watches" w
       JOIN EDUX."Lectures" l ON l."l_id" = w."l_id"
       WHERE "s_id" = :userId`,
      { userId: user.id }
    );

    const completedLectures = completedLecturesResult.rows?.map(row => ({
      title: row.title,
      description: row.description,
      duration: row.duration,
    })) || [];

    const studyTimeResult = await connection.execute(
      `SELECT l."duration", w."w_date" as study_date
       FROM EDUX."Watches" w
       JOIN EDUX."Lectures" l ON l."l_id" = w."l_id"
       WHERE w."s_id" = :userId`,
      { userId: user.id }
    );

    const studyTime = studyTimeResult.rows.map(row => ({
      duration: row.duration,
      startTime: row.STUDY_DATE,
    })) || [];

    console.log('Study time data:', studyTime);

    const loginHistoryResult = await connection.execute(
      `SELECT "w_date" as login_time
       FROM EDUX."Watches"
       WHERE "s_id" = :userId
       ORDER BY login_time DESC
       FETCH FIRST 100 ROWS ONLY`,
      { userId: user.id }
    );

    const loginHistory = loginHistoryResult.rows?.map(row => {
      return { date: row.LOGIN_TIME };
    }) || [];

    // Build user data object
    const userData = {
      enrolledCourses,
      completedLectures,
      quizResults,
      studyTime,
      loginHistory
    };

    let result;

    switch (action) {
      case 'analyze': {
        // Analyze learning patterns
        result = await analytics.analyzeLearningPatterns(userData);
        break;
      }

      case 'report': {
        // Generate progress report
        result = await analytics.generateProgressReport(userData, period);
        break;
      }

      case 'predict': {
        // Predict course completion
        if (!courseId) {
          pool.release(connection);
          return res.status(400).json({ error: 'Course ID is required for prediction' });
        }

        const course = enrolledCourses.find(c => c.id === parseInt(courseId));
        if (!course) {
          pool.release(connection);
          return res.status(404).json({ error: 'Course not found in enrollments' });
        }

        const userHistory = {
          avgLecturesPerWeek: 2, // Could calculate from history
          completedCourses: 0, // Could query
          avgQuizScore: quizResults.length > 0
            ? quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length
            : 0,
        };

        result = await analytics.predictCompletion(course, userHistory);
        break;
      }

      case 'compare': {
        // Get performance comparison
        const userMetrics = {
          avgQuizScore: quizResults.length > 0
            ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length)
            : 0,
          completionRate: enrolledCourses.length > 0
            ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
            : 0,
          totalStudyHours: 0, // Could track
        };

        // Get cohort metrics (aggregate from all users)
        const cohortResult = await connection.execute(
          `SELECT AVG("marks") as avg_score FROM EDUX."Takes"`
        );
        
        const cohortMetrics = {
          avgQuizScore: cohortResult.rows[0]?.[0] || 70,
          avgCompletionRate: 50, // Default
          avgStudyHours: 20, // Default
          standardDev: 15,
        };

        result = await analytics.getPerformanceComparison(userMetrics, cohortMetrics);
        break;
      }

      default:
        pool.release(connection);
        return res.status(400).json({ error: 'Invalid action' });
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Analytics API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Analytics operation failed' });
  }
}
