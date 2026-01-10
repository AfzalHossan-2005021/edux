const oracledb = require('oracledb');
import pool from '@/middleware/connectdb';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses', 'thumbnails');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    multiples: false,
  });

  const [fields, files] = await form.parse(req);

  const i_id = fields.i_id[0]
  const title = fields.title[0]
  const description = fields.description[0]
  const field = fields.field[0]
  const seat = fields.seat[0];
  const difficulty_level = fields.difficulty_level[0]
  const price = fields.price[0]
  const prerequisites = JSON.parse(fields.prerequisites[0] || '[]');
  const outcomes = JSON.parse(fields.outcomes[0] || '[]');
  const wall = files.wall

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

  let connection;

  try {
    connection = await pool.acquire();

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
      `INSERT INTO EDUX."Courses" ("i_id", "title", "description", "field", "seat", "difficulty_level", "price", "approve_status", "student_count") 
       VALUES (:i_id, :title, :description, :field, :seat, :difficulty_level, :price, 'n', 0)`,
      {
        i_id,
        title,
        description,
        field,
        seat,
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
          `INSERT INTO EDUX."Prerequisites" ("c_id", "description")
           VALUES (:c_id, :description)`,
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
          `INSERT INTO EDUX."Outcomes" ("c_id", "description")
           VALUES (:c_id, :description)`,
          { c_id, description: outcome },
          { autoCommit: true }
        );
      }
      console.log(`Inserted ${outcomes.length} outcomes`);
    }

    // Handle the wall
    let wallPath = null;
    if(wall && Array.isArray(wall) && wall.length > 0){
      const wallFile = wall[0];
      const newFilename = `${c_id}${path.extname(wallFile.originalFilename || wallFile.newFilename)}`;
      const newPath = path.join(uploadDir, newFilename);
      
      fs.renameSync(wallFile.filepath, newPath);
      wallPath = `/uploads/courses/thumbnails/${newFilename}`;

      // Update course with wall path
      await connection.execute(
        `UPDATE EDUX."Courses"
         SET "wall" = :wall
         WHERE "c_id" = :c_id`,
        { wall: wallPath, c_id },
        { autoCommit: true }
      );

      console.log('Updated course with wall image path:', wallPath);
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
        wall: wallPath,
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