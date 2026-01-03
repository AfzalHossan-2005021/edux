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
    
    // Check if already in wishlist
    const checkResult = await connection.execute(
      `SELECT COUNT(*) as cnt FROM EDUX."Wishlist" WHERE "u_id" = :u_id AND "c_id" = :c_id`,
      { u_id: parseInt(u_id), c_id: parseInt(c_id) }
    );
    
    if (checkResult.rows[0]?.cnt > 0 || checkResult.rows[0]?.CNT > 0) {
      return res.status(200).json({ success: true, code: 0, message: "Already in wishlist" });
    }
    
    // Add to wishlist
    await connection.execute(
      `INSERT INTO EDUX."Wishlist"("u_id", "c_id") VALUES (:u_id, :c_id)`,
      { u_id: parseInt(u_id), c_id: parseInt(c_id) },
      { autoCommit: true }
    );
    
    res.status(200).json({ success: true, code: 1, message: "Added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    res.status(500).json({ success: false, message: "An error occurred: " + error.message });
  } finally {
    if (connection) pool.release(connection);
  }
}
