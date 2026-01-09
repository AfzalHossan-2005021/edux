/**
 * Instructor Analytics API
 * Course performance insights and statistics
 */

import { executeQuery } from '../../middleware/connectdb';

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

  return res.status(200).json({
    overview: {
      totalCourses: courses.rows[0]?.cnt || 0,
      totalStudents: students.rows[0]?.cnt || 0,
      totalEnrollments: enrollments.rows[0]?.cnt || 0,
      avgRating: Math.round((ratings.rows[0]?.avg_rating || 0) * 10) / 10,
      totalReviews: ratings.rows[0]?.cnt || 0,
      topCourse: topCourse.rows.length
        ? {
            id: topCourse.rows[0]?.c_id,
            name: topCourse.rows[0]?.title,
            enrollments: topCourse.rows[0]?.enroll_count,
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
       COUNT(CASE WHEN "approve_status" = 'y' THEN 1 END) as completed,
       COUNT(*) as total
     FROM EDUX."Enrolls" WHERE "c_id" = :courseId`,
    { courseId: Number(courseId) }
  );

  return res.status(200).json({
    courseId: Number(courseId),
    enrollments: {
      total: enrollments.rows[0]?.cnt || 0,
      firstEnrollment: enrollments.rows[0]?.first_date || null,
      lastEnrollment: enrollments.rows[0]?.last_date || null,
      completionRate: Math.round(
        ((completion.rows[0]?.completed || 0) / (completion.rows[0]?.total || 1)) * 100
      ),
    },
  });
}

/* ========================= REVENUE ========================= */

async function getRevenueAnalytics(instructorId, period, res) {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  try {
    const revenue = await executeQuery(
      `SELECT NVL(SUM("price"),0) as total
       FROM EDUX."Courses" c
       JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
       WHERE c."i_id" = :id
         AND e."date" >= SYSDATE - :days`,
      { id: Number(instructorId), days }
    );

    return res.status(200).json({
      revenue: {
        total: revenue.rows[0]?.total || 0,
        period: `${days}d`,
      },
    });
  } catch {
    return res.status(200).json({
      revenue: { total: 0 },
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
      newReviews: reviews.rows[0]?.cnt || 0,
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
    `SELECT u."u_id", u."name", u."email", e."progress", e."approve_status"
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
    progress: r.progress || 0,
    completed: r.approve_status === 'y',
  }));

  return res.status(200).json({ students });
}
