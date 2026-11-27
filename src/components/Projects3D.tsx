import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { PageInsidePageModal } from "./PageInsidePageModal";
import { SHOWCASE_PROJECTS, type ShowcaseProject } from "../data/showcaseProjects";
import { createShowcaseCardPainter, type DynamicCardPainter } from "./ShowcaseCardPainter";
import profileData from "../data/profile.json";

// ─────────────────────────────────────────────────────────────────────────────
// GLSL SHADERS (Jesper Landberg WebGL Showcase Architecture)
// Features: Cylindrical ring arc curvature, local dome depression on hover,
// velocity wave banking, crystal specular sheen, cursor gradient spotlight,
// SDF rounded corners, and matte blush backface.
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
uniform float u_ringRadius;
uniform float u_immersive;
uniform float u_time;

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

// Organic dome indentation: 1 at the centre and 0 at every edge
float sheetDome(vec2 uv) {
  vec2 q = uv * 2.0 - 1.0;
  return clamp((1.0 - q.x * q.x) * (1.0 - q.y * q.y), 0.0, 1.0);
}

void main() {
  vUv = uv;
  vec3 p = position;

  if (u_immersive > 0.5) {
    // True circular cylindrical arc curvature along local X so every card
    // hugs the continuous reel-strip cylinder wall cleanly.
    float cardHalfW = max(u_res.x * 0.5, 0.1);
    float arcX = p.x * u_res.x;
    float r = max(u_ringRadius, cardHalfW * 1.15);
    float chordZ = r - sqrt(max(0.02, r * r - arcX * arcX));
    p.z += chordZ * 0.96;

    // Velocity-based silk reel banking while scrolling/dragging rapidly
    float vClamp = clamp(u_sheetV * 0.42, -1.0, 1.0);
    p.z += sin((uv.x * 3.14159) + u_sheetV * 0.45) * vClamp * 0.11;
    p.y += (uv.x - 0.5) * vClamp * 0.075;

    // Swollen mouse hover animation: convex +Z cushion inflation & cursor-tracking pillow bulge
    if (u_hover > 0.0001) {
      vec2 domeCoords = uv * 2.0 - 1.0;
      float dome = clamp((1.0 - domeCoords.x * domeCoords.x * 0.92) * (1.0 - domeCoords.y * domeCoords.y * 0.92), 0.0, 1.0);
      vec2 aspectUv = (uv - u_mouse) * vec2(u_res.x / max(u_res.y, 0.001), 1.0);
      float distCursor = length(aspectUv);
      float cursorSwell = exp(-distCursor * distCursor * 3.8);
      float liquidRipple = sin(distCursor * 11.0 - u_time * 4.8) * exp(-distCursor * 4.2) * 0.024;
      float totalSwell = (0.14 * dome + 0.30 * cursorSwell * (0.25 + 0.75 * dome) + liquidRipple) * u_hover;
      p.z += totalSwell;
      // Subtle radial XY expansion around cursor so edges visibly swell out
      p.xy += normalize(uv - u_mouse + vec2(0.00001)) * cursorSwell * 0.018 * dome * u_hover;
    }

    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorldPos = w.xyz;
    vMouseUv = u_mouse;
    gl_Position = projectionMatrix * viewMatrix * w;
    return;
  }

  // Non-immersive ribbon wave (PortfolioPage horizontal strip)
  if (u_hover > 0.0001) {
    p.z -= u_hover * u_dent * u_res.y * sheetDome(uv);
  }

  vec4 w = modelMatrix * vec4(p, 1.0);

  if (u_sheetW > 0.001 && u_sheetP > 0.001 && u_sheetD > 0.001) {
    w.z += sheetZ(w.x) * u_sheetP;
  }

  if (u_leanW > 0.001) {
    w.z += u_leanA * leanRamp(w.x / u_leanW) * u_sheetP;
  }

  w.y += w.x * SHEET_DIAG * u_sheetP;

  if (abs(u_sheetV) > 0.0001) {
    float vFactor = clamp(u_sheetV * 0.02, -1.0, 1.0);
    w.y += abs(vFactor) * SHEET_REAR_Y * u_sheetW * (1.0 - smoothstep(0.0, u_sheetW * 0.9, abs(w.x)));
    w.z += vFactor * SHEET_REAR_Z * u_sheetW;
  }

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
uniform float u_immersive;

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

float roundedBox(vec2 p, vec2 mid, float r) {
  vec2 q = abs(p - mid) - (mid - r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

const vec3 LIGHT_DIR = normalize(vec3(-0.32, 0.52, 0.92));

void main() {
  vec2 sz = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
  vec2 mid = sz * 0.5;
  float r = min(u_corner, min(mid.x, mid.y));

  float d = roundedBox(vUv * sz, mid, r);
  float aa = max(fwidth(d), 0.0008);
  float shapeAlpha = 1.0 - smoothstep(-aa, aa, d);

  if (shapeAlpha < 0.001) discard;

  vec2 sizeInHeightUnits = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
  vec2 cursorDelta = (vUv - u_mouse) * sizeInHeightUnits;
  float cursorDistance = length(cursorDelta);

  // Soft blush/pearl matte back-face when spinning past 90 degrees (matches video 00:28)
  if (!gl_FrontFacing && u_immersive > 0.5) {
    vec2 mirroredUv = vec2(1.0 - vUv.x, vUv.y);
    vec4 ghostTex = texture2D(u_texture, uvCover(u_res, u_size, mirroredUv));
    float grad = smoothstep(0.0, 1.0, vUv.y * 0.7 + vUv.x * 0.3);
    vec3 backBase = mix(vec3(0.76, 0.61, 0.64), vec3(0.89, 0.78, 0.8), grad);
    vec3 backCol = mix(backBase, ghostTex.rgb * 0.88, 0.16);
    float edgeDark = smoothstep(0.8, 0.08, length(vUv - 0.5));
    backCol = mix(backCol * 0.78, backCol, edgeDark);
    if (u_border > 0.0001) {
      float borderMask = smoothstep(-u_border - aa, -u_border + aa, d);
      backCol = mix(backCol, vec3(0.95, 0.9, 0.92), borderMask * 0.55);
    }
    gl_FragColor = vec4(backCol, shapeAlpha * u_alpha);
    return;
  }

  vec2 coverUv = uvCover(u_res, u_size, vUv);
  if (u_hover > 0.001) {
    // Swollen lens magnification directly under cursor mound + subtle ripple
    float cursorSwellMask = exp(-cursorDistance * cursorDistance * 3.6) * u_hover;
    float rippleRadius = mod(u_time * 0.65, 1.35);
    float ripple = exp(-pow((cursorDistance - rippleRadius) / 0.045, 2.0)) * u_hover;
    vec2 radialDir = normalize(vUv - u_mouse + vec2(0.00001));
    coverUv -= radialDir * (cursorSwellMask * 0.028 * cursorDistance - ripple * 0.006);
  }
  vec4 tex = texture2D(u_texture, clamp(coverUv, 0.001, 0.999));

  vec3 normal = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 viewDir = normalize(-vWorldPos);

  float diff = dot(normal, LIGHT_DIR) * 0.5 + 0.5;
  vec3 col = tex.rgb * (1.0 - 0.14 * (1.0 - diff));

  vec3 halfVector = normalize(LIGHT_DIR + viewDir);
  float spec = pow(max(dot(normal, halfVector), 0.0), 34.0);
  float cursorGlow = exp(-cursorDistance * 3.1) * u_hover;

  if (u_immersive > 0.5) {
    // Glossy specular highlight over the swollen mound + soft cushion sheen
    col += (spec * 0.34 + cursorGlow * 0.14) * vec3(1.0, 0.985, 0.975);
  } else {
    col += (spec * 0.38 + cursorGlow * 0.25) * vec3(0.92, 0.96, 1.0);
  }

  float vignette = smoothstep(0.75, 0.06, length(vUv - 0.5));
  col = mix(col * 0.9, col, vignette);

  if (u_border > 0.0001) {
    float borderMask = smoothstep(-u_border - aa, -u_border + aa, d);
    vec3 neutralBorder = mix(u_borderColor, vec3(0.96, 0.96, 0.98), u_hover * 0.68);
    col = mix(col, neutralBorder + cursorGlow * 0.18, borderMask);
  }

  gl_FragColor = vec4(col, shapeAlpha * u_alpha);
}
`;

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
uniform vec2 u_mouseFloor;

void main() {
  vec2 coord = vWorldPosition.xz * 0.52;
  vec2 derivative = max(fwidth(coord), vec2(0.001));
  vec2 lines = abs(fract(coord - 0.5) - 0.5) / derivative;
  float grid = 1.0 - min(min(lines.x, lines.y), 1.0);

  // Smooth atmospheric horizon + near fade centered beneath the ring
  float ringDist = length(vWorldPosition.xz - vec2(0.0, -2.8));
  float horizonFade = 1.0 - smoothstep(3.5, 22.0, ringDist);
  float cursorHighlight = exp(-length(vWorldPosition.xz - u_mouseFloor) * 0.28) * 0.35;
  float alpha = grid * horizonFade * (u_opacity + cursorHighlight);

  if (alpha < 0.004) discard;
  gl_FragColor = vec4(u_gridColor + cursorHighlight * 0.25, alpha);
}
`;

const PROFILE_LENS_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Refractive Crystal Torus Ring + Raymarched Glossy Black Ferrofluid Droplets inside orb
const PROFILE_LENS_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_open;
uniform vec4 u_blobs[6]; // xy = pos inside orb aspect coords, z = radius, w = phase
uniform vec2 u_mouseOrb;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / max(k, 0.0001), 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float blobField(vec2 q, float openAmt, float t) {
  float d = 10.0;
  for (int i = 0; i < 6; i++) {
    vec2 bPos = u_blobs[i].xy * openAmt;
    float bRad = u_blobs[i].z * openAmt;
    float ang = atan(q.y - bPos.y, q.x - bPos.x);
    float wobble = 1.0 + 0.05 * sin(ang * 3.0 + t * 1.6 + u_blobs[i].w) + 0.025 * cos(ang * 5.0 - t * 2.1);
    float sd = length(q - bPos) - bRad * wobble;
    d = smin(d, sd, 0.042 * openAmt);
  }
  return d;
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float portraitLayout = 1.0 - smoothstep(0.78, 1.12, aspect);
  vec2 lensCenter = vec2(0.5, mix(0.5, 0.56, portraitLayout));
  vec2 p = (vUv - lensCenter) * vec2(aspect, 1.0);
  float distanceFromCenter = length(p);
  float angle = atan(p.y, p.x);

  // Pure circular Schwarzschild black hole shadow scaled for phones, tablets, and ultrawides
  float portraitRadius = min(0.50, aspect * 0.59);
  float landscapeRadius = min(0.51, aspect * 0.465);
  float baseRadius = mix(landscapeRadius, portraitRadius, portraitLayout) * mix(0.24, 1.0, u_open);
  float lensRadius = baseRadius;

  float lensPosition = distanceFromCenter / max(lensRadius, 0.001);
  float rShadow = mix(0.785, 0.835, portraitLayout);
  float dEdge = max(0.001, lensPosition - rShadow);

  // Schwarzschild 1/(r - r_s) photon deflection & gravitational light-sucking warp
  float deflect = (0.044 / (dEdge + 0.042)) * exp(-dEdge * 2.1) * u_open;
  float photonRing = exp(-pow((lensPosition - (rShadow + 0.005)) / 0.0055, 2.0));
  float outerHalo = exp(-dEdge * 8.2) * step(rShadow - 0.002, lensPosition);
  float rimMask = exp(-pow((lensPosition - (rShadow + 0.05)) / 0.068, 2.0));

  vec2 radial = normalize(p + vec2(0.00001));
  vec2 tangent = vec2(-radial.y, radial.x);
  vec2 radialUv = radial / vec2(aspect, 1.0);

  // Gravitational Einstein ring bending + subtle relativistic frame-dragging swirl
  vec2 bentP = p * (1.0 + deflect * 0.55)
    - radial * (deflect * 0.24)
    + tangent * (deflect * 0.22);
  vec2 sampleUv = clamp(lensCenter + bentP / vec2(aspect, 1.0), 0.001, 0.999);

  // Chromatic dispersion splitting RGB light along the gravitational lensing rim
  float fringe = (rimMask * 0.022 + deflect * 0.048) * u_open;
  float red = texture2D(u_scene, clamp(sampleUv + radialUv * fringe, 0.001, 0.999)).r;
  float green = texture2D(u_scene, sampleUv).g;
  float blue = texture2D(u_scene, clamp(sampleUv - radialUv * fringe, 0.001, 0.999)).b;
  vec3 color = vec3(red, green, blue);

  // Razor-sharp circular blackhole event horizon shadow (100% opaque void once open)
  float shadowMask = smoothstep(rShadow - 0.004, rShadow + 0.003, lensPosition);
  float horizonStrength = smoothstep(0.0, 0.55, u_open);
  color *= mix(1.0, shadowMask, horizonStrength);

  // Dark obsidian shadow band hugging the outside of the event horizon
  float horizonShadow = exp(-pow((lensPosition - (rShadow + 0.021)) / 0.030, 2.0)) * 0.86 * u_open;
  color *= 1.0 - horizonShadow;

  // Relativistic Doppler beaming (approaching blue/cyan-white vs receding warm amber/crimson) + rainbow fade
  float doppler = 0.55 + 0.45 * cos(angle + 0.65 + u_mouseOrb.x * 0.25);
  vec3 rainbow = 0.5 + 0.5 * cos(angle * 1.0 - u_time * 0.38 + lensPosition * 11.0 + vec3(0.0, 2.094, 4.188));
  vec3 einsteinGlow = mix(vec3(1.0, 0.55, 0.25), vec3(0.68, 0.88, 1.0), doppler);
  color += mix(rainbow, einsteinGlow, 0.35) * (photonRing * 0.72 + outerHalo * 0.22) * (0.45 + 0.55 * doppler) * u_open;
  color += vec3(0.96, 0.98, 1.0) * exp(-pow((lensPosition - (rShadow + 0.003)) / 0.004, 2.0)) * (0.35 + 0.55 * doppler) * u_open;

  // Subtle glossy black ferrofluid droplets deep inside the event horizon (fast forward-diff normal)
  if (lensPosition < 0.74 && u_open > 0.08) {
    float bd = blobField(p, u_open, u_time);
    float blobMask = (1.0 - smoothstep(-0.0025, 0.0035, bd)) * (1.0 - smoothstep(0.62, 0.73, lensPosition)) * u_open;
    if (blobMask > 0.004) {
      float e = 0.0024;
      float gx = blobField(p + vec2(e, 0.0), u_open, u_time) - bd;
      float gy = blobField(p + vec2(0.0, e), u_open, u_time) - bd;
      vec2 grad = vec2(gx, gy) / e;
      float heightFactor = clamp(-bd * 20.0, 0.0, 1.0);
      vec3 N = normalize(vec3(grad.x * (1.35 - 0.8 * heightFactor), grad.y * (1.35 - 0.8 * heightFactor), 0.28 + heightFactor * 0.95));

      vec3 V = vec3(0.0, 0.0, 1.0);
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);
      vec3 keyL = normalize(vec3(-0.55 + u_mouseOrb.x * 0.35, 0.65 + u_mouseOrb.y * 0.25, 0.62));
      float spec1 = pow(max(dot(reflect(-V, N), keyL), 0.0), 42.0);

      vec3 dropletColor = vec3(0.005, 0.005, 0.007);
      dropletColor += fresnel * vec3(0.55, 0.54, 0.58) * 0.55;
      dropletColor += smoothstep(0.18, 0.85, spec1) * vec3(0.95, 0.96, 1.0) * 0.72;
      color = mix(color, dropletColor, blobMask);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

export type ProjectItem = ShowcaseProject;

const PROJECT_GALLERY_FOV = 46;

function getProjectCardMetrics(width: number, height: number, immersive = false) {
  const safeHeight = Math.max(height, 1);
  const aspect = width / safeHeight;
  const isShortLandscape = safeHeight < 520 && aspect >= 1.35;
  const isUltrawide = aspect > 1.95 || width >= 1920;

  const cameraZ = immersive
    ? (isShortLandscape ? 4.35 : width < 480 ? 5.45 : width < 768 ? 4.65 : isUltrawide ? 3.85 : 3.92)
    : (width < 480 ? 6.15 : width < 768 ? 5.75 : 4.95);
  const visibleHeight = 2 * cameraZ * Math.tan((PROJECT_GALLERY_FOV * Math.PI) / 360);
  const visibleWidth = visibleHeight * aspect;
  const cardAspect = immersive
    ? (aspect < 0.72 ? 1.46 : aspect < 1.15 ? 1.54 : 1.72)
    : (aspect < 0.72 ? 1.32 : aspect < 1.15 ? 1.38 : 1.55);
  const widthRatio = immersive
    ? (aspect < 0.72 ? 0.90 : aspect < 1.15 ? 0.72 : isUltrawide ? 0.44 : 0.56)
    : (aspect < 0.72 ? 0.9 : aspect < 1.15 ? 0.82 : 0.72);
  const heightRatio = immersive
    ? (isShortLandscape ? 0.52 : aspect < 0.72 ? 0.46 : aspect < 1.15 ? 0.46 : 0.46)
    : (aspect < 0.72 ? 0.7 : aspect < 1.15 ? 0.74 : 0.75);
  const cardWidth = Math.min(visibleWidth * widthRatio, visibleHeight * heightRatio * cardAspect);

  return {
    cameraZ,
    cardWidth,
    cardHeight: cardWidth / cardAspect,
    cardGap: Math.max(0.08, cardWidth * (immersive ? 0.048 : 0.11)),
  };
}

interface Projects3DProps {
  immersive?: boolean;
  profileOpen?: boolean;
  onOpenNewsletter?: () => void;
  onOpenAnatomy?: () => void;
  onHoverCardChange?: (name: string | null, dragging: boolean) => void;
}

export const Projects3D: React.FC<Projects3DProps> = ({
  immersive = false,
  profileOpen = false,
  onOpenNewsletter,
  onOpenAnatomy,
  onHoverCardChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const profileOpenRef = useRef(profileOpen);
  const hoverChangeRef = useRef(onHoverCardChange);

  useEffect(() => {
    hoverChangeRef.current = onHoverCardChange;
  }, [onHoverCardChange]);

  const [activeFilter, setActiveFilter] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"strip" | "index">("strip");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [hoveredIndexItem, setHoveredIndexItem] = useState<ProjectItem | null>(null);
  const [indexCursorPos, setIndexCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation refs
  const scrollOffsetRef = useRef<number>(0);
  const targetOffsetRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; ndcX: number; ndcY: number }>({ x: 0, y: 0, ndcX: 0, ndcY: 0 });
  const hoveredIndexRef = useRef<number>(-1);
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);
  const cardWidthRef = useRef<number>(3.3);
  const cardGapRef = useRef<number>(0.3);

  const filterCategories = useMemo(
    () => [
      { id: "featured", label: "Featured" },
      { id: "all", label: "All Works" },
      { id: "web", label: "Web Projects", match: ["Web Development"] },
      { id: "systems", label: "Linux & IT Support", match: ["Linux & IT Support"] },
      { id: "engineering", label: "ECE & Embedded", match: ["Automotive & Embedded", "Hardware & VLSI", "Creative & Audio"] },
    ],
    [],
  );

  const filteredProjects = useMemo(() => {
    if (activeFilter === "featured") return immersive ? SHOWCASE_PROJECTS : SHOWCASE_PROJECTS.slice(0, 4);
    if (activeFilter === "all") return SHOWCASE_PROJECTS;
    const cat = filterCategories.find((c) => c.id === activeFilter);
    return SHOWCASE_PROJECTS.filter((p) => cat?.match?.includes(p.category));
  }, [activeFilter, filterCategories, immersive]);

  useEffect(() => {
    profileOpenRef.current = profileOpen;
  }, [profileOpen]);

  // Wheel scrolling: in immersive mode, BOTH vertical wheel & horizontal swipe spin the infinite ring
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (immersive) {
        if (profileOpenRef.current) return;
        const primaryDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (primaryDelta === 0) return;
        e.preventDefault();
        setHasInteracted(true);
        const angleImpulse = primaryDelta * 0.0022;
        targetOffsetRef.current += angleImpulse;
        return;
      }

      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const wheelDelta = e.deltaX;
      if (wheelDelta === 0) return;

      const step = cardWidthRef.current + cardGapRef.current;
      const maxScroll = Math.max(0, (filteredProjects.length - 1) * step);
      const currentOffset = targetOffsetRef.current;
      const canMove = wheelDelta > 0 ? currentOffset < maxScroll - 0.08 : currentOffset > 0.08;
      if (!canMove) return;

      e.preventDefault();
      targetOffsetRef.current += wheelDelta * cardWidthRef.current * 0.0012;
    },
    [filteredProjects.length, immersive],
  );

  const moveStrip = (direction: -1 | 1) => {
    setHasInteracted(true);
    if (immersive) {
      const stepAngle = (Math.PI * 2) / Math.max(1, filteredProjects.length);
      targetOffsetRef.current += direction * stepAngle;
      return;
    }
    const step = cardWidthRef.current + cardGapRef.current;
    targetOffsetRef.current += direction * step;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container || viewMode !== "strip") return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 650;
    const count = Math.max(1, filteredProjects.length);
    const angleStep = (Math.PI * 2) / count;

    const initialLayout = getProjectCardMetrics(width, height, immersive);
    let cardWidth = initialLayout.cardWidth;
    let cardHeight = initialLayout.cardHeight;
    let cardGap = initialLayout.cardGap;
    cardWidthRef.current = cardWidth;
    cardGapRef.current = cardGap;

    const getRingRadius = (cw: number, cg: number) =>
      Math.max(2.35, (count * (cw + cg)) / (Math.PI * 2));

    let ringRadius = getRingRadius(cardWidth, cardGap);
    let ringCenterY = immersive ? 0.08 : 0;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(PROJECT_GALLERY_FOV, width / height, 0.15, 100);
    const computeCameraZ = (camZ: number, r: number) => (immersive ? camZ - r : camZ);
    const cameraBaseY = immersive ? 0.36 : 0;
    camera.position.set(0, cameraBaseY, computeCameraZ(initialLayout.cameraZ, ringRadius));
    camera.lookAt(0, immersive ? 0.04 : 0, immersive ? -ringRadius : 0);
    let cameraBaseRotationX = camera.rotation.x;

    // Perspective wireframe grid floor
    let floorMesh: THREE.Mesh | null = null;
    let floorGeometry: THREE.PlaneGeometry | null = null;
    let floorMaterial: THREE.ShaderMaterial | null = null;
    if (immersive) {
      floorGeometry = new THREE.PlaneGeometry(160, 160, 1, 1);
      floorMaterial = new THREE.ShaderMaterial({
        vertexShader: GRID_VERTEX_SHADER,
        fragmentShader: GRID_FRAGMENT_SHADER,
        uniforms: {
          u_gridColor: { value: new THREE.Color(0.32, 0.35, 0.41) },
          u_opacity: { value: 0.24 },
          u_mouseFloor: { value: new THREE.Vector2(0, -2.5) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -1.25;
      scene.add(floorMesh);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    const pixelRatio = () => Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.2 : 1.5);
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;

    // 6-droplet ferrofluid particle state inside Profile Orb
    const blobRest = [
      { ax: -0.14, ay: 0.13, r: 0.042, speed: 0.9, phase: 0.2 },
      { ax: 0.17, ay: 0.05, r: 0.056, speed: 0.75, phase: 1.4 },
      { ax: 0.08, ay: -0.12, r: 0.068, speed: 0.85, phase: 2.6 },
      { ax: -0.11, ay: -0.11, r: 0.036, speed: 1.15, phase: 3.8 },
      { ax: 0.02, ay: -0.02, r: 0.03, speed: 1.05, phase: 4.9 },
      { ax: 0.19, ay: -0.08, r: 0.046, speed: 0.92, phase: 5.5 },
    ];
    const blobs = blobRest.map((b) => ({
      x: b.ax,
      y: b.ay,
      vx: 0,
      vy: 0,
      r: b.r,
      phase: b.phase,
    }));

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
          u_blobs: { value: blobs.map((b) => new THREE.Vector4(b.x, b.y, b.r, b.phase)) },
          u_mouseOrb: { value: new THREE.Vector2(0, 0) },
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
    const geometry = new THREE.PlaneGeometry(1, 1, 24, 16);
    const meshes: THREE.Mesh[] = [];
    const cardPainters: DynamicCardPainter[] = [];
    const DEFAULT_MOUSE_UV = new THREE.Vector2(0.5, 0.5);

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

    let disposed = false;

    filteredProjects.forEach((proj, idx) => {
      let material: THREE.ShaderMaterial | null = null;
      let fallback: THREE.Texture | undefined;
      let initialTex: THREE.Texture;
      let initialSize = new THREE.Vector2(832, 494);

      if (immersive) {
        const painter = createShowcaseCardPainter(proj);
        cardPainters[idx] = painter;
        initialTex = painter.texture;
      } else {
        fallback = createFallbackTexture(proj.name, idx % 2 === 0 ? "#112233" : "#1e1133");
        initialTex = fallback;
        initialSize = new THREE.Vector2(512, 320);
        const texture = textureLoader.load(
          proj.img,
          (loadedTexture) => {
            if (disposed) {
              loadedTexture.dispose();
              return;
            }
            loadedTexture.minFilter = THREE.LinearFilter;
            loadedTexture.generateMipmaps = false;
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            if (material) {
              material.uniforms.u_texture.value = loadedTexture;
              const image = loadedTexture.image as { width?: number; height?: number };
              material.uniforms.u_size.value.set(image.width || 16, image.height || 10);
              fallback?.dispose();
            }
          },
          undefined,
          () => texture.dispose(),
        );
      }

      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          u_texture: { value: initialTex },
          u_size: { value: initialSize },
          u_res: { value: new THREE.Vector2(cardWidth, cardHeight) },
          u_hover: { value: 0 },
          u_dent: { value: immersive ? 0.14 : 0.12 },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_sheetW: { value: count * (cardWidth + cardGap) * 0.4 },
          u_sheetD: { value: 0.28 },
          u_sheetP: { value: 1.0 },
          u_sheetT: { value: 0.85 },
          u_leanW: { value: Math.max(4.5, cardWidth * 1.3) },
          u_leanA: { value: 0.18 },
          u_bulgeA: { value: 0.0 },
          u_bulgeH: { value: Math.max(2.2, cardHeight * 1.1) },
          u_sheetV: { value: 0.0 },
          u_corner: { value: immersive ? 0.052 : 0.045 },
          u_border: { value: immersive ? 0.0022 : 0.0025 },
          u_borderColor: { value: new THREE.Vector3(0.28, 0.31, 0.36) },
          u_alpha: { value: 1.0 },
          u_time: { value: 0 },
          u_ringRadius: { value: ringRadius },
          u_immersive: { value: immersive ? 1.0 : 0.0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(cardWidth, cardHeight, 1);
      mesh.userData = { projectIndex: idx, project: proj, textureFallback: fallback };
      scene.add(mesh);
      meshes.push(mesh);
    });

    cardMeshesRef.current = meshes;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let dragStartX = 0;
    let dragDistance = 0;
    let dragStartOffset = 0;
    let prevDragX = 0;
    let dragTime = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (profileOpenRef.current) return;
      isDragging = true;
      dragDistance = 0;
      setIsGrabbing(true);
      setHasInteracted(true);
      hoverChangeRef.current?.(hoveredIndexRef.current >= 0 ? filteredProjects[hoveredIndexRef.current]?.name ?? null : null, true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      dragStartX = clientX;
      prevDragX = clientX;
      dragStartOffset = targetOffsetRef.current;
      dragTime = performance.now();
    };

    let containerRect = container.getBoundingClientRect();
    let pointerDirty = true;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = containerRect;

      const ndcX = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ndcY = -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;

      mousePosRef.current = { x: clientX, y: clientY, ndcX, ndcY };
      mouseVector.set(ndcX, ndcY);
      pointerDirty = true;

      if (isDragging) {
        dragDistance = Math.max(dragDistance, Math.abs(clientX - dragStartX));
        const dragBaseWidth = Math.max(340, Math.min(rect.width, 1380));
        const delta = immersive
          ? ((clientX - dragStartX) / dragBaseWidth) * 2.45
          : ((clientX - dragStartX) / dragBaseWidth) * (cardWidth + cardGap) * 2.1;
        targetOffsetRef.current = dragStartOffset - delta;

        const now = performance.now();
        const dt = Math.max(now - dragTime, 16);
        const instantV = ((prevDragX - clientX) / dt) * 0.06;
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, instantV, 0.4);
        prevDragX = clientX;
        dragTime = now;
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsGrabbing(false);
        if (immersive && Math.abs(velocityRef.current) > 0.008) {
          targetOffsetRef.current += THREE.MathUtils.clamp(velocityRef.current * 4.5, -0.85, 0.85);
        }
        hoverChangeRef.current?.(hoveredIndexRef.current >= 0 ? filteredProjects[hoveredIndexRef.current]?.name ?? null : null, false);
      }
    };

    const onClick = () => {
      if (profileOpenRef.current) return;
      if (dragDistance < 8 && Math.abs(velocityRef.current) < 0.035 && hoveredIndexRef.current >= 0) {
        const proj = filteredProjects[hoveredIndexRef.current];
        if (proj) {
          setSelectedProject(proj);
        }
      }
    };

    container.style.touchAction = immersive ? "none" : "pan-y";
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    container.addEventListener("click", onClick);

    const onResize = () => {
      if (!container) return;
      const progress = immersive
        ? targetOffsetRef.current
        : targetOffsetRef.current / Math.max(cardWidth + cardGap, 0.001);
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 650;
      containerRect = container.getBoundingClientRect();
      const layout = getProjectCardMetrics(width, height, immersive);
      cardWidth = layout.cardWidth;
      cardHeight = layout.cardHeight;
      cardGap = layout.cardGap;
      ringRadius = getRingRadius(cardWidth, cardGap);
      ringCenterY = immersive ? 0.08 : 0;
      cardWidthRef.current = cardWidth;
      cardGapRef.current = cardGap;

      camera.aspect = width / height;
      camera.position.z = computeCameraZ(layout.cameraZ, ringRadius);
      camera.position.y = cameraBaseY;
      camera.lookAt(0, immersive ? 0.04 : 0, immersive ? -ringRadius : 0);
      cameraBaseRotationX = camera.rotation.x;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(width, height);
      profileLensTarget?.setSize(
        Math.max(1, Math.round(width * renderer.getPixelRatio())),
        Math.max(1, Math.round(height * renderer.getPixelRatio())),
      );
      profileLensMaterial?.uniforms.u_resolution.value.set(width, height);

      scrollOffsetRef.current = immersive ? progress : progress * (cardWidth + cardGap);
      targetOffsetRef.current = scrollOffsetRef.current;

      meshes.forEach((mesh) => {
        mesh.scale.set(cardWidth, cardHeight, 1);
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.u_res.value.set(cardWidth, cardHeight);
        mat.uniforms.u_ringRadius.value = ringRadius;
        mat.uniforms.u_sheetW.value = count * (cardWidth + cardGap) * 0.4;
        mat.uniforms.u_leanW.value = Math.max(4.5, cardWidth * 1.3);
        mat.uniforms.u_bulgeH.value = Math.max(2.2, cardHeight * 1.1);
      });
    };
    window.addEventListener("resize", onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    let animId: number;
    const timer = new THREE.Timer();
    timer.connect(document);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isPageVisible = !document.hidden;
    let lastActiveIndex = -1;
    let lastHoveredUi = false;
    let lastHoveredName: string | null = null;
    let profileProgress = 0;
    let prevElapsed = 0;
    const hitUv = new THREE.Vector2(0.5, 0.5);
    const rayTargets: THREE.Mesh[] = [];

    const animate = () => {
      if (!isPageVisible) return;
      timer.update();
      const elapsed = prefersReducedMotion ? 0 : timer.getElapsed();
      const deltaSec = Math.min(0.05, Math.max(0.001, elapsed - prevElapsed));
      prevElapsed = elapsed;

      profileProgress = THREE.MathUtils.lerp(
        profileProgress,
        profileOpenRef.current ? 1 : 0,
        prefersReducedMotion ? 1 : 1 - Math.exp(-deltaSec * 7.5),
      );

      if (immersive) {
        // Gentle automatic background rotation while Profile lens is open (matches 00:15-00:19 / 00:45-00:47)
        if (profileOpenRef.current && !prefersReducedMotion) {
          targetOffsetRef.current += deltaSec * 0.24;
        }
        scrollOffsetRef.current = THREE.MathUtils.lerp(scrollOffsetRef.current, targetOffsetRef.current, 0.09);
        const diff = targetOffsetRef.current - scrollOffsetRef.current;
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, diff * 1.65, 0.18);
      } else {
        const maxScroll = Math.max(0, (count - 1) * (cardWidth + cardGap));
        targetOffsetRef.current = THREE.MathUtils.clamp(targetOffsetRef.current, -0.6, maxScroll + 0.6);
        scrollOffsetRef.current = THREE.MathUtils.lerp(scrollOffsetRef.current, targetOffsetRef.current, 0.1);
        const diff = targetOffsetRef.current - scrollOffsetRef.current;
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, diff * 1.8, 0.2);
      }

      // Smooth cursor parallax across camera & grid floor
      const targetCamX = mousePosRef.current.ndcX * (immersive ? 0.34 : 0.28);
      const targetCamY = cameraBaseY + mousePosRef.current.ndcY * (immersive ? 0.2 : 0.18);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mousePosRef.current.ndcX * 0.05, 0.06);
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        cameraBaseRotationX + mousePosRef.current.ndcY * 0.036,
        0.06,
      );

      if (floorMaterial) {
        floorMaterial.uniforms.u_mouseFloor.value.set(
          mousePosRef.current.ndcX * 3.8,
          -ringRadius + mousePosRef.current.ndcY * 2.5,
        );
      }

      // Raycast front-facing cards only when pointer or carousel moved (skip while dragging or profile open)
      let foundIndex = hoveredIndexRef.current;
      const carouselMoving = Math.abs(velocityRef.current) > 0.002;
      if (profileOpenRef.current || isDragging) {
        foundIndex = -1;
      } else if (pointerDirty || carouselMoving) {
        pointerDirty = false;
        foundIndex = -1;
        raycaster.setFromCamera(mouseVector, camera);
        rayTargets.length = 0;
        for (let i = 0; i < meshes.length; i++) {
          const m = meshes[i];
          if (!immersive || (m.userData.wrappedAngleAbs ?? 0) < 1.75) {
            rayTargets.push(m);
          }
        }
        const intersects = raycaster.intersectObjects(rayTargets);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const hitMesh = hit.object as THREE.Mesh;
          foundIndex = hitMesh.userData.projectIndex;
          if (hit.uv) hitUv.copy(hit.uv);
        }
      }
      hoveredIndexRef.current = foundIndex;

      const hoveredNow = foundIndex >= 0;
      const hoveredName = hoveredNow ? filteredProjects[foundIndex]?.name ?? null : null;
      if (hoveredNow !== lastHoveredUi || hoveredName !== lastHoveredName) {
        lastHoveredUi = hoveredNow;
        lastHoveredName = hoveredName;
        setIsCardHovered(hoveredNow);
        hoverChangeRef.current?.(hoveredName, isDragging);
      }

      // Active index tracking
      let centerIndex = 0;
      if (immersive) {
        const rawIdx = Math.round(scrollOffsetRef.current / angleStep);
        centerIndex = ((rawIdx % count) + count) % count;
      } else {
        centerIndex = THREE.MathUtils.clamp(
          Math.round(scrollOffsetRef.current / (cardWidth + cardGap)),
          0,
          count - 1,
        );
      }
      if (centerIndex !== lastActiveIndex) {
        lastActiveIndex = centerIndex;
        setActiveIndex(centerIndex);
      }

      meshes.forEach((mesh, idx) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        const isHovered = idx === foundIndex;
        const targetHover = isHovered ? 1.0 : 0.0;
        mat.uniforms.u_hover.value = THREE.MathUtils.lerp(mat.uniforms.u_hover.value, targetHover, 0.12);
        const hoverAmount = mat.uniforms.u_hover.value as number;

        if (immersive) {
          const rawAngle = idx * angleStep - scrollOffsetRef.current;
          const wrappedAngle = ((((rawAngle + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
          mesh.userData.wrappedAngleAbs = Math.abs(wrappedAngle);

          // Continuous 360 cylinder positioning
          mesh.position.x = Math.sin(wrappedAngle) * ringRadius;
          mesh.position.z = -Math.cos(wrappedAngle) * ringRadius;
          mesh.position.y = ringCenterY + Math.sin(elapsed * 0.65 + idx * 0.9) * 0.014;

          // Subtle hover micro-tilt toward cursor + inward orientation
          const tiltY = isHovered ? (hitUv.x - 0.5) * 0.08 * hoverAmount : 0;
          const tiltX = isHovered ? -(hitUv.y - 0.5) * 0.06 * hoverAmount : 0;
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, -wrappedAngle + tiltY, 0.16);
          mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, tiltX, 0.14);

          const scaleMul = 1 + hoverAmount * 0.04;
          mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, cardWidth * scaleMul, 0.12);
          mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, cardHeight * scaleMul, 0.12);

          // Fade cards cleanly once they wrap past the sides toward the rear of the camera
          const angleFade = 1 - THREE.MathUtils.smoothstep(mesh.userData.wrappedAngleAbs, 1.45, 2.05);
          const distToCamZ = camera.position.z - mesh.position.z;
          mat.uniforms.u_alpha.value = THREE.MathUtils.smoothstep(distToCamZ, 0.5, 2.0) * angleFade;

          // Update animated multi-slide canvas texture (skip offscreen or while profile overlay is open)
          const isCardVisible = !profileOpenRef.current && (mesh.userData.wrappedAngleAbs ?? 0) < 1.85;
          cardPainters[idx]?.update(elapsed, idx * 1.45, hoverAmount, isCardVisible);
        } else {
          const baseX = idx * (cardWidth + cardGap) - scrollOffsetRef.current;
          mesh.position.x = baseX;
          mesh.position.y = 0;
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.12);
          mesh.position.z = 0;
          const targetScale = 1 + hoverAmount * 0.025;
          mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, cardWidth * targetScale, 0.12);
          mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, cardHeight * targetScale, 0.12);
        }

        if (isHovered) {
          mat.uniforms.u_mouse.value.lerp(hitUv, 0.22);
        } else {
          mat.uniforms.u_mouse.value.lerp(DEFAULT_MOUSE_UV, 0.06);
        }

        mat.uniforms.u_sheetV.value = velocityRef.current;
        mat.uniforms.u_time.value = elapsed;
      });

      // Update floating obsidian ferrofluid droplets inside Profile Orb
      if (profileLensTarget && profileLensScene && profileLensCamera && profileLensMaterial && profileProgress > 0.001) {
        const aspect = width / Math.max(height, 1);
        const orbMouseX = mousePosRef.current.ndcX * 0.5 * aspect;
        const orbMouseY = mousePosRef.current.ndcY * 0.5;
        const blobUniforms = profileLensMaterial.uniforms.u_blobs.value as THREE.Vector4[];

        for (let i = 0; i < blobs.length; i++) {
          const b = blobs[i];
          const rest = blobRest[i];
          const driftX = rest.ax + Math.sin(elapsed * rest.speed + rest.phase) * 0.055;
          const driftY = rest.ay + Math.cos(elapsed * rest.speed * 0.85 + rest.phase) * 0.045;

          // Subtle spring toward rest + magnetic attraction/parting around cursor
          const dxM = orbMouseX - b.x;
          const dyM = orbMouseY - b.y;
          const dM = Math.hypot(dxM, dyM) + 0.001;
          const cursorPull = dM < 0.36 ? 0.028 * (1 - dM / 0.36) : 0;

          b.vx = (b.vx + (driftX - b.x) * 0.045 + (dxM / dM) * cursorPull) * 0.88;
          b.vy = (b.vy + (driftY - b.y) * 0.045 + (dyM / dM) * cursorPull) * 0.88;

          // Keep droplets smoothly separated
          for (let j = i + 1; j < blobs.length; j++) {
            const other = blobs[j];
            const ox = b.x - other.x;
            const oy = b.y - other.y;
            const dist = Math.hypot(ox, oy) + 0.0001;
            const minSep = (b.r + other.r) * 0.92;
            if (dist < minSep) {
              const push = (minSep - dist) * 0.08;
              b.vx += (ox / dist) * push;
              b.vy += (oy / dist) * push;
              other.vx -= (ox / dist) * push;
              other.vy -= (oy / dist) * push;
            }
          }

          b.x += b.vx;
          b.y += b.vy;
          blobUniforms[i].set(b.x, b.y, b.r, b.phase);
        }

        profileLensMaterial.uniforms.u_open.value = profileProgress;
        profileLensMaterial.uniforms.u_time.value = elapsed;
        profileLensMaterial.uniforms.u_mouseOrb.value.set(orbMouseX, orbMouseY);

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
      cardPainters.forEach((p) => p?.dispose());
      meshes.forEach((m) => {
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
      <section aria-label="Project showcase" className="showcase-immersive absolute inset-0 overflow-hidden bg-black text-white">
        {viewMode === "strip" && (
          <>
            <div
              ref={mountRef}
              className={`absolute inset-0 h-full w-full touch-pan-y ${
                isGrabbing ? "cursor-grabbing" : isCardHovered ? "cursor-pointer" : "cursor-grab"
              }`}
              style={{ touchAction: "none" }}
              aria-label="Interactive 3D project carousel. Scroll or drag horizontally to browse projects."
              role="region"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveStrip(-1);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveStrip(1);
                }
              }}
            />

            {!hasInteracted && !profileOpen && (
              <div className="pointer-events-none absolute inset-x-0 bottom-[3.4rem] z-20 text-center font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/40 transition-opacity duration-500 sm:bottom-[3.3rem] sm:text-[9px] sm:tracking-[0.22em] sm:text-white/35">
                <span className="sm:hidden">Swipe or tap card to inspect</span>
                <span className="hidden sm:inline">Scroll or drag · click card to inspect</span>
              </div>
            )}
          </>
        )}

        {viewMode === "index" && (
          <div
            className="showcase-full-index absolute inset-x-0 bottom-[3.6rem] top-[4.5rem] z-30 overflow-y-auto overscroll-auto bg-black px-5 py-8 sm:px-10 lg:px-14"
            onMouseMove={(e) => setIndexCursorPos({ x: e.clientX, y: e.clientY })}
          >
            {/* Floating hover preview thumbnail in FULL archive view */}
            {hoveredIndexItem && (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-10 hidden w-64 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/15 opacity-55 shadow-2xl transition-opacity duration-200 md:block"
                style={{ left: indexCursorPos.x + 120, top: indexCursorPos.y - 40 }}
              >
                <img src={hoveredIndexItem.img} alt="" className="aspect-[16/10] w-full object-cover" />
              </div>
            )}

            <div className="relative z-20 mx-auto flex min-h-full max-w-5xl flex-wrap content-center items-center justify-center gap-x-2.5 gap-y-2 text-center sm:gap-x-3 2xl:max-w-6xl">
              {filteredProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredIndexItem(project)}
                    onMouseLeave={() => setHoveredIndexItem(null)}
                    onClick={() => setSelectedProject(project)}
                    className="showcase-index-project min-h-[40px] px-1 text-[clamp(1.2rem,3.6vw,3.1rem)] font-normal tracking-[-0.055em] text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:min-h-0 sm:px-0"
                  >
                    {project.name}
                  </button>
                  {index < filteredProjects.length - 1 && (
                    <span aria-hidden="true" className="text-[clamp(0.9rem,2.6vw,2rem)] text-white/25">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Exact bottom-left FEATURED / FULL & bottom-right NEWSLETTER footer from jesperlandberg.com */}
        <nav
          className="showcase-replica-footer pointer-events-none absolute inset-x-0 bottom-0 z-40 flex h-[54px] items-center justify-between gap-3 px-4 font-mono text-[9px] uppercase tracking-[0.16em] sm:px-8 sm:text-[10px] lg:px-[5vw]"
          aria-label="Showcase navigation"
        >
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveFilter("featured");
                setViewMode("strip");
                targetOffsetRef.current = 0;
                scrollOffsetRef.current = 0;
                setActiveIndex(0);
              }}
              aria-current={viewMode === "strip" ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center px-1 transition hover:text-white sm:min-h-0 sm:px-0 ${viewMode === "strip" ? "text-white" : "text-white/40"}`}
            >
              Featured
            </button>
            <span className="text-white/30" aria-hidden="true">
              /
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setViewMode("index");
              }}
              aria-current={viewMode === "index" ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center px-1 transition hover:text-white sm:min-h-0 sm:px-0 ${viewMode === "index" ? "text-white" : "text-white/40"}`}
            >
              Full
            </button>
          </div>

          {onOpenNewsletter ? (
            <button
              type="button"
              onClick={onOpenNewsletter}
              className="pointer-events-auto inline-flex min-h-[44px] items-center px-1 uppercase text-white/85 transition hover:text-white sm:min-h-0 sm:px-0"
            >
              Newsletter
            </button>
          ) : (
            <a
              className="pointer-events-auto inline-flex min-h-[44px] items-center px-1 uppercase text-white/85 transition hover:text-white sm:min-h-0 sm:px-0"
              href={`mailto:${profileData.basics.email}?subject=${encodeURIComponent("Portfolio enquiry")}`}
            >
              Newsletter <ArrowUpRight size={11} className="ml-0.5 inline" />
            </a>
          )}
        </nav>

        <PageInsidePageModal
          project={selectedProject}
          projects={filteredProjects}
          onSelectProject={(proj) => setSelectedProject(proj as ProjectItem)}
          onClose={() => setSelectedProject(null)}
          immersive
          onOpenAnatomy={onOpenAnatomy}
        />
      </section>
    );
  }

  return (
    <section className="relative w-full bg-transparent text-white overflow-hidden">
      {/* ── TOP HEADER ── */}
      <div className="relative z-30 pt-16 sm:pt-24 pb-8 px-5 sm:px-12 max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-7 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>01 // SELECTED WORK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl leading-[0.96] font-display font-medium tracking-[-0.04em] text-white mt-3">
            Selected work <span className="text-white/40">&amp; projects.</span>
          </h2>
          <p className="mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
            Hardware prototypes, Linux workstation practice, and production web engineering.
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
          <div
            ref={mountRef}
            className={`w-full h-full ${isGrabbing ? "cursor-grabbing" : "cursor-grab"} touch-none`}
          />

          {activeProject && (
            <div className="pointer-events-none absolute bottom-4 sm:bottom-8 inset-x-3 sm:inset-x-8 z-30 mx-auto flex max-w-[1700px] flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-end sm:justify-between lg:inset-x-12">
              <div className="pointer-events-auto w-full max-w-3xl space-y-1 rounded-2xl border border-white/10 bg-black/65 p-3.5 sm:p-6 lg:p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">
                  <span>{activeProject.badge}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{activeProject.subtitle}</span>
                </div>
                <h3 className="text-[clamp(1.25rem,3.6vw,3.1rem)] leading-[1] font-display font-medium tracking-[-0.05em] text-white">
                  {activeProject.name}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans line-clamp-2 pt-0.5 sm:pt-1">
                  {activeProject.description}
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1.5 sm:pt-2">
                  {activeProject.skills.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-300"
                    >
                      {sk}
                    </span>
                  ))}
                  {activeProject.skills.slice(3, 5).map((sk) => (
                    <span
                      key={sk}
                      className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pointer-events-auto flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => moveStrip(-1)}
                    className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-xl transition-all hover:bg-white hover:text-black active:scale-95"
                    title="Previous project"
                    aria-label="Previous project"
                  >
                    <ArrowLeft size={15} />
                  </button>

                  <button
                    onClick={() => moveStrip(1)}
                    className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-xl transition-all hover:bg-white hover:text-black active:scale-95"
                    title="Next project"
                    aria-label="Next project"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setSelectedProject(activeProject)}
                    className="flex h-9 sm:h-11 items-center gap-1.5 sm:gap-2 rounded-full bg-cyan-400 px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs font-bold tracking-wide text-black shadow-lg shadow-cyan-400/20 transition-all hover:bg-cyan-300 active:scale-95"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight size={14} />
                  </button>

                  {activeProject.id === "zcard-hardware" && onOpenAnatomy && (
                    <button
                      onClick={onOpenAnatomy}
                      className="flex h-9 sm:h-11 items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 sm:px-5 font-mono text-[10px] sm:text-xs font-bold tracking-wide text-black shadow-lg shadow-cyan-400/25 transition-all hover:brightness-110 active:scale-95"
                    >
                      <span className="hidden sm:inline">🔬 3D Anatomy Dissection</span>
                      <span className="sm:hidden">🔬 Anatomy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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

      {/* ── MODE 2: FULL ARCHIVE INDEX TABLE ── */}
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
                    {p.skills.slice(0, 3).map((sk) => (
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

      <PageInsidePageModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenAnatomy={onOpenAnatomy}
      />
    </section>
  );
};
