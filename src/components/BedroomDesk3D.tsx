import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  Layers, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BedroomDesk3DProps {
  onOpenDiary: () => void;
  onOpenProject: (projectId: string) => void;
  onSwitchToShowcase: () => void;
  onOpenAnatomy: () => void;
}

export const BedroomDesk3D: React.FC<BedroomDesk3DProps> = ({
  onOpenDiary,
  onOpenProject,
  onSwitchToShowcase,
  onOpenAnatomy
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [focusedTarget, setFocusedTarget] = useState<'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11131a);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 50);
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.35;
    controls.maxDistance = 2.8;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below table
    controls.target.copy(targetLookAt.current);
    controlsRef.current = controls;

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.95);
    scene.add(ambientLight);

    const softSun = new THREE.DirectionalLight(0xfff0dd, 2.0);
    softSun.position.set(-1.4, 2.4, 1.2);
    softSun.castShadow = true;
    softSun.shadow.mapSize.width = 1024;
    softSun.shadow.mapSize.height = 1024;
    softSun.shadow.bias = -0.0005;
    scene.add(softSun);

    // Warm Mushroom Desk Lamp Point Light
    const lampLight = new THREE.PointLight(0xff9838, 3.2, 1.6, 2.0);
    lampLight.position.set(0.42, 0.32, -0.05);
    lampLight.castShadow = true;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // Screen fill lights (cool cyan)
    const screenGlow = new THREE.PointLight(0x00f0ff, 0.5, 0.9);
    screenGlow.position.set(0.0, 0.38, -0.02);
    scene.add(screenGlow);

    // 3. Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xd8bf9c,
      roughness: 0.42,
      metalness: 0.05,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: 0xf0f2f5,
      roughness: 0.25,
      metalness: 0.85,
    });

    const laptopAlu = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.22,
      metalness: 0.88,
    });

    const blackPlastic = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.4,
      metalness: 0.2,
    });

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f7,
      roughness: 0.18,
      metalness: 0.05,
    });

    const flaskBlue = new THREE.MeshStandardMaterial({
      color: 0x225577,
      roughness: 0.3,
      metalness: 0.2,
    });

    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xc86446,
      roughness: 0.65,
      metalness: 0.0,
    });

    const plantGreen = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.5,
      metalness: 0.0,
    });

    const diaryLeather = new THREE.MeshStandardMaterial({
      color: 0x16181f,
      roughness: 0.35,
      metalness: 0.1,
    });

    const silverMetal = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });

    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba,
      roughness: 0.3,
      metalness: 0.05,
      emissive: 0xff9944,
      emissiveIntensity: 0.45,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.2,
      metalness: 0.95,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x2a2826,
      roughness: 0.85,
      metalness: 0.0,
    });

    const interactiveObjects: THREE.Object3D[] = [];

    const registerClickable = (obj: THREE.Object3D, name: string) => {
      obj.userData = { clickableName: name };
      interactiveObjects.push(obj);
    };

    // 4. Back Wall & Ambient Room
    const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), wallMat);
    wallMesh.position.set(0.0, 0.70, -0.34);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // Wall Sticky Notes (Exact feature from pradiplabs.dev)
    const stickyColors = [0xfef08a, 0xfbcfe8, 0xbae6fd, 0xbbf7d0];
    const stickyPositions = [
      [-0.20, 0.48, -0.335],
      [-0.14, 0.44, -0.335],
      [0.16, 0.49, -0.335],
      [0.22, 0.45, -0.335]
    ];
    stickyPositions.forEach(([sx, sy, sz], idx) => {
      const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.055, 0.055),
        new THREE.MeshStandardMaterial({ color: stickyColors[idx % stickyColors.length], roughness: 0.7 })
      );
      note.position.set(sx, sy, sz);
      note.rotation.z = (idx % 2 === 0 ? 0.05 : -0.06);
      scene.add(note);
    });

    // 5. Desk Top & Legs
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.035, 0.65),
      woodMat
    );
    deskTop.position.set(0.0, 0.15, 0.0);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    scene.add(deskTop);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.48, 16);
    const legPositions = [
      [-0.58, -0.09, -0.26],
      [0.58, -0.09, -0.26],
      [-0.58, -0.09, 0.26],
      [0.58, -0.09, 0.26]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // 6. Dynamic Screen Canvas Textures (High Detail Replicas)
    // 6a. Laptop Screen Texture: "8 projects, all running"
    const laptopCanvas = document.createElement('canvas');
    laptopCanvas.width = 1024;
    laptopCanvas.height = 680;
    const lCtx = laptopCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#0f172a';
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
      lCtx.roundRect(120, 10, 400, 28, 6);
      lCtx.fill();
      lCtx.fillStyle = '#64748b';
      lCtx.font = '14px monospace';
      lCtx.fillText('https://zynx.dev/systems', 135, 29);

      // Headline
      lCtx.fillStyle = '#ffffff';
      lCtx.font = 'bold 26px sans-serif';
      lCtx.fillText('Eight projects, all running.', 40, 95);
      lCtx.fillStyle = '#94a3b8';
      lCtx.font = '15px sans-serif';
      lCtx.fillText('Active embedded nodes, Arch Linux environments & client applications.', 40, 122);

      // Grid of 6 project tiles
      const mockTiles = [
        { title: 'Z Card v0.1', sub: 'Hardware Smart Card', tag: 'ACTIVE' },
        { title: 'S.M. School Web', sub: 'Client Education Portal', tag: 'LIVE' },
        { title: 'Arch Workstation', sub: 'Hyprland & Kernel Tuning', tag: 'SYSTEM' },
        { title: 'Luxoft AAOS', sub: 'Android Automotive CAN', tag: 'RESEARCH' },
        { title: 'MediVend Dispenser', sub: 'Verilog & Stepper Logic', tag: 'HARDWARE' },
        { title: '7YNX Audio Lab', sub: 'Synthesizers & Lofi DAW', tag: 'CREATIVE' }
      ];

      mockTiles.forEach((tile, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const tx = 40 + col * 315;
        const ty = 150 + row * 240;

        lCtx.fillStyle = '#1e293b';
        lCtx.roundRect(tx, ty, 295, 215, 12);
        lCtx.fill();
        lCtx.strokeStyle = '#334155';
        lCtx.lineWidth = 1.5;
        lCtx.stroke();

        // Card banner
        lCtx.fillStyle = '#0f172a';
        lCtx.roundRect(tx + 12, ty + 12, 271, 110, 8);
        lCtx.fill();

        // Badge
        lCtx.fillStyle = '#00f0ff';
        lCtx.font = 'bold 11px monospace';
        lCtx.fillText(tile.tag, tx + 24, ty + 38);

        // Title
        lCtx.fillStyle = '#ffffff';
        lCtx.font = 'bold 18px sans-serif';
        lCtx.fillText(tile.title, tx + 14, ty + 155);

        // Sub
        lCtx.fillStyle = '#94a3b8';
        lCtx.font = '13px sans-serif';
        lCtx.fillText(tile.sub, tx + 14, ty + 180);
      });
    }
    const laptopTexture = new THREE.CanvasTexture(laptopCanvas);
    laptopTexture.colorSpace = THREE.SRGBColorSpace;

    // 6b. Tablet Screen Texture: "Docket Telemetry System"
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 680;
    tabletCanvas.height = 480;
    const tCtx = tabletCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#080d18';
      tCtx.fillRect(0, 0, 680, 480);
      // Header
      tCtx.fillStyle = '#00f0ff';
      tCtx.font = 'bold 20px monospace';
      tCtx.fillText('Z-DOCKET TELEMETRY // ARCH', 30, 45);
      tCtx.fillStyle = '#64748b';
      tCtx.font = '12px monospace';
      tCtx.fillText('CONNECTED NODES: 6 ONLINE', 30, 70);

      // Stats boxes
      const stats = [
        { label: 'CPU LOAD', val: '18% @ 3.8GHz', color: '#10b981' },
        { label: 'RAM USAGE', val: '8.4 / 32 GB', color: '#38bdf8' },
        { label: 'BATTERY V', val: '3.78 V (SOLAR ON)', color: '#fbbf24' },
        { label: 'THROUGHPUT', val: '124 MB/s', color: '#a855f7' }
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

      // Chart line
      tCtx.strokeStyle = '#00f0ff';
      tCtx.lineWidth = 3;
      tCtx.beginPath();
      tCtx.moveTo(40, 420);
      tCtx.bezierCurveTo(150, 360, 300, 440, 450, 370);
      tCtx.lineTo(640, 390);
      tCtx.stroke();
    }
    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    tabletTexture.colorSpace = THREE.SRGBColorSpace;

    // 6c. Phone Screen Texture: "AI Sales & Player"
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 400;
    phoneCanvas.height = 800;
    const pCtx = phoneCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#0a0f1d';
      pCtx.fillRect(0, 0, 400, 800);
      
      // Top status
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 16px sans-serif';
      pCtx.fillText('9:41', 30, 40);
      pCtx.fillText('5G 100%', 320, 40);

      // App Header
      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(20, 70, 360, 60, 14);
      pCtx.fill();
      pCtx.fillStyle = '#38bdf8';
      pCtx.font = 'bold 18px sans-serif';
      pCtx.fillText('7YNX Smart Chat & Store', 40, 107);

      // Chat bubbles
      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(25, 160, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#e2e8f0';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Hi! Looking for hardware prototype', 40, 190);
      pCtx.fillText('or Arch Linux automation consulting?', 40, 212);

      pCtx.fillStyle = '#0284c7';
      pCtx.roundRect(95, 260, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Yes, interested in the Z Card', 115, 290);
      pCtx.fillText('and embedded demonstrator!', 115, 312);

      // Audio waveform box
      pCtx.fillStyle = '#0f172a';
      pCtx.roundRect(25, 420, 350, 180, 16);
      pCtx.fill();
      pCtx.fillStyle = '#00f0ff';
      pCtx.font = 'bold 15px monospace';
      pCtx.fillText('NOW PLAYING: LOFI STUDY', 45, 460);
      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '12px sans-serif';
      pCtx.fillText('Artist: 7YNX · Original Ambient Composition', 45, 485);

      for (let b = 0; b < 24; b++) {
        const barH = 20 + Math.sin(b * 0.7) * 35;
        pCtx.fillStyle = '#00f0ff';
        pCtx.fillRect(45 + b * 13, 550 - barH, 8, barH);
      }
    }
    const phoneTexture = new THREE.CanvasTexture(phoneCanvas);
    phoneTexture.colorSpace = THREE.SRGBColorSpace;

    // 7. Laptop Model (Center)
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
    screenHinge.rotation.x = Math.PI / 2 - 0.22; // ~102 degrees open

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

    // 8. Tablet on Stand (Left of laptop)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-0.36, 0.17, 0.04);
    tabletGroup.rotation.y = Math.PI / 10;

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

    // 9. Mobile Phone & Stand (Right of laptop)
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

    // 10. Personal Guestbook Diary (Front Right)
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

    // 11. Physical Z Card on Desk (Direct Anatomy Reveal Entrypoint!)
    const zcardGroup = new THREE.Group();
    zcardGroup.position.set(-0.02, 0.172, 0.18);
    zcardGroup.rotation.y = 0.12;

    const zcardBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.0856, 0.0014, 0.05398),
      new THREE.MeshStandardMaterial({ color: 0x07090e, roughness: 0.25, metalness: 0.15 })
    );
    zcardBody.castShadow = true;
    zcardGroup.add(zcardBody);

    const zcardChip = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.009), goldMat);
    zcardChip.rotation.x = -Math.PI / 2;
    zcardChip.position.set(-0.024, 0.00075, -0.002);
    zcardGroup.add(zcardChip);

    const zcardScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.045, 0.022),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    zcardScreen.rotation.x = -Math.PI / 2;
    zcardScreen.position.set(0.012, 0.00075, 0.006);
    zcardGroup.add(zcardScreen);

    scene.add(zcardGroup);
    registerClickable(zcardBody, 'zcard');

    // 12. Mushroom Desk Lamp (Right rear)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.42, 0.17, -0.05);

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.012, 24),
      new THREE.MeshStandardMaterial({ color: 0xdd8877, roughness: 0.4 })
    );
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 16), silverMetal);
    lampStem.position.set(0.0, 0.07, 0.0);
    lampGroup.add(lampStem);

    const lampDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      lampShadeMat
    );
    lampDome.position.set(0.0, 0.14, 0.0);
    lampDome.castShadow = true;
    lampGroup.add(lampDome);

    scene.add(lampGroup);
    registerClickable(lampDome, 'lamp');
    registerClickable(lampBase, 'lamp');

    // 13. Accessories Matching Video 1:
    // Coffee Mug with coffee
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

    // Blue Ceramic Flask / Kettle
    const flask = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.038, 0.14, 20), flaskBlue);
    flask.position.set(0.24, 0.24, -0.22);
    flask.castShadow = true;
    scene.add(flask);

    // Potted Succulent Plant
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.07, 16), terracottaMat);
    pot.position.set(0.42, 0.20, -0.22);
    pot.castShadow = true;
    scene.add(pot);

    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.09, 8), plantGreen);
      leaf.position.set(0.42 + (Math.cos(i * 1.25) * 0.015), 0.27, -0.22 + (Math.sin(i * 1.25) * 0.015));
      leaf.rotation.set((Math.sin(i) * 0.25), i * 1.2, (Math.cos(i) * 0.25));
      leaf.castShadow = true;
      scene.add(leaf);
    }

    // Photo Frame with Photo
    const photoFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.095, 0.008),
      blackPlastic
    );
    photoFrame.position.set(0.14, 0.215, -0.20);
    photoFrame.rotation.y = -0.18;
    photoFrame.castShadow = true;
    scene.add(photoFrame);

    const photoPic = new THREE.Mesh(
      new THREE.PlaneGeometry(0.068, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })
    );
    photoPic.position.set(0.14, 0.215, -0.195);
    photoPic.rotation.y = -0.18;
    scene.add(photoPic);

    // Spectacles / Glasses
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(-0.20, 0.175, 0.18);
    glassesGroup.rotation.y = 0.2;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.002, 12, 24), blackPlastic);
    ring1.position.x = -0.024;
    ring1.rotation.x = Math.PI / 2;
    const ring2 = ring1.clone();
    ring2.position.x = 0.024;
    glassesGroup.add(ring1);
    glassesGroup.add(ring2);
    scene.add(glassesGroup);

    // Cute Anime Figurine (teal hair, green body)
    const figGroup = new THREE.Group();
    figGroup.position.set(-0.52, 0.19, 0.04);
    const figHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x5eead4, roughness: 0.4 })
    );
    figHead.position.y = 0.055;
    figGroup.add(figHead);

    const figBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.045, 16),
      new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.5 })
    );
    figBody.position.y = 0.022;
    figGroup.add(figBody);
    scene.add(figGroup);

    // Hardware Box / Receipt Device (Far Left)
    const deviceBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.13), blackPlastic);
    deviceBox.position.set(-0.50, 0.22, -0.12);
    deviceBox.castShadow = true;
    scene.add(deviceBox);

    const ledDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.0035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ledDot.position.set(-0.43, 0.22, -0.054);
    scene.add(ledDot);

    // Business Card in Wooden Stand
    const cardStand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.03), woodMat);
    cardStand.position.set(-0.16, 0.178, 0.08);
    cardStand.rotation.y = 0.15;
    scene.add(cardStand);

    const bCard = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.05, 0.002), blackPlastic);
    bCard.position.set(-0.16, 0.20, 0.08);
    bCard.rotation.x = -0.15;
    bCard.rotation.y = 0.15;
    scene.add(bCard);

    // Raycasting for Interactivity
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
        if (name === 'diary') {
          onOpenDiary();
        } else if (name === 'zcard') {
          onOpenAnatomy();
        } else if (name === 'lamp') {
          setLampOn(prev => {
            const next = !prev;
            if (lampLightRef.current) {
              lampLightRef.current.intensity = next ? 3.2 : 0.0;
            }
            return next;
          });
        } else if (name === 'laptop') {
          focusObject('laptop');
        } else if (name === 'tablet') {
          focusObject('tablet');
        } else if (name === 'phone') {
          focusObject('phone');
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('click', onClick);

    // Animation & Smooth Camera Gliding Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smoothly Lerp Camera to Target
      camera.position.lerp(targetCamPos.current, 0.07);
      controls.target.lerp(targetLookAt.current, 0.07);
      controls.update();

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
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const focusObject = (target: 'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'reset') => {
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
      targetCamPos.current.set(-0.36, 0.38, 0.36);
      targetLookAt.current.set(-0.36, 0.27, 0.04);
    } else if (target === 'phone') {
      setFocusedTarget('phone');
      targetCamPos.current.set(0.27, 0.36, 0.32);
      targetLookAt.current.set(0.27, 0.24, 0.07);
    } else if (target === 'zcard') {
      onOpenAnatomy();
    } else if (target === 'diary') {
      onOpenDiary();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#090b10]">
      {/* Top Banner Headline (Matching pradiplabs.dev) */}
      <div className="absolute top-6 inset-x-0 z-20 pointer-events-none text-center px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md font-display">
          Hi, I'm Joshua (ZYNX).
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-xl mx-auto drop-shadow-sm font-sans">
          I build embedded systems, Arch Linux environments, and modern web applications. 
          Everything on this desk is real and running.
        </p>
      </div>

      {/* Top Controls: Audio & Reset View */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        {focusedTarget === 'laptop' && (
          <button
            onClick={() => onOpenProject('zcard')}
            className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-xs font-mono text-cyan-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Project Details
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

        <button
          onClick={toggleAudio}
          className={`p-2.5 rounded-full border backdrop-blur-md transition-all ${
            audioPlaying 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={audioPlaying ? 'Mute Study Music' : 'Play Lofi Study Beats'}
        >
          {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Floating Hover Prompt (Matching pradiplabs.dev "Open my diary") */}
      {hoveredObject === 'diary' && (
        <div className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Open my diary · anyone can write in it</span>
          </div>
        </div>
      )}

      {hoveredObject === 'zcard' && (
        <div className="absolute top-[55%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Z Card v0.1 · Click for Anatomy Reveal</span>
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

      {/* Bottom Bar Pills (Exact Navigation from pradiplabs.dev) */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center gap-2 px-4 flex-wrap pointer-events-auto">
        <button
          onClick={() => focusObject('laptop')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'laptop'
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
          onClick={() => focusObject('phone')}
          className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg ${
            focusedTarget === 'phone'
              ? 'bg-white text-slate-950 font-bold border-white'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
        >
          <span className="font-semibold text-white">Phone</span>
          <span className="text-slate-400">AI sales chat</span>
        </button>

        <button
          onClick={onOpenDiary}
          className="px-3.5 py-2 rounded-full border border-white/15 bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
        >
          <span>✍ Write in my diary</span>
        </button>

        {/* Anatomy Reveal Direct Trigger */}
        <button
          onClick={onOpenAnatomy}
          className="px-3.5 py-2 rounded-full border border-cyan-400/40 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 text-xs font-sans transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-cyan-500/20"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Anatomy Reveal</span>
        </button>

        {/* Switcher to 3D Curved Showcase Carousel (jesperlandberg.com style) */}
        <button
          onClick={onSwitchToShowcase}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 ml-2"
        >
          <span>3D Showcase Carousel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
