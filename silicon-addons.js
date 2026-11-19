(function initSiliconAddons() {
  const style = document.createElement('style');
  style.id = 'silicon-addons-styles';
  style.textContent = `
    #silicon-boot-overlay { position: fixed; inset: 0; background: #050811; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; text-align: center; font-family: 'JetBrains Mono', monospace; transition: opacity 0.4s ease, visibility 0.4s ease; }
    #silicon-boot-overlay.boot-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
    .wafer-ring { width: 96px; height: 96px; border-radius: 50%; border: 2px solid rgba(57, 255, 20, 0.45); background: linear-gradient(90deg, rgba(57,255,20,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(56,189,248,0.12) 1px, transparent 1px); background-size: 12px 12px; position: relative; }
    .wafer-ring::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 2px dashed #38BDF8; animation: spinWafer 3s linear infinite; }
    @keyframes spinWafer { 100% { transform: rotate(360deg); } }
    .ba-slider-wrap { position: relative; user-select: none; overflow: hidden; border-radius: 0.75rem; border: 1px solid var(--border-card); background: #050811; aspect-ratio: 16 / 9; width: 100%; }
    .ba-before-layer { position: absolute; inset: 0; overflow: hidden; }
    .ba-handle { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--gold-primary); box-shadow: 0 0 10px var(--gold-primary); pointer-events: none; }
    .ba-knob { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 9999px; background: #050811; border: 2px solid var(--gold-primary); color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; }
    #code-snippet-drawer { position: fixed; inset: 0; z-index: 80; display: none; }
    #code-snippet-drawer.open { display: flex; }
    #cmd-palette-modal { position: fixed; inset: 0; z-index: 90; display: none; align-items: flex-start; justify-content: center; padding-top: 10vh; background: rgba(5, 8, 17, 0.78); backdrop-filter: blur(6px); }
    #cmd-palette-modal.open { display: flex; }
  `;
  document.head.appendChild(style);

  function showToast(title, detail) {
    let toast = document.getElementById('vlsi-easter-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vlsi-easter-toast';
      toast.className = 'px-4 py-2.5 rounded-xl bg-[#050811]/95 border border-emerald-400 text-xs shadow-2xl text-center max-w-md mx-3';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<div class="text-emerald-400 font-bold tracking-wider uppercase">${title}</div><div class="text-slate-200 text-[11px] mt-0.5">${detail}</div>`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3600);
  }

  function runSiliconBootAnimation() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { if (sessionStorage.getItem('narendaran_boot_shown')) return; sessionStorage.setItem('narendaran_boot_shown', '1'); } catch (e) { return; }
    const bootEl = document.createElement('div');
    bootEl.id = 'silicon-boot-overlay';
    bootEl.innerHTML = `<div class="wafer-ring mb-5"></div><div class="text-[10px] sm:text-xs text-emerald-400 tracking-widest uppercase mb-1.5">NARENDARAN_S_G // SILICON SIGNOFF INITIALIZATION</div><div id="boot-step-text" class="text-xs sm:text-sm text-cyan-300 font-bold">[1/4] CHECKING PHYSICAL DRC... 0 VIOLATIONS (CLEAN)</div><div class="w-56 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4"><div id="boot-bar" class="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300" style="width: 25%"></div></div><button type="button" id="skip-boot-btn" class="mt-5 text-[11px] text-slate-400 hover:text-white underline">Skip Intro [ESC]</button>`;
    document.body.appendChild(bootEl);
    const steps = [
      { pct: '55%', text: '[2/4] VERIFYING LVS & PG MESH (M1-M8)... MATCH' },
      { pct: '85%', text: '[3/4] TIMING SIGNOFF... MET (+0.16ns WNS / 0.00ns SKEW)' },
      { pct: '100%', text: '[4/4] MOUNTING MULTI-VIEW SILICON WORKSPACE...' }
    ];
    let i = 0;
    const stepText = document.getElementById('boot-step-text'), bootBar = document.getElementById('boot-bar');
    const timer = setInterval(() => {
      if (i < steps.length) { if (stepText) stepText.textContent = steps[i].text; if (bootBar) bootBar.style.width = steps[i].pct; i++; }
      else { clearInterval(timer); bootEl.classList.add('boot-hidden'); setTimeout(() => bootEl.remove(), 450); }
    }, 340);
    document.getElementById('skip-boot-btn')?.addEventListener('click', () => { clearInterval(timer); bootEl.classList.add('boot-hidden'); setTimeout(() => bootEl.remove(), 350); });
  }

  const waveHistory = [{ cycle: 0, clk: 1, req_cpu: 1, req_dma: 1, req_periph: 0, wait_cnt: 0, grant: "CPU" }];
  function drawGtkWave() {
    const canvas = document.getElementById('gtkwave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const labelW = 80, maxSamples = 10, samples = waveHistory.slice(-maxSamples), stepW = (W - labelW - 10) / maxSamples;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'; ctx.lineWidth = 1;
    for (let i = 0; i <= maxSamples; i++) { const x = labelW + i * stepW; ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x, H - 4); ctx.stroke(); }
    const signals = [
      { name: 'clk', type: 'clk', yTop: 8, yBot: 21, color: '#39FF14' },
      { name: 'req_cpu', key: 'req_cpu', yTop: 30, yBot: 43, color: '#38BDF8' },
      { name: 'req_dma', key: 'req_dma', yTop: 52, yBot: 65, color: '#22C55E' },
      { name: 'wait_cnt', key: 'wait_cnt', type: 'bus', yTop: 75, yBot: 91, color: '#FACC15' },
      { name: 'grant[1:0]', key: 'grant', type: 'bus', yTop: 101, yBot: 117, color: '#EF4444' }
    ];
    ctx.font = '9.5px "JetBrains Mono", monospace';
    signals.forEach(sig => {
      ctx.fillStyle = '#94A3B8'; ctx.fillText(sig.name, 5, (sig.yTop + sig.yBot) / 2 + 3);
      ctx.strokeStyle = sig.color; ctx.lineWidth = 1.5; ctx.beginPath();
      samples.forEach((s, idx) => {
        const x0 = labelW + idx * stepW, xMid = x0 + stepW * 0.5, x1 = x0 + stepW;
        if (sig.type === 'clk') { ctx.moveTo(x0, sig.yBot); ctx.lineTo(x0, sig.yTop); ctx.lineTo(xMid, sig.yTop); ctx.lineTo(xMid, sig.yBot); ctx.lineTo(x1, sig.yBot); }
        else if (sig.type === 'bus') { ctx.strokeRect(x0 + 1, sig.yTop, stepW - 2, sig.yBot - sig.yTop); ctx.fillStyle = sig.color; ctx.fillText(String(s[sig.key]).replace(/\s*\(.*\)/, '').substring(0, 4), x0 + 4, sig.yBot - 4); }
        else {
          const y = s[sig.key] ? sig.yTop : sig.yBot;
          if (idx === 0) ctx.moveTo(x0, y);
          else { const prevY = samples[idx - 1][sig.key] ? sig.yTop : sig.yBot; if (prevY !== y) ctx.lineTo(x0, y); }
          ctx.lineTo(x1, y);
        }
      });
      ctx.stroke();
    });
  }

  function injectGtkWaveViewer() {
    const arbLogEl = document.getElementById('arb-log-line');
    if (!arbLogEl || document.getElementById('gtkwave-canvas')) return;
    const waveBox = document.createElement('div');
    waveBox.className = 'mt-3 p-3 rounded-lg bg-[#04070F] border border-emerald-500/30 font-mono text-[10px] space-y-1.5 overflow-x-auto';
    waveBox.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-1 text-slate-400"><span class="text-emerald-400 font-semibold">&#9679; LIVE GTKWAVE / VCD SIGNAL TRACE</span><span class="text-[9.5px]">clk, req_cpu, req_dma, wait_cnt, grant[1:0]</span></div><canvas id="gtkwave-canvas" width="500" height="128" class="w-full min-w-[320px] h-[128px] rounded bg-[#050811] border border-slate-800/80"></canvas>`;
    arbLogEl.parentNode.insertBefore(waveBox, arbLogEl.nextSibling);
    drawGtkWave();
    document.addEventListener('vlsi:arbiterstep', e => { const d = e.detail; waveHistory.push({ cycle: d.cycle, clk: 1, req_cpu: d.req_cpu ? 1 : 0, req_dma: d.req_dma ? 1 : 0, req_periph: d.req_periph ? 1 : 0, wait_cnt: d.wait_cnt, grant: d.grant }); drawGtkWave(); });
    document.addEventListener('vlsi:arbiterreset', () => { waveHistory.length = 0; waveHistory.push({ cycle: 0, clk: 1, req_cpu: 1, req_dma: 1, req_periph: 0, wait_cnt: 0, grant: 'CPU' }); drawGtkWave(); });
    document.addEventListener('vlsi:viewchange', e => { if (e.detail && e.detail.view === 'lab') setTimeout(() => { syncBeforeImageWidth(); drawGtkWave(); }, 180); });
  }

  const baBlocks = {
    gprs: { beforeImg: "assets/gprs_macro_flylines.webp", beforeLabel: "BEFORE: Floorplan & 16-Macro Flylines (21.18% Util)", afterImg: "assets/gprs_routing.webp", afterLabel: "AFTER: 10-Layer Detailed Route (66.25% Util, 0 Shorts)" },
    fifo: { beforeImg: "assets/fifo_powerplan.webp", beforeLabel: "BEFORE: M7/M8 + M2 Power Delivery Mesh (0 PG DRC)", afterImg: "assets/fifo_routing.webp", afterLabel: "AFTER: Dual-CTS & Routed Layout (0 DRC, +0.16ns WNS)" }
  };

  function syncBeforeImageWidth() {
    const sliderBox = document.getElementById('ba-slider-box'), beforeImg = document.getElementById('ba-before-img');
    if (sliderBox && beforeImg && sliderBox.clientWidth > 0) beforeImg.style.width = sliderBox.clientWidth + 'px';
  }

  function injectLayoutSliderAndStaSection() {
    const labContainer = document.getElementById('interactive-lab');
    if (!labContainer || document.getElementById('signoff-simulators-row')) return;
    const addonGrid = document.createElement('div');
    addonGrid.id = 'signoff-simulators-row';
    addonGrid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2';
    addonGrid.innerHTML = `<div class="lg:col-span-6 rounded-xl p-5 sm:p-6 eda-border flex flex-col justify-between space-y-4"><div class="flex flex-wrap items-center justify-between gap-2"><div><div class="text-xs font-mono text-metal-m5 uppercase">BEFORE vs. AFTER SILICON TRANSFORMATION</div><h3 class="text-lg sm:text-xl font-bold text-white mt-0.5">Floorplan / PDN vs. Final Routed GDSII</h3></div><div class="inline-flex rounded bg-silicon-950 p-1 border border-slate-800 font-mono text-[11px]"><button type="button" id="ba-btn-gprs" class="px-2.5 py-1 rounded bg-metal-m5 font-bold">gprs_top</button><button type="button" id="ba-btn-fifo" class="px-2.5 py-1 rounded text-slate-300 hover:text-white">Async FIFO</button></div></div><div class="ba-slider-wrap" id="ba-slider-box"><img id="ba-after-img" src="assets/gprs_routing.webp" alt="After Routing" class="w-full h-full object-cover" /><span id="ba-after-tag" class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-silicon-950/90 border border-metal-m3/50 text-[9.5px] font-mono text-metal-m3">AFTER: 10-Layer Detailed Route (0 Shorts)</span><div id="ba-before-clip" class="ba-before-layer" style="width: 50%;"><img id="ba-before-img" src="assets/gprs_macro_flylines.webp" alt="Before Floorplan" class="w-full h-full object-cover max-w-none" /><span id="ba-before-tag" class="absolute top-2 left-2 px-2 py-0.5 rounded bg-silicon-950/90 border border-metal-m5/50 text-[9.5px] font-mono text-metal-m5">BEFORE: Floorplan &amp; Macro Flylines</span></div><div id="ba-divider-line" class="ba-handle" style="left: 50%;"><div class="ba-knob">&harr;</div></div><input id="ba-range-input" type="range" min="2" max="98" value="50" aria-label="Before and After Layout Slider" class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" /></div></div><div class="lg:col-span-6 rounded-xl p-5 sm:p-6 eda-border flex flex-col justify-between space-y-4"><div class="flex flex-wrap items-center justify-between gap-2"><div><div class="text-xs font-mono text-metal-m8 uppercase">INTERACTIVE STA TIMING PATH ENGINE</div><h3 class="text-lg sm:text-xl font-bold text-white mt-0.5">Setup &amp; Hold Slack Calculator</h3></div><div class="flex flex-wrap gap-1.5 font-mono text-[10.5px]"><button type="button" onclick="loadStaPreset('fifo')" class="px-2 py-1 rounded bg-silicon-800 border border-metal-m3/40 text-metal-m3 hover:bg-metal-m3/10">Preset: FIFO (1.5ns)</button><button type="button" onclick="loadStaPreset('gprs')" class="px-2 py-1 rounded bg-silicon-800 border border-metal-m5/40 text-metal-m5 hover:bg-metal-m5/10">Preset: GPRS (4.0ns)</button><button type="button" onclick="snapRazorEdgeSta()" class="px-2 py-1 rounded bg-silicon-800 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/10">Razor-Edge</button></div></div><div class="space-y-2.5 font-mono text-xs"><div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-400">Clock Period (T_clk):</span><span id="val-sta-period" class="text-metal-m5 font-bold">1.50 ns</span></div><input id="slider-sta-period" type="range" min="0.80" max="5.00" step="0.05" value="1.50" oninput="updateStaCalculator()" class="w-full accent-emerald-400 cursor-pointer" /></div><div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-400">Combinational + Route Delay (T_comb):</span><span id="val-sta-comb" class="text-metal-m8 font-bold">1.14 ns</span></div><input id="slider-sta-comb" type="range" min="0.02" max="4.20" step="0.02" value="1.14" oninput="updateStaCalculator()" class="w-full accent-amber-400 cursor-pointer" /></div><div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-400">Clock Skew (T_skew):</span><span id="val-sta-skew" class="text-metal-m3 font-bold">0.00 ns</span></div><input id="slider-sta-skew" type="range" min="-0.30" max="0.40" step="0.01" value="0.00" oninput="updateStaCalculator()" class="w-full accent-sky-400 cursor-pointer" /></div></div><div class="grid grid-cols-2 gap-3 font-mono text-xs pt-1"><div id="sta-setup-card" class="p-3 rounded-lg bg-silicon-950 border border-emerald-500/40"><div class="text-[10px] text-slate-400">SETUP SLACK (WNS)</div><div id="sta-setup-val" class="text-base sm:text-lg font-bold text-metal-m3">+0.16 ns (MET)</div></div><div id="sta-hold-card" class="p-3 rounded-lg bg-silicon-950 border border-emerald-500/40"><div class="text-[10px] text-slate-400">HOLD SLACK</div><div id="sta-hold-val" class="text-base sm:text-lg font-bold text-metal-m3">+1.21 ns (MET)</div></div></div></div>`;
    labContainer.appendChild(addonGrid);

    const rangeInput = document.getElementById('ba-range-input'), beforeClip = document.getElementById('ba-before-clip'), dividerLine = document.getElementById('ba-divider-line');
    window.addEventListener('resize', syncBeforeImageWidth);
    setTimeout(syncBeforeImageWidth, 150);
    rangeInput.addEventListener('input', e => { beforeClip.style.width = e.target.value + '%'; dividerLine.style.left = e.target.value + '%'; syncBeforeImageWidth(); });

    const switchBa = key => {
      const b = baBlocks[key];
      document.getElementById('ba-before-img').src = b.beforeImg; document.getElementById('ba-after-img').src = b.afterImg;
      document.getElementById('ba-before-tag').textContent = b.beforeLabel; document.getElementById('ba-after-tag').textContent = b.afterLabel;
      document.getElementById('ba-btn-gprs').className = key === 'gprs' ? 'px-2.5 py-1 rounded bg-metal-m5 font-bold' : 'px-2.5 py-1 rounded text-slate-300 hover:text-white';
      document.getElementById('ba-btn-fifo').className = key === 'fifo' ? 'px-2.5 py-1 rounded bg-metal-m5 font-bold' : 'px-2.5 py-1 rounded text-slate-300 hover:text-white';
      setTimeout(syncBeforeImageWidth, 50);
    };
    document.getElementById('ba-btn-gprs').addEventListener('click', () => switchBa('gprs'));
    document.getElementById('ba-btn-fifo').addEventListener('click', () => switchBa('fifo'));
    updateStaCalculator();
  }

  window.loadStaPreset = function(preset) {
    const pSlider = document.getElementById('slider-sta-period'), cSlider = document.getElementById('slider-sta-comb'), sSlider = document.getElementById('slider-sta-skew');
    if (preset === 'fifo') { pSlider.value = 1.50; cSlider.value = 1.14; sSlider.value = 0.00; }
    else { pSlider.value = 4.00; cSlider.value = 3.94; sSlider.value = 0.14; }
    updateStaCalculator();
  };


  window.snapRazorEdgeSta = function() {
    const pSlider = document.getElementById('slider-sta-period');
    const cSlider = document.getElementById('slider-sta-comb');
    const sSlider = document.getElementById('slider-sta-skew');
    if (pSlider && cSlider && sSlider) {
      pSlider.value = "0.80";
      cSlider.value = "0.60";
      sSlider.value = "0.00";
      window.updateStaCalculator();
    }
  };

  let nirvanaShown = false;
  window.updateStaCalculator = function() {
    const Tclk = parseFloat(document.getElementById('slider-sta-period')?.value || 1.5);
    const Tcomb = parseFloat(document.getElementById('slider-sta-comb')?.value || 1.14);
    const Tskew = parseFloat(document.getElementById('slider-sta-skew')?.value || 0.0);
    const setupSlack = (Tclk + Tskew - 0.08) - (0.12 + Tcomb);
    const holdSlack = (0.12 + Tcomb) - (Tskew + 0.05);
    document.getElementById('val-sta-period').textContent = Tclk.toFixed(2) + ' ns';
    document.getElementById('val-sta-comb').textContent = Tcomb.toFixed(2) + ' ns';
    document.getElementById('val-sta-skew').textContent = (Tskew >= 0 ? '+' : '') + Tskew.toFixed(2) + ' ns';

    const sVal = document.getElementById('sta-setup-val'), sCard = document.getElementById('sta-setup-card');
    sVal.textContent = `${setupSlack >= 0 ? '+' : ''}${setupSlack.toFixed(2)} ns (${setupSlack >= 0 ? 'MET' : 'VIOLATED'})`;
    sVal.className = `text-base sm:text-lg font-bold ${setupSlack >= 0 ? 'text-metal-m3' : 'text-rose-400'}`;
    sCard.className = `p-3 rounded-lg bg-silicon-950 border ${setupSlack >= 0 ? 'border-emerald-500/40' : 'border-rose-500/60'}`;

    const hVal = document.getElementById('sta-hold-val'), hCard = document.getElementById('sta-hold-card');
    hVal.textContent = `${holdSlack >= 0 ? '+' : ''}${holdSlack.toFixed(2)} ns (${holdSlack >= 0 ? 'MET' : 'VIOLATED'})`;
    hVal.className = `text-base sm:text-lg font-bold ${holdSlack >= 0 ? 'text-metal-m3' : 'text-rose-400'}`;
    hCard.className = `p-3 rounded-lg bg-silicon-950 border ${holdSlack >= 0 ? 'border-emerald-500/40' : 'border-rose-500/60'}`;

    if (Math.abs(setupSlack) <= 0.03 && holdSlack >= 0 && holdSlack <= 0.10) {
      if (!nirvanaShown) {
        nirvanaShown = true;
        showToast('RAZOR-EDGE TIMING ACHIEVED', `Setup (${setupSlack.toFixed(2)}ns) & Hold (${holdSlack.toFixed(2)}ns) balanced at ~0.00 ns.`);
      }
    } else nirvanaShown = false;
  };

  const codeSnippets = {
    fifo: { title: "8-Bit Async FIFO - Synopsys ICC2 PDN & Dual-Clock CTS Script (Tcl)", lang: "Tcl (icc2_shell)", code: "create_pg_mesh_pattern P_TOP_MESH -layers {\n  {{vertical_layer: M7}   {width: 0.60} {spacing: interleaving} {pitch: 18.0}}\n  {{horizontal_layer: M8} {width: 0.60} {spacing: interleaving} {pitch: 18.0}}\n}\ncreate_routing_rule CLK_NDR_DWDS -default_reference_rule -multiplier_width 2 -multiplier_spacing 2\nset_clock_routing_rules -rules CLK_NDR_DWDS -min_routing_layer M4 -max_routing_layer M5\nclock_opt\nroute_opt" },
    gprs: { title: "gprs_top - Macro Flylines, M8/M7/M2 PDN & Route ECO Signoff (Tcl)", lang: "Tcl (icc2_shell)", code: "compute_dff_connections\ncreate_keepout_margin -type soft -outer {16.0 16.0 16.0 16.0} [get_cells -hierarchical -filter \"is_hard_macro==true\"]\ncreate_pg_strap -layer M8 -width 4.64  -pitch 19.456 -direction horizontal\ncreate_pg_strap -layer M7 -width 1.104 -pitch 13.376 -direction vertical\ncreate_pg_strap -layer M2 -width 0.44  -pitch 9.728  -direction vertical\nroute_eco -utilize_dangling_wires true -reroute modified_nets_first_then_others" },
    arbiter: { title: "Multi-Master Bus Arbiter - 8-Cycle Anti-Starvation RTL (Verilog)", lang: "Verilog-2005", code: "if (req_cpu && (req_dma || req_periph) && (grant == GNT_CPU)) begin\n  if (wait_cnt < 4'd8) wait_cnt <= wait_cnt + 4'd1;\nend else begin\n  wait_cnt <= 4'd0;\nend" },
    halfadder: { title: "4-Abstraction Half Adder & Switch-Level CMOS Network (SystemVerilog)", lang: "SystemVerilog", code: "module nand_sw (output Y, input A, B);\n  supply1 VDD; supply0 VSS; wire n_mid;\n  pmos p1 (Y, VDD, A); pmos p2 (Y, VDD, B);\n  nmos n1 (Y, n_mid, A); nmos n2 (n_mid, VSS, B);\nendmodule" }
  };

  function injectCodeDrawer() {
    if (!document.getElementById('code-snippet-drawer')) {
      const drawer = document.createElement('div');
      drawer.id = 'code-snippet-drawer'; drawer.className = 'bg-black/80 backdrop-blur-sm justify-end'; drawer.onclick = () => closeCodeDrawer();
      drawer.innerHTML = `<div onclick="event.stopPropagation()" class="w-full max-w-2xl bg-[#070B16] border-l border-emerald-500/40 h-full flex flex-col justify-between p-4 sm:p-6 shadow-2xl font-mono"><div class="space-y-3"><div class="flex items-center justify-between border-b border-slate-800 pb-3"><div class="pr-2"><span id="drawer-lang" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Tcl / SV</span><h3 id="drawer-title" class="text-sm sm:text-base font-bold text-white mt-1.5">Code Snippet</h3></div><button type="button" onclick="closeCodeDrawer()" class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs shrink-0">ESC &#10005;</button></div><pre id="drawer-code" class="p-3.5 sm:p-4 rounded-xl bg-[#04070E] border border-slate-800 text-emerald-400 text-[11px] sm:text-xs leading-relaxed overflow-x-auto max-h-[70vh] overflow-y-auto"></pre></div><div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs"><span class="text-slate-400">Author: Narendaran S G</span><button type="button" id="copy-snippet-btn" onclick="copyCurrentSnippet()" class="px-4 py-1.5 rounded bg-metal-m5 font-bold transition">Copy Code</button></div></div>`;
      document.body.appendChild(drawer);
    }
    const cardMap = { fifo: 'async-fifo-pd', gprs: 'gprs-top-pd', arbiter: 'chipthink-bus-arbiter', halfadder: 'half-adder-vcs' };
    Object.entries(cardMap).forEach(([key, id]) => {
      const card = document.querySelector(`.project-card[data-id="${id}"]`), footer = card && card.querySelector(':scope > div:last-child');
      if (footer && !footer.querySelector(`[data-snippet="${key}"]`)) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.setAttribute('data-snippet', key);
        btn.className = 'px-2.5 py-1 rounded bg-silicon-800 hover:bg-metal-m5/20 text-metal-m5 border border-metal-m5/40 text-[11px] font-mono transition';
        btn.textContent = '{ } View TCL / RTL'; btn.onclick = () => openCodeDrawer(key);
        footer.appendChild(btn);
      }
    });
  }

  window.openCodeDrawer = function(key) {
    const item = codeSnippets[key]; if (!item) return;
    document.getElementById('drawer-title').textContent = item.title; document.getElementById('drawer-lang').textContent = item.lang;
    document.getElementById('drawer-code').textContent = item.code; document.getElementById('code-snippet-drawer').classList.add('open');
  };
  window.closeCodeDrawer = function() { document.getElementById('code-snippet-drawer')?.classList.remove('open'); };
  window.copyCurrentSnippet = function() {
    navigator.clipboard?.writeText(document.getElementById('drawer-code')?.textContent || '');
    const btn = document.getElementById('copy-snippet-btn');
    if (btn) { btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = 'Copy Code'), 1500); }
  };

  function buildPaletteActions() {
    const totalProjects = document.querySelectorAll('.project-card').length;
    const themeEntries = Object.entries(window.getAvailableThemes ? window.getAvailableThemes() : {});
    return [
      { label: "01. Home & Linux EDA Terminal", tag: "View", run: () => switchPageView('home') },
      { label: "02. gprs_top QoR (33.2K Cells)", tag: "QoR", run: () => { switchPageView('qor'); switchQorBlock('gprs'); } },
      { label: "02. Async FIFO Dual-CTS QoR (0.00ns Skew)", tag: "QoR", run: () => { switchPageView('qor'); switchQorBlock('fifo'); } },
      { label: "03. Silicon Lab (Metal Stack, Arbiter, STA)", tag: "Lab", run: () => switchPageView('lab') },
      { label: `04. Chronicles (All ${totalProjects} Projects)`, tag: "Projects", run: () => switchPageView('projects') },
      { label: "05. Credentials & Resume", tag: "Certs", run: () => switchPageView('credentials') },
      { label: "HR: Start 4-Step Guided Tour", tag: "HR", run: () => window.startRecruiterTour && window.startRecruiterTour() },
      { label: "HR: Copy Recruiter Pack", tag: "HR", run: () => window.copyRecruiterPack && window.copyRecruiterPack() },
      ...themeEntries.map(([key, meta]) => ({ label: `Theme: ${meta.label}`, tag: "Theme", run: () => applySiteTheme(key) })),
      { label: "Open 1-Page Resume (A4)", tag: "Resume", run: () => { window.location.href = 'resume.html'; } }
    ];
  }

  function injectCommandPalette() {
    const rightControls = document.querySelector('header .flex.items-center.space-x-2');
    if (rightControls && !document.getElementById('cmd-palette-trigger')) {
      const kBtn = document.createElement('button');
      kBtn.id = 'cmd-palette-trigger'; kBtn.type = 'button'; kBtn.onclick = openCmdPalette;
      kBtn.className = 'px-2.5 py-1.5 rounded-lg bg-silicon-800 border border-slate-700 hover:border-metal-m5 text-xs font-mono text-slate-300 flex items-center gap-1.5';
      kBtn.innerHTML = `<span class="hidden sm:inline">Search</span><kbd class="px-1.5 py-0.5 text-[10px] bg-silicon-950 text-metal-m5 rounded border border-slate-700">Ctrl K</kbd>`;
      rightControls.insertBefore(kBtn, rightControls.firstChild);
    }
    if (!document.getElementById('cmd-palette-modal')) {
      const modal = document.createElement('div');
      modal.id = 'cmd-palette-modal'; modal.onclick = closeCmdPalette;
      modal.innerHTML = `<div onclick="event.stopPropagation()" class="w-full max-w-xl mx-3 bg-[#0B101E] border border-emerald-500/50 rounded-xl shadow-2xl overflow-hidden font-mono"><div class="p-3 bg-silicon-950 border-b border-slate-800 flex items-center gap-2.5"><span class="text-metal-m5 font-bold">&gt;_</span><input id="cmd-palette-input" type="text" placeholder="Jump to view, QoR, theme, HR tools..." class="w-full bg-transparent text-white text-xs outline-none" /><button type="button" onclick="closeCmdPalette()" class="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-silicon-800">ESC</button></div><div id="cmd-palette-list" class="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5"></div></div>`;
      document.body.appendChild(modal);
      document.getElementById('cmd-palette-input').addEventListener('input', e => renderPaletteItems(e.target.value));
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmdPalette(); }
        else if (e.key === 'Escape') { closeCmdPalette(); closeCodeDrawer(); }
      });
    }
  }

  function renderPaletteItems(query) {
    const list = document.getElementById('cmd-palette-list'); if (!list) return;
    const q = query.trim().toLowerCase();
    const filtered = buildPaletteActions().filter(a => a.label.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q));
    list.innerHTML = filtered.map((item, idx) => `<button type="button" data-idx="${idx}" class="cmd-item w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-500/15 flex items-center justify-between gap-2 text-xs transition"><span class="text-slate-200 truncate">${item.label}</span><span class="text-[10px] px-2 py-0.5 rounded bg-silicon-950 text-metal-m5 border border-emerald-500/30 shrink-0">${item.tag}</span></button>`).join('');
    list.querySelectorAll('.cmd-item').forEach((btn, i) => btn.addEventListener('click', () => { closeCmdPalette(); filtered[i].run(); }));
  }

  window.openCmdPalette = function() {
    const modal = document.getElementById('cmd-palette-modal'), input = document.getElementById('cmd-palette-input');
    if (!modal || !input) return; modal.classList.add('open'); input.value = ''; renderPaletteItems(''); setTimeout(() => input.focus(), 40);
  };
  window.closeCmdPalette = function() { document.getElementById('cmd-palette-modal')?.classList.remove('open'); };

  function injectHrEngagementSuite() {
    const homeView = document.getElementById('view-home');
    if (homeView && !document.getElementById('hr-recruiter-brief')) {
      const hrPanel = document.createElement('div');
      hrPanel.id = 'hr-recruiter-brief';
      hrPanel.className = 'rounded-xl p-4 sm:p-5 eda-border space-y-4 font-mono';
      hrPanel.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3"><div><div class="text-[10px] text-metal-m5 uppercase tracking-wider">RECRUITER &amp; HIRING MANAGER BRIEF</div><h3 class="text-sm sm:text-base font-bold text-white mt-0.5">Role Lens, Bug-to-Signoff Fixes &amp; Guided Tour</h3></div><div class="flex flex-wrap items-center gap-1.5 text-[11px]"><button type="button" data-hr-lens="all" class="hr-lens-btn px-2.5 py-1 rounded bg-metal-m5 font-bold">All Roles</button><button type="button" data-hr-lens="pd" class="hr-lens-btn px-2.5 py-1 rounded bg-silicon-800 text-slate-300 border border-slate-700">Physical Design</button><button type="button" data-hr-lens="rtl" class="hr-lens-btn px-2.5 py-1 rounded bg-silicon-800 text-slate-300 border border-slate-700">RTL / Verif</button><button type="button" data-hr-lens="dft" class="hr-lens-btn px-2.5 py-1 rounded bg-silicon-800 text-slate-300 border border-slate-700">DFT / Flow</button><button type="button" onclick="window.copyRecruiterPack()" class="px-2.5 py-1 rounded bg-silicon-800 text-metal-m3 border border-metal-m3/40 hover:bg-metal-m3/10">Copy Recruiter Pack</button><button type="button" onclick="window.startRecruiterTour()" class="px-2.5 py-1 rounded bg-silicon-800 text-metal-m6 border border-metal-m6/40 hover:bg-metal-m6/10">Guided Tour (1/4)</button></div></div><div id="hr-lens-summary" class="p-3 rounded-lg bg-silicon-950/90 border border-slate-800 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2"><span><strong>Focus:</strong> End-to-end ASIC Physical Design (ICC2, Innovus, OpenLane), RTL/SV verification, and scan DFT (CGPA 9.30, Chennai).</span><a href="resume.html" class="text-metal-m5 font-semibold hover:underline">Open 1-Page Resume &rarr;</a></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"><div class="p-3 rounded-lg bg-silicon-950 border border-slate-800 space-y-1"><div class="text-[10px] text-metal-m8 uppercase font-bold">PG MESH FIX - gprs_top</div><div class="text-slate-200"><strong>Issue:</strong> 179 missing PG vias across M8/M7/M2 mesh.</div><div class="text-metal-m3"><strong>Result:</strong> Stitched vias &rarr; 0 PG DRC, 0 PG shorts.</div></div><div class="p-3 rounded-lg bg-silicon-950 border border-slate-800 space-y-1"><div class="text-[10px] text-metal-m5 uppercase font-bold">DUAL-CLOCK CTS - Async FIFO</div><div class="text-slate-200"><strong>Issue:</strong> Async wclk/rclk domains + 2 via-spacing DRCs.</div><div class="text-metal-m3"><strong>Result:</strong> 0.00 ns per-domain skew, 0 DRC, +0.16 ns WNS.</div></div><div class="p-3 rounded-lg bg-silicon-950 border border-slate-800 space-y-1"><div class="text-[10px] text-metal-m6 uppercase font-bold">ROUTE ECO - Signoff</div><div class="text-slate-200"><strong>Issue:</strong> 34 routing shorts &amp; slew/cap violations.</div><div class="text-metal-m3"><strong>Result:</strong> Fixed via route_eco &rarr; 0 shorts, 0 opens.</div></div></div><div class="flex flex-wrap items-center gap-1.5 text-[11px]"><span class="text-slate-400 mr-1">Tool Proof Filter:</span>${['ALL', 'ICC2', 'Innovus', 'Genus', 'OpenLane', 'VCS', 'SystemVerilog'].map(tool => `<button type="button" data-hr-tool="${tool}" class="hr-tool-btn px-2 py-0.5 rounded bg-silicon-800 text-slate-300 border border-slate-700 hover:border-metal-m5">${tool}</button>`).join('')}</div>`;
      homeView.insertBefore(hrPanel, homeView.firstChild);

      const lensNotes = {
        all: "<strong>Focus:</strong> End-to-end ASIC Physical Design (ICC2, Innovus, OpenLane), RTL/SV verification, and scan DFT (CGPA 9.30, Chennai).",
        pd: "<strong>Physical Design Lens:</strong> 33,286-cell 16-macro gprs_top (0.14 ns skew, 0 shorts post-ECO), Async FIFO (0 DRC, +0.16 ns WNS), Innovus (0.011 ns skew), OpenLane SKY130.",
        rtl: "<strong>RTL &amp; Verification Lens:</strong> ChipThink finals multi-master bus arbiter (8-cycle anti-starvation counter), 4-abstraction Verilog/CMOS half adder in VCS, EV station controller.",
        dft: "<strong>DFT &amp; Signoff Lens:</strong> Cadence Genus &amp; Modus scan-chain insertion, shift/capture validation, 0 DFT violations, and signoff timing checks."
      };

      hrPanel.querySelectorAll('.hr-lens-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lens = btn.getAttribute('data-hr-lens');
          hrPanel.querySelectorAll('.hr-lens-btn').forEach(b => { b.className = b === btn ? 'hr-lens-btn px-2.5 py-1 rounded bg-metal-m5 font-bold' : 'hr-lens-btn px-2.5 py-1 rounded bg-silicon-800 text-slate-300 border border-slate-700'; });
          const noteEl = document.getElementById('hr-lens-summary');
          if (noteEl) noteEl.innerHTML = `${lensNotes[lens] || lensNotes.all} <a href="resume.html" class="text-metal-m5 font-semibold hover:underline">Open 1-Page Resume &rarr;</a>`;
          if (typeof window.filterProjects === 'function') window.filterProjects(lens === 'all' ? 'all' : lens);
        });
      });

      hrPanel.querySelectorAll('.hr-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tool = btn.getAttribute('data-hr-tool');
          hrPanel.querySelectorAll('.hr-tool-btn').forEach(b => b.classList.toggle('bg-metal-m3', b === btn));
          if (typeof window.switchPageView === 'function') window.switchPageView('projects');
          setTimeout(() => {
            document.querySelectorAll('.project-card').forEach(card => {
              card.style.display = (tool === 'ALL' || card.textContent.toLowerCase().includes(tool.toLowerCase())) ? 'flex' : 'none';
            });
          }, 180);
        });
      });
    }

    const qorImg = document.getElementById('qor-stage-img');
    if (qorImg && qorImg.parentElement && !document.getElementById('hr-layout-pins')) {
      const pinsWrap = document.createElement('div');
      pinsWrap.id = 'hr-layout-pins'; pinsWrap.className = 'mt-2 flex flex-wrap gap-1.5 font-mono text-[10.5px]';
      const pinNotes = [
        ['SRAM Macros', 'Hard memory blocks placed with data-flow flylines and soft spacing blockages to avoid congestion.'],
        ['Power Mesh', 'Multi-layer straps (M8/M7/M2 down to M1 rails) distribute VDD/VSS with 0 PG DRC.'],
        ['Clock Tree', 'Buffered clock tree balanced using dwds NDR rules for low skew.'],
        ['Routed Netlist', 'Signal interconnects routed with route_eco short cleanup and signoff timing checks.']
      ];
      pinsWrap.innerHTML = pinNotes.map(([label], idx) => `<button type="button" data-pin="${idx}" class="px-2 py-0.5 rounded bg-silicon-800 border border-slate-700 text-slate-300 hover:border-metal-m5">${label}</button>`).join('') + `<div id="hr-pin-caption" class="w-full text-[11px] text-slate-400 mt-1">Click a layout callout to inspect what reviewers check in the layout.</div>`;
      qorImg.parentElement.appendChild(pinsWrap);
      pinsWrap.querySelectorAll('[data-pin]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-pin')), cap = document.getElementById('hr-pin-caption');
          if (cap && pinNotes[idx]) cap.innerHTML = `<strong class="text-metal-m5">${pinNotes[idx][0]}:</strong> ${pinNotes[idx][1]}`;
        });
      });
    }
  }

  window.copyRecruiterPack = function() {
    const pack = [
      "Narendaran S G - B.E. ECE (2023-2027, CGPA 9.30), Easwari Engineering College, Chennai",
      "Focus: ASIC Physical Design (Synopsys ICC2, Cadence Innovus, OpenLane/SKY130), RTL/SV Verification (VCS), DFT (Genus/Modus)",
      "Highlights: gprs_top (33,286 cells, 16 SRAM macros, 0.14 ns skew, 0 shorts post-ECO); Async FIFO (0 DRC, +0.16 ns WNS); Innovus (0.011 ns skew)",
      "Portfolio: https://narendaransg.github.io/ | Resume: https://narendaransg.github.io/resume.html | Email: sgnarendaran@gmail.com"
    ].join("\n");
    navigator.clipboard?.writeText(pack);
    showToast('RECRUITER PACK COPIED', 'Summary, key metrics, resume, and contact links copied.');
  };

  const TOUR_STEPS = [
    { view: 'home', title: 'Step 1/4: Overview & Live EDA Terminal', text: 'Key metrics, role lens, and Linux terminal (neofetch, gprs, fifo).' },
    { view: 'qor', title: 'Step 2/4: Stage-by-Stage Physical Design QoR', text: 'Compare gprs_top and Async FIFO from floorplan to signoff.' },
    { view: 'lab', title: 'Step 3/4: Metal Stack, Arbiter + GTKWave & STA', text: 'Step the bus arbiter, slide layout views, and test setup/hold slack.' },
    { view: 'credentials', title: 'Step 4/4: Credentials, Internship & Resume', text: 'Verified certifications, Nokia training, and 1-page resume.' }
  ];
  let tourIdx = 0;

  window.startRecruiterTour = function() { tourIdx = 0; runTourStep(tourIdx); };
  function runTourStep(idx) {
    const step = TOUR_STEPS[idx % TOUR_STEPS.length];
    if (typeof window.switchPageView === 'function') window.switchPageView(step.view);
    showToast(step.title, `${step.text} (Alt+N for next step)`);
    tourIdx = (idx + 1) % TOUR_STEPS.length;
  }
  document.addEventListener('keydown', e => { if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); runTourStep(tourIdx); } });

  function initEasterEggs() {
    const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    let seqIdx = 0;
    document.addEventListener('keydown', e => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === SEQ[seqIdx]) {
        seqIdx++;
        if (seqIdx === SEQ.length) {
          seqIdx = 0;
          const on = document.documentElement.classList.toggle('golden-gds-override');
          if (on && typeof window.applySiteTheme === 'function') window.applySiteTheme('gds-scope');
          showToast(on ? 'MASK OVERRIDE: GOLDEN GDS VIEW' : 'MASK OVERRIDE OFF', on ? 'DRC bypass & phosphor reticle active.' : 'Standard signoff view restored.');
        }
      } else seqIdx = e.key === SEQ[0] ? 1 : 0;
    });

    let hotspotTriggered = false;
    window.addEventListener('mousemove', e => {
      if (hotspotTriggered) return;
      const umX = e.clientX * 0.425, umY = (window.innerHeight - e.clientY) * 0.425;
      if (Math.abs(umX - 137) <= 28 && Math.abs(umY - 42) <= 28) {
        hotspotTriggered = true;
        showToast('FOUND VIA_CLUSTER_0x4F', 'TIMING_CLOSURE_UNLOCKED at X=137um, Y=42um.');
        if (window.chipFx && typeof window.chipFx.spawnVia === 'function') window.chipFx.spawnVia(e.clientX, e.clientY);
      }
    }, { passive: true });

    const mascotBtn = document.getElementById('chip-mascot-btn');
    if (mascotBtn) {
      let clicks = 0, resetT = null, verifOn = false;
      const lines = [
        'VERIFICATION_MODE: False paths constrained or just hoping PrimeTime agrees?',
        'VERIFICATION_MODE: 99.4% coverage - that missing 0.6% has the corner case.',
        'VERIFICATION_MODE: Fixed hold with buffers; check setup margin next.'
      ];
      mascotBtn.addEventListener('click', () => {
        clicks++;
        clearTimeout(resetT);
        resetT = setTimeout(() => { clicks = 0; }, 1400);
        if (clicks >= 5) {
          clicks = 0; verifOn = !verifOn;
          mascotBtn.style.borderColor = verifOn ? '#EF4444' : '';
          showToast(verifOn ? 'ASIC-BOT // VERIFICATION_MODE' : 'ASIC-BOT // STANDARD MODE', lines[Math.floor(Math.random() * lines.length)]);
        }
      });
    }
  }

  function initAll() {
    runSiliconBootAnimation();
    injectGtkWaveViewer();
    injectLayoutSliderAndStaSection();
    injectCodeDrawer();
    injectCommandPalette();
    injectHrEngagementSuite();
    initEasterEggs();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
