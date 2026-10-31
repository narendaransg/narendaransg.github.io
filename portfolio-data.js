/**
 * portfolio-data.js (File 3 of 4)
 * Holds gprs_top & 8-Bit Async FIFO QoR metrics, stage stories,
 * 3D metal layer specifications, and Linux terminal command responses.
 */

window.qorData = {
  gprs: {
    badge: "gprs_top.nlib • My Synopsys ICC2 Run (10-Metal, 16 Hard Macros • Apr 2026)",
    progression: [
      ["Cell Count", "27,811", "30,365", "33,323", "33,286"],
      ["Core Utilization", "21.18%", "62.53%", "66.27%", "66.25%"],
      ["Congestion", "0.00%", "0.06%", "0.28%", "3.14% (Routed)"],
      ["Max_Trans Violations", "24", "0", "2", "15 → 0 (Signoff)"],
      ["Max_Cap Violations", "60", "40", "36", "260 → 0 (Signoff)"],
      ["Setup WNS / TNS", "0 ns / 0 ns", "0 ns / 0 ns", "0 ns / 0 ns", "0.00 ns / 0.00 ns"],
      ["Hold TNS", "-376.20 ns", "-227.91 ns", "-0.46 ns", "-0.02 ns → 0 (Signoff)"]
    ],
    stages: {
      floorplan: {
        title: "1. My Floorplan, Port Assignment & Data-Driven Macro Placement",
        desc: "When I imported gprs_top into IC Compiler II, I had 27,811 cells and 16 hard SRAM macros across 4 macro families inside a 391,605.41 µm² core area (5 µm core-to-die offset). I aligned all 103 I/O ports cleanly on M5 (West) and M6 (South) tracks with zero unplaced or off-track ports.",
        bars: [
          { label: "Core Utilization", valText: "21.18%", pct: 21, color: "bg-metal-m5" },
          { label: "Port Track Alignment (103/103)", valText: "100% Legal", pct: 100, color: "bg-metal-m3" },
          { label: "Macro Flyline Optimization (>10 Iters)", valText: "0 Overflow", pct: 100, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Initial Cells", "27,811"],
          ["Hard Macros", "16 (4 Families)"],
          ["Core Area", "391,605.4 µm²"],
          ["Initial Util", "21.18%"],
          ["I/O Ports", "103 (M5 West / M6 South)"],
          ["Port Legality", "0 Off-Track / 0 Illegal"]
        ],
        img: "assets/gprs_macro_flylines.jpg",
        caption: "My gprs_top Data-Flow Flylines & 16 SRAM Macro Orientation in icc2_shell",
        action: "I iterated macro placement over 10 times using data-flow flylines (compute_dff_connections) and placed soft blockages with 16 µm channel spacing so standard cells wouldn't get trapped between macros."
      },
      pdn: {
        title: "2. Building the Multi-Layer Power Delivery Network (PDN)",
        desc: "To prevent IR drop across the macro-heavy core, I constructed a multi-tier power mesh spanning M8 (4.64 µm width), M7 (1.104 µm width), and M2 (0.44 µm width) straps down to 0.06 µm M1 standard-cell rails.",
        bars: [
          { label: "PG DRC & Short Closure", valText: "0 PG DRC / 0 Shorts", pct: 100, color: "bg-metal-m3" },
          { label: "Missing PG Via Resolution (179 Fixed)", valText: "100% Connected", pct: 100, color: "bg-metal-m5" },
          { label: "Decoupling Capacitor (DCAP) Insertion", valText: "8,600 Cells", pct: 88, color: "bg-metal-m8" }
        ],
        metrics: [
          ["M8 Straps", "W: 4.64µm | Pitch: 19.46µm"],
          ["M7 Straps", "W: 1.104µm | Pitch: 13.38µm"],
          ["M2 Straps", "W: 0.44µm | Pitch: 9.73µm"],
          ["M1 Rails", "W: 0.06µm | Pitch: 3.34µm"],
          ["PG DRC / Shorts", "0 DRC / 0 Shorts"],
          ["DCAP Cells", "8,600 Placed"]
        ],
        img: "assets/gprs_macro_flylines.jpg",
        caption: "gprs_top — Floorplan & Power Planning Architecture",
        action: "My initial PG connectivity check flagged 179 missing vias. Instead of ignoring them, I used targeted add_vias commands to stitch every missing intersection and reach 0 PG violations."
      },
      placement: {
        title: "3. Congestion-Driven Standard Cell Placement",
        desc: "I placed 30,365 cells (including 8,600 DCAPs, 76 TIEH, and 121 TIEL cells) across 4 path groups (i2r, r2o, i2o, mclk) while enforcing a strict max fanout threshold of 30.",
        bars: [
          { label: "Standard Cell Placement Density", valText: "62.39%", pct: 62, color: "bg-metal-m5" },
          { label: "Setup Timing Closure (WNS / TNS)", valText: "0.00 ns Violations", pct: 100, color: "bg-metal-m3" },
          { label: "Routing Channel Headroom (100% - 0.12% Cong.)", valText: "99.88% Free", pct: 99, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Placed Cells", "30,365"],
          ["Placement Density", "62.39% (0.6253)"],
          ["Horiz. Congestion", "0.12% (Very Low)"],
          ["Max_Fanout Viols", "0 (Limit: 30)"],
          ["Setup WNS / TNS", "0.00 ns / 0.00 ns"],
          ["TIEH / TIEL Cells", "76 TIEH / 121 TIEL"]
        ],
        img: "assets/gprs_placement_density.jpg",
        caption: "My gprs_top Cell Density Heatmap in ICC2 (62.39% Utilization)",
        action: "When I saw 13 max_transition and 303 high-capacitance net violations after initial placement, I resolved them using buffer insertion, net splitting, and cell upsizing while keeping Setup TNS at 0.00 ns."
      },
      cts: {
        title: "4. Clock Tree Synthesis (CTS) & Skew Balancing",
        desc: "I synthesized the primary clock tree (mclk @ 4 ns period) across 2,856 sequential sinks using 65 clock buffers/inverters and double-width double-spacing (dwds) NDR rules on M4–M5.",
        bars: [
          { label: "Post-CTS Core Utilization", valText: "66.27%", pct: 66, color: "bg-metal-m5" },
          { label: "Global Skew Target (0.14ns vs 0.60ns Max)", valText: "0.14 ns Skew", pct: 92, color: "bg-metal-m3" },
          { label: "Hold TNS Improvement (-376ns -> -0.46ns)", valText: "99.8% Closed", pct: 99, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Master Clock", "mclk (4.0 ns Period)"],
          ["Clock Sinks", "2,856 Flip-Flops"],
          ["Buffers / Inv", "65 Cells"],
          ["Global Skew", "0.14 ns (Target: 0.1–0.6)"],
          ["Max Latency", "0.63 ns (Target: 0.60)"],
          ["Routing NDR", "M4–M5 (dwds)"]
        ],
        img: "assets/gprs_placement_density.jpg",
        caption: "gprs_top — Post-CTS Density & Clock Distribution",
        action: "By applying M4–M5 dwds Non-Default Routing rules, I locked global skew to 0.14 ns across 2,856 sinks and slashed Hold TNS from -227.91 ns down to just -0.46 ns."
      },
      routing: {
        title: "5. Detailed Routing, Route ECO & PrimeTime Signoff",
        desc: "I drove the 10-layer global and detailed routing across all 33,286 final cells at 66.25% utilization, then executed route_eco and PrimeTime signoff checks.",
        bars: [
          { label: "Final Core Utilization (33,286 Cells)", valText: "66.25%", pct: 66, color: "bg-metal-m5" },
          { label: "Post-ECO Shorts & Opens Closure", valText: "0 Shorts / 0 Opens", pct: 100, color: "bg-metal-m3" },
          { label: "PrimeTime Signoff STA (Setup & Hold TNS)", valText: "0.00 ns Clean", pct: 100, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Final Cell Count", "33,286 Cells"],
          ["Final Utilization", "66.25%"],
          ["Final Opens / Shorts", "0 Opens / 0 Shorts (Post-ECO)"],
          ["PG Shorts / Antenna", "0 PG Shorts / Clean"],
          ["Setup WNS / TNS", "0.00 ns / 0.00 ns"],
          ["Signoff Crosstalk", "0 Violations"]
        ],
        img: "assets/gprs_routing.jpg",
        caption: "My Final 10-Layer Detailed Route Layout for gprs_top (route_opt_done.design)",
        action: "Initial detailed routing left 34 routing shorts and 32 DRC violations. I ran targeted route_eco iterations to clear every short and closed residual slew/hold checks in PrimeTime."
      }
    }
  },
  fifo: {
    badge: "asynchronous_fifo.nlib • My Synopsys ICC2 Run (Dual Clock • Apr – May 2026)",
    progression: [
      ["Cell Count", "346", "276", "305", "305"],
      ["Core Utilization", "63.14%", "62.70%", "68.41%", "68.41%"],
      ["Congestion", "0.00%", "0.30%", "0.89%", "0.89%"],
      ["Max_Trans Violations", "0", "0", "0", "0"],
      ["Max_Cap Violations", "1", "0", "0", "0"],
      ["Setup WNS", "+0.40 ns", "+0.35 ns", "+0.15 ns", "+0.16 ns"],
      ["Hold TNS / Setup TNS", "0.00 ns / 0.00 ns", "0.00 ns / 0.00 ns", "0.00 ns / 0.00 ns", "0.00 ns / 0.00 ns"]
    ],
    stages: {
      floorplan: {
        title: "1. My Compact Core Floorplan & Track-Aligned M5 Ports",
        desc: "For my 8-bit Asynchronous FIFO, I configured a 2,065.428 µm² core floorplan at 63.14% initial utilization with a 1 µm core offset. I placed all 24 I/O ports on Metal 5—inputs on the West/Left and outputs on the East/Right.",
        bars: [
          { label: "Initial Core Utilization", valText: "63.14%", pct: 63, color: "bg-metal-m5" },
          { label: "M5 Port Track Alignment (24/24)", valText: "100% Aligned", pct: 100, color: "bg-metal-m3" },
          { label: "Setup WNS Margin (+0.40ns)", valText: "+0.40 ns Slack", pct: 95, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Core Area", "2,065.43 µm²"],
          ["Initial Util", "63.14%"],
          ["Core Offset", "1.0 µm"],
          ["Total Ports", "24 (M5 West & East)"],
          ["Unplaced Ports", "0"],
          ["Off-Track Ports", "0 (100% Track Aligned)"]
        ],
        img: "assets/fifo_floorplan_ports.png",
        caption: "My 8-Bit Async FIFO Floorplan & M5 Port Placement (port_placement_done.design)",
        action: "By cleanly segregating input ports on the West and output ports on the East on M5 tracks, I prevented cross-chip signal detouring before placement even began."
      },
      pdn: {
        title: "2. My M7/M8 Top Mesh & M2 Vertical Strap Power Plan",
        desc: "I designed a multi-layer Power Delivery Network combining an M7/M8 top mesh (0.6 µm width, 18 µm pitch) with M2 vertical straps (0.18 µm width, 6 µm pitch) and 0.06 µm M1 standard-cell follow-pin rails.",
        bars: [
          { label: "PG Via DRC Resolution (2 Fixed -> 0)", valText: "0 PG DRC", pct: 100, color: "bg-metal-m3" },
          { label: "PG Short & Connectivity Check", valText: "100% Clean", pct: 100, color: "bg-metal-m5" },
          { label: "Decoupling Capacitor (DCAP) Density", valText: "97 Cells Placed", pct: 90, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Top Mesh (M7/M8)", "W: 0.60µm | Pitch: 18µm"],
          ["Vertical Straps (M2)", "W: 0.18µm | Pitch: 6µm"],
          ["Std Cell Rails (M1)", "W: 0.06µm Follow-Pin"],
          ["PG DRC Violations", "2 → 0 (Fixed Via Spacing)"],
          ["PG Shorts", "0 Shorts"],
          ["DCAP Cells", "97 Physical Cells"]
        ],
        img: "assets/fifo_powerplan.png",
        caption: "My 8-Bit Async FIFO Multi-Layer Power Mesh (powerplan.design)",
        action: "When PG verification flagged 2 minimum-spacing via DRC violations, I modified the via definitions and sizing to achieve a 100% DRC-clean power grid."
      },
      placement: {
        title: "3. Zero-Congestion Standard Cell & Physical Cell Placement",
        desc: "I placed 276 standard logic cells alongside 97 decoupling capacitors (DCAPs) and 2 TIEH cells across 4 path groups (in2reg, reg2out, wclk, rclk).",
        bars: [
          { label: "Placement Density", valText: "62.70%", pct: 63, color: "bg-metal-m5" },
          { label: "Congestion-Free Channels", valText: "0.00% Congestion", pct: 100, color: "bg-metal-m3" },
          { label: "Pre-CTS Setup Slack (+0.35ns WNS)", valText: "+0.35 ns Met", pct: 92, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Placement Density", "62.70%"],
          ["DCAP / TIEH Cells", "97 DCAP / 2 TIEH"],
          ["Vert / Horiz Cong.", "0.00% / 0.00%"],
          ["Max_Trans / Cap", "0 / 0 Violations"],
          ["Setup WNS", "+0.35 ns (Slack Met)"],
          ["Setup TNS", "0.00 ns"]
        ],
        img: "assets/fifo_placement.png",
        caption: "My 8-Bit Async FIFO Standard Cell Placement (placement_done.design)",
        action: "I achieved 0.00% vertical and horizontal congestion with +0.35 ns positive setup slack right out of placement, leaving ample headroom for dual-clock CTS."
      },
      cts: {
        title: "4. Dual Asynchronous Clock Tree Synthesis (wclk & rclk)",
        desc: "I synthesized independent buffered clock trees for wclk (1.50 ns period, 80 sinks) and rclk (1.50 ns period, 24 sinks) using 34 buffers and 18 inverters per domain on M4–M5 (dwds NDR).",
        bars: [
          { label: "Dual-Domain Clock Skew Balancing", valText: "0.00 ns Global Skew", pct: 100, color: "bg-metal-m3" },
          { label: "wclk Latency (0.51ns vs 0.60ns Target)", valText: "0.51 ns (Met)", pct: 85, color: "bg-metal-m5" },
          { label: "rclk Latency (0.45ns vs 0.60ns Target)", valText: "0.45 ns (Met)", pct: 75, color: "bg-metal-m8" }
        ],
        metrics: [
          ["wclk Latency", "0.51 ns (Target <= 0.60ns)"],
          ["rclk Latency", "0.45 ns (Target <= 0.60ns)"],
          ["Global Skew", "0.00 ns (Target <= 0.225ns)"],
          ["CTS Buffers / Inv", "34 Buffers / 18 Inverters"],
          ["Setup TNS", "0.00 ns (Clean)"],
          ["Hold TNS", "0.00 ns (Clean)"]
        ],
        img: "assets/fifo_cts_tree.png",
        caption: "My 8-Bit Async FIFO Clock Tree Latency Graph (cts_completed.design)",
        action: "Even though wclk drove 80 sequential sinks and rclk drove 24 sinks, I balanced both trees to 0.00 ns global skew and sub-0.51 ns latency with zero timing violations."
      },
      routing: {
        title: "5. Detailed Routing & Clean DRC/Timing Signoff",
        desc: "I completed global and detailed routing (route_opt_done.design) at 68.41% final utilization, achieving a completely clean signoff across both clock domains.",
        bars: [
          { label: "Final Core Cell Utilization", valText: "68.41%", pct: 68, color: "bg-metal-m5" },
          { label: "Physical DRC / LVS / Shorts Signoff", valText: "0 DRC / 0 Shorts", pct: 100, color: "bg-metal-m3" },
          { label: "Final Setup & Hold Timing Closure", valText: "+0.16ns WNS / 0.00ns TNS", pct: 100, color: "bg-metal-m8" }
        ],
        metrics: [
          ["Final Cell Count", "305 Cells (68.41% Util)"],
          ["Shorts / Opens", "0 Shorts / 0 Opens"],
          ["DRC / PG Shorts", "0 DRC / 0 PG Shorts"],
          ["Max_Trans / Cap", "0 / 0 Violations"],
          ["Final Setup WNS", "+0.16 ns (Positive Slack)"],
          ["Final Setup/Hold TNS", "0.00 ns / 0.00 ns"]
        ],
        img: "assets/fifo_routing.png",
        caption: "My 8-Bit Async FIFO Final Routed Layout (route_opt_done.design)",
        action: "Closed full physical signoff with 0 shorts, 0 opens, 0 DRC violations, +0.16 ns positive Setup WNS, and 0.00 ns Hold TNS."
      }
    }
  }
};

window.metalLayersData = {
  m8m7: {
    title: "M8 / M7 — Top-Level Power Delivery Mesh (VDD / VSS)",
    colorClass: "text-metal-m5",
    desc: "In gprs_top, I configured M8 straps at 4.64 µm width (19.456 µm pitch) and M7 straps at 1.104 µm width (13.376 µm pitch). In my 8-Bit Async FIFO, I built an M7/M8 top mesh at 0.6 µm width and 18 µm pitch to guarantee low-IR-drop power distribution.",
    specA: "gprs_top: M8 (4.64µm) | M7 (1.104µm)",
    specB: "Async FIFO: M7/M8 (0.60µm @ 18µm)"
  },
  m6m5_ports: {
    title: "M6 / M5 — Track-Aligned Block I/O Port Routing",
    colorClass: "text-metal-m6",
    desc: "I placed all 103 ports of gprs_top on M6 South (MemWriteBus[63:0], MemWriteValid, MemOverflow, power_ack) and M5 West (MemReadBus[31:0], clock, reset, cs[1:0]). In my Async FIFO, all 24 ports were track-aligned on M5 (West inputs, East outputs) with 0 off-track violations.",
    specA: "gprs_top: 103 Ports (M6 South / M5 West)",
    specB: "Async FIFO: 24 Ports (M5 West & East)"
  },
  m5m4_cts: {
    title: "M5 / M4 — Clock Tree Synthesis with Non-Default Routing (dwds)",
    colorClass: "text-metal-m5",
    desc: "To shield high-frequency clock trees from coupling noise and RC delay, I routed both mclk (2,856 sinks in gprs_top) and wclk/rclk (80 & 24 sinks in Async FIFO) on M4–M5 using double-width double-spacing (dwds) NDR rules, achieving 0.14 ns and 0.00 ns global skew.",
    specA: "gprs_top CTS: 2,856 Sinks | 0.14ns Skew",
    specB: "Async FIFO CTS: wclk/rclk | 0.00ns Skew"
  },
  m2_straps: {
    title: "M2 — Vertical Power Straps & Via Arrays",
    colorClass: "text-metal-m3",
    desc: "Bridges the upper M7/M8 mesh down to M1 standard cell rails. In gprs_top, I used 0.44 µm width (9.728 µm pitch) and manually inserted 179 missing PG vias. In my Async FIFO, I used 0.18 µm width (6 µm pitch) and resized via spacing to clear 2 PG DRC violations.",
    specA: "gprs_top: M2 W=0.44µm | 179 Vias Added",
    specB: "Async FIFO: M2 W=0.18µm | 0 PG DRC"
  },
  m1_rails: {
    title: "M1 — Standard Cell Follow-Pin Rails & Decoupling Capacitors",
    colorClass: "text-metal-m8",
    desc: "Feeds VDD/VSS directly into standard logic cells, TIEH/TIEL cells, and decoupling capacitors (8,600 DCAPs in gprs_top; 97 DCAPs in Async FIFO) using 0.06 µm follow-pin rail structures with zero PG shorts.",
    specA: "gprs_top: M1 W=0.06µm | 8,600 DCAPs",
    specB: "Async FIFO: M1 W=0.06µm | 97 DCAPs"
  }
};

window.terminalCommands = {
  neofetch: `       .---.          narendaran@asic-node
      /     \\         --------------------
      | () () |       OS     : Red Hat Enterprise Linux 8.9 (Ootpa) x86_64
       \\  ^  /        Host   : Centre-for-Chip-Design-Workstation
        |||||         Kernel : 4.18.0-513.el8.x86_64 (EDA-Signoff)
        |||||         Shell  : bash 5.1 / Synopsys icc2_shell / vcs
                      EDA    : Synopsys ICC2, DC, VCS, PT | Cadence Innovus, Genus, Modus
                      OpenPD : OpenLane, OpenROAD, Yosys, Magic, KLayout (SKY130)
                      Role   : Final-Year ECE (CGPA: 9.30) @ Easwari Engineering College`,

  help: `GNU bash / EDA Workstation Commands:
  neofetch    - Display Linux EDA workstation & system specs
  whoami      - My engineering profile, education & contact
  ls -la      - List all design libraries (.nlib), RTL & GDSII files
  gprs        - Run report_qor on gprs_top.nlib (33.2K cells, 16 SRAM macros)
  fifo        - Run report_clock_qor on async_fifo.nlib (Dual-CTS, 0.00ns skew)
  arbiter     - Run Synopsys VCS simulation on ChipThink Bus Arbiter RTL
  innovus     - View Cadence Innovus placement, CTS & routing report
  dft         - View Cadence Genus & Modus scan-chain DFT summary
  openlane    - View OpenLane SKY130 RTL-to-GDSII flow summary
  uname -a    - Print Linux kernel & machine architecture
  clear       - Clear terminal buffer`,

  whoami: `uid=1000(narendaran) gid=1000(asic_design) groups=1000(physical_design),1001(rtl_verif),1002(dft)
Name     : Narendaran S G
Degree   : B.E. ECE (Sep 2023 - Jul 2027), Easwari Engineering College (CGPA: 9.30)
Email    : sgnarendaran@gmail.com`,

  'uname -a': `Linux asic-node.vlsi.local 4.18.0-513.el8_9.x86_64 #1 SMP x86_64 GNU/Linux (EDA Signoff Node)`,

  pwd: `/home/narendaran/vlsi_workspace`,

  'ls -la': `total 96
drwxr-xr-x 7 narendaran asic_design  4096 May 15 2026 .
drwxr-xr-x 4 narendaran asic_design  4096 May 01 2026 ..
drwxr-xr-x 5 narendaran asic_design  4096 Apr 28 2026 gprs_top.nlib/              [33,286 cells | 16 Macros | 0 WNS]
drwxr-xr-x 5 narendaran asic_design  4096 May 12 2026 asynchronous_fifo.nlib/     [305 cells | Dual-CTS 0ns Skew | 0 DRC]
drwxr-xr-x 4 narendaran asic_design  4096 Nov 08 2025 cadence_innovus_core/       [+1.377ns Post-CTS WNS | 0% Overflow]
drwxr-xr-x 3 narendaran asic_design  4096 Nov 14 2025 genus_modus_memory_dft/     [Scan Chain Stitched | 0 DFT Viols]
drwxr-xr-x 6 narendaran asic_design  4096 Apr 10 2026 openlane_sky130_spm/        [OpenROAD/Yosys/Magic SKY130 GDSII]
-rw-r--r-- 1 narendaran asic_design  8420 Apr 18 2026 multi_master_arbiter.v      [ChipThink Finals RTL - x/JiD3]
-rw-r--r-- 1 narendaran asic_design  6140 May 14 2026 half_adder_4abstractions.sv [Synopsys VCS Switch-Level Verified]`,

  gprs: `****************************************
Report : qor (Design: gprs_top.nlib)
Tool   : Synopsys IC Compiler II (icc2_shell)
****************************************
Cell Count (Initial -> Final) : 27,811 -> 33,286 Cells (16 Hard SRAM Macros)
Core Area / Final Utilization : 391,605.41 um^2 / 66.25% (10 Metal Layers)
Power Delivery Network (PDN)  : M8/M7/M2 mesh -> M1 rails (179 missing vias fixed -> 0 DRC)
Clock Tree (mclk @ 4.0ns)     : 2,856 Sinks | Global Skew: 0.14 ns | Max Latency: 0.63 ns
Routing & Signoff Closure     : 34 shorts resolved via route_eco -> 0 Opens, 0 Shorts, 0.00ns Setup WNS`,

  fifo: `****************************************
Report : clock_qor & route_opt (Design: asynchronous_fifo.nlib)
Tool   : Synopsys IC Compiler II (icc2_shell)
****************************************
Core Area / Final Utilization : 2,065.43 um^2 / 68.41% (305 Final Cells, 97 DCAPs)
wclk Domain (1.50ns, 80 sinks): Max Latency = 0.51 ns | Global Skew = 0.00 ns (M4-M5 dwds)
rclk Domain (1.50ns, 24 sinks): Max Latency = 0.45 ns | Global Skew = 0.00 ns (M4-M5 dwds)
Signoff Timing & DRC          : Setup WNS = +0.16 ns | Hold TNS = 0.00 ns | 0 DRC / 0 Shorts`,

  arbiter: `$ vcs -full64 -sverilog multi_master_arbiter.v tb_arbiter.sv -R
Chronologic VCS simulator copyright 1991-2026
[SIM] Compiling offline ChipThink Hackathon Finals RTL...
[PASS] Contention Test 1: CPU priority served immediately on cycle 1.
[PASS] Contention Test 2: 8-cycle fairness counter triggered -> Forced grant switch to DMA/Peripheral.
[PASS] Starvation prevented & debug state output verified. (edaplayground.com/x/JiD3)`,

  innovus: `****************************************
Report : timeDesign & routeDesign (Cadence Innovus)
****************************************
Standard Cell Placement : 53.189% density | Pre-CTS WNS  = +0.846 ns
Clock Tree Synthesis    : 0.011 ns Skew   | Post-CTS WNS = +1.377 ns (optDesign)
Detailed Signal Routing : 0.00% Routing Overflow (Clean track allocation)`,

  dft: `****************************************
Report : report_dft & scan_chains (Cadence Genus + Modus)
****************************************
Target Block     : Memory Block Synthesized Netlist
Scan Methodology : Scan flip-flops stitched; Shift & Capture modes verified
Signoff Result   : 0 DFT rule violations | Clean Area, Power & Timing (PPA) reports`,

  openlane: `****************************************
Flow   : OpenLane Automated 70+ Step RTL-to-GDSII (sky130_fd_sc_hd)
Design : Serial-Parallel Multiplier (SPM)
****************************************
1. Synthesis & Linting : Yosys & Verilator clean
2. Physical Design     : OpenROAD Floorplan, Tap/Filler insertion, PDN, Placement & CTS
3. Polygon Signoff     : Final GDSII layout verified in Magic & KLayout`,

  skills: `Commercial EDA : Synopsys ICC2, Design Compiler, Design Vision, VCS, PrimeTime | Cadence Innovus, Genus, Modus
Open-Source    : OpenLane, OpenROAD, Yosys, Verilator, Magic, KLayout (SKY130 PDK)
HDLs & Verif   : Verilog, SystemVerilog, UVM Fundamentals, Coverage-Driven Verification (CDV), Tcl`
};
