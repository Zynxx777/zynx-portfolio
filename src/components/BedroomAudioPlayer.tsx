import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Radio, Sparkles, Disc, Loader2 } from "lucide-react";
import { soundFX } from "../utils/audioFX";
import {
  musicPlayerEngine,
  type PlayerState,
} from "../utils/musicPlayerEngine";

export const BedroomAudioPlayer: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(() => musicPlayerEngine.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // FIFO Buffer: 36 spectrum bars cascading across the whole music bar
  const NUM_BARS = 36;
  const fifoBuffer = useRef<number[]>(new Array(NUM_BARS).fill(0.04));
  const peakCaps = useRef<number[]>(new Array(NUM_BARS).fill(0.04));

  // Sync with global background music engine
  useEffect(() => {
    return musicPlayerEngine.subscribe((state) => {
      setPlayerState(state);
    });
  }, []);

  const {
    currentTrack,
    isPlaying,
    isBuffering,
    nowPlaying,
    currentPalette,
    beatPulse,
  } = playerState;

  // Toggle play/pause (center button)
  const handleTogglePlay = () => {
    soundFX.playClick();
    musicPlayerEngine.togglePlay();
  };

  // Next Track (>) - ALWAYS switches and starts playing immediately
  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextTrack();
  };

  // Previous Track (<) - ALWAYS switches and starts playing immediately
  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.prevTrack();
  };

  // Manual Color Pop Trigger
  const handleColorPop = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextPalette();
  };

  // ── FIFO VISUALIZER CANVAS ENGINE (Spans Entire Music Bar) ───────────────
  // Note: Only renders visually while in the bedroom. Audio continues in background.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const width = (canvas.width = canvas.clientWidth || 400);
      const height = (canvas.height = canvas.clientHeight || 46);

      // 1. Procedural High-Fidelity Beat & Frequency Synthesizer
      let energy = 0.04;

      if (isPlaying || isBuffering) {
        const t = time / 1000;
        const isSynth = currentTrack.badge.includes("SYNTH") || currentTrack.badge.includes("RETRO") || currentTrack.badge.includes("VAPOR");
        const bpm = isSynth ? 122 : currentTrack.id.includes("regardless") ? 128 : 88;
        const beatCycle = (t * (bpm / 60)) % 4;

        // Dynamic Kick Drum Pulse
        const kick = Math.pow(Math.max(0, Math.sin(beatCycle * Math.PI)), 7) * 0.85;
        // Snare Snap on beats 2 & 4
        const snare = Math.pow(Math.max(0, Math.sin((beatCycle - 1) * Math.PI)), 10) * 0.65;
        // Arpeggiator Synth Flutter
        const arpHum = Math.sin(t * (isSynth ? 44 : 32)) > 0.4 ? 0.35 : 0.06;
        // Sub-bass Resonance
        const bass = (Math.sin(t * 4.8) * 0.5 + 0.5) * 0.4;

        energy = Math.min(1.0, 0.08 + kick + snare + arpHum + bass);

        // Detect kick peak for neon glow pulse
        if (energy > 0.68) {
          musicPlayerEngine.triggerBeatPulse(energy);
        }
      }

      // 2. FIFO Buffer Shift: Push new energy to the front, shift older values across
      if (isPlaying || isBuffering) {
        fifoBuffer.current.shift();
        fifoBuffer.current.push(energy);
      } else {
        // Smoothly decay all bars down to idle resting height
        for (let i = 0; i < NUM_BARS; i++) {
          fifoBuffer.current[i] = Math.max(0.04, fifoBuffer.current[i] - dt * 0.8);
        }
      }

      // 3. Clear canvas with transparent clear
      ctx.clearRect(0, 0, width, height);

      // 4. Render All FIFO Spectrum Bars Spanning the Whole Music Bar
      const totalBars = NUM_BARS;
      const barSpacing = width / totalBars;
      const barWidth = Math.max(3, barSpacing * 0.65);

      for (let i = 0; i < totalBars; i++) {
        const val = fifoBuffer.current[i];
        const barHeight = Math.max(4, val * (height * 0.85));
        const x = i * barSpacing + (barSpacing - barWidth) / 2;
        const y = height - barHeight;

        // Peak Hold Gravity Physics
        if (barHeight > peakCaps.current[i]) {
          peakCaps.current[i] = barHeight;
        } else {
          peakCaps.current[i] = Math.max(4, peakCaps.current[i] - dt * 28);
        }

        // Color Gradient along the bar from active palette
        const barGrad = ctx.createLinearGradient(0, height, 0, y);
        barGrad.addColorStop(0, currentPalette.bottomColor);
        barGrad.addColorStop(0.5, currentPalette.midColor);
        barGrad.addColorStop(1, currentPalette.topColor);

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        // Rounded top on each bar
        const radius = barWidth / 2;
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 1, 1]);
        ctx.fill();

        // Glowing Peak Cap Dot
        if ((isPlaying || isBuffering) && peakCaps.current[i] > 6) {
          ctx.fillStyle = currentPalette.peak;
          ctx.shadowColor = currentPalette.glow;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, height - peakCaps.current[i] - 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      // NOTE: Only cancel animation loop when leaving the page.
      // Audio playback continues uninterrupted via musicPlayerEngine!
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isBuffering, currentTrack, currentPalette]);

  return (
    <div className="w-[min(92vw,25rem)] h-12 flex items-center pointer-events-auto select-none">
      {/* ── THE WHOLE MUSIC BAR FIFO VISUALIZER PILL [< || >] ────────────────── */}
      <div
        className="relative flex w-full h-full items-center rounded-full border transition-colors duration-300 shadow-2xl backdrop-blur-xl overflow-hidden group"
        style={{
          borderColor: (isPlaying || isBuffering) ? currentPalette.border : "rgba(255, 255, 255, 0.12)",
          backgroundColor: currentPalette.pillBg,
          boxShadow: (isPlaying || isBuffering)
            ? `0 0 ${16 + beatPulse * 22}px ${currentPalette.shadow}, inset 0 0 14px ${currentPalette.shadow}`
            : "0 10px 30px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* BACKGROUND: Full-Width Real-Time FIFO Visualizer Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        />

        {/* Semi-transparent protective glass film to keep UI text & controls razor-sharp */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] pointer-events-none" />

        {/* ── CONTROLS OVERLAY ──────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center w-full h-full min-w-0">
          {/* < Previous Track Edge Button */}
          <button
            onClick={handlePrevTrack}
            className="px-2.5 py-2.5 rounded-l-full hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center border-r border-white/10 active:scale-95 text-zinc-300"
            title="Previous Station (<)"
            aria-label="Previous Station"
          >
            <ChevronLeft size={14} className="hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Center: Play / Pause [ || / ▶ ] + Track Info & Live Buffer Status */}
          <button
            onClick={handleTogglePlay}
            className="px-2.5 sm:px-3.5 py-2 flex min-w-0 flex-1 items-center gap-2 hover:text-white transition-colors text-xs font-mono tracking-wider focus:outline-none"
            title={isPlaying ? "Click to Pause (||)" : "Click to Play (▶)"}
            aria-label={isPlaying ? "Pause track" : "Play track"}
          >
            {/* Play/Pause Button Icon with Glowing Ring or Buffering Spinner */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: (isPlaying || isBuffering) ? currentPalette.badgeBg : "rgba(255,255,255,0.08)",
                border: `1px solid ${(isPlaying || isBuffering) ? currentPalette.border : "rgba(255,255,255,0.2)"}`,
              }}
            >
              {isBuffering ? (
                <Loader2 size={11} className="animate-spin text-amber-300" />
              ) : isPlaying ? (
                <Pause
                  size={11}
                  style={{ color: currentPalette.glow, fill: currentPalette.glow }}
                  className="animate-pulse"
                />
              ) : (
                <Play size={10} className="text-zinc-200 fill-zinc-200 ml-0.5" />
              )}
            </div>

            {/* Rotating Disc / Track Icon */}
            <Disc
              size={13}
              style={{ color: (isPlaying || isBuffering) ? currentPalette.glow : "#71717A" }}
              className={(isPlaying || isBuffering) ? "animate-spin" : ""}
            />

            {/* Track Title / Live Song Title Display */}
            <div className="flex min-w-0 flex-1 flex-col items-start leading-tight text-left overflow-hidden">
              <span
                className="font-semibold text-[11px] truncate w-full text-zinc-100 flex items-center gap-1.5"
                title={isBuffering ? "Tuning stream..." : (nowPlaying || currentTrack.title)}
              >
                {nowPlaying && (isPlaying || isBuffering) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                )}
                <span className="truncate">
                  {isBuffering ? "TUNING STREAM..." : (nowPlaying || currentTrack.title)}
                </span>
              </span>
              <span className="text-[9px] font-mono text-zinc-400 truncate w-full tracking-wide">
                {nowPlaying ? currentTrack.title : currentTrack.artist}
              </span>
            </div>

            {/* Dynamic Genre Badge with Current Theme Color */}
            <span
              className="w-20 sm:w-[6.25rem] min-w-0 shrink-0 justify-center overflow-hidden text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase flex items-center gap-1 border"
              style={{
                backgroundColor: currentPalette.badgeBg,
                color: currentPalette.badgeText,
                borderColor: currentPalette.border,
              }}
            >
              {currentTrack.type === "stream" && <Radio size={8} className={isBuffering ? "animate-ping text-amber-300" : "animate-pulse"} />}
              {currentTrack.type === "procedural" && <Sparkles size={8} />}
              <span className="hidden max-w-full truncate sm:inline">{currentTrack.badge}</span>
              <span className="max-w-full truncate sm:hidden">{currentTrack.badge.split(" ")[0]}</span>
            </span>
          </button>

          {/* Color Pop Theme Trigger: Click to cycle vibrant visualizer themes! */}
          <button
            onClick={handleColorPop}
            className="shrink-0 p-1.5 rounded-full hover:bg-white/15 transition-transform hover:scale-110 active:scale-90"
            title={`Color Theme: ${currentPalette.name} (Click to pop new color)`}
          >
            <span
              className="block w-2.5 h-2.5 rounded-full shadow-md animate-pulse"
              style={{
                backgroundColor: currentPalette.glow,
                boxShadow: `0 0 8px ${currentPalette.glow}`,
              }}
            />
          </button>

          {/* > Next Track Edge Button */}
          <button
            onClick={handleNextTrack}
            className="px-2.5 py-2.5 rounded-r-full hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center border-l border-white/10 active:scale-95 text-zinc-300"
            title="Next Station (>)"
            aria-label="Next Station"
          >
            <ChevronRight size={14} className="hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
