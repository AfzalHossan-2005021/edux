/**
 * Instructor Analytics API
 * Course performance insights and statistics
 */

import { executeQuery } from '@/middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { instructorId, courseId, action, period = '30d' } = req.query;

  if (!instructorId) {
    return res.status(400).json({ error: 'Instructor ID is required' });
  }

  try {
    switch (action) {
      case 'course':
        return await getCourseAnalytics(instructorId, courseId, res);
      case 'revenue':
        return await getRevenueAnalytics(instructorId, period, res);
      case 'engagement':
        return await getEngagementAnalytics(instructorId, period, res);
      case 'students':
        return await getStudentAnalytics(instructorId, courseId, res);
      case 'overview':
      default:
        return await getOverview(instructorId, res);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/* ========================= OVERVIEW ========================= */

async function getOverview(instructorId, res) {
  const id = Number(instructorId);

  const courses = await executeQuery(
    `SELECT COUNT(*) as cnt FROM EDUX."Courses" WHERE "i_id" = :id`,
    { id }
  );

  const students = await executeQuery(
    `SELECT COUNT(DISTINCT e."s_id") as cnt
     FROM EDUX."Enrolls" e
     JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
     WHERE c."i_id" = :id`,
    { id }
  );

  const enrollments = await executeQuery(
    `SELECT COUNT(*) as cnt
     FROM EDUX."Enrolls" e
     JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
     WHERE c."i_id" = :id`,
    { id }
  );

  const recentEnrollments = await executeQuery(
    `SELECT COUNT(*) as cnt
     FROM EDUX."Enrolls" e
     JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
     WHERE c."i_id" = :id AND e."date" >= SYSDATE - 30`,
    { id }
  );

  const ratings = await executeQuery(
    `SELECT AVG(f."rating") as avg_rating, COUNT(*) as cnt
     FROM EDUX."Feedbacks" f
     JOIN EDUX."Courses" c ON f."c_id" = c."c_id"
     WHERE c."i_id" = :id`,
    { id }
  );

  const topCourse = await executeQuery(
    `SELECT c."c_id", c."title", COUNT(e."s_id") as enroll_count
     FROM EDUX."Courses" c
     LEFT JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
     WHERE c."i_id" = :id
     GROUP BY c."c_id", c."title"
     ORDER BY COUNT(e."s_id") DESC
     FETCH FIRST 1 ROW ONLY`,
    { id }
  );

  const totalRevenue = await executeQuery(
    `SELECT NVL(SUM(c."price"),0) as total
     FROM EDUX."Courses" c
     JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
     WHERE c."i_id" = :id`,
    { id }
  );

  const monthlyRevenue = await executeQuery(
    `SELECT NVL(SUM(c."price"),0) as total
      FROM EDUX."Courses" c
      JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
      WHERE c."i_id" = :id AND e."date" >= TRUNC(SYSDATE, 'MM')`,
    { id }
  );

  const avgProgress = await executeQuery(
    `SELECT AVG(e."progress") as avg_progress
     FROM EDUX."Enrolls" e
     JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
     WHERE c."i_id" = :id`,
    { id }
  );

  return res.status(200).json({
    overview: {
      totalCourses: courses.rows[0]?.CNT || 0,
      totalStudents: students.rows[0]?.CNT || 0,
      totalEnrollments: enrollments.rows[0]?.CNT || 0,
      recentEnrollments: recentEnrollments.rows[0]?.CNT || 0,
      avgRating: Math.round((ratings.rows[0]?.AVG_RATING || 0) * 10) / 10,
      totalReviews: ratings.rows[0]?.CNT || 0,
      totalRevenue: totalRevenue.rows[0]?.TOTAL || 0,
      monthlyRevenue: monthlyRevenue.rows[0]?.TOTAL || 0,
      avgProgress: avgProgress.rows[0]?.AVG_PROGRESS
        ? Math.round(avgProgress.rows[0].AVG_PROGRESS)
        : 0,
      topCourse: topCourse.rows.length
        ? {
          id: topCourse.rows[0]?.c_id,
          name: topCourse.rows[0]?.title,
          enrollments: topCourse.rows[0]?.ENROLL_COUNT,
        }
        : null,
    },
  });
}

/* ========================= COURSE ========================= */

async function getCourseAnalytics(instructorId, courseId, res) {
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  const ownership = await executeQuery(
    `SELECT 1 FROM EDUX."Courses" WHERE "c_id" = :courseId AND "i_id" = :instructorId`,
    { courseId: Number(courseId), instructorId: Number(instructorId) }
  );

  if (ownership.rows.length === 0) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const enrollments = await executeQuery(
    `SELECT COUNT(*) as cnt, MIN("date") as first_date, MAX("date") as last_date
     FROM EDUX."Enrolls" WHERE "c_id" = :courseId`,
    { courseId: Number(courseId) }
  );

  const completion = await executeQuery(
    `SELECT
       COUNT(CASE WHEN "progress" >= 100 THEN 1 END) as completed,
       COUNT(*) as total
     FROM EDUX."Enrolls" WHERE "c_id" = :courseId`,
    { courseId: Number(courseId) }
  );

  // Rating distribution
  const ratings = await executeQuery(
    `SELECT 
       COUNT(CASE WHEN "rating" = 5 THEN 1 END) as five_star,
       COUNT(CASE WHEN "rating" = 4 THEN 1 END) as four_star,
       COUNT(CASE WHEN "rating" = 3 THEN 1 END) as three_star,
       COUNT(CASE WHEN "rating" = 2 THEN 1 END) as two_star,
       COUNT(CASE WHEN "rating" = 1 THEN 1 END) as one_star
     FROM EDUX."Feedbacks" WHERE "c_id" = :courseId`,
    { courseId: Number(courseId) }
  );

  // Exam performance (avg score, high score, total attempts)
  const examPerformance = await executeQuery(
    `SELECT 
       AVG(t."marks" * 100 / e."marks") as avg_score,
       MAX(t."marks" * 100 / e."marks") as high_score,
       COUNT(*) as total_attempts
     FROM EDUX."Takes" t
     JOIN EDUX."Exams" e ON t."e_id" = e."e_id"
     JOIN EDUX."Topics" tp ON e."t_id" = tp."t_id"
     WHERE tp."c_id" = :courseId`,
    { courseId: Number(courseId) }
  );


  return res.status(200).json({
    courseId: Number(courseId),
    enrollments: {
      total: enrollments.rows[0]?.CNT || 0,
      firstEnrollment: enrollments.rows[0]?.FIRST_DATE || null,
      lastEnrollment: enrollments.rows[0]?.LAST_DATE || null,
      completionRate: Math.round(
        ((completion.rows[0]?.COMPLETED || 0) / (completion.rows[0]?.TOTAL || 1)) * 100
      ),
    },
    ratings: {
      distribution: {
        5: ratings.rows[0]?.FIVE_STAR || 0,
        4: ratings.rows[0]?.FOUR_STAR || 0,
        3: ratings.rows[0]?.THREE_STAR || 0,
        2: ratings.rows[0]?.TWO_STAR || 0,
        1: ratings.rows[0]?.ONE_STAR || 0,
      },
    },
    exams: {
      avgScore: examPerformance.rows[0]?.AVG_SCORE || 0,
      maxScore: examPerformance.rows[0]?.HIGH_SCORE || 0,
      totalAttempts: examPerformance.rows[0]?.TOTAL_ATTEMPTS || 0,
    },
  });
}

/* ========================= REVENUE ========================= */

async function getRevenueAnalytics(instructorId, period, res) {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  try {
    // Total revenue for the period
    const revenue = await executeQuery(
      `SELECT NVL(SUM("price"),0) as total
       FROM EDUX."Courses" c
       JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
       WHERE c."i_id" = :id
         AND e."date" >= SYSDATE - :days`,
      { id: Number(instructorId), days }
    );

    const total = revenue.rows[0]?.TOTAL || 0;

    // Monthly series for the last 6 months (including current)
    const monthly = await executeQuery(
      `SELECT TO_CHAR(TRUNC(e."date", 'MM'), 'Mon') as month, NVL(SUM(c."price"),0) as revenue
       FROM EDUX."Courses" c
       JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
       WHERE c."i_id" = :id
         AND e."date" >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -5)
       GROUP BY TRUNC(e."date", 'MM')
       ORDER BY TRUNC(e."date", 'MM')`,
      { id: Number(instructorId) }
    );

    const monthlySeries = (monthly.rows || []).map((r) => ({
      month: r.MONTH,
      revenue: Number(r.REVENUE) || 0,
    }));

    // Revenue breakdown by course (top 6)
    const breakdownQ = await executeQuery(
      `SELECT c."title" as name, NVL(SUM(c."price"),0) as value
       FROM EDUX."Courses" c
       JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
       WHERE c."i_id" = :id
         AND e."date" >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -5)
       GROUP BY c."title"
       ORDER BY value DESC
       FETCH FIRST 6 ROWS ONLY`,
      { id: Number(instructorId) }
    );

    const revenueBreakdown = (breakdownQ.rows || []).map((r) => ({
      name: r.NAME || 'Course',
      value: Number(r.VALUE) || 0,
    }));

    return res.status(200).json({
      revenue: { total, period: `${days}d` },
      monthlySeries,
      revenueBreakdown,
    });
  } catch (err) {
    console.error('Revenue analytics error:', err);
    return res.status(200).json({
      revenue: { total: 0 },
      monthlySeries: [],
      revenueBreakdown: [],
      message: 'Revenue tracking unavailable',
    });
  }
}

/* ========================= ENGAGEMENT ========================= */

async function getEngagementAnalytics(instructorId, period, res) {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  const reviews = await executeQuery(
    `SELECT COUNT(*) as cnt
     FROM EDUX."Feedbacks" f
     JOIN EDUX."Courses" c ON f."c_id" = c."c_id"
     WHERE c."i_id" = :id AND f."date" >= SYSDATE - :days`,
    { id: Number(instructorId), days }
  );

  return res.status(200).json({
    engagement: {
      newReviews: reviews.rows[0]?.CNT || 0,
    },
    period: `${days}d`,
  });
}

/* ========================= STUDENTS ========================= */

async function getStudentAnalytics(instructorId, courseId, res) {
  let where = 'c."i_id" = :instructorId';
  const params = { instructorId: Number(instructorId) };

  if (courseId) {
    where += ' AND c."c_id" = :courseId';
    params.courseId = Number(courseId);
  }

  const result = await executeQuery(
    `SELECT u."u_id", u."name", u."email", c."title", e."date", e."progress", e."approve_status"
     FROM EDUX."Users" u
     JOIN EDUX."Enrolls" e ON u."u_id" = e."s_id"
     JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
     WHERE ${where}
     FETCH FIRST 100 ROWS ONLY`,
    params
  );

  const students = result.rows.map(r => ({
    userId: r.u_id,
    name: r.name,
    email: r.email,
    courseName: r.title,
    enrollDate: r.date ? new Date(r.date).toLocaleDateString() : 'N/A',
    progress: r.progress || 0,
    completed: r.approve_status === 'y',
  }));

  return res.status(200).json({ students });
}