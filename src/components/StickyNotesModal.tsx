import React, { useState, useEffect } from 'react';
import { X, Check, Edit2 } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export interface StickyNoteData {
  id: string;
  title: string;
  color: string;
  textColor: string;
  accentColor: string;
  rotation: string;
  content: string[];
  author?: string;
  isDoodle?: boolean;
}

const PRESET_NOTES: StickyNoteData[] = [
  {
    id: 'note-today',
    title: 'Today.',
    color: '#fef08a', // Pale yellow
    textColor: '#1c1917',
    accentColor: '#ca8a04',
    rotation: '-rotate-1',
    content: [
      'Wake up to reality.',
      'Train. Then again.',
      'Outwork everyone.',
      'Go past the limit.',
      'Accept the pain.'
    ]
  },
  {
    id: 'note-hiring',
    title: 'Hiring?',
    color: '#fbcfe8', // Soft pink
    textColor: '#831843',
    accentColor: '#db2777',
    rotation: 'rotate-2',
    content: [
      'Got a project?',
      'Take my card ➔',
      'It\'s on the desk.'
    ]
  },
  {
    id: 'note-zoro',
    title: 'Roronoa Zoro',
    color: '#bbf7d0', // Light green
    textColor: '#064e3b',
    accentColor: '#16a34a',
    rotation: '-rotate-2',
    isDoodle: true,
    author: '⚔️ Straw Hat Swordsman',
    content: [
      '"Nothing happened."',
      '— Thriller Bark'
    ]
  },
  {
    id: 'note-siuu',
    title: 'SIUUU!',
    color: '#bae6fd', // Sky blue
    textColor: '#0c4a6e',
    accentColor: '#0284c7',
    rotation: 'rotate-1',
    isDoodle: true,
    content: [
      '⚽ Ronaldo mentality',
      'Never stop pushing.',
      '100% discipline.'
    ]
  }
];

export interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNoteId?: string;
  initialNoteId?: number | string;
  onTakeCard?: () => void;
}

export const StickyNotesModal: React.FC<StickyNotesModalProps> = ({
  isOpen,
  onClose,
  activeNoteId,
  initialNoteId,
  onTakeCard
}) => {
  const getInitial = () => {
    if (typeof initialNoteId === 'number' && initialNoteId >= 1 && initialNoteId <= PRESET_NOTES.length) {
      return PRESET_NOTES[initialNoteId - 1];
    }
    if (typeof initialNoteId === 'string') {
      const found = PRESET_NOTES.find(n => n.id === initialNoteId);
      if (found) return found;
    }
    if (activeNoteId) {
      const found = PRESET_NOTES.find(n => n.id === activeNoteId);
      if (found) return found;
    }
    return PRESET_NOTES[0];
  };

  const [selectedNote, setSelectedNote] = useState<StickyNoteData>(getInitial);
  const [animatedLines, setAnimatedLines] = useState<number>(0);
  const [customText, setCustomText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '0': true,
    '1': true
  });

  useEffect(() => {
    if (initialNoteId !== undefined) {
      if (typeof initialNoteId === 'number' && initialNoteId >= 1 && initialNoteId <= PRESET_NOTES.length) {
        setSelectedNote(PRESET_NOTES[initialNoteId - 1]);
      } else if (typeof initialNoteId === 'string') {
        const found = PRESET_NOTES.find(n => n.id === initialNoteId);
        if (found) setSelectedNote(found);
      }
    } else if (activeNoteId) {
      const match = PRESET_NOTES.find(n => n.id === activeNoteId);
      if (match) setSelectedNote(match);
    }
  }, [activeNoteId, initialNoteId]);

  // Handwriting stroke-by-stroke animation when note changes or opens
  useEffect(() => {
    if (!isOpen) return;
    setAnimatedLines(0);
    const interval = setInterval(() => {
      setAnimatedLines(prev => {
        if (prev < selectedNote.content.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isOpen, selectedNote]);

  if (!isOpen) return null;

  const toggleCheck = (idx: number) => {
    soundFX.playClick();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(8); } catch {}
    }
    setCheckedItems(prev => ({
      ...prev,
      [idx.toString()]: !prev[idx.toString()]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Background click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {PRESET_NOTES.map(note => (
              <button
                key={note.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedNote(note);
                  setIsEditing(false);
                }}
                style={{ backgroundColor: note.color }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all shadow-sm ${
                  selectedNote.id === note.id
                    ? 'ring-2 ring-black scale-105 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-100'
                }`}
              >
                <span style={{ color: note.textColor }}>{note.title}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20 ml-2"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Sticky Note Sheet with Tape Header */}
        <div
          style={{ backgroundColor: selectedNote.color }}
          className={`relative w-full rounded-2xl shadow-2xl p-6 sm:p-8 transition-transform duration-300 ${selectedNote.rotation} select-none border border-black/10`}
        >
          {/* Top Tape Strip */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/40 backdrop-blur-sm border-x border-white/50 shadow-sm transform -rotate-1 rounded-sm pointer-events-none" />

          {/* Sticky Header */}
          <div className="flex items-center justify-between border-b border-black/10 pb-3">
            <div>
              <h2
                style={{ color: selectedNote.textColor }}
                className="text-2xl sm:text-3xl font-bold font-display tracking-tight"
              >
                {selectedNote.title}
              </h2>
              {selectedNote.author && (
                <p className="text-xs font-mono opacity-60 mt-0.5" style={{ color: selectedNote.textColor }}>
                  {selectedNote.author}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setIsEditing(!isEditing);
              }}
              className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition"
              title="Add a custom note"
            >
              <Edit2 className="w-4 h-4" style={{ color: selectedNote.textColor }} />
            </button>
          </div>

          {/* Animated Handwritten Lines */}
          <div className="my-5 space-y-3 font-sans text-sm sm:text-base font-medium min-h-[160px]">
            {selectedNote.content.map((line, idx) => {
              const isVisible = idx < animatedLines;
              const isChecked = !!checkedItems[idx.toString()];
              const isCardLink = line.includes('Take my card');

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isCardLink && onTakeCard) {
                      soundFX.playClick();
                      onClose();
                      onTakeCard();
                    } else if (!selectedNote.isDoodle) {
                      toggleCheck(idx);
                    }
                  }}
                  style={{
                    color: selectedNote.textColor,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className={`flex items-start gap-2.5 p-1 rounded-lg cursor-pointer transition hover:bg-black/5 ${
                    isCardLink ? 'font-bold underline' : ''
                  }`}
                >
                  {!selectedNote.isDoodle && (
                    <div
                      className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-black text-white border-black'
                          : 'border-black/30 bg-white/40'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <span className={`flex-1 leading-snug ${isChecked && !selectedNote.isDoodle ? 'line-through opacity-60' : ''}`}>
                    {line}
                  </span>
                </div>
              );
            })}

            {/* Custom note appended if typed */}
            {customText && (
              <div
                style={{ color: selectedNote.textColor }}
                className="flex items-center gap-2 pt-2 border-t border-black/10 text-sm font-semibold italic"
              >
                <span>✏️ {customText}</span>
              </div>
            )}
          </div>

          {/* Custom Edit Input if Opened */}
          {isEditing && (
            <div className="pt-3 border-t border-black/10 flex items-center gap-2 animate-fadeIn">
              <input
                type="text"
                placeholder="Write your note here..."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                    soundFX.playClick();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 border border-black/15 text-xs text-black font-sans focus:outline-none focus:ring-1 focus:ring-black"
                autoFocus
              />
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-mono font-bold"
              >
                Done
              </button>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[11px] font-mono opacity-60" style={{ color: selectedNote.textColor }}>
            <span>TAP ITEM TO TOGGLE</span>
            <span>PRADIPLABS / ZYNX DESK</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex items-center gap-2">
          {selectedNote.id === 'note-hiring' && onTakeCard && (
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
                onTakeCard();
              }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-mono text-xs font-bold shadow-lg transition active:scale-95"
            >
              Pick Up Business Card
            </button>
          )}

          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono border border-white/20 transition shadow"
          >
            Stick Back on Wall (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
