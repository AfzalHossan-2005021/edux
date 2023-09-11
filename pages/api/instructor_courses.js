const oracledb = require('oracledb');
import pool from '../../middleware/connectdb';
import get_instructor_courses_query from '@/db/get_instructor_courses_query';


export default async function handler(req, res) {
  if (req.method == 'POST') {
    const connection = await pool.acquire();
    const {u_id} = req.body;
    try {
      const result = await connection.execute(
          get_instructor_courses_query(u_id),
          [],
          {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({message: 'An error occurred.'});
    } finally {
      pool.release(connection);
    }
  } else {
    res.status(400).json({message: 'This method is not allowed.'});
  }
}
