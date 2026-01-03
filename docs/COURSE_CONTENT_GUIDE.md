# Course Content Management - Comprehensive Guide

## Overview

The EDUX platform now includes comprehensive functionality for managing course content across multiple levels of organization. This system enables instructors to create, organize, and manage courses with a hierarchical structure of topics, lectures, and exams.

## Database Schema

### Core Tables

#### 1. **Courses** Table
- `c_id`: Course ID (Primary Key)
- `i_id`: Instructor ID (Foreign Key)
- `title`: Course title (max 100 chars)
- `description`: Course description (max 1000 chars)
- `approve_status`: Approval status ('y'/'n')
- `student_count`: Number of enrolled students
- `rating`: Course rating
- `wall`: Course wall/image identifier
- `field`: Course field/category
- `seat`: Available seats

#### 2. **Topics** Table
- `t_id`: Topic ID (Primary Key)
- `name`: Topic name (max 100 chars)
- `c_id`: Course ID (Foreign Key)
- `serial`: Order in course
- `weight`: Topic weight/importance

#### 3. **Lectures** Table
- `l_id`: Lecture ID (Primary Key)
- `t_id`: Topic ID (Foreign Key)
- `description`: Lecture description (max 1000 chars)
- `video`: Video URL link
- `weight`: Lecture weight
- `serial`: Order in topic

#### 4. **Exams** Table
- `e_id`: Exam ID (Primary Key)
- `t_id`: Topic ID (Foreign Key)
- `question_count`: Number of questions
- `marks`: Total marks
- `duration`: Duration in minutes
- `weight`: Exam weight
- `serial`: Order in topic

#### 5. **Questions** Table
- `q_id`: Question ID (Primary Key)
- `e_id`: Exam ID (Foreign Key)
- `q_description`: Question text (max 1000 chars)
- `option_a`, `option_b`, `option_c`, `option_d`: Multiple choice options
- `right_ans`: Correct answer (A/B/C/D)
- `marks`: Question marks
- `serial`: Order in exam

#### 6. **LectureProgress** Table (New)
- `s_id`: Student ID (Foreign Key)
- `l_id`: Lecture ID (Foreign Key)
- `progress`: Progress percentage (0-100)
- `current_time`: Current playback time in seconds
- `completed`: Completion status (Y/N)
- `last_watched`: Last watch timestamp

## API Endpoints

### Course Overview
**GET/POST** `/api/course/overview`
- Get comprehensive course information including structure and student progress

**Request:**
```json
{
  "c_id": 1,
  "s_id": 5  // Optional, for student progress
}
```

**Response:**
```json
{
  "course": { /* course details */ },
  "topics": [ /* topic list */ ],
  "statistics": {
    "topic_count": 5,
    "lecture_count": 45,
    "exam_count": 5,
    "question_count": 50
  },
  "studentProgress": { /* progress if s_id provided */ },
  "success": true
}
```

### Course Structure
**GET** `/api/course/structure?c_id=1`
- Get complete hierarchical course structure with all topics, lectures, and exams

**Response:**
```json
{
  "course": {
    "c_id": 1,
    "title": "Course Title",
    "topics": [
      {
        "t_id": 1,
        "name": "Topic Name",
        "serial": 1,
        "lectures": [ /* lectures */ ],
        "exams": [ /* exams */ ]
      }
    ]
  },
  "statistics": { /* stats */ },
  "success": true
}
```

### Course Materials Management
**GET/POST/PUT/DELETE** `/api/course/materials`

#### Get Lectures
```json
{
  "c_id": 1,
  "t_id": 1,
  "type": "lectures"
}
```

#### Add Lecture
```json
{
  "c_id": 1,
  "t_id": 1,
  "action": "add_lecture",
  "data": {
    "description": "Lecture description",
    "video": "https://youtube.com/...",
    "weight": 1,
    "serial": 1
  }
}
```

### Topics Management
**GET/POST/PUT/DELETE** `/api/course/topics`

#### Create Topic
```json
{
  "c_id": 1,
  "action": "create_topic",
  "data": {
    "name": "Topic Name",
    "serial": 1,
    "weight": 1
  }
}
```

#### Update Topic
```json
{
  "t_id": 1,
  "action": "update_topic",
  "data": {
    "name": "New Name",
    "weight": 2
  }
}
```

### Content Management (Exams & Questions)
**GET/POST/PUT/DELETE** `/api/course/content`

#### Create Exam
```json
{
  "action": "create_exam",
  "t_id": 1,
  "data": {
    "question_count": 5,
    "marks": 100,
    "duration": 60,
    "weight": 1
  }
}
```

#### Add Question
```json
{
  "action": "add_question",
  "e_id": 1,
  "data": {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "marks": 1
  }
}
```

## React Components

### CourseContentManager
Comprehensive instructor interface for managing course structure.

**Props:**
- `courseId` (number): Course ID
- `isInstructor` (boolean): Whether user is instructor

**Features:**
- Add/edit/delete topics
- Manage lectures with video links
- Create and manage exams
- View course statistics

### CourseContentViewer
Student-facing component for viewing and interacting with course content.

**Props:**
- `courseId` (number): Course ID
- `studentId` (number): Student ID
- `isEnrolled` (boolean): Whether student is enrolled

**Features:**
- Browse course structure
- Watch lectures with progress tracking
- View exams
- Track completion status

## Service Layer

### courseContentService.js

Provides business logic utilities:

- `getCourseStructure(connection, courseId)`: Get full course hierarchy
- `calculateCourseProgress(connection, studentId, courseId)`: Calculate student progress
- `getTopicProgress(connection, studentId, topicId)`: Get topic-level progress
- `getLectureWithProgress(connection, lectureId, studentId)`: Get lecture with student progress
- `getExamWithQuestions(connection, examId, shuffle)`: Get exam with questions
- `updateLectureProgress(connection, studentId, lectureId, progress, currentTime, isComplete)`: Update progress
- `getCourseStatistics(connection, courseId)`: Get course statistics

## Validation Schemas

All API inputs are validated using Zod schemas:

- `topicSchema`: Validates topic data
- `lectureSchema`: Validates lecture data
- `examSchema`: Validates exam data
- `questionSchema`: Validates question data
- `courseOverviewSchema`: Validates overview requests
- `courseStructureSchema`: Validates structure requests
- `courseContentSchema`: Validates content requests
- `updateLectureProgressSchema`: Validates progress updates

## Implementation Examples

### Creating a Course Structure

```javascript
// Step 1: Create course (existing functionality)
const courseResponse = await fetch('/api/instructor_courses', {
  method: 'POST',
  body: JSON.stringify({
    title: "Python Programming",
    description: "Learn Python from basics to advanced",
    field: "Programming",
    seat: 50
  })
});

// Step 2: Create topics
const topicResponse = await fetch('/api/course/topics', {
  method: 'POST',
  body: JSON.stringify({
    c_id: courseId,
    action: 'create_topic',
    data: { name: "Python Basics", serial: 1 }
  })
});

// Step 3: Add lectures to topic
const lectureResponse = await fetch('/api/course/materials', {
  method: 'POST',
  body: JSON.stringify({
    c_id: courseId,
    t_id: topicId,
    action: 'add_lecture',
    data: {
      description: "Variables and Data Types",
      video: "https://youtube.com/watch?v=...",
      serial: 1
    }
  })
});

// Step 4: Create exam for topic
const examResponse = await fetch('/api/course/content', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create_exam',
    t_id: topicId,
    data: {
      question_count: 10,
      marks: 50,
      duration: 30
    }
  })
});

// Step 5: Add questions to exam
const questionResponse = await fetch('/api/course/content', {
  method: 'POST',
  body: JSON.stringify({
    action: 'add_question',
    e_id: examId,
    data: {
      question: "What is a variable?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      marks: 5
    }
  })
});
```

### Tracking Student Progress

```javascript
// Update lecture progress as student watches
const progressResponse = await fetch('/api/update_lecture_progress', {
  method: 'POST',
  body: JSON.stringify({
    s_id: studentId,
    l_id: lectureId,
    c_id: courseId,
    progress: 50,  // 50% watched
    current_time: 300,  // 5 minutes
    is_complete: false
  })
});

// Mark lecture as complete
const completeResponse = await fetch('/api/update_lecture_progress', {
  method: 'POST',
  body: JSON.stringify({
    s_id: studentId,
    l_id: lectureId,
    c_id: courseId,
    progress: 100,
    current_time: 600,
    is_complete: true
  })
});
```

## Features

### Instructor Features
- Create and organize courses into topics
- Add lectures with video links
- Create exams with custom questions
- Manage course structure and hierarchy
- View course statistics
- Monitor student progress (via analytics)

### Student Features
- Browse complete course structure
- Watch lectures with progress tracking
- Resume from last watched position
- View completion status
- Take exams
- Track course progress percentage

### System Features
- Hierarchical course organization
- Flexible content structuring
- Progress tracking and persistence
- Video integration (YouTube)
- Multiple choice exam system
- Weight-based importance levels
- Serial ordering for content

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Future Enhancements

1. **Course Certificates** - Generate certificates on course completion
2. **Discussion Forums** - Topic and lecture-level discussions
3. **Resource Downloads** - Attach downloadable resources to lectures
4. **Adaptive Learning** - Personalized learning paths based on progress
5. **Course Analytics** - Detailed analytics for instructors
6. **Interactive Quizzes** - More quiz types (essay, matching, etc.)
7. **Live Sessions** - Schedule and conduct live class sessions
8. **Peer Reviews** - Student submission and peer review system
9. **Gamification** - Badges and points for course completion
10. **Notifications** - Real-time notifications for new content

## Best Practices

1. Always validate input data using the provided schemas
2. Use transaction management for multi-step operations
3. Implement proper error handling and user feedback
4. Use the service layer for business logic operations
5. Track user progress consistently throughout the course
6. Organize content logically with meaningful topic names
7. Provide descriptive lecture titles and descriptions
8. Set appropriate difficulty levels and marks for questions
9. Monitor course completion rates for improvement areas
10. Regularly update course content based on student feedback
