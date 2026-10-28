import React, { useState } from "react";
import { BedroomDesk3D } from "../components/BedroomDesk3D";
import { ProjectDetailModal } from "../components/ProjectDetailModal";
import { ProfileSphereModal } from "../components/ProfileSphereModal";
import { DiaryModal } from "../components/DiaryModal";
import { AnatomyDissectionModal } from "../components/AnatomyDissectionModal";
import { type Project, PROJECTS } from "../data/portfolioData";
import { soundFX } from "../utils/audioFX";
import { ArrowLeft, Sparkles, FolderOpen } from "lucide-react";

interface BedroomSpacePageProps {
  onNavigatePortfolio: () => void;
  onNavigateCommunity: () => void;
  onNavigateShowcase?: () => void;
}

export const BedroomSpacePage: React.FC<BedroomSpacePageProps> = ({
  onNavigatePortfolio,
  onNavigateShowcase,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050608] select-none">
      {/* ── Top Floating Navigation HUD ────────────────────────────────────── */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Return to Main Portfolio */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              onNavigatePortfolio();
            }}
            className="flex h-9 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 text-xs font-mono text-zinc-200 shadow-xl backdrop-blur-xl transition hover:border-cyan-400 hover:text-white active:scale-95"
            aria-label="Back to Portfolio"
          >
            <ArrowLeft size={14} className="text-cyan-400" />
            <span className="font-semibold tracking-wider">PORTFOLIO</span>
          </button>
        </div>

        {/* Center: Workspace Badge */}
        <div className="hidden md:flex pointer-events-none items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 shadow-lg backdrop-blur-md">
          <Sparkles size={12} className="text-amber-400" />
          <span>3D DESK WORKSPACE • JOSHUA D (ZYNX)</span>
        </div>

        {/* Right: Switch to Showcase */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              if (onNavigateShowcase) {
                onNavigateShowcase();
              } else {
                window.location.hash = "showcase";
              }
            }}
            className="flex h-9 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 text-xs font-mono text-zinc-200 shadow-xl backdrop-blur-xl transition hover:border-cyan-400 hover:text-white active:scale-95"
            aria-label="Switch to 3D Showcase"
          >
            <FolderOpen size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">SHOWCASE</span>
          </button>
        </div>
      </header>

      {/* ── 3D Desk Viewport (pradiplabs.dev style) ─────────────────────────── */}
      <div className="w-full h-full relative">
        <BedroomDesk3D
          onOpenProject={(projectId) => {
            const proj = PROJECTS.find((p) => p.id === projectId) || PROJECTS[0];
            setSelectedProject(proj);
          }}
          onOpenDiary={() => setIsDiaryOpen(true)}
          onSwitchToShowcase={() => {
            if (onNavigateShowcase) {
              onNavigateShowcase();
            } else {
              window.location.hash = "showcase";
            }
          }}
          onOpenAnatomy={() => setIsAnatomyOpen(true)}
        />
      </div>

      {/* ── Modals & Overlays ──────────────────────────────────────────────── */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenAnatomy={() => setIsAnatomyOpen(true)}
      />

      <DiaryModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
      />

      <ProfileSphereModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AnatomyDissectionModal
        isOpen={isAnatomyOpen}
        onClose={() => setIsAnatomyOpen(false)}
      />
    </div>
  );
};
