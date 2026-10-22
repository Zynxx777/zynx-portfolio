export type SkillEvidence =
  | "Daily use"
  | "Hands-on practice"
  | "Portfolio project"
  | "Academic exposure"
  | "Foundational"
  | "Recognition"
  | "Current work";

export interface DetailedSkill {
  id: string;
  name: string;
  level: SkillEvidence;
  category: "systems" | "web" | "ece" | "languages" | "security" | "creative";
  categoryLabel: string;
  icon: string;
  detail: string;
  tags: string[];
  command?: string;
  evidence: string;
  accentColor: string;
}

export const SKILL_CATEGORIES = [
  { id: "all", label: "All areas" },
  { id: "systems", label: "Linux & support" },
  { id: "web", label: "Web projects" },
  { id: "ece", label: "ECE & embedded" },
  { id: "languages", label: "Programming foundations" },
  { id: "security", label: "Security" },
  { id: "creative", label: "Music & teaching" },
] as const;

export const SKILL_LEVELS = [
  "Daily use",
  "Hands-on practice",
  "Portfolio project",
  "Academic exposure",
  "Foundational",
  "Recognition",
  "Current work",
] as const;

const skill = (
  id: string,
  name: string,
  level: SkillEvidence,
  category: DetailedSkill["category"],
  categoryLabel: string,
  icon: string,
  detail: string,
  tags: string[],
  evidence: string,
  accentColor: string,
  command?: string,
): DetailedSkill => ({
  id,
  name,
  level,
  category,
  categoryLabel,
  icon,
  detail,
  tags,
  evidence,
  accentColor,
  command,
});

export const ALL_SKILLS: DetailedSkill[] = [
  skill("arch-linux", "Arch Linux desktop use", "Daily use", "systems", "Linux & Support", "/images/skills/arch.svg", "Uses Arch Linux as a personal desktop environment and maintains its configuration and installed applications.", ["Arch Linux", "Desktop environment", "System updates"], "Personal workstation", "border-emerald-400 text-emerald-300"),
  skill("pacman-config", "Pacman configuration", "Hands-on practice", "systems", "Linux & Support", "/images/skills/arch.svg", "Reviewed package-manager configuration and set an update exception for an application that needed to stay pinned.", ["pacman", "Configuration", "Updates"], "Personal workstation maintenance", "border-cyan-400 text-cyan-300"),
  skill("dependency-review", "Package dependency review", "Hands-on practice", "systems", "Linux & Support", "/images/skills/linux.svg", "Checks package dependency trees before deciding whether packages are safe to remove.", ["pactree", "Dependencies", "Package maintenance"], "Used pactree to inspect orphaned-package candidates", "border-cyan-400 text-cyan-300", "pactree -r package-name"),
  skill("desktop-troubleshooting", "Desktop software troubleshooting", "Hands-on practice", "systems", "Linux & Support", "/images/skills/linux.svg", "Looks into application update behavior, package settings, and installed-package dependencies on a personal Linux system.", ["Application updates", "Package configuration", "Issue investigation"], "Recent Arch Linux maintenance work", "border-cyan-400 text-cyan-300"),
  skill("omarchy-config", "Linux desktop configuration", "Daily use", "systems", "Linux & Support", "/images/skills/arch.svg", "Maintains a customized Linux desktop environment and locates the system configuration files that control package updates.", ["Omarchy", "Hyprland", "Desktop configuration"], "Personal Linux environment", "border-emerald-400 text-emerald-300"),

  skill("sm-school-web", "S.M. English School website", "Portfolio project", "web", "Web Projects", "/images/skills/ts.png", "Multi-page school website MVP with responsive layouts, admissions and academic pages, and an admin sign-in prototype.", ["Astro", "Tailwind CSS", "Supabase"], "Personal project repository", "border-purple-400 text-purple-300"),
  skill("portfolio-maintenance", "AI-assisted web project maintenance", "Portfolio project", "web", "Web Projects", "/images/skills/react.png", "Reviews generated code, makes manual design and UI changes, and iterates on a multi-page React portfolio.", ["React", "TypeScript", "Code review", "UI iteration"], "ZYNX portfolio repository", "border-purple-400 text-purple-300"),
  skill("responsive-ui", "Responsive interface iteration", "Portfolio project", "web", "Web Projects", "/images/skills/css.png", "Adjusts layouts, navigation, typography, and controls for phone, tablet, and desktop viewports.", ["CSS", "Responsive layout", "Accessibility"], "Portfolio and school website work", "border-purple-400 text-purple-300"),
  skill("threejs-project", "Interactive 3D web projects", "Portfolio project", "web", "Web Projects", "/images/skills/threejs.svg", "Works with a portfolio codebase that uses Three.js for interactive 3D scenes and visual project presentations.", ["Three.js", "WebGL", "React"], "Portfolio project exposure; not claimed as independent shader engineering", "border-purple-400 text-purple-300"),
  skill("git-project-work", "Git and GitHub project workflow", "Portfolio project", "web", "Web Projects", "/images/skills/git.png", "Maintains web project repositories and reviews changes as part of an AI-assisted development workflow.", ["Git", "GitHub", "Project maintenance"], "Current portfolio and school website repositories", "border-orange-400 text-orange-300"),

  skill("ece-foundation", "Electronics & Communication Engineering", "Academic exposure", "ece", "ECE & Embedded", "/images/skills/c.png", "Formal engineering education covering electronics, communications, networks, embedded systems, and digital design.", ["B.E. ECE", "Electronics", "Computer networks"], "Don Bosco Institute of Technology, 2021–2025", "border-amber-400 text-amber-300"),
  skill("embedded-academic", "Embedded systems coursework", "Academic exposure", "ece", "ECE & Embedded", "/images/skills/arduino.svg", "Academic project and coursework exposure to microcontrollers and embedded system concepts.", ["Embedded systems", "Microcontrollers", "Coursework"], "ECE degree and academic project work", "border-amber-400 text-amber-300"),
  skill("arduino-academic", "Arduino and microcontroller concepts", "Academic exposure", "ece", "ECE & Embedded", "/images/skills/arduino.svg", "Academic exposure to Arduino-based project work and introductory microcontroller use.", ["Arduino", "Embedded project", "Electronics"], "MediVend academic concept", "border-amber-400 text-amber-300"),
  skill("verilog-academic", "Digital logic and Verilog", "Academic exposure", "ece", "ECE & Embedded", "/images/skills/cp.png", "Digital logic and Verilog programming covered through engineering coursework and a technical certificate.", ["Digital logic", "Verilog", "VLSI coursework"], "VLSI and Verilog certificate, July 2024", "border-amber-400 text-amber-300"),
  skill("automotive-concepts", "Automotive systems concepts", "Academic exposure", "ece", "ECE & Embedded", "/images/skills/android.svg", "Academic project exposure to CAN bus and Android Automotive cockpit system concepts.", ["CAN concepts", "AAOS concepts", "ECE project"], "Automotive cockpit academic project", "border-amber-400 text-amber-300"),

  skill("html-css", "HTML and CSS", "Portfolio project", "languages", "Programming Foundations", "/images/skills/html.png", "Uses HTML and CSS in portfolio and school website interfaces, with a focus on layout and responsive presentation.", ["HTML", "CSS", "Tailwind CSS"], "Current web projects", "border-cyan-400 text-cyan-300"),
  skill("javascript-foundations", "JavaScript foundations", "Foundational", "languages", "Programming Foundations", "/images/skills/ts.png", "Building programming fundamentals, including conditionals and basic web scripting.", ["JavaScript", "Programming fundamentals"], "Current learning focus", "border-sky-400 text-sky-300"),
  skill("typescript-foundations", "TypeScript project familiarity", "Foundational", "languages", "Programming Foundations", "/images/skills/ts.png", "Reads and edits TypeScript in an AI-assisted React portfolio codebase.", ["TypeScript", "React", "Code reading"], "Current portfolio maintenance", "border-sky-400 text-sky-300"),
  skill("python-foundations", "Python programming basics", "Foundational", "languages", "Programming Foundations", "/images/skills/py.webp", "Foundational programming knowledge supported by a Python basics certificate.", ["Python", "Programming basics"], "Python certificate, July 2024", "border-sky-400 text-sky-300"),
  skill("c-cpp-academic", "C and C++ coursework", "Academic exposure", "languages", "Programming Foundations", "/images/skills/cpp.png", "Exposure to C and C++ through the Electronics and Communication Engineering curriculum.", ["C", "C++", "ECE coursework"], "Academic background; not presented as professional software experience", "border-amber-400 text-amber-300"),

  skill("bug-bounty", "7chats Messenger bug bounty recognition", "Recognition", "security", "Security", "/images/skills/android.svg", "Existing resume materials record recognition for reporting an authentication issue in the 7chats Messenger application.", ["Responsible disclosure", "Application security"], "Bug bounty contest recognition, September 2021", "border-pink-400 text-pink-300"),
  skill("network-security", "Network security fundamentals", "Foundational", "security", "Security", "/images/skills/linux.svg", "Introductory network security knowledge documented in existing certificate materials.", ["Network security", "Security fundamentals"], "Network Security certificate, February 2025", "border-pink-400 text-pink-300"),

  skill("music-teaching", "Music instruction", "Current work", "creative", "Music & Teaching", "/images/skills/android.svg", "Currently teaches music part-time at St Sophia Convent High School.", ["Music teaching", "Communication", "Current employment"], "Current role, started August 2026", "border-emerald-400 text-emerald-300"),
  skill("music-production", "Music production", "Portfolio project", "creative", "Music & Teaching", "/images/skills/android.svg", "Personal practice in electronic music and audio production, presented as a creative interest alongside the technical profile.", ["7YNX", "FL Studio", "Audio"], "Personal creative work", "border-purple-400 text-purple-300"),
];
