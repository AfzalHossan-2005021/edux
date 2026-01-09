const oracledb = require('oracledb');
import pool from '../../middleware/connectdb';
import get_instructor_info_query from '@/db/get_instructor_info_query';


export default async function handler(req, res) {
  const connection = await pool.acquire();
  
  try {
    if (req.method === 'POST') {
      const { u_id, name, email, expertise, qualification, bio } = req.body;
      
      // If updating profile
      if (name || email || expertise || qualification || bio) {
        // Update Users table
        if (name || email) {
          const updateUserQuery = `
            UPDATE "Users" 
            SET ${name ? '"name" = :name' : ''} ${email ? (name ? ', ' : '') + '"email" = :email' : ''}
            WHERE "u_id" = :u_id
          `;
          
          const updateUserParams = {
            u_id,
            ...(name && { name }),
            ...(email && { email })
          };
          
          await connection.execute(updateUserQuery, updateUserParams);
        }
        
        // Update Instructors table
        if (expertise || qualification || bio) {
          const updateInstructorQuery = `
            UPDATE "Instructors" 
            SET ${expertise ? '"expertise" = :expertise' : ''} ${qualification ? (expertise ? ', ' : '') + '"qualification" = :qualification' : ''} ${bio ? (expertise || qualification ? ', ' : '') + '"bio" = :bio' : ''}
            WHERE "i_id" = :u_id
          `;
          
          const updateInstructorParams = {
            u_id,
            ...(expertise && { expertise }),
            ...(qualification && { qualification }),
            ...(bio && { bio })
          };
          
          await connection.execute(updateInstructorQuery, updateInstructorParams);
        }
        
        await connection.commit();
        
        // Fetch updated data
        const result = await connection.execute(
          get_instructor_info_query(),
          { USER_ID: u_id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        res.status(200).json({ success: true, data: result.rows[0], message: 'Profile updated successfully' });
      } else {
        // Only fetching data
        const result = await connection.execute(
          get_instructor_info_query(),
          { USER_ID: u_id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json(result.rows);
      }
    } else {
      res.status(400).json({ message: 'This method is not allowed.' });
    }
  } catch (error) {
    console.error('Instructor info error:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  } finally {
    pool.release(connection);
  }
}
