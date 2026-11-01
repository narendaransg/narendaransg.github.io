#!/usr/bin/env python3
"""Render content.json into index.html.

Writes the project, certification and experience cards between the
<!-- content:NAME:start --> / <!-- content:NAME:end --> markers in index.html,
and keeps the project counts ("All (9)", "View All 9 Chronicles") in sync.

Usage:  python3 scripts/build_content.py [--check]
        --check  only validate content.json and report problems; don't write

Standard library only (Python 3.8+). The GitHub Action runs this on every push,
and the portfolio editor app calls build() after each save.
"""
import html
import json
import re
import sys
from pathlib import Path

ACCENTS = {"gold": "m5", "emerald": "m3", "bright": "m6", "amber": "m8"}
CATEGORIES = {"pd": "Physical Design", "rtl": "RTL & Verification", "dft": "DFT & Synthesis", "ic": "IC Hardware"}
LINK_KINDS = ("image", "url", "qor")
QOR_BLOCKS = ("gprs", "fifo")

GITHUB_ICON = ('<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" '
               'd="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>')
CHIP_ICON = ('<svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" '
             'd="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>')


def esc(text):
    return html.escape(str(text or ""), quote=True)


def rich(text):
    """Escape text, then apply the two allowed bits of markup: `code` and **bold**."""
    out = esc(text)
    out = re.sub(r"`([^`]+)`", r'<code class="code-chip">\1</code>', out)
    out = re.sub(r"\*\*(.+?)\*\*", r'<strong class="text-white">\1</strong>', out)
    return out


def js_call(fn, *args):
    """An onclick="..." value calling fn with string arguments, safely escaped."""
    return esc(f"{fn}({', '.join(json.dumps(str(a)) for a in args)})")


def acc(name, default="gold"):
    return ACCENTS.get(name or default, ACCENTS[default])


# --------------------------------------------------------------------------- render

def render_project(p, i):
    a = acc(p.get("accent"))
    out = [f'          <!-- {i}. {esc(p.get("title"))[:80]} -->',
           f'          <article data-category="{esc(p.get("category", "pd"))}" data-id="{esc(p.get("id"))}" class="project-card rounded-xl p-5 sm:p-6 eda-border flex flex-col justify-between">',
           '            <div class="space-y-3.5">',
           '              <div class="flex items-center justify-between gap-2 font-mono text-xs">',
           f'                <span class="px-2.5 py-0.5 rounded bg-silicon-800 text-metal-{a} border border-metal-{a}/40 font-semibold">{esc(p.get("tag"))}</span>',
           f'                <span class="text-slate-400 shrink-0">{esc(p.get("date"))}</span>',
           '              </div>',
           f'              <h3 class="text-lg font-bold text-white">{rich(p.get("title"))}</h3>',
           '              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">',
           f'                {rich(p.get("summary"))}',
           '              </p>']
    bullets = [b for b in p.get("bullets") or [] if (b.get("label") or b.get("text"))]
    if bullets:
        out.append('              <ul class="text-xs font-mono text-slate-300 space-y-1 border-t border-slate-800 pt-3">')
        for b in bullets:
            label = f'<span class="text-metal-{acc(b.get("accent"), p.get("accent") or "gold")} font-semibold">{esc(b.get("label"))}:</span> ' if b.get("label") else ""
            out.append(f'                <li>&bull; {label}{rich(b.get("text"))}</li>')
        out.append('              </ul>')
    out.append('            </div>')

    items = []
    for n, l in enumerate(p.get("links") or []):
        kind, label, target = l.get("kind"), esc(l.get("label")), l.get("target", "")
        cls = f"text-metal-{a} font-semibold hover:underline" if n == 0 else "text-slate-400 hover:text-white"
        if kind == "image":
            items.append(f'<button type="button" onclick="{js_call("openLightbox", target, l.get("caption") or l.get("label"))}" class="{cls}">{label} &rarr;</button>')
        elif kind == "qor":
            items.append(f'<button type="button" onclick="switchPageView(\'qor\', event); switchQorBlock({esc(json.dumps(target))});" class="{cls}">{label} &nearr;</button>')
        elif kind == "url":
            icon = GITHUB_ICON if "github.com" in target else CHIP_ICON
            items.append(f'<a href="{esc(target)}" target="_blank" rel="noopener" class="{cls} flex items-center gap-1.5">{icon}<span>{label} &nearr;</span></a>')
    if p.get("tools"):
        items.append(f'<span class="text-slate-400">{rich(p["tools"])}</span>')
    badge = p.get("badge") or {}
    if badge.get("text"):
        items.append(f'<span class="text-metal-{acc(badge.get("accent"))} font-semibold">{rich(badge["text"])}</span>')
    if items:
        out.append('            <div class="pt-4 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">')
        out += [f"              {it}" for it in items]
        out.append('            </div>')
    out.append('          </article>')
    return "\n".join(out)


def render_cert(c):
    a = acc(c.get("accent"))
    out = [f'        <div class="rounded-xl p-5 eda-border flex flex-col justify-between" data-id="{esc(c.get("id"))}">',
           '          <div class="space-y-3">',
           f'            <div class="flex items-center justify-between gap-2 font-mono text-xs text-metal-{a} font-semibold">',
           f'              <span>{esc(c.get("issuer"))}</span>',
           f'              <span class="shrink-0">{esc(c.get("date"))}</span>',
           '            </div>',
           f'            <h3 class="text-lg font-bold text-white">{rich(c.get("title"))}</h3>',
           '            <p class="text-xs text-slate-300 leading-relaxed">',
           f'              {rich(c.get("description"))}',
           '            </p>',
           '          </div>']
    if c.get("image"):
        out += [f'          <button type="button" onclick="{js_call("openLightbox", c["image"], c.get("caption") or c.get("title"))}" class="mt-4 w-full py-2 rounded bg-silicon-800 hover:opacity-90 font-mono text-xs text-metal-{a} font-semibold border border-metal-{a}/40 transition">',
                '            View My Certificate &rarr;',
                '          </button>']
    elif c.get("link"):
        out += [f'          <a href="{esc(c["link"])}" target="_blank" rel="noopener" class="mt-4 w-full py-2 rounded bg-silicon-800 hover:opacity-90 font-mono text-xs text-center text-metal-{a} font-semibold border border-metal-{a}/40 transition">',
                '            Verify Credential &nearr;',
                '          </a>']
    out.append('        </div>')
    return "\n".join(out)


def render_experience(e):
    a = acc(e.get("accent"))
    return "\n".join([
        f'        <div class="p-5 rounded-xl eda-border space-y-2" data-id="{esc(e.get("id"))}">',
        f'          <div class="text-xs font-mono text-metal-{a} font-semibold">{esc(e.get("label"))}</div>',
        f'          <h4 class="font-bold text-white">{rich(e.get("title"))}</h4>',
        '          <p class="text-xs text-slate-300 leading-relaxed">',
        f'            {rich(e.get("description"))}',
        '          </p>',
        '        </div>'])


# --------------------------------------------------------------------------- validate

def validate(data, repo):
    problems = []
    ids = set()

    def need(item, where, *fields):
        for f in fields:
            if not str(item.get(f) or "").strip():
                problems.append(f"{where}: '{f}' is empty")

    def check_id(item, where):
        i = item.get("id")
        if not i:
            problems.append(f"{where}: missing id")
        elif i in ids:
            problems.append(f"{where}: duplicate id '{i}'")
        ids.add(i)

    def check_file(path, where):
        if path and not path.startswith(("http://", "https://")) and not (repo / path).is_file():
            problems.append(f"{where}: file not found: {path}")

    def check_accent(v, where):
        if v and v not in ACCENTS:
            problems.append(f"{where}: unknown accent '{v}' (use {', '.join(ACCENTS)})")

    for n, p in enumerate(data.get("projects", []), 1):
        w = f"project {n} ({p.get('title') or p.get('id') or '?'})"
        check_id(p, w)
        need(p, w, "title", "summary", "tag", "category")
        if p.get("category") and p["category"] not in CATEGORIES:
            problems.append(f"{w}: unknown category '{p['category']}' (use {', '.join(CATEGORIES)})")
        check_accent(p.get("accent"), w)
        for l in p.get("links") or []:
            if l.get("kind") not in LINK_KINDS:
                problems.append(f"{w}: link kind must be one of {', '.join(LINK_KINDS)}")
            elif l["kind"] == "image":
                check_file(l.get("target"), w)
            elif l["kind"] == "qor" and l.get("target") not in QOR_BLOCKS:
                problems.append(f"{w}: QoR link target must be 'gprs' or 'fifo'")
            elif l["kind"] == "url" and not str(l.get("target", "")).startswith(("http://", "https://")):
                problems.append(f"{w}: link URL must start with https://")
            if not l.get("label"):
                problems.append(f"{w}: a link has no label")
    for n, c in enumerate(data.get("certifications", []), 1):
        w = f"certification {n} ({c.get('title') or '?'})"
        check_id(c, w)
        need(c, w, "title", "issuer")
        check_accent(c.get("accent"), w)
        check_file(c.get("image"), w)
    for n, e in enumerate(data.get("experience", []), 1):
        w = f"experience {n} ({e.get('title') or '?'})"
        check_id(e, w)
        need(e, w, "title", "label")
        check_accent(e.get("accent"), w)
    return problems


# --------------------------------------------------------------------------- build

def replace_block(page, name, body):
    pat = re.compile(rf"(<!-- content:{name}:start -->)(.*?)(\n[ \t]*<!-- content:{name}:end -->)", re.S)
    if not pat.search(page):
        raise SystemExit(f"index.html is missing the <!-- content:{name}:start/end --> markers")
    return pat.sub(lambda m: m.group(1) + "\n" + body + m.group(3), page, count=1)


def build(repo=None, write=True):
    """Render content.json into index.html. Returns (changed, problems)."""
    repo = Path(repo or Path(__file__).resolve().parent.parent)
    data = json.loads((repo / "content.json").read_text(encoding="utf-8"))
    problems = validate(data, repo)
    page_path = repo / "index.html"
    page = page_path.read_text(encoding="utf-8")
    projects = data.get("projects", [])
    new = replace_block(page, "projects", "\n\n".join(render_project(p, i) for i, p in enumerate(projects, 1)))
    new = replace_block(new, "certifications", "\n\n".join(render_cert(c) for c in data.get("certifications", [])))
    new = replace_block(new, "experience", "\n\n".join(render_experience(e) for e in data.get("experience", [])))
    n = len(projects)
    new = re.sub(r'(data-filter="all"[^>]*>)All \(\d+\)', rf"\g<1>All ({n})", new)
    new = re.sub(r"View All \d+ Chronicles", f"View All {n} Chronicles", new)
    changed = new != page
    if write and changed:
        page_path.write_text(new, encoding="utf-8")
    return changed, problems


if __name__ == "__main__":
    check_only = "--check" in sys.argv
    changed, problems = build(write=not check_only)
    for p in problems:
        print("WARNING:", p)
    if check_only:
        print("content.json OK" if not problems else f"{len(problems)} problem(s) found")
        sys.exit(1 if problems else 0)
    print("index.html updated" if changed else "index.html already up to date")
