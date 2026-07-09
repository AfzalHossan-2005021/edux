#!/usr/bin/env node
/**
 * RAG Tutor Evaluation Harness
 *
 * Runs the golden Q&A set (eval/rag-goldens.json) against a running EduX
 * server and reports retrieval and answer quality:
 *
 *   hit@k               expected lecture appears in the retrieved sources
 *   MRR                 mean reciprocal rank of the first expected source
 *   citation precision  fraction of cited sources that are expected ones
 *   keyword coverage    expected answer keywords present in the answer
 *   out-of-scope        out-of-scope questions correctly refused
 *
 * Usage:
 *   node scripts/rag-eval.js [options]
 *
 * Options:
 *   --base <url>          Server base URL      (default http://localhost:3000)
 *   --email <email>       Student login        (default alice@student.com)
 *   --password <pass>     Student password     (default password123)
 *   --ingest              Re-index courses first (logs in as the instructor)
 *   --instructor-email    Instructor login     (default john.smith@edux.com)
 *   --instructor-password Instructor password  (default password123)
 *   --goldens <path>      Goldens file         (default eval/rag-goldens.json)
 *   --min-hit <0..1>      Exit non-zero if hit rate falls below this (default 0)
 *   --json <path>         Also write a JSON report
 *
 * Works with any AI_PROVIDER, including `local` (fully offline).
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    base: 'http://localhost:3000',
    email: 'alice@student.com',
    password: 'password123',
    instructorEmail: 'john.smith@edux.com',
    instructorPassword: 'password123',
    goldens: path.join(__dirname, '..', 'eval', 'rag-goldens.json'),
    minHit: 0,
    ingest: false,
    json: null,
  };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--base': args.base = argv[++i]; break;
      case '--email': args.email = argv[++i]; break;
      case '--password': args.password = argv[++i]; break;
      case '--instructor-email': args.instructorEmail = argv[++i]; break;
      case '--instructor-password': args.instructorPassword = argv[++i]; break;
      case '--goldens': args.goldens = argv[++i]; break;
      case '--min-hit': args.minHit = parseFloat(argv[++i]); break;
      case '--json': args.json = argv[++i]; break;
      case '--ingest': args.ingest = true; break;
      default:
        console.error(`Unknown option: ${argv[i]}`);
        process.exit(2);
    }
  }
  return args;
}

/** Log in and return a Cookie header string. */
async function login(base, endpoint, email, password) {
  const response = await fetch(`${base}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Login failed for ${email} (${response.status}): ${body.slice(0, 200)}`);
  }
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
  const cookie = setCookies.map((c) => c.split(';')[0]).join('; ');
  if (!cookie) throw new Error(`Login for ${email} returned no cookies`);
  return cookie;
}

async function post(base, cookie, body) {
  const response = await fetch(`${base}/api/ai/rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${body.action} failed (${response.status}): ${data.error || 'unknown'}`);
  }
  return data;
}

function evaluateCase(golden, result) {
  const out = { id: golden.id, courseId: golden.courseId, question: golden.question };

  if (golden.expectOutOfScope) {
    out.type = 'out-of-scope';
    out.pass = result.status === 'no_match';
    out.detail = `status=${result.status}`;
    return out;
  }

  out.type = 'grounded';
  const sources = result.sources || [];
  const expectedIds = golden.expectedLectureIds || [];
  const expectedTypes = golden.expectedSourceTypes || [];
  const matches = (source) =>
    (expectedIds.length > 0 && expectedIds.includes(source.lectureId)) ||
    (expectedTypes.length > 0 && expectedTypes.includes(source.sourceType));

  // Retrieval: hit@k and reciprocal rank
  const firstMatch = sources.findIndex(matches);
  out.hit = firstMatch !== -1;
  out.reciprocalRank = firstMatch === -1 ? 0 : 1 / (firstMatch + 1);

  // Citations: precision over cited sources
  const citations = result.citations || [];
  if (citations.length > 0) {
    const good = citations.filter(matches).length;
    out.citationPrecision = good / citations.length;
  } else {
    out.citationPrecision = null; // nothing cited
  }

  // Answer keywords (soft signal of faithfulness)
  const answer = (result.answer || '').toLowerCase();
  const keywords = golden.answerKeywords || [];
  out.keywordCoverage = keywords.length === 0
    ? null
    : keywords.filter((k) => answer.includes(k.toLowerCase())).length / keywords.length;

  out.pass = result.status === 'ok' && out.hit;
  out.detail = `status=${result.status} hit=${out.hit} rr=${out.reciprocalRank.toFixed(2)}` +
    (out.citationPrecision !== null ? ` citePrec=${out.citationPrecision.toFixed(2)}` : ' citePrec=n/a') +
    (out.keywordCoverage !== null ? ` kw=${out.keywordCoverage.toFixed(2)}` : '');
  return out;
}

function mean(values) {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

async function main() {
  const args = parseArgs(process.argv);
  const goldens = JSON.parse(fs.readFileSync(args.goldens, 'utf8'));
  const cases = goldens.cases;
  const courseIds = [...new Set(cases.map((c) => c.courseId))];

  console.log(`RAG eval: ${cases.length} cases across courses [${courseIds.join(', ')}] on ${args.base}\n`);

  const studentCookie = await login(args.base, '/api/auth/user/login', args.email, args.password);

  if (args.ingest) {
    const instructorCookie = await login(
      args.base, '/api/auth/instructor/login', args.instructorEmail, args.instructorPassword
    );
    for (const courseId of courseIds) {
      const stats = await post(args.base, instructorCookie, { action: 'ingest', courseId });
      console.log(
        `ingested course ${courseId} "${stats.courseTitle}": ${stats.chunkCount} chunks ` +
        `(${stats.embedded} embedded, ${stats.reused} reused) using ${stats.embeddingModel}`
      );
    }
    console.log('');
  }

  const results = [];
  for (const golden of cases) {
    const started = Date.now();
    let outcome;
    try {
      const result = await post(args.base, studentCookie, {
        action: 'ask',
        courseId: golden.courseId,
        question: golden.question,
        debug: true,
      });
      outcome = evaluateCase(golden, result);
      outcome.latencyMs = Date.now() - started;
    } catch (error) {
      outcome = { id: golden.id, type: 'error', pass: false, detail: error.message };
    }
    results.push(outcome);
    console.log(`${outcome.pass ? 'PASS' : 'FAIL'}  ${outcome.id.padEnd(26)} ${outcome.detail}`);
  }

  const grounded = results.filter((r) => r.type === 'grounded');
  const outOfScope = results.filter((r) => r.type === 'out-of-scope');
  const summary = {
    cases: results.length,
    passed: results.filter((r) => r.pass).length,
    hitRate: mean(grounded.map((r) => (r.hit ? 1 : 0))),
    mrr: mean(grounded.map((r) => r.reciprocalRank)),
    citationPrecision: mean(grounded.map((r) => r.citationPrecision).filter((v) => v !== null)),
    keywordCoverage: mean(grounded.map((r) => r.keywordCoverage).filter((v) => v !== null)),
    outOfScopeAccuracy: mean(outOfScope.map((r) => (r.pass ? 1 : 0))),
    meanLatencyMs: mean(results.map((r) => r.latencyMs).filter(Boolean)),
  };

  const fmt = (v) => (v === null ? 'n/a' : (Math.round(v * 1000) / 1000).toString());
  console.log('\n=== Summary ===');
  console.log(`passed              ${summary.passed}/${summary.cases}`);
  console.log(`retrieval hit@k     ${fmt(summary.hitRate)}`);
  console.log(`retrieval MRR       ${fmt(summary.mrr)}`);
  console.log(`citation precision  ${fmt(summary.citationPrecision)}`);
  console.log(`keyword coverage    ${fmt(summary.keywordCoverage)}`);
  console.log(`out-of-scope acc.   ${fmt(summary.outOfScopeAccuracy)}`);
  console.log(`mean latency (ms)   ${fmt(summary.meanLatencyMs)}`);

  if (args.json) {
    fs.writeFileSync(args.json, JSON.stringify({ summary, results }, null, 2));
    console.log(`\nReport written to ${args.json}`);
  }

  if (summary.hitRate !== null && summary.hitRate < args.minHit) {
    console.error(`\nFAIL: hit rate ${fmt(summary.hitRate)} below threshold ${args.minHit}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`\nEval aborted: ${error.message}`);
  process.exit(1);
});
