/**
 * Certificate API - Generate and verify certificates
 * Works with the actual EDUX schema using lowercase quoted identifiers
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

    // Check if user is enrolled in the course and get course/user details
    // Using the actual schema: Enrolls, Courses, Users, Instructors
    const enrollmentQuery = `
      SELECT 
        e."s_id",
        e."c_id", 
        e."date" as enroll_date,
        e."progress",
        c."title" as course_name,
        c."field",
        c."i_id",
        u."name" as student_name,
        i_user."name" as instructor_name
      FROM EDUX."Enrolls" e
      JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
      JOIN EDUX."Users" u ON e."s_id" = u."u_id"
      JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
      JOIN EDUX."Users" i_user ON i."i_id" = i_user."u_id"
      WHERE e."s_id" = :userId AND e."c_id" = :courseId
    `;

    const enrollmentResult = await connection.execute(enrollmentQuery, { userId, courseId });

    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'You are not enrolled in this course' });
    }

    const data = enrollmentResult.rows[0];
    // Access by index: s_id[0], c_id[1], enroll_date[2], progress[3], course_name[4], field[5], i_id[6], student_name[7], instructor_name[8]
    const studentName = data.STUDENT_NAME;
    const courseName = data.COURSE_NAME;
    const instructorName = data.INSTRUCTOR_NAME;
    const field = data.field
    const enrollDate = data.ENROLL_DATE;

    // Check completion (progress should be 100 or check if all lectures are completed)
    // For now, we'll allow certificate generation if enrolled (you can add progress check)
    // TODO: Add proper completion check based on your requirements

    // Generate certificate ID (deterministic based on user and course)
    const certificateId = `EDUX-${courseId}-${userId}-${Date.now().toString(36).toUpperCase()}`;

    // Return certificate data
    // Note: instructorSignature could be fetched from database if available
    // For now, we use the default signature
    return res.status(200).json({
      certificateId,
      studentName: studentName || 'Student',
      courseName: courseName || 'Course',
      instructorName: instructorName || 'Instructor',
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      hoursCompleted: null, // Course duration not in schema
      field: field,
      enrollDate: enrollDate,
      instructorSignature: null, // Will use default: /signatures/ins_signature.png
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return res.status(500).json({ error: 'Failed to generate certificate', details: error.message });
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

    // Verify enrollment exists for the given parameters
    if (userId && courseId) {
      const query = `
        SELECT 
          e."s_id",
          e."c_id",
          e."date" as enroll_date,
          c."title" as course_name,
          u."name" as student_name,
          i_user."name" as instructor_name
        FROM EDUX."Enrolls" e
        JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
        JOIN EDUX."Users" u ON e."s_id" = u."u_id"
        JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
        JOIN EDUX."Users" i_user ON i."i_id" = i_user."u_id"
        WHERE e."s_id" = :userId AND e."c_id" = :courseId
      `;

      const result = await connection.execute(query, { userId, courseId });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found', valid: false });
      }

      const data = result.rows[0];
      
      // Format the issue date properly
      let issuedDate = data.ENROLL_DATE;
      if (issuedDate instanceof Date) {
        issuedDate = issuedDate.toISOString();
      }
      
      return res.status(200).json({
        valid: true,
        certificateId: `EDUX-${courseId}-${userId}`,
        studentName: data.STUDENT_NAME || 'Unknown',
        courseName: data.COURSE_NAME || 'Unknown Course',
        instructorName: data.INSTRUCTOR_NAME || 'Unknown Instructor',
        issuedDate: issuedDate,
      });
    }

    // For ID-based verification, parse the certificate ID
    if (id && id.startsWith('EDUX-')) {
      const parts = id.split('-');
      if (parts.length >= 3) {
        const certCourseId = parts[1];
        const certUserId = parts[2];
        
        const query = `
          SELECT 
            e."s_id",
            e."c_id",
            e."date" as enroll_date,
            c."title" as course_name,
            u."name" as student_name,
            i_user."name" as instructor_name
          FROM EDUX."Enrolls" e
          JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
          JOIN EDUX."Users" u ON e."s_id" = u."u_id"
          JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
          JOIN EDUX."Users" i_user ON i."i_id" = i_user."u_id"
          WHERE e."s_id" = :userId AND e."c_id" = :courseId
        `;

        const result = await connection.execute(query, { userId: certUserId, courseId: certCourseId });

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Certificate not found', valid: false });
        }

        const data = result.rows[0];
        
        // Format the issue date properly
        let issuedDate = data.ENROLL_DATE;
        if (issuedDate instanceof Date) {
          issuedDate = issuedDate.toISOString();
        }
        
        return res.status(200).json({
          valid: true,
          certificateId: id,
          studentName: data.STUDENT_NAME || 'Unknown',
          courseName: data.COURSE_NAME || 'Unknown Course',
          instructorName: data.INSTRUCTOR_NAME || 'Unknown Instructor',
          issuedDate: issuedDate,
        });
      }
    }

    return res.status(400).json({ error: 'Certificate ID or User ID and Course ID required' });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    return res.status(500).json({ error: 'Failed to verify certificate', details: error.message });
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}
