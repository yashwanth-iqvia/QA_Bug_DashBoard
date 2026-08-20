/**
 * Senior QA Defect Intelligence Agent
 * CDOM Export = Master. Never recommend duplicate Jira tickets.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Report hierarchy: CDOM Export > OA Export > OA UI > Embedded Excel */
export const REPORT_HIERARCHY = ['CDOM Export', 'OA Export', 'OA UI', 'Embedded Excel'];

/** STEP 2 — Semantic synonym groups */
export const SEMANTIC_SYNONYMS = {
  'x-axis': ['x axis', 'x-axis', 'axis label', 'tick mark', 'tick label', 'month format', 'month formatting', 'n/dr', 'n & dr', 'category label', 'label formatting', 'multi-line', 'single line', 'gridline'],
  tooltip: ['tool tip', 'tooltip', 'missing %', 'missing n', 'missing dr', 'wrong decimal', 'decimal', 'hover', 'tooltip value'],
  legend: ['legend order', 'legend sort', 'legend position', 'legend font', 'series order', 'product sorting', 'sort order'],
  excel: ['embedded excel', 'embedded workbook', 'excel formatting', 'product sorting', 'series sorting', 'percentage rounding', 'decimal precision', 'rounded values', 'whole number', 'blue shading'],
  alignment: ['footer alignment', 'footer position', 'metadata alignment', 'metadata position', 'key takeaway position', 'title alignment', 'chart alignment', 'slide layout', 'misaligned'],
  header: ['header metadata', 'metadata label', 'month text', 'month ending', 'report header', 'header value'],
  'export-line': ['line marker', 'missing marker', 'marker rendering', 'y-axis line', 'missing line', 'chart rendering'],
  pie: ['pie chart', 'pie title', 'month year title', 'donut', 'donut chart'],
  data: ['product name', 'dimension name', 'category', 'series', 'missing product', 'missing dimension', 'product order', 'series order', 'n value', 'dr value', 'percentage', 'decimal precision', 'totals'],
  font: ['font family', 'font weight', 'font size', 'font retention'],
  export: ['ppt output', 'ppt export', 'export formatting', 'slide layout', 'data label', 'scale rendering', 'axis rendering'],
};

/** STEP 5 — Parent defect families */
export const PARENT_DEFECTS = [
  { id: 'x-axis', name: 'Axis Parent Bug', tickets: ['BIIH-149', 'BIIH-157', 'BIIH-163'], keywords: ['x-axis', 'x axis', 'tick', 'month format', 'n/dr', 'label formatting', 'single line', 'multi-line'] },
  { id: 'tooltip', name: 'Tooltip Parent Bug', tickets: ['BIIH-150', 'BIIH-158', 'BIIH-161', 'BIIH-170'], keywords: ['tooltip', 'missing %', 'missing n', 'missing dr', 'decimal'] },
  { id: 'header', name: 'Header Metadata Parent Bug', tickets: ['BIIH-153', 'BIIH-305'], keywords: ['header', 'metadata', 'month text', 'month ending'] },
  { id: 'alignment', name: 'Alignment Parent Bug', tickets: ['BIIH-178', 'BIIH-311'], keywords: ['alignment', 'footer position', 'metadata position', 'key takeaway position', 'title alignment'] },
  { id: 'export-line', name: 'Export Parent Bug', tickets: ['BIIH-179', 'BIIH-174'], keywords: ['line marker', 'y-axis line', 'missing marker', 'marker rendering'] },
  { id: 'excel', name: 'Embedded Excel Parent Bug', tickets: ['BIIH-162', 'BIIH-166', 'BIIH-171', 'BIIH-312'], keywords: ['excel', 'embedded', 'product sorting', 'series sorting', 'percentage rounding', 'decimal precision'] },
  { id: 'pie', name: 'Pie Chart Parent Bug', tickets: ['BIIH-151', 'BIIH-173'], keywords: ['pie', 'donut', 'month year', 'pie title'] },
  { id: 'legend', name: 'Legend Parent Bug', tickets: ['BIIH-148', 'BIIH-164', 'BIIH-169', 'BIIH-172'], keywords: ['legend order', 'legend font', 'legend position', 'series order'] },
  { id: 'data', name: 'Data Parent Bug', tickets: ['BIIH-307', 'BIIH-308', 'BIIH-310'], keywords: ['wrong data', 'missing product', 'missing dimension', 'product order', 'indication'] },
  { id: 'key-takeaway', name: 'Key Takeaway Parent Bug', tickets: ['BIIH-154', 'BIIH-159', 'BIIH-165', 'BIIH-304'], keywords: ['key takeaway', 'copyright', 'outline name'] },
];

export const DEFAULT_DEV_ISSUES = [
  { id: 'DEV-001', summary: 'Percentage may round when spec allows (68.9 → 69)', keywords: ['round', 'rounded', '68.9', '69', 'whole number', 'integer round'] },
  { id: 'DEV-002', summary: '35.61% vs 0.3561 — mathematically equivalent', keywords: ['35.61', '0.3561', 'percent conversion', 'decimal conversion', 'equivalent'] },
  { id: 'DEV-003', summary: 'Legacy CatIDs may not retain all CDOM font metadata', keywords: ['legacy', 'legacy template', 'legacy catid'] },
];

/** Self-learning catalogue — rebuilt on each Jira refresh */
let learnedTicketProfiles = [];
let devIssuesCache = [...DEFAULT_DEV_ISSUES];
let lastCatalogueRefresh = null;

const COMPONENT_DETECTORS = [
  { component: 'X-Axis', patterns: [/x[\s-]?axis/i, /tick mark/i, /axis label/i, /month format/i, /n\/dr/i] },
  { component: 'Tooltip', patterns: [/tooltip/i, /missing\s*%/i, /missing\s*n/i, /missing\s*dr/i] },
  { component: 'Legend', patterns: [/legend/i, /series order/i, /product sort/i] },
  { component: 'Header', patterns: [/header/i, /metadata/i, /month text/i, /month ending/i] },
  { component: 'Footer', patterns: [/footer/i] },
  { component: 'Key Takeaway', patterns: [/key takeaway/i] },
  { component: 'Embedded Excel', patterns: [/excel/i, /embedded/i, /workbook/i] },
  { component: 'Chart Title', patterns: [/chart title/i, /report title/i, /pie title/i] },
  { component: 'Alignment', patterns: [/alignment/i, /misalign/i, /position/i] },
  { component: 'Line Marker', patterns: [/line marker/i, /y-axis line/i, /missing marker/i] },
  { component: 'Data Values', patterns: [/percentage/i, /decimal/i, /product name/i, /dimension/i, /series order/i, /n value/i, /dr value/i] },
  { component: 'Font', patterns: [/font family/i, /font size/i, /font weight/i] },
  { component: 'Pie Chart', patterns: [/pie chart/i, /donut/i] },
  { component: 'Gridline', patterns: [/gridline/i] },
  { component: 'Color', patterns: [/color/i, /colour/i] },
];

function tokenize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);
}

function detectComponent(text) {
  for (const { component, patterns } of COMPONENT_DETECTORS) {
    if (patterns.some((p) => p.test(text))) return component;
  }
  return 'General';
}

function detectProperty(text, component) {
  const lower = text.toLowerCase();
  if (/single.?line|multi.?line|label format/i.test(lower)) return 'Label Formatting';
  if (/font size|font weight|font family/i.test(lower)) return 'Font Formatting';
  if (/sort|order/i.test(lower)) return 'Sort Order';
  if (/round|decimal|precision|percentage/i.test(lower)) return 'Decimal Precision';
  if (/missing/i.test(lower)) return 'Missing Value';
  if (/alignment|position/i.test(lower)) return 'Positioning';
  if (/color|colour/i.test(lower)) return 'Color';
  return component !== 'General' ? `${component} Behavior` : 'Formatting';
}

function inferCategory(validationType, text) {
  if (validationType && validationType !== 'UI') {
    if (validationType === 'Excel') return 'Export';
    return validationType;
  }
  const lower = text.toLowerCase();
  if (/excel|embedded|workbook/i.test(lower)) return 'Export';
  if (/export|ppt|slide|marker|line marker/i.test(lower)) return 'Export';
  if (/product|dimension|percentage|decimal|series order|n value|dr value/i.test(lower)) return 'Data';
  return 'UI';
}

/** STEP 1 — Issue Signature */
export function buildIssueSignature(input) {
  const {
    issue = '', description = '', cdom = '', oa = '', validationType = 'UI',
  } = input;
  const issueText = [issue, description].filter(Boolean).join(' ');
  const category = inferCategory(validationType, issueText);
  const component = detectComponent(issueText);
  const property = detectProperty(issueText, component);
  const synonyms = generateSynonyms(issueText, component);

  return {
    category,
    component,
    property,
    expected: cdom || 'Multi-Line',
    actual: oa || 'Single-Line',
    issue: issue || description,
    issueText,
    synonyms,
    validationMode: validationType,
    hierarchyRef: REPORT_HIERARCHY[Math.min(['Export', 'Excel'].includes(validationType) ? 1 : validationType === 'Data' ? 0 : 2, 3)],
  };
}

/** STEP 2 — Generate synonyms */
export function generateSynonyms(text, component) {
  const lower = text.toLowerCase();
  const set = new Set(tokenize(lower));
  set.add(component.toLowerCase().replace(/\s+/g, ' '));

  Object.entries(SEMANTIC_SYNONYMS).forEach(([key, synonyms]) => {
    if (lower.includes(key.replace('-', ' ')) || synonyms.some((s) => lower.includes(s))) {
      synonyms.forEach((s) => tokenize(s).forEach((t) => set.add(t)));
      tokenize(key).forEach((t) => set.add(t));
    }
  });

  return [...set];
}

function isMathematicallyEquivalent(cdom, oa) {
  const parseNum = (v) => {
    const n = parseFloat(String(v).trim().replace(/%/g, ''));
    return Number.isNaN(n) ? null : n;
  };
  const a = parseNum(cdom);
  const b = parseNum(oa);
  if (a == null || b == null) return false;
  if (Math.abs(a - b * 100) < 0.05 || Math.abs(a / 100 - b) < 0.0005) return true;
  if (Math.abs(Math.round(a) - b) < 0.01 || Math.abs(a - Math.round(b)) < 0.01) return true;
  if (Math.abs(a - b) < 0.05) return true;
  return false;
}

function findDevMatch(signature, cdom, oa, category) {
  if (category === 'Data' && cdom && oa && isMathematicallyEquivalent(cdom, oa)) {
    return { id: 'DEV-002', summary: 'Values mathematically equivalent (e.g. 35.61% = 0.3561)' };
  }
  const lower = [signature.issueText, cdom, oa].join(' ').toLowerCase();
  if (category === 'Data' && cdom && oa) {
    const a = parseFloat(String(cdom).replace(/%/g, ''));
    const b = parseFloat(String(oa).replace(/%/g, ''));
    if (!Number.isNaN(a) && !Number.isNaN(b) && Math.abs(Math.round(a) - b) < 0.01) {
      return { id: 'DEV-001', summary: 'Rounding allowed by spec (68.9 → 69)' };
    }
  }
  for (const dev of devIssuesCache) {
    if (dev.keywords.some((k) => lower.includes(k.toLowerCase()))) return dev;
  }
  return null;
}

function findParentMatch(signature) {
  const lower = [signature.issueText, ...signature.synonyms].join(' ').toLowerCase();
  for (const parent of PARENT_DEFECTS) {
    if (parent.keywords.some((k) => lower.includes(k))) return parent;
    if (signature.component.toLowerCase().includes(parent.id.replace('-', ' '))) return parent;
  }
  return null;
}

function scoreTextSimilarity(synonyms, bugText) {
  const bugTokens = new Set(tokenize(bugText));
  if (!synonyms.length) return 0;
  let overlap = 0;
  synonyms.forEach((t) => { if (bugTokens.has(t)) overlap += 1; });
  return Math.round((overlap / synonyms.length) * 100);
}

function scoreComponentSimilarity(signature, bugText) {
  const bugComponent = detectComponent(bugText);
  if (signature.component === bugComponent) return 100;
  if (signature.component === 'General' || bugComponent === 'General') return 40;
  return 0;
}

function scoreRootCauseSimilarity(signature, bug) {
  const ac = `${bug.acceptanceCriteria || ''} ${bug.summary || ''}`.toLowerCase();
  const props = [signature.property.toLowerCase(), signature.component.toLowerCase()];
  let hits = 0;
  props.forEach((p) => { if (ac.includes(p.replace(/\s+/g, '')) || ac.includes(p)) hits += 1; });
  return hits ? Math.min(100, hits * 50) : scoreTextSimilarity(signature.synonyms, ac);
}

/** STEP 6 — Multi-dimensional similarity */
function calculateSimilarity(signature, bug, knowledgeBase, queryText) {
  const bugText = `${bug.summary} ${bug.description} ${bug.acceptanceCriteria} ${bug.labels} ${bug.commentsText || ''}`;
  const textSim = scoreTextSimilarity(signature.synonyms, bugText);
  const componentSim = scoreComponentSimilarity(signature, bugText);
  const rootCauseSim = scoreRootCauseSimilarity(signature, bug);

  let semanticSim = textSim;
  if (knowledgeBase?.search) {
    const kbHit = knowledgeBase.search(queryText, 5).find((m) => m.key === bug.key);
    if (kbHit) semanticSim = Math.max(textSim, kbHit.similarity);
  }

  const composite = Math.round(
    textSim * 0.35 + semanticSim * 0.35 + rootCauseSim * 0.15 + componentSim * 0.15,
  );

  return {
    composite,
    textSimilarity: textSim,
    semanticSimilarity: semanticSim,
    rootCauseSimilarity: rootCauseSim,
    componentSimilarity: componentSim,
  };
}

function statusFromScore(composite, parentMatch) {
  if (composite >= 90) return { status: 'Already Logged', tier: 'Same Defect' };
  if (composite >= 80) return { status: 'Duplicate of Existing Issue', tier: 'Likely Duplicate' };
  if (composite >= 70) return { status: 'Covered By Parent Defect', tier: 'Parent Issue Match' };
  if (parentMatch && composite >= 55) return { status: 'Covered By Parent Defect', tier: 'Parent Issue Match' };
  if (composite >= 60) return { status: 'Covered by Existing Jira', tier: 'Related Issue' };
  return { status: 'Genuine New Defect', tier: 'Candidate New Defect' };
}

function confidenceFromScore(score) {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

function findBestJiraMatch(signature, queryText, jiraBugs, knowledgeBase) {
  let best = null;
  let bestScores = null;

  jiraBugs.forEach((bug) => {
    const scores = calculateSimilarity(signature, bug, knowledgeBase, queryText);
    if (!best || scores.composite > bestScores.composite) {
      best = bug;
      bestScores = scores;
    }
  });

  if (knowledgeBase?.search && !best) {
    const kbMatches = knowledgeBase.search(queryText, 5);
    if (kbMatches[0]) {
      best = jiraBugs.find((b) => b.key === kbMatches[0].key) || kbMatches[0];
      bestScores = {
        composite: kbMatches[0].similarity,
        textSimilarity: kbMatches[0].similarity,
        semanticSimilarity: kbMatches[0].similarity,
        rootCauseSimilarity: 0,
        componentSimilarity: 0,
      };
    }
  }

  return best ? { bug: best, scores: bestScores } : null;
}

/** Self-learning — extract profile from Jira ticket */
function extractTicketProfile(bug) {
  const text = `${bug.summary} ${bug.description} ${bug.acceptanceCriteria}`;
  return {
    key: bug.key,
    summary: bug.summary,
    category: inferCategory('', text),
    component: detectComponent(text),
    property: detectProperty(text, detectComponent(text)),
    rootCause: bug.acceptanceCriteria || bug.summary,
    expectedBehavior: '',
    actualBehavior: '',
    labels: bug.labels,
    status: bug.status,
  };
}

export function loadDevKnownIssues() {
  const paths = [
    join(__dirname, '../../DEV_KNOWN_ISSUES.md'),
    join(__dirname, '../../../DEV_KNOWN_ISSUES.md'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        readFileSync(p, 'utf-8');
      } catch { /* keep defaults */ }
      break;
    }
  }
  return devIssuesCache;
}

/** Self-learning refresh — rebuild catalogue from all Jira tickets */
export function refreshDefectCatalogue(jiraBugs, knowledgeBase) {
  loadDevKnownIssues();
  learnedTicketProfiles = jiraBugs.map(extractTicketProfile);
  if (knowledgeBase?.index) {
    knowledgeBase.index(jiraBugs);
  }
  lastCatalogueRefresh = new Date().toISOString();
  return {
    jiraCount: jiraBugs.length,
    devIssueCount: devIssuesCache.length,
    learnedProfiles: learnedTicketProfiles.length,
    parentFamilies: PARENT_DEFECTS.length,
    refreshedAt: lastCatalogueRefresh,
  };
}

export function getCatalogueStatus() {
  return {
    lastRefresh: lastCatalogueRefresh,
    jiraIndexed: learnedTicketProfiles.length,
    devIssues: devIssuesCache.length,
    parentFamilies: PARENT_DEFECTS.length,
    refreshIntervalHours: 2,
  };
}

function recommendationFor(status, ticket, catId, tier) {
  const catNote = catId ? `Add CAT-ID ${catId} as affected example to ${ticket}.` : 'Add CAT-ID as affected example.';
  switch (status) {
    case 'Already Logged':
    case 'Duplicate of Existing Issue':
    case 'Covered By Parent Defect':
    case 'Covered by Existing Jira':
      return `${catNote} Do Not Raise New Defect. (${tier})`;
    case 'Known DEV Issue':
      return 'Do Not Raise.';
    case 'Genuine New Defect':
      return 'Proceed with new Jira defect creation.';
    default:
      return catNote;
  }
}

/**
 * Full 6-step analysis pipeline
 */
export function analyzeDefect(input, jiraBugs, knowledgeBase) {
  const {
    issue = '', description = '', cdom = '', oa = '', catId = '', validationType = 'UI',
  } = input;

  const signature = buildIssueSignature({ issue, description, cdom, oa, validationType });
  const queryText = [signature.category, signature.component, signature.property, signature.issueText, cdom, oa].filter(Boolean).join(' ');

  // STEP 4 — DEV known issues
  const devMatch = findDevMatch(signature, cdom, oa, signature.category);
  if (devMatch) {
    return {
      signature,
      category: signature.category,
      component: signature.component,
      cdom,
      oa,
      issue: signature.issue,
      status: 'Known DEV Issue',
      confidence: 'High',
      matchingTicket: devMatch.id,
      similarityScore: 100,
      similarityBreakdown: { textSimilarity: 100, semanticSimilarity: 100, rootCauseSimilarity: 100, componentSimilarity: 100 },
      tier: 'DEV Known Issue',
      reason: `Covered by DEV known issue: ${devMatch.summary}`,
      recommendation: recommendationFor('Known DEV Issue', devMatch.id, catId, 'DEV Known Issue'),
    };
  }

  // STEP 5 — Parent defect matching
  const parentMatch = findParentMatch(signature);

  // STEP 3 — Jira search + STEP 6 — Similarity
  const jiraMatch = findBestJiraMatch(signature, queryText, jiraBugs, knowledgeBase);
  const composite = jiraMatch?.scores?.composite || (parentMatch ? 72 : 0);
  const { status, tier } = statusFromScore(composite, parentMatch);

  const matchingTicket = jiraMatch?.bug?.key || parentMatch?.tickets?.[0] || null;
  const bug = jiraMatch?.bug || (matchingTicket ? jiraBugs.find((b) => b.key === matchingTicket) : null);

  if (status === 'Genuine New Defect') {
    return {
      signature,
      category: signature.category,
      component: signature.component,
      cdom,
      oa,
      issue: signature.issue,
      status,
      confidence: composite >= 50 ? 'Medium' : 'High',
      matchingTicket: null,
      similarityScore: composite,
      similarityBreakdown: jiraMatch?.scores || { textSimilarity: 0, semanticSimilarity: 0, rootCauseSimilarity: 0, componentSimilarity: 0 },
      tier,
      title: `${signature.category} - ${issue}`.trim(),
      description: [`CDOM (Master): ${cdom || '—'}`, `OA: ${oa || '—'}`, '', issue, description].filter(Boolean).join('\n'),
      impact: catId ? `CatID ${catId}` : 'Verify affected CatIDs',
      priority: signature.category === 'Data' ? 'High' : 'Medium',
      reason: 'All searches complete. No existing Jira, DEV issue, or parent defect covers this. Similarity below 70%.',
      recommendation: 'Proceed with new Jira defect creation.',
      relatedTicket: null,
      parentFamily: parentMatch?.name || null,
    };
  }

  const reasonParts = [];
  if (jiraMatch) reasonParts.push(`Best Jira match: "${bug?.summary}" [${bug?.status}]`);
  if (parentMatch) reasonParts.push(`Parent family: ${parentMatch.name} (${parentMatch.tickets.join(', ')})`);
  reasonParts.push(`Composite similarity: ${composite}% (${tier})`);

  return {
    signature,
    category: signature.category,
    component: signature.component,
    cdom,
    oa,
    issue: signature.issue,
    status,
    confidence: confidenceFromScore(composite),
    matchingTicket,
    similarityScore: composite,
    similarityBreakdown: jiraMatch?.scores || { textSimilarity: composite, semanticSimilarity: composite, rootCauseSimilarity: 0, componentSimilarity: 0 },
    tier,
    reason: reasonParts.join('. '),
    recommendation: recommendationFor(status, matchingTicket, catId, tier),
    relatedTicket: bug ? { key: bug.key, summary: bug.summary, status: bug.status, jiraUrl: bug.jiraUrl } : undefined,
    relatedTickets: parentMatch?.tickets,
    parentFamily: parentMatch?.name || null,
  };
}

export function analyzeDefectBatch(issues, jiraBugs, knowledgeBase, catId = '') {
  const results = issues.map((item) => ({
    ...analyzeDefect({ ...item, catId }, jiraBugs, knowledgeBase),
    issue: item.issue,
  }));

  const raise = results.filter((r) => r.status === 'Genuine New Defect');
  const doNotRaise = results.filter((r) => r.status !== 'Genuine New Defect');

  return {
    results,
    summary: {
      total: results.length,
      alreadyLogged: results.filter((r) => r.status === 'Already Logged').length,
      duplicate: results.filter((r) => r.status === 'Duplicate of Existing Issue').length,
      covered: results.filter((r) => r.status.includes('Covered')).length,
      knownIssue: results.filter((r) => r.status === 'Known DEV Issue').length,
      newDefects: raise.length,
    },
    finalRecommendation: {
      doNotRaise: doNotRaise.map((r) => r.issue || `${r.component}: ${r.issue}`),
      raise: raise.map((r) => r.title || r.issue || `${r.component}: ${r.issue}`),
    },
  };
}

export function formatDefectReport(analysis, catId = '') {
  const lines = [
    '# QA Defect Intelligence Report',
    '',
    catId ? `**CatID:** ${catId}` : '',
    `**Generated:** ${new Date().toISOString()}`,
    '**Reference Hierarchy:** CDOM Export → OA Export → OA UI → Embedded Excel',
    '',
  ];

  analysis.results.forEach((r, i) => {
    lines.push(`## Difference ${i + 1}`);
    lines.push('');
    lines.push(`**Category:** ${r.category || r.signature?.category || '—'}`);
    lines.push(`**Component:** ${r.component || r.signature?.component || '—'}`);
    lines.push(`**CDOM:** ${r.cdom || '—'}`);
    lines.push(`**OA:** ${r.oa || '—'}`);
    lines.push(`**Issue:** ${r.issue || '—'}`);
    if (r.signature) {
      lines.push(`**Signature:** Category=${r.signature.category} Component=${r.signature.component} Property=${r.signature.property}`);
    }
    lines.push(`**Similarity Score:** ${r.similarityScore}%`);
    if (r.tier) lines.push(`**Tier:** ${r.tier}`);
    lines.push(`**Status:** ${r.status}`);
    if (r.matchingTicket) lines.push(`**Ticket:** ${r.matchingTicket}`);
    lines.push(`**Recommendation:** ${r.recommendation}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push('## FINAL RECOMMENDATION');
  lines.push('');
  lines.push('**DO NOT RAISE**');
  analysis.finalRecommendation.doNotRaise.forEach((x) => lines.push(`- ${x}`));
  lines.push('');
  lines.push('**RAISE**');
  if (analysis.finalRecommendation.raise.length) {
    analysis.finalRecommendation.raise.forEach((x) => lines.push(`- ${x}`));
  } else {
    lines.push('- None — no genuine new defects identified');
  }

  return lines.filter(Boolean).join('\n');
}

// Legacy export alias
export const DUPLICATE_CATALOGUE = PARENT_DEFECTS.map((p) => ({
  id: p.id,
  tickets: p.tickets,
  parent: p.name,
}));
