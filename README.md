# ZYNX // Joshua D — Next-Gen 3D Portfolio Ecosystem

An immersive, cybernetic personal website and portfolio ecosystem built for **Joshua D (ZYNX / 7YNX)** — Electronics & Communication Engineer, Automotive Cockpit (AAOS) Developer, Linux Kernel Enthusiast, and Electronic Music Producer.

Designed with inspiration from:
- **[Lusion.co](https://lusion.co/)**: Fluid physics-driven interactive particle canvas reacting to cursor velocity and proximity.
- **[ChainGPT](https://www.chaingpt.org/#solutions)**: Cybernetic dark glassmorphism aesthetic, glowing neon borders, and real-time telemetry pills.
- **[aengel.io / CGTrader](https://aengel.io/lite/cgtrader)**: Interactive 3D bedroom & studio showroom with Three.js camera orbit controls, animated lighting, and interactive inspection targets (PC Workstation, 7YNX Audio Rig, Hardware & Bookshelf).
- **[Jesper Landberg](https://jesperlandberg.com/)**: Kinetic monospace typography and title rotation.
- **[moto-card](https://www.moto-card)**: 3D perspective tilt cards with holographic specular light glare.

---

## 🚀 Key Features

1. **Lusion Particle Fluid Canvas Hero**:
   - 120+ interactive spring-physics nodes reacting to cursor disturbance and restoring toward equilibrium.
   - Jesper Landberg-style rotating kinetic role badge.
   - Quick telemetry tags and direct links.

2. **3D Interactive Bedroom & Studio (CGTrader Style)**:
   - Full Three.js 3D viewport featuring procedural low-poly workstation setup (multi-monitor PC, glowing keyboard, audio monitors, MIDI controller, neon strip lights).
   - Orbit controls (rotate, zoom, pan) with auto-rotation.
   - Camera inspection presets:
     - `Studio Overview`: Bird's-eye isometric view
     - `PC Workstation`: Zoom into dual-screen coding terminal & Arch Linux rig
     - `7YNX Audio Rig`: Close-up of synth racks and studio monitors
     - `Books & Hardware`: Close-up of embedded hardware and reference books

3. **moto-card 3D Interactive Project Showcase**:
   - 3D perspective tilt with real-time radial specular glare calculated on mouse move.
   - Filterable by domain: All, Automotive & Embedded, 3D & WebGL, Software & Mobile.
   - Real authentic projects: Cockpit CDC (Luxoft), MediVend, 7chats Vulnerability Disclosure, Discord Clone, 3D Personal Space, Kashi OS.

4. **7YNX Cyber Sound Lab (Web Audio API)**:
   - Real-time 32-bin FFT frequency spectrum visualizer rendered onto HTML5 canvas.
   - Interactive audio player loaded with authentic tracks (*Regardless*, *Studio Jam*).
   - Producer credentials, DAW toolchain (FL Studio, Ableton, Serum, FabFilter).

5. **ATS-Optimized Interactive Resume Modal**:
   - Recruiter-friendly clean print stylesheet (`window.print()` / Save as PDF).
   - Complete authentic credentials: DBIT ECE degree, CDC Luxoft AAOS development, MediVend, 7chats Bug Bounty, certifications.

6. **Interactive Linux Terminal & Contact**:
   - Interactive shell with simulated commands (`help`, `bio`, `skills`, `projects`, `music`, `contact`, `clear`).
   - Quick copy for email (`joshuawilliam2801@gmail.com`) with instant feedback.
   - Social links to GitHub, LinkedIn, Instagram, and Discord.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Audio Engine**: Native Web Audio API (`AudioContext`, `AnalyserNode`)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom cyber-glass, neon glows, and gradient utilities
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Development

```bash
# Navigate to the project
cd /home/zynx/Projects/zynx-portfolio

# Install dependencies (already installed)
npm install

# Start the local development server
npm run dev

# Open in browser:
# http://localhost:5173
```

### Production Build

```bash
# Typecheck & build bundle
npm run build

# Preview production build locally
npm run preview
```

The output files are generated inside `dist/`.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)
```bash
npx vercel
```
Or connect your GitHub repository to Vercel — framework preset will automatically detect Vite.

### Deploy to Netlify
```bash
npx netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages
Add `"base": "/zynx-portfolio/"` to `vite.config.ts`, build, and deploy the `dist/` folder.

---

## 📄 License
MIT © Joshua D (ZYNX / 7YNX). All rights reserved.
