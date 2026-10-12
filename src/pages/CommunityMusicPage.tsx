import React from "react";
import { SoundLab } from "../components/SoundLab";
import { Disc, Radio, MessageSquare, ArrowLeft, Monitor, ExternalLink, Flame, Music, Sliders, Waves, Sparkles, Send } from "lucide-react";

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
            <span>7YNX SOUND LAB & MUSIC PRODUCER REALM</span>
          </span>
        </div>

        <button
          onClick={onNavigateSpace}
          className="px-4 py-1.5 rounded-xl bg-purple-900/40 border border-purple-400/50 hover:border-purple-300 text-xs font-mono text-purple-200 hover:text-white flex items-center gap-2 transition-all shadow-md shadow-purple-900/30"
        >
          <Monitor size={13} className="text-purple-400" />
          <span>3D Bedroom & Sanctuary</span>
        </button>
      </div>

      {/* Hero: Faceless Electronic Music Artist Identity */}
      <div className="relative rounded-3xl p-10 sm:p-6 overflow-hidden cyber-glass border border-pink-500/30 bg-gradient-to-br from-purple-950/40 via-black/80 to-pink-950/30 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-mono">
            <Flame size={12} className="text-pink-400" />
            <span>FACELESS ELECTRONIC MUSIC PRODUCER // 7YNX</span>
          </div>

          <h1 className="text-5xl sm:text-4xl xs:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
            Sound Design, Modular Synthesis & Melodic Techno
          </h1>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            Welcome to the dedicated sound sanctuary of <span className="text-purple-400 font-bold">7YNX</span>. Sculpting heavy sidechain future bounce, deep atmospheric house grooves, and audio-reactive WebGL visualizers.
          </p>

          {/* Streaming & Artist Links */}
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
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Disc size={13} />
              <span>Spotify Artist</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-black/60 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <MessageSquare size={13} />
              <span>Music Discord</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          7YNX CYBER SOUND LAB & FFT AUDIO SPECTRUM ANALYZER
      ══════════════════════════════════════════════════════════ */}
      <SoundLab />

      {/* ══════════════════════════════════════════════════════════
          PRODUCTION TOOLCHAIN & SOUND DESIGN SPECIFICATIONS
      ══════════════════════════════════════════════════════════ */}
      <section className="p-8 sm:p-6 rounded-3xl cyber-glass border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-400/30 flex items-center justify-center text-pink-400">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white">Producer Toolchain & Synthesis Arsenal</h3>
            <p className="text-xs text-zinc-400 font-mono">Digital Audio Workstation & Signal Processing Pipeline</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
          Every track released under 7YNX is mixed, engineered, and mastered in-house using surgical digital audio plugins, analog tape harmonics, and custom wavetable sound synthesis.
        </p>

        <div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-pink-400">
              <Music size={14} />
              <h4 className="font-mono text-xs font-bold uppercase">DAW of Choice</h4>
            </div>
            <p className="text-sm text-zinc-200 font-sans font-semibold">FL Studio 21 Signature</p>
            <p className="text-[11px] text-zinc-500 font-sans">Advanced automation clips, patcher routing, low-latency ASIO drivers.</p>
          </div>

          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Waves size={14} />
              <h4 className="font-mono text-xs font-bold uppercase">Wavetable Synths</h4>
            </div>
            <p className="text-sm text-zinc-200 font-sans font-semibold">Xfer Serum & Vital</p>
            <p className="text-[11px] text-zinc-500 font-sans">Custom wavetables, unison detuning, sub-bass oscillator modulation.</p>
          </div>

          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sliders size={14} />
              <h4 className="font-mono text-xs font-bold uppercase">Dynamics & EQ</h4>
            </div>
            <p className="text-sm text-zinc-200 font-sans font-semibold">FabFilter Pro Bundle & OTT</p>
            <p className="text-[11px] text-zinc-500 font-sans">Multi-band upward compression, surgical linear phase parametric EQing.</p>
          </div>

          <div className="p-4 rounded-xl cyber-glass border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles size={14} />
              <h4 className="font-mono text-xs font-bold uppercase">Color & Tape</h4>
            </div>
            <p className="text-sm text-zinc-200 font-sans font-semibold">Soundtoys & Tape Saturation</p>
            <p className="text-[11px] text-zinc-500 font-sans">Analog warmth, tape flutter, stereo field widening, and plate reverbs.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COLLABORATION & BOOKING TRANSMISSION
      ══════════════════════════════════════════════════════════ */}
      <div className="p-8 sm:p-6 rounded-3xl cyber-glass border border-pink-500/20 bg-gradient-to-r from-purple-950/20 via-black/40 to-pink-950/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left sm:text-center">
          <h3 className="text-2xl font-display font-bold text-white">
            Looking for Custom Beats or Sound Design?
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Available for game soundtrack composition, electronic music remixes, stem mixing, and vocal production. Reach out to collaborate with 7YNX.
          </p>
        </div>

        <a
          href="mailto:joshuawilliam2801@gmail.com?subject=7YNX%20Music%20Collaboration"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25 hover:scale-105 whitespace-nowrap"
        >
          <Send size={14} />
          <span>Contact 7YNX Sound Lab</span>
        </a>
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-8 rounded-3xl cyber-glass border border-white/10 text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-2xl font-display font-bold text-white">
          Explore Other ZYNX Realms
        </h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Switch freely between my music realm, my engineering developer portfolio, and my personal 3D bedroom studio.
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
            Enter 3D Bedroom Sanctuary →
          </button>
        </div>
      </div>
    </div>
  );
};
