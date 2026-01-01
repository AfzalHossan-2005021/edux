// AI Study Assistant Chatbot

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Chat with the AI study assistant
 */
export async function chat(message, context = {}) {
  if (!AI_FEATURES.CHATBOT) {
    return getDefaultResponse(message);
  }

  try {
    const {
      conversationHistory = [],
      currentCourse = null,
      currentTopic = null,
      userProgress = null,
    } = context;

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPTS.STUDY_ASSISTANT;
    
    if (currentCourse) {
      systemPrompt += `\n\nCurrent course context: "${currentCourse.title}" - ${currentCourse.description}`;
    }
    
    if (currentTopic) {
      systemPrompt += `\nCurrent topic: ${currentTopic.name}`;
    }
    
    if (userProgress) {
      systemPrompt += `\nStudent progress: ${userProgress.percentage}% complete`;
    }

    // Build messages array with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const response = await aiService.conversation(messages);

    return {
      success: true,
      message: response,
      aiGenerated: true,
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    return getDefaultResponse(message);
  }
}

/**
 * Get explanation for a concept
 */
export async function explainConcept(concept, options = {}) {
  const { level = 'beginner', courseContext = null } = options;

  if (!AI_FEATURES.CHATBOT) {
    return {
      success: true,
      explanation: `${concept} is an important topic to understand. Consider reviewing the course materials for more details.`,
      aiGenerated: false,
    };
  }

  try {
    const contextInfo = courseContext
      ? `In the context of the course "${courseContext.title}": `
      : '';

    const prompt = `
${contextInfo}Explain the concept of "${concept}" to a ${level} level student.

Provide:
1. A clear, simple explanation
2. A real-world analogy or example
3. Why it's important to understand
4. Common misconceptions to avoid

Keep the explanation engaging and easy to understand.`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);

    return {
      success: true,
      explanation: response,
      concept,
      level,
      aiGenerated: true,
    };
  } catch (error) {
    console.error('Concept explanation error:', error);
    return {
      success: true,
      explanation: `${concept} is an important topic. Check your course materials for detailed information.`,
      aiGenerated: false,
    };
  }
}

/**
 * Answer a course-related question
 */
export async function answerQuestion(question, courseContext = null) {
  if (!AI_FEATURES.CHATBOT) {
    return getDefaultResponse(question);
  }

  try {
    const contextPrompt = courseContext
      ? `The student is studying "${courseContext.title}" (${courseContext.description}). `
      : '';

    const prompt = `
${contextPrompt}

Student's question: ${question}

Provide a helpful, educational answer. If the question is about specific course content you don't have details about, acknowledge that and provide general guidance. Always be encouraging and educational.`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);

    return {
      success: true,
      answer: response,
      aiGenerated: true,
    };
  } catch (error) {
    console.error('Question answering error:', error);
    return getDefaultResponse(question);
  }
}

/**
 * Get study tips for a topic
 */
export async function getStudyTips(topic, userProgress = null) {
  if (!AI_FEATURES.CHATBOT) {
    return {
      success: true,
      tips: [
        'Review the lecture materials thoroughly',
        'Take notes while watching videos',
        'Practice with the quiz questions',
        'Apply concepts through hands-on exercises',
      ],
      aiGenerated: false,
    };
  }

  try {
    const progressInfo = userProgress
      ? `The student has completed ${userProgress}% of this topic.`
      : '';

    const prompt = `
Provide personalized study tips for learning "${topic}".
${progressInfo}

Return as JSON:
{
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "study_schedule": "<suggested study approach>",
  "resources": ["<helpful resource type 1>", "<resource type 2>"],
  "motivation": "<encouraging message>"
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        ...parsed,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Study tips error:', error);
  }

  return {
    success: true,
    tips: [
      'Break down the topic into smaller sections',
      'Use active recall techniques',
      'Review regularly to reinforce learning',
    ],
    aiGenerated: false,
  };
}

/**
 * Generate a study plan
 */
export async function generateStudyPlan(courses, preferences = {}) {
  const { hoursPerDay = 2, daysPerWeek = 5, goals = [] } = preferences;

  if (!AI_FEATURES.CHATBOT) {
    return {
      success: true,
      plan: {
        weekly_schedule: 'Study consistently each day',
        daily_routine: `Dedicate ${hoursPerDay} hours to learning`,
        tips: ['Stay consistent', 'Take breaks', 'Review regularly'],
      },
      aiGenerated: false,
    };
  }

  try {
    const courseList = courses.map(c => `- ${c.title} (${c.progress || 0}% complete)`).join('\n');
    const goalList = goals.length > 0 ? `Goals: ${goals.join(', ')}` : '';

    const prompt = `
Create a personalized study plan for this student:

Enrolled Courses:
${courseList}

Available Time: ${hoursPerDay} hours/day, ${daysPerWeek} days/week
${goalList}

Generate a practical study plan as JSON:
{
  "weekly_schedule": {
    "monday": "<activities>",
    "tuesday": "<activities>",
    "wednesday": "<activities>",
    "thursday": "<activities>",
    "friday": "<activities>"
  },
  "daily_routine": "<suggested daily structure>",
  "priority_order": ["<course 1>", "<course 2>"],
  "milestones": [
    {"week": 1, "goal": "<goal>"},
    {"week": 2, "goal": "<goal>"}
  ],
  "tips": ["<tip 1>", "<tip 2>"]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.STUDY_ASSISTANT, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        plan: parsed,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Study plan error:', error);
  }

  return {
    success: true,
    plan: {
      weekly_schedule: 'Distribute your study time evenly across courses',
      daily_routine: `Start with ${hoursPerDay} focused hours of study`,
      tips: ['Stay consistent', 'Take regular breaks', 'Track your progress'],
    },
    aiGenerated: false,
  };
}

/**
 * Default response when AI is unavailable
 */
function getDefaultResponse(message) {
  const responses = [
    "I'm here to help with your studies! While my AI features are limited right now, you can find detailed information in your course materials.",
    "Great question! I'd recommend checking the lecture videos and course documentation for more detailed information.",
    "That's an interesting topic! Review the relevant course sections for comprehensive coverage.",
  ];

  return {
    success: true,
    message: responses[Math.floor(Math.random() * responses.length)],
    aiGenerated: false,
  };
}

export default { chat, explainConcept, answerQuestion, getStudyTips, generateStudyPlan };
