/**
 * Course Prerequisites and Outcomes API
 * POST - Add/update prerequisites and learning outcomes for a course
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { c_id, u_id, prerequisites = [], outcomes = [] } = req.body;

  // Validation
  if (!c_id || !u_id) {
    return res.status(400).json({
      success: false,
      message: 'Course ID and User ID are required'
    });
  }

  if (!Array.isArray(prerequisites)) {
    return res.status(400).json({
      success: false,
      message: 'Prerequisites must be an array'
    });
  }

  if (!Array.isArray(outcomes)) {
    return res.status(400).json({
      success: false,
      message: 'Outcomes must be an array'
    });
  }

  // Validate prerequisites
  for (const prereq of prerequisites) {
    if (typeof prereq !== 'string' || prereq.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Each prerequisite must be a string with max 500 characters'
      });
    }
  }

  // Validate outcomes
  for (const outcome of outcomes) {
    if (typeof outcome !== 'string' || outcome.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Each outcome must be a string with max 500 characters'
      });
    }
  }

  let connection;

  try {
    connection = await pool.acquire();

    // Verify ownership
    const ownerCheck = await connection.execute(
      `SELECT c."c_id" FROM EDUX."Courses" c 
       INNER JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
       WHERE c."c_id" = :c_id AND i."i_id" = :u_id`,
      { c_id, u_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!ownerCheck.rows || ownerCheck.rows.length === 0) {
      pool.release(connection);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this course'
      });
    }

    // Delete existing prerequisites
    await connection.execute(
      `DELETE FROM EDUX."Prerequisites" WHERE "c_id" = :c_id`,
      { c_id },
      { autoCommit: true }
    );

    // Delete existing outcomes
    await connection.execute(
      `DELETE FROM EDUX."Outcomes" WHERE "c_id" = :c_id`,
      { c_id },
      { autoCommit: true }
    );

    // Insert new prerequisites
    for (const prereq of prerequisites) {
      await connection.execute(
        `INSERT INTO EDUX."Prerequisites" ("c_id", "description") VALUES (:c_id, :description)`,
        { c_id, description: prereq },
        { autoCommit: true }
      );
    }

    // Insert new outcomes
    for (const outcome of outcomes) {
      await connection.execute(
        `INSERT INTO EDUX."Outcomes" ("c_id", "description") VALUES (:c_id, :description)`,
        { c_id, description: outcome },
        { autoCommit: true }
      );
    }

    pool.release(connection);

    return res.status(200).json({
      success: true,
      message: 'Prerequisites and learning outcomes updated successfully',
      data: {
        prerequisitesCount: prerequisites.length,
        outcomesCount: outcomes.length
      }
    });

  } catch (error) {
    console.error('Error updating prerequisites and outcomes:', error);
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
      message: 'Failed to update prerequisites and outcomes',
      error: error.message
    });
  }
}
