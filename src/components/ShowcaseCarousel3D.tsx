import React from 'react';
import { type Project } from '../data/portfolioData';
import { Projects3D } from './Projects3D';
import { ArrowLeft } from 'lucide-react';

interface ShowcaseCarousel3DProps {
  onSelectProject?: (project: Project) => void;
  onOpenProfile: () => void;
  onOpenNewsletter: () => void;
  onSwitchToBedroom: () => void;
  onOpenAnatomy?: () => void;
}

export const ShowcaseCarousel3D: React.FC<ShowcaseCarousel3DProps> = ({
  onOpenProfile,
  onSwitchToBedroom,
  onOpenAnatomy,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#020305]">
      {/* Top Header Bar (Exact layout from jesperlandberg.com) */}
      <header className="absolute top-0 inset-x-0 z-40 p-6 md:p-8 flex items-center justify-between text-xs font-mono tracking-widest text-white uppercase pointer-events-none">
        <div className="pointer-events-auto font-bold flex items-center gap-3">
          <button
            onClick={onSwitchToBedroom}
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>JOSHUA D (ZYNX)</span>
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-normal">
            SHOWCASE
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={onOpenProfile}
            className="hover:text-cyan-400 transition-colors font-medium"
          >
            Profile
          </button>
        </div>
      </header>

      {/* Real GLSL WebGL Ribbon Wave Engine */}
      <Projects3D
        immersive
        onOpenAnatomy={onOpenAnatomy}
      />
    </div>
  );
};
