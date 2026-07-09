/**
 * Integration test for the RAG pipeline: ingest → hybrid retrieve → grounded
 * answer with citations. Uses the real chunker, embedder (local provider),
 * retriever, and answer modules; only the Oracle store is replaced with an
 * in-memory fake.
 */

jest.mock('@/lib/ai/rag/store', () => {
  const mem = { chunks: new Map(), nextId: 1 };

  const fixtureSources = {
    course: {
      id: 1,
      title: 'Complete React Course',
      description: 'Learn React from basics to advanced patterns, hooks, and testing.',
    },
    topics: [
      { id: 10, name: 'Introduction and Setup', serial: 1 },
      { id: 11, name: 'State, Lifecycle and Hooks', serial: 2 },
    ],
    lectures: [
      {
        id: 100,
        topicId: 10,
        title: 'What is React and why use it?',
        video: 'https://youtube.com/watch?v=react_intro',
        serial: 1,
        topicName: 'Introduction and Setup',
        topicSerial: 1,
        transcript:
          'React is a JavaScript library for building user interfaces. ' +
          'React achieves efficiency through the virtual DOM, a lightweight in-memory representation of the real DOM. ' +
          'When state changes, React compares virtual DOM trees using a diffing algorithm called reconciliation ' +
          'and applies only the minimal set of changes to the browser DOM.',
      },
      {
        id: 101,
        topicId: 11,
        title: 'useState and useEffect',
        video: 'https://youtube.com/watch?v=react_hooks',
        serial: 1,
        topicName: 'State, Lifecycle and Hooks',
        topicSerial: 2,
        transcript:
          'The useState hook declares a piece of component state and returns the current value with a setter. ' +
          'The useEffect hook handles side effects such as fetching data or subscriptions. ' +
          'Its cleanup function runs before the next effect and when the component unmounts, preventing memory leaks.',
      },
    ],
  };

  return {
    __esModule: true,
    default: {},
    getCourseSources: jest.fn(async (courseId) =>
      Number(courseId) === 1 ? fixtureSources : null
    ),
    loadCourseChunks: jest.fn(async (courseId) => mem.chunks.get(Number(courseId)) || []),
    replaceCourseChunks: jest.fn(async (courseId, chunks) => {
      mem.chunks.set(
        Number(courseId),
        chunks.map((chunk) => ({ ...chunk, chunkId: mem.nextId++, courseId: Number(courseId) }))
      );
    }),
    getLectureLinks: jest.fn(async (lectureIds) => {
      const links = new Map();
      for (const lecture of fixtureSources.lectures) {
        if (lectureIds.includes(lecture.id)) links.set(lecture.id, lecture.video);
      }
      return links;
    }),
    getIndexStatus: jest.fn(async () => ({})),
    saveTranscript: jest.fn(async () => {}),
    // real serialization helpers are irrelevant here; retriever never uses them
    embeddingToBuffer: jest.fn(),
    bufferToEmbedding: jest.fn(),
  };
});

import { ingestCourse } from '@/lib/ai/rag/ingest';
import { answerQuestion } from '@/lib/ai/rag/answer';
import { retrieve } from '@/lib/ai/rag/retriever';

describe('RAG pipeline (in-memory store, local provider)', () => {
  test('ingest chunks and embeds the whole course', async () => {
    const stats = await ingestCourse(1);
    expect(stats.chunkCount).toBeGreaterThanOrEqual(4); // overview + syllabus + 2 lectures
    expect(stats.embedded).toBe(stats.chunkCount);
    expect(stats.reused).toBe(0);
    expect(stats.embeddingModel).toMatch(/^local:/);
    expect(stats.lecturesWithTranscripts).toBe(2);
  });

  test('re-ingest reuses every embedding (idempotent, zero re-embed cost)', async () => {
    const stats = await ingestCourse(1);
    expect(stats.embedded).toBe(0);
    expect(stats.reused).toBe(stats.chunkCount);
  });

  test('retrieval ranks the right lecture first for an on-topic question', async () => {
    const result = await retrieve(1, 'What is the virtual DOM and reconciliation?');
    expect(result.indexed).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks[0].lectureId).toBe(100);
  });

  test('grounded answer cites sources with lecture links', async () => {
    const result = await answerQuestion(1, 'When does the useEffect cleanup function run?');
    expect(result.status).toBe('ok');
    expect(result.grounded).toBe(true);
    expect(result.answer).toMatch(/\[\d\]/);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0].lectureId).toBe(101);
    expect(result.citations[0].videoLink).toBe('https://youtube.com/watch?v=react_hooks');
  });

  test('out-of-scope question is refused without calling the model', async () => {
    const result = await answerQuestion(1, 'Who won the FIFA World Cup in 2022?');
    expect(result.status).toBe('no_match');
    expect(result.citations).toEqual([]);
    expect(result.answer).toMatch(/couldn't find/i);
  });

  test('unindexed course reports not_indexed for graceful fallback', async () => {
    const result = await answerQuestion(999, 'anything');
    expect(result.status).toBe('not_indexed');
  });
});
