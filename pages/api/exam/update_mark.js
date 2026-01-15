const oracledb = require("oracledb");
import pool from "@/middleware/connectdb";
import { updateMarkSchema, validateRequest } from '@/lib/validation/schemas';

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
    
    // Get exam total marks to determine pass/fail status
    const examResult = await connection.execute(
      `SELECT "marks" FROM EDUX."Exams" WHERE "e_id" = :e_id`,
      { e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const totalMarks = examResult.rows[0]?.marks || 10;
    const passPercentage = 0.4; // 40% to pass
    const status = score >= (totalMarks * passPercentage) ? 'p' : 'f';
    
    // Check if record exists in Takes table
    const checkResult = await connection.execute(
      `SELECT COUNT(*) as cnt FROM EDUX."Takes" WHERE "s_id" = :s_id AND "e_id" = :e_id`,
      { s_id, e_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (checkResult.rows[0].CNT > 0) {
      // Update existing record
      await connection.execute(
        `UPDATE EDUX."Takes" 
         SET "marks" = :score, "status" = :status 
         WHERE "s_id" = :s_id AND "e_id" = :e_id`,
        { score, status, s_id, e_id },
        { autoCommit: true }
      );
    } else {
      // Insert new record
      await connection.execute(
        `INSERT INTO EDUX."Takes" ("s_id", "e_id", "marks", "status") 
         VALUES (:s_id, :e_id, :score, :status)`,
        { s_id, e_id, score, status },
        { autoCommit: true }
      );
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Marks updated successfully',
      data: { score, status: status === 'p' ? 'passed' : 'failed' }
    });
  } catch (error) {
    console.error("Update mark error:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  } finally {
    if (connection) pool.release(connection);
  }
}
