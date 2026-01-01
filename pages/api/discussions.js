/**
 * Discussion Forum API
 * Handles threads and replies for course discussions
 */

import pool from '@/middleware/connectdb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getDiscussions(req, res);
    case 'POST':
      return createDiscussion(req, res);
    case 'PUT':
      return updateDiscussion(req, res);
    case 'DELETE':
      return deleteDiscussion(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get discussions for a course
async function getDiscussions(req, res) {
  const { courseId, threadId, page = 1, limit = 20 } = req.query;

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (threadId) {
      // Get specific thread with replies
      const thread = await connection.execute(
        `SELECT d.*, u.F_NAME || ' ' || u.L_NAME as AUTHOR_NAME,
                (SELECT COUNT(*) FROM EDUX.DISCUSSION_REPLIES WHERE THREAD_ID = d.THREAD_ID) as REPLY_COUNT
         FROM EDUX.DISCUSSIONS d
         JOIN EDUX.USERS u ON d.U_ID = u.U_ID
         WHERE d.THREAD_ID = :threadId`,
        { threadId }
      );

      if (thread.rows.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Get replies
      const replies = await connection.execute(
        `SELECT r.*, u.F_NAME || ' ' || u.L_NAME as AUTHOR_NAME
         FROM EDUX.DISCUSSION_REPLIES r
         JOIN EDUX.USERS u ON r.U_ID = u.U_ID
         WHERE r.THREAD_ID = :threadId
         ORDER BY r.CREATED_AT ASC`,
        { threadId }
      );

      const threadData = thread.rows[0];
      return res.status(200).json({
        thread: {
          threadId: threadData[0],
          courseId: threadData[1],
          userId: threadData[2],
          title: threadData[3],
          content: threadData[4],
          createdAt: threadData[5],
          updatedAt: threadData[6],
          isPinned: threadData[7],
          isLocked: threadData[8],
          authorName: threadData[9],
          replyCount: threadData[10],
        },
        replies: replies.rows.map(r => ({
          replyId: r[0],
          threadId: r[1],
          userId: r[2],
          content: r[3],
          createdAt: r[4],
          updatedAt: r[5],
          authorName: r[6],
        })),
      });
    }

    // Get all threads for a course
    const offset = (page - 1) * limit;
    const threads = await connection.execute(
      `SELECT d.*, u.F_NAME || ' ' || u.L_NAME as AUTHOR_NAME,
              (SELECT COUNT(*) FROM EDUX.DISCUSSION_REPLIES WHERE THREAD_ID = d.THREAD_ID) as REPLY_COUNT
       FROM EDUX.DISCUSSIONS d
       JOIN EDUX.USERS u ON d.U_ID = u.U_ID
       WHERE d.C_ID = :courseId
       ORDER BY d.IS_PINNED DESC, d.CREATED_AT DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { courseId, offset, limit: parseInt(limit) }
    );

    // Get total count
    const countResult = await connection.execute(
      `SELECT COUNT(*) FROM EDUX.DISCUSSIONS WHERE C_ID = :courseId`,
      { courseId }
    );

    return res.status(200).json({
      threads: threads.rows.map(t => ({
        threadId: t[0],
        courseId: t[1],
        userId: t[2],
        title: t[3],
        content: t[4],
        createdAt: t[5],
        updatedAt: t[6],
        isPinned: t[7],
        isLocked: t[8],
        authorName: t[9],
        replyCount: t[10],
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.rows[0][0],
        totalPages: Math.ceil(countResult.rows[0][0] / limit),
      },
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    // Return empty array if table doesn't exist
    return res.status(200).json({ threads: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}

// Create new thread or reply
async function createDiscussion(req, res) {
  const { courseId, userId, title, content, threadId } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'User ID and content are required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (threadId) {
      // Create a reply
      const result = await connection.execute(
        `INSERT INTO EDUX.DISCUSSION_REPLIES (THREAD_ID, U_ID, CONTENT, CREATED_AT)
         VALUES (:threadId, :userId, :content, SYSDATE)
         RETURNING REPLY_ID INTO :replyId`,
        {
          threadId,
          userId,
          content,
          replyId: { dir: 3003, type: 2010 }, // BIND_OUT, NUMBER
        },
        { autoCommit: true }
      );

      return res.status(201).json({
        success: true,
        replyId: result.outBinds.replyId[0],
        message: 'Reply posted successfully',
      });
    } else {
      // Create a new thread
      if (!courseId || !title) {
        return res.status(400).json({ error: 'Course ID and title are required for new threads' });
      }

      const result = await connection.execute(
        `INSERT INTO EDUX.DISCUSSIONS (C_ID, U_ID, TITLE, CONTENT, CREATED_AT)
         VALUES (:courseId, :userId, :title, :content, SYSDATE)
         RETURNING THREAD_ID INTO :threadId`,
        {
          courseId,
          userId,
          title,
          content,
          threadId: { dir: 3003, type: 2010 },
        },
        { autoCommit: true }
      );

      return res.status(201).json({
        success: true,
        threadId: result.outBinds.threadId[0],
        message: 'Thread created successfully',
      });
    }
  } catch (error) {
    console.error('Create discussion error:', error);
    return res.status(500).json({ error: 'Failed to create discussion' });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}

// Update thread or reply
async function updateDiscussion(req, res) {
  const { threadId, replyId, userId, content, isPinned, isLocked } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (replyId) {
      // Update reply
      await connection.execute(
        `UPDATE EDUX.DISCUSSION_REPLIES 
         SET CONTENT = :content, UPDATED_AT = SYSDATE
         WHERE REPLY_ID = :replyId AND U_ID = :userId`,
        { content, replyId, userId },
        { autoCommit: true }
      );
    } else if (threadId) {
      // Update thread
      let updateQuery = 'UPDATE EDUX.DISCUSSIONS SET UPDATED_AT = SYSDATE';
      const params = { threadId, userId };

      if (content !== undefined) {
        updateQuery += ', CONTENT = :content';
        params.content = content;
      }
      if (isPinned !== undefined) {
        updateQuery += ', IS_PINNED = :isPinned';
        params.isPinned = isPinned ? 1 : 0;
      }
      if (isLocked !== undefined) {
        updateQuery += ', IS_LOCKED = :isLocked';
        params.isLocked = isLocked ? 1 : 0;
      }

      updateQuery += ' WHERE THREAD_ID = :threadId';
      await connection.execute(updateQuery, params, { autoCommit: true });
    }

    return res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Update discussion error:', error);
    return res.status(500).json({ error: 'Failed to update discussion' });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}

// Delete thread or reply
async function deleteDiscussion(req, res) {
  const { threadId, replyId, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (replyId) {
      await connection.execute(
        `DELETE FROM EDUX.DISCUSSION_REPLIES WHERE REPLY_ID = :replyId AND U_ID = :userId`,
        { replyId, userId },
        { autoCommit: true }
      );
    } else if (threadId) {
      // Delete thread and all its replies
      await connection.execute(
        `DELETE FROM EDUX.DISCUSSION_REPLIES WHERE THREAD_ID = :threadId`,
        { threadId },
        { autoCommit: true }
      );
      await connection.execute(
        `DELETE FROM EDUX.DISCUSSIONS WHERE THREAD_ID = :threadId AND U_ID = :userId`,
        { threadId, userId },
        { autoCommit: true }
      );
    }

    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    return res.status(500).json({ error: 'Failed to delete discussion' });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}
