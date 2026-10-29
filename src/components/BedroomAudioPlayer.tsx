import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Loader2,
  X,
  Disc3,
} from "lucide-react";
import { soundFX } from "../utils/audioFX";
import {
  musicPlayerEngine,
  type PlayerState,
  BEDROOM_PLAYLIST,
} from "../utils/musicPlayerEngine";

interface BedroomAudioPlayerProps {
  onClose?: () => void;
}

export const BedroomAudioPlayer: React.FC<BedroomAudioPlayerProps> = ({ onClose }) => {
  const [playerState, setPlayerState] = useState<PlayerState>(() => musicPlayerEngine.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const smoothedEnergy = useRef<number>(0.15);
  const phaseRef = useRef<number>(0);
  const titleRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to persistent player state
  useEffect(() => {
    return musicPlayerEngine.subscribe(setPlayerState);
  }, []);

  const {
    trackIndex,
    currentTrack,
    isPlaying,
    isBuffering,
    nowPlaying,
    currentPalette,
    beatPulse,
    volume,
  } = playerState;

  const isActive = isPlaying || isBuffering;

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    soundFX.playClick();
    musicPlayerEngine.togglePlay();
  }, []);

  const handleNextTrack = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextTrack();
  }, []);

  const handlePrevTrack = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.prevTrack();
  }, []);

  const handleSelectTrack = useCallback((idx: number) => {
    soundFX.playClick();
    musicPlayerEngine.startTrack(idx, true);
  }, []);

  const handleColorCycle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextPalette();
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    musicPlayerEngine.setVolume(val);
  }, []);

  const handleVolumeMuteToggle = useCallback(() => {
    soundFX.playClick();
    if (volume > 0.01) {
      musicPlayerEngine.setVolume(0);
    } else {
      musicPlayerEngine.setVolume(0.75);
    }
  }, [volume]);

  // Display texts
  const displayTitle = isBuffering
    ? "Tuning Frequency..."
    : nowPlaying || currentTrack.title;
  const displaySub = nowPlaying ? currentTrack.title : currentTrack.artist;

  // ── BUTTERY SMOOTH MULTI-LAYERED WAVY VISUALIZER ────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let running = true;
    let lastTime = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 0 && h > 0) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Dynamic wave layer specifications
    const waves = [
      {
        freq: 0.014,
        speed: 1.6,
        phaseOffset: 0,
        ampMult: 0.55,
        colorStart: "rgba(0, 242, 254, 0.55)",
        colorEnd: "rgba(79, 172, 254, 0.02)",
        stroke: "rgba(0, 242, 254, 0.75)",
        blur: 10,
      },
      {
        freq: 0.019,
        speed: -2.1,
        phaseOffset: 1.8,
        ampMult: 0.75,
        colorStart: "rgba(247, 37, 133, 0.5)",
        colorEnd: "rgba(114, 9, 183, 0.02)",
        stroke: "rgba(247, 37, 133, 0.8)",
        blur: 14,
      },
      {
        freq: 0.025,
        speed: 2.7,
        phaseOffset: 3.4,
        ampMult: 0.88,
        colorStart: "rgba(251, 133, 0, 0.45)",
        colorEnd: "rgba(217, 4, 41, 0.02)",
        stroke: "rgba(255, 183, 3, 0.85)",
        blur: 16,
      },
      {
        freq: 0.032,
        speed: 3.4,
        phaseOffset: 5.1,
        ampMult: 1.0,
        colorStart: "rgba(16, 185, 129, 0.6)",
        colorEnd: "rgba(6, 95, 70, 0.02)",
        stroke: "rgba(52, 211, 153, 0.95)",
        blur: 20,
      },
    ];

    // Floating glowing particles
    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      speed: 0.0003 + Math.random() * 0.0007,
      size: 1.2 + Math.random() * 2.2,
      opacity: 0.2 + Math.random() * 0.7,
      layer: Math.floor(Math.random() * waves.length),
    }));

    const render = (time: number) => {
      if (!running) return;
      animFrameRef.current = requestAnimationFrame(render);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      // Calculate target energy based on playback & track rhythm
      let targetEnergy = 0.12; // calm baseline ambient breathing
      if (isActive) {
        const t = time / 1000;
        const isSynth = currentTrack.badge.includes("SYNTH") || currentTrack.badge.includes("RETRO") || currentTrack.badge.includes("VAPOR");
        const bpm = isSynth ? 124 : 92;
        const beatCycle = (t * (bpm / 60)) % 4;

        const kick = Math.pow(Math.max(0, Math.sin(beatCycle * Math.PI)), 5) * 0.75;
        const snare = Math.pow(Math.max(0, Math.sin((beatCycle - 1) * Math.PI)), 7) * 0.55;
        const rhythm = Math.sin(t * 7.5) * 0.2;
        targetEnergy = Math.min(1.0, 0.25 + kick + snare + rhythm + (beatPulse * 0.4));
      }

      // Smooth buttery lerping
      smoothedEnergy.current += (targetEnergy - smoothedEnergy.current) * (isActive ? 0.09 : 0.05);
      phaseRef.current += dt * (isActive ? 2.4 : 1.0);

      ctx.clearRect(0, 0, w, h);

      const centerY = h * 0.62;
      const maxAmplitude = (h * 0.46) * Math.min(1.2, smoothedEnergy.current * 1.35);

      // Render each wave layer from back to front
      waves.forEach((wave, idx) => {
        const phase = phaseRef.current * wave.speed + wave.phaseOffset;
        const currentAmp = maxAmplitude * wave.ampMult;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h);

        const step = 4;
        for (let x = 0; x <= w + step; x += step) {
          // Organic tapering envelope so wave hugs edges smoothly (Apple iOS Siri waveform style)
          const normX = Math.max(0, Math.min(1, x / w));
          const envelope = Math.pow(Math.sin(normX * Math.PI), 1.25);

          // Combined dual sine harmonic for buttery organic fluid motion
          const primary = Math.sin(x * wave.freq + phase);
          const secondary = Math.cos(x * (wave.freq * 0.55) + phase * 0.7);
          const y = centerY + (primary * 0.7 + secondary * 0.3) * currentAmp * envelope;

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        // Wave Fill Gradient
        const grad = ctx.createLinearGradient(0, centerY - currentAmp, 0, h);
        grad.addColorStop(0, wave.colorStart);
        grad.addColorStop(1, wave.colorEnd);
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = "screen";
        ctx.fill();

        // Wave Crest Glow Line
        ctx.beginPath();
        for (let x = 0; x <= w + step; x += step) {
          const normX = Math.max(0, Math.min(1, x / w));
          const envelope = Math.pow(Math.sin(normX * Math.PI), 1.25);
          const primary = Math.sin(x * wave.freq + phase);
          const secondary = Math.cos(x * (wave.freq * 0.55) + phase * 0.7);
          const y = centerY + (primary * 0.7 + secondary * 0.3) * currentAmp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = wave.stroke;
        ctx.lineWidth = idx === waves.length - 1 ? 2.6 : 1.8;
        ctx.shadowColor = wave.stroke;
        ctx.shadowBlur = wave.blur;
        ctx.stroke();

        ctx.restore();
      });

      // Floating particles riding the active energy field
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => {
        p.x = (p.x + p.speed * (isActive ? 1.8 : 0.6)) % 1;
        const px = p.x * w;
        const normX = p.x;
        const envelope = Math.pow(Math.sin(normX * Math.PI), 1.25);

        const activeWave = waves[p.layer];
        const phase = phaseRef.current * activeWave.speed + activeWave.phaseOffset;
        const primary = Math.sin(px * activeWave.freq + phase);
        const secondary = Math.cos(px * (activeWave.freq * 0.55) + phase * 0.7);
        const py = (centerY + (primary * 0.7 + secondary * 0.3) * maxAmplitude * activeWave.ampMult * envelope) - (p.size * 2);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = activeWave.stroke;
        ctx.shadowColor = activeWave.stroke;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.opacity * (isActive ? 0.9 : 0.35);
        ctx.fill();
      });
      ctx.restore();
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, currentTrack, beatPulse]);

  return (
    <div className="w-[min(94vw,27.5rem)] pointer-events-auto select-none transition-all duration-300">
      {/* ── iPHONE FROSTED GLASS MEDIA CAPSULE ─────────────────────────── */}
      <div
        className="relative flex flex-col rounded-[32px] overflow-hidden backdrop-blur-3xl transition-all duration-500"
        style={{
          background: "linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(18, 20, 32, 0.72) 40%, rgba(8, 10, 18, 0.88) 100%)",
          borderColor: isActive ? currentPalette.border : "rgba(255, 255, 255, 0.16)",
          borderWidth: "1px",
          borderStyle: "solid",
          boxShadow: `
            0 24px 60px -12px rgba(0, 0, 0, 0.75),
            0 0 ${isActive ? 28 + beatPulse * 32 : 12}px ${currentPalette.shadow},
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {/* Subtle Apple-style gloss sheen overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.08] via-transparent to-black/20 rounded-[32px]" />

        {/* ── 1. TOP HEADER: Status Bar & Dynamic Island Badge ─────────── */}
        <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between gap-3">
          {/* Left: FM Radio / Live Broadcast Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-sm">
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-zinc-500"}`} />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-200">
                {currentTrack.type === "stream" ? "98.5 FM LIVE" : "STEREO LAB"}
              </span>
            </div>

            {/* Station Genre Badge */}
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase truncate border max-w-[7.5rem]"
              style={{
                backgroundColor: currentPalette.badgeBg,
                color: currentPalette.badgeText,
                borderColor: currentPalette.border,
              }}
            >
              {currentTrack.badge}
            </span>
          </div>

          {/* Right: Color Cycle Pill & Optional Close Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleColorCycle}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-transform active:scale-90"
              title={`Aura: ${currentPalette.name} (Click to switch)`}
              aria-label="Cycle visualizer theme aura"
            >
              <span
                className="w-3.5 h-3.5 rounded-full shadow-sm transition-all"
                style={{
                  backgroundColor: currentPalette.glow,
                  boxShadow: `0 0 10px ${currentPalette.glow}`,
                }}
              />
            </button>

            {onClose && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-300 hover:text-white transition-transform active:scale-90"
                title="Minimize player"
                aria-label="Close FM Radio"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── 2. BUTTERY SMOOTH WAVY VISUALIZER DISPLAY ────────────────── */}
        <div className="relative z-10 px-4 py-1">
          <div className="relative w-full h-[105px] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner flex items-center justify-center">
            {/* Ambient Background Aura behind the wave */}
            <div
              className="absolute inset-0 opacity-40 blur-xl transition-all duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${currentPalette.glow}55 0%, transparent 75%)`,
              }}
            />

            {/* Live Interactive Wave Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
            />

            {/* Center Subtle Freq Watermark */}
            <div className="absolute top-2 left-3 pointer-events-none text-[9px] font-mono tracking-widest text-white/30 uppercase flex items-center gap-1">
              <Radio size={10} className="text-white/40" />
              <span>AIRWAVE SPECTRUM</span>
            </div>

            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 gap-2 text-amber-300 text-xs font-mono">
                <Loader2 size={16} className="animate-spin" />
                <span>SYNCHRONIZING STREAM</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. TRACK & STATION METADATA ──────────────────────────────── */}
        <div className="relative z-10 px-5 pt-3 pb-1 flex items-center gap-3.5">
          {/* iOS Squircle Album Tile */}
          <div
            className="relative w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border shadow-lg transition-transform duration-300"
            style={{
              borderColor: isActive ? currentPalette.border : "rgba(255, 255, 255, 0.15)",
              background: `linear-gradient(135deg, ${currentPalette.pillBg} 0%, rgba(20, 20, 30, 0.95) 100%)`,
              transform: isActive ? "scale(1.03)" : "scale(0.96)",
            }}
          >
            <Disc3
              size={24}
              className={`transition-all duration-500 ${isActive ? "text-white animate-spin [animation-duration:6s]" : "text-zinc-500"}`}
              style={{
                color: isActive ? currentPalette.glow : undefined,
                filter: isActive ? `drop-shadow(0 0 6px ${currentPalette.glow})` : undefined,
              }}
            />
          </div>

          {/* Track Titles & Live Marquee */}
          <div className="flex-1 min-w-0">
            <div
              ref={titleRef}
              className="font-bold text-[13px] text-white tracking-tight flex items-center gap-1.5 overflow-hidden"
            >
              <span
                className="whitespace-nowrap"
                style={{
                  animation: displayTitle.length > 28 && isActive
                    ? "fm-marquee 12s linear infinite"
                    : "none",
                }}
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5 tracking-normal">
              {displaySub}
            </p>
          </div>
        </div>

        {/* ── 4. iPHONE MEDIA TRANSPORT CONTROLS ───────────────────────── */}
        <div className="relative z-10 px-6 py-2.5 flex items-center justify-center gap-6">
          {/* Previous Station */}
          <button
            onClick={handlePrevTrack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white transition-all active:scale-90 shadow-md backdrop-blur-md"
            title="Previous Radio Station"
            aria-label="Previous track"
          >
            <SkipBack size={16} />
          </button>

          {/* Primary iOS Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="w-13 h-13 p-3.5 rounded-full flex items-center justify-center text-black font-bold transition-all active:scale-95 shadow-xl group"
            style={{
              backgroundColor: isActive ? "#FFFFFF" : currentPalette.glow,
              boxShadow: `0 8px 24px -4px ${isActive ? "rgba(255,255,255,0.4)" : currentPalette.shadow}`,
            }}
            title={isPlaying ? "Pause Broadcast" : "Tune in & Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isBuffering ? (
              <Loader2 size={20} className="animate-spin text-black" />
            ) : isPlaying ? (
              <Pause size={20} className="fill-black text-black" />
            ) : (
              <Play size={20} className="fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next Station */}
          <button
            onClick={handleNextTrack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white transition-all active:scale-90 shadow-md backdrop-blur-md"
            title="Next Radio Station"
            aria-label="Next track"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* ── 5. iPHONE SOUND & VOLUME SLIDER ──────────────────────────── */}
        <div className="relative z-10 px-6 pt-1 pb-2 flex items-center gap-3">
          <button
            onClick={handleVolumeMuteToggle}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title={volume === 0 ? "Unmute" : "Mute"}
            aria-label="Toggle mute"
          >
            {volume === 0 ? (
              <VolumeX size={15} />
            ) : (
              <Volume1 size={15} />
            )}
          </button>

          {/* Custom iOS Frosted Slider Track */}
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 appearance-none bg-white/15 rounded-full outline-none cursor-pointer accent-white transition-all hover:bg-white/25"
              aria-label="Master Radio Volume"
            />
          </div>

          <div className="text-zinc-400 p-1">
            <Volume2 size={15} />
          </div>
        </div>

        {/* ── 6. QUICK STATION PRESETS (Scrollable Chips) ──────────────── */}
        <div className="relative z-10 px-4 pt-1 pb-3.5 border-t border-white/[0.08] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {BEDROOM_PLAYLIST.map((trk, idx) => {
            const isSelected = trackIndex === idx;
            return (
              <button
                key={trk.id}
                onClick={() => handleSelectTrack(idx)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all border ${
                  isSelected
                    ? "bg-white text-black font-bold border-white shadow-md shadow-white/20"
                    : "bg-white/5 hover:bg-white/15 text-zinc-300 border-white/10"
                }`}
                title={`Tune into ${trk.title}`}
              >
                {trk.type === "stream" && <Radio size={9} className="inline mr-1 -mt-0.5" />}
                {trk.type === "procedural" && <Sparkles size={9} className="inline mr-1 -mt-0.5" />}
                <span>{trk.badge.replace("SYNTHWAVE", "NIGHTRIDE").replace("CHILL RETRO", "CHILL")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marquee Keyframes */}
      <style>{`
        @keyframes fm-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-55%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
