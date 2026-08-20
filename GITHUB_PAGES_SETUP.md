# GitHub Pages Hosting — Same as JIRADashboardBIOAT

## How the reference dashboard is hosted

**URL:** https://impactrx.github.io/JIRADashboardBIOAT/

| Component | How it works |
|-----------|--------------|
| **Hosting** | GitHub Pages (static site) |
| **URL pattern** | `https://<org>.github.io/<repo-name>/` |
| **Frontend** | Static HTML/JS (built app) |
| **Jira data** | GitHub Actions fetches Jira on a schedule (every 15 min) and saves JSON to the repo |
| **Secrets** | Jira PAT stored in GitHub Secrets — never exposed in the browser |
| **Team access** | Anyone with the URL can open it — no VPN or your PC needed |

Your QA Bug Dashboard is now set up the same way.

---

## Your team URL (after setup)

```
https://impactrx.github.io/QA_Bug_DashBoard/
```

Share this with all 5 teammates — works from anywhere.

---

## One-time setup steps

### 1. Create GitHub repo

1. Go to GitHub → **impactrx** organization (or your team org)
2. Create new repo: **`QA_Bug_DashBoard`**
3. Push this project:

```powershell
cd "C:\Users\u1198198\OneDrive - IQVIA\Desktop\OA TESTING\JIRA"
git init
git add .
git commit -m "Initial QA Bug Dashboard"
git remote add dashboard https://github.com/impactrx/QA_Bug_DashBoard.git
git branch -M main
git push -u dashboard main
```

> If repo name differs, update `VITE_BASE_PATH` in `jira-dashboard/.env.production` to `/YourRepoName/`

### 2. Add GitHub Secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → New secret:

| Secret | Value |
|--------|-------|
| `JIRA_URL` | `https://jiraims.rm.imshealth.com` |
| `JIRA_PERSONAL_TOKEN` | Your Jira PAT |

### 3. Enable GitHub Pages

Repo → **Settings** → **Pages**:
- **Source:** GitHub Actions

### 4. Run first sync

Actions → **Sync Jira Data** → **Run workflow**

Then Actions → **Deploy to GitHub Pages** → **Run workflow**

---

## What runs automatically

| Workflow | Schedule | Purpose |
|----------|----------|---------|
| `sync-jira-data.yml` | Every 15 minutes | Fetches BIIH bugs → saves `jira-dashboard/public/data/jira-bugs.json` |
| `deploy-pages.yml` | On every push to main | Builds React app → publishes to GitHub Pages |

---

## Local vs GitHub Pages

| Feature | Local (`npm run dev`) | GitHub Pages |
|---------|----------------------|--------------|
| Dashboard & charts | ✅ | ✅ |
| Filters & export | ✅ | ✅ |
| AI Agent (local search) | ✅ | ✅ (client-side fallback) |
| Live Jira API | ✅ | ❌ (uses synced JSON) |
| Team access without your PC | ❌ | ✅ |
| Needs VPN for viewers | Sometimes | No |

---

## Compare with localhost sharing

| | localhost / LAN | GitHub Pages |
|--|-----------------|--------------|
| URL | `http://10.194.52.33:5175` | `https://impactrx.github.io/QA_Bug_DashBoard/` |
| Your PC must stay on | Yes | No |
| Firewall setup | Yes | No |
| Works outside office | No | Yes |
| Same as BIOAT dashboard | No | **Yes** |

---

## Troubleshooting

- **404 on GitHub Pages:** Check repo name matches `VITE_BASE_PATH` in `.env.production`
- **Empty dashboard:** Run **Sync Jira Data** workflow manually first
- **Stale data:** Sync runs every 15 min; check Actions tab for errors
- **Jira auth fails in Actions:** Verify secrets and PAT expiry
