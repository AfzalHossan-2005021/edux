/**
 * Instructor Analytics API
 * Course performance insights and statistics
 */

import pool from '../../middleware/connectdb';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const { instructorId, courseId, action, period = '30d' } = req.query;

  if (!instructorId) {
    return res.status(400).json({ error: 'Instructor ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    switch (action) {
      case 'overview':
        return await getOverview(connection, instructorId, res);
      case 'course':
        return await getCourseAnalytics(connection, instructorId, courseId, res);
      case 'revenue':
        return await getRevenueAnalytics(connection, instructorId, period, res);
      case 'engagement':
        return await getEngagementAnalytics(connection, instructorId, period, res);
      case 'students':
        return await getStudentAnalytics(connection, instructorId, courseId, res);
      default:
        return await getOverview(connection, instructorId, res);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// Get instructor overview
async function getOverview(connection, instructorId, res) {
  // Total courses
  const coursesResult = await connection.execute(
    `SELECT COUNT(*) FROM EDUX.COURSE WHERE I_ID = :instructorId`,
    { instructorId: parseInt(instructorId) }
  );
  const totalCourses = coursesResult.rows[0]?.[0] || 0;

  // Total students (enrollments)
  const studentsResult = await connection.execute(
    `SELECT COUNT(DISTINCT e.U_ID) 
     FROM EDUX.ENROLLMENT e
     JOIN EDUX.COURSE c ON e.C_ID = c.C_ID
     WHERE c.I_ID = :instructorId`,
    { instructorId: parseInt(instructorId) }
  );
  const totalStudents = studentsResult.rows[0]?.[0] || 0;

  // Total enrollments
  const enrollmentsResult = await connection.execute(
    `SELECT COUNT(*) 
     FROM EDUX.ENROLLMENT e
     JOIN EDUX.COURSE c ON e.C_ID = c.C_ID
     WHERE c.I_ID = :instructorId`,
    { instructorId: parseInt(instructorId) }
  );
  const totalEnrollments = enrollmentsResult.rows[0]?.[0] || 0;

  // Average rating
  const ratingResult = await connection.execute(
    `SELECT AVG(r.RATING), COUNT(r.RATING)
     FROM EDUX.COURSE_RATING r
     JOIN EDUX.COURSE c ON r.C_ID = c.C_ID
     WHERE c.I_ID = :instructorId`,
    { instructorId: parseInt(instructorId) }
  );
  const avgRating = ratingResult.rows[0]?.[0] || 0;
  const totalReviews = ratingResult.rows[0]?.[1] || 0;

  // Revenue (if tracking payments)
  let totalRevenue = 0;
  try {
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(p.AMOUNT), 0)
       FROM EDUX.PAYMENTS p
       JOIN EDUX.COURSE c ON p.C_ID = c.C_ID
       WHERE c.I_ID = :instructorId AND p.STATUS = 'completed'`,
      { instructorId: parseInt(instructorId) }
    );
    totalRevenue = revenueResult.rows[0]?.[0] || 0;
  } catch (e) {
    // Table might not exist
  }

  // Recent enrollments (last 30 days)
  const recentEnrollmentsResult = await connection.execute(
    `SELECT COUNT(*)
     FROM EDUX.ENROLLMENT e
     JOIN EDUX.COURSE c ON e.C_ID = c.C_ID
     WHERE c.I_ID = :instructorId AND e.ENROLL_DATE >= SYSDATE - 30`,
    { instructorId: parseInt(instructorId) }
  );
  const recentEnrollments = recentEnrollmentsResult.rows[0]?.[0] || 0;

  // Top performing course
  const topCourseResult = await connection.execute(
    `SELECT c.C_ID, c.NAME, COUNT(e.E_ID) as ENROLLMENTS
     FROM EDUX.COURSE c
     LEFT JOIN EDUX.ENROLLMENT e ON c.C_ID = e.C_ID
     WHERE c.I_ID = :instructorId
     GROUP BY c.C_ID, c.NAME
     ORDER BY ENROLLMENTS DESC
     FETCH FIRST 1 ROW ONLY`,
    { instructorId: parseInt(instructorId) }
  );
  const topCourse = topCourseResult.rows[0]
    ? { id: topCourseResult.rows[0][0], name: topCourseResult.rows[0][1], enrollments: topCourseResult.rows[0][2] }
    : null;

  return res.status(200).json({
    overview: {
      totalCourses,
      totalStudents,
      totalEnrollments,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      totalRevenue,
      recentEnrollments,
      topCourse,
    },
    period: 'all-time',
  });
}

// Get individual course analytics
async function getCourseAnalytics(connection, instructorId, courseId, res) {
  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  // Verify course ownership
  const ownerResult = await connection.execute(
    `SELECT * FROM EDUX.COURSE WHERE C_ID = :courseId AND I_ID = :instructorId`,
    { courseId: parseInt(courseId), instructorId: parseInt(instructorId) }
  );

  if (ownerResult.rows.length === 0) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Enrollment stats
  const enrollmentResult = await connection.execute(
    `SELECT COUNT(*), MIN(ENROLL_DATE), MAX(ENROLL_DATE)
     FROM EDUX.ENROLLMENT WHERE C_ID = :courseId`,
    { courseId: parseInt(courseId) }
  );
  const [totalEnrollments, firstEnrollment, lastEnrollment] = enrollmentResult.rows[0];

  // Completion rate
  const completionResult = await connection.execute(
    `SELECT 
       COUNT(CASE WHEN COMPLETED = 1 THEN 1 END) as COMPLETED,
       COUNT(*) as TOTAL
     FROM EDUX.ENROLLMENT WHERE C_ID = :courseId`,
    { courseId: parseInt(courseId) }
  );
  const completedCount = completionResult.rows[0]?.[0] || 0;
  const totalCount = completionResult.rows[0]?.[1] || 1;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  // Rating distribution
  const ratingDistResult = await connection.execute(
    `SELECT RATING, COUNT(*) FROM EDUX.COURSE_RATING WHERE C_ID = :courseId GROUP BY RATING`,
    { courseId: parseInt(courseId) }
  );
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistResult.rows.forEach(([rating, count]) => {
    ratingDistribution[Math.round(rating)] = count;
  });

  // Exam performance
  const examResult = await connection.execute(
    `SELECT AVG(er.SCORE), MIN(er.SCORE), MAX(er.SCORE), COUNT(*)
     FROM EDUX.EXAM_RESULTS er
     JOIN EDUX.EXAM e ON er.E_ID = e.E_ID
     JOIN EDUX.TOPIC t ON e.T_ID = t.T_ID
     WHERE t.C_ID = :courseId`,
    { courseId: parseInt(courseId) }
  );
  const examStats = {
    avgScore: Math.round(examResult.rows[0]?.[0] || 0),
    minScore: examResult.rows[0]?.[1] || 0,
    maxScore: examResult.rows[0]?.[2] || 0,
    totalAttempts: examResult.rows[0]?.[3] || 0,
  };

  // Enrollment trend (last 30 days)
  const trendResult = await connection.execute(
    `SELECT TRUNC(ENROLL_DATE), COUNT(*)
     FROM EDUX.ENROLLMENT
     WHERE C_ID = :courseId AND ENROLL_DATE >= SYSDATE - 30
     GROUP BY TRUNC(ENROLL_DATE)
     ORDER BY TRUNC(ENROLL_DATE)`,
    { courseId: parseInt(courseId) }
  );
  const enrollmentTrend = trendResult.rows.map(([date, count]) => ({
    date: date,
    count: count,
  }));

  return res.status(200).json({
    courseId: parseInt(courseId),
    enrollments: {
      total: totalEnrollments,
      firstEnrollment,
      lastEnrollment,
      completionRate,
      completedCount,
      trend: enrollmentTrend,
    },
    ratings: {
      distribution: ratingDistribution,
    },
    exams: examStats,
  });
}

// Get revenue analytics
async function getRevenueAnalytics(connection, instructorId, period, res) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

  try {
    // Total revenue in period
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(p.AMOUNT), 0)
       FROM EDUX.PAYMENTS p
       JOIN EDUX.COURSE c ON p.C_ID = c.C_ID
       WHERE c.I_ID = :instructorId 
         AND p.STATUS = 'completed'
         AND p.COMPLETED_AT >= SYSDATE - :days`,
      { instructorId: parseInt(instructorId), days }
    );
    const totalRevenue = revenueResult.rows[0]?.[0] || 0;

    // Revenue by course
    const byCourseResult = await connection.execute(
      `SELECT c.C_ID, c.NAME, NVL(SUM(p.AMOUNT), 0) as REVENUE, COUNT(p.PAYMENT_ID) as SALES
       FROM EDUX.COURSE c
       LEFT JOIN EDUX.PAYMENTS p ON c.C_ID = p.C_ID AND p.STATUS = 'completed' AND p.COMPLETED_AT >= SYSDATE - :days
       WHERE c.I_ID = :instructorId
       GROUP BY c.C_ID, c.NAME
       ORDER BY REVENUE DESC`,
      { instructorId: parseInt(instructorId), days }
    );
    const byCourse = byCourseResult.rows.map(([id, name, revenue, sales]) => ({
      courseId: id,
      courseName: name,
      revenue,
      sales,
    }));

    // Revenue trend
    const trendResult = await connection.execute(
      `SELECT TRUNC(p.COMPLETED_AT), SUM(p.AMOUNT)
       FROM EDUX.PAYMENTS p
       JOIN EDUX.COURSE c ON p.C_ID = c.C_ID
       WHERE c.I_ID = :instructorId 
         AND p.STATUS = 'completed'
         AND p.COMPLETED_AT >= SYSDATE - :days
       GROUP BY TRUNC(p.COMPLETED_AT)
       ORDER BY TRUNC(p.COMPLETED_AT)`,
      { instructorId: parseInt(instructorId), days }
    );
    const trend = trendResult.rows.map(([date, amount]) => ({ date, amount }));

    return res.status(200).json({
      revenue: {
        total: totalRevenue,
        byCourse,
        trend,
      },
      period: `${days}d`,
    });
  } catch (error) {
    return res.status(200).json({
      revenue: { total: 0, byCourse: [], trend: [] },
      message: 'Revenue tracking not available',
    });
  }
}

// Get engagement analytics
async function getEngagementAnalytics(connection, instructorId, period, res) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

  // Discussion activity
  let discussionStats = { threads: 0, replies: 0 };
  try {
    const discussionResult = await connection.execute(
      `SELECT 
         (SELECT COUNT(*) FROM EDUX.DISCUSSIONS d JOIN EDUX.COURSE c ON d.C_ID = c.C_ID 
          WHERE c.I_ID = :instructorId AND d.CREATED_AT >= SYSDATE - :days) as THREADS,
         (SELECT COUNT(*) FROM EDUX.DISCUSSION_REPLIES dr JOIN EDUX.DISCUSSIONS d ON dr.THREAD_ID = d.THREAD_ID
          JOIN EDUX.COURSE c ON d.C_ID = c.C_ID WHERE c.I_ID = :instructorId AND dr.CREATED_AT >= SYSDATE - :days) as REPLIES
       FROM DUAL`,
      { instructorId: parseInt(instructorId), days }
    );
    discussionStats = {
      threads: discussionResult.rows[0]?.[0] || 0,
      replies: discussionResult.rows[0]?.[1] || 0,
    };
  } catch (e) {
    // Table might not exist
  }

  // Review activity
  const reviewResult = await connection.execute(
    `SELECT COUNT(*) FROM EDUX.COURSE_RATING r
     JOIN EDUX.COURSE c ON r.C_ID = c.C_ID
     WHERE c.I_ID = :instructorId AND r.RATING_DATE >= SYSDATE - :days`,
    { instructorId: parseInt(instructorId), days }
  );
  const newReviews = reviewResult.rows[0]?.[0] || 0;

  // Session attendance (live sessions)
  let sessionStats = { sessions: 0, attendees: 0 };
  try {
    const sessionResult = await connection.execute(
      `SELECT COUNT(DISTINCT s.SESSION_ID), COUNT(sp.USER_ID)
       FROM EDUX.LIVE_SESSIONS s
       LEFT JOIN EDUX.SESSION_PARTICIPANTS sp ON s.SESSION_ID = sp.SESSION_ID
       WHERE s.INSTRUCTOR_ID = :instructorId AND s.SCHEDULED_START >= SYSDATE - :days`,
      { instructorId: parseInt(instructorId), days }
    );
    sessionStats = {
      sessions: sessionResult.rows[0]?.[0] || 0,
      attendees: sessionResult.rows[0]?.[1] || 0,
    };
  } catch (e) {
    // Table might not exist
  }

  return res.status(200).json({
    engagement: {
      discussions: discussionStats,
      reviews: newReviews,
      sessions: sessionStats,
    },
    period: `${days}d`,
  });
}

// Get student analytics
async function getStudentAnalytics(connection, instructorId, courseId, res) {
  let whereClause = 'c.I_ID = :instructorId';
  const params = { instructorId: parseInt(instructorId) };

  if (courseId) {
    whereClause += ' AND c.C_ID = :courseId';
    params.courseId = parseInt(courseId);
  }

  // Student list with progress
  const studentsResult = await connection.execute(
    `SELECT u.U_ID, u.NAME, u.EMAIL, c.C_ID, c.NAME as COURSE_NAME,
            e.ENROLL_DATE, NVL(e.COMPLETED, 0) as COMPLETED,
            NVL(e.PROGRESS, 0) as PROGRESS
     FROM EDUX.USERS u
     JOIN EDUX.ENROLLMENT e ON u.U_ID = e.U_ID
     JOIN EDUX.COURSE c ON e.C_ID = c.C_ID
     WHERE ${whereClause}
     ORDER BY e.ENROLL_DATE DESC
     FETCH FIRST 100 ROWS ONLY`,
    params
  );

  const students = studentsResult.rows.map((row) => ({
    userId: row[0],
    name: row[1],
    email: row[2],
    courseId: row[3],
    courseName: row[4],
    enrollDate: row[5],
    completed: row[6] === 1,
    progress: row[7],
  }));

  // Aggregate stats
  const completed = students.filter((s) => s.completed).length;
  const inProgress = students.filter((s) => !s.completed && s.progress > 0).length;
  const notStarted = students.filter((s) => !s.completed && s.progress === 0).length;

  return res.status(200).json({
    students,
    summary: {
      total: students.length,
      completed,
      inProgress,
      notStarted,
      avgProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) || 0,
    },
  });
}
