import React, { useState } from "react";
import { Terminal, Monitor, Disc3, FileText } from "lucide-react";

export type EcosystemView = "portfolio" | "space" | "community";

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

  const worlds: { id: EcosystemView; label: string; icon: any; color: string; activeColor: string }[] = [
    {
      id: "portfolio",
      label: "Developer Portfolio",
      icon: Terminal,
      color: "text-cyan-400",
      activeColor: "from-cyan-400 to-teal-300 text-black",
    },
    {
      id: "space",
      label: "3D Bedroom Space",
      icon: Monitor,
      color: "text-purple-400",
      activeColor: "from-purple-500 to-indigo-400 text-white",
    },
    {
      id: "community",
      label: "7YNX Music & Gaming",
      icon: Disc3,
      color: "text-pink-400",
      activeColor: "from-pink-500 to-purple-600 text-white",
    },
  ];

  const handleWorldClick = (id: EcosystemView) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    window.location.hash = id === "portfolio" ? "" : id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3.5 backdrop-blur-2xl bg-[#030306]/80 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleWorldClick("portfolio")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#09090f] rounded-[11px] flex items-center justify-center font-display font-extrabold text-sm tracking-wider text-cyan-300">
              X7
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-wide text-zinc-100 group-hover:text-cyan-300 transition-colors">
                ZYNX
              </span>
              <span className="text-zinc-600 text-xs font-mono">/</span>
              <span className="font-display font-semibold text-xs text-purple-400">
                7YNX
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ECOSYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Center: Ecosystem Independent Worlds Switcher */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full cyber-glass border border-white/10 shadow-xl">
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? "font-bold shadow-md scale-102"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${w.activeColor} -z-10`}
                  />
                )}
                <Icon size={13} className={isActive ? (w.id === "portfolio" ? "text-black" : "text-white") : w.color} />
                <span className={isActive ? (w.id === "portfolio" ? "text-black" : "text-white") : ""}>
                  {w.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openResume}
            className="px-4 py-2 rounded-full border border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300 hover:text-emerald-100 font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm hover:scale-105"
          >
            <FileText size={13} className="text-emerald-400" />
            <span>ATS Resume</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl cyber-glass border border-white/10 text-zinc-400 hover:text-white"
            aria-label="Toggle navigation"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
          {worlds.map((w) => {
            const Icon = w.icon;
            const isActive = currentView === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWorldClick(w.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-white/15 text-white font-bold border border-white/20"
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Icon size={14} className={w.color} />
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
