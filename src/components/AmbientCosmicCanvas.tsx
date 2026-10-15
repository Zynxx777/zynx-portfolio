import React, { useEffect, useRef } from "react";

/**
 * AmbientCosmicCanvas
 * 
 * Replaces plain/flat black with a living, cinematic Cosmic Noir atmosphere
 * inspired by A24, Edolus, Bleibtgleich, and Locomotive:
 * - Deep obsidian, midnight petrol, and indigo ambient aura
 * - Fluid spring-damped mouse spotlight that illuminates the background
 * - Ultra-fine hardware-accelerated cinematic micro-grain overlay (SVG noise)
 * - Subtle geometric architectural grid
 * - 60fps lightweight performance (no heavy WebGL passes, pure CSS + RAF lerp)
 */
export const AmbientCosmicCanvas: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ currentX: window.innerWidth / 2, currentY: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 });

  useEffect(() => {
    let animId: number;
    let isVisible = true;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    const updateSpotlight = () => {
      if (isVisible && spotlightRef.current) {
        const p = posRef.current;
        p.currentX += (p.targetX - p.currentX) * 0.08;
        p.currentY += (p.targetY - p.currentY) * 0.08;
        spotlightRef.current.style.transform = `translate3d(${p.currentX - 450}px, ${p.currentY - 450}px, 0)`;
      }
      animId = requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    animId = requestAnimationFrame(updateSpotlight);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ── BASE PALETTE: Deep Cosmic Noir (Rich Midnight Indigo & Petrol) ── */}
      <div className="absolute inset-0 bg-[#07080d]" />

      {/* Static atmospheric ambient gradient clouds */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 22%, rgba(14, 38, 56, 0.45) 0%, transparent 55%),
            radial-gradient(circle at 82% 35%, rgba(38, 14, 56, 0.35) 0%, transparent 60%),
            radial-gradient(circle at 50% 85%, rgba(10, 48, 52, 0.30) 0%, transparent 65%),
            radial-gradient(circle at 75% 90%, rgba(26, 12, 42, 0.40) 0%, transparent 55%)
          `,
        }}
      />

      {/* ── INTERACTIVE MOUSE SPOTLIGHT (Jesper Landberg & Edolus dynamic lighting) ── */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[900px] h-[900px] rounded-full will-change-transform opacity-65"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.09) 0%, rgba(157, 78, 221, 0.05) 35%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── ARCHITECTURAL SUB-PIXEL GRID (Bleibtgleich & Locomotive precision) ── */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── CINEMATIC FILM GRAIN TEXTURE (A24 & Locomotive editorial feel) ── */}
      <div
        className="absolute inset-0 opacity-[0.038] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top subtle horizon vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#07080d]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07080d]/80 to-transparent" />
    </div>
  );
};
