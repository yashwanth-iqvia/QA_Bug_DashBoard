# Jira Bug Tracking Dashboard

Modern enterprise dashboard for IQVIA Jira bug tracking with analytics, filters, export, and **AI Bug Intelligence Agent**.

## AI Bug Intelligence Agent

- **Bug Search Assistant** — chat panel to find similar existing bugs
- **Duplicate Detection** — checks title, description, error, module, keywords before creating bugs
- **Bug Knowledge Base** — indexes summary, description, comments, labels, status, reporter, assignee, resolution, sprint
- **AI Insights** — recurring bugs, critical open bugs, top reporters, problem modules
- **Smart Recommendations** — labels, priority, severity, assignee, root cause patterns, workarounds
- **AI Summaries** — daily, weekly, sprint bug summaries
- **Auto-sync** — knowledge base refreshes every **10 minutes** and on dashboard refresh

### Optional OpenAI

Add to `.env` for richer chat responses:

```
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
```

Without OpenAI, the agent uses **local RAG + TF-IDF semantic search** against live Jira data.

## Run

```bash
cd jira-dashboard
npm install
npm run dev
```

- Dashboard: http://localhost:5173
- API proxy: http://localhost:3001

## Config

Set `.env`:

```
JIRA_URL=https://jiraims.rm.imshealth.com
JIRA_PERSONAL_TOKEN=your_pat_here
JIRA_PROJECT=BIIH
PORT=3001
```

Or use credentials from `~/.cursor/mcp.json`.
