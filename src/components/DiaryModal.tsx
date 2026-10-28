import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, PenTool, Type, PlusCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('zynx_diary_entries');
      return saved ? JSON.parse(saved) : INITIAL_DIARY_ENTRIES;
    } catch {
      return INITIAL_DIARY_ENTRIES;
    }
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [mode, setMode] = useState<'write' | 'draw'>('write');
  const [authorName, setAuthorName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasAddedPage, setHasAddedPage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem('zynx_diary_entries', JSON.stringify(entries));
  }, [entries]);

  // Setup drawing canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && mode === 'write') return;

    let drawingDataUrl: string | undefined = undefined;
    if (canvasRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL();
    }

    const newEntry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: authorName.trim() || 'A Friendly Visitor',
      message: messageText.trim() || 'Left a handwritten sketch in the diary.',
      drawingData: mode === 'draw' ? drawingDataUrl : undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    setMessageText('');
    setAuthorName('');
    clearCanvas();
    setCurrentPageIndex(0);
    setHasAddedPage(true);
    setTimeout(() => setHasAddedPage(false), 3000);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  if (!isOpen) return null;

  const currentEntry = entries[currentPageIndex] || entries[0];
  const totalPages = entries.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Top Action Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-sm text-slate-300 font-mono">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to the desk
          </button>

          <span className="text-xs text-slate-400 italic font-sans">
            {totalPages} pages written
          </span>
        </div>

        {/* Realistic Lined Open Book */}
        <div className="w-full rounded-2xl bg-[#fbf7ee] text-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-amber-900/20 overflow-hidden relative min-h-[500px] flex flex-col md:flex-row">
          
          {/* Book Spine Center Shadow */}
          <div className="hidden md:block absolute left-1/2 inset-y-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/25 to-black/10 pointer-events-none z-10"></div>
          
          {/* Red Margin Rule on Left & Right Pages */}
          <div className="hidden md:block absolute left-[38px] inset-y-0 w-[1px] bg-red-400/40 pointer-events-none z-10"></div>
          <div className="hidden md:block absolute left-[calc(50%+38px)] inset-y-0 w-[1px] bg-red-400/40 pointer-events-none z-10"></div>

          {/* Left Page: Reading Past Entries */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between relative bg-[#fdfbf6] border-b md:border-b-0 md:border-r border-amber-200/60">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-6 pb-2 border-b border-amber-200/50">
                <span className="italic">Page {currentPageIndex + 1} of {totalPages}</span>
                <span className="text-slate-600 font-semibold">{currentEntry?.date}</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-['Caveat'] text-2xl text-slate-900 leading-tight">
                  Dear diary...
                </h3>

                <p className="font-['Caveat'] text-xl text-slate-800 leading-relaxed min-h-[140px] whitespace-pre-wrap">
                  {currentEntry?.message}
                </p>

                {currentEntry?.drawingData && (
                  <div className="p-2 rounded border border-amber-300/40 bg-white/60">
                    <img 
                      src={currentEntry.drawingData} 
                      alt="Handwritten sketch" 
                      className="max-h-32 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-amber-200/50 flex items-center justify-between">
              <span className="font-['Caveat'] text-xl text-slate-700 italic">
                from {currentEntry?.author || 'Anonymous'}
              </span>

              {/* Flipper Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPageIndex(p => Math.min(p + 1, totalPages - 1))}
                  disabled={currentPageIndex >= totalPages - 1}
                  className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => setCurrentPageIndex(p => Math.max(p - 1, 0))}
                  disabled={currentPageIndex <= 0}
                  className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Page: Write or Draw New Entry */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-[#fbf7ee]">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-4 pb-2 border-b border-amber-200/50">
                <span className="uppercase tracking-wider font-semibold">Leave your signature</span>
                <span className="text-emerald-700 font-medium">Anyone can write</span>
              </div>

              {/* Input Mode Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('write')}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    mode === 'write'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-black/5 text-slate-600 hover:bg-black/10'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" /> Write Text
                </button>
                <button
                  type="button"
                  onClick={() => setMode('draw')}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    mode === 'draw'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-black/5 text-slate-600 hover:bg-black/10'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" /> Draw / Sketch
                </button>

                {mode === 'draw' && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-red-600 underline ml-auto"
                  >
                    Clear sketch
                  </button>
                )}
              </div>

              {/* Form Content */}
              <form id="diary-form" onSubmit={handleAddPage} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your name or handle..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/70 border border-amber-300/80 text-sm font-['Caveat'] text-xl focus:outline-none focus:border-slate-800"
                  />
                </div>

                {mode === 'write' ? (
                  <div>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your note, thoughts, or feedback for Joshua..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/70 border border-amber-300/80 text-sm font-['Caveat'] text-xl leading-relaxed focus:outline-none focus:border-slate-800 resize-none"
                    ></textarea>
                  </div>
                ) : (
                  <div className="border border-dashed border-amber-400/80 rounded-xl bg-white/80 overflow-hidden relative cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 touch-none block"
                    />
                    <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-400 font-mono">
                      Draw with mouse / finger
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-4 border-t border-amber-200/50 flex items-center justify-between">
              {hasAddedPage ? (
                <div className="text-emerald-700 font-medium text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Your page was added to Joshua's diary!
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">
                  Saved locally in guestbook
                </span>
              )}

              <button
                type="submit"
                form="diary-form"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add my page
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
