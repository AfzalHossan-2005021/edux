/**
 * Live Sessions API
 * CRUD operations for live video sessions
 */

import pool from '../../middleware/connectdb';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getSessions(req, res);
      case 'POST':
        return await createSession(req, res);
      case 'PUT':
        return await updateSession(req, res);
      case 'DELETE':
        return await deleteSession(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Live sessions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Fetch sessions
async function getSessions(req, res) {
  const { courseId, sessionId, instructorId, status, upcoming } = req.query;
  let connection;

  try {
    connection = await pool.getConnection();

    if (sessionId) {
      // Get single session with participant count
      const result = await connection.execute(
        `SELECT s.*, 
                i.NAME as INSTRUCTOR_NAME,
                c.NAME as COURSE_NAME,
                (SELECT COUNT(*) FROM EDUX.SESSION_PARTICIPANTS sp WHERE sp.SESSION_ID = s.SESSION_ID) as PARTICIPANT_COUNT
         FROM EDUX.LIVE_SESSIONS s
         JOIN EDUX.INSTRUCTOR i ON s.INSTRUCTOR_ID = i.I_ID
         JOIN EDUX.COURSE c ON s.C_ID = c.C_ID
         WHERE s.SESSION_ID = :sessionId`,
        { sessionId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = formatSession(result.rows[0], result.metaData);

      // Get participants
      const participantsResult = await connection.execute(
        `SELECT sp.*, u.NAME as USER_NAME, u.EMAIL
         FROM EDUX.SESSION_PARTICIPANTS sp
         JOIN EDUX.USERS u ON sp.USER_ID = u.U_ID
         WHERE sp.SESSION_ID = :sessionId
         ORDER BY sp.JOINED_AT DESC`,
        { sessionId }
      );

      session.participants = participantsResult.rows.map((row) =>
        formatRow(row, participantsResult.metaData)
      );

      return res.status(200).json(session);
    }

    // Build query for listing sessions
    let query = `
      SELECT s.*, 
             i.NAME as INSTRUCTOR_NAME,
             c.NAME as COURSE_NAME,
             (SELECT COUNT(*) FROM EDUX.SESSION_PARTICIPANTS sp WHERE sp.SESSION_ID = s.SESSION_ID) as PARTICIPANT_COUNT
      FROM EDUX.LIVE_SESSIONS s
      JOIN EDUX.INSTRUCTOR i ON s.INSTRUCTOR_ID = i.I_ID
      JOIN EDUX.COURSE c ON s.C_ID = c.C_ID
      WHERE 1=1
    `;
    const params = {};

    if (courseId) {
      query += ' AND s.C_ID = :courseId';
      params.courseId = parseInt(courseId);
    }

    if (instructorId) {
      query += ' AND s.INSTRUCTOR_ID = :instructorId';
      params.instructorId = parseInt(instructorId);
    }

    if (status) {
      query += ' AND s.STATUS = :status';
      params.status = status;
    }

    if (upcoming === 'true') {
      query += ' AND s.SCHEDULED_START > SYSDATE';
    }

    query += ' ORDER BY s.SCHEDULED_START ASC';

    const result = await connection.execute(query, params);

    const sessions = result.rows.map((row) => formatSession(row, result.metaData));

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// POST - Create new session
async function createSession(req, res) {
  const {
    courseId,
    instructorId,
    title,
    description,
    type = 'lecture',
    scheduledStart,
    duration = 60,
    maxParticipants = 100,
    roomName,
    password,
  } = req.body;

  if (!courseId || !instructorId || !title || !scheduledStart) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const scheduledEnd = new Date(new Date(scheduledStart).getTime() + duration * 60000);

    await connection.execute(
      `INSERT INTO EDUX.LIVE_SESSIONS (
        SESSION_ID, C_ID, INSTRUCTOR_ID, TITLE, DESCRIPTION, TYPE,
        ROOM_NAME, PASSWORD, SCHEDULED_START, SCHEDULED_END,
        DURATION, MAX_PARTICIPANTS, STATUS, CREATED_AT
      ) VALUES (
        :sessionId, :courseId, :instructorId, :title, :description, :type,
        :roomName, :password, TO_TIMESTAMP(:scheduledStart, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
        TO_TIMESTAMP(:scheduledEnd, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'),
        :duration, :maxParticipants, 'scheduled', SYSDATE
      )`,
      {
        sessionId,
        courseId: parseInt(courseId),
        instructorId: parseInt(instructorId),
        title,
        description: description || '',
        type,
        roomName: roomName || `edux-${sessionId}`,
        password: password || '',
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        duration: parseInt(duration),
        maxParticipants: parseInt(maxParticipants),
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      sessionId,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ error: 'Failed to create session' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// PUT - Update session or join/leave
async function updateSession(req, res) {
  const { sessionId, action, userId, ...updateData } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Handle join/leave actions
    if (action === 'join') {
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required to join' });
      }

      // Check if already joined
      const existingResult = await connection.execute(
        `SELECT * FROM EDUX.SESSION_PARTICIPANTS 
         WHERE SESSION_ID = :sessionId AND USER_ID = :userId`,
        { sessionId, userId: parseInt(userId) }
      );

      if (existingResult.rows.length > 0) {
        return res.status(200).json({ message: 'Already joined' });
      }

      // Check max participants
      const countResult = await connection.execute(
        `SELECT s.MAX_PARTICIPANTS, 
                (SELECT COUNT(*) FROM EDUX.SESSION_PARTICIPANTS sp WHERE sp.SESSION_ID = s.SESSION_ID) as CURRENT_COUNT
         FROM EDUX.LIVE_SESSIONS s
         WHERE s.SESSION_ID = :sessionId`,
        { sessionId }
      );

      if (countResult.rows.length > 0) {
        const [maxParticipants, currentCount] = countResult.rows[0];
        if (currentCount >= maxParticipants) {
          return res.status(400).json({ error: 'Session is full' });
        }
      }

      await connection.execute(
        `INSERT INTO EDUX.SESSION_PARTICIPANTS (SESSION_ID, USER_ID, ROLE, JOINED_AT)
         VALUES (:sessionId, :userId, 'participant', SYSDATE)`,
        { sessionId, userId: parseInt(userId) },
        { autoCommit: true }
      );

      return res.status(200).json({ success: true, message: 'Joined session' });
    }

    if (action === 'leave') {
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required to leave' });
      }

      await connection.execute(
        `UPDATE EDUX.SESSION_PARTICIPANTS 
         SET LEFT_AT = SYSDATE
         WHERE SESSION_ID = :sessionId AND USER_ID = :userId`,
        { sessionId, userId: parseInt(userId) },
        { autoCommit: true }
      );

      return res.status(200).json({ success: true, message: 'Left session' });
    }

    if (action === 'start') {
      await connection.execute(
        `UPDATE EDUX.LIVE_SESSIONS 
         SET STATUS = 'live', STARTED_AT = SYSDATE
         WHERE SESSION_ID = :sessionId`,
        { sessionId },
        { autoCommit: true }
      );

      return res.status(200).json({ success: true, message: 'Session started' });
    }

    if (action === 'end') {
      await connection.execute(
        `UPDATE EDUX.LIVE_SESSIONS 
         SET STATUS = 'ended', ENDED_AT = SYSDATE
         WHERE SESSION_ID = :sessionId`,
        { sessionId },
        { autoCommit: true }
      );

      return res.status(200).json({ success: true, message: 'Session ended' });
    }

    // Regular update
    const { title, description, scheduledStart, duration, maxParticipants, status } = updateData;
    const updates = [];
    const params = { sessionId };

    if (title) {
      updates.push('TITLE = :title');
      params.title = title;
    }
    if (description !== undefined) {
      updates.push('DESCRIPTION = :description');
      params.description = description;
    }
    if (scheduledStart) {
      updates.push('SCHEDULED_START = TO_TIMESTAMP(:scheduledStart, \'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"\')');
      params.scheduledStart = new Date(scheduledStart).toISOString();
    }
    if (duration) {
      updates.push('DURATION = :duration');
      params.duration = parseInt(duration);
    }
    if (maxParticipants) {
      updates.push('MAX_PARTICIPANTS = :maxParticipants');
      params.maxParticipants = parseInt(maxParticipants);
    }
    if (status) {
      updates.push('STATUS = :status');
      params.status = status;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await connection.execute(
      `UPDATE EDUX.LIVE_SESSIONS SET ${updates.join(', ')} WHERE SESSION_ID = :sessionId`,
      params,
      { autoCommit: true }
    );

    return res.status(200).json({ success: true, message: 'Session updated' });
  } catch (error) {
    console.error('Update session error:', error);
    return res.status(500).json({ error: 'Failed to update session' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// DELETE - Cancel session
async function deleteSession(req, res) {
  const { sessionId, instructorId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Verify ownership if instructorId provided
    if (instructorId) {
      const checkResult = await connection.execute(
        `SELECT INSTRUCTOR_ID FROM EDUX.LIVE_SESSIONS WHERE SESSION_ID = :sessionId`,
        { sessionId }
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (checkResult.rows[0][0] !== parseInt(instructorId)) {
        return res.status(403).json({ error: 'Not authorized to delete this session' });
      }
    }

    // Mark as cancelled instead of deleting
    await connection.execute(
      `UPDATE EDUX.LIVE_SESSIONS SET STATUS = 'cancelled' WHERE SESSION_ID = :sessionId`,
      { sessionId },
      { autoCommit: true }
    );

    return res.status(200).json({ success: true, message: 'Session cancelled' });
  } catch (error) {
    console.error('Delete session error:', error);
    return res.status(500).json({ error: 'Failed to cancel session' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// Helper function to format row
function formatRow(row, metaData) {
  const formatted = {};
  metaData.forEach((col, index) => {
    const key = col.name.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    formatted[key] = row[index];
  });
  return formatted;
}

// Helper function to format session
function formatSession(row, metaData) {
  return formatRow(row, metaData);
}
