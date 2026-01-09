/**
 * Update Course API
 * POST - Update course information and settings
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";
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
    return res.status(405).json({ error: 'Method not allowed' });
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

  try {
    const [fields, files] = await form.parse(req);

    const c_id = Array.isArray(fields.c_id) ? fields.c_id[0] : fields.c_id;
    const u_id = Array.isArray(fields.u_id) ? fields.u_id[0] : fields.u_id;
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const field = Array.isArray(fields.field) ? fields.field[0] : fields.field;
    const seat = Array.isArray(fields.seat) ? fields.seat[0] : fields.seat;
    const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;

    if (!c_id || !u_id || !title || !description || !field) {
      return res.status(400).json({ 
        success: false,
        message: 'Course ID, User ID, title, description, and field are required' 
      });
    }

    let connection;
    try {
      connection = await pool.acquire();

      // Verify ownership - Courses are owned by Instructors, which are linked to Users
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

      // Handle thumbnail upload
      let thumbnailPath = null;
      if (files.thumbnail && Array.isArray(files.thumbnail) && files.thumbnail.length > 0) {
        const thumbnail = files.thumbnail[0];
        const newFilename = `${c_id}${path.extname(thumbnail.originalFilename || thumbnail.newFilename)}`;
        const newPath = path.join(uploadDir, newFilename);
        
        fs.renameSync(thumbnail.filepath, newPath);
        thumbnailPath = `/uploads/courses/thumbnails/${newFilename}`;
      }

      // Build update query dynamically
      let updateQuery = `UPDATE EDUX."Courses" SET "title" = :title, "description" = :description, "field" = :field`;
      const binds = { c_id, title, description, field };

      if (seat) {
        updateQuery += `, "seat" = :seat`;
        binds.seat = parseInt(seat) || 0;
      }

      if (price) {
        updateQuery += `, "price" = :price`;
        binds.price = parseFloat(price) || 0;
      }

      if (thumbnailPath) {
        updateQuery += `, "wall" = :wall`;
        binds.wall = thumbnailPath;
      }

      updateQuery += ` WHERE "c_id" = :c_id`;

      const result = await connection.execute(updateQuery, binds, { autoCommit: true });

      pool.release(connection);

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully'
      });
    } catch (error) {
      console.error('Error updating course:', error);
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
        message: 'Failed to update course',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error parsing form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse form data',
      error: error.message
    });
  }
}
