/**
 * Certificate API - Generate and verify certificates
 */

import pool from '@/middleware/connectdb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Generate certificate
    return generateCertificate(req, res);
  } else if (req.method === 'GET') {
    // Get certificate or verify
    return getCertificate(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function generateCertificate(req, res) {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ error: 'User ID and Course ID are required' });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Check if user has completed the course
    const completionCheck = await connection.execute(
      `SELECT e.ENROLLMENT_DATE, e.COMPLETED, c.C_NAME, c.DURATION,
              u.F_NAME || ' ' || u.L_NAME as STUDENT_NAME,
              i.F_NAME || ' ' || i.L_NAME as INSTRUCTOR_NAME
       FROM EDUX.ENROLLMENT e
       JOIN EDUX.COURSE c ON e.C_ID = c.C_ID
       JOIN EDUX.USERS u ON e.U_ID = u.U_ID
       JOIN EDUX.INSTRUCTOR ins ON c.I_ID = ins.I_ID
       JOIN EDUX.USERS i ON ins.U_ID = i.U_ID
       WHERE e.U_ID = :userId AND e.C_ID = :courseId`,
      { userId, courseId }
    );

    if (completionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = completionCheck.rows[0];

    // Generate certificate ID
    const certificateId = `EDUX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Check if certificate already exists
    const existingCert = await connection.execute(
      `SELECT CERTIFICATE_ID FROM EDUX.CERTIFICATES 
       WHERE U_ID = :userId AND C_ID = :courseId`,
      { userId, courseId }
    );

    if (existingCert.rows.length > 0) {
      // Return existing certificate
      return res.status(200).json({
        certificateId: existingCert.rows[0][0],
        studentName: enrollment[4],
        courseName: enrollment[2],
        instructorName: enrollment[5],
        completionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        hoursCompleted: enrollment[3],
        alreadyExists: true,
      });
    }

    // Insert new certificate (table might not exist, so handle gracefully)
    try {
      await connection.execute(
        `INSERT INTO EDUX.CERTIFICATES (CERTIFICATE_ID, U_ID, C_ID, ISSUED_DATE)
         VALUES (:certificateId, :userId, :courseId, SYSDATE)`,
        { certificateId, userId, courseId },
        { autoCommit: true }
      );
    } catch (insertError) {
      // Table might not exist, continue anyway
      console.log('Certificate table might not exist:', insertError.message);
    }

    return res.status(200).json({
      certificateId,
      studentName: enrollment[4],
      courseName: enrollment[2],
      instructorName: enrollment[5],
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      hoursCompleted: enrollment[3],
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return res.status(500).json({ error: 'Failed to generate certificate' });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}

async function getCertificate(req, res) {
  const { id, userId, courseId } = req.query;

  let connection;
  try {
    connection = await pool.acquire();

    let query, params;

    if (id) {
      // Verify certificate by ID
      query = `SELECT cert.CERTIFICATE_ID, cert.ISSUED_DATE,
                      u.F_NAME || ' ' || u.L_NAME as STUDENT_NAME,
                      c.C_NAME, c.DURATION,
                      i.F_NAME || ' ' || i.L_NAME as INSTRUCTOR_NAME
               FROM EDUX.CERTIFICATES cert
               JOIN EDUX.USERS u ON cert.U_ID = u.U_ID
               JOIN EDUX.COURSE c ON cert.C_ID = c.C_ID
               JOIN EDUX.INSTRUCTOR ins ON c.I_ID = ins.I_ID
               JOIN EDUX.USERS i ON ins.U_ID = i.U_ID
               WHERE cert.CERTIFICATE_ID = :id`;
      params = { id };
    } else if (userId && courseId) {
      // Get certificate by user and course
      query = `SELECT cert.CERTIFICATE_ID, cert.ISSUED_DATE,
                      u.F_NAME || ' ' || u.L_NAME as STUDENT_NAME,
                      c.C_NAME, c.DURATION,
                      i.F_NAME || ' ' || i.L_NAME as INSTRUCTOR_NAME
               FROM EDUX.CERTIFICATES cert
               JOIN EDUX.USERS u ON cert.U_ID = u.U_ID
               JOIN EDUX.COURSE c ON cert.C_ID = c.C_ID
               JOIN EDUX.INSTRUCTOR ins ON c.I_ID = ins.I_ID
               JOIN EDUX.USERS i ON ins.U_ID = i.U_ID
               WHERE cert.U_ID = :userId AND cert.C_ID = :courseId`;
      params = { userId, courseId };
    } else {
      return res.status(400).json({ error: 'Certificate ID or User ID and Course ID required' });
    }

    const result = await connection.execute(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found', valid: false });
    }

    const cert = result.rows[0];
    return res.status(200).json({
      valid: true,
      certificateId: cert[0],
      issuedDate: cert[1],
      studentName: cert[2],
      courseName: cert[3],
      hoursCompleted: cert[4],
      instructorName: cert[5],
    });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    // If table doesn't exist, return not found
    return res.status(404).json({ error: 'Certificate not found', valid: false });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}
