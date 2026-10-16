import React, { useState, useEffect } from "react";
import { X, Printer, ShieldCheck, Copy, Check, Eye, Moon, Download, Loader2 } from "lucide-react";
import profileData from "../data/profile.json";
import { soundFX } from "../utils/audioFX";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [previewTheme, setPreviewTheme] = useState<"dark" | "print">("dark");
  const [layoutMode, setLayoutMode] = useState<"standard" | "compact">("standard");
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { basics, education, experience, projects, certifications, skills } = profileData;

  // ── ESC Key Gesture to Close Modal ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        soundFX.playClick();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── High-DPI Crisp A4 PDF Generation & Direct Download (html2pdf.js) ──
  const handleDownloadA4Pdf = async () => {
    soundFX.playClick();
    setIsGeneratingPdf(true);

    let sandbox: HTMLElement | null = null;
    try {
      const element = document.getElementById("printable-resume");
      if (!element) return;

      const html2pdfModule = (await import("html2pdf.js")).default;

      // Create an attached offscreen sandbox container with true A4 dimensions
      sandbox = document.createElement("div");
      sandbox.id = "pdf-render-sandbox";
      sandbox.style.position = "fixed";
      sandbox.style.left = "-99999px";
      sandbox.style.top = "0";
      sandbox.style.width = "794px"; // Standard A4 width at 96 DPI (210mm)
      sandbox.style.background = "#ffffff";
      sandbox.style.color = "#0f172a";
      sandbox.style.boxSizing = "border-box";
      sandbox.style.padding = layoutMode === "compact" ? "14px 20px" : "20px 26px";
      sandbox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      sandbox.style.lineHeight = layoutMode === "compact" ? "1.28" : "1.38";
      sandbox.style.fontSize = layoutMode === "compact" ? "9.5pt" : "10pt";
      sandbox.style.zIndex = "-99999";

      // Clone HTML into sandbox
      sandbox.innerHTML = element.innerHTML;

      // Standardize all lines, borders, and colors inside the sandbox
      sandbox.querySelectorAll("*").forEach((el) => {
        const h = el as HTMLElement;
        h.style.color = "#1e293b";
        h.style.borderLeft = "none";

        if (["H1", "H2", "H3", "STRONG", "B"].includes(h.tagName)) {
          h.style.color = "#0f172a";
        }
        if (h.tagName === "H1") {
          h.style.fontSize = layoutMode === "compact" ? "20pt" : "23pt";
          h.style.fontWeight = "800";
          h.style.marginBottom = "2px";
          h.style.lineHeight = "1.15";
          h.style.letterSpacing = "-0.02em";
        }
        if (h.tagName === "H2") {
          h.style.borderBottom = "1.5px solid #0f172a";
          h.style.paddingBottom = "3px";
          h.style.marginTop = layoutMode === "compact" ? "9px" : "13px";
          h.style.marginBottom = layoutMode === "compact" ? "5px" : "7px";
          h.style.fontSize = "10pt";
          h.style.fontWeight = "700";
          h.style.textTransform = "uppercase";
          h.style.letterSpacing = "0.06em";
          h.style.color = "#0f172a";
        }
        if (h.tagName === "A") {
          h.style.color = "#0369a1";
          h.style.textDecoration = "none";
        }
      });

      // Target header divider line
      const headerDivider = sandbox.querySelector(".resume-header-divider") as HTMLElement;
      if (headerDivider) {
        headerDivider.style.borderBottom = "2px solid #0f172a";
        headerDivider.style.paddingBottom = "8px";
        headerDivider.style.marginBottom = "8px";
      }

      // Attach to document body so html2canvas computes accurate geometry & fonts
      document.body.appendChild(sandbox);

      const opt = {
        margin: layoutMode === "compact"
          ? ([6, 8, 6, 8] as [number, number, number, number])
          : ([10, 10, 10, 10] as [number, number, number, number]),
        filename: `Joshua_D_ZYNX_Resume_${layoutMode.toUpperCase()}_A4.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 3, // 300+ DPI razor-sharp output, zero blur or floppiness
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794,
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const, compress: true },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdfModule().set(opt).from(sandbox).save();
      soundFX.playClick();
    } catch (err) {
      console.error("Direct PDF generation fallback to print dialog:", err);
      handlePrintDialog();
    } finally {
      if (sandbox && sandbox.parentNode) {
        sandbox.parentNode.removeChild(sandbox);
      }
      setIsGeneratingPdf(false);
    }
  };

  // ── Dedicated Isolated Iframe Print Engine (Zero Blank Pages) ───────────
  const handlePrintDialog = () => {
    soundFX.playClick();
    const element = document.getElementById("printable-resume");
    if (!element) {
      window.print();
      return;
    }

    let iframe = document.getElementById("resume-print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "resume-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Joshua D (ZYNX) - ATS Resume</title>
        <style>
          @page {
            size: A4 portrait;
            margin: ${layoutMode === "compact" ? "8mm 12mm 8mm 12mm" : "12mm 15mm 12mm 15mm"};
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border-left: none !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            font-size: ${layoutMode === "compact" ? "9.2pt" : "10pt"};
            line-height: ${layoutMode === "compact" ? "1.28" : "1.38"};
            padding: 8px;
            -webkit-font-smoothing: antialiased;
          }
          h1 { font-size: ${layoutMode === "compact" ? "18pt" : "22pt"}; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
          .resume-header-divider { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 8px; }
          h2 {
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #0f172a;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 3px;
            margin-top: ${layoutMode === "compact" ? "9px" : "13px"};
            margin-bottom: 6px;
            font-weight: 700;
          }
          h3 { font-size: 9.5pt; color: #0f172a; font-weight: 700; }
          p, li { color: #1e293b; }
          ul { list-style-type: disc; margin-left: 18px; margin-top: 2px; }
          li { margin-bottom: ${layoutMode === "compact" ? "1px" : "2px"}; }
          a { color: #0369a1; text-decoration: none; }
          .resume-avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .text-cyan-400 { color: #0f172a !important; font-weight: 600; }
          .resume-meta { color: #475569 !important; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 200);
  };

  const copyPlaintext = () => {
    soundFX.playClick();
    const text = `
${basics.name}
${basics.label} | ${basics.sublabel}
Email: ${basics.email} | Phone: ${basics.phone} | Location: ${basics.location.city}, ${basics.location.country}
GitHub: ${basics.profiles.github} | LinkedIn: ${basics.profiles.linkedin} | Portfolio: ${basics.profiles.portfolio}

==================================================
PROFESSIONAL SUMMARY
==================================================
${basics.summary}

==================================================
TECHNICAL SKILLS
==================================================
• Systems & Linux: ${skills.systemsAndLinux.map(s => s.name).join(", ")}
• Automotive & Embedded: ${skills.embeddedAndAutomotive.map(s => s.name).join(", ")}
• Frontend & 3D WebGL: ${skills.frontendAndCreative.map(s => s.name).join(", ")}
• Programming Languages: ${skills.languagesAndBackend.map(s => s.name).join(", ")}
• Security & Audio: ${skills.securityAndAudio.map(s => s.name).join(", ")}

==================================================
PROFESSIONAL EXPERIENCE
==================================================
${experience.map(e => `
${e.role} @ ${e.company} (${e.dates}) - ${e.location} [${e.type}]
${e.highlights.map(h => `• ${h}`).join("\n")}
`).join("\n")}

==================================================
EDUCATION
==================================================
${education.map(ed => `
${ed.institution} - ${ed.degree} (${ed.dates})
${ed.cgpa ? `CGPA: ${ed.cgpa}` : `Score: ${ed.score}`}
`).join("\n")}

==================================================
SELECTED ENGINEERING PROJECTS
==================================================
${projects.map(p => `
${p.name} (${p.subtitle})
Category: ${p.category} | Skills: ${p.skills.join(", ")}
${p.description}
`).join("\n")}

==================================================
HONORS & CERTIFICATIONS
==================================================
${certifications.map(c => `• ${c.title} - ${c.issuer} (${c.date}): ${c.detail}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPrintTheme = previewTheme === "print";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-2 bg-black/85 backdrop-blur-md overflow-y-auto print-modal-backdrop">
      {/* ── Native @media print Fallback ─────────────────────────────────── */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 12mm 15mm;
        }

        @media print {
          header, footer, nav, #hero, #projects, #skills, #experience, #contact, .no-print {
            display: none !important;
          }

          html, body, #root, #root > div {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            position: static !important;
            font-size: 10pt !important;
            line-height: 1.35 !important;
            -webkit-font-smoothing: antialiased;
          }

          .print-modal-backdrop {
            display: block !important;
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
          }

          .print-modal-container {
            display: block !important;
            position: static !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #printable-resume {
            display: block !important;
            position: static !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }

          #printable-resume * {
            border-left: none !important;
          }

          #printable-resume h1,
          #printable-resume h2,
          #printable-resume h3,
          #printable-resume strong,
          #printable-resume b {
            color: #0f172a !important;
          }

          #printable-resume .resume-header-divider {
            border-bottom: 2px solid #0f172a !important;
            padding-bottom: 8px !important;
            margin-bottom: 8px !important;
          }

          #printable-resume h2 {
            border-bottom: 1.5px solid #0f172a !important;
            padding-bottom: 2px !important;
            margin-top: 10px !important;
            margin-bottom: 5px !important;
            color: #0f172a !important;
          }

          #printable-resume p,
          #printable-resume li,
          #printable-resume span {
            color: #1e293b !important;
          }

          #printable-resume a {
            color: #0369a1 !important;
            text-decoration: none !important;
          }

          .resume-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Modal Dialog Container */}
      <div className={`print-modal-container relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl transition-all duration-300 ${
        isPrintTheme
          ? "bg-white text-gray-900 border border-gray-300 shadow-xl"
          : "cyber-glass border border-white/20 bg-[#09090f] text-zinc-100"
      }`}>
        
        {/* ── Top Control Bar (Hidden on print) ──────────────────────────── */}
        <div className="no-print flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              ATS-Standard Verification
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden sm:inline-block">
              ESC to close
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Layout Mode: Standard vs Compact 1-Page */}
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1 text-[11px] font-mono">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setLayoutMode("standard");
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  layoutMode === "standard"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Full comprehensive 2-page ATS resume with all projects and bullet points"
              >
                📑 Standard (2-Page)
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setLayoutMode("compact");
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  layoutMode === "compact"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Surgically formatted 1-page compact ATS resume"
              >
                📄 Compact (1-Page)
              </button>
            </div>

            {/* Preview Theme: Cyber Dark vs Clean Paper White */}
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1 text-[11px] font-mono">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setPreviewTheme("dark");
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  previewTheme === "dark" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
                title="Cyber Dark on-screen view"
              >
                <Moon size={14} />
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setPreviewTheme("print");
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  previewTheme === "print" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
                title="Paper White print preview"
              >
                <Eye size={14} />
              </button>
            </div>

            {/* Copy Plaintext button */}
            <button
              onClick={copyPlaintext}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-all"
              title="Copy clean plaintext for ATS online job applications"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            {/* Direct Instant A4 PDF Download via JavaScript */}
            <button
              onClick={handleDownloadA4Pdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-400/25 flex items-center gap-2 cursor-pointer hover:scale-105 disabled:opacity-50"
              title="Generate a crisp, un-floppy A4 PDF file directly via JavaScript and download immediately"
            >
              {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isGeneratingPdf ? "Building Crisp A4 PDF..." : "Download A4 PDF"}</span>
            </button>

            {/* Secondary Print Dialog Trigger */}
            <button
              onClick={handlePrintDialog}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all"
              title="Open vector print dialog"
            >
              <Printer size={15} />
            </button>

            {/* Close button with ESC indicator */}
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors ml-1"
              aria-label="Close resume (or press ESC)"
              title="Close (ESC)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── THE PRINTABLE ATS RESUME SHEET ──────────────────────────────── */}
        <div
          id="printable-resume"
          className={`font-sans leading-relaxed transition-colors ${
            isPrintTheme ? "text-slate-900" : "text-zinc-200"
          } ${layoutMode === "compact" ? "text-[11px] space-y-3.5" : "text-xs space-y-5"}`}
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* Header Block with Crisp Solid Horizontal Rule */}
          <div className={`resume-header-divider pb-4 border-b ${isPrintTheme ? "border-slate-900" : "border-white/15"}`}>
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <div>
                <h1 className={`text-3xl font-display font-extrabold tracking-tight ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  {basics.name}
                </h1>
                <p className={`font-mono text-xs font-bold mt-0.5 ${isPrintTheme ? "text-slate-800" : "text-cyan-400"}`}>
                  {basics.label}
                </p>
                <p className={`font-mono text-[11px] ${isPrintTheme ? "text-slate-600" : "text-zinc-400"}`}>
                  {basics.sublabel}
                </p>
              </div>

              <div className={`text-right sm:text-left font-mono text-[11px] space-y-0.5 ${isPrintTheme ? "text-slate-600" : "text-zinc-400"}`}>
                <p>{basics.location.city}, {basics.location.region}, {basics.location.country}</p>
                <p>{basics.email} | {basics.phone}</p>
                <div className={`flex gap-2 justify-end sm:justify-start ${isPrintTheme ? "text-sky-700 font-semibold" : "text-cyan-400"}`}>
                  <a href={basics.profiles.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                  <span>•</span>
                  <a href={basics.profiles.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <span>•</span>
                  <a href={basics.profiles.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-1.5 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Professional Summary
            </h2>
            <p className={`leading-relaxed ${isPrintTheme ? "text-slate-800" : "text-zinc-300"}`}>
              {basics.summary}
            </p>
          </div>

          {/* Technical Skills Stack (Clean Aligned Rows, Zero Asymmetry) */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-2 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Technical Skills & Competencies
            </h2>
            <div className={`space-y-1.5 ${isPrintTheme ? "text-slate-800" : "text-zinc-300"}`}>
              <div className="flex flex-col sm:flex-row">
                <span className={`w-52 font-semibold flex-shrink-0 ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  • Automotive & Embedded:
                </span>
                <span className="flex-1">
                  Android Automotive OS (AAOS), Vehicle HAL (VHAL), CAN Bus (CAN 2.0B / OBD-II), Cockpit CDC, VLSI & Verilog HDL, Arduino Microcontrollers, MCP2515 Transceivers, Embedded C/C++.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row">
                <span className={`w-52 font-semibold flex-shrink-0 ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  • Systems, Linux & DevOps:
                </span>
                <span className="flex-1">
                  Arch Linux (Daily Driver), Linux Kernel Diagnostics (/proc, cgroups), AOSP Custom ROM Compilation, POSIX Shell (Bash/Zsh), Systemd, Docker, Git / CI/CD Workflows, Neovim.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row">
                <span className={`w-52 font-semibold flex-shrink-0 ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  • Frontend & 3D WebGL:
                </span>
                <span className="flex-1">
                  React 19, Next.js, TypeScript, Three.js, WebGL, GLSL Shaders, Web Audio API, Tailwind CSS, HTML5 Canvas, RESTful APIs, Node.js / Express.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row">
                <span className={`w-52 font-semibold flex-shrink-0 ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  • Programming Languages:
                </span>
                <span className="flex-1">
                  C, C++, Python, JavaScript (ESNext), TypeScript, Rust (Foundations), Go (Golang), Kotlin, Java, Dart.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row">
                <span className={`w-52 font-semibold flex-shrink-0 ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                  • Security & Audio Production:
                </span>
                <span className="flex-1">
                  7chats Bug Bounty Winner (Authentication Bypass), Reverse Engineering (JADX, Frida, Burp Suite), Network Security, FL Studio 21 Signature (Power User), Wavetable Sound Design (Serum/Vital).
                </span>
              </div>
            </div>
          </div>

          {/* Professional Experience (Clean Horizontal Separation, No Left Border Artifacts) */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-2.5 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Professional & Engineering Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="resume-avoid-break space-y-1">
                  {/* Row 1: Role on left, Dates on right */}
                  <div className="flex justify-between items-baseline w-full">
                    <h3 className={`font-bold text-xs ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                      {exp.role} <span className={isPrintTheme ? "text-slate-700 font-semibold" : "text-cyan-400 font-semibold"}>@ {exp.company}</span>
                    </h3>
                    <span className={`font-mono text-[10.5px] flex-shrink-0 ${isPrintTheme ? "text-slate-600" : "text-zinc-400"}`}>
                      {exp.dates}
                    </span>
                  </div>

                  {/* Row 2: Location & Type */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>{exp.location}</span>
                    <span className="uppercase tracking-wider">{exp.type}</span>
                  </div>

                  {/* Bullet Highlights */}
                  <ul className={`list-disc list-outside ml-4 space-y-1 pt-0.5 ${isPrintTheme ? "text-slate-700" : "text-zinc-300"}`}>
                    {(layoutMode === "compact" ? exp.highlights.slice(0, 2) : exp.highlights).map((pt, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education Block */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-2 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Education & Academic Credentials
            </h2>
            <div className="space-y-2.5">
              {education.map((edu, idx) => (
                <div key={idx} className="resume-avoid-break space-y-0.5">
                  <div className="flex justify-between items-baseline w-full">
                    <h3 className={`font-bold text-xs ${isPrintTheme ? "text-slate-900" : "text-white"}`}>{edu.institution}</h3>
                    <span className={`font-mono text-[10px] flex-shrink-0 ${isPrintTheme ? "text-slate-600" : "text-zinc-400"}`}>
                      {edu.dates}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px]">
                    <p className={isPrintTheme ? "text-slate-700" : "text-zinc-400"}>{edu.degree}</p>
                    {edu.cgpa && (
                      <span className={`font-mono font-bold text-[10.5px] ${isPrintTheme ? "text-slate-900" : "text-cyan-400"}`}>
                        CGPA: {edu.cgpa}
                      </span>
                    )}
                    {edu.score && (
                      <span className={`font-mono text-[10px] ${isPrintTheme ? "text-slate-600" : "text-zinc-400"}`}>
                        Score: {edu.score}
                      </span>
                    )}
                  </div>
                  {layoutMode === "standard" && edu.courses && (
                    <p className={`text-[10px] ${isPrintTheme ? "text-slate-500" : "text-zinc-500"}`}>
                      Coursework: {edu.courses.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Engineering Projects */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-2 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Selected Engineering Projects
            </h2>
            <div className="space-y-2.5">
              {(layoutMode === "compact" ? projects.slice(0, 3) : projects.slice(0, 4)).map((p) => (
                <div key={p.id} className="resume-avoid-break space-y-0.5">
                  <div className="flex justify-between items-baseline w-full">
                    <h3 className={`font-bold text-xs ${isPrintTheme ? "text-slate-900" : "text-white"}`}>
                      {p.name} — <span className={`font-normal font-mono ${isPrintTheme ? "text-slate-700" : "text-cyan-400"}`}>{p.subtitle}</span>
                    </h3>
                    <span className={`font-mono text-[10px] ${isPrintTheme ? "text-slate-500" : "text-zinc-500"}`}>
                      [{p.skills.join(", ")}]
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isPrintTheme ? "text-slate-700" : "text-zinc-400"}`}>
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Honors & Certifications */}
          <div className="resume-avoid-break">
            <h2 className={`font-mono text-xs uppercase font-bold tracking-wider mb-2 pb-1 border-b ${
              isPrintTheme ? "text-slate-900 border-slate-900" : "text-cyan-400 border-cyan-400/30"
            }`}>
              Honors, Certifications & Awards
            </h2>
            <ul className={`list-disc list-outside ml-4 space-y-1 ${isPrintTheme ? "text-slate-700" : "text-zinc-300"}`}>
              {certifications.map((c, idx) => (
                <li key={idx} className="resume-avoid-break leading-relaxed">
                  <strong className={isPrintTheme ? "text-slate-900" : "text-white"}>{c.title}</strong> — {c.issuer} ({c.date}): <span className={isPrintTheme ? "text-slate-600 text-[11px]" : "text-zinc-400 text-[11px]"}>{c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
