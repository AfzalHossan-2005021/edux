const oracledb = require('oracledb');
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { i_id, title, description, field, seat } = req.body;

  // Validation
  if (!i_id || !title || !description || !field || !seat) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required (i_id, title, description, field, seat)'
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must not exceed 100 characters'
    });
  }

  if (description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Description must not exceed 1000 characters'
    });
  }

  if (field.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Field must not exceed 255 characters'
    });
  }

  if (isNaN(seat) || seat < 1) {
    return res.status(400).json({
      success: false,
      message: 'Seat must be a positive number'
    });
  }

  let connection;

  try {
    connection = await pool.acquire();

    console.log('Creating course with data:', { i_id, title, field, seat });

    // Verify the instructor exists (check Users table where role includes instructor)
    const instructorCheck = await connection.execute(
      `SELECT "u_id" FROM EDUX."Users" WHERE "u_id" = :i_id`,
      { i_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!instructorCheck.rows || instructorCheck.rows.length === 0) {
      console.log('Instructor not found with ID:', i_id);
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Instructor verified');

    // Insert the course - let Oracle apply the DEFAULT sequence value
    console.log('Inserting course...');

    await connection.execute(
      `INSERT INTO EDUX."Courses" ("i_id", "title", "description", "field", "seat", "approve_status", "student_count") 
       VALUES (:i_id, :title, :description, :field, :seat, 'n', 0)`,
      {
        i_id,
        title,
        description,
        field,
        seat
      },
      { autoCommit: true }
    );

    // Get the last inserted course ID for this instructor
    const getCourseResult = await connection.execute(
      `SELECT "c_id" FROM EDUX."Courses" 
       WHERE "i_id" = :i_id 
       ORDER BY "c_id" DESC 
       FETCH FIRST 1 ROW ONLY`,
      { i_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!getCourseResult.rows || getCourseResult.rows.length === 0) {
      throw new Error('Failed to retrieve created course ID');
    }

    const c_id = getCourseResult.rows[0].c_id;
    console.log('Course created with ID:', c_id);

    console.log('Course created successfully with ID:', c_id);

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: {
        c_id,
        i_id,
        title,
        description,
        field,
        seat,
        approve_status: 'n',
        student_count: 0
      }
    });

  } catch (error) {
    console.error('Course creation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the course',
      error: error.message
    });
  } finally {
    if (connection) {
      pool.release(connection);
    }
  }
}
