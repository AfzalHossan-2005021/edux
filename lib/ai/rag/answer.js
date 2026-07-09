// RAG Answer - grounded generation with validated citations
//
// Contract with the model (see SYSTEM_PROMPTS.GROUNDED_TUTOR): every claim is
// cited as [n] against the numbered sources we stuff into the prompt. After
// generation we validate the markers — citations pointing at sources we never
// provided are stripped, and only actually-cited sources are returned to the
// client. If retrieval finds nothing relevant we answer honestly without
// calling the model at all.

import aiService from '../service';
import { RAG_CONFIG, SYSTEM_PROMPTS } from '../config';
import { retrieve } from './retriever';
import { getLectureLinks } from './store';

/**
 * Build the numbered-sources user prompt, respecting the context budget.
 * Returns { prompt, used } where used is the subset of chunks stuffed.
 */
export function buildGroundedPrompt(question, chunks) {
  const used = [];
  let budget = RAG_CONFIG.maxContextChars;
  for (const chunk of chunks) {
    const cost = chunk.title.length + chunk.content.length + 16;
    if (cost > budget && used.length > 0) break;
    used.push(chunk);
    budget -= cost;
  }

  const sources = used
    .map((chunk, i) => `[${i + 1}] ${chunk.title}\n${chunk.content}`)
    .join('\n\n');

  const prompt = `Answer the student's question using ONLY the numbered sources below.\n\nSOURCES:\n${sources}\n\nQUESTION: ${question}`;
  return { prompt, used };
}

/**
 * Validate [n] citation markers in a model answer.
 *
 * @returns {{ answer: string, cited: number[] }} - answer with out-of-range
 *   markers stripped; cited numbers in order of first appearance.
 */
export function validateCitations(answerText, sourceCount) {
  const cited = [];
  const seen = new Set();

  const answer = answerText.replace(/\[(\d{1,2})\]/g, (marker, num) => {
    const n = parseInt(num, 10);
    if (n < 1 || n > sourceCount) {
      return ''; // hallucinated citation - strip it
    }
    if (!seen.has(n)) {
      seen.add(n);
      cited.push(n);
    }
    return marker;
  });

  return { answer: answer.replace(/[ \t]+([.,;:!?])/g, '$1'), cited };
}

/**
 * Reduce client-supplied history to clean {role, content} pairs. UI messages
 * carry extra fields (citations, grounded, ...) that some provider APIs
 * reject as unknown message properties.
 */
function sanitizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));
}

/**
 * Answer a student's question grounded in a course's indexed content.
 *
 * @returns {Promise<Object>}
 *   { status: 'ok' | 'not_indexed' | 'no_match', answer, citations, retrieval }
 */
export async function answerQuestion(courseId, question, options = {}) {
  const { conversationHistory = [], includeSources = false } = options;

  const retrieval = await retrieve(courseId, question);
  // Opt-in: expose what retrieval returned (used by the eval harness and
  // debug tooling; not sent to regular chat clients)
  const sourcesDebug = includeSources
    ? retrieval.chunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        title: chunk.title,
        sourceType: chunk.sourceType,
        topicId: chunk.topicId,
        lectureId: chunk.lectureId,
        score: chunk.score,
      }))
    : undefined;

  if (!retrieval.indexed) {
    return {
      status: 'not_indexed',
      answer: null,
      citations: [],
      retrieval: retrieval.stats,
      ...(includeSources && { sources: [] }),
    };
  }

  if (retrieval.chunks.length === 0) {
    return {
      status: 'no_match',
      answer:
        "I couldn't find anything about that in this course's content, so I won't guess. " +
        'Try rephrasing with terms from the lectures, or ask about a topic listed in the syllabus.',
      citations: [],
      retrieval: retrieval.stats,
      ...(includeSources && { sources: [] }),
    };
  }

  const { prompt, used } = buildGroundedPrompt(question, retrieval.chunks);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPTS.GROUNDED_TUTOR },
    // History gives conversational continuity; sources always come fresh
    ...sanitizeHistory(conversationHistory).slice(-6),
    { role: 'user', content: prompt },
  ];

  const rawAnswer = await aiService.conversation(messages, {
    temperature: RAG_CONFIG.answerTemperature,
    maxTokens: RAG_CONFIG.answerMaxTokens,
  });

  const { answer, cited } = validateCitations(rawAnswer, used.length);

  const citedChunks = cited.map((n) => ({ n, chunk: used[n - 1] }));
  const lectureIds = [
    ...new Set(citedChunks.map(({ chunk }) => chunk.lectureId).filter(Boolean)),
  ];
  const videoLinks = await getLectureLinks(lectureIds);

  const citations = citedChunks.map(({ n, chunk }) => ({
    n,
    chunkId: chunk.chunkId,
    title: chunk.title,
    sourceType: chunk.sourceType,
    topicId: chunk.topicId,
    lectureId: chunk.lectureId,
    videoLink: chunk.lectureId ? videoLinks.get(chunk.lectureId) || null : null,
    snippet: chunk.content.length > 220 ? `${chunk.content.slice(0, 220)}…` : chunk.content,
    score: chunk.score,
  }));

  return {
    status: 'ok',
    answer,
    citations,
    // grounded=false flags an answer whose claims cite nothing - the UI
    // renders a caution instead of source chips
    grounded: citations.length > 0,
    retrieval: {
      ...retrieval.stats,
      sourcesProvided: used.length,
      sourcesCited: citations.length,
    },
    ...(includeSources && { sources: sourcesDebug }),
  };
}

export default { answerQuestion, buildGroundedPrompt, validateCitations };
