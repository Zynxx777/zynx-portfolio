import React, { useState, useEffect, useRef } from "react";
import { Terminal, Monitor, Disc3, FileText, Sparkles, Layers, FolderOpen } from "lucide-react";

export type EcosystemView = "portfolio" | "skills" | "space" | "community" | "showcase";

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
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const worlds: { id: EcosystemView; label: string; icon: React.ElementType; color: string; activeBg: string }[] = [
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
      id: "showcase",
      label: "Showcase",
      icon: FolderOpen,
      color: "text-amber-300",
      activeBg: "bg-amber-200 text-black shadow-lg shadow-amber-200/20",
    },
    {
      id: "space",
      label: "3D Desk",
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
    <header ref={drawerRef} className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none sm:px-8">
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between">
        {/* Left: Brand Identity Pill */}
        <div
          onClick={() => handleWorldClick("portfolio")}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full backdrop-blur-2xl bg-[#0a0d18]/80 border border-white/10 hover:border-cyan-400/40 cursor-pointer group transition-all duration-300 shadow-xl"
          role="button"
          tabIndex={0}
          aria-label="Go to portfolio home"
          onKeyDown={(e) => e.key === "Enter" && handleWorldClick("portfolio")}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400/60 via-purple-500/40 to-white/20 p-[1px] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_12px_rgba(34,211,238,0.35)] flex-shrink-0">
            <div className="w-full h-full bg-[#080911] rounded-full flex items-center justify-center p-0.5">
              <img
                src="/images/z7x-logo.svg"
                alt="Z7X Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-display font-bold text-xs tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              ZYNX
            </span>
            <span className="text-zinc-600 text-[10px] font-mono hidden sm:inline">/</span>
            <span className="font-mono text-[10px] text-zinc-400 hidden sm:inline truncate">
              JOSHUA D
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>

        {/* Center: Floating Capsule Ecosystem Switcher */}
        <nav
          className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#090c16]/85 p-1 shadow-2xl backdrop-blur-2xl lg:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 ${isActive
                  ? `${w.activeBg} font-bold scale-[1.02]`
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon
                  size={13}
                  className={
                    isActive && (w.id === "portfolio" || w.id === "skills")
                      ? "text-black"
                      : isActive
                        ? "text-white"
                        : w.color
                  }
                />
                <span>{w.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: ATS Resume Capsule & Mobile Trigger */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={openResume}
            className="px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-2xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/35 hover:border-emerald-400 text-emerald-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-1.5 sm:gap-2 shadow-lg hover:scale-105"
            aria-label="Open ATS Resume"
          >
            <FileText size={13} className="text-emerald-400" />
            <span>Resume</span>
            <Sparkles size={11} className="text-emerald-400 animate-pulse hidden sm:inline" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full backdrop-blur-2xl bg-[#0a0d18]/80 border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 transition-all"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span
                className={`h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[6px]" : ""
                  }`}
              />
              <span
                className={`h-0.5 w-full bg-current rounded-full transition-all duration-200 ${mobileMenuOpen ? "opacity-0 scale-x-0" : ""
                  }`}
              />
              <span
                className={`h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                  }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer — slides down under the header bar */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-2 mx-4 p-2 rounded-2xl backdrop-blur-2xl bg-[#090c16]/96 border border-white/15 shadow-2xl flex flex-col gap-1 animate-slideUp">
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-colors ${isActive
                  ? `${w.activeBg} font-bold`
                  : "text-zinc-300 hover:bg-white/8 hover:text-white"
                  }`}
              >
                <Icon
                  size={15}
                  className={
                    isActive && (w.id === "portfolio" || w.id === "skills")
                      ? "text-black"
                      : isActive
                        ? "text-white"
                        : w.color
                  }
                />
                <span>{w.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                )}
              </button>
            );
          })}
          <div className="border-t border-white/10 mt-1 pt-2 px-1">
            <button
              onClick={() => { openResume(); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-3 text-emerald-300 hover:bg-emerald-950/30 hover:text-emerald-200 transition-colors"
            >
              <FileText size={15} className="text-emerald-400" />
              <span>ATS Resume &amp; CV</span>
              <Sparkles size={11} className="ml-auto text-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
