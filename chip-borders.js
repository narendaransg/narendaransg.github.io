/**
 * chip-borders.js
 * Modular ASIC / IC Chip Viewport & Card Border Engine for Narendaran S G
 * Automatically injects:
 *   1. Outer Viewport Chip Frame (Pad Ring, IC Leads, GDSII Rulers, PDN Ring, or PCB Gold Fingers)
 *   2. Card-Level Macro / Via / Pin-Tick Borders on all .eda-border elements
 *   3. Floating Bottom-Right Style Selector to preview & lock in your favorite chip border
 */

(function initChipBordersModule() {
  // Default active style ('option1' | 'option2' | 'option3' | 'option4' | 'option5' | 'hybrid')
  const DEFAULT_STYLE = localStorage.getItem('narendaran_chip_border_style') || 'hybrid';

  // 1. Inject Modular CSS for All 5 Chip Border Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'asic-chip-borders-css';
  styleEl.textContent = `
    /* Give body breathing room for the outer chip frame */
    body {
      padding-left: 22px;
      padding-right: 22px;
      padding-bottom: 24px;
    }
    @media (max-width: 640px) {
      body {
        padding-left: 10px;
        padding-right: 10px;
      }
    }

    /* Fixed Viewport Overlay Frame */
    #chip-viewport-frame {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 45;
      overflow: hidden;
    }

    /* Corner Fiducials / Seal Rings */
    .chip-corner {
      position: absolute;
      width: 28px;
      height: 28px;
      pointer-events: none;
      z-index: 46;
      transition: all 0.3s ease;
    }
    .chip-corner.tl { top: 32px; left: 6px; }
    .chip-corner.tr { top: 32px; right: 6px; }
    .chip-corner.bl { bottom: 6px; left: 6px; }
    .chip-corner.br { bottom: 6px; right: 6px; }

    /* =====================================================================
       OPTION 1 & HYBRID: DIE PAD RING & HARD MACRO PIN-TICK CARDS
       ===================================================================== */
    body[data-chip-style="option1"] .eda-border,
    body[data-chip-style="hybrid"] .eda-border {
      position: relative;
      border-radius: 4px !important;
      clip-path: polygon(
        0 10px, 10px 0,
        calc(100% - 10px) 0, 100% 10px,
        100% calc(100% - 10px), calc(100% - 10px) 100%,
        10px 100%, 0 calc(100% - 10px)
      );
      border: 1px solid rgba(0, 240, 255, 0.32) !important;
      background-image:
        repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.45) 0px, rgba(0, 240, 255, 0.45) 4px, transparent 4px, transparent 18px),
        repeating-linear-gradient(90deg, rgba(255, 42, 133, 0.45) 0px, rgba(255, 42, 133, 0.45) 4px, transparent 4px, transparent 18px);
      background-position: top center, bottom center;
      background-size: calc(100% - 36px) 3px, calc(100% - 36px) 3px;
      background-repeat: no-repeat;
    }
    body[data-chip-style="option1"] .eda-border::before,
    body[data-chip-style="hybrid"] .eda-border::before {
      content: "MACRO_BLK // M5_M6_PINS";
      position: absolute;
      top: 4px;
      right: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      letter-spacing: 0.08em;
      color: rgba(0, 240, 255, 0.42);
      pointer-events: none;
    }

    /* =====================================================================
       OPTION 2: QFP / QFN PACKAGED IC CHIP LEADS & PIN-1 NOTCH
       ===================================================================== */
    body[data-chip-style="option2"] .eda-border {
      position: relative;
      border-radius: 6px !important;
      border: 2px solid #334155 !important;
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.06),
        -6px 0 0 -2px rgba(148, 163, 184, 0.35),
        6px 0 0 -2px rgba(148, 163, 184, 0.35) !important;
    }
    /* Pin-1 Laser Dot on Every Card */
    body[data-chip-style="option2"] .eda-border::after {
      content: "";
      position: absolute;
      top: 10px;
      left: 10px;
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background: #00F0FF;
      box-shadow: 0 0 8px #00F0FF;
      pointer-events: none;
    }

    /* =====================================================================
       OPTION 3: GDSII POLYGON & PHOTOMASK RETICLE (VIA56 CORNERS)
       ===================================================================== */
    body[data-chip-style="option3"] .eda-border {
      position: relative;
      border-radius: 0px !important;
      border: 1px solid rgba(0, 230, 118, 0.4) !important;
      outline: 1px dashed rgba(0, 240, 255, 0.22);
      outline-offset: 4px;
    }
    body[data-chip-style="option3"] .eda-border::before {
      content: "";
      position: absolute;
      inset: -4px;
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
      background-size: 10px 10px;
    }

    /* =====================================================================
       OPTION 4: VDD / VSS POWER DELIVERY RING (PDN STRAPS)
       ===================================================================== */
    body[data-chip-style="option4"] .eda-border {
      position: relative;
      border-radius: 4px !important;
      border-top: 3px solid #FFB300 !important;    /* M8 VDD Rail */
      border-bottom: 3px solid #00F0FF !important; /* M7 VSS Rail */
      border-left: 1px solid rgba(255, 179, 0, 0.35) !important;
      border-right: 1px solid rgba(0, 240, 255, 0.35) !important;
    }
    body[data-chip-style="option4"] .eda-border::before {
      content: "VDD (M8)";
      position: absolute;
      top: 2px;
      right: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #FFB300;
      opacity: 0.7;
      pointer-events: none;
    }

    /* =====================================================================
       OPTION 5: PCB GOLD-FINGER & CHAMFERED COPPER TRACE
       ===================================================================== */
    body[data-chip-style="option5"] .eda-border {
      position: relative;
      border-radius: 2px !important;
      border: 1px solid rgba(255, 179, 0, 0.45) !important;
      background-image: repeating-linear-gradient(
        90deg,
        #FFB300 0px,
        #FFB300 6px,
        transparent 6px,
        transparent 12px
      );
      background-size: 140px 4px;
      background-position: bottom right;
      background-repeat: no-repeat;
    }

    /* Floating Chip-Border Switcher Widget (Bottom Right) */
    #chip-style-switcher {
      position: fixed;
      bottom: 18px;
      right: 26px;
      z-index: 60;
      font-family: 'JetBrains Mono', monospace;
    }
  `;
  document.head.appendChild(styleEl);

  // 2. Create Viewport Chip Frame Container
  const frameEl = document.createElement('div');
  frameEl.id = 'chip-viewport-frame';
  document.body.appendChild(frameEl);

  // 3. Render Viewport Frame SVG/HTML Based on Selected Option
  function renderViewportFrame(styleKey) {
    document.body.setAttribute('data-chip-style', styleKey);
    localStorage.setItem('narendaran_chip_border_style', styleKey);

    const padLabelsLeft = ['VDD_CORE', 'VSS_CORE', 'WCLK_IN', 'RCLK_IN', 'MCLK_4NS', 'RST_N', 'SCAN_EN', 'SCAN_IN', 'CS_N[0]', 'CS_N[1]'];
    const padLabelsRight = ['MEM_W[63]', 'MEM_W[0]', 'MEM_VALID', 'MEM_OVF', 'PWR_ACK', 'MEM_R[31]', 'MEM_R[0]', 'ARB_GNT[1]', 'ARB_GNT[0]', 'SCAN_OUT'];

    if (styleKey === 'option1' || styleKey === 'hybrid') {
      // Die I/O Pad Ring + Micron Ruler Ticks (Hybrid / Option 1)
      const leftPads = padLabelsLeft.map((lbl, i) => {
        const topPct = 10 + i * 8.2;
        const color = lbl.includes('VDD') ? '#FFB300' : lbl.includes('CLK') ? '#00E676' : '#00F0FF';
        return `
          <div style="position:absolute; left:0; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:12px; height:16px; background:${color}22; border:1.5px solid ${color}; border-left:none; box-shadow:0 0 8px ${color}44;"></div>
            <div style="width:8px; height:1px; background:${color}88;"></div>
            ${styleKey === 'hybrid' ? `<span style="font-size:8px; font-family:'JetBrains Mono',monospace; color:${color}99; margin-left:2px;">${lbl}</span>` : ''}
          </div>
        `;
      }).join('');

      const rightPads = padLabelsRight.map((lbl, i) => {
        const topPct = 10 + i * 8.2;
        const color = lbl.includes('PWR') ? '#FFB300' : lbl.includes('ARB') ? '#00E676' : '#FF2A85';
        return `
          <div style="position:absolute; right:0; top:${topPct}%; display:flex; align-items:center;">
            ${styleKey === 'hybrid' ? `<span style="font-size:8px; font-family:'JetBrains Mono',monospace; color:${color}99; margin-right:2px;">${lbl}</span>` : ''}
            <div style="width:8px; height:1px; background:${color}88;"></div>
            <div style="width:12px; height:16px; background:${color}22; border:1.5px solid ${color}; border-right:none; box-shadow:0 0 8px ${color}44;"></div>
          </div>
        `;
      }).join('');

      frameEl.innerHTML = `
        <!-- Outer Die Seal Ring -->
        <div style="position:absolute; inset:30px 4px 4px 4px; border:1px solid rgba(0,240,255,0.22); pointer-events:none;"></div>
        <div style="position:absolute; inset:33px 7px 7px 7px; border:1px dashed rgba(255,42,133,0.16); pointer-events:none;"></div>
        <!-- Corner L-Fiducials -->
        <div class="chip-corner tl" style="border-top:3px solid #00F0FF; border-left:3px solid #00F0FF;"></div>
        <div class="chip-corner tr" style="border-top:3px solid #00F0FF; border-right:3px solid #00F0FF;"></div>
        <div class="chip-corner bl" style="border-bottom:3px solid #00E676; border-left:3px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:3px solid #00E676; border-right:3px solid #00E676;"></div>
        ${leftPads}
        ${rightPads}
      `;
    } else if (styleKey === 'option2') {
      // QFP / QFN IC Package Metallic Gull-Wing Leads
      let pinsHTML = '';
      for (let i = 0; i < 14; i++) {
        const topPct = 8 + i * 6.4;
        pinsHTML += `
          <div style="position:absolute; left:0; top:${topPct}%; width:14px; height:8px; background:linear-gradient(90deg,#94A3B8,#475569); border:1px solid #CBD5E1; border-left:none; border-radius:0 2px 2px 0;"></div>
          <div style="position:absolute; right:0; top:${topPct}%; width:14px; height:8px; background:linear-gradient(270deg,#94A3B8,#475569); border:1px solid #CBD5E1; border-right:none; border-radius:2px 0 0 2px;"></div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:32px 14px 8px 14px; border:2px solid #475569; border-radius:8px;"></div>
        <!-- Top Center IC Package Pin-1 Notch -->
        <div style="position:absolute; top:32px; left:50%; transform:translateX(-50%); width:36px; height:16px; border:2px solid #00F0FF; border-top:none; border-radius:0 0 20px 20px; background:#050811;"></div>
        ${pinsHTML}
      `;
    } else if (styleKey === 'option3') {
      // GDSII Reticle & Micron Rulers
      let rulerLeft = '';
      for (let um = 0; um <= 1000; um += 100) {
        const topPct = 6 + (um / 1000) * 88;
        rulerLeft += `
          <div style="position:absolute; left:4px; top:${topPct}%; display:flex; align-items:center;">
            <div style="width:8px; height:1px; background:#00E676;"></div>
            <span style="font-size:8px; font-family:'JetBrains Mono',monospace; color:#00E67699; margin-left:3px;">${um}u</span>
          </div>
        `;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:32px 6px 6px 6px; border:1px solid rgba(0,230,118,0.28);"></div>
        <div class="chip-corner tl" style="border-top:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner tr" style="border-top:2px solid #00E676; border-right:2px solid #00E676;"></div>
        <div class="chip-corner bl" style="border-bottom:2px solid #00E676; border-left:2px solid #00E676;"></div>
        <div class="chip-corner br" style="border-bottom:2px solid #00E676; border-right:2px solid #00E676;"></div>
        ${rulerLeft}
      `;
    } else if (styleKey === 'option4') {
      // Dual VDD (M8 Amber) & VSS (M7 Cyan) Power Delivery Ring
      frameEl.innerHTML = `
        <!-- Outer VDD M8 Ring -->
        <div style="position:absolute; inset:32px 5px 5px 5px; border:2.5px solid rgba(255,179,0,0.45); box-shadow:0 0 12px rgba(255,179,0,0.18);"></div>
        <!-- Inner VSS M7 Ring -->
        <div style="position:absolute; inset:38px 11px 11px 11px; border:2px solid rgba(0,240,255,0.4); box-shadow:0 0 12px rgba(0,240,255,0.15);"></div>
        <div style="position:absolute; bottom:14px; left:18px; font-family:'JetBrains Mono',monospace; font-size:9px; color:#FFB300;">PDN_RING: M8_VDD (4.64um) // M7_VSS (1.104um)</div>
      `;
    } else if (styleKey === 'option5') {
      // PCB Gold-Finger Edge Connector
      let goldFingers = '';
      for (let i = 0; i < 28; i++) {
        goldFingers += `<div style="width:10px; height:14px; background:linear-gradient(180deg,#FFD54F,#FFB300); border-radius:2px 2px 0 0; margin:0 2px;"></div>`;
      }
      frameEl.innerHTML = `
        <div style="position:absolute; inset:32px 6px 6px 6px; border:1.5px solid rgba(255,179,0,0.35);"></div>
        <div style="position:absolute; bottom:6px; left:50%; transform:translateX(-50%); display:flex; align-items:flex-end;">
          ${goldFingers}
        </div>
      `;
    }
  }

  // 4. Create Floating Bottom-Right Switcher UI so you can preview & pick live
  const switcherEl = document.createElement('div');
  switcherEl.id = 'chip-style-switcher';
  switcherEl.innerHTML = `
    <div class="bg-[#0B101E]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl text-xs">
      <div class="flex items-center justify-between gap-3 mb-1.5 px-1">
        <span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Chip Frame Style</span>
        <button id="toggle-border-panel" class="text-[10px] text-slate-400 hover:text-white">[Minimize]</button>
      </div>
      <div id="border-options-list" class="grid grid-cols-2 gap-1 text-[10.5px]">
        <button data-style="hybrid" class="chip-mode-btn px-2 py-1 rounded text-left bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">★ Hybrid Pad Ring</button>
        <button data-style="option1" class="chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800">1. Die Pad Ring</button>
        <button data-style="option2" class="chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800">2. QFP IC Pins</button>
        <button data-style="option3" class="chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800">3. GDSII Rulers</button>
        <button data-style="option4" class="chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800">4. VDD/VSS Ring</button>
        <button data-style="option5" class="chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800">5. Gold Fingers</button>
      </div>
    </div>
  `;
  document.body.appendChild(switcherEl);

  function updateSwitcherHighlight(activeKey) {
    document.querySelectorAll('.chip-mode-btn').forEach(btn => {
      if (btn.getAttribute('data-style') === activeKey) {
        btn.className = 'chip-mode-btn px-2 py-1 rounded text-left bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-semibold';
      } else {
        btn.className = 'chip-mode-btn px-2 py-1 rounded text-left bg-slate-900 text-slate-300 hover:text-white border border-slate-800';
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

  const toggleBtn = document.getElementById('toggle-border-panel');
  const listEl = document.getElementById('border-options-list');
  toggleBtn.addEventListener('click', () => {
    if (listEl.style.display === 'none') {
      listEl.style.display = 'grid';
      toggleBtn.textContent = '[Minimize]';
    } else {
      listEl.style.display = 'none';
      toggleBtn.textContent = '[Expand]';
    }
  });

  // Initialize on page load
  renderViewportFrame(DEFAULT_STYLE);
  updateSwitcherHighlight(DEFAULT_STYLE);
})();
