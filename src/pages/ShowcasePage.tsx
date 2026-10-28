import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import profileData from "../data/profile.json";

const ImmersiveProjects = lazy(() => import("../components/Projects3D").then((module) => ({ default: module.Projects3D })));

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
    <div className="showcase-replica-page bg-[#050608] text-white">
      <section className="showcase-replica-home relative h-[100svh] min-h-[480px] overflow-hidden" aria-label="Featured projects">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[58px] items-center justify-between px-5 sm:px-8 lg:px-[5vw]">
          <button
            type="button"
            onClick={onNavigatePortfolio}
            className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/85 transition hover:text-white"
            aria-label="Return to ZYNX portfolio"
          >
            <span className="font-semibold tracking-[0.12em]">ZYNX</span>
            <span className="text-white/40">/ Joshua D</span>
          </button>
          {!profileOpen && <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="pointer-events-auto inline-flex min-h-9 items-center font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-200 transition hover:text-cyan-100"
          >Profile</button>}
        </header>

        <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Loading project wave…</div>}>
          <ImmersiveProjects immersive profileOpen={profileOpen} />
        </Suspense>
      </section>

      <section className="showcase-replica-next flex min-h-[54svh] items-center border-t border-white/10 px-5 py-16 sm:px-10 lg:px-14" aria-labelledby="showcase-next-heading">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Keep exploring</p>
            <h2 id="showcase-next-heading" className="mt-3 max-w-lg text-3xl font-medium tracking-tight sm:text-5xl">More of the ZYNX world.</h2>
          </div>
          <nav className="grid gap-2 sm:grid-cols-2" aria-label="Explore other portfolio pages">
            <button type="button" onClick={onNavigatePortfolio} className="showcase-next-link"><span>Portfolio &amp; work</span><ArrowUpRight size={16} /></button>
            <button type="button" onClick={onNavigateSkills} className="showcase-next-link"><span>Skills arsenal</span><ArrowUpRight size={16} /></button>
            <button type="button" onClick={onNavigateSpace} className="showcase-next-link"><span>3D bedroom</span><ArrowUpRight size={16} /></button>
            <button type="button" onClick={onNavigateCommunity} className="showcase-next-link"><span>7YNX music</span><ArrowUpRight size={16} /></button>
          </nav>
        </div>
      </section>

      {profileOpen && (
        <div className="showcase-profile-overlay fixed inset-0 z-[80] overflow-y-auto" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setProfileOpen(false)}>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setProfileOpen(false)}
            aria-label="Close profile"
            className="showcase-profile-close absolute right-5 top-5 z-20 px-1 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/75 transition hover:text-white sm:right-[5vw] sm:top-7"
          >Close</button>
          <section className="showcase-profile-content z-10 flex w-full max-w-[390px] flex-col items-center px-6 text-center" role="dialog" aria-modal="true" aria-label={`Profile for ${profileData.basics.name}`} data-profile-dialog>
            <p className="text-[12px] leading-[1.55] text-white/90 sm:text-[13px]">{profileData.basics.name} is an Electronics and Communication Engineering graduate focused on IT support and junior Linux administration, with hands-on Arch Linux practice and a growing interest in software development.</p>
            <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.1em] text-white/65 sm:text-[9px]">IT support · Linux systems · ECE · software development</p>
            <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-white/90" aria-label="Profile links">
              <a className="transition hover:text-cyan-200" href={profileData.basics.profiles.github} target="_blank" rel="noreferrer">GitHub</a>
              <a className="transition hover:text-cyan-200" href={profileData.basics.profiles.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <button type="button" onClick={openResume} className="transition hover:text-cyan-200">Résumé</button>
              <a className="transition hover:text-cyan-200" href={`mailto:${profileData.basics.email}`}>Email</a>
            </nav>
          </section>
        </div>
      )}
    </div>
  );
};
