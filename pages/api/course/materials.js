/**
 * Course Materials API
 * Manages all course materials including lectures, resources, and downloadables
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    return handleGet(req, res);
  } else if (method === 'POST') {
    return handlePost(req, res);
  } else if (method === 'PUT') {
    return handlePut(req, res);
  } else if (method === 'DELETE') {
    return handleDelete(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  const { c_id, t_id, l_id, type } = req.query;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (type === 'lectures' && t_id) {
      // Get lectures for a specific topic
      const lecturesResult = await connection.execute(
        `SELECT l."l_id", l."description", l."video", l."weight", l."serial"
         FROM EDUX."Lectures" l
         JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
         WHERE t."t_id" = :t_id AND t."c_id" = :c_id
         ORDER BY l."serial"`,
        { t_id, c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      pool.release(connection);
      return res.status(200).json({
        lectures: lecturesResult.rows || [],
        success: true
      });
    }

    if (type === 'lecture' && l_id) {
      // Get detailed lecture information
      const lectureResult = await connection.execute(
        `SELECT l."l_id", l."description", l."video", l."weight", l."serial",
                t."t_id", t."name" as topic_name, c."c_id", c."title" as course_title
         FROM EDUX."Lectures" l
         JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
         JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
         WHERE l."l_id" = :l_id AND c."c_id" = :c_id`,
        { l_id, c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!lectureResult.rows || lectureResult.rows.length === 0) {
        pool.release(connection);
        return res.status(404).json({ error: 'Lecture not found' });
      }

      pool.release(connection);
      return res.status(200).json({
        lecture: lectureResult.rows[0],
        success: true
      });
    }

    // Get all materials for course
    const materialsResult = await connection.execute(
      `SELECT 
        t."t_id", t."name" as topic_name, t."serial" as topic_serial,
        l."l_id", l."description" as lecture_description, l."video", l."serial" as lecture_serial, l."weight"
       FROM EDUX."Topics" t
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       WHERE t."c_id" = :c_id
       ORDER BY t."serial", l."serial"`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    pool.release(connection);
    res.status(200).json({
      materials: materialsResult.rows || [],
      success: true
    });

  } catch (error) {
    console.error('Get materials error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to fetch materials', details: error.message });
  }
}

async function handlePost(req, res) {
  const { c_id, t_id, action, data } = req.body;

  if (!c_id || !t_id) {
    return res.status(400).json({ error: 'Course ID and Topic ID are required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'add_lecture') {
      const { description, video, weight, serial } = data;

      if (!description) {
        pool.release(connection);
        return res.status(400).json({ error: 'Lecture description is required' });
      }

      const result = await connection.execute(
        `INSERT INTO EDUX."Lectures" ("t_id", "description", "video", "weight", "serial")
         VALUES (:t_id, :description, :video, :weight, :serial)
         RETURNING "l_id" INTO :l_id`,
        {
          t_id,
          description,
          video: video || null,
          weight: weight || 1,
          serial: serial || 1,
          l_id: new oracledb.OutParam(oracledb.NUMBER)
        },
        { autoCommit: true }
      );

      const lectureId = result.outBinds.l_id;

      pool.release(connection);
      return res.status(201).json({
        message: 'Lecture added successfully',
        lectureId,
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Post materials error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to create material', details: error.message });
  }
}

async function handlePut(req, res) {
  const { l_id, action, data } = req.body;

  if (!l_id) {
    return res.status(400).json({ error: 'Lecture ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'update_lecture') {
      const { description, video, weight, serial } = data;

      const updateFields = [];
      const bindParams = { l_id };

      if (description !== undefined) {
        updateFields.push(`"description" = :description`);
        bindParams.description = description;
      }
      if (video !== undefined) {
        updateFields.push(`"video" = :video`);
        bindParams.video = video;
      }
      if (weight !== undefined) {
        updateFields.push(`"weight" = :weight`);
        bindParams.weight = weight;
      }
      if (serial !== undefined) {
        updateFields.push(`"serial" = :serial`);
        bindParams.serial = serial;
      }

      if (updateFields.length === 0) {
        pool.release(connection);
        return res.status(400).json({ error: 'No fields to update' });
      }

      await connection.execute(
        `UPDATE EDUX."Lectures" 
         SET ${updateFields.join(', ')}
         WHERE "l_id" = :l_id`,
        bindParams,
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Lecture updated successfully',
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Put materials error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to update material', details: error.message });
  }
}

async function handleDelete(req, res) {
  const { l_id } = req.body;

  if (!l_id) {
    return res.status(400).json({ error: 'Lecture ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Delete related lecture progress records first
    await connection.execute(
      `DELETE FROM EDUX."LectureProgress" WHERE "l_id" = :l_id`,
      { l_id },
      { autoCommit: true }
    );

    // Delete the lecture
    await connection.execute(
      `DELETE FROM EDUX."Lectures" WHERE "l_id" = :l_id`,
      { l_id },
      { autoCommit: true }
    );

    pool.release(connection);
    res.status(200).json({
      message: 'Lecture deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete materials error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to delete material', details: error.message });
  }
}
