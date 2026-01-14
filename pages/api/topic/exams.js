/**
 * Topic Exams API
 * GET exams for a specific topic
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id } = req.query;

  if (!t_id) {
    return res.status(400).json({ error: 'Topic ID is required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    const result = await connection.execute(
      `SELECT 
        e."e_id",
        e."question_count",
        e."marks",
        e."duration",
        e."pass_pct", 
        e."weight"
       FROM EDUX."Exams" e
       WHERE e."t_id" = :t_id
       ORDER BY e."e_id"`,
      { t_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    pool.release(connection);

    return res.status(200).json({
      success: true,
      exams: result.rows || []
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch exams' 
    });
  }
}
