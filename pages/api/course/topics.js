/**
 * Course Topics API
 * Manages course topics/modules structure
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
  const { c_id, t_id, type } = req.query;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (t_id && type === 'detail') {
      // Get detailed topic information
      const topicResult = await connection.execute(
        `SELECT t."t_id", t."name", t."serial", t."weight", t."c_id",
                COUNT(DISTINCT l."l_id") as lecture_count,
                COUNT(DISTINCT e."e_id") as exam_count
         FROM EDUX."Topics" t
         LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
         LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
         WHERE t."t_id" = :t_id AND t."c_id" = :c_id
         GROUP BY t."t_id", t."name", t."serial", t."weight", t."c_id"`,
        { t_id, c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      pool.release(connection);

      if (!topicResult.rows || topicResult.rows.length === 0) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      return res.status(200).json({
        topic: topicResult.rows[0],
        success: true
      });
    }

    // Get all topics for a course
    const topicsResult = await connection.execute(
      `SELECT t."t_id", t."name", t."serial", t."weight", t."c_id",
              COUNT(DISTINCT l."l_id") as lecture_count,
              COUNT(DISTINCT e."e_id") as exam_count
       FROM EDUX."Topics" t
       LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
       LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
       WHERE t."c_id" = :c_id
       GROUP BY t."t_id", t."name", t."serial", t."weight", t."c_id"
       ORDER BY t."serial"`,
      { c_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    pool.release(connection);
    res.status(200).json({
      topics: topicsResult.rows || [],
      success: true
    });

  } catch (error) {
    console.error('Get topics error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to fetch topics', details: error.message });
  }
}

async function handlePost(req, res) {
  const { c_id, action, data } = req.body;

  if (!c_id) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'create_topic') {
      const { name, serial, weight } = data;

      if (!name) {
        pool.release(connection);
        return res.status(400).json({ error: 'Topic name is required' });
      }

      // Get next serial if not provided
      let nextSerial = serial;
      if (!nextSerial) {
        const serialResult = await connection.execute(
          `SELECT NVL(MAX("serial"), 0) + 1 as next_serial FROM EDUX."Topics" WHERE "c_id" = :c_id`,
          { c_id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        nextSerial = serialResult.rows[0].next_serial;
      }

      const result = await connection.execute(
        `INSERT INTO EDUX."Topics" ("name", "c_id", "serial", "weight")
         VALUES (:name, :c_id, :serial, :weight)
         RETURNING "t_id" INTO :t_id`,
        {
          name,
          c_id,
          serial: nextSerial,
          weight: weight || 1,
          t_id: new oracledb.OutParam(oracledb.NUMBER)
        },
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(201).json({
        message: 'Topic created successfully',
        topicId: result.outBinds.t_id,
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Post topics error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to create topic', details: error.message });
  }
}

async function handlePut(req, res) {
  const { t_id, action, data } = req.body;

  if (!t_id) {
    return res.status(400).json({ error: 'Topic ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    if (action === 'update_topic') {
      const { name, serial, weight } = data;

      const updateFields = [];
      const bindParams = { t_id };

      if (name !== undefined) {
        updateFields.push(`"name" = :name`);
        bindParams.name = name;
      }
      if (serial !== undefined) {
        updateFields.push(`"serial" = :serial`);
        bindParams.serial = serial;
      }
      if (weight !== undefined) {
        updateFields.push(`"weight" = :weight`);
        bindParams.weight = weight;
      }

      if (updateFields.length === 0) {
        pool.release(connection);
        return res.status(400).json({ error: 'No fields to update' });
      }

      await connection.execute(
        `UPDATE EDUX."Topics" 
         SET ${updateFields.join(', ')}
         WHERE "t_id" = :t_id`,
        bindParams,
        { autoCommit: true }
      );

      pool.release(connection);
      return res.status(200).json({
        message: 'Topic updated successfully',
        success: true
      });
    }

    pool.release(connection);
    res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Put topics error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to update topic', details: error.message });
  }
}

async function handleDelete(req, res) {
  const { t_id } = req.body;

  if (!t_id) {
    return res.status(400).json({ error: 'Topic ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get all lectures in this topic
    const lecturesResult = await connection.execute(
      `SELECT "l_id" FROM EDUX."Lectures" WHERE "t_id" = :t_id`,
      { t_id }
    );

    // Delete lecture progress for all lectures in topic
    if (lecturesResult.rows && lecturesResult.rows.length > 0) {
      for (const lecture of lecturesResult.rows) {
        await connection.execute(
          `DELETE FROM EDUX."LectureProgress" WHERE "l_id" = :l_id`,
          { l_id: lecture[0] }
        );
      }
    }

    // Delete all exams in topic
    await connection.execute(
      `DELETE FROM EDUX."Exams" WHERE "t_id" = :t_id`,
      { t_id }
    );

    // Delete all lectures in topic
    await connection.execute(
      `DELETE FROM EDUX."Lectures" WHERE "t_id" = :t_id`,
      { t_id }
    );

    // Delete the topic
    await connection.execute(
      `DELETE FROM EDUX."Topics" WHERE "t_id" = :t_id`,
      { t_id },
      { autoCommit: true }
    );

    pool.release(connection);
    res.status(200).json({
      message: 'Topic deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete topics error:', error);
    if (connection) pool.release(connection);
    res.status(500).json({ error: 'Failed to delete topic', details: error.message });
  }
}
