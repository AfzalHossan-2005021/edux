const oracledb = require('oracledb');
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { i_id, title, description, field, seat, difficulty_level, price, prerequisites = [], outcomes = [], wall } = req.body;

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

  // Validate prerequisites and outcomes
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

  // Check all prerequisites are valid
  for (const prereq of prerequisites) {
    if (typeof prereq !== 'string' || prereq.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Each prerequisite must be a string with max 500 characters'
      });
    }
  }

  // Check all outcomes are valid
  for (const outcome of outcomes) {
    if (typeof outcome !== 'string' || outcome.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Each outcome must be a string with max 500 characters'
      });
    }
  }

  // Check wall image URL if provided
  if (wall && (typeof wall !== 'string' || wall.length > 255)) {
    return res.status(400).json({
      success: false,
      message: 'Wall image URL must be a string with max 255 characters'
    });
  }

  let connection;

  try {
    connection = await pool.acquire();

    console.log('Creating course with data:', { i_id, title, field, seat, prerequisites: prerequisites.length, outcomes: outcomes.length, wall });

    // Verify the instructor exists
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

    // Insert the course
    await connection.execute(
      `INSERT INTO EDUX."Courses" ("i_id", "title", "description", "field", "seat", "difficulty_level", "price", "wall", "approve_status", "student_count") 
       VALUES (:i_id, :title, :description, :field, :seat, :difficulty_level, :price, :wall, 'n', 0)`,
      {
        i_id,
        title,
        description,
        field,
        seat,
        wall: wall || null,
        difficulty_level: difficulty_level || 'beginner',
        price: price || 0
      },
      { autoCommit: true }
    );

    // Get the last inserted course ID
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

    // Insert prerequisites
    if (prerequisites.length > 0) {
      for (const prereq of prerequisites) {
        await connection.execute(
          `INSERT INTO EDUX."Prerequisites" ("c_id", "description") VALUES (:c_id, :description)`,
          { c_id, description: prereq },
          { autoCommit: true }
        );
      }
      console.log(`Inserted ${prerequisites.length} prerequisites`);
    }

    // Insert outcomes
    if (outcomes.length > 0) {
      for (const outcome of outcomes) {
        await connection.execute(
          `INSERT INTO EDUX."Outcomes" ("c_id", "description") VALUES (:c_id, :description)`,
          { c_id, description: outcome },
          { autoCommit: true }
        );
      }
      console.log(`Inserted ${outcomes.length} outcomes`);
    }

    return res.status(201).json({
      success: true,
      message: 'Course created successfully with prerequisites and learning outcomes',
      course: {
        c_id,
        i_id,
        title,
        description,
        field,
        seat,
        wall,
        difficulty_level: difficulty_level || 'beginner',
        price: price || 0,
        approve_status: 'n',
        student_count: 0,
        prerequisitesCount: prerequisites.length,
        outcomesCount: outcomes.length
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