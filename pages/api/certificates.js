const oracledb = require('oracledb');
import pool from '../../middleware/connectdb';

/**
 * POST /api/certificates
 * Body: { userId }
 * Returns a list of certificates for completed courses (progress = 100)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  let connection;
  try {
    connection = await pool.acquire();

    const query = `
      SELECT
        c."c_id" AS course_id,
        c."title" AS course_name,
        TO_CHAR(e."date", 'YYYY-MM-DD') AS completion_date,
        u."name" AS student_name,
        i_user."name" AS instructor_name
      FROM EDUX."Enrolls" e
      JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
      JOIN EDUX."Users" u ON e."s_id" = u."u_id"
      JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
      JOIN EDUX."Users" i_user ON i."i_id" = i_user."u_id"
      WHERE e."s_id" = :userId AND NVL(e."progress", 0) = 100
      ORDER BY e."date" DESC
    `;

    const result = await connection.execute(query, { userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows || [];

    const certificates = rows.map(r => ({
      certificateId: `EDUX-${r.COURSE_ID}-${userId}`,
      courseId: r.COURSE_ID,
      courseName: r.COURSE_NAME,
      instructorName: r.INSTRUCTOR_NAME,
      studentName: r.STUDENT_NAME,
      completionDate: r.COMPLETION_DATE,
      eduxSignature: '/signatures/edux_signature.png',
      instructorSignature: null,
    }));

    return res.status(200).json(certificates);
  } catch (err) {
    console.error('certificates API error:', err);
    return res.status(500).json({ error: 'Failed to fetch certificates', details: err.message });
  } finally {
    if (connection) await pool.release(connection);
  }
}
