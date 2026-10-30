/**
 * silicon-addons.js (v2 — Multi-View Router Aware, Mobile-Responsive & Light/Dark Theme Ready)
 * Modular Engineering & Recruiter UX Add-On Suite for Narendaran S G
 */

(function initSiliconAddons() {
  // ===========================================================================
  // 0. INJECT ADD-ON STYLES (DARK/LIGHT + MOBILE SAFE)
  // ===========================================================================
  const style = document.createElement('style');
  style.id = 'silicon-addons-styles';
  style.textContent = `
    /* 1.5s Silicon Boot Overlay */
    #silicon-boot-overlay {
      position: fixed;
      inset: 0;
      background: #050811;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      transition: opacity 0.4s ease, visibility 0.4s ease;
    }
    #silicon-boot-overlay.boot-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .wafer-ring {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 2px solid rgba(0, 240, 255, 0.4);
      background:
        linear-gradient(90deg, rgba(0,240,255,0.12) 1px, transparent 1px),
        linear-gradient(0deg, rgba(0,230,118,0.12) 1px, transparent 1px);
      background-size: 12px 12px;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.25), inset 0 0 18px rgba(0, 240, 255, 0.2);
      position: relative;
      animation: pulseWafer 1.1s ease-in-out infinite alternate;
    }
    .wafer-ring::after {
      content: "";
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px dashed #00E676;
      animation: spinWafer 3s linear infinite;
    }
    @keyframes spinWafer { 100% { transform: rotate(360deg); } }
    @keyframes pulseWafer { 0% { transform: scale(0.96); } 100% { transform: scale(1.04); } }

    /* Before / After Layout Slider */
    .ba-slider-wrap {
      position: relative;
      user-select: none;
      overflow: hidden;
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 240, 255, 0.3);
      background: #050811;
      aspect-ratio: 16 / 9;
      width: 100%;
    }
    .ba-before-layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .ba-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #00F0FF;
      box-shadow: 0 0 10px #00F0FF;
      pointer-events: none;
    }
    .ba-knob {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: #050811;
      border: 2px solid #00F0FF;
      color: #00F0FF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      box-shadow: 0 0 14px rgba(0, 240, 255, 0.6);
    }

    /* Code Drawer Slide-Over */
    #code-snippet-drawer {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: none;
    }
    #code-snippet-drawer.open {
      display: flex;
    }

    /* Command Palette (Ctrl+K) */
    #cmd-palette-modal {
      position: fixed;
      inset: 0;
      z-index: 90;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
      background: rgba(5, 8, 17, 0.78);
      backdrop-filter: blur(6px);
    }
    #cmd-palette-modal.open {
      display: flex;
    }
  `;
  document.head.appendChild(style);

  // ===========================================================================
  // 1. 1.5-SECOND 3D SILICON WAFER BOOT / SIGNOFF SEQUENCE
  // ===========================================================================
  function runSiliconBootAnimation() {
    if (sessionStorage.getItem('narendaran_boot_shown')) return;
    sessionStorage.setItem('narendaran_boot_shown', '1');

    const bootEl = document.createElement('div');
    bootEl.id = 'silicon-boot-overlay';
    bootEl.innerHTML = `
      <div class="wafer-ring mb-5"></div>
      <div class="text-[10px] sm:text-xs text-cyan-400 tracking-widest uppercase mb-1.5">NARENDARAN_S_G // SILICON SIGNOFF INITIALIZATION</div>
      <div id="boot-step-text" class="text-xs sm:text-sm text-emerald-400 font-bold">[1/4] CHECKING PHYSICAL DRC... 0 VIOLATIONS (CLEAN)</div>
      <div class="w-56 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
        <div id="boot-bar" class="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300" style="width: 25%"></div>
      </div>
      <button type="button" id="skip-boot-btn" class="mt-5 text-[11px] text-slate-400 hover:text-white underline">Skip Intro [ESC]</button>
    `;
    document.body.appendChild(bootEl);

    const steps = [
      { pct: '55%', text: '[2/4] VERIFYING LVS & PG MESH (M1-M8)... MATCH' },
      { pct: '85%', text: '[3/4] TIMING SIGNOFF... MET (+0.16ns WNS / 0.00ns SKEW)' },
      { pct: '100%', text: '[4/4] MOUNTING MULTI-VIEW SILICON WORKSPACE...' }
    ];

    let i = 0;
    const stepText = document.getElementById('boot-step-text');
    const bootBar = document.getElementById('boot-bar');

    const timer = setInterval(() => {
      if (i < steps.length) {
        if (stepText) stepText.textContent = steps[i].text;
        if (bootBar) bootBar.style.width = steps[i].pct;
        i++;
      } else {
        clearInterval(timer);
        bootEl.classList.add('boot-hidden');
        setTimeout(() => bootEl.remove(), 450);
      }
    }, 340);

    document.getElementById('skip-boot-btn').addEventListener('click', () => {
      clearInterval(timer);
      bootEl.classList.add('boot-hidden');
      setTimeout(() => bootEl.remove(), 350);
    });
  }

  // ===========================================================================
  // 2. LIVE GTKWAVE / VCD WAVEFORM VIEWER (HOOKED TO BUS ARBITER SIMULATOR)
  // ===========================================================================
  const waveHistory = [
    { cycle: 0, clk: 1, req_cpu: 1, req_dma: 1, req_periph: 0, wait_cnt: 0, grant: "CPU" }
  ];

  function injectGtkWaveViewer() {
    const arbLogEl = document.getElementById('arb-log-line');
    if (!arbLogEl) return;

    const waveBox = document.createElement('div');
    waveBox.className = 'mt-3 p-3 rounded-lg bg-[#04070F] border border-cyan-500/30 font-mono text-[10px] space-y-1.5 overflow-x-auto';
    waveBox.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-1 text-slate-400">
        <span class="text-emerald-400 font-semibold">&#9679; LIVE GTKWAVE / VCD SIGNAL TRACE</span>
        <span class="text-[9.5px]">clk, req_cpu, req_dma, wait_cnt, grant[1:0]</span>
      </div>
      <canvas id="gtkwave-canvas" width="500" height="128" class="w-full min-w-[320px] h-[128px] rounded bg-[#050811] border border-slate-800/80"></canvas>
    `;
    arbLogEl.parentNode.insertBefore(waveBox, arbLogEl.nextSibling);
    drawGtkWave();
  }

  function drawGtkWave() {
    const canvas = document.getElementById('gtkwave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const labelW = 80;
    const maxSamples = 10;
    const samples = waveHistory.slice(-maxSamples);
    const stepW = (W - labelW - 10) / maxSamples;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= maxSamples; i++) {
      const x = labelW + i * stepW;
      ctx.beginPath();
      ctx.moveTo(x, 4);
      ctx.lineTo(x, H - 4);
      ctx.stroke();
    }

    const signals = [
      { name: 'clk', type: 'clk', yTop: 8, yBot: 21, color: '#00F0FF' },
      { name: 'req_cpu', key: 'req_cpu', yTop: 30, yBot: 43, color: '#38BDF8' },
      { name: 'req_dma', key: 'req_dma', yTop: 52, yBot: 65, color: '#00E676' },
      { name: 'wait_cnt', key: 'wait_cnt', type: 'bus', yTop: 75, yBot: 91, color: '#FFB300' },
      { name: 'grant[1:0]', key: 'grant', type: 'bus', yTop: 101, yBot: 117, color: '#FF2A85' }
    ];

    ctx.font = '9.5px "JetBrains Mono", monospace';

    signals.forEach(sig => {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(sig.name, 5, (sig.yTop + sig.yBot) / 2 + 3);

      ctx.strokeStyle = sig.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      samples.forEach((s, idx) => {
        const x0 = labelW + idx * stepW;
        const xMid = x0 + stepW * 0.5;
        const x1 = x0 + stepW;

        if (sig.type === 'clk') {
          ctx.moveTo(x0, sig.yBot);
          ctx.lineTo(x0, sig.yTop);
          ctx.lineTo(xMid, sig.yTop);
          ctx.lineTo(xMid, sig.yBot);
          ctx.lineTo(x1, sig.yBot);
        } else if (sig.type === 'bus') {
          ctx.strokeRect(x0 + 1, sig.yTop, stepW - 2, sig.yBot - sig.yTop);
          ctx.fillStyle = sig.color;
          const valStr = String(s[sig.key]).replace(/\s*\(.*\)/, '');
          ctx.fillText(valStr.substring(0, 4), x0 + 4, sig.yBot - 4);
        } else {
          const val = s[sig.key] ? 1 : 0;
          const y = val ? sig.yTop : sig.yBot;
          if (idx === 0) {
            ctx.moveTo(x0, y);
          } else {
            const prevVal = samples[idx - 1][sig.key] ? 1 : 0;
            const prevY = prevVal ? sig.yTop : sig.yBot;
            if (prevY !== y) ctx.lineTo(x0, y);
          }
          ctx.lineTo(x1, y);
        }
      });
      ctx.stroke();
    });
  }

  function hookArbiterWaveform() {
    if (typeof window.stepArbiterClock === 'function') {
      const origStep = window.stepArbiterClock;
      window.stepArbiterClock = function() {
        origStep();
        if (typeof arbState !== 'undefined') {
          const grantTxt = document.getElementById('arb-grant')?.textContent || 'CPU';
          waveHistory.push({
            cycle: arbState.cycle,
            clk: 1,
            req_cpu: arbState.req_cpu ? 1 : 0,
            req_dma: arbState.req_dma ? 1 : 0,
            req_periph: arbState.req_periph ? 1 : 0,
            wait_cnt: arbState.wait_cnt,
            grant: grantTxt
          });
          drawGtkWave();
        }
      };
    }
    if (typeof window.resetArbiter === 'function') {
      const origReset = window.resetArbiter;
      window.resetArbiter = function() {
        origReset();
        waveHistory.length = 0;
        waveHistory.push({ cycle: 0, clk: 1, req_cpu: 1, req_dma: 1, req_periph: 0, wait_cnt: 0, grant: 'CPU' });
        drawGtkWave();
      };
    }
  }

  // ===========================================================================
  // 3. BEFORE / AFTER LAYOUT SLIDER + INTERACTIVE STA SLACK CALCULATOR
  // ===========================================================================
  const baBlocks = {
    gprs: {
      beforeImg: "assets/gprs_macro_flylines.jpg",
      beforeLabel: "BEFORE: Floorplan & 16-Macro Flylines (21.18% Util)",
      afterImg: "assets/gprs_routing.jpg",
      afterLabel: "AFTER: 10-Layer Detailed Route (66.25% Util, 0 Shorts)"
    },
    fifo: {
      beforeImg: "assets/fifo_powerplan.png",
      beforeLabel: "BEFORE: M7/M8 + M2 Power Delivery Mesh (0 PG DRC)",
      afterImg: "assets/fifo_routing.png",
      afterLabel: "AFTER: Dual-CTS & Routed Layout (0 DRC, +0.16ns WNS)"
    }
  };

  function syncBeforeImageWidth() {
    const sliderBox = document.getElementById('ba-slider-box');
    const beforeImg = document.getElementById('ba-before-img');
    if (sliderBox && beforeImg && sliderBox.clientWidth > 0) {
      beforeImg.style.width = sliderBox.clientWidth + 'px';
    }
  }

  function injectLayoutSliderAndStaSection() {
    const labContainer = document.getElementById('interactive-lab');
    if (!labContainer) return;

    const addonGrid = document.createElement('div');
    addonGrid.id = 'signoff-simulators-row';
    addonGrid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2';
    addonGrid.innerHTML = `
      <!-- WIDGET C: BEFORE / AFTER LAYOUT SPLIT-SCREEN SLIDER -->
      <div class="lg:col-span-6 rounded-xl p-5 sm:p-6 eda-border flex flex-col justify-between space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-xs font-mono text-metal-m5 uppercase">BEFORE vs. AFTER SILICON TRANSFORMATION</div>
            <h3 class="text-lg sm:text-xl font-bold text-white mt-0.5">Floorplan / PDN vs. Final Routed GDSII</h3>
          </div>
          <div class="inline-flex rounded bg-silicon-950 p-1 border border-slate-800 font-mono text-[11px]">
            <button type="button" id="ba-btn-gprs" class="px-2.5 py-1 rounded bg-metal-m5 text-silicon-950 font-bold">gprs_top</button>
            <button type="button" id="ba-btn-fifo" class="px-2.5 py-1 rounded text-slate-300 hover:text-white">Async FIFO</button>
          </div>
        </div>

        <p class="text-xs text-slate-400">
          Drag the cyan slider handle left and right to compare my early unrouted floorplan/power mesh against the final 10-layer detailed routed layout (<span class="font-mono text-white">route_opt_done.design</span>).
        </p>

        <div class="ba-slider-wrap" id="ba-slider-box">
          <img id="ba-after-img" src="assets/gprs_routing.jpg" alt="After Routing" class="w-full h-full object-cover" />
          <span id="ba-after-tag" class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-silicon-950/90 border border-metal-m3/50 text-[9.5px] font-mono text-metal-m3">
            AFTER: 10-Layer Detailed Route (0 Shorts)
          </span>

          <div id="ba-before-clip" class="ba-before-layer" style="width: 50%;">
            <img id="ba-before-img" src="assets/gprs_macro_flylines.jpg" alt="Before Floorplan" class="w-full h-full object-cover max-w-none" />
            <span id="ba-before-tag" class="absolute top-2 left-2 px-2 py-0.5 rounded bg-silicon-950/90 border border-metal-m5/50 text-[9.5px] font-mono text-metal-m5">
              BEFORE: Floorplan &amp; Macro Flylines
            </span>
          </div>

          <div id="ba-divider-line" class="ba-handle" style="left: 50%;">
            <div class="ba-knob">&harr;</div>
          </div>

          <input id="ba-range-input" type="range" min="2" max="98" value="50" aria-label="Before and After Layout Slider" class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
        </div>
      </div>

      <!-- WIDGET D: INTERACTIVE STATIC TIMING ANALYSIS (STA) SLACK CALCULATOR -->
      <div class="lg:col-span-6 rounded-xl p-5 sm:p-6 eda-border flex flex-col justify-between space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-xs font-mono text-metal-m8 uppercase">INTERACTIVE STA TIMING PATH ENGINE</div>
            <h3 class="text-lg sm:text-xl font-bold text-white mt-0.5">Setup &amp; Hold Slack Calculator</h3>
          </div>
          <div class="flex flex-wrap gap-1.5 font-mono text-[10.5px]">
            <button type="button" onclick="loadStaPreset('fifo')" class="px-2 py-1 rounded bg-silicon-800 border border-metal-m3/40 text-metal-m3 hover:bg-metal-m3/10">Preset: FIFO (1.5ns)</button>
            <button type="button" onclick="loadStaPreset('gprs')" class="px-2 py-1 rounded bg-silicon-800 border border-metal-m5/40 text-metal-m5 hover:bg-metal-m5/10">Preset: GPRS (4.0ns)</button>
          </div>
        </div>

        <div class="p-2.5 rounded-lg bg-silicon-950 border border-slate-800 font-mono text-[10px] flex flex-wrap items-center justify-between gap-1 text-center">
          <div class="px-2 py-1 rounded bg-silicon-900 border border-cyan-500/40 text-cyan-300 flex-1">
            <div class="font-bold">FF1 (Launch)</div>
            <div class="text-[9px] text-slate-400">T_ck2q=0.12ns</div>
          </div>
          <div class="text-slate-500">&rarr;</div>
          <div class="px-2 py-1 rounded bg-silicon-900 border border-amber-400/40 text-amber-300 flex-1">
            <div class="font-bold">Comb + Route</div>
            <div id="sta-comb-label" class="text-[9px] text-slate-300">T_comb=1.14ns</div>
          </div>
          <div class="text-slate-500">&rarr;</div>
          <div class="px-2 py-1 rounded bg-silicon-900 border border-emerald-400/40 text-emerald-300 flex-1">
            <div class="font-bold">FF2 (Capture)</div>
            <div class="text-[9px] text-slate-400">Tsu=0.08|Th=0.05</div>
          </div>
        </div>

        <div class="space-y-2.5 font-mono text-xs">
          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span class="text-slate-400">Clock Period (T_clk):</span>
              <span id="val-sta-period" class="text-metal-m5 font-bold">1.50 ns</span>
            </div>
            <input id="slider-sta-period" type="range" min="0.80" max="5.00" step="0.05" value="1.50" oninput="updateStaCalculator()" class="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span class="text-slate-400">Combinational + Route Delay (T_comb):</span>
              <span id="val-sta-comb" class="text-metal-m8 font-bold">1.14 ns</span>
            </div>
            <input id="slider-sta-comb" type="range" min="0.02" max="4.20" step="0.02" value="1.14" oninput="updateStaCalculator()" class="w-full accent-amber-400 cursor-pointer" />
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-0.5">
              <span class="text-slate-400">Clock Skew (T_skew):</span>
              <span id="val-sta-skew" class="text-metal-m3 font-bold">0.00 ns</span>
            </div>
            <input id="slider-sta-skew" type="range" min="-0.30" max="0.40" step="0.01" value="0.00" oninput="updateStaCalculator()" class="w-full accent-emerald-400 cursor-pointer" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
          <div id="sta-setup-card" class="p-3 rounded-lg bg-silicon-950 border border-emerald-500/40">
            <div class="text-[10px] text-slate-400">SETUP SLACK (WNS)</div>
            <div id="sta-setup-val" class="text-base sm:text-lg font-bold text-metal-m3">+0.16 ns (MET)</div>
            <div class="text-[9.5px] text-slate-500 mt-0.5">T_req - T_arr &ge; 0</div>
          </div>

          <div id="sta-hold-card" class="p-3 rounded-lg bg-silicon-950 border border-emerald-500/40">
            <div class="text-[10px] text-slate-400">HOLD SLACK</div>
            <div id="sta-hold-val" class="text-base sm:text-lg font-bold text-metal-m3">+1.21 ns (MET)</div>
            <div class="text-[9.5px] text-slate-500 mt-0.5">T_arr - (T_skew + T_h) &ge; 0</div>
          </div>
        </div>
      </div>
    `;

    labContainer.appendChild(addonGrid);

    const rangeInput = document.getElementById('ba-range-input');
    const beforeClip = document.getElementById('ba-before-clip');
    const dividerLine = document.getElementById('ba-divider-line');

    window.addEventListener('resize', syncBeforeImageWidth);
    setTimeout(syncBeforeImageWidth, 150);

    rangeInput.addEventListener('input', (e) => {
      const pct = e.target.value + '%';
      beforeClip.style.width = pct;
      dividerLine.style.left = pct;
      syncBeforeImageWidth();
    });

    document.getElementById('ba-btn-gprs').addEventListener('click', () => switchBaBlock('gprs'));
    document.getElementById('ba-btn-fifo').addEventListener('click', () => switchBaBlock('fifo'));

    // Hook into switchPageView so whenever the user opens '03.Silicon_Lab', the slider width syncs immediately
    if (typeof window.switchPageView === 'function') {
      const origSwitchView = window.switchPageView;
      window.switchPageView = function(viewKey, evt) {
        origSwitchView(viewKey, evt);
        if (viewKey === 'lab') {
          setTimeout(syncBeforeImageWidth, 220);
          setTimeout(drawGtkWave, 220);
        }
      };
    }

    updateStaCalculator();
  }

  function switchBaBlock(key) {
    const b = baBlocks[key];
    document.getElementById('ba-before-img').src = b.beforeImg;
    document.getElementById('ba-after-img').src = b.afterImg;
    document.getElementById('ba-before-tag').textContent = b.beforeLabel;
    document.getElementById('ba-after-tag').textContent = b.afterLabel;

    const btnG = document.getElementById('ba-btn-gprs');
    const btnF = document.getElementById('ba-btn-fifo');
    if (key === 'gprs') {
      btnG.className = 'px-2.5 py-1 rounded bg-metal-m5 text-silicon-950 font-bold';
      btnF.className = 'px-2.5 py-1 rounded text-slate-300 hover:text-white';
    } else {
      btnF.className = 'px-2.5 py-1 rounded bg-metal-m5 text-silicon-950 font-bold';
      btnG.className = 'px-2.5 py-1 rounded text-slate-300 hover:text-white';
    }
    setTimeout(syncBeforeImageWidth, 50);
  }

  window.loadStaPreset = function(preset) {
    const pSlider = document.getElementById('slider-sta-period');
    const cSlider = document.getElementById('slider-sta-comb');
    const sSlider = document.getElementById('slider-sta-skew');
    if (preset === 'fifo') {
      pSlider.value = 1.50;
      cSlider.value = 1.14;
      sSlider.value = 0.00;
    } else {
      pSlider.value = 4.00;
      cSlider.value = 3.94;
      sSlider.value = 0.14;
    }
    updateStaCalculator();
  };

  window.updateStaCalculator = function() {
    const Tclk = parseFloat(document.getElementById('slider-sta-period')?.value || 1.5);
    const Tcomb = parseFloat(document.getElementById('slider-sta-comb')?.value || 1.14);
    const Tskew = parseFloat(document.getElementById('slider-sta-skew')?.value || 0.0);

    const Tck2q = 0.12;
    const Tsu = 0.08;
    const Th = 0.05;

    const Tarr = Tck2q + Tcomb;
    const TreqSetup = Tclk + Tskew - Tsu;
    const setupSlack = TreqSetup - Tarr;
    const holdSlack = Tarr - (Tskew + Th);

    document.getElementById('val-sta-period').textContent = Tclk.toFixed(2) + ' ns';
    document.getElementById('val-sta-comb').textContent = Tcomb.toFixed(2) + ' ns';
    document.getElementById('val-sta-skew').textContent = (Tskew >= 0 ? '+' : '') + Tskew.toFixed(2) + ' ns';
    document.getElementById('sta-comb-label').textContent = `T_comb=${Tcomb.toFixed(2)}ns`;

    const setupValEl = document.getElementById('sta-setup-val');
    const setupCardEl = document.getElementById('sta-setup-card');
    if (setupSlack >= 0) {
      setupValEl.textContent = `+${setupSlack.toFixed(2)} ns (MET)`;
      setupValEl.className = 'text-base sm:text-lg font-bold text-metal-m3';
      setupCardEl.className = 'p-3 rounded-lg bg-silicon-950 border border-emerald-500/40';
    } else {
      setupValEl.textContent = `${setupSlack.toFixed(2)} ns (VIOLATED)`;
      setupValEl.className = 'text-base sm:text-lg font-bold text-rose-400';
      setupCardEl.className = 'p-3 rounded-lg bg-rose-950/30 border border-rose-500/60';
    }

    const holdValEl = document.getElementById('sta-hold-val');
    const holdCardEl = document.getElementById('sta-hold-card');
    if (holdSlack >= 0) {
      holdValEl.textContent = `+${holdSlack.toFixed(2)} ns (MET)`;
      holdValEl.className = 'text-base sm:text-lg font-bold text-metal-m3';
      holdCardEl.className = 'p-3 rounded-lg bg-silicon-950 border border-emerald-500/40';
    } else {
      holdValEl.textContent = `${holdSlack.toFixed(2)} ns (VIOLATED)`;
      holdValEl.className = 'text-base sm:text-lg font-bold text-rose-400';
      holdCardEl.className = 'p-3 rounded-lg bg-rose-950/30 border border-rose-500/60';
    }
  };

  // ===========================================================================
  // 4. TCL & SYSTEMVERILOG CODE SNIPPET DRAWER + CARD BUTTONS
  // ===========================================================================
  const codeSnippets = {
    fifo: {
      title: "8-Bit Async FIFO — Synopsys ICC2 PDN & Dual-Clock CTS Script (Tcl)",
      lang: "Tcl (icc2_shell)",
      code: `# 1. Floorplan & M5 Track-Aligned Port Placement (2,065.43 um^2 Core)
initialize_floorplan -core_utilization 0.6314 -core_offset {1.0}
set_individual_pin_constraints -ports [get_ports {wdata* winc wclk wrst_n}] -sides 1 -allowed_layers M5
set_individual_pin_constraints -ports [get_ports {rdata* wfull rempty rclk rrst_n}] -sides 3 -allowed_layers M5
place_pins -self

# 2. Multi-Tier Power Delivery Mesh (M7/M8 Top Mesh + M2 Straps + M1 Rails)
create_pg_mesh_pattern P_TOP_MESH -layers {
  {{vertical_layer: M7}   {width: 0.60} {spacing: interleaving} {pitch: 18.0}}
  {{horizontal_layer: M8} {width: 0.60} {spacing: interleaving} {pitch: 18.0}}
}
create_pg_strap -layer M2 -direction vertical -width 0.18 -pitch 6.0
create_pg_std_cell_conn_pattern P_STD_RAIL -layers {M1} -rail_width 0.06
compile_pg

# 3. Dual-Domain Asynchronous Clock Tree Synthesis (wclk & rclk @ 1.50ns, dwds NDR)
create_routing_rule CLK_NDR_DWDS -default_reference_rule -multiplier_width 2 -multiplier_spacing 2
set_clock_routing_rules -rules CLK_NDR_DWDS -min_routing_layer M4 -max_routing_layer M5
set_clock_tree_options -clocks [get_clocks {wclk rclk}] -target_latency 0.60 -target_skew 0.225
clock_opt
route_opt
# Signoff Result: 0.00ns Global Skew | 0 DRC | +0.16ns Setup WNS`
    },
    gprs: {
      title: "gprs_top — Macro Flylines, M8/M7/M2 PDN & Route ECO Signoff (Tcl)",
      lang: "Tcl (icc2_shell)",
      code: `# 1. Data-Driven Macro Placement & Soft Channel Blockages (16 Hard SRAM Macros)
compute_dff_connections
create_keepout_margin -type soft -outer {16.0 16.0 16.0 16.0} [get_cells -hierarchical -filter "is_hard_macro==true"]

# 2. Multi-Layer PDN Synthesis & Missing PG Via Resolution (179 Vias Added)
create_pg_strap -layer M8 -width 4.64  -pitch 19.456 -direction horizontal
create_pg_strap -layer M7 -width 1.104 -pitch 13.376 -direction vertical
create_pg_strap -layer M2 -width 0.44  -pitch 9.728  -direction vertical
create_pg_vias -nets {VDD VSS} -from_layers M8 -to_layers M1
check_pg_drc ;# 0 PG DRC, 0 PG Shorts

# 3. Clock Tree Synthesis (mclk: 4.0ns, 2856 sinks) & Route ECO Closure
set_app_options -name place.coarse.max_fanout -value 30
clock_opt
route_auto
route_eco -utilize_dangling_wires true -reroute modified_nets_first_then_others
# Signoff Result: 33,286 Final Cells | 0.14ns Skew | 0 Shorts/Opens | 0.00ns Setup WNS`
    },
    arbiter: {
      title: "Multi-Master Bus Arbiter — 8-Cycle Anti-Starvation RTL (Verilog)",
      lang: "Verilog-2005 (ChipThink Finals)",
      code: `// Offline ChipThink Hackathon Finals — Priority + 8-Cycle Anti-Starvation Counter
always @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
    wait_cnt       <= 4'd0;
    grant          <= GNT_IDLE;
    last_sec_grant <= 1'b0;
  end else begin
    // Starvation Prevention Counter when CPU holds bus while DMA/Periph wait
    if (req_cpu && (req_dma || req_periph) && (grant == GNT_CPU)) begin
      if (wait_cnt < 4'd8)
        wait_cnt <= wait_cnt + 4'd1;
    end else begin
      wait_cnt <= 4'd0;
    end

    // Grant Decision Logic with Forced Priority Switch at Cycle 8
    if (req_cpu && (wait_cnt < 4'd8)) begin
      grant <= GNT_CPU;
    end else if (req_dma && req_periph) begin
      grant          <= last_sec_grant ? GNT_DMA : GNT_PERIPH;
      last_sec_grant <= ~last_sec_grant;
      wait_cnt       <= 4'd0;
    end else if (req_dma) begin
      grant    <= GNT_DMA;
      wait_cnt <= 4'd0;
    end else if (req_periph) begin
      grant    <= GNT_PERIPH;
      wait_cnt <= 4'd0;
    end else begin
      grant <= GNT_IDLE;
    end
  end
end`
    },
    halfadder: {
      title: "4-Abstraction Half Adder & Switch-Level CMOS Network (SystemVerilog)",
      lang: "Verilog / SystemVerilog (Synopsys VCS)",
      code: `// 1. Switch-Level CMOS Implementation using Physical PMOS/NMOS Primitives
module nand_sw (output Y, input A, B);
  supply1 VDD;
  supply0 VSS;
  wire n_mid;
  pmos p1 (Y, VDD, A);
  pmos p2 (Y, VDD, B);
  nmos n1 (Y, n_mid, A);
  nmos n2 (n_mid, VSS, B);
endmodule

// 2. Self-Checking SystemVerilog Testbench (tb_top) across all 4 Abstractions
module tb_top;
  logic a, b;
  wire sum_df, carry_df, sum_bh, carry_bh, sum_gl, carry_gl, sum_sw, carry_sw;

  initial begin
    for (int i = 0; i < 4; i++) begin
      {a, b} = i[1:0]; #10;
      assert ((sum_df === sum_sw) && (carry_df === carry_sw))
        else $error("[FAIL] Parity mismatch at input %b%b", a, b);
    end
    $display("[VCS PASS] 100%% Functional & Transistor-Level Parity Verified!");
  end
endmodule`
    }
  };

  function injectCodeDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'code-snippet-drawer';
    drawer.className = 'bg-black/80 backdrop-blur-sm justify-end';
    drawer.onclick = () => closeCodeDrawer();
    drawer.innerHTML = `
      <div onclick="event.stopPropagation()" class="w-full max-w-2xl bg-[#070B16] border-l border-cyan-500/40 h-full flex flex-col justify-between p-4 sm:p-6 shadow-2xl font-mono">
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="pr-2">
              <span id="drawer-lang" class="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">Tcl / SystemVerilog</span>
              <h3 id="drawer-title" class="text-sm sm:text-base font-bold text-white mt-1.5">Code Snippet</h3>
            </div>
            <button type="button" onclick="closeCodeDrawer()" class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs shrink-0">ESC &#10005;</button>
          </div>
          <pre id="drawer-code" class="p-3.5 sm:p-4 rounded-xl bg-[#04070E] border border-slate-800 text-emerald-400 text-[11px] sm:text-xs leading-relaxed overflow-x-auto max-h-[70vh] overflow-y-auto"></pre>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span class="text-slate-400">Author: Narendaran S G</span>
          <button type="button" id="copy-snippet-btn" onclick="copyCurrentSnippet()" class="px-4 py-1.5 rounded bg-metal-m5 text-silicon-950 font-bold hover:bg-cyan-300 transition">Copy Code</button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    const cards = document.querySelectorAll('.project-card');
    const cardMap = ['fifo', 'gprs', 'arbiter', 'halfadder'];
    cardMap.forEach((key, idx) => {
      if (cards[idx]) {
        const footer = cards[idx].querySelector('div:last-child');
        if (footer) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'px-2.5 py-1 rounded bg-silicon-800 hover:bg-metal-m5/20 text-metal-m5 border border-metal-m5/40 text-[11px] font-mono transition';
          btn.textContent = '{ } View TCL / RTL';
          btn.onclick = () => openCodeDrawer(key);
          footer.appendChild(btn);
        }
      }
    });
  }

  window.openCodeDrawer = function(key) {
    const item = codeSnippets[key];
    if (!item) return;
    document.getElementById('drawer-title').textContent = item.title;
    document.getElementById('drawer-lang').textContent = item.lang;
    document.getElementById('drawer-code').textContent = item.code;
    document.getElementById('code-snippet-drawer').classList.add('open');
  };

  window.closeCodeDrawer = function() {
    document.getElementById('code-snippet-drawer')?.classList.remove('open');
  };

  window.copyCurrentSnippet = function() {
    const code = document.getElementById('drawer-code')?.textContent || '';
    navigator.clipboard.writeText(code);
    const btn = document.getElementById('copy-snippet-btn');
    btn.textContent = 'Copied ✓';
    setTimeout(() => (btn.textContent = 'Copy Code'), 1500);
  };

  // ===========================================================================
  // 5. MULTI-VIEW AWARE COMMAND PALETTE (CTRL + K / CMD + K)
  // ===========================================================================
  const paletteActions = [
    { label: "01. Go to Home & Linux EDA Workstation Terminal", tag: "View", run: () => switchPageView('home') },
    { label: "02. Inspect gprs_top QoR & Signoff Table (33.2K Cells)", tag: "QoR", run: () => { switchPageView('qor'); switchQorBlock('gprs'); } },
    { label: "02. Inspect 8-Bit Async FIFO Dual-CTS QoR (0.00ns Skew)", tag: "QoR", run: () => { switchPageView('qor'); switchQorBlock('fifo'); } },
    { label: "03. Launch 3D Metal Stack & Live Bus Arbiter + GTKWave", tag: "Lab", run: () => { switchPageView('lab'); } },
    { label: "03. Compare Before/After Floorplan vs. Routed GDSII Slider", tag: "Visual", run: () => { switchPageView('lab'); setTimeout(() => document.getElementById('signoff-simulators-row')?.scrollIntoView({ behavior: 'smooth' }), 240); } },
    { label: "03. Launch Interactive STA Setup/Hold Slack Calculator", tag: "STA", run: () => { switchPageView('lab'); setTimeout(() => document.getElementById('signoff-simulators-row')?.scrollIntoView({ behavior: 'smooth' }), 240); } },
    { label: "04. Browse All 9 Silicon Chronicles & EDA Toolchain", tag: "Projects", run: () => switchPageView('projects') },
    { label: "05. View Verified Certificates, Personal Story & Contact", tag: "Certs", run: () => switchPageView('credentials') },
    { label: "View Synopsys ICC2 Tcl Script (Async FIFO PDN & CTS)", tag: "Code", run: () => openCodeDrawer('fifo') },
    { label: "View ChipThink Bus Arbiter Anti-Starvation Verilog RTL", tag: "Code", run: () => openCodeDrawer('arbiter') },
    { label: "Toggle Dark / Light Datasheet Theme", tag: "Theme", run: () => toggleSiteTheme() },
    { label: "Open Printable 1-Page Semiconductor Resume (A4)", tag: "Resume", run: () => { window.location.href = 'resume.html'; } }
  ];

  function injectCommandPalette() {
    const rightControls = document.querySelector('header .flex.items-center.space-x-2');
    if (rightControls) {
      const kBtn = document.createElement('button');
      kBtn.type = 'button';
      kBtn.onclick = openCmdPalette;
      kBtn.className = 'px-2.5 py-1.5 rounded-lg bg-silicon-800 border border-slate-700 hover:border-metal-m5 text-xs font-mono text-slate-300 flex items-center gap-1.5';
      kBtn.innerHTML = `<span class="hidden sm:inline">Search</span><kbd class="px-1.5 py-0.5 text-[10px] bg-silicon-950 text-metal-m5 rounded border border-slate-700">Ctrl K</kbd>`;
      rightControls.insertBefore(kBtn, rightControls.firstChild);
    }

    const modal = document.createElement('div');
    modal.id = 'cmd-palette-modal';
    modal.onclick = closeCmdPalette;
    modal.innerHTML = `
      <div onclick="event.stopPropagation()" class="w-full max-w-xl mx-3 bg-[#0B101E] border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden font-mono">
        <div class="p-3 bg-silicon-950 border-b border-slate-800 flex items-center gap-2.5">
          <span class="text-metal-m5 font-bold">&gt;_</span>
          <input id="cmd-palette-input" type="text" placeholder="Jump to any sub-page, QoR table, TCL script, STA calculator..." class="w-full bg-transparent text-white text-xs outline-none" />
          <button type="button" onclick="closeCmdPalette()" class="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-silicon-800">ESC</button>
        </div>
        <div id="cmd-palette-list" class="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = document.getElementById('cmd-palette-input');
    input.addEventListener('input', () => renderPaletteItems(input.value));
    renderPaletteItems('');

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdPalette();
      } else if (e.key === 'Escape') {
        closeCmdPalette();
        closeCodeDrawer();
      }
    });
  }

  function renderPaletteItems(query) {
    const list = document.getElementById('cmd-palette-list');
    if (!list) return;
    const q = query.trim().toLowerCase();
    const filtered = paletteActions.filter(a => a.label.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q));

    list.innerHTML = filtered.map((item, idx) => `
      <button type="button" data-idx="${idx}" class="cmd-item w-full text-left px-3 py-2.5 rounded-lg hover:bg-cyan-500/15 flex items-center justify-between gap-2 text-xs transition">
        <span class="text-slate-200 truncate">${item.label}</span>
        <span class="text-[10px] px-2 py-0.5 rounded bg-silicon-950 text-metal-m5 border border-cyan-500/30 shrink-0">${item.tag}</span>
      </button>
    `).join('');

    list.querySelectorAll('.cmd-item').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        closeCmdPalette();
        filtered[i].run();
      });
    });
  }

  window.openCmdPalette = function() {
    const modal = document.getElementById('cmd-palette-modal');
    const input = document.getElementById('cmd-palette-input');
    modal.classList.add('open');
    input.value = '';
    renderPaletteItems('');
    setTimeout(() => input.focus(), 40);
  };

  window.closeCmdPalette = function() {
    document.getElementById('cmd-palette-modal')?.classList.remove('open');
  };

  // ===========================================================================
  // INITIALIZE ALL ADD-ONS ON DOM READY
  // ===========================================================================
  function initAll() {
    runSiliconBootAnimation();
    injectGtkWaveViewer();
    hookArbiterWaveform();
    injectLayoutSliderAndStaSection();
    injectCodeDrawer();
    injectCommandPalette();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
