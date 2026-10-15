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
  vec2 mouseDelta = (vUv - u_mouse) * sz;
  float mouseDist = length(mouseDelta);
  float cursorGlow = exp(-mouseDist * 3.8) * u_hover;

  col += (spec * LIGHT_SPEC + cursorGlow * 0.28) * vec3(0.92, 0.96, 1.0);

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
  {
    id: "3d-room-sanctuary",
    name: "ZYNX 3D Studio & Room Sanctuary",
    subtitle: "Interactive 3D Three.js Creative Space",
    category: "3D & Creative",
    description: "An interactive, fully customizable 3D digital bedroom environment built with Three.js, procedural audio synthesis, ambient lighting, and furniture re-arrangement capabilities.",
    skills: ["Three.js", "WebGL", "TypeScript", "Procedural Audio", "Raycasting"],
    badge: "Interactive 3D",
    img: "/images/projects/lofi-bedroom.jpg",
    link: "#space",
  },
];

export const Projects3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"strip" | "index">("strip");
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

  const filterCategories = useMemo(() => [
    { id: "featured", label: "Featured" },
    { id: "all", label: "All Works" },
    { id: "automotive", label: "Automotive & Embedded", match: ["Automotive & Embedded", "Hardware & VLSI"] },
    { id: "creative", label: "Creative & WebGL", match: ["WebGL & Audio", "Creative & Math", "3D & Creative"] },
    { id: "systems", label: "Systems & Mobile", match: ["Mobile & Systems"] },
  ], []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "featured") return ALL_PROJECTS.slice(0, 5);
    if (activeFilter === "all") return ALL_PROJECTS;
    const cat = filterCategories.find(c => c.id === activeFilter);
    return ALL_PROJECTS.filter(p => cat?.match?.includes(p.category));
  }, [activeFilter, filterCategories]);

  // Handle scroll / dragging
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.0035;
    targetOffsetRef.current += delta;
  }, []);

  const moveStrip = (direction: -1 | 1) => {
    const step = cardWidthRef.current + cardGapRef.current;
    targetOffsetRef.current += direction * step;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container || viewMode !== "strip") return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 650;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const cardWidth = 3.2;
    const cardHeight = 2.0;
    const cardGap = 0.38;
    cardWidthRef.current = cardWidth;
    cardGapRef.current = cardGap;

    // Build Project Planes with subdivided geometry for seamless wave deformation
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 36, 24);
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

    filteredProjects.forEach((proj, idx) => {
      const fallback = createFallbackTexture(proj.name, idx % 2 === 0 ? "#112233" : "#1e1133");
      const texture = textureLoader.load(proj.img, undefined, undefined, () => fallback);
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          u_texture: { value: texture },
          u_size: { value: new THREE.Vector2(16, 10) },
          u_res: { value: new THREE.Vector2(cardWidth, cardHeight) },
          u_hover: { value: 0 },
          u_dent: { value: 0.12 },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_sheetW: { value: (count * (cardWidth + cardGap)) * 0.4 },
          u_sheetD: { value: 0.28 },
          u_sheetP: { value: 1.0 },
          u_sheetT: { value: 0.85 },
          u_leanW: { value: 4.5 },
          u_leanA: { value: 0.18 },
          u_bulgeA: { value: 0.0 },
          u_bulgeH: { value: 2.2 },
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

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { projectIndex: idx, project: proj };
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
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 650;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Inertia & Damping
      const maxScroll = Math.max(0, (count - 1) * (cardWidth + cardGap));
      targetOffsetRef.current = THREE.MathUtils.clamp(targetOffsetRef.current, -0.6, maxScroll + 0.6);

      scrollOffsetRef.current = THREE.MathUtils.lerp(scrollOffsetRef.current, targetOffsetRef.current, 0.1);
      const diff = targetOffsetRef.current - scrollOffsetRef.current;
      velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, diff * 1.8, 0.2);

      // Camera Parallax & Subtle 3D Tilt from mouse movement
      const targetCamX = mousePosRef.current.ndcX * 0.28;
      const targetCamY = mousePosRef.current.ndcY * 0.18;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mousePosRef.current.ndcX * 0.045, 0.06);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mousePosRef.current.ndcY * 0.035, 0.06);

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
      setActiveIndex(centerIndex);

      // Update each card mesh position and shader uniforms
      meshes.forEach((mesh, idx) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        const baseX = (idx * (cardWidth + cardGap)) - scrollOffsetRef.current;
        mesh.position.x = baseX;
        mesh.position.y = 0;

        // Hover uniform interpolation
        const isHovered = idx === foundIndex;
        const targetHover = isHovered ? 1.0 : 0.0;
        mat.uniforms.u_hover.value = THREE.MathUtils.lerp(mat.uniforms.u_hover.value, targetHover, 0.12);

        if (isHovered) {
          mat.uniforms.u_mouse.value.lerp(hitUv, 0.2);
        }

        // Pass velocity & time
        mat.uniforms.u_sheetV.value = velocityRef.current;
        mat.uniforms.u_time.value = elapsed;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
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
        (m.material as THREE.ShaderMaterial).dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [filteredProjects, viewMode, handleWheel]);

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0];

  return (
    <section id="projects" className="relative w-full bg-transparent text-white overflow-hidden scroll-mt-16 select-none">
      {/* ── TOP HUD HEADER (Jesper Landberg Minimalist Swedish Aesthetic) ── */}
      <div className="relative z-30 pt-16 pb-6 px-6 sm:px-12 max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>01 // SELECTED WORK & GLSL RIG</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
            Creative Code <span className="text-white/40">& Embedded Architecture</span>
          </h2>
        </div>

        {/* Top Controls: Filter Toggles & View Mode */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFilter(cat.id);
                  targetOffsetRef.current = 0;
                  scrollOffsetRef.current = 0;
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

          <div className="flex items-center gap-1 border-l border-white/15 pl-4">
            <button
              onClick={() => setViewMode("strip")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "strip" ? "text-cyan-300 underline" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Ribbon Wave
            </button>
            <span className="text-zinc-700">/</span>
            <button
              onClick={() => setViewMode("index")}
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
        <div className="relative w-full h-[76svh] min-h-[520px] max-h-[760px] overflow-hidden">
          {/* Three.js Canvas Container */}
          <div
            ref={mountRef}
            className={`w-full h-full ${isGrabbing ? "cursor-grabbing" : "cursor-grab"} touch-none`}
          />

          {/* Floating Minimal Card Metadata (Anchored in bottom center) */}
          {activeProject && (
            <div className="pointer-events-none absolute bottom-8 inset-x-6 sm:inset-x-12 z-30 max-w-[1700px] mx-auto flex items-end justify-between">
              <div className="space-y-1 backdrop-blur-md bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/10 max-w-xl pointer-events-auto">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">
                  <span>{activeProject.badge}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">{activeProject.subtitle}</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-medium tracking-[-0.04em] text-white">
                  {activeProject.name}
                </h3>
                <p className="text-xs text-zinc-300 font-sans line-clamp-2 pt-1">
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
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={() => moveStrip(-1)}
                  className="w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center transition-all shadow-xl"
                  title="Previous project"
                  aria-label="Previous project"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={() => moveStrip(1)}
                  className="w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center transition-all shadow-xl"
                  title="Next project"
                  aria-label="Next project"
                >
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setSelectedProject(activeProject)}
                  className="h-11 px-5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20"
                >
                  <span>Inspect Spec</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom HUD Bar: Counter & Instruction */}
          <div className="pointer-events-none absolute top-6 right-6 sm:right-12 z-20 font-mono text-xs text-white/50 flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-white/30"> / {String(filteredProjects.length).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 font-mono text-[10px] tracking-[0.24em] uppercase text-zinc-500">
            DRAG MOUSE OR SWIPE TO EXPLORE 3D WAVE
          </div>
        </div>
      )}

      {/* ── MODE 2: FULL ARCHIVE INDEX TABLE (Jesper Landberg /full route style) ── */}
      {viewMode === "index" && (
        <div className="py-16 px-6 sm:px-12 max-w-[1700px] mx-auto animate-fadeIn">
          <div className="border-t border-white/15">
            {filteredProjects.map((p, index) => (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="group grid grid-cols-1 md:grid-cols-[4rem_1fr_1.5fr_auto] items-center gap-4 py-6 border-b border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all hover:bg-white/[0.02] px-4 rounded-xl"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── "PAGE INSIDE A PAGE" EMBEDDED PROJECT VIEWPORT (Jesper Landberg style) ── */}
      <PageInsidePageModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
