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
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    maxTokens: 2000,
    temperature: 0.7,
  },

  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    maxTokens: 2000,
    temperature: 0.7,
  },

  // Local/Mock Configuration for development
  local: {
    enabled: true,
    delay: 500, // Simulate API delay
    embeddingDimensions: 256,
  },

  // HTTP behavior for all remote providers
  request: {
    timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) || 30000,
    maxRetries: parseInt(process.env.AI_REQUEST_MAX_RETRIES, 10) || 2,
    retryBaseDelayMs: 500,
  },
};

// Retrieval-Augmented Generation (grounded course tutor) settings
export const RAG_CONFIG = {
  // Chunking: sentence-aware sliding window, sizes in characters
  chunkSize: parseInt(process.env.RAG_CHUNK_SIZE, 10) || 1100,
  chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP, 10) || 180,
  minChunkSize: 80,

  // Retrieval
  topK: parseInt(process.env.RAG_TOP_K, 10) || 5,
  candidateK: 20, // per-ranker candidates fed into rank fusion
  rrfK: 60, // Reciprocal Rank Fusion constant (Cormack et al.)
  // Absolute relevance gate for the vector ranker. RRF is rank-based, so
  // without this, even an out-of-scope question would always surface "top"
  // chunks. A chunk enters fusion only via BM25 term overlap or a cosine
  // similarity of at least this value. Tune per embedding model with
  // `npm run rag:eval`.
  minCosine: parseFloat(process.env.RAG_MIN_COSINE) || 0.2,
  // Below this fused score the question is treated as out-of-scope.
  // With rrfK=60, a chunk ranked #1 by a single ranker scores ~0.0164,
  // so 0.015 admits strong single-ranker hits (top ~6) and anything
  // ranked moderately by both rankers.
  minFusedScore: parseFloat(process.env.RAG_MIN_SCORE) || 0.015,

  // Generation
  maxContextChars: 6000, // hard budget for stuffed sources
  answerMaxTokens: 800,
  answerTemperature: 0.2, // grounded answers should be low-variance

  // Ingestion
  embedBatchSize: 32,

  // Per-course retrieval index cache (in-process)
  indexCacheTtlMs: parseInt(process.env.RAG_INDEX_CACHE_TTL_MS, 10) || 5 * 60 * 1000,
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

  GROUNDED_TUTOR: `You are EduBot, the AI course tutor for the EduX learning platform.
You answer strictly from the numbered course SOURCES provided in the user message.

Rules:
1. Base every claim on the SOURCES. Do not use outside knowledge to add facts.
2. Cite sources inline with bracketed numbers, e.g. "Gradient descent minimizes the cost function [2]." Cite every paragraph at least once. Only use numbers that exist in SOURCES.
3. If the SOURCES do not contain the answer, say so plainly and suggest which course section seems closest. Never invent content or citations.
4. Be concise, clear, and encouraging. Prefer short paragraphs or bullet points.`,

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
