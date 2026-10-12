import React from "react";
import { Room3DStudio } from "../components/Room3DStudio";
import { AmbientGallery } from "../components/AmbientGallery";
import { Monitor, Music, Cpu, ArrowLeft, Disc3, Sparkles, Heart, Gamepad2 } from "lucide-react";

interface BedroomSpacePageProps {
  onNavigatePortfolio: () => void;
  onNavigateCommunity: () => void;
}

export const BedroomSpacePage: React.FC<BedroomSpacePageProps> = ({
  onNavigatePortfolio,
  onNavigateCommunity,
}) => {
  return (
    <div className="pt-20 pb-24 px-6 max-w-7xl mx-auto space-y-16 animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl cyber-glass border border-purple-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigatePortfolio}
            className="px-3.5 py-1.5 rounded-xl cyber-glass border border-white/10 hover:border-cyan-400 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Developer Portfolio</span>
          </button>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-purple-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>PERSONAL 3D BEDROOM & SANCTUARY</span>
          </span>
        </div>

        <button
          onClick={onNavigateCommunity}
          className="px-4 py-1.5 rounded-xl bg-pink-900/40 border border-pink-400/50 hover:border-pink-300 text-xs font-mono text-pink-200 hover:text-white flex items-center gap-2 transition-all shadow-md shadow-pink-900/30"
        >
          <Disc3 size={13} className="text-pink-400" />
          <span>7YNX Music & Sound Lab</span>
        </button>
      </div>

      {/* Hero Narrative Intro */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full cyber-glass border border-purple-400/30 text-purple-300 text-xs font-mono">
          <Sparkles size={12} />
          <span>ZYNX PRIVATE DIGITAL SANCTUARY</span>
        </div>

        <h1 className="text-5xl sm:text-4xl xs:text-3xl font-display font-extrabold text-white tracking-tight">
          Welcome to My 3D Bedroom Space
        </h1>

        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          This is my personal digital sanctuary on the web. An interactive 3D studio bedroom where I experiment with Linux kernel builds, play games, curate aesthetic wallpapers, and relax. Drag to orbit 360°, inspect specific workstation gear, or turn on the procedural lo-fi rain soundscape.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3D BEDROOM VIEWPORT COMPONENT (aengel.io / CGTrader Style)
      ══════════════════════════════════════════════════════════ */}
      <Room3DStudio />

      {/* ══════════════════════════════════════════════════════════
          WORKSTATION & ROOM ASSETS DEEP-DIVE
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 md:grid-cols-1 gap-6">
        {/* Card 1: PC Battlestation */}
        <div className="p-6 rounded-2xl cyber-glass border border-white/10 hover:border-cyan-400/40 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Monitor size={18} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Arch Linux Workstation</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Custom built desktop running Arch Linux with Hyprland Wayland compositor. Tuned for zero-latency kernel diagnostics, Neovim workflows, and Android Automotive system compiling.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-cyan-300 border border-cyan-500/20">Arch Linux</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-cyan-300 border border-cyan-500/20">Wayland</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-cyan-300 border border-cyan-500/20">Dual Screen</span>
          </div>
        </div>

        {/* Card 2: 7YNX Audio Production Rig */}
        <div className="p-6 rounded-2xl cyber-glass border border-white/10 hover:border-purple-400/40 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music size={18} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">7YNX Sound Rig</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            FL Studio 21 power setup equipped with external MIDI keyboard, analog tape saturation emulation, studio near-field monitors, and custom GLSL audio spectrum visualizers.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">FL Studio 21</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">Serum</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-purple-300 border border-purple-500/20">Melodic EDM</span>
          </div>
        </div>

        {/* Card 3: Embedded Hardware Shelf */}
        <div className="p-6 rounded-2xl cyber-glass border border-white/10 hover:border-emerald-400/40 transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu size={18} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Embedded & Hardware Archive</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Arduino development microcontrollers, MCP2515 CAN transceivers, logic analyzers, and ECE engineering notebooks from my time developing the MediVend dispenser and Luxoft CDC.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-emerald-300 border border-emerald-500/20">CAN Bus</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-emerald-300 border border-emerald-500/20">Verilog HDL</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-emerald-300 border border-emerald-500/20">Microcontrollers</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          GAMING & BATTLESTATION HUB
      ══════════════════════════════════════════════════════════ */}
      <section className="p-8 sm:p-6 rounded-3xl cyber-glass border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white">Gaming & Battlestation Hub</h3>
            <p className="text-xs text-zinc-400 font-mono">Arch Linux Performance Rig & Competitive Squad Lobbies</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
          When not writing low-level code or sculpting synth waveforms, Joshua operates as a faceless gamer and competitive enthusiast. Here is the active gaming rig and setup breakdown:
        </p>

        <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <h4 className="font-mono text-xs text-cyan-400 font-bold uppercase">OS & Compositor</h4>
            <p className="text-sm text-zinc-200 font-sans">Arch Linux + Gamescope / Hyprland</p>
            <p className="text-[11px] text-zinc-500 font-sans">Tuned kernel with custom Proton GE patches for maximum FPS and low input latency.</p>
          </div>

          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <h4 className="font-mono text-xs text-purple-400 font-bold uppercase">Audio Monitoring</h4>
            <p className="text-sm text-zinc-200 font-sans">Studio IEMs + Audio Interface</p>
            <p className="text-[11px] text-zinc-500 font-sans">Flat response curve for pinpoint spatial audio cues and lossless FLAC playback.</p>
          </div>

          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <h4 className="font-mono text-xs text-pink-400 font-bold uppercase">Community & Co-op</h4>
            <p className="text-sm text-zinc-200 font-sans">Faceless Voice & Squad Lobbies</p>
            <p className="text-[11px] text-zinc-500 font-sans">Join the Discord server for track listening parties, gaming sessions, and wallpaper drops.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CURATED VISUAL ARTS & 4K/8K WALLPAPERS SANCTUARY
      ══════════════════════════════════════════════════════════ */}
      <AmbientGallery />

      {/* Personal Sanctuary Philosophy Banner */}
      <div className="p-8 rounded-3xl cyber-glass border border-white/10 text-center space-y-4 max-w-3xl mx-auto bg-gradient-to-b from-black/60 to-purple-950/20">
        <Heart size={22} className="text-purple-400 mx-auto animate-pulse" />
        <h3 className="text-2xl font-display font-bold text-white">
          A Space That Feels Like Home
        </h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Inspired by late-night coding sessions, Japanese lo-fi study culture, and the freedom of open-source computing. This digital bedroom represents my true personal identity away from corporate job applications.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={onNavigatePortfolio}
            className="px-6 py-2.5 rounded-full cyber-glass border border-white/15 hover:border-cyan-400 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            ← Return to Developer Portfolio
          </button>
          <button
            onClick={onNavigateCommunity}
            className="px-6 py-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-xs font-mono font-bold text-white transition-colors shadow-lg shadow-pink-600/30"
          >
            Visit 7YNX Sound Lab →
          </button>
        </div>
      </div>
    </div>
  );
};
