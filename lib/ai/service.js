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

    if (lastMessage.includes('quiz') || lastMessage.includes('question')) {
      return JSON.stringify({
        questions: [
          {
            question: 'What is the primary purpose of React hooks?',
            options: {
              A: 'To style components',
              B: 'To manage state and side effects in functional components',
              C: 'To create class components',
              D: 'To handle routing',
            },
            correct_answer: 'B',
            explanation: 'Hooks allow functional components to use state and other React features.',
          },
        ],
      });
    }

    if (lastMessage.includes('summary') || lastMessage.includes('summarize')) {
      return `This course provides a comprehensive introduction to the subject matter, covering fundamental concepts and practical applications. Students will learn key principles, best practices, and hands-on techniques. By the end, learners will have a solid foundation to build upon.`;
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
      return JSON.parse(cleaned.trim());
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
