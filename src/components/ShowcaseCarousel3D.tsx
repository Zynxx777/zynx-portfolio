import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PROJECTS, type Project } from '../data/portfolioData';
import { ArrowLeft, ExternalLink, Sparkles, Layers } from 'lucide-react';

interface ShowcaseCarousel3DProps {
  onSelectProject: (project: Project) => void;
  onOpenProfile: () => void;
  onOpenNewsletter: () => void;
  onSwitchToBedroom: () => void;
  onOpenAnatomy?: () => void;
}

export const ShowcaseCarousel3D: React.FC<ShowcaseCarousel3DProps> = ({
  onSelectProject,
  onOpenProfile,
  onOpenNewsletter,
  onSwitchToBedroom,
  onOpenAnatomy
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [filterMode, setFilterMode] = useState<'featured' | 'all'>('featured');
  const [activeProject, setActiveProject] = useState<Project>(PROJECTS[0]);

  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);
  const cardsMeshGroupRef = useRef<THREE.Group | null>(null);

  const displayProjects = filterMode === 'featured' 
    ? PROJECTS.slice(0, 4) 
    : PROJECTS;

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

      if (closestProj.id !== activeProject.id) {
        setActiveProject(closestProj);
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
      {/* Top Header Bar (Exact layout from jesperlandberg.com) */}
      <header className="absolute top-0 inset-x-0 z-20 p-6 md:p-8 flex items-center justify-between text-xs font-mono tracking-widest text-white uppercase pointer-events-none">
        <div className="pointer-events-auto font-bold flex items-center gap-3">
          <span className="hover:text-cyan-400 transition-colors">JOSHUA D (ZYNX)</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-normal">
            SHOWCASE 2.0
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

      {/* Floating Center / Bottom Active Project Title & Metadata (Matching jesperlandberg.com card labels) */}
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
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 shadow-lg"
          >
            Open Project Case Study <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* If the active project is Z Card, provide direct button to Anatomy Dissection! */}
          {activeProject.id === 'zcard' && onOpenAnatomy && (
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

      {/* Bottom Footer Bar (Exact layout from jesperlandberg.com) */}
      <footer className="absolute bottom-0 inset-x-0 z-20 p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest text-slate-400 uppercase pointer-events-none">
        
        {/* Left: Filter Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setFilterMode('featured')}
            className={`transition-colors ${filterMode === 'featured' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            FEATURED
          </button>
          <span>/</span>
          <button
            onClick={() => setFilterMode('all')}
            className={`transition-colors ${filterMode === 'all' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            FULL
          </button>
        </div>

        {/* Center: Switcher to 3D Bedroom Desk */}
        <div className="pointer-events-auto">
          <button
            onClick={onSwitchToBedroom}
            className="px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Switch to 3D Desk Workspace
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
