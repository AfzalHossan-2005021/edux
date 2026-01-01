const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"
import get_lecture_content_query from "@/db/get_lecture_content_query";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    const { s_id, c_id, t_id, l_id } = req.body;
    
    // Validate required fields
    if (!s_id || !c_id || !t_id || !l_id) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    let connection;
    try {
        connection = await pool.acquire();
        const result = await connection.execute(
            `DECLARE
                LECTURE_CURSOR SYS_REFCURSOR;
                WATCH_CURSOR SYS_REFCURSOR;
            BEGIN
                OPEN LECTURE_CURSOR FOR
                    ${get_lecture_content_query(s_id, c_id, t_id, l_id)};
                DBMS_SQL.RETURN_RESULT(LECTURE_CURSOR);
                EDUX.SECURE_WATCH(:s_id, :l_id, WATCH_CURSOR);
            END;`,
            {
                s_id: s_id,
                l_id: l_id
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Handle empty results
        if (!result.implicitResults || !result.implicitResults[0] || !result.implicitResults[0][0]) {
            return res.status(404).json({ message: 'Lecture not found.' });
        }
        
        const lecture = result.implicitResults[0][0];
        // Map 'video' column to 'video_link' for backward compatibility with client
        res.status(200).json({
            description: lecture.description,
            video_link: lecture.video
        });
    } catch (error) {
        console.error('Lecture content error:', error.message);
        res.status(500).json({ message: 'An error occurred while fetching lecture content.' });
    } finally {
        if (connection) {
            pool.release(connection);
        }
    }
}