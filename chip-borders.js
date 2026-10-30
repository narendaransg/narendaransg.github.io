/**
 * chip-borders.js (v3 — 100% Text-Free Geometric Silicon Framing)
 * Removes all distracting text/numbers from page borders and cards.
 * Uses pure geometric bond pads, via corners, and metallic IC pins.
 */

(function initChipBordersModule() {
  const DEFAULT_STYLE = localStorage.getItem('narendaran_chip_border_style') || 'hybrid';

  const styleEl = document.createElement('style');
  styleEl.id = 'asic-chip-borders-css';
  styleEl.textContent = `
    @media (min-width: 768px) {
      body {
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
      }
    }
    @media (max-width: 767px) {
      body {
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 12px;
      }
      .desktop-only-pad {
        display: none !important;
      }
    }

    #chip-viewport-frame {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 35;
      overflow: hidden;
      opacity: 0.45;
      transition: opacity 0.3s ease;
    }
    html.light-theme #chip-viewport-frame {
      opacity: 0.38;
    }

    .chip-corner {
      position: absolute;
      width: 16px;
      height: 16px;
      pointer-events: none;
      z-index: 36;
    }
    .chip-corner.tl { top: 32px; left: 5px; }
    .chip-corner.tr { top: 32px; right: 5px; }
    .chip-corner.bl { bottom: 5px; left: 5px; }
    .chip-corner.br { bottom: 5px; right: 5px; }

    /* =====================================================================
       OPTION 1 & HYBRID: GEOMETRIC DIE BOND-PADS & CHAMFERED CARDS (NO TEXT)
       ===================================================================== */
    body[data-chip-style="option1"] .eda-border,
    body[data-chip-style="hybrid"] .eda-border {
      position: relative;
      border-radius: 6px !important;
      border: 1px solid rgba(0, 240, 255, 0.25) !important;
      background-image:
        repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.35) 0px, rgba(0, 240, 255, 0.35) 4px, transparent 4px, transparent 20px),
        repeating-linear-gradient(90deg, rgba(0, 230, 118, 0.35) 0px, rgba(0, 230, 118, 0.35) 4px, transparent 4px, transparent 20px);
      background-position: top center, bottom center;
      background-size: calc(100% - 36px) 2px, calc(100% - 36px) 2px;
      background-repeat: no-repeat;
    }
    html.light-theme body[data-chip-style="option1"] .eda-border,
    html.light-theme body[data-chip-style="hybrid"] .eda-border {
      border-color: rgba(2, 132, 199, 0.3) !important;
    }

    /* =====================================================================
       OPTION 2: QFP / QFN PACKAGED IC CHIP LEADS & PIN-1 DOT
       ===================================================================== */
    body[data-chip-style="option2"] .eda-border {
      position: relative;
      border-radius: 6px !important;
      border: 1.5px solid rgba(100, 116, 139, 0.45) !important;
      box-shadow:
        -4px 0 0 -1px rgba(148, 163, 184, 0.25),
        4px 0 0 -1px rgba(148, 163, 184, 0.25) !important;
    }
    body[data-chip-style="option2"] .eda-border::after {
      content: "";
      position: absolute;
      top: 8px;
      left: 8px;
      width: 5px;
      height: 5px;
      border-radius: 9999px;
      background: #00F0FF;
      opacity: 0.65;
      pointer-events: none;
    }

    /* =====================================================================
       OPTION 3: GDSII VIA-CORNER RETICLE (PURE GEOMETRY, NO NUMBERS)
       ===================================================================== */
    body[data-chip-style="option3"] .eda-border {
      position: relative;
      border-radius: 2px !important;
      border: 1px solid rgba(0, 230, 118, 0.3) !important;
    }
    body[data-chip-style="option3"] .eda-border::before {
      content: "";
      position: absolute;
      inset: -2px;
      pointer-events: none;
      background:
        linear-gradient(to right, #00F0FF 6px, transparent 6px) 0 0,
        linear-gradient(to bottom, #00F0FF 6px, transparent 6px) 0 0,
        linear-gradient(to left, #00F0FF 6px, transparent 6px) 100% 0,
        linear-gradient(to bottom, #00F0FF 6px, transparent 6px) 100% 0,
        linear-gradient(to right, #00E676 6px, transparent 6px) 0 100%,
        linear-gradient(to top, #00E676 6px, transparent 6px) 0 100%,
        linear-gradient(to left, #00E676 6px, transparent 6px) 100% 100%,
        linear-gradient(to top, #00E676 6px, transparent 6px) 100% 100%;
      background-repeat: no-repeat;
      background-size: 8px 8px;
    }

    /* =====================================================================
       OPTION 4: DUAL VDD / VSS POWER RING (PURE COLOR RAILS, NO TEXT)
       ===================================================================== */
    body[data-chip-style="option4"] .eda-border {
      position: relative;
      border-radius: 4px !important;
      border-top: 2px solid rgba(255, 179, 0, 0.6) !important;
      border-bottom: 2px solid rgba(0, 240, 255, 0.6) !important;
      border-left: 1px solid rgba(255, 179, 0, 0.25) !important;
      border-right: 1px solid rgba(0, 240, 255, 0.25) !important;
    }

    /* =====================================================================
       OPTION 5: PCB GOLD-FINGER CONNECTOR
       ===================================================================== */
    body[data-chip-style="option5"] .eda-border {
      position: relative;
      border-radius: 3px !important;
      border: 1px solid rgba(255, 179, 0, 0.35) !important;
      background-image: repeating-linear-gradient(
        90deg,
        rgba(255, 179, 0, 0.55) 0px,
        rgba(255, 179, 0, 0.55) 5px,
        transparent 5px,
        transparent 10px
      );
      background-size: 100px 3px;
      background-position: bottom right;
      background-repeat: no-repeat;
    }

    /* Compact Frame Switcher moved to Bottom-Left so Bottom-Right is free for the Chip Mascot */
    #chip-style-switcher {
      position: fixed;
      bottom: 14px;
      left: 16px;
      z-index: 60;
      font-family: 'JetBrains Mono', monospace;
    }
    .switcher-card {
      background-color: rgba(11, 16, 30, 0.92);
      border: 1px solid rgba(0, 240, 255, 0.35);
      color: #E2E8F0;
    }
    html.light-theme .switcher-card {
      background-color: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(2, 132, 199, 0.4);
      color: #0F172A;
    }
  `;
  document.head.appendChild(styleEl);

  const frameEl = document.createElement('div');
  frameEl.id = 'chip-viewport-frame';
  document.body.appendChild(frameEl);

  function renderViewportFrame(styleKey) {
    document.body.setAttribute('data-chip-style', styleKey);
    localStorage.setItem('narendaran_chip_border_style', styleKey);

    if (styleKey === 'option1' || styleKey === 'hybrid') {
      // Pure Geometric Bond-Pads + Wirebond Ticks (Zero Text)
      let padsHTML = '';
      const colors = ['#00F0FF', '#00E676', '#FFB300', '#FF2A85'];
      for (let i = 0; i < 10; i++) {
        const topPct = 10 + i * 8.5;
        const cLeft = colors[i % colors.length];
        const cRight = colors[(i + 2) % colors.length];
        padsHTML += `
          <div class="desktop-only-pad" style="position:absolute; left:0; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:6px; height:9px; background:${cLeft}22; border:1px solid ${cLeft}88; border-left:none;"></div>
            <div style="width:5px; height:1px; background:${cLeft}66;"></div>
            <div style="width:2px; height:2px; border-radius:50%; background:${cLeft};"></div>
          </div>
          <div class="desktop-only-pad" style="position:absolute; right:0; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:2px; height:2px; border-radius:50%; background:${cRight};"></div>
            <div style="width:5px; height:1px; background:${cRight}66;"></div>
            <div style="width:6px; height:9px; background:${cRight}22; border:1px solid ${cRight}88; border-right:none;"></div>
          </div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 3px 3px 3px; border:1px solid rgba(0,240,255,0.16);"></div>
        <div class="chip-corner tl" style="border-top:2px solid #00F0FF; border-left:2px solid #00F0FF;"></div>
        <div class="chip-corner tr" style="border-top:2px solid #00F0FF; border-right:2px solid #00F0FF;"></div>
        <div class="chip-corner bl" style="border-bottom:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:2px solid #00E676; border-right:2px solid #00E676;"></div>
        ${padsHTML}
      `;
    } else if (styleKey === 'option2') {
      let pinsHTML = '';
      for (let i = 0; i < 12; i++) {
        const topPct = 10 + i * 7.2;
        pinsHTML += `
          <div class="desktop-only-pad" style="position:absolute; left:0; top:${topPct}%; width:8px; height:5px; background:#64748B; border:1px solid #94A3B8; border-left:none; border-radius:0 1px 1px 0;"></div>
          <div class="desktop-only-pad" style="position:absolute; right:0; top:${topPct}%; width:8px; height:5px; background:#64748B; border:1px solid #94A3B8; border-right:none; border-radius:1px 0 0 1px;"></div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 8px 6px 8px; border:1.5px solid rgba(100,116,139,0.4); border-radius:6px;"></div>
        <div style="position:absolute; top:30px; left:50%; transform:translateX(-50%); width:24px; height:10px; border:1.5px solid #00F0FF; border-top:none; border-radius:0 0 12px 12px;"></div>
        ${pinsHTML}
      `;
    } else if (styleKey === 'option3') {
      // Pure Geometric Reticle Ticks (No Numbers)
      let ticksHTML = '';
      for (let i = 0; i <= 20; i++) {
        const topPct = 6 + i * 4.4;
        const w = i % 5 === 0 ? '7px' : '3px';
        ticksHTML += `
          <div class="desktop-only-pad" style="position:absolute; left:4px; top:${topPct}%; width:${w}; height:1px; background:#00E67688;"></div>
          <div class="desktop-only-pad" style="position:absolute; right:4px; top:${topPct}%; width:${w}; height:1px; background:#00E67688;"></div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1px solid rgba(0,230,118,0.22);"></div>
        <div class="chip-corner tl" style="border-top:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner tr" style="border-top:2px solid #00E676; border-right:2px solid #00E676;"></div>
        <div class="chip-corner bl" style="border-bottom:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:2px solid #00E676; border-right:2px solid #00E676;"></div>
        ${ticksHTML}
      `;
    } else if (styleKey === 'option4') {
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1.5px solid rgba(255,179,0,0.35);"></div>
        <div style="position:absolute; inset:34px 8px 8px 8px; border:1.5px solid rgba(0,240,255,0.3);"></div>
      `;
    } else if (styleKey === 'option5') {
      let goldFingers = '';
      for (let i = 0; i < 22; i++) {
        goldFingers += `<div style="width:7px; height:8px; background:linear-gradient(180deg,#FFD54F,#FFB300); border-radius:1px 1px 0 0; margin:0 1.5px; opacity:0.65;"></div>`;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1px solid rgba(255,179,0,0.28);"></div>
        <div class="desktop-only-pad" style="position:absolute; bottom:4px; left:50%; transform:translateX(-50%); display:flex; align-items:flex-end;">
          ${goldFingers}
        </div>
      `;
    }
  }

  const switcherEl = document.createElement('div');
  switcherEl.id = 'chip-style-switcher';
  switcherEl.innerHTML = `
    <div id="chip-popover-panel" class="hidden switcher-card backdrop-blur-md rounded-xl p-2.5 shadow-2xl text-xs w-52 mb-2">
      <div class="flex items-center justify-between gap-2 mb-2 px-1 border-b border-slate-700/50 pb-1.5">
        <span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Die Border</span>
        <button type="button" id="close-border-panel" class="text-[10px] text-slate-400 hover:text-rose-400">&#10005;</button>
      </div>
      <div class="grid grid-cols-1 gap-1 text-[10.5px]">
        <button type="button" data-style="hybrid" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">★ Bond-Pad Ring</button>
        <button type="button" data-style="option2" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">2. QFP IC Pins</button>
        <button type="button" data-style="option3" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">3. Reticle Ticks</button>
        <button type="button" data-style="option4" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">4. Dual Power Ring</button>
        <button type="button" data-style="option5" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">5. Gold Fingers</button>
      </div>
    </div>

    <button type="button" id="chip-pill-trigger" class="switcher-card backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg text-[11px] flex items-center gap-1.5 hover:scale-105 transition">
      <span class="text-cyan-400">&#9881;</span>
      <span class="hidden sm:inline">Frame</span>
    </button>
  `;
  document.body.appendChild(switcherEl);

  const pillTrigger = document.getElementById('chip-pill-trigger');
  const popoverPanel = document.getElementById('chip-popover-panel');
  const closeBtn = document.getElementById('close-border-panel');

  pillTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverPanel.classList.toggle('hidden');
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverPanel.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!switcherEl.contains(e.target)) {
      popoverPanel.classList.add('hidden');
    }
  });

  function updateSwitcherHighlight(activeKey) {
    document.querySelectorAll('.chip-mode-btn').forEach(btn => {
      if (btn.getAttribute('data-style') === activeKey) {
        btn.className = 'chip-mode-btn px-2.5 py-1.5 rounded text-left bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 font-semibold';
      } else {
        btn.className = 'chip-mode-btn px-2.5 py-1.5 rounded text-left hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent';
      }
    });
  }

  document.querySelectorAll('.chip-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-style');
      renderViewportFrame(chosen);
      updateSwitcherHighlight(chosen);
    });
  });

  renderViewportFrame(DEFAULT_STYLE);
  updateSwitcherHighlight(DEFAULT_STYLE);
})();
