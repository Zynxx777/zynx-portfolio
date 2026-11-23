import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { ArrowRight, Compass, ArrowUpRight, User, Download, Mail, MapPin } from "lucide-react";
import { TapeTicker } from "../components/TapeTicker";
import { SystemsRadar } from "../components/SystemsRadar";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { ContactTerminal } from "../components/ContactTerminal";
import { ProfileDossierDrawer } from "../components/ProfileDossierDrawer";
import { soundFX } from "../utils/audioFX";
import profileData from "../data/profile.json";

const LiquidMercuryCanvas = lazy(() => import("../components/LiquidMercuryCanvas").then((module) => ({ default: module.LiquidMercuryCanvas })));
const Projects3D = lazy(() => import("../components/Projects3D").then((module) => ({ default: module.Projects3D })));
const AnatomyDissectionModal = lazy(() => import("../components/AnatomyDissectionModal").then((module) => ({ default: module.AnatomyDissectionModal })));

const ProjectsPlaceholder: React.FC = () => (
  <div className="flex min-h-[760px] flex-col justify-center border-t border-white/10 px-6 py-16 sm:px-12" role="status">
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Selected work</p>
    <h2 className="mt-3 max-w-4xl text-3xl font-medium tracking-tight text-white sm:text-5xl">Recent projects and practical experience.</h2>
    <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">Loading the interactive project gallery…</p>
  </div>
);

const DeferredProjects3D: React.FC<{ onOpenAnatomy: () => void }> = ({ onOpenAnatomy }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "450px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="projects" ref={sectionRef} className="min-h-[900px] scroll-mt-16">
      {isNearViewport ? (
        <Suspense fallback={<ProjectsPlaceholder />}><Projects3D onOpenAnatomy={onOpenAnatomy} /></Suspense>
      ) : <ProjectsPlaceholder />}
    </div>
  );
};

interface PortfolioPageProps {
  openResume: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
  onNavigateSkills?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Specular Surface Card (Pointer-only sheen via direct DOM update)
// ─────────────────────────────────────────────────────────────────────────────
const InteractiveTiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ("ontouchstart" in window || !cardRef.current || !sheenRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    sheenRef.current.style.opacity = "1";
    sheenRef.current.style.background = `radial-gradient(340px circle at ${x}px ${y}px, rgba(0, 242, 254, 0.12), rgba(168, 85, 247, 0.06) 45%, transparent 75%)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)" }}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={sheenRef}
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-200"
      />
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
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);
  const scrollToSection = (id: string) => {
    soundFX.playClick();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navJumps = [
    { id: "projects", label: "01 Projects", action: () => scrollToSection("projects") },
    { id: "radar", label: "02 Capabilities", action: () => scrollToSection("radar") },
    { id: "timeline", label: "03 Experience", action: () => scrollToSection("timeline") },
    { id: "realms", label: "04 Interactive Spaces", action: () => scrollToSection("realms") },
    { id: "contact", label: "05 Contact", action: () => scrollToSection("contact") },
  ];

  const keyHighlights = [
    {
      kicker: "Systems",
      title: "Arch Linux Workstation",
      detail: "Daily desktop maintenance, pacman configuration, and pactree dependency checks.",
      onClick: () => scrollToSection("radar"),
    },
    {
      kicker: "Web Engineering",
      title: "S.M. School & React UI",
      detail: "Responsive Astro, Tailwind, React, and TypeScript builds shipped across devices.",
      onClick: () => scrollToSection("projects"),
    },
    {
      kicker: "Engineering",
      title: "B.E. ECE Graduate (2025)",
      detail: "DBIT foundation in embedded systems, microcontrollers, and digital logic.",
      onClick: () => scrollToSection("timeline"),
    },
    {
      kicker: "Recognition",
      title: "7chats Bug Bounty",
      detail: "Contest winner recognition for responsible authentication issue reporting.",
      onClick: () => {
        soundFX.playZoom();
        setIsProfileDrawerOpen(true);
      },
    },
  ];

  return (
    <div className="relative">
      {/* Subtle Ambient Accent Orbs */}
      <div className="pointer-events-none absolute top-[24%] -left-32 w-[480px] h-[480px] rounded-full bg-cyan-500/[0.03] blur-[150px] -z-10" />
      <div className="pointer-events-none absolute top-[60%] -right-32 w-[520px] h-[520px] rounded-full bg-purple-500/[0.03] blur-[170px] -z-10" />

      {/* ══════════════════════════════════════════════════════════
          HERO: Focused Executive Introduction
      ══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-[92svh] flex flex-col justify-between pt-24 sm:pt-28 pb-8 px-5 sm:px-12 overflow-hidden">
        {/* Subtle WebGL Background */}
        <Suspense fallback={<div aria-hidden="true" className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-950/15 via-[#07080d] to-purple-950/15" />}>
          <LiquidMercuryCanvas className="z-0 opacity-25 sm:opacity-35 lg:opacity-45" />
        </Suspense>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#07080d]/55 via-[#07080d]/65 to-[#07080d]" />

        {/* Main Hero Content */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto my-auto py-8 sm:py-12">
          <div className="max-w-4xl space-y-6">
            {/* Availability & Location Line */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-[0.14em] uppercase text-zinc-400">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>Available for Work</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <MapPin size={12} className="text-cyan-400" />
                <span>{profileData.basics.location.city}, {profileData.basics.location.country}</span>
              </span>
              <span className="hidden sm:inline text-zinc-700">/</span>
              <span className="text-cyan-300/90">IT Support · Linux Systems · Junior Dev</span>
            </div>

            {/* Primary Identity & Value Proposition */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h1 className="font-display font-medium tracking-[-0.045em] text-white leading-[0.98] text-[clamp(2.75rem,6.5vw,5.25rem)]">
                  Joshua D
                </h1>
                <span className="font-mono text-xs sm:text-sm tracking-[0.24em] text-cyan-300/80 uppercase">
                  / ZYNX
                </span>
              </div>
              <p className="font-display text-xl sm:text-3xl text-zinc-300 font-normal tracking-[-0.025em] leading-snug max-w-3xl">
                Electronics &amp; Communication Engineering graduate focused on{" "}
                <span className="text-white">IT support, Linux workstation administration,</span>{" "}
                and <span className="text-white">practical web engineering.</span>
              </p>
            </div>

            <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
              Daily Arch Linux user experienced in package troubleshooting (<code className="text-zinc-300 font-mono text-xs">pacman</code> / <code className="text-zinc-300 font-mono text-xs">pactree</code>), responsive web development with React, Astro, and Tailwind CSS, and embedded hardware coursework.
            </p>

            {/* Clear Action Hierarchy */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => scrollToSection("projects")}
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold tracking-wider transition-all duration-200 shadow-lg flex items-center gap-2 group"
              >
                <span>View Selected Work</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  openResume();
                }}
                className="px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/12 border border-white/15 hover:border-cyan-400/50 text-white font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-2"
              >
                <Download size={14} className="text-cyan-300" />
                <span>Résumé</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playZoom();
                  setIsProfileDrawerOpen(true);
                }}
                className="px-5 py-3 rounded-full bg-transparent hover:bg-white/[0.05] border border-white/15 hover:border-white/30 text-zinc-300 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-2"
              >
                <User size={14} className="text-zinc-400" />
                <span>Profile Dossier</span>
              </button>

              <button
                onClick={() => scrollToSection("contact")}
                className="px-4 py-3 rounded-full text-zinc-400 hover:text-cyan-300 font-mono text-xs tracking-wider transition-colors flex items-center gap-2"
              >
                <Mail size={14} />
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Structured 4-Column Summary Strip */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-2xl bg-[#090d18]/65 backdrop-blur-xl divide-y sm:divide-y-0 sm:divide-x divide-white/10 overflow-hidden">
            {keyHighlights.map((item) => (
              <button
                type="button"
                key={item.title}
                onClick={item.onClick}
                className="p-5 text-left hover:bg-white/[0.04] transition-colors flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/90">
                    {item.kicker}
                  </span>
                  <ArrowUpRight size={13} className="text-zinc-600 group-hover:text-cyan-300 transition-colors" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-sm text-white group-hover:text-cyan-100 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Section Anchor Bar */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-zinc-400">
          <nav aria-label="Section shortcuts" className="flex flex-wrap items-center gap-2 sm:gap-5">
            {navJumps.map((jump) => (
              <button
                key={jump.id}
                onClick={jump.action}
                className="py-1 text-zinc-400 hover:text-white transition-colors"
              >
                {jump.label}
              </button>
            ))}
          </nav>

          {onNavigateSkills && (
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateSkills();
              }}
              className="hover:text-cyan-300 transition-colors hidden sm:inline-flex items-center gap-1.5 text-zinc-400"
            >
              <span>Full Technical Arsenal</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 01: SELECTED WORK (WebGL Project Ribbon + Full Index)
      ══════════════════════════════════════════════════════════ */}
      <DeferredProjects3D onOpenAnatomy={() => setIsAnatomyOpen(true)} />

      {/* Subtle Single Technical Capabilities Stream */}
      <TapeTicker onTagClick={onNavigateSkills} />

      {/* ══════════════════════════════════════════════════════════
          SECTION 02: CORE CAPABILITIES & EVIDENCE
      ══════════════════════════════════════════════════════════ */}
      <div id="radar">
        <SystemsRadar onNavigateSkills={onNavigateSkills} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 03: EXPERIENCE & EDUCATION
      ══════════════════════════════════════════════════════════ */}
      <div id="timeline">
        <ExperienceTimeline />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 04: INTERACTIVE SPACES (3D Bedroom & Audio Lab)
      ══════════════════════════════════════════════════════════ */}
      <section id="realms" className="py-20 sm:py-24 px-5 sm:px-12 max-w-[1600px] mx-auto border-t border-white/10">
        <div className="mb-10 text-left">
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            <Compass size={14} className="text-cyan-400" />
            <span>04 // INTERACTIVE SPACES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.04em] text-white mt-3">
            Creative <span className="text-white/40">&amp; spatial labs.</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2.5 max-w-xl leading-relaxed">
            Dedicated side environments showcasing Three.js scene engineering, interactive desk hardware, and audio experiments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Portal 1: 3D Bedroom Space */}
          <InteractiveTiltCard
            onClick={() => { soundFX.playClick(); onNavigateSpace(); }}
            className="group h-[300px] sm:h-[340px] rounded-3xl border border-white/15 hover:border-cyan-400/50 shadow-2xl cursor-pointer flex flex-col justify-between p-6 sm:p-8"
          >
            <img
              src="/images/projects/lofi-bedroom.jpg"
              alt="3D Bedroom Space"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/70 to-black/40 group-hover:from-[#07080d]/95 transition-all duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-black/60 border border-cyan-400/35 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                01 // Three.js Spatial Studio
              </span>
              <span className="w-9 h-9 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all">
                <ArrowUpRight size={16} />
              </span>
            </div>

            <div className="relative z-10 space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                3D Bedroom &amp; Interactive Desk
              </h3>
              <p className="text-xs text-zinc-300 font-sans line-clamp-2 max-w-md leading-relaxed">
                Explore the custom Three.js workspace, X-ray hardware breakdown, and rearrangeable spatial studio.
              </p>
              <div className="pt-1.5 flex items-center gap-2 text-xs font-mono text-cyan-300 group-hover:translate-x-1 transition-transform">
                <span>Launch 3D Environment</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </InteractiveTiltCard>

          {/* Portal 2: 7YNX Music & Sound Lab */}
          <InteractiveTiltCard
            onClick={() => { soundFX.playClick(); onNavigateCommunity(); }}
            className="group h-[300px] sm:h-[340px] rounded-3xl border border-white/15 hover:border-purple-400/50 shadow-2xl cursor-pointer flex flex-col justify-between p-6 sm:p-8"
          >
            <img
              src="/images/space/gaming-cyber-room.jpg"
              alt="7YNX Music Space"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/70 to-black/40 group-hover:from-[#07080d]/95 transition-all duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-black/60 border border-purple-400/35 text-[10px] font-mono uppercase tracking-[0.18em] text-purple-300">
                02 // Sound Lab &amp; Audio
              </span>
              <span className="w-9 h-9 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center group-hover:bg-purple-400 group-hover:text-black transition-all">
                <ArrowUpRight size={16} />
              </span>
            </div>

            <div className="relative z-10 space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white">
                7YNX Music &amp; Sound Lab
              </h3>
              <p className="text-xs text-zinc-300 font-sans line-clamp-2 max-w-md leading-relaxed">
                Music production experiments, Web Audio synthesis tools, and original electronic tracks.
              </p>
              <div className="pt-1.5 flex items-center gap-2 text-xs font-mono text-purple-300 group-hover:translate-x-1 transition-transform">
                <span>Open Audio Lab</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </InteractiveTiltCard>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 05: CONTACT
      ══════════════════════════════════════════════════════════ */}
      <div id="contact">
        <ContactTerminal />
      </div>

      {/* Slide-Over Profile Dossier Drawer */}
      <ProfileDossierDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        openResume={openResume}
      />

      {/* Interactive 3D Hardware Anatomy Modal (lazy-loaded on demand) */}
      {isAnatomyOpen && (
        <Suspense fallback={null}>
          <AnatomyDissectionModal
            isOpen={isAnatomyOpen}
            onClose={() => setIsAnatomyOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
