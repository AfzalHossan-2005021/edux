/**
 * Gamification API
 * XP, badges, streaks, and leaderboards
 */

import pool from '../../middleware/connectdb';
import { BadgeTypes, XPActions, getUserLevel, calculateStreak, checkBadgeEligibility } from '../../lib/gamification';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getGamificationData(req, res);
      case 'POST':
        return await updateGamification(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Gamification API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Fetch gamification data
async function getGamificationData(req, res) {
  const { userId, action } = req.query;
  let connection;

  try {
    connection = await pool.getConnection();

    switch (action) {
      case 'profile':
        return await getProfile(connection, userId, res);
      case 'badges':
        return await getBadges(connection, userId, res);
      case 'leaderboard':
        return await getLeaderboard(connection, req.query, res);
      case 'streak':
        return await getStreak(connection, userId, res);
      default:
        return await getProfile(connection, userId, res);
    }
  } catch (error) {
    console.error('Get gamification error:', error);
    return res.status(500).json({ error: 'Failed to fetch gamification data' });
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

// Get user gamification profile
async function getProfile(connection, userId, res) {
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Get user XP
  const xpResult = await connection.execute(
    `SELECT NVL(SUM(XP_AMOUNT), 0) as TOTAL_XP FROM EDUX.USER_XP WHERE U_ID = :userId`,
    { userId: parseInt(userId) }
  );
  const totalXP = xpResult.rows[0]?.[0] || 0;

  // Get badge count
  const badgeResult = await connection.execute(
    `SELECT COUNT(*) FROM EDUX.USER_BADGES WHERE U_ID = :userId`,
    { userId: parseInt(userId) }
  );
  const badgeCount = badgeResult.rows[0]?.[0] || 0;

  // Get activity dates for streak
  const activityResult = await connection.execute(
    `SELECT DISTINCT TRUNC(ACTIVITY_DATE) as ACTIVITY_DATE 
     FROM EDUX.USER_ACTIVITY 
     WHERE U_ID = :userId 
     ORDER BY ACTIVITY_DATE DESC`,
    { userId: parseInt(userId) }
  );
  const activityDates = activityResult.rows.map((row) => row[0]);
  const currentStreak = calculateStreak(activityDates);

  // Get level info
  const levelInfo = getUserLevel(totalXP);

  // Get recent XP transactions
  const recentXPResult = await connection.execute(
    `SELECT * FROM (
      SELECT ACTION, XP_AMOUNT, EARNED_AT FROM EDUX.USER_XP 
      WHERE U_ID = :userId ORDER BY EARNED_AT DESC
    ) WHERE ROWNUM <= 10`,
    { userId: parseInt(userId) }
  );
  const recentXP = recentXPResult.rows.map(([action, amount, earnedAt]) => ({
    action,
    amount,
    earnedAt,
  }));

  return res.status(200).json({
    userId: parseInt(userId),
    totalXP,
    level: levelInfo,
    badgeCount,
    currentStreak,
    longestStreak: Math.max(currentStreak, 0), // Would track separately in real app
    recentXP,
  });
}

// Get user badges
async function getBadges(connection, userId, res) {
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const result = await connection.execute(
    `SELECT BADGE_ID, EARNED_AT FROM EDUX.USER_BADGES WHERE U_ID = :userId ORDER BY EARNED_AT DESC`,
    { userId: parseInt(userId) }
  );

  const earnedBadges = result.rows.map(([badgeId, earnedAt]) => ({
    ...BadgeTypes[badgeId.toUpperCase()],
    earnedAt,
  })).filter(Boolean);

  // Get all available badges with earned status
  const allBadges = Object.values(BadgeTypes).map((badge) => ({
    ...badge,
    earned: earnedBadges.some((eb) => eb.id === badge.id),
    earnedAt: earnedBadges.find((eb) => eb.id === badge.id)?.earnedAt,
  }));

  return res.status(200).json({
    earned: earnedBadges,
    all: allBadges,
    totalEarned: earnedBadges.length,
    totalAvailable: Object.keys(BadgeTypes).length,
  });
}

// Get leaderboard
async function getLeaderboard(connection, query, res) {
  const { type = 'xp', limit = 50, courseId } = query;

  let sql;
  const params = {};

  if (type === 'xp') {
    sql = `
      SELECT u.U_ID, u.NAME, u.EMAIL, NVL(SUM(x.XP_AMOUNT), 0) as TOTAL_XP,
             (SELECT COUNT(*) FROM EDUX.USER_BADGES b WHERE b.U_ID = u.U_ID) as BADGE_COUNT
      FROM EDUX.USERS u
      LEFT JOIN EDUX.USER_XP x ON u.U_ID = x.U_ID
      GROUP BY u.U_ID, u.NAME, u.EMAIL
      ORDER BY TOTAL_XP DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    params.limit = parseInt(limit);
  } else if (type === 'streak') {
    // For streak leaderboard, would need additional activity tracking
    sql = `
      SELECT u.U_ID, u.NAME, u.EMAIL, NVL(a.STREAK, 0) as STREAK
      FROM EDUX.USERS u
      LEFT JOIN (
        SELECT U_ID, MAX(CURRENT_STREAK) as STREAK FROM EDUX.USER_STREAKS GROUP BY U_ID
      ) a ON u.U_ID = a.U_ID
      ORDER BY STREAK DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    params.limit = parseInt(limit);
  } else if (type === 'course' && courseId) {
    sql = `
      SELECT u.U_ID, u.NAME, NVL(SUM(x.XP_AMOUNT), 0) as COURSE_XP
      FROM EDUX.USERS u
      JOIN EDUX.ENROLLMENT e ON u.U_ID = e.U_ID
      LEFT JOIN EDUX.USER_XP x ON u.U_ID = x.U_ID AND x.C_ID = :courseId
      WHERE e.C_ID = :courseId
      GROUP BY u.U_ID, u.NAME
      ORDER BY COURSE_XP DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    params.courseId = parseInt(courseId);
    params.limit = parseInt(limit);
  }

  try {
    const result = await connection.execute(sql, params);
    
    const leaderboard = result.rows.map((row, index) => {
      const data = formatRow(row, result.metaData);
      return {
        rank: index + 1,
        ...data,
        level: getUserLevel(data.totalXp || data.courseXp || 0),
      };
    });

    return res.status(200).json({
      type,
      leaderboard,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Tables might not exist
    return res.status(200).json({
      type,
      leaderboard: [],
      message: 'Leaderboard not available',
    });
  }
}

// Get streak info
async function getStreak(connection, userId, res) {
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const activityResult = await connection.execute(
    `SELECT DISTINCT TRUNC(ACTIVITY_DATE) as ACTIVITY_DATE 
     FROM EDUX.USER_ACTIVITY 
     WHERE U_ID = :userId 
     ORDER BY ACTIVITY_DATE DESC
     FETCH FIRST 365 ROWS ONLY`,
    { userId: parseInt(userId) }
  );

  const activityDates = activityResult.rows.map((row) => row[0]);
  const currentStreak = calculateStreak(activityDates);

  // Get longest streak (would track separately in production)
  const longestStreak = currentStreak;

  return res.status(200).json({
    currentStreak,
    longestStreak,
    todayActive: activityDates.some((d) => {
      const today = new Date();
      return new Date(d).toDateString() === today.toDateString();
    }),
    activityDates: activityDates.slice(0, 30), // Last 30 days
  });
}

// POST - Update gamification
async function updateGamification(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'award-xp':
      return await awardXP(req, res);
    case 'award-badge':
      return await awardBadge(req, res);
    case 'check-badges':
      return await checkAndAwardBadges(req, res);
    case 'log-activity':
      return await logActivity(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Award XP to user
async function awardXP(req, res) {
  const { userId, amount, xpAction, courseId } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'User ID and amount are required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.execute(
      `INSERT INTO EDUX.USER_XP (U_ID, XP_AMOUNT, ACTION, C_ID, EARNED_AT)
       VALUES (:userId, :amount, :action, :courseId, SYSDATE)`,
      {
        userId: parseInt(userId),
        amount: parseInt(amount),
        action: xpAction || 'manual',
        courseId: courseId ? parseInt(courseId) : null,
      },
      { autoCommit: true }
    );

    // Get new total
    const result = await connection.execute(
      `SELECT SUM(XP_AMOUNT) FROM EDUX.USER_XP WHERE U_ID = :userId`,
      { userId: parseInt(userId) }
    );
    const newTotal = result.rows[0]?.[0] || 0;
    const levelInfo = getUserLevel(newTotal);

    return res.status(200).json({
      success: true,
      awarded: amount,
      newTotal,
      level: levelInfo,
    });
  } catch (error) {
    console.error('Award XP error:', error);
    return res.status(500).json({ error: 'Failed to award XP' });
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

// Award badge to user
async function awardBadge(req, res) {
  const { userId, badgeId } = req.body;

  if (!userId || !badgeId) {
    return res.status(400).json({ error: 'User ID and badge ID are required' });
  }

  const badge = BadgeTypes[badgeId.toUpperCase()];
  if (!badge) {
    return res.status(400).json({ error: 'Invalid badge ID' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Check if already has badge
    const existing = await connection.execute(
      `SELECT * FROM EDUX.USER_BADGES WHERE U_ID = :userId AND BADGE_ID = :badgeId`,
      { userId: parseInt(userId), badgeId }
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Badge already earned' });
    }

    // Award badge
    await connection.execute(
      `INSERT INTO EDUX.USER_BADGES (U_ID, BADGE_ID, EARNED_AT) VALUES (:userId, :badgeId, SYSDATE)`,
      { userId: parseInt(userId), badgeId },
      { autoCommit: true }
    );

    // Award badge XP
    await connection.execute(
      `INSERT INTO EDUX.USER_XP (U_ID, XP_AMOUNT, ACTION, EARNED_AT) VALUES (:userId, :xp, :action, SYSDATE)`,
      { userId: parseInt(userId), xp: badge.xp, action: `badge:${badgeId}` },
      { autoCommit: true }
    );

    return res.status(200).json({
      success: true,
      badge,
      xpAwarded: badge.xp,
    });
  } catch (error) {
    console.error('Award badge error:', error);
    return res.status(500).json({ error: 'Failed to award badge' });
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

// Check and award eligible badges
async function checkAndAwardBadges(req, res) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Get user stats
    const [completedResult, badgesResult, examResult, reviewResult, discussionResult] = await Promise.all([
      connection.execute(
        `SELECT COUNT(*) FROM EDUX.ENROLLMENT e 
         WHERE e.U_ID = :userId AND e.COMPLETED = 1`,
        { userId: parseInt(userId) }
      ),
      connection.execute(
        `SELECT BADGE_ID FROM EDUX.USER_BADGES WHERE U_ID = :userId`,
        { userId: parseInt(userId) }
      ),
      connection.execute(
        `SELECT SCORE FROM EDUX.EXAM_RESULTS WHERE U_ID = :userId`,
        { userId: parseInt(userId) }
      ),
      connection.execute(
        `SELECT COUNT(*) FROM EDUX.COURSE_RATING WHERE U_ID = :userId`,
        { userId: parseInt(userId) }
      ),
      connection.execute(
        `SELECT COUNT(*) FROM EDUX.DISCUSSIONS WHERE U_ID = :userId`,
        { userId: parseInt(userId) }
      ),
    ]);

    const completedCourses = completedResult.rows[0]?.[0] || 0;
    const earnedBadges = badgesResult.rows.map((r) => r[0]);
    const examScores = examResult.rows.map((r) => r[0]);
    const reviewCount = reviewResult.rows[0]?.[0] || 0;
    const discussionCount = discussionResult.rows[0]?.[0] || 0;

    // Get streak
    const activityResult = await connection.execute(
      `SELECT DISTINCT TRUNC(ACTIVITY_DATE) FROM EDUX.USER_ACTIVITY WHERE U_ID = :userId ORDER BY 1 DESC`,
      { userId: parseInt(userId) }
    );
    const activityDates = activityResult.rows.map((r) => r[0]);
    const streak = calculateStreak(activityDates);

    // Check eligibility
    const newBadges = checkBadgeEligibility({
      completedCourses,
      streak,
      examScores,
      reviewCount,
      discussionCount,
      upvotes: 0, // Would need separate tracking
      earnedBadges,
    });

    // Award new badges
    const awarded = [];
    for (const badge of newBadges) {
      try {
        await connection.execute(
          `INSERT INTO EDUX.USER_BADGES (U_ID, BADGE_ID, EARNED_AT) VALUES (:userId, :badgeId, SYSDATE)`,
          { userId: parseInt(userId), badgeId: badge.id },
          { autoCommit: true }
        );
        await connection.execute(
          `INSERT INTO EDUX.USER_XP (U_ID, XP_AMOUNT, ACTION, EARNED_AT) VALUES (:userId, :xp, :action, SYSDATE)`,
          { userId: parseInt(userId), xp: badge.xp, action: `badge:${badge.id}` },
          { autoCommit: true }
        );
        awarded.push(badge);
      } catch (e) {
        // Badge already exists
      }
    }

    return res.status(200).json({
      success: true,
      newBadges: awarded,
      totalAwarded: awarded.length,
    });
  } catch (error) {
    console.error('Check badges error:', error);
    return res.status(500).json({ error: 'Failed to check badges' });
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

// Log user activity (for streaks)
async function logActivity(req, res) {
  const { userId, activityType = 'login' } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.execute(
      `INSERT INTO EDUX.USER_ACTIVITY (U_ID, ACTIVITY_TYPE, ACTIVITY_DATE)
       VALUES (:userId, :activityType, SYSDATE)`,
      { userId: parseInt(userId), activityType },
      { autoCommit: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Log activity error:', error);
    return res.status(500).json({ error: 'Failed to log activity' });
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

// Helper function to format row
function formatRow(row, metaData) {
  const formatted = {};
  metaData.forEach((col, index) => {
    const key = col.name.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    formatted[key] = row[index];
  });
  return formatted;
}
