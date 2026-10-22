import React, { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";

export interface ProjectSpec {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  skills: string[];
  badge: string;
  img: string;
  link: string;
}

interface PageInsidePageModalProps {
  project: ProjectSpec | null;
  onClose: () => void;
  immersive?: boolean;
}

export const PageInsidePageModal: React.FC<PageInsidePageModalProps> = ({ project, onClose, immersive = false }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>("[aria-labelledby='project-dialog-title']");
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className={immersive
        ? "showcase-project-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 sm:p-4"
        : "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="project-dialog-title"
        aria-modal="true"
        className={immersive
          ? "showcase-project-dialog relative flex h-[96svh] max-h-[980px] w-full max-w-[1560px] flex-col overflow-hidden rounded-[14px] bg-[#f1f0ed] text-[#121212] shadow-[0_35px_120px_rgba(0,0,0,0.55)]"
          : "relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d14] shadow-2xl sm:rounded-3xl"}
        role="dialog"
      >
        {immersive ? (
          <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
            <div className="relative flex min-h-0 flex-col overflow-y-auto px-6 pb-7 pt-16 sm:px-9 sm:pb-9 sm:pt-20 lg:px-14 lg:pb-12">
              <button
                ref={closeButtonRef}
                aria-label="Close project details"
                className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:scale-105 hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 sm:right-7 sm:top-7"
                onClick={onClose}
                type="button"
              ><X size={17} /></button>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">{project.category} · {project.badge}</p>
              <h2 id="project-dialog-title" className="mt-5 max-w-xl text-[clamp(2rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.065em]">{project.name}</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/65 sm:text-base">{project.subtitle}</p>
              <p className="mt-7 max-w-md text-xs leading-relaxed text-black/75 sm:text-sm">{project.description}</p>
              <div className="mt-8">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/45">Tools and topics</h3>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tools and topics">
                  {project.skills.map((skill) => <li className="rounded-full border border-black/15 px-3 py-1.5 text-[10px] text-black/75 sm:text-xs" key={skill}>{skill}</li>)}
                </ul>
              </div>
              <a className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-black px-5 text-xs font-medium text-white transition hover:bg-zinc-700" href={project.link} rel="noreferrer" target="_blank">
                View project source <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="min-h-0 overflow-y-auto border-t border-black/10 bg-[#e7e6e3] md:border-l md:border-t-0">
              <img alt={`${project.name} project preview`} className="block min-h-[42vh] w-full bg-[#111] object-cover md:min-h-[56vh]" loading="lazy" src={project.img} />
              <div className="px-5 py-6 sm:px-8 sm:py-9 lg:px-12">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/45">Project notes</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/75">{project.description}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">{project.category} · {project.badge}</p>
                <h2 id="project-dialog-title" className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">{project.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{project.subtitle}</p>
              </div>
              <button
                ref={closeButtonRef}
                aria-label="Close project details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-cyan-300/50 hover:text-white"
                onClick={onClose}
                type="button"
              ><X size={18} /></button>
            </header>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <img alt="" className="max-h-[42dvh] w-full rounded-xl border border-white/10 bg-black/30 object-cover sm:rounded-2xl" loading="lazy" src={project.img} />
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300">{project.description}</p>
              <div className="mt-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Tools and topics</h3>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tools and topics">
                  {project.skills.map((skill) => <li className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300" key={skill}>{skill}</li>)}
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200" href={project.link} rel="noreferrer" target="_blank">
                  View project source <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
