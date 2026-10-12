import React from "react";
import { ArrowUp } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/[0.06] bg-[#020205] py-16 px-6 font-mono text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-[11px]">
              X7
            </div>
            <span className="font-display font-bold text-sm text-zinc-200">
              JOSHUA D // ZYNX (7YNX)
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 max-w-sm">
            Architecting next-generation cybernetic web experiences, automotive cockpit software, and electronic music.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <a href="#hero" className="hover:text-cyan-400 transition-colors">Origin</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
          <a href="#3d-studio" className="hover:text-purple-400 transition-colors">3D Studio</a>
          <a href="#sound-lab" className="hover:text-pink-400 transition-colors">Sound Lab</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>

        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-xl cyber-glass border border-white/10 hover:border-cyan-400/50 flex items-center justify-center text-zinc-400 hover:text-cyan-300 transition-all shadow-md group cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-2">
        <p>&copy; 2026 JOSHUA D (ZYNX). All rights reserved.</p>
        <p>Built with React, Vite, Three.js & Tailwind CSS.</p>
      </div>
    </footer>
  );
};
