import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { homedir, networkInterfaces } from 'os';
import { join } from 'path';
import { KnowledgeBase } from './knowledgeBase.js';
import {
  buildInsights,
  buildSummary,
  creationAssist,
  fetchAllBugs,
  generateChatResponse,
} from './aiAgent.js';
import {
  analyzeDefect,
  analyzeDefectBatch,
  formatDefectReport,
  getCatalogueStatus,
  refreshDefectCatalogue,
} from './defectIntelligence.js';
import { fetchReleaseVersions, fetchReleaseStories } from './releases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 5175;
const KB_REFRESH_MS = 2 * 60 * 60 * 1000; // 2-hour defect knowledge refresh

function getNetworkUrls(port) {
  const urls = [`http://localhost:${port}`];
  const nets = networkInterfaces();
  Object.values(nets).forEach((ifaces) => {
    ifaces?.forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) {
        urls.push(`http://${net.address}:${port}`);
      }
    });
  });
  return [...new Set(urls)];
}

function loadJiraConfig() {
  if (process.env.JIRA_URL && process.env.JIRA_PERSONAL_TOKEN) {
    return {
      baseUrl: process.env.JIRA_URL.replace(/\/$/, ''),
      token: process.env.JIRA_PERSONAL_TOKEN,
      project: process.env.JIRA_PROJECT || 'BIIH',
    };
  }

  try {
    const mcpPath = join(homedir(), '.cursor', 'mcp.json');
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'));
    const env = mcp.mcpServers['mcp-atlassian'].env;
    return {
      baseUrl: env.JIRA_URL.replace(/\/$/, ''),
      token: env.JIRA_PERSONAL_TOKEN,
      project: process.env.JIRA_PROJECT || 'BIIH',
    };
  } catch {
    throw new Error('Jira credentials not found. Set .env or configure mcp.json');
  }
}

const config = loadJiraConfig();
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const knowledgeBase = new KnowledgeBase();
let bugRecords = [];
let openaiClient = null;

async function initOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI enabled for Bug Intelligence Agent');
    return openaiClient;
  } catch {
    console.log('OpenAI package not installed — using local RAG search');
    return null;
  }
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

async function jiraFetch(path, params = {}) {
  const url = new URL(`${config.baseUrl}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jira API ${response.status}: ${text}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, time: Date.now() });
  return data;
}

async function refreshKnowledgeBase() {
  bugRecords = await fetchAllBugs(jiraFetch, config);
  const result = refreshDefectCatalogue(bugRecords, knowledgeBase);
  console.log(`Defect catalogue refreshed: ${result.jiraCount} bugs at ${result.refreshedAt}`);
  return result;
}

app.get('/api/share-info', (_req, res) => {
  res.json({
    name: 'QA Bug Dashboard',
    localUrl: `http://localhost:${DASHBOARD_PORT}`,
    teamUrls: getNetworkUrls(Number(DASHBOARD_PORT)),
    note: 'Share a team URL with colleagues on the same network. Your PC must stay on with npm run dev running.',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    project: config.project,
    baseUrl: config.baseUrl,
    agent: knowledgeBase.status(),
    aiProvider: openaiClient ? 'openai' : 'local-rag',
  });
});

app.get('/api/jira/issues', async (req, res) => {
  try {
    if (!bugRecords.length) await refreshKnowledgeBase();

    const issueType = req.query.type || 'all';
    const issues = bugRecords.map((record) => ({
      id: record.id,
      key: record.key,
      fields: {
        summary: record.summary,
        description: record.description,
        issuetype: { name: record.issueType },
        status: { name: record.status },
        priority: { name: record.priority },
        reporter: { displayName: record.reporter },
        assignee: { displayName: record.assignee },
        created: record.created,
        updated: record.updated,
        resolutiondate: record.resolutionDate,
        labels: record.labels.split(', ').filter((l) => l && l !== 'None'),
        components: record.components.split(', ').filter(Boolean).map((name) => ({ name })),
        fixVersions: record.fixVersions.split(', ').filter(Boolean).map((name) => ({ name })),
        project: { key: record.project },
        customfield_15048: record.acceptanceCriteria,
        customfield_10020: record.sprint ? [{ name: record.sprint }] : [],
        customfield_10016: record.storyPoints || null,
      },
    }));

    const filtered = issueType === 'Bug'
      ? issues.filter((i) => i.fields.issuetype.name === 'Bug')
      : issues;

    res.json({
      total: filtered.length,
      baseUrl: config.baseUrl,
      issues: filtered,
      syncedAt: knowledgeBase.lastIndexedAt || new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jira/cache/clear', async (_req, res) => {
  cache.clear();
  await refreshKnowledgeBase();
  res.json({ ok: true, agent: knowledgeBase.status() });
});

app.get('/api/agent/status', (_req, res) => {
  res.json({
    ...knowledgeBase.status(),
    ...getCatalogueStatus(),
    aiProvider: openaiClient ? 'openai' : 'local-rag',
    refreshIntervalHours: 2,
  });
});

app.post('/api/agent/reindex', async (_req, res) => {
  try {
    const result = await refreshKnowledgeBase();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent/search', (req, res) => {
  const { query, limit = 10 } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query is required' });
  const matches = knowledgeBase.search(query, limit);
  res.json({ query, matches, indexedAt: knowledgeBase.lastIndexedAt });
});

app.post('/api/agent/chat', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: 'query is required' });
    const result = await generateChatResponse(query, knowledgeBase, bugRecords, openaiClient);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent/duplicate-check', (req, res) => {
  const { title = '', description = '', errorMessage = '', module = '', keywords = '', catId = '' } = req.body || {};
  const query = [title, description, errorMessage, module, keywords].filter(Boolean).join(' ');
  const matches = knowledgeBase.search(query, 10);
  const analysis = analyzeDefect(
    {
      issue: title,
      description: [description, errorMessage, module, keywords].filter(Boolean).join(' '),
      catId,
      validationType: module || 'UI',
    },
    bugRecords,
    knowledgeBase,
  );

  const recommendation = analysis.status === 'Genuine New Defect'
    ? {
        duplicate: false,
        title: 'No Similar Bugs Found',
        similarity: analysis.similarityScore || 0,
        message: analysis.reason,
        existingTickets: matches.slice(0, 3),
      }
    : {
        duplicate: true,
        title: analysis.status,
        similarity: analysis.similarityScore || 0,
        message: analysis.reason,
        existingTickets: analysis.relatedTicket
          ? [{ ...analysis.relatedTicket, similarity: analysis.similarityScore || 0, priority: '', reporter: '', assignee: '', labels: '', components: '', description: '', matchType: analysis.status }]
          : matches.filter((m) => m.similarity >= 60).slice(0, 5),
      };

  res.json({ analysis, matches, recommendation });
});

app.post('/api/defect/analyze', (req, res) => {
  const { catId = '', issues = [], issue, description, cdom, oa, validationType } = req.body || {};

  if (issues.length) {
    const batch = analyzeDefectBatch(issues, bugRecords, knowledgeBase, catId);
    const report = formatDefectReport(batch, catId);
    return res.json({ ...batch, report, indexedAt: knowledgeBase.lastIndexedAt });
  }

  if (!issue && !description) {
    return res.status(400).json({ error: 'Provide issue or issues array' });
  }

  const result = analyzeDefect(
    { issue, description, cdom, oa, catId, validationType: validationType || 'UI' },
    bugRecords,
    knowledgeBase,
  );
  res.json({ result, indexedAt: knowledgeBase.lastIndexedAt });
});

app.get('/api/defect/catalogue', (_req, res) => {
  res.json(getCatalogueStatus());
});

app.post('/api/agent/creation-assist', (req, res) => {
  const result = creationAssist(req.body || {}, knowledgeBase, bugRecords);
  res.json(result);
});

app.get('/api/agent/insights', (_req, res) => {
  res.json(buildInsights(bugRecords, knowledgeBase));
});

app.get('/api/agent/summary', (req, res) => {
  const period = req.query.period || 'daily';
  res.json(buildSummary(bugRecords, period));
});

app.get('/api/releases/versions', async (_req, res) => {
  try {
    const data = await fetchReleaseVersions(jiraFetch, config);
    res.json({ ...data, baseUrl: config.baseUrl, syncedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/releases/stories', async (req, res) => {
  try {
    const version = String(req.query.version || '').trim();
    if (!version) return res.status(400).json({ error: 'version query parameter is required' });
    const refresh = String(req.query.refresh || '') === '1';
    if (refresh) cache.clear();
    const data = await fetchReleaseStories(jiraFetch, config, version);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  const teamUrls = getNetworkUrls(Number(DASHBOARD_PORT));
  console.log(`QA Bug Dashboard API running on http://localhost:${PORT}`);
  console.log(`Dashboard (local):  http://localhost:${DASHBOARD_PORT}`);
  teamUrls.filter((u) => !u.includes('localhost')).forEach((url) => {
    console.log(`Dashboard (team):   ${url}`);
  });
  console.log(`Project: ${config.project} | Jira: ${config.baseUrl}`);
  await initOpenAI();
  try {
    await refreshKnowledgeBase();
  } catch (err) {
    console.error('Initial knowledge base sync failed:', err.message);
  }
  setInterval(() => {
    refreshKnowledgeBase().catch((err) => console.error('KB auto-refresh failed:', err.message));
  }, KB_REFRESH_MS);
});
