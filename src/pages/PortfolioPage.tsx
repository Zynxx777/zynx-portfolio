import React from "react";
import { ArrowRight, Sparkles, Terminal, FileText, Cpu, Compass, Disc3, Shield, Monitor } from "lucide-react";
import { BlackHoleSimulation } from "../components/BlackHoleSimulation";
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
  const roles = [
    "ELECTRONICS & COMMUNICATION ENGINEER",
    "AUTOMOTIVE COCKPIT & AAOS DEVELOPER",
    "LINUX & EMBEDDED SYSTEMS SPECIALIST",
    "CREATIVE WEBGL & 3D DEVELOPER",
    "BUG BOUNTY WINNER (7CHATS)"
  ];
  const [roleIndex, setRoleIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [roles.length]);

  return (
    <div className="space-y-12">
      {/* ══════════════════════════════════════════════════════════
          HERO WITH INTERACTIVE BLACK HOLE GRAVITATIONAL ACCRETION
      ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Three.js Interactive Relativistic Black Hole Simulation */}
        <BlackHoleSimulation className="z-0 opacity-85" />

        {/* Ambient radial lighting */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* ChainGPT-style Telemetry Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full cyber-glass border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider mb-8 shadow-lg shadow-cyan-400/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM ONLINE // ARCH LINUX // AUTOMOTIVE COCKPIT & EMBEDDED [2026]</span>
          </div>

          {/* Headline Identity */}
          <div className="space-y-2 mb-6">
            <h2 className="text-zinc-500 text-sm font-mono tracking-widest uppercase">
              {profileData.basics.label}
            </h2>
            <h1 className="text-6xl sm:text-5xl xs:text-4xl font-display font-extrabold tracking-tight text-white leading-none">
              JOSHUA D{" "}
              <span className="gradient-text-cyan inline-block">
                // ZYNX
              </span>
            </h1>
          </div>

          {/* Kinetic Scramble Role Carousel */}
          <div className="h-8 flex items-center justify-center mb-8">
            <p className="font-mono text-xs sm:text-[11px] tracking-wider text-purple-300 bg-purple-950/40 px-4 py-1.5 rounded-full border border-purple-500/30 transition-all duration-300">
              ▶ {roles[roleIndex]}
            </p>
          </div>

          {/* Narrative Bio */}
          <p className="max-w-2xl text-sm sm:text-xs text-zinc-300 font-sans leading-relaxed mb-10 px-4">
            Electronics & Communication Engineering background with deep hands-on expertise in automotive cockpit controllers (CAN / AAOS), custom ROMs, reverse engineering, WebGL GLSL shaders, and electronic music sound design.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <a
              href="#projects"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl shadow-cyan-400/25 flex items-center gap-2 group hover:scale-105"
            >
              <span>Explore 3D Projects</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={openResume}
              className="px-6 py-3 rounded-full cyber-glass border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-emerald-100 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-105"
            >
              <FileText size={14} className="text-emerald-400" />
              <span>Interactive ATS Resume</span>
            </button>

            <button
              onClick={onNavigateSpace}
              className="px-6 py-3 rounded-full cyber-glass border border-white/15 hover:border-cyan-400/50 text-zinc-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Monitor size={14} className="text-cyan-400" />
              <span>3D Bedroom Space</span>
            </button>

            <button
              onClick={onNavigateCommunity}
              className="px-6 py-3 rounded-full cyber-glass border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-purple-100 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-600/10 hover:scale-105"
            >
              <Disc3 size={14} className="text-purple-400" />
              <span>7YNX Music & Gaming</span>
            </button>
          </div>

          {/* Quick Capabilities Highlights Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-3 w-full max-w-3xl text-left">
            <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-cyan-400/30 transition-colors">
              <Cpu size={16} className="text-cyan-400 mb-1.5" />
              <h4 className="font-display font-bold text-xs text-zinc-200">Embedded & AAOS</h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">CAN Bus, VLSI, Cockpit CDC</p>
            </div>

            <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-emerald-400/30 transition-colors">
              <Terminal size={16} className="text-emerald-400 mb-1.5" />
              <h4 className="font-display font-bold text-xs text-zinc-200">Linux & Kernel</h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Arch Linux, AOSP, Root, Shell</p>
            </div>

            <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-purple-400/30 transition-colors">
              <Sparkles size={16} className="text-purple-400 mb-1.5" />
              <h4 className="font-display font-bold text-xs text-zinc-200">WebGL & Creative</h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Three.js, GLSL, Shaders</p>
            </div>

            <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-pink-400/30 transition-colors">
              <Shield size={16} className="text-pink-400 mb-1.5" />
              <h4 className="font-display font-bold text-xs text-zinc-200">Security & Bug Bounty</h4>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">7chats Winner, PenTesting</p>
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
    </div>
  );
};
