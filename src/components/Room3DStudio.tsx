import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Monitor, Music, BookOpen, Layers, RotateCcw } from "lucide-react";

export const Room3DStudio: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activePreset, setActivePreset] = useState<string>("overview");
  const [activeInspect, setActiveInspect] = useState<string | null>(null);

  // Inspection presets for camera targets
  const presets = [
    { id: "overview", label: "Studio Overview", pos: [7, 6, 8], target: [0, 1, 0], icon: Layers },
    { id: "desk", label: "PC Workstation", pos: [2, 3, 3], target: [-1.2, 1.8, -0.5], icon: Monitor },
    { id: "audio", label: "7YNX Audio Rig", pos: [-2, 3, 3.5], target: [1.2, 1.5, 0], icon: Music },
    { id: "shelf", label: "Books & Hardware", pos: [0, 4, 4], target: [0, 2.5, -2], icon: BookOpen },
  ];

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));
  const targetCamPos = useRef(new THREE.Vector3(7, 6, 8));

  const changePreset = (presetId: string) => {
    setActivePreset(presetId);
    const p = presets.find((x) => x.id === presetId);
    if (p) {
      targetCamPos.current.set(p.pos[0], p.pos[1], p.pos[2]);
      targetLookAt.current.set(p.target[0], p.target[1], p.target[2]);
      if (presetId === "desk") {
        setActiveInspect("PC Workstation: Dual Curved Monitors running Arch Linux Neovim & AAOS Cockpit Controller Debugger.");
      } else if (presetId === "audio") {
        setActiveInspect("7YNX Sound Station: FL Studio 21 Power Setup with MIDI Synthesizer & Studio Reference Monitors.");
      } else if (presetId === "shelf") {
        setActiveInspect("Hardware Archive: VLSI Digital Design notes, Arduino microcontrollers, and CAN bus transceivers.");
      } else {
        setActiveInspect(null);
      }
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050509");
    scene.fog = new THREE.FogExp2("#050509", 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(7, 6, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Lighting (aengel.io / CGTrader style rim & key lights)
    const ambientLight = new THREE.AmbientLight("#22223a", 1.2);
    scene.add(ambientLight);

    // Warm desk light
    const deskLight = new THREE.PointLight("#ffaa44", 2.5, 8);
    deskLight.position.set(0, 3, 0);
    scene.add(deskLight);

    // Cyber Cyan Rim Light
    const cyanLight = new THREE.SpotLight("#00F2FE", 5, 20, Math.PI / 4, 0.4);
    cyanLight.position.set(-5, 6, 4);
    cyanLight.target.position.set(0, 1, 0);
    scene.add(cyanLight);
    scene.add(cyanLight.target);

    // Cyber Purple Back Light
    const purpleLight = new THREE.PointLight("#9D4EDD", 4, 15);
    purpleLight.position.set(4, 5, -3);
    scene.add(purpleLight);

    // Room Floor Grid
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#0a0a14",
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(16, 24, "#00F2FE", "#1a1a30");
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Back Wall
    const wallGeo = new THREE.BoxGeometry(16, 8, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: "#080811", roughness: 0.9 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4, -4);
    scene.add(backWall);

    // ══════════════════════════════════════════════════════════
    // DESK SETUP (PC WORKSTATION)
    // ══════════════════════════════════════════════════════════
    const deskGeo = new THREE.BoxGeometry(5, 0.15, 2);
    const deskMat = new THREE.MeshStandardMaterial({ color: "#12121e", roughness: 0.4, metalness: 0.6 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 1.4, -0.5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4);
    const legMat = new THREE.MeshStandardMaterial({ color: "#00F2FE", metalness: 0.8, roughness: 0.2 });
    [[-2.3, 0.7, -1.3], [2.3, 0.7, -1.3], [-2.3, 0.7, 0.3], [2.3, 0.7, 0.3]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      scene.add(leg);
    });

    // Dual Curved Monitors
    const monMat = new THREE.MeshStandardMaterial({ color: "#000", roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: "#00F2FE" });

    // Center Monitor
    const mon1Geo = new THREE.BoxGeometry(1.6, 0.9, 0.06);
    const mon1 = new THREE.Mesh(mon1Geo, monMat);
    mon1.position.set(-0.8, 2.2, -0.7);
    mon1.rotation.y = 0.15;
    scene.add(mon1);

    const screen1 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), screenMat);
    screen1.position.set(-0.8, 2.2, -0.66);
    screen1.rotation.y = 0.15;
    scene.add(screen1);

    // Secondary Monitor
    const mon2 = new THREE.Mesh(mon1Geo, monMat);
    mon2.position.set(0.8, 2.2, -0.7);
    mon2.rotation.y = -0.15;
    scene.add(mon2);

    const screen2Mat = new THREE.MeshBasicMaterial({ color: "#9D4EDD" });
    const screen2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), screen2Mat);
    screen2.position.set(0.8, 2.2, -0.66);
    screen2.rotation.y = -0.15;
    scene.add(screen2);

    // PC Case with Internal RGB Glow
    const pcGeo = new THREE.BoxGeometry(0.6, 1.2, 1);
    const pcMat = new THREE.MeshStandardMaterial({ color: "#0a0a14", metalness: 0.8, roughness: 0.2 });
    const pcCase = new THREE.Mesh(pcGeo, pcMat);
    pcCase.position.set(2, 2.1, -0.5);
    scene.add(pcCase);

    const pcGlow = new THREE.PointLight("#00F2FE", 1.5, 2);
    pcGlow.position.set(2, 2.1, -0.5);
    scene.add(pcGlow);

    // Keyboard & Mouse
    const kbGeo = new THREE.BoxGeometry(1.2, 0.04, 0.4);
    const kbMat = new THREE.MeshStandardMaterial({ color: "#1a1a2e" });
    const keyboard = new THREE.Mesh(kbGeo, kbMat);
    keyboard.position.set(0, 1.5, -0.2);
    scene.add(keyboard);

    // ══════════════════════════════════════════════════════════
    // AUDIO PRODUCTION RIG (7YNX STATION)
    // ══════════════════════════════════════════════════════════
    // MIDI Synthesizer Keyboard
    const synthGeo = new THREE.BoxGeometry(1.8, 0.08, 0.5);
    const synthMat = new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.3 });
    const synth = new THREE.Mesh(synthGeo, synthMat);
    synth.position.set(-1.8, 1.55, -0.4);
    scene.add(synth);

    // Studio Monitor Speakers
    const speakerGeo = new THREE.BoxGeometry(0.35, 0.55, 0.35);
    const speakerMat = new THREE.MeshStandardMaterial({ color: "#181824" });
    const spkL = new THREE.Mesh(speakerGeo, speakerMat);
    spkL.position.set(-1.9, 2.1, -0.8);
    spkL.rotation.y = 0.3;
    scene.add(spkL);

    const spkR = new THREE.Mesh(speakerGeo, speakerMat);
    spkR.position.set(1.9, 2.1, -0.8);
    spkR.rotation.y = -0.3;
    scene.add(spkR);

    // Interactive Mouse Orbit Dragging
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = new THREE.Spherical().setFromVector3(camera.position);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.006));

      targetCamPos.current.setFromSpherical(spherical);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera lerp (aengel.io style silky camera navigation)
      camera.position.lerp(targetCamPos.current, 0.05);

      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);
      currentLookAt.lerp(targetLookAt.current, 0.05);
      camera.lookAt(targetLookAt.current);

      // Subtle breathing lights
      deskLight.intensity = 2.2 + Math.sin(elapsed * 2) * 0.3;
      purpleLight.intensity = 3.5 + Math.cos(elapsed * 1.5) * 0.5;

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
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section id="3d-studio" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-purple-400"></span>
          <span className="text-xs font-mono tracking-widest text-purple-400 uppercase">
            02 // 3D DIGITAL ENVIRONMENT
          </span>
          <span className="w-8 h-px bg-purple-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          ZYNX 3D Digital Room & Workstation
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          An authentic interactive Three.js 3D showroom inspired by <span className="text-cyan-400">aengel.io</span> and <span className="text-purple-400">CGTrader</span>. Click and drag to orbit 360°, or select inspection presets below.
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

      {/* 3D Showroom Viewport Container */}
      <div className="relative w-full h-[580px] sm:h-[440px] rounded-3xl overflow-hidden cyber-glass border border-white/10 shadow-2xl">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit Hint Watermark */}
        <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <RotateCcw size={12} className="text-cyan-400 animate-spin" />
          <span>DRAG MOUSE TO ORBIT 360°</span>
        </div>

        {/* Inspection Details Floating HUD (when focused) */}
        {activeInspect && (
          <div className="absolute bottom-6 left-6 right-6 md:left-4 md:right-4 pointer-events-auto p-4 rounded-xl cyber-glass border border-purple-500/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
              <p className="text-xs font-mono text-zinc-200 leading-relaxed">
                {activeInspect}
              </p>
            </div>
            <button
              onClick={() => changePreset("overview")}
              className="text-xs font-mono px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Reset View
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
