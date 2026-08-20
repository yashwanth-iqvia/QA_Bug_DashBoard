import json
import re
import sys
from pathlib import Path

import requests

MCP_JSON = Path.home() / ".cursor" / "mcp.json"
ISSUE_KEY = sys.argv[1] if len(sys.argv) > 1 else "BIIH-61"


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
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def extract_acceptance_criteria(description_text):
    if not description_text:
        return "Not Found"

    patterns = [
        r"(?ims)(?:^|\n)\s*(?:#{1,6}\s*)?(Acceptance Criteria|AC|Requirements|Success Criteria)\s*:?\s*\n(.*?)(?=\n\s*(?:#{1,6}\s*)?[A-Z][A-Za-z /_-]{2,}\s*:?\s*\n|\Z)",
    ]
    for pattern in patterns:
        match = re.search(pattern, description_text)
        if match:
            return match.group(2).strip()
    return "Not Found"


def main():
    base_url, token = load_config()
    url = f"{base_url}/rest/api/2/issue/{ISSUE_KEY}"
    params = {"expand": "renderedFields,names"}
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    response = requests.get(url, headers=headers, params=params, timeout=60)
    response.raise_for_status()
    issue = response.json()
    fields = issue.get("fields", {})

    summary = field_to_text(fields.get("summary")) or "Not Found"
    description = field_to_text(fields.get("description")) or "Not Found"
    rendered = issue.get("renderedFields", {})
    if description == "Not Found" and rendered.get("description"):
        description = re.sub(r"<[^>]+>", "", rendered["description"]).strip() or "Not Found"

    acceptance = extract_acceptance_criteria(description)
    issue_type = (fields.get("issuetype") or {}).get("name") or "Not Found"
    priority = (fields.get("priority") or {}).get("name") or "Not Found"
    labels = fields.get("labels") or []
    labels_text = ", ".join(labels) if labels else "None"

    print("# Jira Ticket Details")
    print()
    print("## Title")
    print(summary)
    print()
    print("## Summary")
    print(summary)
    print()
    print("## Description")
    print(description)
    print()
    print("## Acceptance Criteria")
    print(acceptance)
    print()
    print("## Metadata")
    print(f"- Type: {issue_type}")
    print(f"- Priority: {priority}")
    print(f"- Labels: {labels_text}")


if __name__ == "__main__":
    main()
