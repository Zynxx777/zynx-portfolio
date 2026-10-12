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
          HERO WITH FULL-PAGE BLACK HOLE ACCRETION & SLEEK PROFILE PILL
      ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[96vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Full-Page Three.js Relativistic Black Hole Simulation (Interstellar Gargantua Style) */}
        <BlackHoleSimulation className="z-0 opacity-90" />

        {/* Ambient radial lighting glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {/* Hero Content Container (Centered with Full-Page Black Hole Backdrop) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
          
          {/* Status Pill with Small Profile Avatar on Left */}
          <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full cyber-glass border border-cyan-400/40 text-cyan-300 text-xs font-mono tracking-wider shadow-xl shadow-cyan-400/10 hover:border-cyan-400/70 transition-colors">
            <img
              src="/images/profile_avatar.webp"
              alt="Joshua D"
              className="w-5 h-5 rounded-full object-cover border border-cyan-400"
            />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM ONLINE // ARCH LINUX</span>
            <span className="text-zinc-600">//</span>
            <span className="text-purple-300">BLR, INDIA [2026]</span>
          </div>

          {/* Headline Identity with Small Profile Icon on Right & Black Hole Pill */}
          <div className="space-y-3">
            <h2 className="text-zinc-500 text-xs font-mono tracking-widest uppercase">
              {profileData.basics.label}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <h1 className="text-6xl xl:text-5xl sm:text-4xl xs:text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
                JOSHUA D
              </h1>

              {/* Small Profile Icon Badge on Right */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full cyber-glass border border-cyan-400/50 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
                title="Joshua D (ZYNX) Verified Profile"
              >
                <img
                  src="/images/profile_avatar.webp"
                  alt="Joshua D Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                />
                <span className="text-xs font-mono font-bold text-cyan-300">ZYNX</span>
              </div>

              {/* Black Hole Singularity Pill */}
              <button
                onClick={() => setIsBlackHoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full cyber-glass border border-amber-400/50 hover:border-amber-300 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform group"
                title="Inspect Full-Screen Black Hole Singularity"
              >
                <img
                  src="/images/blackhole.jpeg"
                  alt="Black Hole Art"
                  className="w-6 h-6 rounded-full object-cover group-hover:rotate-180 transition-transform duration-700"
                />
                <span className="text-xs font-mono font-bold text-amber-300">BLACK HOLE</span>
                <Orbit size={12} className="text-amber-400 animate-spin" />
              </button>
            </div>
          </div>

          {/* Kinetic Scramble Role Badge */}
          <div className="h-8 flex items-center justify-center">
            <p className="font-mono text-xs sm:text-[11px] tracking-wider text-purple-300 bg-purple-950/50 px-4 py-1.5 rounded-full border border-purple-500/40 transition-all duration-300 shadow-inner">
              ▶ {roles[roleIndex]}
            </p>
          </div>

          {/* Narrative Bio */}
          <p className="max-w-2xl text-sm sm:text-xs text-zinc-300 font-sans leading-relaxed px-4">
            Electronics & Communication Engineering background with deep hands-on expertise in automotive cockpit controllers (CAN / AAOS), custom ROMs, reverse engineering, WebGL GLSL shaders, and electronic music sound design.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#projects"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl shadow-cyan-400/25 flex items-center gap-2 group hover:scale-105"
            >
              <span>Explore 3D Projects</span>
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
              className="px-5 py-3 rounded-full cyber-glass border border-amber-500/40 hover:border-amber-300 text-amber-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:scale-105"
            >
              <Orbit size={14} className="text-amber-400 animate-spin" />
              <span>Full-Screen Black Hole</span>
            </button>

            <button
              onClick={onNavigateSpace}
              className="px-5 py-3 rounded-full cyber-glass border border-white/15 hover:border-cyan-400/50 text-zinc-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Monitor size={14} className="text-cyan-400" />
              <span>3D Bedroom Space</span>
            </button>

            <button
              onClick={onNavigateCommunity}
              className="px-5 py-3 rounded-full cyber-glass border border-purple-500/40 hover:border-purple-300 text-purple-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Disc3 size={14} className="text-purple-400" />
              <span>7YNX Sound Lab</span>
            </button>
          </div>

          {/* Quick Capabilities Highlights Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left pt-4">
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
