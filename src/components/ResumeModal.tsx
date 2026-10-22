import React, { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const resumes = [
  {
    id: "focused",
    title: "IT Support & Linux",
    description: "Focused application résumé for entry-level IT support and junior Linux roles.",
    file: "/resumes/Joshua_D_IT_Support_Linux_Resume.pdf",
    previewPages: ["/resumes/previews/joshua-it-support-page-1.webp"],
    label: "Focused · 1 page",
  },
  {
    id: "universal",
    title: "Universal profile",
    description: "Broader profile covering IT, Linux, web projects, ECE, teaching, and creative work.",
    file: "/resumes/Joshua_D_Universal_Resume.pdf",
    previewPages: ["/resumes/previews/joshua-universal-page-1.webp", "/resumes/previews/joshua-universal-page-2.webp"],
    label: "Detailed · 2 pages",
  },
] as const;

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<(typeof resumes)[number]["id"]>("focused");
  const selected = resumes.find((resume) => resume.id === selectedId) ?? resumes[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="resume-dialog-title"
        aria-modal="true"
        className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d14] shadow-2xl sm:rounded-3xl"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">Résumé library</p>
            <h2 id="resume-dialog-title" className="mt-1 text-lg font-semibold text-white sm:text-xl">Choose a version</h2>
          </div>
          <button
            aria-label="Close résumé dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-cyan-300/50 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside aria-label="Résumé versions" className="space-y-2 border-b border-white/10 p-3 sm:p-4 lg:border-b-0 lg:border-r">
            {resumes.map((resume) => {
              const active = selected.id === resume.id;
              return (
                <button
                  aria-pressed={active}
                  className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${active ? "border-cyan-300/50 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/25"}`}
                  key={resume.id}
                  onClick={() => setSelectedId(resume.id)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-white"><FileText aria-hidden="true" size={16} className="text-cyan-300" />{resume.title}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-cyan-200/80">{resume.label}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-zinc-400">{resume.description}</span>
                </button>
              );
            })}
            <div className="flex gap-2 pt-1">
              <a className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200" download href={selected.file}>
                <Download size={14} /> Download
              </a>
              <a aria-label={`Open ${selected.title} résumé in a new tab`} className="inline-flex min-h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-zinc-300 transition hover:text-white" href={selected.file} rel="noreferrer" target="_blank">
                <ExternalLink size={15} /><span className="sr-only">Open PDF</span>
              </a>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-zinc-400 lg:hidden">
              On a phone or tablet, open the résumé in your PDF viewer for a full-page preview. You can also download it directly.
            </div>
          </aside>

          <div aria-label={`${selected.title} page previews`} className="hidden min-h-[68dvh] flex-1 overflow-y-auto bg-[#171922] p-4 lg:block" role="region">
            <div className="mx-auto flex max-w-[720px] flex-col gap-4">
              {selected.previewPages.map((page, index) => (
                <img
                  alt={`${selected.title}, page ${index + 1}`}
                  className="h-auto w-full rounded-md shadow-xl"
                  key={page}
                  loading="lazy"
                  src={page}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
