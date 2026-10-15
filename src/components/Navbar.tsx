import React, { useState } from "react";
import { Terminal, Monitor, Disc3, FileText, Sparkles, Layers } from "lucide-react";

export type EcosystemView = "portfolio" | "skills" | "space" | "community";

interface NavbarProps {
  currentView: EcosystemView;
  setCurrentView: (view: EcosystemView) => void;
  openResume: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openResume,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const worlds: { id: EcosystemView; label: string; icon: any; color: string; activeBg: string }[] = [
    {
      id: "portfolio",
      label: "Works",
      icon: Terminal,
      color: "text-cyan-400",
      activeBg: "bg-cyan-400 text-black shadow-lg shadow-cyan-400/25",
    },
    {
      id: "skills",
      label: "Arsenal",
      icon: Layers,
      color: "text-emerald-400",
      activeBg: "bg-emerald-400 text-black shadow-lg shadow-emerald-400/25",
    },
    {
      id: "space",
      label: "3D Bedroom",
      icon: Monitor,
      color: "text-purple-400",
      activeBg: "bg-purple-500 text-white shadow-lg shadow-purple-500/25",
    },
    {
      id: "community",
      label: "7YNX Music",
      icon: Disc3,
      color: "text-pink-400",
      activeBg: "bg-pink-500 text-white shadow-lg shadow-pink-500/25",
    },
  ];

  const handleWorldClick = (id: EcosystemView) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    window.location.hash = id === "portfolio" ? "" : id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Brand Identity Pill (Edolus & Overworld Audio minimal style) */}
        <div
          onClick={() => handleWorldClick("portfolio")}
          className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-full backdrop-blur-2xl bg-[#0a0d18]/80 border border-white/10 hover:border-cyan-400/40 cursor-pointer group transition-all duration-300 shadow-xl"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400/60 via-purple-500/40 to-white/20 p-[1px] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
            <div className="w-full h-full bg-[#080911] rounded-full flex items-center justify-center p-0.5">
              <img
                src="/images/z7x-logo.svg"
                alt="Z7X Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xs tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              ZYNX
            </span>
            <span className="text-zinc-600 text-[10px] font-mono">/</span>
            <span className="font-mono text-[10px] text-zinc-400 hidden sm:inline">
              JOSHUA D
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        {/* Center: Floating Capsule Ecosystem Switcher (A24 / Locomotive minimalist pill) */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-2xl bg-[#090c16]/85 border border-white/10 shadow-2xl">
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? `${w.activeBg} font-bold scale-[1.02]`
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={13} className={isActive && (w.id === "portfolio" || w.id === "skills") ? "text-black" : isActive ? "text-white" : w.color} />
                <span>{w.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: ATS Resume Capsule & Mobile Trigger */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={openResume}
            className="px-4 py-2 rounded-full backdrop-blur-2xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/35 hover:border-emerald-400 text-emerald-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105"
          >
            <FileText size={13} className="text-emerald-400" />
            <span>ATS Resume</span>
            <Sparkles size={11} className="text-emerald-400 animate-pulse hidden sm:inline" />
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full backdrop-blur-2xl bg-[#0a0d18]/80 border border-white/10 text-zinc-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 p-3 rounded-2xl backdrop-blur-2xl bg-[#090c16]/95 border border-white/15 shadow-2xl flex flex-col gap-1.5 animate-fadeIn">
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-colors ${
                  isActive
                    ? `${w.activeBg} font-bold`
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Icon size={14} className={isActive && (w.id === "portfolio" || w.id === "skills") ? "text-black" : isActive ? "text-white" : w.color} />
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
