const oracledb = require('oracledb');
import pool from '../../../middleware/connectdb';
import update_student_info_query from '@/db/update_student_info_query';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const {
    u_id,
    date_of_birth,
    gender,
    interests,
    location,
    occupation,
    website,
    bio
  } = req.body;
  
  if (!u_id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }
  let connection;
  try {
    connection = await pool.acquire();
    
    // Update student info
    await connection.execute(
      update_student_info_query(),
      {
        u_id,
        date_of_birth,
        gender,
        interests,
        location,
        occupation,
        website,
        bio
      }
    );
    
    await connection.commit();
    pool.release(connection);
    
    return res.status(200).json({ success: true, message: 'Personal info updated successfully' });
  } catch (error) {
    console.error('Error updating personal info:', error);
    if (connection) {
      try {
        await connection.rollback();
        pool.release(connection);
      } catch (e) {
        console.error('Rollback error:', e);
      }
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};