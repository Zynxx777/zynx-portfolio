export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  badge: string;
  award?: string;
  heroImage: string;
  gallery: string[];
  description: string;
  fullOverview: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  author: string;
  message: string;
  drawingData?: string; // Base64 canvas data
}

export const ZYNX_PROFILE = {
  name: "Joshua D",
  handle: "ZYNX",
  producerAlias: "7YNX",
  title: "Electronics & Communication Engineer | Linux Systems & Hardware Craftsman",
  bio: "Electronics & Communication Engineering graduate (DBIT 2021–2025) with deep hands-on expertise in Arch Linux system administration, embedded hardware architecture, and cutting-edge 3D WebGL interfaces. Currently building next-generation hardware like Z Card and crafting tactile digital experiences.",
  email: "joshuajosh3055@gmail.com",
  phone: "+91 72599 87691",
  location: "Channapatna, Karnataka, India",
  education: {
    institution: "Don Bosco Institute of Technology (DBIT)",
    degree: "B.E. in Electronics & Communication Engineering",
    period: "2021 – 2025",
    cgpa: "7.16",
    keyCourses: ["Embedded Systems", "Computer Networks", "VLSI & Digital Logic", "Digital Signal Processing"]
  },
  socials: {
    github: "https://github.com/Zynxx777",
    linkedin: "https://linkedin.com/in/Zynx",
    instagram: "https://instagram.com/zynxx777",
    musicInstagram: "https://instagram.com/7ynx777",
    whatsapp: "https://wa.me/917259987691"
  },
  skills: [
    { name: "Arch Linux & Hyprland", category: "Systems" },
    { name: "Embedded C/C++ & Arduino", category: "Hardware" },
    { name: "Three.js & 3D WebGL", category: "Web Development" },
    { name: "React, TypeScript & Tailwind", category: "Web Development" },
    { name: "Blender 3D & CAD Modeling", category: "3D Design" },
    { name: "Android Automotive OS & CAN", category: "Automotive" },
    { name: "Digital Logic & Verilog", category: "VLSI" },
    { name: "Audio Engineering & FL Studio", category: "Creative" }
  ]
};

export const PROJECTS: Project[] = [
  {
    id: "zcard",
    title: "Z Card v0.1",
    subtitle: "Universal Smart Everything Card",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Flagship Innovation",
    award: "🏆 Flagship Project",
    heroImage: "/images/zcard/blueprint_hero.png",
    gallery: [
      "/images/zcard/blueprint_hero.png",
      "/images/zcard/front.png",
      "/images/zcard/exploded.png",
      "/images/zcard/xray_internal.png",
      "/images/zcard/solar_biometric_detail.png",
      "/images/zcard/side.png"
    ],
    description: "An all-in-one modern payments and universal ID card integrating a bi-stable e-paper display, micro-solar harvesting, planar Qi wireless charging, and on-card biometrics in an ISO/IEC 7810 ID-1 standard form factor.",
    fullOverview: [
      "Consolidates debit, credit, transit, national proof-of-identity, and FIDO2 physical authenticators into one unified smart card.",
      "Engineered with 9 harmonized micro-subsystems: 1.54\" bi-stable E-Paper screen, thin-film a-Si solar ribbon, planar inductive copper coil, 0.45mm solid-state lithium battery pouch, and EAL6+ Secure Element enclave.",
      "Interactive 3D blueprint CAD modeled in Blender 5.2.2 LTS with real-time Three.js WebGL exploded and X-ray inspector.",
      "Embedded C++ firmware and 3D printable snap-fit enclosure prototyped for Seeed XIAO nRF52840 BLE platform."
    ],
    techStack: ["Blender 3D", "Three.js", "Nordic nRF52840", "E-Paper (EPD)", "Qi Inductive", "Secure Element (EAL6+)", "Embedded C++"],
    githubUrl: "https://github.com/Zynxx777/ZCard",
    liveUrl: "http://localhost:5173"
  },
  {
    id: "sm-school",
    title: "S.M. English School",
    subtitle: "Modern Responsive Educational Platform",
    category: "Fullstack Web",
    year: "2026",
    badge: "Production Client",
    award: "⭐ Client Website",
    heroImage: "/images/projects/sm-school-logo.jpg",
    gallery: [
      "/images/projects/sm-school-logo.jpg",
      "/images/projects/lofi-bedroom.jpg"
    ],
    description: "A comprehensive digital presence for S.M. English School featuring interactive admissions inquiry routing, academic syllabus showcases, and faculty directory with Supabase backend.",
    fullOverview: [
      "Built with high-performance Astro and Tailwind CSS for near-instant mobile page loads across rural and suburban connectivity.",
      "Integrated secure Supabase authentication prototype for administrative announcements and circulars.",
      "Full mobile responsiveness tailored for parent smartphone access."
    ],
    techStack: ["Astro", "Tailwind CSS", "Supabase", "TypeScript", "Responsive UI"],
    githubUrl: "https://github.com/Zynxx777/sm-english-school-web"
  },
  {
    id: "arch-workstation",
    title: "Arch Linux Workstation",
    subtitle: "Custom Dotfiles & System Architecture",
    category: "Linux & IT Support",
    year: "2026",
    badge: "Daily Driver",
    award: "🐧 Linux Systems",
    heroImage: "/images/space/gaming-cyber-room.jpg",
    gallery: [
      "/images/space/gaming-cyber-room.jpg",
      "/images/ambient/lofi-study-night.jpg"
    ],
    description: "Personal Arch Linux environment built on Hyprland Wayland compositor, automated pacman hook pipelines, pactree dependency audits, and tailored desktop ergonomics.",
    fullOverview: [
      "Maintained custom dotfiles for rapid developer workstation bootstrap with Waybar, Rofi, and Alacritty.",
      "Routine kernel parameter tuning, systemd daemon performance optimization, and hardware acceleration on Linux.",
      "Hands-on diagnostics for audio pipelines (PipeWire), network interfaces, and Bluetooth Low Energy stacks."
    ],
    techStack: ["Arch Linux", "Hyprland", "Wayland", "Bash / Shell", "Pacman", "Systemd", "PipeWire"],
    githubUrl: "https://github.com/Zynxx777/zynx-dotfiles"
  },
  {
    id: "aaos-cockpit",
    title: "Luxoft AAOS Cockpit",
    subtitle: "Android Automotive Telematics & CAN Bus",
    category: "Automotive Embedded",
    year: "2025",
    badge: "Academic Research",
    award: "🚗 Automotive Tech",
    heroImage: "/images/projects/cockpit-cdc.jpg",
    gallery: [
      "/images/projects/cockpit-cdc.jpg"
    ],
    description: "Android Automotive OS cockpit cluster research and CAN bus vehicle telemetry interfacing developed during Electronics & Communication Engineering studies.",
    fullOverview: [
      "Explored Vehicle Hardware Abstraction Layer (VHAL) interactions and in-vehicle infotainment cluster synchronization.",
      "Simulated CAN bus packet frames for speedometer, battery telemetry, and warning chime bus broadcasts.",
      "Bridged embedded microcontroller sensors with modern Android cockpit UI."
    ],
    techStack: ["Android Automotive (AAOS)", "CAN Bus", "VHAL", "Embedded C", "ECE Telematics"],
    githubUrl: "https://github.com/Zynxx777/luxoft-aaos-project"
  },
  {
    id: "medivend",
    title: "MediVend Smart Dispenser",
    subtitle: "Digital Logic & Smart Dispensing Hardware",
    category: "Hardware & VLSI",
    year: "2025",
    badge: "Hardware Prototype",
    award: "⚡ ECE Hardware",
    heroImage: "/images/projects/medivend-hardware.jpg",
    gallery: [
      "/images/projects/medivend-hardware.jpg"
    ],
    description: "An automated healthcare dispensing prototype synthesizing finite state machines, Verilog digital logic, and Arduino microcontroller stepper control.",
    fullOverview: [
      "Designed hardware schematic and power delivery stages for dispensing stepper servos and optical drop sensors.",
      "Programmed finite state machine in Verilog and integrated Arduino C++ controller for user keypad input.",
      "Built tamper-resistant medicine scheduling logic with real-time buzzer alarms."
    ],
    techStack: ["Arduino", "Verilog HDL", "Digital Logic", "Stepper Actuators", "Circuit Design"],
    githubUrl: "https://github.com/Zynxx777"
  },
  {
    id: "music-lab",
    title: "7YNX Audio Lab",
    subtitle: "Electronic Music & Synthesis",
    category: "Creative & Audio",
    year: "2026",
    badge: "Creative Studio",
    award: "🎵 Music Producer",
    heroImage: "/images/ambient/lofi-study-night.jpg",
    gallery: [
      "/images/ambient/lofi-study-night.jpg"
    ],
    description: "Personal creative audio production studio releasing under the artist alias 7YNX, blending lofi beats, ambient soundscapes, and modular synthesizer sound design.",
    fullOverview: [
      "Composed and mixed original instrumental soundtracks including 'Lofi Study' and 'Regardless'.",
      "Part-time music instruction at St. Sophia Convent High School teaching rhythm, notation, and keyboard basics.",
      "Acoustic treatment, digital audio workstation (DAW) workflow, and VST sound design."
    ],
    techStack: ["FL Studio", "Synthesizers", "Audio Mastering", "Music Theory", "Sound Design"],
    liveUrl: "https://instagram.com/7ynx777"
  }
];

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "entry-1",
    date: "29 Oct 2026",
    author: "Joshua D (ZYNX)",
    message: "Welcome to my desk. Everything you see here is interactive—the laptop runs my live systems, the tablet shows workstation telemetry, and this diary is open for anyone visiting to leave a signature or a sketch. Let's build something great together."
  },
  {
    id: "entry-2",
    date: "28 Oct 2026",
    author: "Elena (UI/UX Architect)",
    message: "Loved the 3D tactile feel of the desk! The warm lamp glow and the seamless transition to the curved showcase carousel is stunning."
  },
  {
    id: "entry-3",
    date: "27 Oct 2026",
    author: "Kavya (ECE Colleague)",
    message: "The Z Card hardware breakdown blew me away. 1.4mm prototype with e-paper and biometric sensor is serious engineering discipline."
  }
];
