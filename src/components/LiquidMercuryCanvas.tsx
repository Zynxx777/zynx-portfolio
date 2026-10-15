import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface LiquidMercuryCanvasProps {
  className?: string;
  intensity?: number;
  interactive?: boolean;
}

export const LiquidMercuryCanvas: React.FC<LiquidMercuryCanvasProps> = ({
  className = "",
  intensity = 1.0,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene, Camera & WebGL Renderer Setup ────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // ── GLSL 3D Simplex Noise Shader & Chromatic Ferrofluid Material ────────
    const vertexShader = `
      // Simplex 3D noise by Ian McEwan, Stefan Gustavson, Ashima Arts
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform float uRipple;
      uniform float uScroll;

      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying float vDisplacement;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Continuous organic viscous fluid wave
        float slowTime = uTime * 0.38;
        float wave1 = snoise(pos * 0.55 + vec3(slowTime * 0.3, slowTime * 0.25, slowTime * 0.2));
        float wave2 = snoise(pos * 1.1 - vec3(slowTime * 0.2, slowTime * 0.4, slowTime * 0.15)) * 0.45;

        // Interactive cursor repulsion & ripple wave
        float mouseDist = length(pos.xy * 0.32 - uMouse * 1.1);
        float mouseWave = sin(mouseDist * 7.5 - uTime * 3.8) * exp(-mouseDist * 1.4) * (uHover * 0.28 + uRipple * 0.65);

        float disp = (wave1 + wave2) * 0.22 + mouseWave * 0.22;
        vDisplacement = disp;

        vec3 newPosition = pos + normal * disp;

        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
        vWorldPos = worldPosition.xyz;

        // Perturbed normal for liquid refraction glints
        vNormal = normalize(normalMatrix * normal + vec3(sin(uTime + pos.x * 2.2) * 0.06, cos(uTime + pos.y * 2.2) * 0.06, 0.0));
        vViewDir = normalize(cameraPosition - worldPosition.xyz);

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uColorCyan;
      uniform vec3 uColorPurple;
      uniform vec3 uColorSilver;
      uniform vec3 uColorDeep;
      uniform float uRipple;

      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      varying float vDisplacement;
      varying vec2 vUv;

      // Synthesized Studio Environment / HDRI Matcap Reflection
      vec3 getStudioReflection(vec3 reflDir) {
        float keyLight = pow(max(dot(reflDir, normalize(vec3(0.55, 0.95, 0.45))), 0.0), 28.0);
        float fillLight = pow(max(dot(reflDir, normalize(vec3(-0.65, -0.6, 0.5))), 0.0), 16.0);
        float rimLight = pow(max(dot(reflDir, normalize(vec3(0.1, -1.0, -0.3))), 0.0), 22.0);
        float stripLight = pow(max(abs(dot(reflDir, normalize(vec3(0.0, 1.0, 0.1)))), 0.0), 48.0);

        vec3 col = uColorDeep;
        float horizon = smoothstep(-0.35, 0.35, reflDir.y);
        col = mix(col, uColorSilver * 0.72, horizon * 0.55);

        col += keyLight * uColorCyan * 2.4;
        col += fillLight * uColorPurple * 1.9;
        col += rimLight * uColorCyan * 1.2;
        col += stripLight * vec3(1.0, 1.0, 1.0) * 1.6;

        return col;
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewDir);

        // High-contrast Fresnel curve
        float fresnel = pow(1.0 - max(dot(V, N), 0.0), 2.8);
        float fresnelSoft = pow(1.0 - max(dot(V, N), 0.0), 1.6);

        // Chromatic dispersion (spectral RGB offset)
        float dispersion = 0.032 + uRipple * 0.035;
        vec3 reflR = reflect(-V, normalize(N + vec3(dispersion, 0.0, 0.0)));
        vec3 reflG = reflect(-V, normalize(N));
        vec3 reflB = reflect(-V, normalize(N - vec3(dispersion, 0.0, 0.0)));

        float r = getStudioReflection(reflR).r;
        float g = getStudioReflection(reflG).g;
        float b = getStudioReflection(reflB).b;
        vec3 chromeRefl = vec3(r, g, b);

        // Iridescent chromatic interference along liquid ripples
        float iridPhase = vDisplacement * 4.2 + fresnel * 2.8 + uTime * 0.18;
        vec3 iridColor = 0.5 + 0.5 * cos(iridPhase + vec3(0.0, 2.09, 4.18));
        vec3 metallicTint = mix(uColorSilver, iridColor, 0.36);

        // Blend liquid mercury base with chromatic highlights
        vec3 baseChrome = mix(uColorDeep, metallicTint, 0.65 + fresnel * 0.35);
        vec3 finalColor = baseChrome * chromeRefl + fresnel * (uColorCyan * 0.55 + uColorPurple * 0.45);

        // Razor specular peak reflection
        vec3 H = normalize(V + normalize(vec3(0.35, 0.85, 0.75)));
        float specPeak = pow(max(dot(N, H), 0.0), 72.0);
        finalColor += specPeak * vec3(1.0, 1.0, 1.0) * 1.8;

        float alpha = clamp(0.92 + fresnelSoft * 0.08, 0.0, 1.0);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // ── High-Density Parametric Torus Knot (Möbius Ribbon Loop) ────────────
    const geometry = new THREE.TorusKnotGeometry(2.35, 0.68, 256, 64, 2, 3);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uRipple: { value: 0 },
      uScroll: { value: 0 },
      uColorCyan: { value: new THREE.Color("#00F2FE") },
      uColorPurple: { value: new THREE.Color("#A855F7") },
      uColorSilver: { value: new THREE.Color("#F1F5F9") },
      uColorDeep: { value: new THREE.Color("#050814") },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const liquidMesh = new THREE.Mesh(geometry, material);
    liquidMesh.position.set(0.6, 0.1, -0.4);
    scene.add(liquidMesh);

    // ── Orbiting Stardust & Micro-Mercury Droplets ──────────────────────────
    const dropletCount = 380;
    const dropletGeo = new THREE.BufferGeometry();
    const dropletPositions = new Float32Array(dropletCount * 3);
    const dropletScales = new Float32Array(dropletCount);
    const dropletAngles = new Float32Array(dropletCount);
    const dropletRadii = new Float32Array(dropletCount);
    const dropletSpeeds = new Float32Array(dropletCount);

    for (let i = 0; i < dropletCount; i++) {
      const radius = 3.2 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.2;

      dropletPositions[i * 3] = Math.cos(angle) * radius;
      dropletPositions[i * 3 + 1] = y;
      dropletPositions[i * 3 + 2] = Math.sin(angle) * radius - 0.5;

      dropletScales[i] = Math.random() * 0.04 + 0.015;
      dropletAngles[i] = angle;
      dropletRadii[i] = radius;
      dropletSpeeds[i] = (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
    }

    dropletGeo.setAttribute("position", new THREE.BufferAttribute(dropletPositions, 3));

    // Particle sprite texture (glow point)
    const dropletCanvas = document.createElement("canvas");
    dropletCanvas.width = 64;
    dropletCanvas.height = 64;
    const dCtx = dropletCanvas.getContext("2d");
    if (dCtx) {
      const grad = dCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.25, "rgba(0, 242, 254, 0.85)");
      grad.addColorStop(0.7, "rgba(168, 85, 247, 0.3)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      dCtx.fillStyle = grad;
      dCtx.fillRect(0, 0, 64, 64);
    }
    const dropletTexture = new THREE.CanvasTexture(dropletCanvas);

    const dropletMat = new THREE.PointsMaterial({
      size: 0.14,
      map: dropletTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dropletPoints = new THREE.Points(dropletGeo, dropletMat);
    scene.add(dropletPoints);

    // ── Mouse & Interaction Handling ─────────────────────────────────────────
    const mousePos = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    let rippleStrength = 0;
    let hoverState = 0;
    let scrollOffset = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.x = x;
      mousePos.y = y;
      hoverState = 1.0;
    };

    const handlePointerLeave = () => {
      hoverState = 0.0;
    };

    const handleClick = () => {
      rippleStrength = 1.4;
    };

    const handleCustomRipple = () => {
      rippleStrength = 2.2;
    };

    const handleScroll = () => {
      scrollOffset = window.scrollY * 0.0015;
    };

    if (interactive) {
      window.addEventListener("mousemove", handlePointerMove, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("trigger-liquid-ripple", handleCustomRipple);
      container.addEventListener("mouseleave", handlePointerLeave);
      container.addEventListener("click", handleClick);
    }

    // ── Resize Observer ──────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // ── Animation Loop ───────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (lerp)
      currentMouse.x += (mousePos.x - currentMouse.x) * 0.05;
      currentMouse.y += (mousePos.y - currentMouse.y) * 0.05;

      // Ripple dissipation
      rippleStrength = Math.max(0, rippleStrength - 0.025);

      // Uniform updates
      uniforms.uTime.value = elapsed * intensity;
      uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
      uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, hoverState, 0.05);
      uniforms.uRipple.value = rippleStrength;
      uniforms.uScroll.value = scrollOffset;

      // Hypnotic multi-axis tumbling
      liquidMesh.rotation.x = elapsed * 0.12 + currentMouse.y * 0.35 + scrollOffset * 0.6;
      liquidMesh.rotation.y = elapsed * 0.16 + currentMouse.x * 0.45;
      liquidMesh.rotation.z = elapsed * 0.07;

      // Gentle organic breathing scale
      const breath = 1.0 + Math.sin(elapsed * 0.9) * 0.025;
      liquidMesh.scale.set(breath, breath, breath);

      // Rotate orbiting micro-mercury droplets
      const posAttr = dropletGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < dropletCount; i++) {
        dropletAngles[i] += dropletSpeeds[i] * 0.015;
        const r = dropletRadii[i];
        positions[i * 3] = Math.cos(dropletAngles[i]) * r + currentMouse.x * 0.2;
        positions[i * 3 + 2] = Math.sin(dropletAngles[i]) * r - 0.5 + currentMouse.y * 0.2;
      }
      posAttr.needsUpdate = true;

      dropletPoints.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // ── Teardown & Resource Disposal ─────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("trigger-liquid-ripple", handleCustomRipple);
        container.removeEventListener("mouseleave", handlePointerLeave);
        container.removeEventListener("click", handleClick);
      }
      geometry.dispose();
      material.dispose();
      dropletGeo.dispose();
      dropletMat.dispose();
      dropletTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [intensity, interactive]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-auto overflow-hidden transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${className}`}
      aria-label="Interactive 3D Liquid Chrome Ferrofluid Simulation"
    />
  );
};
