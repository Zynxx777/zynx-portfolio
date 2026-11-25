import React from 'react';
import { Layers, X } from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import type { XRayDeskItem } from '../data/deskInspectorData';

interface XRayDeskInspectorProps {
  selectedItem: XRayDeskItem | null;
  onClose: () => void;
  onOpenAnatomy?: () => void;
}

export const XRayDeskInspector: React.FC<XRayDeskInspectorProps> = ({
  selectedItem,
  onClose,
  onOpenAnatomy,
}) => {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-x-2 bottom-3 sm:inset-x-auto sm:bottom-auto sm:top-16 sm:right-6 sm:w-[410px] sm:max-w-[410px] z-40 pointer-events-auto animate-fadeIn select-text">
      <section
        aria-labelledby="desk-inspector-title"
        className="max-h-[80vh] overflow-y-auto rounded-3xl border border-zinc-200/90 bg-white/95 p-4 text-zinc-900 shadow-2xl backdrop-blur-2xl sm:max-h-[86vh] sm:p-6"
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-zinc-300 sm:hidden" />

        <header className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white shadow-md shadow-blue-500/25 sm:h-8 sm:w-8 sm:text-sm">
              {selectedItem.id}
            </span>
            <h3 id="desk-inspector-title" className="text-base font-bold leading-tight tracking-tight text-zinc-900 sm:text-lg">
              {selectedItem.name}
            </h3>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 active:scale-95"
            title="Close inspector (Esc)"
            aria-label="Close inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <p className="mt-3 text-xs leading-relaxed text-zinc-600">{selectedItem.description}</p>

        <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/60 bg-zinc-100/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Construction</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">{selectedItem.construction}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200/60 bg-zinc-100/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Interaction</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">{selectedItem.interaction}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Source</p>
          <p className="mt-1 break-words font-mono text-[10px] leading-relaxed text-zinc-600">{selectedItem.source}</p>
        </div>

        {selectedItem.id === 6 && onOpenAnatomy && (
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenAnatomy();
            }}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 active:scale-95"
          >
            <Layers className="h-4 w-4" />
            <span>Open Card Layer View</span>
          </button>
        )}
      </section>
    </div>
  );
};
