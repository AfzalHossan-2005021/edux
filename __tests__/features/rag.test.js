/**
 * Unit Tests for the RAG course tutor pipeline
 * (chunking, ranking primitives, citation validation, local embedder)
 */

// answer.js transitively imports the Oracle store; keep the DB out of unit tests
jest.mock('oracledb', () => ({
  __esModule: true,
  default: { STRING: 2001, BUFFER: 2006, CLOB: 2017, BLOB: 2019 },
}));
jest.mock('@/middleware/connectdb', () => ({
  __esModule: true,
  default: {},
  executeQuery: jest.fn(),
  executeTransaction: jest.fn(),
}));

import { chunkText } from '@/lib/ai/rag/chunker';
import {
  cosineSimilarity,
  tokenize,
  buildBm25Index,
  bm25Scores,
  reciprocalRankFusion,
} from '@/lib/ai/rag/similarity';
import { validateCitations, buildGroundedPrompt } from '@/lib/ai/rag/answer';
import { embeddingToBuffer, bufferToEmbedding } from '@/lib/ai/rag/store';
import { LocalClient } from '@/lib/ai/service';

describe('RAG chunker', () => {
  test('returns empty array for empty input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText(null)).toEqual([]);
    expect(chunkText('   \n\n  ')).toEqual([]);
  });

  test('keeps short text as a single chunk', () => {
    const text = 'Gradient descent minimizes the cost function. It takes small steps.';
    expect(chunkText(text)).toEqual([text]);
  });

  test('splits long text into bounded, sentence-aligned chunks', () => {
    const sentence = 'Machine learning models improve with more high quality training data. ';
    const text = sentence.repeat(60); // ~4200 chars
    const chunks = chunkText(text, { chunkSize: 500, chunkOverlap: 100, minChunkSize: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(500);
      expect(chunk.trim()).not.toBe('');
      // sentence-aligned: never cut mid-sentence
      expect(chunk.endsWith('.')).toBe(true);
    }
  });

  test('consecutive chunks overlap for context continuity', () => {
    const sentences = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} carries content.`);
    const chunks = chunkText(sentences.join(' '), { chunkSize: 300, chunkOverlap: 80, minChunkSize: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    // the first sentence of chunk n+1 must already appear in chunk n
    for (let i = 1; i < chunks.length; i++) {
      const firstSentence = chunks[i].match(/Sentence number \d+ carries content\./)[0];
      expect(chunks[i - 1]).toContain(firstSentence);
    }
  });

  test('hard-splits a single oversized sentence instead of dropping it', () => {
    const text = 'word '.repeat(400).trim(); // one 2000-char "sentence", no punctuation
    const chunks = chunkText(text, { chunkSize: 500, chunkOverlap: 50, minChunkSize: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(' ').split('word').length - 1).toBeGreaterThanOrEqual(400);
  });
});

describe('RAG similarity primitives', () => {
  test('cosine similarity: identical, orthogonal, degenerate', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0); // length mismatch
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0); // zero norm
    expect(cosineSimilarity(null, [1])).toBe(0);
  });

  test('cosine works across Float32Array and plain arrays', () => {
    expect(cosineSimilarity(new Float32Array([1, 2, 3]), [1, 2, 3])).toBeCloseTo(1);
  });

  test('tokenize lowercases and strips punctuation', () => {
    expect(tokenize("React's useEffect hook, explained!")).toEqual([
      'react', 's', 'useeffect', 'hook', 'explained',
    ]);
  });

  test('BM25 ranks term-bearing documents above others', () => {
    const docs = [
      'Gradient descent is an optimization algorithm for minimizing cost functions.',
      'Props are how React components receive data from their parents.',
      'The cost function measures model error; gradient descent minimizes it step by step.',
    ];
    const index = buildBm25Index(docs);
    const scores = bm25Scores(index, 'how does gradient descent minimize the cost function');

    expect(scores[0]).toBeGreaterThan(0);
    expect(scores[2]).toBeGreaterThan(0);
    expect(scores[2]).toBeGreaterThan(scores[1]);
    expect(scores[0]).toBeGreaterThan(scores[1]);
  });

  test('BM25 gives zero score with no term overlap', () => {
    const index = buildBm25Index(['React components and props', 'State and hooks']);
    const scores = bm25Scores(index, 'sourdough bread recipe');
    expect(scores).toEqual([0, 0]);
  });

  test('RRF fuses rankings and rewards agreement', () => {
    const fused = reciprocalRankFusion([
      ['a', 'b', 'c'],
      ['b', 'a', 'd'],
    ], 60);

    // b: 1/62 + 1/61, a: 1/61 + 1/62 -> tie; both beat c and d
    expect(fused.get('a')).toBeCloseTo(fused.get('b'));
    expect(fused.get('a')).toBeGreaterThan(fused.get('c'));
    expect(fused.get('d')).toBeCloseTo(1 / 63);
    expect(fused.get('c')).toBeCloseTo(1 / 63);
  });
});

describe('RAG citation validation', () => {
  test('keeps valid markers and orders citations by first appearance', () => {
    const { answer, cited } = validateCitations(
      'Props are read-only [2]. Composition beats inheritance [1]. See also [2].',
      3
    );
    expect(cited).toEqual([2, 1]);
    expect(answer).toContain('[2]');
    expect(answer).toContain('[1]');
  });

  test('strips hallucinated citations pointing at nonexistent sources', () => {
    const { answer, cited } = validateCitations('This claim is invented [7]. This one is real [1].', 2);
    expect(cited).toEqual([1]);
    expect(answer).not.toContain('[7]');
    expect(answer).toContain('[1]');
  });

  test('returns no citations for an uncited answer', () => {
    const { cited } = validateCitations('An answer with no sources at all.', 5);
    expect(cited).toEqual([]);
  });
});

describe('RAG grounded prompt builder', () => {
  const chunk = (title, content) => ({ title, content });

  test('numbers sources sequentially and includes the question', () => {
    const { prompt, used } = buildGroundedPrompt('What is JSX?', [
      chunk('Lecture: Intro', 'JSX is a syntax extension.'),
      chunk('Lecture: Tooling', 'Vite compiles JSX during build.'),
    ]);
    expect(used).toHaveLength(2);
    expect(prompt).toContain('[1] Lecture: Intro');
    expect(prompt).toContain('[2] Lecture: Tooling');
    expect(prompt).toContain('QUESTION: What is JSX?');
  });

  test('respects the context budget but always includes at least one source', () => {
    const big = 'x'.repeat(10000);
    const { used } = buildGroundedPrompt('q', [
      chunk('A', big),
      chunk('B', big),
    ]);
    expect(used).toHaveLength(1);
  });
});

describe('RAG embedding serialization', () => {
  test('round-trips float32 vectors through Buffer', () => {
    const original = [0.25, -1.5, 3.75, 0];
    const decoded = bufferToEmbedding(embeddingToBuffer(original));
    expect(decoded).toHaveLength(4);
    original.forEach((v, i) => expect(decoded[i]).toBeCloseTo(v, 5));
  });

  test('returns null for empty buffers', () => {
    expect(bufferToEmbedding(null)).toBeNull();
    expect(bufferToEmbedding(Buffer.alloc(0))).toBeNull();
  });
});

describe('Local deterministic embedder', () => {
  const client = new LocalClient();

  test('same text produces identical vectors across calls', () => {
    const a = client.embedText('gradient descent minimizes the cost function');
    const b = client.embedText('gradient descent minimizes the cost function');
    expect(a).toEqual(b);
  });

  test('related texts are closer than unrelated texts', () => {
    const query = client.embedText('how does gradient descent minimize cost');
    const related = client.embedText('gradient descent is an algorithm that minimizes the cost function');
    const unrelated = client.embedText('sourdough bread requires flour water and salt');
    expect(cosineSimilarity(query, related)).toBeGreaterThan(cosineSimilarity(query, unrelated));
  });

  test('stopword-only text yields a zero vector (no topical signal)', () => {
    const vector = client.embedText('the and of to is');
    expect(vector.every((v) => v === 0)).toBe(true);
  });

  test('mock chat produces a grounded, cited answer for RAG prompts', async () => {
    const prompt = 'Answer using ONLY the numbered sources below.\n\nSOURCES:\n[1] Lecture: Intro\nJSX is a syntax extension. It compiles to JavaScript.\n\nQUESTION: What is JSX?';
    const answer = await client.chat([{ role: 'user', content: prompt }]);
    expect(answer).toContain('[1]');
  });
});
