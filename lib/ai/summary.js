// AI Course Summary Generator

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Generate an AI summary for a course
 */
export async function generateCourseSummary(course, topics = []) {
  if (!AI_FEATURES.COURSE_SUMMARY) {
    return getDefaultSummary(course);
  }

  try {
    const topicsInfo = topics.length > 0
      ? `Topics covered:\n${topics.map(t => `- ${t.name}`).join('\n')}`
      : '';

    const prompt = `
Generate a comprehensive yet concise summary for this online course:

Course Title: ${course.title}
Field: ${course.field || 'General'}
Description: ${course.description || 'No description provided'}
${topicsInfo}
Number of enrolled students: ${course.student_count || 0}
Rating: ${course.rating || 'Not yet rated'}

Create a summary that includes:
1. A brief overview (2-3 sentences)
2. Key learning objectives (3-5 bullet points)
3. Who this course is for
4. Prerequisites (if apparent from the content)
5. Expected outcomes

Format the response as JSON:
{
  "overview": "<brief overview>",
  "learning_objectives": ["<objective 1>", "<objective 2>"],
  "target_audience": "<who should take this course>",
  "prerequisites": ["<prerequisite 1>"] or [],
  "expected_outcomes": ["<outcome 1>", "<outcome 2>"],
  "estimated_duration": "<estimated time to complete>",
  "difficulty_level": "<beginner|intermediate|advanced>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.COURSE_SUMMARY, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        summary: parsed,
        aiGenerated: true,
      };
    }

    return getDefaultSummary(course);
  } catch (error) {
    console.error('Course summary error:', error);
    return getDefaultSummary(course);
  }
}

/**
 * Generate a topic summary
 */
export async function generateTopicSummary(topic, lectures = [], exam = null) {
  if (!AI_FEATURES.COURSE_SUMMARY) {
    return getDefaultTopicSummary(topic);
  }

  try {
    const lectureInfo = lectures.length > 0
      ? `Lectures:\n${lectures.map(l => `- ${l.description}`).join('\n')}`
      : '';

    const examInfo = exam
      ? `Has exam with ${exam.question_count} questions, ${exam.duration} minutes`
      : 'No exam';

    const prompt = `
Summarize this course topic:

Topic: ${topic.name}
${lectureInfo}
${examInfo}

Provide a concise summary as JSON:
{
  "summary": "<2-3 sentence summary>",
  "key_concepts": ["<concept 1>", "<concept 2>"],
  "study_tips": ["<tip 1>", "<tip 2>"],
  "estimated_time": "<time to complete>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.COURSE_SUMMARY, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        summary: parsed,
        aiGenerated: true,
      };
    }

    return getDefaultTopicSummary(topic);
  } catch (error) {
    console.error('Topic summary error:', error);
    return getDefaultTopicSummary(topic);
  }
}

/**
 * Generate lecture notes/summary
 */
export async function generateLectureSummary(lecture, topicContext = '') {
  if (!AI_FEATURES.COURSE_SUMMARY) {
    return {
      success: true,
      summary: `This lecture covers: ${lecture.description}`,
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Create study notes for this lecture:

Lecture: ${lecture.description}
Part of topic: ${topicContext}
Duration weight: ${lecture.weight}

Generate helpful study notes as JSON:
{
  "summary": "<brief summary>",
  "key_points": ["<point 1>", "<point 2>"],
  "notes": "<detailed notes for studying>",
  "review_questions": ["<question 1>", "<question 2>"]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.COURSE_SUMMARY, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        summary: parsed,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Lecture summary error:', error);
  }

  return {
    success: true,
    summary: `This lecture covers: ${lecture.description}`,
    aiGenerated: false,
  };
}

/**
 * Default summary when AI is unavailable
 */
function getDefaultSummary(course) {
  return {
    success: true,
    summary: {
      overview: course.description || `Learn essential skills in ${course.title}.`,
      learning_objectives: [
        'Understand fundamental concepts',
        'Apply knowledge through practical exercises',
        'Build real-world skills',
      ],
      target_audience: 'Students interested in this subject area',
      prerequisites: [],
      expected_outcomes: [
        'Solid understanding of core concepts',
        'Practical skills for real-world application',
      ],
      estimated_duration: 'Varies based on learning pace',
      difficulty_level: 'intermediate',
    },
    aiGenerated: false,
  };
}

/**
 * Default topic summary
 */
function getDefaultTopicSummary(topic) {
  return {
    success: true,
    summary: {
      summary: `This topic covers ${topic.name}.`,
      key_concepts: ['Core concepts', 'Practical applications'],
      study_tips: ['Review lecture materials', 'Practice with exercises'],
      estimated_time: '1-2 hours',
    },
    aiGenerated: false,
  };
}

export default { generateCourseSummary, generateTopicSummary, generateLectureSummary };
