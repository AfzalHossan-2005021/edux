// RAG Similarity - pure ranking primitives: cosine, BM25, Reciprocal Rank Fusion
//
// A course corpus is at most a few hundred chunks, so exact in-process scoring
// is both simpler and faster here than an external vector database. See
// docs/RAG.md for the scaling path.

import { STOPWORDS } from '../stopwords';

/**
 * Cosine similarity between two vectors (arrays or Float32Array).
 * Returns 0 for zero-length or zero-norm vectors.
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Tokenize text for lexical scoring: lowercase word/number tokens.
 */
export function tokenize(text) {
  return (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

const BM25_K1 = 1.5;
const BM25_B = 0.75;

/**
 * Build a BM25 index over an array of documents (strings).
 * Returns an object consumed by bm25Scores().
 */
export function buildBm25Index(docs) {
  const docTermFreqs = [];
  const docLengths = [];
  const documentFrequency = new Map();

  for (const doc of docs) {
    const tokens = tokenize(doc);
    const tf = new Map();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }
    for (const token of tf.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
    docTermFreqs.push(tf);
    docLengths.push(tokens.length);
  }

  const totalLength = docLengths.reduce((sum, len) => sum + len, 0);
  return {
    docTermFreqs,
    docLengths,
    documentFrequency,
    avgDocLength: docs.length > 0 ? totalLength / docs.length : 0,
    docCount: docs.length,
  };
}

/**
 * Score every indexed document against a query. Returns an array of scores
 * aligned with the docs passed to buildBm25Index (0 = no term overlap).
 */
export function bm25Scores(index, query) {
  const { docTermFreqs, docLengths, documentFrequency, avgDocLength, docCount } = index;
  // Stopwords are excluded from query terms: the +1 in the IDF below keeps
  // ubiquitous terms slightly positive, so without this an out-of-scope
  // question would still accumulate relevance from "the"/"who"/"in" alone.
  const queryTokens = [...new Set(tokenize(query))].filter((t) => !STOPWORDS.has(t));
  const scores = new Array(docCount).fill(0);
  if (docCount === 0 || avgDocLength === 0) return scores;

  for (const token of queryTokens) {
    const df = documentFrequency.get(token);
    if (!df) continue;
    // Standard BM25 IDF with +1 to keep it positive for very common terms
    const idf = Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
    for (let i = 0; i < docCount; i++) {
      const tf = docTermFreqs[i].get(token);
      if (!tf) continue;
      const lengthNorm = 1 - BM25_B + BM25_B * (docLengths[i] / avgDocLength);
      scores[i] += idf * (tf * (BM25_K1 + 1)) / (tf + BM25_K1 * lengthNorm);
    }
  }
  return scores;
}

/**
 * Reciprocal Rank Fusion (Cormack et al. 2009).
 *
 * @param {Array<Array<*>>} rankings - Arrays of document ids, each ordered
 *   best-first. Ids absent from a ranking contribute nothing from it.
 * @param {number} k - Damping constant (60 is the standard choice)
 * @returns {Map<*, number>} - id -> fused score, higher is better
 */
export function reciprocalRankFusion(rankings, k = 60) {
  const fused = new Map();
  for (const ranking of rankings) {
    for (let rank = 0; rank < ranking.length; rank++) {
      const id = ranking[rank];
      fused.set(id, (fused.get(id) || 0) + 1 / (k + rank + 1));
    }
  }
  return fused;
}

export default { cosineSimilarity, tokenize, buildBm25Index, bm25Scores, reciprocalRankFusion };
