import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const list = JSON.parse(localStorage.getItem('zynx_subscribers') || '[]');
      list.push({ email, date: new Date().toISOString() });
      localStorage.setItem('zynx_subscribers', JSON.stringify(list));
    } catch {
      // fallback
    }

    setSubscribed(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-hidden">
      
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-2 transition-colors group"
      >
        <span>CLOSE</span>
        <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
          <X className="w-4 h-4" />
        </div>
      </button>

      {/* Refractive Capsule / Bubble Form (matching frame_015.png) */}
      <div className="relative w-full max-w-lg aspect-square max-h-[75vh] rounded-full p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-[0_0_120px_rgba(0,240,255,0.18)] border border-white/20 overflow-hidden bg-gradient-to-br from-slate-950/95 via-[#080c14]/95 to-slate-950/95 backdrop-blur-2xl">
        
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-tr from-cyan-400/25 via-transparent to-purple-400/25 pointer-events-none blur-[2px]"></div>

        <div className="relative z-10 max-w-sm space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            Connect & Dispatch
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            An occasional dispatch with technical breakdowns, hardware experiments, and Linux systems engineering insights from Joshua.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>You're subscribed! Thanks for joining.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-xs mx-auto">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-slate-900/90 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-white text-slate-950 hover:bg-cyan-400 transition-colors flex items-center justify-center shrink-0 shadow-lg"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-[10px] font-mono text-slate-500">
            Zero spam. Unsubscribe anytime with one click.
          </div>
        </div>
      </div>
    </div>
  );
};
