import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import profileData from "../data/profile.json";
import { NewsletterModal } from "../components/NewsletterModal";

const ImmersiveProjects = lazy(() =>
  import("../components/Projects3D").then((module) => ({ default: module.Projects3D })),
);
const AnatomyDissectionModal = lazy(() =>
  import("../components/AnatomyDissectionModal").then((module) => ({ default: module.AnatomyDissectionModal })),
);

interface ShowcasePageProps {
  openResume: () => void;
  onNavigatePortfolio: () => void;
  onNavigateSkills: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

const ShowcaseCursor: React.FC<{ hoveredCard: string | null; isDragging: boolean }> = ({
  hoveredCard,
  isDragging,
}) => {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!glow || !ring) return;

    let mx = -200;
    let my = -200;
    let rx = -200;
    let ry = -200;
    let visible = false;
    let animId = 0;

    const render = () => {
      animId = 0;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      glow.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) {
        animId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        visible = false;
        ring.style.opacity = "0";
        glow.style.opacity = "0";
        return;
      }
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        glow.style.opacity = "1";
      }
      const target = e.target as HTMLElement | null;
      const onLightModal = Boolean(target?.closest(".showcase-project-dialog"));
      ring.style.mixBlendMode = onLightModal ? "normal" : "difference";
      glow.style.display = onLightModal ? "none" : "block";

      if (!animId) animId = requestAnimationFrame(render);
    };

    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      glow.style.opacity = "0";
      cancelAnimationFrame(animId);
      animId = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onLeave);
    };
  }, []);

  const badgeLabel = isDragging ? "DRAG" : hoveredCard ? "OPEN" : "";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      {/* Atmospheric subtle cursor gradient illumination */}
      <div
        ref={glowRef}
        className="fixed left-0 top-0 rounded-full opacity-0 transition-opacity duration-300 will-change-transform"
        style={{
          width: 340,
          height: 340,
          marginLeft: -170,
          marginTop: -170,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.068) 0%, rgba(220,210,215,0.028) 36%, rgba(0,0,0,0) 70%)",
        }}
      />
      {/* Trailing hairline lens ring */}
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,margin,border-color,background-color,opacity] duration-200 will-change-transform ${
          badgeLabel
            ? "-ml-6 -mt-6 h-12 w-12 border-white/60 bg-white/10 backdrop-blur-[2px]"
            : "-ml-3.5 -mt-3.5 h-7 w-7 border-white/30 bg-transparent"
        }`}
        style={{ opacity: 0 }}
      >
        {badgeLabel && (
          <span className="font-mono text-[7px] font-medium uppercase tracking-[0.18em] text-white">
            {badgeLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export const ShowcasePage: React.FC<ShowcasePageProps> = ({
  openResume,
  onNavigatePortfolio,
  onNavigateSkills,
  onNavigateSpace,
  onNavigateCommunity,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [anatomyOpen, setAnatomyOpen] = useState(false);
  const [worldMenuOpen, setWorldMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
        const focusable = [
          closeButtonRef.current,
          ...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        ].filter((element): element is HTMLElement => element instanceof HTMLElement);
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
    <div className="showcase-replica-page relative h-[100svh] w-full overflow-hidden bg-black text-white select-none">
      <ShowcaseCursor
        hoveredCard={profileOpen ? null : hoveredCard}
        isDragging={!profileOpen && isDragging}
      />

      <section className="showcase-replica-home relative h-full w-full overflow-hidden" aria-label="Featured projects">
        {/* Top Bar matching Jesper Landberg: JOSHUA D top-left, PROFILE / CLOSE top-right */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[58px] items-center justify-between px-5 sm:px-8 lg:px-[5vw]">
          <div
            className="pointer-events-auto relative"
            onMouseLeave={() => setWorldMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setWorldMenuOpen((v) => !v)}
              onMouseEnter={() => setWorldMenuOpen(true)}
              className="inline-flex items-center gap-2 py-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/90 transition hover:text-white sm:text-[10px]"
              aria-expanded={worldMenuOpen}
              aria-label="Joshua D portfolio navigation"
            >
              <span className="font-medium">Joshua D</span>
              <span className="text-white/35">/ ZYNX</span>
            </button>

            {worldMenuOpen && (
              <nav
                aria-label="Portfolio worlds"
                className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-white/15 bg-black/90 p-1.5 backdrop-blur-xl shadow-2xl"
              >
                <button
                  type="button"
                  onClick={onNavigateSpace}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span>Work Desk 3D</span>
                  <ArrowUpRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={onNavigatePortfolio}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span>Selected Works</span>
                  <ArrowUpRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={onNavigateSkills}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span>Skills Universe</span>
                  <ArrowUpRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={onNavigateCommunity}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span>7YNX Music</span>
                  <ArrowUpRight size={11} />
                </button>
              </nav>
            )}
          </div>

          {!profileOpen && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="pointer-events-auto inline-flex min-h-9 items-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/85 transition hover:text-white sm:text-[10px]"
            >
              Profile
            </button>
          )}
        </header>

        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center bg-black font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Loading project wave…
            </div>
          }
        >
          <ImmersiveProjects
            immersive
            profileOpen={profileOpen}
            onOpenNewsletter={() => setNewsletterOpen(true)}
            onOpenAnatomy={() => setAnatomyOpen(true)}
            onHoverCardChange={(name, dragging) => {
              setHoveredCard(name);
              setIsDragging(dragging);
            }}
          />
        </Suspense>
      </section>

      {/* Profile Overlay floating centered inside the 3D WebGL refractive glass torus + obsidian droplets */}
      {profileOpen && (
        <div
          className="showcase-profile-overlay pointer-events-none fixed inset-0 z-[80] overflow-hidden"
          role="presentation"
        >
          {/* Backdrop click area */}
          <div
            className="pointer-events-auto absolute inset-0"
            onMouseDown={() => setProfileOpen(false)}
          />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setProfileOpen(false)}
            aria-label="Close profile"
            className="showcase-profile-close pointer-events-auto absolute right-5 top-4 z-20 inline-flex min-h-9 items-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/85 transition hover:text-white sm:right-8 sm:top-[11px] lg:right-[5vw]"
          >
            Close
          </button>

          <section
            className="showcase-profile-content pointer-events-none z-10 flex w-full max-w-[390px] flex-col items-center px-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Profile for ${profileData.basics.name}`}
            data-profile-dialog
          >
            <p className="w-full text-left text-[12px] font-light leading-[1.6] text-white/95 sm:text-[13px]">
              {profileData.basics.name}, ECE graduate &amp; systems craftsman focused on Arch Linux
              administration, embedded hardware prototyping, and tactile 3D WebGL interfaces — building
              visually expressive systems alongside independent engineering practice.
            </p>
            <p className="mt-4 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-white/65 sm:text-[9px]">
              B.E. ECE · DBIT — ARCH LINUX, THREE.JS WEBGL, EMBEDDED C, 7CHATS BUG BOUNTY
            </p>
            <nav
              className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/90"
              aria-label="Profile links"
            >
              <a
                className="transition hover:text-white/60"
                href={profileData.basics.profiles.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a
                className="transition hover:text-white/60"
                href={profileData.basics.profiles.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="transition hover:text-white/60"
                href={profileData.basics.profiles.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <button type="button" onClick={openResume} className="uppercase transition hover:text-white/60">
                Résumé
              </button>
              <a
                className="transition hover:text-white/60"
                href={`mailto:${profileData.basics.email}`}
              >
                Email
              </a>
            </nav>
          </section>
        </div>
      )}

      <NewsletterModal isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} />

      {anatomyOpen && (
        <Suspense fallback={null}>
          <AnatomyDissectionModal isOpen={anatomyOpen} onClose={() => setAnatomyOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};
