// AI Smart Search API

import search from '../../../lib/ai/search';
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    const { query, type = 'smart', limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get database connection from pool
    connection = await pool.acquire();

    // Get all courses for searching
    const coursesResult = await connection.execute(
      `SELECT c."c_id", c."title", c."description", c."field", 
              c."rating", u."name" as instructor_name
       FROM EDUX."Courses" c
       JOIN EDUX."Instructors" ins ON c."i_id" = ins."i_id"
       JOIN EDUX."Users" u ON ins."i_id" = u."u_id"`
    );
    
    const courses = (coursesResult.rows || []).map(row => ({
      id: row[0],
      title: row[1],
      description: row[2],
      category: row[3],
      rating: row[4],
      level: row[5],
      instructor: row[6],
    }));

    let result;

    switch (type) {
      case 'suggestions':
        result = await search.getSearchSuggestions(query, courses);
        break;
      
      case 'parse':
        result = await search.parseSearchQuery(query);
        break;
      
      case 'smart':
      default:
        result = await search.smartSearch(query, courses, { limit });
        break;
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Search failed' });
  }
}
