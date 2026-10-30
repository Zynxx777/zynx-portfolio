import React, { useEffect, useRef } from "react";

/**
 * CustomAuraCursor
 *
 * High-performance cursor aura. All updates happen via direct DOM manipulation
 * (no React state/re-renders) for zero-lag tracking. Automatically disabled
 * on touch devices, reduced-motion, and when tab is hidden.
 */
export const CustomAuraCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dot = container.querySelector<HTMLElement>("[data-cursor-dot]");
    const ring = container.querySelector<HTMLElement>("[data-cursor-ring]");
    const pointer = container.querySelector<HTMLElement>("[data-cursor-pointer]");
    if (!dot || !ring) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId = 0;
    let isHovering = false;
    let isClicking = false;
    let isVisible = false;

    const applyRingClass = () => {
      // Direct class manipulation — no React setState
      if (isHovering) {
        ring.className = "fixed top-0 left-0 rounded-full border will-change-transform w-14 h-14 -ml-7 -mt-7 border-emerald-400/60 bg-emerald-400/10 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-[width,height,background-color,border-color] duration-200 ease-out";
      } else if (isClicking) {
        ring.className = "fixed top-0 left-0 rounded-full border will-change-transform w-8 h-8 -ml-4 -mt-4 border-emerald-300 bg-emerald-400/20 transition-[width,height,background-color,border-color] duration-200 ease-out";
      } else {
        ring.className = "fixed top-0 left-0 rounded-full border will-change-transform w-10 h-10 -ml-5 -mt-5 border-white/25 bg-transparent transition-[width,height,background-color,border-color] duration-200 ease-out";
      }

      dot.className = `fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full will-change-transform transition-transform duration-75 ${isHovering ? "bg-emerald-300 scale-125" : "bg-white"}`;
    };

    const render = () => {
      animId = 0;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

      if (Math.abs(mouseX - ringX) > 0.75 || Math.abs(mouseY - ringY) > 0.75) {
        animId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Only show custom aura cursor when controlled by a mouse or pen/stylus
      if (e.pointerType === "touch") {
        if (isVisible) {
          isVisible = false;
          container.style.opacity = "0";
        }
        return;
      }

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        container.style.opacity = "1";
      }

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (pointer) {
        pointer.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check interactive hover
      const target = e.target as HTMLElement | null;
      const wasHovering = isHovering;
      isHovering = Boolean(
        target?.closest("a, button, [role='button'], input, textarea, select, [data-interactive]")
      );
      if (wasHovering !== isHovering) applyRingClass();

      if (reducedMotion) {
        ringX = mouseX;
        ringY = mouseY;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      } else if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    const onTouchStart = () => {
      // Hide cursor immediately on touch devices
      isVisible = false;
      container.style.opacity = "0";
      cancelAnimationFrame(animId);
      animId = 0;
    };

    const onMouseDown = () => { isClicking = true; applyRingClass(); };
    const onMouseUp = () => { isClicking = false; applyRingClass(); };
    const onMouseLeave = () => {
      isVisible = false;
      container.style.opacity = "0";
      cancelAnimationFrame(animId);
      animId = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{ opacity: 0, transition: "opacity 0.3s" }}
      aria-hidden="true"
    >
      <div
        data-cursor-ring
        className="fixed top-0 left-0 -ml-5 -mt-5 rounded-full border will-change-transform w-10 h-10 border-white/25 bg-transparent transition-[width,height,background-color,border-color] duration-200 ease-out"
      />
      <div
        data-cursor-dot
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full will-change-transform bg-white transition-transform duration-75"
      />
      <div
        data-cursor-pointer
        className="fixed top-0 left-0 -ml-0.5 -mt-0.5 will-change-transform pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transform -rotate-6">
          <path
            d="M4.5 3.5L10.5 20.5L13.8 13.8L20.5 10.5L4.5 3.5Z"
            fill="rgba(255, 255, 255, 0.96)"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
