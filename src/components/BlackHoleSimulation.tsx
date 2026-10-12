import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface BlackHoleProps {
  className?: string;
}

export const BlackHoleSimulation: React.FC<BlackHoleProps> = ({ className = "" }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Central Event Horizon (Pitch Black Sphere)
    const horizonGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    scene.add(eventHorizon);

    // Einstein Ring / Gravitational Lensing Glow Ring
    const ringGeo = new THREE.RingGeometry(1.68, 2.35, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00F2FE,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const einsteinRing = new THREE.Mesh(ringGeo, ringMat);
    einsteinRing.rotation.x = Math.PI / 2.35;
    scene.add(einsteinRing);

    // Secondary Warped Photospheric Lensing Halo
    const haloGeo = new THREE.RingGeometry(1.66, 1.95, 96);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff8833,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const photonHalo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(photonHalo);

    // 8,000 Particle Accretion Disk Simulation
    const particleCount = 8500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const radii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const zOffsets = new Float32Array(particleCount);

    const colorInner = new THREE.Color("#00F2FE"); // Relativistic blue-shifted
    const colorMid = new THREE.Color("#9D4EDD");   // Purple intermediate
    const colorOuter = new THREE.Color("#FF7700"); // Red-shifted outer accretion

    for (let i = 0; i < particleCount; i++) {
      // Logarithmic distribution: denser near the event horizon
      const r = 1.8 + Math.pow(Math.random(), 2.2) * 6.5;
      const angle = Math.random() * Math.PI * 2;
      radii[i] = r;
      angles[i] = angle;

      // Keplerian relativistic orbital velocity: v ~ 1 / sqrt(r)
      speeds[i] = (1.8 / Math.sqrt(r)) * 0.018;

      // Thin accretion disk height profile
      zOffsets[i] = (Math.random() - 0.5) * (0.15 * Math.pow(r / 3, 0.8));

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = zOffsets[i];
      positions[i * 3 + 2] = Math.sin(angle) * r;

      // Relativistic temperature coloring based on radius
      const t = (r - 1.8) / 6.5;
      const pColor = new THREE.Color();
      if (t < 0.35) {
        pColor.lerpColors(colorInner, colorMid, t / 0.35);
      } else {
        pColor.lerpColors(colorMid, colorOuter, (t - 0.35) / 0.65);
      }

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const accretionDisk = new THREE.Points(particlesGeo, particlesMat);
    accretionDisk.rotation.x = Math.PI / 2.35;
    scene.add(accretionDisk);

    // Deep Starfield Background
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = (Math.random() - 0.5) * 80 - 20;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x88bbff,
      transparent: true,
      opacity: 0.65,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Mouse Interaction for Relativistic Gravitational Deflection
    let mouse = { x: 0, y: 0 };
    let targetRotX = Math.PI / 2.35;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = x;
      mouse.y = y;
      targetRotX = Math.PI / 2.35 + y * 0.25;
      targetRotY = x * 0.45;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera/disk orientation tilt with mouse
      accretionDisk.rotation.x += (targetRotX - accretionDisk.rotation.x) * 0.05;
      accretionDisk.rotation.z += (targetRotY - accretionDisk.rotation.z) * 0.05;
      einsteinRing.rotation.x = accretionDisk.rotation.x;
      einsteinRing.rotation.z = accretionDisk.rotation.z;

      // Look at camera for photon halo
      photonHalo.lookAt(camera.position);

      // Orbit particles around singularity
      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * (1 + delta * 2);
        const r = radii[i];
        const a = angles[i];

        posArray[i * 3] = Math.cos(a) * r;
        posArray[i * 3 + 1] = zOffsets[i] + Math.sin(a * 3) * 0.03;
        posArray[i * 3 + 2] = Math.sin(a) * r;
      }
      posAttr.needsUpdate = true;

      // Starfield slow cosmic drift
      starField.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    />
  );
};
