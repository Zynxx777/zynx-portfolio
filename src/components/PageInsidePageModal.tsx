import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Trophy, X } from "lucide-react";
import { ClothTransitionCanvas, type ClothTransitionKind } from "./ClothTransitionCanvas";
import type { ShowcaseProject } from "../data/showcaseProjects";

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
  project: ProjectSpec | ShowcaseProject | null;
  projects?: (ProjectSpec | ShowcaseProject)[];
  onSelectProject?: (project: ProjectSpec | ShowcaseProject) => void;
  onClose: () => void;
  immersive?: boolean;
  onOpenAnatomy?: () => void;
}

function isShowcaseProject(item: ProjectSpec | ShowcaseProject): item is ShowcaseProject {
  return "slideTheme" in item;
}

export const PageInsidePageModal: React.FC<PageInsidePageModalProps> = ({
  project,
  projects = [],
  onSelectProject,
  onClose,
  immersive = false,
  onOpenAnatomy,
}) => {
  if (!project) return null;
  return (
    <PageInsidePageDialog
      project={project}
      projects={projects}
      onSelectProject={onSelectProject}
      onClose={onClose}
      immersive={immersive}
      onOpenAnatomy={onOpenAnatomy}
    />
  );
};

interface PageInsidePageDialogProps extends Omit<PageInsidePageModalProps, "project"> {
  project: ProjectSpec | ShowcaseProject;
}

const PageInsidePageDialog: React.FC<PageInsidePageDialogProps> = ({
  project,
  projects = [],
  onSelectProject,
  onClose,
  immersive = false,
  onOpenAnatomy,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const [transitionState, setTransitionState] = useState<{ kind: ClothTransitionKind; key: number }>(() => ({
    kind: immersive ? "open" : null,
    key: 1,
  }));

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject =
    projects.length > 1 && currentIndex >= 0
      ? projects[(currentIndex - 1 + projects.length) % projects.length]
      : null;
  const nextProject =
    projects.length > 1 && currentIndex >= 0
      ? projects[(currentIndex + 1) % projects.length]
      : null;

  const triggerStep = useCallback(
    (target: ProjectSpec | ShowcaseProject | null, direction: "prev" | "next") => {
      if (!target || !onSelectProject) return;
      setTransitionState((prev) => ({ kind: direction, key: prev.key + 1 }));
      onSelectProject(target);
      requestAnimationFrame(() => {
        rightScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      });
    },
    [onSelectProject],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (immersive && event.key === "ArrowLeft" && prevProject) {
        event.preventDefault();
        triggerStep(prevProject, "prev");
      }
      if (immersive && event.key === "ArrowRight" && nextProject) {
        event.preventDefault();
        triggerStep(nextProject, "next");
      }
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
  }, [onClose, immersive, prevProject, nextProject, triggerStep]);

  const rich = isShowcaseProject(project) ? project : null;
  const externalHref = rich?.liveUrl || project.link;
  const galleryList = rich?.gallery?.length ? rich.gallery : [project.img];

  return (
    <div
      className={
        immersive
          ? "showcase-project-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/92 px-0 py-0 sm:px-8 sm:py-4 md:px-14"
          : "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      }
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      {/* Peeking adjacent left card edge (matching jesperlandberg.com frames 00:35 / 00:39 / 00:41) */}
      {immersive && prevProject && onSelectProject && (
        <button
          type="button"
          onClick={() => triggerStep(prevProject, "prev")}
          aria-label={`Previous project: ${prevProject.name}`}
          className="group fixed left-0 top-1/2 z-[95] hidden h-[86svh] max-h-[880px] w-7 -translate-y-1/2 items-center justify-center overflow-hidden rounded-r-[16px] border-r border-white/15 bg-[#191a1f]/90 transition-all duration-300 hover:w-11 hover:bg-[#23252d] md:flex lg:w-9"
        >
          <img
            src={prevProject.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-60"
          />
          <ArrowLeft size={14} className="relative z-10 text-white/75 opacity-0 transition group-hover:opacity-100" />
        </button>
      )}

      {/* Peeking adjacent right card edge */}
      {immersive && nextProject && onSelectProject && (
        <button
          type="button"
          onClick={() => triggerStep(nextProject, "next")}
          aria-label={`Next project: ${nextProject.name}`}
          className="group fixed right-0 top-1/2 z-[95] hidden h-[86svh] max-h-[880px] w-7 -translate-y-1/2 items-center justify-center overflow-hidden rounded-l-[16px] border-l border-white/15 bg-[#191a1f]/90 transition-all duration-300 hover:w-11 hover:bg-[#23252d] md:flex lg:w-9"
        >
          <img
            src={nextProject.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-60"
          />
          <ArrowRight size={14} className="relative z-10 text-white/75 opacity-0 transition group-hover:opacity-100" />
        </button>
      )}

      {/* WebGL silk-cloth opening / horizontal slide wave overlay */}
      {immersive && (
        <ClothTransitionCanvas
          transitionKind={transitionState.kind}
          transitionKey={transitionState.key}
          onSettled={() => setTransitionState((prev) => ({ ...prev, kind: null }))}
        />
      )}

      <section
        aria-labelledby="project-dialog-title"
        aria-modal="true"
        className={
          immersive
            ? "showcase-project-dialog relative z-[101] flex h-[100svh] w-full flex-col overflow-hidden bg-white text-[#111113] shadow-[0_35px_120px_rgba(0,0,0,0.65)] sm:h-[94svh] sm:max-h-[960px] sm:max-w-[1560px] sm:rounded-[18px]"
            : "relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d14] shadow-2xl sm:rounded-3xl"
        }
        role="dialog"
      >
        {immersive ? (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:overflow-hidden md:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
            {/* Fixed top-right black circular X close button (matches reference modal top-right) */}
            <button
              ref={closeButtonRef}
              aria-label="Close project details"
              className="fixed right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#09090b] text-white shadow-lg transition hover:scale-105 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black sm:absolute sm:right-6 sm:top-6 sm:h-9 sm:w-9"
              onClick={onClose}
              type="button"
            >
              <X size={16} strokeWidth={2.2} />
            </button>

            {/* Left Sticky Summary Column */}
            <div className="flex flex-none flex-col justify-between px-5 pb-4 pt-7 sm:px-9 sm:py-9 md:min-h-0 md:flex-1 md:overflow-y-auto lg:px-12 lg:py-11">
              <div className="max-w-md pr-8 md:pr-0">
                <h2
                  id="project-dialog-title"
                  className="text-[clamp(1.75rem,3vw,2.65rem)] font-medium leading-[1.06] tracking-[-0.04em] text-[#111113]"
                >
                  {project.name}
                </h2>
                <p className="mt-4 text-[13px] leading-[1.6] text-[#3f3f46] sm:text-[14px]">
                  {project.description}
                </p>

                {/* Minimal Circular External Link + Year / Role Pills + Trophy */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <a
                    href={externalHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${project.name} link`}
                    title={externalHref}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#09090b] text-white transition hover:scale-105 hover:bg-zinc-800"
                  >
                    <ArrowUpRight size={13} />
                  </a>

                  <span className="rounded-full bg-[#f3f3f2] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#3f3f46]">
                    {rich?.year || "2026"}
                  </span>

                  <span className="rounded-full bg-[#f3f3f2] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#3f3f46]">
                    {rich?.clientOrRole || project.category.toUpperCase()}
                  </span>

                  {project.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#f3f3f2] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#52525b]"
                    >
                      {skill}
                    </span>
                  ))}

                  {rich?.award && (
                    <span
                      title={rich.award}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-1 ring-amber-200/70"
                    >
                      <Trophy size={13} />
                    </span>
                  )}
                </div>

                {project.id === "zcard-hardware" && onOpenAnatomy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnatomy();
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111113] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white transition hover:bg-zinc-800 active:scale-95"
                  >
                    <span>3D Anatomy Dissection</span>
                    <ArrowUpRight size={13} />
                  </button>
                )}
              </div>

              {/* Subtle Bottom Step Controls inside modal for keyboard/mouse/mobile symmetry */}
              {projects.length > 1 && onSelectProject && (
                <div className="mt-8 flex items-center gap-3 pt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-black/45">
                  <button
                    type="button"
                    onClick={() => triggerStep(prevProject, "prev")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-black/65 transition hover:border-black/30 hover:text-black"
                  >
                    <ArrowLeft size={12} /> Prev
                  </button>
                  <span className="text-black/35">
                    {String(currentIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerStep(nextProject, "next")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-black/65 transition hover:border-black/30 hover:text-black"
                  >
                    Next <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Right Vertically Scrollable High-Res Visual Gallery Column (Matches Reference Stacking) */}
            <div
              ref={rightScrollRef}
              className="flex-none space-y-4 px-4 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-6 md:min-h-0 md:overflow-y-auto md:pr-14"
            >
              {/* Block 1: Main Hero Render */}
              <div className="overflow-hidden rounded-[10px] bg-[#f4f4f2]">
                <img
                  alt={`${project.name} hero preview`}
                  className="block aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.015]"
                  src={galleryList[0]}
                />
              </div>

              {/* Block 2: Editorial Dark Poster Feature Block (matching Nathan Riley / Gil Huybrecht / Book of Happiness inside modals) */}
              {rich && (
                <div
                  className="relative overflow-hidden rounded-[10px] p-6 sm:p-9"
                  style={{
                    background: `linear-gradient(135deg, ${rich.slideTheme.bg} 0%, ${rich.slideTheme.bgSecondary} 100%)`,
                    color: rich.slideTheme.ink,
                  }}
                >
                  <div className="grid gap-6 sm:grid-cols-[0.45fr_1fr] sm:items-center">
                    <div
                      className="font-display text-4xl font-bold leading-[0.88] tracking-[-0.04em] sm:text-5xl"
                      style={{ color: rich.slideTheme.accent }}
                    >
                      {rich.slideTheme.nums.map((n) => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
                        {rich.slideTheme.chapterLabel} · {project.subtitle}
                      </p>
                      <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                        {rich.slideTheme.editorialQuote}
                      </h3>
                      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs opacity-85">
                        {rich.slideTheme.highlights.map((hl) => (
                          <li key={hl} className="flex items-center gap-2">
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: rich.slideTheme.accent }}
                            />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Block 3: Secondary Gallery Grid */}
              {galleryList.length > 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {galleryList.slice(1, 3).map((imgSrc, idx) => (
                    <div key={`${imgSrc}-${idx}`} className="overflow-hidden rounded-[10px] bg-[#f4f4f2]">
                      <img
                        alt={`${project.name} detail ${idx + 2}`}
                        className="block aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                        loading="lazy"
                        src={imgSrc}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Block 4: Additional Full-Width Renders (e.g., Z Card X-Ray / Exploded views) */}
              {galleryList.slice(3).map((imgSrc, idx) => (
                <div key={`${imgSrc}-wide-${idx}`} className="overflow-hidden rounded-[10px] bg-[#f4f4f2]">
                  <img
                    alt={`${project.name} architecture plate ${idx + 4}`}
                    className="block aspect-[16/10] w-full object-cover"
                    loading="lazy"
                    src={imgSrc}
                  />
                </div>
              ))}

              {/* Block 5: Architecture & Craftsmanship Notes */}
              <div className="rounded-[10px] bg-[#f6f5f3] p-6 sm:p-8">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-black/45">
                  Architecture &amp; Craft Notes
                </p>
                <div className="mt-3 space-y-2.5 text-[13px] leading-[1.6] text-black/80">
                  {(rich?.fullOverview || [project.description]).map((note, idx) => (
                    <p key={idx}>{note}</p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-mono text-[10px] text-black/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  {project.category} · {project.badge}
                </p>
                <h2 id="project-dialog-title" className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                  {project.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">{project.subtitle}</p>
              </div>
              <button
                ref={closeButtonRef}
                aria-label="Close project details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-cyan-300/50 hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <img
                alt=""
                className="max-h-[42dvh] w-full rounded-xl border border-white/10 bg-black/30 object-cover sm:rounded-2xl"
                loading="lazy"
                src={project.img}
              />
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300">{project.description}</p>
              <div className="mt-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Tools and topics</h3>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tools and topics">
                  {project.skills.map((skill) => (
                    <li
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300"
                      key={skill}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  href={project.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  View project source <ArrowUpRight size={15} />
                </a>
                {project.id === "zcard-hardware" && onOpenAnatomy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnatomy();
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:brightness-110 active:scale-95"
                  >
                    <span>🔬 3D Anatomy Dissection</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
