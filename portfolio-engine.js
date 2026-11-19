(function initPortfolioEngine() {
  let currentBlock = 'gprs';
  let currentStage = 'floorplan';
  let transitionParticles = [];
  let viewSwapTimer = null;
  let viewShowTimer = null;

  const VALID_VIEWS = ['home', 'qor', 'lab', 'projects', 'credentials'];
  const THEMES = {
    'gds-scope': { label: 'GDS + Scope', light: false, short: 'Scope' },
    'eda-workstation': { label: 'EDA Unix', light: false, short: 'Unix' },
    'obsidian-gold': { label: '24K Gold', light: false, short: 'Gold' },
    'warm-ivory': { label: 'Ivory', light: true, short: 'Ivory' }
  };

  const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const safeStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  window.getAvailableThemes = function() { return THEMES; };
  window.getCurrentTheme = function() {
    const saved = safeStore.get('narendaran_site_theme');
    return THEMES[saved] ? saved : 'gds-scope';
  };

  function syncThemeControls(themeKey) {
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      const on = btn.getAttribute('data-theme-option') === themeKey;
      btn.classList.toggle('bg-metal-m5', on);
      btn.classList.toggle('font-bold', on);
    });
  }

  window.applySiteTheme = function(themeKey) {
    const resolved = THEMES[themeKey] ? themeKey : 'gds-scope';
    const htmlEl = document.documentElement;
    const isLight = Boolean(THEMES[resolved].light);
    const iconEl = document.getElementById('theme-icon');
    const labelEl = document.getElementById('theme-label');

    htmlEl.setAttribute('data-theme', resolved);
    if (isLight) {
      htmlEl.classList.add('light-theme');
      htmlEl.classList.remove('dark');
      if (iconEl) iconEl.innerHTML = '&#9728;';
      if (labelEl) labelEl.textContent = 'Light';
    } else {
      htmlEl.classList.remove('light-theme');
      htmlEl.classList.add('dark');
      if (iconEl) iconEl.innerHTML = '&#9789;';
      if (labelEl) labelEl.textContent = THEMES[resolved].short;
    }

    safeStore.set('narendaran_site_theme', resolved);
    syncThemeControls(resolved);
    const canvas = document.getElementById('asic-canvas');
    if (canvas && typeof canvas.triggerRedraw === 'function') canvas.triggerRedraw();
    document.dispatchEvent(new CustomEvent('vlsi:themechange', { detail: { theme: resolved, light: isLight } }));
  };

  window.toggleSiteTheme = function() {
    const order = Object.keys(THEMES);
    const curr = window.getCurrentTheme();
    window.applySiteTheme(order[(order.indexOf(curr) + 1) % order.length]);
  };

  function injectThemeSwitcherPill() {
    if (document.getElementById('vlsi-theme-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'vlsi-theme-bar';
    bar.className = 'hidden sm:flex items-center gap-1 p-1 rounded-lg bg-silicon-900/90 border border-slate-800 text-[10px] shadow-lg';
    bar.innerHTML = Object.entries(THEMES).map(([key, meta]) =>
      `<button type="button" data-theme-option="${key}" class="px-2 py-1 rounded text-slate-300 hover:text-white transition">${meta.label}</button>`
    ).join('');
    document.body.appendChild(bar);
    bar.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.addEventListener('click', () => window.applySiteTheme(btn.getAttribute('data-theme-option')));
    });
    syncThemeControls(window.getCurrentTheme());
  }

  window.applySiteTheme(window.getCurrentTheme());

  function spawnTransitionParticles(originX, originY) {
    if (reducedMotion.matches || window.chipFxHandlesTransitions) return;
    const cs = getComputedStyle(document.documentElement);
    const colors = [
      cs.getPropertyValue('--gold-primary').trim() || '#39FF14',
      cs.getPropertyValue('--emerald-pass').trim() || '#10B981',
      cs.getPropertyValue('--gold-bright').trim() || '#38BDF8',
      cs.getPropertyValue('--amber-warn').trim() || '#FACC15'
    ];
    for (let i = 0; i < 24; i++) {
      const a = (Math.PI * 2 * i) / 24;
      const sp = 2.2 + Math.random() * 5;
      transitionParticles.push({ x: originX, y: originY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, size: 2.2, alpha: 1, color: colors[i % colors.length] });
    }
  }

  function commitViewChange(viewKey) {
    if (!VALID_VIEWS.includes(viewKey)) return;
    if (viewSwapTimer) clearTimeout(viewSwapTimer);
    if (viewShowTimer) clearTimeout(viewShowTimer);
    const target = document.getElementById('view-' + viewKey);
    if (!target) return;

    document.querySelectorAll('.app-view').forEach(sec => sec.classList.remove('view-visible'));
    viewSwapTimer = setTimeout(() => {
      document.querySelectorAll('.app-view').forEach(s => { if (s.id !== 'view-' + viewKey) s.classList.remove('active-view'); });
      target.classList.add('active-view');
      viewShowTimer = requestAnimationFrame(() => target.classList.add('view-visible'));
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      if (viewKey === 'qor') renderQorDashboard();
      try { history.replaceState(null, '', viewKey === 'home' ? location.pathname : '#' + viewKey); } catch (e) {}
      document.dispatchEvent(new CustomEvent('vlsi:viewchange', { detail: { view: viewKey } }));
    }, 120);

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active-nav', btn.getAttribute('data-view') === viewKey);
    });
  }

  window.switchPageView = function(viewKey, evt) {
    if (!VALID_VIEWS.includes(viewKey)) return;
    const cx = evt && typeof evt.clientX === 'number' && evt.clientX > 0 ? evt.clientX : window.innerWidth / 2;
    const cy = evt && typeof evt.clientY === 'number' && evt.clientY > 0 ? evt.clientY : 54;
    spawnTransitionParticles(cx, cy);
    commitViewChange(viewKey);
  };

  window.toggleMobileMenu = function(forceState) {
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!drawer) return;
    const show = typeof forceState === 'boolean' ? forceState : drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !show);
  };

  (function initInteractiveSiliconCanvas() {
    const canvas = document.getElementById('asic-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coordReadout = document.getElementById('die-coords-readout');

    let width = window.innerWidth, height = window.innerHeight;
    const pitch = 72;
    let cols = 0, rows = 0, rafId = null;
    const mouse = { x: -1000, y: -1000, active: false };
    const ambientStart = performance.now();
    let lastMove = 0, macros = [], vias = [], packets = [], customTraceNodes = [];

    const layerColors = [
      { name: 'M5', hex: '#39FF14', rgba: 'rgba(57, 255, 20, ' },
      { name: 'M6', hex: '#38BDF8', rgba: 'rgba(56, 189, 248, ' },
      { name: 'M3', hex: '#10B981', rgba: 'rgba(16, 185, 129, ' },
      { name: 'M8', hex: '#FACC15', rgba: 'rgba(250, 204, 21, ' }
    ];

    function buildAsicGrid() {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      cols = Math.ceil(width / pitch); rows = Math.ceil(height / pitch);

      macros = [
        { x: pitch * 1, y: pitch * 2.2, w: pitch * 2.5, h: pitch * 1.6, label: 'SRAM_64x32_0', color: 'rgba(57, 255, 20, 0.04)', border: 'rgba(57, 255, 20, 0.18)' },
        { x: Math.max(pitch * 5, (cols - 3.5) * pitch), y: pitch * 2.2, w: pitch * 2.5, h: pitch * 2, label: 'GPRS_MEM_1', color: 'rgba(56, 189, 248, 0.04)', border: 'rgba(56, 189, 248, 0.18)' }
      ];
      vias = [];
      for (let c = 1; c < cols; c++) for (let r = 1; r < rows; r++) if ((c + r) % 3 === 0) vias.push({ x: c * pitch, y: r * pitch });
      const packetCount = Math.min(20, Math.max(10, Math.floor((width * height) / 72000)));
      packets = Array.from({ length: packetCount }, createPacket);
    }

    function createPacket() {
      const layer = layerColors[Math.floor(Math.random() * layerColors.length)];
      const horiz = Math.random() > 0.5;
      const speed = 1.4 + Math.random() * 1.5;
      return {
        x: Math.floor(Math.random() * cols) * pitch,
        y: Math.floor(Math.random() * rows) * pitch,
        vx: horiz ? (Math.random() > 0.5 ? speed : -speed) : 0,
        vy: !horiz ? (Math.random() > 0.5 ? speed : -speed) : 0,
        layer, trail: [], maxTrail: 16, lastTurnGridX: -1, lastTurnGridY: -1
      };
    }

    function updateAndDraw() {
      ctx.clearRect(0, 0, width, height);
      const theme = window.getCurrentTheme();
      const activeLayer = window.activeGdsLayer || 'ALL';
      const isScope = theme === 'gds-scope';
      const isLight = theme === 'warm-ivory';

      const vDim = (activeLayer !== 'ALL' && !['M4-M6', 'M7-M8'].includes(activeLayer)) ? 0.25 : 1;
      const hDim = (activeLayer !== 'ALL' && !['M1-M2', 'M4-M6'].includes(activeLayer)) ? 0.25 : 1;

      ctx.lineWidth = 1;
      ctx.strokeStyle = isScope ? `rgba(56, 189, 248, ${0.065 * vDim})` : `rgba(245, 176, 65, ${0.045 * vDim})`;
      for (let c = 0; c <= cols; c++) { const x = c * pitch; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }

      ctx.strokeStyle = isScope ? `rgba(239, 68, 68, ${0.065 * hDim})` : `rgba(16, 185, 129, ${0.04 * hDim})`;
      for (let r = 0; r <= rows; r++) { const y = r * pitch; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

      if (width > 768) {
        const sramAlpha = (activeLayer === 'ALL' || activeLayer === 'SRAM') ? 1 : 0.25;
        ctx.font = '7.5px "JetBrains Mono", monospace';
        macros.forEach(m => {
          ctx.globalAlpha = sramAlpha;
          ctx.fillStyle = m.color; ctx.fillRect(m.x, m.y, m.w, m.h);
          ctx.strokeStyle = m.border; ctx.lineWidth = 0.8; ctx.strokeRect(m.x, m.y, m.w, m.h);
          ctx.fillStyle = isLight ? 'rgba(24, 24, 27, 0.35)' : 'rgba(226, 232, 240, 0.42)';
          ctx.fillText(m.label, m.x + 6, m.y + 11);
        });
        ctx.globalAlpha = 1;
      }

      const viaAlpha = (activeLayer === 'ALL' || activeLayer === 'VIA' || activeLayer === 'M1-M2') ? 1 : 0.2;
      ctx.fillStyle = isScope ? `rgba(250, 204, 21, ${0.24 * viaAlpha})` : `rgba(245, 176, 65, ${0.16 * viaAlpha})`;
      vias.forEach(v => ctx.fillRect(v.x - 1.5, v.y - 1.5, 3, 3));

      const amb = Math.max(0.3, 1 - Math.max(0, performance.now() - ambientStart - 6000) / 3000);
      const packetLimit = Math.ceil(packets.length * amb);

      if (mouse.active && performance.now() - lastMove < 140 && Math.random() < 0.4) {
        customTraceNodes.push({ x: mouse.x + (Math.random() - 0.5) * 24, y: mouse.y + (Math.random() - 0.5) * 24, life: 1.0, color: layerColors[Math.floor(Math.random() * layerColors.length)].hex });
      }
      if (mouse.active) {
        for (let idx = customTraceNodes.length - 1; idx >= 0; idx--) {
          const n = customTraceNodes[idx];
          n.life -= 0.015;
          if (n.life <= 0) customTraceNodes.splice(idx, 1);
          else {
            ctx.lineWidth = 0.8; ctx.strokeStyle = n.color + Math.round(n.life * 28).toString(16).padStart(2, '0');
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
            ctx.fillStyle = n.color; ctx.fillRect(n.x - 1, n.y - 1, 2, 2);
          }
        }
      }

      if (!reducedMotion.matches) {
        packets.forEach((p, idx) => {
          if (idx >= packetLimit) return;
          p.x += p.vx; p.y += p.vy;
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > p.maxTrail) p.trail.shift();

          const gx = Math.round(p.x / pitch) * pitch, gy = Math.round(p.y / pitch) * pitch;
          if (Math.abs(p.x - gx) < 2 && Math.abs(p.y - gy) < 2 && (gx !== p.lastTurnGridX || gy !== p.lastTurnGridY)) {
            if (Math.random() < 0.28) {
              p.x = gx; p.y = gy; p.lastTurnGridX = gx; p.lastTurnGridY = gy;
              const sp = Math.max(Math.abs(p.vx), Math.abs(p.vy));
              if (p.vx !== 0) { p.vx = 0; p.vy = Math.random() > 0.5 ? sp : -sp; }
              else { p.vy = 0; p.vx = Math.random() > 0.5 ? sp : -sp; }
            }
          }
          if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) Object.assign(p, createPacket());

          for (let i = 1; i < p.trail.length; i++) {
            ctx.strokeStyle = p.layer.rgba + ((i / p.trail.length) * (isLight ? 0.35 : 0.55) * amb) + ')';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y); ctx.lineTo(p.trail[i].x, p.trail[i].y); ctx.stroke();
          }
          ctx.fillStyle = p.layer.hex; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        });
      }

      for (let i = transitionParticles.length - 1; i >= 0; i--) {
        const pt = transitionParticles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.alpha -= 0.025;
        if (pt.alpha <= 0) transitionParticles.splice(i, 1);
        else { ctx.save(); ctx.globalAlpha = pt.alpha; ctx.fillStyle = pt.color; ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size); ctx.restore(); }
      }
      rafId = (!reducedMotion.matches && !document.hidden) ? requestAnimationFrame(updateAndDraw) : null;
    }

    function redraw() { buildAsicGrid(); if (rafId === null) updateAndDraw(); }
    canvas.triggerRedraw = redraw;
    window.addEventListener('resize', redraw);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && rafId === null) updateAndDraw(); });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', () => { if (rafId === null) updateAndDraw(); });
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = !reducedMotion.matches; lastMove = performance.now();
      if (coordReadout) coordReadout.textContent = `DIE CURSOR: X=${(e.clientX * 0.425).toFixed(2)} um, Y=${((height - e.clientY) * 0.425).toFixed(2)} um`;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    buildAsicGrid();
    updateAndDraw();
  })();

  function renderQorDashboard() {
    if (!window.qorData) return;
    const block = window.qorData[currentBlock];
    const stage = block.stages[currentStage];
    const map = { 'qor-badge': block.badge, 'qor-stage-title': stage.title, 'qor-stage-desc': stage.desc, 'qor-img-caption': stage.caption, 'qor-action-note': stage.action };
    Object.entries(map).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });

    const imgEl = document.getElementById('qor-stage-img'), fallbackEl = document.getElementById('qor-img-fallback');
    if (imgEl && fallbackEl) {
      imgEl.style.display = 'block'; fallbackEl.style.display = 'none'; imgEl.src = stage.img;
      const fn = document.getElementById('qor-fallback-filename');
      if (fn) fn.textContent = stage.img;
    }

    const barsContainer = document.getElementById('qor-bars-container');
    if (barsContainer) {
      barsContainer.innerHTML = stage.bars.map(b => `<div class="space-y-1"><div class="flex justify-between text-[11px]"><span class="text-slate-300">${b.label}</span><span class="font-bold text-white">${b.valText}</span></div><div class="w-full h-2 bg-silicon-800 rounded-full overflow-hidden"><div class="qor-bar-fill h-full ${b.color} rounded-full" style="width: 0%" data-target="${b.pct}%"></div></div></div>`).join('');
      requestAnimationFrame(() => setTimeout(() => document.querySelectorAll('.qor-bar-fill').forEach(el => { el.style.width = el.getAttribute('data-target'); }), 30));
    }

    const metricsGrid = document.getElementById('qor-metrics-grid');
    if (metricsGrid) metricsGrid.innerHTML = stage.metrics.map(([label, val]) => `<div class="p-3 rounded bg-silicon-950/90 border border-slate-800"><div class="text-[10px] text-slate-400 uppercase">${label}</div><div class="text-xs sm:text-sm font-bold text-white mt-0.5">${val}</div></div>`).join('');

    const tbody = document.getElementById('qor-progression-tbody');
    if (tbody) tbody.innerHTML = block.progression.map(row => `<tr><td class="py-2 px-3 font-semibold text-slate-200">${row[0]}</td><td class="py-2 px-3 text-slate-400">${row[1]}</td><td class="py-2 px-3 text-slate-400">${row[2]}</td><td class="py-2 px-3 text-slate-400">${row[3]}</td><td class="py-2 px-3 text-metal-m3 font-semibold">${row[4]}</td></tr>`).join('');

    document.querySelectorAll('.qor-tab').forEach(btn => {
      btn.className = btn.dataset.stage === currentStage
        ? "qor-tab p-3 rounded-lg bg-silicon-800 border border-metal-m5 text-left transition"
        : "qor-tab p-3 rounded-lg bg-silicon-900/90 border border-slate-800 text-left hover:border-slate-700 transition";
    });
    if (typeof window.setGdsLayerFilter === 'function') window.setGdsLayerFilter(window.activeGdsLayer || 'ALL');
  }

  window.switchQorBlock = function(blockKey) {
    currentBlock = blockKey;
    const btnGprs = document.getElementById('btn-block-gprs'), btnFifo = document.getElementById('btn-block-fifo');
    const activeCls = "px-3 sm:px-4 py-2 rounded-md bg-metal-m5 font-bold transition";
    const idleCls = "px-3 sm:px-4 py-2 rounded-md text-slate-300 hover:text-white transition";
    if (btnGprs) btnGprs.className = blockKey === 'gprs' ? activeCls : idleCls;
    if (btnFifo) btnFifo.className = blockKey === 'fifo' ? activeCls : idleCls;
    renderQorDashboard();
  };

  window.switchQorStage = function(stageKey) { currentStage = stageKey; renderQorDashboard(); };

  window.selectMetalLayer = function(key) {
    const data = window.metalLayersData && window.metalLayersData[key];
    if (!data) return;
    const t = document.getElementById('metal-detail-title');
    if (t) { t.className = `${data.colorClass} font-bold text-sm`; t.textContent = data.title; }
    const d = document.getElementById('metal-detail-desc');
    if (d) d.textContent = data.desc;
    const s = document.getElementById('metal-detail-specs');
    if (s) s.innerHTML = `<div><span class="text-slate-400">Block A:</span> <span class="text-white font-semibold">${data.specA}</span></div><div><span class="text-slate-400">Block B:</span> <span class="text-white font-semibold">${data.specB}</span></div>`;
    ['m8m7', 'm6m5_ports', 'm5m4_cts', 'm2_straps', 'm1_rails'].forEach(id => {
      const el = document.getElementById('slab-' + id);
      if (el) el.classList.toggle('active-slab', id === key);
    });
  };

  window.arbState = { cycle: 0, req_cpu: true, req_dma: true, req_periph: false, wait_cnt: 0, last_secondary: 'periph', autoTimer: null };
  window.toggleArbiterReq = function(m) { arbState['req_' + m] = !arbState['req_' + m]; updateArbiterButtons(); };

  function updateArbiterButtons() {
    [{ key: 'cpu', active: arbState.req_cpu, color: 'metal-m5' }, { key: 'dma', active: arbState.req_dma, color: 'metal-m3' }, { key: 'periph', active: arbState.req_periph, color: 'metal-m6' }]
      .forEach(({ key, active, color }) => {
        const btn = document.getElementById(`btn-req-${key}`), dot = document.getElementById(`dot-req-${key}`), txt = document.getElementById(`txt-req-${key}`);
        if (btn && dot && txt) {
          btn.className = active ? `p-3 rounded-lg bg-silicon-800 border border-${color} text-left transition` : `p-3 rounded-lg bg-silicon-950 border border-slate-700 text-left transition`;
          dot.className = `w-2.5 h-2.5 rounded-full ${active ? `bg-${color}` : 'bg-slate-500'}`;
          txt.className = active ? `text-[11px] text-${color} font-semibold mt-1` : `text-[11px] text-slate-400 mt-1`;
          txt.textContent = `req_${key} = ${active ? '1 (ACTIVE)' : '0 (IDLE)'}`;
        }
      });
  }

  window.stepArbiterClock = function() {
    arbState.cycle++;
    let grant = "IDLE (2'b00)", badge = "BUS IDLE", logMsg = "";
    const sec = arbState.req_dma || arbState.req_periph;
    if (!arbState.req_cpu && !sec) { arbState.wait_cnt = 0; grant = "IDLE (2'b00)"; badge = "NO ACTIVE REQUESTS"; logMsg = `[Cycle ${arbState.cycle}] Bus IDLE.`; }
    else if (arbState.req_cpu && !sec) { arbState.wait_cnt = 0; grant = "CPU (2'b01)"; badge = "PRIORITY: CPU EXCLUSIVE"; logMsg = `[Cycle ${arbState.cycle}] CPU granted.`; }
    else if (!arbState.req_cpu && sec) {
      arbState.wait_cnt = 0;
      grant = (arbState.req_dma && arbState.req_periph) ? (arbState.last_secondary === 'dma' ? "PERIPH (2'b11)" : "DMA (2'b10)") : (arbState.req_dma ? "DMA (2'b10)" : "PERIPH (2'b11)");
      if (arbState.req_dma && arbState.req_periph) arbState.last_secondary = arbState.last_secondary === 'dma' ? 'periph' : 'dma';
      else arbState.last_secondary = arbState.req_dma ? 'dma' : 'periph';
      badge = `GRANTED: ${grant}`; logMsg = `[Cycle ${arbState.cycle}] Granted ${grant}.`;
    } else if (arbState.wait_cnt < 8) {
      arbState.wait_cnt++; grant = "CPU (2'b01)"; badge = `CONTENTION: CPU SERVED (${arbState.wait_cnt}/8)`; logMsg = `[Cycle ${arbState.cycle}] CPU served (${arbState.wait_cnt}/8).`;
    } else {
      grant = (arbState.req_dma && arbState.req_periph) ? (arbState.last_secondary === 'dma' ? "PERIPH (2'b11)" : "DMA (2'b10)") : (arbState.req_dma ? "DMA (2'b10)" : "PERIPH (2'b11)");
      if (arbState.req_dma && arbState.req_periph) arbState.last_secondary = arbState.last_secondary === 'dma' ? 'periph' : 'dma';
      badge = "ANTI-STARVATION OVERRIDE!"; logMsg = `[Cycle ${arbState.cycle}] 8-cycle fairness override -> ${grant}!`; arbState.wait_cnt = 0;
    }
    const map = { 'arb-cycle': arbState.cycle, 'arb-grant': grant, 'arb-counter': `${arbState.wait_cnt} / 8`, 'arb-status-badge': badge, 'arb-log-line': logMsg };
    Object.entries(map).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.textContent = v; });
    const bar = document.getElementById('arb-wait-bar');
    if (bar) bar.style.width = `${(arbState.wait_cnt / 8) * 100}%`;
    document.dispatchEvent(new CustomEvent('vlsi:arbiterstep', { detail: { ...arbState, grant } }));
  };

  window.toggleArbiterAuto = function() {
    const btn = document.getElementById('btn-arb-autorun');
    if (arbState.autoTimer) { clearInterval(arbState.autoTimer); arbState.autoTimer = null; if (btn) { btn.textContent = "Auto: OFF"; btn.className = "px-3 py-2 rounded bg-silicon-800 border border-metal-m5/40 text-metal-m5 font-semibold hover:bg-metal-m5/10 transition"; } }
    else { stepArbiterClock(); arbState.autoTimer = setInterval(stepArbiterClock, 900); if (btn) { btn.textContent = "Auto: ON"; btn.className = "px-3 py-2 rounded bg-metal-m5 font-bold transition"; } }
  };

  window.resetArbiter = function() {
    if (arbState.autoTimer) toggleArbiterAuto();
    arbState.cycle = 0; arbState.wait_cnt = 0;
    const map = { 'arb-cycle': '0', 'arb-grant': "CPU (2'b01)", 'arb-counter': '0 / 8', 'arb-status-badge': 'PRIORITY: CPU SERVED FIRST', 'arb-log-line': '[Reset] Counter cleared.' };
    Object.entries(map).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.textContent = v; });
    const bar = document.getElementById('arb-wait-bar');
    if (bar) bar.style.width = '0%';
    document.dispatchEvent(new CustomEvent('vlsi:arbiterreset'));
  };

  const cmdHistory = [];
  let historyIdx = -1;
  window.focusTerminalInput = function() { document.getElementById('terminal-input')?.focus(); };
  window.handleTerminalSubmit = function(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('terminal-input');
    if (!input || !input.value.trim()) return;
    const val = input.value.trim(); input.value = ''; executeCommand(val);
  };

  window.executeCommand = function(rawCmd) {
    const log = document.getElementById('terminal-log'), body = document.getElementById('terminal-body');
    if (!log || !body) return;
    const cleanCmd = rawCmd.trim(), lowerKey = cleanCmd.toLowerCase();
    cmdHistory.push(cleanCmd); historyIdx = cmdHistory.length;

    if (lowerKey === 'clear' || lowerKey === 'cls') {
      log.innerHTML = `<div class="text-slate-500"># Terminal buffer cleared. Type 'neofetch' or 'help'.</div>`;
      body.scrollTop = body.scrollHeight; return;
    }

    const aliases = { ls: 'ls -la', ll: 'ls -la', dir: 'ls -la', uname: 'uname -a', report_qor: 'gprs', report_clock_qor: 'fifo', vcs: 'arbiter' };
    const resolvedKey = aliases[lowerKey] || lowerKey;
    const cmds = window.terminalCommands || {};
    const outputText = cmds[resolvedKey] || `bash: ${cleanCmd}: command not found. Try 'help', 'neofetch', 'sudo tapeout', or 'drc_check'.`;

    const entry = document.createElement('div');
    entry.className = 'space-y-1 pt-1 border-t border-slate-800/50';
    entry.innerHTML = `<div><span class="text-emerald-400 font-bold">narendaran@asic-node</span>:<span class="text-amber-300 font-bold">~/vlsi_workspace</span>$ <span class="text-white">${cleanCmd}</span></div>`;
    const pre = document.createElement('pre');
    pre.className = (cmds[resolvedKey] ? 'text-emerald-300' : 'text-amber-400') + ' text-[11px] whitespace-pre-wrap leading-relaxed';
    entry.appendChild(pre); log.appendChild(entry);

    const lines = outputText.split('\n');
    let idx = 0;
    (function stream() {
      if (idx < lines.length) { pre.textContent += (idx > 0 ? '\n' : '') + lines[idx++]; body.scrollTop = body.scrollHeight; setTimeout(stream, 14); }
    })();
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectThemeSwitcherPill();
    const input = document.getElementById('terminal-input');
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && historyIdx > 0) { e.preventDefault(); input.value = cmdHistory[--historyIdx]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = historyIdx < cmdHistory.length - 1 ? cmdHistory[++historyIdx] : (historyIdx = cmdHistory.length, ''); }
        else if (e.key === 'Tab') {
          e.preventDefault();
          const p = input.value.trim().toLowerCase();
          const match = p && Object.keys(window.terminalCommands || {}).find(k => k.startsWith(p));
          if (match) input.value = match;
        }
      });
    }
  });

  window.filterProjects = function(category) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.display = (category === 'all' || card.dataset.category === category) ? 'flex' : 'none';
    });
    document.querySelectorAll('.proj-filter').forEach(btn => {
      btn.className = btn.dataset.filter === category
        ? "proj-filter px-3 py-1.5 rounded bg-metal-m5 font-bold transition"
        : "proj-filter px-3 py-1.5 rounded bg-silicon-900/90 border border-slate-800 text-slate-300 hover:border-metal-m5 transition";
    });
  };

  window.openLightbox = function(src, caption) {
    const modal = document.getElementById('lightbox-modal'), imgEl = document.getElementById('lightbox-img'), capEl = document.getElementById('lightbox-caption');
    if (modal && imgEl && capEl) { imgEl.src = src; capEl.textContent = caption; modal.classList.remove('hidden'); modal.classList.add('flex'); }
  };
  window.openCurrentQorImage = function() {
    const imgEl = document.getElementById('qor-stage-img'), capEl = document.getElementById('qor-img-caption');
    if (imgEl && imgEl.getAttribute('src') && imgEl.style.display !== 'none') openLightbox(imgEl.getAttribute('src'), capEl ? capEl.textContent : 'Layout View');
  };
  window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

(function initUpdatesStrip() {
  const wrap = document.getElementById('updates-strip'), list = document.getElementById('updates-list');
  if (!wrap || !list || !window.fetch) return;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = d => { const [y, m, day] = String(d || '').split('-'); return (!y || !m) ? (d || '') : ((day ? Number(day) + ' ' : '') + months[Number(m) - 1] + ' ' + y); };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const views = ['home', 'qor', 'lab', 'projects', 'credentials'];

  fetch('updates.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const items = data && Array.isArray(data.updates) ? data.updates.slice(0, 4) : [];
      if (!items.length) return;
      list.innerHTML = items.map(u => {
        const view = views.includes(u.view) ? u.view : null;
        const link = view ? `<button type="button" onclick="switchPageView('${view}', event)" class="mt-1 text-[11px] font-mono text-metal-m5 font-semibold hover:underline">Open &rarr;</button>` : '';
        return `<li class="relative pl-4 border-l border-slate-800"><span class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-metal-m3"></span><div class="text-[11px] font-mono text-slate-400">${esc(fmtDate(u.date))}</div><div class="text-sm font-semibold text-white">${esc(u.title)}</div><div class="text-xs text-slate-400 leading-relaxed">${esc(u.summary)}</div>${link}</li>`;
      }).join('');
      wrap.classList.remove('hidden');
    })
    .catch(() => {});
})();

(function initHashRouting() {
  const views = ['home', 'qor', 'lab', 'projects', 'credentials'];
  const openFromHash = () => {
    const key = (location.hash || '').replace('#', '');
    if (views.includes(key) && typeof window.switchPageView === 'function') window.switchPageView(key);
  };
  window.addEventListener('hashchange', openFromHash);
  if (location.hash) window.addEventListener('load', openFromHash);
})();

(function initLayerFilterChips() {
  const LAYERS = [
    { key: 'ALL', label: 'ALL', slabs: [] },
    { key: 'M1-M2', label: 'M1-M2', slabs: ['m2_straps', 'm1_rails'] },
    { key: 'M4-M6', label: 'M4-M6', slabs: ['m6m5_ports', 'm5m4_cts'] },
    { key: 'M7-M8', label: 'M7-M8', slabs: ['m8m7'] },
    { key: 'VIA', label: 'VIA', slabs: ['m2_straps'] },
    { key: 'SRAM', label: 'SRAM', slabs: [] }
  ];
  window.activeGdsLayer = 'ALL';

  function applyLayerHighlights(layerKey) {
    window.activeGdsLayer = layerKey;
    document.querySelectorAll('[data-gds-layer]').forEach(btn => {
      const on = btn.getAttribute('data-gds-layer') === layerKey;
      btn.classList.toggle('bg-metal-m3', on);
      btn.classList.toggle('font-bold', on);
    });
    const cfg = LAYERS.find(l => l.key === layerKey) || LAYERS[0];
    ['m8m7', 'm6m5_ports', 'm5m4_cts', 'm2_straps', 'm1_rails'].forEach(id => {
      const el = document.getElementById('slab-' + id);
      if (!el) return;
      if (layerKey === 'ALL') el.classList.remove('layer-dimmed', 'layer-highlighted');
      else {
        const match = cfg.slabs.includes(id);
        el.classList.toggle('layer-dimmed', !match);
        el.classList.toggle('layer-highlighted', match);
      }
    });
    document.querySelectorAll('#qor-bars-container > div').forEach(row => {
      if (layerKey === 'ALL') { row.classList.remove('layer-dimmed'); return; }
      const txt = row.textContent.toUpperCase();
      const match =
        (layerKey === 'M1-M2' && (txt.includes('M1') || txt.includes('M2') || txt.includes('DCAP'))) ||
        (layerKey === 'M4-M6' && (txt.includes('M4') || txt.includes('M5') || txt.includes('M6') || txt.includes('PORT') || txt.includes('SKEW'))) ||
        (layerKey === 'M7-M8' && (txt.includes('M7') || txt.includes('M8') || txt.includes('MESH') || txt.includes('PG'))) ||
        (layerKey === 'VIA' && (txt.includes('VIA') || txt.includes('DRC') || txt.includes('SHORT'))) ||
        (layerKey === 'SRAM' && (txt.includes('MACRO') || txt.includes('FLYLINE') || txt.includes('UTIL')));
      row.classList.toggle('layer-dimmed', !match);
    });
    const canvas = document.getElementById('asic-canvas');
    if (canvas) { canvas.style.opacity = layerKey === 'ALL' ? '0.72' : '0.95'; if (typeof canvas.triggerRedraw === 'function') canvas.triggerRedraw(); }
  }

  window.setGdsLayerFilter = applyLayerHighlights;
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vlsi-layer-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'vlsi-layer-bar';
    bar.className = 'hidden md:flex items-center gap-1 p-1 rounded-lg bg-silicon-900/90 border border-slate-800 text-[10px] shadow-lg';
    bar.innerHTML = `<span class="px-1.5 text-slate-400">LAYER:</span>` + LAYERS.map(l =>
      `<button type="button" data-gds-layer="${l.key}" class="px-2 py-0.5 rounded text-slate-300 hover:text-white transition">${l.label}</button>`
    ).join('');
    document.body.appendChild(bar);
    bar.querySelectorAll('[data-gds-layer]').forEach(btn => btn.addEventListener('click', () => applyLayerHighlights(btn.getAttribute('data-gds-layer'))));
    applyLayerHighlights('ALL');
  });
})();
