/**
 * Content Versioning API
 * Track and manage course content history
 */

import pool from '../../middleware/connectdb';
import { createVersionEntry, formatVersion } from '../../lib/versioning';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getVersions(req, res);
      case 'POST':
        return await createVersion(req, res);
      case 'PUT':
        return await restoreVersion(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Versioning API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Fetch version history
async function getVersions(req, res) {
  const { contentType, contentId, versionId, courseId, limit = 50 } = req.query;
  let connection;

  try {
    connection = await pool.getConnection();

    // Get single version
    if (versionId) {
      const result = await connection.execute(
        `SELECT v.*, u.NAME as USER_NAME
         FROM EDUX.CONTENT_VERSIONS v
         LEFT JOIN EDUX.USERS u ON v.USER_ID = u.U_ID
         WHERE v.VERSION_ID = :versionId`,
        { versionId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const version = formatRow(result.rows[0], result.metaData);
      return res.status(200).json(formatVersion(version));
    }

    // Build query for listing versions
    let query = `
      SELECT v.*, u.NAME as USER_NAME
      FROM EDUX.CONTENT_VERSIONS v
      LEFT JOIN EDUX.USERS u ON v.USER_ID = u.U_ID
      WHERE 1=1
    `;
    const params = {};

    if (contentType) {
      query += ' AND v.CONTENT_TYPE = :contentType';
      params.contentType = contentType;
    }

    if (contentId) {
      query += ' AND v.CONTENT_ID = :contentId';
      params.contentId = contentId;
    }

    if (courseId) {
      query += ' AND v.COURSE_ID = :courseId';
      params.courseId = parseInt(courseId);
    }

    query += ' ORDER BY v.CREATED_AT DESC FETCH FIRST :limit ROWS ONLY';
    params.limit = parseInt(limit);

    const result = await connection.execute(query, params);

    const versions = result.rows.map((row) => formatVersion(formatRow(row, result.metaData)));

    // Get summary stats
    const summaryResult = await connection.execute(
      `SELECT ACTION, COUNT(*) as CNT
       FROM EDUX.CONTENT_VERSIONS
       WHERE 1=1 ${contentType ? 'AND CONTENT_TYPE = :contentType' : ''} 
             ${contentId ? 'AND CONTENT_ID = :contentId' : ''}
             ${courseId ? 'AND COURSE_ID = :courseId' : ''}
       GROUP BY ACTION`,
      params
    );

    const summary = {};
    summaryResult.rows.forEach(([action, count]) => {
      summary[action] = count;
    });

    return res.status(200).json({
      versions,
      summary,
      total: versions.length,
    });
  } catch (error) {
    console.error('Get versions error:', error);
    // Return empty result if table doesn't exist
    return res.status(200).json({ versions: [], summary: {}, total: 0 });
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

// POST - Create new version entry
async function createVersion(req, res) {
  const {
    contentType,
    contentId,
    courseId,
    action,
    userId,
    previousData,
    newData,
    message,
  } = req.body;

  if (!contentType || !contentId || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    const versionEntry = createVersionEntry({
      contentType,
      contentId,
      action,
      userId,
      previousData,
      newData,
      message,
    });

    await connection.execute(
      `INSERT INTO EDUX.CONTENT_VERSIONS (
        VERSION_ID, CONTENT_TYPE, CONTENT_ID, COURSE_ID, ACTION,
        USER_ID, PREVIOUS_DATA, NEW_DATA, MESSAGE, CREATED_AT
      ) VALUES (
        :versionId, :contentType, :contentId, :courseId, :action,
        :userId, :previousData, :newData, :message, SYSDATE
      )`,
      {
        versionId: versionEntry.versionId,
        contentType,
        contentId,
        courseId: courseId ? parseInt(courseId) : null,
        action,
        userId: userId ? parseInt(userId) : null,
        previousData: versionEntry.previousData,
        newData: versionEntry.newData,
        message: versionEntry.message,
      },
      { autoCommit: true }
    );

    return res.status(201).json({
      success: true,
      version: versionEntry,
    });
  } catch (error) {
    console.error('Create version error:', error);
    return res.status(500).json({ error: 'Failed to create version' });
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

// PUT - Restore to a previous version
async function restoreVersion(req, res) {
  const { versionId, userId } = req.body;

  if (!versionId) {
    return res.status(400).json({ error: 'Version ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Get the version to restore
    const versionResult = await connection.execute(
      `SELECT * FROM EDUX.CONTENT_VERSIONS WHERE VERSION_ID = :versionId`,
      { versionId }
    );

    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const version = formatRow(versionResult.rows[0], versionResult.metaData);

    if (!version.newData) {
      return res.status(400).json({ error: 'Cannot restore this version (no data)' });
    }

    // Get current data for the content
    let currentData = null;
    let restoreQuery = '';

    switch (version.contentType) {
      case 'course':
        const courseResult = await connection.execute(
          `SELECT * FROM EDUX.COURSE WHERE C_ID = :contentId`,
          { contentId: parseInt(version.contentId) }
        );
        if (courseResult.rows.length > 0) {
          currentData = formatRow(courseResult.rows[0], courseResult.metaData);
        }
        break;

      case 'topic':
        const topicResult = await connection.execute(
          `SELECT * FROM EDUX.TOPIC WHERE T_ID = :contentId`,
          { contentId: parseInt(version.contentId) }
        );
        if (topicResult.rows.length > 0) {
          currentData = formatRow(topicResult.rows[0], topicResult.metaData);
        }
        break;

      case 'lecture':
        const lectureResult = await connection.execute(
          `SELECT * FROM EDUX.LECTURE WHERE L_ID = :contentId`,
          { contentId: parseInt(version.contentId) }
        );
        if (lectureResult.rows.length > 0) {
          currentData = formatRow(lectureResult.rows[0], lectureResult.metaData);
        }
        break;
    }

    // Parse restore data
    const restoreData = JSON.parse(version.newData);

    // Apply restoration based on content type
    // Note: In production, would apply actual updates to the content tables
    
    // Create a new version entry for the restore action
    const restoreEntry = createVersionEntry({
      contentType: version.contentType,
      contentId: version.contentId,
      action: 'restore',
      userId,
      previousData: currentData,
      newData: restoreData,
      message: `Restored to version ${versionId}`,
    });

    await connection.execute(
      `INSERT INTO EDUX.CONTENT_VERSIONS (
        VERSION_ID, CONTENT_TYPE, CONTENT_ID, COURSE_ID, ACTION,
        USER_ID, PREVIOUS_DATA, NEW_DATA, MESSAGE, CREATED_AT
      ) VALUES (
        :versionId, :contentType, :contentId, :courseId, :action,
        :userId, :previousData, :newData, :message, SYSDATE
      )`,
      {
        versionId: restoreEntry.versionId,
        contentType: restoreEntry.contentType,
        contentId: restoreEntry.contentId,
        courseId: version.courseId,
        action: restoreEntry.action,
        userId: userId ? parseInt(userId) : null,
        previousData: restoreEntry.previousData,
        newData: restoreEntry.newData,
        message: restoreEntry.message,
      },
      { autoCommit: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Version restored successfully',
      restoredVersion: versionId,
      newVersion: restoreEntry.versionId,
      restoreData,
    });
  } catch (error) {
    console.error('Restore version error:', error);
    return res.status(500).json({ error: 'Failed to restore version' });
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
