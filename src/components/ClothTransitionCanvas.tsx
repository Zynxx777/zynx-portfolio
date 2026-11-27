import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type ClothTransitionKind = "open" | "next" | "prev" | "close" | null;

interface ClothTransitionCanvasProps {
  transitionKind: ClothTransitionKind;
  transitionKey: number;
  onSettled?: () => void;
}

const CLOTH_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float u_progress;
  uniform float u_mode; // 0 = open, 1 = next (leftward wave), -1 = prev (rightward wave)

  void main() {
    vUv = uv;
    vec3 p = position;

    float envelope = sin(u_progress * 3.14159265);
    float wavePhase = (uv.x - (0.5 - 0.8 * u_progress * u_mode)) * 9.5 + uv.y * 2.2;
    float radialRipple = sin(length(uv - 0.5) * 10.0 - u_progress * 7.5);

    float foldZ = (abs(u_mode) > 0.1)
      ? sin(wavePhase) * 0.24 * envelope + cos(uv.y * 4.5 + u_progress * 5.0) * 0.06 * envelope
      : radialRipple * 0.16 * envelope + sin(uv.x * 5.0 + u_progress * 4.0) * 0.09 * envelope;

    p.z += foldZ;

    // Slight corner pull during billowing silk unfold
    float cornerFactor = (uv.x - 0.5) * (uv.y - 0.5);
    p.x += cornerFactor * envelope * 0.09 * (abs(u_mode) > 0.1 ? u_mode : 1.0);
    p.y += sin(uv.x * 4.2 + u_progress * 6.0) * 0.025 * envelope;

    // Analytical approximate normal along wave
    float dzdx = (abs(u_mode) > 0.1)
      ? cos(wavePhase) * 9.5 * 0.24 * envelope
      : cos(uv.x * 5.0 + u_progress * 4.0) * 5.0 * 0.09 * envelope;
    float dzdy = -sin(uv.y * 4.5 + u_progress * 5.0) * 4.5 * 0.06 * envelope;
    vNormal = normalize(vec3(-dzdx, -dzdy, 1.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const CLOTH_FRAGMENT_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float u_progress;
  uniform float u_mode;

  void main() {
    float envelope = sin(u_progress * 3.14159265);
    if (envelope < 0.01) discard;

    // SDF rounded mask matching white modal sheet
    vec2 mid = vec2(0.5);
    vec2 q = abs(vUv - mid) - (mid - 0.024);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.024;
    if (d > 0.0) discard;

    vec3 lightDir = normalize(vec3(-0.35, 0.45, 0.85));
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float diff = dot(vNormal, lightDir) * 0.5 + 0.5;
    float spec = pow(max(dot(vNormal, halfDir), 0.0), 22.0);

    // Subtle silk wave crest highlight + trough shadow (like frame 00:38)
    float shade = mix(0.84, 1.0, diff);
    vec3 clothColor = vec3(0.985, 0.985, 0.98) * shade + spec * vec3(0.14);

    // Traveling seam highlight during horizontal swipe
    if (abs(u_mode) > 0.1) {
      float seam = exp(-pow((vUv.x - (1.0 - u_progress)) * 5.5, 2.0));
      clothColor = mix(clothColor, vec3(1.0), seam * 0.35);
    }

    float edgeAlpha = 1.0 - smoothstep(-0.004, 0.0, d);
    gl_FragColor = vec4(clothColor, edgeAlpha * min(1.0, envelope * 1.45));
  }
`;

export const ClothTransitionCanvas: React.FC<ClothTransitionCanvasProps> = ({
  transitionKind,
  transitionKey,
  onSettled,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settledCallbackRef = useRef(onSettled);

  useEffect(() => {
    settledCallbackRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (!transitionKind) return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      settledCallbackRef.current?.();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / Math.max(height, 1), 0.1, 20);
    camera.position.z = 2.65;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const visibleHeight = 2 * camera.position.z * Math.tan((40 * Math.PI) / 360);
    const visibleWidth = visibleHeight * (width / Math.max(height, 1));

    const geometry = new THREE.PlaneGeometry(visibleWidth * 0.92, visibleHeight * 0.94, 48, 32);
    const modeValue = transitionKind === "next" ? 1 : transitionKind === "prev" ? -1 : 0;
    const material = new THREE.ShaderMaterial({
      vertexShader: CLOTH_VERTEX_SHADER,
      fragmentShader: CLOTH_FRAGMENT_SHADER,
      uniforms: {
        u_progress: { value: 0 },
        u_mode: { value: modeValue },
      },
      transparent: true,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const start = performance.now();
    const duration = transitionKind === "open" ? 480 : 440;
    let frameId = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      material.uniforms.u_progress.value = t;
      renderer.render(scene, camera);

      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        settledCallbackRef.current?.();
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [transitionKind, transitionKey]);

  if (!transitionKind) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[105]"
      aria-hidden="true"
    />
  );
};
