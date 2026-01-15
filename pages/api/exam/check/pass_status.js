/**
 * Pass Status API
 * Determines whether a student's attempt(s) for an exam contains a passing status
 * Request: POST { s_id, e_id }
 * Response: { pass_status: 'pass'|'fail', success: true }
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
      `SELECT
         COUNT(*) AS TOTAL,
         SUM(CASE WHEN "status" = 'p' THEN 1 ELSE 0 END) AS PASS_COUNT
       FROM EDUX."Takes"
       WHERE "s_id" = :s_id AND "e_id" = :e_id`,
      { s_id, e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const row = result.rows && result.rows[0] ? result.rows[0] : { TOTAL: 0, PASS_COUNT: 0 };
    const passCount = Number(row.PASS_COUNT || 0);
    const pass_status = passCount > 0 ? 'pass' : 'fail';

    pool.release(connection);
    return res.status(200).json({ pass_status, success: true });
  } catch (error) {
    console.error('pass_status error:', error);
    if (connection) pool.release(connection);
    return res.status(500).json({ error: 'Failed to fetch pass status', details: error.message });
  }
}
