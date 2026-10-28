import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import profileData from "../data/profile.json";
import { AnatomyDissectionModal } from "../components/AnatomyDissectionModal";

const ImmersiveProjects = lazy(() =>
  import("../components/Projects3D").then((module) => ({ default: module.Projects3D }))
);

interface ShowcasePageProps {
  openResume: () => void;
  onNavigatePortfolio: () => void;
  onNavigateSkills: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({
  openResume,
  onNavigatePortfolio,
  onNavigateSkills,
  onNavigateSpace,
  onNavigateCommunity,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const priorOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[data-profile-dialog]");
        if (!dialog) return;
        const focusable = [closeButtonRef.current, ...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")]
          .filter((element): element is HTMLElement => element instanceof HTMLElement);
        if (!focusable.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, [profileOpen]);

  return (
    <div className="showcase-replica-page bg-[#020305] text-white selection:bg-cyan-400 selection:text-black">
      {/* ── 1. MAIN HERO: JESPER LANDBERG WEBLG S-CURVE RIBBON WAVE ── */}
      <section className="showcase-replica-home relative h-[100svh] min-h-[480px] overflow-hidden" aria-label="Featured projects">
        {/* Top Minimalist Header */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[62px] items-center justify-between px-5 sm:px-8 lg:px-[5vw]">
          <button
            type="button"
            onClick={onNavigatePortfolio}
            className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/90 transition hover:text-white"
            aria-label="Return to ZYNX portfolio"
          >
            <span className="font-bold tracking-[0.14em]">JOSHUA D (ZYNX)</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] text-zinc-300 font-normal">
              SHOWCASE
            </span>
          </button>
          {!profileOpen && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="pointer-events-auto inline-flex min-h-9 items-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:text-cyan-300"
            >
              Profile
            </button>
          )}
        </header>

        {/* Real GLSL WebGL Ribbon Wave Engine */}
        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Initializing WebGL wave…
            </div>
          }
        >
          <ImmersiveProjects
            immersive
            profileOpen={profileOpen}
            onOpenAnatomy={() => setIsAnatomyOpen(true)}
          />
        </Suspense>
      </section>

      {/* ── 2. MORE OF THE ZYNX WORLD FOOTER ── */}
      <section className="showcase-replica-next flex min-h-[50svh] items-center border-t border-white/10 bg-[#06080e] px-5 py-16 sm:px-10 lg:px-14" aria-labelledby="showcase-next-heading">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">Keep exploring</p>
            <h2 id="showcase-next-heading" className="mt-3 max-w-lg text-3xl font-medium tracking-tight sm:text-5xl">
              More of the ZYNX world.
            </h2>
          </div>
          <nav className="grid gap-2.5 sm:grid-cols-2" aria-label="Explore other portfolio pages">
            <button type="button" onClick={onNavigatePortfolio} className="showcase-next-link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/10">
              <span className="font-mono text-sm text-zinc-200">Portfolio &amp; Work</span>
              <ArrowUpRight size={16} className="text-cyan-400" />
            </button>
            <button type="button" onClick={onNavigateSkills} className="showcase-next-link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/10">
              <span className="font-mono text-sm text-zinc-200">Skills Arsenal</span>
              <ArrowUpRight size={16} className="text-cyan-400" />
            </button>
            <button type="button" onClick={onNavigateSpace} className="showcase-next-link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/10">
              <span className="font-mono text-sm text-zinc-200">3D Bedroom Space</span>
              <ArrowUpRight size={16} className="text-cyan-400" />
            </button>
            <button type="button" onClick={onNavigateCommunity} className="showcase-next-link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/50 hover:bg-white/10">
              <span className="font-mono text-sm text-zinc-200">7YNX Music &amp; Audio Lab</span>
              <ArrowUpRight size={16} className="text-cyan-400" />
            </button>
          </nav>
        </div>
      </section>

      {/* ── 3. REFRACTIVE LIQUID GLASS PROFILE BUBBLE MODAL ── */}
      {profileOpen && (
        <div
          className="showcase-profile-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setProfileOpen(false)}
        >
          <div
            className="relative z-10 w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-7 text-center shadow-2xl backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Profile for ${profileData.basics.name}`}
            data-profile-dialog
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setProfileOpen(false)}
              aria-label="Close profile"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold font-mono text-lg shadow-lg shadow-cyan-500/20">
              Z7X
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {profileData.basics.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-cyan-300 uppercase tracking-widest">
              {profileData.basics.label}
            </p>

            <p className="mt-4 text-xs leading-relaxed text-zinc-300 sm:text-sm">
              {profileData.basics.summary}
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-left">
              <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                Education &amp; Institution
              </span>
              <span className="block text-xs font-semibold text-white mt-0.5">
                Don Bosco Institute of Technology (DBIT) · 2021–2025
              </span>
              <span className="block text-[11px] text-zinc-400">
                B.E. in Electronics &amp; Communication Engineering · CGPA 7.16
              </span>
            </div>

            <nav className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-wider" aria-label="Profile links">
              <a className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white hover:text-black" href={profileData.basics.profiles.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white hover:text-black" href={profileData.basics.profiles.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <button type="button" onClick={openResume} className="rounded-full border border-cyan-400/40 bg-cyan-400/20 px-4 py-2 text-cyan-300 font-bold transition hover:bg-cyan-300 hover:text-black">
                Download Résumé
              </button>
              <a className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white hover:text-black" href={`mailto:${profileData.basics.email}`}>
                Email
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* ── 4. ANATOMY REVEAL MODAL ── */}
      <AnatomyDissectionModal
        isOpen={isAnatomyOpen}
        onClose={() => setIsAnatomyOpen(false)}
      />
    </div>
  );
};
