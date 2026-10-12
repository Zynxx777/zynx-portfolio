import React from "react";
import { X, Orbit, Flame } from "lucide-react";
import { BlackHoleSimulation } from "./BlackHoleSimulation";

interface BlackHoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlackHoleModal: React.FC<BlackHoleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-3 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[88vh] rounded-3xl cyber-glass border border-cyan-400/30 overflow-hidden shadow-2xl flex flex-col bg-[#04040a]/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <div>
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>RELATIVISTIC BLACK HOLE ACCRETION SIMULATION</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  N-BODY KEPLERIAN DYNAMICS
                </span>
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Schwarzschild Singularity & Doppler Beaming Gravitational Lens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real black hole image thumbnail indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-zinc-300">
              <img
                src="/images/blackhole.jpeg"
                alt="Black Hole Texture"
                className="w-4 h-4 rounded-full object-cover animate-spin-slow"
              />
              <span className="text-[11px] text-zinc-400">Active Accretion Texture</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl cyber-glass border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Canvas Body */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {/* Black Hole Simulation */}
          <BlackHoleSimulation className="z-10" />

          {/* Interactive Mouse Hint Watermark */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
            <Orbit size={13} className="text-cyan-400 animate-spin" />
            <span>MOVE CURSOR TO DEFLECT GRAVITATIONAL LENSING AXIS</span>
          </div>

          {/* Real Texture HUD Preview on corner */}
          <div className="absolute top-4 right-4 z-20 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 max-w-[220px] sm:hidden space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>REFERENCE TEXTURE</span>
              <span className="text-cyan-400">ORIGINAL ART</span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
              <img
                src="/images/blackhole.jpeg"
                alt="Black Hole Art"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-amber-300">
                Schwarzschild Metric
              </div>
            </div>
          </div>

          {/* Telemetry Floating HUD at Bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 sm:gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 block uppercase">Singularity Mass</span>
                <span className="text-cyan-300 font-bold">4.15 × 10⁶ M☉</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 block uppercase">Photon Sphere Radius</span>
                <span className="text-amber-300 font-bold">1.5 × Rs (Relativistic)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 block uppercase">Accretion Particles</span>
                <span className="text-purple-300 font-bold">8,500 Nodes (Doppler Shift)</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 block uppercase">Hawking Radiance</span>
                <span className="text-emerald-300 font-bold">1.48 × 10⁻¹⁴ K</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Flame size={12} className="text-amber-400" />
                <span>Interstellar Accretion Sim</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
