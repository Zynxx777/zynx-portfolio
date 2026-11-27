import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type Project } from '../data/portfolioData';
import { ArrowLeft, ExternalLink, Sparkles, Layers } from 'lucide-react';

interface ShowcaseCarousel3DProps {
  onSelectProject: (project: Project) => void;
  onOpenProfile: () => void;
  onOpenNewsletter: () => void;
  onSwitchToBedroom: () => void;
  onOpenAnatomy?: () => void;
}

// ── Z Card v0.1 Flagship Showcase Collection ──────────────────────────────────
// Dedicated exclusively to the Z Card hardware architecture and exploded engineering views.
const ZCARD_SHOWCASE_CARDS: Project[] = [
  {
    id: "zcard",
    title: "Z Card v0.1 — Blueprint Architecture",
    subtitle: "Nordic nRF52840 SoC • Dual-core BLE 5.3 & NFC Controller",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Flagship Innovation",
    award: "Next-Gen Smart Card",
    heroImage: "/images/zcard/blueprint_hero.png",
    gallery: [
      "/images/zcard/front.png",
      "/images/zcard/back.png",
      "/images/zcard/exploded.png",
      "/images/zcard/xray_internal.png",
      "/images/zcard/solar_biometric_detail.png"
    ],
    description: "All-in-one smart credit/debit card replacement and universal ID card with flexible E-Ink display, solar harvester, solid-state battery, and biometric security.",
    fullOverview: [
      "Ultra-slim 1.4mm profile complying with ISO/IEC 7810 standard",
      "Dynamic flexible E-Paper display for barcode, QR, and multiple card numbers",
      "Energy harvesting via ambient solar and Qi inductive wireless charging",
      "Military-grade secure element with hardware biometric authentication"
    ],
    techStack: ["Blender 3D", "Three.js", "Nordic nRF52840", "E-Paper (EPD)", "Qi Inductive", "Embedded C++"],
    githubUrl: "https://github.com/Zynxx777/ZCard",
    liveUrl: "http://localhost:5173"
  },
  {
    id: "zcard",
    title: "Z Card v0.1 — Flexible E-Ink Display",
    subtitle: "Dynamic Card Switcher • Barcode, QR & Real-time Balance Display",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Interactive Screen",
    award: "Zero-Power Standby",
    heroImage: "/images/zcard/front.png",
    gallery: ["/images/zcard/blueprint_hero.png", "/images/zcard/front.png"],
    description: "Bi-stable electrophoretic front panel requiring 0.0mA static holding power. Retains payment credentials, loyalty cards, and travel passes indefinitely without battery drain.",
    fullOverview: [
      "2.9-inch flexible active-matrix E-Ink panel",
      "Full sunlight readability with zero glare",
      "Capacitive touch slider for toggling payment accounts",
      "Real-time encrypted balance and transaction docket"
    ],
    techStack: ["E-Paper (EPD)", "SPI Bus", "Capacitive Touch", "Nordic BLE", "Ultra-thin FPC"],
    githubUrl: "https://github.com/Zynxx777/ZCard"
  },
  {
    id: "zcard",
    title: "Z Card v0.1 — Qi Inductive Coil & Solar",
    subtitle: "High-Efficiency Resonance Charging • Solid-State Battery",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Infinite Power",
    award: "Harvesting Subsystem",
    heroImage: "/images/zcard/back.png",
    gallery: ["/images/zcard/back.png", "/images/zcard/solar_biometric_detail.png"],
    description: "Ultra-thin planar copper coil paired with perimeter photovoltaic cells, providing continuous passive recharging from ambient office lighting and NFC payment terminals.",
    fullOverview: [
      "Qi compliant 13.56MHz inductive resonance harvesting",
      "Planar micro-coil printed directly on multi-layer substrate",
      "Solid-state lithium ceramic pouch cell (5000+ charge cycles)",
      "Zero degradation under card bending and flex tests"
    ],
    techStack: ["Qi Inductive", "Solar Harvesting", "Power Management IC", "Solid-State Battery"],
    githubUrl: "https://github.com/Zynxx777/ZCard"
  },
  {
    id: "zcard",
    title: "Z Card v0.1 — 9-Layer Stack Architecture",
    subtitle: "Titanium Chassis • Anti-Flex Enclosure • Micro-Sensors",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Mechanical Stack",
    award: "9-Layer Dissection",
    heroImage: "/images/zcard/exploded.png",
    gallery: ["/images/zcard/exploded.png", "/images/zcard/blueprint_hero.png"],
    description: "Precision exploded engineering stack combining sapphire-coated top cover, flexible display, rigid-flex HDI PCB, lithium ceramic cell, and CNC titanium perimeter bezel.",
    fullOverview: [
      "Aviation-grade titanium perimeter ring to withstand 250N torsional flex",
      "Hermetically sealed IP68 water and dust resistance",
      "6-layer ultra-thin HDI micro-via circuit core",
      "Integrated 6-pin ISO gold smart contact pad"
    ],
    techStack: ["Blender 3D", "CAD / CAM", "Titanium CNC", "Rigid-Flex PCB", "IP68 Enclosure"],
    githubUrl: "https://github.com/Zynxx777/ZCard"
  },
  {
    id: "zcard",
    title: "Z Card v0.1 — Internal X-Ray Circuitry",
    subtitle: "EAL6+ Secure Cryptographic Enclave • Biometric Match-on-Card",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Silicon Interior",
    award: "Security Core",
    heroImage: "/images/zcard/xray_internal.png",
    gallery: ["/images/zcard/xray_internal.png", "/images/zcard/blueprint_hero.png"],
    description: "Sub-millimeter component placement showing the Nordic dual-core MCU, discrete secure element, haptic micro-actuator, and surface-mount antenna array.",
    fullOverview: [
      "EAL6+ certified secure tamper-resistant vault",
      "AES-256 and ECC hardware acceleration",
      "Haptic confirmation feedback on tap-to-pay",
      "Active anti-tamper mesh coating preventing chip decapsulation"
    ],
    techStack: ["Secure Element", "Hardware Crypto", "X-Ray Inspection", "Tamper Resistance"],
    githubUrl: "https://github.com/Zynxx777/ZCard"
  },
  {
    id: "zcard",
    title: "Z Card v0.1 — Biometric Sensor & Solar Array",
    subtitle: "Capacitive Fingerprint Match • Ambient Photovoltaic Strip",
    category: "Hardware & 3D CAD",
    year: "2026",
    badge: "Biometric Auth",
    award: "Zero PIN Authentication",
    heroImage: "/images/zcard/solar_biometric_detail.png",
    gallery: ["/images/zcard/solar_biometric_detail.png", "/images/zcard/front.png"],
    description: "High-resolution 508 DPI capacitive fingerprint scanner seamlessly flush with the card surface, ensuring transactions can only be authorized by the verified owner's touch.",
    fullOverview: [
      "Sub-200ms biometric match-on-card verification",
      "Zero PIN or signature needed at payment terminals",
      "Liveness detection preventing spoof silicone molds",
      "Monocrystalline micro-solar ribbon for trickle charging"
    ],
    techStack: ["Capacitive Fingerprint", "Biometric Algorithms", "Micro-Solar", "Embedded Security"],
    githubUrl: "https://github.com/Zynxx777/ZCard"
  }
];

export const ShowcaseCarousel3D: React.FC<ShowcaseCarousel3DProps> = ({
  onSelectProject,
  onOpenProfile,
  onOpenNewsletter,
  onSwitchToBedroom,
  onOpenAnatomy
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<Project>(ZCARD_SHOWCASE_CARDS[0]);

  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const cardsMeshGroupRef = useRef<THREE.Group | null>(null);

  const displayProjects = ZCARD_SHOWCASE_CARDS;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020305);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0.0, 0.35, 3.4);
    camera.lookAt(0.0, 0.0, 0.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(0, 2.5, 3.5);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00f0ff, 1.6);
    cyanRim.position.set(-2, -1, 1);
    scene.add(cyanRim);

    // 3. Perspective 3D Grid Floor (Infinite Grid matching jesperlandberg.com)
    const gridHelper = new THREE.GridHelper(30, 60, 0x1e293b, 0x090d16);
    gridHelper.position.y = -0.75;
    scene.add(gridHelper);

    // 4. Cylindrical Curved 3D Carousel Cards
    const carouselGroup = new THREE.Group();
    cardsMeshGroupRef.current = carouselGroup;
    scene.add(carouselGroup);

    const textureLoader = new THREE.TextureLoader();
    const radius = 2.25; // Radius of cylinder arc
    const count = displayProjects.length;
    const angleStep = (Math.PI * 2) / count;

    const cardMeshes: THREE.Mesh[] = [];

    displayProjects.forEach((proj, idx) => {
      // Create curved card geometry (bent along X)
      const cardW = 1.38;
      const cardH = 0.88;
      const geo = new THREE.PlaneGeometry(cardW, cardH, 32, 1);

      // Bend vertices along cylindrical curve
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        // Subtle concave bend matching jesperlandberg.com
        const z = - (Math.sin((x / cardW) * Math.PI) * 0.09);
        pos.setZ(i, z);
      }
      geo.computeVertexNormals();

      // Texture
      const texture = textureLoader.load(
        proj.heroImage,
        () => renderer.render(scene, camera),
        undefined,
        () => {
          // Fallback colored gradient canvas texture
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 420;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const grad = ctx.createLinearGradient(0, 0, 640, 420);
            grad.addColorStop(0, '#090d16');
            grad.addColorStop(1, '#020408');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 640, 420);
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 36px monospace';
            ctx.fillText(proj.title, 40, 200);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '20px sans-serif';
            ctx.fillText(proj.subtitle, 40, 240);
          }
          const canvasTexture = new THREE.CanvasTexture(canvas);
          mesh.material = new THREE.MeshStandardMaterial({
            map: canvasTexture,
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.32,
        metalness: 0.15,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { projectIndex: idx, project: proj };
      cardMeshes.push(mesh);
      carouselGroup.add(mesh);
    });

    // Raycasting for Clicking Cards
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseXRef.current = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      if (isDraggingRef.current) {
        const deltaX = clientX - prevMouseXRef.current;
        prevMouseXRef.current = clientX;
        targetRotationRef.current += deltaX * 0.0042;
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetRotationRef.current += e.deltaY * 0.0016;
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.project) {
          onSelectProject(hit.userData.project);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // Animation & Inertia Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Inertia Interpolation
      rotationRef.current += (targetRotationRef.current - rotationRef.current) * 0.085;
      const curRot = rotationRef.current;

      // Position cards on cylindrical perimeter
      let closestDist = Infinity;
      let closestProj = displayProjects[0];

      cardMeshes.forEach((mesh, idx) => {
        const angle = idx * angleStep + curRot;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - radius * 0.65;
        const y = 0.0;

        mesh.position.set(x, y, z);
        mesh.rotation.y = angle;

        // Active center card detection
        const distToCenter = Math.abs(x) + Math.abs(z - (radius - radius * 0.65));
        if (distToCenter < closestDist) {
          closestDist = distToCenter;
          closestProj = displayProjects[idx];
        }
      });

      if (closestProj.title !== activeProject.title) {
        setActiveProject(closestProj);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [displayProjects]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#020305]">
      {/* Top Header Bar */}
      <header className="absolute top-0 inset-x-0 z-20 p-6 md:p-8 flex items-center justify-between text-xs font-mono tracking-widest text-white uppercase pointer-events-none">
        <div className="pointer-events-auto font-bold flex items-center gap-3">
          <button
            onClick={onSwitchToBedroom}
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>JOSHUA D (ZYNX)</span>
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
            FLAGSHIP Z CARD SHOWCASE
          </span>
        </div>

        <button
          onClick={onOpenProfile}
          className="pointer-events-auto hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-bold"
        >
          PROFILE
        </button>
      </header>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Center / Bottom Active Card Metadata */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center max-w-xl px-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeProject.category} · {activeProject.year}</span>
          {activeProject.award && (
            <span className="text-amber-300 font-bold">· {activeProject.award}</span>
          )}
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg font-display">
          {activeProject.title}
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-md mx-auto drop-shadow-sm font-sans line-clamp-1">
          {activeProject.subtitle}
        </p>

        <div className="mt-3.5 flex items-center justify-center gap-2 pointer-events-auto">
          <button
            onClick={() => onSelectProject(activeProject)}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 shadow-lg hover:border-cyan-400"
          >
            Open Project Case Study <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Direct Anatomy Dissection Trigger */}
          {onOpenAnatomy && (
            <button
              onClick={onOpenAnatomy}
              className="px-4 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold transition-all inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Anatomy Dissection</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="absolute bottom-0 inset-x-0 z-20 p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest text-slate-400 uppercase pointer-events-none">
        {/* Left: Indicator */}
        <div className="pointer-events-auto flex items-center gap-2 text-cyan-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Z CARD HARDWARE STACK</span>
        </div>

        {/* Center: Switcher to 3D Bedroom */}
        <div className="pointer-events-auto">
          <button
            onClick={onSwitchToBedroom}
            className="px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Switch to 3D Bedroom
          </button>
        </div>

        {/* Right: Newsletter / Connect */}
        <div className="pointer-events-auto">
          <button
            onClick={onOpenNewsletter}
            className="hover:text-cyan-400 transition-colors font-bold"
          >
            CONNECT / NEWSLETTER
          </button>
        </div>
      </footer>
    </div>
  );
};
