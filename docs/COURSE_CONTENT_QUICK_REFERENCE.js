/**
 * Course Content Features - Quick Reference Guide
 * Copy-paste ready code examples for common operations
 */

// ============================================
// 1. LOADING COURSE STRUCTURE
// ============================================

import { apiGet } from '@/lib/api';

async function loadCourseStructure(courseId) {
  try {
    const response = await apiGet(`/api/course/structure?c_id=${courseId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Course:', data.course);
      console.log('Statistics:', data.statistics);
      return data.course;
    }
  } catch (error) {
    console.error('Failed to load course:', error);
  }
}

// Usage:
// const course = await loadCourseStructure(1);


// ============================================
// 2. GETTING COURSE OVERVIEW WITH PROGRESS
// ============================================

import { apiPost } from '@/lib/api';

async function getCourseOverview(courseId, studentId = null) {
  try {
    const response = await apiPost('/api/course/overview', {
      c_id: courseId,
      s_id: studentId  // Optional: to get student progress
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Course Info:', data.course);
      console.log('Topics:', data.topics);
      console.log('Statistics:', data.statistics);
      console.log('Student Progress:', data.studentProgress);
      return data;
    }
  } catch (error) {
    console.error('Failed to get course overview:', error);
  }
}

// Usage:
// const overview = await getCourseOverview(1, 5);


// ============================================
// 3. CREATING A NEW TOPIC
// ============================================

async function createTopic(courseId, topicName, serialNumber = null) {
  try {
    const response = await apiPost('/api/course/topics', {
      c_id: courseId,
      action: 'create_topic',
      data: {
        name: topicName,
        serial: serialNumber,
        weight: 1
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Topic created with ID:', result.topicId);
      return result.topicId;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to create topic:', error);
  }
}

// Usage:
// const topicId = await createTopic(1, "Python Basics", 1);


// ============================================
// 4. ADDING A LECTURE TO A TOPIC
// ============================================

async function addLecture(courseId, topicId, lectureData) {
  try {
    const response = await apiPost('/api/course/materials', {
      c_id: courseId,
      t_id: topicId,
      action: 'add_lecture',
      data: {
        description: lectureData.title,
        video: lectureData.videoUrl,  // YouTube URL
        weight: lectureData.weight || 1,
        serial: lectureData.serial || 1
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Lecture created with ID:', result.lectureId);
      return result.lectureId;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to add lecture:', error);
  }
}

// Usage:
// const lectureId = await addLecture(1, 1, {
//   title: "Variables and Data Types",
//   videoUrl: "https://www.youtube.com/watch?v=...",
//   serial: 1,
//   weight: 1
// });


// ============================================
// 5. CREATING AN EXAM FOR A TOPIC
// ============================================

async function createExam(topicId, examData) {
  try {
    const response = await apiPost('/api/course/content', {
      action: 'create_exam',
      t_id: topicId,
      data: {
        question_count: examData.questionCount,
        marks: examData.totalMarks,
        duration: examData.duration || 60,  // minutes
        weight: examData.weight || 1
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Exam created with ID:', result.examId);
      return result.examId;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to create exam:', error);
  }
}

// Usage:
// const examId = await createExam(1, {
//   questionCount: 10,
//   totalMarks: 50,
//   duration: 30,
//   weight: 2
// });


// ============================================
// 6. ADDING A QUESTION TO AN EXAM
// ============================================

async function addQuestion(examId, questionData) {
  try {
    const response = await apiPost('/api/course/content', {
      action: 'add_question',
      e_id: examId,
      data: {
        question: questionData.question,
        options: questionData.options,  // Array of 4 options
        correctAnswer: questionData.correctAnswer,  // A, B, C, or D
        marks: questionData.marks || 1
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Question created with ID:', result.questionId);
      return result.questionId;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to add question:', error);
  }
}

// Usage:
// const questionId = await addQuestion(1, {
//   question: "What is a variable?",
//   options: [
//     "A named storage location",
//     "A programming language",
//     "A type of function",
//     "A database table"
//   ],
//   correctAnswer: "A",
//   marks: 5
// });


// ============================================
// 7. UPDATING LECTURE PROGRESS
// ============================================

async function updateLectureProgress(studentId, lectureId, courseId, progressData) {
  try {
    const response = await apiPost('/api/update_lecture_progress', {
      s_id: studentId,
      l_id: lectureId,
      c_id: courseId,
      progress: progressData.progress || 0,  // 0-100 percent
      current_time: progressData.currentTime || 0,  // seconds
      is_complete: progressData.isComplete || false
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Progress updated successfully');
      return true;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

// Usage:
// await updateLectureProgress(5, 1, 1, {
//   progress: 50,      // 50% watched
//   currentTime: 300,  // 5 minutes
//   isComplete: false
// });
//
// // Mark as complete
// await updateLectureProgress(5, 1, 1, {
//   progress: 100,
//   currentTime: 600,
//   isComplete: true
// });


// ============================================
// 8. GETTING ALL LECTURES IN A TOPIC
// ============================================

async function getLecturesInTopic(courseId, topicId) {
  try {
    const response = await apiGet(
      `/api/course/materials?c_id=${courseId}&t_id=${topicId}&type=lectures`
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Lectures:', data.lectures);
      return data.lectures;
    }
  } catch (error) {
    console.error('Failed to get lectures:', error);
  }
}

// Usage:
// const lectures = await getLecturesInTopic(1, 1);


// ============================================
// 9. GETTING AN EXAM WITH QUESTIONS
// ============================================

async function getExam(examId) {
  try {
    const response = await apiGet(
      `/api/course/content?type=exam&e_id=${examId}`
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Exam:', data.exam);
      console.log('Questions:', data.exam.questions);
      return data.exam;
    }
  } catch (error) {
    console.error('Failed to get exam:', error);
  }
}

// Usage:
// const exam = await getExam(1);


// ============================================
// 10. UPDATING A LECTURE
// ============================================

async function updateLecture(lectureId, updateData) {
  try {
    const response = await apiPost('/api/course/materials', {
      l_id: lectureId,
      action: 'update_lecture',
      data: {
        description: updateData.description,
        video: updateData.video,
        weight: updateData.weight,
        serial: updateData.serial
      }
    });
    
    // Note: POST is used, but internally it should be PUT
    // If PUT method is required:
    const putResponse = await fetch('/api/course/materials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        l_id: lectureId,
        action: 'update_lecture',
        data: updateData
      })
    });
    
    const result = await putResponse.json();
    
    if (result.success) {
      console.log('Lecture updated successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to update lecture:', error);
  }
}

// Usage:
// await updateLecture(1, {
//   description: "Updated lecture title",
//   video: "https://www.youtube.com/watch?v=...",
//   weight: 2,
//   serial: 1
// });


// ============================================
// 11. DELETING A LECTURE
// ============================================

async function deleteLecture(lectureId) {
  try {
    const response = await fetch('/api/course/materials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ l_id: lectureId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Lecture deleted successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to delete lecture:', error);
  }
}

// Usage:
// await deleteLecture(1);


// ============================================
// 12. COMPLETE COURSE CREATION EXAMPLE
// ============================================

async function createCompleteCourse() {
  try {
    // Step 1: Create a topic
    const topicId = await createTopic(1, "Module 1: Basics", 1);
    console.log('Created topic:', topicId);
    
    // Step 2: Add lectures to the topic
    const lecture1Id = await addLecture(1, topicId, {
      title: "Introduction",
      videoUrl: "https://www.youtube.com/watch?v=...",
      serial: 1
    });
    
    const lecture2Id = await addLecture(1, topicId, {
      title: "Advanced Concepts",
      videoUrl: "https://www.youtube.com/watch?v=...",
      serial: 2
    });
    
    console.log('Created lectures:', lecture1Id, lecture2Id);
    
    // Step 3: Create an exam
    const examId = await createExam(topicId, {
      questionCount: 5,
      totalMarks: 50,
      duration: 30,
      weight: 1
    });
    
    console.log('Created exam:', examId);
    
    // Step 4: Add questions to the exam
    for (let i = 0; i < 5; i++) {
      await addQuestion(examId, {
        question: `Question ${i + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'A',
        marks: 10
      });
    }
    
    console.log('Created questions for exam');
    
    // Step 5: Load and display the complete structure
    const courseStructure = await loadCourseStructure(1);
    console.log('Complete course structure:', courseStructure);
    
  } catch (error) {
    console.error('Course creation failed:', error);
  }
}

// Usage:
// await createCompleteCourse();


// ============================================
// ERROR HANDLING UTILITIES
// ============================================

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    return error.response.data?.error || defaultMessage;
  }
  return error.message || defaultMessage;
};

export const isValidYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/;
  return youtubeRegex.test(url);
};

export const calculateProgress = (completedItems, totalItems) => {
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
};

// ============================================
// END OF QUICK REFERENCE GUIDE
// ============================================
