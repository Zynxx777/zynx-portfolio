import profileData from "./profile.json";
import { PROJECTS } from "./portfolioData";

export interface ShowcaseProject {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  fullOverview: string[];
  skills: string[];
  badge: string;
  year: string;
  clientOrRole: string;
  award?: string;
  img: string;
  gallery: string[];
  link: string;
  liveUrl?: string;
  slideTheme: {
    bg: string;
    bgSecondary: string;
    accent: string;
    ink: string;
    chapterLabel: string;
    nums: [string, string, string, string];
    editorialQuote: string;
    highlights: string[];
  };
}

const SLIDE_THEMES: Record<string, ShowcaseProject["slideTheme"]> = {
  "zcard-hardware": {
    bg: "#16181c",
    bgSecondary: "#0e1116",
    accent: "#e2d5c8",
    ink: "#f5f4f0",
    chapterLabel: "HW.01",
    nums: ["01", "02", "03", "04"],
    editorialQuote: "Solar-harvested ISO ID-1 titanium architecture.",
    highlights: ["E-Paper 1.54\"", "Micro Solar", "EAL6+ Enclave", "Capacitive Bio"],
  },
  "sm-english-school": {
    bg: "#26282e",
    bgSecondary: "#14171c",
    accent: "#e8b4b8",
    ink: "#f7f3f2",
    chapterLabel: "WEB.02",
    nums: ["02", "03", "04", "05"],
    editorialQuote: "Fast mobile-first admissions & campus publishing.",
    highlights: ["Astro Islands", "Tailwind UI", "Supabase Auth", "Mobile Speed"],
  },
  zynx: {
    bg: "#121318",
    bgSecondary: "#07080c",
    accent: "#d4dce8",
    ink: "#f4f6f9",
    chapterLabel: "3D.03",
    nums: ["03", "04", "05", "06"],
    editorialQuote: "Interactive Three.js bedroom & WebGL gallery realm.",
    highlights: ["Three.js WebGL", "GLSL Shaders", "Work Desk 3D", "Cloud Diary"],
  },
  "arch-linux-workstation": {
    bg: "#191c18",
    bgSecondary: "#0c0f0d",
    accent: "#d8e28c",
    ink: "#f5f7ec",
    chapterLabel: "SYS.04",
    nums: ["04", "05", "06", "07"],
    editorialQuote: "Hyprland compositor, pacman pipelines & PipeWire audio.",
    highlights: ["Arch Linux", "Hyprland WM", "Systemd Tuning", "Pactree Audit"],
  },
  "automotive-cockpit-academic": {
    bg: "#1b1414",
    bgSecondary: "#0f0909",
    accent: "#ef8a62",
    ink: "#faf5f2",
    chapterLabel: "AUTO.05",
    nums: ["05", "06", "07", "08"],
    editorialQuote: "Android Automotive cluster & CAN telemetry prototyping.",
    highlights: ["AAOS Cluster", "CAN Bus", "VHAL Bridge", "Telemetry HUD"],
  },
  "medivend-academic": {
    bg: "#162124",
    bgSecondary: "#0d1417",
    accent: "#9ad6c8",
    ink: "#f2f8f7",
    chapterLabel: "VLSI.06",
    nums: ["06", "07", "08", "09"],
    editorialQuote: "Finite-state Verilog controller & stepper actuation.",
    highlights: ["Verilog FSM", "Arduino Control", "Stepper Servo", "Optical Drop"],
  },
  "music-lab": {
    bg: "#1c1824",
    bgSecondary: "#0b0910",
    accent: "#d6b8e8",
    ink: "#f8f4fb",
    chapterLabel: "7YNX.07",
    nums: ["07", "08", "09", "10"],
    editorialQuote: "Analog textures, afrotonic grooves & nocturnal synth studies.",
    highlights: ["FL Studio", "Synth Design", "Mastering", "7YNX Releases"],
  },
};

const EXTRA_GALLERIES: Record<string, string[]> = {
  "zcard-hardware": PROJECTS[0]?.gallery ?? ["/images/zcard/blueprint_hero.png", "/images/zcard/exploded.png", "/images/zcard/xray_internal.png"],
  "sm-english-school": ["/images/projects/sm-school-logo.jpg", "/images/projects/lofi-bedroom.jpg", "/images/projects/mobile-player.jpg"],
  zynx: ["/og-preview.png", "/images/hero_section.png", "/images/space/black-hole-accretion.jpg"],
  "arch-linux-workstation": ["/images/space/gaming-cyber-room.jpg", "/images/ambient/lofi-study-night.jpg", "/images/gallery/wp12981817-lofi-study-4k-wallpapers.jpg"],
  "automotive-cockpit-academic": ["/images/projects/cockpit-cdc.jpg", "/images/space/deep-nebula-4k.jpg", "/images/space/interstellar-gateway.jpg"],
  "medivend-academic": ["/images/projects/medivend-hardware.jpg", "/images/zcard/v02_enclosure_preview.png", "/images/projects/audio-visualizer.jpg"],
  "music-lab": ["/images/sound/sound-studiojam.jpg", "/images/sound/sound-regardless.jpg", "/images/ambient/lofi-study-night.jpg"],
};

const MATCHED_PORTFOLIO_PROJECT_IDS: Record<string, string> = {
  "zcard-hardware": "zcard",
  "sm-english-school": "sm-school",
  "arch-linux-workstation": "arch-workstation",
  "automotive-cockpit-academic": "aaos-cockpit",
  "medivend-academic": "medivend",
};

const RAW_JSON_PROJECTS: ShowcaseProject[] = profileData.projects.map((raw) => {
  const richMatch = PROJECTS.find((item) => item.id === MATCHED_PORTFOLIO_PROJECT_IDS[raw.id]);
  return {
    id: raw.id,
    name: raw.id === "zcard-hardware" ? "Z Card v0.1" : raw.id === "arch-linux-workstation" ? "Arch Workstation" : raw.id === "automotive-cockpit-academic" ? "Luxoft AAOS" : raw.id === "medivend-academic" ? "MediVend" : raw.name,
    subtitle: richMatch?.subtitle || raw.subtitle,
    category: raw.category,
    description: richMatch?.description || raw.description,
    fullOverview: richMatch?.fullOverview || [
      raw.description,
      `Focus areas: ${raw.skills.join(", ")}.`,
    ],
    skills: richMatch?.techStack || raw.skills,
    badge: raw.badge,
    year: richMatch?.year || (raw.id.includes("academic") ? "2025" : "2026"),
    clientOrRole: raw.category.toUpperCase(),
    award: richMatch?.award,
    img: raw.img,
    gallery: EXTRA_GALLERIES[raw.id] || [raw.img],
    link: raw.link,
    liveUrl: richMatch?.liveUrl,
    slideTheme: SLIDE_THEMES[raw.id] || SLIDE_THEMES.zynx,
  };
});

const musicProject = PROJECTS.find((item) => item.id === "music-lab");

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  ...RAW_JSON_PROJECTS,
  ...(musicProject
    ? [
        {
          id: "music-lab",
          name: musicProject.title,
          subtitle: musicProject.subtitle,
          category: musicProject.category,
          description: musicProject.description,
          fullOverview: musicProject.fullOverview,
          skills: musicProject.techStack,
          badge: musicProject.badge,
          year: musicProject.year,
          clientOrRole: "7YNX SOUND LAB",
          award: musicProject.award,
          img: musicProject.heroImage,
          gallery: EXTRA_GALLERIES["music-lab"],
          link: musicProject.liveUrl || "https://instagram.com/7ynx777",
          liveUrl: musicProject.liveUrl,
          slideTheme: SLIDE_THEMES["music-lab"],
        } satisfies ShowcaseProject,
      ]
    : []),
];
