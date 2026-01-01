// AI Course Recommendations Engine

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Get personalized course recommendations for a user
 */
export async function getRecommendations(userHistory, availableCourses, limit = 5) {
  if (!AI_FEATURES.RECOMMENDATIONS) {
    return getFallbackRecommendations(availableCourses, limit);
  }

  try {
    const userContext = buildUserContext(userHistory);
    const courseContext = buildCourseContext(availableCourses);

    const prompt = `
User Profile:
${userContext}

Available Courses:
${courseContext}

Based on the user's learning history, enrolled courses, and preferences, recommend the top ${limit} most relevant courses they haven't enrolled in yet.

Return your response as JSON in this exact format:
{
  "recommendations": [
    {
      "course_id": <number>,
      "title": "<course title>",
      "reason": "<personalized reason for recommendation>",
      "confidence": <0.0 to 1.0>,
      "match_factors": ["<factor1>", "<factor2>"]
    }
  ],
  "learning_path_suggestion": "<brief suggestion for their learning journey>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.COURSE_RECOMMENDATION, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed && parsed.recommendations) {
      return {
        success: true,
        recommendations: parsed.recommendations,
        learningPath: parsed.learning_path_suggestion,
        aiGenerated: true,
      };
    }

    return getFallbackRecommendations(availableCourses, limit);
  } catch (error) {
    console.error('AI Recommendation error:', error);
    return getFallbackRecommendations(availableCourses, limit);
  }
}

/**
 * Build user context for AI prompt
 */
function buildUserContext(userHistory) {
  const { enrolledCourses = [], completedCourses = [], searchHistory = [], preferences = {} } = userHistory || {};
  
  let context = '';
  
  if (enrolledCourses && enrolledCourses.length > 0) {
    context += `Currently enrolled in: ${enrolledCourses.map(c => c.title || c.name).join(', ')}\n`;
  }
  
  if (completedCourses && completedCourses.length > 0) {
    context += `Completed courses: ${completedCourses.map(c => c.title || c.name).join(', ')}\n`;
  }
  
  if (searchHistory && searchHistory.length > 0) {
    context += `Recent searches: ${searchHistory.slice(0, 5).join(', ')}\n`;
  }
  
  if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
    context += `Preferred categories: ${preferences.preferredCategories.join(', ')}\n`;
  }

  return context || 'New user with no learning history yet.';
}

/**
 * Build course context for AI prompt
 */
function buildCourseContext(courses) {
  if (!courses || !Array.isArray(courses)) return 'No courses available.';
  return courses.map(c => 
    `- ID: ${c.id || c.c_id}, Title: "${c.title}", Field: ${c.category || c.field || 'General'}, Rating: ${c.rating || 'N/A'}`
  ).join('\n');
}

/**
 * Fallback recommendations when AI is unavailable
 */
function getFallbackRecommendations(courses, limit = 5) {
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return {
      success: true,
      recommendations: [],
      learningPath: 'No courses available at this time.',
      aiGenerated: false,
    };
  }

  // Sort by rating and return top courses
  const sorted = [...courses].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });

  return {
    success: true,
    recommendations: sorted.slice(0, limit).map((c, i) => ({
      course_id: c.id || c.c_id,
      title: c.title,
      reason: i === 0 ? 'Highly rated course' : 'Popular among learners',
      confidence: 0.7 - (i * 0.1),
      match_factors: ['popularity', 'rating'],
    })),
    learningPath: 'Explore our top-rated courses to start your learning journey!',
    aiGenerated: false,
  };
}

/**
 * Get similar courses based on a course
 */
export async function getSimilarCourses(courseDetails, allCourses, limit = 4) {
  if (!allCourses || !Array.isArray(allCourses)) {
    return { success: true, similar: [], aiGenerated: false };
  }

  const courseId = courseDetails.id || courseDetails.c_id;

  if (!AI_FEATURES.RECOMMENDATIONS) {
    const similar = allCourses
      .filter(c => (c.id || c.c_id) !== courseId && (c.category || c.field) === (courseDetails.category || courseDetails.field))
      .slice(0, limit);
    return { success: true, similar, aiGenerated: false };
  }

  try {
    const prompt = `
Current Course:
- Title: ${courseDetails.title}
- Description: ${courseDetails.description}
- Field: ${courseDetails.category || courseDetails.field}

Other Available Courses:
${buildCourseContext(allCourses.filter(c => (c.id || c.c_id) !== courseId))}

Find the ${limit} most similar courses based on content, topic overlap, and learning progression.
Return as JSON: { "similar_courses": [{ "course_id": <id>, "similarity_reason": "<reason>" }] }`;

    const response = await aiService.chat(SYSTEM_PROMPTS.COURSE_RECOMMENDATION, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed && parsed.similar_courses) {
      const similar = parsed.similar_courses.map(sc => ({
        ...allCourses.find(c => (c.id || c.c_id) === sc.course_id),
        similarityReason: sc.similarity_reason,
      })).filter(Boolean);
      return { success: true, similar, aiGenerated: true };
    }
  } catch (error) {
    console.error('Similar courses error:', error);
  }

  // Fallback: return courses from same field
  const similar = allCourses
    .filter(c => (c.id || c.c_id) !== courseId && (c.category || c.field) === (courseDetails.category || courseDetails.field))
    .slice(0, limit);
  return { success: true, similar, aiGenerated: false };
}

export default { getRecommendations, getSimilarCourses };
