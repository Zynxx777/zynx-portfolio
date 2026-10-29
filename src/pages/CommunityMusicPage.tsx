import React, { useState, useRef, useEffect } from "react";
import { SoundLab } from "../components/SoundLab";
import { soundFX } from "../utils/audioFX";
import {
  Flame, Music, Sliders, Waves, Sparkles, Send, Play, Pause, Volume2,
} from "lucide-react";

interface CommunityMusicPageProps {
  onNavigatePortfolio?: () => void;
  onNavigateSpace?: () => void;
}

// ── Moto-Card 3D Perspective Tilt Card Primitive ────────────────────────────
interface MusicCardProps {
  title: string;
  genre: string;
  bpm: string;
  keySig: string;
  year: string;
  img: string;
  desc: string;
  audioSrc: string;
  onPlay: (src: string) => void;
  isPlayingThis: boolean;
}

const MusicReleaseCard: React.FC<MusicCardProps> = ({
  title,
  genre,
  bpm,
  keySig,
  year,
  img,
  desc,
  audioSrc,
  onPlay,
  isPlayingThis,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -11;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 11;
    setRotation({ x: rotX, y: rotY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.28 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 w-full group"
    >
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.12s ease-out, box-shadow 0.3s ease",
        }}
        className={`preserve-3d relative w-full rounded-3xl cyber-glass p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 border ${
          isPlayingThis
            ? "border-pink-500 shadow-pink-500/20 bg-pink-950/20"
            : "border-white/10 hover:border-pink-500/40"
        }`}
      >
        {/* Holographic Specular Glare (moto-card.com style) */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(247, 37, 133, ${glare.opacity}), transparent 65%)`,
          }}
          className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-200 z-30"
        />

        {/* Top Telemetry Bar */}
        <div style={{ transform: "translateZ(30px)" }} className="flex items-center justify-between mb-4 z-20">
          <span className="text-[10px] font-mono tracking-wider px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 flex items-center gap-1.5 shadow-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlayingThis ? "bg-pink-400 animate-ping" : "bg-purple-400"}`} />
            {genre}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{year}</span>
        </div>

        {/* Artwork with 3D Depth */}
        <div
          style={{ transform: "translateZ(45px)" }}
          className="relative h-56 w-full rounded-2xl overflow-hidden my-2 border border-white/10 bg-zinc-950 group-hover:border-pink-400/40 transition-colors z-10"
        >
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Play / Pause Floating Trigger */}
          <button
            type="button"
            aria-label={`${isPlayingThis ? "Pause" : "Play"} ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(audioSrc);
            }}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isPlayingThis
                ? "bg-pink-500 text-white scale-110 shadow-pink-500/50 animate-pulse"
                : "bg-black/80 hover:bg-pink-600 text-white border border-white/20 hover:scale-110"
            }`}
          >
            {isPlayingThis ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>
        </div>

        {/* Content Details */}
        <div style={{ transform: "translateZ(35px)" }} className="mt-4 space-y-2 z-20">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display font-bold text-xl text-white group-hover:text-pink-300 transition-colors">
              {title}
            </h3>
            <span className="text-xs font-mono text-purple-400 font-semibold">{bpm}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">KEY: {keySig}</div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export const CommunityMusicPage: React.FC<CommunityMusicPageProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Lusion-style Interactive Fluid Particle Ripple Canvas in the Hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;
    const isPhoneViewport = window.matchMedia("(max-width: 640px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.25 : 1.5);
    const dpr = pixelRatio();
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; col: string }[] = [];
    const colors = ["#F72585", "#9D4EDD", "#00F2FE", "#7209B7"];

    for (let i = 0; i < (isPhoneViewport ? 32 : 65); i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        col: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const renderFrame = (_time?: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;

      for (let idx = 0; idx < particles.length; idx++) {
        const p = particles[idx];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Only check next 8 neighbors instead of all pairs — O(n) vs O(n²)
        const maxJ = Math.min(idx + 8, particles.length);
        for (let j = idx + 1; j < maxJ; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) { // 100² = 10000
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.col;
            ctx.globalAlpha = (1 - Math.sqrt(distSq) / 100) * 0.15;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (document.hidden) {
        animId = null;
        return;
      }
      renderFrame();
      animId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!prefersReducedMotion && !document.hidden && animId === null) {
        animId = requestAnimationFrame(animate);
      }
    };

    renderFrame();
    startAnimation();

    const handleResize = () => {
      if (!canvas || !ctx) return;
      const newDpr = pixelRatio();
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      ctx.scale(newDpr, newDpr);
      if (prefersReducedMotion) renderFrame();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId !== null) cancelAnimationFrame(animId);
        animId = null;
      } else {
        startAnimation();
      }
    };
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handlePlayRelease = (src: string) => {
    soundFX.playClick();
    if (playingTrack === src) {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      setPlayingTrack(null);
      return;
    }

    setPlayingTrack(src);
    if (!audioElemRef.current) {
      audioElemRef.current = new Audio(src);
    } else {
      audioElemRef.current.src = src;
    }
    audioElemRef.current.play().catch(() => {});
    audioElemRef.current.onended = () => setPlayingTrack(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pb-28 pt-20 animate-fadeIn select-none sm:space-y-20 sm:px-6">
      {/* ── Page Identity Breadcrumb ─────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <span className="text-pink-300 font-semibold tracking-wider uppercase">7YNX SOUND LAB</span>
        <span className="text-zinc-700">//</span>
        <span>AUDIO REALM</span>
      </div>

      {/* ── Hero: Faceless Electronic Music Artist Identity ────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-purple-950/40 via-black/85 to-pink-950/40 p-5 shadow-2xl cyber-glass sm:p-6 lg:p-12">
        {/* Interactive Fluid Particle Background Canvas (Lusion style) */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60 z-0" />

        {/* Ambient glow backdrop */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 min-w-0 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-mono tracking-wider shadow-lg shadow-pink-500/10">
            <Flame size={13} className="text-pink-400" />
            <span>FACELESS ELECTRONIC MUSIC PRODUCER // 7YNX</span>
          </div>

          <h1 className="break-words font-display text-[clamp(2rem,9vw,3.75rem)] font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
            Sound Design, Modular Synthesis & Melodic Techno
          </h1>

          <p className="text-sm sm:text-xs text-zinc-300 font-sans leading-relaxed">
            Welcome to the dedicated sound sanctuary of <span className="text-purple-400 font-bold">7YNX</span>. Sculpting heavy sidechain future bounce, deep atmospheric house grooves, and audio-reactive WebGL visualizers with FL Studio and analog tape saturation.
          </p>

          {/* Jump to the working player rather than generic profile placeholders. */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#sound-lab"
              className="px-5 py-2.5 rounded-xl bg-black/60 hover:bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs font-mono flex items-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              <Waves size={14} />
              <span>Browse the Sound Lab</span>
            </a>

            <button
              onClick={() => {
                soundFX.playSynthNote(523.25);
                setTimeout(() => soundFX.playSynthNote(659.25), 90);
                setTimeout(() => soundFX.playSynthNote(783.99), 180);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono flex items-center gap-2 transition-all shadow-md hover:scale-105"
            >
              <Volume2 size={14} className="text-purple-400" />
              <span>Play Synth Chord</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Featured Discography (moto-card.com 3D Tilt Style) ─────────────── */}
      <section className="space-y-8">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-px bg-pink-400" />
            <span className="text-xs font-mono tracking-widest text-pink-400 uppercase">
              01 // DISCOGRAPHY RELEASES
            </span>
            <span className="w-8 h-px bg-pink-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">Original Tracks & Masters</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Tactile 3D perspective release cards. Click any track to trigger high-fidelity audio playback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MusicReleaseCard
            title="Regardless"
            genre="Future Bounce / EDM"
            bpm="128 BPM"
            keySig="F Minor"
            year="2024"
            img="/images/sound/sound-regardless.jpg"
            desc="Punchy metallic leads with heavy sub-bass compression and dynamic sidechain bounce. Mastered for peak festival sound systems."
            audioSrc="/music/Regardless.mp3"
            onPlay={handlePlayRelease}
            isPlayingThis={playingTrack === "/music/Regardless.mp3"}
          />

          <MusicReleaseCard
            title="Atmospheric Studio Jam"
            genre="Melodic Techno / House"
            bpm="126 BPM"
            keySig="A Minor"
            year="2025"
            img="/images/sound/sound-studiojam.jpg"
            desc="Deep hypnotic modular synth riffs with analog tape saturation, spatial stereo widening, and ambient reverberant decay."
            audioSrc="/music/Joris Voorn - Studio Jam ｜ Melodic Atmospheric Techno House.opus"
            onPlay={handlePlayRelease}
            isPlayingThis={playingTrack === "/music/Joris Voorn - Studio Jam ｜ Melodic Atmospheric Techno House.opus"}
          />
        </div>
      </section>

      {/* ── 7YNX Cyber Sound Lab & Spectrum Analyzer ───────────────────────── */}
      <SoundLab />

      {/* ── Production Toolchain & Synthesis Arsenal ───────────────────────── */}
      <section className="p-6 sm:p-10 rounded-3xl cyber-glass border border-white/10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-950/80 border border-pink-400/30 flex items-center justify-center text-pink-400 shadow-lg">
            <Sliders size={22} />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white">Producer Toolchain & Synthesis Arsenal</h3>
            <p className="text-xs text-zinc-400 font-mono">Digital Audio Workstation & Signal Processing Pipeline</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
          Personal electronic music practice and audio tools sit alongside the technical portfolio. The examples here are creative work, not professional audio-engineering credentials.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl cyber-glass border border-white/5 space-y-2 hover:border-pink-500/30 transition-all">
            <div className="flex items-center gap-2 text-pink-400">
              <Music size={15} />
              <h4 className="font-mono text-xs font-bold uppercase">DAW of Choice</h4>
            </div>
            <p className="text-sm text-zinc-100 font-sans font-semibold">FL Studio</p>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Personal use for arranging, editing, and experimenting with sound.
            </p>
          </div>

          <div className="p-5 rounded-2xl cyber-glass border border-white/5 space-y-2 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-2 text-purple-400">
              <Waves size={15} />
              <h4 className="font-mono text-xs font-bold uppercase">Wavetable Synths</h4>
            </div>
            <p className="text-sm text-zinc-100 font-sans font-semibold">Synths & sound design</p>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Personal exploration of synthesizers and electronic music textures.
            </p>
          </div>

          <div className="p-5 rounded-2xl cyber-glass border border-white/5 space-y-2 hover:border-cyan-400/30 transition-all">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sliders size={15} />
              <h4 className="font-mono text-xs font-bold uppercase">Dynamics & EQ</h4>
            </div>
            <p className="text-sm text-zinc-100 font-sans font-semibold">Mixing and audio effects</p>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Learning and applying basic mixing choices in personal projects.
            </p>
          </div>

          <div className="p-5 rounded-2xl cyber-glass border border-white/5 space-y-2 hover:border-emerald-400/30 transition-all">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles size={15} />
              <h4 className="font-mono text-xs font-bold uppercase">Color & Tape</h4>
            </div>
            <p className="text-sm text-zinc-100 font-sans font-semibold">Creative effects</p>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Exploring effects as part of a personal audio workflow.
            </p>
          </div>
        </div>
      </section>

      {/* ── Collaboration & Booking Transmission ──────────────────────────── */}
      <div className="p-10 sm:p-6 rounded-3xl cyber-glass border border-pink-500/20 bg-gradient-to-r from-purple-950/20 via-black/40 to-pink-950/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left sm:text-center">
          <h3 className="text-2xl font-display font-bold text-white">
            Looking for Custom Beats or Sound Design?
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Available for game soundtrack composition, electronic music remixes, stem mixing, and sound design. Reach out directly to collaborate with 7YNX.
          </p>
        </div>

        <a
          href="mailto:joshuadecedbit@gmail.com?subject=7YNX%20Music%20Collaboration"
          className="px-7 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-pink-500/25 hover:scale-105 whitespace-nowrap"
        >
          <Send size={14} />
          <span>Contact 7YNX Sound Lab</span>
        </a>
      </div>

    </div>
  );
};
