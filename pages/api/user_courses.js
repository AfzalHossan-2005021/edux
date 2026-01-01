const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"


export default async function handler(req, res) {
    if (req.method == 'POST') {
        let connection;
        const { u_id } = req.body;
        
        if (!u_id) {
            return res.status(400).json([[], []]);
        }
        
        try {
            connection = await pool.acquire();
            
            // Get in-progress courses (progress < 100)
            const inProgressResult = await connection.execute(
                `SELECT c."c_id", c."title", c."description", 
                        NVL(e."progress", 0) AS progress
                 FROM EDUX."Enrolls" e
                 JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
                 WHERE e."s_id" = :u_id AND NVL(e."progress", 0) < 100
                 ORDER BY e."date" DESC`,
                { u_id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            // Get completed courses (progress = 100)
            const completedResult = await connection.execute(
                `SELECT c."c_id", c."title", c."description",
                        e."progress", e."grade", 
                        TO_CHAR(e."date", 'YYYY-MM-DD') AS completion_date
                 FROM EDUX."Enrolls" e
                 JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
                 WHERE e."s_id" = :u_id AND e."progress" = 100
                 ORDER BY e."date" DESC`,
                { u_id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            // Transform column names for frontend consistency
            const inProgress = (inProgressResult.rows || []).map(row => ({
                c_id: row.c_id,
                title: row.title,
                description: row.description,
                progress: row.PROGRESS || 0
            }));
            
            const completed = (completedResult.rows || []).map(row => ({
                c_id: row.c_id,
                title: row.title,
                description: row.description,
                progress: row.progress,
                grade: row.grade,
                completion_date: row.COMPLETION_DATE
            }));
            
            res.status(200).json([inProgress, completed]);
        } catch (error) {
            console.error('user_courses error:', error);
            res.status(500).json([[], []]);
        } finally {
            if (connection) {
                pool.release(connection);
            }
        }
    }
    else {
        res.status(400).json({ message: 'This method is not allowed.' })
    }
}