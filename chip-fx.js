/**
 * chip-fx.js — chip-themed motion layer (load last).
 *
 *   1. Scan-chain wipe ....... tab switches from the nav bar / menu / command palette
 *   2. Wafer-to-die zoom ..... opening a view from a card or button inside the page
 *   3. RTL-to-GDSII build-up . faint layout that "implements" itself behind the hero on load
 *   4. Manhattan route draw .. traces route along section dividers when they come into view
 *   5. Clock H-tree pulse .... a clock edge reaches all four stat cards at once (zero skew)
 *   6. Via-drop ripple ....... clicks on buttons and cards drop a via
 *   7. Staggered entrances ... cards settle in one after another when a view opens
 *   8. Count-up numbers ...... key figures tick up the first time they appear
 *   9. Flow playback ......... scroll-scrubbed floorplan -> route sequence on the Physical Design tab
 *  10. Layout magnifier ...... hover lens over layout screenshots
 *  11. Inverter theme toggle . the theme button is a CMOS inverter with a visible propagation delay
 *  12. Clock scroll bar ...... a square-wave progress bar under the header
 *
 * Visitors with "reduce motion" turned on get instant view changes and static final frames.
 */
(function initChipFx() {
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const still = () => RM.matches;
  const light = () => document.documentElement.classList.contains('light-theme');
  const col = () => light()
    ? { gold: '#9A6B13', emerald: '#047857', amber: '#B45309', dim: '#DCD3C2', via: '#FFFFFF' }
    : { gold: '#F5B041', emerald: '#10B981', amber: '#F59E0B', dim: '#2A2B33', via: '#FFFFFF' };
  const pageBg = () => getComputedStyle(document.body).backgroundColor || '#070709';
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const MONO = '"JetBrains Mono", monospace';
  const VIEW_NAMES = { home: 'overview', qor: 'physical_design', lab: 'interactive_lab', projects: 'chronicles', credentials: 'credentials' };

  // ---------------------------------------------------------------------------
  // Shared full-screen overlay canvas (pointer-events: none). Runs only while
  // an effect is active.
  // ---------------------------------------------------------------------------
  const ov = document.createElement('canvas');
  ov.id = 'chip-fx-overlay';
  ov.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ov);
  const ox = ov.getContext('2d');
  let OW = 0, OH = 0;
  function sizeOverlay() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    OW = window.innerWidth;
    OH = window.innerHeight;
    ov.width = OW * dpr;
    ov.height = OH * dpr;
    ox.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeOverlay();
  window.addEventListener('resize', sizeOverlay);

  // Run cb once the page has loaded and the one-time boot intro (silicon-addons.js) has gone
  function afterBoot(cb) {
    const go = () => {
      const boot = document.getElementById('silicon-boot-overlay');
      if (!boot) return cb();
      const mo = new MutationObserver(() => {
        if (!document.getElementById('silicon-boot-overlay')) { mo.disconnect(); cb(); }
      });
      mo.observe(document.body, { childList: true });
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }

  const jobs = new Set();
  let raf = null;
  function addJob(fn) {
    jobs.add(fn);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    ox.clearRect(0, 0, OW, OH);
    jobs.forEach(fn => { if (fn(now) === false) jobs.delete(fn); });
    if (jobs.size) raf = requestAnimationFrame(tick);
    else { ox.clearRect(0, 0, OW, OH); raf = null; }
  }

  // ---------------------------------------------------------------------------
  // 1 + 2. View transitions (scan-chain wipe / wafer-to-die zoom)
  // ---------------------------------------------------------------------------
  const tr = { busy: false, swapped: false, target: null };

  function caption(text, c) {
    ox.save();
    ox.font = '12px ' + MONO;
    ox.textAlign = 'center';
    ox.fillStyle = c.gold;
    ox.fillText(text, OW / 2, OH / 2);
    ox.restore();
  }

  function drawScan(phase, p, bg, c, label) {
    const rh = 18, rows = Math.ceil(OH / rh), stagger = Math.min(260, OW * 0.25), cw = 12;
    const D = OW + stagger + 3 * cw + 10;
    for (let r = 0; r < rows; r++) {
      const front = ease(p) * D - (r / rows) * stagger;
      const y = r * rh;
      ox.fillStyle = bg;
      if (phase === 'cover') ox.fillRect(0, y, Math.max(0, front), rh);
      else if (phase === 'hold') ox.fillRect(0, y, OW, rh);
      else ox.fillRect(Math.max(0, front), y, OW, rh);
      if (phase === 'hold') continue;
      for (let k = 0; k < 3; k++) {
        const bx = phase === 'cover' ? front + k * cw : front - (k + 1) * cw;
        if (bx < -cw || bx > OW) continue;
        ox.globalAlpha = 0.95 - k * 0.28;
        ox.fillStyle = (r + k + Math.floor(p * 24)) % 2 ? c.gold : c.emerald;
        ox.fillRect(bx + 1, y + 3, cw - 2, rh - 6);
      }
      ox.globalAlpha = 1;
    }
    if (phase === 'hold') caption('SCAN SHIFT  scan_in ▸ ' + label + '  [SE=1]', c);
  }

  function makeWafer(origin) {
    const R = Math.max(56, Math.min(92, OW * 0.16));
    const d = R / 4.2;
    const cx = clamp(origin[0], R + 8, OW - R - 8);
    const cy = clamp(origin[1], R + 8, OH - R - 8);
    const dies = [];
    for (let i = -5; i <= 4; i++) {
      for (let j = -5; j <= 4; j++) {
        const x = cx + i * d, y = cy + j * d;
        if (Math.hypot(x + d / 2 - cx, y + d / 2 - cy) <= R - d * 0.55) dies.push({ x, y, sel: i === 0 && j === -1, hue: (i * 7 + j * 3) % 5 });
      }
    }
    return { R, d, cx, cy, dies, sel: dies.find(q => q.sel) || dies[0] };
  }

  function drawZoom(phase, p, bg, c, w, label) {
    if (phase === 'cover') {
      const a = clamp(p / 0.4), z = clamp((p - 0.35) / 0.65), ez = ease(z);
      const s = 0.7 + 0.3 * ease(a);
      ox.save();
      ox.globalAlpha = a * (1 - ez);
      ox.translate(w.cx, w.cy);
      ox.scale(s, s);
      ox.translate(-w.cx, -w.cy);
      ox.fillStyle = bg;
      ox.beginPath(); ox.arc(w.cx, w.cy, w.R + 6, 0, Math.PI * 2); ox.fill();
      ox.strokeStyle = c.gold; ox.lineWidth = 1.5;
      ox.beginPath(); ox.arc(w.cx, w.cy, w.R, 0, Math.PI * 2); ox.stroke();
      w.dies.forEach(q => {
        ox.globalAlpha = a * (1 - ez) * (q.sel ? 1 : 0.55);
        ox.fillStyle = q.sel ? c.gold : (q.hue ? c.emerald : c.amber);
        ox.fillRect(q.x + 1, q.y + 1, w.d - 2, w.d - 2);
      });
      ox.restore();
      if (z > 0) {
        const q = w.sel;
        const X = q.x + (0 - q.x) * ez, Y = q.y + (0 - q.y) * ez;
        const Wd = (w.d - 2) + (OW - (w.d - 2)) * ez, Hd = (w.d - 2) + (OH - (w.d - 2)) * ez;
        ox.fillStyle = bg;
        ox.fillRect(X, Y, Wd, Hd);
        ox.strokeStyle = c.gold; ox.lineWidth = 2;
        ox.strokeRect(X + 1, Y + 1, Wd - 2, Hd - 2);
      }
    } else if (phase === 'hold') {
      ox.fillStyle = bg; ox.fillRect(0, 0, OW, OH);
      ox.strokeStyle = c.gold; ox.lineWidth = 2; ox.strokeRect(1, 1, OW - 2, OH - 2);
      caption('DIE  ' + label + '  ▸ opening', c);
    } else {
      ox.globalAlpha = 1 - ease(p);
      ox.fillStyle = bg; ox.fillRect(0, 0, OW, OH);
      ox.strokeStyle = c.gold; ox.lineWidth = 2; ox.strokeRect(1, 1, OW - 2, OH - 2);
      ox.globalAlpha = 1;
    }
  }

  function runTransition(kind, origin, inner) {
    tr.busy = true;
    tr.swapped = false;
    const bg = pageBg(), c = col();
    const COVER = kind === 'zoom' ? 440 : 340, HOLD = 230, REVEAL = kind === 'zoom' ? 300 : 340;
    const wafer = kind === 'zoom' ? makeWafer(origin) : null;
    const t0 = performance.now();
    addJob(now => {
      const t = now - t0;
      if (!tr.swapped && t >= COVER) {
        tr.swapped = true;
        inner(tr.target, null);
      }
      const label = 'view_' + (VIEW_NAMES[tr.target] || tr.target);
      let phase, p;
      if (t < COVER) { phase = 'cover'; p = t / COVER; }
      else if (t < COVER + HOLD) { phase = 'hold'; p = 1; }
      else { phase = 'reveal'; p = clamp((t - COVER - HOLD) / REVEAL); }
      if (kind === 'zoom') drawZoom(phase, p, bg, c, wafer, label);
      else drawScan(phase, p, bg, c, label);
      if (t >= COVER + HOLD + REVEAL) { tr.busy = false; return false; }
      return true;
    });
  }

  function hookViewTransitions() {
    const inner = window.switchPageView;
    if (typeof inner !== 'function') return;
    window.chipFxHandlesTransitions = true;
    const callInner = (key, evt) => inner.call(window, key, evt);
    window.switchPageView = function (viewKey, evt) {
      const target = document.getElementById('view-' + viewKey);
      const active = document.querySelector('.app-view.active-view');
      if (still() || !target || (active === target && !tr.busy)) return callInner(viewKey, evt);
      // Highlight the nav tab straight away; the view itself swaps mid-transition
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.toggle('active-nav', b.getAttribute('data-view') === viewKey));
      if (tr.busy) {
        if (tr.swapped) callInner(viewKey, null);
        else tr.target = viewKey;
        return;
      }
      tr.target = viewKey;
      const el = evt && evt.target && evt.target.closest ? evt.target : null;
      const fromChrome = el && el.closest('header, nav, .nav-tab-btn, #mobile-nav-drawer');
      const kind = el && !fromChrome && typeof evt.clientX === 'number' && evt.clientX > 0 ? 'zoom' : 'scan';
      runTransition(kind, kind === 'zoom' ? [evt.clientX, evt.clientY] : null, callInner);
    };
  }

  // ---------------------------------------------------------------------------
  // 3. RTL-to-GDSII build-up behind the hero
  // ---------------------------------------------------------------------------
  function initBuildUp() {
    const host = document.getElementById('hero-grid');
    if (!host) return;
    host.classList.add('fx-host');
    const cv = document.createElement('canvas');
    cv.className = 'hero-build-canvas';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    const x = cv.getContext('2d');
    const flow = document.getElementById('flow-stage');
    const STAGES = ['FLOORPLAN', 'PLACE MACROS', 'PLACE CELLS', 'CTS', 'ROUTE'];
    const DUR = 3600;
    let W = 0, H = 0, geo = null, progress = 0, lastStage = -1;

    function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

    function layout() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const die = { x: 6, y: 6, w: W - 12, h: H - 12 };
      const core = { x: 22, y: 22, w: W - 44, h: H - 44 };
      const mw = Math.min(150, core.w * 0.13), mh = Math.min(110, core.h * 0.2);
      const macros = [
        { x: core.x + 10, y: core.y + 10, w: mw, h: mh },
        { x: core.x + 10, y: core.y + core.h - mh - 10, w: mw, h: mh },
        { x: core.x + core.w - mw - 10, y: core.y + 10, w: mw, h: mh },
        { x: core.x + core.w - mw - 10, y: core.y + core.h - mh - 10, w: mw, h: mh },
      ];
      const rows = [];
      for (let y = core.y + 12; y < core.y + core.h - 8; y += 16) rows.push(y);
      const rand = rng(1301);
      const wires = [];
      for (let i = 0; i < 70; i++) {
        const sx = core.x + rand() * core.w, sy = core.y + rand() * core.h;
        const len1 = (rand() - 0.5) * core.w * 0.35, len2 = (rand() - 0.5) * core.h * 0.4;
        wires.push({ pts: [[sx, sy], [sx + len1, sy], [sx + len1, sy + len2]], layer: i % 3 });
      }
      geo = { die, core, macros, rows, wires, rowX0: core.x + mw + 24, rowX1: core.x + core.w - mw - 24 };
    }

    function polyPartial(pts, f) {
      let total = 0;
      const seg = [];
      for (let i = 1; i < pts.length; i++) { const l = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
      let rem = f * total;
      x.beginPath();
      x.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length && rem > 0; i++) {
        const u = Math.min(1, rem / (seg[i - 1] || 1));
        x.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u);
        rem -= seg[i - 1];
      }
      x.stroke();
    }

    function hTree(cx, cy, w, h, depth, f, c) {
      // f: 0..1 progress across all levels
      const levels = 4;
      (function rec(px, py, ww, hh, d) {
        if (d >= levels) return;
        const local = clamp(f * levels - d);
        if (local <= 0) return;
        const horiz = d % 2 === 0;
        const a = horiz ? [px - ww, py] : [px, py - hh];
        const b = horiz ? [px + ww, py] : [px, py + hh];
        x.strokeStyle = c.amber;
        x.beginPath();
        x.moveTo(px, py); x.lineTo(px + (a[0] - px) * local, py + (a[1] - py) * local);
        x.moveTo(px, py); x.lineTo(px + (b[0] - px) * local, py + (b[1] - py) * local);
        x.stroke();
        if (local >= 1) {
          rec(a[0], a[1], horiz ? ww : ww / 2, horiz ? hh / 2 : hh, d + 1);
          rec(b[0], b[1], horiz ? ww : ww / 2, horiz ? hh / 2 : hh, d + 1);
        }
      })(cx, cy, w, h, 0);
    }

    function draw(p) {
      if (!geo) return;
      const c = col();
      x.clearRect(0, 0, W, H);
      x.save();
      x.globalAlpha = light() ? 0.32 : 0.26;
      x.lineWidth = 1;
      const s = k => clamp(p - k);
      // Stage 1: die + core boundary
      const f0 = s(0);
      if (f0 > 0) {
        const { die, core } = geo;
        x.strokeStyle = c.gold;
        polyPartial([[die.x, die.y], [die.x + die.w, die.y], [die.x + die.w, die.y + die.h], [die.x, die.y + die.h], [die.x, die.y]], f0);
        x.setLineDash([4, 4]);
        polyPartial([[core.x, core.y], [core.x + core.w, core.y], [core.x + core.w, core.y + core.h], [core.x, core.y + core.h], [core.x, core.y]], f0);
        x.setLineDash([]);
      }
      // Stage 2: hard macros
      const f1 = s(1);
      geo.macros.forEach((m, i) => {
        const a = clamp(f1 * geo.macros.length - i);
        if (a <= 0) return;
        x.fillStyle = c.emerald;
        x.globalAlpha = (light() ? 0.32 : 0.26) * 0.35 * a;
        x.fillRect(m.x, m.y, m.w, m.h);
        x.globalAlpha = (light() ? 0.32 : 0.26) * a;
        x.strokeStyle = c.emerald;
        x.strokeRect(m.x, m.y, m.w, m.h);
      });
      x.globalAlpha = light() ? 0.32 : 0.26;
      // Stage 3: standard-cell rows
      const f2 = s(2);
      const nRows = Math.floor(geo.rows.length * f2);
      x.fillStyle = c.gold;
      for (let i = 0; i < nRows; i++) {
        const y = geo.rows[i];
        x.fillRect(geo.rowX0, y, geo.rowX1 - geo.rowX0, 1);
        for (let cx = geo.rowX0; cx < geo.rowX1; cx += 9 + ((i * 7 + cx) % 13)) x.fillRect(cx, y - 4, 1, 4);
      }
      // Stage 4: clock tree
      const f3 = s(3);
      if (f3 > 0) {
        x.lineWidth = 1.4;
        hTree(geo.core.x + geo.core.w / 2, geo.core.y + geo.core.h / 2, geo.core.w * 0.22, geo.core.h * 0.26, 0, f3, c);
        x.lineWidth = 1;
      }
      // Stage 5: routing
      const f4 = s(4);
      const nW = geo.wires.length * f4;
      geo.wires.forEach((w, i) => {
        const f = clamp(nW - i);
        if (f <= 0) return;
        x.strokeStyle = w.layer === 1 ? c.emerald : c.gold;
        polyPartial(w.pts, f);
        if (f >= 1) { x.fillStyle = c.via; x.fillRect(w.pts[1][0] - 1.5, w.pts[1][1] - 1.5, 3, 3); }
      });
      x.restore();
      const stage = Math.min(4, Math.floor(p));
      if (flow && stage !== lastStage) {
        lastStage = stage;
        flow.textContent = p >= 5 ? 'FLOW: ROUTE ✓' : 'FLOW: ' + STAGES[stage] + '…';
      }
      if (flow && p >= 5) flow.textContent = 'FLOW: ROUTE ✓';
    }

    function finished() {
      window.chipFxBuilt = true;
      document.dispatchEvent(new Event('chipfx:built'));
    }

    function run() {
      layout();
      if (still()) { progress = 5; draw(5); finished(); return; }
      const t0 = performance.now() + 150;
      (function frame(now) {
        progress = clamp((now - t0) / DUR) * 5;
        draw(progress);
        if (progress < 5) requestAnimationFrame(frame);
        else finished();
      })(performance.now());
    }

    window.addEventListener('resize', () => { layout(); draw(progress); });
    new MutationObserver(() => draw(progress)).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    afterBoot(run);
  }

  // ---------------------------------------------------------------------------
  // 4. Manhattan route draw on section dividers
  // ---------------------------------------------------------------------------
  function initRouteDividers() {
    const targets = [];
    document.querySelectorAll('section.app-view').forEach(sec => {
      const h = sec.querySelector('[class*="border-b"][class*="pb-4"]');
      if (h) targets.push({ el: h, top: false });
    });
    document.querySelectorAll('#view-home > [class*="border-t"]').forEach(el => targets.push({ el, top: true }));

    const NS = 'http://www.w3.org/2000/svg';
    function build(wrap) {
      const w = wrap.clientWidth;
      if (!w) return false;
      const j1 = Math.round(w * 0.18), j2 = Math.round(w * 0.46);
      const svg = wrap.querySelector('svg');
      svg.setAttribute('viewBox', `0 0 ${w} 12`);
      const ds = [`M0 11 H${j1}`, `M${j1} 11 V3 H${j2} V11`, `M${j2} 11 H${w}`];
      svg.querySelectorAll('path').forEach((pth, i) => {
        pth.setAttribute('d', ds[i]);
        pth.style.setProperty('--len', Math.ceil(pth.getTotalLength()) + 1);
      });
      const vias = wrap.querySelectorAll('.via');
      vias[0].style.left = j1 + 'px';
      vias[1].style.left = j2 + 'px';
      return true;
    }

    const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(en => {
        const wrap = en.target.querySelector(':scope > .route-trace');
        if (!wrap) return;
        if (en.isIntersecting) {
          if (build(wrap)) { void wrap.offsetWidth; wrap.classList.add('drawn'); }
        } else {
          wrap.classList.remove('drawn');
        }
      });
    }, { threshold: 0.2 }) : null;

    targets.forEach(({ el, top }) => {
      el.classList.add('route-host');
      const wrap = document.createElement('div');
      wrap.className = 'route-trace ' + (top ? 'at-top' : 'at-bottom');
      wrap.setAttribute('aria-hidden', 'true');
      const svg = document.createElementNS(NS, 'svg');
      for (let i = 0; i < 3; i++) {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('class', 'rt rt' + (i + 1));
        svg.appendChild(p);
      }
      wrap.appendChild(svg);
      wrap.insertAdjacentHTML('beforeend', '<i class="via v1"></i><i class="via v2"></i>');
      el.appendChild(wrap);
      if (io) io.observe(el);
      else if (build(wrap)) wrap.classList.add('drawn');
    });
    window.addEventListener('resize', () => document.querySelectorAll('.route-trace.drawn').forEach(build));
  }

  // ---------------------------------------------------------------------------
  // 5. Clock H-tree pulse into the stat cards
  // ---------------------------------------------------------------------------
  function initClockTree() {
    const grid = document.getElementById('stat-grid');
    if (!grid) return;
    grid.classList.add('clk-host');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'clk-tree');
    svg.setAttribute('aria-hidden', 'true');
    grid.appendChild(svg);
    const cards = () => [...grid.children].filter(c => c.classList && c.classList.contains('eda-border'));
    let lastPulse = 0;

    function build() {
      const cs = cards();
      const g = grid.getBoundingClientRect();
      if (cs.length !== 4 || !g.width) { svg.style.display = 'none'; return null; }
      const pts = cs.map(c => { const r = c.getBoundingClientRect(); return [r.left - g.left + r.width / 2, r.top - g.top]; });
      const oneRow = pts.every(p => Math.abs(p[1] - pts[0][1]) < 4);
      if (!oneRow) { svg.style.display = 'none'; return null; }
      svg.style.display = '';
      const W = g.width, top = 22, y1 = 6, y2 = 14;
      svg.setAttribute('viewBox', `0 0 ${W} ${top}`);
      const m1 = (pts[0][0] + pts[1][0]) / 2, m2 = (pts[2][0] + pts[3][0]) / 2;
      const ds = pts.map((p, i) => `M${W / 2} 0 V${y1} H${i < 2 ? m1 : m2} V${y2} H${p[0]} V${top}`);
      svg.innerHTML = ds.map(d => `<path class="clk-base" d="${d}"/>`).join('') + ds.map(d => `<path class="clk-pulse" d="${d}"/>`).join('') +
        `<rect class="clk-root" x="${W / 2 - 3}" y="-3" width="6" height="6"/>`;
      return [...svg.querySelectorAll('.clk-pulse')];
    }

    function flash() {
      cards().forEach(c => {
        c.classList.add('clk-hit');
        setTimeout(() => c.classList.remove('clk-hit'), 420);
      });
    }

    function pulse() {
      const now = performance.now();
      if (still() || now - lastPulse < 1500) return;
      lastPulse = now;
      const paths = build();
      if (!paths || !paths[0].animate) { setTimeout(flash, 200); return; }
      paths.forEach(p => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `18 ${len + 18}`;
        p.animate([{ strokeDashoffset: 18 }, { strokeDashoffset: -len }], { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      });
      setTimeout(flash, 600);
    }

    build();
    window.addEventListener('resize', build);
    let visible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(en => {
        visible = en[0].isIntersecting;
        // Wait for the hero build-up to finish before the first clock edge
        if (visible && window.chipFxBuilt) setTimeout(pulse, 250);
      }, { threshold: 0.6 }).observe(grid);
    }
    document.addEventListener('chipfx:built', () => { if (visible) setTimeout(pulse, 200); });
    grid.addEventListener('mouseenter', () => pulse());
  }

  // ---------------------------------------------------------------------------
  // 6. Via-drop click ripple
  // ---------------------------------------------------------------------------
  function spawnVia(x0, y0) {
    const t0 = performance.now(), c = col();
    addJob(now => {
      const p = (now - t0) / 620;
      if (p >= 1) return false;
      const e = ease(clamp(p * 1.4));
      const fade = 1 - p;
      ox.save();
      ox.lineWidth = 2;
      ox.globalAlpha = fade;
      ox.strokeStyle = c.gold;
      ox.beginPath(); ox.moveTo(x0 - 46 * e, y0); ox.lineTo(x0 + 46 * e, y0); ox.stroke();
      ox.strokeStyle = c.emerald;
      ox.beginPath(); ox.moveTo(x0, y0 - 34 * e); ox.lineTo(x0, y0 + 34 * e); ox.stroke();
      ox.lineWidth = 1.5;
      for (let i = 0; i < 2; i++) {
        const q = clamp(p * 1.5 - i * 0.22);
        if (q <= 0 || q >= 1) continue;
        const s = 8 + q * 48;
        ox.globalAlpha = (1 - q) * 0.9;
        ox.strokeStyle = c.gold;
        ox.strokeRect(x0 - s / 2, y0 - s / 2, s, s);
      }
      ox.globalAlpha = fade;
      ox.fillStyle = c.via;
      ox.fillRect(x0 - 3.5, y0 - 3.5, 7, 7);
      ox.strokeStyle = c.gold;
      ox.lineWidth = 1;
      ox.strokeRect(x0 - 3.5, y0 - 3.5, 7, 7);
      ox.restore();
      return true;
    });
  }

  document.addEventListener('pointerdown', e => {
    if (still() || e.button > 0) return;
    const el = e.target && e.target.closest ? e.target.closest('button, a, .eda-border, [onclick], [role="button"]') : null;
    if (!el || el.closest('input, textarea, #lightbox-modal')) return;
    spawnVia(e.clientX, e.clientY);
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 7. Staggered entrances when a view opens
  // ---------------------------------------------------------------------------
  function stagger(view) {
    if (still() || !view) return;
    const limit = window.innerHeight * 1.1;
    const items = [...view.querySelectorAll('.eda-border, .qor-tab')]
      .filter(el => el.offsetParent !== null && !el.closest('.fx-enter') && el.getBoundingClientRect().top < limit)
      .slice(0, 14);
    items.forEach((el, i) => {
      el.style.setProperty('--i', i);
      el.classList.remove('fx-enter');
      void el.offsetWidth;
      el.classList.add('fx-enter');
      el.addEventListener('animationend', () => el.classList.remove('fx-enter'), { once: true });
    });
  }

  function initStagger() {
    document.querySelectorAll('.app-view').forEach(view => {
      let wasVisible = view.classList.contains('view-visible');
      new MutationObserver(() => {
        const nowVisible = view.classList.contains('view-visible');
        if (nowVisible && !wasVisible) stagger(view);
        wasVisible = nowVisible;
      }).observe(view, { attributes: true, attributeFilter: ['class'] });
    });
    afterBoot(() => stagger(document.querySelector('.app-view.active-view')));
  }

  // ---------------------------------------------------------------------------
  // 8. Count-up numbers (first number in the element's text, formatting kept)
  // ---------------------------------------------------------------------------
  const NUM_RE = /([+-]?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/;
  function countUp(el, dur = 900) {
    if (still() || !el || el.children.length || el.dataset.counted) return;
    const text = el.textContent;
    const m = text.match(NUM_RE);
    if (!m) return;
    const value = parseFloat((m[2] + (m[3] || '')).replace(/,/g, ''));
    if (!value) return;
    el.dataset.counted = '1';
    const decimals = m[3] ? m[3].length - 1 : 0;
    const commas = m[2].includes(',');
    const before = text.slice(0, m.index) + m[1];
    const after = text.slice(m.index + m[0].length);
    const fmt = v => {
      const fixed = v.toFixed(decimals);
      if (!commas) return fixed;
      const [i, d] = fixed.split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
    };
    const t0 = performance.now();
    (function frame(now) {
      const p = clamp((now - t0) / dur);
      el.textContent = before + fmt(value * (1 - Math.pow(1 - p, 3))) + after;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    })(t0);
  }

  function initCountUp() {
    const grid = document.getElementById('stat-grid');
    if (grid) {
      const vals = () => grid.querySelectorAll('.text-lg, .text-xl');
      afterBoot(() => vals().forEach(v => countUp(v, 1100)));
    }
    const metrics = document.getElementById('qor-metrics-grid');
    if (metrics) {
      new MutationObserver(() => {
        if (!metrics.closest('.view-visible, .active-view')) return;
        metrics.querySelectorAll('.font-bold').forEach(v => countUp(v, 700));
      }).observe(metrics, { childList: true });
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Flow playback: scroll-scrubbed floorplan -> route on the Physical Design tab
  // ---------------------------------------------------------------------------
  function initFlowPlayback() {
    const track = document.getElementById('fp-track');
    const sticky = document.getElementById('fp-sticky');
    if (!track || !sticky || !window.qorData) return;
    const imgA = document.getElementById('fp-img-a');
    const imgB = document.getElementById('fp-img-b');
    const rail = document.getElementById('fp-rail');
    const title = document.getElementById('fp-title');
    const metrics = document.getElementById('fp-metrics');
    const ORDER = ['floorplan', 'pdn', 'placement', 'cts', 'routing'];
    const NAMES = ['Floorplan', 'Power plan', 'Placement', 'Clock tree', 'Route & signoff'];
    let block = 'fifo', shownA = -1, shownB = -1, shownInfo = -1;

    const stages = () => ORDER.map(k => window.qorData[block].stages[k]).filter(Boolean);
    const stickyTop = () => {
      const nav = document.getElementById('main-navbar');
      return nav ? Math.round(nav.getBoundingClientRect().bottom + 12) : 104;
    };

    rail.innerHTML = NAMES.map((n, i) =>
      `<li><button type="button" data-fp-step="${i}"><span class="fp-dot"></span><span class="fp-num">0${i + 1}</span><span class="fp-name">${n}</span></button></li>`).join('');

    function setBlock(b) {
      block = b;
      shownA = shownB = shownInfo = -1;
      document.querySelectorAll('.fp-block-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.fpBlock === b));
      stages().forEach(st => { const im = new Image(); im.src = st.img; });
      update();
    }

    function info(i) {
      if (i === shownInfo) return;
      shownInfo = i;
      const st = stages()[i];
      if (!st) return;
      title.textContent = st.title;
      metrics.innerHTML = (st.metrics || []).slice(0, 4).map(([l, v]) =>
        `<div class="p-2 rounded bg-silicon-950/90 border border-slate-800 min-w-0"><div class="text-[10px] text-slate-400 uppercase truncate">${l}</div><div class="text-xs font-bold text-white mt-0.5 break-words">${v}</div></div>`).join('');
      rail.querySelectorAll('li').forEach((li, k) => {
        li.classList.toggle('done', k < i);
        li.classList.toggle('active', k === i);
      });
    }

    function update() {
      const list = stages();
      const top = stickyTop();
      sticky.style.top = top + 'px';
      const total = Math.max(1, track.offsetHeight - sticky.offsetHeight);
      const p = clamp((top - track.getBoundingClientRect().top) / total);
      const f = p * (list.length - 1);
      const i = Math.min(list.length - 1, Math.floor(f));
      const frac = f - i;
      const j = Math.min(list.length - 1, i + 1);
      if (shownA !== i) { imgA.src = list[i].img; imgA.alt = list[i].caption || list[i].title; shownA = i; }
      if (shownB !== j) { imgB.src = list[j].img; imgB.alt = list[j].caption || list[j].title; shownB = j; }
      // hold each stage, crossfade only through the middle of the step
      const fade = clamp((frac - 0.35) / 0.3);
      imgB.style.opacity = list[i].img === list[j].img ? 0 : fade;
      info(frac < 0.5 ? i : j);
    }

    function sizeTrack() {
      // ~70% of a viewport of scrolling per stage
      track.style.height = (sticky.offsetHeight + window.innerHeight * 0.7 * (ORDER.length - 1)) + 'px';
    }

    rail.addEventListener('click', e => {
      const btn = e.target.closest('[data-fp-step]');
      if (!btn) return;
      const k = Number(btn.dataset.fpStep);
      const total = track.offsetHeight - sticky.offsetHeight;
      const y = window.scrollY + track.getBoundingClientRect().top - stickyTop() + (k / (ORDER.length - 1)) * total + 2;
      window.scrollTo({ top: y, behavior: still() ? 'auto' : 'smooth' });
    });
    document.querySelectorAll('.fp-block-btn').forEach(btn => btn.addEventListener('click', () => setBlock(btn.dataset.fpBlock)));

    let ticking = false;
    const onScroll = () => {
      if (ticking || !track.offsetParent) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { sizeTrack(); update(); });
    const view = document.getElementById('view-qor');
    if (view) new MutationObserver(() => { if (track.offsetParent) { sizeTrack(); update(); } })
      .observe(view, { attributes: true, attributeFilter: ['class'] });
    sizeTrack();
    setBlock('fifo');
  }

  // ---------------------------------------------------------------------------
  // 10. Layout magnifier (hover lens) for screenshots
  // ---------------------------------------------------------------------------
  function attachLoupe(host, getImg, zoom = 2.6) {
    if (!host || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const lens = document.createElement('div');
    lens.className = 'layout-loupe';
    lens.setAttribute('aria-hidden', 'true');
    lens.innerHTML = `<span>&times;${zoom}</span>`;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(lens);
    const L = 150;
    host.addEventListener('mousemove', e => {
      const img = getImg();
      if (!img || !img.naturalWidth || img.style.display === 'none' || Number(getComputedStyle(img).opacity) === 0) { lens.classList.remove('on'); return; }
      const hb = host.getBoundingClientRect();
      const ib = img.getBoundingClientRect();
      const fit = getComputedStyle(img).objectFit;
      const sc = fit === 'cover' ? Math.max(ib.width / img.naturalWidth, ib.height / img.naturalHeight)
                                 : Math.min(ib.width / img.naturalWidth, ib.height / img.naturalHeight);
      const cw = img.naturalWidth * sc, ch = img.naturalHeight * sc;
      const offX = ib.left + (ib.width - cw) / 2, offY = ib.top + (ib.height - ch) / 2;
      const ix = e.clientX - offX, iy = e.clientY - offY;
      if (ix < 0 || iy < 0 || ix > cw || iy > ch) { lens.classList.remove('on'); return; }
      lens.classList.add('on');
      lens.style.left = (e.clientX - hb.left - L / 2) + 'px';
      lens.style.top = (e.clientY - hb.top - L / 2) + 'px';
      lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      lens.style.backgroundSize = `${cw * zoom}px ${ch * zoom}px`;
      lens.style.backgroundPosition = `${-(ix * zoom - L / 2)}px ${-(iy * zoom - L / 2)}px`;
    });
    host.addEventListener('mouseleave', () => lens.classList.remove('on'));
  }

  function initLoupes() {
    const q = document.getElementById('qor-stage-img');
    if (q) attachLoupe(q.parentElement, () => q);
    const stage = document.getElementById('fp-stage');
    if (stage) attachLoupe(stage, () => {
      const b = document.getElementById('fp-img-b');
      return Number(b.style.opacity) > 0.5 ? b : document.getElementById('fp-img-a');
    });
  }

  // ---------------------------------------------------------------------------
  // 11. CMOS-inverter theme toggle: show the propagation delay on each flip
  // ---------------------------------------------------------------------------
  function initInverterToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.classList.add('inv-toggle');
    btn.addEventListener('click', () => {
      btn.classList.remove('switching');
      void btn.offsetWidth;
      btn.classList.add('switching');
      setTimeout(() => btn.classList.remove('switching'), 450);
    });
  }

  // ---------------------------------------------------------------------------
  // 12. Clock-waveform scroll progress under the header
  // ---------------------------------------------------------------------------
  function initClockScrollBar() {
    const nav = document.getElementById('main-navbar');
    if (!nav) return;
    const bar = document.createElement('div');
    bar.className = 'clk-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<div class="clk-progress-fill"></div>';
    nav.appendChild(bar);
    const fill = bar.firstChild;
    let ticking = false;
    function update() {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.classList.toggle('on', max > 40);
      fill.style.width = (max > 0 ? clamp(window.scrollY / max) * 100 : 0) + '%';
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    new MutationObserver(req).observe(document.querySelector('main') || document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    update();
  }

  // ---------------------------------------------------------------------------
  hookViewTransitions();
  initBuildUp();
  initRouteDividers();
  initClockTree();
  initStagger();
  initCountUp();
  initFlowPlayback();
  initLoupes();
  initInverterToggle();
  initClockScrollBar();

  // Small hook for testing / reuse elsewhere
  window.chipFx = { spawnVia, still };
})();
