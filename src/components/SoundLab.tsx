import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Disc, Radio, ExternalLink } from "lucide-react";

export const SoundLab: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const tracks = [
    {
      title: "Regardless",
      genre: "Future Bounce / EDM",
      bpm: "128 BPM",
      year: "2024",
      src: "/music/Regardless.mp3",
      artwork: "/images/sound/sound-regardless.jpg",
      description: "Punchy metallic leads with heavy sub-bass compression and dynamic sidechain bounce.",
    },
    {
      title: "Atmospheric Studio Jam",
      genre: "Melodic Techno / House",
      bpm: "126 BPM",
      year: "2025",
      src: "/music/Joris Voorn - Studio Jam ｜ Melodic Atmospheric Techno House.opus",
      artwork: "/images/sound/sound-studiojam.jpg",
      description: "Deep hypnotic modular synth riffs with analog tape saturation and spatial delay.",
    },
  ];

  const currentTrack = tracks[activeTrackIndex];

  // Initialize Web Audio API Analyser on first play
  const initAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn("AudioContext setup:", e);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio play error:", err));
    }
  };

  const selectTrack = (index: number) => {
    setActiveTrackIndex(index);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  // Real-Time Canvas Spectrum Visualizer Loop
  // Optimized: cached gradient, visibility-aware, throttled
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    // Cache gradient — only rebuild on resize
    let cachedGradient: CanvasGradient | null = null;
    let cachedHeight = 0;

    const buildGradient = (height: number) => {
      if (cachedHeight === height && cachedGradient) return cachedGradient;
      cachedGradient = ctx.createLinearGradient(0, height, 0, 0);
      cachedGradient.addColorStop(0, "#00F2FE");
      cachedGradient.addColorStop(0.6, "#9D4EDD");
      cachedGradient.addColorStop(1, "#FF7247");
      cachedHeight = height;
      return cachedGradient;
    };

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);

      // Throttle to ~30fps
      if (time - lastTime < 32) return;
      lastTime = time;

      // Skip when hidden
      if (document.hidden) return;

      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        const t = time * 0.003;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.sin(t + i * 0.3) * 15 + 20;
        }
      }

      const gradient = buildGradient(height);
      ctx.fillStyle = gradient;

      const barWidth = (width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <section id="sound-lab" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={() => selectTrack((activeTrackIndex + 1) % tracks.length)}
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-pink-500"></span>
          <span className="text-xs font-mono tracking-widest text-pink-400 uppercase">
            03 // SONIC ARCHITECTURE
          </span>
          <span className="w-8 h-px bg-pink-500"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          7YNX Sound Lab & Audio Engine
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          A personal music and browser audio project. The visualizer responds to the selected track while it plays.
        </p>
      </div>

      {/* Main Interactive Audio Player Station */}
      <div className="grid grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Interactive Player Deck */}
        <div className="col-span-12 cyber-glass border border-purple-500/30 rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden lg:col-span-7">
          {/* Glowing ambient light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Disc className={`text-purple-400 ${isPlaying ? "animate-spin" : ""}`} size={18} />
              <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                {isPlaying ? "LIVE PLAYBACK" : "STANDBY"}
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500">{currentTrack.bpm}</span>
          </div>

          {/* Track Visualizer Waveform Canvas */}
          <div className="h-32 w-full my-4 rounded-xl bg-black/60 border border-white/5 p-3 flex items-end">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Track Information */}
          <div className="my-4">
            <span className="text-xs font-mono text-cyan-400 block mb-1">{currentTrack.genre}</span>
            <h3 className="font-display font-bold text-2xl text-white mb-2">{currentTrack.title}</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{currentTrack.description}</p>
          </div>

          {/* Controls Bar */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono text-xs font-bold tracking-wider transition-all shadow-lg shadow-purple-600/30 flex items-center gap-3 cursor-pointer hover:scale-105"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "PAUSE AUDIO" : "PLAY DEMO"}</span>
            </button>

            <a
              href="https://zynxx777.github.io/mini-music-player/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>Mini Music Player App</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Right: Discography & Gear Arsenal */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          <div className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-1">
            Track Catalog
          </div>

          {tracks.map((track, idx) => (
            <button
              type="button"
              aria-pressed={activeTrackIndex === idx}
              key={idx}
              onClick={() => selectTrack(idx)}
              className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 text-left ${
                activeTrackIndex === idx
                  ? "bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-900/20"
                  : "cyber-glass border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-zinc-900 border border-white/10">
                <img src={track.artwork} alt="" loading="lazy" className="w-full h-full object-cover" />
                {activeTrackIndex === idx && isPlaying && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Radio size={16} className="text-purple-400 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-zinc-100">{track.title}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">{track.year}</span>
                </div>
                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{track.genre}</p>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{track.description}</p>
              </div>
            </button>
          ))}

          {/* Sound Production Credentials Badge */}
          <div className="mt-4 p-5 rounded-2xl cyber-glass border border-white/10">
            <h4 className="font-display font-bold text-xs text-zinc-200 mb-2 uppercase tracking-wider">
              Personal Audio Workflow
            </h4>
            <div className="space-y-1.5 text-xs text-zinc-400 font-sans">
              <p>• <strong>DAW:</strong> FL Studio (personal use)</p>
              <p>• <strong>Interests:</strong> electronic music and synthesizers</p>
              <p>• <strong>Web audio:</strong> browser player and visualization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
