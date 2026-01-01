// AI Summary Generation API

import summary from '../../../lib/ai/summary';
import pool from '../../../middleware/connectdb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).json({ error: 'Type and ID are required' });
    }

    // Get database connection from pool
    connection = await pool.acquire();

    let content;
    let result;

    switch (type) {
      case 'course':
        // Get course content for summary
        const courseResult = await connection.execute(
          `SELECT c."c_id", c."title", c."description", c."field",
                  u."name" as instructor_name
           FROM EDUX."Courses" c
           JOIN EDUX."Instructors" ins ON c."i_id" = ins."i_id"
           JOIN EDUX."Users" u ON ins."i_id" = u."u_id"
           WHERE c."c_id" = :id`,
          { id }
        );

        if (!courseResult.rows || courseResult.rows.length === 0) {
          pool.release(connection);
          return res.status(404).json({ error: 'Course not found' });
        }

        // Get course topics
        const topicsResult = await connection.execute(
          `SELECT "name" FROM EDUX."Topics" WHERE "c_id" = :id ORDER BY "serial"`,
          { id }
        );

        content = {
          ...courseResult.rows[0],
          topics: (topicsResult.rows || []).map(row => ({
            name: row[0]
          }))
        };

        result = await summary.generateCourseSummary(content);
        break;

      case 'topic':
        // Get topic content
        const topicResult = await connection.execute(
          `SELECT t."t_id", t."name",
                  c."title" as course_name
           FROM EDUX."Topics" t
           JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
           WHERE t."t_id" = :id`,
          { id }
        );

        if (!topicResult.rows || topicResult.rows.length === 0) {
          pool.release(connection);
          return res.status(404).json({ error: 'Topic not found' });
        }

        // Get topic lectures
        const lecturesResult = await connection.execute(
          `SELECT "description" FROM EDUX."Lectures" WHERE "t_id" = :id ORDER BY "serial"`,
          { id }
        );

        content = {
          ...topicResult.rows[0],
          lectures: (lecturesResult.rows || []).map(row => ({
            title: row[0]
          }))
        };

        result = await summary.generateTopicSummary(content);
        break;

      case 'lecture':
        // Get lecture content
        const lectureResult = await connection.execute(
          `SELECT l."l_id", l."description", l."video",
                  t."name" as topic_name, c."title" as course_name
           FROM EDUX."Lectures" l
           JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
           JOIN EDUX."Courses" c ON t."c_id" = c."c_id"
           WHERE l."l_id" = :id`,
          { id }
        );

        if (!lectureResult.rows || lectureResult.rows.length === 0) {
          pool.release(connection);
          return res.status(404).json({ error: 'Lecture not found' });
        }

        content = lectureResult.rows[0];
        result = await summary.generateLectureSummary(content);
        break;

      default:
        pool.release(connection);
        return res.status(400).json({ error: 'Invalid summary type' });
    }

    pool.release(connection);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Summary API error:', error);
    if (connection) {
      pool.release(connection);
    }
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
