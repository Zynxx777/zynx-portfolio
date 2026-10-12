import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Terminal, FileText, Cpu, Compass, Disc3, Shield, Monitor, Orbit } from "lucide-react";
import { BlackHoleSimulation } from "../components/BlackHoleSimulation";
import { BlackHoleModal } from "../components/BlackHoleModal";
import { Projects3D } from "../components/Projects3D";
import { SkillsMatrix } from "../components/SkillsMatrix";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { ContactTerminal } from "../components/ContactTerminal";
import profileData from "../data/profile.json";

interface PortfolioPageProps {
  openResume: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  openResume,
  onNavigateSpace,
  onNavigateCommunity,
}) => {
  const [isBlackHoleModalOpen, setIsBlackHoleModalOpen] = useState(false);
  const roles = [
    "ELECTRONICS & COMMUNICATION ENGINEER",
    "AUTOMOTIVE COCKPIT & AAOS DEVELOPER",
    "LINUX & EMBEDDED SYSTEMS SPECIALIST",
    "CREATIVE WEBGL & 3D DEVELOPER",
    "7CHATS BUG BOUNTY WINNER"
  ];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [roles.length]);

  return (
    <div className="space-y-16 relative">
      {/* Vertical Japanese & Latin Margin Ribbons (Authentic to Joshua's original design) */}
      <div className="hidden 2xl:block fixed left-4 top-1/3 z-30 pointer-events-none opacity-40 select-none">
        <span
          style={{ textOrientation: "upright", writingMode: "vertical-rl" }}
          className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase"
        >
          JOSHUA D // ZYNX // 2026 // BENGALURU
        </span>
      </div>

      <div className="hidden 2xl:block fixed right-4 top-1/3 z-30 pointer-events-none opacity-40 select-none">
        <span
          style={{ textOrientation: "upright", writingMode: "vertical-rl" }}
          className="font-mono text-[10px] tracking-[0.4em] text-purple-400"
        >
          ヨシュア・ジンクス // 開発者 // 音楽制作
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HERO WITH PROFILE PORTRAIT & INTERACTIVE BLACK HOLE ART
      ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[96vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Three.js Interactive Relativistic Black Hole Simulation (Interstellar Gargantua Style) */}
        <BlackHoleSimulation className="z-0 opacity-80" />

        {/* Ambient radial lighting glows */}
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {/* Hero Main Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, Bio & Actions (Col 7) */}
          <div className="col-span-7 lg:col-span-12 flex flex-col items-start lg:items-center lg:text-center space-y-6">
            
            {/* Status Pill with Black Hole & Location Telemetry */}
            <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full cyber-glass border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider shadow-lg shadow-cyan-400/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SYSTEM ONLINE // ARCH LINUX</span>
              <span className="text-zinc-600">//</span>
              <span className="text-purple-300">BLR, INDIA</span>
            </div>

            {/* Headline Identity with Interactive Thumbnail Pills */}
            <div className="space-y-3">
              <h2 className="text-zinc-500 text-xs font-mono tracking-widest uppercase">
                {profileData.basics.label}
              </h2>

              <h1 className="text-6xl xl:text-5xl sm:text-4xl xs:text-3xl font-display font-extrabold tracking-tight text-white leading-none">
                <span className="block text-zinc-300">I AM</span>
                <span className="flex flex-wrap items-center gap-3 lg:justify-center">
                  <span>JOSHUA D</span>
                  {/* Interactive Black Hole Artwork Pill */}
                  <button
                    onClick={() => setIsBlackHoleModalOpen(true)}
                    className="group relative inline-flex items-center gap-2 px-3 py-1 rounded-full cyber-glass border border-amber-400/40 hover:border-amber-300 text-amber-300 hover:text-white transition-all shadow-md shadow-amber-500/10 hover:scale-105"
                    title="Inspect Black Hole Accretion Simulation"
                  >
                    <img
                      src="/images/blackhole.jpeg"
                      alt="Black Hole"
                      className="w-6 h-6 rounded-full object-cover group-hover:rotate-180 transition-transform duration-700"
                    />
                    <span className="text-xs font-mono font-bold tracking-wider">ZYNX</span>
                    <Sparkles size={11} className="text-amber-400" />
                  </button>
                </span>
              </h1>
            </div>

            {/* Kinetic Scramble Role Badge */}
            <div className="h-8 flex items-center lg:justify-center">
              <p className="font-mono text-xs sm:text-[11px] tracking-wider text-purple-300 bg-purple-950/40 px-4 py-1.5 rounded-full border border-purple-500/30 transition-all duration-300">
                ▶ {roles[roleIndex]}
              </p>
            </div>

            {/* Narrative Bio */}
            <p className="max-w-xl text-sm sm:text-xs text-zinc-300 font-sans leading-relaxed">
              Electronics & Communication Engineering background with deep hands-on expertise in automotive cockpit controllers (CAN / AAOS), custom ROMs, reverse engineering, WebGL GLSL shaders, and electronic music sound design.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center lg:justify-center gap-3 pt-2">
              <a
                href="#projects"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl shadow-cyan-400/25 flex items-center gap-2 group hover:scale-105"
              >
                <span>3D Projects</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={openResume}
                className="px-5 py-3 rounded-full cyber-glass border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-emerald-100 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-105"
              >
                <FileText size={14} className="text-emerald-400" />
                <span>ATS Resume</span>
              </button>

              <button
                onClick={() => setIsBlackHoleModalOpen(true)}
                className="px-5 py-3 rounded-full cyber-glass border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:scale-105"
              >
                <Orbit size={14} className="text-amber-400 animate-spin" />
                <span>Black Hole Sim</span>
              </button>

              <button
                onClick={onNavigateSpace}
                className="px-5 py-3 rounded-full cyber-glass border border-white/15 hover:border-cyan-400/50 text-zinc-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <Monitor size={14} className="text-cyan-400" />
                <span>3D Bedroom</span>
              </button>
            </div>

            {/* Quick Capabilities Highlights Bar */}
            <div className="grid grid-cols-4 sm:grid-cols-2 gap-3 w-full max-w-xl text-left pt-3">
              <div className="p-3 rounded-xl cyber-glass border border-white/5 hover:border-cyan-400/30 transition-colors">
                <Cpu size={15} className="text-cyan-400 mb-1" />
                <h4 className="font-display font-bold text-xs text-zinc-200">AAOS Cockpit</h4>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">CAN Bus & Luxoft CDC</p>
              </div>

              <div className="p-3 rounded-xl cyber-glass border border-white/5 hover:border-emerald-400/30 transition-colors">
                <Terminal size={15} className="text-emerald-400 mb-1" />
                <h4 className="font-display font-bold text-xs text-zinc-200">Arch Linux</h4>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">AOSP & Root Modules</p>
              </div>

              <div className="p-3 rounded-xl cyber-glass border border-white/5 hover:border-purple-400/30 transition-colors">
                <Sparkles size={15} className="text-purple-400 mb-1" />
                <h4 className="font-display font-bold text-xs text-zinc-200">WebGL & GLSL</h4>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Three.js Particle Sims</p>
              </div>

              <div className="p-3 rounded-xl cyber-glass border border-white/5 hover:border-pink-400/30 transition-colors">
                <Shield size={15} className="text-pink-400 mb-1" />
                <h4 className="font-display font-bold text-xs text-zinc-200">Bug Bounty</h4>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">7chats Winner</p>
              </div>
            </div>
          </div>

          {/* Right Column: Joshua's Profile Portrait Artpiece (Col 5) */}
          <div className="col-span-5 lg:col-span-12 flex justify-center items-center relative">
            <div className="relative group w-80 h-96 sm:w-72 sm:h-84 flex items-center justify-center">
              
              {/* Outer Glowing Orbital Ring (Event Horizon Effect) */}
              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-amber-500/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Rotating SVG Event Horizon Accretion Ring */}
              <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] pointer-events-none animate-spin-slow opacity-60">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="url(#bh-gradient)"
                  strokeWidth="2"
                  strokeDasharray="16 12 4 12"
                />
                <defs>
                  <linearGradient id="bh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FE" />
                    <stop offset="50%" stopColor="#9D4EDD" />
                    <stop offset="100%" stopColor="#FF8800" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Portrait Holographic Container */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden cyber-glass border border-white/20 p-2 shadow-2xl group-hover:border-cyan-400/50 transition-all duration-500 flex flex-col justify-between">
                
                {/* Joshua's 4K Profile Photo */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/80">
                  <picture>
                    <source srcSet="/images/profile_avatar.webp" type="image/webp" />
                    <img
                      src="/images/profile_pic.png"
                      alt="Joshua D (ZYNX)"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 filter contrast-105"
                    />
                  </picture>

                  {/* Gradient Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04040a] via-transparent to-transparent opacity-80" />

                  {/* Top Status Pill on Portrait */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-400/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ONLINE // ARCH LINUX</span>
                  </div>

                  {/* Top Right Black Hole Mini Trigger */}
                  <button
                    onClick={() => setIsBlackHoleModalOpen(true)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 hover:border-amber-300 p-0.5 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                    title="Explore Black Hole Singularity"
                  >
                    <img
                      src="/images/blackhole.jpeg"
                      alt="Black Hole"
                      className="w-full h-full rounded-full object-cover animate-spin-slow"
                    />
                  </button>

                  {/* Bottom Portrait Card Details */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-extrabold text-sm text-white">JOSHUA D</span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">7YNX</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                      <span>B.E. ECE // DBIT</span>
                      <span className="text-cyan-400">AAOS COCKPIT</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Orbit Badges around Portrait */}
              <div className="absolute -left-6 top-1/4 px-3 py-1.5 rounded-xl cyber-glass border border-cyan-400/40 text-[10px] font-mono text-cyan-300 shadow-xl sm:hidden animate-pulse">
                ⚡ CAN BUS & AAOS
              </div>

              <div className="absolute -right-6 bottom-1/4 px-3 py-1.5 rounded-xl cyber-glass border border-purple-500/40 text-[10px] font-mono text-purple-300 shadow-xl sm:hidden">
                🏆 7CHATS BUG BOUNTY
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          01 // 3D PROJECTS SHOWCASE (moto-card Tilt Cards)
      ══════════════════════════════════════════════════════════ */}
      <Projects3D />

      {/* ══════════════════════════════════════════════════════════
          02 // TECHNICAL ARSENAL WITH PNG LOGOS & CLIPARTS
      ══════════════════════════════════════════════════════════ */}
      <SkillsMatrix />

      {/* ══════════════════════════════════════════════════════════
          03 // CAREER & EDUCATION TIMELINE
      ══════════════════════════════════════════════════════════ */}
      <ExperienceTimeline />

      {/* ══════════════════════════════════════════════════════════
          PORTAL GATEWAYS: INDEPENDENT WEBSITES CALLOUT
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-6 rounded-3xl cyber-glass border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-black/40 to-purple-950/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left sm:text-center">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                <Compass size={14} />
                <span>EXPAND THE ZYNX ECOSYSTEM</span>
              </div>
              <h3 className="text-2xl sm:text-xl font-display font-bold text-white">
                Explore Independent Digital Realms
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl">
                Joshua's ecosystem is divided into three dedicated spaces: this technical engineering portfolio, an interactive 3D bedroom studio personal sanctuary, and the 7YNX music & gaming community hub.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onNavigateSpace}
                className="px-6 py-3 rounded-2xl cyber-glass border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-400 font-mono text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-cyan-500/10"
              >
                <Monitor size={15} className="text-cyan-400" />
                <span>Enter 3D Bedroom Space</span>
              </button>

              <button
                onClick={onNavigateCommunity}
                className="px-6 py-3 rounded-2xl cyber-glass border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 font-mono text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-purple-500/10"
              >
                <Disc3 size={15} className="text-purple-400" />
                <span>Enter 7YNX Music & Gaming</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          04 // INTERACTIVE CONTACT TRANSMISSION TERMINAL
      ══════════════════════════════════════════════════════════ */}
      <ContactTerminal />

      {/* ══════════════════════════════════════════════════════════
          BLACK HOLE SINGULARITY INSPECTION MODAL
      ══════════════════════════════════════════════════════════ */}
      <BlackHoleModal
        isOpen={isBlackHoleModalOpen}
        onClose={() => setIsBlackHoleModalOpen(false)}
      />
    </div>
  );
};
