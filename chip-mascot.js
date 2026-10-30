/**
 * chip-mascot.js
 * Interactive Silicon Microchip Mascot & Help-Desk Assistant ("SILICON-BOT")
 * Guides visitors through the Linux EDA terminal, QoR dashboards, simulators, and Narendaran's VLSI work.
 */

(function initChipMascotHelpDesk() {
  const style = document.createElement('style');
  style.id = 'chip-mascot-styles';
  style.textContent = `
    #chip-mascot-root {
      position: fixed;
      bottom: 16px;
      right: 18px;
      z-index: 75;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Floating QFP Chip Character Button */
    #chip-mascot-btn {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 14px;
      background: linear-gradient(135deg, #0B101E 0%, #11192E 100%);
      border: 2px solid #00F0FF;
      box-shadow: 0 8px 25px rgba(0, 240, 255, 0.32);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: floatChip 3.2s ease-in-out infinite;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    #chip-mascot-btn:hover {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 12px 30px rgba(0, 230, 118, 0.45);
      border-color: #00E676;
    }
    @keyframes floatChip {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    /* Blinking Cyan Eyes inside the SVG Chip */
    .chip-eye {
      animation: blinkEyes 4s infinite;
      transform-origin: center;
    }
    @keyframes blinkEyes {
      0%, 92%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }

    /* Speech Bubble Tooltip Badge */
    #mascot-greeting-pill {
      position: absolute;
      bottom: 66px;
      right: 0;
      white-space: nowrap;
      background: #0B101E;
      color: #00F0FF;
      border: 1px solid rgba(0, 240, 255, 0.45);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 10.5px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    html.light-theme #mascot-greeting-pill {
      background: #FFFFFF;
      color: #0284C7;
      border-color: rgba(2, 132, 199, 0.45);
    }

    /* Help Desk Chat Window */
    #mascot-chat-window {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 340px;
      max-width: calc(100vw - 28px);
      background: rgba(11, 16, 30, 0.97);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(0, 240, 255, 0.45);
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
      overflow: hidden;
      display: none;
      flex-direction: column;
    }
    #mascot-chat-window.open {
      display: flex;
      animation: popInChat 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    html.light-theme #mascot-chat-window {
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(2, 132, 199, 0.45);
      color: #0F172A;
    }
    @keyframes popInChat {
      0% { opacity: 0; transform: translateY(12px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'chip-mascot-root';
  root.innerHTML = `
    <!-- Greeting Tooltip -->
    <div id="mascot-greeting-pill">
      &#128075; Need help with the terminal or QoR?
    </div>

    <!-- Interactive Help Desk Window -->
    <div id="mascot-chat-window">
      <!-- Header -->
      <div class="px-3.5 py-2.5 bg-[#060911] border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <div class="text-xs font-bold text-white">ASIC-BOT // Silicon Help Desk</div>
            <div class="text-[9.5px] text-cyan-400">Portfolio &amp; Terminal Guide</div>
          </div>
        </div>
        <button type="button" id="close-mascot-chat" class="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80">&#10005;</button>
      </div>

      <!-- Chat Message History -->
      <div id="mascot-messages" class="p-3 space-y-2.5 max-h-64 overflow-y-auto text-[11px] leading-relaxed">
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-slate-200">
          Hi! I'm <strong class="text-cyan-400">ASIC-BOT</strong>, Narendaran's on-chip guide. Ask me how to use the <span class="text-emerald-400">Linux Terminal</span>, or click a quick action below and I'll run it for you!
        </div>
      </div>

      <!-- One-Click Quick Help Pills -->
      <div class="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px]">
        <button type="button" data-q="terminal" class="mascot-q-btn px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition">
          &#128187; How to use Terminal?
        </button>
        <button type="button" data-q="run_demo" class="mascot-q-btn px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition">
          &#9654; Auto-Run Terminal Demo
        </button>
        <button type="button" data-q="qor" class="mascot-q-btn px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition">
          &#128202; Show QoR Signoff
        </button>
        <button type="button" data-q="lab" class="mascot-q-btn px-2 py-1 rounded bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition">
          &#9889; 3D Stack &amp; Simulators
        </button>
        <button type="button" data-q="shortcuts" class="mascot-q-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
          &#9000; Keyboard Shortcuts
        </button>
      </div>

      <!-- Free-Text Question Input -->
      <form id="mascot-form" class="p-2 bg-[#060911] border-t border-slate-800 flex items-center gap-1.5">
        <input
          id="mascot-input"
          type="text"
          autocomplete="off"
          placeholder="Ask about terminal, gprs, fifo, resume..."
          class="w-full bg-slate-900 text-white placeholder-slate-500 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-800 outline-none focus:border-cyan-400"
        />
        <button type="submit" class="px-2.5 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-[11px] hover:bg-cyan-300 shrink-0">
          Ask
        </button>
      </form>
    </div>

    <!-- QFP-16 Microchip Mascot Avatar Button -->
    <button type="button" id="chip-mascot-btn" aria-label="Open Silicon Help Desk">
      <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Top & Bottom IC Gull-Wing Leads -->
        <rect x="18" y="4" width="4" height="8" rx="1" fill="#FFB300"/>
        <rect x="26" y="4" width="4" height="8" rx="1" fill="#00F0FF"/>
        <rect x="34" y="4" width="4" height="8" rx="1" fill="#00F0FF"/>
        <rect x="42" y="4" width="4" height="8" rx="1" fill="#FFB300"/>
        <rect x="18" y="52" width="4" height="8" rx="1" fill="#FFB300"/>
        <rect x="26" y="52" width="4" height="8" rx="1" fill="#00E676"/>
        <rect x="34" y="52" width="4" height="8" rx="1" fill="#00E676"/>
        <rect x="42" y="52" width="4" height="8" rx="1" fill="#FFB300"/>
        <!-- Left & Right IC Gull-Wing Leads -->
        <rect x="4" y="18" width="8" height="4" rx="1" fill="#FFB300"/>
        <rect x="4" y="26" width="8" height="4" rx="1" fill="#00F0FF"/>
        <rect x="4" y="34" width="8" height="4" rx="1" fill="#00F0FF"/>
        <rect x="4" y="42" width="8" height="4" rx="1" fill="#FFB300"/>
        <rect x="52" y="18" width="8" height="4" rx="1" fill="#FFB300"/>
        <rect x="52" y="26" width="8" height="4" rx="1" fill="#FF2A85"/>
        <rect x="52" y="34" width="8" height="4" rx="1" fill="#FF2A85"/>
        <rect x="52" y="42" width="8" height="4" rx="1" fill="#FFB300"/>
        <!-- Main Silicon Die Package Body -->
        <rect x="12" y="12" width="40" height="40" rx="7" fill="#0B101E" stroke="#00F0FF" stroke-width="2.2"/>
        <!-- Pin-1 Orientation Dot -->
        <circle cx="17" cy="17" r="2" fill="#FFB300"/>
        <!-- Glowing Mascot Eyes -->
        <rect class="chip-eye" x="21" y="24" width="6" height="7" rx="2" fill="#00F0FF"/>
        <rect class="chip-eye" x="37" y="24" width="6" height="7" rx="2" fill="#00F0FF"/>
        <!-- Happy Digital Waveform Smile -->
        <path d="M23 39 H28 V42 H36 V39 H41" stroke="#00E676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-bold flex items-center justify-center shadow">?</span>
    </button>
  `;
  document.body.appendChild(root);

  const mascotBtn = document.getElementById('chip-mascot-btn');
  const chatWindow = document.getElementById('mascot-chat-window');
  const closeChatBtn = document.getElementById('close-mascot-chat');
  const greetingPill = document.getElementById('mascot-greeting-pill');
  const messagesBox = document.getElementById('mascot-messages');
  const mascotForm = document.getElementById('mascot-form');
  const mascotInput = document.getElementById('mascot-input');

  // Auto-hide greeting tooltip after 7 seconds so it stays clean
  setTimeout(() => {
    if (greetingPill) greetingPill.style.opacity = '0';
  }, 7000);

  mascotBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (greetingPill) greetingPill.style.display = 'none';
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      setTimeout(() => mascotInput.focus(), 50);
    }
  });

  closeChatBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  function appendMessage(htmlText, isUser = false) {
    const div = document.createElement('div');
    if (isUser) {
      div.className = 'p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 ml-8 text-right';
    } else {
      div.className = 'p-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 text-slate-200 mr-4 space-y-1.5';
    }
    div.innerHTML = htmlText;
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function handlePresetOrQuery(key) {
    const q = key.toLowerCase();

    if (q.includes('terminal') || q.includes('command') || q.includes('linux') || q.includes('bash')) {
      appendMessage(`
        <div><strong class="text-cyan-400">How to use the Linux EDA Terminal:</strong></div>
        <div>1. On the <strong>01.Home</strong> tab, click inside the dark terminal window (or click any quick pill like <code class="text-emerald-400">neofetch</code>, <code class="text-emerald-400">gprs</code>, <code class="text-emerald-400">fifo</code>, <code class="text-emerald-400">ls -la</code>).</div>
        <div>2. You can type commands like <code class="text-cyan-300">whoami</code>, <code class="text-cyan-300">arbiter</code>, <code class="text-cyan-300">innovus</code>, <code class="text-cyan-300">dft</code>, <code class="text-cyan-300">openlane</code>, <code class="text-cyan-300">uname -a</code>, or <code class="text-cyan-300">clear</code>.</div>
        <div>3. Use <strong>Up/Down arrows</strong> for command history and <strong>Tab</strong> for auto-complete!</div>
      `);
    } else if (q === 'run_demo' || q.includes('demo')) {
      if (typeof window.switchPageView === 'function') window.switchPageView('home');
      if (typeof window.executeCommand === 'function') {
        window.executeCommand('neofetch');
        setTimeout(() => window.executeCommand('gprs'), 700);
      }
      appendMessage(`&#9989; I just switched you to <strong>01.Home</strong> and executed <code class="text-emerald-400">neofetch</code> and <code class="text-cyan-300">gprs</code> in the terminal for you!`);
    } else if (q.includes('qor') || q.includes('gprs') || q.includes('fifo') || q.includes('icc2')) {
      if (typeof window.switchPageView === 'function') window.switchPageView('qor');
      appendMessage(`&#128202; Opened <strong>02.QoR_Signoff</strong>! Click between <strong>Block A (gprs_top)</strong> and <strong>Block B (Async FIFO)</strong> and click Stages 1–5 to inspect Narendaran's IC Compiler II metrics and screenshots.`);
    } else if (q.includes('lab') || q.includes('arbiter') || q.includes('sta') || q.includes('metal') || q.includes('3d') || q.includes('wave')) {
      if (typeof window.switchPageView === 'function') window.switchPageView('lab');
      appendMessage(`&#9889; Welcome to <strong>03.Silicon_Lab</strong>! Here you can click the 3D Metal Stack (` + '`M1`-`M8`' + `), step the Bus Arbiter clock to draw live GTKWave waveforms, drag the Before/After layout slider, or slide the STA Slack Calculator.`);
    } else if (q.includes('shortcut') || q.includes('ctrl') || q.includes('search')) {
      appendMessage(`
        <div><strong class="text-amber-300">Pro Keyboard Shortcuts:</strong></div>
        <div>&bull; Press <kbd class="px-1 py-0.5 bg-slate-800 text-cyan-300 rounded">Ctrl + K</kbd> anywhere to open the Spotlight Command Palette.</div>
        <div>&bull; Press <kbd class="px-1 py-0.5 bg-slate-800 text-cyan-300 rounded">ESC</kbd> to close any image modal or code drawer.</div>
      `);
    } else if (q.includes('resume') || q.includes('cv') || q.includes('hire') || q.includes('contact') || q.includes('email')) {
      appendMessage(`
        <div>You can reach Narendaran at <a href="mailto:sgnarendaran@gmail.com" class="text-cyan-400 underline">sgnarendaran@gmail.com</a> or open his <a href="resume.html" class="text-emerald-400 underline font-bold">Printable 1-Page A4 Resume &rarr;</a></div>
      `);
    } else {
      appendMessage(`
        <div>Here's how to navigate Narendaran's portfolio:</div>
        <div>&bull; <strong>01.Home:</strong> Bio &amp; Live Linux EDA Terminal (<code class="text-emerald-400">neofetch</code>, <code class="text-emerald-400">gprs</code>, <code class="text-emerald-400">fifo</code>)</div>
        <div>&bull; <strong>02.QoR_Signoff:</strong> Stage-by-stage Synopsys ICC2 progression</div>
        <div>&bull; <strong>03.Silicon_Lab:</strong> 3D Metal Stack, Bus Arbiter + GTKWave &amp; STA Calculator</div>
        <div>&bull; <strong>04.Chronicles:</strong> All 9 VLSI projects &amp; TCL/RTL code drawers</div>
      `);
    }
  }

  document.querySelectorAll('.mascot-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qKey = btn.getAttribute('data-q');
      appendMessage(btn.textContent.trim(), true);
      handlePresetOrQuery(qKey);
    });
  });

  mascotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = mascotInput.value.trim();
    if (!val) return;
    mascotInput.value = '';
    appendMessage(val, true);
    handlePresetOrQuery(val);
  });
})();
