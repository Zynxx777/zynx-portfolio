import React, { useEffect, useState } from "react";

/**
 * CustomAuraCursor
 *
 * A high-performance, non-intrusive cursor aura inspired by Bleibtgleich & Edolus.
 * - Subtle glowing ring and center micro-dot that follows the cursor with smooth lerp
 * - Expands when hovering over interactive elements (buttons, links, cards)
 * - Automatically hides on touch devices (pointer: coarse) to prevent any lag
 * - Does not block clicks (pointer-events: none)
 */
export const CustomAuraCursor: React.FC = () => {
  const [mounted] = useState(() => typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = document.getElementById("aura-cursor-dot");
    const ring = document.getElementById("aura-cursor-ring");

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest("a, button, [role='button'], input, textarea, select, [data-interactive]")
        );
        setIsHovering(isInteractive);
      }

      if (reducedMotion) {
        ringX = mouseX;
        ringY = mouseY;
        ring?.style.setProperty("transform", `translate3d(${ringX}px, ${ringY}px, 0)`);
      } else if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => {
      setIsVisible(false);
      cancelAnimationFrame(animId);
      animId = 0;
    };

    const render = () => {
      animId = 0;
      // Smooth lerp for outer aura ring
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      if (Math.abs(mouseX - ringX) > 0.75 || Math.abs(mouseY - ringY) > 0.75) {
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onMouseLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Outer Spring Ring */}
      <div
        id="aura-cursor-ring"
        className={`fixed top-0 left-0 -ml-5 -mt-5 rounded-full border will-change-transform transition-[width,height,background-color,border-color] duration-200 ease-out flex items-center justify-center ${
          isHovering
            ? "w-14 h-14 -ml-7 -mt-7 border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,242,254,0.25)]"
            : isClicking
            ? "w-8 h-8 -ml-4 -mt-4 border-cyan-300 bg-cyan-400/20"
            : "w-10 h-10 border-white/25 bg-transparent"
        }`}
      />

      {/* Center Precise Dot */}
      <div
        id="aura-cursor-dot"
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full will-change-transform transition-transform duration-75 ${
          isHovering ? "bg-cyan-300 scale-125" : "bg-white"
        }`}
      />
    </div>
  );
};
