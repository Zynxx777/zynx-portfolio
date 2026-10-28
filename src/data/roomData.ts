export const ROOM_ZONES = {
  monitor_left: { label: "ECE Systems Study", color: "#00F2FE", dot: "⚡", code: "01 // COURSEWORK" },
  monitor_right: { label: "WebGL Creative Studio", color: "#9D4EDD", dot: "✦", code: "02 // SHADERS" },
  pc_case: { label: "Linux Workstation", color: "#4FACFE", dot: "⬡", code: "03 // PERSONAL USE" },
  audio_rig: { label: "7YNX Sound Station", color: "#F72585", dot: "♪", code: "04 // SYNTH" },
  bookshelf: { label: "Achievements & Creds", color: "#10B981", dot: "◈", code: "05 // AWARDS" },
  poster_wall: { label: "Digital Art Sanctuary", color: "#FFB347", dot: "◉", code: "06 // GALLERY" },
  headphones: { label: "Acoustic Library", color: "#F72585", dot: "◎", code: "07 // AUDIO" },
  zcard: { label: "Z Card v0.1 Anatomy", color: "#00F2FE", dot: "💳", code: "08 // HARDWARE REVEAL" },
  diary: { label: "Personal Guestbook", color: "#FFB347", dot: "📖", code: "09 // DIARY" },
  printer: { label: "Thermal Docket Printer", color: "#38BDF8", dot: "🖨️", code: "10 // DOCKET" },
  zoro: { label: "Zoro Bobblehead", color: "#10B981", dot: "⚔️", code: "11 // COLLECTIBLE" },
} as const;

export type ZoneId = keyof typeof ROOM_ZONES;

export const ROOM_POSTERS = [
  { id: "lofi-study", title: "Lofi Study Night", image: "/images/ambient/lofi-study-night.jpg", caption: "A quiet desk, a warm lamp, and a loop for long creative nights." },
  { id: "rain-window", title: "Rain at the Window", image: "/images/ambient/soothing-rain.jpg", caption: "A soft rainy-day scene from the bedroom studio wall." },
  { id: "black-hole", title: "Black Hole", image: "/images/blackhole.jpeg", caption: "A space study that carries the original Cyberpunk Space theme into the gallery." },
  { id: "anime-moon", title: "Anime Moonlight", image: "/images/ambient/anime-moon.jpg", caption: "A moonlit anime-inspired print for the bedroom corner." },
] as const;
export type RoomPosterId = typeof ROOM_POSTERS[number]["id"];

export type FurnitureId = "studio" | "cpu" | "phone" | "shelf" | "gallery" | "chair" | "bed" | "door" | "lamp" | "printer" | "zoro" | "zcard" | "diary";
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
    return { fov: 43, cam: [6, 5.5, 7.8], lookAt: [0.35, 1.65, 0.2] };
  }
  if (aspect >= 0.85) {
    const t = (1.25 - aspect) / (1.25 - 0.85);
    return {
      fov: 43 + t * 6,
      cam: [6 + t * 2, 5.5 + t * 1.6, 7.8 + t * 2.4],
      lookAt: [0.35 + t * 0.1, 1.65 + t * 0.1, 0.2 + t * 0.1],
    };
  }
  const t = Math.max(0, Math.min(1, (0.85 - aspect) / (0.85 - 0.40)));
  return {
    fov: 49 + t * 11,
    cam: [8 + t * 2.3, 7.1 + t * 4, 10.2 + t * 3.6],
    lookAt: [0.45 + t * 0.1, 1.75 + t * 0.2, 0.3],
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
  { id: "printer", label: "Thermal POS printer", shortLabel: "Printer", icon: "🖨️", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "zoro", label: "Zoro bobblehead", shortLabel: "Zoro", icon: "⚔️", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "zcard", label: "Z Card v0.1 hardware", shortLabel: "Z Card", icon: "💳", themes: ["cyberpunk", "anime-bedroom"] },
  { id: "diary", label: "Guestbook diary", shortLabel: "Diary", icon: "📖", themes: ["cyberpunk", "anime-bedroom"] },
];

export const HARDCODED_DEFAULT_ROOM_LAYOUT: Record<FurnitureId, FurniturePlacement> = {
  studio: { x: 0, z: -2.85, rotation: 0 },
  chair: { x: 0, z: -2, rotation: 0 },
  door: { x: 6.45, z: -4.8, rotation: 0 },
  cpu: { x: 3.65, y: 1.49, z: -0.62, rotation: 0 },
  phone: { x: -1.65, y: 1.49, z: 0.32, rotation: 0 },
  shelf: { x: -7.95, z: -3.4, rotation: 1.5707963267948966 },
  gallery: { x: 0, z: 0, rotation: 0 },
  bed: { x: 5.45, z: 1.97, rotation: 0 },
  lamp: { x: 3.5, z: 0, rotation: 0 },
  printer: { x: -2.55, y: 1.49, z: 0.42, rotation: 0 },
  zoro: { x: -3.65, y: 1.49, z: 0.42, rotation: 0 },
  zcard: { x: -0.85, y: 1.49, z: 0.65, rotation: 0.15 },
  diary: { x: 2.45, y: 1.49, z: 0.55, rotation: -0.2 },
};

export const ZONE_FURNITURE: Partial<Record<ZoneId, FurnitureId>> = {
  monitor_left: "studio",
  monitor_right: "studio",
  pc_case: "cpu",
  audio_rig: "studio",
  headphones: "studio",
  bookshelf: "shelf",
  poster_wall: "gallery",
  zcard: "zcard",
  diary: "diary",
  printer: "printer",
  zoro: "zoro",
};

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

export const transformCameraForZone = (
  zone: ZoneId | "overview",
  coords: number[],
  placements: Partial<Record<FurnitureId, FurniturePlacement>>,
) => {
  if (zone === "overview") return coords;
  const furnitureId = ZONE_FURNITURE[zone];
  if (!furnitureId) return coords;
  const placement = placements[furnitureId];
  if (["cpu", "phone", "printer", "zoro", "zcard", "diary"].includes(furnitureId)) {
    const tableCoords = placement ? transformCameraForFurniture(coords, placement) : coords;
    const deskPlacement = placements.studio;
    return deskPlacement ? transformCameraForFurniture(tableCoords, deskPlacement) : tableCoords;
  }
  return placement ? transformCameraForFurniture(coords, placement) : coords;
};

export const ZONE_CAMS: Record<ZoneId | "overview", number[]> = {
  overview: [7, 6, 8, 0, 1.2, 0],
  monitor_left: [-0.2, 2.6, 2.8, -0.88, 2.25, -0.75],
  monitor_right: [1.4, 2.6, 2.8, 0.88, 2.25, -0.75],
  pc_case: [1.2, 1.0, 2.8, 0, 0.7, 0],
  audio_rig: [-3.0, 2.6, 2.8, -1.6, 1.8, -0.5],
  bookshelf: [0, 3.2, 3.2, 0, 2.4, 0.45],
  poster_wall: [-2.5, 4.5, 1.5, -4.2, 4.6, -4.3],
  headphones: [-3.72, 2.5, 2.04, -3.52, 2.1, -0.96],
  zcard: [-0.85, 2.2, 1.8, -0.85, 1.52, 0.65],
  diary: [2.45, 2.2, 1.8, 2.45, 1.52, 0.55],
  printer: [-2.55, 2.3, 1.8, -2.55, 1.6, 0.42],
  zoro: [-3.65, 2.3, 1.8, -3.65, 1.62, 0.42],
};
