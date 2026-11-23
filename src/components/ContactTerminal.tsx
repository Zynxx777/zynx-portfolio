import React, { useState, useRef } from "react";
import { Mail, Phone, MessageSquare, Send, Check, Copy, ExternalLink, Terminal } from "lucide-react";
import profileData from "../data/profile.json";

export const ContactTerminal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const formBoxRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileData.basics.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.href = `mailto:${profileData.basics.email}`;
    }
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${name}`);
    const body = encodeURIComponent(`Hi Joshua,\n\n${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${profileData.basics.email}?subject=${subject}&body=${body}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ("ontouchstart" in window || !formBoxRef.current || !sheenRef.current) return;
    const rect = formBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    sheenRef.current.style.opacity = "1";
    sheenRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(34, 211, 238, 0.08), transparent 70%)`;
  };

  const handleMouseLeave = () => {
    if (sheenRef.current) sheenRef.current.style.opacity = "0";
  };

  return (
    <section id="contact" className="py-20 sm:py-24 px-5 sm:px-12 max-w-[1600px] mx-auto scroll-mt-20 border-t border-white/10">
      <div className="mb-12 text-left">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
          <Terminal size={14} className="text-cyan-400" />
          <span>05 // CONTACT &amp; OPPORTUNITIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.04em] text-white mt-3">
          Get in <span className="text-white/40">touch.</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2.5 max-w-xl leading-relaxed">
          Open to entry-level IT support, desktop support, junior Linux administration, and junior web engineering roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Direct Channels */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-medium text-lg text-white">Direct Channels</h3>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Reach out directly via email, phone, or messaging.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Email */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-cyan-400/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={16} className="text-cyan-300 shrink-0" />
                  <span className="text-zinc-200 truncate">{profileData.basics.email}</span>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
                  title="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-300 font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span className="text-[10px]">COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={profileData.basics.profiles.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:border-emerald-400/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-emerald-400" />
                  <span className="text-zinc-200">WhatsApp Direct</span>
                </div>
                <ExternalLink size={14} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </a>

              {/* Phone */}
              <a
                href={`tel:${profileData.basics.phone}`}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:border-purple-400/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-purple-400" />
                  <span className="text-zinc-200">{profileData.basics.phone}</span>
                </div>
                <ExternalLink size={14} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Social Row */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Profiles</span>
            <div className="flex items-center gap-2">
              <a
                href={profileData.basics.profiles.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-zinc-300 transition-all"
                title="GitHub"
              >
                <span className="font-mono text-xs font-bold">GH</span>
              </a>
              <a
                href={profileData.basics.profiles.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-zinc-300 transition-all"
                title="LinkedIn"
              >
                <span className="font-mono text-xs font-bold">IN</span>
              </a>
              <a
                href={profileData.basics.profiles.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-zinc-300 transition-all"
                title="Instagram"
              >
                <span className="font-mono text-xs font-bold">IG</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Contact Form with Mouse Spotlight */}
        <div
          ref={formBoxRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-7 relative p-6 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl"
        >
          <div
            ref={sheenRef}
            className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-200"
          />

          <form onSubmit={handleSendMail} className="relative z-10 space-y-5 font-mono text-xs">
            <div>
              <label htmlFor="contact-name" className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Your Name / Organization
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or company"
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share details about the role, team, or inquiry..."
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send Message</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
