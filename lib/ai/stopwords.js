// English function words shared by the lexical ranking and the local
// deterministic embedder. Filtering them matters for out-of-scope detection:
// they appear in every document, so leaving them in lets a completely
// unrelated question ("who won the world cup?") accumulate nonzero relevance
// from "who"/"the" alone.

export const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'did',
  'do', 'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'me', 'my', 'no', 'not', 'of', 'on',
  'or', 'our', 'so', 'than', 'that', 'the', 'their', 'them', 'then',
  'there', 'these', 'they', 'this', 'to', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would',
  'you', 'your',
]);

export default STOPWORDS;
