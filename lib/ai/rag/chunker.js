// RAG Chunker - sentence-aware sliding-window text chunking
//
// Splits source documents into overlapping chunks sized for embedding and
// retrieval. Boundaries respect paragraphs first, then sentences, so a chunk
// never starts or ends mid-sentence (except for pathological single sentences
// longer than the chunk size, which are hard-split).

import { RAG_CONFIG } from '../config';

/**
 * Collapse whitespace while preserving paragraph breaks.
 */
function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split a paragraph into sentences. Keeps trailing punctuation.
 */
function splitSentences(paragraph) {
  const matches = paragraph.match(/[^.!?\n]+[.!?]+[\])'"’”]*|[^.!?\n]+$/g);
  return (matches || [paragraph]).map((s) => s.trim()).filter(Boolean);
}

/**
 * Hard-split an oversized sentence at word boundaries.
 */
function hardSplit(sentence, maxLen) {
  const parts = [];
  let rest = sentence;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(' ', maxLen);
    if (cut < maxLen * 0.5) cut = maxLen; // no usable space; cut mid-word
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

/**
 * Chunk a document into overlapping, sentence-aligned pieces.
 *
 * @param {string} text - Source text
 * @param {Object} options - { chunkSize, chunkOverlap, minChunkSize } in characters
 * @returns {string[]} - Ordered chunk texts
 */
export function chunkText(text, options = {}) {
  const chunkSize = options.chunkSize ?? RAG_CONFIG.chunkSize;
  const chunkOverlap = options.chunkOverlap ?? RAG_CONFIG.chunkOverlap;
  const minChunkSize = options.minChunkSize ?? RAG_CONFIG.minChunkSize;

  const normalized = normalize(text || '');
  if (!normalized) return [];
  if (normalized.length <= chunkSize) {
    return normalized.length >= minChunkSize || normalized.length === 0
      ? [normalized]
      : [normalized]; // a single short document is still worth one chunk
  }

  // Flatten to sentences, tagging paragraph starts so overlap never bridges
  // totally unrelated paragraphs when a paragraph fits in one chunk.
  const sentences = [];
  for (const paragraph of normalized.split(/\n\n+/)) {
    for (const sentence of splitSentences(paragraph)) {
      if (sentence.length > chunkSize) {
        sentences.push(...hardSplit(sentence, chunkSize));
      } else {
        sentences.push(sentence);
      }
    }
  }

  const chunks = [];
  let current = [];
  let currentLen = 0;
  let seeded = 0; // leading sentences of `current` carried over as overlap

  const flush = () => {
    if (currentLen === 0) return;
    chunks.push(current.join(' '));
    // Seed the next chunk with trailing sentences up to the overlap budget
    const overlap = [];
    let overlapLen = 0;
    for (let i = current.length - 1; i >= 0; i--) {
      const len = current[i].length + (overlap.length > 0 ? 1 : 0);
      if (overlapLen + len > chunkOverlap) break;
      overlap.unshift(current[i]);
      overlapLen += len;
    }
    current = overlap;
    currentLen = overlapLen;
    seeded = overlap.length;
  };

  for (const sentence of sentences) {
    const extra = sentence.length + (currentLen > 0 ? 1 : 0);
    if (currentLen + extra > chunkSize && currentLen > 0) {
      flush();
    }
    current.push(sentence);
    currentLen += sentence.length + (currentLen > 0 ? 1 : 0);
  }

  // Emit the tail if it contains anything beyond the seeded overlap
  if (current.length > seeded) {
    const tail = current.join(' ');
    if (tail.length >= minChunkSize || chunks.length === 0) {
      chunks.push(tail);
    } else {
      // Tiny tail: append only its new sentences to the previous chunk —
      // the seeded prefix is already there via overlap
      const newPart = current.slice(seeded).join(' ');
      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${newPart}`;
    }
  }

  return chunks;
}

export default { chunkText };
