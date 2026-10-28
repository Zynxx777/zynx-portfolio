import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { PageInsidePageModal } from "./PageInsidePageModal";
import profileData from "../data/profile.json";

// ─────────────────────────────────────────────────────────────────────────────
// GLSL SHADERS (Faithfully mirroring Jesper Landberg's WebGL architecture)
// Features: S-curve depth wave, lean door perspective, velocity banking,
// local hover dome depression, SDF rounded box, hairline border, and specular sheen.
// ─────────────────────────────────────────────────────────────────────────────

const VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec2 vMouseUv;

uniform vec2 u_res;
uniform float u_hover;
uniform float u_dent;
uniform vec2 u_mouse;
uniform float u_sheetW;
uniform float u_sheetD;
uniform float u_sheetP;
uniform float u_sheetT;
uniform float u_leanW;
uniform float u_leanA;
uniform float u_bulgeA;
uniform float u_bulgeH;
uniform float u_sheetV;

const float SHEET_PI = 3.141592653589793;
const float SHEET_SHIFT = -0.15;
const float SHEET_DIAG = 0.022;
const float SHEET_REAR_Y = 0.07;
const float SHEET_REAR_Z = 0.16;

float sheetQ(float wx) {
  return (wx / max(u_sheetW, 0.0001)) * u_sheetT + SHEET_SHIFT;
}

float sheetShape(float q) {
  float g = exp(-0.85 * q * q);
  float ess = sin(SHEET_PI * q);
  return ess * g;
}

float sheetZ(float wx) {
  return -u_sheetD * sheetShape(sheetQ(wx));
}

float leanRamp(float s) {
  return s / sqrt(1.0 + s * s);
}

// Organic dome indentation: 1 at the centre and exactly 0 at every edge
float sheetDome(vec2 uv) {
  vec2 q = uv * 2.0 - 1.0;
  return clamp((1.0 - q.x * q.x) * (1.0 - q.y * q.y), 0.0, 1.0);
}

void main() {
  vUv = uv;
  vec3 p = position;

  // Local physical hover depression: bowing away from the viewer under cursor
  if (u_hover > 0.0001) {
    p.z -= u_hover * u_dent * u_res.y * sheetDome(uv);
  }

  // World space transformation before ribbon sweep
  vec4 w = modelMatrix * vec4(p, 1.0);

  // Depth wave sweep: continuous S-curve ribbon across world x
  if (u_sheetW > 0.001 && u_sheetP > 0.001 && u_sheetD > 0.001) {
    w.z += sheetZ(w.x) * u_sheetP;
  }

  // Lean perspective door ramp
  if (u_leanW > 0.001) {
    w.z += u_leanA * leanRamp(w.x / u_leanW) * u_sheetP;
  }

  // Subtle diagonal uphill shear
  w.y += w.x * SHEET_DIAG * u_sheetP;

  // Real-time inertia velocity rear-up and ribbon banking on drag/scroll
  if (abs(u_sheetV) > 0.0001) {
    float vFactor = clamp(u_sheetV * 0.02, -1.0, 1.0);
    w.y += abs(vFactor) * SHEET_REAR_Y * u_sheetW * (1.0 - smoothstep(0.0, u_sheetW * 0.9, abs(w.x)));
    w.z += vFactor * SHEET_REAR_Z * u_sheetW;
  }

  // Vertical bulge
  if (u_bulgeH > 0.001) {
    float t = clamp(w.y / u_bulgeH, -1.0, 1.0);
    w.z += u_bulgeA * (1.0 - t * t);
  }

  vWorldPos = w.xyz;
  vMouseUv = u_mouse;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec2 vMouseUv;

uniform sampler2D u_texture;
uniform vec2 u_size;
uniform vec2 u_res;
uniform float u_alpha;
uniform float u_corner;
uniform float u_border;
uniform vec3 u_borderColor;
uniform float u_hover;
uniform vec2 u_mouse;
uniform float u_time;

// Responsive aspect-ratio cover mapping
vec2 uvCover(vec2 planeSize, vec2 imageSize, vec2 uv) {
  float planeRatio = planeSize.x / planeSize.y;
  float imageRatio = imageSize.x / imageSize.y;

  vec2 newSize = planeRatio < imageRatio
    ? vec2(imageSize.x * (planeSize.y / imageSize.y), planeSize.y)
    : vec2(planeSize.x, imageSize.y * (planeSize.x / imageSize.x));
  vec2 newOffset = (planeRatio < imageRatio
    ? vec2((newSize.x - planeSize.x) * 0.5, 0.0)
    : vec2(0.0, (newSize.y - planeSize.y) * 0.5)) / newSize;

  return uv * planeSize / newSize + newOffset;
}

// Signed distance field for crisp rounded box silhouette
float roundedBox(vec2 p, vec2 mid, float r) {
  vec2 q = abs(p - mid) - (mid - r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// Jesper Landberg Lighting Parameters
const vec3 LIGHT_DIR = normalize(vec3(-0.35, 0.55, 0.9));
const float LIGHT_GLOSS = 36.0;
const float LIGHT_SPEC = 0.42;
const float LIGHT_DIFF = 0.15;

void main() {
  vec2 coverUv = uvCover(u_res, u_size, vUv);
  vec2 sizeInHeightUnits = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
  vec2 cursorDelta = (vUv - u_mouse) * sizeInHeightUnits;
  float cursorDistance = length(cursorDelta);
  float rippleRadius = mod(u_time * 0.72, 1.25);
  float ripple = exp(-pow((cursorDistance - rippleRadius) / 0.035, 2.0)) * u_hover;
  vec2 rippleDirection = normalize(vUv - u_mouse + vec2(0.00001));
  coverUv += rippleDirection * ripple * 0.012;
  vec4 tex = texture2D(u_texture, coverUv);

  // Measure SDF in plane height units
  vec2 sz = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
  vec2 mid = sz * 0.5;
  float r = min(u_corner, min(mid.x, mid.y));

  float d = roundedBox(vUv * sz, mid, r);
  float aa = max(fwidth(d), 0.0008);
  float shapeAlpha = 1.0 - smoothstep(-aa, aa, d);

  if (shapeAlpha < 0.001) discard;

  // Per-fragment analytical lighting
  vec3 normal = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 viewDir = normalize(-vWorldPos);

  float diff = dot(normal, LIGHT_DIR) * 0.5 + 0.5;
  vec3 col = tex.rgb * (1.0 - LIGHT_DIFF * (1.0 - diff));

  vec3 halfVector = normalize(LIGHT_DIR + viewDir);
  float spec = pow(max(dot(normal, halfVector), 0.0), LIGHT_GLOSS);

  // Dynamic cursor spotlight sheen tracking the mouse across the card
  float cursorGlow = exp(-cursorDistance * 3.8) * u_hover;

  col += (spec * LIGHT_SPEC + cursorGlow * 0.28) * vec3(0.92, 0.96, 1.0);
  col += ripple * vec3(0.24, 0.62, 0.84) * 0.18;

  // Subtle dark vignette at edges
  float vignette = smoothstep(0.7, 0.05, length(vUv - 0.5));
  col = mix(col * 0.88, col, vignette);

  // Hairline border rendered within the same SDF field
  if (u_border > 0.0001) {
    float borderMask = smoothstep(-u_border - aa, -u_border + aa, d);
    vec3 activeBorder = mix(u_borderColor, vec3(0.4, 0.8, 1.0), u_hover * 0.6);
    col = mix(col, activeBorder + cursorGlow * 0.25, borderMask);
  }

  gl_FragColor = vec4(col, shapeAlpha * u_alpha);
}
`;

// Extended projects list with ZYNX 3D Room included
export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  skills: string[];
  badge: string;
  img: string;
  link: string;
  year?: string;
  role?: string;
  architecture?: string;
}

const ALL_PROJECTS: ProjectItem[] = [
  ...profileData.projects,
];

const PROJECT_GALLERY_FOV = 46;

const GRID_VERTEX_SHADER = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const GRID_FRAGMENT_SHADER = `
varying vec3 vWorldPosition;
uniform vec3 u_gridColor;
uniform float u_opacity;
void main() {
  vec2 coordinate = vWorldPosition.xz * 0.42;
  vec2 derivative = max(fwidth(coordinate), vec2(0.001));
  vec2 lines = abs(fract(coordinate - 0.5) - 0.5) / derivative;
  float grid = 1.0 - min(min(lines.x, lines.y), 1.0);
  float distanceFade = 1.0 - smoothstep(-28.0, -5.0, vWorldPosition.z);
  float alpha = grid * distanceFade * u_opacity;
  if (alpha < 0.006) discard;
  gl_FragColor = vec4(u_gridColor, alpha);
}
`;

const PROFILE_LENS_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const PROFILE_LENS_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_open;

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float portraitLayout = 1.0 - smoothstep(0.8, 1.15, aspect);
  vec2 lensCenter = vec2(0.5, mix(0.5, 0.68, portraitLayout));
  vec2 p = (vUv - lensCenter) * vec2(aspect, 1.0);
  float distanceFromCenter = length(p);
  float angle = atan(p.y, p.x);

  // The large lens spans most of the scene on desktop and stays within the
  // viewport width on portrait screens. Its edge moves like hand-blown glass.
  float baseRadius = min(0.55, aspect * 0.43);
  float lensRadius = baseRadius * (1.0 + 0.035 * sin(angle * 2.0 + u_time * 0.24) + 0.022 * sin(angle * 5.0 - u_time * 0.19) + 0.011 * sin(angle * 9.0 + u_time * 0.31));
  float lensPosition = distanceFromCenter / lensRadius;
  float insideLens = 1.0 - smoothstep(0.88, 1.01, lensPosition);
  float edgeBand = exp(-pow((lensPosition - 1.0) / 0.105, 2.0));
  float innerGlass = exp(-pow((lensPosition - 0.86) / 0.08, 2.0));
  float outerGlass = exp(-pow((lensPosition - 1.1) / 0.075, 2.0));
  float darkRim = smoothstep(0.73, 0.81, lensPosition) * (1.0 - smoothstep(0.9, 0.97, lensPosition));
  float outerBend = exp(-pow((lensPosition - 1.01) / 0.24, 2.0));
  float magnification = exp(-pow(lensPosition * 1.18, 4.0)) * 0.21 * u_open;
  float travellingRipple = sin(lensPosition * 24.0 - u_time * 1.35) * exp(-pow((lensPosition - 0.91) * 5.0, 2.0)) * 0.015 * u_open;

  vec2 radial = normalize(p + vec2(0.00001));
  vec2 radialUv = radial / vec2(aspect, 1.0);
  vec2 bentP = p * (1.0 - magnification) + radial * (outerBend * 0.1 * u_open + travellingRipple);
  vec2 sampleUv = 0.5 + bentP / vec2(aspect, 1.0);

  // Separate color channels and pearlescent bands create the reference's
  // thick, iridescent glass edge without adding a flat CSS ring.
  float fringe = edgeBand * 0.014 * u_open;
  float red = texture2D(u_scene, sampleUv + radialUv * fringe).r;
  float green = texture2D(u_scene, sampleUv).g;
  float blue = texture2D(u_scene, sampleUv - radialUv * fringe).b;
  vec3 color = vec3(red, green, blue);

  float centerShade = (1.0 - smoothstep(0.72, 1.02, lensPosition)) * insideLens * 0.96 * u_open;
  color *= 1.0 - centerShade;
  color *= 1.0 - darkRim * 0.76 * u_open;
  float prismPhase = angle * 1.85 + lensPosition * 21.0 + u_time * 0.12;
  vec3 prismColor = 0.5 + 0.5 * cos(prismPhase + vec3(0.0, 2.094, 4.188));
  float arcPulse = 0.5 + 0.5 * sin(angle * 2.7 + sin(angle * 4.8) * 0.7 + u_time * 0.18);
  float glassArc = 0.2 + 0.8 * pow(arcPulse, 1.25);
  color += prismColor * (edgeBand * 0.38 + innerGlass * 0.16 + outerGlass * 0.12) * glassArc * u_open;
  color += edgeBand * vec3(0.68, 0.78, 0.9) * 0.18 * u_open;
  float glintWave = sin(angle * 2.0 + sin(angle * 3.0) * 0.4 + u_time * 0.32);
  float glassGlint = pow(max(glintWave, 0.0), 14.0) * edgeBand;
  color += glassGlint * vec3(0.9, 0.94, 1.0) * 0.75 * u_open;
  color += outerBend * vec3(0.14, 0.2, 0.29) * 0.32 * u_open;

  gl_FragColor = vec4(color, 1.0);
}
`;

function createLabeledProjectTexture(source: CanvasImageSource & { width: number; height: number }, name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 760;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(source);

  const coverScale = Math.max(canvas.width / source.width, canvas.height / source.height);
  const imageWidth = source.width * coverScale;
  const imageHeight = source.height * coverScale;
  context.drawImage(source, (canvas.width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);

  const shade = context.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(0.48, "rgba(0,0,0,0.18)");
  shade.addColorStop(1, "rgba(0,0,0,0.78)");
  context.fillStyle = shade;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255,255,255,0.94)";
  context.font = "500 39px Inter, Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText(name, 54, canvas.height - 58, canvas.width - 180);

  const buttonX = canvas.width - 54;
  const buttonY = canvas.height - 58;
  context.beginPath();
  context.arc(buttonX, buttonY, 25, 0, Math.PI * 2);
  context.fillStyle = "rgba(0,0,0,0.72)";
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.68)";
  context.lineWidth = 2;
  context.stroke();
  context.beginPath();
  context.moveTo(buttonX - 7, buttonY);
  context.lineTo(buttonX + 7, buttonY);
  context.lineTo(buttonX + 2, buttonY - 5);
  context.moveTo(buttonX + 7, buttonY);
  context.lineTo(buttonX + 2, buttonY + 5);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function getProjectCardMetrics(width: number, height: number, immersive = false) {
  const safeHeight = Math.max(height, 1);
  const aspect = width / safeHeight;
  const cameraZ = width < 480 ? 6.2 : width < 768 ? 5.8 : 4.9;
  const visibleHeight = 2 * cameraZ * Math.tan((PROJECT_GALLERY_FOV * Math.PI) / 360);
  const visibleWidth = visibleHeight * aspect;
  const cardAspect = immersive
    ? aspect < 0.72 ? 1.12 : aspect < 1.15 ? 1.42 : 1.78
    : aspect < 0.72 ? 1.18 : aspect < 1.15 ? 1.35 : 1.55;
  const widthRatio = immersive
    ? aspect < 0.72 ? 0.9 : aspect < 1.15 ? 0.67 : 0.5
    : aspect < 0.72 ? 0.9 : aspect < 1.15 ? 0.82 : 0.72;
  const heightRatio = immersive
    ? aspect < 0.72 ? 0.58 : aspect < 1.15 ? 0.46 : 0.42
    : aspect < 0.72 ? 0.7 : aspect < 1.15 ? 0.74 : 0.75;
  const cardWidth = Math.min(visibleWidth * widthRatio, visibleHeight * heightRatio * cardAspect);

  return {
    cameraZ,
    cardWidth,
    cardHeight: cardWidth / cardAspect,
    cardGap: Math.max(0.2, cardWidth * (immersive ? 0.12 : 0.11)),
  };
}

interface Projects3DProps {
  immersive?: boolean;
  profileOpen?: boolean;
  onOpenAnatomy?: () => void;
}

export const Projects3D: React.FC<Projects3DProps> = ({ immersive = false, profileOpen = false, onOpenAnatomy }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const profileOpenRef = useRef(profileOpen);
  const [activeFilter, setActiveFilter] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"strip" | "index">(() =>
    "strip",
  );
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);

  // References for animation state
  const scrollOffsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; ndcX: number; ndcY: number }>({ x: 0, y: 0, ndcX: 0, ndcY: 0 });
  const hoveredIndexRef = useRef<number>(-1);
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);
  const cardWidthRef = useRef<number>(3.3);
  const cardGapRef = useRef<number>(0.35);
  const previousProfileOpenRef = useRef(false);
  const savedProfileOffsetRef = useRef(0);

  const filterCategories = useMemo(() => [
    { id: "featured", label: "Featured" },
    { id: "all", label: "All Works" },
    { id: "web", label: "Web Projects", match: ["Web Development"] },
    { id: "systems", label: "Linux & IT Support", match: ["Linux & IT Support"] },
    { id: "engineering", label: "ECE & Embedded", match: ["Automotive & Embedded", "Hardware & VLSI"] },
  ], []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "featured") return ALL_PROJECTS.slice(0, 4);
    if (activeFilter === "all") return ALL_PROJECTS;
    const cat = filterCategories.find(c => c.id === activeFilter);
    return ALL_PROJECTS.filter(p => cat?.match?.includes(p.category));
  }, [activeFilter, filterCategories]);

  useEffect(() => {
    profileOpenRef.current = profileOpen;
    if (profileOpen && !previousProfileOpenRef.current) {
      const step = cardWidthRef.current + cardGapRef.current;
      const maxOffset = Math.max(0, (filteredProjects.length - 1) * step);
      savedProfileOffsetRef.current = targetOffsetRef.current;
      const currentIndex = Math.round(targetOffsetRef.current / Math.max(step, 0.001));
      const centeredIndex = filteredProjects.length > 2
        ? THREE.MathUtils.clamp(currentIndex, 1, filteredProjects.length - 2)
        : currentIndex;
      targetOffsetRef.current = THREE.MathUtils.clamp(centeredIndex * step, 0, maxOffset);
    } else if (!profileOpen && previousProfileOpenRef.current) {
      targetOffsetRef.current = savedProfileOffsetRef.current;
    }
    previousProfileOpenRef.current = profileOpen;
  }, [profileOpen, filteredProjects]);

  // Handle scroll / dragging
  const handleWheel = useCallback((e: WheelEvent) => {
    // Vertical wheel input always belongs to the document. Horizontal trackpad
    // gestures can move the project rail without trapping visitors on this page.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const wheelDelta = e.deltaX;
    if (wheelDelta === 0) return;

    const step = cardWidthRef.current + cardGapRef.current;
    const maxScroll = Math.max(0, (filteredProjects.length - 1) * step);
    const currentOffset = targetOffsetRef.current;
    const canMoveForward = currentOffset < maxScroll - 0.08;
    const canMoveBackward = currentOffset > 0.08;
    const canMove = wheelDelta > 0 ? canMoveForward : canMoveBackward;

    // Pass horizontal gestures through at either edge rather than trapping input.
    if (!canMove) return;

    e.preventDefault();
    const delta = wheelDelta * cardWidthRef.current * 0.0012;
    targetOffsetRef.current += delta;
  }, [filteredProjects]);

  const moveStrip = (direction: -1 | 1) => {
    const step = cardWidthRef.current + cardGapRef.current;
    targetOffsetRef.current += direction * step;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container || viewMode !== "strip") return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 650;
    const initialLayout = getProjectCardMetrics(width, height, immersive);
    let cardWidth = initialLayout.cardWidth;
    let cardHeight = initialLayout.cardHeight;
    let cardGap = initialLayout.cardGap;
    cardWidthRef.current = cardWidth;
    cardGapRef.current = cardGap;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(PROJECT_GALLERY_FOV, width / height, 0.1, 100);
    const cameraBaseY = immersive ? 1.2 : 0;
    camera.position.set(0, cameraBaseY, initialLayout.cameraZ);
    camera.lookAt(0, immersive ? 0.35 : 0, 0);
    let cameraBaseRotationX = camera.rotation.x;

    let floorMesh: THREE.Mesh | null = null;
    let floorGeometry: THREE.PlaneGeometry | null = null;
    let floorMaterial: THREE.ShaderMaterial | null = null;
    if (immersive) {
      floorGeometry = new THREE.PlaneGeometry(180, 180, 1, 1);
      floorMaterial = new THREE.ShaderMaterial({
        vertexShader: GRID_VERTEX_SHADER,
        fragmentShader: GRID_FRAGMENT_SHADER,
        uniforms: {
          u_gridColor: { value: new THREE.Color(0.3, 0.34, 0.39) },
          u_opacity: { value: 0.27 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -1.65;
      scene.add(floorMesh);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    const pixelRatio = () => Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75);
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    let profileLensTarget: THREE.WebGLRenderTarget | null = null;
    let profileLensGeometry: THREE.PlaneGeometry | null = null;
    let profileLensMaterial: THREE.ShaderMaterial | null = null;
    let profileLensScene: THREE.Scene | null = null;
    let profileLensCamera: THREE.OrthographicCamera | null = null;
    if (immersive) {
      profileLensTarget = new THREE.WebGLRenderTarget(
        Math.max(1, Math.round(width * renderer.getPixelRatio())),
        Math.max(1, Math.round(height * renderer.getPixelRatio())),
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true },
      );
      profileLensGeometry = new THREE.PlaneGeometry(2, 2);
      profileLensMaterial = new THREE.ShaderMaterial({
        vertexShader: PROFILE_LENS_VERTEX_SHADER,
        fragmentShader: PROFILE_LENS_FRAGMENT_SHADER,
        uniforms: {
          u_scene: { value: profileLensTarget.texture },
          u_resolution: { value: new THREE.Vector2(width, height) },
          u_time: { value: 0 },
          u_open: { value: 0 },
        },
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      profileLensScene = new THREE.Scene();
      profileLensCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      profileLensCamera.position.z = 1;
      const profileLensPlane = new THREE.Mesh(profileLensGeometry, profileLensMaterial);
      profileLensPlane.frustumCulled = false;
      profileLensScene.add(profileLensPlane);
    }

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    // Scale a shared unit plane to the available viewport so the featured image
    // stays generous on desktop and doesn't spill off narrow phone screens.
    const geometry = new THREE.PlaneGeometry(1, 1, 36, 24);
    const meshes: THREE.Mesh[] = [];

    // Fallback texture generator (gradient canvas)
    const createFallbackTexture = (name: string, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 512, 320);
        grad.addColorStop(0, "#080b14");
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 320);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px monospace";
        ctx.fillText(name, 30, 160);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const count = filteredProjects.length;
    let disposed = false;

    filteredProjects.forEach((proj, idx) => {
      const fallback = createFallbackTexture(proj.name, idx % 2 === 0 ? "#112233" : "#1e1133");
      let material: THREE.ShaderMaterial | null = null;
      let mesh: THREE.Mesh | null = null;
      const texture = textureLoader.load(proj.img, (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        const finalTexture = immersive
          ? createLabeledProjectTexture(loadedTexture.image as CanvasImageSource & { width: number; height: number }, proj.name)
          : loadedTexture;
        if (immersive) loadedTexture.dispose();
        finalTexture.minFilter = THREE.LinearFilter;
        finalTexture.generateMipmaps = false;
        finalTexture.colorSpace = THREE.SRGBColorSpace;
        if (material) {
          material.uniforms.u_texture.value = finalTexture;
          const image = finalTexture.image as { width?: number; height?: number };
          material.uniforms.u_size.value.set(image.width || 16, image.height || 10);
          fallback.dispose();
          if (mesh) mesh.userData.textureFallback = undefined;
        }
      }, undefined, () => {
        texture.dispose();
      });
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          u_texture: { value: fallback },
          u_size: { value: new THREE.Vector2(512, 320) },
          u_res: { value: new THREE.Vector2(cardWidth, cardHeight) },
          u_hover: { value: 0 },
          u_dent: { value: 0.12 },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_sheetW: { value: (count * (cardWidth + cardGap)) * 0.4 },
          u_sheetD: { value: 0.28 },
          u_sheetP: { value: 1.0 },
          u_sheetT: { value: 0.85 },
          u_leanW: { value: Math.max(4.5, cardWidth * 1.3) },
          u_leanA: { value: 0.18 },
          u_bulgeA: { value: 0.0 },
          u_bulgeH: { value: Math.max(2.2, cardHeight * 1.1) },
          u_sheetV: { value: 0.0 },
          u_corner: { value: 0.045 },
          u_border: { value: 0.0025 },
          u_borderColor: { value: new THREE.Vector3(0.25, 0.32, 0.42) },
          u_alpha: { value: 1.0 },
          u_time: { value: 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(cardWidth, cardHeight, 1);
      mesh.userData = { projectIndex: idx, project: proj, textureFallback: fallback };
      scene.add(mesh);
      meshes.push(mesh);
    });

    cardMeshesRef.current = meshes;

    // Raycaster for hover & mouse position on cards
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2(-999, -999);

    // Event handlers for dragging and mouse movement
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let prevDragX = 0;
    let dragTime = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsGrabbing(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      dragStartX = clientX;
      prevDragX = clientX;
      dragStartOffset = targetOffsetRef.current;
      dragTime = performance.now();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();

      // Normalized coordinates
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

      mousePosRef.current = { x: clientX, y: clientY, ndcX, ndcY };
      mouseVector.set(ndcX, ndcY);

      if (isDragging) {
        const delta = (clientX - dragStartX) / rect.width * (cardWidth + cardGap) * 2.2;
        targetOffsetRef.current = dragStartOffset - delta;

        const now = performance.now();
        const dt = Math.max(now - dragTime, 16);
        const instantV = (prevDragX - clientX) / dt * 0.06;
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, instantV, 0.4);
        prevDragX = clientX;
        dragTime = now;
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsGrabbing(false);
      }
    };

    const onClick = () => {
      if (Math.abs(velocityRef.current) < 0.02 && hoveredIndexRef.current >= 0) {
        const proj = filteredProjects[hoveredIndexRef.current];
        if (proj) {
          setSelectedProject(proj);
        }
      }
    };

    container.style.touchAction = "pan-y";
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    container.addEventListener("click", onClick);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const progress = targetOffsetRef.current / Math.max(cardWidth + cardGap, 0.001);
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 650;
      const layout = getProjectCardMetrics(width, height, immersive);
      cardWidth = layout.cardWidth;
      cardHeight = layout.cardHeight;
      cardGap = layout.cardGap;
      cardWidthRef.current = cardWidth;
      cardGapRef.current = cardGap;
      camera.aspect = width / height;
      camera.position.z = layout.cameraZ;
      camera.position.y = cameraBaseY;
      camera.lookAt(0, immersive ? 0.35 : 0, 0);
      cameraBaseRotationX = camera.rotation.x;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(width, height);
      profileLensTarget?.setSize(
        Math.max(1, Math.round(width * renderer.getPixelRatio())),
        Math.max(1, Math.round(height * renderer.getPixelRatio())),
      );
      profileLensMaterial?.uniforms.u_resolution.value.set(width, height);
      scrollOffsetRef.current = progress * (cardWidth + cardGap);
      targetOffsetRef.current = scrollOffsetRef.current;
      meshes.forEach(mesh => {
        mesh.scale.set(cardWidth, cardHeight, 1);
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.u_res.value.set(cardWidth, cardHeight);
        mat.uniforms.u_sheetW.value = count * (cardWidth + cardGap) * 0.4;
        mat.uniforms.u_leanW.value = Math.max(4.5, cardWidth * 1.3);
        mat.uniforms.u_bulgeH.value = Math.max(2.2, cardHeight * 1.1);
      });
    };
    window.addEventListener("resize", onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    const timer = new THREE.Timer();
    timer.connect(document);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isPageVisible = !document.hidden;
    let lastActiveIndex = -1;
    let profileProgress = 0;

    const animate = () => {
      if (!isPageVisible) return;
      timer.update();
      const elapsed = prefersReducedMotion ? 0 : timer.getElapsed();
      profileProgress = THREE.MathUtils.lerp(profileProgress, profileOpenRef.current ? 1 : 0, prefersReducedMotion ? 1 : 0.09);

      // Inertia & Damping
      const maxScroll = Math.max(0, (count - 1) * (cardWidth + cardGap));
      targetOffsetRef.current = THREE.MathUtils.clamp(targetOffsetRef.current, -0.6, maxScroll + 0.6);

      scrollOffsetRef.current = THREE.MathUtils.lerp(scrollOffsetRef.current, targetOffsetRef.current, 0.1);
      const diff = targetOffsetRef.current - scrollOffsetRef.current;
      velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, diff * 1.8, 0.2);

      // Camera Parallax & Subtle 3D Tilt from mouse movement
      const targetCamX = mousePosRef.current.ndcX * 0.28;
      const targetCamY = cameraBaseY + mousePosRef.current.ndcY * 0.18;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mousePosRef.current.ndcX * 0.045, 0.06);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, cameraBaseRotationX + mousePosRef.current.ndcY * 0.035, 0.06);

      // Raycast to find hovered card
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(meshes);

      let foundIndex = -1;
      let hitUv = new THREE.Vector2(0.5, 0.5);

      if (intersects.length > 0 && intersects[0].object) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        foundIndex = hitMesh.userData.projectIndex;
        if (intersects[0].uv) {
          hitUv.copy(intersects[0].uv);
        }
      }
      hoveredIndexRef.current = foundIndex;

      // Update active center index for HUD indicator
      const centerIndex = THREE.MathUtils.clamp(
        Math.round(scrollOffsetRef.current / (cardWidth + cardGap)),
        0,
        count - 1
      );
      if (centerIndex !== lastActiveIndex) {
        lastActiveIndex = centerIndex;
        setActiveIndex(centerIndex);
      }

      // Update each card mesh position and shader uniforms
      meshes.forEach((mesh, idx) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        const stripX = (idx * (cardWidth + cardGap)) - scrollOffsetRef.current;
        const spread = immersive ? Math.sign(stripX || 1) * profileProgress * cardWidth * 0.86 : 0;
        const baseX = stripX + spread;
        mesh.position.x = baseX - (immersive ? cardWidth * 0.16 : 0);
        mesh.position.y = 0;

        // Hover uniform interpolation
        const isHovered = idx === foundIndex;
        const targetHover = isHovered ? 1.0 : 0.0;
        mat.uniforms.u_hover.value = THREE.MathUtils.lerp(mat.uniforms.u_hover.value, targetHover, 0.12);

        // Wrap the strip around a shallow cylinder so the cards form a film roll.
        // Each side turns toward the viewer's center and eases back on hover.
        const hoverAmount = mat.uniforms.u_hover.value as number;
        const curveAngle = immersive ? Math.atan(baseX / Math.max(cardWidth * 2.1, 0.001)) : 0;
        const targetYaw = -curveAngle * (1 - hoverAmount * 0.18);
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetYaw, 0.12);
        mesh.position.z = immersive
          ? -0.42 * (1 - Math.cos(curveAngle)) + hoverAmount * 0.12
          : 0;
        const targetScale = 1 + hoverAmount * (immersive ? 0.055 : 0.025);
        mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, cardWidth * targetScale, 0.12);
        mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, cardHeight * targetScale, 0.12);

        if (isHovered) {
          mat.uniforms.u_mouse.value.lerp(hitUv, 0.2);
        }

        // Pass velocity & time
        mat.uniforms.u_sheetV.value = velocityRef.current;
        mat.uniforms.u_time.value = elapsed;
      });

      if (profileLensTarget && profileLensScene && profileLensCamera && profileLensMaterial && profileProgress > 0.001) {
        profileLensMaterial.uniforms.u_open.value = profileProgress;
        profileLensMaterial.uniforms.u_time.value = elapsed;
        renderer.setRenderTarget(profileLensTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(profileLensScene, profileLensCamera);
      } else {
        renderer.render(scene, camera);
      }
      if (!prefersReducedMotion) animId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) animate();
      else cancelAnimationFrame(animId);
    };

    if (isPageVisible) animate();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      timer.dispose();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      container.removeEventListener("click", onClick);
      geometry.dispose();
      meshes.forEach(m => {
        const material = m.material as THREE.ShaderMaterial;
        (material.uniforms.u_texture.value as THREE.Texture).dispose();
        (m.userData.textureFallback as THREE.Texture | undefined)?.dispose();
        material.dispose();
      });
      floorGeometry?.dispose();
      floorMaterial?.dispose();
      profileLensTarget?.dispose();
      profileLensGeometry?.dispose();
      profileLensMaterial?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [filteredProjects, viewMode, handleWheel, immersive]);

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0];

  if (immersive) {
    return (
      <section aria-label="Project showcase" className="showcase-immersive absolute inset-0 overflow-hidden bg-[#050608] text-white">
        {viewMode === "strip" && (
          <>
            <div
              ref={mountRef}
              className={`absolute inset-0 h-full w-full ${isGrabbing ? "cursor-grabbing" : "cursor-grab"} touch-pan-y`}
              style={{ touchAction: "pan-y" }}
              aria-label="Interactive 3D project carousel. Drag or swipe horizontally to browse projects."
              role="region"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") { event.preventDefault(); moveStrip(-1); }
                if (event.key === "ArrowRight") { event.preventDefault(); moveStrip(1); }
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-[3.25rem] z-20 hidden text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:block">
              Drag to browse · select a card to explore
            </div>
          </>
        )}

        {viewMode === "index" && (
          <div className="showcase-full-index absolute inset-x-0 bottom-[3.6rem] top-[4.5rem] z-30 overflow-y-auto overscroll-auto bg-black px-5 py-8 sm:px-10 lg:px-14">
            <div className="mx-auto flex min-h-full max-w-5xl flex-wrap content-center items-center justify-center gap-x-3 gap-y-2 text-center">
              {filteredProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <button type="button" onClick={() => setSelectedProject(project)} className="showcase-index-project text-[clamp(1.15rem,3.6vw,3rem)] font-normal tracking-[-0.055em] text-white/85 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                    {project.name}
                  </button>
                  {index < filteredProjects.length - 1 && <span aria-hidden="true" className="text-[clamp(0.9rem,2.6vw,2rem)] text-white/30">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <nav className="showcase-replica-footer absolute inset-x-0 bottom-2 z-40 flex items-center justify-between gap-3 px-4 font-mono text-[9px] uppercase tracking-[0.16em] sm:px-8 sm:text-[10px] lg:px-12" aria-label="Showcase navigation">
          <div className="flex items-center gap-3 sm:gap-5">
            <button type="button" onClick={() => { setActiveFilter("featured"); setViewMode("strip"); targetOffsetRef.current = 0; scrollOffsetRef.current = 0; setActiveIndex(0); }} aria-current={viewMode === "strip" ? "page" : undefined} className={`transition hover:text-white ${viewMode === "strip" ? "text-white" : "text-white/45"}`}>Featured</button>
            <button type="button" onClick={() => { setActiveFilter("all"); setViewMode("index"); }} aria-current={viewMode === "index" ? "page" : undefined} className={`transition hover:text-white ${viewMode === "index" ? "text-white" : "text-white/45"}`}>Full</button>
          </div>
          <a className="transition hover:text-cyan-200" href={`mailto:${profileData.basics.email}?subject=${encodeURIComponent("Portfolio enquiry")}`}>Contact <ArrowUpRight size={11} className="ml-1 inline" /></a>
        </nav>

        <PageInsidePageModal project={selectedProject} onClose={() => setSelectedProject(null)} immersive onOpenAnatomy={onOpenAnatomy} />
      </section>
    );
  }

  return (
    <section className="relative w-full bg-transparent text-white overflow-hidden">
      {/* ── TOP HUD HEADER (Jesper Landberg Minimalist Swedish Aesthetic) ── */}
      <div className="relative z-30 pt-[clamp(4rem,10vw,8rem)] pb-8 px-5 sm:px-12 max-w-[1900px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-7 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>01 // CURRENT PROJECTS</span>
          </div>
          <h2 className="text-[clamp(2.25rem,6vw,5.75rem)] leading-[0.92] font-display font-medium tracking-[-0.06em] text-white mt-4">
            Selected work <span className="text-white/40">& projects</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            A living index of the systems, interfaces, and experiments I am building now.
          </p>
        </div>

        {/* Top Controls: Filter Toggles & View Mode */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-4 text-xs font-mono sm:gap-6 md:w-auto">
          <div
            aria-label="Filter projects by category"
            className="no-scrollbar flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1"
          >
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                aria-pressed={activeFilter === cat.id}
                onClick={() => {
                  setActiveFilter(cat.id);
                  targetOffsetRef.current = 0;
                  scrollOffsetRef.current = 0;
                  setActiveIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
                  activeFilter === cat.id
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-1 border-l border-white/15 pl-4">
            <button
              type="button"
              onClick={() => setViewMode("strip")}
              aria-pressed={viewMode === "strip"}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "strip" ? "text-cyan-300 underline" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Ribbon Wave
            </button>
            <span className="text-zinc-700">/</span>
            <button
              type="button"
              onClick={() => setViewMode("index")}
              aria-pressed={viewMode === "index"}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "index" ? "text-cyan-300 underline" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Full Index
            </button>
          </div>
        </div>
      </div>

      {/* ── MODE 1: 3D WEBGL RIBBON WAVE VIEWPORT ── */}
      {viewMode === "strip" && (
        <div className="relative h-[clamp(520px,80svh,900px)] min-h-[520px] w-full overflow-hidden">
          {/* Three.js Canvas Container */}
          <div
            ref={mountRef}
            className={`w-full h-full ${isGrabbing ? "cursor-grabbing" : "cursor-grab"} touch-none`}
          />

          {/* Floating Minimal Card Metadata (Anchored in bottom center) */}
          {activeProject && (
            <div className="pointer-events-none absolute bottom-8 inset-x-4 z-30 mx-auto flex max-w-[1700px] flex-col gap-3 sm:inset-x-8 sm:flex-row sm:items-end sm:justify-between lg:inset-x-12">
              <div className="pointer-events-auto w-full max-w-3xl space-y-1 rounded-2xl border border-white/10 bg-black/65 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-7">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">
                  <span>{activeProject.badge}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{activeProject.subtitle}</span>
                </div>
                <h3 className="text-[clamp(1.5rem,3.6vw,3.1rem)] leading-[0.98] font-display font-medium tracking-[-0.05em] text-white">
                  {activeProject.name}
                </h3>
                <p className="text-sm text-zinc-300 font-sans line-clamp-2 pt-1 sm:text-base">
                  {activeProject.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeProject.skills.slice(0, 5).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows & Inspect Trigger */}
              <div className="pointer-events-auto flex items-center gap-2 self-end sm:gap-3 sm:self-auto">
                <button
                  onClick={() => moveStrip(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-xl transition-all hover:bg-white hover:text-black sm:h-11 sm:w-11"
                  title="Previous project"
                  aria-label="Previous project"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={() => moveStrip(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-xl transition-all hover:bg-white hover:text-black sm:h-11 sm:w-11"
                  title="Next project"
                  aria-label="Next project"
                >
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setSelectedProject(activeProject)}
                  className="flex h-10 items-center gap-2 rounded-full bg-cyan-400 px-4 font-mono text-[11px] font-bold tracking-wide text-black shadow-lg shadow-cyan-400/20 transition-all hover:bg-cyan-300 sm:h-11 sm:px-5 sm:text-xs sm:tracking-wider"
                >
                  <span>Inspect Spec</span>
                  <ArrowUpRight size={15} />
                </button>

                {activeProject.id === "zcard-hardware" && onOpenAnatomy && (
                  <button
                    onClick={onOpenAnatomy}
                    className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 font-mono text-[11px] font-bold tracking-wide text-black shadow-lg shadow-cyan-400/25 transition-all hover:brightness-110 sm:h-11 sm:px-5 sm:text-xs"
                  >
                    <span>🔬 3D Anatomy Dissection</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom HUD Bar: Counter & Instruction */}
          <div className="pointer-events-none absolute top-6 right-6 sm:right-12 z-20 font-mono text-xs text-white/50 flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-white/30"> / {String(filteredProjects.length).padStart(2, "0")}</span>
            </span>
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2 py-1.5 backdrop-blur-md" role="group" aria-label="Jump to project">
              {filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    targetOffsetRef.current = index * (cardWidthRef.current + cardGapRef.current);
                  }}
                  aria-label={`Show project ${index + 1}: ${project.name}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                >
                  <span className={`h-1 rounded-full transition-all duration-300 ${activeIndex === index ? "w-5 bg-cyan-300" : "w-1.5 bg-white/35 hover:bg-white/70"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:block">
            DRAG MOUSE OR SWIPE TO EXPLORE 3D WAVE
          </div>
        </div>
      )}

      {/* ── MODE 2: FULL ARCHIVE INDEX TABLE (Jesper Landberg /full route style) ── */}
      {viewMode === "index" && (
        <div className="py-16 px-6 sm:px-12 max-w-[1700px] mx-auto animate-fadeIn">
          <div className="border-t border-white/15">
            {filteredProjects.map((p, index) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedProject(p)}
                aria-label={`Open ${p.name} project details`}
                className="group grid w-full grid-cols-1 items-center gap-4 rounded-xl border-b border-white/10 px-4 py-6 text-left transition-all hover:border-cyan-400/50 hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 md:grid-cols-[4rem_1fr_1.5fr_auto]"
              >
                <span className="font-mono text-xs text-zinc-500 group-hover:text-cyan-300 transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-xl font-display font-medium text-white group-hover:text-cyan-200 transition-colors">
                    {p.name}
                  </h4>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{p.category}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans line-clamp-2 md:line-clamp-1">
                  {p.description}
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <div className="hidden lg:flex flex-wrap gap-1">
                    {p.skills.slice(0, 3).map(sk => (
                      <span key={sk} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {sk}
                      </span>
                    ))}
                  </div>
                  <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── "PAGE INSIDE A PAGE" EMBEDDED PROJECT VIEWPORT (Jesper Landberg style) ── */}
      <PageInsidePageModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenAnatomy={onOpenAnatomy}
      />
    </section>
  );
};
