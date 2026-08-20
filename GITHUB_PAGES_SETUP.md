# GitHub Pages — QA Bug Dashboard

## Your team URL

```
https://yashwanth-iqvia.github.io/QA_Bug_DashBoard/
```

Share this with your team — works from anywhere, no VPN or your PC needed.

---

## One-time setup (after code is pushed)

### 1. Add GitHub Secrets

Repo **yashwanth-iqvia/QA_Bug_DashBoard** → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `JIRA_URL` | `https://jiraims.rm.imshealth.com` |
| `JIRA_PERSONAL_TOKEN` | Your Jira PAT |

### 2. Enable GitHub Pages

Settings → Pages → Source: **GitHub Actions**

### 3. Run workflows

1. Actions → **Sync Jira Data** → Run workflow
2. Actions → **Deploy to GitHub Pages** → Run workflow

---

## Auto-updates

| Workflow | Schedule |
|----------|----------|
| Sync Jira Data | Every 15 minutes |
| Deploy to GitHub Pages | On every push to `main` |

---

## Troubleshooting

- **404:** Repo name must match `VITE_BASE_PATH=/QA_Bug_DashBoard/` in `.env.production`
- **Empty data:** Run Sync Jira Data workflow manually first
- **Auth errors:** Check Jira secrets and PAT expiry
