// AI Service - Core AI functionality with multiple provider support

import { AI_PROVIDERS, AI_CONFIG, getAIProvider, SYSTEM_PROMPTS } from './config';

/**
 * OpenAI API Client
 */
class OpenAIClient {
  constructor() {
    this.apiKey = AI_CONFIG.openai.apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || AI_CONFIG.openai.model,
        messages,
        max_tokens: options.maxTokens || AI_CONFIG.openai.maxTokens,
        temperature: options.temperature || AI_CONFIG.openai.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async getEmbedding(text) {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.embeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Embedding Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}

/**
 * Google Gemini API Client
 */
class GeminiClient {
  constructor() {
    this.apiKey = AI_CONFIG.gemini.apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async chat(messages, options = {}) {
    const model = options.model || AI_CONFIG.gemini.model;
    
    // Convert OpenAI-style messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Add system prompt to first user message if exists
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg && contents.length > 0) {
      contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: options.maxTokens || AI_CONFIG.gemini.maxTokens,
            temperature: options.temperature || AI_CONFIG.gemini.temperature,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async getEmbedding(text) {
    const response = await fetch(
      `${this.baseUrl}/models/embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini Embedding Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.embedding.values;
  }
}

/**
 * Local/Mock AI Client for development
 */
class LocalClient {
  async chat(messages, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, AI_CONFIG.local.delay));

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Generate mock responses based on context
    if (lastMessage.includes('recommend') || lastMessage.includes('suggestion')) {
      return JSON.stringify({
        recommendations: [
          { course_id: 100, reason: 'Based on your interest in web development', confidence: 0.92 },
          { course_id: 102, reason: 'Popular among similar learners', confidence: 0.85 },
          { course_id: 101, reason: 'Complements your current learning path', confidence: 0.78 },
        ],
      });
    }

    if (lastMessage.includes('quiz') || lastMessage.includes('question') || lastMessage.includes('generate')) {
      // Extract count from message if present (e.g., "Generate 5 quiz questions")
      const countMatch = lastMessage.match(/(\d+)\s*(quiz|question)/);
      const count = countMatch ? parseInt(countMatch[1]) : 5;
      
      // Extract topic from message
      const topicMatch = lastMessage.match(/topic[:\s]+([^\n]+)/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'the subject';
      
      const questions = [];
      const sampleQuestions = [
        { q: `What is a fundamental concept in ${topic}?`, a: 'Understanding core principles', b: 'Memorizing syntax', c: 'Copying code examples', d: 'Skipping basics' },
        { q: `Which approach is best for learning ${topic}?`, a: 'Reading documentation only', b: 'Watching videos only', c: 'Combining theory with hands-on practice', d: 'Avoiding practice' },
        { q: `What makes ${topic} important in modern development?`, a: 'It is not important', b: 'It enables efficient problem-solving', c: 'It is outdated', d: 'It has no practical use' },
        { q: `How should you troubleshoot issues in ${topic}?`, a: 'Give up immediately', b: 'Systematic debugging and reading error messages', c: 'Delete everything', d: 'Ignore errors' },
        { q: `What is a best practice when working with ${topic}?`, a: 'Writing clear, documented code', b: 'Using unclear variable names', c: 'Avoiding comments', d: 'Skipping testing' },
        { q: `Which resource is most helpful for ${topic}?`, a: 'Official documentation and tutorials', b: 'Random forum posts only', c: 'Outdated books', d: 'Guessing' },
        { q: `What mindset helps when learning ${topic}?`, a: 'Giving up on first failure', b: 'Growth mindset with persistent practice', c: 'Avoiding challenges', d: 'Expecting instant mastery' },
        { q: `How can you apply ${topic} knowledge effectively?`, a: 'Never use it', b: 'Building real projects', c: 'Only theoretical study', d: 'Copying without understanding' },
      ];
      
      for (let i = 0; i < count && i < sampleQuestions.length; i++) {
        const sq = sampleQuestions[i];
        questions.push({
          id: i + 1,
          question: sq.q,
          options: { A: sq.a, B: sq.b, C: sq.c, D: sq.d },
          correct_answer: ['B', 'C', 'B', 'B', 'A', 'A', 'B', 'B'][i],
          explanation: `This tests understanding of ${topic} fundamentals.`,
          difficulty: ['easy', 'medium', 'hard'][i % 3],
        });
      }
      
      return JSON.stringify({ questions });
    }

    if (lastMessage.includes('summary') || lastMessage.includes('summarize')) {
      return JSON.stringify({
        overview: 'This course provides a comprehensive introduction to the subject matter, covering fundamental concepts and practical applications.',
        learning_objectives: [
          'Understand core concepts and principles',
          'Apply knowledge through hands-on exercises',
          'Build practical skills for real-world applications',
          'Develop problem-solving abilities'
        ],
        target_audience: 'Beginners to intermediate learners interested in expanding their knowledge',
        prerequisites: [],
        expected_outcomes: [
          'Solid foundation in the subject',
          'Ability to apply concepts independently',
          'Portfolio-ready projects'
        ],
        estimated_duration: '4-6 weeks',
        difficulty_level: 'beginner'
      });
    }

    // Study tips request
    if (lastMessage.includes('study tips') || lastMessage.includes('tips for learning')) {
      return JSON.stringify({
        tips: [
          'Break down complex topics into smaller, manageable chunks',
          'Practice active recall by testing yourself frequently',
          'Use spaced repetition for better long-term retention',
          'Take regular breaks using the Pomodoro technique',
          'Apply concepts through hands-on projects'
        ],
        study_schedule: 'Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.',
        resources: [
          'Official documentation and tutorials',
          'Interactive coding exercises',
          'Video explanations for visual learning',
          'Community forums for discussions'
        ],
        motivation: 'Every expert was once a beginner. Consistent effort leads to mastery!'
      });
    }

    // Study plan request
    if (lastMessage.includes('study plan') || lastMessage.includes('schedule') || lastMessage.includes('plan')) {
      return JSON.stringify({
        weekly_schedule: {
          monday: 'Focus on theory and concept review',
          tuesday: 'Hands-on practice and exercises',
          wednesday: 'Project work and application',
          thursday: 'Quiz practice and self-assessment',
          friday: 'Review weak areas and consolidation'
        },
        daily_routine: 'Start with a 10-minute review of previous material, then focus on new content for 45 minutes, followed by practice exercises.',
        priority_order: ['Complete current modules', 'Review challenging topics', 'Practice with quizzes'],
        milestones: [
          { week: 1, goal: 'Complete foundational concepts' },
          { week: 2, goal: 'Build first practice project' },
          { week: 3, goal: 'Master intermediate topics' },
          { week: 4, goal: 'Complete course and final assessment' }
        ],
        tips: [
          'Set specific, achievable daily goals',
          'Track your progress to stay motivated',
          'Don\'t skip the practice exercises'
        ]
      });
    }

    // Default conversational response
    return `I understand you're asking about "${lastMessage.substring(0, 50)}...". As your AI study assistant, I'm here to help! This topic is important for your learning journey. Would you like me to explain it in more detail or provide some practice questions?`;
  }

  async getEmbedding(text) {
    // Generate a mock embedding (512 dimensions of random values)
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from({ length: 512 }, () => Math.random() * 2 - 1);
  }
}

/**
 * AI Service - Main entry point
 */
class AIService {
  constructor() {
    this.provider = getAIProvider();
    this.client = this.initClient();
  }

  initClient() {
    switch (this.provider) {
      case AI_PROVIDERS.OPENAI:
        return new OpenAIClient();
      case AI_PROVIDERS.GEMINI:
        return new GeminiClient();
      default:
        return new LocalClient();
    }
  }

  /**
   * Send a chat completion request
   */
  async chat(systemPrompt, userMessage, options = {}) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    return this.client.chat(messages, options);
  }

  /**
   * Send a multi-turn conversation
   */
  async conversation(messages, options = {}) {
    return this.client.chat(messages, options);
  }

  /**
   * Get text embedding for semantic search
   */
  async getEmbedding(text) {
    return this.client.getEmbedding(text);
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   */
  parseJSON(response) {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();
      
      // Try direct parse first
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        // If direct parse fails, try to extract JSON from the response
      }
      
      // Try to find JSON object in the response (starts with { and ends with })
      const jsonObjectMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          return JSON.parse(jsonObjectMatch[0]);
        } catch (e) {
          // Continue to try array
        }
      }
      
      // Try to find JSON array in the response (starts with [ and ends with ])
      const jsonArrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        try {
          return JSON.parse(jsonArrayMatch[0]);
        } catch (e) {
          // Could not parse as array either
        }
      }
      
      console.error('Failed to parse AI response as JSON - no valid JSON found');
      return null;
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      return null;
    }
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

// Named exports for specific features
export { OpenAIClient, GeminiClient, LocalClient };
