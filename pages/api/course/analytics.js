/**
 * Course Analytics API
 * URL: /api/course/analytics
 * 
 * Provides detailed analytics for a specific course including:
 * - Enrollment statistics
 * - Progress distribution
 * - Engagement metrics
 * - Recent enrollments
 * - Top performers
 */

import { executeQuery } from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { c_id, i_id } = req.body;

  if (!c_id || !i_id) {
    return res.status(400).json({ error: 'Course ID and Instructor ID are required' });
  }

  try {
    // Verify course ownership
    const ownershipCheck = await executeQuery(
      `SELECT "c_id", "title", "price", "rating", "student_count" 
       FROM EDUX."Courses" 
       WHERE "c_id" = :c_id AND "i_id" = :i_id`,
      { c_id: Number(c_id), i_id: Number(i_id) }
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this course analytics' });
    }

    const course = ownershipCheck.rows[0];

    // Get enrollment statistics
    const enrollmentStats = await executeQuery(
      `SELECT 
         COUNT(*) as total_enrollments,
         COUNT(CASE WHEN "progress" > 0 THEN 1 END) as active_students,
         AVG("progress") as avg_progress
       FROM EDUX."Enrolls" 
       WHERE "c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Get progress distribution
    const progressDistribution = await executeQuery(
      `SELECT 
         COUNT(CASE WHEN "progress" = 0 THEN 1 END) as not_started,
         COUNT(CASE WHEN "progress" > 0 AND "progress" < 100 THEN 1 END) as in_progress,
         COUNT(CASE WHEN "progress" = 100 THEN 1 END) as completed
       FROM EDUX."Enrolls" 
       WHERE "c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Get rating and reviews
    const ratingsData = await executeQuery(
      `SELECT 
         AVG("rating") as avg_rating,
         COUNT(*) as total_reviews
       FROM EDUX."Feedbacks" 
       WHERE "c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Get engagement metrics - lectures viewed
    const lecturesViewed = await executeQuery(
      `SELECT COUNT(*) as cnt
       FROM EDUX."Watches" w
       JOIN EDUX."Lectures" l ON w."l_id" = l."l_id"
       JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
       WHERE t."c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Get engagement metrics - exams completed
    const examsCompleted = await executeQuery(
      `SELECT COUNT(*) as cnt
       FROM EDUX."Takes" tk
       JOIN EDUX."Exams" ex ON tk."e_id" = ex."e_id"
       JOIN EDUX."Topics" t ON ex."t_id" = t."t_id"
       WHERE t."c_id" = :c_id AND tk."status" = 'completed'`,
      { c_id: Number(c_id) }
    );

    // Get total lecture duration for average time calculation
    const totalDuration = await executeQuery(
      `SELECT SUM(l."duration") as total_duration
       FROM EDUX."Lectures" l
       JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
       WHERE t."c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Get recent enrollments with student details
    const recentEnrollments = await executeQuery(
      `SELECT 
         e."s_id" as id,
         u."name",
         u."email",
         e."date" as enrolled_date,
         e."progress"
       FROM EDUX."Enrolls" e
       JOIN EDUX."Users" u ON e."s_id" = u."u_id"
       WHERE e."c_id" = :c_id
       ORDER BY e."date" DESC
       FETCH FIRST 5 ROWS ONLY`,
      { c_id: Number(c_id) }
    );

    // Get top performers (students with highest progress and exam scores)
    const topPerformers = await executeQuery(
      `SELECT 
         e."s_id" as id,
         u."name",
         e."progress",
         NVL((
           SELECT ROUND(AVG(tk."marks"), 0)
           FROM EDUX."Takes" tk
           JOIN EDUX."Exams" ex ON tk."e_id" = ex."e_id"
           JOIN EDUX."Topics" t ON ex."t_id" = t."t_id"
           WHERE tk."s_id" = e."s_id" AND t."c_id" = :c_id
         ), 0) as avg_score,
         (
           SELECT COUNT(*)
           FROM EDUX."Takes" tk
           JOIN EDUX."Exams" ex ON tk."e_id" = ex."e_id"
           JOIN EDUX."Topics" t ON ex."t_id" = t."t_id"
           WHERE tk."s_id" = e."s_id" AND t."c_id" = :c_id AND tk."status" = 'completed'
         ) as completed_exams
       FROM EDUX."Enrolls" e
       JOIN EDUX."Users" u ON e."s_id" = u."u_id"
       WHERE e."c_id" = :c_id AND e."progress" > 0
       ORDER BY e."progress" DESC, avg_score DESC
       FETCH FIRST 5 ROWS ONLY`,
      { c_id: Number(c_id) }
    );

    // Get wishlist count as view indicator
    const wishlistCount = await executeQuery(
      `SELECT COUNT(*) as cnt FROM EDUX."Wishlist" WHERE "c_id" = :c_id`,
      { c_id: Number(c_id) }
    );

    // Calculate metrics
    const totalEnrollments = enrollmentStats.rows[0]?.TOTAL_ENROLLMENTS || 0;
    const activeStudents = enrollmentStats.rows[0]?.ACTIVE_STUDENTS || 0;
    const avgProgress = Math.round(enrollmentStats.rows[0]?.AVG_PROGRESS || 0);
    const completed = progressDistribution.rows[0]?.COMPLETED || 0;
    const completionRate = totalEnrollments > 0 
      ? Math.round((completed / totalEnrollments) * 100) 
      : 0;

    // Calculate average time spent (estimate based on progress and total duration)
    const totalCourseDuration = totalDuration.rows[0]?.TOTAL_DURATION || 0;
    const averageTimeSpent = totalEnrollments > 0 
      ? Math.round((totalCourseDuration * avgProgress) / 100)
      : 0;

    // Format recent enrollments
    const formattedRecentEnrollments = recentEnrollments.rows.map(row => ({
      id: row.ID,
      name: row.name,
      email: row.email,
      enrolledDate: row.ENROLLED_DATE 
        ? new Date(row.ENROLLED_DATE).toLocaleDateString()
        : 'N/A',
      progress: row.progress || 0,
    }));

    // Format top performers
    const formattedTopPerformers = topPerformers.rows.map(row => ({
      id: row.ID,
      name: row.name,
      progress: row.progress || 0,
      score: row.AVG_SCORE || 0,
      completedExams: row.COMPLETED_EXAMS || 0,
    }));

    // Build response
    const analytics = {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageProgress: avgProgress,
      totalRevenue: totalEnrollments * (course.price || 0),
      averageRating: ratingsData.rows[0]?.AVG_RATING 
        ? Math.round(ratingsData.rows[0].AVG_RATING * 10) / 10 
        : 0,
      totalReviews: ratingsData.rows[0]?.TOTAL_REVIEWS || 0,
      viewCount: (wishlistCount.rows[0]?.CNT || 0) + (totalEnrollments * 3), // Estimate views
      recentEnrollments: formattedRecentEnrollments,
      topPerformers: formattedTopPerformers,
      progressDistribution: {
        notStarted: progressDistribution.rows[0]?.NOT_STARTED || 0,
        inProgress: progressDistribution.rows[0]?.IN_PROGRESS || 0,
        completed: completed,
      },
      engagementMetrics: {
        lecturesViewed: lecturesViewed.rows[0]?.CNT || 0,
        examsCompleted: examsCompleted.rows[0]?.CNT || 0,
        averageTimeSpent: averageTimeSpent,
      },
    };

    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Course Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
