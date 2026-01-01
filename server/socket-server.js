/**
 * Socket.io Server for EduX Real-time Features
 * Run this as a separate service: node server/socket-server.js
 */

const { Server } = require('socket.io');
const http = require('http');

const PORT = process.env.SOCKET_PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create HTTP server
const httpServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('EduX Socket Server Running');
});

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store connected users
const connectedUsers = new Map();
// Store notification history (in production, use Redis or database)
const notificationHistory = new Map();

// Authentication middleware
io.use((socket, next) => {
  const { userId, userType } = socket.handshake.auth;
  
  if (!userId) {
    return next(new Error('Authentication required'));
  }
  
  socket.userId = userId;
  socket.userType = userType || 'student';
  next();
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.userId} (${socket.id})`);
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userType: socket.userType,
    connectedAt: new Date(),
    rooms: new Set(),
  });

  // Join user to their personal room
  socket.on('join_room', ({ userId, userType }) => {
    socket.join(`user_${userId}`);
    const user = connectedUsers.get(userId);
    if (user) {
      user.rooms.add(`user_${userId}`);
    }
    console.log(`[Socket] User ${userId} joined personal room`);
  });

  // Course subscription
  socket.on('subscribe_course', ({ courseId }) => {
    socket.join(`course_${courseId}`);
    const user = connectedUsers.get(socket.userId);
    if (user) {
      user.rooms.add(`course_${courseId}`);
    }
    console.log(`[Socket] User ${socket.userId} subscribed to course ${courseId}`);
  });

  socket.on('unsubscribe_course', ({ courseId }) => {
    socket.leave(`course_${courseId}`);
    const user = connectedUsers.get(socket.userId);
    if (user) {
      user.rooms.delete(`course_${courseId}`);
    }
  });

  // Live session handling
  socket.on('join_live_session', ({ sessionId }) => {
    socket.join(`live_session_${sessionId}`);
    
    // Notify others in the session
    socket.to(`live_session_${sessionId}`).emit(`session_${sessionId}_user_joined`, {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`[Socket] User ${socket.userId} joined live session ${sessionId}`);
  });

  socket.on('leave_live_session', ({ sessionId }) => {
    socket.leave(`live_session_${sessionId}`);
    
    // Notify others in the session
    socket.to(`live_session_${sessionId}`).emit(`session_${sessionId}_user_left`, {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('live_session_message', ({ sessionId, message, timestamp }) => {
    io.to(`live_session_${sessionId}`).emit(`session_${sessionId}_message`, {
      userId: socket.userId,
      message,
      timestamp,
    });
  });

  // Exam handling
  socket.on('join_exam', ({ examId }) => {
    socket.join(`exam_${examId}`);
    console.log(`[Socket] User ${socket.userId} joined exam ${examId}`);
  });

  socket.on('leave_exam', ({ examId }) => {
    socket.leave(`exam_${examId}`);
  });

  // Progress updates
  socket.on('progress_update', (data) => {
    // Broadcast to user's devices and instructor dashboard
    io.to(`user_${data.userId}`).emit(`progress_${data.userId}`, data);
    
    if (data.courseId) {
      // Notify instructor (if they're monitoring)
      io.to(`instructor_course_${data.courseId}`).emit('student_progress', {
        studentId: data.userId,
        ...data,
      });
    }
  });

  // Notification history request
  socket.on('get_notification_history', ({ userId, limit }) => {
    const history = notificationHistory.get(userId) || [];
    socket.emit('notification_history', history.slice(0, limit));
  });

  // Mark notification as read
  socket.on('mark_notification_read', ({ notificationId }) => {
    const history = notificationHistory.get(socket.userId) || [];
    const notification = history.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  });

  // Disconnect handling
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] User disconnected: ${socket.userId} - ${reason}`);
    connectedUsers.delete(socket.userId);
  });
});

// Helper function to send notification to a user
function sendNotification(userId, notification) {
  const notificationWithId = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...notification,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  // Store in history
  if (!notificationHistory.has(userId)) {
    notificationHistory.set(userId, []);
  }
  const history = notificationHistory.get(userId);
  history.unshift(notificationWithId);
  
  // Keep only last 100 notifications
  if (history.length > 100) {
    history.pop();
  }
  
  // Send to user if connected
  io.to(`user_${userId}`).emit('notification', notificationWithId);
  
  return notificationWithId;
}

// Helper function to broadcast course update
function broadcastCourseUpdate(courseId, update) {
  io.to(`course_${courseId}`).emit(`course_update_${courseId}`, {
    ...update,
    timestamp: new Date().toISOString(),
  });
}

// Helper function to end exam
function endExam(examId, results = null) {
  io.to(`exam_${examId}`).emit(`exam_${examId}_ended`, {
    timestamp: new Date().toISOString(),
  });
  
  if (results) {
    io.to(`exam_${examId}`).emit(`exam_${examId}_results`, results);
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Socket Server] Running on port ${PORT}`);
  console.log(`[Socket Server] CORS origin: ${CORS_ORIGIN}`);
});

// Export for external use
module.exports = {
  io,
  sendNotification,
  broadcastCourseUpdate,
  endExam,
  connectedUsers,
};
