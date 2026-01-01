const oracledb = require("oracledb");
import pool from "../../middleware/connectdb";
import { updateMarkSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Validate input
  const validation = validateRequest(updateMarkSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: validation.errors 
    });
  }

  const { s_id, e_id, score } = validation.data;
  let connection;

  try {
    connection = await pool.acquire();
    const result = await connection.execute(
      `BEGIN
          SECURE_EXAM(:s_id, :e_id, :marks);
      END;`,
      {
        s_id: s_id,
        e_id: e_id,
        marks: score,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Update mark error:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  } finally {
    if (connection) pool.release(connection);
  }
}
