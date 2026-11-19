#!/usr/bin/env python3
"""Pull published portfolio drafts from Supabase and sync repo JSON/JS files."""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fetch_table(base_url: str, key: str, table: str) -> list:
    url = f"{base_url.rstrip('/')}/rest/v1/{table}?select=*&order=sort_order.asc,created_at.asc"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed fetching Supabase table '{table}': {exc}") from exc


def main() -> int:
    url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        print("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; skipping Supabase sync.")
        return 0

    projects = fetch_table(url, key, "portfolio_projects")
    certs = fetch_table(url, key, "portfolio_certifications")
    experience = fetch_table(url, key, "portfolio_experience")
    updates_rows = fetch_table(url, key, "portfolio_updates")

    content_path = ROOT / "content.json"
    existing_content = json.loads(content_path.read_text(encoding="utf-8"))
    content_out = {
        "_readme": existing_content.get("_readme", "Synced from Supabase drafts via scripts/sync_supabase.py"),
        "projects": [r.get("payload", r) for r in projects if r.get("published", True)],
        "certifications": [r.get("payload", r) for r in certs if r.get("published", True)],
        "experience": [r.get("payload", r) for r in experience if r.get("published", True)],
    }
    content_path.write_text(json.dumps(content_out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    updates_path = ROOT / "updates.json"
    existing_updates = json.loads(updates_path.read_text(encoding="utf-8"))
    clean_updates = []
    for r in updates_rows:
        if not r.get("published", True):
            continue
        item = dict(r.get("payload", r))
        # Safety gate: never auto-post to LinkedIn unless explicitly flagged and non-empty
        if item.get("linkedin") is True and not str(item.get("title", "")).strip():
            item["linkedin"] = False
        clean_updates.append(item)

    updates_out = {
        "_howto": existing_updates.get("_howto", "Synced from Supabase drafts."),
        "updates": clean_updates,
    }
    updates_path.write_text(json.dumps(updates_out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    subprocess.run([sys.executable, "scripts/build_content.py", "--check"], cwd=ROOT, check=True)
    subprocess.run([sys.executable, "scripts/build_content.py"], cwd=ROOT, check=True)
    print("Synced Supabase drafts into content.json, updates.json, and index.html.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
