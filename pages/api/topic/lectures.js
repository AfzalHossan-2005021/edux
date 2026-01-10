/**
 * Topic Lectures API
 * GET lectures for a specific topic
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
      `SELECT l."l_id", l."description", l."video", l."serial" as order_num, 
              l."weight", l."t_id"
       FROM EDUX."Lectures" l
       WHERE l."t_id" = :t_id
       ORDER BY l."serial" NULLS LAST, l."l_id"`,
      { t_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    pool.release(connection);

    return res.status(200).json({
      success: true,
      lectures: result.rows || []
    });
  } catch (error) {
    console.error('Error fetching lectures:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch lectures' 
    });
  }
}
