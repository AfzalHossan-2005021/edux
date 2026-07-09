// RAG Ingestion - build and embed the retrieval corpus for a course
//
// Corpus layout per course:
//   overview  - course title + description
//   syllabus  - generated topic/lecture outline (answers "what does this
//               course cover?" questions)
//   lecture   - transcript when one exists, lecture title otherwise
//
// Re-ingestion is idempotent and cheap: chunks are diffed by SHA-256 content
// hash, and unchanged chunks reuse their stored embedding instead of being
// re-embedded (zero API cost for a no-op re-index).

import crypto from 'crypto';
import aiService from '../service';
import { RAG_CONFIG } from '../config';
import { chunkText } from './chunker';
import { getCourseSources, loadCourseChunks, replaceCourseChunks } from './store';
import { invalidateCourseIndex } from './retriever';

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Build the (unchunked) source documents for a course.
 */
function buildDocuments(sources) {
  const { course, topics, lectures } = sources;
  const documents = [];

  if (course.description || course.title) {
    documents.push({
      sourceType: 'overview',
      title: `Course overview: ${course.title}`,
      text: `${course.title}\n\n${course.description || ''}`,
      topicId: null,
      lectureId: null,
    });
  }

  if (topics.length > 0) {
    const outline = topics
      .map((topic) => {
        const topicLectures = lectures
          .filter((l) => l.topicId === topic.id)
          .map((l) => l.title)
          .join('; ');
        return `Topic ${topic.serial}: ${topic.name}.` +
          (topicLectures ? ` Lectures: ${topicLectures}.` : '');
      })
      .join('\n');
    documents.push({
      sourceType: 'syllabus',
      title: `Syllabus: ${course.title}`,
      text: `The course "${course.title}" covers the following topics.\n\n${outline}`,
      topicId: null,
      lectureId: null,
    });
  }

  for (const lecture of lectures) {
    const heading = `${lecture.topicName} · Lecture: ${lecture.title}`;
    documents.push({
      sourceType: 'lecture',
      title: heading,
      // Even without a transcript the title row makes the lecture findable
      text: lecture.transcript
        ? `${lecture.title}\n\n${lecture.transcript}`
        : `Lecture "${lecture.title}" in topic "${lecture.topicName}".`,
      topicId: lecture.topicId,
      lectureId: lecture.id,
    });
  }

  return documents;
}

/**
 * (Re)build the corpus for one course: chunk, embed changed chunks, persist.
 *
 * @returns {Promise<Object>} stats - { courseId, chunkCount, embedded, reused, embeddingModel }
 * @throws {Error} if the course does not exist
 */
export async function ingestCourse(courseId) {
  const sources = await getCourseSources(courseId);
  if (!sources) {
    const error = new Error(`Course ${courseId} not found`);
    error.code = 'COURSE_NOT_FOUND';
    throw error;
  }

  // Chunk every document
  const chunks = [];
  let seq = 0;
  for (const doc of buildDocuments(sources)) {
    for (const content of chunkText(doc.text)) {
      chunks.push({
        topicId: doc.topicId,
        lectureId: doc.lectureId,
        sourceType: doc.sourceType,
        title: doc.title,
        content,
        contentHash: sha256(content),
        seq: seq++,
      });
    }
  }

  // Reuse embeddings for unchanged content (keyed by hash + model)
  const modelId = aiService.embeddingModelId;
  const existing = await loadCourseChunks(courseId);
  const reusable = new Map();
  for (const chunk of existing) {
    if (chunk.embedding && chunk.embeddingModel === modelId) {
      reusable.set(chunk.contentHash, chunk.embedding);
    }
  }

  const toEmbed = [];
  for (const chunk of chunks) {
    const embedding = reusable.get(chunk.contentHash);
    if (embedding) {
      chunk.embedding = embedding;
      chunk.embeddingModel = modelId;
    } else {
      toEmbed.push(chunk);
    }
  }

  for (let i = 0; i < toEmbed.length; i += RAG_CONFIG.embedBatchSize) {
    const batch = toEmbed.slice(i, i + RAG_CONFIG.embedBatchSize);
    const embeddings = await aiService.getEmbeddings(
      batch.map((chunk) => `${chunk.title}\n${chunk.content}`)
    );
    batch.forEach((chunk, j) => {
      chunk.embedding = embeddings[j];
      chunk.embeddingModel = modelId;
    });
  }

  await replaceCourseChunks(courseId, chunks);
  invalidateCourseIndex(courseId);

  return {
    courseId,
    courseTitle: sources.course.title,
    chunkCount: chunks.length,
    embedded: toEmbed.length,
    reused: chunks.length - toEmbed.length,
    embeddingModel: modelId,
    lecturesWithTranscripts: sources.lectures.filter((l) => l.transcript).length,
    lectureCount: sources.lectures.length,
  };
}

export default { ingestCourse };
