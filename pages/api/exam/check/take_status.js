/**
 * Take Status API
 * Returns whether a student has taken a given exam
 * Request: POST { s_id, e_id }
 * Response: { take_status: 'taken'|'not_taken', success: true }
 */
const oracledb = require('oracledb');
import pool from '@/middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { s_id, e_id } = req.body;

  if (!s_id || !e_id) {
    return res.status(400).json({ error: 'Student ID and Exam ID are required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `SELECT COUNT(*) AS CNT FROM EDUX."Takes" WHERE "s_id" = :s_id AND "e_id" = :e_id`,
      { s_id, e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const count = result.rows && result.rows[0] ? Number(result.rows[0].CNT) : 0;
    const take_status = count > 0 ? 'taken' : 'not_taken';

    pool.release(connection);
    return res.status(200).json({ take_status, success: true });
  } catch (error) {
    console.error('take_status error:', error);
    if (connection) pool.release(connection);
    return res.status(500).json({ error: 'Failed to fetch take status', details: error.message });
  }
}
