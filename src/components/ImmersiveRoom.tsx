import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { soundFX } from "../utils/audioFX";

// ── Zone definitions ────────────────────────────────────────────────────────
export const ROOM_ZONES = {
  monitor_left:  { label: "AAOS Cockpit Lab",     color: "#00F2FE", dot: "⚡", code: "01 // AUTOMOTIVE" },
  monitor_right: { label: "WebGL Creative Studio", color: "#9D4EDD", dot: "✦", code: "02 // SHADERS" },
  pc_case:       { label: "Linux Battlestation",   color: "#4FACFE", dot: "⬡", code: "03 // KERNEL" },
  audio_rig:     { label: "7YNX Sound Station",    color: "#F72585", dot: "♪", code: "04 // SYNTH" },
  bookshelf:     { label: "Achievements & Creds",  color: "#10B981", dot: "◈", code: "05 // AWARDS" },
  poster_wall:   { label: "Digital Art Sanctuary", color: "#FFB347", dot: "◉", code: "06 // GALLERY" },
  headphones:    { label: "Acoustic Library",      color: "#F72585", dot: "◎", code: "07 // AUDIO" },
} as const;

export type ZoneId = keyof typeof ROOM_ZONES;
export const ROOM_POSTERS = [
  { id: "lofi-study", title: "Lofi Study Night", image: "/images/ambient/lofi-study-night.jpg", caption: "A quiet desk, a warm lamp, and a loop for long creative nights." },
  { id: "rain-window", title: "Rain at the Window", image: "/images/ambient/soothing-rain.jpg", caption: "A soft rainy-day scene from the bedroom studio wall." },
  { id: "black-hole", title: "Black Hole", image: "/images/blackhole.jpeg", caption: "A space study that carries the original Cyberpunk Space theme into the gallery." },
  { id: "anime-moon", title: "Anime Moonlight", image: "/images/ambient/anime-moon.jpg", caption: "A moonlit anime-inspired print for the bedroom corner." },
] as const;
export type RoomPosterId = typeof ROOM_POSTERS[number]["id"];

interface ImmersiveRoomProps {
  onZoneClick: (zoneId: ZoneId) => void;
  activeZoneId?: ZoneId | "overview" | null;
  theme: "cyberpunk" | "anime-bedroom";
  editMode: boolean;
  onEditModeChange: (enabled: boolean) => void;
  onEscape: () => void;
  onFurnitureSelect: (label: string | null, id?: FurnitureId | null) => void;
  resetLayoutSignal: number;
  saveDefaultLayoutSignal: number;
  snapToGrid: boolean;
  furnitureEditRequest: FurnitureEditRequest;
  onPosterClick: (posterId: RoomPosterId) => void;
  onPhoneClick: () => void;
  nightMode: boolean;
  onLightingToggle: () => void;
}

export type FurnitureId = "studio" | "cpu" | "phone" | "shelf" | "gallery" | "chair" | "bed" | "door" | "lamp";
export type FurniturePlacement = { x: number; z: number; y?: number; rotation?: number };
export type FurnitureEditRequest =
  | { sequence: number; action: "rotate"; degrees: number }
  | { sequence: number; action: "dock"; side: "left" | "right" }
  | { sequence: number; action: "nudge"; dx: number; dz: number }
  | { sequence: number; action: "select"; id: FurnitureId | null }
  | { sequence: number; action: "cycle"; direction: 1 | -1 };

export function getResponsiveOverview(width?: number, height?: number): { fov: number; cam: [number, number, number]; lookAt: [number, number, number] } {
  const w = width ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
  const h = height ?? (typeof window !== "undefined" ? window.innerHeight : 720);
  const aspect = w / Math.max(h, 1);
  if (aspect >= 1.25) {
    return {
      fov: 42,
      cam: [7, 6, 8],
      lookAt: [0, 1.2, 0],
    };
  }
  if (aspect >= 0.85) {
    const t = (1.25 - aspect) / (1.25 - 0.85);
    return {
      fov: 42 + t * 16,
      cam: [7 + t * 4.8, 6 + t * 6.0, 8 + t * 5.2],
      lookAt: [0, 1.2, 0],
    };
  }
  // Mobile phones & narrow portrait screens (aspect < 0.85 down to ~0.40)
  const t = Math.max(0, Math.min(1, (0.85 - aspect) / (0.85 - 0.40)));
  return {
    fov: 58 + t * 13,
    cam: [11.8 + t * 6.2, 12.0 + t * 11.0, 13.2 + t * 8.3],
    lookAt: [0.25 * t, 1.2 + t * 0.3, 0],
  };
}

export const ROOM_FURNITURE_CATALOG: Array<{
  id: FurnitureId;
  label: string;
  shortLabel: string;
  icon: string;
  themes: Array<"cyberpunk" | "anime-bedroom">;
}> = [
  { id: "studio", label: "Studio desk rig", shortLabel: "Desk Rig", icon: "🖥️", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "chair", label: "Studio chair", shortLabel: "Chair", icon: "🪑", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "bed", label: "Bed and bedside set", shortLabel: "Bed Set", icon: "🛏️", themes: ["anime-bedroom"] },
  { id: "lamp", label: "Bedside floor lamp", shortLabel: "Floor Lamp", icon: "💡", themes: ["anime-bedroom"] },
  { id: "cpu", label: "PC tower", shortLabel: "PC Tower", icon: "💻", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "phone", label: "Desk phone", shortLabel: "Desk Phone", icon: "📱", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "shelf", label: "Bookshelf", shortLabel: "Bookshelf", icon: "📚", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "door", label: "Bedroom door", shortLabel: "Door", icon: "🚪", themes: ["anime-bedroom"] },
  { id: "gallery", label: "Anime art wall", shortLabel: "Art Wall", icon: "🖼️", themes: ["cyberpunk", "anime-bedroom"] },
];

const transformCameraForFurniture = (coords: number[], placement: FurniturePlacement) => {
  const rotation = placement.rotation ?? 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const transformPoint = (x: number, y: number, z: number) => [
    placement.x + x * cos + z * sin,
    (placement.y ?? 0) + y,
    placement.z - x * sin + z * cos,
  ];
  return [
    ...transformPoint(coords[0], coords[1], coords[2]),
    ...transformPoint(coords[3], coords[4], coords[5]),
  ];
};
const ROOM_LAYOUT_KEY = "zynx-bedroom-room-layout-v2";
const ROOM_DEFAULT_LAYOUT_KEY = "zynx-bedroom-room-default-layout-v2";
const ROOM_DEFAULT_CAPTURE_KEY = "zynx-bedroom-room-default-capture-v3";
const ROOM_LAYOUT_SHIFT_KEY = "zynx-bedroom-room-layout-workspace-shift-v2";

export const HARDCODED_DEFAULT_ROOM_LAYOUT: Record<FurnitureId, FurniturePlacement> = {
  studio:  { x: 0, z: -2.85, rotation: 0 },
  chair:   { x: 0, z: -2, rotation: 0 },
  door:    { x: 6.45, z: -4.8, rotation: 0 },
  cpu:     { x: 3.65, y: 1.49, z: -0.62, rotation: 0 },
  phone:   { x: -1.65, y: 1.49, z: 0.32, rotation: 0 },
  shelf:   { x: -7.95, z: -3.4, rotation: 1.5707963267948966 },
  gallery: { x: 0, z: 0, rotation: 0 },
  bed:     { x: 5.45, z: 1.97, rotation: 0 },
  lamp:    { x: 3.5, z: 0, rotation: 0 },
};
const ZONE_FURNITURE: Partial<Record<ZoneId, FurnitureId>> = {
  monitor_left: "studio",
  monitor_right: "studio",
  pc_case: "cpu",
  audio_rig: "studio",
  headphones: "studio",
  bookshelf: "shelf",
  poster_wall: "gallery",
};

const transformCameraForZone = (
  zone: ZoneId | "overview",
  coords: number[],
  placements: Partial<Record<FurnitureId, FurniturePlacement>>,
) => {
  if (zone === "overview") return coords;
  const furnitureId = ZONE_FURNITURE[zone];
  if (!furnitureId) return coords;
  const placement = placements[furnitureId];
  if (furnitureId === "cpu") {
    const cpuCoords = placement ? transformCameraForFurniture(coords, placement) : coords;
    const deskPlacement = placements.studio;
    return deskPlacement ? transformCameraForFurniture(cpuCoords, deskPlacement) : cpuCoords;
  }
  return placement ? transformCameraForFurniture(coords, placement) : coords;
};

// Camera coordinates: [camX, camY, camZ, lookX, lookY, lookZ]
export const ZONE_CAMS: Record<ZoneId | "overview", number[]> = {
  overview:      [7, 6, 8, 0, 1.2, 0],
  monitor_left:  [-0.2, 2.6, 2.8, -0.88, 2.25, -0.75],
  monitor_right: [ 1.4, 2.6, 2.8,  0.88, 2.25, -0.75],
  pc_case:       [ 1.2, 1.0, 2.8,  0,    0.7,   0   ],
  audio_rig:     [-3.0, 2.6, 2.8, -1.6,  1.8,  -0.5 ],
  // Furniture cameras are stored in the object's local space so they follow
  // the object when it is moved or turned to another wall.
  bookshelf:     [ 0, 3.2,  3.2,  0,  2.4,  0.45],
  poster_wall:   [-2.5, 4.5, 1.5, -4.2,  4.6,  -4.3 ],
  headphones:    [-3.72, 2.5, 2.04, -3.52, 2.1, -0.96],
};

// Helper: neon sign text canvas
function makeTextTex(text: string, color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 1024, 128);
  ctx.shadowColor = color; ctx.shadowBlur = 28;
  ctx.fillStyle = color;
  ctx.font = 'bold 72px "Courier New", monospace';
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 512, 64);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 68px "Courier New", monospace';
  ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.9;
  ctx.fillText(text, 512, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Helper: the same hourglass Z7X mark used by the phone, embossed on the chair.
function makeChair7XEmblemTex(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d")!;

  // Deep obsidian background with carbon micro-texture
  ctx.fillStyle = "#090a10";
  ctx.fillRect(0, 0, 1024, 1024);

  // Carbon fiber weave cross-hatch pattern
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 2;
  for (let i = -1024; i < 2048; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 1024, 1024);
    ctx.stroke();
  }

  // The plate and luminous angular hourglass form a single clean monogram.
  ctx.strokeStyle = "rgba(0, 242, 254, 0.38)";
  ctx.lineWidth = 4;
  ctx.strokeRect(150, 104, 724, 816);
  const mark = new Path2D("M248 170 H776 V258 L606 512 L776 766 V854 H248 V766 L418 512 L248 258 Z");
  ctx.save();
  ctx.shadowColor = "#28dafa";
  ctx.shadowBlur = 46;
  const grad = ctx.createLinearGradient(250, 180, 770, 850);
  grad.addColorStop(0, "#bafaff");
  grad.addColorStop(0.42, "#22d3ee");
  grad.addColorStop(0.76, "#818cf8");
  grad.addColorStop(1, "#c084fc");
  ctx.fillStyle = grad;
  ctx.fill(mark);
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "destination-out";
  ctx.fill(new Path2D("M326 242 H698 V253 L547 480 H477 L326 253 Z M477 544 H547 L698 771 V782 H326 V771 Z"));
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
  ctx.font = '900 74px "Arial Black", sans-serif';
  ctx.fillStyle = "rgba(225, 250, 255, 0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Z7X", 512, 950);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function makeNightWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, "#050a20");
  sky.addColorStop(0.52, "#101b45");
  sky.addColorStop(0.84, "#355d89");
  sky.addColorStop(1, "#f0a67f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 768, 512);

  const horizonGlow = ctx.createRadialGradient(390, 415, 12, 390, 415, 360);
  horizonGlow.addColorStop(0, "rgba(255,177,150,.42)");
  horizonGlow.addColorStop(1, "rgba(70,111,171,0)");
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 180, 768, 332);

  // Calm, pin-sharp stars with a handful of soft glints.
  let seed = 7429;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 190; i++) {
    const x = random() * 768;
    const y = random() * 330;
    const radius = 0.7 + random() * 1.35;
    ctx.globalAlpha = 0.42 + random() * 0.5;
    ctx.fillStyle = i % 7 === 0 ? "#d9f2ff" : "#fff7ed";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  [[126, 103], [537, 177], [674, 75], [341, 233]].forEach(([x, y]) => {
    ctx.strokeStyle = "rgba(207,236,255,.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y);
    ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7);
    ctx.stroke();
  });

  // Crescent moon and a quiet distant ridge keep the view soft rather than stark.
  ctx.shadowColor = "#d5efff";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#e8f5ff";
  ctx.beginPath(); ctx.arc(598, 126, 34, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#111b43";
  ctx.beginPath(); ctx.arc(614, 112, 32, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "rgba(9,18,47,.52)";
  ctx.beginPath(); ctx.moveTo(0, 431); ctx.lineTo(82, 376); ctx.lineTo(171, 423); ctx.lineTo(286, 359);
  ctx.lineTo(382, 425); ctx.lineTo(496, 369); ctx.lineTo(604, 429); ctx.lineTo(694, 382); ctx.lineTo(768, 419);
  ctx.lineTo(768, 512); ctx.lineTo(0, 512); ctx.closePath(); ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export const ImmersiveRoom: React.FC<ImmersiveRoomProps> = ({
  onZoneClick,
  activeZoneId,
  theme,
  editMode,
  onEditModeChange,
  onEscape,
  onFurnitureSelect,
  resetLayoutSignal,
  saveDefaultLayoutSignal,
  snapToGrid,
  furnitureEditRequest,
  onPosterClick,
  onPhoneClick,
  nightMode,
  onLightingToggle,
}) => {
  const mountRef  = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Map<ZoneId, HTMLDivElement>>(new Map());
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editModeRef = useRef(editMode);
  const activeZoneIdRef = useRef(activeZoneId);
  const onFurnitureSelectRef = useRef(onFurnitureSelect);
  const selectedFurnitureIdRef = useRef<FurnitureId | null>(null);
  const furnitureOffsetsRef = useRef<Partial<Record<FurnitureId, FurniturePlacement>>>({});
  const resetLayoutActionRef = useRef<(() => void) | null>(null);
  const saveDefaultLayoutActionRef = useRef<(() => void) | null>(null);
  const furnitureEditActionRef = useRef<((request: FurnitureEditRequest) => void) | null>(null);
  const snapToGridRef = useRef(snapToGrid);
  const previousResetSignalRef = useRef(resetLayoutSignal);
  const previousSaveDefaultLayoutSignalRef = useRef(saveDefaultLayoutSignal);
  const previousFurnitureEditSequenceRef = useRef(furnitureEditRequest.sequence);

  useEffect(() => {
    editModeRef.current = editMode;
    if (!editMode) {
      selectedFurnitureIdRef.current = null;
      onFurnitureSelectRef.current(null);
    }
  }, [editMode]);
  useEffect(() => { activeZoneIdRef.current = activeZoneId; }, [activeZoneId]);
  useEffect(() => { onFurnitureSelectRef.current = onFurnitureSelect; }, [onFurnitureSelect]);
  useEffect(() => {
    if (previousResetSignalRef.current === resetLayoutSignal) return;
    previousResetSignalRef.current = resetLayoutSignal;
    resetLayoutActionRef.current?.();
  }, [resetLayoutSignal]);
  useEffect(() => {
    if (previousSaveDefaultLayoutSignalRef.current === saveDefaultLayoutSignal) return;
    previousSaveDefaultLayoutSignalRef.current = saveDefaultLayoutSignal;
    saveDefaultLayoutActionRef.current?.();
  }, [saveDefaultLayoutSignal]);
  useEffect(() => { snapToGridRef.current = snapToGrid; }, [snapToGrid]);
  useEffect(() => {
    if (previousFurnitureEditSequenceRef.current === furnitureEditRequest.sequence) return;
    previousFurnitureEditSequenceRef.current = furnitureEditRequest.sequence;
    furnitureEditActionRef.current?.(furnitureEditRequest);
  }, [furnitureEditRequest]);

  // References to smoothly command camera from props
  const initialOverview = getResponsiveOverview();
  const targetCamPos = useRef(new THREE.Vector3(...initialOverview.cam));
  const targetLookAt = useRef(new THREE.Vector3(...initialOverview.lookAt));

  const setLabelRef = useCallback((id: ZoneId) => (el: HTMLDivElement | null) => {
    if (el) labelRefs.current.set(id, el); else labelRefs.current.delete(id);
  }, []);

  // Sync external zone jump
  useEffect(() => {
    if (!activeZoneId) return;
    if (activeZoneId === "overview") {
      const container = mountRef.current;
      const overview = getResponsiveOverview(container?.clientWidth, container?.clientHeight);
      targetCamPos.current.set(...overview.cam);
      targetLookAt.current.set(...overview.lookAt);
      soundFX.playZoom();
      return;
    }
    const baseCoords = ZONE_CAMS[activeZoneId] || ZONE_CAMS.overview;
    const coords = transformCameraForZone(activeZoneId, baseCoords, furnitureOffsetsRef.current);
    targetCamPos.current.set(coords[0], coords[1], coords[2]);
    targetLookAt.current.set(coords[3], coords[4], coords[5]);
    soundFX.playZoom();
  }, [activeZoneId]);

  useEffect(() => {
    const container = mountRef.current;
    const overview = getResponsiveOverview(container?.clientWidth, container?.clientHeight);
    targetCamPos.current.set(...overview.cam);
    targetLookAt.current.set(...overview.lookAt);
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    furnitureOffsetsRef.current = {};
    const isBedroomTheme = theme === "anime-bedroom";
    const accentColor = isBedroomTheme ? "#9b75c5" : "#00F2FE";
    let randomSeed = 7319;
    const stableRandom = () => {
      randomSeed = (randomSeed * 48271) % 2147483647;
      return (randomSeed - 1) / 2147483646;
    };

    // ── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const roomBackground = nightMode ? "#050b1d" : isBedroomTheme ? "#dce8f1" : "#0c1020";
    scene.background = new THREE.Color(roomBackground);
    scene.fog = new THREE.FogExp2(roomBackground, nightMode ? 0.02 : isBedroomTheme ? 0.012 : 0.026);

    // ── Camera ──────────────────────────────────────────────────────────────
    const W = container.clientWidth, H = container.clientHeight;
    const initialCam = getResponsiveOverview(W, H);
    const camera = new THREE.PerspectiveCamera(initialCam.fov, W / H, 0.1, 150);
    camera.position.set(...initialCam.cam);
    const roomOverviewLookAt = new THREE.Vector3(...initialCam.lookAt);
    targetCamPos.current.set(...initialCam.cam);
    targetLookAt.current.set(...initialCam.lookAt);

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ── Dynamic Canvas Screens (Lusion Style Real-Time Shaders) ────────────
    // 1. AAOS Cockpit Telemetry Screen Canvas
    const cdcCanvas = document.createElement("canvas");
    cdcCanvas.width = 512; cdcCanvas.height = 288;
    const cdcCtx = cdcCanvas.getContext("2d")!;
    const cdcTexture = new THREE.CanvasTexture(cdcCanvas);

    // 2. WebGL Audio Visualizer Screen Canvas
    const audioCanvas = document.createElement("canvas");
    audioCanvas.width = 512; audioCanvas.height = 288;
    const audioCtx = audioCanvas.getContext("2d")!;
    const audioTexture = new THREE.CanvasTexture(audioCanvas);

    // ── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(nightMode ? "#8293c5" : isBedroomTheme ? "#fff0df" : "#727b9a", nightMode ? 0.72 : isBedroomTheme ? 1.9 : 2.0));

    const deskLight = new THREE.PointLight(nightMode ? "#f2bd9c" : isBedroomTheme ? "#ffd9a8" : "#ffbb66", nightMode ? 1.5 : isBedroomTheme ? 2.5 : 3.2, 10);
    deskLight.position.set(0, 3.5, 0);
    deskLight.castShadow = true;
    scene.add(deskLight);

    const cyanSpot = new THREE.SpotLight(isBedroomTheme ? "#f4cde5" : "#00F2FE", nightMode ? (isBedroomTheme ? 0.65 : 1.8) : isBedroomTheme ? 3.2 : 7, 26, Math.PI / 5, 0.5, 1.0);
    cyanSpot.position.set(-6, 8, 5);
    cyanSpot.target.position.set(0, 1, 0);
    cyanSpot.castShadow = true;
    scene.add(cyanSpot);
    scene.add(cyanSpot.target);

    const purpleBack = new THREE.PointLight(nightMode ? "#748bd2" : isBedroomTheme ? "#b6c8ec" : "#9D4EDD", nightMode ? 1.35 : isBedroomTheme ? 2.5 : 6, 20);
    purpleBack.position.set(5, 7, -4);
    scene.add(purpleBack);

    const pinkAccent = new THREE.PointLight(isBedroomTheme ? "#f3abc8" : "#F72585", nightMode ? 0.55 : isBedroomTheme ? 1.4 : 2.5, 12);
    pinkAccent.position.set(-5, 2.5, 3);
    scene.add(pinkAccent);

    // ── Textures ────────────────────────────────────────────────────────────
    const tl = new THREE.TextureLoader();
    const texLofi    = tl.load("/images/ambient/lofi-study-night.jpg");
    const texRain    = tl.load("/images/ambient/soothing-rain.jpg");
    const texBH      = tl.load("/images/blackhole.jpeg");
    const texAnime   = tl.load("/images/ambient/anime-moon.jpg");
    const nightWindowTexture = nightMode ? makeNightWindowTexture() : null;

    // ── Raycasting Registry ─────────────────────────────────────────────────
    interface ClickableObj { mesh: THREE.Mesh; zone: ZoneId; origEmissive: THREE.Color; origEI: number; posterId?: RoomPosterId }
    const clickable: ClickableObj[] = [];
    let hoveredZone: ZoneId | null = null;

    const registerZone = (mesh: THREE.Mesh, zone: ZoneId, posterId?: RoomPosterId) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat.emissive) return;
      clickable.push({ mesh, zone, origEmissive: mat.emissive.clone(), origEI: mat.emissiveIntensity || 0, posterId });
    };

    const setHover = (zone: ZoneId | null) => {
      if (zone === hoveredZone) return;
      // reset all
      clickable.forEach(({ mesh, origEmissive, origEI }) => {
        const m = mesh.material as THREE.MeshStandardMaterial;
        m.emissive.copy(origEmissive);
        m.emissiveIntensity = origEI;
      });
      hoveredZone = zone;
      if (zone) {
        soundFX.playHover();
        clickable.filter(c => c.zone === zone).forEach(({ mesh }) => {
          const m = mesh.material as THREE.MeshStandardMaterial;
          const hc = new THREE.Color(ROOM_ZONES[zone].color);
          m.emissive.set(hc);
          m.emissiveIntensity = 0.9;
        });
        renderer.domElement.style.cursor = editModeRef.current ? "grab" : "pointer";
      } else {
        renderer.domElement.style.cursor = editModeRef.current ? "grab" : "none";
      }
    };

    const addClickable = (geo: THREE.BufferGeometry, mat: THREE.MeshStandardMaterial, zone: ZoneId, posterId?: RoomPosterId) => {
      const mesh = new THREE.Mesh(geo, mat);
      registerZone(mesh, zone, posterId);
      return mesh;
    };

    // ── 3D Zone Label Overlay Anchor Positions ──────────────────────────────
    const labelPositions: Record<ZoneId, THREE.Vector3> = {
      monitor_left:  new THREE.Vector3(-0.88, 3.1, -0.75),
      monitor_right: new THREE.Vector3( 0.88, 3.1, -0.75),
      pc_case:       new THREE.Vector3( 0,    1.7,  0   ),
      audio_rig:     new THREE.Vector3(-1.6,  2.5, -0.4 ),
      bookshelf:     new THREE.Vector3( 0,    4.5,  0   ),
      poster_wall:   new THREE.Vector3(-4.2,  5.6, -4.0 ),
      headphones:    new THREE.Vector3(-3.52, 2.9, -0.96),
    };

    // ── Room Shell Architecture ─────────────────────────────────────────────
    const bwMat = new THREE.MeshStandardMaterial({ color: nightMode ? (isBedroomTheme ? "#24263b" : "#0a1023") : isBedroomTheme ? "#e8e1e7" : "#101426", roughness: 0.95 });
    const floorMat = new THREE.MeshStandardMaterial({ color: nightMode ? (isBedroomTheme ? "#3a3042" : "#11162a") : isBedroomTheme ? "#b9957a" : "#171a30", roughness: isBedroomTheme ? 0.9 : 0.8, metalness: isBedroomTheme ? 0.02 : 0.2 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    if (!isBedroomTheme) {
      const grid = new THREE.GridHelper(16, 32, "#00F2FE", "#0d0d28");
      grid.scale.z = 10 / 16;
      grid.position.y = 0.012;
      scene.add(grid);
    } else {
      // Quiet plank seams give the room a domestic floor without adding visual clutter.
      const seamMat = new THREE.MeshStandardMaterial({ color: "#8a6754", roughness: 1, transparent: true, opacity: 0.28 });
      for (let z = -4.5; z <= 4.5; z += 0.5) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(15.9, 0.006, 0.012), seamMat);
        seam.position.set(0, 0.008, z);
        scene.add(seam);
      }
      for (let x = -7.5; x <= 7.5; x += 2) {
        for (let row = -4.25; row <= 4.25; row += 1) {
          const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 0.48), seamMat);
          seam.position.set(x + ((Math.round(row * 2) % 2) ? 0.5 : 0), 0.008, row);
          scene.add(seam);
        }
      }
    }

    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10),
      new THREE.MeshStandardMaterial({ color: nightMode ? "#11172b" : isBedroomTheme ? "#f0e9ee" : "#161a2d", roughness: 1 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 7.5;
    scene.add(ceil);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 0.2), bwMat);
    backWall.position.set(0, 3.75, -5);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7.5, 10), bwMat.clone());
    leftWall.position.set(-8, 3.75, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7.5, 10), bwMat.clone());
    rightWall.position.set(8, 3.75, 0);
    scene.add(rightWall);

    // Fourth wall: a glazed facade closes the room while keeping the cutaway view clear.
    const facadeFrameMat = new THREE.MeshStandardMaterial({
      color: isBedroomTheme ? "#f2e8e0" : "#242b47",
      roughness: isBedroomTheme ? 0.48 : 0.32,
      metalness: isBedroomTheme ? 0.08 : 0.62,
      emissive: isBedroomTheme ? "#000000" : "#061c2c",
      emissiveIntensity: isBedroomTheme ? 0 : 0.35,
    });
    const facadeGlassMat = new THREE.MeshStandardMaterial({
      color: isBedroomTheme ? "#b9d8e8" : "#2b7e91",
      roughness: 0.14,
      metalness: 0.18,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const fourthWall = new THREE.Group();
    const fourthWallGlass = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 7.2), facadeGlassMat);
    fourthWallGlass.position.set(0, 3.75, 4.96);
    fourthWall.add(fourthWallGlass);
    const facadeFramePieces: Array<{ size: [number, number, number]; position: [number, number, number] }> = [
      { size: [0.22, 7.5, 0.24], position: [-7.82, 3.75, 4.88] },
      { size: [0.22, 7.5, 0.24], position: [7.82, 3.75, 4.88] },
      { size: [15.9, 0.2, 0.24], position: [0, 7.38, 4.88] },
      { size: [15.9, 0.2, 0.24], position: [0, 0.12, 4.88] },
      ...[-5.6, -3.75, -1.9, 1.9, 3.75, 5.6].map(x => ({
        size: [0.055, 7.05, 0.1] as [number, number, number],
        position: [x, 3.75, 4.88] as [number, number, number],
      })),
      ...[-0.82, 0.82].map(x => ({
        size: [0.045, 4.25, 0.12] as [number, number, number],
        position: [x, 2.25, 4.82] as [number, number, number],
      })),
    ];
    facadeFramePieces.forEach(({ size, position }) => {
      const framePiece = new THREE.Mesh(new THREE.BoxGeometry(...size), facadeFrameMat);
      framePiece.position.set(...position);
      framePiece.castShadow = true;
      fourthWall.add(framePiece);
    });
    [-0.11, 0.11].forEach(x => {
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.32, 12),
        new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#c7a77d" : "#a9d9e2", metalness: 0.82, roughness: 0.22 }),
      );
      handle.position.set(x, 2.0, 4.72);
      handle.castShadow = true;
      fourthWall.add(handle);
    });
    scene.add(fourthWall);

    const trimMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#faf4ee" : "#15152d", roughness: 0.7, metalness: isBedroomTheme ? 0 : 0.35 });
    const backTrim = new THREE.Mesh(new THREE.BoxGeometry(16, 0.22, 0.12), trimMat);
    backTrim.position.set(0, 0.12, -4.84);
    scene.add(backTrim);

    [-7.84, 7.84].forEach(x => {
      const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 10), trimMat.clone());
      sideTrim.position.set(x, 0.12, 0);
      scene.add(sideTrim);
    });

    let bedroomDoor: THREE.Group | null = null;
    let bedsideLamp: THREE.Group | null = null;
    if (isBedroomTheme) {
      const ceilingLight = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 0.11, 32), new THREE.MeshStandardMaterial({ color: nightMode ? "#4c5274" : "#fff3dc", emissive: "#ffe1b6", emissiveIntensity: nightMode ? 0.06 : 0.5, roughness: 0.45 }));
      ceilingLight.position.set(0, 7.36, 0.2);
      scene.add(ceilingLight);
      const ceilingGlow = new THREE.PointLight("#ffe6c6", nightMode ? 0.12 : 0.8, 9);
      ceilingGlow.position.set(0, 6.9, 0.2);
      scene.add(ceilingGlow);

      bedroomDoor = new THREE.Group();
      bedroomDoor.name = "bedroom-door";
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.15, 4.35, 0.16), new THREE.MeshStandardMaterial({ color: "#fbf4ed", roughness: 0.65 }));
      doorFrame.position.set(0, 2.2, 0);
      bedroomDoor.add(doorFrame);
      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.83, 4.02, 0.08), new THREE.MeshStandardMaterial({ color: "#71839b", roughness: 0.74 }));
      doorPanel.position.set(0, 2.05, 0.12);
      bedroomDoor.add(doorPanel);
      const insetPanels = [
        { y: 2.92, h: 1.35 },
        { y: 1.1, h: 1.5 },
      ];
      insetPanels.forEach(panel => {
        const inset = new THREE.Mesh(new THREE.BoxGeometry(1.38, panel.h, 0.035), new THREE.MeshStandardMaterial({ color: "#8d9bb0", roughness: 0.7 }));
        inset.position.set(0, panel.y, 0.18);
        bedroomDoor?.add(inset);
      });
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshStandardMaterial({ color: "#d2b98d", metalness: 0.68, roughness: 0.28 }));
      knob.position.set(0.67, 1.9, 0.27);
      bedroomDoor.add(knob);
      bedroomDoor.position.set(6.45, 0, -4.8);
      scene.add(bedroomDoor);
    }

    // ── Neon Sign ───────────────────────────────────────────────────────────
    const signTex = makeTextTex(isBedroomTheme ? "STAY AWHILE  //  DREAM" : "ZYNX  //  7YNX", accentColor);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      transparent: true,
      emissive: isBedroomTheme ? "#8662b4" : "#00c8e0",
      emissiveIntensity: nightMode ? (isBedroomTheme ? 0.28 : 0.85) : isBedroomTheme ? 0.55 : 1.5,
      emissiveMap: signTex,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(isBedroomTheme ? 5.6 : 5, 0.65), signMat);
    sign.position.set(-1, isBedroomTheme ? 6.15 : 6.6, -4.88);
    scene.add(sign);

    const signGlow = new THREE.PointLight(accentColor, nightMode ? (isBedroomTheme ? 0.42 : 0.8) : isBedroomTheme ? 0.8 : 2, 6);
    signGlow.position.set(-1, isBedroomTheme ? 6.15 : 6.6, -4.2);
    scene.add(signGlow);

    // ── Animated Ceiling LED Strips ─────────────────────────────────────────
    const ledMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#dcc8e8" : "#00F2FE", emissive: isBedroomTheme ? "#dcc8e8" : "#00F2FE", emissiveIntensity: nightMode ? (isBedroomTheme ? 0.22 : 0.75) : isBedroomTheme ? 0.5 : 3 });
    const addLed = (x1: number, z1: number, x2: number, z2: number) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, isBedroomTheme ? 0.08 : 0.04, 0.06), ledMat.clone());
      m.position.set((x1 + x2) / 2, 7.44, (z1 + z2) / 2);
      m.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      scene.add(m);
      return m;
    };
    const ledMeshes: THREE.Mesh[] = [
      addLed(-7.8, -4.8, 7.8, -4.8),
      addLed(-7.8, -4.8, -7.8, 4.8),
      addLed( 7.8, -4.8,  7.8, 4.8),
      addLed(-7.8,  4.8,  7.8, 4.8),
    ];

    // ── City Bokeh Window ───────────────────────────────────────────────────
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.2, 4.8),
      new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#f7f2ec" : "#111130", metalness: isBedroomTheme ? 0.05 : 0.8, roughness: isBedroomTheme ? 0.55 : 0.3 })
    );
    winFrame.position.set(-7.9, 3.5, 1);
    scene.add(winFrame);

    if (nightWindowTexture) {
      const nightSky = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 3.0),
        new THREE.MeshBasicMaterial({ map: nightWindowTexture, side: THREE.DoubleSide, toneMapped: false }),
      );
      nightSky.rotation.y = Math.PI / 2;
      nightSky.position.set(-7.79, 3.5, 1);
      scene.add(nightSky);
    }

    const winGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.0),
      new THREE.MeshStandardMaterial({ color: nightMode ? "#7794c8" : isBedroomTheme ? "#b5d6ea" : "#060620", emissive: nightMode ? "#243d73" : isBedroomTheme ? "#91bad3" : "#000000", emissiveIntensity: nightMode ? 0.18 : isBedroomTheme ? 0.22 : 0, transparent: true, opacity: nightMode ? 0.22 : isBedroomTheme ? 0.72 : 0.45, roughness: 0.05 })
    );
    winGlass.rotation.y = Math.PI / 2;
    winGlass.position.set(-7.75, 3.5, 1);
    scene.add(winGlass);

    // City bokeh lights
    const bokeColors = ["#ffaa44", "#00F2FE", "#ff4466", "#9D4EDD", "#ffee44", "#44ffaa"];
    if (!isBedroomTheme && !nightMode) for (let i = 0; i < 60; i++) {
      const r = 0.04 + stableRandom() * 0.07;
      const bMesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 6, 6),
        new THREE.MeshStandardMaterial({
          color: bokeColors[i % 6],
          emissive: bokeColors[i % 6],
          emissiveIntensity: 1.5 + stableRandom() * 2,
          transparent: true,
          opacity: 0.5 + stableRandom() * 0.5,
        })
      );
      bMesh.position.set(-8.2, 1.8 + stableRandom() * 3, -0.5 + stableRandom() * 3.2);
      scene.add(bMesh);
    }

    const curtainPivots: { pivot: THREE.Group; phase: number }[] = [];
    if (isBedroomTheme) {
      const curtainMat = new THREE.MeshStandardMaterial({ color: "#292b55", roughness: 0.94 });
      [-1, 1].forEach(side => {
        const z = 1 + side * 2.0;
        const pivot = new THREE.Group();
        pivot.position.set(-7.72, 5.2, z);
        const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 0.9), curtainMat);
        curtain.position.y = -1.7;
        pivot.add(curtain);
        scene.add(pivot);
        curtainPivots.push({ pivot, phase: side < 0 ? 0 : Math.PI * 0.72 });
      });
      const sill = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 4.95), new THREE.MeshStandardMaterial({ color: "#f7f2ec", roughness: 0.55 }));
      sill.position.set(-7.78, 1.85, 1);
      scene.add(sill);
      [-0.5, 1, 2.5].forEach(z => {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.08), new THREE.MeshStandardMaterial({ color: "#f7f2ec", roughness: 0.5 }));
        mullion.position.set(-7.78, 3.5, z);
        scene.add(mullion);
      });
    }

    const winLight = new THREE.PointLight(nightMode ? "#87baff" : isBedroomTheme ? "#c9ddf1" : "#4466ff", nightMode ? 1.7 : isBedroomTheme ? 2.3 : 1.5, 8);
    winLight.position.set(-6.5, 3.5, 1);
    scene.add(winLight);

    // ── Floating Luminous Dust Particles (Lusion Style) ─────────────────────
    const pCount = isBedroomTheme ? 110 : 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (stableRandom() - 0.5) * 16;
      pPos[i * 3 + 1] = stableRandom() * 7;
      pPos[i * 3 + 2] = (stableRandom() - 0.5) * 12;
      pVel[i * 3]     = (stableRandom() - 0.5) * 0.002;
      pVel[i * 3 + 1] = 0.001 + stableRandom() * 0.003;
      pVel[i * 3 + 2] = (stableRandom() - 0.5) * 0.002;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: isBedroomTheme ? "#fff4e4" : "#00F2FE", size: isBedroomTheme ? 0.018 : 0.028, transparent: true, opacity: isBedroomTheme ? 0.26 : 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    type PlacementAxis = "floor" | "wall" | "side-wall" | "table";
    const DESK_TOP_Y = 1.49;
    const DESK_BOUNDS = { minX: -4.3, maxX: 4.3, minZ: -2.05, maxZ: 1.0 };
    type FurnitureItem = {
      id: FurnitureId;
      label: string;
      group: THREE.Group;
      axis: PlacementAxis;
      home: FurniturePlacement;
      homeRotation: number;
      bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
      footprint?: { halfX: number; halfZ: number; centerZ: number };
    };
    const furniture = new Map<FurnitureId, FurnitureItem>();
    let savedLayout: Partial<Record<FurnitureId, FurniturePlacement>> = {};
    let defaultLayout: Partial<Record<FurnitureId, FurniturePlacement>> = { ...HARDCODED_DEFAULT_ROOM_LAYOUT };
    let hasRoomDefault = true;
    let shiftLegacyWorkspace = false;
    try {
      const rawLayout = window.localStorage.getItem(ROOM_LAYOUT_KEY);
      if (rawLayout) savedLayout = JSON.parse(rawLayout) as Partial<Record<FurnitureId, FurniturePlacement>>;
      shiftLegacyWorkspace = window.localStorage.getItem(ROOM_LAYOUT_SHIFT_KEY) !== "1";
    } catch {
      savedLayout = {};
      shiftLegacyWorkspace = false;
    }
    try {
      const rawDefaultLayout = window.localStorage.getItem(ROOM_DEFAULT_LAYOUT_KEY);
      if (rawDefaultLayout) {
        defaultLayout = {
          ...HARDCODED_DEFAULT_ROOM_LAYOUT,
          ...(JSON.parse(rawDefaultLayout) as Partial<Record<FurnitureId, FurniturePlacement>>),
        };
        hasRoomDefault = true;
      }
    } catch {
      defaultLayout = { ...HARDCODED_DEFAULT_ROOM_LAYOUT };
      hasRoomDefault = true;
    }

    const registerFurniture = (
      id: FurnitureId,
      label: string,
      group: THREE.Group,
      axis: PlacementAxis,
      home: FurniturePlacement,
      bounds: FurnitureItem["bounds"],
      footprint?: FurnitureItem["footprint"],
    ) => {
      const hardcoded = HARDCODED_DEFAULT_ROOM_LAYOUT[id];
      const saved = savedLayout[id];
      const hasSavedPlacement = saved && Number.isFinite(saved.x) && Number.isFinite(saved.z);
      const start = hasSavedPlacement
        ? {
            x: saved.x,
            z: shiftLegacyWorkspace && (id === "studio" || id === "chair") ? saved.z - 3 : saved.z,
          }
        : (hardcoded ? { x: hardcoded.x, z: hardcoded.z } : home);
      const homeRotation = (hardcoded?.rotation !== undefined && Number.isFinite(hardcoded.rotation)
        ? hardcoded.rotation
        : (axis === "side-wall"
          ? (start.x < 0 ? Math.PI / 2 : -Math.PI / 2)
          : group.rotation.y)) ?? 0;
      const startRotation = (hasSavedPlacement && Number.isFinite(saved.rotation)
        ? saved.rotation
        : id === "shelf" && start.x > 0 ? -Math.PI / 2 : homeRotation) ?? 0;
      group.userData.furnitureId = id;
      group.userData.furnitureLabel = label;
      group.rotation.y = startRotation;
      let placementBounds = bounds;
      if ((axis === "floor" || axis === "table") && footprint) {
        const cos = Math.abs(Math.cos(startRotation));
        const sin = Math.abs(Math.sin(startRotation));
        const halfX = cos * footprint.halfX + sin * footprint.halfZ;
        const halfZ = sin * footprint.halfX + cos * footprint.halfZ;
        const offsetX = Math.sin(startRotation) * footprint.centerZ;
        const offsetZ = Math.cos(startRotation) * footprint.centerZ;
        const area = axis === "table" ? DESK_BOUNDS : { minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9 };
        placementBounds = {
          minX: area.minX + halfX - offsetX,
          maxX: area.maxX - halfX - offsetX,
          minZ: area.minZ + halfZ - offsetZ,
          maxZ: area.maxZ - halfZ - offsetZ,
        };
      }
      group.position.x = axis === "side-wall"
        ? (start.x < 0 ? -7.99 : 7.99)
        : THREE.MathUtils.clamp(start.x, placementBounds.minX, placementBounds.maxX);
      const startMinZ = axis === "side-wall" && group.position.x > 0 ? -3.4 : placementBounds.minZ;
      const startMaxZ = axis === "side-wall" && group.position.x > 0 ? 3.4 : placementBounds.maxZ;
      group.position.z = THREE.MathUtils.clamp(start.z, startMinZ, startMaxZ);
      if (axis === "table") group.position.y = DESK_TOP_Y;
      furnitureOffsetsRef.current[id] = { x: group.position.x, y: group.position.y, z: group.position.z, rotation: group.rotation.y };
      furniture.set(id, { id, label, group, axis, home, homeRotation, bounds, footprint });
      if (!group.parent) scene.add(group);
    };

    if (bedroomDoor) {
      registerFurniture("door", "Bedroom door", bedroomDoor, "floor", { x: 6.45, z: -4.8 }, {
        minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9,
      }, { halfX: 1.1, halfZ: 0.18, centerZ: 0.08 });
    }

    const captureFurniture = (
      id: FurnitureId,
      label: string,
      firstChildIndex: number,
      bounds: FurnitureItem["bounds"],
      footprint: FurnitureItem["footprint"],
      home: FurniturePlacement = { x: 0, z: 0 },
    ) => {
      const group = new THREE.Group();
      const contents = scene.children.slice(firstChildIndex);
      contents.forEach(child => scene.remove(child));
      contents.forEach(child => group.add(child));
      registerFurniture(id, label, group, "floor", home, bounds, footprint);
      return group;
    };

    // ── Desk Setup ──────────────────────────────────────────────────────────
    const studioChildrenStart = scene.children.length;
    const deskMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#987962" : "#0f0f1e", roughness: isBedroomTheme ? 0.62 : 0.3, metalness: isBedroomTheme ? 0.08 : 0.7 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.14, 2.85), deskMat);
    desk.position.set(0, 1.42, -0.5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk LED underglow
    const glowMat = new THREE.MeshStandardMaterial({ color: "#00F2FE", emissive: "#00F2FE", emissiveIntensity: 2 });
    const deskGlow = new THREE.Mesh(new THREE.BoxGeometry(8.25, 0.03, 0.04), glowMat);
    deskGlow.position.set(0, 1.25, 0.91);
    scene.add(deskGlow);

    const legMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#594f68" : "#00c0cc", metalness: isBedroomTheme ? 0.45 : 0.9, roughness: isBedroomTheme ? 0.35 : 0.15 });
    [[-4.02, 0.71, -1.78], [4.02, 0.71, -1.78], [-4.02, 0.71, 0.78], [4.02, 0.71, 0.78]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.42), legMat);
      leg.position.set(x, y, z);
      scene.add(leg);
    });

    // ── Left Curved Monitor: Live AAOS Telemetry Screen ─────────────────────
    const bezelMat = new THREE.MeshStandardMaterial({ color: "#090912", roughness: 0.3, metalness: 0.6, emissive: "#000000", emissiveIntensity: 0 });
    const mon1 = addClickable(new THREE.BoxGeometry(1.72, 1.02, 0.07), bezelMat.clone(), "monitor_left");
    mon1.position.set(-0.88, 2.28, -0.78);
    mon1.rotation.y = 0.18;
    scene.add(mon1);

    const scr1Mat = new THREE.MeshBasicMaterial({ map: cdcTexture });
    const scr1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), scr1Mat);
    scr1.position.set(-0.88, 2.28, -0.74);
    scr1.rotation.y = 0.18;
    scene.add(scr1);

    const scrGlow1 = new THREE.PointLight("#00F2FE", 0.9, 2.8);
    scrGlow1.position.set(-0.88, 2.28, 0);
    scene.add(scrGlow1);

    const standMat = new THREE.MeshStandardMaterial({ color: "#0a0a18", metalness: 0.8, roughness: 0.2 });
    const st1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), standMat);
    st1.position.set(-0.88, 1.78, -0.78);
    scene.add(st1);
    const sb1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 16), standMat);
    sb1.position.set(-0.88, 1.52, -0.78);
    scene.add(sb1);

    // ── Right Curved Monitor: Live WebGL / Audio Spectrum Screen ───────────
    const mon2 = addClickable(new THREE.BoxGeometry(1.72, 1.02, 0.07), bezelMat.clone(), "monitor_right");
    mon2.position.set(0.88, 2.28, -0.78);
    mon2.rotation.y = -0.18;
    scene.add(mon2);

    const scr2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ map: audioTexture }));
    scr2.position.set(0.88, 2.28, -0.74);
    scr2.rotation.y = -0.18;
    scene.add(scr2);

    const scrGlow2 = new THREE.PointLight("#9D4EDD", 0.9, 2.8);
    scrGlow2.position.set(0.88, 2.28, 0);
    scene.add(scrGlow2);

    const st2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), standMat);
    st2.position.set(0.88, 1.78, -0.78);
    scene.add(st2);
    const sb2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 16), standMat);
    sb2.position.set(0.88, 1.52, -0.78);
    scene.add(sb2);

    // ── PC Case (Custom Tower with RGB liquid cooling & fans) ──────────────
    const pcGroup = new THREE.Group();
    pcGroup.name = "movable-pc-tower";
    pcGroup.position.set(3.65, DESK_TOP_Y, -0.62);
    const pcBodyMat = new THREE.MeshStandardMaterial({ color: "#0b0b1a", metalness: 0.85, roughness: 0.18, emissive: "#000000", emissiveIntensity: 0 });
    const pcCase = addClickable(new THREE.BoxGeometry(0.86, 1.5, 0.07), pcBodyMat, "pc_case");
    pcCase.position.set(0, 0.76, 0.535);
    pcCase.castShadow = true;
    pcGroup.add(pcCase);
    const pcBack = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.5, 0.07), pcBodyMat);
    pcBack.position.set(0, 0.76, -0.535);
    pcGroup.add(pcBack);
    const pcFrameMat = new THREE.MeshStandardMaterial({ color: "#141a27", metalness: 0.78, roughness: 0.24 });
    [-1, 1].forEach(side => [-1, 1].forEach(frontBack => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.065, 1.52, 0.065), pcFrameMat);
      rail.position.set(side * 0.42, 0.76, frontBack * 0.52);
      pcGroup.add(rail);
    }));
    [-1, 1].forEach(topBottom => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.055, 1.12), pcFrameMat);
      panel.position.set(0, 0.76 + topBottom * 0.73, 0);
      pcGroup.add(panel);
    });
    const powerButton = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), new THREE.MeshBasicMaterial({ color: "#42e9ff" }));
    powerButton.position.set(0.31, 1.32, 0.573);
    pcGroup.add(powerButton);

    // Glass panel
    const pcGlassMat = new THREE.MeshStandardMaterial({
      color: "#94d8ed",
      emissive: "#143d57",
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.16,
      metalness: 0.22,
      roughness: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    [-1, 1].forEach(side => {
      const pcGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 1.42), pcGlassMat.clone());
      pcGlass.rotation.y = side * Math.PI / 2;
      pcGlass.position.set(side * 0.466, 0.76, 0);
      pcGlass.renderOrder = 2;
      pcGroup.add(pcGlass);
    });

    // A visible internal motherboard and graphics card give the clear side panels depth.
    const motherboard = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.12, 0.67), new THREE.MeshStandardMaterial({ color: "#10192a", metalness: 0.5, roughness: 0.4, emissive: "#081221", emissiveIntensity: 0.7 }));
    motherboard.position.set(-0.22, 0.76, -0.12);
    pcGroup.add(motherboard);
    const graphicsCard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.13, 0.25), new THREE.MeshStandardMaterial({ color: "#202637", metalness: 0.72, roughness: 0.28, emissive: "#17254d", emissiveIntensity: 0.65 }));
    graphicsCard.position.set(-0.03, 0.48, 0.18);
    pcGroup.add(graphicsCard);
    const gpuLight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.018, 0.55), new THREE.MeshBasicMaterial({ color: "#54e5ff" }));
    gpuLight.position.set(0.03, 0.49, 0.18);
    pcGroup.add(gpuLight);

    const pcGlowL = new THREE.PointLight("#00F2FE", 2.2, 2.8);
    pcGlowL.position.set(0, 0.76, 0);
    pcGroup.add(pcGlowL);

    // Three RGB fans are mirrored behind both transparent side panels.
    const fanMeshes: THREE.Group[] = [];
    const fanRingMats: THREE.MeshStandardMaterial[] = [];
    [-1, 1].forEach(side => [0.3, 0.76, 1.22].forEach(y => {
      const rotor = new THREE.Group();
      rotor.position.set(side * 0.39, y, 0.02);
      rotor.rotation.y = side * Math.PI / 2;
      pcGroup.add(rotor);
      fanMeshes.push(rotor);

      const ringMat = new THREE.MeshStandardMaterial({ color: "#22d3ee", emissive: "#22d3ee", emissiveIntensity: 2.5, metalness: 0.2, roughness: 0.28 });
      fanRingMats.push(ringMat);
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 36), ringMat);
      rotor.add(outerRing);
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.006, 6, 32), new THREE.MeshBasicMaterial({ color: "#e9fbff" }));
      innerRing.position.z = 0.008;
      rotor.add(innerRing);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.04, 20), new THREE.MeshStandardMaterial({ color: "#151729", metalness: 0.7, roughness: 0.25, emissive: "#12142b", emissiveIntensity: 0.8 }));
      hub.rotation.x = Math.PI / 2;
      rotor.add(hub);
      for (let bladeIndex = 0; bladeIndex < 5; bladeIndex++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.09, 0.012), new THREE.MeshStandardMaterial({ color: "#263044", metalness: 0.5, roughness: 0.28 }));
        blade.position.set(0.012, 0.085, 0.006);
        blade.rotation.z = (bladeIndex * Math.PI * 2) / 5;
        rotor.add(blade);
      }
    }));
    let nextFanColorTime = 0;
    scene.add(pcGroup);

    // A phone sits beside the keyboard. Both its body and screen travel as one piece.
    const phoneGroup = new THREE.Group();
    phoneGroup.name = "movable-desk-phone";
    phoneGroup.position.set(-1.65, DESK_TOP_Y, 0.32);
    const phoneBodyMat = new THREE.MeshStandardMaterial({ color: "#171521", metalness: 0.58, roughness: 0.28, emissive: "#000000", emissiveIntensity: 0.7 });
    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.045, 0.54),
      phoneBodyMat,
    );
    phoneBody.position.y = 0.0225;
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);
    const phoneScreenMat = new THREE.MeshStandardMaterial({ color: "#19243a", emissive: "#6d78bb", emissiveIntensity: 0.26, roughness: 0.2 });
    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.235, 0.46),
      phoneScreenMat,
    );
    phoneScreen.rotation.x = -Math.PI / 2;
    phoneScreen.position.set(0, 0.046, 0);
    phoneGroup.add(phoneScreen);
    const phoneCamera = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 8),
      new THREE.MeshStandardMaterial({ color: "#86d6e5", metalness: 0.5, roughness: 0.2 }),
    );
    phoneCamera.position.set(0, 0.049, -0.235);
    phoneGroup.add(phoneCamera);
    const phoneHoverLight = new THREE.PointLight("#45e5ff", 0, 0.85);
    phoneHoverLight.position.set(0, 0.16, 0);
    phoneGroup.add(phoneHoverLight);
    scene.add(phoneGroup);

    // ── 7YNX MIDI keyboard: two playable octaves, controls and display ──────
    const synthMat = new THREE.MeshStandardMaterial({ color: "#111522", roughness: 0.32, metalness: 0.58, emissive: "#080b16", emissiveIntensity: 0.45 });
    const synth = addClickable(new THREE.BoxGeometry(2.2, 0.12, 0.84), synthMat, "audio_rig");
    synth.position.set(-1.5, 1.55, -1.17);
    synth.castShadow = true;
    scene.add(synth);

    const wkMat = new THREE.MeshStandardMaterial({ color: "#e9edf4", roughness: 0.46, metalness: 0.08 });
    const bkMat = new THREE.MeshStandardMaterial({ color: "#090c14", roughness: 0.26, metalness: 0.4 });
    for (let i = 0; i < 25; i++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.032, 0.47), wkMat);
      key.position.set(-1.5 + (i - 12) * 0.08, 1.626, -1.17);
      key.castShadow = true;
      scene.add(key);
    }
    for (let i = 0; i < 24; i++) {
      if ([1, 3, 6, 8, 10].includes(i % 12)) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.047, 0.044, 0.25), bkMat);
        key.position.set(-1.5 + (i - 11.5) * 0.08, 1.656, -1.29);
        key.castShadow = true;
        scene.add(key);
      }
    }
    const synthDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.012, 0.13), new THREE.MeshBasicMaterial({ color: "#64dbd0" }));
    synthDisplay.position.set(-1.5, 1.617, -1.48);
    scene.add(synthDisplay);
    const synthKnobMat = new THREE.MeshStandardMaterial({ color: "#aab3c5", metalness: 0.82, roughness: 0.22 });
    [-2.34, -2.13, -1.92, -1.08, -0.87, -0.66].forEach((x, index) => {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.052, 0.052, 16), synthKnobMat);
      knob.position.set(x, 1.652, -1.47);
      scene.add(knob);
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.027), new THREE.MeshBasicMaterial({ color: index < 3 ? "#22d3ee" : "#c084fc" }));
      marker.position.set(x, 1.681, -1.47);
      scene.add(marker);
    });

    // ── Typing keyboard: a separate compact mechanical 75% board ───────────
    const typingBoardMat = new THREE.MeshStandardMaterial({ color: "#151827", roughness: 0.34, metalness: 0.56 });
    const typingBoard = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.11, 0.72), typingBoardMat);
    typingBoard.position.set(-0.05, 1.545, 0.035);
    typingBoard.castShadow = true;
    scene.add(typingBoard);
    const keycapMats = [
      new THREE.MeshStandardMaterial({ color: "#d5d9e4", roughness: 0.48 }),
      new THREE.MeshStandardMaterial({ color: "#aeb7ca", roughness: 0.42 }),
      new THREE.MeshStandardMaterial({ color: "#222b3d", roughness: 0.35, metalness: 0.2 }),
    ];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 15; col++) {
        if (row === 3 && col > 4 && col < 10) continue;
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.043, 0.092), keycapMats[(row * 3 + col) % keycapMats.length]);
        key.position.set(-0.05 + (col - 7) * 0.128, 1.622, -0.205 + row * 0.115);
        key.castShadow = true;
        scene.add(key);
      }
    }
    const spacebar = new THREE.Mesh(new THREE.BoxGeometry(0.69, 0.045, 0.09), keycapMats[0]);
    spacebar.position.set(-0.05, 1.622, 0.14);
    scene.add(spacebar);
    const kbLedMat = new THREE.MeshStandardMaterial({ color: "#9D4EDD", emissive: "#9D4EDD", emissiveIntensity: 2.2 });
    const kbLed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.018, 0.025), kbLedMat);
    kbLed.position.set(-0.05, 1.505, 0.37);
    scene.add(kbLed);

    // A stitched desk mat and sculpted wireless mouse with split buttons and wheel.
    const padMat = new THREE.MeshStandardMaterial({ color: "#111624", roughness: 0.92, metalness: 0.04 });
    const mousePad = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.014, 0.86), padMat);
    mousePad.position.set(1.55, 1.499, 0.06);
    scene.add(mousePad);
    const padStitch = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.006, 0.012), new THREE.MeshBasicMaterial({ color: "#38bdf8" }));
    padStitch.position.set(1.55, 1.509, 0.47);
    scene.add(padStitch);
    const mouseMat = new THREE.MeshStandardMaterial({ color: "#202838", roughness: 0.28, metalness: 0.42 });
    const mouseBody = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), mouseMat);
    mouseBody.scale.set(0.84, 0.43, 1.22);
    mouseBody.position.set(1.55, 1.57, 0.04);
    mouseBody.castShadow = true;
    scene.add(mouseBody);
    const mouseButtons = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.016, 0.13), new THREE.MeshStandardMaterial({ color: "#333e51", roughness: 0.3, metalness: 0.32 }));
    mouseButtons.position.set(1.55, 1.636, -0.09);
    scene.add(mouseButtons);
    const mouseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.06, 12), new THREE.MeshStandardMaterial({ color: "#8eeaff", metalness: 0.6, roughness: 0.25 }));
    mouseWheel.rotation.z = Math.PI / 2;
    mouseWheel.position.set(1.55, 1.652, -0.035);
    scene.add(mouseWheel);
    const mouseRgb = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.23), new THREE.MeshBasicMaterial({ color: "#c084fc" }));
    mouseRgb.position.set(1.55, 1.53, 0.14);
    scene.add(mouseRgb);

    // ── Compact audio interface for the synth and broadcast mic ─────────────
    const interfaceMat = new THREE.MeshStandardMaterial({ color: "#191d2a", roughness: 0.3, metalness: 0.7 });
    const audioInterface = addClickable(new THREE.BoxGeometry(1.08, 0.15, 0.62), interfaceMat, "audio_rig");
    audioInterface.position.set(1.58, 1.565, -1.16);
    audioInterface.castShadow = true;
    scene.add(audioInterface);
    const interfaceFace = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.095, 0.018), new THREE.MeshStandardMaterial({ color: "#252b3a", roughness: 0.32, metalness: 0.6 }));
    interfaceFace.position.set(1.58, 1.565, -0.844);
    scene.add(interfaceFace);
    const interfaceKnobMat = new THREE.MeshStandardMaterial({ color: "#bac6d6", metalness: 0.8, roughness: 0.22 });
    [1.19, 1.42, 1.65, 1.88, 2.11].forEach((x, index) => {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(index < 2 ? 0.054 : 0.037, index < 2 ? 0.057 : 0.04, 0.05, 16), interfaceKnobMat);
      knob.position.set(x, 1.665, -1.31);
      scene.add(knob);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color: index % 2 ? "#41e6c0" : "#ff6993" }));
      led.position.set(x, 1.62, -0.83);
      scene.add(led);
    });
    [1.31, 1.56, 1.81].forEach(x => {
      const input = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.025, 16), new THREE.MeshStandardMaterial({ color: "#090c12", metalness: 0.45, roughness: 0.4 }));
      input.rotation.x = Math.PI / 2;
      input.position.set(x, 1.555, -0.824);
      scene.add(input);
    });

    // ── Broadcast microphone on a small desktop stand ──────────────────────
    const micStandMat = new THREE.MeshStandardMaterial({ color: "#202634", metalness: 0.76, roughness: 0.26 });
    const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.055, 24), micStandMat);
    micBase.position.set(2.84, 1.52, 0.1);
    scene.add(micBase);
    const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.035, 0.39, 16), micStandMat);
    micStem.position.set(2.84, 1.735, 0.1);
    scene.add(micStem);
    const micBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.32, 12), micStandMat);
    micBoom.rotation.z = Math.PI / 2;
    micBoom.position.set(2.84, 1.94, 0.1);
    scene.add(micBoom);
    const micYoke = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 8, 24, Math.PI), micStandMat);
    micYoke.rotation.z = Math.PI / 2;
    micYoke.position.set(2.84, 2.03, 0.1);
    scene.add(micYoke);
    const micMat = new THREE.MeshStandardMaterial({ color: "#11151d", metalness: 0.54, roughness: 0.3, emissive: "#111722", emissiveIntensity: 0.24 });
    const micBody = addClickable(new THREE.CapsuleGeometry(0.078, 0.3, 6, 16), micMat, "audio_rig");
    micBody.rotation.z = Math.PI / 2;
    micBody.position.set(2.84, 2.075, 0.1);
    scene.add(micBody);
    const micGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.115, 20), new THREE.MeshStandardMaterial({ color: "#555d69", metalness: 0.8, roughness: 0.35 }));
    micGrille.rotation.z = Math.PI / 2;
    micGrille.position.set(2.99, 2.075, 0.1);
    scene.add(micGrille);
    for (let i = 0; i < 5; i++) {
      const grilleLine = new THREE.Mesh(new THREE.TorusGeometry(0.077, 0.003, 4, 24), new THREE.MeshBasicMaterial({ color: "#aeb7c4" }));
      grilleLine.rotation.y = Math.PI / 2;
      grilleLine.position.set(2.96 + i * 0.018, 2.075, 0.1);
      scene.add(grilleLine);
    }
    const micCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.65, 2.04, 0.1),
      new THREE.Vector3(2.54, 1.94, 0.16),
      new THREE.Vector3(2.58, 1.57, -0.3),
      new THREE.Vector3(2.25, 1.56, -0.73),
      new THREE.Vector3(2.05, 1.57, -0.82),
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(micCableCurve, 32, 0.012, 6, false), new THREE.MeshStandardMaterial({ color: "#090b11", roughness: 0.48 })));

    // ── Headphone stand with cradle and realistic over-ear studio headphones ──
    const hpMat = new THREE.MeshStandardMaterial({ color: "#161822", roughness: 0.25, metalness: 0.72, emissive: "#080a14", emissiveIntensity: 0.25 });
    const metalMat = new THREE.MeshStandardMaterial({ color: "#78849b", metalness: 0.85, roughness: 0.18 });
    const hpX = -3.52;
    const hpZ = -0.96;
    const hpCradleZ = hpZ + 0.11;

    // Stand base
    const hpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.05, 24), hpMat);
    hpBase.position.set(hpX, 1.515, hpZ);
    scene.add(hpBase);

    // Stand vertical stem
    const hpStand = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.035, 0.70, 16), hpMat);
    hpStand.position.set(hpX, 1.88, hpZ);
    scene.add(hpStand);

    // Stand top connector & forward cradle arm
    const hpTopNode = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), metalMat);
    hpTopNode.position.set(hpX, 2.23, hpZ);
    scene.add(hpTopNode);

    const hpArm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.13, 12), hpMat);
    hpArm.rotation.x = Math.PI / 2;
    hpArm.position.set(hpX, 2.23, hpZ + 0.06);
    scene.add(hpArm);

    // Curved cradle rest pad where the headband rests
    const hpCradle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.022, 0.07), new THREE.MeshStandardMaterial({ color: "#222530", roughness: 0.5 }));
    hpCradle.position.set(hpX, 2.22, hpCradleZ);
    scene.add(hpCradle);

    // Headband arc (resting naturally upright on top of the cradle, apex at Y = 2.22)
    const arcMat = new THREE.MeshStandardMaterial({ color: "#141724", roughness: 0.24, metalness: 0.75, emissive: "#17283a", emissiveIntensity: 0.35 });
    const hpArc = addClickable(new THREE.TorusGeometry(0.18, 0.022, 12, 32, Math.PI), arcMat, "headphones");
    hpArc.position.set(hpX, 2.04, hpCradleZ);
    scene.add(hpArc);

    // Headband top padding cushion (comfort strap)
    const strapMat = new THREE.MeshStandardMaterial({ color: "#0c0f17", roughness: 0.85, metalness: 0.1 });
    const hpStrap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.016, 0.045), strapMat);
    hpStrap.position.set(hpX, 2.205, hpCradleZ);
    scene.add(hpStrap);

    // Left & Right slider forks and studio earcups (hanging downwards, facing inward)
    const earcupOuterMat = new THREE.MeshStandardMaterial({ color: "#10131d", roughness: 0.28, metalness: 0.7, emissive: "#131828", emissiveIntensity: 0.3 });
    const earcupCushionMat = new THREE.MeshStandardMaterial({ color: "#1e2330", roughness: 0.9, metalness: 0.05 });
    const grilleMat = new THREE.MeshStandardMaterial({ color: "#3a4455", roughness: 0.3, metalness: 0.85 });

    [-1, 1].forEach((side) => {
      const armX = hpX + side * 0.18;
      const cupX = hpX + side * 0.20;
      const cupY = 1.86;

      // Vertical slider arm connecting headband to cup
      const slider = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.20, 10), metalMat);
      slider.position.set(armX, 1.96, hpCradleZ);
      scene.add(slider);

      // Cup pivot fork (gimbal)
      const fork = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 8, 20, Math.PI), metalMat);
      fork.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      fork.position.set(cupX, cupY, hpCradleZ);
      scene.add(fork);

      // Over-ear cup outer casing (cylinder rotated along Z axis so flat ends face inward/outward along X)
      const cup = addClickable(new THREE.CylinderGeometry(0.10, 0.10, 0.065, 24), earcupOuterMat.clone(), "headphones");
      cup.rotation.z = Math.PI / 2;
      cup.position.set(cupX, cupY, hpCradleZ);
      scene.add(cup);

      // Outer decorative metal grille ring
      const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.005, 20), grilleMat);
      grille.rotation.z = Math.PI / 2;
      grille.position.set(cupX + side * 0.034, cupY, hpCradleZ);
      scene.add(grille);

      // Soft ear cushion facing INWARD towards the listener's ear (facing opposite cup along X)
      const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 10, 24), earcupCushionMat);
      cushion.rotation.y = Math.PI / 2;
      cushion.position.set(cupX - side * 0.024, cupY, hpCradleZ);
      scene.add(cushion);
    });

    // Flexible headphone audio cable dropping down towards desk
    const hpCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hpX - 0.20, 1.78, hpCradleZ),
      new THREE.Vector3(hpX - 0.24, 1.62, hpCradleZ + 0.06),
      new THREE.Vector3(hpX - 0.18, 1.51, hpCradleZ + 0.12),
      new THREE.Vector3(hpX - 0.08, 1.50, hpCradleZ + 0.04),
    ]);
    const hpCable = new THREE.Mesh(
      new THREE.TubeGeometry(hpCableCurve, 20, 0.009, 6, false),
      new THREE.MeshStandardMaterial({ color: "#0c0e14", roughness: 0.6 })
    );
    scene.add(hpCable);

    // A small warm task lamp is lit only in night mode and moves with the desk.
    const deskLamp = new THREE.Group();
    deskLamp.position.set(-3.72, 0, 0.45);
    const deskLampMetal = new THREE.MeshStandardMaterial({ color: "#5c667c", metalness: 0.76, roughness: 0.24 });
    const deskLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.055, 20), deskLampMetal);
    deskLampBase.position.y = 1.52;
    deskLamp.add(deskLampBase);
    const deskLampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.57, 12), deskLampMetal);
    deskLampStem.position.set(0, 1.81, 0);
    deskLampStem.rotation.z = -0.12;
    deskLamp.add(deskLampStem);
    const deskLampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 12), deskLampMetal);
    deskLampArm.rotation.z = Math.PI / 2 - 0.18;
    deskLampArm.position.set(0.11, 2.08, 0);
    deskLamp.add(deskLampArm);
    const deskLampShadeMat = new THREE.MeshStandardMaterial({ color: nightMode ? "#ffd9aa" : "#aab3c4", emissive: "#ffbd79", emissiveIntensity: nightMode ? 1.35 : 0.04, side: THREE.DoubleSide, roughness: 0.42, metalness: 0.18 });
    const deskLampShade = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.25, 20, 1, true), deskLampShadeMat);
    deskLampShade.position.set(0.26, 2.08, 0);
    deskLampShade.rotation.z = -0.28;
    deskLamp.add(deskLampShade);
    const deskLampLight = new THREE.PointLight("#ffd4a3", nightMode ? 2.4 : 0.06, 5);
    deskLampLight.position.set(0.26, 1.96, 0);
    deskLamp.add(deskLampLight);
    scene.add(deskLamp);

    // Matched nearfield monitor speakers and identical desk stands.
    const spkMat = new THREE.MeshStandardMaterial({ color: "#141424", roughness: 0.5, metalness: 0.3, emissive: "#000000", emissiveIntensity: 0 });
    const spkStandMat = new THREE.MeshStandardMaterial({ color: "#10111b", roughness: 0.34, metalness: 0.72 });
    const addSpk = (x: number, ry: number, zone: ZoneId) => {
      const stand = new THREE.Group();
      stand.position.set(x, 0, -1.58);
      stand.rotation.y = ry;
      const standFoot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.055, 0.28), spkStandMat);
      standFoot.position.y = 1.53;
      standFoot.castShadow = true;
      stand.add(standFoot);
      const standColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.29, 16), spkStandMat);
      standColumn.position.y = 1.70;
      stand.add(standColumn);
      const standTop = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.045, 0.23), spkStandMat);
      standTop.position.y = 1.865;
      stand.add(standTop);
      scene.add(stand);

      const cab = addClickable(new THREE.BoxGeometry(0.38, 0.62, 0.36), spkMat.clone(), zone);
      cab.position.set(x, 2.18, -1.58);
      cab.rotation.y = ry;
      scene.add(cab);

      const woofer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: "#222" })
      );
      woofer.rotation.x = Math.PI / 2;
      woofer.position.set(x + Math.sin(ry) * 0.2, 2.12, -1.58 + Math.cos(ry) * 0.19);
      scene.add(woofer);

      const tweet = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({ color: "#444" })
      );
      tweet.position.set(x + Math.sin(ry) * 0.2, 2.28, -1.58 + Math.cos(ry) * 0.19);
      scene.add(tweet);
    };
    addSpk(-2.86, 0, "audio_rig");
    addSpk(2.86, 0, "monitor_right");

    // ── Coffee Mug & Desk Plant ─────────────────────────────────────────────
    const mugMat = new THREE.MeshStandardMaterial({ color: "#1a1a30", roughness: 0.5 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.15, 16), mugMat);
    mug.position.set(-3.25, 1.575, 0.5);
    scene.add(mug);

    const mugGlow = new THREE.PointLight("#ff8844", 0.6, 0.8);
    mugGlow.position.set(-3.25, 1.75, 0.5);
    scene.add(mugGlow);

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.1, 10), new THREE.MeshStandardMaterial({ color: "#3a1800", roughness: 0.9 }));
    pot.position.set(3.2, 1.55, 0.54);
    scene.add(pot);

    const plantMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: "#1a5c1a", roughness: 0.9 }));
    plantMesh.scale.set(1, 0.7, 1);
    plantMesh.position.set(3.2, 1.67, 0.54);
    scene.add(plantMesh);

    captureFurniture("studio", "Studio desk rig", studioChildrenStart, {
      minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9,
    }, { halfX: 4.35, halfZ: 1.55, centerZ: -0.5 }, { x: 0, z: -2.85 });
    registerFurniture("cpu", "PC tower", pcGroup, "table", { x: 3.65, z: -0.62 }, DESK_BOUNDS, {
      halfX: 0.49, halfZ: 0.59, centerZ: 0,
    });
    registerFurniture("phone", "Desk phone", phoneGroup, "table", { x: -1.65, z: 0.32 }, DESK_BOUNDS, {
      halfX: 0.16, halfZ: 0.29, centerZ: 0,
    });

    // ── Bookshelf & Achievements Shrine ─────────────────────────────────────
    const shelfChildrenStart = scene.children.length;
    const shelfMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#92745f" : "#0e0e1c", roughness: isBedroomTheme ? 0.72 : 0.6, metalness: isBedroomTheme ? 0.05 : 0.4, emissive: "#000000", emissiveIntensity: 0 });
    const shelfBack = addClickable(new THREE.BoxGeometry(3.0, 4.2, 0.18), shelfMat, "bookshelf");
    shelfBack.position.set(3.9, 2.1, -3.92);
    scene.add(shelfBack);

    [-1.44, 1.44].forEach(side => {
      const support = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.55), shelfMat.clone());
      support.position.set(3.9 + side, 2.1, -3.72);
      support.castShadow = true;
      scene.add(support);
    });

    [0.95, 1.85, 2.75, 3.65].forEach(y => {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.55), shelfMat.clone());
      plank.position.set(3.9, y, -3.72);
      scene.add(plank);
    });

    // Books
    const bookCols = ["#3a0070", "#00608c", "#6d1c00", "#005c2a", "#5c005c", "#1c3c00", "#7c4000", "#003c5c", "#5c3a00"];
    let bx = 2.55;
    bookCols.forEach((col, i) => {
      const w = 0.1 + stableRandom() * 0.09;
      const h = 0.35 + stableRandom() * 0.16;
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.44), new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }));
      const row = i < 5 ? 0 : 1;
      bMesh.position.set(bx + w / 2, (row === 0 ? 0.99 : 1.89) + h / 2, -3.72);
      scene.add(bMesh);
      bx += w + 0.015;
      if (i === 4) bx = 2.55;
    });

    // Arduino microcontroller board on shelf
    const aru = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.2), new THREE.MeshStandardMaterial({ color: "#005f77", roughness: 0.6 }));
    aru.position.set(4.0, 1.91, -3.72);
    scene.add(aru);

    // 3D Trophy / Award statuette (Bug bounty & academic honors)
    const figMat = new THREE.MeshStandardMaterial({ color: "#c8a820", roughness: 0.3, metalness: 0.8, emissive: "#c8a820", emissiveIntensity: 0.4 });
    const figBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.15, 4, 8), figMat);
    figBody.position.set(4.7, 2.0, -3.74);
    scene.add(figBody);

    const figHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), figMat);
    figHead.position.set(4.7, 2.24, -3.74);
    scene.add(figHead);

    const shelfLight = new THREE.PointLight("#10B981", 1.5, 3.5);
    shelfLight.position.set(3.9, 4.2, -3.4);
    scene.add(shelfLight);
    const shelfGroup = new THREE.Group();
    const shelfContents = scene.children.slice(shelfChildrenStart);
    shelfContents.forEach(child => scene.remove(child));
    shelfContents.forEach(child => {
      child.position.x -= 3.9;
      child.position.z += 3.92;
      if (child !== shelfBack) child.position.z += 0.14;
      shelfGroup.add(child);
    });
    shelfGroup.rotation.y = Math.PI / 2;
    registerFurniture("shelf", "Bookshelf", shelfGroup, "floor", { x: -7.95, z: -3.4 }, {
      minX: -7.95, maxX: 7.95, minZ: -4.9, maxZ: 4.9,
    }, { halfX: 1.5, halfZ: 0.3, centerZ: 0.35 });

    // ── Digital Art Wall (Back Left) ────────────────────────────────────────
    const galleryChildrenStart = scene.children.length;
    const frameMat = new THREE.MeshStandardMaterial({ color: isBedroomTheme ? "#fbf7f0" : "#111130", roughness: isBedroomTheme ? 0.65 : 0.4, metalness: isBedroomTheme ? 0.02 : 0.7 });
    const addPoster = (tex: THREE.Texture, px: number, py: number, pw: number, ph: number, posterId: RoomPosterId, glowColor?: string) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.12, ph + 0.12, 0.07), frameMat.clone());
      f.position.set(px, py, -4.88);
      scene.add(f);

      const pm = addClickable(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: tex, emissive: "#000000", emissiveIntensity: 0 }), "poster_wall", posterId);
      pm.position.set(px, py, -4.84);
      scene.add(pm);

      if (glowColor) {
        const g = new THREE.PointLight(glowColor, 1.2, 4);
        g.position.set(px, py, -3.8);
        scene.add(g);
      }
    };
    addPoster(texLofi,  -4.5, 4.7, 3.2, 1.9, "lofi-study", "#9D4EDD");
    addPoster(texRain,  -0.6, 4.7, 2.4, 1.7, "rain-window");
    addPoster(texBH,     2.6, 4.7, 2.0, 2.0, "black-hole", "#00F2FE");
    addPoster(texAnime,  4.8, 4.5, 1.8, 2.2, "anime-moon", "#FFB347");
    const galleryGroup = new THREE.Group();
    const galleryContents = scene.children.slice(galleryChildrenStart);
    galleryContents.forEach(child => scene.remove(child));
    galleryContents.forEach(child => galleryGroup.add(child));
    registerFurniture("gallery", "Anime art wall", galleryGroup, "wall", { x: 0, z: 0 }, {
      minX: -1.5, maxX: 1.5, minZ: 0, maxZ: 0,
    });

    // ── Ergonomic Gaming / Office Chair (Facing Desk with Engraved 7X) ───────
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 1.05);
    // Faces normally towards the desk (along negative Z)
    chairGroup.rotation.y = 0;
    scene.add(chairGroup);

    // Materials
    const chairLeatherMat = new THREE.MeshStandardMaterial({
      color: isBedroomTheme ? "#d5c4df" : "#0c0e17",
      roughness: 0.45,
      metalness: isBedroomTheme ? 0.04 : 0.15,
    });
    const chairAccentMat = new THREE.MeshStandardMaterial({
      color: "#00F2FE",
      emissive: "#00F2FE",
      emissiveIntensity: 0.25,
      roughness: 0.3,
    });
    const chairPurpleAccentMat = new THREE.MeshStandardMaterial({
      color: "#9D4EDD",
      emissive: "#9D4EDD",
      emissiveIntensity: 0.25,
      roughness: 0.3,
    });
    const chairShellMat = new THREE.MeshStandardMaterial({
      color: isBedroomTheme ? "#b8a8c5" : "#08090f",
      roughness: 0.35,
      metalness: isBedroomTheme ? 0.08 : 0.65,
    });
    const chairMetalMat = new THREE.MeshStandardMaterial({
      color: "#1e202b",
      roughness: 0.2,
      metalness: 0.85,
    });
    const chairCasterMat = new THREE.MeshStandardMaterial({
      color: "#0d0e12",
      roughness: 0.75,
      metalness: 0.2,
    });

    // 1. Hydraulic Gas-Lift Piston & Tilt Box
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 16), chairMetalMat);
    piston.position.set(0, 0.42, 0);
    chairGroup.add(piston);

    const pistonSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.22, 16), chairShellMat);
    pistonSleeve.position.set(0, 0.24, 0);
    chairGroup.add(pistonSleeve);

    const tiltBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.10, 0.34), chairMetalMat);
    tiltBox.position.set(0, 0.71, 0);
    chairGroup.add(tiltBox);

    // Recline Lever & Tension Knob
    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24), chairMetalMat);
    lever.rotation.z = Math.PI / 2;
    lever.position.set(0.24, 0.71, -0.05);
    chairGroup.add(lever);
    const leverTip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.06), chairAccentMat);
    leverTip.position.set(0.36, 0.71, -0.05);
    chairGroup.add(leverTip);

    // 2. 5-Star Spider Base & Dual-Wheel Casters
    const starHub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.08, 16), chairMetalMat);
    starHub.position.set(0, 0.13, 0);
    chairGroup.add(starHub);

    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const legLen = 0.52;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, legLen), chairMetalMat);
      leg.rotation.y = -ang + Math.PI / 2;
      leg.position.set(Math.cos(ang) * (legLen / 2), 0.10, Math.sin(ang) * (legLen / 2));
      chairGroup.add(leg);

      // Caster assembly
      const casterX = Math.cos(ang) * 0.48;
      const casterZ = Math.sin(ang) * 0.48;

      const casterFork = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05), chairMetalMat);
      casterFork.position.set(casterX, 0.07, casterZ);
      chairGroup.add(casterFork);

      // Dual wheels
      [-0.025, 0.025].forEach(wOffset => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 14), chairCasterMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(casterX + Math.sin(ang) * wOffset, 0.04, casterZ - Math.cos(ang) * wOffset);
        chairGroup.add(wheel);
      });
    }

    // 3. Ergonomic Contoured Bucket Seat Cushion (Facing desk along -Z)
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.82), chairLeatherMat);
    seatBase.position.set(0, 0.78, -0.04);
    chairGroup.add(seatBase);

    // Lateral Thigh Bolsters (Bucket seat wings)
    [-0.39, 0.39].forEach((xSide, idx) => {
      const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.80), chairLeatherMat);
      bolster.rotation.z = (idx === 0 ? 1 : -1) * 0.22;
      bolster.position.set(xSide, 0.84, -0.04);
      chairGroup.add(bolster);

      // Cyber racing accent strip
      const piping = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.78), idx === 0 ? chairAccentMat : chairPurpleAccentMat);
      piping.position.set(xSide + (idx === 0 ? 0.04 : -0.04), 0.90, -0.04);
      chairGroup.add(piping);
    });

    // Front ergonomic waterfall edge
    const frontEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.82, 16, 1, false, 0, Math.PI), chairLeatherMat);
    frontEdge.rotation.z = Math.PI / 2;
    frontEdge.position.set(0, 0.76, -0.45);
    chairGroup.add(frontEdge);

    // 4. Ergonomic High-Back Racing Backrest
    // Positioned at rear of seat (z = +0.32), front faces -Z (desk), back faces +Z (camera)
    const backCushion = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.28, 0.12), chairLeatherMat);
    backCushion.position.set(0, 1.48, 0.32);
    chairGroup.add(backCushion);

    // Backrest Shell (Carbon fiber composite outer spine facing camera +Z)
    const backShell = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.34, 0.05), chairShellMat);
    backShell.position.set(0, 1.48, 0.39);
    chairGroup.add(backShell);

    // Lateral Torso & Shoulder Wing Bolsters
    [-0.38, 0.38].forEach((xSide, idx) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.18), chairLeatherMat);
      wing.rotation.y = (idx === 0 ? -1 : 1) * 0.32;
      wing.position.set(xSide, 1.42, 0.28);
      chairGroup.add(wing);

      // Cyber racing wing strip
      const wingTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.80, 0.02), idx === 0 ? chairAccentMat : chairPurpleAccentMat);
      wingTrim.position.set(xSide + (idx === 0 ? 0.05 : -0.05), 1.42, 0.20);
      chairGroup.add(wingTrim);
    });

    // Integrated Racing Headrest & Neck Pillow
    const headrestPillow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.14), chairLeatherMat);
    headrestPillow.position.set(0, 1.96, 0.29);
    chairGroup.add(headrestPillow);

    // Lumbar Support Cushion
    const lumbarPillow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.20, 0.10), chairLeatherMat);
    lumbarPillow.position.set(0, 1.05, 0.28);
    chairGroup.add(lumbarPillow);

    // Dual Racing Harness Pass-Through Vents (with metallic grommet surrounds)
    [-0.16, 0.16].forEach(vx => {
      const ventGrommet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.15), chairMetalMat);
      ventGrommet.position.set(vx, 1.80, 0.33);
      chairGroup.add(ventGrommet);

      const ventHole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.16), new THREE.MeshBasicMaterial({ color: "#000" }));
      ventHole.position.set(vx, 1.80, 0.33);
      chairGroup.add(ventHole);
    });

    // 5. Engraved "7X" Emblem Plate (On the Back of the Chair facing Camera +Z)
    const tex7X = makeChair7XEmblemTex();
    const emblemPlateMat = new THREE.MeshStandardMaterial({
      map: tex7X,
      roughness: 0.25,
      metalness: 0.65,
    });
    // Emblem plate mounted cleanly on the back spine
    const emblemPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.64), emblemPlateMat);
    // Facing +Z directly towards the viewer
    emblemPlate.position.set(0, 1.50, 0.42);
    chairGroup.add(emblemPlate);

    // Subtle Cyan LED underglow beneath the seat
    const chairUnderglow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16),
      new THREE.MeshBasicMaterial({ color: "#00F2FE" })
    );
    chairUnderglow.position.set(0, 0.69, 0);
    chairGroup.add(chairUnderglow);

    // 6. 4D Adjustable Armrests
    [-0.46, 0.46].forEach((ax, idx) => {
      // Metal vertical riser stalk
      const armStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36), chairMetalMat);
      armStalk.position.set(ax, 0.90, -0.04);
      chairGroup.add(armStalk);

      // Horizontal bracket from under seat
      const armBracket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.08), chairMetalMat);
      armBracket.position.set(ax + (idx === 0 ? 0.05 : -0.05), 0.72, -0.04);
      chairGroup.add(armBracket);

      // Padded Ergonomic Armrest Pad
      const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.46), chairLeatherMat);
      armPad.position.set(ax, 1.08, -0.06);
      chairGroup.add(armPad);

      // Chrome arm adjustment button
      const armBtn = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.06), chairMetalMat);
      armBtn.position.set(ax + (idx === 0 ? -0.06 : 0.06), 1.06, -0.06);
      chairGroup.add(armBtn);
    });

    chairGroup.position.z = -2;
    registerFurniture("chair", "Studio chair", chairGroup, "floor", { x: 0, z: -2 }, {
      minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9,
    }, { halfX: 0.75, halfZ: 0.72, centerZ: 0 });

    if (isBedroomTheme) {
      const bedGroup = new THREE.Group();
      bedGroup.name = "anime-bedroom-bed";
      const rug = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.035, 5.6), new THREE.MeshStandardMaterial({ color: "#c6b4cf", roughness: 0.95 }));
      rug.position.set(0, 0.025, 0.08);
      bedGroup.add(rug);

      const frameMat = new THREE.MeshStandardMaterial({ color: "#9a755f", roughness: 0.68 });
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.38, 4.55), frameMat);
      bedFrame.position.set(0, 0.31, 0);
      bedGroup.add(bedFrame);
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.32, 0.32, 4.3), new THREE.MeshStandardMaterial({ color: "#f6f1ed", roughness: 0.98 }));
      mattress.position.set(0, 0.66, 0);
      bedGroup.add(mattress);

      const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.45, 0.2), new THREE.MeshStandardMaterial({ color: "#b88fa6", roughness: 0.85 }));
      headboard.position.set(0, 1.12, -2.22);
      bedGroup.add(headboard);
      const duvet = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.18, 3.15), new THREE.MeshStandardMaterial({ color: "#b8c9e6", roughness: 0.95 }));
      duvet.position.set(0, 0.91, 0.45);
      bedGroup.add(duvet);
      const duvetFold = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.1, 0.42), new THREE.MeshStandardMaterial({ color: "#e8bad0", roughness: 0.96 }));
      duvetFold.position.set(0, 1.02, 1.55);
      bedGroup.add(duvetFold);

      [-0.78, 0.78].forEach(x => {
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 0.68), new THREE.MeshStandardMaterial({ color: "#fffaf6", roughness: 1 }));
        pillow.position.set(x, 0.96, -1.48);
        bedGroup.add(pillow);
        const pillowTrim = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.018, 0.025), new THREE.MeshStandardMaterial({ color: "#d6a9c6", roughness: 0.85 }));
        pillowTrim.position.set(x, 1.08, -1.48);
        bedGroup.add(pillowTrim);
      });

      // The nightstand stays with the bed; its floor lamp is a separate movable group.
      const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.86, 0.82), new THREE.MeshStandardMaterial({ color: "#a8846d", roughness: 0.72 }));
      nightstand.position.set(-2.26, 0.47, -1.37);
      bedGroup.add(nightstand);
      const drawerLine = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.025, 0.018), new THREE.MeshStandardMaterial({ color: "#e9d1bd", roughness: 0.6 }));
      drawerLine.position.set(-2.26, 0.56, -0.95);
      bedGroup.add(drawerLine);
      bedsideLamp = new THREE.Group();
      bedsideLamp.name = "floor-lamp";
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 20), new THREE.MeshStandardMaterial({ color: "#d8b6cc", roughness: 0.42 }));
      lampBase.position.set(0, 0.04, 0);
      bedsideLamp.add(lampBase);
      const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.2, 12), new THREE.MeshStandardMaterial({ color: "#c69db9", metalness: 0.24, roughness: 0.45 }));
      lampStem.position.set(0, 0.68, 0);
      bedsideLamp.add(lampStem);
      const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.34, 20, 1, true), new THREE.MeshStandardMaterial({ color: nightMode ? "#f8d8b9" : "#fff0d8", emissive: "#ffcf91", emissiveIntensity: nightMode ? 1.2 : 0.12, side: THREE.DoubleSide, roughness: 0.8 }));
      lampShade.position.set(0, 1.48, 0);
      bedsideLamp.add(lampShade);
      const bedsideLight = new THREE.PointLight("#ffd3a0", nightMode ? 2.3 : 0.08, 5);
      bedsideLight.position.set(0, 1.43, 0);
      bedsideLamp.add(bedsideLight);

      const plushBody = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshStandardMaterial({ color: "#fff4e7", roughness: 1 }));
      plushBody.scale.set(1, 1.2, 0.8);
      plushBody.position.set(1.4, 1.08, -0.6);
      bedGroup.add(plushBody);
      const plushHead = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), new THREE.MeshStandardMaterial({ color: "#fff4e7", roughness: 1 }));
      plushHead.position.set(1.4, 1.35, -0.63);
      bedGroup.add(plushHead);
      [-0.09, 0.09].forEach(dx => {
        const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.17, 4, 8), new THREE.MeshStandardMaterial({ color: "#fff4e7", roughness: 1 }));
        ear.rotation.z = dx < 0 ? 0.16 : -0.16;
        ear.position.set(1.4 + dx, 1.58, -0.63);
        bedGroup.add(ear);
      });

      bedGroup.position.set(5.45, 0, 1.97);
      scene.add(bedGroup);
      registerFurniture("bed", "Bed and bedside set", bedGroup, "floor", { x: 5.45, z: 1.97 }, {
        minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9,
      }, { halfX: 2.45, halfZ: 2.85, centerZ: 0.08 });

      bedsideLamp.position.set(3.5, 0, 0);
      scene.add(bedsideLamp);
      registerFurniture("lamp", "Bedside floor lamp", bedsideLamp, "floor", { x: 3.5, z: 0 }, {
        minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9,
      }, { halfX: 0.25, halfZ: 0.25, centerZ: 0 });
    }
    if (shiftLegacyWorkspace) {
      furniture.forEach(item => {
        if (item.id === "studio" || item.id === "chair") {
          savedLayout[item.id] = { x: item.group.position.x, z: item.group.position.z, rotation: item.group.rotation.y };
        }
      });
    }
    try {
      if (shiftLegacyWorkspace) window.localStorage.setItem(ROOM_LAYOUT_KEY, JSON.stringify(savedLayout));
      window.localStorage.setItem(ROOM_LAYOUT_SHIFT_KEY, "1");
    } catch {
      // Layout migration is optional when browser storage is disabled.
    }
    let shouldCaptureCurrentDefault = !hasRoomDefault;
    try {
      shouldCaptureCurrentDefault = shouldCaptureCurrentDefault
        || window.localStorage.getItem(ROOM_DEFAULT_CAPTURE_KEY) !== "3";
    } catch {
      shouldCaptureCurrentDefault = true;
    }
    if (shouldCaptureCurrentDefault) {
      // Promote the user's most recently saved room arrangement to the new reset
      // point once, including furniture from the other theme and new desk pieces.
      defaultLayout = { ...HARDCODED_DEFAULT_ROOM_LAYOUT, ...defaultLayout, ...savedLayout };
      furniture.forEach(item => {
        defaultLayout[item.id] = {
          x: item.group.position.x,
          y: item.group.position.y,
          z: item.group.position.z,
          rotation: item.group.rotation.y,
        };
      });
      hasRoomDefault = true;
      try {
        window.localStorage.setItem(ROOM_DEFAULT_LAYOUT_KEY, JSON.stringify(defaultLayout));
        window.localStorage.setItem(ROOM_DEFAULT_CAPTURE_KEY, "3");
      } catch {
        // The refreshed default still works for this session if storage is disabled.
      }
    }

    // ── Raycasting & Mouse Dynamics (Lusion / Emotion Agency Style) ─────────
    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2(2, 2);
    let hoveredZoneId: ZoneId | null = null;
    let hoveredPhone = false;
    let hoveredLamp = false;
    const setPhoneGlow = (enabled: boolean) => {
      phoneBodyMat.emissive.set(enabled ? "#092f3a" : "#000000");
      phoneBodyMat.emissiveIntensity = enabled ? 1.25 : 0.7;
      phoneScreenMat.emissive.set(enabled ? "#22d3ee" : "#6d78bb");
      phoneScreenMat.emissiveIntensity = enabled ? 1.15 : 0.26;
      phoneHoverLight.intensity = enabled ? 1.5 : 0;
    };

    const getClickableMeshes = () => clickable.map(c => c.mesh);
    const getFurnitureGroups = () => [...furniture.values()].map(item => item.group);
    let selectedItem: FurnitureItem | null = null;
    let movingFurniture = false;
    let dragPlane = new THREE.Plane();
    let dragOffset = new THREE.Vector2();
    const dragPoint = new THREE.Vector3();

    const snap = (value: number, step: number) => Math.round(value / step) * step;
    const getPlacementBounds = (item: FurnitureItem) => {
      if ((item.axis !== "floor" && item.axis !== "table") || !item.footprint) return item.bounds;
      const cos = Math.abs(Math.cos(item.group.rotation.y));
      const sin = Math.abs(Math.sin(item.group.rotation.y));
      const halfX = cos * item.footprint.halfX + sin * item.footprint.halfZ;
      const halfZ = sin * item.footprint.halfX + cos * item.footprint.halfZ;
      const offsetX = Math.sin(item.group.rotation.y) * item.footprint.centerZ;
      const offsetZ = Math.cos(item.group.rotation.y) * item.footprint.centerZ;
      const area = item.axis === "table" ? DESK_BOUNDS : { minX: -7.9, maxX: 7.9, minZ: -4.9, maxZ: 4.9 };
      return {
        minX: area.minX + halfX - offsetX,
        maxX: area.maxX - halfX - offsetX,
        minZ: area.minZ + halfZ - offsetZ,
        maxZ: area.maxZ - halfZ - offsetZ,
      };
    };
    const saveFurnitureLayout = () => {
      try {
        const merged: Partial<Record<FurnitureId, FurniturePlacement>> = { ...savedLayout };
        furniture.forEach(item => {
          merged[item.id] = {
            x: item.group.position.x,
            y: item.axis === "table" ? item.group.position.y : undefined,
            z: item.group.position.z,
            rotation: item.group.rotation.y,
          };
        });
        window.localStorage.setItem(ROOM_LAYOUT_KEY, JSON.stringify(merged));
        savedLayout = merged;
      } catch {
        // The room still works if browser storage is disabled.
      }
    };

    const canPlaceFurniture = (item: FurnitureItem, x: number, z: number, step = snapToGridRef.current ? 0.25 : 0) => {
      const bounds = getPlacementBounds(item);
      const snapToStep = (value: number) => step > 0 ? snap(value, step) : value;
      const nextX = item.axis === "side-wall"
        ? (x < 0 ? -7.99 : 7.99)
        : THREE.MathUtils.clamp(snapToStep(x), bounds.minX, bounds.maxX);
      const sideMinZ = item.axis === "side-wall" && nextX > 0 ? -3.4 : bounds.minZ;
      const sideMaxZ = item.axis === "side-wall" && nextX > 0 ? 3.4 : bounds.maxZ;
      const nextZ = item.axis === "wall"
        ? item.group.position.z
        : THREE.MathUtils.clamp(snapToStep(z), sideMinZ, sideMaxZ);
      return { x: nextX, z: nextZ };
    };

    const moveFurniture = (item: FurnitureItem, x: number, z: number, step = snapToGridRef.current ? 0.25 : 0, persist = true) => {
      const placement = canPlaceFurniture(item, x, z, step);
      if (!placement) return false;
      const oldSide = item.group.position.x < 0 ? -1 : 1;
      const nextSide = placement.x < 0 ? -1 : 1;
      let rotation = item.group.rotation.y;
      if (item.axis === "side-wall" && oldSide !== nextSide) {
        const oldBase = oldSide < 0 ? Math.PI / 2 : -Math.PI / 2;
        const newBase = nextSide < 0 ? Math.PI / 2 : -Math.PI / 2;
        rotation = newBase + (rotation - oldBase);
      }
      item.group.position.set(placement.x, item.axis === "table" ? DESK_TOP_Y : 0, placement.z);
      item.group.rotation.y = rotation;
      furnitureOffsetsRef.current[item.id] = {
        x: placement.x,
        y: item.axis === "table" ? item.group.position.y : undefined,
        z: placement.z,
        rotation,
      };
      if (persist) saveFurnitureLayout();
      return true;
    };

    const rotateFurniture = (item: FurnitureItem, degrees: number, persist = true) => {
      item.group.rotation.y += THREE.MathUtils.degToRad(degrees);
      const placement = canPlaceFurniture(item, item.group.position.x, item.group.position.z, 0);
      if (placement) item.group.position.set(placement.x, item.axis === "table" ? DESK_TOP_Y : 0, placement.z);
      furnitureOffsetsRef.current[item.id] = {
        x: item.group.position.x,
        y: item.axis === "table" ? item.group.position.y : undefined,
        z: item.group.position.z,
        rotation: item.group.rotation.y,
      };
      if (persist) saveFurnitureLayout();
    };

    const dockFurniture = (item: FurnitureItem, side: "left" | "right") => {
      if (item.axis !== "floor") return;
      item.group.rotation.y = side === "left" ? Math.PI / 2 : -Math.PI / 2;
      const bounds = getPlacementBounds(item);
      const x = side === "left" ? bounds.minX : bounds.maxX;
      const z = THREE.MathUtils.clamp(item.group.position.z, bounds.minZ, bounds.maxZ);
      moveFurniture(item, x, z, 0, false);
      saveFurnitureLayout();
    };

    const resetSelectedFurniture = (item: FurnitureItem) => {
      item.group.rotation.y = item.homeRotation;
      const placement = canPlaceFurniture(item, item.home.x, item.home.z, 0);
      if (placement) item.group.position.set(placement.x, item.axis === "table" ? DESK_TOP_Y : 0, placement.z);
      furnitureOffsetsRef.current[item.id] = {
        x: item.group.position.x,
        y: item.axis === "table" ? item.group.position.y : undefined,
        z: item.group.position.z,
        rotation: item.group.rotation.y,
      };
      saveFurnitureLayout();
    };

    const selectionHelper = new THREE.BoxHelper(new THREE.Mesh(), new THREE.Color(accentColor));
    selectionHelper.visible = false;
    const boxMat = selectionHelper.material as THREE.LineBasicMaterial;
    boxMat.depthTest = false;
    boxMat.transparent = true;
    boxMat.opacity = 0.85;
    selectionHelper.renderOrder = 999;
    scene.add(selectionHelper);

    const applyFurnitureEditRequest = (request: FurnitureEditRequest) => {
      if (request.action === "select") {
        if (!request.id) {
          selectFurniture(null);
        } else {
          const item = furniture.get(request.id);
          if (item) selectFurniture(item);
        }
        return;
      }
      if (request.action === "cycle") {
        const items = [...furniture.values()];
        if (!items.length) return;
        const index = selectedItem ? items.findIndex(item => item.id === selectedItem?.id) : -1;
        const nextIndex = index < 0
          ? (request.direction > 0 ? 0 : items.length - 1)
          : (index + request.direction + items.length) % items.length;
        selectFurniture(items[nextIndex] ?? null);
        return;
      }
      if (!selectedItem) return;
      if (request.action === "rotate") {
        rotateFurniture(selectedItem, request.degrees);
      } else if (request.action === "dock") {
        dockFurniture(selectedItem, request.side);
      } else if (request.action === "nudge") {
        const step = snapToGridRef.current ? 0.25 : 0.1;
        if (selectedItem.axis === "side-wall") {
          if (request.dx !== 0) {
            const switchToRight = request.dx > 0;
            moveFurniture(selectedItem, switchToRight ? 7.99 : -7.99, selectedItem.group.position.z, step, true);
          } else if (request.dz !== 0) {
            moveFurniture(selectedItem, selectedItem.group.position.x, selectedItem.group.position.z + request.dz * step, step, true);
          }
          return;
        }
        if (selectedItem.axis === "wall") {
          if (request.dx !== 0) {
            moveFurniture(selectedItem, selectedItem.group.position.x + request.dx * step, selectedItem.group.position.z, step, true);
          }
          return;
        }
        moveFurniture(
          selectedItem,
          selectedItem.group.position.x + request.dx * step,
          selectedItem.group.position.z + request.dz * step,
          step,
          true,
        );
      }
    };
    furnitureEditActionRef.current = applyFurnitureEditRequest;

    const selectFurniture = (item: FurnitureItem | null) => {
      selectedItem = item;
      selectedFurnitureIdRef.current = item?.id ?? null;
      onFurnitureSelectRef.current(item?.label ?? null, item?.id ?? null);
      if (item) {
        selectionHelper.setFromObject(item.group);
        selectionHelper.visible = true;
      } else {
        selectionHelper.visible = false;
      }
    };

    const resetFurnitureLayout = () => {
      furniture.forEach(item => {
        const hardcoded = HARDCODED_DEFAULT_ROOM_LAYOUT[item.id];
        const target = hardcoded ?? defaultLayout[item.id] ?? item.home;
        const home = target && Number.isFinite(target.x) && Number.isFinite(target.z)
          ? target
          : item.home;
        const rotation = (target && Number.isFinite(target.rotation)
          ? target.rotation
          : item.homeRotation) ?? 0;
        item.group.rotation.y = rotation;
        const placement = canPlaceFurniture(item, home.x, home.z, 0);
        item.group.position.set(placement.x, item.axis === "table" ? DESK_TOP_Y : 0, placement.z);
        furnitureOffsetsRef.current[item.id] = {
          ...placement,
          y: item.axis === "table" ? item.group.position.y : undefined,
          rotation,
        };
      });
      saveFurnitureLayout();
      movingFurniture = false;
      selectFurniture(null);
      const overview = getResponsiveOverview(container.clientWidth, container.clientHeight);
      targetCamPos.current.set(...overview.cam);
      targetLookAt.current.set(...overview.lookAt);
    };
    resetLayoutActionRef.current = resetFurnitureLayout;

    const saveDefaultFurnitureLayout = () => {
      Object.entries(savedLayout).forEach(([id, placement]) => {
        if (placement && !defaultLayout[id as FurnitureId]) {
          defaultLayout[id as FurnitureId] = { ...placement };
        }
      });
      furniture.forEach(item => {
        defaultLayout[item.id] = {
          x: item.group.position.x,
          y: item.axis === "table" ? item.group.position.y : undefined,
          z: item.group.position.z,
          rotation: item.group.rotation.y,
        };
      });
      try {
        window.localStorage.setItem(ROOM_DEFAULT_LAYOUT_KEY, JSON.stringify(defaultLayout));
      } catch {
        // The default still changes for the current session if storage is disabled.
      }
    };
    saveDefaultLayoutActionRef.current = saveDefaultFurnitureLayout;

    const setMouseFromEvent = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findFurnitureForObject = (object: THREE.Object3D) => {
      let current: THREE.Object3D | null = object;
      while (current && current !== scene) {
        const id = current.userData.furnitureId as FurnitureId | undefined;
        if (id) return furniture.get(id) ?? null;
        current = current.parent;
      }
      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMouseFromEvent(e);

      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - rect.left}px`;
        cursorRef.current.style.top  = `${e.clientY - rect.top }px`;
      }
    };

    const handleInteractAtMouse = () => {
      if (editModeRef.current) return;
      raycaster.setFromCamera(mouse2D, camera);
      const hits = raycaster.intersectObjects(getClickableMeshes(), false);
      const phoneHits = raycaster.intersectObject(phoneGroup, true);
      const lampHits = bedsideLamp ? raycaster.intersectObject(bedsideLamp, true) : [];
      const nearestHitDistance = Math.min(hits[0]?.distance ?? Infinity, phoneHits[0]?.distance ?? Infinity);
      if (lampHits.length && lampHits[0].distance <= nearestHitDistance) {
        onLightingToggle();
        return;
      }
      if (phoneHits.length && (!hits.length || phoneHits[0].distance <= hits[0].distance)) {
        soundFX.playClick();
        onPhoneClick();
        return;
      }
      if (!hits.length) return;

      const hit = clickable.find(c => c.mesh === hits[0].object);
      if (!hit) return;

      const zone = hit.zone;
      soundFX.playClick();
      soundFX.playZoom();

      // If clicking synth keyboard, trigger polyphonic synthesizer chord
      if (zone === "audio_rig") {
        soundFX.playSynthNote(440);
        setTimeout(() => soundFX.playSynthNote(554.37), 80);
        setTimeout(() => soundFX.playSynthNote(659.25), 160);
      }

      // Smooth camera glide
      const baseCamera = ZONE_CAMS[zone];
      const zc = transformCameraForZone(zone, baseCamera, furnitureOffsetsRef.current);
      targetCamPos.current.set(zc[0], zc[1], zc[2]);
      targetLookAt.current.set(zc[3], zc[4], zc[5]);

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        if (hit.posterId) onPosterClick(hit.posterId);
        else onZoneClick(zone);
      }, 700);
    };

    const onClick = (e: MouseEvent) => {
      setMouseFromEvent(e);
      handleInteractAtMouse();
    };

    const onMouseLeave = () => {
      mouse2D.set(2, 2);
      if (hoveredZoneId) setHover(null);
      hoveredZoneId = null;
      hoveredPhone = false;
      hoveredLamp = false;
      renderer.domElement.style.cursor = "none";
      if (cursorRef.current) cursorRef.current.style.transform = "translate(-50%,-50%) scale(1)";
    };

    // Orbit Dragging with Inertia Damping
    let isDragging = false;
    let orbitTargetSwitched = false;
    let prevDrag = { x: 0, y: 0 };
    const spherical = new THREE.Spherical();

    // ── Mobile Touch Interaction (1-Finger Orbit, 2-Finger Pinch Zoom, Tap Interaction) ──
    let touchMode: "none" | "orbit" | "pinch" | "drag-furniture" = "none";
    let touchStartPos = { x: 0, y: 0 };
    let prevTouch = { x: 0, y: 0 };
    let touchStartTime = 0;
    let touchMoved = false;
    let initialPinchDist = 0;
    let initialPinchRadius = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const rect = container.getBoundingClientRect();
        touchStartTime = performance.now();
        touchMoved = false;
        touchStartPos = { x: t.clientX, y: t.clientY };
        prevTouch = { x: t.clientX, y: t.clientY };

        mouse2D.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouse2D.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;

        if (editModeRef.current) {
          raycaster.setFromCamera(mouse2D, camera);
          const hits = raycaster.intersectObjects(getFurnitureGroups(), true);
          const hitItem = hits.length ? findFurnitureForObject(hits[0].object) : null;
          if (hitItem) {
            selectFurniture(hitItem);
          }

          const activeItem = selectedItem;
          if (activeItem) {
            const dragNormal = activeItem.axis === "wall"
              ? new THREE.Vector3(0, 0, 1)
              : activeItem.axis === "side-wall"
                ? new THREE.Vector3(1, 0, 0)
                : new THREE.Vector3(0, 1, 0);
            const dragPlaneOffset = activeItem.axis === "wall"
              ? 4.9
              : activeItem.axis === "side-wall"
                ? (activeItem.group.position.x < 0 ? 7.99 : -7.99)
                : activeItem.axis === "table" ? -DESK_TOP_Y : 0;
            dragPlane.set(dragNormal, dragPlaneOffset);
            if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
              const parent = activeItem.axis === "table" ? activeItem.group.parent : null;
              if (parent) parent.updateMatrixWorld(true);
              const localPoint = parent ? parent.worldToLocal(dragPoint.clone()) : dragPoint;
              dragOffset.set(activeItem.group.position.x - localPoint.x, activeItem.group.position.z - localPoint.z);
              movingFurniture = true;
              touchMode = "drag-furniture";
              return;
            }
          }

          orbitTargetSwitched = false;
          spherical.setFromVector3(camera.position.clone().sub(targetLookAt.current));
          touchMode = "orbit";
          return;
        }

        orbitTargetSwitched = false;
        spherical.setFromVector3(camera.position.clone().sub(targetLookAt.current));
        touchMode = "orbit";
      } else if (e.touches.length === 2) {
        touchMode = "pinch";
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        spherical.setFromVector3(targetCamPos.current.clone().sub(targetLookAt.current));
        initialPinchRadius = spherical.radius;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const rect = container.getBoundingClientRect();

      if (e.touches.length === 1 && (touchMode === "orbit" || touchMode === "drag-furniture")) {
        const t = e.touches[0];
        mouse2D.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouse2D.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;

        const dx = t.clientX - prevTouch.x;
        const dy = t.clientY - prevTouch.y;

        if (Math.hypot(t.clientX - touchStartPos.x, t.clientY - touchStartPos.y) > 6) {
          touchMoved = true;
        }
        prevTouch = { x: t.clientX, y: t.clientY };

        if (touchMode === "drag-furniture" && movingFurniture && selectedItem) {
          raycaster.setFromCamera(mouse2D, camera);
          if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
          const parent = selectedItem.axis === "table" ? selectedItem.group.parent : null;
          if (parent) parent.updateMatrixWorld(true);
          const localPoint = parent ? parent.worldToLocal(dragPoint.clone()) : dragPoint;
          moveFurniture(selectedItem, localPoint.x + dragOffset.x, localPoint.z + dragOffset.y, snapToGridRef.current ? 0.25 : 0, false);
          return;
        }

        if (touchMode === "orbit") {
          if (!orbitTargetSwitched) {
            targetLookAt.current.copy(roomOverviewLookAt);
            spherical.setFromVector3(camera.position.clone().sub(roomOverviewLookAt));
            orbitTargetSwitched = true;
          }
          spherical.theta -= dx * 0.007;
          spherical.phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.04, spherical.phi - dy * 0.007));
          targetCamPos.current.copy(targetLookAt.current).add(new THREE.Vector3().setFromSpherical(spherical));
        }
      } else if (e.touches.length === 2 && touchMode === "pinch") {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (initialPinchDist > 0 && currentDist > 0) {
          const factor = initialPinchDist / currentDist;
          spherical.radius = THREE.MathUtils.clamp(initialPinchRadius * factor, 3.5, 48);
          targetCamPos.current.copy(targetLookAt.current).add(new THREE.Vector3().setFromSpherical(spherical));
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const duration = performance.now() - touchStartTime;

      if (touchMode === "drag-furniture") {
        if (movingFurniture) saveFurnitureLayout();
        movingFurniture = false;
        if (!touchMoved && duration < 250) {
          raycaster.setFromCamera(mouse2D, camera);
          const hits = raycaster.intersectObjects(getFurnitureGroups(), true);
          if (!hits.length) {
            selectFurniture(null);
          }
        }
      }

      // Tap detection (quick tap with minimal movement)
      if (!editModeRef.current && !touchMoved && duration < 380 && touchMode === "orbit") {
        handleInteractAtMouse();
      }

      if (e.touches.length === 0) {
        touchMode = "none";
      } else if (e.touches.length === 1) {
        touchMode = "orbit";
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        spherical.setFromVector3(camera.position.clone().sub(targetLookAt.current));
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (editModeRef.current) {
        if (e.button === 1) {
          spherical.setFromVector3(camera.position.clone().sub(targetLookAt.current));
          isDragging = true;
          orbitTargetSwitched = true;
          prevDrag = { x: e.clientX, y: e.clientY };
          if (renderer.domElement) renderer.domElement.style.cursor = "grabbing";
          e.preventDefault();
          return;
        }
        setMouseFromEvent(e);
        raycaster.setFromCamera(mouse2D, camera);
        const hits = raycaster.intersectObjects(getFurnitureGroups(), true);
        const item = hits.length ? findFurnitureForObject(hits[0].object) : null;
        selectFurniture(item);
        if (!item || e.button !== 0) {
          isDragging = false;
          return;
        }

        const dragNormal = item.axis === "wall"
          ? new THREE.Vector3(0, 0, 1)
          : item.axis === "side-wall"
            ? new THREE.Vector3(1, 0, 0)
            : new THREE.Vector3(0, 1, 0);
        const dragPlaneOffset = item.axis === "wall"
          ? 4.9
          : item.axis === "side-wall"
            ? (item.group.position.x < 0 ? 7.99 : -7.99)
            : item.axis === "table" ? -DESK_TOP_Y : 0;
        dragPlane.set(dragNormal, dragPlaneOffset);
        if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
        const parent = item.axis === "table" ? item.group.parent : null;
        if (parent) parent.updateMatrixWorld(true);
        const localPoint = parent ? parent.worldToLocal(dragPoint.clone()) : dragPoint;
        dragOffset.set(item.group.position.x - localPoint.x, item.group.position.z - localPoint.z);
        movingFurniture = true;
        isDragging = false;
        if (renderer.domElement) renderer.domElement.style.cursor = "grabbing";
        e.preventDefault();
        return;
      }
      orbitTargetSwitched = false;
      spherical.setFromVector3(camera.position.clone().sub(targetLookAt.current));
      isDragging = true;
      prevDrag = { x: e.clientX, y: e.clientY };
    };

    const onWheel = (e: WheelEvent) => {
      if (editModeRef.current) return;
      e.preventDefault();
      spherical.setFromVector3(targetCamPos.current.clone().sub(targetLookAt.current));
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * Math.exp(e.deltaY * 0.001), 3.5, 48);
      targetCamPos.current.copy(targetLookAt.current).add(new THREE.Vector3().setFromSpherical(spherical));
    };

    const onMouseUp = () => {
      isDragging = false;
      if (movingFurniture) saveFurnitureLayout();
      movingFurniture = false;
      if (renderer.domElement) renderer.domElement.style.cursor = editModeRef.current ? "grab" : "none";
    };

    const onDrag = (e: MouseEvent) => {
      if (movingFurniture && selectedItem) {
        setMouseFromEvent(e);
        raycaster.setFromCamera(mouse2D, camera);
        if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
        const parent = selectedItem.axis === "table" ? selectedItem.group.parent : null;
        if (parent) parent.updateMatrixWorld(true);
        const localPoint = parent ? parent.worldToLocal(dragPoint.clone()) : dragPoint;
        moveFurniture(selectedItem, localPoint.x + dragOffset.x, localPoint.z + dragOffset.y, snapToGridRef.current ? 0.25 : 0, false);
        return;
      }
      if (!isDragging) return;
      if (!orbitTargetSwitched) {
        targetLookAt.current.copy(roomOverviewLookAt);
        spherical.setFromVector3(camera.position.clone().sub(roomOverviewLookAt));
        orbitTargetSwitched = true;
      }
      const dx = e.clientX - prevDrag.x;
      const dy = e.clientY - prevDrag.y;
      prevDrag = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.0055;
      spherical.phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.04, spherical.phi - dy * 0.0055));
      targetCamPos.current.copy(targetLookAt.current).add(new THREE.Vector3().setFromSpherical(spherical));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (editModeRef.current) {
          selectFurniture(null);
          onEditModeChange(false);
        } else {
          const overview = getResponsiveOverview(container.clientWidth, container.clientHeight);
          targetCamPos.current.set(...overview.cam);
          targetLookAt.current.set(...overview.lookAt);
          onEscape();
        }
        return;
      }
      if (!editModeRef.current) return;
      if (e.key.toLowerCase() === "r" && selectedItem && selectedFurnitureIdRef.current) {
        e.preventDefault();
        resetSelectedFurniture(selectedItem);
        return;
      }
      if (["q", "e"].includes(e.key.toLowerCase()) && selectedItem && selectedFurnitureIdRef.current) {
        e.preventDefault();
        rotateFurniture(selectedItem, (e.key.toLowerCase() === "q" ? -1 : 1) * (e.shiftKey ? 45 : 15));
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const items = [...furniture.values()];
        const index = selectedItem ? items.findIndex(item => item.id === selectedItem?.id) : -1;
        const nextIndex = index < 0
          ? (e.shiftKey ? items.length - 1 : 0)
          : (index + (e.shiftKey ? -1 : 1) + items.length) % items.length;
        selectFurniture(items[nextIndex] ?? null);
        return;
      }
      if (!selectedItem || !selectedFurnitureIdRef.current) return;
      if (selectedItem.axis === "wall" && ["arrowup", "arrowdown", "w", "s"].includes(e.key.toLowerCase())) return;
      const step = snapToGridRef.current ? (e.shiftKey ? 0.05 : 0.25) : (e.shiftKey ? 0.01 : 0.1);
      if (selectedItem.axis === "side-wall" && ["arrowleft", "arrowright", "a", "d"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const switchToRight = ["arrowright", "d"].includes(e.key.toLowerCase());
        moveFurniture(selectedItem, switchToRight ? 7.99 : -7.99, selectedItem.group.position.z, step);
        return;
      }
      const directions: Record<string, FurniturePlacement> = {
        ArrowLeft: { x: -step, z: 0 },
        ArrowRight: { x: step, z: 0 },
        ArrowUp: { x: 0, z: -step },
        ArrowDown: { x: 0, z: step },
        a: { x: -step, z: 0 },
        d: { x: step, z: 0 },
        w: { x: 0, z: -step },
        s: { x: 0, z: step },
      };
      const delta = directions[e.key] ?? directions[e.key.toLowerCase()];
      if (!delta) return;
      e.preventDefault();
      moveFurniture(selectedItem, selectedItem.group.position.x + delta.x, selectedItem.group.position.z + delta.z, step);
    };

    container.style.touchAction = "none";
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("keydown", onKeyDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("click", onClick);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // ── Animation Loop ──────────────────────────────────────────────────────
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      curtainPivots.forEach(({ pivot, phase }) => {
        pivot.rotation.y = Math.sin(t * 0.48 + phase) * 0.055;
        pivot.rotation.z = Math.sin(t * 0.34 + phase) * 0.012;
      });

      // 1. Live Render AAOS Cockpit Screen (CAN bus packet telemetry)
      cdcCtx.fillStyle = "#040810";
      cdcCtx.fillRect(0, 0, 512, 288);
      cdcCtx.strokeStyle = "rgba(0, 242, 254, 0.25)";
      cdcCtx.lineWidth = 1;
      cdcCtx.strokeRect(8, 8, 496, 272);

      // Header telemetry bar
      cdcCtx.fillStyle = "#00F2FE";
      cdcCtx.font = "bold 14px 'Courier New', monospace";
      cdcCtx.fillText("AAOS VEHICLE HAL // COCKPIT CDC [CAN 2.0B]", 20, 32);

      cdcCtx.fillStyle = "#10B981";
      cdcCtx.font = "12px 'Courier New', monospace";
      cdcCtx.fillText("STATUS: ACTIVE // 8,120 frames/sec // LOSS: 0.00%", 20, 52);

      // Speedometer simulated gauge
      const speed = Math.floor(108 + Math.sin(t * 1.5) * 14);
      const rpm = Math.floor(3200 + Math.sin(t * 2) * 450);
      cdcCtx.fillStyle = "#ffffff";
      cdcCtx.font = "bold 32px 'Space Grotesk', sans-serif";
      cdcCtx.fillText(`${speed} KM/H`, 20, 95);

      cdcCtx.fillStyle = "#00F2FE";
      cdcCtx.font = "14px 'Courier New', monospace";
      cdcCtx.fillText(`${rpm} RPM  |  GEAR: D4  |  BATT: 94%`, 20, 120);

      // Live scrolling CAN bus hex packets
      cdcCtx.fillStyle = "rgba(0, 242, 254, 0.75)";
      cdcCtx.font = "11px 'Courier New', monospace";
      const packetOffset = Math.floor(t * 12) % 6;
      for (let p = 0; p < 7; p++) {
        const canId = (0x1A0 + ((p + packetOffset) % 16)).toString(16).toUpperCase();
        const b1 = Math.floor((Math.sin(t + p) * 128 + 128)).toString(16).padStart(2, "0").toUpperCase();
        const b2 = Math.floor((Math.cos(t * 1.5 + p) * 128 + 128)).toString(16).padStart(2, "0").toUpperCase();
        cdcCtx.fillText(`[RX] ID:0x${canId} [8] ${b1} 4F A2 ${b2} 10 00 C4 FE`, 20, 150 + p * 16);
      }
      cdcTexture.needsUpdate = true;

      // 2. Live Render WebGL Audio Spectrum Screen (Lusion-style moving audio FFT)
      audioCtx.fillStyle = "#080410";
      audioCtx.fillRect(0, 0, 512, 288);
      audioCtx.fillStyle = "#9D4EDD";
      audioCtx.font = "bold 13px 'Courier New', monospace";
      audioCtx.fillText("7YNX GLSL AUDIO LAB // REAL-TIME FFT SPECTRUM", 20, 30);

      const numBars = 32;
      const barW = 12;
      for (let b = 0; b < numBars; b++) {
        const h = Math.abs(Math.sin(t * 4 + b * 0.35) * Math.cos(t * 2 + b * 0.15)) * 160 + 15;
        const grad = audioCtx.createLinearGradient(0, 240, 0, 240 - h);
        grad.addColorStop(0, "#F72585");
        grad.addColorStop(0.5, "#9D4EDD");
        grad.addColorStop(1, "#00F2FE");
        audioCtx.fillStyle = grad;
        audioCtx.fillRect(30 + b * 14, 240 - h, barW, h);
      }
      // Floating sine wave overlay
      audioCtx.beginPath();
      audioCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      audioCtx.lineWidth = 2;
      for (let x = 0; x < 450; x += 5) {
        const y = 130 + Math.sin((x * 0.04) + t * 6) * 25 * Math.sin(t * 2);
        if (x === 0) audioCtx.moveTo(30 + x, y);
        else audioCtx.lineTo(30 + x, y);
      }
      audioCtx.stroke();
      audioTexture.needsUpdate = true;

      // 3. Floating Dust Particles upwards
      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pCount; i++) {
        pos.array[i * 3]     += pVel[i * 3];
        pos.array[i * 3 + 1] += pVel[i * 3 + 1];
        pos.array[i * 3 + 2] += pVel[i * 3 + 2];
        if ((pos.array[i * 3 + 1] as number) > 7.5) {
          pos.array[i * 3 + 1] = 0;
        }
      }
      pos.needsUpdate = true;

      // 4. Smooth Camera Lerp
      camera.position.lerp(targetCamPos.current, 0.055);
      camera.lookAt(targetLookAt.current);
      const viewVector = camera.position.clone().sub(targetLookAt.current);
      const viewingFromSide = Math.abs(viewVector.x) > Math.abs(viewVector.z) * 0.9;
      const focusedOnOverview = targetLookAt.current.distanceToSquared(roomOverviewLookAt) < 0.01;
      fourthWall.visible = !editModeRef.current
        && (!activeZoneIdRef.current || activeZoneIdRef.current === "overview")
        && focusedOnOverview
        && viewVector.length() > 13
        && viewingFromSide;

      // 5. Spin the visible PC fan rotors and vary each RGB ring.
      fanMeshes.forEach(f => {
        f.rotation.z += 0.075;
      });
      if (t >= nextFanColorTime) {
        fanRingMats.forEach(mat => {
          const randomRgb = new THREE.Color().setHSL(Math.random(), 0.96, 0.56);
          mat.color.copy(randomRgb);
          mat.emissive.copy(randomRgb);
        });
        pcGlowL.color.copy(fanRingMats[0].color);
        nextFanColorTime = t + 0.45 + Math.random() * 0.85;
      }

      // 6. LED Strip Colour Cycle
      if (!isBedroomTheme) {
        const ledHue = (t * 0.04) % 1;
        const ledCol = new THREE.Color().setHSL(ledHue, 1, 0.55);
        ledMeshes.forEach(m => {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.color.set(ledCol);
          mat.emissive.set(ledCol);
        });
      }

      // 7. Keyboard RGB Cycle
      const kbHue = isBedroomTheme ? 0.76 : (t * 0.1 + 0.33) % 1;
      const kbCol = new THREE.Color().setHSL(kbHue, isBedroomTheme ? 0.46 : 1, isBedroomTheme ? 0.72 : 0.5);
      kbLedMat.color.set(kbCol);
      kbLedMat.emissive.set(kbCol);

      // 8. Breathing Lights
      deskLight.intensity = (nightMode ? (isBedroomTheme ? 0.8 : 1.15) : isBedroomTheme ? 2.2 : 2.8) + Math.sin(t * 1.8) * (nightMode ? 0.08 : 0.24);
      purpleBack.intensity = (nightMode ? 0.9 : isBedroomTheme ? 2.2 : 5) + Math.cos(t * 1.2) * (nightMode ? 0.12 : isBedroomTheme ? 0.3 : 0.8);
      pinkAccent.intensity = (nightMode ? 0.28 : isBedroomTheme ? 1.2 : 2) + Math.sin(t * 2.5) * (nightMode ? 0.04 : 0.3);
      pcGlowL.intensity = (isBedroomTheme ? 1.1 : 1.8) + Math.sin(t * 3.5) * 0.4;
      signGlow.intensity = (nightMode ? (isBedroomTheme ? 0.36 : 0.72) : isBedroomTheme ? 0.65 : 1.8) + Math.sin(t * 0.9) * (nightMode ? 0.06 : 0.25);
      mugGlow.intensity = nightMode ? 0.32 + Math.sin(t * 0.7) * 0.06 : 0.5 + Math.sin(t * 0.7) * 0.12;
      scrGlow1.intensity = 0.8 + Math.sin(t * 2.0) * 0.2;
      scrGlow2.intensity = 0.8 + Math.cos(t * 2.2) * 0.2;

      // 9. Raycasting Hover
      if (editModeRef.current) {
        if (hoveredZoneId) setHover(null);
        hoveredZoneId = null;
        hoveredPhone = false;
        hoveredLamp = false;
        setPhoneGlow(false);
        renderer.domElement.style.cursor = movingFurniture || isDragging ? "grabbing" : "grab";
      } else {
        raycaster.setFromCamera(mouse2D, camera);
        const isPhoneHovered = raycaster.intersectObject(phoneGroup, true).length > 0;
        const isLampHovered = Boolean(bedsideLamp && raycaster.intersectObject(bedsideLamp, true).length > 0);
        if (isPhoneHovered) {
          if (!hoveredPhone) soundFX.playHover();
          if (hoveredZoneId) setHover(null);
          hoveredZoneId = null;
          hoveredPhone = true;
          hoveredLamp = false;
          setPhoneGlow(true);
          renderer.domElement.style.cursor = "pointer";
          if (cursorRef.current) {
            cursorRef.current.style.transform = "translate(-50%,-50%) scale(2.2)";
            cursorRef.current.style.borderColor = accentColor;
          }
        } else if (isLampHovered) {
          if (!hoveredLamp) soundFX.playHover();
          if (hoveredZoneId) setHover(null);
          hoveredZoneId = null;
          if (hoveredPhone) {
            hoveredPhone = false;
            setPhoneGlow(false);
          }
          hoveredLamp = true;
          renderer.domElement.style.cursor = "pointer";
          if (cursorRef.current) {
            cursorRef.current.style.transform = "translate(-50%,-50%) scale(2.2)";
            cursorRef.current.style.borderColor = "#ffd3a0";
          }
        } else {
          if (hoveredPhone || hoveredLamp) {
            hoveredPhone = false;
            hoveredLamp = false;
            setPhoneGlow(false);
            renderer.domElement.style.cursor = "none";
            if (cursorRef.current) {
              cursorRef.current.style.transform = "translate(-50%,-50%) scale(1)";
              cursorRef.current.style.borderColor = accentColor;
            }
          }
          const hits = raycaster.intersectObjects(getClickableMeshes(), false);
          const newZone = hits.length ? (clickable.find(c => c.mesh === hits[0].object)?.zone ?? null) : null;
          if (newZone !== hoveredZoneId) {
            setHover(newZone);
            hoveredZoneId = newZone;
            if (cursorRef.current) {
              cursorRef.current.style.transform = newZone
                ? "translate(-50%,-50%) scale(2.2)"
                : "translate(-50%,-50%) scale(1)";
              cursorRef.current.style.borderColor = newZone ? ROOM_ZONES[newZone].color : accentColor;
            }
          }
        }
      }

      // 10. Update DOM Zone Markers
      const size = new THREE.Vector2();
      renderer.getSize(size);
      labelRefs.current.forEach((el, zoneId) => {
        const anchor = labelPositions[zoneId].clone();
        const furnitureId = ZONE_FURNITURE[zoneId];
        const furnitureItem = furnitureId ? furniture.get(furnitureId) : null;
        if (furnitureItem) {
          furnitureItem.group.updateMatrixWorld(true);
          anchor.applyMatrix4(furnitureItem.group.matrixWorld);
        }
        const wp = anchor.project(camera);
        const sx = (wp.x * 0.5 + 0.5) * size.x;
        const sy = (-wp.y * 0.5 + 0.5) * size.y;
        const inFront = wp.z < 1;
        el.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`;
        const dist = camera.position.distanceTo(anchor);
        const vis = !editModeRef.current && hoveredZoneId === zoneId && inFront && dist < 12 && sy > 0 && sy < size.y;
        el.style.opacity = vis ? "1" : "0";
      });

      if (selectionHelper.visible && selectedItem) {
        selectionHelper.setFromObject(selectedItem.group);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const overview = getResponsiveOverview(width, height);
      camera.aspect = width / height;
      camera.fov = overview.fov;
      camera.updateProjectionMatrix();
      roomOverviewLookAt.set(...overview.lookAt);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      if (!activeZoneIdRef.current || activeZoneIdRef.current === "overview" || editModeRef.current) {
        targetCamPos.current.set(...overview.cam);
        targetLookAt.current.set(...overview.lookAt);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("keydown", onKeyDown);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("click", onClick);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      selectionHelper.dispose();
      if (resetLayoutActionRef.current === resetFurnitureLayout) resetLayoutActionRef.current = null;
      if (saveDefaultLayoutActionRef.current === saveDefaultFurnitureLayout) saveDefaultLayoutActionRef.current = null;
      if (furnitureEditActionRef.current === applyFurnitureEditRequest) furnitureEditActionRef.current = null;
      const disposedGeometries = new Set<THREE.BufferGeometry>();
      const disposedMaterials = new Set<THREE.Material>();
      const disposedTextures = new Set<THREE.Texture>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          if (!disposedGeometries.has(object.geometry)) {
            disposedGeometries.add(object.geometry);
            object.geometry.dispose();
          }
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            if (disposedMaterials.has(material)) return;
            disposedMaterials.add(material);
            Object.values(material).forEach(value => {
              if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
                disposedTextures.add(value);
                value.dispose();
              }
            });
            material.dispose();
          });
        }
      });
      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onZoneClick, onPosterClick, onPhoneClick, onLightingToggle, onEscape, theme, nightMode, onEditModeChange]);

  return (
    <div className="relative w-full h-full select-none" style={{ cursor: editMode ? "grab" : "none" }}>
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Avant-Garde Custom Cursor Dot (Lusion / Emotion Agency) - Desktop Only */}
      <div
        ref={cursorRef}
        className="hidden md:block absolute pointer-events-none z-50 w-6 h-6 rounded-full border-2 border-cyan-400 mix-blend-screen transition-all duration-100 shadow-[0_0_15px_rgba(0,242,254,0.5)]"
        style={{ left: 0, top: 0, transform: "translate(-50%,-50%)", willChange: "transform", display: editMode ? "none" : undefined }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* 3D Label Overlays with High-Fashion Editorial Typography */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {(Object.keys(ROOM_ZONES) as ZoneId[]).map((id) => {
          const z = ROOM_ZONES[id];
          return (
            <div
              key={id}
              ref={setLabelRef(id)}
              className="absolute flex flex-col items-center gap-1 transition-opacity duration-300 pointer-events-none"
              style={{ opacity: 0, left: 0, top: 0, willChange: "transform, opacity" }}
            >
              <div
                className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border backdrop-blur-md whitespace-nowrap shadow-xl flex items-center gap-1.5"
                style={{ color: z.color, borderColor: z.color + "66", background: "rgba(6,6,14,0.85)" }}
              >
                <span>{z.dot}</span>
                <span>{z.label}</span>
                <span className="text-zinc-600 font-normal">|</span>
                <span className="text-[9px] text-zinc-400 font-normal">{z.code}</span>
              </div>
              <div className="w-px h-3.5 opacity-60" style={{ background: z.color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
