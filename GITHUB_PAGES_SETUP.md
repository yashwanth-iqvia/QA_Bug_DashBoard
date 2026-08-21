# GitHub Pages — QA Bug Dashboard (Free)

## Team URL

```
https://yashwanth-iqvia.github.io/QA_Bug_DashBoard/
```

**100% free** — no Render, no paid hosting. GitHub Actions fetches live Jira data every 15 minutes and deploys to Pages.

---

## One-time setup

### 1. Add GitHub Secrets

Repo **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `JIRA_URL` | `https://jiraims.rm.imshealth.com` |
| `JIRA_PERSONAL_TOKEN` | Your Jira PAT |

### 2. Enable GitHub Pages

Settings → Pages → Source: **GitHub Actions**

### 3. Run workflows

1. Actions → **Sync Jira Data** → Run workflow (fetches live Jira → commits JSON)
2. Actions → **Deploy to GitHub Pages** → Run workflow

---

## Auto-updates (free)

| Workflow | Schedule |
|----------|----------|
| Sync Jira Data | Every 15 minutes |
| Deploy to GitHub Pages | On every push to `main` |

---

## Local development (live Jira)

For real-time Jira data while developing:

```bash
cd jira-dashboard
npm run dev
```

Open http://localhost:5175

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Empty dashboard** | Run **Sync Jira Data** workflow first, then redeploy Pages |
| **404 on Pages** | Repo name must match `VITE_BASE_PATH=/QA_Bug_DashBoard/` |
| **Auth errors** | Check JIRA secrets and PAT expiry in GitHub Settings |

---

## How it works

```
GitHub Actions (every 15 min)
    ↓  reads live Jira API (read-only)
    ↓  writes jira-bugs.json + jira-releases.json
GitHub Pages (free static hosting)
    ↓  dashboard loads synced data
Your team browser
```

No paid services required for internal team use.
