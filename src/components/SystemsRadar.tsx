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
    id: "linux",
    number: "01",
    title: "Linux desktop support practice",
    subtitle: "Arch Linux · pacman · Dependency checks",
    icon: Terminal,
    accentColor: "text-emerald-400",
    badge: "Personal system use",
    summary: "Uses Arch Linux as a personal desktop system and has recently worked through package update settings and dependency checks. This is personal system administration practice rather than professional Linux administrator experience.",
    protocols: ["Arch Linux", "pacman configuration", "pactree dependency review", "Desktop app updates"],
    metrics: [
      { label: "Environment", value: "Arch Linux" },
      { label: "Package manager", value: "pacman" },
      { label: "Dependency review", value: "pactree" },
      { label: "Context", value: "Personal workstation" },
    ],
    terminalLog: [
      "Reviewed pacman configuration for a pinned application",
      "Checked package relationships with pactree",
      "Inspected package output before cleanup decisions",
    ],
  },
  {
    id: "web",
    number: "02",
    title: "AI-assisted web projects",
    subtitle: "React portfolio · Astro school website",
    icon: Code2,
    accentColor: "text-cyan-400",
    badge: "Portfolio work",
    summary: "Builds and improves web projects with AI-assisted code generation, then reviews the output and makes manual design, content, and UI changes. Current work includes this React portfolio and a school website MVP using Astro and Tailwind.",
    protocols: ["React and TypeScript codebase", "Astro", "Tailwind CSS", "Responsive UI", "Supabase sign-in prototype"],
    metrics: [
      { label: "Portfolio", value: "React + Vite" },
      { label: "School site", value: "Astro" },
      { label: "Styling", value: "Tailwind CSS" },
      { label: "Workflow", value: "AI-assisted" },
    ],
    terminalLog: [
      "Iterated on page layouts and mobile navigation",
      "Reviewed generated code and made manual UI edits",
      "Added public pages and an admin sign-in prototype",
    ],
  },
  {
    id: "ece",
    number: "03",
    title: "ECE academic foundation",
    subtitle: "Electronics · Embedded systems · Digital logic",
    icon: Cpu,
    accentColor: "text-amber-400",
    badge: "Academic exposure",
    summary: "Completed a B.E. in Electronics and Communication Engineering. Academic work includes exposure to embedded systems, digital logic, microcontrollers, and automotive cockpit system concepts.",
    protocols: ["Electronics and communication", "Embedded systems coursework", "Arduino project exposure", "Verilog and digital logic", "CAN and AAOS concepts"],
    metrics: [
      { label: "Degree", value: "B.E. ECE" },
      { label: "Institution", value: "DBIT" },
      { label: "Graduation", value: "2025" },
      { label: "CGPA", value: "7.16" },
    ],
    terminalLog: [
      "Coursework: embedded systems and digital design",
      "Academic project: automotive cockpit system concepts",
      "Certificate: VLSI digital design and Verilog programming",
    ],
  },
  {
    id: "security",
    number: "04",
    title: "Security recognition",
    subtitle: "7chats Messenger bug bounty contest",
    icon: Shield,
    accentColor: "text-pink-400",
    badge: "Recognition",
    summary: "Existing resume materials record a 7chats Messenger bug bounty contest award for reporting an authentication issue. The award is included as a recognition item; no broader professional security experience is claimed.",
    protocols: ["Application security issue reporting", "Bug bounty contest recognition", "Network security coursework"],
    metrics: [
      { label: "Recognition", value: "7chats Messenger" },
      { label: "Type", value: "Bug bounty contest" },
      { label: "Recorded date", value: "September 2021" },
      { label: "Scope", value: "Authentication issue" },
    ],
    terminalLog: [
      "Award recorded in existing resume materials",
      "Application: 7chats Messenger",
      "Reported issue: authentication-related",
    ],
  },
  {
    id: "teaching",
    number: "05",
    title: "Music teaching and creative work",
    subtitle: "Part-time music teacher · Personal audio projects",
    icon: Sparkles,
    accentColor: "text-purple-400",
    badge: "Current role",
    summary: "Currently teaches music part-time at St Sophia Convent High School. Music and audio production remain a creative practice alongside the technical career focus.",
    protocols: ["Music instruction", "Classroom communication", "Electronic music interest", "Audio production practice"],
    metrics: [
      { label: "Role", value: "Music Teacher" },
      { label: "Schedule", value: "Part-time" },
      { label: "Started", value: "August 2026" },
      { label: "Focus", value: "Music instruction" },
    ],
    terminalLog: [
      "Current role: part-time music teacher",
      "School: St Sophia Convent High School",
      "Personal interest: music and audio production",
    ],
  },
];

export const SystemsRadar: React.FC = () => {
  const [activeDomainId, setActiveDomainId] = useState<string>("linux");
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
    <section id="systems-radar" className="py-24 px-6 sm:px-12 max-w-[1700px] mx-auto scroll-mt-20 border-t border-white/10">
      {/* Header */}
      <div className="mb-14 text-left">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">
          <Activity size={14} className="text-cyan-400 animate-pulse" />
          <span>02 // EXPERIENCE AREAS & EVIDENCE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
          Experience <span className="text-white/40">beyond code</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-xl">
          Linux desktop maintenance, web projects, engineering education, recognition, and current work. Choose an area to see its context.
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
              <button
                type="button"
                key={domain.id}
                onClick={() => selectDomain(domain.id)}
                onMouseEnter={() => soundFX.playHover()}
                aria-pressed={isSelected}
                className={`relative w-full p-5 text-left rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
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
              </button>
            );
          })}
        </div>

        {/* Right: selected experience area */}
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
                  <span>EXPERIENCE CONTEXT // {activeDomain.badge.toUpperCase()}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-display font-medium text-white mt-3">
                  {activeDomain.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {activeDomain.subtitle}
                </p>
              </div>

              <div className="text-right font-mono text-xs text-zinc-500">
                <span>AREA:</span> <span className="text-white font-bold">{activeDomain.number}</span>
              </div>
            </div>

            {/* Narrative Summary */}
            <p className="text-sm text-zinc-300 font-sans leading-relaxed">
              {activeDomain.summary}
            </p>

            {/* Selected context */}
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">At a glance</h4>
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
                <span>Related tools and topics</span>
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

          {/* Selected examples and context */}
          <div className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] space-y-1 text-zinc-400 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-white/5">
              <span>SELECTED EVIDENCE</span>
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
