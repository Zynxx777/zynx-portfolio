import React from "react";
import { ArrowUp, Mail } from "lucide-react";
import profileData from "../data/profile.json";

interface FooterProps {
  onNavigatePortfolio?: () => void;
  onNavigateSpace?: () => void;
  onNavigateCommunity?: () => void;
  onNavigateSkills?: () => void;
  onNavigateShowcase?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePortfolio,
  onNavigateSpace,
  onNavigateCommunity,
  onNavigateSkills,
  onNavigateShowcase,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/[0.06] bg-[#020205] py-14 px-6 font-mono text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.05]">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/30 p-1 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.25)]">
                <img src="/images/z7x-logo.svg" alt="Z7X" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-sm text-zinc-200">
                ZYNX // JOSHUA D
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 max-w-xs leading-relaxed">
              IT support and Linux interests, ECE background, web projects, and music.
            </p>
            {/* Social quick-links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={profileData.basics.profiles.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href={`mailto:${profileData.basics.email}`}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/40 flex items-center justify-center text-zinc-500 hover:text-cyan-400 transition-all"
                aria-label="Email"
              >
                <Mail size={13} />
              </a>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-[11px]">
            {/* Portfolio section */}
            <div className="space-y-3">
              <div className="text-zinc-400 font-bold uppercase tracking-[0.18em] text-[10px]">Portfolio</div>
              <div className="space-y-2">
                <button
                  onClick={() => { onNavigatePortfolio?.(); scrollToSection("hero"); }}
                  className="block hover:text-cyan-400 transition-colors text-left"
                >
                  Origin
                </button>
                <button
                  onClick={() => { onNavigatePortfolio?.(); scrollToSection("projects"); }}
                  className="block hover:text-cyan-400 transition-colors text-left"
                >
                  Projects
                </button>
                <button
                  onClick={() => onNavigateShowcase?.()}
                  className="block hover:text-amber-300 transition-colors text-left"
                >
                  Showcase index
                </button>
                <button
                  onClick={() => { onNavigatePortfolio?.(); scrollToSection("timeline"); }}
                  className="block hover:text-cyan-400 transition-colors text-left"
                >
                  Experience
                </button>
                <button
                  onClick={() => { onNavigatePortfolio?.(); scrollToSection("contact"); }}
                  className="block hover:text-cyan-400 transition-colors text-left"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* Worlds section */}
            <div className="space-y-3">
              <div className="text-zinc-400 font-bold uppercase tracking-[0.18em] text-[10px]">Worlds</div>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigateSkills?.()}
                  className="block hover:text-emerald-400 transition-colors text-left"
                >
                  Skills
                </button>
                <button
                  onClick={() => onNavigateSpace?.()}
                  className="block hover:text-purple-400 transition-colors text-left"
                >
                  3D Bedroom
                </button>
                <button
                  onClick={() => onNavigateCommunity?.()}
                  className="block hover:text-pink-400 transition-colors text-left"
                >
                  7YNX Music
                </button>
              </div>
            </div>

            {/* Music section */}
            <div className="space-y-3">
              <div className="text-zinc-400 font-bold uppercase tracking-[0.18em] text-[10px]">Sound</div>
              <div className="space-y-2">
                <button onClick={() => onNavigateCommunity?.()} className="block text-left hover:text-pink-400 transition-colors">7YNX Music</button>
                <a href={profileData.basics.profiles.youtube} target="_blank" rel="noopener noreferrer" className="block hover:text-red-400 transition-colors">YouTube</a>
              </div>
            </div>

            {/* Connect section */}
            <div className="space-y-3">
              <div className="text-zinc-400 font-bold uppercase tracking-[0.18em] text-[10px]">Connect</div>
              <div className="space-y-2">
                <a href={profileData.basics.profiles.github} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">GitHub</a>
                <a href={profileData.basics.profiles.linkedin} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400 transition-colors">LinkedIn</a>
                <a href={profileData.basics.profiles.instagram} target="_blank" rel="noopener noreferrer" className="block hover:text-pink-400 transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-700 gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span>© 2026 ZYNX (Joshua D). All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <span className="hidden sm:inline">Built with React, Vite, Three.js &amp; Tailwind CSS.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-xl border border-white/10 hover:border-cyan-400/50 flex items-center justify-center text-zinc-500 hover:text-cyan-300 transition-all shadow-md group cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp size={15} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};
