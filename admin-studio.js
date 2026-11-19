(function initAdminStudio() {
  const PASSCODE = "PORTFOLIOfox@69";
  const AUTH_KEY = "vlsi_admin_unlocked_v1";

  const SECRET_PATTERNS = [
    { name: "GitHub PAT", re: /\b(ghp_|github_pat_)[A-Za-z0-9_]{10,}\b/ },
    { name: "OpenAI/API Key", re: /\bsk-[A-Za-z0-9_-]{16,}\b/ },
    { name: "Google API Key", re: /\bAIza[0-9A-Za-z\-_]{20,}\b/ },
    { name: "JWT Token", re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
    { name: "Private Key Block", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    { name: "Bearer / Secret Assignment", re: /\b(secret|password|passwd|api_key|access_token)\s*[:=]\s*["']?[A-Za-z0-9_\-\.]{8,}/i }
  ];

  const TEMPLATES = {
    pd_project: {
      id: "new-pd-block",
      category: "pd",
      tag: "BACK-END PD - ICC2",
      accent: "gold",
      date: "2026",
      title: "New Physical Design Block: Floorplan, CTS & Signoff",
      summary: "Implemented in **Synopsys IC Compiler II** with clean PDN, balanced clock skew, and signoff DRC/STA closure.",
      bullets: [
        { label: "Floorplan & PDN", text: "Core utilization, metal straps, and DCAP insertion.", accent: "gold" },
        { label: "CTS & Routing", text: "Target clock skew, NDR rules, and post-ECO shorts.", accent: "emerald" }
      ],
      links: [],
      tools: "Synopsys ICC2",
      badge: { text: "DRC Clean", accent: "emerald" }
    },
    rtl_project: {
      id: "new-rtl-verif",
      category: "rtl",
      tag: "RTL & VERIFICATION",
      accent: "emerald",
      date: "2026",
      title: "New RTL & Verification Module",
      summary: "Designed synthesizable RTL in **SystemVerilog** and verified functionality with assertions, coverage, and waveform checks.",
      bullets: [
        { label: "Architecture", text: "Handshake protocol, state machine, and corner-case handling.", accent: "emerald" },
        { label: "Verification", text: "Directed + constrained-random stimulus with zero mismatches.", accent: "gold" }
      ],
      links: [],
      tools: "SystemVerilog / VCS",
      badge: { text: "Verified", accent: "emerald" }
    },
    update_item: {
      id: "2026-11-new-milestone",
      date: "2026-11",
      title: "New Portfolio Milestone Title",
      summary: "Concise summary of what shipped or passed signoff.",
      view: "projects",
      linkedin: false
    }
  };

  function isUnlocked() {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; }
  }

  function setUnlocked(val) {
    try {
      if (val) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  function scanForSecrets(text) {
    const hits = [];
    const str = String(text || "");
    for (const item of SECRET_PATTERNS) {
      if (item.re.test(str)) hits.push(item.name);
    }
    return hits;
  }

  function buildManualHtml() {
    return `
      <div class="space-y-3 text-xs text-slate-300 leading-relaxed font-mono">
        <div class="p-3 rounded-lg bg-silicon-950 border border-slate-800">
          <div class="text-metal-m5 font-bold mb-1">1. Editing Any Section, Word &amp; Using Templates</div>
          <div>Unlock with your passcode, pick a template (<strong>+ PD Template</strong>, <strong>+ RTL Template</strong>, or <strong>+ Update Template</strong>) to populate clean JSON, or edit existing items/wording overrides directly. Use <code>**bold**</code> and <code>\`code\`</code> in text fields.</div>
        </div>
        <div class="p-3 rounded-lg bg-silicon-950 border border-slate-800 space-y-2">
          <div class="text-metal-m6 font-bold">Examples of Editing in Practice</div>
          <div><strong>Example A - Edit a Single Word or Heading on Any Page:</strong> Set Target Section to <code>Any Page Word / Heading Override</code>, set Key to a CSS selector like <code>#hero-title</code>, and paste:</div>
          <pre class="p-2 rounded bg-silicon-900 border border-slate-800 text-emerald-300 overflow-x-auto">{
  "selector": "#hero-title",
  "text": "ASIC Physical Design &amp; RTL Verification"
}</pre>
          <div><strong>Example B - Add a New Chronicles Project:</strong> Click <code>+ PD Template</code> or <code>+ RTL Template</code>, edit <code>id</code>, <code>title</code>, <code>summary</code>, and <code>bullets</code>, then click <code>Scan &amp; Save Draft</code>.</div>
          <div><strong>Example C - Post an Overview Update:</strong> Click <code>+ Update Template</code>, set <code>"view": "qor"</code> (or <code>"lab"</code> / <code>"projects"</code>), keep <code>"linkedin": false</code> while drafting, and switch to <code>true</code> only when ready for LinkedIn.</div>
        </div>
        <div class="p-3 rounded-lg bg-silicon-950 border border-metal-m8/40">
          <div class="text-metal-m8 font-bold mb-1">2. Secret &amp; LinkedIn Publishing Check</div>
          <div>Before saving or exporting, the scanner checks for API keys, tokens, JWTs, and private keys. If an update has <code>"linkedin": true</code>, review the post text carefully because <code>post-linkedin.mjs</code> publishes it publicly when synced.</div>
        </div>
        <div class="p-3 rounded-lg bg-silicon-950 border border-rose-500/40">
          <div class="text-rose-400 font-bold mb-1">3. Deletion Guardrail</div>
          <div>Deleting an item requires typing <strong>DELETE</strong> and confirming the item ID/title so you do not accidentally wipe a project, update, or certification.</div>
        </div>
        <div class="p-3 rounded-lg bg-silicon-950 border border-metal-m3/40">
          <div class="text-metal-m3 font-bold mb-1">4. Supabase + GitHub Action Sync</div>
          <div>Save drafts in your Supabase tables (protected by RLS / passcode), then trigger <strong>Sync Supabase drafts to site</strong> in GitHub Actions (<code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in repo secrets) to update <code>content.json</code>, <code>updates.json</code>, <code>index.html</code>, and <code>tailwind.css</code>.</div>
        </div>
      </div>
    `;
  }

  function injectAdminModal() {
    if (document.getElementById("vlsi-admin-modal")) return;
    const modal = document.createElement("div");
    modal.id = "vlsi-admin-modal";
    modal.className = "fixed inset-0 z-50 hidden items-center justify-center bg-black/80 p-4 font-mono";
    modal.innerHTML = `
      <div class="w-full max-w-3xl rounded-xl bg-silicon-900 border border-metal-m5 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div class="text-[10px] text-metal-m5 uppercase">SUPABASE DRAFT STUDIO &amp; MANUAL</div>
            <h3 class="text-base font-bold text-white">Page &amp; Content Editor</h3>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="lock-vlsi-admin" class="hidden px-2.5 py-1 rounded bg-silicon-800 border border-slate-700 text-xs text-amber-300 hover:text-white">Lock</button>
            <button type="button" id="close-vlsi-admin" class="px-2.5 py-1 rounded bg-silicon-800 text-xs text-slate-300 hover:text-white">ESC</button>
          </div>
        </div>

        <div id="admin-lock-gate" class="p-4 rounded-lg bg-silicon-950 border border-slate-800 space-y-3 text-xs">
          <div class="text-metal-m5 font-bold">Passcode Required</div>
          <div class="text-slate-400">Enter the admin passcode to access templates, page/word editing, drafts, and the manual.</div>
          <div class="flex flex-wrap items-center gap-2">
            <input id="admin-passcode-input" type="password" autocomplete="off" placeholder="Enter admin passcode" class="rounded bg-silicon-900 border border-slate-700 px-3 py-1.5 text-white flex-1 min-w-[200px]" />
            <button type="button" id="admin-unlock-btn" class="px-4 py-1.5 rounded bg-metal-m5 font-bold">Unlock Studio</button>
          </div>
          <div id="admin-lock-error" class="hidden text-rose-400 text-[11px]">Incorrect passcode. Please try again.</div>
        </div>

        <div id="admin-unlocked-content" class="hidden space-y-4">
          <div class="flex flex-wrap gap-2 text-xs">
            <button type="button" data-admin-tab="editor" class="admin-tab-btn px-3 py-1 rounded bg-metal-m5 font-bold">Editor &amp; Templates</button>
            <button type="button" data-admin-tab="manual" class="admin-tab-btn px-3 py-1 rounded bg-silicon-800 text-slate-300">Instruction Manual</button>
            <button type="button" data-tpl="pd_project" class="px-2.5 py-1 rounded bg-silicon-800 text-metal-m5 border border-slate-700 hover:border-metal-m5">+ PD Template</button>
            <button type="button" data-tpl="rtl_project" class="px-2.5 py-1 rounded bg-silicon-800 text-metal-m3 border border-slate-700 hover:border-metal-m3">+ RTL Template</button>
            <button type="button" data-tpl="update_item" class="px-2.5 py-1 rounded bg-silicon-800 text-metal-m6 border border-slate-700 hover:border-metal-m6">+ Update Template</button>
          </div>

          <div id="admin-pane-editor" class="space-y-3">
            <div class="p-3 rounded-lg bg-silicon-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input id="admin-sb-url" type="text" placeholder="https://xyz.supabase.co" class="rounded bg-silicon-900 border border-slate-700 px-2.5 py-1 text-white" />
              <input id="admin-sb-anon" type="password" autocomplete="off" placeholder="Supabase Publishable Key (session)" class="rounded bg-silicon-900 border border-slate-700 px-2.5 py-1 text-white" />
              <div class="flex items-center gap-1.5">
                <button type="button" id="admin-sb-pull-btn" class="px-2.5 py-1 rounded bg-silicon-800 border border-slate-700 text-metal-m6 hover:border-metal-m6">Pull DB</button>
                <button type="button" id="admin-sb-push-btn" class="px-2.5 py-1 rounded bg-metal-m5 font-bold">Push DB</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label class="space-y-1">
                <span class="text-slate-400">Target Section / Page</span>
                <select id="admin-target-section" class="w-full rounded bg-silicon-950 border border-slate-700 px-2.5 py-1.5 text-white">
                  <option value="projects">Chronicles (projects in content.json)</option>
                  <option value="updates">Overview Updates (updates.json)</option>
                  <option value="certifications">Credentials - Certifications (content.json)</option>
                  <option value="experience">Credentials - Experience (content.json)</option>
                  <option value="copy_override">Any Page Word / Heading Override</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-slate-400">Supabase Table / Selector Key</span>
                <input id="admin-item-key" type="text" placeholder="e.g. async-fifo-pd or #hero-title" class="w-full rounded bg-silicon-950 border border-slate-700 px-2.5 py-1.5 text-white" />
              </label>
            </div>

            <textarea id="admin-json-payload" rows="12" class="w-full rounded-lg bg-silicon-950 border border-slate-700 p-3 text-xs text-emerald-300"></textarea>
            <div id="admin-guardrail-alert" class="hidden p-3 rounded-lg bg-rose-950/40 border border-rose-500 text-xs text-rose-200"></div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
              <div class="flex items-center gap-2">
                <input id="admin-delete-confirm" type="text" placeholder='Type "DELETE" to confirm removal' class="rounded bg-silicon-950 border border-slate-700 px-2.5 py-1.5 text-white w-52" />
                <button type="button" id="admin-delete-btn" class="px-3 py-1.5 rounded bg-rose-600/20 border border-rose-500 text-rose-300 hover:bg-rose-600/30">Delete Draft</button>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="admin-copy-json-btn" class="px-3 py-1.5 rounded bg-silicon-800 border border-slate-700 text-white">Copy Checked JSON</button>
                <button type="button" id="admin-save-draft-btn" class="px-3.5 py-1.5 rounded bg-metal-m3 font-bold">Scan &amp; Save Draft</button>
              </div>
            </div>
          </div>

          <div id="admin-pane-manual" class="hidden"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const manualPane = document.getElementById("admin-pane-manual");
    if (manualPane) manualPane.innerHTML = buildManualHtml();

    const textarea = document.getElementById("admin-json-payload");
    const alertBox = document.getElementById("admin-guardrail-alert");
    const lockGate = document.getElementById("admin-lock-gate");
    const unlockedContent = document.getElementById("admin-unlocked-content");
    const lockBtn = document.getElementById("lock-vlsi-admin");
    const passInput = document.getElementById("admin-passcode-input");
    const lockErr = document.getElementById("admin-lock-error");
    const sbUrlInput = document.getElementById("admin-sb-url");
    const sbAnonInput = document.getElementById("admin-sb-anon");

    try {
      if (sbUrlInput) sbUrlInput.value = sessionStorage.getItem("vlsi_sb_url") || "";
      if (sbAnonInput) sbAnonInput.value = sessionStorage.getItem("vlsi_sb_anon") || "";
    } catch (e) {}

    function applyTemplate(tplKey) {
      const tpl = TEMPLATES[tplKey];
      if (!tpl || !textarea) return;
      const secSel = document.getElementById("admin-target-section");
      if (secSel) secSel.value = tplKey === "update_item" ? "updates" : "projects";
      textarea.value = JSON.stringify(tpl, null, 2);
      if (alertBox) alertBox.classList.add("hidden");
    }

    function refreshAuthUI() {
      const unlocked = isUnlocked();
      lockGate.classList.toggle("hidden", unlocked);
      unlockedContent.classList.toggle("hidden", !unlocked);
      lockBtn.classList.toggle("hidden", !unlocked);
      if (unlocked && !textarea.value.trim()) applyTemplate("pd_project");
    }

    const openModal = () => {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      refreshAuthUI();
      if (!isUnlocked() && passInput) setTimeout(() => { passInput.value = ""; passInput.focus(); }, 40);
    };
    const closeModal = () => { modal.classList.add("hidden"); modal.classList.remove("flex"); };
    const attemptUnlock = () => {
      if ((passInput.value || "") === PASSCODE) {
        setUnlocked(true); lockErr.classList.add("hidden"); passInput.value = ""; refreshAuthUI();
      } else { lockErr.classList.remove("hidden"); }
    };

    window.openVlsiAdminStudio = openModal;
    document.getElementById("close-vlsi-admin").addEventListener("click", closeModal);
    lockBtn.addEventListener("click", () => { setUnlocked(false); refreshAuthUI(); if (passInput) { passInput.value = ""; passInput.focus(); } });
    document.getElementById("admin-unlock-btn").addEventListener("click", attemptUnlock);
    passInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); attemptUnlock(); } });
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") || (e.altKey && e.key.toLowerCase() === "e")) { e.preventDefault(); openModal(); }
      else if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });

    modal.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!isUnlocked()) return;
        const tab = btn.getAttribute("data-admin-tab");
        document.getElementById("admin-pane-editor").classList.toggle("hidden", tab !== "editor");
        document.getElementById("admin-pane-manual").classList.toggle("hidden", tab !== "manual");
      });
    });

    applyTemplate("pd_project");
    modal.addEventListener("click", e => {
      const tplBtn = e.target.closest("[data-tpl]");
      if (!tplBtn || !isUnlocked()) return;
      applyTemplate(tplBtn.getAttribute("data-tpl"));
    });

    function runSafetyChecks(raw) {
      const secrets = scanForSecrets(raw);
      const warnings = [];
      if (secrets.length) warnings.push("Secret pattern detected (" + secrets.join(", ") + "). Remove credentials/tokens before saving or pushing.");
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (err) { warnings.push("Invalid JSON syntax: " + err.message); }
      if (parsed && parsed.linkedin === true) warnings.push('Warning: "linkedin": true is set - this update will be published on LinkedIn once synced if LinkedIn secrets are configured.');
      if (warnings.length) { alertBox.innerHTML = warnings.map(w => "<div>• " + w + "</div>").join(""); alertBox.classList.remove("hidden"); return { ok: false, parsed }; }
      alertBox.classList.add("hidden");
      return { ok: true, parsed };
    }

    function cleanSupabaseBaseUrl(raw) {
      return String(raw || "")
        .trim()
        .replace(/\/rest\/v1\/?$/i, "")
        .replace(/\/+$/, "");
    }

    function tableForSection(sec) {
      if (sec === "updates") return "portfolio_updates";
      if (sec === "certifications") return "portfolio_certifications";
      if (sec === "experience") return "portfolio_experience";
      return "portfolio_projects";
    }

    document.getElementById("admin-sb-push-btn")?.addEventListener("click", async () => {
      if (!isUnlocked()) return;
      const check = runSafetyChecks(textarea.value);
      if (!check.ok) return;
      const url = cleanSupabaseBaseUrl(sbUrlInput?.value || "");
      const key = (sbAnonInput?.value || "").trim();
      if (!url || !key) {
        alertBox.innerHTML = "<div>• Enter Supabase URL and Publishable Key above to push directly via REST API.</div>";
        alertBox.classList.remove("hidden");
        return;
      }
      try { sessionStorage.setItem("vlsi_sb_url", url); sessionStorage.setItem("vlsi_sb_anon", key); } catch (e) {}
      const sec = document.getElementById("admin-target-section").value;
      const itemId = (document.getElementById("admin-item-key").value || check.parsed.id || "draft-" + Date.now()).trim();
      const table = tableForSection(sec);
      const row = { id: itemId, sort_order: 0, published: true, payload: check.parsed, updated_at: new Date().toISOString() };
      const res = await fetch(`${url}/rest/v1/${table}?on_conflict=id`, {
        method: "POST",
        headers: { "apikey": key, "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(row)
      });
      if (!res.ok) alertBox.innerHTML = `<div>• Supabase push failed (${res.status}): ${await res.text()}</div>`;
      else alertBox.innerHTML = `<div class="text-emerald-300">• Pushed "${itemId}" to ${table}. Run GitHub Action "Sync Supabase drafts to site" to publish live.</div>`;
      alertBox.classList.remove("hidden");
    });

    document.getElementById("admin-sb-pull-btn")?.addEventListener("click", async () => {
      if (!isUnlocked()) return;
      const url = cleanSupabaseBaseUrl(sbUrlInput?.value || "");
      const key = (sbAnonInput?.value || "").trim();
      if (!url || !key) {
        alertBox.innerHTML = "<div>• Enter Supabase URL and Publishable Key above to pull rows.</div>";
        alertBox.classList.remove("hidden");
        return;
      }
      const sec = document.getElementById("admin-target-section").value;
      const table = tableForSection(sec);
      const res = await fetch(`${url}/rest/v1/${table}?select=*&order=sort_order.asc&limit=1`, {
        headers: { "apikey": key, "Authorization": `Bearer ${key}` }
      });
      if (!res.ok) alertBox.innerHTML = `<div>• Supabase pull failed (${res.status}): ${await res.text()}</div>`;
      else {
        const rows = await res.json();
        if (rows && rows[0]) {
          document.getElementById("admin-item-key").value = rows[0].id || "";
          textarea.value = JSON.stringify(rows[0].payload || rows[0], null, 2);
          alertBox.innerHTML = `<div class="text-emerald-300">• Loaded "${rows[0].id}" from ${table}.</div>`;
        } else alertBox.innerHTML = `<div>• No rows found in ${table} yet.</div>`;
      }
      alertBox.classList.remove("hidden");
    });

    document.getElementById("admin-copy-json-btn").addEventListener("click", () => {
      if (!isUnlocked()) return;
      const check = runSafetyChecks(textarea.value);
      if (!check.ok) return;
      navigator.clipboard?.writeText(JSON.stringify(check.parsed, null, 2));
      alertBox.innerHTML = '<div class="text-emerald-300">• JSON passed secret scan and copied to clipboard.</div>';
      alertBox.classList.remove("hidden");
    });

    document.getElementById("admin-save-draft-btn").addEventListener("click", () => {
      if (!isUnlocked()) return;
      const check = runSafetyChecks(textarea.value);
      if (!check.ok) return;
      const section = document.getElementById("admin-target-section").value;
      const key = (document.getElementById("admin-item-key").value || check.parsed.id || "draft").trim();
      const drafts = JSON.parse(localStorage.getItem("vlsi_supabase_drafts") || "{}");
      drafts[section + ":" + key] = { section, key, updatedAt: new Date().toISOString(), payload: check.parsed };
      localStorage.setItem("vlsi_supabase_drafts", JSON.stringify(drafts));
      if (section === "copy_override" && check.parsed.selector && typeof check.parsed.text === "string") {
        const el = document.querySelector(check.parsed.selector);
        if (el) el.textContent = check.parsed.text;
      }
      alertBox.innerHTML = '<div class="text-emerald-300">• Saved local draft "' + section + ":" + key + '" (0 secret matches).</div>';
      alertBox.classList.remove("hidden");
    });

    document.getElementById("admin-delete-btn").addEventListener("click", () => {
      if (!isUnlocked()) return;
      const confirmInput = document.getElementById("admin-delete-confirm");
      const section = document.getElementById("admin-target-section").value;
      const key = (document.getElementById("admin-item-key").value || "").trim();
      if (confirmInput.value.trim() !== "DELETE") {
        alertBox.innerHTML = '<div>• Deletion blocked: type <strong>DELETE</strong> first to remove draft "' + (key || "(current)") + '".</div>';
        alertBox.classList.remove("hidden");
        return;
      }
      const drafts = JSON.parse(localStorage.getItem("vlsi_supabase_drafts") || "{}");
      if (key && drafts[section + ":" + key]) delete drafts[section + ":" + key];
      localStorage.setItem("vlsi_supabase_drafts", JSON.stringify(drafts));
      confirmInput.value = "";
      alertBox.innerHTML = '<div class="text-amber-300">• Draft "' + (key || section) + '" removed after explicit DELETE confirmation.</div>';
      alertBox.classList.remove("hidden");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectAdminModal);
  else injectAdminModal();
})();
