// RAG Store - Oracle persistence for the retrieval corpus
//
// RAG_CHUNKS holds one row per chunk; embeddings are little-endian float32
// BLOBs tagged with the model that produced them. LECTURE_TRANSCRIPTS holds
// the raw grounding text attached to lectures.

import oracledb from 'oracledb';
import { executeQuery, executeTransaction } from '../../../middleware/connectdb';

/**
 * Encode an embedding (number[] | Float32Array) as a float32 LE Buffer.
 */
export function embeddingToBuffer(embedding) {
  const floats = embedding instanceof Float32Array ? embedding : new Float32Array(embedding);
  return Buffer.from(floats.buffer, floats.byteOffset, floats.byteLength);
}

/**
 * Decode a float32 LE Buffer back to a Float32Array.
 * Copies to a fresh ArrayBuffer so alignment of Node's buffer pool is irrelevant.
 */
export function bufferToEmbedding(buffer) {
  if (!buffer || buffer.length === 0) return null;
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
  return new Float32Array(arrayBuffer);
}

/**
 * Load all chunks for a course, embeddings decoded.
 */
export async function loadCourseChunks(courseId) {
  const result = await executeQuery(
    `SELECT CHUNK_ID, C_ID, T_ID, L_ID, SOURCE_TYPE, TITLE, CONTENT,
            CONTENT_HASH, SEQ, EMBEDDING, EMBEDDING_MODEL
     FROM EDUX.RAG_CHUNKS
     WHERE C_ID = :courseId
     ORDER BY SEQ`,
    { courseId },
    {
      fetchInfo: {
        CONTENT: { type: oracledb.STRING },
        EMBEDDING: { type: oracledb.BUFFER },
      },
    }
  );

  return (result.rows || []).map((row) => ({
    chunkId: row.CHUNK_ID,
    courseId: row.C_ID,
    topicId: row.T_ID,
    lectureId: row.L_ID,
    sourceType: row.SOURCE_TYPE,
    title: row.TITLE,
    content: row.CONTENT,
    contentHash: row.CONTENT_HASH,
    seq: row.SEQ,
    embedding: bufferToEmbedding(row.EMBEDDING),
    embeddingModel: row.EMBEDDING_MODEL,
  }));
}

/**
 * Atomically replace a course's corpus with a new chunk list.
 * Chunks must carry: topicId, lectureId, sourceType, title, content,
 * contentHash, seq, embedding (number[]|Float32Array|null), embeddingModel.
 */
export async function replaceCourseChunks(courseId, chunks) {
  await executeTransaction(async (connection) => {
    await connection.execute(
      `DELETE FROM EDUX.RAG_CHUNKS WHERE C_ID = :courseId`,
      { courseId }
    );

    for (const chunk of chunks) {
      await connection.execute(
        `INSERT INTO EDUX.RAG_CHUNKS
           (C_ID, T_ID, L_ID, SOURCE_TYPE, TITLE, CONTENT, CONTENT_HASH,
            SEQ, EMBEDDING, EMBEDDING_MODEL, UPDATED_AT)
         VALUES
           (:courseId, :topicId, :lectureId, :sourceType, :title, :content,
            :contentHash, :seq, :embedding, :embeddingModel, CURRENT_TIMESTAMP)`,
        {
          courseId,
          topicId: chunk.topicId ?? null,
          lectureId: chunk.lectureId ?? null,
          sourceType: chunk.sourceType,
          title: chunk.title.slice(0, 300),
          content: chunk.content,
          contentHash: chunk.contentHash,
          seq: chunk.seq,
          embedding: chunk.embedding ? embeddingToBuffer(chunk.embedding) : null,
          embeddingModel: chunk.embeddingModel ?? null,
        }
      );
    }
  });
}

/**
 * Gather everything ingestible for a course: overview, topic outline, and
 * lectures with transcripts when available.
 */
export async function getCourseSources(courseId) {
  const courseResult = await executeQuery(
    `SELECT "c_id", "title", "description"
     FROM EDUX."Courses" WHERE "c_id" = :courseId`,
    { courseId }
  );
  if (!courseResult.rows || courseResult.rows.length === 0) {
    return null;
  }
  const courseRow = courseResult.rows[0];

  const topicsResult = await executeQuery(
    `SELECT "t_id", "name", "serial"
     FROM EDUX."Topics" WHERE "c_id" = :courseId ORDER BY "serial"`,
    { courseId }
  );

  const lecturesResult = await executeQuery(
    `SELECT l."l_id", l."t_id", l."description", l."video", l."serial",
            t."name" AS "topic_name", t."serial" AS "topic_serial",
            tr.CONTENT AS "transcript"
     FROM EDUX."Lectures" l
     JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
     LEFT JOIN EDUX.LECTURE_TRANSCRIPTS tr ON tr.L_ID = l."l_id"
     WHERE t."c_id" = :courseId
     ORDER BY t."serial", l."serial"`,
    { courseId },
    { fetchInfo: { transcript: { type: oracledb.STRING } } }
  );

  return {
    course: {
      id: courseRow.c_id,
      title: courseRow.title,
      description: courseRow.description,
    },
    topics: (topicsResult.rows || []).map((row) => ({
      id: row.t_id,
      name: row.name,
      serial: row.serial,
    })),
    lectures: (lecturesResult.rows || []).map((row) => ({
      id: row.l_id,
      topicId: row.t_id,
      title: row.description,
      video: row.video,
      serial: row.serial,
      topicName: row.topic_name,
      topicSerial: row.topic_serial,
      transcript: row.transcript || null,
    })),
  };
}

/**
 * Video links for a set of lectures, used to decorate citations.
 */
export async function getLectureLinks(lectureIds) {
  if (!lectureIds || lectureIds.length === 0) return new Map();
  const binds = {};
  const placeholders = lectureIds.map((id, i) => {
    binds[`id${i}`] = id;
    return `:id${i}`;
  });
  const result = await executeQuery(
    `SELECT "l_id", "video" FROM EDUX."Lectures" WHERE "l_id" IN (${placeholders.join(', ')})`,
    binds
  );
  return new Map((result.rows || []).map((row) => [row.l_id, row.video]));
}

/**
 * Index status for a course: chunk/embedding counts and freshness.
 */
export async function getIndexStatus(courseId) {
  const result = await executeQuery(
    `SELECT COUNT(*) AS TOTAL,
            COUNT(EMBEDDING) AS EMBEDDED,
            MAX(EMBEDDING_MODEL) AS MODEL,
            MAX(UPDATED_AT) AS UPDATED_AT
     FROM EDUX.RAG_CHUNKS WHERE C_ID = :courseId`,
    { courseId }
  );
  const row = result.rows?.[0];
  return {
    chunkCount: row?.TOTAL || 0,
    embeddedCount: row?.EMBEDDED || 0,
    embeddingModel: row?.MODEL || null,
    updatedAt: row?.UPDATED_AT || null,
  };
}

/**
 * Upsert a lecture transcript (grounding text).
 */
export async function saveTranscript(lectureId, content, source = 'manual') {
  await executeTransaction(async (connection) => {
    const updated = await connection.execute(
      `UPDATE EDUX.LECTURE_TRANSCRIPTS
       SET CONTENT = :content, SOURCE = :source, UPDATED_AT = CURRENT_TIMESTAMP
       WHERE L_ID = :lectureId`,
      { content, source, lectureId }
    );
    if (updated.rowsAffected === 0) {
      await connection.execute(
        `INSERT INTO EDUX.LECTURE_TRANSCRIPTS (L_ID, CONTENT, SOURCE)
         VALUES (:lectureId, :content, :source)`,
        { lectureId, content, source }
      );
    }
  });
}

export default {
  loadCourseChunks,
  replaceCourseChunks,
  getCourseSources,
  getLectureLinks,
  getIndexStatus,
  saveTranscript,
  embeddingToBuffer,
  bufferToEmbedding,
};
