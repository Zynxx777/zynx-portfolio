import React, { useState } from "react";
import { Mail, Phone, MessageSquare, Send, Check, Copy, ExternalLink } from "lucide-react";
import profileData from "../data/profile.json";

export const ContactTerminal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const copyEmail = () => {
    navigator.clipboard.writeText(profileData.basics.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project Collaboration from ${name}`);
    const body = encodeURIComponent(`Hi Joshua,\n\n${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${profileData.basics.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-5xl mx-auto scroll-mt-20">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-cyan-400"></span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            06 // INITIATE TRANSMISSION
          </span>
          <span className="w-8 h-px bg-cyan-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Let's Build Something Revolutionary
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Available for software engineering roles, automotive software consulting, 3D web contracts, and music production.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Left: Contact Info & Verified Channels */}
        <div className="col-span-5 lg:col-span-12 cyber-glass border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Direct Channels</h3>
            <p className="text-xs text-zinc-400 font-sans mb-6">
              Reach out directly across any of my active verified communication endpoints.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Email with copy button */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-cyan-400" />
                  <span className="text-zinc-300">{profileData.basics.email}</span>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={profileData.basics.profiles.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-emerald-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-emerald-400" />
                  <span className="text-zinc-300">WhatsApp Direct</span>
                </div>
                <ExternalLink size={14} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </a>

              {/* Phone */}
              <a
                href={`tel:${profileData.basics.phone}`}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-purple-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-purple-400" />
                  <span className="text-zinc-300">{profileData.basics.phone}</span>
                </div>
                <ExternalLink size={14} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
            <a
              href={profileData.basics.profiles.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href={profileData.basics.profiles.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-zinc-300 hover:text-cyan-300 transition-colors"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href={profileData.basics.profiles.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-pink-500/10 text-zinc-300 hover:text-pink-300 transition-colors"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: Interactive Terminal Form */}
        <div className="col-span-7 lg:col-span-12 cyber-glass border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSendMail} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider">Project / Inquiry Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project, timeline, or engineering opportunity..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-bold tracking-wider uppercase transition-all shadow-lg shadow-cyan-400/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Send size={15} />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
