# GitHub Pages — QA Bug Dashboard

## Your team URL

```
https://yashwanth-iqvia.github.io/QA_Bug_DashBoard/
```

GitHub Pages hosts the **frontend only**. Live Jira data requires a separate **read-only API server** (Express) because:

- GitHub Pages cannot run Node.js/Express
- Browsers cannot call Jira directly (auth tokens + CORS)
- The dashboard never stores Jira snapshots — it always reads live from Jira via the API

---

## Setup (one time)

### Step 1 — Deploy the API (Render recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint** → connect repo
3. Render reads `render.yaml` and creates `qa-bug-dashboard-api`
4. Set environment variables in Render:
   - `JIRA_URL` = `https://jiraims.rm.imshealth.com`
   - `JIRA_PERSONAL_TOKEN` = your Jira PAT
5. After deploy, copy the API URL (e.g. `https://qa-bug-dashboard-api.onrender.com`)

### Step 2 — Add GitHub Secrets

Repo **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VITE_API_URL` | Your Render API URL (no trailing slash), e.g. `https://qa-bug-dashboard-api.onrender.com` |

### Step 3 — Enable GitHub Pages

Settings → Pages → Source: **GitHub Actions**

### Step 4 — Deploy

Actions → **Deploy to GitHub Pages** → Run workflow

---

## Local development

```bash
cd jira-dashboard
npm run dev
```

Open http://localhost:5175 — no `VITE_API_URL` needed locally (Vite proxies `/api` to port 3001).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **API Failure / HTML instead of JSON** | `VITE_API_URL` secret missing or wrong. Redeploy Pages after setting it. |
| **CORS error** | Ensure Render `CORS_ORIGIN` includes `https://yashwanth-iqvia.github.io` |
| **404 on Pages** | Repo name must match `VITE_BASE_PATH=/QA_Bug_DashBoard/` |
| **Slow first load** | Render free tier cold-starts; first request may take 30–60s |
| **Empty data** | Check Render logs for Jira auth errors; verify PAT is valid |

---

## Architecture

```
Browser (GitHub Pages)
    ↓  VITE_API_URL
Express API (Render) — read-only GET to Jira
    ↓
Jira REST API
```

No Jira data is stored in JSON files, localStorage, or GitHub Pages assets.
