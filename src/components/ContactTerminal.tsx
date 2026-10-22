import React, { useState, useRef } from "react";
import { Mail, Phone, MessageSquare, Send, Check, Copy, ExternalLink, Terminal } from "lucide-react";
import profileData from "../data/profile.json";

export const ContactTerminal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const formBoxRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

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
    const subject = encodeURIComponent(`Project Collaboration from ${name}`);
    const body = encodeURIComponent(`Hi Joshua,\n\n${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${profileData.basics.email}?subject=${subject}&body=${body}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formBoxRef.current) return;
    const rect = formBoxRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  return (
    <section id="contact" className="py-24 px-6 sm:px-12 max-w-[1700px] mx-auto scroll-mt-20 border-t border-white/10">
      <div className="mb-14 text-left">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">
          <Terminal size={14} className="text-cyan-400" />
          <span>06 // CONTACT &amp; OPPORTUNITIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
          Let’s talk about <span className="text-white/40">the next role.</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-xl">
          Interested in entry-level IT support, desktop support, junior Linux administration, and junior software roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Verified Endpoints */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-medium text-lg text-white">Direct Communication Endpoints</h3>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Reach out directly across any verified channel below.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Email */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:border-cyan-400/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-cyan-300" />
                  <span className="text-zinc-200">{profileData.basics.email}</span>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
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

        {/* Right: Interactive Transmission Form with Mouse Spotlight */}
        <div
          ref={formBoxRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos(prev => ({ ...prev, active: false }))}
          className="lg:col-span-7 relative p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl"
        >
          {mousePos.active && (
            <div
              className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-200"
              style={{
                background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.08), transparent 70%)`,
              }}
            />
          )}

          <form onSubmit={handleSendMail} className="space-y-5 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Your Name / Organization
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@company.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-2 uppercase tracking-wider text-[11px]">
                Project Scope / Technical Requirement
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Brief us on your software engineering opportunity, system architecture, or timeline..."
                className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <span>Transmit Message</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
