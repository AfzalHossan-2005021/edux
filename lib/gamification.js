/**
 * Gamification Library
 * Badges, XP, streaks, and leaderboards
 */

// Badge Types
export const BadgeTypes = {
  // Achievement Badges
  FIRST_COURSE: {
    id: 'first_course',
    name: 'First Steps',
    description: 'Enrolled in your first course',
    icon: '🎯',
    xp: 50,
    category: 'milestone',
  },
  FAST_LEARNER: {
    id: 'fast_learner',
    name: 'Fast Learner',
    description: 'Completed a course in under a week',
    icon: '⚡',
    xp: 100,
    category: 'achievement',
  },
  COURSE_COMPLETE: {
    id: 'course_complete',
    name: 'Graduate',
    description: 'Completed a course',
    icon: '🎓',
    xp: 200,
    category: 'milestone',
  },
  FIVE_COURSES: {
    id: 'five_courses',
    name: 'Knowledge Seeker',
    description: 'Completed 5 courses',
    icon: '📚',
    xp: 500,
    category: 'milestone',
  },
  TEN_COURSES: {
    id: 'ten_courses',
    name: 'Scholar',
    description: 'Completed 10 courses',
    icon: '🏆',
    xp: 1000,
    category: 'milestone',
  },
  
  // Streak Badges
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day learning streak',
    icon: '🔥',
    xp: 70,
    category: 'streak',
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day learning streak',
    icon: '💫',
    xp: 300,
    category: 'streak',
  },
  STREAK_100: {
    id: 'streak_100',
    name: 'Century Club',
    description: '100-day learning streak',
    icon: '👑',
    xp: 1000,
    category: 'streak',
  },
  
  // Exam Badges
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Score 100% on an exam',
    icon: '💯',
    xp: 150,
    category: 'achievement',
  },
  EXAM_ACE: {
    id: 'exam_ace',
    name: 'Exam Ace',
    description: 'Pass 10 exams with 90%+ score',
    icon: '🌟',
    xp: 500,
    category: 'achievement',
  },
  
  // Social Badges
  FIRST_REVIEW: {
    id: 'first_review',
    name: 'Reviewer',
    description: 'Left your first course review',
    icon: '✍️',
    xp: 30,
    category: 'social',
  },
  HELPFUL: {
    id: 'helpful',
    name: 'Helpful',
    description: 'Received 10 upvotes on discussions',
    icon: '🤝',
    xp: 100,
    category: 'social',
  },
  DISCUSSION_STARTER: {
    id: 'discussion_starter',
    name: 'Discussion Starter',
    description: 'Started 5 discussions',
    icon: '💬',
    xp: 75,
    category: 'social',
  },
};

// XP Levels
export const XPLevels = [
  { level: 1, minXP: 0, title: 'Beginner' },
  { level: 2, minXP: 100, title: 'Learner' },
  { level: 3, minXP: 300, title: 'Student' },
  { level: 4, minXP: 600, title: 'Apprentice' },
  { level: 5, minXP: 1000, title: 'Intermediate' },
  { level: 6, minXP: 1500, title: 'Advanced' },
  { level: 7, minXP: 2500, title: 'Expert' },
  { level: 8, minXP: 4000, title: 'Master' },
  { level: 9, minXP: 6000, title: 'Grandmaster' },
  { level: 10, minXP: 10000, title: 'Legend' },
];

// XP Actions
export const XPActions = {
  WATCH_LECTURE: 10,
  COMPLETE_LECTURE: 25,
  PASS_EXAM: 50,
  ACE_EXAM: 100,
  COMPLETE_COURSE: 200,
  LEAVE_REVIEW: 20,
  POST_DISCUSSION: 15,
  REPLY_DISCUSSION: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10, // Per day in streak
};

// Get user level from XP
export function getUserLevel(totalXP) {
  let currentLevel = XPLevels[0];
  
  for (const level of XPLevels) {
    if (totalXP >= level.minXP) {
      currentLevel = level;
    } else {
      break;
    }
  }
  
  const nextLevel = XPLevels.find((l) => l.minXP > totalXP);
  const xpForNext = nextLevel ? nextLevel.minXP - totalXP : 0;
  const progress = nextLevel
    ? ((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
    : 100;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXP: totalXP,
    nextLevelXP: nextLevel?.minXP || totalXP,
    xpToNextLevel: xpForNext,
    progress: Math.round(progress),
    isMaxLevel: !nextLevel,
  };
}

// Calculate streak
export function calculateStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return 0;
  
  const sortedDates = activityDates
    .map((d) => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  
  const uniqueDates = [...new Set(sortedDates)];
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;
  
  // Check if streak is active (activity today or yesterday)
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = uniqueDates[0];
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = currentDate - 86400000;
    if (uniqueDates[i] === prevDate) {
      streak++;
      currentDate = uniqueDates[i];
    } else {
      break;
    }
  }
  
  return streak;
}

// Check badge eligibility
export function checkBadgeEligibility(userStats) {
  const newBadges = [];
  const { completedCourses, streak, examScores, reviewCount, discussionCount, upvotes, earnedBadges = [] } = userStats;
  
  // First course
  if (completedCourses >= 1 && !earnedBadges.includes('first_course')) {
    newBadges.push(BadgeTypes.FIRST_COURSE);
  }
  
  // Course milestones
  if (completedCourses >= 1 && !earnedBadges.includes('course_complete')) {
    newBadges.push(BadgeTypes.COURSE_COMPLETE);
  }
  if (completedCourses >= 5 && !earnedBadges.includes('five_courses')) {
    newBadges.push(BadgeTypes.FIVE_COURSES);
  }
  if (completedCourses >= 10 && !earnedBadges.includes('ten_courses')) {
    newBadges.push(BadgeTypes.TEN_COURSES);
  }
  
  // Streak badges
  if (streak >= 7 && !earnedBadges.includes('streak_7')) {
    newBadges.push(BadgeTypes.STREAK_7);
  }
  if (streak >= 30 && !earnedBadges.includes('streak_30')) {
    newBadges.push(BadgeTypes.STREAK_30);
  }
  if (streak >= 100 && !earnedBadges.includes('streak_100')) {
    newBadges.push(BadgeTypes.STREAK_100);
  }
  
  // Exam badges
  if (examScores?.some((s) => s === 100) && !earnedBadges.includes('perfect_score')) {
    newBadges.push(BadgeTypes.PERFECT_SCORE);
  }
  if (examScores?.filter((s) => s >= 90).length >= 10 && !earnedBadges.includes('exam_ace')) {
    newBadges.push(BadgeTypes.EXAM_ACE);
  }
  
  // Social badges
  if (reviewCount >= 1 && !earnedBadges.includes('first_review')) {
    newBadges.push(BadgeTypes.FIRST_REVIEW);
  }
  if (upvotes >= 10 && !earnedBadges.includes('helpful')) {
    newBadges.push(BadgeTypes.HELPFUL);
  }
  if (discussionCount >= 5 && !earnedBadges.includes('discussion_starter')) {
    newBadges.push(BadgeTypes.DISCUSSION_STARTER);
  }
  
  return newBadges;
}

// Format XP display
export function formatXP(xp) {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Get leaderboard rank title
export function getRankTitle(rank) {
  if (rank === 1) return '🥇 Champion';
  if (rank === 2) return '🥈 Runner-up';
  if (rank === 3) return '🥉 Third Place';
  if (rank <= 10) return '🏅 Top 10';
  if (rank <= 50) return '⭐ Top 50';
  if (rank <= 100) return '✨ Top 100';
  return 'Participant';
}

// Calculate daily bonus
export function calculateDailyBonus(streak) {
  const baseBonus = XPActions.DAILY_LOGIN;
  const streakBonus = Math.min(streak, 30) * XPActions.STREAK_BONUS;
  return {
    base: baseBonus,
    streak: streakBonus,
    total: baseBonus + streakBonus,
  };
}
