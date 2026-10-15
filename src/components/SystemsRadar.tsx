import React, { useState, useRef } from "react";
import { Cpu, Terminal, Sparkles, Shield, Code2, Activity, CheckCircle2 } from "lucide-react";
import { soundFX } from "../utils/audioFX";

interface DomainSpec {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badge: string;
  summary: string;
  protocols: string[];
  metrics: { label: string; value: string }[];
  terminalLog: string[];
}

const DOMAINS: DomainSpec[] = [
  {
    id: "automotive",
    number: "01",
    title: "Automotive Cockpit & AAOS",
    subtitle: "CAN 2.0B · Vehicle HAL · Cockpit Domain Controller",
    icon: Cpu,
    accentColor: "text-cyan-400",
    badge: "Automotive ECE",
    summary: "Engineered Cockpit Domain Controller (Luxoft CDC) prototypes integrating CAN 2.0B protocols to manage Electronic Control Units (ECUs) at 8,000+ frames/sec. Implemented Vehicle HAL property listeners on Android Automotive OS for real-time instrument cluster telemetry.",
    protocols: ["CAN 2.0B (11-bit / 29-bit)", "Vehicle HAL (VHAL)", "Android Automotive OS", "MCP2515 SPI Transceiver", "CarService Telemetry", "OBD-II Diagnostics"],
    metrics: [
      { label: "Throughput", value: "8,000+ fps" },
      { label: "Protocol", value: "CAN 2.0B ISO 11898" },
      { label: "Target OS", value: "AAOS 13 / 14" },
      { label: "Latency", value: "< 1.2 ms" },
    ],
    terminalLog: [
      "[CAN_BUS] Initialized MCP2515 @ 500kbps 16MHz clock",
      "[VHAL] Binding CarPropertyManager to HVAC & Speedometer",
      "[CDC_CORE] ECU frame buffer synced with 0 dropped frames",
      "[CLUSTER] Display rendering 60fps telemetry stream",
    ],
  },
  {
    id: "linux",
    number: "02",
    title: "Linux Kernel & Systems Engineering",
    subtitle: "Arch Linux · procfs Tracing · AOSP ROM Compilation",
    icon: Terminal,
    accentColor: "text-emerald-400",
    badge: "Core Systems",
    summary: "Daily driver Arch Linux power user with custom Wayland Hyprland compositor. Hands-on experience in Linux kernel compilation, memory tracing via procfs, systemd unit design, AOSP ROM compilation, bootloader unlocking, and custom Magisk/KernelSU modules.",
    protocols: ["Arch Linux (Rolling)", "Linux Kernel Compilation", "procfs / sysfs Tracing", "POSIX Shell (Bash/Zsh)", "Systemd Service Units", "Docker Containerization"],
    metrics: [
      { label: "Environment", value: "Arch Linux / Hyprland" },
      { label: "Kernel", value: "Linux 6.x Zen / Hardened" },
      { label: "Editor", value: "Neovim (Lua / LSP)" },
      { label: "Architecture", value: "x86_64 / aarch64" },
    ],
    terminalLog: [
      "[KERNEL] Compiling custom kernel config with BBR congestion",
      "[PROCFS] Memory slab allocator verified zero leak status",
      "[SYSTEMD] Started automotive-gateway.service in 12ms",
      "[DEV] Neovim LSP tree-sitter AST validation active",
    ],
  },
  {
    id: "webgl",
    number: "03",
    title: "Creative WebGL & GLSL Shaders",
    subtitle: "Three.js · Fragment Math · Relativistic Particle Sims",
    icon: Sparkles,
    accentColor: "text-purple-400",
    badge: "Creative Code",
    summary: "Architecting GPU-accelerated interactive 3D web experiences with Three.js and raw GLSL shaders. Handcrafted 1,114 lines of reactive GLSL for fluid smoke audio visualizers, relativistic black hole accretion discs, and cloth-wave physics.",
    protocols: ["Three.js & WebGL 2.0", "Custom GLSL Shaders", "Relativistic Accretion Math", "Web Audio API FFT", "Instanced Mesh Buffers", "Blender Low-Poly glTF"],
    metrics: [
      { label: "GLSL Lines", value: "1,114 Handcrafted" },
      { label: "Particles", value: "8,000 GPU accelerated" },
      { label: "Framerate", value: "Stable 60 FPS" },
      { label: "Audio", value: "Real-time FFT 2048 bins" },
    ],
    terminalLog: [
      "[GLSL] Compiled accretion vertex & fragment programs",
      "[GPU] Binding instanced buffer attribute for 8,000 stars",
      "[WEB_AUDIO] FFT analyser connected to lowpass filter",
      "[RENDER] Frame delta locked to requestAnimationFrame",
    ],
  },
  {
    id: "security",
    number: "04",
    title: "Reverse Engineering & Security Research",
    subtitle: "Bug Bounty Winner · JADX · Frida Instrumentation",
    icon: Shield,
    accentColor: "text-pink-400",
    badge: "Security Award",
    summary: "Winner of the official 7chats Messenger Bug Bounty contest for discovering and responsibly disclosing an authentication bypass vulnerability. Proficient in APK reverse engineering using JADX, dynamic hooking with Frida, and Burp Suite traffic proxying.",
    protocols: ["APK Reverse Engineering", "Frida Dynamic Hooking", "JADX Decompilation", "Burp Suite Pro Intercept", "OAuth 2.0 & JWT Auditing", "Responsible Disclosure"],
    metrics: [
      { label: "Award", value: "7chats Bounty Winner" },
      { label: "Disclosed", value: "Auth Bypass Zero-Day" },
      { label: "Instrumentation", value: "Frida Runtime Scripts" },
      { label: "Status", value: "Patched Upstream" },
    ],
    terminalLog: [
      "[FRIDA] Attached to messenger process PID 14922",
      "[HOOK] Intercepted token validation callback signature",
      "[AUDIT] Discovered logic flaw in server response parsing",
      "[DISCLOSURE] Official bounty awarded and CVE report resolved",
    ],
  },
  {
    id: "languages",
    number: "05",
    title: "Core Languages & Digital Hardware",
    subtitle: "C/C++ · Verilog HDL · Python · TypeScript · Rust",
    icon: Code2,
    accentColor: "text-amber-400",
    badge: "Multi-Language",
    summary: "Polyglot software engineer capable of writing low-level pointer-manipulating C/C++ firmware, digital logic in Verilog HDL for FPGA simulation, high-concurrency Go and Python backend scripts, and strictly typed TypeScript applications.",
    protocols: ["C & Modern C++ (C++20)", "Verilog HDL Digital Logic", "TypeScript & React 19", "Python 3 & Automation", "Rust (Memory Safety)", "Dart & Flutter Mobile"],
    metrics: [
      { label: "Primary", value: "C / C++ / TypeScript" },
      { label: "Hardware HDL", value: "Verilog / ModelSim" },
      { label: "Microcontroller", value: "Arduino / ESP32 / STM32" },
      { label: "Web", value: "React 19 / Vite / Tailwind" },
    ],
    terminalLog: [
      "[VERILOG] Synthesizing 4-bit state machine in ModelSim",
      "[CPP] Compiling firmware with -O3 optimizations and zero warnings",
      "[RUST] Cargo build verified zero memory leaks at compile-time",
      "[TYPESCRIPT] Strict type-check complete with 0 errors",
    ],
  },
];

export const SystemsRadar: React.FC = () => {
  const [activeDomainId, setActiveDomainId] = useState<string>("automotive");
  const activeDomain = DOMAINS.find(d => d.id === activeDomainId) || DOMAINS[0];
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!consoleRef.current) return;
    const rect = consoleRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  const selectDomain = (id: string) => {
    soundFX.playClick();
    setActiveDomainId(id);
  };

  return (
    <section id="systems-radar" className="py-24 px-6 sm:px-12 max-w-[1700px] mx-auto scroll-mt-20 border-t border-white/10 select-none">
      {/* Header */}
      <div className="mb-14 text-left">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">
          <Activity size={14} className="text-cyan-400 animate-pulse" />
          <span>02 // ARCHITECTURAL TELEMETRY & SYSTEMS RADAR</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
          Engineering Domains <span className="text-white/40">& Core Arsenal</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-xl">
          Direct hardware interfaces, low-level kernel diagnostics, GPU mathematics, and security research. Click or hover any domain to inspect telemetry.
        </p>
      </div>

      {/* Main Interactive Radar Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Domain Selector Tabs (Inspired by Overworld Audio & Bleibtgleich) */}
        <div className="lg:col-span-5 space-y-3">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isSelected = domain.id === activeDomainId;
            return (
              <div
                key={domain.id}
                onClick={() => selectDomain(domain.id)}
                onMouseEnter={() => soundFX.playHover()}
                className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group overflow-hidden ${
                  isSelected
                    ? "bg-white/[0.06] border-cyan-400/60 shadow-xl shadow-cyan-400/10 -translate-x-1 sm:translate-x-2"
                    : "bg-white/[0.015] border-white/10 hover:border-white/25 hover:bg-white/[0.03]"
                }`}
              >
                {/* Active Accent Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r shadow-[0_0_12px_#00F2FE]" />
                )}

                <div className="flex items-center gap-4">
                  <span className={`font-mono text-xs ${isSelected ? "text-cyan-300 font-bold" : "text-zinc-600"}`}>
                    {domain.number}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isSelected ? "bg-cyan-950/60 border-cyan-400/40" : "bg-black/50 border-white/10 group-hover:border-white/20"
                  }`}>
                    <Icon size={18} className={isSelected ? "text-cyan-300" : "text-zinc-400 group-hover:text-white"} />
                  </div>
                  <div>
                    <h3 className={`font-display font-medium text-sm sm:text-base transition-colors ${
                      isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                    }`}>
                      {domain.title}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 line-clamp-1">
                      {domain.subtitle}
                    </p>
                  </div>
                </div>

                <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border transition-all hidden sm:inline ${
                  isSelected
                    ? "bg-cyan-950/60 border-cyan-400/40 text-cyan-300"
                    : "border-transparent text-zinc-600"
                }`}>
                  {domain.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Live Telemetry & Architecture Display with Dynamic Specular Sheen */}
        <div
          ref={consoleRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos(prev => ({ ...prev, active: false }))}
          className="lg:col-span-7 relative p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between space-y-8"
        >
          {/* Specular Sheen (Jesper Landberg style) */}
          {mousePos.active && (
            <div
              className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-200"
              style={{
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.08), transparent 70%)`,
              }}
            />
          )}

          <div className="space-y-6">
            {/* Console Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>DOMAIN STATUS // VERIFIED HANDS-ON</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-display font-medium text-white mt-3">
                  {activeDomain.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {activeDomain.subtitle}
                </p>
              </div>

              <div className="text-right font-mono text-xs text-zinc-500">
                <span>SYSTEM ID:</span> <span className="text-white font-bold">{activeDomain.number}</span>
              </div>
            </div>

            {/* Narrative Summary */}
            <p className="text-sm text-zinc-300 font-sans leading-relaxed">
              {activeDomain.summary}
            </p>

            {/* Metrics HUD Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeDomain.metrics.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">{m.label}</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-cyan-200 mt-1">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Protocol Stack Tags */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Verified Protocols & Toolchain</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeDomain.protocols.map((proto) => (
                  <span
                    key={proto}
                    className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-zinc-200 font-mono text-xs flex items-center gap-1.5 hover:border-cyan-400/50 transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{proto}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Live Simulated Terminal Log (Overworld Audio style) */}
          <div className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] space-y-1 text-zinc-400 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-white/5">
              <span>LIVE_TELEMETRY_LOG // BENGALURU_NODE</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            {activeDomain.terminalLog.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-cyan-400 mr-2">&gt;</span>
                <span className="text-zinc-300">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
