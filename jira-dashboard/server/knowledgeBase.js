const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'i', 'am', 'going', 'raise', 'bug', 'related', 'issue', 'when', 'while', 'during',
]);

export function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export function buildDocumentText(record) {
  return [
    record.key,
    record.summary,
    record.description,
    record.acceptanceCriteria,
    record.labels,
    record.components,
    record.status,
    record.reporter,
    record.assignee,
    record.commentsText,
    record.resolutionNotes,
    record.rootCause,
    record.fixVersions,
    record.sprint,
  ]
    .filter(Boolean)
    .join(' ');
}

function termFrequency(tokens) {
  const tf = new Map();
  tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  return tf;
}

function computeIdf(documents) {
  const idf = new Map();
  const n = documents.length || 1;
  documents.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((term) => idf.set(term, (idf.get(term) || 0) + 1));
  });
  idf.forEach((count, term) => idf.set(term, Math.log((n + 1) / (count + 1)) + 1));
  return idf;
}

function toVector(tf, idf, vocabulary) {
  const vec = new Float32Array(vocabulary.length);
  vocabulary.forEach((term, i) => {
    const freq = tf.get(term) || 0;
    vec[i] = freq * (idf.get(term) || 0);
  });
  return normalize(vec);
}

function normalize(vec) {
  let norm = 0;
  for (let i = 0; i < vec.length; i += 1) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vec.length; i += 1) vec[i] /= norm;
  return vec;
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

export class KnowledgeBase {
  constructor() {
    this.records = [];
    this.vectors = [];
    this.vocabulary = [];
    this.idf = new Map();
    this.lastIndexedAt = null;
    this.indexing = false;
  }

  index(records) {
    this.indexing = true;
    this.records = records.map((r) => ({ ...r, searchText: buildDocumentText(r) }));

    const tokenized = this.records.map((r) => tokenize(r.searchText));
    const vocabSet = new Set();
    tokenized.forEach((tokens) => tokens.forEach((t) => vocabSet.add(t)));
    this.vocabulary = [...vocabSet];
    this.idf = computeIdf(tokenized);
    this.vectors = tokenized.map((tokens) => toVector(termFrequency(tokens), this.idf, this.vocabulary));
    this.lastIndexedAt = new Date().toISOString();
    this.indexing = false;
    return { count: this.records.length, indexedAt: this.lastIndexedAt };
  }

  search(query, limit = 10) {
    if (!this.records.length) return [];

    const queryTokens = tokenize(query);
    const queryVec = toVector(termFrequency(queryTokens), this.idf, this.vocabulary);

    const scored = this.records.map((record, idx) => ({
      record,
      similarity: cosineSimilarity(queryVec, this.vectors[idx]),
    }));

    return scored
      .filter((s) => s.similarity > 0.05)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ record, similarity }) => ({
        key: record.key,
        summary: record.summary,
        status: record.status,
        priority: record.priority,
        reporter: record.reporter,
        assignee: record.assignee,
        labels: record.labels,
        components: record.components,
        description: record.description,
        jiraUrl: record.jiraUrl,
        similarity: Math.round(similarity * 100),
        matchType: classifyMatch(similarity * 100),
      }));
  }

  status() {
    return {
      indexed: this.records.length,
      lastIndexedAt: this.lastIndexedAt,
      indexing: this.indexing,
    };
  }
}

export function classifyMatch(score) {
  if (score >= 95) return 'Strong Match';
  if (score >= 80) return 'Related Issue';
  if (score >= 60) return 'Possible Related Issue';
  return 'New Issue';
}

export function duplicateRecommendation(topScore) {
  if (topScore >= 60) {
    return {
      duplicate: true,
      title: 'Potential Duplicate Bugs Found',
      message: 'Existing tickets appear to match this issue. Review them before creating a new bug.',
    };
  }
  return {
    duplicate: false,
    title: 'No Similar Bugs Found',
    message: 'This appears to be a new issue. You can proceed with bug creation.',
  };
}
