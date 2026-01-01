# EduX AI Features Documentation

## Overview

EduX Phase 2 introduces AI-powered features to enhance the learning experience. The AI system is designed to be modular, provider-agnostic, and gracefully degrades when AI services are unavailable.

## AI Providers

The system supports multiple AI providers:

1. **OpenAI** (GPT-3.5/GPT-4)
2. **Google Gemini**
3. **Local/Mock** (for development without API keys)

Configure in `.env`:
```env
AI_PROVIDER=local  # Options: openai, gemini, local
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key
```

## Features

### 1. AI Course Recommendations (`/api/ai/recommendations`)

Personalized course suggestions based on:
- User's enrollment history
- Course categories and levels
- User preferences

**API Usage:**
```javascript
POST /api/ai/recommendations
{
  "type": "personalized",  // or "similar"
  "courseId": 1,           // required for "similar" type
  "limit": 5
}
```

### 2. AI-Powered Smart Search (`/api/ai/search`)

Natural language course search with:
- Query parsing and understanding
- Semantic search preparation
- Auto-suggestions

**API Usage:**
```javascript
POST /api/ai/search
{
  "query": "beginner python for data science",
  "type": "smart",  // or "suggestions", "parse"
  "limit": 10
}
```

### 3. AI Course Summaries (`/api/ai/summary`)

Generate summaries for:
- Courses (overview, key takeaways, skills)
- Topics (concept breakdown)
- Lectures (quick recap)

**API Usage:**
```javascript
POST /api/ai/summary
{
  "type": "course",  // or "topic", "lecture"
  "id": 1
}
```

### 4. AI Quiz Generator (`/api/ai/quiz`)

Create practice questions:
- Multiple choice with explanations
- Configurable difficulty
- AI-powered answer grading

**API Usage:**
```javascript
POST /api/ai/quiz
{
  "action": "generate",  // or "practice", "lecture", "grade"
  "topic": "JavaScript Arrays",
  "difficulty": "medium",
  "count": 5
}
```

### 5. AI Study Assistant Chatbot (`/api/ai/chat`)

Interactive AI tutor:
- Answer questions
- Explain concepts
- Provide study tips
- Generate study plans

**API Usage:**
```javascript
POST /api/ai/chat
{
  "action": "chat",  // or "explain", "answer", "tips", "plan"
  "message": "How do I understand async/await?",
  "courseId": 1,
  "conversationHistory": []
}
```

### 6. Learning Analytics (`/api/ai/analytics`)

AI-powered insights:
- Learning pattern analysis
- Progress reports
- Completion predictions
- Peer comparisons

**API Usage:**
```javascript
POST /api/ai/analytics
{
  "action": "analyze",  // or "report", "predict", "compare"
  "period": "weekly",
  "courseId": 1
}
```

## Frontend Components

### AIChat
Floating chat widget for AI study assistant.

```jsx
import { AIChat } from '@/components/ai';

<AIChat courseId={1} onClose={() => setShowChat(false)} />
```

### AIRecommendations
Display personalized course recommendations.

```jsx
import { AIRecommendations } from '@/components/ai';

<AIRecommendations limit={4} />
```

### AISearch
AI-powered search bar with suggestions.

```jsx
import { AISearch } from '@/components/ai';

<AISearch onResults={(results) => handleResults(results)} />
```

### LearningAnalytics
Comprehensive analytics dashboard.

```jsx
import { LearningAnalytics } from '@/components/ai';

<LearningAnalytics />
```

### CourseSummary
Expandable AI-generated summary.

```jsx
import { CourseSummary } from '@/components/ai';

<CourseSummary courseId={1} type="course" />
```

### AIQuizGenerator
Interactive quiz with AI grading.

```jsx
import { AIQuizGenerator } from '@/components/ai';

<AIQuizGenerator topic="React Hooks" topicId={1} />
```

## Feature Flags

Enable/disable features in `.env`:

```env
AI_RECOMMENDATIONS_ENABLED=true
AI_SEARCH_ENABLED=true
AI_SUMMARY_ENABLED=true
AI_QUIZ_ENABLED=true
AI_CHATBOT_ENABLED=true
AI_ANALYTICS_ENABLED=true
```

## Architecture

```
lib/ai/
├── config.js       # Configuration and prompts
├── service.js      # Core AI service (provider abstraction)
├── recommendations.js  # Course recommendations
├── search.js       # Smart search
├── summary.js      # Content summaries
├── quiz.js         # Quiz generation
├── chatbot.js      # Study assistant
├── analytics.js    # Learning analytics
└── index.js        # Module exports

components/ai/
├── AIChat.js           # Chat widget
├── AIRecommendations.js # Recommendations display
├── AISearch.js         # Search component
├── LearningAnalytics.js # Analytics dashboard
├── CourseSummary.js    # Summary component
├── AIQuizGenerator.js  # Quiz component
└── index.js            # Component exports

pages/api/ai/
├── recommendations.js  # Recommendations API
├── search.js          # Search API
├── summary.js         # Summary API
├── quiz.js            # Quiz API
├── chat.js            # Chatbot API
└── analytics.js       # Analytics API
```

## Graceful Degradation

All AI features gracefully degrade when:
- AI provider is unavailable
- API keys are missing
- Rate limits are reached

The system provides sensible defaults or cached responses in these cases.

## Security Considerations

1. All AI API endpoints require authentication
2. User data is not stored by AI providers
3. Rate limiting prevents abuse
4. Input validation on all endpoints

## Future Improvements

- [ ] Streaming responses for better UX
- [ ] Conversation persistence
- [ ] Custom fine-tuned models
- [ ] Voice interaction
- [ ] Collaborative AI features
