const oracledb = require("oracledb");
import pool from "../../middleware/connectdb";
import { wishlistSchema, validateRequest } from '../../lib/validation/schemas';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Validate input
  const validation = validateRequest(wishlistSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: validation.errors 
    });
  }

  const { u_id, c_id } = validation.data;
  let connection;

  try {
    connection = await pool.acquire();
    const result = await connection.execute(
      `BEGIN
              :code := ADD_TO_WISHLIST(:u_id, :c_id);
              commit;
          END;`,
      {
        u_id: u_id,
        c_id: c_id,
        code: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json({ success: true, ...result.outBinds });
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    res.status(500).json({ success: false, message: "An error occurred." });
  } finally {
    if (connection) pool.release(connection);
  }
}
