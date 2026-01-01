// AI Recommendations API

import { verifyAuth } from '../../../middleware/auth';
import recommendations from '../../../lib/ai/recommendations';
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    // Verify user is authenticated
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type = 'personalized', courseId = null, limit = 5 } = req.body;

    // Get database connection from pool
    connection = await pool.acquire();

    // Get user's enrolled courses
    const enrolledResult = await connection.execute(
      `SELECT c."c_id", c."title", c."description", c."field", c."rating"
       FROM EDUX."Enrolls" e
       JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
       WHERE e."s_id" = :userId`,
      { userId: user.id }
    );
    const enrolledCourses = (enrolledResult.rows || []).map(row => ({
      id: row[0],
      title: row[1],
      description: row[2],
      category: row[3],
      rating: row[4],
    }));

    // Get all available courses
    const allCoursesResult = await connection.execute(
      `SELECT c."c_id", c."title", c."description", c."field", c."rating", 
              u."name" as instructor_name
       FROM EDUX."Courses" c
       JOIN EDUX."Instructors" ins ON c."i_id" = ins."i_id"
       JOIN EDUX."Users" u ON ins."i_id" = u."u_id"
       WHERE c."c_id" NOT IN (SELECT "c_id" FROM EDUX."Enrolls" WHERE "s_id" = :userId)`,
      { userId: user.id }
    );
    const availableCourses = (allCoursesResult.rows || []).map(row => ({
      id: row[0],
      title: row[1],
      description: row[2],
      category: row[3],
      rating: row[4],
      level: row[5],
      instructor: row[6],
    }));

    let result;

    if (type === 'similar' && courseId) {
      // Get specific course details
      const courseResult = await connection.execute(
        `SELECT "c_id", "title", "description", "field" 
         FROM EDUX."Courses" WHERE "c_id" = :courseId`,
        { courseId }
      );
      
      if (!courseResult.rows || courseResult.rows.length === 0) {
        pool.release(connection);
        return res.status(404).json({ error: 'Course not found' });
      }

      const course = {
        id: courseResult.rows[0][0],
        title: courseResult.rows[0][1],
        description: courseResult.rows[0][2],
        category: courseResult.rows[0][3],
      };

      result = await recommendations.getSimilarCourses(course, availableCourses, limit);
    } else {
      // Personalized recommendations
      const userHistory = {
        enrolledCourses,
        completedCourses: [],
        searchHistory: [],
        preferences: {
          preferredCategories: [...new Set(enrolledCourses.map(c => c.category).filter(Boolean))],
        },
      };

      result = await recommendations.getRecommendations(userHistory, availableCourses, limit);
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Recommendations API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
}
