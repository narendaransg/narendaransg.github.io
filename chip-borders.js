/**
 * chip-borders.js (v2 — Mobile-Responsive, Micro-Font & Light/Dark Theme Ready)
 * Modular ASIC / IC Chip Viewport & Card Border Engine for Narendaran S G
 */

(function initChipBordersModule() {
  const DEFAULT_STYLE = localStorage.getItem('narendaran_chip_border_style') || 'hybrid';

  // 1. Inject Modular CSS for All Chip Border Styles + Mobile & Light-Mode Support
  const styleEl = document.createElement('style');
  styleEl.id = 'asic-chip-borders-css';
  styleEl.textContent = `
    /* Desktop breathing room for outer die frame; slimmed on mobile */
    @media (min-width: 768px) {
      body {
        padding-left: 18px;
        padding-right: 18px;
        padding-bottom: 18px;
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

    /* Fixed Viewport Overlay Frame (Subtle Low Opacity) */
    #chip-viewport-frame {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 35;
      overflow: hidden;
      opacity: 0.42;
      transition: opacity 0.3s ease;
    }
    html.light-theme #chip-viewport-frame {
      opacity: 0.32;
    }

    /* Corner Fiducials / Seal Rings */
    .chip-corner {
      position: absolute;
      width: 18px;
      height: 18px;
      pointer-events: none;
      z-index: 36;
    }
    .chip-corner.tl { top: 32px; left: 5px; }
    .chip-corner.tr { top: 32px; right: 5px; }
    .chip-corner.bl { bottom: 5px; left: 5px; }
    .chip-corner.br { bottom: 5px; right: 5px; }

    /* =====================================================================
       OPTION 1 & HYBRID: DIE PAD RING & HARD MACRO PIN-TICK CARDS
       ===================================================================== */
    body[data-chip-style="option1"] .eda-border,
    body[data-chip-style="hybrid"] .eda-border {
      position: relative;
      border-radius: 6px !important;
      border: 1px solid rgba(0, 240, 255, 0.24) !important;
      background-image:
        repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.32) 0px, rgba(0, 240, 255, 0.32) 3px, transparent 3px, transparent 18px),
        repeating-linear-gradient(90deg, rgba(255, 42, 133, 0.32) 0px, rgba(255, 42, 133, 0.32) 3px, transparent 3px, transparent 18px);
      background-position: top center, bottom center;
      background-size: calc(100% - 32px) 2px, calc(100% - 32px) 2px;
      background-repeat: no-repeat;
    }
    html.light-theme body[data-chip-style="option1"] .eda-border,
    html.light-theme body[data-chip-style="hybrid"] .eda-border {
      border-color: rgba(2, 132, 199, 0.28) !important;
    }
    @media (min-width: 640px) {
      body[data-chip-style="option1"] .eda-border::before,
      body[data-chip-style="hybrid"] .eda-border::before {
        content: "MACRO // M5_M6";
        position: absolute;
        top: 4px;
        right: 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 7px;
        letter-spacing: 0.08em;
        color: rgba(0, 240, 255, 0.32);
        pointer-events: none;
      }
      html.light-theme body[data-chip-style="option1"] .eda-border::before,
      html.light-theme body[data-chip-style="hybrid"] .eda-border::before {
        color: rgba(2, 132, 199, 0.45);
      }
    }

    /* =====================================================================
       OPTION 2: QFP / QFN PACKAGED IC CHIP LEADS & PIN-1 NOTCH
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
       OPTION 3: GDSII POLYGON & PHOTOMASK RETICLE (VIA56 CORNERS)
       ===================================================================== */
    body[data-chip-style="option3"] .eda-border {
      position: relative;
      border-radius: 2px !important;
      border: 1px solid rgba(0, 230, 118, 0.32) !important;
      outline: 1px dashed rgba(0, 240, 255, 0.16);
      outline-offset: 3px;
    }
    body[data-chip-style="option3"] .eda-border::before {
      content: "";
      position: absolute;
      inset: -3px;
      pointer-events: none;
      background:
        linear-gradient(to right, #00F0FF 5px, transparent 5px) 0 0,
        linear-gradient(to bottom, #00F0FF 5px, transparent 5px) 0 0,
        linear-gradient(to left, #00F0FF 5px, transparent 5px) 100% 0,
        linear-gradient(to bottom, #00F0FF 5px, transparent 5px) 100% 0,
        linear-gradient(to right, #00E676 5px, transparent 5px) 0 100%,
        linear-gradient(to top, #00E676 5px, transparent 5px) 0 100%,
        linear-gradient(to left, #00E676 5px, transparent 5px) 100% 100%,
        linear-gradient(to top, #00E676 5px, transparent 5px) 100% 100%;
      background-repeat: no-repeat;
      background-size: 8px 8px;
    }

    /* =====================================================================
       OPTION 4: VDD / VSS POWER DELIVERY RING (PDN STRAPS)
       ===================================================================== */
    body[data-chip-style="option4"] .eda-border {
      position: relative;
      border-radius: 4px !important;
      border-top: 2px solid rgba(255, 179, 0, 0.65) !important;
      border-bottom: 2px solid rgba(0, 240, 255, 0.65) !important;
      border-left: 1px solid rgba(255, 179, 0, 0.25) !important;
      border-right: 1px solid rgba(0, 240, 255, 0.25) !important;
    }

    /* =====================================================================
       OPTION 5: PCB GOLD-FINGER & CHAMFERED COPPER TRACE
       ===================================================================== */
    body[data-chip-style="option5"] .eda-border {
      position: relative;
      border-radius: 3px !important;
      border: 1px solid rgba(255, 179, 0, 0.35) !important;
      background-image: repeating-linear-gradient(
        90deg,
        rgba(255, 179, 0, 0.6) 0px,
        rgba(255, 179, 0, 0.6) 5px,
        transparent 5px,
        transparent 10px
      );
      background-size: 110px 3px;
      background-position: bottom right;
      background-repeat: no-repeat;
    }

    /* Compact Floating Chip-Border Switcher Pill (Bottom Right) */
    #chip-style-switcher {
      position: fixed;
      bottom: 14px;
      right: 16px;
      z-index: 60;
      font-family: 'JetBrains Mono', monospace;
    }
    .switcher-card {
      background-color: rgba(11, 16, 30, 0.94);
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

  // 2. Create Viewport Chip Frame Container
  const frameEl = document.createElement('div');
  frameEl.id = 'chip-viewport-frame';
  document.body.appendChild(frameEl);

  // 3. Render Viewport Frame with Micro-Font (6.5px - 7px) & Low Opacity
  function renderViewportFrame(styleKey) {
    document.body.setAttribute('data-chip-style', styleKey);
    localStorage.setItem('narendaran_chip_border_style', styleKey);

    const padLabelsLeft = ['VDD', 'VSS', 'WCLK', 'RCLK', 'MCLK', 'RST_N', 'SCAN_E', 'CS_N'];
    const padLabelsRight = ['MEM_W63', 'MEM_W0', 'VALID', 'OVF', 'P_ACK', 'MEM_R31', 'GNT_1', 'SCAN_O'];

    if (styleKey === 'option1' || styleKey === 'hybrid') {
      const leftPads = padLabelsLeft.map((lbl, i) => {
        const topPct = 12 + i * 10;
        const color = lbl.includes('VDD') ? '#FFB300' : lbl.includes('CLK') ? '#00E676' : '#00F0FF';
        return `
          <div class="desktop-only-pad" style="position:absolute; left:0; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:7px; height:10px; background:${color}18; border:1px solid ${color}88; border-left:none;"></div>
            <div style="width:5px; height:1px; background:${color}55;"></div>
            ${styleKey === 'hybrid' ? `<span style="font-size:6.5px; font-family:'JetBrains Mono',monospace; color:${color}77; margin-left:2px;">${lbl}</span>` : ''}
          </div>
        `;
      }).join('');

      const rightPads = padLabelsRight.map((lbl, i) => {
        const topPct = 12 + i * 10;
        const color = lbl.includes('P_ACK') ? '#FFB300' : lbl.includes('GNT') ? '#00E676' : '#FF2A85';
        return `
          <div class="desktop-only-pad" style="position:absolute; right:0; top:${topPct}%; display:flex; align-items:center;">
            ${styleKey === 'hybrid' ? `<span style="font-size:6.5px; font-family:'JetBrains Mono',monospace; color:${color}77; margin-right:2px;">${lbl}</span>` : ''}
            <div style="width:5px; height:1px; background:${color}55;"></div>
            <div style="width:7px; height:10px; background:${color}18; border:1px solid ${color}88; border-right:none;"></div>
          </div>
        `;
      }).join('');

      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 3px 3px 3px; border:1px solid rgba(0,240,255,0.16); pointer-events:none;"></div>
        <div class="chip-corner tl" style="border-top:2px solid #00F0FF; border-left:2px solid #00F0FF;"></div>
        <div class="chip-corner tr" style="border-top:2px solid #00F0FF; border-right:2px solid #00F0FF;"></div>
        <div class="chip-corner bl" style="border-bottom:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:2px solid #00E676; border-right:2px solid #00E676;"></div>
        ${leftPads}
        ${rightPads}
      `;
    } else if (styleKey === 'option2') {
      let pinsHTML = '';
      for (let i = 0; i < 12; i++) {
        const topPct = 10 + i * 7.2;
        pinsHTML += `
          <div class="desktop-only-pad" style="position:absolute; left:0; top:${topPct}%; width:9px; height:5px; background:#64748B; border:1px solid #94A3B8; border-left:none;"></div>
          <div class="desktop-only-pad" style="position:absolute; right:0; top:${topPct}%; width:9px; height:5px; background:#64748B; border:1px solid #94A3B8; border-right:none;"></div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 9px 6px 9px; border:1.5px solid rgba(100,116,139,0.4); border-radius:6px;"></div>
        <div style="position:absolute; top:30px; left:50%; transform:translateX(-50%); width:26px; height:11px; border:1.5px solid #00F0FF; border-top:none; border-radius:0 0 14px 14px;"></div>
        ${pinsHTML}
      `;
    } else if (styleKey === 'option3') {
      let rulerLeft = '';
      for (let um = 0; um <= 1000; um += 200) {
        const topPct = 8 + (um / 1000) * 84;
        rulerLeft += `
          <div class="desktop-only-pad" style="position:absolute; left:4px; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:5px; height:1px; background:#00E676;"></div>
            <span style="font-size:6.5px; font-family:'JetBrains Mono',monospace; color:#00E67688; margin-left:2px;">${um}u</span>
          </div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1px solid rgba(0,230,118,0.22);"></div>
        <div class="chip-corner tl" style="border-top:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner tr" style="border-top:2px solid #00E676; border-right:2px solid #00E676;"></div>
        <div class="chip-corner bl" style="border-bottom:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:2px solid #00E676; border-right:2px solid #00E676;"></div>
        ${rulerLeft}
      `;
    } else if (styleKey === 'option4') {
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1.5px solid rgba(255,179,0,0.35);"></div>
        <div style="position:absolute; inset:34px 8px 8px 8px; border:1.5px solid rgba(0,240,255,0.3);"></div>
        <div class="desktop-only-pad" style="position:absolute; bottom:10px; left:14px; font-family:'JetBrains Mono',monospace; font-size:7px; color:#FFB30099;">PDN: M8_VDD // M7_VSS</div>
      `;
    } else if (styleKey === 'option5') {
      let goldFingers = '';
      for (let i = 0; i < 22; i++) {
        goldFingers += `<div style="width:7px; height:9px; background:linear-gradient(180deg,#FFD54F,#FFB300); border-radius:1px 1px 0 0; margin:0 1.5px; opacity:0.65;"></div>`;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1px solid rgba(255,179,0,0.28);"></div>
        <div class="desktop-only-pad" style="position:absolute; bottom:4px; left:50%; transform:translateX(-50%); display:flex; align-items:flex-end;">
          ${goldFingers}
        </div>
      `;
    }
  }

  // 4. Create Compact Floating Pill Button (Starts Minimized so it never clutters the view)
  const switcherEl = document.createElement('div');
  switcherEl.id = 'chip-style-switcher';
  switcherEl.innerHTML = `
    <!-- Compact Pill Trigger -->
    <button type="button" id="chip-pill-trigger" class="switcher-card backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg text-[11px] flex items-center gap-1.5 hover:scale-105 transition">
      <span class="text-cyan-400">&#9881;</span>
      <span>Chip Frame</span>
    </button>

    <!-- Popover Menu (Hidden by Default) -->
    <div id="chip-popover-panel" class="hidden switcher-card backdrop-blur-md rounded-xl p-2.5 shadow-2xl text-xs w-56 mt-2">
      <div class="flex items-center justify-between gap-2 mb-2 px-1 border-b border-slate-700/50 pb-1.5">
        <span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Die Frame Style</span>
        <button type="button" id="close-border-panel" class="text-[10px] text-slate-400 hover:text-rose-400">&#10005;</button>
      </div>
      <div class="grid grid-cols-1 gap-1 text-[10.5px]">
        <button type="button" data-style="hybrid" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">★ Hybrid Pad Ring (7px)</button>
        <button type="button" data-style="option1" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">1. Die Seal &amp; Pads</button>
        <button type="button" data-style="option2" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">2. QFP IC Package Pins</button>
        <button type="button" data-style="option3" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">3. GDSII Micron Rulers</button>
        <button type="button" data-style="option4" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">4. VDD / VSS Power Ring</button>
        <button type="button" data-style="option5" class="chip-mode-btn px-2.5 py-1.5 rounded text-left transition">5. PCB Gold Fingers</button>
      </div>
    </div>
  `;
  document.body.appendChild(switcherEl);

  const pillTrigger = document.getElementById('chip-pill-trigger');
  const popoverPanel = document.getElementById('chip-popover-panel');
  const closeBtn = document.getElementById('close-border-panel');

  pillTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverPanel.classList.toggle('hidden');
    pillTrigger.classList.toggle('hidden');
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverPanel.classList.add('hidden');
    pillTrigger.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!switcherEl.contains(e.target)) {
      popoverPanel.classList.add('hidden');
      pillTrigger.classList.remove('hidden');
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

  // Initialize on page load
  renderViewportFrame(DEFAULT_STYLE);
  updateSwitcherHighlight(DEFAULT_STYLE);
})();
