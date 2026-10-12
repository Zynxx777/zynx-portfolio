import React from "react";
import { SoundLab } from "../components/SoundLab";
import { AmbientGallery } from "../components/AmbientGallery";
import { Disc, Gamepad2, Radio, MessageSquare, ArrowLeft, Monitor, ExternalLink, Flame } from "lucide-react";

interface CommunityMusicPageProps {
  onNavigatePortfolio: () => void;
  onNavigateSpace: () => void;
}

export const CommunityMusicPage: React.FC<CommunityMusicPageProps> = ({
  onNavigatePortfolio,
  onNavigateSpace,
}) => {
  return (
    <div className="pt-20 pb-24 px-6 max-w-7xl mx-auto space-y-16 animate-fadeIn">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl cyber-glass border border-pink-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigatePortfolio}
            className="px-3.5 py-1.5 rounded-xl cyber-glass border border-white/10 hover:border-cyan-400 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Developer Portfolio</span>
          </button>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-pink-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            <span>7YNX COMMUNITY, MUSIC & GAMING HUB</span>
          </span>
        </div>

        <button
          onClick={onNavigateSpace}
          className="px-4 py-1.5 rounded-xl bg-purple-900/40 border border-purple-400/50 hover:border-purple-300 text-xs font-mono text-purple-200 hover:text-white flex items-center gap-2 transition-all shadow-md shadow-purple-900/30"
        >
          <Monitor size={13} className="text-purple-400" />
          <span>3D Bedroom Space</span>
        </button>
      </div>

      {/* Hero: Faceless Cyber Persona */}
      <div className="relative rounded-3xl p-10 sm:p-6 overflow-hidden cyber-glass border border-pink-500/30 bg-gradient-to-br from-purple-950/40 via-black/80 to-pink-950/30 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-mono">
            <Flame size={12} className="text-pink-400" />
            <span>FACELESS CREATIVE IDENTITY // 7YNX</span>
          </div>

          <h1 className="text-5xl sm:text-4xl xs:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
            Sound Design, Electronic Beats & Gaming Sanctuary
          </h1>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            Welcome to the creative promotion hub for <span className="text-purple-400 font-bold">7YNX</span>. Dedicated to future bounce, melodic techno soundscapes, competitive & retro gaming, and curated 4K/8K aesthetic visuals.
          </p>

          {/* Social Quick Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://soundcloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Radio size={13} />
              <span>SoundCloud</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <MessageSquare size={13} />
              <span>Discord Community</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>

            <a
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Disc size={13} />
              <span>Spotify Artist</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          7YNX CYBER SOUND LAB & FFT AUDIO VISUALIZER
      ══════════════════════════════════════════════════════════ */}
      <SoundLab />

      {/* ══════════════════════════════════════════════════════════
          GAMING & FACELESS STREAMING ZONE
      ══════════════════════════════════════════════════════════ */}
      <section className="p-8 sm:p-6 rounded-3xl cyber-glass border border-white/10 space-y-6">
        <div className="flex items-center gap-2">
          <Gamepad2 size={18} className="text-cyan-400" />
          <h3 className="font-display font-bold text-2xl text-white">Gaming & Battlestation Hub</h3>
        </div>

        <p className="text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
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
          4K/8K VISUAL ART & WALLPAPER SANCTUARY
      ══════════════════════════════════════════════════════════ */}
      <AmbientGallery />

      {/* Footer Navigation Bar */}
      <div className="p-8 rounded-3xl cyber-glass border border-white/10 text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-2xl font-display font-bold text-white">
          Join the 7YNX Movement
        </h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Open for music collaborations, remix opportunities, custom sound design for games, and gaming squad connections.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={onNavigatePortfolio}
            className="px-6 py-2.5 rounded-full cyber-glass border border-white/15 hover:border-cyan-400 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            ← Developer Portfolio
          </button>
          <button
            onClick={onNavigateSpace}
            className="px-6 py-2.5 rounded-full cyber-glass border border-purple-500/40 hover:border-purple-300 text-xs font-mono text-purple-200 hover:text-white transition-colors"
          >
            Enter 3D Bedroom Space →
          </button>
        </div>
      </div>
    </div>
  );
};
