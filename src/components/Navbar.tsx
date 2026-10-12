import React, { useState } from "react";
import { Terminal, Music, Cpu, FileText, Send, Sparkles, Image } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openResume: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openResume }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "00 // Origin", icon: Terminal },
    { id: "projects", label: "01 // Projects", icon: Cpu },
    { id: "3d-studio", label: "02 // 3D Studio", icon: Sparkles },
    { id: "sound-lab", label: "03 // Sound Lab", icon: Music },
    { id: "ambient-gallery", label: "04 // Sanctuary", icon: Image },
    { id: "contact", label: "05 // Contact", icon: Send },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-[#030306]/70 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo glyph */}
        <div 
          onClick={() => handleNavClick("hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
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
              <span>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Dock */}
        <nav className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full cyber-glass border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? "text-black font-bold shadow-md shadow-cyan-400/30"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 -z-10" />
                )}
                <Icon size={13} className={isActive ? "text-black" : "text-zinc-500"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openResume}
            className="px-4 py-2 rounded-full border border-white/15 hover:border-cyan-400/60 bg-white/5 hover:bg-cyan-500/10 text-zinc-200 hover:text-cyan-200 font-mono text-xs tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <FileText size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">ATS</span> Resume
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg cyber-glass border border-white/10 text-zinc-400 hover:text-white"
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
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-mono tracking-wider flex items-center gap-3 text-zinc-300 hover:bg-white/10 hover:text-cyan-300"
              >
                <Icon size={14} className="text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
