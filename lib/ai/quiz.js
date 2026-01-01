// AI Quiz Question Generator

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Generate quiz questions for a topic
 */
export async function generateQuizQuestions(topic, lectures = [], options = {}) {
  const {
    questionCount = 5,
    difficulty = 'mixed',
    questionTypes = ['multiple_choice'],
  } = options;

  if (!AI_FEATURES.QUIZ_GENERATOR) {
    return getDefaultQuestions(topic, questionCount);
  }

  try {
    const lectureContent = lectures.map(l => l.description).join(', ');

    const prompt = `
Generate ${questionCount} quiz questions for this topic:

Topic: ${topic.name}
Lecture Content: ${lectureContent || topic.name}
Difficulty: ${difficulty}

Requirements:
- Questions should test understanding, not just memorization
- Include a mix of conceptual and applied questions
- Each question must have exactly 4 options (A, B, C, D)
- Provide clear explanations for correct answers

Return as JSON:
{
  "questions": [
    {
      "id": <sequential number>,
      "question": "<question text>",
      "options": {
        "A": "<option A>",
        "B": "<option B>",
        "C": "<option C>",
        "D": "<option D>"
      },
      "correct_answer": "<A, B, C, or D>",
      "explanation": "<why this answer is correct>",
      "difficulty": "<easy|medium|hard>",
      "concept_tested": "<what concept this tests>"
    }
  ]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.QUIZ_GENERATOR, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed && parsed.questions) {
      return {
        success: true,
        questions: parsed.questions.map((q, i) => ({
          ...q,
          id: i + 1,
          generated: true,
        })),
        aiGenerated: true,
      };
    }

    return getDefaultQuestions(topic, questionCount);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return getDefaultQuestions(topic, questionCount);
  }
}

/**
 * Generate practice questions based on user's weak areas
 */
export async function generatePracticeQuestions(userId, weakAreas, options = {}) {
  const { questionCount = 10 } = options;

  if (!AI_FEATURES.QUIZ_GENERATOR || weakAreas.length === 0) {
    return {
      success: false,
      message: 'No weak areas identified or AI quiz generation disabled',
    };
  }

  try {
    const prompt = `
Generate ${questionCount} practice questions focused on these weak areas:
${weakAreas.map(area => `- ${area.topic}: ${area.description} (score: ${area.score}%)`).join('\n')}

Focus on areas with lower scores and create questions that help reinforce understanding.
Include varied difficulty levels with more easy/medium questions.

Return as JSON:
{
  "questions": [
    {
      "id": <number>,
      "question": "<question>",
      "options": { "A": "", "B": "", "C": "", "D": "" },
      "correct_answer": "<letter>",
      "explanation": "<explanation>",
      "targets_area": "<which weak area this addresses>"
    }
  ],
  "study_suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.QUIZ_GENERATOR, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed && parsed.questions) {
      return {
        success: true,
        questions: parsed.questions,
        studySuggestions: parsed.study_suggestions || [],
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Practice questions error:', error);
  }

  return {
    success: false,
    message: 'Failed to generate practice questions',
  };
}

/**
 * Generate questions from lecture content
 */
export async function generateLectureQuiz(lecture, options = {}) {
  const { questionCount = 3 } = options;

  if (!AI_FEATURES.QUIZ_GENERATOR) {
    return {
      success: true,
      questions: [{
        id: 1,
        question: `What is the main focus of "${lecture.description}"?`,
        options: {
          A: 'Understanding basic concepts',
          B: 'Practical application',
          C: 'Advanced techniques',
          D: 'Review and summary',
        },
        correct_answer: 'A',
        explanation: 'This lecture primarily covers foundational concepts.',
      }],
      aiGenerated: false,
    };
  }

  try {
    const prompt = `
Generate ${questionCount} quick comprehension questions for this lecture:

Lecture: ${lecture.description}

These should be quick check questions to ensure the student understood the key points.

Return as JSON:
{
  "questions": [
    {
      "id": <number>,
      "question": "<question>",
      "options": { "A": "", "B": "", "C": "", "D": "" },
      "correct_answer": "<letter>",
      "explanation": "<brief explanation>"
    }
  ]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.QUIZ_GENERATOR, prompt, {
      temperature: 0.8,
    });
    const parsed = aiService.parseJSON(response);

    if (parsed && parsed.questions) {
      return {
        success: true,
        questions: parsed.questions,
        aiGenerated: true,
      };
    }
  } catch (error) {
    console.error('Lecture quiz error:', error);
  }

  return {
    success: true,
    questions: [],
    aiGenerated: false,
  };
}

/**
 * Grade a free-form answer using AI
 */
export async function gradeAnswer(question, studentAnswer, correctAnswer) {
  try {
    const prompt = `
Grade this student's answer:

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${studentAnswer}

Evaluate and return as JSON:
{
  "score": <0-100>,
  "is_correct": <true/false>,
  "feedback": "<constructive feedback>",
  "missing_points": ["<what was missed>"],
  "strengths": ["<what was good>"]
}`;

    const response = await aiService.chat(SYSTEM_PROMPTS.QUIZ_GENERATOR, prompt);
    const parsed = aiService.parseJSON(response);

    if (parsed) {
      return {
        success: true,
        ...parsed,
        aiGraded: true,
      };
    }
  } catch (error) {
    console.error('Answer grading error:', error);
  }

  return {
    success: false,
    message: 'Could not grade answer automatically',
  };
}

/**
 * Default questions when AI is unavailable
 */
function getDefaultQuestions(topic, count = 5) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: i + 1,
      question: `Question ${i + 1} about ${topic.name}?`,
      options: {
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        D: 'Option D',
      },
      correct_answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      explanation: 'This tests understanding of core concepts.',
      difficulty: 'medium',
      generated: false,
    });
  }

  return {
    success: true,
    questions,
    aiGenerated: false,
    message: 'AI quiz generation is not available. Using placeholder questions.',
  };
}

export default { generateQuizQuestions, generatePracticeQuestions, generateLectureQuiz, gradeAnswer };
