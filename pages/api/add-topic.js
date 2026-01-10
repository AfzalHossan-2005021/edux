/**
 * Add Topic API
 * POST - Create a new topic for a course
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { c_id, name, description, serial, weight } = req.body;

  if (!c_id || !name) {
    return res.status(400).json({ 
      success: false,
      message: 'Course ID and topic name are required' 
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get next serial number if not provided
    let topicSerial = serial;
    if (!topicSerial) {
      const serialResult = await connection.execute(
        `SELECT NVL(MAX("serial"), 0) + 1 as next_serial 
         FROM EDUX."Topics" 
         WHERE "c_id" = :c_id`,
        { c_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      topicSerial = serialResult.rows[0]?.next_serial || 1;
    }

    // Insert new topic
    const result = await connection.execute(
      `INSERT INTO EDUX."Topics" ("name", "serial", "weight", "c_id")
       VALUES (:name, :serial, :weight, :c_id)
       RETURNING "t_id" INTO :t_id`,
      {
        name,
        serial: topicSerial,
        weight: weight || 1,
        c_id,
        t_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    pool.release(connection);

    return res.status(201).json({
      success: true,
      message: 'Topic added successfully',
      t_id: result.outBinds.t_id[0]
    });
  } catch (error) {
    console.error('Error adding topic:', error);
    if (connection) {
      try {
        await connection.rollback();
        pool.release(connection);
      } catch (e) {
        console.error('Rollback error:', e);
      }
    }
    return res.status(500).json({ 
      success: false,
      message: 'Failed to add topic',
      error: error.message 
    });
  }
}
