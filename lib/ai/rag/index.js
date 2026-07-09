// RAG Module - grounded AI course tutor
//
// Pipeline: ingest (chunk + embed course content into Oracle) → retrieve
// (hybrid cosine + BM25, fused with RRF) → answer (grounded generation with
// validated [n] citations). See docs/RAG.md for architecture and evaluation.

export { ingestCourse } from './ingest';
export { retrieve, invalidateCourseIndex } from './retriever';
export { answerQuestion, buildGroundedPrompt, validateCitations } from './answer';
export { chunkText } from './chunker';
export { getIndexStatus, saveTranscript } from './store';
