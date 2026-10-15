import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
  Lock,
  RefreshCw,
  Terminal,
  Cpu,
  Code2,
  Sliders,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { BlackHoleSimulation } from "./BlackHoleSimulation";
import { soundFX } from "../utils/audioFX";

export interface ProjectSpec {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  skills: string[];
  badge: string;
  img: string;
  link: string;
}

interface PageInsidePageModalProps {
  project: ProjectSpec | null;
  onClose: () => void;
  onOpenSanctuary?: () => void;
}

export const PageInsidePageModal: React.FC<PageInsidePageModalProps> = ({
  project,
  onClose,
  onOpenSanctuary,
}) => {
  const [activeTab, setActiveTab] = useState<"runtime" | "spec" | "telemetry" | "code">("runtime");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simSpeed] = useState(8240); // CAN frames/sec
  const [canLogs, setCanLogs] = useState<string[]>([
    "[INIT] SocketCAN interface can0 initialized at 500,000 bps",
    "[0x120] CAR_SPEED_TELEMETRY: 68.4 km/h | Valid: TRUE | Parity: OK",
    "[0x230] BRAKE_PRESSURE_PSI: 32.8 | Status: NOMINAL",
    "[0x450] VHAL_CAR_PROPERTY: HVAC_TEMP_LEFT = 21.5°C",
    "[0x7E0] LUXOFT_CDC_IPC: Multi-Display Cluster Frame Sync: 60.0 FPS",
  ]);
  const [isInjectingCAN, setIsInjectingCAN] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const triggerCANInjection = () => {
    soundFX.playClick();
    setIsInjectingCAN(true);
    const newId = `0x${Math.floor(Math.random() * 0x7ff).toString(16).toUpperCase().padStart(3, "0")}`;
    const payload = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0")
    ).join(" ");
    const newLog = `[${newId}] INJECTED_FRAME: ${payload} | Rate: ${(simSpeed + Math.floor(Math.random() * 200 - 100)).toLocaleString()} fps`;

    setCanLogs((prev) => [newLog, ...prev.slice(0, 6)]);
    setTimeout(() => setIsInjectingCAN(false), 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} Embedded Viewport`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* ── THE "PAGE INSIDE A PAGE" BROWSER WINDOW ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full rounded-3xl bg-[#080b14] border border-cyan-400/40 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "max-w-[98vw] h-[96vh]"
            : "max-w-5xl h-[88svh] max-h-[820px]"
        }`}
      >
        {/* ── WINDOW TITLE BAR (macOS / Cyber Browser Frame) ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0e1220] border-b border-white/10 flex-shrink-0">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center group transition-colors"
              title="Close window"
              aria-label="Close window"
            >
              <X size={8} className="opacity-0 group-hover:opacity-100 text-black" />
            </button>
            <button
              onClick={() => soundFX.playHover()}
              className="w-3.5 h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors"
              title="Minimize window"
              aria-label="Minimize window"
            />
            <button
              onClick={() => {
                soundFX.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center group transition-colors"
              title="Toggle fullscreen"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 size={8} className="opacity-0 group-hover:opacity-100 text-black" />
            </button>
          </div>

          {/* Browser Address Bar (URL Bar) */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 max-w-sm sm:max-w-md w-full justify-center shadow-inner">
            <Lock size={11} className="text-emerald-400 flex-shrink-0" />
            <span className="truncate text-[11px] text-zinc-400">
              zynx.internal/works/<span className="text-cyan-300">{project.id}</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 ml-auto hidden sm:inline">
              LIVE_VIEWPORT
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-zinc-400">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors hidden sm:inline-flex"
              title={isFullscreen ? "Restore window" : "Maximize window"}
              aria-label={isFullscreen ? "Restore window" : "Maximize window"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── SUB-HEADER: TABS INSIDE THE PAGE ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#090d18] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab("runtime");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "runtime"
                  ? "bg-cyan-400 text-black font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={12} />
              <span>Interactive Runtime</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab("spec");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "spec"
                  ? "bg-cyan-400 text-black font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu size={12} />
              <span>System Specs</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab("telemetry");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "telemetry"
                  ? "bg-cyan-400 text-black font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Terminal size={12} />
              <span>Live Telemetry</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab("code");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "code"
                  ? "bg-cyan-400 text-black font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Code2 size={12} />
              <span>Source & Tools</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <Radio size={11} className="text-emerald-400 animate-pulse" />
            <span>PORT 5173 // 60 FPS</span>
          </div>
        </div>

        {/* ── MAIN VIEWPORT BODY (THE EMBEDDED PAGE) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-left">
          {/* TAB 1: INTERACTIVE RUNTIME */}
          {activeTab === "runtime" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Project Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                    <span>{project.badge}</span>
                    <span className="text-zinc-600">·</span>
                    <span>{project.category}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight mt-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {project.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {project.link.startsWith("http") ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-400/20"
                    >
                      <span>Visit Live Source</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenSanctuary) onOpenSanctuary();
                      }}
                      className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
                    >
                      <span>Open in Sanctuary</span>
                      <Sliders size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* DYNAMIC EMBEDDED VIEW BASED ON PROJECT ID */}
              {project.id === "black-hole-universe" ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 bg-black/90 h-[360px] sm:h-[420px]">
                  <BlackHoleSimulation className="h-full w-full opacity-95" />
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <span className="text-amber-300 font-bold">
                      GPU 8,000 Particle Relativistic Singularity Active
                    </span>
                    <span>MOVE MOUSE FOR GRAVITATIONAL LENSING DEFLECTION</span>
                  </div>
                </div>
              ) : project.id === "luxoft-cdc" ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-black/80 border border-cyan-400/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                        <Terminal size={14} className="text-cyan-400" />
                        <span>LIVE CAN BUS (CAN 2.0B / VHAL) INJECTION CONSOLE</span>
                      </div>
                      <button
                        onClick={triggerCANInjection}
                        disabled={isInjectingCAN}
                        className="px-3 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw size={11} className={isInjectingCAN ? "animate-spin" : ""} />
                        <span>Inject Telemetry Frame</span>
                      </button>
                    </div>

                    {/* Console Logs */}
                    <div className="font-mono text-xs text-emerald-400 space-y-1 bg-[#05070d] p-3 rounded-xl border border-white/10 overflow-x-auto">
                      {canLogs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          {log}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                      <span>BAUD RATE: 500,000 BPS (HIGH SPEED CAN)</span>
                      <span>PARSING VELOCITY: ~{simSpeed.toLocaleString()} FRAMES/SEC</span>
                    </div>
                  </div>

                  <div className="relative aspect-[16/8] rounded-2xl overflow-hidden border border-white/10">
                    <img src={project.img} alt={project.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/9] shadow-2xl">
                  <img src={project.img} alt={project.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-xl bg-black/60 border border-white/15">
                    <h4 className="text-white font-display font-medium text-lg">
                      {project.name}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYSTEM SPECS */}
          {activeTab === "spec" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h4 className="text-sm font-mono uppercase tracking-[0.2em] text-cyan-300 flex items-center gap-2">
                  <Cpu size={14} />
                  <span>ARCHITECTURE & ENGINEERING SPECIFICATIONS</span>
                </h4>
                <p className="text-sm text-zinc-200 font-sans leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Technologies Pills */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
                  VERIFIED HARDWARE PROTOCOLS & TOOLCHAINS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TELEMETRY */}
          {activeTab === "telemetry" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">COMPUTE LATENCY</span>
                  <div className="text-2xl font-display font-medium text-white mt-1">&lt; 1.2 ms</div>
                  <span className="text-[10px] font-mono text-emerald-400">ZERO FRAME DROPS</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">MEMORY FOOTPRINT</span>
                  <div className="text-2xl font-display font-medium text-white mt-1">42.8 MB</div>
                  <span className="text-[10px] font-mono text-cyan-400">OPTIMIZED HEAP</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">RENDER PASSES</span>
                  <div className="text-2xl font-display font-medium text-white mt-1">60 FPS</div>
                  <span className="text-[10px] font-mono text-purple-400">HARDWARE VSYNC</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-zinc-300 space-y-1">
                <div className="text-cyan-400">$ systool -c net -v</div>
                <div className="text-zinc-500">Device = "can0"</div>
                <div className="text-zinc-500">Driver = "mcp2515"</div>
                <div className="text-zinc-500">Bus = "spi"</div>
                <div className="text-emerald-400">Status = "OPERATIONAL // BUFFER HEALTHY"</div>
              </div>
            </div>
          )}

          {/* TAB 4: CODE & TOOLS */}
          {activeTab === "code" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">
                    REPOSITORY & SOURCE ARTIFACTS
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">GITHUB // ZYNXX777</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  All firmware, kernel patches, WebGL shaders, and electronics schematics authored by Joshua D.
                </p>

                <div className="pt-2">
                  <a
                    href={project.link.startsWith("http") ? project.link : "https://github.com/Zynxx777"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
                  >
                    <span>Inspect Repository on GitHub</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── WINDOW STATUS BAR (FOOTER) ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#0a0d18] border-t border-white/10 text-[10px] font-mono text-zinc-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={11} />
              <span>EMBEDDED PAGE RENDERED</span>
            </span>
            <span className="hidden sm:inline text-zinc-600">·</span>
            <span className="hidden sm:inline">SECURE SSL 256-BIT</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-400">PRESS [ESC] TO CLOSE</span>
            <button
              onClick={onClose}
              className="text-white hover:text-cyan-300 underline font-bold"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
