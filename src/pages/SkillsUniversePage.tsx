import React from "react";
import { ArrowLeft, Terminal, Cpu, Shield, Sparkles, Monitor, Disc3 } from "lucide-react";
import { SkillsMatrix } from "../components/SkillsMatrix";
import { soundFX } from "../utils/audioFX";

interface SkillsUniversePageProps {
  onNavigatePortfolio: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

export const SkillsUniversePage: React.FC<SkillsUniversePageProps> = ({
  onNavigatePortfolio,
  onNavigateSpace,
  onNavigateCommunity,
}) => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 select-none relative">
      {/* ── TOP HERO HEADER: ZERO UNIVERSITY HUD ── */}
      <div className="max-w-[1700px] mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#090d18]/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigatePortfolio();
              }}
              className="p-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all group shadow-lg"
              title="Return to Selected Work"
              aria-label="Return to Selected Work"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>WHY.ZERO.UNIVERSITY // STANDALONE ARSENAL TERMINAL</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-medium text-white tracking-tight mt-0.5">
                Technical Arsenal & Hardware Toolchain
              </h1>
            </div>
          </div>

          {/* Quick Ecosystem Portals */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateSpace();
              }}
              className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Monitor size={13} />
              <span>3D Bedroom</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onNavigateCommunity();
              }}
              className="px-4 py-2 rounded-full border border-pink-500/30 bg-pink-950/20 hover:bg-pink-900/30 text-pink-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Disc3 size={13} />
              <span>7YNX Music</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CORE CAPABILITIES TELEMETRY TICKER ── */}
      <div className="max-w-[1700px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
            <Cpu size={14} />
            <span>AUTOMOTIVE CDC</span>
          </div>
          <div className="text-xl font-display font-medium text-white mt-1">CAN 2.0B / AAOS</div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">8,000 frames/sec parsing</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Terminal size={14} />
            <span>OPERATING SYSTEM</span>
          </div>
          <div className="text-xl font-display font-medium text-white mt-1">Arch Linux Zen</div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">procfs & custom modules</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono">
            <Sparkles size={14} />
            <span>GRAPHICS SHADERS</span>
          </div>
          <div className="text-xl font-display font-medium text-white mt-1">WebGL & GLSL</div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">S-curve ribbons & sims</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-mono">
            <Shield size={14} />
            <span>SECURITY RESEARCH</span>
          </div>
          <div className="text-xl font-display font-medium text-white mt-1">7chats Bug Bounty</div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Auth bypass contest winner</div>
        </div>
      </div>

      {/* ── THE INTERACTIVE ZERO UNIVERSITY SKILLS MATRIX ── */}
      <SkillsMatrix />
    </div>
  );
};
