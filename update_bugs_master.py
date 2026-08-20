"""
Master updater for all Bug-type tickets in the BIIH Jira project.
Re-run this script whenever the user asks to update the bugs document.

Output: BIIH_Bugs_Master.md
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

MCP_JSON = Path.home() / ".cursor" / "mcp.json"
OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_MD = OUTPUT_DIR / "BIIH_Bugs_Master.md"
PROJECT_KEY = "BIIH"
ISSUE_TYPE = "Bug"
ACCEPTANCE_CRITERIA_FIELD = "customfield_15048"
JQL = f'project = {PROJECT_KEY} AND issuetype = "{ISSUE_TYPE}" ORDER BY key ASC'


def load_config():
    data = json.loads(MCP_JSON.read_text(encoding="utf-8"))
    env = data["mcpServers"]["mcp-atlassian"]["env"]
    return env["JIRA_URL"].rstrip("/"), env["JIRA_PERSONAL_TOKEN"]


def adf_to_text(node):
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "".join(adf_to_text(n) for n in node)
    if not isinstance(node, dict):
        return str(node)

    node_type = node.get("type")
    content = node.get("content", [])

    if node_type == "text":
        return node.get("text", "")
    if node_type == "hardBreak":
        return "\n"
    if node_type == "paragraph":
        return adf_to_text(content) + "\n"
    if node_type == "heading":
        level = node.get("attrs", {}).get("level", 1)
        return ("#" * level) + " " + adf_to_text(content).strip() + "\n"
    if node_type == "bulletList":
        lines = []
        for item in content:
            if item.get("type") == "listItem":
                text = adf_to_text(item.get("content", [])).strip()
                for line in text.splitlines():
                    lines.append(f"- {line}" if line else "-")
        return "\n".join(lines) + ("\n" if lines else "")
    if node_type == "orderedList":
        lines = []
        start = node.get("attrs", {}).get("order", 1)
        idx = start
        for item in content:
            if item.get("type") == "listItem":
                text = adf_to_text(item.get("content", [])).strip()
                for line in text.splitlines():
                    lines.append(f"{idx}. {line}" if line else f"{idx}.")
                    idx += 1
        return "\n".join(lines) + ("\n" if lines else "")
    if node_type in ("doc", "listItem", "table", "tableRow", "tableCell", "mediaSingle"):
        return adf_to_text(content)
    return adf_to_text(content)


def field_to_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        if value.get("type") == "doc":
            return adf_to_text(value).strip()
        if "content" in value and isinstance(value["content"], list):
            return adf_to_text(value).strip()
        if "name" in value:
            return value.get("name", "")
        if "displayName" in value:
            return value.get("displayName", "")
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def extract_acceptance_criteria_from_description(description_text):
    if not description_text:
        return "Not Found"
    pattern = (
        r"(?ims)(?:^|\n)\s*(?:#{1,6}\s*)?"
        r"(Acceptance Criteria|AC|Requirements|Success Criteria)\s*:?\s*\n"
        r"(.*?)(?=\n\s*(?:#{1,6}\s*)?[A-Z][A-Za-z /_-]{2,}\s*:?\s*\n|\Z)"
    )
    match = re.search(pattern, description_text)
    return match.group(2).strip() if match else "Not Found"


def search_bug_keys(base_url, token):
    url = f"{base_url}/rest/api/2/search"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    keys = []
    start_at = 0
    max_results = 100

    while True:
        params = {
            "jql": JQL,
            "startAt": start_at,
            "maxResults": max_results,
            "fields": "key",
        }
        response = requests.get(url, headers=headers, params=params, timeout=60)
        response.raise_for_status()
        payload = response.json()
        issues = payload.get("issues", [])
        keys.extend(issue["key"] for issue in issues)
        if start_at + len(issues) >= payload.get("total", 0):
            break
        start_at += len(issues)

    return keys


def fetch_issue(base_url, token, issue_key):
    url = f"{base_url}/rest/api/2/issue/{issue_key}"
    params = {"expand": "renderedFields"}
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    response = requests.get(url, headers=headers, params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def parse_issue(base_url, issue_key, issue):
    fields = issue.get("fields", {})

    summary = field_to_text(fields.get("summary")) or "Not Found"
    description = field_to_text(fields.get("description")) or "Not Found"
    rendered = issue.get("renderedFields", {})
    if description == "Not Found" and rendered.get("description"):
        description = re.sub(r"<[^>]+>", "", rendered["description"]).strip() or "Not Found"

    acceptance = field_to_text(fields.get(ACCEPTANCE_CRITERIA_FIELD))
    if not acceptance:
        acceptance = extract_acceptance_criteria_from_description(description)
    if not acceptance:
        acceptance = "Not Found"

    labels = fields.get("labels") or []
    labels_text = ", ".join(labels) if labels else "None"

    return {
        "key": issue_key,
        "summary": summary,
        "description": description,
        "acceptance": acceptance,
        "type": (fields.get("issuetype") or {}).get("name") or "Not Found",
        "priority": (fields.get("priority") or {}).get("name") or "Not Found",
        "labels": labels_text,
        "status": (fields.get("status") or {}).get("name") or "Not Found",
        "created": field_to_text(fields.get("created")) or "Not Found",
        "updated": field_to_text(fields.get("updated")) or "Not Found",
        "reporter": field_to_text(fields.get("reporter")) or "Not Found",
        "assignee": field_to_text(fields.get("assignee")) or "Unassigned",
        "components": ", ".join(c.get("name", "") for c in (fields.get("components") or [])) or "None",
        "fix_versions": ", ".join(v.get("name", "") for v in (fields.get("fixVersions") or [])) or "None",
        "url": f"{base_url}/browse/{issue_key}",
    }


def format_markdown(issues, updated_at, failed):
    lines = [
        "# BIIH Bug Tickets Master Document",
        "",
        f"> **Last updated:** {updated_at}",
        f"> **Project:** {PROJECT_KEY}",
        f"> **Issue type:** {ISSUE_TYPE}",
        f"> **Total bugs fetched:** {len(issues)}",
        "",
        "This is the master reference document for all Bug-type tickets in the BIIH project.",
        "Ask to **update the bugs document** to refresh this file from Jira.",
        "",
        "---",
        "",
        "## Index",
        "",
        "| Ticket ID | Title | Status | Priority | Labels |",
        "|-----------|-------|--------|----------|--------|",
    ]

    for issue in issues:
        title = issue["summary"].replace("|", "\\|")
        lines.append(
            f"| [{issue['key']}](#{issue['key'].lower()}) | {title} | {issue['status']} | {issue['priority']} | {issue['labels']} |"
        )

    lines.extend(["", "---", ""])

    for issue in issues:
        lines.extend(
            [
                f"## {issue['key']}",
                "",
                f"**Jira URL:** {issue['url']}",
                "",
                "### Title",
                issue["summary"],
                "",
                "### Summary",
                issue["summary"],
                "",
                "### Description",
                issue["description"],
                "",
                "### Acceptance Criteria",
                issue["acceptance"],
                "",
                "### Metadata",
                f"- Type: {issue['type']}",
                f"- Priority: {issue['priority']}",
                f"- Labels: {issue['labels']}",
                f"- Status: {issue['status']}",
                f"- Created: {issue['created']}",
                f"- Updated: {issue['updated']}",
                f"- Reporter: {issue['reporter']}",
                f"- Assignee: {issue['assignee']}",
                f"- Components: {issue['components']}",
                f"- Fix Version/s: {issue['fix_versions']}",
                "",
                "---",
                "",
            ]
        )

    lines.extend(["## Missing or Inaccessible Tickets", ""])
    if failed:
        for item in failed:
            lines.append(f"- {item}")
    else:
        lines.append("- None")

    return "\n".join(lines)


def main():
    base_url, token = load_config()
    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    print(f"Searching bugs with JQL: {JQL}")
    keys = search_bug_keys(base_url, token)
    print(f"Found {len(keys)} bug tickets")

    issues = []
    failed = []

    for issue_key in keys:
        try:
            issue = fetch_issue(base_url, token, issue_key)
            issues.append(parse_issue(base_url, issue_key, issue))
            print(f"Fetched {issue_key}")
        except requests.RequestException as exc:
            failed.append(f"{issue_key} ({exc})")
            print(f"Failed {issue_key}: {exc}")

    markdown = format_markdown(issues, updated_at, failed)
    OUTPUT_MD.write_text(markdown, encoding="utf-8")
    print(str(OUTPUT_MD))
    print(f"Written {len(issues)} bugs to master document")


if __name__ == "__main__":
    main()
