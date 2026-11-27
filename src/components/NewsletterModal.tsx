import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const raw = localStorage.getItem("zynx_subscribers") || "[]";
      const list = JSON.parse(raw);
      list.push({ email: email.trim(), date: new Date().toISOString() });
      localStorage.setItem("zynx_subscribers", JSON.stringify(list));
    } catch {
      // ignore storage errors
    }

    setSubscribed(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="showcase-profile-overlay fixed inset-0 z-[95] flex items-center justify-center bg-black/88 p-4 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter dispatch"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-5 top-5 z-50 px-1 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/75 transition hover:text-white sm:right-[5vw] sm:top-7"
      >
        Close
      </button>

      {/* Monolithic refractive glass sphere echoing jesperlandberg.com's lens */}
      <div className="relative flex aspect-square w-full max-w-[440px] flex-col items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#050608]/95 p-8 text-center shadow-[0_0_90px_rgba(255,255,255,0.08),inset_0_0_50px_rgba(255,255,255,0.06)] sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-transparent bg-gradient-to-tr from-white/25 via-transparent to-rose-200/20 opacity-60 blur-[1px]"
        />
        <div className="relative z-10 max-w-xs space-y-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            Newsletter · Dispatch
          </p>
          <h3 className="text-lg font-medium tracking-tight text-white sm:text-xl">
            Occasional notes from Joshua D
          </h3>
          <p className="text-[12px] leading-[1.6] text-white/75">
            Hardware builds, Arch Linux tweaks, 3D WebGL experiments, and 7YNX releases. No noise.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Subscribed · Thank you</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-[280px] items-center gap-2">
              <input
                ref={inputRef}
                type="email"
                required
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-white/20 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-zinc-200"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
