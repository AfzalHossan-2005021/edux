const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    const { u_id, c_id } = req.body;
    
    // Validate required fields
    if (!u_id || !c_id) {
        return res.status(400).json({ message: 'Missing required fields: u_id and c_id are required.' });
    }

    let connection;
    try {
        connection = await pool.acquire();
        
        // Call procedure with OUT cursor parameter
        const result = await connection.execute(
            `BEGIN
                USER_COURSE_CONTENT(:student_id, :course_id, :out_cursor);
             END;`,
            { 
                student_id: u_id,
                course_id: c_id,
                out_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Get results from the cursor
        const cursor = result.outBinds.out_cursor;
        const rows = await cursor.getRows();
        await cursor.close();
        
        // Handle empty results
        if (!rows || rows.length === 0) {
            return res.status(200).json([]);
        }
        
        // Group results by topic for the client
        // Oracle column naming: quoted identifiers (like t."t_id") return lowercase,
        // while unquoted aliases (like AS topic_name) return UPPERCASE
        const topicsMap = new Map();
        const lecturesMap = new Map();
        const examsMap = new Map();
        
        rows.forEach(row => {
            // t."t_id" returns lowercase 't_id'
            const topicId = row.t_id;
            
            // Add topic if not exists
            if (topicId && !topicsMap.has(topicId)) {
                topicsMap.set(topicId, {
                    t_id: topicId,
                    name: row.TOPIC_NAME,        // AS topic_name → TOPIC_NAME
                    serial: row.TOPIC_SERIAL,    // AS topic_serial → TOPIC_SERIAL
                    weight: row.TOPIC_WEIGHT     // AS topic_weight → TOPIC_WEIGHT
                });
                lecturesMap.set(topicId, []);
                examsMap.set(topicId, []);
            }
            
            // l."l_id" returns lowercase 'l_id'
            const lectureId = row.l_id;
            if (lectureId && topicId) {
                const lectures = lecturesMap.get(topicId);
                if (lectures && !lectures.find(l => l.l_id === lectureId)) {
                    lectures.push({
                        l_id: lectureId,
                        description: row.LECTURE_DESCRIPTION,
                        video: row.video,                    // l."video" → video (lowercase)
                        weight: row.LECTURE_WEIGHT,
                        serial: row.LECTURE_SERIAL,
                        STATUS: row.LECTURE_WATCHED || 0
                    });
                }
            }
            
            // e."e_id" returns lowercase 'e_id'  
            const examId = row.e_id;
            if (examId && topicId) {
                const exams = examsMap.get(topicId);
                if (exams && !exams.find(e => e.e_id === examId)) {
                    exams.push({
                        e_id: examId,
                        question_count: row.question_count,  // e."question_count" → lowercase
                        marks: row.marks,                    // e."marks" → lowercase
                        duration: row.duration,              // e."duration" → lowercase
                        weight: row.EXAM_WEIGHT,
                        STATUS: row.EXAM_STATUS || 0,
                        exam_marks: row.EXAM_MARKS
                    });
                }
            }
        });
        
        // Build response in the format expected by client:
        // [topics_array, lectures_for_topic_0, lectures_for_topic_1, ..., exams_for_topic_0, exams_for_topic_1, ...]
        const topics = Array.from(topicsMap.values()).sort((a, b) => a.serial - b.serial);
        const response = [topics];
        
        // Add lectures for each topic
        topics.forEach(topic => {
            const lectures = lecturesMap.get(topic.t_id) || [];
            response.push(lectures.sort((a, b) => a.serial - b.serial));
        });
        
        // Add exams for each topic
        topics.forEach(topic => {
            const exams = examsMap.get(topic.t_id) || [];
            response.push(exams.length > 0 ? exams : [{ e_id: null, duration: 0, STATUS: 0 }]);
        });
        
        res.status(200).json(response);
    } catch (error) {
        console.error('User course content error:', error.message);
        res.status(500).json({ message: 'An error occurred while fetching course content.' });
    } finally {
        if (connection) {
            pool.release(connection);
        }
    }
}