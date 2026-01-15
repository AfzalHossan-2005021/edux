/**
 * Add Lecture API
 * POST - Create a new lecture for a topic
 */
const oracledb = require('oracledb');
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { t_id, title, description, video, duration } = req.body;

  if (!t_id || !title || !description || !video || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Topic ID, title, description, video URL, and duration are required'
    });
  }

  let connection;
  try {
    connection = await pool.acquire();

    // Get next l_id
    const idResult = await connection.execute(
      `SELECT NVL(MAX("l_id"), 0) + 1 as next_id FROM EDUX."Lectures"`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = idResult.rows[0]?.NEXT_ID || 1;

    // Get next serial
    const serialResult = await connection.execute(
      `SELECT NVL(MAX("serial"), 0) + 1 as next_serial 
         FROM EDUX."Lectures" 
         WHERE "t_id" = :t_id`,
      { t_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const lectureSerial = serialResult.rows[0]?.NEXT_SERIAL || 1;

    // Insert new lecture
    await connection.execute(
      `INSERT INTO EDUX."Lectures" ("l_id", "t_id", "title", "description", "video", "serial", "duration")
       VALUES (:l_id, :t_id, :title, :description, :video, :serial, :duration)`,
      {
        l_id: nextId,
        t_id,
        title,
        description,
        video,
        serial: lectureSerial,
        duration
      },
      { autoCommit: true }
    );

    // Best-effort: recalculate weights immediately so UI sees updated values. If direct recalc fails (e.g., due to mutating table), schedule a post-commit job.
    let updatedLecture = null;
    let updatedTopic = null;
    try {
      const cidResult = await connection.execute(
        `SELECT "c_id" FROM EDUX."Topics" WHERE "t_id" = :t_id`,
        { t_id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const c_id = cidResult.rows && cidResult.rows[0] ? (cidResult.rows[0].C_ID || cidResult.rows[0].c_id) : null;
      if (c_id) {
        try {
          await connection.execute(
            `BEGIN
               EDUX.RECALC_LECTURE_WEIGHTS(:c_id);
               EDUX.RECALC_TOPIC_WEIGHT(:t_id);
             END;`,
            { c_id, t_id },
            { autoCommit: true }
          );
        } catch (recalcErr) {
          console.warn('Direct recalc failed; scheduling post-commit job:', recalcErr.message || recalcErr);
          try {
            await connection.execute(
              `DECLARE v_job NUMBER; BEGIN DBMS_JOB.SUBMIT(v_job, 'BEGIN EDUX.RECALC_TOPIC_POST_COMMIT(' || :t_id || '); END;'); COMMIT; END;`,
              { t_id },
              { autoCommit: true }
            );
          } catch (jobErr) {
            console.error('Failed to schedule post-commit recalc job:', jobErr);
          }
        }

        // Fetch updated values (best-effort)
        try {
          const lecRes = await connection.execute(
            `SELECT "l_id", "weight" FROM EDUX."Lectures" WHERE "l_id" = :l_id`,
            { l_id: nextId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          updatedLecture = lecRes.rows && lecRes.rows[0] ? lecRes.rows[0] : null;

          const topicRes = await connection.execute(
            `SELECT "t_id", "weight" FROM EDUX."Topics" WHERE "t_id" = :t_id`,
            { t_id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          updatedTopic = topicRes.rows && topicRes.rows[0] ? topicRes.rows[0] : null;
        } catch (fetchErr) {
          console.error('Failed to fetch updated weights (ignored):', fetchErr);
        }
      }
    } catch (e) {
      console.error('Recalc after lecture insert failed (ignored):', e);
      try { await connection.rollback(); } catch (_) {}
    }

    pool.release(connection);

    return res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      l_id: nextId,
      lecture: updatedLecture,
      topic: updatedTopic
    });
  } catch (error) {
    console.error('Error adding lecture:', error);
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
      message: 'Failed to add lecture',
      error: error.message
    });
  }
}
