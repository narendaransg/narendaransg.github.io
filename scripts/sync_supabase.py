#!/usr/bin/env python3
"""Pull published portfolio drafts from Supabase and merge into repo JSON files."""
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


def merge_by_id(existing_items: list, rows: list) -> list:
    merged = []
    index_by_id = {}
    for item in existing_items:
        if isinstance(item, dict):
            copied = dict(item)
            idx = len(merged)
            merged.append(copied)
            if copied.get("id"):
                index_by_id[str(copied["id"])] = idx

    for r in rows:
        if not r.get("published", True):
            continue
        payload = r.get("payload", r)
        if not isinstance(payload, dict):
            continue
        item_id = str(payload.get("id") or r.get("id") or "").strip()
        if payload.get("_delete") is True:
            if item_id and item_id in index_by_id:
                merged[index_by_id[item_id]] = None
            continue
        if item_id and item_id in index_by_id:
            merged[index_by_id[item_id]] = payload
        else:
            idx = len(merged)
            merged.append(payload)
            if item_id:
                index_by_id[item_id] = idx

    return [x for x in merged if x is not None]


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
        "_readme": existing_content.get("_readme", "Merged from Supabase drafts via scripts/sync_supabase.py"),
        "projects": merge_by_id(existing_content.get("projects", []), projects),
        "certifications": merge_by_id(existing_content.get("certifications", []), certs),
        "experience": merge_by_id(existing_content.get("experience", []), experience),
    }
    content_path.write_text(json.dumps(content_out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    updates_path = ROOT / "updates.json"
    existing_updates = json.loads(updates_path.read_text(encoding="utf-8"))
    merged_updates = merge_by_id(existing_updates.get("updates", []), updates_rows)
    clean_updates = []
    for item in merged_updates:
        copied = dict(item)
        if copied.get("linkedin") is True and not str(copied.get("title", "")).strip():
            copied["linkedin"] = False
        clean_updates.append(copied)

    updates_out = {
        "_howto": existing_updates.get("_howto", "Merged from Supabase drafts."),
        "updates": clean_updates,
    }
    updates_path.write_text(json.dumps(updates_out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    subprocess.run([sys.executable, "scripts/build_content.py", "--check"], cwd=ROOT, check=True)
    subprocess.run([sys.executable, "scripts/build_content.py"], cwd=ROOT, check=True)
    print("Merged Supabase drafts into content.json, updates.json, and index.html.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
