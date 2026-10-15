import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Terminal, FileText, Cpu, Compass, Disc3, Shield, Monitor, Orbit, ArrowUpRight, Sparkles, User } from "lucide-react";
import { BlackHoleSimulation } from "../components/BlackHoleSimulation";
import { BlackHoleModal } from "../components/BlackHoleModal";
import { Projects3D } from "../components/Projects3D";
import { TapeTicker } from "../components/TapeTicker";
import { SystemsRadar } from "../components/SystemsRadar";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { ContactTerminal } from "../components/ContactTerminal";
import { ProfileDossierDrawer } from "../components/ProfileDossierDrawer";
import { soundFX } from "../utils/audioFX";
import profileData from "../data/profile.json";

interface PortfolioPageProps {
  openResume: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
  onNavigateSkills?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive 3D Perspective Tilt & Specular Card
// Features: Real-time 3D tilt tracking cursor position, specular gloss reflection
// ─────────────────────────────────────────────────────────────────────────────
const InteractiveTiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("");
  const [sheen, setSheen] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setSheen({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setSheen(prev => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)" }}
      className={`relative overflow-hidden ${className}`}
    >
      {sheen.active && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-200"
          style={{
            background: `radial-gradient(320px circle at ${sheen.x}px ${sheen.y}px, rgba(0, 242, 254, 0.12), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  openResume,
  onNavigateSpace,
  onNavigateCommunity,
  onNavigateSkills,
}) => {
  const [isBlackHoleModalOpen, setIsBlackHoleModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  const roles = [
    "ELECTRONICS & COMMUNICATION ENGINEER",
    "AUTOMOTIVE COCKPIT & AAOS SPECIALIST",
    "LINUX KERNEL & EMBEDDED ARCHITECT",
    "CREATIVE WEBGL & SHADER DEVELOPER",
    "7CHATS BUG BOUNTY WINNER"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [roles.length]);

  const scrollToSection = (id: string) => {
    soundFX.playClick();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navJumps = [
    { id: "projects", label: "01 // WORK (TAPE)", action: () => scrollToSection("projects") },
    { id: "tape-stream", label: "02 // TELEMETRY TAPE", action: () => scrollToSection("tape-stream") },
    { id: "radar", label: "03 // RADAR", action: () => scrollToSection("radar") },
    { id: "timeline", label: "04 // TIMELINE", action: () => scrollToSection("timeline") },
    { id: "realms", label: "05 // 3D SANCTUARY", action: onNavigateSpace },
    { id: "contact", label: "06 // TRANSMISSION", action: () => scrollToSection("contact") },
  ];

  return (
    <div className="relative space-y-24 select-none">
      {/* ══════════════════════════════════════════════════════════
          ACT I: THE SINGULARITY (Hero Scene with Gargantua Black Hole)
      ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[96svh] flex flex-col justify-between pt-24 pb-10 px-6 overflow-hidden">
        {/* Full-Page Relativistic Black Hole Simulation (Interstellar Accretion Disk) */}
        <BlackHoleSimulation className="z-0 opacity-85" />

        {/* Jesper Landberg 4-Corner Top Header HUD */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Top-Left Telemetry Capsule */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full backdrop-blur-2xl bg-[#090d18]/80 border border-white/15 text-[10px] sm:text-xs font-mono tracking-[0.16em] text-zinc-300 shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>BENGALURU, INDIA</span>
            <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">/</span>
            <span className="text-cyan-300 hidden sm:inline">EMBEDDED · AAOS · WEBGL</span>
          </div>

          {/* Top-Right Jesper Landberg Profile Dossier Trigger */}
          <button
            onClick={() => {
              soundFX.playZoom();
              setIsProfileDrawerOpen(true);
            }}
            className="group px-4 py-1.5 rounded-full backdrop-blur-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-cyan-400/50 text-xs font-mono tracking-wider text-zinc-200 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-xl hover:scale-105"
          >
            <User size={13} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>PROFILE & DOSSIER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* Hero Content Centerpiece */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-7 my-auto py-8">
          
          {/* Bold Masthead Display Typography (Jesper Landberg & Locomotive style) */}
          <div className="space-y-3">
            <h2 className="text-zinc-500 text-xs font-mono tracking-[0.32em] uppercase">
              {profileData.basics.label}
            </h2>

            <h1 className="font-display font-medium tracking-[-0.065em] text-white leading-[0.9] text-[clamp(4.5rem,14vw,9.5rem)]">
              ZYNX
            </h1>
            
            <p className="font-mono text-sm sm:text-base tracking-[0.35em] text-cyan-300">
              <span className="text-zinc-600">//</span> JOSHUA D
            </p>
          </div>

          {/* Cycling Roles Rotator */}
          <div className="min-h-7 flex items-center justify-center">
            <p className="font-mono text-[11px] sm:text-xs tracking-[0.16em] text-purple-200/90 animate-fadeIn">
              {roles[roleIndex]}
            </p>
          </div>

          <p className="max-w-2xl text-sm sm:text-base text-zinc-300 font-sans leading-relaxed px-4">
            Hey, I'm <span className="text-white font-medium">ZYNX</span> (Joshua D)—I engineer software close to the hardware—from automotive cockpit domain controllers (CAN bus, AAOS) and Linux kernel diagnostics to creative WebGL shaders and electronic music.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => scrollToSection("projects")}
              className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl flex items-center gap-2 group hover:scale-[1.03]"
            >
              <span>Explore Selected Work</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFX.playZoom();
                setIsProfileDrawerOpen(true);
              }}
              className="px-5 py-3 rounded-full backdrop-blur-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/35 text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-[1.03]"
            >
              <FileText size={14} className="text-cyan-300" />
              <span>View Dossier</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); setIsBlackHoleModalOpen(true); }}
              className="px-5 py-3 rounded-full backdrop-blur-2xl bg-amber-950/25 hover:bg-amber-900/35 border border-amber-400/35 hover:border-amber-300 text-amber-200 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 hover:scale-[1.03]"
            >
              <Orbit size={14} className="text-amber-300" />
              <span>Singularity Study</span>
            </button>
          </div>

          {/* Direct Ecosystem Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-mono pt-1 text-zinc-400">
            <button
              onClick={() => { soundFX.playClick(); onNavigateSpace(); }}
              className="inline-flex items-center gap-2 hover:text-cyan-300 transition-colors"
            >
              <Monitor size={14} className="text-cyan-400" />
              <span>Enter 3D Bedroom Sanctuary</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); onNavigateCommunity(); }}
              className="inline-flex items-center gap-2 hover:text-purple-300 transition-colors"
            >
              <Disc3 size={14} className="text-purple-400" />
              <span>Listen to 7YNX Music</span>
            </button>
          </div>

          {/* High-Impact Capabilities Cards with 3D Tilt & Specular Sheen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-left pt-2">
            <InteractiveTiltCard
              onClick={() => scrollToSection("projects")}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 shadow-lg cursor-pointer"
            >
              <Cpu size={16} className="text-cyan-400 mb-2" />
              <h4 className="font-display font-medium text-xs text-white">AAOS Cockpit</h4>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">CAN Bus & Luxoft CDC</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard
              onClick={() => scrollToSection("radar")}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 shadow-lg cursor-pointer"
            >
              <Terminal size={16} className="text-emerald-400 mb-2" />
              <h4 className="font-display font-medium text-xs text-white">Arch Linux</h4>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">Kernel & procfs Tracing</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard
              onClick={() => scrollToSection("projects")}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 shadow-lg cursor-pointer"
            >
              <Sparkles size={16} className="text-purple-400 mb-2" />
              <h4 className="font-display font-medium text-xs text-white">WebGL & GLSL</h4>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">8,000 Particle Sims</p>
            </InteractiveTiltCard>

            <InteractiveTiltCard
              onClick={() => {
                soundFX.playZoom();
                setIsProfileDrawerOpen(true);
              }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-pink-400/40 shadow-lg cursor-pointer"
            >
              <Shield size={16} className="text-pink-400 mb-2" />
              <h4 className="font-display font-medium text-xs text-white">Bug Bounty</h4>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">7chats Winner</p>
            </InteractiveTiltCard>
          </div>

        </div>

        {/* Jesper Landberg Bottom Minimal Navigation Jump HUD */}
        <div className="relative z-10 w-full max-w-[1700px] mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-zinc-400">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {navJumps.map((jump) => (
              <button
                key={jump.id}
                onClick={jump.action}
                className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 hover:text-white transition-all duration-200"
              >
                {jump.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            {onNavigateSkills && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateSkills();
                }}
                className="hover:text-cyan-300 transition-colors hidden md:inline"
              >
                OPEN FULL ARSENAL TERMINAL →
              </button>
            )}
            <span>DRAG & SCROLL INTERACTIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ACT II: THE WEBGL PROJECT RIBBON (Jesper Landberg Architecture)
      ══════════════════════════════════════════════════════════ */}
      <Projects3D />

      {/* ══════════════════════════════════════════════════════════
          ACT III: KINETIC TAPE SCROLLING & BRIEF ARSENAL STRIP
          (Jesper Landberg Tape Scrolling & Minimal Gateway)
      ══════════════════════════════════════════════════════════ */}
      <div id="tape-stream" className="space-y-6 pt-4">
        {/* Kinetic Tape Scrolling Ticker (Jesper Landberg Style) */}
        <TapeTicker onTagClick={onNavigateSkills} />

        {/* Brief, High-End Technical Arsenal Capsule (Zero Bloat) */}
        <div className="px-6 sm:px-12 max-w-[1700px] mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090d18]/80 border border-white/10 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>TECHNICAL ARSENAL // 38 PRODUCTION PROTOCOLS</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
                Hardware Protocols, Custom Kernels & Creative Shaders
              </h3>
              <p className="text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
                Arch Linux Zen kernel, AAOS Vehicle HAL, CAN 2.0B bus (8,000 frames/sec), Three.js GLSL physics, and 7chats bug bounty authentication research.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateSkills && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onNavigateSkills();
                  }}
                  className="px-6 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 hover:scale-105 flex-shrink-0"
                >
                  <span>Launch Full 38-Skill Terminal</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Second Reverse Infinite Tape */}
        <TapeTicker onTagClick={onNavigateSkills} className="opacity-70" />
      </div>

      {/* ══════════════════════════════════════════════════════════
          ACT IV: SYSTEMS RADAR & ENGINEERING TELEMETRY CONSOLE
      ══════════════════════════════════════════════════════════ */}
      <div id="radar">
        <SystemsRadar />
      </div>

      {/* ══════════════════════════════════════════════════════════
          ACT V: CAREER & MILESTONES (Minimalist Editorial Stream)
      ══════════════════════════════════════════════════════════ */}
      <div id="timeline">
        <ExperienceTimeline />
      </div>

      {/* ══════════════════════════════════════════════════════════
          ACT VI: DIMENSIONAL PORTALS (Sanctuary & Sound Lab Gateways)
          (Without altering the 3D Bedroom Sanctuary itself)
      ══════════════════════════════════════════════════════════ */}
      <section id="realms" className="py-20 px-6 sm:px-12 max-w-[1700px] mx-auto border-t border-white/10">
        <div className="mb-10 text-left">
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">
            <Compass size={14} className="text-cyan-400" />
            <span>05 // INDEPENDENT ECOSYSTEM REALMS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
            Step Beyond the Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-xl">
            Explore <span className="text-white font-medium">ZYNX</span>'s (Joshua D) private creative sanctuaries: an interactive 3D digital bedroom studio, and the 7YNX electronic music playground.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Portal 1: 3D Bedroom Space Sanctuary */}
          <InteractiveTiltCard
            onClick={() => { soundFX.playClick(); onNavigateSpace(); }}
            className="group h-[380px] sm:h-[440px] rounded-3xl border border-cyan-400/25 hover:border-cyan-300 shadow-2xl cursor-pointer flex flex-col justify-between p-8"
          >
            <img
              src="/images/projects/lofi-bedroom.jpg"
              alt="3D Bedroom Space"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/60 to-black/30 group-hover:from-[#07080d]/90 transition-all duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-black/60 border border-cyan-400/40 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                01 // 3D SANCTUARY
              </span>
              <span className="w-10 h-10 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all">
                <ArrowUpRight size={18} />
              </span>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300">
                Personal Digital Home & Three.js Studio
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                Enter the 3D Bedroom Space
              </h3>
              <p className="text-xs text-zinc-300 font-sans line-clamp-2 max-w-md">
                Interactive 3D Three.js room with procedural lo-fi rain soundscapes, re-arrangeable furniture, and studio reference audio gear.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-cyan-300 group-hover:translate-x-1 transition-transform">
                <span>Launch 3D Room Experience</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </InteractiveTiltCard>

          {/* Portal 2: 7YNX Music & Gaming Space */}
          <InteractiveTiltCard
            onClick={() => { soundFX.playClick(); onNavigateCommunity(); }}
            className="group h-[380px] sm:h-[440px] rounded-3xl border border-purple-500/25 hover:border-purple-400 shadow-2xl cursor-pointer flex flex-col justify-between p-8"
          >
            <img
              src="/images/space/gaming-cyber-room.jpg"
              alt="7YNX Music Space"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/60 to-black/30 group-hover:from-[#07080d]/90 transition-all duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-black/60 border border-purple-400/40 text-[10px] font-mono uppercase tracking-[0.18em] text-purple-300">
                02 // AUDIO & GAMING
              </span>
              <span className="w-10 h-10 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center group-hover:bg-purple-400 group-hover:text-black transition-all">
                <ArrowUpRight size={18} />
              </span>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-300">
                7YNX Melodic EDM & Sound Lab
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                Enter 7YNX Music & Sound Lab
              </h3>
              <p className="text-xs text-zinc-300 font-sans line-clamp-2 max-w-md">
                Electronic music tracks, FL Studio productions, Serum sound design, and custom GLSL smoke & frequency spectrum visualizers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-purple-300 group-hover:translate-x-1 transition-transform">
                <span>Listen to 7YNX Tracks</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </InteractiveTiltCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ACT VII: TRANSMISSION TERMINAL (Contact)
      ══════════════════════════════════════════════════════════ */}
      <div id="contact">
        <ContactTerminal />
      </div>

      {/* Black Hole Singularity Inspector Modal */}
      <BlackHoleModal
        isOpen={isBlackHoleModalOpen}
        onClose={() => setIsBlackHoleModalOpen(false)}
      />

      {/* Jesper Landberg Slide-Over Profile Dossier Drawer */}
      <ProfileDossierDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        openResume={openResume}
      />
    </div>
  );
};
