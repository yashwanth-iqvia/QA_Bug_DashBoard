"""
Export BIIH bugs to static JSON for GitHub Pages hosting.
Used by GitHub Actions (same pattern as impactrx.github.io/JIRADashboardBIOAT).

Output: jira-dashboard/public/data/jira-bugs.json
Secrets: JIRA_URL, JIRA_PERSONAL_TOKEN (or reads ~/.cursor/mcp.json locally)
"""

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "jira-dashboard" / "public" / "data" / "jira-bugs.json"
MCP_JSON = Path.home() / ".cursor" / "mcp.json"
PROJECT = "BIIH"
JQL = f'project = {PROJECT} AND issuetype = Bug ORDER BY updated DESC'
FIELDS = (
    "summary,description,issuetype,status,priority,reporter,assignee,created,updated,"
    "resolutiondate,labels,components,fixVersions,project,customfield_15048,customfield_10020,"
    "customfield_10016,customfield_10002"
)


def load_config():
    url = os.environ.get("JIRA_URL")
    token = os.environ.get("JIRA_PERSONAL_TOKEN")
    if url and token:
        return url.rstrip("/"), token
    data = json.loads(MCP_JSON.read_text(encoding="utf-8"))
    env = data["mcpServers"]["mcp-atlassian"]["env"]
    return env["JIRA_URL"].rstrip("/"), env["JIRA_PERSONAL_TOKEN"]


def strip_html(html):
    return re.sub(r"<[^>]+>", " ", html or "").strip()


def user_name(user):
    if not user:
        return "Unassigned"
    return user.get("displayName") or user.get("name") or "Unassigned"


def fetch_all_bugs(base_url, token):
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    issues = []
    start_at = 0
    max_results = 100

    while True:
        resp = requests.get(
            f"{base_url}/rest/api/2/search",
            headers=headers,
            params={"jql": JQL, "startAt": start_at, "maxResults": max_results, "expand": "renderedFields", "fields": FIELDS},
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("issues", [])
        issues.extend(batch)
        if start_at + len(batch) >= data.get("total", 0):
            break
        start_at += len(batch)

    return issues


def to_api_issue(base_url, issue):
    f = issue.get("fields", {})
    description = f.get("description") or ""
    if not description and issue.get("renderedFields", {}).get("description"):
        description = strip_html(issue["renderedFields"]["description"])

    return {
        "id": issue["id"],
        "key": issue["key"],
        "fields": {
            "summary": f.get("summary") or "",
            "description": description,
            "issuetype": {"name": (f.get("issuetype") or {}).get("name", "Bug")},
            "status": {"name": (f.get("status") or {}).get("name", "")},
            "priority": {"name": (f.get("priority") or {}).get("name", "")},
            "reporter": {"displayName": user_name(f.get("reporter"))},
            "assignee": {"displayName": user_name(f.get("assignee"))},
            "created": f.get("created") or "",
            "updated": f.get("updated") or "",
            "resolutiondate": f.get("resolutiondate") or "",
            "labels": f.get("labels") or [],
            "components": [{"name": c.get("name", "")} for c in (f.get("components") or [])],
            "fixVersions": [{"name": v.get("name", "")} for v in (f.get("fixVersions") or [])],
            "project": {"key": (f.get("project") or {}).get("key", PROJECT)},
            "customfield_15048": f.get("customfield_15048") or "",
            "customfield_10020": f.get("customfield_10020") or [],
            "customfield_10016": f.get("customfield_10016"),
            "customfield_10002": f.get("customfield_10002"),
        },
    }


def main():
    base_url, token = load_config()
    print(f"Fetching bugs from {base_url}...")
    raw = fetch_all_bugs(base_url, token)
    issues = [to_api_issue(base_url, i) for i in raw]
    synced_at = datetime.now(timezone.utc).isoformat()

    payload = {
        "total": len(issues),
        "baseUrl": base_url,
        "syncedAt": synced_at,
        "issues": issues,
        "source": "github-actions",
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Exported {len(issues)} bugs → {OUTPUT}")


if __name__ == "__main__":
    main()
