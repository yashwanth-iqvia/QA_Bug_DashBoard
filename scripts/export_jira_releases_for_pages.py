"""
Export BIIH release Stories (with CAT ID in summary) + Subtasks for GitHub Pages.

Output: jira-dashboard/public/data/jira-releases.json
Secrets: JIRA_URL, JIRA_PERSONAL_TOKEN (or ~/.cursor/mcp.json locally)
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "jira-dashboard" / "public" / "data" / "jira-releases.json"
MCP_JSON = Path.home() / ".cursor" / "mcp.json"
PROJECT = os.environ.get("JIRA_RELEASE_PROJECT") or os.environ.get("JIRA_PROJECT") or "BIIH"

STORY_FIELDS = (
    "summary,status,assignee,priority,fixVersions,project,issuetype,subtasks,parent,"
    "customfield_10020,customfield_10016,customfield_10002"
)

CAT_ID_RE = re.compile(r"CAT[\s\-]*ID[\s\-]*(\d+)", re.IGNORECASE)
INVISIBLE_RE = re.compile(r"[\u200B-\u200D\uFEFF]")

DEFAULT_RELEASES = [
    "Release 1 - Promo (GenMed, ONC and BISO)",
    "Release 2",
    "Release 3",
    "Future Releases",
]


def load_config():
    url = os.environ.get("JIRA_URL")
    token = os.environ.get("JIRA_PERSONAL_TOKEN")
    if url and token:
        return url.rstrip("/"), token
    data = json.loads(MCP_JSON.read_text(encoding="utf-8"))
    env = data["mcpServers"]["mcp-atlassian"]["env"]
    return env["JIRA_URL"].rstrip("/"), env["JIRA_PERSONAL_TOKEN"]


def strip_invisible(text: str) -> str:
    return INVISIBLE_RE.sub("", text or "")


def extract_cat_id(summary: str):
    match = CAT_ID_RE.search(strip_invisible(summary))
    return match.group(1) if match else None


def user_name(user):
    if not user:
        return "Unassigned"
    return user.get("displayName") or user.get("name") or "Unassigned"


def sprint_name(field):
    if not isinstance(field, list) or not field:
        return "—"
    names = [s.get("name") for s in field if isinstance(s, dict) and s.get("name")]
    return ", ".join(names) if names else "—"


def story_points(fields):
    pts = fields.get("customfield_10016")
    if pts is None:
        pts = fields.get("customfield_10002")
    return str(pts) if pts is not None and pts != "" else "—"


def release_names(fields):
    return [v.get("name") for v in (fields.get("fixVersions") or []) if v.get("name")]


def is_completed(status: str) -> bool:
    return (status or "").lower() in {"done", "resolved", "closed", "completed"}


def is_in_progress(status: str) -> bool:
    s = (status or "").lower()
    return (
        "progress" in s
        or "testing" in s
        or "review" in s
        or "uat" in s
        or s == "ready for test"
    )


def jira_get(base_url, token, path, params=None):
    resp = requests.get(
        f"{base_url}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        params=params or {},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def search_all(base_url, token, jql, fields=STORY_FIELDS):
    issues = []
    start_at = 0
    max_results = 100
    while True:
        data = jira_get(
            base_url,
            token,
            "/rest/api/2/search",
            {
                "jql": jql,
                "startAt": start_at,
                "maxResults": max_results,
                "fields": fields,
            },
        )
        batch = data.get("issues") or []
        issues.extend(batch)
        if start_at + len(batch) >= data.get("total", 0):
            break
        start_at += len(batch)
        if not batch:
            break
    return issues


def fetch_versions(base_url, token, project=PROJECT):
    version_map = {}
    for i, name in enumerate(DEFAULT_RELEASES):
        version_map[name] = {
            "id": f"default-{i}",
            "name": name,
            "released": False,
            "archived": False,
            "source": "default",
        }

    try:
        versions = jira_get(base_url, token, f"/rest/api/2/project/{project}/versions")
        for v in versions or []:
            name = v.get("name")
            if not name:
                continue
            version_map[name] = {
                "id": str(v.get("id") or name),
                "name": name,
                "released": bool(v.get("released")),
                "archived": bool(v.get("archived")),
                "releaseDate": v.get("releaseDate"),
                "source": "jira",
            }
    except Exception as exc:
        print(f"Warning: could not load versions for {project}: {exc}")

    ordered = sorted(
        version_map.values(),
        key=lambda v: (
            DEFAULT_RELEASES.index(v["name"]) if v["name"] in DEFAULT_RELEASES else 999,
            v["name"],
        ),
    )
    return ordered


def normalize_subtask(base_url, issue):
    f = issue.get("fields") or {}
    summary = strip_invisible(f.get("summary") or "—")
    cat_id = extract_cat_id(summary)
    return {
        "key": issue["key"],
        "catId": cat_id,
        "catIdLabel": f"CAT-ID-{cat_id}" if cat_id else None,
        "summary": summary,
        "status": (f.get("status") or {}).get("name") or "Unknown",
        "assignee": user_name(f.get("assignee")),
        "priority": (f.get("priority") or {}).get("name") or "—",
        "jiraUrl": f"{base_url}/browse/{issue['key']}",
        "parentKey": ((f.get("parent") or {}).get("key") if f.get("parent") else None),
    }


def normalize_story(base_url, issue, subtasks):
    f = issue.get("fields") or {}
    summary = strip_invisible(f.get("summary") or "—")
    cat_id = extract_cat_id(summary)
    releases = release_names(f)
    return {
        "key": issue["key"],
        "catId": cat_id,
        "catIdLabel": f"CAT-ID-{cat_id}" if cat_id else issue["key"],
        "summary": summary,
        "status": (f.get("status") or {}).get("name") or "Unknown",
        "assignee": user_name(f.get("assignee")),
        "priority": (f.get("priority") or {}).get("name") or "—",
        "sprint": sprint_name(f.get("customfield_10020")),
        "release": ", ".join(releases) if releases else "—",
        "storyPoints": story_points(f),
        "jiraUrl": f"{base_url}/browse/{issue['key']}",
        "subtasks": subtasks,
    }


def build_summary(stories):
    return {
        "totalStories": len(stories),
        "totalSubtasks": sum(len(s.get("subtasks") or []) for s in stories),
        "completedStories": sum(1 for s in stories if is_completed(s.get("status", ""))),
        "inProgressStories": sum(1 for s in stories if is_in_progress(s.get("status", ""))),
        "pendingStories": sum(
            1
            for s in stories
            if not is_completed(s.get("status", "")) and not is_in_progress(s.get("status", ""))
        ),
    }


def fetch_release_bundle(base_url, token, version_name):
    jql = (
        f'project = "{PROJECT}" AND issuetype = Story AND '
        f'fixVersion = "{version_name}" ORDER BY key ASC'
    )
    raw_stories = search_all(base_url, token, jql)
    story_issues = [i for i in raw_stories if extract_cat_id((i.get("fields") or {}).get("summary") or "")]

    story_issues.sort(
        key=lambda i: (
            int(extract_cat_id((i.get("fields") or {}).get("summary") or "") or 0),
            i.get("key") or "",
        )
    )

    story_keys = [i["key"] for i in story_issues]
    subtask_by_key = {}

    for story in story_issues:
        for st in (story.get("fields") or {}).get("subtasks") or []:
            if st.get("key"):
                subtask_by_key[st["key"]] = normalize_subtask(base_url, st)

    # Enrich via parent query
    for i in range(0, len(story_keys), 40):
        chunk = story_keys[i : i + 40]
        if not chunk:
            continue
        parent_jql = (
            'issuetype = "Sub-task" AND parent in ('
            + ",".join(f'"{k}"' for k in chunk)
            + ")"
        )
        try:
            children = search_all(base_url, token, parent_jql)
            for child in children:
                subtask_by_key[child["key"]] = normalize_subtask(base_url, child)
        except Exception as exc:
            print(f"  Warning: parent subtask query failed: {exc}")

    # Full detail enrichment
    keys = list(subtask_by_key.keys())
    for i in range(0, len(keys), 50):
        chunk = keys[i : i + 50]
        if not chunk:
            continue
        detail_jql = "issuekey in (" + ",".join(f'"{k}"' for k in chunk) + ")"
        try:
            detailed = search_all(base_url, token, detail_jql)
            for issue in detailed:
                subtask_by_key[issue["key"]] = normalize_subtask(base_url, issue)
        except Exception as exc:
            print(f"  Warning: subtask detail query failed: {exc}")

    parent_to_subs = {k: [] for k in story_keys}

    for story in story_issues:
        key = story["key"]
        for st in (story.get("fields") or {}).get("subtasks") or []:
            sk = st.get("key")
            if not sk:
                continue
            full = subtask_by_key.get(sk) or normalize_subtask(base_url, st)
            if not any(x["key"] == full["key"] for x in parent_to_subs[key]):
                parent_to_subs[key].append(
                    {k: v for k, v in full.items() if k != "parentKey"}
                )

    for sk, sub in subtask_by_key.items():
        parent = sub.get("parentKey")
        if parent and parent in parent_to_subs:
            if not any(x["key"] == sk for x in parent_to_subs[parent]):
                parent_to_subs[parent].append(
                    {k: v for k, v in sub.items() if k != "parentKey"}
                )

    stories = [
        normalize_story(base_url, issue, parent_to_subs.get(issue["key"], []))
        for issue in story_issues
    ]

    return {
        "version": version_name,
        "jql": jql,
        "summary": build_summary(stories),
        "stories": stories,
    }


def main():
    base_url, token = load_config()
    print(f"Fetching release data from {base_url} (project={PROJECT})...")

    versions = fetch_versions(base_url, token)
    # Prefer real Jira versions; also keep defaults that may not exist yet
    release_names_to_fetch = []
    seen = set()
    for v in versions:
        name = v["name"]
        if name in seen:
            continue
        # Skip placeholder "Release 2/3/Future" if a more specific Jira version exists
        if name in {"Release 2", "Release 3"} and any(
            x["name"].startswith(name + " -") for x in versions if x.get("source") == "jira"
        ):
            continue
        seen.add(name)
        release_names_to_fetch.append(name)

    releases = {}
    for name in release_names_to_fetch:
        print(f"  Exporting {name}...")
        try:
            bundle = fetch_release_bundle(base_url, token, name)
            releases[name] = bundle
            print(
                f"    -> {bundle['summary']['totalStories']} stories, "
                f"{bundle['summary']['totalSubtasks']} subtasks"
            )
        except Exception as exc:
            print(f"    !! failed: {exc}")
            releases[name] = {
                "version": name,
                "jql": "",
                "summary": build_summary([]),
                "stories": [],
                "error": str(exc),
            }

    synced_at = datetime.now(timezone.utc).isoformat()
    payload = {
        "baseUrl": base_url,
        "syncedAt": synced_at,
        "project": PROJECT,
        "source": "github-actions",
        "versions": versions,
        "releases": releases,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Exported {len(releases)} releases -> {OUTPUT}")


if __name__ == "__main__":
    main()
