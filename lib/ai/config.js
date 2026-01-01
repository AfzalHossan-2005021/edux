// AI Service Configuration
// Supports multiple AI providers: OpenAI, Google Gemini, or local alternatives

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  LOCAL: 'local', // For development/testing without API keys
};

// Get the current AI provider from environment
export const getAIProvider = () => {
  return process.env.AI_PROVIDER || AI_PROVIDERS.LOCAL;
};

// AI Configuration
export const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    embeddingModel: 'text-embedding-ada-002',
    maxTokens: 2000,
    temperature: 0.7,
  },
  
  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    maxTokens: 2000,
    temperature: 0.7,
  },
  
  // Local/Mock Configuration for development
  local: {
    enabled: true,
    delay: 500, // Simulate API delay
  },
};

// Feature flags for AI capabilities
export const AI_FEATURES = {
  RECOMMENDATIONS: process.env.ENABLE_AI_RECOMMENDATIONS !== 'false',
  SMART_SEARCH: process.env.ENABLE_AI_SEARCH !== 'false',
  COURSE_SUMMARY: process.env.ENABLE_AI_SUMMARY !== 'false',
  QUIZ_GENERATOR: process.env.ENABLE_AI_QUIZ !== 'false',
  CHATBOT: process.env.ENABLE_AI_CHATBOT !== 'false',
  ANALYTICS: process.env.ENABLE_AI_ANALYTICS !== 'false',
};

// System prompts for different AI features
export const SYSTEM_PROMPTS = {
  COURSE_RECOMMENDATION: `You are an intelligent course recommendation system for EduX, an online learning platform. 
Your job is to analyze user learning history, interests, and goals to suggest the most relevant courses.
Always provide recommendations in JSON format with course_ids, reasons, and confidence scores.`,

  SMART_SEARCH: `You are a smart search assistant for EduX learning platform.
Convert natural language queries into structured search parameters.
Extract: topics, difficulty level, duration preferences, and learning goals.
Return results as JSON with search_params and suggested_courses.`,

  COURSE_SUMMARY: `You are an expert educational content summarizer.
Create concise, informative summaries of course content that highlight:
- Key learning objectives
- Main topics covered
- Skills gained
- Prerequisites if any
Keep summaries engaging and informative.`,

  QUIZ_GENERATOR: `You are an expert quiz question generator for educational content.
Generate high-quality multiple choice questions that test understanding, not just memorization.
Each question should have:
- Clear question text
- 4 options (A, B, C, D)
- Correct answer
- Brief explanation
Return questions in JSON format.`,

  STUDY_ASSISTANT: `You are EduBot, a friendly and knowledgeable AI study assistant for EduX platform.
Help students with:
- Explaining concepts from their courses
- Answering questions about topics
- Providing study tips and strategies
- Clarifying confusing material
Be encouraging, patient, and educational in your responses.`,

  LEARNING_ANALYTICS: `You are a learning analytics AI that analyzes student progress data.
Provide insights about:
- Learning patterns and habits
- Predicted completion times
- Areas needing improvement
- Personalized study recommendations
Return analysis in structured JSON format.`,
};
