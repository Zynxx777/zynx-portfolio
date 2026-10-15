import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Monitor, Music, BookOpen, Layers, RotateCcw, CloudRain, Volume2, VolumeX, Cpu } from "lucide-react";
import { rainAmbience } from "../utils/rainAmbience";

export const Room3DStudio: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activePreset, setActivePreset] = useState<string>("overview");
  const [activeInspect, setActiveInspect] = useState<{
    title: string;
    desc: string;
    tags: string[];
  } | null>(null);
  const [ambientAudioActive, setAmbientAudioActive] = useState<boolean>(() => rainAmbience.isPlaying);

  useEffect(() => {
    return rainAmbience.subscribe(setAmbientAudioActive);
  }, []);

  // ── Inspection presets ──────────────────────────────────────────────────────
  const presets = [
    { id: "overview",  label: "Studio Overview",  pos: [7, 6, 8],    target: [0, 1.2, 0],       icon: Layers  },
    { id: "desk",      label: "PC Workstation",   pos: [1, 3.2, 3],  target: [-0.4, 1.8, -0.5], icon: Monitor },
    { id: "audio",     label: "7YNX Audio Rig",   pos: [-2.5, 3, 3], target: [-1.5, 1.5, -0.3], icon: Music   },
    { id: "shelf",     label: "Books & Hardware", pos: [4, 3.5, 3],  target: [3, 2.5, -3],      icon: BookOpen},
    { id: "pc",        label: "Server & Case",    pos: [2.5, 2.5, 2],target: [2.2, 1.5, -0.8],  icon: Cpu     },
  ];

  const inspectData: Record<string, { title: string; desc: string; tags: string[] }> = {
    desk: {
      title: "PC Workstation",
      desc: "Dual curved monitors running Arch Linux + Hyprland. Left: AAOS Cockpit Domain Controller debugger. Right: Neovim LSP session with a custom tree-sitter config.",
      tags: ["Arch Linux", "Hyprland", "Neovim", "AAOS", "Wayland"],
    },
    audio: {
      title: "7YNX Sound Station",
      desc: "FL Studio 21 open on a melodic techno session. MIDI keyboard, studio monitor pair (angled for sweet-spot), and sidechain-heavy sub-bass patches loaded.",
      tags: ["FL Studio 21", "MIDI", "Serum", "FabFilter", "Melodic Techno"],
    },
    shelf: {
      title: "Hardware Archive & Bookshelf",
      desc: "VLSI Digital Design textbooks, Arduino Mega prototyping boards, CAN bus transceiver modules, and a custom Raspberry Pi cluster kit.",
      tags: ["VLSI", "Arduino", "CAN Bus", "R-Pi", "Electronics"],
    },
    pc: {
      title: "Battlestation Case",
      desc: "Custom PC tower with ARGB strip lighting synced to audio. Handles Android Automotive OS source compiles, AOSP ROM builds, and GPU accelerated shader work.",
      tags: ["ARGB", "AOSP Build", "GLSL", "GPU", "Custom Loop"],
    },
  };

  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const targetLookAt   = useRef(new THREE.Vector3(0, 1.2, 0));
  const targetCamPos   = useRef(new THREE.Vector3(7, 6, 8));

  const changePreset = (presetId: string) => {
    setActivePreset(presetId);
    const p = presets.find((x) => x.id === presetId);
    if (p) {
      targetCamPos.current.set(p.pos[0], p.pos[1], p.pos[2]);
      targetLookAt.current.set(p.target[0], p.target[1], p.target[2]);
      setActiveInspect(presetId !== "overview" ? inspectData[presetId] ?? null : null);
    }
  };

  // ── Procedural ambient lo-fi rain (persists across navigation until reload) ──
  const toggleAmbientAudio = () => {
    rainAmbience.toggle();
  };

  // ── Three.js Scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#040408");
    scene.fog = new THREE.FogExp2("#040408", 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 120);
    camera.position.set(7, 6, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight("#1a1a2e", 1.4);
    scene.add(ambient);

    const deskLight = new THREE.PointLight("#ffbb66", 3.0, 9);
    deskLight.position.set(0.2, 3.2, 0);
    deskLight.castShadow = true;
    scene.add(deskLight);

    const cyanSpot = new THREE.SpotLight("#00F2FE", 6, 22, Math.PI / 5, 0.45, 1.2);
    cyanSpot.position.set(-6, 7, 4);
    cyanSpot.target.position.set(0, 1, 0);
    cyanSpot.castShadow = true;
    scene.add(cyanSpot); scene.add(cyanSpot.target);

    const purpleBack = new THREE.PointLight("#9D4EDD", 5, 18);
    purpleBack.position.set(5, 6, -4);
    scene.add(purpleBack);

    const pinkAccent = new THREE.PointLight("#F72585", 2, 10);
    pinkAccent.position.set(-4, 2, 3);
    scene.add(pinkAccent);

    // ── Texture loader ────────────────────────────────────────────────────────
    const tl = new THREE.TextureLoader();
    const texCockpit  = tl.load("/images/projects/cockpit-cdc.jpg");
    const texAudio    = tl.load("/images/projects/audio-visualizer.jpg");
    const texLofi     = tl.load("/images/ambient/lofi-study-night.jpg");
    const texRain     = tl.load("/images/ambient/soothing-rain.jpg");
    const texBlackhole = tl.load("/images/blackhole.jpeg");

    // ── Room shell ────────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: "#0a0a12", roughness: 0.85, metalness: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 28, "#00F2FE", "#101025");
    gridHelper.position.y = 0.012;
    scene.add(gridHelper);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 20);
    const ceilMat = new THREE.MeshStandardMaterial({ color: "#060610", roughness: 1 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 7;
    scene.add(ceil);

    // Back wall
    const bwMat = new THREE.MeshStandardMaterial({ color: "#070710", roughness: 0.95 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 0.18), bwMat);
    backWall.position.set(0, 4, -4.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 8, 20), bwMat.clone());
    leftWall.position.set(-7.5, 4, 0);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 8, 20), bwMat.clone());
    rightWall.position.set(7.5, 4, 0);
    scene.add(rightWall);

    // ── LED strip along ceiling edge (emissive boxes) ─────────────────────────
    const ledMat = new THREE.MeshStandardMaterial({ color: "#00F2FE", emissive: "#00F2FE", emissiveIntensity: 2.5 });
    const ledStrip = (x1: number, z1: number, x2: number, z2: number) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const geo = new THREE.BoxGeometry(len, 0.04, 0.06);
      const mesh = new THREE.Mesh(geo, ledMat);
      mesh.position.set(mx, 6.88, mz);
      mesh.rotation.y = -angle;
      scene.add(mesh);
    };
    ledStrip(-7, -4.4, 7, -4.4);   // back
    ledStrip(-7.4, -4.4, -7.4, 4); // left
    ledStrip(7.4, -4.4, 7.4, 4);   // right

    // ── Wall art frames ───────────────────────────────────────────────────────
    const frameMat = new THREE.MeshStandardMaterial({ color: "#111130", roughness: 0.4, metalness: 0.7 });
    const addPoster = (tex: THREE.Texture, px: number, py: number, pw: number, ph: number, hasGlow?: string) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.12, ph + 0.12, 0.06), frameMat);
      f.position.set(px, py, -4.38);
      scene.add(f);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tex }));
      p.position.set(px, py, -4.34);
      scene.add(p);
      if (hasGlow) {
        const glow = new THREE.PointLight(hasGlow, 1.5, 4);
        glow.position.set(px, py, -3.5);
        scene.add(glow);
      }
    };
    addPoster(texLofi,     -4.2, 4.6, 3.0, 1.8, "#9D4EDD");
    addPoster(texRain,      0.5, 4.6, 2.6, 1.6);
    addPoster(texBlackhole, 4.5, 4.5, 2.2, 2.2, "#00F2FE");

    // ── Desk surface ──────────────────────────────────────────────────────────
    const deskMat = new THREE.MeshStandardMaterial({ color: "#10101e", roughness: 0.35, metalness: 0.65 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.14, 2.1), deskMat);
    desk.position.set(0, 1.42, -0.5);
    desk.castShadow = true; desk.receiveShadow = true;
    scene.add(desk);

    // Desk LED underglow strip
    const deskGlowMat = new THREE.MeshStandardMaterial({ color: "#00F2FE", emissive: "#00F2FE", emissiveIntensity: 1.8 });
    const deskGlow = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.03, 0.04), deskGlowMat);
    deskGlow.position.set(0, 1.24, 0.51);
    scene.add(deskGlow);

    // Desk legs (metallic L-shape style)
    const legMat = new THREE.MeshStandardMaterial({ color: "#00c0cc", metalness: 0.9, roughness: 0.15 });
    const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.42);
    [[-2.4, 0.71, -1.35], [2.4, 0.71, -1.35], [-2.4, 0.71, 0.35], [2.4, 0.71, 0.35]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(x, y, z); scene.add(leg);
    });

    // ── Dual monitors ─────────────────────────────────────────────────────────
    const bezelMat = new THREE.MeshStandardMaterial({ color: "#080810", roughness: 0.3, metalness: 0.5 });
    const addMonitor = (tex: THREE.Texture, x: number, ry: number) => {
      // Bezel
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.0, 0.065), bezelMat);
      bezel.position.set(x, 2.25, -0.75); bezel.rotation.y = ry;
      scene.add(bezel);
      // Screen
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.58, 0.88), new THREE.MeshBasicMaterial({ map: tex }));
      screen.position.set(x + Math.sin(ry) * 0.04, 2.25, -0.75 + Math.cos(ry) * 0.04);
      screen.rotation.y = ry;
      scene.add(screen);
      // Screen glow
      const sg = new THREE.PointLight("#4FACFE", 0.8, 2.5);
      sg.position.set(x, 2.25, -0.2); scene.add(sg);
      // Stand
      const standPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), bezelMat);
      standPost.position.set(x, 1.74, -0.75); scene.add(standPost);
      const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.04, 16), bezelMat);
      standBase.position.set(x, 1.49, -0.75); scene.add(standBase);
    };
    addMonitor(texCockpit, -0.88, 0.18);
    addMonitor(texAudio,    0.88, -0.18);

    // ── Keyboard (low profile mech) ───────────────────────────────────────────
    const kbMat = new THREE.MeshStandardMaterial({ color: "#14142a", roughness: 0.5, metalness: 0.3 });
    const kb = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.038, 0.42), kbMat);
    kb.position.set(-0.1, 1.5, -0.15); scene.add(kb);
    // Keyboard RGB strip
    const kbLedMat = new THREE.MeshStandardMaterial({ color: "#9D4EDD", emissive: "#9D4EDD", emissiveIntensity: 2 });
    const kbLed = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.01, 0.02), kbLedMat);
    kbLed.position.set(-0.1, 1.52, 0.04); scene.add(kbLed);

    // ── Mouse + mousepad ──────────────────────────────────────────────────────
    const padMat = new THREE.MeshStandardMaterial({ color: "#0c0c1a", roughness: 0.9 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.012, 0.55), padMat);
    pad.position.set(1.0, 1.496, -0.15); scene.add(pad);

    const mouseMat = new THREE.MeshStandardMaterial({ color: "#181828", roughness: 0.3, metalness: 0.5 });
    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.2), mouseMat);
    mouse.position.set(1.0, 1.52, -0.15); scene.add(mouse);

    // ── PC Case (custom tower) ────────────────────────────────────────────────
    const pcMat = new THREE.MeshStandardMaterial({ color: "#0b0b18", metalness: 0.85, roughness: 0.18 });
    const pcCase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.35, 0.95), pcMat);
    pcCase.position.set(2.4, 2.17, -0.6);
    pcCase.castShadow = true; scene.add(pcCase);

    // PC RGB side panel window (emissive tinted glass)
    const pcGlassMat = new THREE.MeshStandardMaterial({
      color: "#00F2FE", emissive: "#00F2FE", emissiveIntensity: 0.3,
      transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.2
    });
    const pcGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 1.28), pcGlassMat);
    pcGlass.position.set(2.12, 2.17, -0.6); pcGlass.rotation.y = Math.PI / 2;
    scene.add(pcGlass);

    // PC internal RGB glow light
    const pcGlowL = new THREE.PointLight("#00F2FE", 2.0, 2.5);
    pcGlowL.position.set(2.4, 2.2, -0.6); scene.add(pcGlowL);

    // Fan circles on front panel
    const fanMat = new THREE.MeshStandardMaterial({ color: "#1a1a35", roughness: 0.4 });
    [2.2, 2.6].forEach((y) => {
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), fanMat);
      fan.rotation.z = Math.PI / 2;
      fan.position.set(2.69, y, -0.6); scene.add(fan);
    });

    // ── Headphones on desk stand (proper upright orientation with cradle) ───────
    const hpMat = new THREE.MeshStandardMaterial({ color: "#111124", roughness: 0.28, metalness: 0.65 });
    const hpMetal = new THREE.MeshStandardMaterial({ color: "#697488", metalness: 0.85, roughness: 0.2 });
    const hpX = -2.3;
    const hpZ = -0.8;
    const hpCradleZ = hpZ + 0.08;

    const hpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.03, 20), hpMat);
    hpBase.position.set(hpX, 1.49, hpZ); scene.add(hpBase);

    const hpStand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.62, 16), hpMat);
    hpStand.position.set(hpX, 1.80, hpZ); scene.add(hpStand);

    const hpCradleArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.10, 10), hpMetal);
    hpCradleArm.rotation.x = Math.PI / 2;
    hpCradleArm.position.set(hpX, 2.11, hpZ + 0.04); scene.add(hpCradleArm);

    const hpCradle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.06), new THREE.MeshStandardMaterial({ color: "#222533" }));
    hpCradle.position.set(hpX, 2.10, hpCradleZ); scene.add(hpCradle);

    // Headband arc (upright, apex at Y = 2.10)
    const hpCurve = new THREE.TorusGeometry(0.16, 0.018, 10, 28, Math.PI);
    const hpArc = new THREE.Mesh(hpCurve, hpMat);
    hpArc.position.set(hpX, 1.94, hpCradleZ);
    scene.add(hpArc);

    // Ear cups hanging DOWN on the left and right, facing each other along X
    const earcupMat = new THREE.MeshStandardMaterial({ color: "#0a0a1e", roughness: 0.35, metalness: 0.7 });
    const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 20), earcupMat);
    const cushionMat = new THREE.MeshStandardMaterial({ color: "#181b24", roughness: 0.9 });
    [-1, 1].forEach((side) => {
      const cupX = hpX + side * 0.17;
      const cupY = 1.78;

      // Slider link
      const link = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), hpMetal);
      link.position.set(hpX + side * 0.16, 1.86, hpCradleZ); scene.add(link);

      // Cup body (facing inward/outward along X)
      const ec = earcup.clone();
      ec.rotation.z = Math.PI / 2;
      ec.position.set(cupX, cupY, hpCradleZ); scene.add(ec);

      // Inward ear cushion
      const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 8, 20), cushionMat);
      cushion.rotation.y = Math.PI / 2;
      cushion.position.set(cupX - side * 0.018, cupY, hpCradleZ); scene.add(cushion);
    });

    // ── MIDI Synthesizer keyboard ─────────────────────────────────────────────
    const synthMat = new THREE.MeshStandardMaterial({ color: "#0e0e1e", roughness: 0.35 });
    const synth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.09, 0.52), synthMat);
    synth.position.set(-1.6, 1.52, -0.38); scene.add(synth);

    // Synth keys (white key bars)
    const whiteKeyMat = new THREE.MeshStandardMaterial({ color: "#dde0f0" });
    const blackKeyMat = new THREE.MeshStandardMaterial({ color: "#080812" });
    for (let i = 0; i < 12; i++) {
      const wk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.35), whiteKeyMat);
      wk.position.set(-2.3 + i * 0.144, 1.57, -0.28); scene.add(wk);
    }
    for (const off of [0.072, 0.216, 0.504, 0.648, 0.792]) {
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.22), blackKeyMat);
      bk.position.set(-2.3 + off, 1.585, -0.2); scene.add(bk);
    }

    // Studio monitor speakers
    const spkMat = new THREE.MeshStandardMaterial({ color: "#161624", roughness: 0.5, metalness: 0.3 });
    const addSpeaker = (x: number, ry: number) => {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.36), spkMat);
      cab.position.set(x, 2.15, -0.9); cab.rotation.y = ry; scene.add(cab);
      // Woofer cone
      const woofer = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16), new THREE.MeshStandardMaterial({ color: "#222" }));
      woofer.rotation.x = Math.PI / 2;
      woofer.position.set(x + Math.sin(ry) * 0.2, 2.1, -0.9 + Math.cos(ry) * 0.19); scene.add(woofer);
      // Tweeter
      const tweet = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshStandardMaterial({ color: "#444" }));
      tweet.position.set(x + Math.sin(ry) * 0.2, 2.26, -0.9 + Math.cos(ry) * 0.19); scene.add(tweet);
      // Speaker glow
      const sg = new THREE.PointLight("#ffaa44", 0.6, 1.8);
      sg.position.set(x, 2.15, -0.6); scene.add(sg);
    };
    addSpeaker(-2.1, 0.32);
    addSpeaker( 2.1, -0.32);

    // ── Bookshelf (right wall) ────────────────────────────────────────────────
    const shelfMat = new THREE.MeshStandardMaterial({ color: "#0f0f1d", roughness: 0.6, metalness: 0.3 });
    // Shelf unit back panel
    const shelfUnit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.8, 0.18), shelfMat);
    shelfUnit.position.set(3.8, 2.8, -3.9); scene.add(shelfUnit);
    // 4 shelf planks
    [1.0, 1.9, 2.8, 3.7].forEach((y) => {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.5), shelfMat);
      plank.position.set(3.8, y, -3.7); scene.add(plank);
    });
    // Books (colored box strips)
    const bookColors = ["#3a0070","#00608c","#6d1c00","#005c2a","#5c005c","#1c3c00","#7c4000"];
    let bx = 2.55;
    bookColors.forEach((col, i) => {
      const w = 0.1 + Math.random() * 0.09;
      const h = 0.35 + Math.random() * 0.15;
      const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.36), bMat);
      book.position.set(bx + w / 2, 1.17, -3.7);
      scene.add(book);
      bx += w + 0.02;
      if (i === 3) bx = 2.55; // second shelf row
    });
    // Arduino on shelf
    const aruMat = new THREE.MeshStandardMaterial({ color: "#005f77", roughness: 0.6 });
    const aru = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.2), aruMat);
    aru.position.set(3.9, 2.07, -3.7); scene.add(aru);
    // Shelf accent light
    const shelfLight = new THREE.PointLight("#9D4EDD", 1.2, 2.5);
    shelfLight.position.set(3.8, 4.0, -3.4); scene.add(shelfLight);

    // ── Chair ─────────────────────────────────────────────────────────────────
    const chairMat = new THREE.MeshStandardMaterial({ color: "#0c0c1e", roughness: 0.6, metalness: 0.4 });
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), chairMat);
    seat.position.set(0, 0.82, 1.2); scene.add(seat);
    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.1), chairMat);
    back.position.set(0, 1.48, 0.78); scene.add(back);
    // Armrests
    [-0.42, 0.42].forEach((xOff) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.55), chairMat);
      arm.position.set(xOff, 1.05, 1.12); scene.add(arm);
    });
    // Chair base (5-star)
    const baseGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: "#252535", metalness: 0.7, roughness: 0.2 });
    const basePost = new THREE.Mesh(baseGeo, baseMat);
    basePost.position.set(0, 0.38, 1.2); scene.add(basePost);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55), baseMat);
      spoke.rotation.z = Math.PI / 2;
      spoke.position.set(Math.cos(angle) * 0.27, 0.09, 1.2 + Math.sin(angle) * 0.27);
      scene.add(spoke);
    }
    // Casters
    const casterMat = new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const caster = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), casterMat);
      caster.position.set(Math.cos(angle) * 0.5, 0.05, 1.2 + Math.sin(angle) * 0.5);
      scene.add(caster);
    }

    // ── Small desk props ──────────────────────────────────────────────────────
    // Coffee mug
    const mugMat = new THREE.MeshStandardMaterial({ color: "#1a1a30", roughness: 0.5, metalness: 0.2 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.15, 16), mugMat);
    mug.position.set(-2.0, 1.575, 0.2); scene.add(mug);
    // Mug glow (warm coffee steam feel)
    const mugGlow = new THREE.PointLight("#ff8844", 0.5, 0.8);
    mugGlow.position.set(-2.0, 1.75, 0.2); scene.add(mugGlow);

    // Small plant / succulent
    const potMat = new THREE.MeshStandardMaterial({ color: "#3a1800", roughness: 0.9 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.1, 10), potMat);
    pot.position.set(1.9, 1.55, 0.2); scene.add(pot);
    const plantMat = new THREE.MeshStandardMaterial({ color: "#1a5c1a", roughness: 0.9 });
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), plantMat);
    plant.scale.set(1, 0.7, 1);
    plant.position.set(1.9, 1.67, 0.2); scene.add(plant);

    // Small action figure / collectible on shelf
    const figMat = new THREE.MeshStandardMaterial({ color: "#c0c0d0", roughness: 0.3, metalness: 0.7 });
    const figBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.12, 4, 8), figMat);
    figBody.position.set(4.6, 2.17, -3.72); scene.add(figBody);
    const figHead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), figMat);
    figHead.position.set(4.6, 2.38, -3.72); scene.add(figHead);

    // ── Orbit drag controls (mouse + touch) ───────────────────────────────────
    let isDragging = false;
    let prevPos = { x: 0, y: 0 };
    let spherical = new THREE.Spherical().setFromVector3(camera.position);

    const applyDrag = (dx: number, dy: number) => {
      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.04, spherical.phi - dy * 0.006));
      targetCamPos.current.setFromSpherical(spherical);
    };

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevPos = { x: e.clientX, y: e.clientY }; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      applyDrag(e.clientX - prevPos.x, e.clientY - prevPos.y);
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => { isDragging = true; prevPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      applyDrag(e.touches[0].clientX - prevPos.x, e.touches[0].clientY - prevPos.y);
      prevPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isDragging = false; };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth camera lerp
      camera.position.lerp(targetCamPos.current, 0.055);
      camera.lookAt(targetLookAt.current);

      // Breathing lights
      deskLight.intensity = 2.8 + Math.sin(t * 1.8) * 0.3;
      purpleBack.intensity = 4.5 + Math.cos(t * 1.3) * 0.6;
      pinkAccent.intensity = 1.8 + Math.sin(t * 2.4) * 0.4;
      pcGlowL.intensity = 1.8 + Math.sin(t * 3.2) * 0.5;
      mugGlow.intensity = 0.45 + Math.sin(t * 0.8) * 0.12;

      // Slow LED strip colour cycle (cyan → purple)
      const hue = (t * 0.04) % 1;
      const ledColor = new THREE.Color().setHSL(hue, 1, 0.55);
      ledMat.color.set(ledColor);
      ledMat.emissive.set(ledColor);

      // Keyboard RGB colour cycle
      const kbHue = (t * 0.08 + 0.5) % 1;
      const kbColor = new THREE.Color().setHSL(kbHue, 1, 0.5);
      kbLedMat.color.set(kbColor);
      kbLedMat.emissive.set(kbColor);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <section id="3d-studio" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-purple-400" />
          <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
            02 // 3D DIGITAL ENVIRONMENT
          </span>
          <span className="w-8 h-px bg-purple-400" />
        </div>
        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          ZYNX 3D Digital Room & Workstation
        </h2>
        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Interactive Three.js studio inspired by{" "}
          <span className="text-cyan-400">aengel.io</span> and{" "}
          <span className="text-purple-400">CGTrader</span>. Drag to orbit 360° or use the presets below to inspect each zone.
        </p>

        {/* Camera Preset Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => changePreset(preset.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                  isActive
                    ? "bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-600/30 scale-105"
                    : "cyber-glass border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-purple-400"} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative w-full h-[600px] sm:h-[460px] rounded-3xl overflow-hidden cyber-glass border border-white/10 shadow-2xl">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

        {/* Orbit hint */}
        <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <RotateCcw size={12} className="text-cyan-400 animate-spin" />
          <span className="sm:hidden">DRAG TO ORBIT 360°</span>
          <span className="hidden sm:inline">TOUCH & DRAG</span>
        </div>

        {/* Lo-Fi Ambient toggle */}
        <button
          onClick={toggleAmbientAudio}
          className={`absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-2 border shadow-lg ${
            ambientAudioActive
              ? "bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-emerald-500/20 animate-pulse"
              : "bg-black/70 backdrop-blur-md border-white/10 text-zinc-300 hover:text-white hover:border-cyan-400/50"
          }`}
          title="Toggle soothing procedural lo-fi rain ambience"
        >
          {ambientAudioActive ? (
            <><CloudRain size={13} className="text-emerald-400" /><span>LO-FI RAIN [ON]</span><Volume2 size={13} className="text-emerald-400" /></>
          ) : (
            <><CloudRain size={13} className="text-cyan-400" /><span>LO-FI RAIN AMBIENCE</span><VolumeX size={13} className="text-zinc-500" /></>
          )}
        </button>

        {/* Inspection HUD */}
        {activeInspect && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-3 sm:right-3 pointer-events-auto p-5 rounded-2xl cyber-glass border border-purple-500/40 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    {activeInspect.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {activeInspect.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeInspect.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => changePreset("overview")}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
              >
                ↩ Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
