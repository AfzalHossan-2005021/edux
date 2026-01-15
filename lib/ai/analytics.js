// Learning Analytics and Progress Tracking

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Analyze student learning patterns
 */
export async function analyzeLearningPatterns(userData) {
  const {
    enrolledCourses = [],
    completedLectures = [],
    quizResults = [],
    studyTime = [],
    loginHistory = [],
  } = userData;

  // Calculate basic metrics
  const metrics = calculateBasicMetrics(userData);

  if (!AI_FEATURES.ANALYTICS) {
    return {
      success: true,
      metrics,
      insights: getDefaultInsights(metrics),
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Analyze this student's learning data and provide personalized insights:

Enrolled Courses: ${enrolledCourses.length}
Completed Lectures: ${completedLectures.length}
Quiz Average: ${metrics.avgQuizScore}%
Study Streak: ${metrics.studyStreak} days
Total Study Time: ${metrics.totalStudyHours} hours
Peak Study Time: ${metrics.peakStudyTime}
Course Completion Rate: ${metrics.completionRate}%

Provide analysis as JSON:
{
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_for_improvement": ["<area 1>", "<area 2>"],
  "learning_style": "<identified learning style>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "predicted_success": "<likelihood of achieving goals>",
  "motivation_level": "<assessment of motivation>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const analysis = aiService.parseJSON(response);

    if (analysis) {
      return {
        success: true,
        metrics,
        insights: analysis,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Learning analysis error:', error);
  }

  return {
    success: true,
    metrics,
    insights: getDefaultInsights(metrics),
    aiGenerated: false,
  };
}

/**
 * Generate progress report
 */
export async function generateProgressReport(userData, period = 'weekly') {
  const metrics = calculateBasicMetrics(userData);

  if (!AI_FEATURES.ANALYTICS) {
    return {
      success: true,
      report: generateDefaultReport(metrics, period),
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Generate a ${period} progress report for this student:

Courses Progress:
${userData.enrolledCourses?.map(c => `- ${c.title}: ${c.progress || 0}% complete`).join('\n') || 'No courses enrolled'}

Performance Metrics:
- Quiz Average: ${metrics.avgQuizScore}%
- Lectures Completed: ${metrics.lecturesCompleted}
- Study Time: ${metrics.totalStudyHours} hours
- Completion Rate: ${metrics.completionRate}%

Create an encouraging and actionable report as JSON:
{
  "summary": "<overall summary>",
  "achievements": ["<achievement 1>", "<achievement 2>"],
  "areas_improved": ["<area 1>"],
  "challenges": ["<challenge 1>"],
  "next_steps": ["<action 1>", "<action 2>"],
  "encouragement": "<motivational message>",
  "grade": "<A/B/C/D based on overall performance>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const report = aiService.parseJSON(response);

    if (report) {
      return {
        success: true,
        report: {
          ...report,
          period,
          metrics,
          generatedAt: new Date().toISOString(),
        },
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Progress report error:', error);
  }

  return {
    success: true,
    report: generateDefaultReport(metrics, period),
    aiGenerated: false,
  };
}

/**
 * Predict course completion
 */
export async function predictCompletion(courseData, userHistory) {
  const currentProgress = courseData.progress || 0;
  const totalLectures = courseData.totalLectures || 10;
  const completedLectures = courseData.completedLectures || 0;

  // Simple estimation
  const avgPacePerWeek = userHistory.avgLecturesPerWeek || 2;
  const remainingLectures = totalLectures - completedLectures;
  const estimatedWeeks = Math.ceil(remainingLectures / avgPacePerWeek);

  const prediction = {
    estimatedWeeksToComplete: estimatedWeeks,
    currentProgress,
    remainingLectures,
    estimatedCompletionDate: new Date(Date.now() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 'medium',
  };

  if (!AI_FEATURES.ANALYTICS) {
    return {
      success: true,
      prediction,
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Predict course completion for this student:

Course: ${courseData.title}
Current Progress: ${currentProgress}%
Completed Lectures: ${completedLectures}/${totalLectures}
Average Study Pace: ${avgPacePerWeek} lectures/week
Previous Course Completions: ${userHistory.completedCourses || 0}
Average Quiz Score: ${userHistory.avgQuizScore || 0}%

Provide prediction as JSON:
{
  "estimated_weeks": <number>,
  "confidence": "<high/medium/low>",
  "factors_affecting": ["<factor 1>", "<factor 2>"],
  "recommendations_to_speed_up": ["<tip 1>", "<tip 2>"],
  "risk_of_abandonment": "<high/medium/low>",
  "mitigation_strategies": ["<strategy 1>"]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const aiPrediction = aiService.parseJSON(response);

    if (aiPrediction) {
      return {
        success: true,
        prediction: {
          ...prediction,
          ...aiPrediction,
        },
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Completion prediction error:', error);
  }

  return {
    success: true,
    prediction,
    aiGenerated: false,
  };
}

/**
 * Get performance comparison
 */
export async function getPerformanceComparison(userMetrics, cohortMetrics) {
  const comparison = {
    userScore: userMetrics.avgQuizScore || 0,
    cohortAverage: cohortMetrics.avgQuizScore || 70,
    percentile: calculatePercentile(userMetrics.avgQuizScore, cohortMetrics),
    completionRate: {
      user: userMetrics.completionRate || 0,
      cohort: cohortMetrics.avgCompletionRate || 50,
    },
    studyTime: {
      user: userMetrics.totalStudyHours || 0,
      cohort: cohortMetrics.avgStudyHours || 20,
    },
  };

  if (!AI_FEATURES.ANALYTICS) {
    return {
      success: true,
      comparison,
      insights: ['Your progress is being tracked', 'Keep up the good work'],
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Compare this student's performance to their peer group:

Student Metrics:
- Quiz Average: ${comparison.userScore}%
- Completion Rate: ${comparison.completionRate.user}%
- Study Time: ${comparison.studyTime.user} hours
- Percentile: ${comparison.percentile}th

Cohort Averages:
- Quiz Average: ${comparison.cohortAverage}%
- Completion Rate: ${comparison.completionRate.cohort}%
- Average Study Time: ${comparison.studyTime.cohort} hours

Provide insights as JSON (be encouraging, not discouraging):
{
  "performance_level": "<above average/average/below average>",
  "ranking_insight": "<contextual insight about their ranking>",
  "strengths_vs_peers": ["<strength 1>"],
  "improvement_opportunities": ["<opportunity 1>"],
  "peer_comparison_summary": "<brief summary>",
  "encouragement": "<motivational message>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const insights = aiService.parseJSON(response);

    if (insights) {
      return {
        success: true,
        comparison,
        insights,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Performance comparison error:', error);
  }

  return {
    success: true,
    comparison,
    insights: {
      performance_level: comparison.percentile > 50 ? 'above average' : 'average',
      encouragement: 'Keep learning and improving!',
    },
    aiGenerated: false,
  };
}

/**
 * Calculate basic metrics from user data
 */
function calculateBasicMetrics(userData) {
  const quizResults = userData.quizResults || [];
  const completedLectures = userData.completedLectures || [];
  const enrolledCourses = userData.enrolledCourses || [];
  const studyTime = userData.studyTime || [];
  const loginHistory = userData.loginHistory || [];

  // Quiz average
  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length)
    : 0;

  // Total study time
  const totalStudyHours = Math.round(
    studyTime.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  );

  // Study streak
  const studyStreak = calculateStudyStreak(loginHistory);

  // Completion rate
  const totalLectures = enrolledCourses.reduce((sum, c) => sum + (c.totalLectures || 0), 0);
  const completionRate = totalLectures > 0
    ? Math.round((completedLectures.length / totalLectures) * 100)
    : 0;

  // Peak study time
  const peakStudyTime = calculatePeakStudyTime(studyTime);

  return {
    avgQuizScore,
    totalStudyHours,
    studyStreak,
    completionRate,
    peakStudyTime,
    lecturesCompleted: completedLectures.length,
    coursesEnrolled: enrolledCourses.length,
  };
}

/**
 * Calculate study streak
 */
function calculateStudyStreak(loginHistory) {
  if (!loginHistory || loginHistory.length === 0) return 0;

  const sortedDates = loginHistory
    .map(l => new Date(l.date).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = (current - next) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak + 1;
}

/**
 * Calculate peak study time
 */
function calculatePeakStudyTime(studyTime) {
  if (!studyTime || studyTime.length === 0) return 'Not enough data';

  const hourCounts = {};
  studyTime.forEach(s => {
    const hour = new Date(s.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0];

  if (!peakHour) return 'Varied';

  const hour = parseInt(peakHour[0]);
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

/**
 * Calculate percentile
 */
function calculatePercentile(userScore, cohortMetrics) {
  // Simplified percentile calculation
  const cohortAvg = cohortMetrics.avgQuizScore || 70;
  const standardDev = cohortMetrics.standardDev || 15;
  
  const zScore = (userScore - cohortAvg) / standardDev;
  // Approximate percentile from z-score
  const percentile = Math.round(50 * (1 + Math.min(Math.max(zScore / 3, -1), 1)));
  
  return Math.min(99, Math.max(1, percentile));
}

/**
 * Get default insights
 */
function getDefaultInsights(metrics) {
  const insights = {
    strengths: [],
    areas_for_improvement: [],
    recommendations: [],
  };

  if (metrics.avgQuizScore >= 80) {
    insights.strengths.push('Strong quiz performance');
  } else {
    insights.areas_for_improvement.push('Quiz scores could improve with more practice');
  }

  if (metrics.studyStreak >= 7) {
    insights.strengths.push('Excellent study consistency');
  } else {
    insights.recommendations.push('Try to study a little each day to build a streak');
  }

  if (metrics.completionRate >= 70) {
    insights.strengths.push('Good course completion rate');
  } else {
    insights.recommendations.push('Focus on completing current courses before starting new ones');
  }

  return insights;
}

/**
 * Generate default report
 */
function generateDefaultReport(metrics, period) {
  return {
    summary: `This ${period} you've been making progress in your learning journey.`,
    metrics,
    achievements: metrics.studyStreak > 0 ? [`${metrics.studyStreak} day study streak`] : [],
    next_steps: [
      'Continue with your current courses',
      'Review any challenging concepts',
      'Take practice quizzes',
    ],
    encouragement: 'Keep up the great work! Consistent effort leads to success.',
    period,
    generatedAt: new Date().toISOString(),
  };
}

export default {
  analyzeLearningPatterns,
  generateProgressReport,
  predictCompletion,
  getPerformanceComparison,
};
