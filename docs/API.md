# EduX API Documentation

## Overview

EduX is an AI-powered learning management system. This document describes the available API endpoints.

**Base URL:** `http://localhost:3000/api`

## Authentication

Most endpoints require authentication via JWT tokens stored in HTTP-only cookies.

### Login
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "u_id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "isStudent": true,
    "isInstructor": false
  }
}
```

### Sign Up (Student)
```http
POST /api/auth/student/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "yourpassword"
}
```



---

## Course Endpoints

### Get All Courses
```http
GET /api/all_courses
```

### Get Popular Courses
```http
GET /api/popular_courses
```

### Get Top Rated Courses
```http
GET /api/top_rated_courses
```

### Get Course Suggestions
```http
POST /api/course_suggestion
Content-Type: application/json

{
  "query": "react"
}
```

### Get Selected Course
```http
POST /api/selected_course
Content-Type: application/json

{
  "c_id": 100
}
```

### Get User's Enrolled Courses
```http
POST /api/user_courses
Content-Type: application/json

{
  "u_id": 10
}
```

**Response:**
```json
[
  [/* In-progress courses */],
  [/* Completed courses */]
]
```

---

## Enrollment Endpoints

### Check Enrollment Status
```http
POST /api/is_enrolled
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100
}
```

### Enroll in Course
```http
POST /api/enroll
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100
}
```

---

## Course Content Endpoints

### Get User Course Content
```http
POST /api/user_course_content
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100
}
```

### Get Lecture Content
```http
POST /api/lecture_content
Content-Type: application/json

{
  "u_id": 10,
  "l_id": 2000
}
```

---

## Exam Endpoints

### Get Exam Questions
```http
POST /api/exam/questions
Content-Type: application/json

{
  "u_id": 10,
  "e_id": 3000
}
```

### Submit Exam Result
```http
POST /api/exam/result
Content-Type: application/json

{
  "u_id": 10,
  "e_id": 3000,
  "marks": 8
}
```

---

## Review & Rating Endpoints

### Get Course Reviews
```http
POST /api/reviews
Content-Type: application/json

{
  "c_id": 100
}
```

### Rate a Course
```http
POST /api/rate_course
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100,
  "rating": 5,
  "review": "Excellent course!"
}
```

---

## Wishlist Endpoints

### Get Wishlist
```http
POST /api/wishlist/get_items
Content-Type: application/json

{
  "u_id": 10
}
```

### Add to Wishlist
```http
POST /api/wishlist/get_items/add_item
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100
}
```

### Remove from Wishlist
```http
POST /api/wishlist/get_items/remove_item
Content-Type: application/json

{
  "u_id": 10,
  "c_id": 100
}
```

---

## AI-Powered Endpoints

All AI endpoints require authentication.

### AI Course Recommendations
```http
POST /api/ai/recommendations
Content-Type: application/json

{
  "type": "personalized",
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "course_id": 102,
      "title": "Python for Data Science",
      "reason": "Based on your interest in web development",
      "confidence": 0.92
    }
  ],
  "aiGenerated": true
}
```

### AI Smart Search
```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "web development for beginners",
  "type": "smart",
  "limit": 10
}
```

**Types:** `smart`, `suggestions`, `parse`

**Response:**
```json
{
  "success": true,
  "results": [...],
  "searchIntent": {
    "keywords": ["web", "development"],
    "intent": "explore"
  },
  "totalResults": 5,
  "aiEnhanced": true
}
```

### AI Learning Analytics
```http
POST /api/ai/analytics
Content-Type: application/json

{
  "action": "analyze"
}
```

**Actions:**
- `analyze` - Analyze learning patterns
- `report` - Generate progress report
- `predict` - Predict course completion
- `compare` - Compare with cohort

**Response:**
```json
{
  "success": true,
  "metrics": {
    "avgQuizScore": 85,
    "completionRate": 45,
    "studyStreak": 7,
    "coursesEnrolled": 3
  },
  "insights": {...},
  "aiGenerated": true
}
```

### AI Chat Assistant
```http
POST /api/ai/chat
Content-Type: application/json

{
  "action": "chat",
  "message": "What courses should I take?",
  "courseId": 100
}
```

**Actions:**
- `chat` - General chat
- `explain` - Explain a concept
- `answer` - Answer a question
- `tips` - Get study tips
- `plan` - Generate study plan

**Response:**
```json
{
  "success": true,
  "message": "Based on your profile...",
  "aiGenerated": true
}
```

### AI Quiz Generator
```http
POST /api/ai/quiz
Content-Type: application/json

{
  "action": "generate",
  "topic": "React Hooks",
  "difficulty": "medium",
  "count": 5
}
```

**Actions:**
- `generate` - Generate quiz questions
- `practice` - Practice questions from topic
- `lecture` - Quiz from lecture content
- `grade` - Grade an answer

### AI Content Summary
```http
POST /api/ai/summary
Content-Type: application/json

{
  "type": "course",
  "id": 100
}
```

**Types:** `course`, `topic`, `lecture`

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Tier | Requests | Window |
|------|----------|--------|
| Default | 30 | 1 minute |
| Auth Endpoints | 10 | 15 minutes |
| AI Endpoints | 20 | 1 minute |
| Strict | 5 | 1 minute |

When rate limited, a 429 response is returned:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Authentication required |
| `AUTHORIZATION_ERROR` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT_ERROR` | 409 | Resource conflict |
| `RATE_LIMIT_ERROR` | 429 | Rate limit exceeded |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected error |

---

## Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-Id` | Unique request identifier |
| `X-Cache` | Cache status (HIT/MISS) |
| `X-RateLimit-*` | Rate limiting info |

---

## Caching

Responses are cached based on endpoint type:

| Category | TTL |
|----------|-----|
| Course listings | 5 minutes |
| Course details | 2 minutes |
| Search results | 1 minute |
| AI recommendations | 10 minutes |
| Popular courses | 15 minutes |
