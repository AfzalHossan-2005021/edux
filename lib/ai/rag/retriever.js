// RAG Retriever - hybrid (vector + BM25) retrieval over a course corpus
//
// For each query we rank chunks two ways — cosine similarity over embeddings
// and BM25 over tokens — and merge the rankings with Reciprocal Rank Fusion.
// Vector search catches paraphrases ("how do I make the model learn" →
// gradient descent); BM25 catches exact terms vector models underweight
// (function names, acronyms). RRF needs no score calibration between the two.

import aiService from '../service';
import { RAG_CONFIG } from '../config';
import { loadCourseChunks } from './store';
import {
  cosineSimilarity,
  buildBm25Index,
  bm25Scores,
  reciprocalRankFusion,
} from './similarity';

// Per-course retrieval index cache. In-process by design: chunks contain
// Float32Arrays that do not survive JSON serialization, and a course index
// is cheap to rebuild (single SELECT). TTL bounds staleness after re-ingest
// from another process.
const indexCache = new Map();

export function invalidateCourseIndex(courseId) {
  indexCache.delete(String(courseId));
}

async function getCourseIndex(courseId) {
  const key = String(courseId);
  const cached = indexCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  const chunks = await loadCourseChunks(courseId);
  const index = {
    chunks,
    bm25: buildBm25Index(chunks.map((c) => `${c.title}\n${c.content}`)),
    expiresAt: Date.now() + RAG_CONFIG.indexCacheTtlMs,
  };
  indexCache.set(key, index);
  return index;
}

/**
 * Retrieve the most relevant chunks of a course for a query.
 *
 * @returns {Promise<{indexed: boolean, chunks: Array, stats: Object}>}
 *   chunks: [{ ...chunk, score }] ordered best-first, filtered by the
 *   fused-score floor. indexed=false means the course has no corpus yet.
 */
export async function retrieve(courseId, query, options = {}) {
  const topK = options.topK ?? RAG_CONFIG.topK;
  const candidateK = options.candidateK ?? RAG_CONFIG.candidateK;
  const minFusedScore = options.minFusedScore ?? RAG_CONFIG.minFusedScore;
  const minCosine = options.minCosine ?? RAG_CONFIG.minCosine;

  const index = await getCourseIndex(courseId);
  const { chunks } = index;
  if (chunks.length === 0) {
    return { indexed: false, chunks: [], stats: { corpusSize: 0 } };
  }

  const rankings = [];
  const stats = { corpusSize: chunks.length, vectorUsed: false, bm25Used: false };

  // --- Vector ranking (only over chunks embedded with the active model) ---
  const modelId = aiService.embeddingModelId;
  const embedded = chunks.filter(
    (c) => c.embedding && c.embeddingModel === modelId
  );
  if (embedded.length > 0) {
    try {
      const queryEmbedding = await aiService.getEmbedding(query);
      const scored = embedded
        .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
        .filter((s) => s.score >= minCosine) // absolute gate, see RAG_CONFIG.minCosine
        .sort((a, b) => b.score - a.score)
        .slice(0, candidateK);
      if (scored.length > 0) {
        rankings.push(scored.map((s) => s.chunk.chunkId));
      }
      stats.vectorUsed = true;
      stats.bestCosine = scored.length > 0 ? scored[0].score : 0;
    } catch (error) {
      // Degrade to lexical-only retrieval rather than failing the question
      console.error('RAG vector ranking unavailable:', error.message);
    }
  } else if (chunks.some((c) => c.embedding)) {
    console.warn(
      `RAG: course ${courseId} embeddings were built with a different model ` +
      `(active: ${modelId}); falling back to BM25 only. Re-ingest to fix.`
    );
  }

  // --- BM25 ranking ---
  const lexicalScores = bm25Scores(index.bm25, query);
  const lexicalRanked = lexicalScores
    .map((score, i) => ({ chunk: chunks[i], score }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, candidateK);
  if (lexicalRanked.length > 0) {
    rankings.push(lexicalRanked.map((s) => s.chunk.chunkId));
    stats.bm25Used = true;
  }

  // --- Fusion ---
  const fused = reciprocalRankFusion(rankings, RAG_CONFIG.rrfK);
  const byId = new Map(chunks.map((c) => [c.chunkId, c]));
  const results = [...fused.entries()]
    .filter(([, score]) => score >= minFusedScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([chunkId, score]) => ({ ...byId.get(chunkId), score }));

  stats.topScore = results.length > 0 ? results[0].score : 0;
  return { indexed: true, chunks: results, stats };
}

export default { retrieve, invalidateCourseIndex };
