/**
 * portfolio-engine.js (File 4 of 4)
 * Drives the interactive canvas background, Linux terminal, QoR telemetry tables,
 * 3D metal stack inspector, STA calculator, and sub-page view router.
 */

(function initPortfolioEngine() {
  let currentBlock = 'gprs';
  let currentStage = 'floorplan';
  let transitionParticles = [];

  // 1. Theme Engine & Canvas Refresh
  window.applySiteTheme = function(theme) {
    const htmlEl = document.documentElement;
    const iconEl = document.getElementById('theme-icon');
    const labelEl = document.getElementById('theme-label');
    
    if (theme === 'light') {
      htmlEl.classList.add('light-theme');
      htmlEl.classList.remove('dark');
      if (iconEl) iconEl.innerHTML = '&#9728;';
      if (labelEl) labelEl.textContent = 'Light';
    } else {
      htmlEl.classList.remove('light-theme');
      htmlEl.classList.add('dark');
      if (iconEl) iconEl.innerHTML = '&#9789;';
      if (labelEl) labelEl.textContent = 'Dark';
    }
    localStorage.setItem('narendaran_site_theme', theme);
    const canvas = document.getElementById('asic-canvas');
    if (canvas && typeof canvas.triggerRedraw === 'function') canvas.triggerRedraw();
  };

  window.toggleSiteTheme = function() {
    const current = localStorage.getItem('narendaran_site_theme') || 'dark';
    applySiteTheme(current === 'dark' ? 'light' : 'dark');
  };

  applySiteTheme(localStorage.getItem('narendaran_site_theme') || 'dark');

  // 2. View Router & Particle Bursts
  function spawnTransitionParticles(originX, originY) {
    const colors = ['#F5B041', '#10B981', '#FFD166', '#F59E0B'];
    const cx = originX || window.innerWidth / 2;
    const cy = originY || 56;
    for (let i = 0; i < 34; i++) {
      const angle = (Math.PI * 2 * i) / 34 + (Math.random() - 0.5) * 0.3;
      const speed = 2.5 + Math.random() * 6.5;
      transitionParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }
  }

  window.switchPageView = function(viewKey, evt) {
    if (evt && evt.clientX) {
      spawnTransitionParticles(evt.clientX, evt.clientY);
    } else {
      spawnTransitionParticles(window.innerWidth / 2, 54);
    }

    document.querySelectorAll('.app-view').forEach(sec => {
      sec.classList.remove('view-visible');
      setTimeout(() => {
        if (sec.id !== 'view-' + viewKey) {
          sec.classList.remove('active-view');
        }
      }, 160);
    });

    const target = document.getElementById('view-' + viewKey);
    if (target) {
      setTimeout(() => {
        document.querySelectorAll('.app-view').forEach(s => s.classList.remove('active-view'));
        target.classList.add('active-view');
        requestAnimationFrame(() => {
          target.classList.add('view-visible');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (viewKey === 'qor') renderQorDashboard();
      }, 165);
    }

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewKey) {
        btn.classList.add('active-nav');
      } else {
        btn.classList.remove('active-nav');
      }
    });
  };

  window.toggleMobileMenu = function(forceState) {
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!drawer) return;
    const show = typeof forceState === 'boolean' ? forceState : drawer.classList.contains('hidden');
    if (show) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
  };

  // 3. Background Routing Canvas Engine
  (function initInteractiveSiliconCanvas() {
    const canvas = document.getElementById('asic-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coordReadout = document.getElementById('die-coords-readout');

    let width = window.innerWidth;
    let height = window.innerHeight;
    const pitch = 72;
    let cols = 0;
    let rows = 0;

    const mouse = { x: -1000, y: -1000, active: false };
    let macros = [];
    let vias = [];
    let packets = [];
    let customTraceNodes = [];

    const layerColors = [
      { name: 'M5', hex: '#F5B041', rgba: 'rgba(245, 176, 65, ' },
      { name: 'M6', hex: '#FFD166', rgba: 'rgba(255, 209, 102, ' },
      { name: 'M3', hex: '#10B981', rgba: 'rgba(16, 185, 129, ' },
      { name: 'M8', hex: '#F59E0B', rgba: 'rgba(245, 158, 11, ' }
    ];

    function buildAsicGrid() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / pitch);
      rows = Math.ceil(height / pitch);

      macros = [
        {
          x: pitch * 1,
          y: pitch * 2.2,
          w: pitch * 2.5,
          h: pitch * 1.6,
          label: 'SRAM_64x32_0',
          family: 'M6/M5',
          color: 'rgba(245, 176, 65, 0.04)',
          border: 'rgba(245, 176, 65, 0.16)'
        },
        {
          x: Math.max(pitch * 5, (cols - 3.5) * pitch),
          y: pitch * 2.2,
          w: pitch * 2.5,
          h: pitch * 2,
          label: 'GPRS_MEM_1',
          family: 'ICC2',
          color: 'rgba(16, 185, 129, 0.035)',
          border: 'rgba(16, 185, 129, 0.16)'
        }
      ];

      vias = [];
      for (let c = 1; c < cols; c++) {
        for (let r = 1; r < rows; r++) {
          if ((c + r) % 3 === 0) vias.push({ x: c * pitch, y: r * pitch });
        }
      }

      const packetCount = Math.min(22, Math.max(12, Math.floor((width * height) / 64000)));
      packets = [];
      for (let i = 0; i < packetCount; i++) packets.push(createPacket());
    }

    function createPacket() {
      const layer = layerColors[Math.floor(Math.random() * layerColors.length)];
      const horiz = Math.random() > 0.5;
      const c = Math.floor(Math.random() * cols);
      const r = Math.floor(Math.random() * rows);
      const speed = 1.4 + Math.random() * 1.6;
      return {
        x: c * pitch,
        y: r * pitch,
        vx: horiz ? (Math.random() > 0.5 ? speed : -speed) : 0,
        vy: !horiz ? (Math.random() > 0.5 ? speed : -speed) : 0,
        layer: layer,
        trail: [],
        maxTrail: 16,
        lastTurnGridX: -1,
        lastTurnGridY: -1
      };
    }

    function updateAndDraw() {
      ctx.clearRect(0, 0, width, height);
      const isLight = document.documentElement.classList.contains('light-theme');

      ctx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        const x = c * pitch;
        ctx.strokeStyle = c % 4 === 0 
          ? (isLight ? 'rgba(154, 107, 19, 0.04)' : 'rgba(245, 176, 65, 0.05)') 
          : (isLight ? 'rgba(154, 107, 19, 0.018)' : 'rgba(212, 175, 55, 0.03)');
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * pitch;
        ctx.strokeStyle = r % 4 === 0 
          ? (isLight ? 'rgba(4, 120, 87, 0.035)' : 'rgba(16, 185, 129, 0.045)') 
          : (isLight ? 'rgba(180, 131, 39, 0.018)' : 'rgba(245, 158, 11, 0.03)');
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (width > 768) {
        ctx.font = '7.5px "JetBrains Mono", monospace';
        macros.forEach(m => {
          ctx.fillStyle = isLight ? 'rgba(154, 107, 19, 0.03)' : m.color;
          ctx.fillRect(m.x, m.y, m.w, m.h);
          ctx.strokeStyle = isLight ? 'rgba(154, 107, 19, 0.12)' : m.border;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(m.x, m.y, m.w, m.h);

          ctx.fillStyle = isLight ? 'rgba(24, 24, 27, 0.28)' : 'rgba(212, 175, 55, 0.38)';
          ctx.fillText(`${m.label}`, m.x + 6, m.y + 11);
        });
      }

      vias.forEach(v => {
        ctx.fillStyle = isLight ? 'rgba(154, 107, 19, 0.1)' : 'rgba(245, 176, 65, 0.14)';
        ctx.fillRect(v.x - 1.5, v.y - 1.5, 3, 3);
      });

      if (mouse.active && Math.random() < 0.4) {
        customTraceNodes.push({
          x: mouse.x + (Math.random() - 0.5) * 25,
          y: mouse.y + (Math.random() - 0.5) * 25,
          life: 1.0,
          color: layerColors[Math.floor(Math.random() * layerColors.length)].hex
        });
      }

      if (mouse.active) {
        customTraceNodes.forEach((node, idx) => {
          node.life -= 0.014;
          if (node.life <= 0) {
            customTraceNodes.splice(idx, 1);
          } else {
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = node.color + Math.round(node.life * 28).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
            ctx.fillStyle = node.color;
            ctx.fillRect(node.x - 1, node.y - 1, 2, 2);
          }
        });
      }

      packets.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrail) p.trail.shift();

        const nearGridX = Math.round(p.x / pitch) * pitch;
        const nearGridY = Math.round(p.y / pitch) * pitch;
        if (
          Math.abs(p.x - nearGridX) < 2 &&
          Math.abs(p.y - nearGridY) < 2 &&
          (nearGridX !== p.lastTurnGridX || nearGridY !== p.lastTurnGridY)
        ) {
          if (Math.random() < 0.28) {
            p.x = nearGridX;
            p.y = nearGridY;
            p.lastTurnGridX = nearGridX;
            p.lastTurnGridY = nearGridY;
            const speed = Math.max(Math.abs(p.vx), Math.abs(p.vy));
            if (p.vx !== 0) {
              p.vx = 0;
              p.vy = Math.random() > 0.5 ? speed : -speed;
            } else {
              p.vy = 0;
              p.vx = Math.random() > 0.5 ? speed : -speed;
            }
          }
        }

        if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) {
          Object.assign(p, createPacket());
        }

        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const alpha = (i / p.trail.length) * (isLight ? 0.38 : 0.55);
            ctx.strokeStyle = p.layer.rgba + alpha + ')';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = p.layer.hex;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      });

      for (let i = transitionParticles.length - 1; i >= 0; i--) {
        const pt = transitionParticles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.024;
        if (pt.alpha <= 0) {
          transitionParticles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
          ctx.restore();
        }
      }

      requestAnimationFrame(updateAndDraw);
    }

    canvas.triggerRedraw = () => buildAsicGrid();
    window.addEventListener('resize', buildAsicGrid);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (coordReadout) {
        const umX = (e.clientX * 0.425).toFixed(2);
        const umY = ((height - e.clientY) * 0.425).toFixed(2);
        coordReadout.textContent = `DIE CURSOR: X=${umX} um, Y=${umY} um`;
      }
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    buildAsicGrid();
    updateAndDraw();
  })();

  // 4. QoR Explorer Renderer
  function renderQorDashboard() {
    if (!window.qorData) return;
    const block = window.qorData[currentBlock];
    const stage = block.stages[currentStage];

    const badgeEl = document.getElementById('qor-badge');
    const titleEl = document.getElementById('qor-stage-title');
    const descEl = document.getElementById('qor-stage-desc');
    const capEl = document.getElementById('qor-img-caption');
    const actionEl = document.getElementById('qor-action-note');

    if (badgeEl) badgeEl.textContent = block.badge;
    if (titleEl) titleEl.textContent = stage.title;
    if (descEl) descEl.textContent = stage.desc;
    if (capEl) capEl.textContent = stage.caption;
    if (actionEl) actionEl.textContent = stage.action;

    const imgEl = document.getElementById('qor-stage-img');
    const fallbackEl = document.getElementById('qor-img-fallback');
    if (imgEl && fallbackEl) {
      imgEl.style.display = 'block';
      fallbackEl.style.display = 'none';
      imgEl.src = stage.img;
      document.getElementById('qor-fallback-filename').textContent = stage.img;
    }

    const barsContainer = document.getElementById('qor-bars-container');
    if (barsContainer) {
      barsContainer.innerHTML = stage.bars.map(b => `
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-slate-300">${b.label}</span>
            <span class="font-bold text-white">${b.valText}</span>
          </div>
          <div class="w-full h-2 bg-silicon-800 rounded-full overflow-hidden">
            <div class="qor-bar-fill h-full ${b.color} rounded-full" style="width: 0%" data-target="${b.pct}%"></div>
          </div>
        </div>
      `).join('');

      requestAnimationFrame(() => {
        setTimeout(() => {
          document.querySelectorAll('.qor-bar-fill').forEach(el => {
            el.style.width = el.getAttribute('data-target');
          });
        }, 30);
      });
    }

    const metricsGrid = document.getElementById('qor-metrics-grid');
    if (metricsGrid) {
      metricsGrid.innerHTML = stage.metrics.map(([label, val]) => `
        <div class="p-3 rounded bg-silicon-950/90 border border-slate-800">
          <div class="text-[10px] text-slate-400 uppercase">${label}</div>
          <div class="text-xs sm:text-sm font-bold text-white mt-0.5">${val}</div>
        </div>
      `).join('');
    }

    const tbody = document.getElementById('qor-progression-tbody');
    if (tbody) {
      tbody.innerHTML = block.progression.map(row => `
        <tr>
          <td class="py-2 px-3 font-semibold text-slate-200">${row[0]}</td>
          <td class="py-2 px-3 text-slate-400">${row[1]}</td>
          <td class="py-2 px-3 text-slate-400">${row[2]}</td>
          <td class="py-2 px-3 text-slate-400">${row[3]}</td>
          <td class="py-2 px-3 text-metal-m3 font-semibold">${row[4]}</td>
        </tr>
      `).join('');
    }

    document.querySelectorAll('.qor-tab').forEach(btn => {
      if (btn.dataset.stage === currentStage) {
        btn.className = "qor-tab p-3 rounded-lg bg-silicon-800 border border-metal-m5 text-left transition";
      } else {
        btn.className = "qor-tab p-3 rounded-lg bg-silicon-900/90 border border-slate-800 text-left hover:border-slate-700 transition";
      }
    });
  }

  window.switchQorBlock = function(blockKey) {
    currentBlock = blockKey;
    const btnGprs = document.getElementById('btn-block-gprs');
    const btnFifo = document.getElementById('btn-block-fifo');
    if (blockKey === 'gprs') {
      if (btnGprs) btnGprs.className = "px-3 sm:px-4 py-2 rounded-md bg-metal-m5 font-bold transition";
      if (btnFifo) btnFifo.className = "px-3 sm:px-4 py-2 rounded-md text-slate-300 hover:text-white transition";
    } else {
      if (btnFifo) btnFifo.className = "px-3 sm:px-4 py-2 rounded-md bg-metal-m5 font-bold transition";
      if (btnGprs) btnGprs.className = "px-3 sm:px-4 py-2 rounded-md text-slate-300 hover:text-white transition";
    }
    renderQorDashboard();
  };

  window.switchQorStage = function(stageKey) {
    currentStage = stageKey;
    renderQorDashboard();
  };

  // 5. 3D Metal Stack & Bus Arbiter Logic
  window.selectMetalLayer = function(key) {
    if (!window.metalLayersData) return;
    const data = window.metalLayersData[key];
    const titleEl = document.getElementById('metal-detail-title');
    if (titleEl) {
      titleEl.className = `${data.colorClass} font-bold text-sm`;
      titleEl.textContent = data.title;
    }
    const descEl = document.getElementById('metal-detail-desc');
    if (descEl) descEl.textContent = data.desc;
    const specsEl = document.getElementById('metal-detail-specs');
    if (specsEl) {
      specsEl.innerHTML = `
        <div><span class="text-slate-400">Block A:</span> <span class="text-white font-semibold">${data.specA}</span></div>
        <div><span class="text-slate-400">Block B:</span> <span class="text-white font-semibold">${data.specB}</span></div>
      `;
    }

    ['m8m7', 'm6m5_ports', 'm5m4_cts', 'm2_straps', 'm1_rails'].forEach(id => {
      const el = document.getElementById('slab-' + id);
      if (el) {
        if (id === key) el.classList.add('active-slab', 'border-metal-m5');
        else el.classList.remove('active-slab', 'border-metal-m5');
      }
    });
  };

  window.arbState = {
    cycle: 0,
    req_cpu: true,
    req_dma: true,
    req_periph: false,
    wait_cnt: 0,
    last_secondary: 'periph',
    autoTimer: null
  };

  window.toggleArbiterReq = function(master) {
    if (master === 'cpu') arbState.req_cpu = !arbState.req_cpu;
    if (master === 'dma') arbState.req_dma = !arbState.req_dma;
    if (master === 'periph') arbState.req_periph = !arbState.req_periph;
    updateArbiterButtons();
  };

  function updateArbiterButtons() {
    const cfg = [
      { key: 'cpu', active: arbState.req_cpu, color: 'metal-m5' },
      { key: 'dma', active: arbState.req_dma, color: 'metal-m3' },
      { key: 'periph', active: arbState.req_periph, color: 'metal-m6' }
    ];
    cfg.forEach(({ key, active, color }) => {
      const btn = document.getElementById(`btn-req-${key}`);
      const dot = document.getElementById(`dot-req-${key}`);
      const txt = document.getElementById(`txt-req-${key}`);
      if (btn && dot && txt) {
        if (active) {
          btn.className = `p-3 rounded-lg bg-silicon-800 border border-${color} text-left transition`;
          dot.className = `w-2.5 h-2.5 rounded-full bg-${color}`;
          txt.className = `text-[11px] text-${color} font-semibold mt-1`;
          txt.textContent = `req_${key} = 1 (ACTIVE)`;
        } else {
          btn.className = `p-3 rounded-lg bg-silicon-950 border border-slate-700 text-left transition`;
          dot.className = `w-2.5 h-2.5 rounded-full bg-slate-500`;
          txt.className = `text-[11px] text-slate-400 mt-1`;
          txt.textContent = `req_${key} = 0 (IDLE)`;
        }
      }
    });
  }

  window.stepArbiterClock = function() {
    arbState.cycle++;
    let grant = "IDLE (2'b00)";
    let badge = "BUS IDLE";
    let logMsg = "";
    const secondaryWaiting = arbState.req_dma || arbState.req_periph;

    if (!arbState.req_cpu && !secondaryWaiting) {
      arbState.wait_cnt = 0;
      grant = "IDLE (2'b00)";
      badge = "NO ACTIVE REQUESTS";
      logMsg = `[Cycle ${arbState.cycle}] All master request lines de-asserted. Bus is IDLE.`;
    } else if (arbState.req_cpu && !secondaryWaiting) {
      arbState.wait_cnt = 0;
      grant = "CPU (2'b01)";
      badge = "PRIORITY: CPU EXCLUSIVE";
      logMsg = `[Cycle ${arbState.cycle}] Only CPU requesting bus -> Granted to CPU (wait_cnt = 0).`;
    } else if (!arbState.req_cpu && secondaryWaiting) {
      arbState.wait_cnt = 0;
      if (arbState.req_dma && arbState.req_periph) {
        if (arbState.last_secondary === 'dma') {
          grant = "PERIPH (2'b11)";
          arbState.last_secondary = 'periph';
        } else {
          grant = "DMA (2'b10)";
          arbState.last_secondary = 'dma';
        }
        badge = "ROUND-ROBIN: DMA <-> PERIPH";
        logMsg = `[Cycle ${arbState.cycle}] CPU idle; rotating grant fairly -> Granted ${grant}.`;
      } else if (arbState.req_dma) {
        grant = "DMA (2'b10)";
        arbState.last_secondary = 'dma';
        badge = "GRANTED: DMA";
        logMsg = `[Cycle ${arbState.cycle}] CPU idle -> DMA granted immediate bus access.`;
      } else {
        grant = "PERIPH (2'b11)";
        arbState.last_secondary = 'periph';
        badge = "GRANTED: PERIPHERAL";
        logMsg = `[Cycle ${arbState.cycle}] CPU idle -> Peripheral granted immediate bus access.`;
      }
    } else {
      if (arbState.wait_cnt < 8) {
        arbState.wait_cnt++;
        grant = "CPU (2'b01)";
        badge = `CONTENTION: CPU SERVED (${arbState.wait_cnt}/8)`;
        logMsg = `[Cycle ${arbState.cycle}] Contention! Priority 1 serves CPU while wait_cnt increments (${arbState.wait_cnt}/8).`;
      } else {
        if (arbState.req_dma && arbState.req_periph) {
          if (arbState.last_secondary === 'dma') {
            grant = "PERIPH (2'b11)";
            arbState.last_secondary = 'periph';
          } else {
            grant = "DMA (2'b10)";
            arbState.last_secondary = 'dma';
          }
        } else if (arbState.req_dma) {
          grant = "DMA (2'b10)";
          arbState.last_secondary = 'dma';
        } else {
          grant = "PERIPH (2'b11)";
          arbState.last_secondary = 'periph';
        }
        badge = "ANTI-STARVATION OVERRIDE TRIGGERED!";
        logMsg = `[Cycle ${arbState.cycle}] STARVATION PREVENTED! 8-cycle threshold reached -> Forced switch to ${grant}!`;
        arbState.wait_cnt = 0;
      }
    }

    const cycEl = document.getElementById('arb-cycle');
    const gntEl = document.getElementById('arb-grant');
    const cntEl = document.getElementById('arb-counter');
    const badgeEl = document.getElementById('arb-status-badge');
    const barEl = document.getElementById('arb-wait-bar');
    const logEl = document.getElementById('arb-log-line');

    if (cycEl) cycEl.textContent = arbState.cycle;
    if (gntEl) gntEl.textContent = grant;
    if (cntEl) cntEl.textContent = `${arbState.wait_cnt} / 8`;
    if (badgeEl) badgeEl.textContent = badge;
    if (barEl) barEl.style.width = `${(arbState.wait_cnt / 8) * 100}%`;
    if (logEl) logEl.textContent = logMsg;
  };

  window.toggleArbiterAuto = function() {
    const btn = document.getElementById('btn-arb-autorun');
    if (arbState.autoTimer) {
      clearInterval(arbState.autoTimer);
      arbState.autoTimer = null;
      if (btn) {
        btn.textContent = "Auto: OFF";
        btn.className = "px-3 py-2 rounded bg-silicon-800 border border-metal-m5/40 text-metal-m5 font-semibold hover:bg-metal-m5/10 transition";
      }
    } else {
      stepArbiterClock();
      arbState.autoTimer = setInterval(stepArbiterClock, 900);
      if (btn) {
        btn.textContent = "Auto: ON";
        btn.className = "px-3 py-2 rounded bg-metal-m5 font-bold transition";
      }
    }
  };

  window.resetArbiter = function() {
    if (arbState.autoTimer) toggleArbiterAuto();
    arbState.cycle = 0;
    arbState.wait_cnt = 0;
    const cycEl = document.getElementById('arb-cycle');
    const gntEl = document.getElementById('arb-grant');
    const cntEl = document.getElementById('arb-counter');
    const badgeEl = document.getElementById('arb-status-badge');
    const barEl = document.getElementById('arb-wait-bar');
    const logEl = document.getElementById('arb-log-line');

    if (cycEl) cycEl.textContent = "0";
    if (gntEl) gntEl.textContent = "CPU (2'b01)";
    if (cntEl) cntEl.textContent = "0 / 8";
    if (badgeEl) badgeEl.textContent = "PRIORITY: CPU SERVED FIRST";
    if (barEl) barEl.style.width = "0%";
    if (logEl) logEl.textContent = "[Reset] Counter cleared. Step the clock to observe multi-master arbitration.";
  };

  // 6. Linux Terminal Logic
  const cmdHistory = [];
  let historyIdx = -1;

  window.focusTerminalInput = function() {
    document.getElementById('terminal-input')?.focus();
  };

  window.handleTerminalSubmit = function(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('terminal-input');
    if (!input) return;
    const rawVal = input.value.trim();
    if (!rawVal) return;
    input.value = '';
    executeCommand(rawVal);
  };

  window.executeCommand = function(rawCmd) {
    const log = document.getElementById('terminal-log');
    const body = document.getElementById('terminal-body');
    if (!log || !body) return;
    const cleanCmd = rawCmd.trim();
    const lowerKey = cleanCmd.toLowerCase();

    cmdHistory.push(cleanCmd);
    historyIdx = cmdHistory.length;

    if (lowerKey === 'clear' || lowerKey === 'cls') {
      log.innerHTML = `<div class="text-slate-500"># Terminal buffer cleared. Type 'neofetch' or 'help'.</div>`;
      body.scrollTop = body.scrollHeight;
      return;
    }

    const cmdAliases = {
      'ls': 'ls -la',
      'll': 'ls -la',
      'dir': 'ls -la',
      'uname': 'uname -a',
      'report_qor': 'gprs',
      'report_clock_qor': 'fifo',
      'vcs': 'arbiter'
    };

    const resolvedKey = cmdAliases[lowerKey] || lowerKey;
    const terminalCommands = window.terminalCommands || {};
    const outputText = terminalCommands[resolvedKey] ||
      `bash: ${cleanCmd}: command not found. Type 'help' or 'neofetch' for available commands.`;

    const entry = document.createElement('div');
    entry.className = 'space-y-1 pt-1 border-t border-slate-800/50';

    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span class="text-emerald-400 font-bold">narendaran@asic-node</span>:<span class="text-amber-300 font-bold">~/vlsi_workspace</span>$ <span class="text-white">${cleanCmd}</span>`;

    const pre = document.createElement('pre');
    pre.className = (terminalCommands[resolvedKey] ? 'text-emerald-300' : 'text-amber-400') + ' text-[11px] whitespace-pre-wrap leading-relaxed';

    entry.appendChild(cmdLine);
    entry.appendChild(pre);
    log.appendChild(entry);

    const lines = outputText.split('\n');
    let idx = 0;
    function streamNextLine() {
      if (idx < lines.length) {
        pre.textContent += (idx > 0 ? '\n' : '') + lines[idx];
        idx++;
        body.scrollTop = body.scrollHeight;
        setTimeout(streamNextLine, 14);
      }
    }
    streamNextLine();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('terminal-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIdx > 0) {
            historyIdx--;
            input.value = cmdHistory[historyIdx];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIdx < cmdHistory.length - 1) {
            historyIdx++;
            input.value = cmdHistory[historyIdx];
          } else {
            historyIdx = cmdHistory.length;
            input.value = '';
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const partial = input.value.trim().toLowerCase();
          if (!partial) return;
          const terminalCommands = window.terminalCommands || {};
          const match = Object.keys(terminalCommands).find(k => k.startsWith(partial));
          if (match) input.value = match;
        }
      });
    }
  });

  window.filterProjects = function(category) {
    document.querySelectorAll('.project-card').forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    document.querySelectorAll('.proj-filter').forEach(btn => {
      if (btn.dataset.filter === category) {
        btn.className = "proj-filter px-3 py-1.5 rounded bg-metal-m5 font-bold transition";
      } else {
        btn.className = "proj-filter px-3 py-1.5 rounded bg-silicon-900/90 border border-slate-800 text-slate-300 hover:border-metal-m5 transition";
      }
    });
  };

  window.openLightbox = function(src, caption) {
    const modal = document.getElementById('lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    if (modal && imgEl && capEl) {
      imgEl.src = src;
      capEl.textContent = caption;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeLightbox = function() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
