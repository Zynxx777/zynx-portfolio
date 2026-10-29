import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  Layers, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Sun,
  Moon,
  Printer,
  Sparkles,
  Eye,
  RotateCw,
  Download,
  MessageSquare,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import { MonitorDesktopModal } from './MonitorDesktopModal';
import { 
  drawCardFront, 
  drawCardBack, 
  getContactTileAtUV, 
  downloadVCard, 
  CARD_WIDTH, 
  CARD_HEIGHT 
} from '../utils/cardCanvas';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.62 1.62c0 .89.73 1.62 1.62 1.62.89 0 1.62-.73 1.62-1.62 0-.89-.73-1.62-1.62-1.62z" />
  </svg>
);

// Smootherstep Perlin Easing (6t^5 - 15t^4 + 10t^3)
const Ca = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const CARD_DIM = { w: 0.086, h: 0.055, t: 0.0012 };
const CARD_LAYOUT = { height: 0.50, width: 0.86 };
const CARD_REST_POS = new THREE.Vector3(0, 0.024, 0.006);
const CARD_REST_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.28, 0, 0));

const V_held = new THREE.Vector3();
const W_held = new THREE.Vector3();
const X_held = new THREE.Quaternion();
const heldTarget = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.06, 0, 0));
const flipQ = new THREE.Quaternion();
const turnQ = new THREE.Quaternion();
const aVec = new THREE.Vector3();
const bVec = new THREE.Vector3();
const bezierCurve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3()
);

function computeHeldTransform(
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  group: THREE.Group,
  rotOffset?: THREE.Quaternion
) {
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const c = Math.tan(fovRad / 2);
  const aspect = size.width / Math.max(1, size.height);
  const dist = Math.max(
    CARD_DIM.h / (2 * c * CARD_LAYOUT.height),
    CARD_DIM.w / (2 * c * aspect * CARD_LAYOUT.width)
  );

  V_held.set(0, -0.02, 0.5).unproject(camera);
  W_held.copy(V_held).sub(camera.position).normalize();
  heldTarget.p.copy(camera.position).addScaledVector(W_held, dist);

  group.worldToLocal(heldTarget.p);

  group.getWorldQuaternion(X_held).invert();
  heldTarget.q.copy(X_held).multiply(camera.quaternion);

  if (rotOffset) {
    heldTarget.q.multiply(rotOffset);
  }
}

interface BedroomDesk3DProps {
  onOpenDiary: () => void;
  onOpenProject: (projectId: string) => void;
  onSwitchToShowcase: () => void;
  onOpenAnatomy: () => void;
  onOpenMonitor?: () => void;
}

export const BedroomDesk3D: React.FC<BedroomDesk3DProps> = ({
  onOpenDiary,
  onOpenProject,
  onSwitchToShowcase,
  onOpenAnatomy,
  onOpenMonitor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [dayMode, setDayMode] = useState(false); // Day Studio vs Cozy Night
  const [isXRayMode, setIsXRayMode] = useState(false); // Matching pradiplabs X-Ray mode
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [focusedTarget, setFocusedTarget] = useState<'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'zoro' | null>(null);
  const [isCardHeld, setIsCardHeld] = useState(false);
  const [, setCardSide] = useState<0 | 1>(0);

  // Card Animation & Transform References
  const cardAnimRef = useRef({
    out: 0,
    from: 0,
    to: 0,
    movedAt: 0,
    side: 0,
    flip: 0,
    flipFrom: 0,
    flippedAt: 0,
    glow: 0
  });
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const cardMaterialsRef = useRef<{ front: THREE.MeshStandardMaterial; back: THREE.MeshStandardMaterial } | null>(null);

  const triggerFlip = useCallback((side: 0 | 1, delay: number = 0) => {
    const w = cardAnimRef.current;
    w.flipFrom = w.flip;
    w.side = side;
    w.flippedAt = performance.now() + delay;
    if (delay > 0) {
      window.setTimeout(() => soundFX.playCardFlip(), delay);
    } else {
      soundFX.playCardFlip();
    }
    setCardSide(side);
  }, []);

  const takeCard = useCallback(() => {
    const w = cardAnimRef.current;
    if (w.to === 1) return;
    w.from = w.out;
    w.to = 1;
    w.movedAt = performance.now();
    soundFX.playCardPickup();
    setIsCardHeld(true);
  }, []);

  const putDownCard = useCallback(() => {
    const w = cardAnimRef.current;
    if (w.to === 0 && w.out === 0) return;
    w.from = w.out;
    w.to = 0;
    w.movedAt = performance.now();
    if (w.side === 1) {
      triggerFlip(0, 1050 * 0.35);
    }
    soundFX.playCardPutdown();
    setIsCardHeld(false);
  }, [triggerFlip]);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);
  const daySunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Zoro spring wobble reference
  const zoroWobbleRef = useRef<number>(0.15);
  const zoroHeadRef = useRef<THREE.Group | null>(null);

  // Receipt paper mesh reference
  const receiptPaperMeshRef = useRef<THREE.Mesh | null>(null);
  const receiptAnimRef = useRef<number>(0);

  // Steam particle system
  const steamParticlesRef = useRef<THREE.Points | null>(null);

  // Target Camera Interpolation Ref
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0.0, 0.95, 1.45));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0.0, 0.32, 0.0));

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('/music/lofi-study.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    soundFX.playClick();
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setAudioPlaying(true);
    }
  };

  const triggerPrintReceipt = () => {
    soundFX.playClick();
    setPrintedReceipt(true);
    receiptAnimRef.current = 1.0;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0.0, 0.95, 1.45);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 0.55;
    controls.maxDistance = 2.8;
    controls.target.set(0.0, 0.32, 0.0);
    controlsRef.current = controls;

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, dayMode ? 1.6 : 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, dayMode ? 2.4 : 1.2);
    keyLight.position.set(1.5, 3.5, 2.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    daySunLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.6);
    fillLight.position.set(-2, 1.5, 1);
    scene.add(fillLight);

    // Warm Mushroom Desk Lamp Point Light
    const lampLight = new THREE.PointLight(0xffaa55, lampOn ? 3.6 : 0.0, 1.8, 1.8);
    lampLight.position.set(0.42, 0.34, -0.05);
    lampLight.castShadow = true;
    lampLight.shadow.bias = -0.001;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // 3. Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.45,
      metalness: 0.05,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      roughness: 0.6,
      metalness: 0.4,
    });

    const laptopAlu = new THREE.MeshStandardMaterial({
      color: 0xc8cdd5,
      roughness: 0.22,
      metalness: 0.85,
    });

    const blackPlastic = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.38,
      metalness: 0.2,
    });

    const whitePlastic = new THREE.MeshStandardMaterial({
      color: 0xf4f4f6,
      roughness: 0.3,
      metalness: 0.05,
    });

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.18,
      metalness: 0.05,
    });

    const plantGreen = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.5,
      metalness: 0.0,
    });

    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xd97757,
      roughness: 0.7,
      metalness: 0.0,
    });

    const diaryLeather = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.4,
      metalness: 0.1,
    });

    const silverMetal = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });

    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba,
      roughness: 0.28,
      metalness: 0.05,
      emissive: lampOn ? 0xff8833 : 0x000000,
      emissiveIntensity: lampOn ? 0.6 : 0.0,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: dayMode ? 0xf0f0f4 : 0x242220,
      roughness: 0.85,
      metalness: 0.0,
    });

    const interactiveObjects: THREE.Object3D[] = [];

    const registerClickable = (obj: THREE.Object3D, name: string) => {
      obj.userData = { clickableName: name };
      interactiveObjects.push(obj);
    };

    // 4. Back Wall & Ambient Room
    const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), wallMat);
    wallMesh.position.set(0.0, 0.75, -0.34);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // Wall Sticky Notes
    const stickyColors = [0xfef08a, 0xfbcfe8, 0xbae6fd, 0xbbf7d0];
    const stickyPositions = [
      [-0.20, 0.52, -0.335],
      [-0.13, 0.47, -0.335],
      [0.16, 0.53, -0.335],
      [0.23, 0.48, -0.335]
    ];
    stickyPositions.forEach(([sx, sy, sz], idx) => {
      const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.058, 0.058),
        new THREE.MeshStandardMaterial({ color: stickyColors[idx % stickyColors.length], roughness: 0.7 })
      );
      note.position.set(sx, sy, sz);
      note.rotation.z = (idx % 2 === 0 ? 0.05 : -0.06);
      scene.add(note);
    });

    // 5. Desk Top & Chamfers
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.038, 0.68),
      woodMat
    );
    deskTop.position.set(0.0, 0.15, 0.0);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    scene.add(deskTop);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.50, 16);
    const legPositions = [
      [-0.60, -0.10, -0.28],
      [0.60, -0.10, -0.28],
      [-0.60, -0.10, 0.28],
      [0.60, -0.10, 0.28]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // 6. Dynamic Canvas Textures
    // 6a. Laptop Screen Texture: "8 projects, all running"
    const laptopCanvas = document.createElement('canvas');
    laptopCanvas.width = 1024;
    laptopCanvas.height = 680;
    const lCtx = laptopCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#0a0e17';
      lCtx.fillRect(0, 0, 1024, 680);
      
      // Top Browser Bar
      lCtx.fillStyle = '#1e293b';
      lCtx.fillRect(0, 0, 1024, 48);
      // Window dots
      lCtx.fillStyle = '#ef4444';
      lCtx.beginPath(); lCtx.arc(24, 24, 8, 0, Math.PI * 2); lCtx.fill();
      lCtx.fillStyle = '#eab308';
      lCtx.beginPath(); lCtx.arc(48, 24, 8, 0, Math.PI * 2); lCtx.fill();
      lCtx.fillStyle = '#22c55e';
      lCtx.beginPath(); lCtx.arc(72, 24, 8, 0, Math.PI * 2); lCtx.fill();
      // Search bar
      lCtx.fillStyle = '#0f172a';
      lCtx.roundRect(120, 10, 420, 28, 6);
      lCtx.fill();
      lCtx.fillStyle = '#64748b';
      lCtx.font = '14px monospace';
      lCtx.fillText('https://zynx.systems/active-nodes', 135, 29);

      // Headline
      lCtx.fillStyle = '#ffffff';
      lCtx.font = 'bold 28px sans-serif';
      lCtx.fillText('Eight projects, all running.', 40, 95);
      lCtx.fillStyle = '#94a3b8';
      lCtx.font = '15px sans-serif';
      lCtx.fillText('Active embedded systems, Arch Linux workflows, and digital designs.', 40, 122);

      // Grid of 6 project tiles
      const mockTiles = [
        { title: 'Z Card v0.1', sub: 'All-in-One Smart Card', tag: 'HARDWARE' },
        { title: 'S.M. School Web', sub: 'School Management Portal', tag: 'LIVE' },
        { title: 'Arch Workstation', sub: 'Hyprland & Kernel 6.12', tag: 'SYSTEM' },
        { title: 'Luxoft AAOS', sub: 'Automotive CAN Architecture', tag: 'RESEARCH' },
        { title: 'MediVend Dispenser', sub: 'Verilog & Motor Drivers', tag: 'EMBEDDED' },
        { title: '7YNX Sound Lab', sub: 'Ambient DSP & Audio Daw', tag: 'AUDIO' }
      ];

      mockTiles.forEach((tile, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const tx = 40 + col * 315;
        const ty = 150 + row * 240;

        lCtx.fillStyle = '#162032';
        lCtx.roundRect(tx, ty, 295, 215, 12);
        lCtx.fill();
        lCtx.strokeStyle = '#2d3f5e';
        lCtx.lineWidth = 1.5;
        lCtx.stroke();

        lCtx.fillStyle = '#0b111e';
        lCtx.roundRect(tx + 12, ty + 12, 271, 110, 8);
        lCtx.fill();

        lCtx.fillStyle = '#00f0ff';
        lCtx.font = 'bold 11px monospace';
        lCtx.fillText(tile.tag, tx + 24, ty + 38);

        lCtx.fillStyle = '#ffffff';
        lCtx.font = 'bold 18px sans-serif';
        lCtx.fillText(tile.title, tx + 14, ty + 155);

        lCtx.fillStyle = '#94a3b8';
        lCtx.font = '13px sans-serif';
        lCtx.fillText(tile.sub, tx + 14, ty + 180);
      });
    }
    const laptopTexture = new THREE.CanvasTexture(laptopCanvas);
    laptopTexture.colorSpace = THREE.SRGBColorSpace;

    // 6b. Tablet Screen Texture: "Docket Telemetry & Print Action"
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 680;
    tabletCanvas.height = 480;
    const tCtx = tabletCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#060a12';
      tCtx.fillRect(0, 0, 680, 480);
      
      tCtx.fillStyle = '#00f0ff';
      tCtx.font = 'bold 20px monospace';
      tCtx.fillText('Z-DOCKET SYSTEM // ARCH TELEMETRY', 30, 45);
      tCtx.fillStyle = '#64748b';
      tCtx.font = '12px monospace';
      tCtx.fillText('KERNEL: 6.12.1-ARCH · 6 ACTIVE NODES', 30, 70);

      const stats = [
        { label: 'CPU UTILIZATION', val: '18% @ 3.8GHz', color: '#10b981' },
        { label: 'RAM WORKING SET', val: '8.4 / 32 GB', color: '#38bdf8' },
        { label: 'BATTERY SOLAR', val: '3.78 V (CHARGING)', color: '#fbbf24' },
        { label: 'ECE FIRMWARE', val: 'REV 0.81 STABLE', color: '#a855f7' }
      ];

      stats.forEach((st, i) => {
        const sx = 30 + (i % 2) * 315;
        const sy = 95 + Math.floor(i / 2) * 115;
        tCtx.fillStyle = '#0f172a';
        tCtx.roundRect(sx, sy, 295, 95, 8);
        tCtx.fill();
        tCtx.fillStyle = '#64748b';
        tCtx.font = '11px monospace';
        tCtx.fillText(st.label, sx + 15, sy + 30);
        tCtx.fillStyle = st.color;
        tCtx.font = 'bold 18px monospace';
        tCtx.fillText(st.val, sx + 15, sy + 65);
      });

      // Big "Print Docket Receipt" Banner Button on Tablet
      tCtx.fillStyle = '#00f0ff';
      tCtx.roundRect(30, 360, 620, 80, 14);
      tCtx.fill();
      tCtx.fillStyle = '#000000';
      tCtx.font = 'bold 22px monospace';
      tCtx.fillText('🖨️  PRINT DOCKET RECEIPT NOW', 160, 410);
    }
    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    tabletTexture.colorSpace = THREE.SRGBColorSpace;

    // 6c. Receipt Paper Texture
    const receiptCanvas = document.createElement('canvas');
    receiptCanvas.width = 320;
    receiptCanvas.height = 720;
    const rCtx = receiptCanvas.getContext('2d');
    if (rCtx) {
      rCtx.fillStyle = '#fafaf8';
      rCtx.fillRect(0, 0, 320, 720);
      rCtx.fillStyle = '#1e293b';
      rCtx.font = 'bold 16px monospace';
      rCtx.fillText('========================', 20, 30);
      rCtx.fillText('     ZYNX SYSTEMS       ', 20, 55);
      rCtx.fillText('  ARCH LINUX WORKSTATION', 20, 80);
      rCtx.fillText('========================', 20, 105);
      rCtx.font = '13px monospace';
      rCtx.fillText('DOCKET NO : #00777', 20, 140);
      rCtx.fillText('DATE      : 2026-10-29', 20, 165);
      rCtx.fillText('OPERATOR  : JOSHUA D (ZYNX)', 20, 190);
      rCtx.fillText('CAMPUS    : DBIT BANGALORE', 20, 215);
      rCtx.fillText('------------------------', 20, 240);
      rCtx.fillText('SYSTEM CHECKS:', 20, 270);
      rCtx.fillText('  [✓] ARCH HYPRLAND OK', 20, 300);
      rCtx.fillText('  [✓] Z CARD V0.1 SOLAR OK', 20, 330);
      rCtx.fillText('  [✓] BIOMETRIC SECURE OK', 20, 360);
      rCtx.fillText('  [✓] 8 RUNNING PROJECTS OK', 20, 390);
      rCtx.fillText('------------------------', 20, 420);
      rCtx.fillText('STATUS    : ALL SYSTEMS GO', 20, 450);
      rCtx.font = 'bold 14px monospace';
      rCtx.fillText('THANK YOU FOR VISITING!', 20, 490);
      rCtx.fillText('GITHUB.COM/ZYNXX777', 20, 520);
      rCtx.fillText('========================', 20, 550);
    }
    const receiptTexture = new THREE.CanvasTexture(receiptCanvas);
    receiptTexture.colorSpace = THREE.SRGBColorSpace;

    // 6d. Phone Screen Texture: "AI Chat & 7YNX Audio"
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 400;
    phoneCanvas.height = 800;
    const pCtx = phoneCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#0a0f1d';
      pCtx.fillRect(0, 0, 400, 800);
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 16px sans-serif';
      pCtx.fillText('9:41', 30, 40);
      pCtx.fillText('5G 100%', 320, 40);

      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(20, 70, 360, 60, 14);
      pCtx.fill();
      pCtx.fillStyle = '#38bdf8';
      pCtx.font = 'bold 18px sans-serif';
      pCtx.fillText('7YNX Smart Chat & Player', 40, 107);

      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(25, 160, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#e2e8f0';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Hi! Looking for hardware prototype', 40, 190);
      pCtx.fillText('or Linux automation consulting?', 40, 212);

      pCtx.fillStyle = '#0284c7';
      pCtx.roundRect(95, 260, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Yes! Interested in the Z Card', 115, 290);
      pCtx.fillText('and universal smart ID concept!', 115, 312);

      pCtx.fillStyle = '#0f172a';
      pCtx.roundRect(25, 420, 350, 180, 16);
      pCtx.fill();
      pCtx.fillStyle = '#00f0ff';
      pCtx.font = 'bold 15px monospace';
      pCtx.fillText('LIVE RADIO: 7YNX STUDY BEATS', 45, 460);
      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '12px sans-serif';
      pCtx.fillText('Lo-fi Beats & Warm Ambient Waves', 45, 485);

      for (let b = 0; b < 24; b++) {
        const barH = 20 + Math.sin(b * 0.7) * 35;
        pCtx.fillStyle = '#00f0ff';
        pCtx.fillRect(45 + b * 13, 550 - barH, 8, barH);
      }
    }
    const phoneTexture = new THREE.CanvasTexture(phoneCanvas);
    phoneTexture.colorSpace = THREE.SRGBColorSpace;

    // 6e. Business Card Canvas Textures (Brushed Titanium Front & Interactive Contact Back)
    const cardFrontCanvas = document.createElement('canvas');
    cardFrontCanvas.width = CARD_WIDTH;
    cardFrontCanvas.height = CARD_HEIGHT;
    const cfCtx = cardFrontCanvas.getContext('2d');

    const cardBackCanvas = document.createElement('canvas');
    cardBackCanvas.width = CARD_WIDTH;
    cardBackCanvas.height = CARD_HEIGHT;
    const cbCtx = cardBackCanvas.getContext('2d');

    const cardFrontTex = new THREE.CanvasTexture(cardFrontCanvas);
    cardFrontTex.colorSpace = THREE.SRGBColorSpace;
    cardFrontTex.anisotropy = 8;

    const cardBackTex = new THREE.CanvasTexture(cardBackCanvas);
    cardBackTex.colorSpace = THREE.SRGBColorSpace;
    cardBackTex.anisotropy = 8;

    const cardAvatarImg = new Image();
    cardAvatarImg.crossOrigin = 'anonymous';
    cardAvatarImg.src = '/images/profile_avatar.webp';
    cardAvatarImg.onload = () => {
      if (cfCtx && cbCtx) {
        drawCardFront(cfCtx, cardAvatarImg);
        drawCardBack(cbCtx, cardAvatarImg);
        cardFrontTex.needsUpdate = true;
        cardBackTex.needsUpdate = true;
      }
    };
    if (cfCtx && cbCtx) {
      drawCardFront(cfCtx, null);
      drawCardBack(cbCtx, null);
      cardFrontTex.needsUpdate = true;
      cardBackTex.needsUpdate = true;
    }
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load('600 62px Inter').then(() => {
        if (cfCtx && cbCtx) {
          drawCardFront(cfCtx, cardAvatarImg.complete ? cardAvatarImg : null);
          drawCardBack(cbCtx, cardAvatarImg.complete ? cardAvatarImg : null);
          cardFrontTex.needsUpdate = true;
          cardBackTex.needsUpdate = true;
        }
      }).catch(() => {});
    }

    // 7. Laptop Model (Center of Desk)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.0, 0.17, -0.04);

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.22), laptopAlu);
    laptopBase.castShadow = true;
    laptopGroup.add(laptopBase);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.002, 0.11), blackPlastic);
    keyboard.position.set(0.0, 0.007, -0.03);
    laptopGroup.add(keyboard);

    const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.001, 0.065), laptopAlu);
    trackpad.position.set(0.0, 0.007, 0.065);
    laptopGroup.add(trackpad);

    const screenHinge = new THREE.Group();
    screenHinge.position.set(0.0, 0.006, -0.11);
    screenHinge.rotation.x = Math.PI / 2 - 0.22;

    const screenLid = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.008), laptopAlu);
    screenLid.position.set(0.0, 0.11, 0.0);
    screenLid.castShadow = true;
    screenHinge.add(screenLid);

    const screenDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.29, 0.19),
      new THREE.MeshBasicMaterial({ map: laptopTexture })
    );
    screenDisplay.position.set(0.0, 0.11, 0.005);
    screenHinge.add(screenDisplay);

    laptopGroup.add(screenHinge);
    scene.add(laptopGroup);
    registerClickable(laptopBase, 'laptop');
    registerClickable(screenLid, 'laptop');
    registerClickable(screenDisplay, 'laptop');

    // 8. Tablet on Stand (Left of Laptop)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-0.32, 0.17, 0.04);
    tabletGroup.rotation.y = Math.PI / 11;

    const tabletStand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.01, 24), silverMetal);
    tabletStand.position.set(0.0, 0.005, 0.0);
    tabletGroup.add(tabletStand);

    const tabletArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.02), silverMetal);
    tabletArm.position.set(0.0, 0.06, -0.01);
    tabletArm.rotation.x = 0.2;
    tabletGroup.add(tabletArm);

    const tabletBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.01), blackPlastic);
    tabletBody.position.set(0.0, 0.13, 0.01);
    tabletBody.rotation.x = -0.22;
    tabletBody.castShadow = true;
    tabletGroup.add(tabletBody);

    const tabletScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.14),
      new THREE.MeshBasicMaterial({ map: tabletTexture })
    );
    tabletScreen.position.set(0.0, 0.13, 0.016);
    tabletScreen.rotation.x = -0.22;
    tabletGroup.add(tabletScreen);

    scene.add(tabletGroup);
    registerClickable(tabletBody, 'tablet');
    registerClickable(tabletScreen, 'tablet');

    // 9. Receipt Printer (Directly next to tablet, matching pradiplabs.dev)
    const printerGroup = new THREE.Group();
    printerGroup.position.set(-0.52, 0.17, -0.06);

    const printerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.10, 0.14),
      whitePlastic
    );
    printerBody.position.set(0.0, 0.05, 0.0);
    printerBody.castShadow = true;
    printerGroup.add(printerBody);

    // Dark paper feed slot
    const printerSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.008, 0.015),
      blackPlastic
    );
    printerSlot.position.set(0.0, 0.101, -0.02);
    printerGroup.add(printerSlot);

    // Status LED
    const printerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.0035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    printerLed.position.set(0.045, 0.102, 0.045);
    printerGroup.add(printerLed);

    // Printable Receipt Paper (Animated unroll when triggered)
    const paperGeo = new THREE.PlaneGeometry(0.08, 0.18, 12, 12);
    const paperMat = new THREE.MeshBasicMaterial({ map: receiptTexture, side: THREE.DoubleSide });
    const receiptPaper = new THREE.Mesh(paperGeo, paperMat);
    receiptPaper.position.set(0.0, 0.105, 0.035);
    receiptPaper.rotation.x = Math.PI / 3;
    receiptPaper.scale.set(1, 0.01, 1); // Start tucked inside slot
    printerGroup.add(receiptPaper);
    receiptPaperMeshRef.current = receiptPaper;

    scene.add(printerGroup);
    registerClickable(printerBody, 'printer');

    // 10. Zoro Bobblehead Figurine on a Spring (Left desk edge, matching pradiplabs.dev)
    const zoroGroup = new THREE.Group();
    zoroGroup.position.set(-0.54, 0.17, 0.15);

    // Circular base
    const zoroBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.01, 20),
      new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.6 })
    );
    zoroBase.position.y = 0.005;
    zoroGroup.add(zoroBase);

    // Zoro Body (Dark Green Coat)
    const zoroBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.024, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.5 })
    );
    zoroBody.position.y = 0.035;
    zoroBody.castShadow = true;
    zoroGroup.add(zoroBody);

    // Zoro's 3 Katanas strapped to his sash
    for (let k = 0; k < 3; k++) {
      const sword = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, 0.065, 8),
        new THREE.MeshStandardMaterial({ color: k === 0 ? 0xffffff : k === 1 ? 0x7e22ce : 0xb91c1c, metalness: 0.7 })
      );
      sword.position.set(0.022, 0.032 + k * 0.004, -0.005 + k * 0.006);
      sword.rotation.set(0.4, 0.1, -0.6);
      zoroGroup.add(sword);
    }

    // Spring (connecting body to head)
    const spring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.02, 12),
      silverMetal
    );
    spring.position.y = 0.065;
    zoroGroup.add(spring);

    // Zoro Head Group (mounted on spring for harmonic wobbling)
    const zoroHead = new THREE.Group();
    zoroHead.position.set(0.0, 0.09, 0.0);

    // Head sphere (skin tone)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd2b8, roughness: 0.4 });
    const zoroFace = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 16), skinMat);
    zoroHead.add(zoroFace);

    // Zoro Green Hair (Spiky dome)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const zoroHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8),
      hairMat
    );
    zoroHair.position.y = 0.004;
    zoroHead.add(zoroHair);

    // Black Pirate Bandana tied around head
    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
    const bandana = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 10, 24), bandanaMat);
    bandana.rotation.x = Math.PI / 2;
    bandana.position.y = 0.006;
    zoroHead.add(bandana);

    zoroHead.castShadow = true;
    zoroHeadRef.current = zoroHead;
    zoroGroup.add(zoroHead);

    scene.add(zoroGroup);
    registerClickable(zoroFace, 'zoro');
    registerClickable(zoroBody, 'zoro');

    // 11. Smartphone & Stand (Right of Laptop)
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.27, 0.17, 0.07);
    phoneGroup.rotation.y = -Math.PI / 12;

    const phoneStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.01), silverMetal);
    phoneStand.position.set(0.0, 0.035, -0.02);
    phoneStand.rotation.x = -0.4;
    phoneGroup.add(phoneStand);

    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.008), blackPlastic);
    phoneBody.position.set(0.0, 0.075, 0.005);
    phoneBody.rotation.x = -0.35;
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);

    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.068, 0.135),
      new THREE.MeshBasicMaterial({ map: phoneTexture })
    );
    phoneScreen.position.set(0.0, 0.075, 0.01);
    phoneScreen.rotation.x = -0.35;
    phoneGroup.add(phoneScreen);

    scene.add(phoneGroup);
    registerClickable(phoneBody, 'phone');
    registerClickable(phoneScreen, 'phone');

    // 12. Personal Guestbook Diary (Front Right)
    const diaryGroup = new THREE.Group();
    diaryGroup.position.set(0.12, 0.17, 0.17);
    diaryGroup.rotation.y = -0.15;

    const diaryBook = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.016, 0.22), diaryLeather);
    diaryBook.castShadow = true;
    diaryGroup.add(diaryBook);

    const diaryPages = new THREE.Mesh(
      new THREE.BoxGeometry(0.174, 0.012, 0.214),
      new THREE.MeshStandardMaterial({ color: 0xf2ebd9, roughness: 0.8 })
    );
    diaryPages.position.set(0.002, 0.0, 0.0);
    diaryGroup.add(diaryPages);

    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.15, 16), silverMetal);
    pen.position.set(0.01, 0.012, 0.0);
    pen.rotation.z = Math.PI / 2;
    pen.castShadow = true;
    diaryGroup.add(pen);

    scene.add(diaryGroup);
    registerClickable(diaryBook, 'diary');
    registerClickable(pen, 'diary');

    // 13. Interactive Walnut Business Card Holder & Brushed Titanium Card
    const cardHolderGroup = new THREE.Group();
    cardHolderGroup.position.set(-0.04, 0.169, 0.22);
    cardHolderGroup.rotation.y = 0.12;
    cardGroupRef.current = cardHolderGroup;

    // Walnut Base Block with Chamfered Appearance
    const walnutMat = new THREE.MeshStandardMaterial({
      color: 0x5a3d28,
      roughness: 0.55,
      metalness: 0.05
    });
    const walnutBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.105, 0.016, 0.038),
      walnutMat
    );
    walnutBase.position.set(0, 0.008, 0);
    walnutBase.castShadow = true;
    walnutBase.receiveShadow = true;
    cardHolderGroup.add(walnutBase);
    registerClickable(walnutBase, 'card');

    // Angled Slot recess in walnut block
    const slotMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.006, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x22150d, roughness: 0.8 })
    );
    slotMesh.position.set(0, 0.015, -0.002);
    cardHolderGroup.add(slotMesh);

    // 4 background cards resting in the slot behind the active card
    const stackEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x2e2e32,
      metalness: 0.85,
      roughness: 0.3
    });
    for (let y = 0; y < 4; y++) {
      const stackCard = new THREE.Mesh(
        new THREE.BoxGeometry(CARD_DIM.w, CARD_DIM.h, CARD_DIM.t),
        stackEdgeMat
      );
      stackCard.position.set(
        0,
        CARD_REST_POS.y - (y + 1) * 0.0008,
        CARD_REST_POS.z - (y + 1) * (CARD_DIM.t + 0.0018)
      );
      stackCard.rotation.x = -0.28;
      stackCard.castShadow = true;
      cardHolderGroup.add(stackCard);
    }

    // Active Interactive Card Mesh with 6 materials
    const titaniumEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3e,
      metalness: 0.9,
      roughness: 0.26
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTex,
      metalness: 0.72,
      roughness: 0.36,
      emissive: 0xffffff,
      emissiveMap: cardFrontTex,
      emissiveIntensity: 0.12
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTex,
      metalness: 0.72,
      roughness: 0.36,
      emissive: 0xffffff,
      emissiveMap: cardBackTex,
      emissiveIntensity: 0.12
    });

    cardMaterialsRef.current = { front: frontMat, back: backMat };

    const cardMaterials = [
      titaniumEdgeMat, // +X right
      titaniumEdgeMat, // -X left
      titaniumEdgeMat, // +Y top
      titaniumEdgeMat, // -Y bottom
      frontMat,        // +Z front
      backMat          // -Z back
    ];

    const interactiveCard = new THREE.Mesh(
      new THREE.BoxGeometry(CARD_DIM.w, CARD_DIM.h, CARD_DIM.t),
      cardMaterials
    );
    interactiveCard.position.copy(CARD_REST_POS);
    interactiveCard.quaternion.copy(CARD_REST_ROT);
    interactiveCard.castShadow = true;
    interactiveCard.receiveShadow = true;
    cardHolderGroup.add(interactiveCard);
    cardMeshRef.current = interactiveCard;
    registerClickable(interactiveCard, 'card');

    scene.add(cardHolderGroup);

    // 14. Mushroom Desk Lamp (Right rear)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.42, 0.17, -0.05);

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.012, 24),
      new THREE.MeshStandardMaterial({ color: 0xdd8877, roughness: 0.4 })
    );
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 16), silverMetal);
    lampStem.position.set(0.0, 0.075, 0.0);
    lampGroup.add(lampStem);

    const lampDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.082, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      lampShadeMat
    );
    lampDome.position.set(0.0, 0.15, 0.0);
    lampDome.castShadow = true;
    lampGroup.add(lampDome);

    scene.add(lampGroup);
    registerClickable(lampDome, 'lamp');
    registerClickable(lampBase, 'lamp');

    // 15. Ceramic Coffee Mug with Rising Steam
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.085, 20), ceramicMat);
    mug.position.set(0.31, 0.21, -0.16);
    mug.castShadow = true;
    scene.add(mug);

    const coffeeSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.034, 16),
      new THREE.MeshBasicMaterial({ color: 0x3d2314 })
    );
    coffeeSurface.position.set(0.31, 0.25, -0.16);
    coffeeSurface.rotation.x = -Math.PI / 2;
    scene.add(coffeeSurface);

    // Subtle Steam Particles
    const steamCount = 18;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let s = 0; s < steamCount; s++) {
      steamPositions[s * 3] = 0.31 + (Math.random() - 0.5) * 0.03;
      steamPositions[s * 3 + 1] = 0.26 + Math.random() * 0.08;
      steamPositions[s * 3 + 2] = -0.16 + (Math.random() - 0.5) * 0.03;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.015,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    // 16. Succulent Plant in Terracotta Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.07, 16), terracottaMat);
    pot.position.set(0.44, 0.20, -0.22);
    pot.castShadow = true;
    scene.add(pot);

    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.09, 8), plantGreen);
      leaf.position.set(0.44 + (Math.cos(i * 1.05) * 0.016), 0.27, -0.22 + (Math.sin(i * 1.05) * 0.016));
      leaf.rotation.set((Math.sin(i) * 0.25), i * 1.05, (Math.cos(i) * 0.25));
      leaf.castShadow = true;
      scene.add(leaf);
    }

    // 17. Framed Photo & Spectacles
    const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.095, 0.008), blackPlastic);
    photoFrame.position.set(0.14, 0.215, -0.20);
    photoFrame.rotation.y = -0.18;
    photoFrame.castShadow = true;
    scene.add(photoFrame);

    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(-0.18, 0.175, 0.18);
    glassesGroup.rotation.y = 0.2;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.002, 12, 24), blackPlastic);
    ring1.position.x = -0.024;
    ring1.rotation.x = Math.PI / 2;
    const ring2 = ring1.clone();
    ring2.position.x = 0.024;
    glassesGroup.add(ring1);
    glassesGroup.add(ring2);
    scene.add(glassesGroup);

    // Raycasting Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let rootClickable = intersects[0].object;
        while (rootClickable && !rootClickable.userData?.clickableName && rootClickable.parent) {
          rootClickable = rootClickable.parent;
        }
        const name = rootClickable?.userData?.clickableName || null;
        setHoveredObject(name);
        renderer.domElement.style.cursor = name ? 'pointer' : 'default';

        // Hover Zoro causes head to wobble
        if (name === 'zoro') {
          zoroWobbleRef.current = Math.max(zoroWobbleRef.current, 0.35);
        }
      } else {
        setHoveredObject(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let rootClickable = intersects[0].object;
        while (rootClickable && !rootClickable.userData?.clickableName && rootClickable.parent) {
          rootClickable = rootClickable.parent;
        }
        const name = rootClickable?.userData?.clickableName;
        if (name === 'card' || name === 'zcard') {
          const w = cardAnimRef.current;
          if (w.out < 0.2) {
            takeCard();
          } else {
            const hit = intersects[0];
            if (hit.face?.materialIndex === 5 && w.side === 1 && hit.uv) {
              const tile = getContactTileAtUV(hit.uv.x, hit.uv.y);
              if (tile) {
                soundFX.playClick();
                if (tile.href.startsWith('mailto:') || tile.href.startsWith('tel:')) {
                  window.location.href = tile.href;
                } else {
                  window.open(tile.href, '_blank', 'noopener,noreferrer');
                }
                return;
              }
            }
            triggerFlip(w.side === 1 ? 0 : 1);
          }
        } else if (name === 'diary') {
          soundFX.playClick();
          onOpenDiary();
        } else if (name === 'printer') {
          triggerPrintReceipt();
        } else if (name === 'zoro') {
          soundFX.playClick();
          zoroWobbleRef.current = 0.55;
          focusObject('zoro');
        } else if (name === 'lamp') {
          soundFX.playClick();
          setLampOn(prev => {
            const next = !prev;
            if (lampLightRef.current) {
              lampLightRef.current.intensity = next ? 3.6 : 0.0;
            }
            lampShadeMat.emissive.setHex(next ? 0xff8833 : 0x000000);
            lampShadeMat.emissiveIntensity = next ? 0.6 : 0.0;
            return next;
          });
        } else if (name === 'laptop') {
          soundFX.playClick();
          if (onOpenMonitor) onOpenMonitor();
          else setIsMonitorOpen(true);
        } else if (name === 'tablet') {
          soundFX.playClick();
          focusObject('tablet');
        } else if (name === 'phone') {
          soundFX.playClick();
          focusObject('phone');
        }
      } else {
        // Empty space clicked: if card is held, smoothly put it back down
        if (cardAnimRef.current.out > 0.5) {
          putDownCard();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cardAnimRef.current.out > 0.3) {
          putDownCard();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        if (cardAnimRef.current.out > 0.8) {
          e.preventDefault();
          triggerFlip(cardAnimRef.current.side === 1 ? 0 : 1);
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Lerping
      camera.position.lerp(targetCamPos.current, 0.07);
      controls.target.lerp(targetLookAt.current, 0.07);
      controls.update();

      // Zoro Spring Wobble Physics
      if (zoroHeadRef.current) {
        zoroWobbleRef.current *= 0.965; // Damped harmonic decay
        const wobble = zoroWobbleRef.current;
        zoroHeadRef.current.rotation.x = Math.sin(elapsedTime * 8.5) * wobble;
        zoroHeadRef.current.rotation.z = Math.cos(elapsedTime * 6.8) * wobble;
      }

      // Receipt Paper Feed Animation
      if (receiptPaperMeshRef.current && receiptAnimRef.current > 0.01) {
        const curScale = receiptPaperMeshRef.current.scale.y;
        receiptPaperMeshRef.current.scale.y = THREE.MathUtils.lerp(curScale, 1.0, 0.08);
      }

      // Steam Particle Motion
      if (steamParticlesRef.current) {
        const posAttr = steamParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let s = 0; s < steamCount; s++) {
          arr[s * 3 + 1] += 0.0006;
          if (arr[s * 3 + 1] > 0.35) {
            arr[s * 3 + 1] = 0.255;
            arr[s * 3] = 0.31 + (Math.random() - 0.5) * 0.025;
            arr[s * 3 + 2] = -0.16 + (Math.random() - 0.5) * 0.025;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Interactive 3D Business Card Animation & Bezier Arc (Matching pradiplabs.dev)
      const cardMesh = cardMeshRef.current;
      const cardGroup = cardGroupRef.current;
      const w = cardAnimRef.current;

      if (cardMesh && cardGroup) {
        const now = performance.now();
        const diff = Math.abs(w.to - w.from);
        const p = diff > 0 ? clamp01((now - w.movedAt) / (1050 * Math.max(0.35, diff))) : 1;
        w.out = w.from + (w.to - w.from) * Ca(p);

        // Auto flip to back face when arriving in front of camera
        if (w.to === 1 && p >= 1 && w.side === 0 && w.flippedAt < w.movedAt) {
          triggerFlip(1, 120);
        }

        // Flip rotation progress
        const fp = clamp01((now - w.flippedAt) / 600);
        w.flip = w.flipFrom + (w.side - w.flipFrom) * Ca(fp);

        if (w.out > 0.0001) {
          flipQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * w.flip);
          turnQ.copy(tiltQ).multiply(flipQ);

          const containerSize = {
            width: container?.clientWidth || window.innerWidth,
            height: container?.clientHeight || window.innerHeight
          };
          computeHeldTransform(camera, containerSize, cardGroup, turnQ);

          aVec.copy(CARD_REST_POS).setY(CARD_REST_POS.y + 0.16);
          bVec.copy(heldTarget.p).lerp(aVec, 0.4);

          bezierCurve.v0.copy(CARD_REST_POS);
          bezierCurve.v1.copy(aVec);
          bezierCurve.v2.copy(bVec);
          bezierCurve.v3.copy(heldTarget.p);

          bezierCurve.getPoint(w.out, cardMesh.position);

          const slerpProgress = Ca(clamp01((w.out - 0.12) / 0.88));
          cardMesh.quaternion.slerpQuaternions(CARD_REST_ROT, heldTarget.q, slerpProgress);
        } else {
          cardMesh.position.copy(CARD_REST_POS);
          cardMesh.quaternion.copy(CARD_REST_ROT);
        }

        // Metallic glow
        const targetGlow = w.out * (dayMode ? 0.14 : 0.28);
        w.glow += (targetGlow - w.glow) * 0.15;
        if (cardMaterialsRef.current) {
          cardMaterialsRef.current.front.emissiveIntensity = w.glow;
          cardMaterialsRef.current.back.emissiveIntensity = w.glow;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      cardMeshRef.current = null;
      cardGroupRef.current = null;
      cardMaterialsRef.current = null;
    };
  }, [dayMode, takeCard, putDownCard, triggerFlip]);

  const focusObject = (target: 'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'zoro' | 'reset') => {
    soundFX.playClick();
    if (target === 'reset') {
      setFocusedTarget(null);
      targetCamPos.current.set(0.0, 0.95, 1.45);
      targetLookAt.current.set(0.0, 0.32, 0.0);
    } else if (target === 'laptop') {
      setFocusedTarget('laptop');
      targetCamPos.current.set(0.0, 0.44, 0.38);
      targetLookAt.current.set(0.0, 0.28, -0.04);
    } else if (target === 'tablet') {
      setFocusedTarget('tablet');
      targetCamPos.current.set(-0.32, 0.38, 0.36);
      targetLookAt.current.set(-0.32, 0.27, 0.04);
    } else if (target === 'printer') {
      setFocusedTarget('printer');
      targetCamPos.current.set(-0.52, 0.38, 0.28);
      targetLookAt.current.set(-0.52, 0.22, -0.06);
    } else if (target === 'zoro') {
      setFocusedTarget('zoro');
      targetCamPos.current.set(-0.54, 0.36, 0.38);
      targetLookAt.current.set(-0.54, 0.24, 0.15);
    } else if (target === 'phone') {
      setFocusedTarget('phone');
      targetCamPos.current.set(0.27, 0.36, 0.32);
      targetLookAt.current.set(0.27, 0.24, 0.07);
    } else if (target === 'zcard') {
      takeCard();
    } else if (target === 'diary') {
      onOpenDiary();
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none transition-colors duration-500 ${
      dayMode 
        ? 'bg-[radial-gradient(120%_90%_at_50%_45%,#FFFFFF_0%,#F4F4F6_55%,#E8E8EC_100%)] text-slate-900' 
        : 'bg-[#090b10] text-white'
    }`}>
      {/* Top Banner Headline (Matching pradiplabs.dev) */}
      <div className="absolute top-6 inset-x-0 z-20 pointer-events-none text-center px-4">
        <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md font-display ${
          dayMode ? 'text-slate-900' : 'text-white'
        }`}>
          Hi, I'm Joshua (ZYNX).
        </h1>
        <p className={`mt-2 text-xs md:text-sm max-w-xl mx-auto drop-shadow-sm font-sans ${
          dayMode ? 'text-slate-600' : 'text-slate-300'
        }`}>
          I build embedded systems, Arch Linux environments, and modern web applications. 
          Everything on this desk is real and running.
        </p>
      </div>

      {/* Top HUD Controls: Day/Night, X-Ray, Reset, Music, Showcase */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        {(focusedTarget === 'laptop' || isMonitorOpen) && (
          <button
            onClick={() => { soundFX.playClick(); if (onOpenMonitor) onOpenMonitor(); else setIsMonitorOpen(true); }}
            className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-xs font-mono text-cyan-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Desktop
          </button>
        )}

        {focusedTarget && (
          <button
            onClick={() => focusObject('reset')}
            className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset View
          </button>
        )}

        {/* X-Ray / Anatomy Inspection Toggle (Matching pradiplabs.dev X-Ray) */}
        <button
          onClick={() => { soundFX.playClick(); setIsXRayMode(!isXRayMode); }}
          className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
            isXRayMode
              ? 'bg-cyan-400 text-black font-bold border-cyan-300 shadow-cyan-400/30'
              : 'bg-black/60 border-white/20 text-cyan-300 hover:text-white'
          }`}
          title="Toggle X-Ray / Anatomy Inspection (PradipLabs Style)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isXRayMode ? 'X-Ray Active' : 'X-Ray'}</span>
        </button>

        {/* Showcase Switcher */}
        <button
          onClick={() => { soundFX.playClick(); onSwitchToShowcase(); }}
          className="px-3 py-1.5 rounded-full border border-white/20 bg-black/60 hover:bg-black/90 text-xs font-mono text-zinc-200 transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md"
          title="Switch to Showcase Carousel (jesperlandberg.com replica)"
        >
          <span>Showcase</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Day Studio vs Cozy Night Toggle */}
        <button
          onClick={() => { soundFX.playClick(); setDayMode(!dayMode); }}
          className="p-2.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-amber-300 hover:text-white transition-all shadow-lg"
          title={dayMode ? 'Switch to Night Cozy Mode' : 'Switch to Day Studio Mode'}
        >
          {dayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-2.5 rounded-full border backdrop-blur-md transition-all ${
            audioPlaying 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={audioPlaying ? 'Mute Study Music' : 'Play Lofi Radio'}
        >
          {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Tooltips (Matching pradiplabs.dev) */}
      {hoveredObject === 'diary' && (
        <div className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Open my diary · anyone can write in it</span>
          </div>
        </div>
      )}

      {(hoveredObject === 'card' || hoveredObject === 'zcard') && !isCardHeld && (
        <div className="absolute top-[55%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Take my card</span>
          </div>
        </div>
      )}

      {hoveredObject === 'printer' && (
        <div className="absolute top-[48%] left-[26%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2">
            <Printer className="w-3.5 h-3.5" />
            <span>Thermal Docket Printer · Click to Print</span>
          </div>
        </div>
      )}

      {hoveredObject === 'zoro' && (
        <div className="absolute top-[58%] left-[23%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-sans shadow-xl flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Zoro Bobblehead on a Spring · Click to Wobble!</span>
          </div>
        </div>
      )}

      {hoveredObject === 'lamp' && (
        <div className="absolute top-[48%] left-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-sans shadow-xl">
            Click to toggle desk lamp {lampOn ? 'OFF' : 'ON'}
          </div>
        </div>
      )}

      {/* X-Ray / Anatomy Anatomical Pins (Matching pradiplabs.dev xrayParts.tsx) */}
      {isXRayMode && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-[42%] left-[25%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-cyan-400/80 text-cyan-300 font-mono text-[10px] shadow-lg animate-pulse">
            01 // THERMAL POS PRINTER
          </div>
          <div className="absolute top-[52%] left-[22%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-emerald-400/80 text-emerald-300 font-mono text-[10px] shadow-lg animate-pulse">
            02 // ZORO BOBBLEHEAD (SPRING)
          </div>
          <div className="absolute top-[40%] left-[36%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-cyan-400/80 text-cyan-300 font-mono text-[10px] shadow-lg animate-pulse">
            03 // Z-DOCKET TABLET (ARCH LINUX)
          </div>
          <div className="absolute top-[38%] left-[50%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-white/80 text-white font-mono text-[10px] shadow-lg animate-pulse">
            04 // RUNNING PROJECTS LAPTOP
          </div>
          <div className="absolute top-[60%] left-[48%] -translate-x-1/2 px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] shadow-lg animate-bounce pointer-events-auto cursor-pointer" onClick={onOpenAnatomy}>
            🔬 05 // Z CARD V0.1 (SOLAR + BIOMETRIC)
          </div>
          <div className="absolute top-[54%] left-[62%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-amber-400/80 text-amber-300 font-mono text-[10px] shadow-lg animate-pulse">
            06 // LEATHER GUESTBOOK DIARY
          </div>
          <div className="absolute top-[40%] left-[73%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-amber-400/80 text-amber-300 font-mono text-[10px] shadow-lg animate-pulse">
            07 // MUSHROOM LAMP (WARM 3.6W)
          </div>
          <div className="absolute top-[46%] left-[67%] -translate-x-1/2 px-2.5 py-1 rounded bg-black/85 border border-sky-400/80 text-sky-300 font-mono text-[10px] shadow-lg animate-pulse">
            08 // SMARTPHONE (7YNX DSP RADIO)
          </div>
        </div>
      )}

      {/* Action Prompt when Tablet is Focused */}
      {focusedTarget === 'tablet' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={triggerPrintReceipt}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/30 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{printedReceipt ? 'Re-Print Telemetry Receipt' : 'Print Docket Receipt to Thermal Printer'}</span>
          </button>
        </div>
      )}

      {/* Bottom Bar Pills (Exact Navigation from pradiplabs.dev) */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center gap-2 px-4 flex-wrap pointer-events-auto">
        <button
          onClick={() => {
            soundFX.playClick();
            if (onOpenMonitor) onOpenMonitor();
            else setIsMonitorOpen(true);
          }}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'laptop' || isMonitorOpen
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Laptop</span>
          <span className="text-slate-400">My websites</span>
        </button>

        <button
          onClick={() => focusObject('tablet')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'tablet'
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Tablet</span>
          <span className="text-slate-400">Docket system</span>
        </button>

        <button
          onClick={() => focusObject('printer')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'printer'
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Receipt Printer</span>
          <span className="text-slate-400">Print docket</span>
        </button>

        <button
          onClick={() => focusObject('zoro')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'zoro'
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Zoro</span>
          <span className="text-slate-400">Bobblehead</span>
        </button>

        <button
          onClick={() => focusObject('phone')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'phone'
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Phone</span>
          <span className="text-slate-400">7YNX Chat & Audio</span>
        </button>

        <button
          onClick={onOpenDiary}
          className="px-3.5 py-2 rounded-full border border-white/15 bg-black/70 text-xs font-sans text-slate-300 hover:text-white hover:bg-black/90 transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <span className="font-semibold text-white">Diary</span>
          <span className="text-slate-400">Guestbook</span>
        </button>

        <button
          onClick={takeCard}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            isCardHeld
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Card</span>
          <span className="text-slate-400">Take my card</span>
        </button>

        <button
          onClick={onOpenAnatomy}
          className="px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-500/20 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shadow-cyan-500/20"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Z Card Anatomy</span>
        </button>
      </div>

      {/* Interactive Business Card Held Overlay (Matching pradiplabs.dev) */}
      {isCardHeld && (
        <div className="absolute bottom-6 inset-x-0 z-40 flex flex-col items-center gap-2.5 pointer-events-auto px-4 animate-fade-in">
          {/* Micro instruction badge */}
          <div className="px-3.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-white/90 text-xs font-sans shadow-lg flex items-center gap-2">
            <span>Click card to flip</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60">Press Esc or click desk to put down</span>
          </div>

          {/* Floating Action Dock */}
          <div className="flex items-center justify-center gap-2 rounded-full bg-white/95 dark:bg-black/85 p-2 shadow-2xl ring-1 ring-black/10 dark:ring-white/15 backdrop-blur-xl flex-wrap">
            {/* Social Quick Links */}
            <div className="flex items-center gap-1 px-1">
              <a
                href="https://wa.me/917259987691"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-500/20 text-slate-800 dark:text-zinc-200 hover:text-emerald-500 flex items-center justify-center transition-all"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="tel:+917259987691"
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-cyan-500/20 text-slate-800 dark:text-zinc-200 hover:text-cyan-400 flex items-center justify-center transition-all"
                title="Call Joshua"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:joshuajosh3055@gmail.com"
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-blue-500/20 text-slate-800 dark:text-zinc-200 hover:text-blue-400 flex items-center justify-center transition-all"
                title="Email Joshua"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/Zynx"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-blue-600/20 text-slate-800 dark:text-zinc-200 hover:text-blue-500 flex items-center justify-center transition-all"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Zynxx777"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-zinc-500/20 text-slate-800 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="h-6 w-px bg-black/10 dark:bg-white/15 mx-1" />

            {/* Save Contact vCard */}
            <button
              onClick={() => {
                soundFX.playClick();
                downloadVCard();
              }}
              className="h-10 px-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save my contact</span>
            </button>

            {/* Flip Button */}
            <button
              onClick={() => triggerFlip(cardAnimRef.current.side === 1 ? 0 : 1)}
              className="h-10 px-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Flip card (Space)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip</span>
            </button>

            {/* Put it back */}
            <button
              onClick={putDownCard}
              className="h-10 px-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Put card back (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Put it back</span>
            </button>

            {/* Exploded 3D Anatomy */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenAnatomy();
              }}
              className="h-10 px-3 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-400 text-xs font-mono font-medium flex items-center gap-1.5 transition-all"
              title="Open Exploded 3D CAD Anatomy Reveal"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Anatomy 🔬</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Desktop Monitor Experience (pradiplabs.dev replica) */}
      <MonitorDesktopModal
        isOpen={isMonitorOpen}
        onClose={() => setIsMonitorOpen(false)}
        onOpenAnatomy={onOpenAnatomy}
        onOpenProject={onOpenProject}
      />
    </div>
  );
};
