/**
 * Socket.io Real-time Notification System for EduX
 * Provides real-time updates for course progress, notifications, and live events
 */

import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

/**
 * Initialize Socket.io connection
 */
export function initSocket(userId, userType = 'student') {
  if (typeof window === 'undefined') return null;
  
  // Prevent multiple connections
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: {
      userId,
      userType,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    reconnectAttempts = 0;
    
    // Join user-specific room
    socket.emit('join_room', { userId, userType });
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[Socket] Max reconnection attempts reached');
      socket.disconnect();
    }
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(callback) {
  if (!socket) return () => {};

  socket.on('notification', callback);
  
  return () => {
    socket.off('notification', callback);
  };
}

/**
 * Subscribe to course updates (new content, announcements)
 */
export function subscribeToCourseUpdates(courseId, callback) {
  if (!socket) return () => {};

  socket.emit('subscribe_course', { courseId });
  socket.on(`course_update_${courseId}`, callback);
  
  return () => {
    socket.emit('unsubscribe_course', { courseId });
    socket.off(`course_update_${courseId}`, callback);
  };
}

/**
 * Subscribe to live session events
 */
export function subscribeToLiveSession(sessionId, callbacks = {}) {
  if (!socket) return () => {};

  socket.emit('join_live_session', { sessionId });

  if (callbacks.onUserJoined) {
    socket.on(`session_${sessionId}_user_joined`, callbacks.onUserJoined);
  }
  if (callbacks.onUserLeft) {
    socket.on(`session_${sessionId}_user_left`, callbacks.onUserLeft);
  }
  if (callbacks.onMessage) {
    socket.on(`session_${sessionId}_message`, callbacks.onMessage);
  }
  if (callbacks.onSessionEnded) {
    socket.on(`session_${sessionId}_ended`, callbacks.onSessionEnded);
  }

  return () => {
    socket.emit('leave_live_session', { sessionId });
    socket.off(`session_${sessionId}_user_joined`);
    socket.off(`session_${sessionId}_user_left`);
    socket.off(`session_${sessionId}_message`);
    socket.off(`session_${sessionId}_ended`);
  };
}

/**
 * Subscribe to exam/quiz events
 */
export function subscribeToExamEvents(examId, callbacks = {}) {
  if (!socket) return () => {};

  socket.emit('join_exam', { examId });

  if (callbacks.onTimeUpdate) {
    socket.on(`exam_${examId}_time`, callbacks.onTimeUpdate);
  }
  if (callbacks.onExamEnded) {
    socket.on(`exam_${examId}_ended`, callbacks.onExamEnded);
  }
  if (callbacks.onResultsAvailable) {
    socket.on(`exam_${examId}_results`, callbacks.onResultsAvailable);
  }

  return () => {
    socket.emit('leave_exam', { examId });
    socket.off(`exam_${examId}_time`);
    socket.off(`exam_${examId}_ended`);
    socket.off(`exam_${examId}_results`);
  };
}

/**
 * Subscribe to progress updates
 */
export function subscribeToProgressUpdates(userId, callback) {
  if (!socket) return () => {};

  socket.on(`progress_${userId}`, callback);
  
  return () => {
    socket.off(`progress_${userId}`, callback);
  };
}

/**
 * Send real-time progress update
 */
export function emitProgressUpdate(data) {
  if (!socket) return;
  
  socket.emit('progress_update', data);
}

/**
 * Send live session message
 */
export function sendLiveSessionMessage(sessionId, message) {
  if (!socket) return;
  
  socket.emit('live_session_message', {
    sessionId,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Request notification history
 */
export function requestNotificationHistory(userId, limit = 20) {
  if (!socket) return;
  
  socket.emit('get_notification_history', { userId, limit });
}

/**
 * Mark notification as read
 */
export function markNotificationRead(notificationId) {
  if (!socket) return;
  
  socket.emit('mark_notification_read', { notificationId });
}

/**
 * Notification types for the system
 */
export const NotificationTypes = {
  COURSE_UPDATE: 'course_update',
  NEW_LECTURE: 'new_lecture',
  EXAM_REMINDER: 'exam_reminder',
  EXAM_RESULT: 'exam/result',
  ACHIEVEMENT: 'achievement',
  ANNOUNCEMENT: 'announcement',
  LIVE_SESSION_STARTING: 'live_session_starting',
  COURSE_COMPLETION: 'course_completion',
  DISCUSSION_REPLY: 'discussion_reply',
  INSTRUCTOR_MESSAGE: 'instructor_message',
};

/**
 * Create a notification payload
 */
export function createNotification(type, title, message, data = {}) {
  return {
    type,
    title,
    message,
    data,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  subscribeToNotifications,
  subscribeToCourseUpdates,
  subscribeToLiveSession,
  subscribeToExamEvents,
  subscribeToProgressUpdates,
  emitProgressUpdate,
  sendLiveSessionMessage,
  requestNotificationHistory,
  markNotificationRead,
  NotificationTypes,
  createNotification,
};
