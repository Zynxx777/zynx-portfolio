import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  createBlueSpeaker,
  createBobblehead,
  createOakTexture,
  createTurntable,
} from './desk/ReferenceDeskProps';
import { 
  ExternalLink,
  Printer,
  Sparkles,
  RotateCw,
  Download,
  MessageSquare,
  Phone,
  Mail,
  X,
  Droplets,
  Disc3,
  Play,
  Pause,
  SkipForward,
  Tablet,
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import { getRenderQuality } from '../utils/renderQuality';
import { MonitorDesktopModal } from './MonitorDesktopModal';
import PhoneExperience from './PhoneExperience';
import { TabletDocketModal, type DocketOrder, type TabletAppId } from './TabletDocketModal';
import { fetchLiveDiaryEntries } from '../services/diaryCloud';
import { musicPlayerEngine } from '../utils/musicPlayerEngine';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { XRayDeskInspector } from './XRayDeskInspector';
import { XRAY_DESK_ITEMS, type XRayDeskItem } from '../data/deskInspectorData';
import { StickyNotesModal } from './StickyNotesModal';
import { 
  drawCardFront, 
  drawCardBack, 
  getContactTileAtUV, 
  downloadVCard, 
  CARD_WIDTH, 
  CARD_HEIGHT 
} from '../utils/cardCanvas';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 0 0-1.62 1.62c0 .89.73 1.62 1.62 1.62.89 0 1.62-.73 1.62-1.62 0-.89-.73-1.62-1.62-1.62z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const SpectaclesIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="14" r="4" />
    <circle cx="18" cy="14" r="4" />
    <path d="M10 13.5a2 2 0 0 1 4 0" />
    <path d="M2.5 13L4 6" />
    <path d="M21.5 13L20 6" />
  </svg>
);

// Smootherstep Perlin Easing (6t^5 - 15t^4 + 10t^3)
const Ca = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const BASE_PLANT_LEAVES = 8;
const NEW_PLANT_LEAVES = 10;
const HOUR_MS = 60 * 60 * 1000;
const plantLeafCount = (waters: number) => {
  const safeWaters = Number.isFinite(waters) ? Math.max(0, waters) : 0;
  return BASE_PLANT_LEAVES + Math.floor(NEW_PLANT_LEAVES * Math.min(1, Math.log10(1 + safeWaters) / 2.5) + 1e-6);
};
const plantThirst = (lastWateredAt: number | null, now = Date.now()) =>
  lastWateredAt
    ? THREE.MathUtils.clamp((now - lastWateredAt - 2 * HOUR_MS) / (10 * HOUR_MS), 0, 1)
    : 1;

function createSteamPuffTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Texture();

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const CARD_DIM = { w: 0.086, h: 0.055, t: 0.0012 };
const CARD_LAYOUT = { height: 0.50, width: 0.86 };
const CARD_REST_POS = new THREE.Vector3(0, 0.024, 0.006);
const CARD_REST_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.28, 0, 0));
const CARD_TURN_AXIS = new THREE.Vector3(0, 1, 0);

const V_held = new THREE.Vector3();
const W_held = new THREE.Vector3();
const X_held = new THREE.Quaternion();
const heldTarget = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.06, 0, 0));
const flipQ = new THREE.Quaternion();
const turnQ = new THREE.Quaternion();
const aVec = new THREE.Vector3();
const bVec = new THREE.Vector3();
const bezierCurve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3()
);

function getResponsiveCameraFov(aspect: number): number {
  if (aspect < 0.6) return 47;
  if (aspect < 0.8) return 45;
  if (aspect < 1) return 50;
  return 42;
}

function getResponsiveCameraFrame(w: number, h: number): { pos: THREE.Vector3; lookAt: THREE.Vector3 } {
  const aspect = w / Math.max(1, h);
  if (aspect < 0.6) {
    // Narrow phones use the reference's close, overhead desk framing.
    return {
      pos: new THREE.Vector3(0.14, 1.73, 1.58),
      lookAt: new THREE.Vector3(0.0, 0.16, 0.0)
    };
  } else if (aspect < 0.8) {
    // Standard phones keep the full tabletop and its key props inside the frame.
    return {
      pos: new THREE.Vector3(0.16, 1.69, 1.49),
      lookAt: new THREE.Vector3(0.0, 0.18, 0.0)
    };
  } else if (aspect < 1.0) {
    // Square / foldable devices
    return {
      pos: new THREE.Vector3(0.0, 1.35, 2.45),
      lookAt: new THREE.Vector3(0.0, 0.22, 0.0)
    };
  } else if (aspect < 1.35) {
    // Tablet portrait / iPad
    return {
      pos: new THREE.Vector3(0.0, 1.18, 1.95),
      lookAt: new THREE.Vector3(0.0, 0.25, 0.0)
    };
  } else if (h < 520 && aspect > 1.3) {
    // Mobile landscape
    return {
      pos: new THREE.Vector3(0.0, 0.85, 1.75),
      lookAt: new THREE.Vector3(0.0, 0.22, 0.0)
    };
  } else if (aspect > 2.0) {
    // Ultra-wide displays (21:9 / 32:9)
    return {
      pos: new THREE.Vector3(0.0, 0.95, 1.45),
      lookAt: new THREE.Vector3(0.0, 0.28, 0.0)
    };
  } else {
    // Standard desktop (16:9 / 16:10)
    return {
      pos: new THREE.Vector3(0.28, 1.05, 1.58),
      lookAt: new THREE.Vector3(0.0, 0.28, 0.0)
    };
  }
}

function computeHeldTransform(
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  group: THREE.Group,
  rotOffset?: THREE.Quaternion
) {
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const c = Math.tan(fovRad / 2);
  const aspect = size.width / Math.max(1, size.height);
  const isMobile = size.width < 640 || aspect < 1.0;
  const layoutWidth = isMobile ? 0.78 : CARD_LAYOUT.width;
  const layoutHeight = isMobile ? 0.42 : CARD_LAYOUT.height;
  const dist = Math.max(
    CARD_DIM.h / (2 * c * layoutHeight),
    CARD_DIM.w / (2 * c * aspect * layoutWidth)
  );

  // On mobile portrait, raise card slightly so it never collides with bottom floating action dock
  const yOffset = isMobile ? 0.08 : -0.02;
  V_held.set(0, yOffset, 0.5).unproject(camera);
  W_held.copy(V_held).sub(camera.position).normalize();
  heldTarget.p.copy(camera.position).addScaledVector(W_held, dist);

  group.worldToLocal(heldTarget.p);

  group.getWorldQuaternion(X_held).invert();
  heldTarget.q.copy(X_held).multiply(camera.quaternion);

  if (rotOffset) {
    heldTarget.q.multiply(rotOffset);
  }
}

/** Build a 2D rounded rectangle shape with large arbitrary corner radius. */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw - 0.0001, hh - 0.0001);
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/** Flat rounded-corner quad with normalized 0..1 planar UV mapping for displays & decals. */
function createRoundedPanelGeometry(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(createRoundedRectShape(width, height, radius), 12);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i += 1) {
    uv[i * 2] = (pos.getX(i) + width / 2) / width;
    uv[i * 2 + 1] = (pos.getY(i) + height / 2) / height;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** Extruded rounded-corner slab with smooth chamfered aluminum edge bevels. */
function createRoundedSlabGeometry(
  width: number,
  height: number,
  cornerRadius: number,
  depth: number,
  bevelThickness: number,
  bevelSize: number
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(createRoundedRectShape(width, height, cornerRadius), {
    depth,
    curveSegments: 14,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: 5,
  });
  geo.center();
  return geo;
}

// Renders the authentic live Z OS desktop interface onto the 3D laptop screen
function drawLiveLaptopDisplay(
  ctx: CanvasRenderingContext2D,
  timeStr: string,
  pulse: number
) {
  const w = 1280;
  const h = 800;

  const round = (x: number, y: number, rw: number, rh: number, r: number | number[]) => {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, rw, rh, r);
    } else {
      ctx.rect(x, y, rw, rh);
    }
  };

  // 1. Wallpaper Base & Soft Aura Blurs (Matching Z OS / MacOS)
  ctx.fillStyle = '#EEF1F7';
  ctx.fillRect(0, 0, w, h);

  // Aura 1 (Top-Left soft blue)
  const g1 = ctx.createRadialGradient(240, 160, 40, 240, 160, 440);
  g1.addColorStop(0, 'rgba(217, 227, 255, 0.85)');
  g1.addColorStop(1, 'rgba(217, 227, 255, 0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, w, h);

  // Aura 2 (Top-Right soft peach)
  const g2 = ctx.createRadialGradient(1060, 240, 40, 1060, 240, 420);
  g2.addColorStop(0, 'rgba(251, 227, 211, 0.85)');
  g2.addColorStop(1, 'rgba(251, 227, 211, 0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);

  // Aura 3 (Bottom-Center soft mint)
  const g3 = ctx.createRadialGradient(520, 720, 50, 520, 720, 460);
  g3.addColorStop(0, 'rgba(230, 241, 228, 0.85)');
  g3.addColorStop(1, 'rgba(230, 241, 228, 0)');
  ctx.fillStyle = g3;
  ctx.fillRect(0, 0, w, h);

  // 2. macOS Top Menu Bar (with clean centered gap for the 3D MacBook Pro notch)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fillRect(0, 0, w, 38);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, 37, w, 1);

  // Crisp vector Apple emblem (cross-platform, avoids Linux tofu glyph)
  const ax = 24;
  const ay = 19;
  ctx.fillStyle = '#1D1D1F';
  ctx.beginPath();
  ctx.arc(ax - 2.6, ay + 0.5, 4.4, Math.PI * 0.4, Math.PI * 1.65);
  ctx.arc(ax + 2.6, ay + 0.5, 4.4, Math.PI * 1.35, Math.PI * 0.6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.beginPath();
  ctx.arc(ax + 6.4, ay - 0.6, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1D1D1F';
  ctx.beginPath();
  ctx.ellipse(ax + 1.2, ay - 6.0, 2.2, 1.3, -0.65, 0, Math.PI * 2);
  ctx.fill();

  // Left Menu Items (stay cleanly left of center notch)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1D1D1F';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Finder', 46, 23);

  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#2F5BEA';
  ctx.fillText('Work', 102, 23);
  ctx.fillStyle = '#4B5563';
  ctx.fillText('About', 150, 23);
  ctx.fillText('Contact', 204, 23);
  ctx.fillText('Window', 268, 23);

  // Right Menu Status: Live pulse, Control Center, Battery & Clock (cleanly right of notch)
  const dotAlpha = 0.45 + 0.55 * Math.abs(Math.sin(pulse * 3));
  ctx.fillStyle = `rgba(16, 185, 129, ${dotAlpha})`;
  ctx.beginPath();
  ctx.arc(1032, 19, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Battery icon
  ctx.strokeStyle = '#1D1D1F';
  ctx.lineWidth = 1.4;
  round(1048, 12, 22, 12, 3);
  ctx.stroke();
  ctx.fillStyle = '#1D1D1F';
  round(1050.5, 14.5, 17, 7, 1.5);
  ctx.fill();
  ctx.fillRect(1071, 15.5, 2, 5);

  // Wi-Fi arcs
  ctx.strokeStyle = '#1D1D1F';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(1092, 23, 2, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1092, 23, 5.5, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1092, 23, 9, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.fillStyle = '#1D1D1F';
  ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`Bengaluru  ${timeStr || '1:20 am'}`, 1262, 23);

  // 3. Desktop Shortcut Icons on Right
  const rightIcons = [
    { label: 'Work', color: '#3B82F6', y: 70 },
    { label: 'About', color: '#6366F1', y: 155 },
    { label: 'Resume', color: '#10B981', y: 240 }
  ];
  rightIcons.forEach((item) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
    round(1190, item.y, 56, 56, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = item.color;
    round(1203, item.y + 14, 30, 26, 6);
    ctx.fill();

    ctx.fillStyle = '#1D1D1F';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, 1218, item.y + 72);
  });

  // 4. Main Floating Window (Work: Eight projects, all running)
  const wx = 50;
  const wy = 54;
  const ww = 1100;
  const wh = 648;

  // Window Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  round(wx + 4, wy + 8, ww, wh, 16);
  ctx.fill();

  // Window Container
  ctx.fillStyle = '#FFFFFF';
  round(wx, wy, ww, wh, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Titlebar
  ctx.fillStyle = '#F7F7F8';
  round(wx, wy, ww, 44, [14, 14, 0, 0]);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(wx, wy + 43, ww, 1);

  // macOS Traffic lights
  ctx.fillStyle = '#FF5F57';
  ctx.beginPath(); ctx.arc(wx + 22, wy + 22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEBC2E';
  ctx.beginPath(); ctx.arc(wx + 42, wy + 22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#28C840';
  ctx.beginPath(); ctx.arc(wx + 62, wy + 22, 6, 0, Math.PI * 2); ctx.fill();

  // Title in center of titlebar
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Work — Eight live projects', wx + ww / 2, wy + 27);

  // Window Content Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Eight projects, all running.', wx + 36, wy + 80);

  ctx.fillStyle = '#6B7280';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Open one to use the real site. Everything here was built by me.', wx + 36, wy + 102);

  // Grid of 8 Project Tiles (2 rows x 4 cols)
  const tiles = [
    { title: 'Z Card v0.1', sub: 'Smart Card System', tag: 'HARDWARE', tint: '#EBF1F7', accent: '#1E293B' },
    { title: 'S.M. School Web', sub: 'School Management', tag: 'LIVE SITE', tint: '#EBF5FB', accent: '#2563EB' },
    { title: 'Arch Workstation', sub: 'Hyprland & Kernel', tag: 'SYSTEM', tint: '#F0F4F8', accent: '#0F172A' },
    { title: 'Luxoft AAOS', sub: 'Automotive CAN Bus', tag: 'RESEARCH', tint: '#F2EEF9', accent: '#7C3AED' },
    { title: 'MediVend', sub: 'Verilog FSM Prototype', tag: 'EMBEDDED', tint: '#E7F6EF', accent: '#059669' },
    { title: '7YNX Sound Lab', sub: 'Electronic Soundscapes', tag: 'AUDIO', tint: '#FDF0F3', accent: '#E11D48' },
    { title: 'Jesper Wave 3D', sub: 'Curved WebGL Wave', tag: 'CREATIVE', tint: '#E8F0FE', accent: '#1D4ED8' },
    { title: '3D Bedroom', sub: 'Three.js Spatial Web', tag: 'SPATIAL', tint: '#FDF6E2', accent: '#D97706' }
  ];

  const cols = 4;
  const tileW = 236;
  const tileH = 205;
  const startX = wx + 36;
  const startY = wy + 128;
  const gapX = 28;
  const gapY = 24;

  tiles.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = startX + col * (tileW + gapX);
    const ty = startY + row * (tileH + gapY);

    ctx.fillStyle = t.tint;
    round(tx, ty, tileW, tileH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Mini UI preview window inside card
    ctx.fillStyle = '#FFFFFF';
    round(tx + 10, ty + 10, tileW - 20, 108, 8);
    ctx.fill();
    ctx.fillStyle = t.accent;
    round(tx + 10, ty + 10, tileW - 20, 20, [8, 8, 0, 0]);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    round(tx + 20, ty + 42, tileW - 40, 12, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    round(tx + 20, ty + 62, tileW - 76, 10, 4);
    ctx.fill();
    round(tx + 20, ty + 80, tileW - 92, 10, 4);
    ctx.fill();

    // Tag badge
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(t.tag, tx + 18, ty + 23);

    // Title & Subtitle
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(t.title, tx + 12, ty + 150);

    ctx.fillStyle = '#6B7280';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(t.sub, tx + 12, ty + 172);

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(tx + tileW - 18, ty + 150, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Authentic macOS Glass Dock (Squircle App Icons)
  const dockW = 472;
  const dockH = 54;
  const dockX = (w - dockW) / 2;
  const dockY = h - 68;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  round(dockX, dockY, dockW, dockH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const dockApps = [
    { bg: '#2563EB', fg: '#FFFFFF', text: 'F', active: true },
    { bg: '#0EA5E9', fg: '#FFFFFF', text: 'S' },
    { bg: '#18181B', fg: '#34D399', text: '>_' },
    { bg: '#FFFFFF', fg: '#2563EB', text: 'W' },
    { bg: '#F59E0B', fg: '#FFFFFF', text: 'N' },
    { bg: '#E11D48', fg: '#FFFFFF', text: 'M' },
    { bg: '#10B981', fg: '#FFFFFF', text: 'C' },
    { bg: 'SEP', fg: '', text: '' },
    { bg: '#3B82F6', fg: '#FFFFFF', text: 'P' },
    { bg: '#E5E7EB', fg: '#4B5563', text: 'T' },
  ];

  dockApps.forEach((app, di) => {
    const ix = dockX + 16 + di * 44;
    if (app.bg === 'SEP') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(ix + 10, dockY + 12, 1.5, 30);
    } else {
      ctx.fillStyle = app.bg;
      round(ix, dockY + 9, 34, 34, 9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.stroke();
      ctx.fillStyle = app.fg;
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(app.text, ix + 17, dockY + 31);
      if (app.active) {
        ctx.fillStyle = '#1D1D1F';
        ctx.beginPath();
        ctx.arc(ix + 17, dockY + 48, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

// Renders the authentic thermal docket receipt onto the 3D printer paper texture
function drawReceiptOnCanvas(ctx: CanvasRenderingContext2D, order?: DocketOrder | null) {
  const w = 320;
  const h = 720;
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('========================', 20, 30);
  ctx.fillText('  DEMO METALS RECYCLING ', 20, 55);
  ctx.fillText('  WEIGHBRIDGE DOCKET #1 ', 20, 80);
  ctx.fillText('========================', 20, 105);

  ctx.font = '12px monospace';
  const docketNum = order?.docketNumber || '#044813';
  const customer = order?.customer || 'Riverbend Demolition Pty';
  const dateStr = order?.dateStr || '30-Oct-2026 02:40';
  ctx.fillText(`DOCKET NO : ${docketNum}`, 20, 135);
  ctx.fillText(`DATE      : ${dateStr}`, 20, 155);
  ctx.fillText(`CUSTOMER  : ${customer.slice(0, 16)}`, 20, 175);
  ctx.fillText('PAYMENT   : EFT CONFIRMED', 20, 195);
  ctx.fillText('------------------------', 20, 215);

  ctx.font = 'bold 11px monospace';
  ctx.fillText('ITEM             KG   TOTAL', 20, 235);
  ctx.fillText('------------------------', 20, 248);

  ctx.font = '11px monospace';
  const items = order?.items || [
    { name: 'Bright copper wire', weightKg: 45.5, pricePerKg: 11.60, total: 527.80 }
  ];

  let currentY = 268;
  items.slice(0, 4).forEach((it) => {
    const nameStr = it.name.slice(0, 13).padEnd(13, ' ');
    const kgStr = it.weightKg.toFixed(0).padStart(4, ' ');
    const totStr = `$${it.total.toFixed(0)}`.padStart(6, ' ');
    ctx.fillText(`${nameStr} ${kgStr} ${totStr}`, 20, currentY);
    currentY += 22;
  });

  ctx.fillText('------------------------', 20, currentY + 5);
  currentY += 25;

  const total = order?.total || 580.58;
  const gst = order?.gst || 52.78;
  ctx.fillText(`GST (10%) : $${gst.toFixed(2)}`, 20, currentY);
  currentY += 20;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`TOTAL PAID: $${total.toFixed(2)}`, 20, currentY);
  currentY += 30;

  // Barcode
  ctx.fillStyle = '#0f172a';
  for (let b = 0; b < 48; b++) {
    const bw = (b % 4 === 0) ? 3 : (b % 3 === 0) ? 2 : 1;
    ctx.fillRect(24 + b * 5.5, currentY, bw, 32);
  }
  currentY += 45;

  ctx.font = 'bold 11px monospace';
  ctx.fillText('THANK YOU FOR RECYCLING!', 20, currentY);
  ctx.font = '10px monospace';
  ctx.fillText('*** PRADIPLABS / ZYNX ***', 20, currentY + 20);
}

// Isometric X-Ray marker positions for the desk props.
const XRAY_TARGETS: { id: number; key: string; pos: THREE.Vector3 }[] = [
  { id: 1, key: 'printer', pos: new THREE.Vector3(-0.52, 0.22, -0.06) },  // 1: Thermal POS Printer
  { id: 2, key: 'zoro', pos: new THREE.Vector3(-0.405, 0.29, -0.19) },   // 2: Zoro bobblehead
  { id: 3, key: 'tablet', pos: new THREE.Vector3(-0.32, 0.28, 0.04) },   // 3: Tablet (Docket system)
  { id: 4, key: 'laptop', pos: new THREE.Vector3(0.0, 0.35, -0.10) },    // 4: Laptop (MacBook)
  { id: 5, key: 'notes', pos: new THREE.Vector3(-0.16, 0.36, -0.09) },   // 5: Sticky Notes
  { id: 6, key: 'card', pos: new THREE.Vector3(0.24, 0.20, 0.285) },      // 6: Z Business Card
  { id: 7, key: 'diary', pos: new THREE.Vector3(0.25, 0.195, 0.145) },    // 7: Closed Black Death Note Diary
  { id: 8, key: 'photo', pos: new THREE.Vector3(0.225, 0.22, -0.185) },   // 8: Picture Frame (right of MacBook)
  { id: 9, key: 'mug', pos: new THREE.Vector3(0.39, 0.21, 0.045) },      // 9: Ceramic Coffee Mug
  { id: 10, key: 'lamp', pos: new THREE.Vector3(0.58, 0.28, -0.24) },    // 10: Mushroom Desk Lamp (Back)
  { id: 11, key: 'phone', pos: new THREE.Vector3(0.49, 0.24, -0.05) },   // 11: Smartphone & Stand (Right)
  { id: 12, key: 'plant', pos: new THREE.Vector3(0.34, 0.32, -0.22) },   // 12: Tall desk plant
  { id: 13, key: 'speaker', pos: new THREE.Vector3(-0.59, 0.25, 0.245) }, // 13: Blue desk speaker
  { id: 14, key: 'turntable', pos: new THREE.Vector3(0.53, 0.205, 0.165) }, // 14: Miniature record player
];

interface BedroomDesk3DProps {
  onOpenDiary: () => void;
  onOpenProject: (projectId: string) => void;
  onSwitchToShowcase: () => void;
  onOpenAnatomy: () => void;
  onOpenMonitor?: () => void;
  onOpenPhone?: () => void;
  onToggleMusic?: () => void;
  onToggleMusicPlayback?: () => void;
  isMusicOpen?: boolean;
  isMusicPlaying?: boolean;
  isDiaryOpen?: boolean;
  dayMode?: boolean;
  openTabletAppSignal?: { seq: number; app: TabletAppId; addSong?: boolean } | null;
}

export const BedroomDesk3D: React.FC<BedroomDesk3DProps> = ({
  onOpenDiary,
  onOpenProject,
  onOpenAnatomy,
  onOpenMonitor,
  onOpenPhone,
  onToggleMusic,
  onToggleMusicPlayback,
  isMusicOpen = false,
  isMusicPlaying = false,
  isDiaryOpen = false,
  dayMode: controlledDayMode,
  openTabletAppSignal,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const actionsNavRef = useRef<HTMLElement | null>(null);
  const onToggleMusicRef = useRef(onToggleMusic);
  const onToggleMusicPlaybackRef = useRef(onToggleMusicPlayback);
  useEffect(() => {
    onToggleMusicRef.current = onToggleMusic;
  }, [onToggleMusic]);
  useEffect(() => {
    onToggleMusicPlaybackRef.current = onToggleMusicPlayback;
  }, [onToggleMusicPlayback]);
  const musicPlayingRef = useRef(isMusicPlaying);
  useEffect(() => {
    musicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    if (isDiaryOpen) return;
    const frame = requestAnimationFrame(() => {
      if (actionsNavRef.current) actionsNavRef.current.scrollLeft = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [isDiaryOpen]);

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [isXRayMode, setIsXRayMode] = useState(false); // X-Ray mode activated exclusively when wearing specs
  const [isWearingSpecs, setIsWearingSpecs] = useState(false); // Wearable specs animation state

  const dayMode = controlledDayMode ?? false;
  const [printedReceipt, setPrintedReceipt] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [focusedTarget, setFocusedTarget] = useState<'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'turntable' | null>(null);
  const [isCardHeld, setIsCardHeld] = useState(false);
  const [, setCardSide] = useState<0 | 1>(0);

  const [isDocketOpen, setIsDocketOpen] = useState(false);
  const [tabletInitialApp, setTabletInitialApp] = useState<TabletAppId>('home');
  const [tabletInitialAddSong, setTabletInitialAddSong] = useState(false);
  const [docketsPrintedCount, setDocketsPrintedCount] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('zynx_dockets_printed_count'));
      return Number.isFinite(saved) && saved > 0 ? saved : 136;
    } catch {
      return 136;
    }
  });
  const [diaryPageCount, setDiaryPageCount] = useState<number>(42);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
  const [activeStickyNoteId, setActiveStickyNoteId] = useState<number | undefined>(undefined);
  const [currentDocketOrder, setCurrentDocketOrder] = useState<DocketOrder | null>(null);
  const [selectedXRayItem, setSelectedXRayItem] = useState<XRayDeskItem | null>(null);
  const [plantWaterCount, setPlantWaterCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zynx_plant_water_count');
      const parsed = saved ? parseInt(saved, 10) : 87;
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 87;
    } catch {
      return 87;
    }
  });
  const [plantLastWateredAt, setPlantLastWateredAt] = useState<number | null>(() => {
    try {
      const saved = Number(localStorage.getItem('zynx_plant_last_watered_at'));
      return Number.isFinite(saved) && saved > 0 ? saved : null;
    } catch {
      return null;
    }
  });
  const [waterDropAnim, setWaterDropAnim] = useState(false);
  const [badgePositions, setBadgePositions] = useState<Record<number, { x: number; y: number; visible: boolean }>>({});
  const mouseParallaxRef = useRef({ x: 0, y: 0 });
  const rCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const receiptTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const handleOpenPhone = useCallback(() => {
    soundFX.playClick();
    if (onOpenPhone) {
      onOpenPhone();
    } else {
      setIsPhoneOpen(true);
    }
  }, [onOpenPhone]);

  // Card Animation & Transform References
  const cardAnimRef = useRef({
    out: 0,
    from: 0,
    to: 0,
    movedAt: 0,
    side: 0,
    flip: 0,
    flipFrom: 0,
    flippedAt: 0,
    glow: 0
  });
  const hasAutoFlippedRef = useRef(false);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const cardMaterialsRef = useRef<{ front: THREE.MeshStandardMaterial; back: THREE.MeshStandardMaterial } | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const lastLaptopRefresh = useRef(0);

  // Synchronized state refs for event listeners and animation loops
  const isMonitorOpenRef = useRef(isMonitorOpen);
  useEffect(() => {
    isMonitorOpenRef.current = isMonitorOpen;
  }, [isMonitorOpen]);

  const focusedTargetRef = useRef(focusedTarget);
  useEffect(() => {
    focusedTargetRef.current = focusedTarget;
  }, [focusedTarget]);

  const isPhoneOpenRef = useRef(isPhoneOpen);
  useEffect(() => {
    isPhoneOpenRef.current = isPhoneOpen;
  }, [isPhoneOpen]);

  const printedReceiptRef = useRef(printedReceipt);
  useEffect(() => {
    printedReceiptRef.current = printedReceipt;
  }, [printedReceipt]);

  const isXRayModeRef = useRef(isXRayMode);
  useEffect(() => {
    isXRayModeRef.current = isXRayMode;
  }, [isXRayMode]);

  const isWearingSpecsRef = useRef(isWearingSpecs);
  useEffect(() => {
    isWearingSpecsRef.current = isWearingSpecs;
  }, [isWearingSpecs]);

  const takeOffSpecs = useCallback(() => {
    soundFX.playClick();
    soundFX.playZoom();
    setIsWearingSpecs(false);
    setIsXRayMode(false);
    setSelectedXRayItem(null);
  }, []);

  const isDocketOpenRef = useRef(isDocketOpen);
  useEffect(() => {
    isDocketOpenRef.current = isDocketOpen;
  }, [isDocketOpen]);

  const isReceiptModalOpenRef = useRef(isReceiptModalOpen);
  useEffect(() => {
    isReceiptModalOpenRef.current = isReceiptModalOpen;
  }, [isReceiptModalOpen]);

  const isStickyNotesOpenRef = useRef(isStickyNotesOpen);
  useEffect(() => {
    isStickyNotesOpenRef.current = isStickyNotesOpen;
  }, [isStickyNotesOpen]);

  const selectedXRayItemRef = useRef(selectedXRayItem);
  useEffect(() => {
    selectedXRayItemRef.current = selectedXRayItem;
  }, [selectedXRayItem]);

  // Wireframe toggle across the desk when wearing X-Ray spectacles
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if ('wireframe' in mat && mat !== cardMaterialsRef.current?.front && mat !== cardMaterialsRef.current?.back) {
              mat.wireframe = isXRayMode;
            }
          });
        } else {
          if ('wireframe' in child.material && child.material !== cardMaterialsRef.current?.front && child.material !== cardMaterialsRef.current?.back) {
            child.material.wireframe = isXRayMode;
          }
        }
      }
    });
  }, [isXRayMode]);

  const triggerFlip = useCallback((side: 0 | 1, delay: number = 0) => {
    const w = cardAnimRef.current;
    w.flipFrom = w.flip;
    w.side = side;
    w.flippedAt = performance.now() + delay;
    if (delay > 0) {
      window.setTimeout(() => soundFX.playCardFlip(), delay);
    } else {
      soundFX.playCardFlip();
    }
    setCardSide(side);
  }, []);

  const takeCard = useCallback(() => {
    const w = cardAnimRef.current;
    if (w.to === 1) return;
    w.from = w.out;
    w.to = 1;
    w.movedAt = performance.now();
    hasAutoFlippedRef.current = false;
    soundFX.playCardPickup();
    setIsCardHeld(true);
  }, []);

  const putDownCard = useCallback(() => {
    const w = cardAnimRef.current;
    if (w.to === 0 && w.out === 0) return;
    w.from = w.out;
    w.to = 0;
    w.movedAt = performance.now();
    hasAutoFlippedRef.current = false;
    if (w.side === 1) {
      triggerFlip(0, 1050 * 0.35);
    }
    soundFX.playCardPutdown();
    setIsCardHeld(false);
  }, [triggerFlip]);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lampLightRef = useRef<THREE.PointLight | null>(null);
  const daySunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Wearable Spectacles Animation References
  const specsWearProgressRef = useRef<number>(0.0);
  const isWireframeOnRef = useRef<boolean>(false);
  const glassesGroupRef = useRef<THREE.Group | null>(null);
  const leftTempleRef = useRef<THREE.Mesh | null>(null);
  const rightTempleRef = useRef<THREE.Mesh | null>(null);
  const isCameraTransitioningRef = useRef<boolean>(false);

  // Succulent plant bounce & leaf sway references
  const plantBounceRef = useRef<number>(0);
  const succulentLeavesRef = useRef<THREE.Mesh[]>([]);
  const plantWaterCountRef = useRef(plantWaterCount);
  useEffect(() => {
    plantWaterCountRef.current = plantWaterCount;
  }, [plantWaterCount]);
  const plantLastWateredRef = useRef(plantLastWateredAt);
  useEffect(() => {
    plantLastWateredRef.current = plantLastWateredAt;
  }, [plantLastWateredAt]);
  const zoroHeadRef = useRef<THREE.Group | null>(null);
  const zoroWobbleRef = useRef({ angle: 0, speed: 0, tilt: 0, tiltSpeed: 0 });
  const turntableRecordRef = useRef<THREE.Group | null>(null);
  const turntableTonearmRef = useRef<THREE.Group | null>(null);
  const turntableLedMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const turntableDrawLabelRef = useRef<((accentHex?: string, playing?: boolean) => void) | null>(null);

  useEffect(() => {
    fetchLiveDiaryEntries().then(({ entries }) => {
      if (entries.length > 0) setDiaryPageCount(entries.length);
    }).catch(() => {});
  }, [isDiaryOpen]);

  useEffect(() => {
    turntableDrawLabelRef.current?.('#090a0d', isMusicPlaying);
    if (turntableLedMatRef.current) {
      turntableLedMatRef.current.color.setHex(isMusicPlaying ? 0x22c55e : 0x3b82f6);
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (!openTabletAppSignal) return;
    setTabletInitialApp(openTabletAppSignal.app);
    setTabletInitialAddSong(Boolean(openTabletAppSignal.addSong));
    setIsDocketOpen(true);
  }, [openTabletAppSignal]);

  // Receipt paper mesh reference
  const receiptPaperMeshRef = useRef<THREE.Mesh | null>(null);
  const receiptAnimRef = useRef<number>(0);

  // Steam particle system
  const steamParticlesRef = useRef<THREE.Points | null>(null);

  // Target Camera Interpolation Ref
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0.0, 0.95, 1.45));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0.0, 0.32, 0.0));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;
    const renderQuality = getRenderQuality(width);

    // 1. Scene & Camera Setup (Responsive framing)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialFrame = getResponsiveCameraFrame(width, height);
    const initialAspect = width / Math.max(1, height);
    const initialFov = getResponsiveCameraFov(initialAspect);
    const camera = new THREE.PerspectiveCamera(initialFov, initialAspect, 0.1, 100);
    camera.position.copy(initialFrame.pos);
    camera.lookAt(initialFrame.lookAt);
    targetCamPos.current.copy(initialFrame.pos);
    targetLookAt.current.copy(initialFrame.lookAt);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(renderQuality.pixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Controls - Fully Free-Size Movable (No sticking, no snap-back, free zoom & full 360 orbit)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.85;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.enablePan = true;
    controls.panSpeed = 0.85;
    controls.screenSpacePanning = true;
    // Free-size zoom range: inspect close-up to wide full-room overview
    controls.minDistance = 0.10;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.target.copy(initialFrame.lookAt);
    controlsRef.current = controls;

    // Release programmatic camera transitions immediately upon user manual interaction
    controls.addEventListener('start', () => {
      isCameraTransitioningRef.current = false;
    });

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, dayMode ? 1.15 : 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, dayMode ? 1.85 : 1.2);
    keyLight.position.set(1.5, 3.5, 2.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(renderQuality.shadowMapSize, renderQuality.shadowMapSize);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    daySunLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.6);
    fillLight.position.set(-2, 1.5, 1);
    scene.add(fillLight);

    // Warm Mushroom Desk Lamp Point Light (Back of table)
    const lampLight = new THREE.PointLight(0xffaa55, lampOn ? 3.6 : 0.0, 1.8, 1.8);
    lampLight.position.set(0.58, 0.34, -0.24);
    lampLight.castShadow = true;
    lampLight.shadow.bias = -0.001;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // 3. Materials
    const woodTexture = createOakTexture();
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1.6, 1.0);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: woodTexture,
      roughness: 0.78,
      metalness: 0.0,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: 0x77736d,
      roughness: 0.48,
      metalness: 0.56,
    });

    const laptopAlu = new THREE.MeshStandardMaterial({
      color: 0xd9dee4,
      roughness: 0.27,
      metalness: 0.56,
    });

    const blackPlastic = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.38,
      metalness: 0.2,
    });

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.18,
      metalness: 0.05,
    });

    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xd97757,
      roughness: 0.7,
      metalness: 0.0,
    });

    const diaryLeather = new THREE.MeshStandardMaterial({
      color: 0x09090c,
      roughness: 0.56,
      metalness: 0.05,
    });

    const silverMetal = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });

    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba,
      roughness: 0.28,
      metalness: 0.05,
      emissive: lampOn ? 0xff8833 : 0x000000,
      emissiveIntensity: lampOn ? 0.6 : 0.0,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: dayMode ? 0xf1e9dd : 0x242220,
      roughness: 0.88,
      metalness: 0.0,
    });

    const interactiveObjects: THREE.Object3D[] = [];

    const registerClickable = (obj: THREE.Object3D, name: string) => {
      obj.userData = { clickableName: name };
      interactiveObjects.push(obj);
    };

    // 4. Back Wall & Ambient Room
    const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), wallMat);
    wallMesh.position.set(0.0, 0.75, -0.34);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    // Wall Sticky Notes (High-contrast post-it notes with drop shadow & tape strip)
    const stickyColors = [0xffd500, 0xf43f5e, 0x0284c7, 0x10b981];
    const stickyPositions = [
      [-0.20, 0.52, -0.334],
      [-0.13, 0.47, -0.334],
      [0.16, 0.53, -0.334],
      [0.23, 0.48, -0.334]
    ];
    stickyPositions.forEach(([sx, sy, sz], idx) => {
      const rotZ = idx % 2 === 0 ? 0.05 : -0.06;

      // Soft drop shadow backing for clear contrast in light mode
      const shadowBacking = new THREE.Mesh(
        new THREE.PlaneGeometry(0.064, 0.064),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: dayMode ? 0.28 : 0.45 })
      );
      shadowBacking.position.set(sx + 0.002, sy - 0.002, sz - 0.003);
      shadowBacking.rotation.z = rotZ;
      scene.add(shadowBacking);

      // Note body (thin box for realistic edge definition)
      const note = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.002),
        new THREE.MeshStandardMaterial({
          color: stickyColors[idx % stickyColors.length],
          roughness: 0.55,
          metalness: 0.02
        })
      );
      note.position.set(sx, sy, sz);
      note.rotation.z = rotZ;
      note.castShadow = true;
      note.userData = { clickableName: 'notes', noteId: idx + 1 };
      interactiveObjects.push(note);
      scene.add(note);

      // Top frosted adhesive tape strip
      const tape = new THREE.Mesh(
        new THREE.PlaneGeometry(0.024, 0.008),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65,
          roughness: 0.3
        })
      );
      tape.position.set(sx, sy + 0.028, sz + 0.002);
      tape.rotation.z = rotZ - 0.02;
      scene.add(tape);
    });

    // 5. Desk Top & Chamfers
    const deskTop = new THREE.Mesh(
      new RoundedBoxGeometry(1.35, 0.038, 0.68, 3, 0.012),
      woodMat
    );
    deskTop.position.set(0.0, 0.15, 0.0);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    scene.add(deskTop);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.50, 16);
    const legPositions = [
      [-0.60, -0.10, -0.28],
      [0.60, -0.10, -0.28],
      [-0.60, -0.10, 0.28],
      [0.60, -0.10, 0.28]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // 6. Dynamic Canvas Textures
    // 6a. Live Laptop Screen Texture: Z OS Live Display
    const laptopCanvas = document.createElement('canvas');
    laptopCanvas.width = 1280;
    laptopCanvas.height = 800;
    const lCtx = laptopCanvas.getContext('2d');
    if (lCtx) {
      let initialTime = '1:20 am';
      try {
        initialTime = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(new Date()).toLowerCase();
      } catch {}
      drawLiveLaptopDisplay(lCtx, initialTime, 0);
    }
    const laptopTexture = new THREE.CanvasTexture(laptopCanvas);
    laptopTexture.colorSpace = THREE.SRGBColorSpace;
    laptopTexture.generateMipmaps = true;
    laptopTexture.minFilter = THREE.LinearMipmapLinearFilter;
    laptopTexture.magFilter = THREE.LinearFilter;
    laptopTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 6b. Tablet Screen Texture: Pradip-inspired illustrated hills wallpaper + iPadOS dock
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 680;
    tabletCanvas.height = 480;
    const tCtx = tabletCanvas.getContext('2d');
    if (tCtx) {
      const skyGrad = tCtx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, '#60a5fa');
      skyGrad.addColorStop(0.55, '#93c5fd');
      skyGrad.addColorStop(1, '#dbeafe');
      tCtx.fillStyle = skyGrad;
      tCtx.fillRect(0, 0, 680, 480);

      // Puffy illustrated clouds
      tCtx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      [
        [95, 76, 44], [140, 66, 56], [190, 80, 38],
        [330, 82, 52], [385, 64, 64], [445, 78, 46],
        [565, 90, 50], [625, 75, 58],
      ].forEach(([cx, cy, r]) => {
        tCtx.beginPath();
        tCtx.arc(cx, cy, r, 0, Math.PI * 2);
        tCtx.fill();
      });

      // Rolling layered green hills
      tCtx.fillStyle = '#4ade80';
      tCtx.beginPath();
      tCtx.moveTo(0, 290);
      tCtx.quadraticCurveTo(170, 220, 340, 275);
      tCtx.quadraticCurveTo(510, 325, 680, 250);
      tCtx.lineTo(680, 480);
      tCtx.lineTo(0, 480);
      tCtx.closePath();
      tCtx.fill();

      tCtx.fillStyle = '#22c55e';
      tCtx.beginPath();
      tCtx.moveTo(0, 330);
      tCtx.quadraticCurveTo(190, 285, 390, 335);
      tCtx.quadraticCurveTo(540, 365, 680, 305);
      tCtx.lineTo(680, 480);
      tCtx.lineTo(0, 480);
      tCtx.closePath();
      tCtx.fill();

      tCtx.fillStyle = '#16a34a';
      tCtx.beginPath();
      tCtx.moveTo(0, 385);
      tCtx.quadraticCurveTo(260, 345, 680, 375);
      tCtx.lineTo(680, 480);
      tCtx.lineTo(0, 480);
      tCtx.closePath();
      tCtx.fill();

      // Sun-kissed dirt footpath
      tCtx.fillStyle = 'rgba(217, 119, 6, 0.72)';
      tCtx.beginPath();
      tCtx.moveTo(295, 480);
      tCtx.quadraticCurveTo(325, 395, 322, 360);
      tCtx.lineTo(356, 360);
      tCtx.quadraticCurveTo(368, 410, 390, 480);
      tCtx.closePath();
      tCtx.fill();

      // Top status bar text
      tCtx.fillStyle = 'rgba(255,255,255,0.92)';
      tCtx.font = 'bold 12px sans-serif';
      tCtx.fillText('iPad OS · Desk Hub', 22, 28);
      tCtx.fillText('100%', 622, 28);

      // Right mini frosted "On my desk" card
      tCtx.fillStyle = 'rgba(255,255,255,0.9)';
      tCtx.beginPath();
      tCtx.roundRect(458, 224, 198, 128, 16);
      tCtx.fill();
      tCtx.fillStyle = '#0f172a';
      tCtx.font = 'bold 13px sans-serif';
      tCtx.fillText('On my desk', 474, 248);
      tCtx.fillStyle = '#475569';
      tCtx.font = '11px sans-serif';
      tCtx.fillText('Waterings · Docket · Music', 474, 272);
      tCtx.fillStyle = '#2F5BEA';
      tCtx.beginPath();
      tCtx.roundRect(474, 294, 166, 36, 18);
      tCtx.fill();
      tCtx.fillStyle = '#ffffff';
      tCtx.font = 'bold 12px sans-serif';
      tCtx.fillText('Open my diary', 514, 316);

      // Centered White Frosted App Dock (3 icons: Docket, Permanent QR, Player)
      tCtx.fillStyle = 'rgba(255,255,255,0.88)';
      tCtx.beginPath();
      tCtx.roundRect(216, 386, 248, 70, 22);
      tCtx.fill();

      // 1. DM Docket Icon
      tCtx.fillStyle = '#2563eb';
      tCtx.beginPath();
      tCtx.roundRect(238, 399, 44, 44, 12);
      tCtx.fill();
      tCtx.fillStyle = '#ffffff';
      tCtx.font = 'bold 16px sans-serif';
      tCtx.fillText('DM', 247, 427);

      // 2. Permanent QR Icon
      tCtx.fillStyle = '#111318';
      tCtx.beginPath();
      tCtx.roundRect(318, 399, 44, 44, 12);
      tCtx.fill();
      tCtx.fillStyle = '#ffffff';
      tCtx.font = 'bold 16px monospace';
      tCtx.fillText('QR', 329, 427);

      // 3. Zynx Player Icon
      tCtx.fillStyle = '#0f172a';
      tCtx.beginPath();
      tCtx.roundRect(398, 399, 44, 44, 12);
      tCtx.fill();
      tCtx.fillStyle = '#22c55e';
      tCtx.beginPath();
      tCtx.arc(420, 421, 12, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.fillStyle = '#ffffff';
      tCtx.beginPath();
      tCtx.arc(420, 421, 4, 0, Math.PI * 2);
      tCtx.fill();
    }
    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    tabletTexture.colorSpace = THREE.SRGBColorSpace;
    tabletTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 6c. Receipt Paper Texture
    const receiptCanvas = document.createElement('canvas');
    receiptCanvas.width = 320;
    receiptCanvas.height = 720;
    const rCtx = receiptCanvas.getContext('2d');
    rCtxRef.current = rCtx;
    if (rCtx) {
      drawReceiptOnCanvas(rCtx, currentDocketOrder);
    }
    const receiptTexture = new THREE.CanvasTexture(receiptCanvas);
    receiptTexture.colorSpace = THREE.SRGBColorSpace;
    receiptTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    receiptTextureRef.current = receiptTexture;

    // 6d. Phone Screen Texture: Crisp Live Website Mobile Portal (matching Pradip Labs video 00:48)
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 400;
    phoneCanvas.height = 800;
    const pCtx = phoneCanvas.getContext('2d');
    if (pCtx) {
      // Clean Material light background
      pCtx.fillStyle = '#f8fafc';
      pCtx.fillRect(0, 0, 400, 800);

      // Status bar + Dynamic Island
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, 400, 56);
      pCtx.fillStyle = '#0f172a';
      pCtx.font = 'bold 14px sans-serif';
      pCtx.fillText('9:41', 26, 36);
      pCtx.fillText('5G', 346, 36);
      pCtx.fillStyle = '#000000';
      pCtx.beginPath();
      pCtx.roundRect(142, 14, 116, 26, 13);
      pCtx.fill();

      // Browser URL + Green Live pill
      pCtx.fillStyle = '#f1f5f9';
      pCtx.beginPath();
      pCtx.roundRect(18, 66, 250, 34, 10);
      pCtx.fill();
      pCtx.fillStyle = '#334155';
      pCtx.font = '12px monospace';
      pCtx.fillText('smenglishschool.vercel', 30, 88);

      pCtx.fillStyle = '#16a34a';
      pCtx.beginPath();
      pCtx.roundRect(276, 66, 106, 34, 17);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 12px sans-serif';
      pCtx.fillText('AI / Chat', 302, 88);

      // Dark Hero Site Banner
      pCtx.fillStyle = '#11151d';
      pCtx.beginPath();
      pCtx.roundRect(18, 116, 364, 118, 16);
      pCtx.fill();
      pCtx.fillStyle = '#4ade80';
      pCtx.font = 'bold 11px monospace';
      pCtx.fillText('● LIVE WEBSITE ON PHONE', 34, 142);
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 20px sans-serif';
      pCtx.fillText('S.M. English School', 34, 172);
      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Admissions, Labs & Z Card Showcase', 34, 198);

      // Search Input Box
      pCtx.fillStyle = '#ffffff';
      pCtx.beginPath();
      pCtx.roundRect(18, 248, 364, 42, 12);
      pCtx.fill();
      pCtx.strokeStyle = '#cbd5e1';
      pCtx.lineWidth = 1.5;
      pCtx.stroke();
      pCtx.fillStyle = '#64748b';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Search live projects & pages...', 36, 274);

      // Featured Campus / Project Card
      pCtx.fillStyle = '#ffffff';
      pCtx.beginPath();
      pCtx.roundRect(18, 306, 364, 244, 18);
      pCtx.fill();
      pCtx.strokeStyle = '#e2e8f0';
      pCtx.stroke();

      // Thumbnail area
      const cardGrad = pCtx.createLinearGradient(30, 318, 370, 448);
      cardGrad.addColorStop(0, '#0f172a');
      cardGrad.addColorStop(1, '#1e3a8a');
      pCtx.fillStyle = cardGrad;
      pCtx.beginPath();
      pCtx.roundRect(30, 318, 340, 126, 12);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 17px sans-serif';
      pCtx.fillText('Admissions 2026 & Campus Web', 48, 384);
      pCtx.fillStyle = '#38bdf8';
      pCtx.font = '12px monospace';
      pCtx.fillText('Astro · Tailwind · Supabase', 48, 408);

      // Card bottom title + Enquire/Details buttons
      pCtx.fillStyle = '#0f172a';
      pCtx.font = 'bold 16px sans-serif';
      pCtx.fillText('Z Card v0.1 Smart Card', 32, 474);
      pCtx.fillStyle = '#16a34a';
      pCtx.beginPath();
      pCtx.roundRect(32, 492, 164, 40, 10);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 14px sans-serif';
      pCtx.fillText('Open Live', 82, 517);

      pCtx.fillStyle = '#f1f5f9';
      pCtx.beginPath();
      pCtx.roundRect(208, 492, 160, 40, 10);
      pCtx.fill();
      pCtx.fillStyle = '#0f172a';
      pCtx.fillText('Details', 266, 517);

      // Second preview card
      pCtx.fillStyle = '#ffffff';
      pCtx.beginPath();
      pCtx.roundRect(18, 566, 364, 160, 18);
      pCtx.fill();
      pCtx.strokeStyle = '#e2e8f0';
      pCtx.stroke();
      pCtx.fillStyle = '#0f172a';
      pCtx.font = 'bold 16px sans-serif';
      pCtx.fillText('7YNX Sound Lab & AI Chat', 34, 602);
      pCtx.fillStyle = '#64748b';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Tap phone to scroll live pages', 34, 630);

      // Floating green circular chat icon
      pCtx.fillStyle = '#16a34a';
      pCtx.beginPath();
      pCtx.arc(348, 684, 24, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 14px sans-serif';
      pCtx.fillText('AI', 340, 689);
    }
    const phoneTexture = new THREE.CanvasTexture(phoneCanvas);
    phoneTexture.colorSpace = THREE.SRGBColorSpace;
    phoneTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // 6e. Business Card Canvas Textures (Brushed Titanium Front & Interactive Contact Back)
    const cardFrontCanvas = document.createElement('canvas');
    cardFrontCanvas.width = CARD_WIDTH;
    cardFrontCanvas.height = CARD_HEIGHT;
    const cfCtx = cardFrontCanvas.getContext('2d');

    const cardBackCanvas = document.createElement('canvas');
    cardBackCanvas.width = CARD_WIDTH;
    cardBackCanvas.height = CARD_HEIGHT;
    const cbCtx = cardBackCanvas.getContext('2d');

    const cardFrontTex = new THREE.CanvasTexture(cardFrontCanvas);
    cardFrontTex.colorSpace = THREE.SRGBColorSpace;
    cardFrontTex.anisotropy = 8;

    const cardBackTex = new THREE.CanvasTexture(cardBackCanvas);
    cardBackTex.colorSpace = THREE.SRGBColorSpace;
    cardBackTex.anisotropy = 8;

    const cardAvatarImg = new Image();
    cardAvatarImg.crossOrigin = 'anonymous';
    cardAvatarImg.src = '/images/profile_avatar.webp';
    cardAvatarImg.onload = () => {
      if (cfCtx && cbCtx) {
        drawCardFront(cfCtx, cardAvatarImg);
        drawCardBack(cbCtx, cardAvatarImg);
        cardFrontTex.needsUpdate = true;
        cardBackTex.needsUpdate = true;
      }
    };
    if (cfCtx && cbCtx) {
      drawCardFront(cfCtx, null);
      drawCardBack(cbCtx, null);
      cardFrontTex.needsUpdate = true;
      cardBackTex.needsUpdate = true;
    }
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load('600 62px Inter').then(() => {
        if (cfCtx && cbCtx) {
          drawCardFront(cfCtx, cardAvatarImg.complete ? cardAvatarImg : null);
          drawCardBack(cbCtx, cardAvatarImg.complete ? cardAvatarImg : null);
          cardFrontTex.needsUpdate = true;
          cardBackTex.needsUpdate = true;
        }
      }).catch(() => {});
    }

    // 7. Apple MacBook Pro 14" (Curved CNC Unibody Base, Keyboard Deck, & Curved Retina Display)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.0, 0.169, -0.04);

    // 4 low-profile black rubber feet lifting the curved aluminum unibody off the desk
    const footMat = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.75, metalness: 0.05 });
    const footGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.0014, 16);
    [
      [-0.124, 0.0007, -0.078],
      [0.124, 0.0007, -0.078],
      [-0.124, 0.0007, 0.078],
      [0.124, 0.0007, 0.078],
    ].forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(fx, fy, fz);
      laptopGroup.add(foot);
    });

    // Precision CNC-milled curved unibody base with true 13mm corner curves & beveled outer lip
    const laptopBaseGeo = createRoundedSlabGeometry(0.314, 0.214, 0.013, 0.0046, 0.0022, 0.0024);
    laptopBaseGeo.rotateX(-Math.PI / 2);
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopAlu);
    laptopBase.position.y = 0.0053;
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptopGroup.add(laptopBase);

    // Signature curved anodized front thumb scoop nestled smoothly into the front lip
    const wellDarkMat = new THREE.MeshStandardMaterial({ color: 0x0e1014, roughness: 0.54, metalness: 0.16 });
    const frontGrooveGeo = createRoundedSlabGeometry(0.054, 0.007, 0.0035, 0.0016, 0.0004, 0.0005);
    frontGrooveGeo.rotateX(-Math.PI / 2);
    const frontGroove = new THREE.Mesh(frontGrooveGeo, wellDarkMat);
    frontGroove.position.set(0.0, 0.0091, 0.1066);
    laptopGroup.add(frontGroove);

    // Side edge ports along curved flanks: MagSafe 3 + Dual Thunderbolt, HDMI + USB-C + SDXC
    const portMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.4, metalness: 0.3 });
    const portSizes: [number, number, number, number, number][] = [
      [-0.1594, 0.0053, -0.066, 0.011, 0.0030],
      [-0.1594, 0.0053, -0.043, 0.008, 0.0022],
      [-0.1594, 0.0053, -0.027, 0.008, 0.0022],
      [0.1594, 0.0053, -0.060, 0.012, 0.0028],
      [0.1594, 0.0053, -0.039, 0.008, 0.0022],
      [0.1594, 0.0053, -0.014, 0.019, 0.0020],
    ];
    portSizes.forEach(([px, py, pz, pLen, pH]) => {
      const port = new THREE.Mesh(new THREE.BoxGeometry(0.001, pH, pLen), portMat);
      port.position.set(px, py, pz);
      laptopGroup.add(port);
    });

    // Blackout anodized Magic Keyboard recessed well with curved corners matching the palm rest
    const keyboardWellGeo = createRoundedSlabGeometry(0.244, 0.104, 0.0068, 0.0010, 0.0003, 0.0004);
    keyboardWellGeo.rotateX(-Math.PI / 2);
    const keyboard = new THREE.Mesh(keyboardWellGeo, wellDarkMat);
    keyboard.position.set(0.0, 0.0094, -0.032);
    laptopGroup.add(keyboard);

    // Authentic 6-row MacBook Pro keyboard: Full Function row + QWERTY rows + Modifier bottom row + Touch ID
    const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.46, metalness: 0.08 });
    const keyGeometry = new RoundedBoxGeometry(0.0132, 0.0014, 0.0122, 1, 0.0015);
    const alphaRows = [
      { z: -0.056, count: 13, startX: -0.108, spacing: 0.0168 },
      { z: -0.041, count: 13, startX: -0.102, spacing: 0.0168 },
      { z: -0.026, count: 12, startX: -0.097, spacing: 0.0168 },
      { z: -0.011, count: 11, startX: -0.088, spacing: 0.0168 },
    ];
    const fnCount = 12;
    const totalStandardKeys = fnCount + alphaRows.reduce((acc, r) => acc + r.count, 0);
    const keyCaps = new THREE.InstancedMesh(keyGeometry, keyMaterial, totalStandardKeys);
    const keyTransform = new THREE.Object3D();
    let keyIndex = 0;

    for (let col = 0; col < fnCount; col += 1) {
      keyTransform.position.set(-0.088 + col * 0.0166, 0.0103, -0.072);
      keyTransform.rotation.set(0, 0, 0);
      keyTransform.scale.set(0.98, 0.85, 0.72);
      keyTransform.updateMatrix();
      keyCaps.setMatrixAt(keyIndex, keyTransform.matrix);
      keyIndex += 1;
    }

    alphaRows.forEach((row) => {
      for (let col = 0; col < row.count; col += 1) {
        keyTransform.position.set(row.startX + col * row.spacing, 0.0105, row.z);
        keyTransform.rotation.set(0, 0, 0);
        keyTransform.scale.set(1, 1, 1);
        keyTransform.updateMatrix();
        keyCaps.setMatrixAt(keyIndex, keyTransform.matrix);
        keyIndex += 1;
      }
    });
    keyCaps.instanceMatrix.needsUpdate = true;
    keyCaps.castShadow = false;
    keyCaps.receiveShadow = false;
    laptopGroup.add(keyCaps);

    // Wide MacBook special keys (Esc, Touch ID key, Spacebar, Modifiers & Inverted-T Arrow cluster)
    const wideKeys: [number, number, number, number, number][] = [
      [-0.107, 0.0103, -0.072, 0.020, 0.0088],
      [0.111, 0.0103, -0.072, 0.011, 0.0088],
      [0.111, 0.0105, -0.056, 0.018, 0.0122],
      [-0.111, 0.0105, -0.041, 0.018, 0.0122],
      [-0.109, 0.0105, -0.026, 0.021, 0.0122],
      [0.107, 0.0105, -0.026, 0.022, 0.0122],
      [-0.105, 0.0105, -0.011, 0.029, 0.0122],
      [0.103, 0.0105, -0.011, 0.030, 0.0122],
      [-0.088, 0.0105, 0.004, 0.056, 0.0122],
      [-0.047, 0.0105, 0.004, 0.019, 0.0122],
      [0.0, 0.0105, 0.004, 0.072, 0.0122],
      [0.048, 0.0105, 0.004, 0.019, 0.0122],
      [0.068, 0.0105, 0.004, 0.014, 0.0122],
      [0.098, 0.0103, 0.001, 0.012, 0.0056],
      [0.098, 0.0103, 0.0072, 0.012, 0.0056],
      [0.084, 0.0103, 0.0072, 0.012, 0.0056],
      [0.112, 0.0103, 0.0072, 0.012, 0.0056],
    ];
    wideKeys.forEach(([kx, ky, kz, kw, kd]) => {
      const cap = new THREE.Mesh(new RoundedBoxGeometry(kw, 0.0014, kd, 1, 0.0014), keyMaterial);
      cap.position.set(kx, ky, kz);
      laptopGroup.add(cap);
    });

    // Touch ID subtle recessed ring inside top-right key
    const touchIdRing = new THREE.Mesh(
      new THREE.RingGeometry(0.0024, 0.0033, 20),
      new THREE.MeshBasicMaterial({ color: 0x3b404c })
    );
    touchIdRing.rotation.x = -Math.PI / 2;
    touchIdRing.position.set(0.111, 0.0111, -0.072);
    laptopGroup.add(touchIdRing);

    // Flush Curved Micro-Perforated Speaker Grilles flanking keyboard well
    const grilleCanvas = document.createElement('canvas');
    grilleCanvas.width = 64;
    grilleCanvas.height = 256;
    const gCtx = grilleCanvas.getContext('2d');
    if (gCtx) {
      gCtx.fillStyle = '#c8ced6';
      gCtx.fillRect(0, 0, 64, 256);
      gCtx.fillStyle = '#31353e';
      for (let gy = 8; gy < 248; gy += 6) {
        for (let gx = 8; gx < 56; gx += 6) {
          gCtx.fillRect(gx, gy, 2.2, 2.2);
        }
      }
    }
    const grilleTex = new THREE.CanvasTexture(grilleCanvas);
    const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, roughness: 0.45, metalness: 0.35 });
    const speakerGeo = createRoundedPanelGeometry(0.021, 0.102, 0.0035);
    const speakerL = new THREE.Mesh(speakerGeo, grilleMat);
    speakerL.rotation.x = -Math.PI / 2;
    speakerL.position.set(-0.137, 0.0099, -0.032);
    laptopGroup.add(speakerL);
    const speakerR = new THREE.Mesh(speakerGeo, grilleMat);
    speakerR.rotation.x = -Math.PI / 2;
    speakerR.position.set(0.137, 0.0099, -0.032);
    laptopGroup.add(speakerR);

    // Oversized Curved Force Touch Trackpad (true curved glass corners + hairline moat)
    const trackpadSeamGeo = createRoundedSlabGeometry(0.123, 0.078, 0.0075, 0.0004, 0.0001, 0.0002);
    trackpadSeamGeo.rotateX(-Math.PI / 2);
    const trackpadSeam = new THREE.Mesh(
      trackpadSeamGeo,
      new THREE.MeshStandardMaterial({ color: 0x8f96a0, roughness: 0.4, metalness: 0.4 })
    );
    trackpadSeam.position.set(0.0, 0.00975, 0.064);
    laptopGroup.add(trackpadSeam);

    const trackpadGeo = createRoundedSlabGeometry(0.120, 0.075, 0.0070, 0.0005, 0.0001, 0.0002);
    trackpadGeo.rotateX(-Math.PI / 2);
    const trackpad = new THREE.Mesh(
      trackpadGeo,
      new THREE.MeshStandardMaterial({ color: 0xcfd5dd, roughness: 0.24, metalness: 0.45 })
    );
    trackpad.position.set(0.0, 0.00988, 0.064);
    laptopGroup.add(trackpad);

    // Recessed continuous black clutch hinge barrel
    const hingeCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0044, 0.0044, 0.230, 18),
      wellDarkMat
    );
    hingeCylinder.rotation.z = Math.PI / 2;
    hingeCylinder.position.set(0.0, 0.0092, -0.104);
    laptopGroup.add(hingeCylinder);

    // Screen Assembly (Ultra-Slim Curved Apple MacBook Pro Display Lid & Retina Panel)
    const screenHinge = new THREE.Group();
    screenHinge.position.set(0.0, 0.0092, -0.104);
    screenHinge.rotation.x = -0.21;

    // Outer thin anodized aluminum lid with generous 13.5mm rounded top corners & beveled rim
    const screenLidGeo = createRoundedSlabGeometry(0.316, 0.210, 0.0135, 0.0022, 0.0010, 0.0010);
    const screenLid = new THREE.Mesh(screenLidGeo, laptopAlu);
    screenLid.position.set(0.0, 0.107, 0.0);
    screenLid.castShadow = true;
    screenHinge.add(screenLid);

    // Glossy polished dark Apple silhouette on back of lid
    const backLogoCanvas = document.createElement('canvas');
    backLogoCanvas.width = 128;
    backLogoCanvas.height = 128;
    const blCtx = backLogoCanvas.getContext('2d');
    if (blCtx) {
      blCtx.clearRect(0, 0, 128, 128);
      blCtx.fillStyle = '#24272f';
      blCtx.beginPath();
      blCtx.arc(54, 68, 22, Math.PI * 0.38, Math.PI * 1.65);
      blCtx.arc(74, 68, 22, Math.PI * 1.35, Math.PI * 0.62);
      blCtx.fill();
      blCtx.globalCompositeOperation = 'destination-out';
      blCtx.beginPath();
      blCtx.arc(92, 62, 12, 0, Math.PI * 2);
      blCtx.fill();
      blCtx.globalCompositeOperation = 'source-over';
      blCtx.fillStyle = '#24272f';
      blCtx.beginPath();
      blCtx.ellipse(68, 34, 11, 6, -0.68, 0, Math.PI * 2);
      blCtx.fill();
    }
    const backLogoTex = new THREE.CanvasTexture(backLogoCanvas);
    const backLogo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.036, 0.036),
      new THREE.MeshStandardMaterial({ map: backLogoTex, transparent: true, roughness: 0.14, metalness: 0.85 })
    );
    backLogo.rotation.y = Math.PI;
    backLogo.position.set(0, 0.110, -0.0023);
    screenHinge.add(backLogo);

    // Edge-to-Edge Curved Obsidian Display Bezel Glass
    const bezelGlassMat = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.12, metalness: 0.16 });
    const bezelGeo = createRoundedSlabGeometry(0.312, 0.206, 0.0120, 0.0006, 0.0002, 0.0003);
    const bezel = new THREE.Mesh(bezelGeo, bezelGlassMat);
    bezel.position.set(0.0, 0.107, 0.0020);
    screenHinge.add(bezel);

    // Curved Liquid Retina Display Panel (0.302 x 0.189 with 9.5mm rounded screen corners)
    const screenDisplayGeo = createRoundedPanelGeometry(0.302, 0.189, 0.0095);
    const screenDisplay = new THREE.Mesh(
      screenDisplayGeo,
      new THREE.MeshBasicMaterial({
        map: laptopTexture,
        toneMapped: false
      })
    );
    screenDisplay.position.set(0.0, 0.1115, 0.0027);
    screenHinge.add(screenDisplay);

    // Curved-bottom Apple MacBook Pro Camera Notch integrated cleanly at top center (CCW front-facing winding)
    const nw = 0.036;
    const nh = 0.0074;
    const nr = 0.0026;
    const notchShape = new THREE.Shape();
    notchShape.moveTo(-nw / 2, nh / 2);
    notchShape.lineTo(-nw / 2, -nh / 2 + nr);
    notchShape.absarc(-nw / 2 + nr, -nh / 2 + nr, nr, Math.PI, Math.PI * 1.5, false);
    notchShape.lineTo(nw / 2 - nr, -nh / 2);
    notchShape.absarc(nw / 2 - nr, -nh / 2 + nr, nr, -Math.PI / 2, 0, false);
    notchShape.lineTo(nw / 2, nh / 2);
    notchShape.closePath();

    const cameraNotchGeo = new THREE.ShapeGeometry(notchShape, 8);
    const cameraNotch = new THREE.Mesh(cameraNotchGeo, bezelGlassMat);
    cameraNotch.position.set(0.0, 0.2023, 0.0029);
    screenHinge.add(cameraNotch);

    // Coated sapphire FaceTime HD camera lens inside the curved notch
    const camLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.0014, 14),
      new THREE.MeshBasicMaterial({ color: 0x162b4d })
    );
    camLens.position.set(0.0, 0.2023, 0.00315);
    screenHinge.add(camLens);

    // Subtle soft ambient screen glow casting onto the keyboard & trackpad
    const screenGlowLight = new THREE.PointLight(0xb2d2ff, 0.45, 0.5);
    screenGlowLight.position.set(0.0, 0.11, 0.045);
    screenHinge.add(screenGlowLight);

    laptopGroup.add(screenHinge);
    scene.add(laptopGroup);

    registerClickable(laptopBase, 'laptop');
    registerClickable(keyboard, 'laptop');
    registerClickable(trackpad, 'laptop');
    registerClickable(speakerL, 'laptop');
    registerClickable(speakerR, 'laptop');
    registerClickable(screenLid, 'laptop');
    registerClickable(bezel, 'laptop');
    registerClickable(screenDisplay, 'laptop');

    // 8. Curved Apple iPad Pro on Sculpted Brushed-Aluminum Studio Stand (Left of Laptop)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-0.32, 0.169, 0.04);
    tabletGroup.rotation.y = Math.PI / 11;

    const standAluMat = new THREE.MeshStandardMaterial({
      color: 0xd5dade,
      roughness: 0.25,
      metalness: 0.62,
    });
    const standSiliconeMat = new THREE.MeshStandardMaterial({
      color: 0x1b1e24,
      roughness: 0.72,
      metalness: 0.05,
    });

    // Subtle non-slip silicone ring pad under base foot
    const standPadGeo = createRoundedSlabGeometry(0.114, 0.104, 0.012, 0.0005, 0.0002, 0.0002);
    standPadGeo.rotateX(-Math.PI / 2);
    const standPad = new THREE.Mesh(standPadGeo, standSiliconeMat);
    standPad.position.set(0.0, 0.0005, 0.002);
    tabletGroup.add(standPad);

    // Contoured brushed-aluminum curved stand base plate
    const standBaseGeo = createRoundedSlabGeometry(0.118, 0.108, 0.013, 0.0022, 0.0009, 0.0011);
    standBaseGeo.rotateX(-Math.PI / 2);
    const tabletStand = new THREE.Mesh(standBaseGeo, standAluMat);
    tabletStand.position.set(0.0, 0.0024, 0.002);
    tabletStand.castShadow = true;
    tabletStand.receiveShadow = true;
    tabletGroup.add(tabletStand);

    // Sweeping curved brushed-aluminum stand neck rising smoothly to the swivel hinge
    const neckShape = new THREE.Shape();
    neckShape.moveTo(0.036, 0.003);
    neckShape.quadraticCurveTo(0.033, 0.028, 0.022, 0.056);
    neckShape.quadraticCurveTo(0.010, 0.088, 0.000, 0.106);
    neckShape.lineTo(-0.006, 0.104);
    neckShape.quadraticCurveTo(0.004, 0.085, 0.015, 0.054);
    neckShape.quadraticCurveTo(0.025, 0.026, 0.026, 0.003);
    neckShape.closePath();

    const standNeckGeo = new THREE.ExtrudeGeometry(neckShape, {
      depth: 0.054,
      curveSegments: 16,
      bevelEnabled: true,
      bevelThickness: 0.0012,
      bevelSize: 0.0012,
      bevelSegments: 4,
    });
    standNeckGeo.translate(0, 0, -0.027);
    standNeckGeo.rotateY(Math.PI / 2);
    const tabletKickstand = new THREE.Mesh(standNeckGeo, standAluMat);
    tabletKickstand.castShadow = true;
    tabletKickstand.receiveShadow = true;
    tabletGroup.add(tabletKickstand);

    // Precision aluminum swivel hinge barrel connecting stand neck to iPad carrier
    const standHinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0052, 0.0052, 0.064, 18),
      standAluMat
    );
    standHinge.rotation.z = Math.PI / 2;
    standHinge.position.set(0.0, 0.105, 0.004);
    tabletGroup.add(standHinge);

    // Tilted iPad + Contoured Cradle Assembly (pivots around stand hinge cleanly)
    const tabletAssembly = new THREE.Group();
    tabletAssembly.position.set(0.0, 0.108, 0.014);
    tabletAssembly.rotation.x = -0.24;

    // Brushed aluminum back spine & cradle shelf holding bottom of curved iPad
    const cradleSpineGeo = createRoundedSlabGeometry(0.054, 0.114, 0.008, 0.0018, 0.0006, 0.0006);
    const cradleSpine = new THREE.Mesh(cradleSpineGeo, standAluMat);
    cradleSpine.position.set(0.0, -0.025, -0.0044);
    cradleSpine.castShadow = true;
    tabletAssembly.add(cradleSpine);

    // Lower horizontal aluminum support tray with dark silicone cushion lip
    const cradleShelfGeo = createRoundedSlabGeometry(0.088, 0.014, 0.0045, 0.0020, 0.0006, 0.0006);
    cradleShelfGeo.rotateX(-Math.PI / 2);
    const cradleShelf = new THREE.Mesh(cradleShelfGeo, standAluMat);
    cradleShelf.position.set(0.0, -0.0815, 0.0015);
    tabletAssembly.add(cradleShelf);

    const cradleCushionGeo = createRoundedSlabGeometry(0.082, 0.010, 0.003, 0.0008, 0.0002, 0.0002);
    cradleCushionGeo.rotateX(-Math.PI / 2);
    const cradleCushion = new THREE.Mesh(cradleCushionGeo, standSiliconeMat);
    cradleCushion.position.set(0.0, -0.0796, 0.0015);
    tabletAssembly.add(cradleCushion);

    const cradleLipGeo = createRoundedSlabGeometry(0.076, 0.0042, 0.002, 0.0016, 0.0005, 0.0005);
    const cradleLip = new THREE.Mesh(cradleLipGeo, standAluMat);
    cradleLip.position.set(0.0, -0.0794, 0.0074);
    tabletAssembly.add(cradleLip);

    // Ultra-slim curved Apple iPad Pro aluminum unibody shell (~5.2mm with 13mm rounded corners)
    const iPadShellMat = new THREE.MeshStandardMaterial({ color: 0x262930, roughness: 0.34, metalness: 0.45 });
    const tabletBodyGeo = createRoundedSlabGeometry(0.236, 0.156, 0.013, 0.0026, 0.0012, 0.0012);
    const tabletBody = new THREE.Mesh(tabletBodyGeo, iPadShellMat);
    tabletBody.castShadow = true;
    tabletBody.receiveShadow = true;
    tabletAssembly.add(tabletBody);

    // Glossy edge-to-edge obsidian glass display frame (11.5mm curved corners)
    const tabletBezelGeo = createRoundedSlabGeometry(0.232, 0.152, 0.0115, 0.0005, 0.0002, 0.0003);
    const tabletBezel = new THREE.Mesh(
      tabletBezelGeo,
      new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.14, metalness: 0.18 })
    );
    tabletBezel.position.set(0.0, 0.0, 0.0025);
    tabletAssembly.add(tabletBezel);

    // Curved Liquid Retina Display Panel (0.220 x 0.140 with 8.5mm curved display corners)
    const tabletScreenGeo = createRoundedPanelGeometry(0.220, 0.140, 0.0085);
    const tabletScreen = new THREE.Mesh(
      tabletScreenGeo,
      new THREE.MeshBasicMaterial({ map: tabletTexture, toneMapped: false })
    );
    tabletScreen.position.set(0.0, 0.0, 0.0031);
    tabletAssembly.add(tabletScreen);

    // Landscape FaceTime camera lens centered in top glass bezel
    const tabletCamera = new THREE.Mesh(
      new THREE.CircleGeometry(0.0018, 12),
      new THREE.MeshBasicMaterial({ color: 0x162b4d })
    );
    tabletCamera.position.set(0.0, 0.073, 0.0032);
    tabletAssembly.add(tabletCamera);

    // Tactile aluminum volume rocker & power button along curved top-right rim
    const tabletVolumeKeys = new THREE.Mesh(
      new RoundedBoxGeometry(0.024, 0.0025, 0.0036, 1, 0.001),
      standAluMat
    );
    tabletVolumeKeys.position.set(0.088, 0.0792, 0.0);
    tabletAssembly.add(tabletVolumeKeys);

    tabletGroup.add(tabletAssembly);
    scene.add(tabletGroup);
    registerClickable(tabletBody, 'tablet');
    registerClickable(tabletBezel, 'tablet');
    registerClickable(tabletScreen, 'tablet');
    registerClickable(tabletStand, 'tablet');
    registerClickable(tabletKickstand, 'tablet');

    // 9. Receipt Printer (Directly next to tablet, matching pradiplabs.dev)
    const printerGroup = new THREE.Group();
    printerGroup.position.set(-0.52, 0.17, -0.06);

    const printerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.10, 0.14),
      blackPlastic
    );
    printerBody.position.set(0.0, 0.05, 0.0);
    printerBody.castShadow = true;
    printerGroup.add(printerBody);

    // Dark paper feed slot
    const printerSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.008, 0.015),
      blackPlastic
    );
    printerSlot.position.set(0.0, 0.101, -0.02);
    printerGroup.add(printerSlot);

    // Status LED
    const printerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.0035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    printerLed.position.set(0.045, 0.102, 0.045);
    printerGroup.add(printerLed);

    // Printable Receipt Paper (Animated unroll when triggered)
    const paperGeo = new THREE.PlaneGeometry(0.08, 0.18, 12, 36);
    const paperPositions = paperGeo.attributes.position;
    for (let vertex = 0; vertex < paperPositions.count; vertex += 1) {
      const t = (paperPositions.getY(vertex) + 0.09) / 0.18;
      // A shallow curl catches the lamp highlight as the paper feeds out.
      paperPositions.setZ(vertex, Math.sin(t * Math.PI) * 0.018);
    }
    paperPositions.needsUpdate = true;
    paperGeo.computeVertexNormals();
    const paperMat = new THREE.MeshBasicMaterial({ map: receiptTexture, side: THREE.DoubleSide });
    const receiptPaper = new THREE.Mesh(paperGeo, paperMat);
    receiptPaper.position.set(0.0, 0.105, 0.035);
    receiptPaper.rotation.x = Math.PI / 3;
    receiptPaper.scale.set(1, 0.01, 1); // Start tucked inside slot
    printerGroup.add(receiptPaper);
    receiptPaperMeshRef.current = receiptPaper;

    scene.add(printerGroup);
    registerClickable(printerBody, 'printer');
    registerClickable(receiptPaper, 'printer');

    // Printed bills stay beside the printer so the desk reads as a working
    // studio even before the receipt-feed interaction is triggered.
    const billCanvas = document.createElement('canvas');
    billCanvas.width = 320;
    billCanvas.height = 420;
    const billContext = billCanvas.getContext('2d');
    if (billContext) {
      billContext.fillStyle = '#fbf8ef';
      billContext.fillRect(0, 0, billCanvas.width, billCanvas.height);
      billContext.fillStyle = '#262b32';
      billContext.font = 'bold 21px sans-serif';
      billContext.fillText('ZYNX DESK', 22, 42);
      billContext.font = '12px monospace';
      billContext.fillStyle = '#68717c';
      billContext.fillText('SAMPLE DOCKET · 001', 22, 66);
      billContext.strokeStyle = '#c9c4b8';
      billContext.beginPath();
      billContext.moveTo(22, 82);
      billContext.lineTo(298, 82);
      billContext.stroke();
      for (let row = 0; row < 7; row += 1) {
        const y = 112 + row * 28;
        billContext.fillStyle = '#8b9299';
        billContext.fillRect(22, y, 148 + (row % 3) * 24, 4);
        billContext.fillStyle = '#c1c7cd';
        billContext.fillRect(220, y, 76, 4);
      }
      billContext.strokeStyle = '#c9c4b8';
      billContext.beginPath();
      billContext.moveTo(22, 324);
      billContext.lineTo(298, 324);
      billContext.stroke();
      billContext.fillStyle = '#262b32';
      billContext.font = 'bold 15px monospace';
      billContext.fillText('TOTAL  ₹ 0.00', 22, 355);
      billContext.font = '11px sans-serif';
      billContext.fillStyle = '#8b9299';
      billContext.fillText('Interactive sample prop', 22, 385);
    }
    const billTexture = new THREE.CanvasTexture(billCanvas);
    billTexture.colorSpace = THREE.SRGBColorSpace;
    const billStack = new THREE.Group();
    billStack.position.set(-0.37, 0.17, -0.20);
    billStack.rotation.y = -0.18;
    const billPaperMat = new THREE.MeshStandardMaterial({ color: 0xf7f3e9, roughness: 0.9 });
    for (let sheet = 0; sheet < 3; sheet += 1) {
      const page = new THREE.Mesh(new RoundedBoxGeometry(0.105, 0.0015, 0.138, 1, 0.001), billPaperMat);
      page.position.set(sheet * 0.002, 0.002 + sheet * 0.002, sheet * -0.002);
      page.castShadow = sheet === 2;
      billStack.add(page);
    }
    const billFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.098, 0.128),
      new THREE.MeshBasicMaterial({ map: billTexture, toneMapped: false })
    );
    billFace.position.set(0, 0.009, 0);
    billFace.rotation.x = -Math.PI / 2;
    billStack.add(billFace);
    scene.add(billStack);
    registerClickable(billFace, 'printer');

    // The rounded blue speaker from the reference layout opens the radio player.
    // Rounded blue desk speaker from the reference layout.
    const blueSpeaker = createBlueSpeaker();
    scene.add(blueSpeaker.group);
    registerClickable(blueSpeaker.clickable, 'speaker');

    // Roronoa Zoro bobblehead: a small spring-mounted figure that settles after a tap.
    const bobblehead = createBobblehead();
    scene.add(bobblehead.group);
    zoroHeadRef.current = bobblehead.head;
    registerClickable(bobblehead.clickable, 'zoro');

    // The record spins while the desk player is playing.
    const turntable = createTurntable();
    scene.add(turntable.group);
    turntableRecordRef.current = turntable.record;
    turntableTonearmRef.current = turntable.tonearmGroup;
    turntableLedMatRef.current = turntable.ledMaterial;
    turntableDrawLabelRef.current = turntable.drawLabel;
    turntable.drawLabel('#090a0d', musicPlayingRef.current);
    registerClickable(turntable.clickable, 'turntable');

    // 11. Smartphone & Rounded Aluminum Stand (Right of Desk)
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.49, 0.17, -0.05);
    phoneGroup.rotation.y = -Math.PI / 10;

    const standBase = new THREE.Mesh(
      new RoundedBoxGeometry(0.086, 0.006, 0.072, 3, 0.003),
      silverMetal
    );
    standBase.position.set(0.0, 0.003, 0.0);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    phoneGroup.add(standBase);

    const phoneStand = new THREE.Mesh(
      new RoundedBoxGeometry(0.068, 0.095, 0.008, 3, 0.004),
      silverMetal
    );
    phoneStand.position.set(0.0, 0.044, -0.018);
    phoneStand.rotation.x = -0.35;
    phoneStand.castShadow = true;
    phoneGroup.add(phoneStand);

    const phoneBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.078, 0.156, 0.009, 4, 0.012),
      blackPlastic
    );
    phoneBody.position.set(0.0, 0.078, 0.006);
    phoneBody.rotation.x = -0.35;
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);

    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.069, 0.142),
      new THREE.MeshBasicMaterial({ map: phoneTexture })
    );
    phoneScreen.position.set(0.0, 0.078, 0.0112);
    phoneScreen.rotation.x = -0.35;
    phoneGroup.add(phoneScreen);

    scene.add(phoneGroup);
    registerClickable(phoneBody, 'phone');
    registerClickable(phoneScreen, 'phone');
    registerClickable(phoneStand, 'phone');
    registerClickable(standBase, 'phone');

    // 12. Closed Black Hardcover Notebook ("DEATH NOTE")
    const diaryGroup = new THREE.Group();
    diaryGroup.position.set(0.25, 0.169, 0.145);
    diaryGroup.rotation.y = -0.22;

    const noteW = 0.136;
    const noteD = 0.184;
    const boardH = 0.0028;

    // Bottom matte-black hardcover board
    const bottomCover = new THREE.Mesh(
      new RoundedBoxGeometry(noteW, boardH, noteD, 2, 0.0014),
      diaryLeather
    );
    bottomCover.position.set(0, boardH / 2, 0);
    bottomCover.castShadow = true;
    bottomCover.receiveShadow = true;
    diaryGroup.add(bottomCover);

    // Cream bound page block inside closed covers
    const pageBlockMat = new THREE.MeshStandardMaterial({
      color: 0xf1ebd9,
      roughness: 0.92,
      metalness: 0.0,
    });
    const pageBlock = new THREE.Mesh(
      new THREE.BoxGeometry(noteW - 0.007, 0.013, noteD - 0.008),
      pageBlockMat
    );
    pageBlock.position.set(0.002, 0.0092, 0);
    pageBlock.castShadow = true;
    pageBlock.receiveShadow = true;
    diaryGroup.add(pageBlock);

    // Rounded black spine along the left edge of the closed book
    const spineMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0092, 0.0092, noteD, 18),
      diaryLeather
    );
    spineMesh.position.set(-noteW / 2 + 0.001, 0.0092, 0);
    spineMesh.rotation.x = Math.PI / 2;
    spineMesh.castShadow = true;
    diaryGroup.add(spineMesh);

    // Top matte-black hardcover board
    const topCover = new THREE.Mesh(
      new RoundedBoxGeometry(noteW, boardH, noteD, 2, 0.0014),
      diaryLeather
    );
    topCover.position.set(0, 0.0168, 0);
    topCover.castShadow = true;
    topCover.receiveShadow = true;
    diaryGroup.add(topCover);

    // Crisp "DEATH NOTE" front cover CanvasTexture
    const deathNoteCanvas = document.createElement('canvas');
    deathNoteCanvas.width = 512;
    deathNoteCanvas.height = 700;
    const dnCtx = deathNoteCanvas.getContext('2d');
    if (dnCtx) {
      dnCtx.fillStyle = '#09090c';
      dnCtx.fillRect(0, 0, 512, 700);

      // Subtle leather grain speckles & spine crease line
      dnCtx.fillStyle = 'rgba(255, 255, 255, 0.018)';
      for (let i = 0; i < 650; i += 1) {
        const gx = ((i * 97) % 508) + 2;
        const gy = ((i * 151) % 696) + 2;
        dnCtx.fillRect(gx, gy, 2, 2);
      }

      dnCtx.fillStyle = 'rgba(255, 255, 255, 0.045)';
      dnCtx.fillRect(26, 0, 2, 700);

      // Faint inner cover deboss frame
      dnCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      dnCtx.lineWidth = 2;
      dnCtx.strokeRect(36, 26, 452, 648);

      // Bold iconic white serif cover lettering
      dnCtx.textAlign = 'center';
      dnCtx.fillStyle = '#f8fafc';
      dnCtx.font = 'bold 78px Georgia, "Times New Roman", serif';
      dnCtx.fillText('DEATH', 262, 228);
      dnCtx.fillText('NOTE', 262, 314);

      dnCtx.strokeStyle = 'rgba(248, 250, 252, 0.28)';
      dnCtx.lineWidth = 2;
      dnCtx.beginPath();
      dnCtx.moveTo(158, 344);
      dnCtx.lineTo(366, 344);
      dnCtx.stroke();
    }
    const deathNoteTexture = new THREE.CanvasTexture(deathNoteCanvas);
    deathNoteTexture.colorSpace = THREE.SRGBColorSpace;
    deathNoteTexture.anisotropy = 4;

    const coverArtMat = new THREE.MeshStandardMaterial({
      map: deathNoteTexture,
      roughness: 0.62,
      metalness: 0.04,
    });
    const coverArtPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(noteW - 0.004, noteD - 0.004),
      coverArtMat
    );
    coverArtPlane.position.set(0, 0.0184, 0);
    coverArtPlane.rotation.x = -Math.PI / 2;
    coverArtPlane.receiveShadow = true;
    diaryGroup.add(coverArtPlane);

    // Sleek metallic pen resting diagonally across the closed black cover
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.135, 16), silverMetal);
    pen.position.set(0.014, 0.0212, 0.018);
    pen.rotation.x = Math.PI / 2;
    pen.rotation.z = -0.22;
    pen.castShadow = true;
    diaryGroup.add(pen);

    scene.add(diaryGroup);
    registerClickable(bottomCover, 'diary');
    registerClickable(topCover, 'diary');
    registerClickable(spineMesh, 'diary');
    registerClickable(pageBlock, 'diary');
    registerClickable(coverArtPlane, 'diary');
    registerClickable(pen, 'diary');

    // 13. Interactive Walnut Business Card Holder & Brushed Titanium Card
    const cardHolderGroup = new THREE.Group();
    cardHolderGroup.position.set(0.24, 0.169, 0.285);
    cardHolderGroup.rotation.y = 0.12;
    cardGroupRef.current = cardHolderGroup;

    // Walnut Base Block with Chamfered Appearance
    const walnutMat = new THREE.MeshStandardMaterial({
      color: 0x5a3d28,
      roughness: 0.55,
      metalness: 0.05
    });
    const walnutBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.105, 0.016, 0.038),
      walnutMat
    );
    walnutBase.position.set(0, 0.008, 0);
    walnutBase.castShadow = true;
    walnutBase.receiveShadow = true;
    cardHolderGroup.add(walnutBase);
    registerClickable(walnutBase, 'card');

    // Angled Slot recess in walnut block
    const slotMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.006, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x22150d, roughness: 0.8 })
    );
    slotMesh.position.set(0, 0.015, -0.002);
    cardHolderGroup.add(slotMesh);

    // 4 background cards resting in the slot behind the active card
    const stackEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x2e2e32,
      metalness: 0.85,
      roughness: 0.3
    });
    for (let y = 0; y < 4; y++) {
      const stackCard = new THREE.Mesh(
        new THREE.BoxGeometry(CARD_DIM.w, CARD_DIM.h, CARD_DIM.t),
        stackEdgeMat
      );
      stackCard.position.set(
        0,
        CARD_REST_POS.y - (y + 1) * 0.0008,
        CARD_REST_POS.z - (y + 1) * (CARD_DIM.t + 0.0018)
      );
      stackCard.rotation.x = -0.28;
      stackCard.castShadow = true;
      cardHolderGroup.add(stackCard);
    }

    // Active Interactive Card Mesh with 6 materials
    const titaniumEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3e,
      metalness: 0.9,
      roughness: 0.26
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTex,
      metalness: 0.72,
      roughness: 0.36,
      emissive: 0xffffff,
      emissiveMap: cardFrontTex,
      emissiveIntensity: 0.12
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTex,
      metalness: 0.72,
      roughness: 0.36,
      emissive: 0xffffff,
      emissiveMap: cardBackTex,
      emissiveIntensity: 0.12
    });

    cardMaterialsRef.current = { front: frontMat, back: backMat };

    const cardMaterials = [
      titaniumEdgeMat, // +X right
      titaniumEdgeMat, // -X left
      titaniumEdgeMat, // +Y top
      titaniumEdgeMat, // -Y bottom
      frontMat,        // +Z front
      backMat          // -Z back
    ];

    const interactiveCard = new THREE.Mesh(
      new THREE.BoxGeometry(CARD_DIM.w, CARD_DIM.h, CARD_DIM.t),
      cardMaterials
    );
    interactiveCard.position.copy(CARD_REST_POS);
    interactiveCard.quaternion.copy(CARD_REST_ROT);
    interactiveCard.castShadow = true;
    interactiveCard.receiveShadow = true;
    cardHolderGroup.add(interactiveCard);
    cardMeshRef.current = interactiveCard;
    registerClickable(interactiveCard, 'card');

    scene.add(cardHolderGroup);

    // 14. Mushroom Desk Lamp (Moved to the back of the table)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.58, 0.17, -0.24);

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.012, 24),
      new THREE.MeshStandardMaterial({ color: 0xdd8877, roughness: 0.4 })
    );
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 16), silverMetal);
    lampStem.position.set(0.0, 0.075, 0.0);
    lampGroup.add(lampStem);

    const lampDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.082, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      lampShadeMat
    );
    lampDome.position.set(0.0, 0.15, 0.0);
    lampDome.castShadow = true;
    lampGroup.add(lampDome);

    scene.add(lampGroup);
    registerClickable(lampDome, 'lamp');
    registerClickable(lampBase, 'lamp');

    // 15. Ceramic Coffee Mug with Rising Steam (Brought to the Front of the Desk)
    const mugGroup = new THREE.Group();
    mugGroup.position.set(0.39, 0.169, 0.045);
    const mugProfile = [
      new THREE.Vector2(0.0001, 0),
      new THREE.Vector2(0.030, 0),
      new THREE.Vector2(0.036, 0.006),
      new THREE.Vector2(0.040, 0.073),
      new THREE.Vector2(0.037, 0.080),
      new THREE.Vector2(0.033, 0.078),
      new THREE.Vector2(0.032, 0.016),
      new THREE.Vector2(0.027, 0.010),
      new THREE.Vector2(0.0001, 0.010),
    ];
    const mug = new THREE.Mesh(new THREE.LatheGeometry(mugProfile, 32), ceramicMat);
    mug.castShadow = true;
    mug.receiveShadow = true;
    mugGroup.add(mug);
    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0045, 10, 28, Math.PI), ceramicMat);
    mugHandle.position.set(0.039, 0.041, 0);
    mugHandle.rotation.z = Math.PI / 2;
    mugGroup.add(mugHandle);
    const mugRim = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0022, 8, 32), ceramicMat);
    mugRim.rotation.x = Math.PI / 2;
    mugRim.position.y = 0.078;
    mugGroup.add(mugRim);
    const coffeeSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.030, 24),
      new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.24, metalness: 0.04 })
    );
    coffeeSurface.position.y = 0.068;
    coffeeSurface.rotation.x = -Math.PI / 2;
    mugGroup.add(coffeeSurface);
    scene.add(mugGroup);
    registerClickable(mug, 'mug');
    registerClickable(mugHandle, 'mug');
    registerClickable(coffeeSurface, 'mug');

    // Subtle Steam Particles
    const steamCount = 18;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let s = 0; s < steamCount; s++) {
      steamPositions[s * 3] = 0.39 + (Math.random() - 0.5) * 0.03;
      steamPositions[s * 3 + 1] = 0.25 + Math.random() * 0.08;
      steamPositions[s * 3 + 2] = 0.045 + (Math.random() - 0.5) * 0.03;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      map: createSteamPuffTexture(),
      size: 0.036,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    // 16. Tall leafy desk plant, positioned behind the phone like the reference.
    const plantGroup = new THREE.Group();
    plantGroup.position.set(0.34, 0.169, -0.22);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.034, 0.078, 24), terracottaMat);
    pot.position.set(0, 0.039, 0);
    pot.castShadow = true;
    plantGroup.add(pot);

    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.042, 0.003, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xa95840, roughness: 0.62 })
    );
    potRim.rotation.x = Math.PI / 2;
    potRim.position.y = 0.075;
    plantGroup.add(potRim);
    const potSoil = new THREE.Mesh(
      new THREE.CircleGeometry(0.037, 20),
      new THREE.MeshStandardMaterial({ color: 0x30251d, roughness: 0.95 })
    );
    potSoil.rotation.x = -Math.PI / 2;
    potSoil.position.y = 0.078;
    plantGroup.add(potSoil);

    succulentLeavesRef.current = [];
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(-0.014, 0.05, -0.034, 0.105, 0, 0.17);
    leafShape.bezierCurveTo(0.034, 0.105, 0.014, 0.05, 0, 0);
    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.002,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.001,
      bevelThickness: 0.001,
      curveSegments: 5,
    });
    leafGeometry.translate(0, 0, -0.001);
    const leafColors = [0x285f45, 0x347653, 0x4a8b5f, 0x246147];
    const dryLeafColor = new THREE.Color(0x897f5c);
    for (let i = 0; i < BASE_PLANT_LEAVES + NEW_PLANT_LEAVES; i += 1) {
      const healthyLeafColor = new THREE.Color(leafColors[i % leafColors.length]);
      const leafMat = new THREE.MeshStandardMaterial({
        color: healthyLeafColor,
        roughness: 0.42,
        metalness: 0.01,
        side: THREE.DoubleSide,
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMat);
      const fan = (i / (BASE_PLANT_LEAVES + NEW_PLANT_LEAVES - 1) - 0.5) * 1.38;
      leaf.position.set(Math.sin(fan) * 0.014, 0.076 + (i % 3) * 0.003, Math.cos(fan) * 0.012 - 0.006);
      leaf.rotation.set((i % 2 ? 0.16 : -0.12), (i / 10) * Math.PI, fan);
      leaf.castShadow = true;
      leaf.userData = {
        initialRot: leaf.rotation.clone(),
        leafIndex: i,
        healthyColor: healthyLeafColor,
        dryColor: dryLeafColor,
      };
      leaf.visible = i < plantLeafCount(plantWaterCountRef.current);
      plantGroup.add(leaf);
      succulentLeavesRef.current.push(leaf);
    }
    scene.add(plantGroup);
    registerClickable(pot, 'plant');
    registerClickable(plantGroup, 'plant');

    // 17. Framed Photo (Positioned cleanly right of the MacBook so it stays clearly visible)
    const photoGroup = new THREE.Group();
    photoGroup.position.set(0.225, 0.169, -0.185);
    photoGroup.rotation.y = -0.26;

    const photoFrame = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.095, 0.008, 2, 0.003),
      blackPlastic
    );
    photoFrame.position.set(0, 0.047, 0);
    photoFrame.rotation.x = -0.18;
    photoFrame.castShadow = true;
    photoFrame.receiveShadow = true;
    photoGroup.add(photoFrame);

    const photoTexture = new THREE.TextureLoader().load('/images/profile_avatar.webp');
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    const framedPhoto = new THREE.Mesh(
      new THREE.PlaneGeometry(0.064, 0.078),
      new THREE.MeshBasicMaterial({ map: photoTexture, toneMapped: false }),
    );
    framedPhoto.position.set(0, 0.047, 0.0045);
    framedPhoto.rotation.x = -0.18;
    photoGroup.add(framedPhoto);

    const photoStand = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.042, 0.008), blackPlastic);
    photoStand.position.set(0, 0.020, -0.017);
    photoStand.rotation.x = 0.28;
    photoStand.castShadow = true;
    photoGroup.add(photoStand);

    scene.add(photoGroup);
    registerClickable(photoFrame, 'photo');
    registerClickable(framedPhoto, 'photo');
    registerClickable(photoStand, 'photo');

    // 17. Realistic Acetate Designer Spectacles (X-Ray Glasses from pradiplabs.dev)
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(-0.20, 0.171, 0.17);
    glassesGroup.rotation.y = 0.22;
    glassesGroup.rotation.x = -0.04;

    const spectFrameMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.22,
      metalness: 0.18
    });
    const spectLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xb9ccdd,
      metalness: 0.1,
      roughness: 0.04,
      transparent: true,
      opacity: 0.28,
      transmission: 0.86,
      ior: 1.52,
      depthWrite: false
    });
    const spectHingeMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.25,
      metalness: 0.92
    });

    const sR = 0.016;       // lens radius
    const sTube = 0.0022;   // acetate rim tube radius
    const sWide = 1.14;     // wide scale
    const sTall = 0.92;     // tall scale
    const sSeparation = sR * sWide + 0.0055; // 0.0237 from center to each eye piece
    const sCenterY = sR * sTall + sTube;    // vertical offset

    [-1, 1].forEach((side) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * sSeparation, sCenterY, 0);

      // Eye-wire rim (torus scaled to pantos/wayfarer rounded-square shape)
      const rimGeom = new THREE.TorusGeometry(sR, sTube, 16, 48);
      const rimMesh = new THREE.Mesh(rimGeom, spectFrameMat);
      rimMesh.scale.set(sWide, sTall, 1.0);
      rimMesh.castShadow = true;
      rimMesh.receiveShadow = true;
      eyeGroup.add(rimMesh);
      registerClickable(rimMesh, 'glasses');

      // Coated glass lens
      const lensGeom = new THREE.CircleGeometry(sR, 36);
      const lensMesh = new THREE.Mesh(lensGeom, spectLensMat);
      lensMesh.scale.set(sWide, sTall, 1.0);
      eyeGroup.add(lensMesh);
      registerClickable(lensMesh, 'glasses');

      // Outer silver titanium hinge block
      const hingeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.0045, 0.004), spectFrameMat);
      hingeMesh.position.set(side * (sR * sWide + 0.002), 0.002, -0.002);
      eyeGroup.add(hingeMesh);

      // Titanium micro-pin
      const pin1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.004, 8), spectHingeMat);
      pin1.rotation.x = Math.PI / 2;
      pin1.position.set(side * (sR * sWide + 0.002), 0.0035, 0.001);
      eyeGroup.add(pin1);

      // Folded Temple Ear Stem (angled back and across the desk)
      const templeGeom = new THREE.BoxGeometry(0.068, 0.0035, 0.0018);
      const templeMesh = new THREE.Mesh(templeGeom, spectFrameMat);
      const templeX = side === -1 ? 0.012 : -0.012;
      const templeY = side === -1 ? 0.003 : -0.002;
      const templeZ = side === -1 ? -0.026 : -0.028;
      templeMesh.position.set(templeX, templeY, templeZ);
      templeMesh.rotation.y = side * 0.32;
      templeMesh.rotation.z = side * 0.04;
      templeMesh.castShadow = true;
      eyeGroup.add(templeMesh);
      registerClickable(templeMesh, 'glasses');

      if (side === -1) leftTempleRef.current = templeMesh;
      else rightTempleRef.current = templeMesh;

      glassesGroup.add(eyeGroup);
    });

    // Keyhole bridge arch connecting the two rims
    const bridgeGeom = new THREE.TorusGeometry(0.0055, 0.0018, 12, 24, Math.PI);
    const bridgeMesh = new THREE.Mesh(bridgeGeom, spectFrameMat);
    bridgeMesh.position.set(0, sCenterY + 0.003, 0);
    bridgeMesh.castShadow = true;
    glassesGroup.add(bridgeMesh);
    registerClickable(bridgeMesh, 'glasses');

    glassesGroupRef.current = glassesGroup;
    scene.add(glassesGroup);

    // Raycasting Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      // Avoid running raycaster on touch drag to keep mobile orbit butter-smooth at 60/120fps
      if ('pointerType' in e && e.pointerType === 'touch') return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseParallaxRef.current.x = mouse.x;
      mouseParallaxRef.current.y = mouse.y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let rootClickable = intersects[0].object;
        while (rootClickable && !rootClickable.userData?.clickableName && rootClickable.parent) {
          rootClickable = rootClickable.parent;
        }
        const name = rootClickable?.userData?.clickableName || null;
        setHoveredObject(name);
        renderer.domElement.style.cursor = name ? 'pointer' : 'default';
      } else {
        setHoveredObject(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    // Unified Touch & Click Interaction Handler
    const handleInteraction = (clientX: number, clientY: number, targetElem?: HTMLElement) => {
      // Ignore clicks on 2D HTML UI elements so they never trigger 3D empty-space putdown
      if (targetElem?.closest('button, a, input, select, textarea, [role="button"], [data-no-orbit]')) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let rootClickable = intersects[0].object;
        while (rootClickable && !rootClickable.userData?.clickableName && rootClickable.parent) {
          rootClickable = rootClickable.parent;
        }
        const name = rootClickable?.userData?.clickableName;

        // Subtle mobile haptic feedback on interactive item hit
        try {
          if (navigator.vibrate) navigator.vibrate(8);
        } catch {}

        // In X-Ray mode, clicking any 3D object directly selects that item in the Inspector!
        if (isXRayModeRef.current && name) {
          const matchedItem = XRAY_DESK_ITEMS.find((it) => it.key === name);
          if (matchedItem) {
            soundFX.playClick();
            setSelectedXRayItem(matchedItem);
            return;
          }
        }

        if (name === 'card' || name === 'zcard') {
          const w = cardAnimRef.current;
          if (w.out < 0.2) {
            takeCard();
          } else {
            const hit = intersects[0];
            // If on the back face and clicked a contact tile, navigate
            if (hit.face?.materialIndex === 5 && w.side === 1 && hit.uv) {
              const tile = getContactTileAtUV(hit.uv.x, hit.uv.y);
              if (tile) {
                soundFX.playClick();
                if (tile.href.startsWith('mailto:') || tile.href.startsWith('tel:')) {
                  window.location.href = tile.href;
                } else {
                  window.open(tile.href, '_blank', 'noopener,noreferrer');
                }
                return;
              }
            }
            // Otherwise, flip card between front and back
            const nextSide = w.side === 1 ? 0 : 1;
            triggerFlip(nextSide);
          }
        } else if (name === 'diary') {
          soundFX.playClick();
          onOpenDiary();
        } else if (name === 'printer') {
          soundFX.playClick();
          setIsReceiptModalOpen(true);
        } else if (name === 'speaker') {
          soundFX.playClick();
          onToggleMusicRef.current?.();
        } else if (name === 'turntable') {
          soundFX.playClick();
          onToggleMusicPlaybackRef.current?.();
          focusObject('turntable');
        } else if (name === 'zoro') {
          soundFX.playClick();
          zoroWobbleRef.current.speed += 2.4;
          zoroWobbleRef.current.tiltSpeed += 1.1;
        } else if (name === 'lamp') {
          soundFX.playClick();
          setLampOn(prev => {
            const next = !prev;
            if (lampLightRef.current) {
              lampLightRef.current.intensity = next ? 3.6 : 0.0;
            }
            lampShadeMat.emissive.setHex(next ? 0xff8833 : 0x000000);
            lampShadeMat.emissiveIntensity = next ? 0.6 : 0.0;
            return next;
          });
        } else if (name === 'laptop') {
          soundFX.playClick();
          focusObject('laptop');
          setTimeout(() => {
            if (onOpenMonitor) onOpenMonitor();
            else setIsMonitorOpen(true);
          }, 360);
        } else if (name === 'glasses') {
          soundFX.playClick();
          soundFX.playZoom();
          setIsWearingSpecs(prev => {
            const next = !prev;
            if (!next) {
              setIsXRayMode(false);
              setSelectedXRayItem(null);
            }
            return next;
          });
        } else if (name === 'tablet') {
          if (focusedTargetRef.current === 'tablet') {
            soundFX.playClick();
            setTabletInitialApp('home');
            setTabletInitialAddSong(false);
            setIsDocketOpen(true);
          } else {
            focusObject('tablet');
          }
        } else if (name === 'phone') {
          soundFX.playClick();
          handleOpenPhone();
        } else if (name === 'plant') {
          soundFX.playWaterDrop();
          plantBounceRef.current = 1.0;
          const wateredAt = Date.now();
          setPlantLastWateredAt(wateredAt);
          try { localStorage.setItem('zynx_plant_last_watered_at', wateredAt.toString()); } catch {}
          setPlantWaterCount(prev => {
            const next = prev + 1;
            try { localStorage.setItem('zynx_plant_water_count', next.toString()); } catch {}
            return next;
          });
          setWaterDropAnim(true);
          setTimeout(() => setWaterDropAnim(false), 1400);
        } else if (name === 'notes') {
          soundFX.playClick();
          const noteId = rootClickable?.userData?.noteId || 1;
          setActiveStickyNoteId(noteId);
          setIsStickyNotesOpen(true);
        } else if (name === 'mug') {
          soundFX.playClick();
        } else if (name === 'photo') {
          soundFX.playClick();
        }
      } else {
        // Empty space clicked:
        if (isWearingSpecsRef.current) {
          takeOffSpecs();
          return;
        }
        // if card is held, smoothly put it back down
        if (cardAnimRef.current.out > 0.5) {
          putDownCard();
        }
      }
    };

    // Track pointer movement & duration to separate intentional taps from camera orbit gestures
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = performance.now();
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      const duration = performance.now() - pointerStartTime;

      // Reliable tap threshold (< 14px displacement, < 480ms hold)
      if (dist < 14 && duration < 480) {
        const now = performance.now();
        // Double-tap detected: trigger smooth camera reset to responsive framing
        if (now - lastTapTime < 320 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 22) {
          lastTapTime = 0;
          try {
            if (navigator.vibrate) navigator.vibrate(12);
          } catch {}
          focusObject('reset');
          return;
        }
        lastTapTime = now;
        lastTapX = e.clientX;
        lastTapY = e.clientY;

        handleInteraction(e.clientX, e.clientY, e.target as HTMLElement);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isWearingSpecsRef.current) {
          e.preventDefault();
          takeOffSpecs();
          return;
        }
        // Close modals in priority order
        if (isStickyNotesOpenRef.current) {
          e.preventDefault();
          setIsStickyNotesOpen(false);
          return;
        }
        if (isReceiptModalOpenRef.current) {
          e.preventDefault();
          setIsReceiptModalOpen(false);
          return;
        }
        if (isDocketOpenRef.current) {
          e.preventDefault();
          setIsDocketOpen(false);
          return;
        }
        if (selectedXRayItemRef.current !== null) {
          e.preventDefault();
          setSelectedXRayItem(null);
          return;
        }
        if (isXRayModeRef.current) {
          e.preventDefault();
          setIsXRayMode(false);
          return;
        }

        // If laptop OS is open, let MonitorDesktopModal handle Esc hierarchy (window -> clean OS -> exit)
        if (isMonitorOpenRef.current) {
          return;
        }

        // Universal Esc button functionality for all desk gadgets
        if (cardAnimRef.current.out > 0.2) {
          e.preventDefault();
          putDownCard();
          return;
        }
        if (isPhoneOpenRef.current) {
          e.preventDefault();
          setIsPhoneOpen(false);
          focusObject('reset');
          return;
        }
        if (printedReceiptRef.current) {
          e.preventDefault();
          setPrintedReceipt(false);
          focusObject('reset');
          return;
        }
        if (focusedTargetRef.current !== null) {
          e.preventDefault();
          focusObject('reset');
          return;
        }
      } else if (e.key === ' ' || e.code === 'Space' || e.key === 'f' || e.key === 'F') {
        if (cardAnimRef.current.out > 0.5) {
          e.preventDefault();
          const nextSide = cardAnimRef.current.side === 1 ? 0 : 1;
          triggerFlip(nextSide);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);

    // Animation Render Loop
    let animationFrameId = 0;
    let lastFrameTime = 0;
    let lastBadgeUpdate = 0;
    let lastPlantMoodUpdate = 0;
    let isInViewport = true;
    const startTime = performance.now();
    const projectedBadgePosition = new THREE.Vector3();
    const deskGlassesPos = new THREE.Vector3(-0.20, 0.171, 0.17);
    const deskGlassesQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.04, 0.22, 0));
    const targetFacePos = new THREE.Vector3();
    const targetFaceQuat = new THREE.Quaternion();
    const containerSize = { width: 0, height: 0 };

    const animate = (time: number) => {
      if (document.hidden || !isInViewport) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      if (renderQuality.frameInterval && time - lastFrameTime < renderQuality.frameInterval) return;
      const step = Math.min(lastFrameTime ? (time - lastFrameTime) / 1000 : 1 / 60, 0.05);
      lastFrameTime = time;
      const elapsedTime = (time - startTime) / 1000;

      // Camera Programmed Transitions / Free Movement Handling (Zero sticking!)
      if (isCameraTransitioningRef.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetLookAt.current, 0.08);
        if (
          camera.position.distanceTo(targetCamPos.current) < 0.008 &&
          controls.target.distanceTo(targetLookAt.current) < 0.008
        ) {
          camera.position.copy(targetCamPos.current);
          controls.target.copy(targetLookAt.current);
          isCameraTransitioningRef.current = false;
        }
      }
      controls.update();

      // Dynamic 3D Object Projection for every X-Ray numbered badge.
      if (isXRayModeRef.current && container && time - lastBadgeUpdate >= 40) {
        lastBadgeUpdate = time;
        const rect = container.getBoundingClientRect();
        const newCoords: Record<number, { x: number; y: number; visible: boolean }> = {};
        for (const t of XRAY_TARGETS) {
          projectedBadgePosition.copy(t.pos).project(camera);
          if (projectedBadgePosition.z > 1) {
            newCoords[t.id] = { x: 0, y: 0, visible: false };
          } else {
            const px = (projectedBadgePosition.x * 0.5 + 0.5) * rect.width;
            const py = (-projectedBadgePosition.y * 0.5 + 0.5) * rect.height;
            newCoords[t.id] = { x: px, y: py, visible: true };
          }
        }
        setBadgePositions(newCoords);
      }

      // Spring motion makes the tiny Zoro figure wobble and settle after a tap.
      const wobble = zoroWobbleRef.current;
      wobble.speed += (-90 * wobble.angle - 4.5 * wobble.speed) * step;
      wobble.angle += wobble.speed * step;
      wobble.tiltSpeed += (-72 * wobble.tilt - 4.2 * wobble.tiltSpeed) * step;
      wobble.tilt += wobble.tiltSpeed * step;
      if (zoroHeadRef.current) {
        zoroHeadRef.current.rotation.z = wobble.angle;
        zoroHeadRef.current.rotation.x = wobble.tilt;
      }

      if (turntableRecordRef.current && musicPlayingRef.current) {
        turntableRecordRef.current.rotation.y += step * 1.8;
      }
      if (turntableTonearmRef.current) {
        const armTargetY = musicPlayingRef.current ? -0.52 : 0.14;
        turntableTonearmRef.current.rotation.y = THREE.MathUtils.lerp(
          turntableTonearmRef.current.rotation.y,
          armTargetY,
          Math.min(1, step * 6),
        );
      }

      // Wearable Spectacles Cinematic Animation (Desk -> Eyes & Temples Unfold)
      const targetProg = isWearingSpecsRef.current ? 1.0 : 0.0;
      specsWearProgressRef.current = THREE.MathUtils.lerp(specsWearProgressRef.current, targetProg, 0.075);
      const p = specsWearProgressRef.current;

      if (glassesGroupRef.current) {
        if (p > 0.002) {
          if (p >= 0.88) {
            // Once worn over the eyes, spectacles do NOT stay visible on screen to block view
            glassesGroupRef.current.visible = false;
          } else {
            glassesGroupRef.current.visible = true;
            camera.updateMatrixWorld();
            targetFacePos.set(0, -0.012, -0.16).applyMatrix4(camera.matrixWorld);
            targetFaceQuat.copy(camera.quaternion);
            const arcY = Math.sin(p * Math.PI) * 0.14;
            glassesGroupRef.current.position.lerpVectors(deskGlassesPos, targetFacePos, p);
            glassesGroupRef.current.position.y += arcY;
            glassesGroupRef.current.quaternion.slerpQuaternions(deskGlassesQuat, targetFaceQuat, p);
            const sc = THREE.MathUtils.lerp(1.0, 3.4, p);
            glassesGroupRef.current.scale.set(sc, sc, sc);
            if (leftTempleRef.current) leftTempleRef.current.rotation.y = THREE.MathUtils.lerp(-0.32, 0.08, p);
            if (rightTempleRef.current) rightTempleRef.current.rotation.y = THREE.MathUtils.lerp(0.32, -0.08, p);
          }

          if (p > 0.85 && !isWireframeOnRef.current) {
            setIsXRayMode(true);
            isWireframeOnRef.current = true;
          } else if (p <= 0.85 && isWireframeOnRef.current) {
            setIsXRayMode(false);
            isWireframeOnRef.current = false;
          }
        } else {
          glassesGroupRef.current.visible = true;
          glassesGroupRef.current.position.copy(deskGlassesPos);
          glassesGroupRef.current.quaternion.copy(deskGlassesQuat);
          glassesGroupRef.current.scale.set(1.0, 1.0, 1.0);
          if (leftTempleRef.current) leftTempleRef.current.rotation.y = -0.32;
          if (rightTempleRef.current) rightTempleRef.current.rotation.y = 0.32;
          if (isWireframeOnRef.current) {
            setIsXRayMode(false);
            isWireframeOnRef.current = false;
          }
        }
      }

      // Succulent Plant Organic Leaf Sway & Water Drop Bounce
      if (succulentLeavesRef.current.length > 0) {
        if (time - lastPlantMoodUpdate >= 1000) {
          lastPlantMoodUpdate = time;
          const thirst = plantThirst(plantLastWateredRef.current);
          succulentLeavesRef.current.forEach((leaf) => {
            const healthy = leaf.userData.healthyColor as THREE.Color;
            const dry = leaf.userData.dryColor as THREE.Color;
            const material = leaf.material as THREE.MeshStandardMaterial;
            material.color.lerpColors(dry, healthy, 1 - thirst);
          });
        }
        if (plantBounceRef.current > 0.005) {
          plantBounceRef.current *= 0.94; // Spring recovery
        }
        const bounce = plantBounceRef.current;
        const swayBase = Math.sin(elapsedTime * 1.8) * 0.03;
        succulentLeavesRef.current.forEach((leaf, idx) => {
          leaf.visible = idx < plantLeafCount(plantWaterCountRef.current);
          if (!leaf.visible) return;
          const initRot = leaf.userData.initialRot as THREE.Euler;
          if (initRot) {
            const phase = idx * 0.785;
            const bounceAmt = Math.sin(elapsedTime * 14.0 + phase) * bounce * 0.15;
            leaf.rotation.x = initRot.x + swayBase + bounceAmt;
            leaf.rotation.z = initRot.z + Math.cos(elapsedTime * 2.2 + phase) * 0.02 + bounceAmt * 0.4;
          }
        });
      }

      // Receipt Paper Feed Animation
      if (receiptPaperMeshRef.current && receiptAnimRef.current > 0.01) {
        const curScale = receiptPaperMeshRef.current.scale.y;
        receiptPaperMeshRef.current.scale.y = THREE.MathUtils.lerp(curScale, 1.0, 0.08);
      }

      // Steam Particle Motion with Rising Drift & Curl Turbulence
      if (steamParticlesRef.current) {
        const posAttr = steamParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let s = 0; s < steamCount; s++) {
          arr[s * 3 + 1] += 0.00065;
          arr[s * 3] += Math.sin(elapsedTime * 2.5 + s) * 0.00025;
          arr[s * 3 + 2] += Math.cos(elapsedTime * 2.1 + s) * 0.00025;
          if (arr[s * 3 + 1] > 0.35) {
            arr[s * 3 + 1] = 0.255;
            arr[s * 3] = 0.39 + (Math.random() - 0.5) * 0.025;
            arr[s * 3 + 2] = 0.045 + (Math.random() - 0.5) * 0.025;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Interactive 3D Business Card Animation & Bezier Arc (Matching pradiplabs.dev)
      const cardMesh = cardMeshRef.current;
      const cardGroup = cardGroupRef.current;
      const w = cardAnimRef.current;

      if (cardMesh && cardGroup) {
        const now = performance.now();
        const diff = Math.abs(w.to - w.from);
        const p = diff > 0 ? clamp01((now - w.movedAt) / (1050 * Math.max(0.35, diff))) : 1;
        w.out = w.from + (w.to - w.from) * Ca(p);

        // Auto flip to back face once upon arriving in front of camera
        if (w.to === 1 && p >= 1 && !hasAutoFlippedRef.current) {
          hasAutoFlippedRef.current = true;
          triggerFlip(1, 120);
        }

        // Flip rotation progress
        const fp = clamp01((now - w.flippedAt) / 600);
        w.flip = w.flipFrom + (w.side - w.flipFrom) * Ca(fp);

        if (w.out > 0.0001) {
          flipQ.setFromAxisAngle(CARD_TURN_AXIS, Math.PI * w.flip);
          turnQ.copy(tiltQ).multiply(flipQ);

          containerSize.width = container?.clientWidth || window.innerWidth;
          containerSize.height = container?.clientHeight || window.innerHeight;
          computeHeldTransform(camera, containerSize, cardGroup, turnQ);

          aVec.copy(CARD_REST_POS).setY(CARD_REST_POS.y + 0.16);
          bVec.copy(heldTarget.p).lerp(aVec, 0.4);

          bezierCurve.v0.copy(CARD_REST_POS);
          bezierCurve.v1.copy(aVec);
          bezierCurve.v2.copy(bVec);
          bezierCurve.v3.copy(heldTarget.p);

          bezierCurve.getPoint(w.out, cardMesh.position);

          const slerpProgress = Ca(clamp01((w.out - 0.12) / 0.88));
          cardMesh.quaternion.slerpQuaternions(CARD_REST_ROT, heldTarget.q, slerpProgress);
        } else {
          cardMesh.position.copy(CARD_REST_POS);
          cardMesh.quaternion.copy(CARD_REST_ROT);
        }

        // Metallic glow
        const targetGlow = w.out * (dayMode ? 0.14 : 0.28);
        w.glow += (targetGlow - w.glow) * 0.15;
        if (cardMaterialsRef.current) {
          cardMaterialsRef.current.front.emissiveIntensity = w.glow;
          cardMaterialsRef.current.back.emissiveIntensity = w.glow;
        }
      }

      // Live Laptop Screen Refresh (Z OS live clock & system pulse)
      const nowMs = performance.now();
      if (nowMs - lastLaptopRefresh.current > 1000 && lCtx) {
        lastLaptopRefresh.current = nowMs;
        let liveTime = '1:20 am';
        try {
          liveTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(new Date()).toLowerCase();
        } catch {}
        drawLiveLaptopDisplay(lCtx, liveTime, nowMs * 0.002);
        laptopTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    const startAnimation = () => {
      if (!animationFrameId && !document.hidden && isInViewport) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    const stopAnimation = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };
    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };
    const viewportObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          isInViewport = entry.isIntersecting;
          if (isInViewport) startAnimation();
          else stopAnimation();
        }, { threshold: 0.01 })
      : null;
    viewportObserver?.observe(container);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAnimation();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      camera.fov = getResponsiveCameraFov(aspect);

      // Adapt camera FOV / distance based on viewport aspect ratio (Mobile & ultrawide compatibility)
      const frame = getResponsiveCameraFrame(w, h);
      if (!focusedTargetRef.current && cardAnimRef.current.out < 0.1 && !isXRayModeRef.current) {
        targetCamPos.current.copy(frame.pos);
        targetLookAt.current.copy(frame.lookAt);
      }

      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getRenderQuality(w).pixelRatio);
      renderer.setSize(w, h);
    };
    handleResize(); // Initial setup on load
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      viewportObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', onKeyDown);
      stopAnimation();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      cardMeshRef.current = null;
      cardGroupRef.current = null;
      cardMaterialsRef.current = null;
      succulentLeavesRef.current = [];
      zoroHeadRef.current = null;
      turntableRecordRef.current = null;
      turntableTonearmRef.current = null;
      turntableLedMatRef.current = null;
      turntableDrawLabelRef.current = null;
      sceneRef.current = null;
    };
  }, [dayMode, takeCard, putDownCard, triggerFlip]);

  const focusObject = (target: 'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'turntable' | 'reset') => {
    soundFX.playClick();
    isCameraTransitioningRef.current = true;
    if (target === 'reset') {
      setFocusedTarget(null);
      const container = mountRef.current;
      const w = container?.clientWidth || window.innerWidth;
      const h = container?.clientHeight || window.innerHeight;
      const frame = getResponsiveCameraFrame(w, h);
      targetCamPos.current.copy(frame.pos);
      targetLookAt.current.copy(frame.lookAt);
    } else if (target === 'laptop') {
      setFocusedTarget('laptop');
      targetCamPos.current.set(0.0, 0.36, 0.22);
      targetLookAt.current.set(0.0, 0.28, -0.15);
    } else if (target === 'tablet') {
      setFocusedTarget('tablet');
      targetCamPos.current.set(-0.32, 0.38, 0.36);
      targetLookAt.current.set(-0.32, 0.27, 0.04);
    } else if (target === 'printer') {
      setFocusedTarget('printer');
      targetCamPos.current.set(-0.52, 0.38, 0.28);
      targetLookAt.current.set(-0.52, 0.22, -0.06);
    } else if (target === 'turntable') {
      setFocusedTarget('turntable');
      targetCamPos.current.set(0.53, 0.34, 0.36);
      targetLookAt.current.set(0.53, 0.19, 0.165);
    } else if (target === 'phone') {
      setFocusedTarget('phone');
      targetCamPos.current.set(0.49, 0.36, 0.22);
      targetLookAt.current.set(0.49, 0.24, -0.05);
      if (onOpenPhone) onOpenPhone();
      else setIsPhoneOpen(true);
    } else if (target === 'zcard') {
      takeCard();
    } else if (target === 'diary') {
      onOpenDiary();
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none transition-colors duration-500 ${
      dayMode 
        ? 'bg-[radial-gradient(120%_90%_at_50%_45%,#FFFFFF_0%,#F4F4F6_55%,#E8E8EC_100%)] text-slate-900' 
        : 'bg-transparent text-white'
    }`}>
      {/* Top Banner Headline (Clean & minimal on mobile, expanded on desktop) */}
      {!isXRayMode && !isCardHeld && !isWearingSpecs && (
        <div className="absolute top-10 sm:top-12 inset-x-0 z-20 pointer-events-none text-center px-4 max-w-2xl mx-auto transition-opacity duration-300">
          <h1 className={`text-[clamp(2rem,4.8vw,3.2rem)] font-medium tracking-[-0.045em] drop-shadow-md font-sans ${
            dayMode ? 'text-slate-900' : 'text-white'
          }`}>
            Hi, I’m Joshua.
          </h1>
          <p className={`mt-1 text-xs sm:text-sm max-w-xl mx-auto drop-shadow-sm font-sans ${
            dayMode ? 'text-slate-600' : 'text-slate-300'
          }`}>
            I build electronics, Linux systems and web experiences. Everything on this desk is interactive.
          </p>
        </div>
      )}



      {/* ── FOCUSED OBJECT DEDICATED CLOSE & ACTION BAR (Accessible Bottom Center) ── */}
      {focusedTarget && !isCardHeld && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-auto pb-[env(safe-area-inset-bottom,0px)] animate-fadeIn">
          {focusedTarget === 'laptop' && (
            <button
              onClick={() => {
                soundFX.playClick();
                if (onOpenMonitor) onOpenMonitor();
                else setIsMonitorOpen(true);
              }}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-xl shadow-cyan-400/25 active:scale-95 transition-all"
              title="Open Z OS Desktop"
            >
              <ExternalLink size={14} />
              <span>Open Desktop OS</span>
            </button>
          )}

          {focusedTarget === 'tablet' && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setTabletInitialApp('home');
                  setIsDocketOpen(true);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                title="Open iPad Home Dashboard"
              >
                <Tablet size={14} className="text-[#2F5BEA]" />
                <span>Open iPad Home</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setTabletInitialApp('player');
                  setIsDocketOpen(true);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white text-xs font-semibold flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                title="Open Zynx Player on iPad"
              >
                <Disc3 size={14} />
                <span>Zynx Player</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setTabletInitialApp('docket');
                  setIsDocketOpen(true);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                title="Open Demo Metals Docket System"
              >
                <ExternalLink size={14} />
                <span>Docket</span>
              </button>
            </div>
          )}

          {focusedTarget === 'turntable' && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 text-zinc-900 px-3 py-1.5 shadow-2xl border border-black/10 backdrop-blur-xl">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onToggleMusicPlaybackRef.current?.();
                }}
                className="w-8 h-8 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white flex items-center justify-center shadow transition active:scale-95"
                title={isMusicPlaying ? 'Pause record' : 'Spin record'}
              >
                {isMusicPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  musicPlayerEngine.nextTrack();
                }}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition active:scale-95"
                title="Next track"
              >
                <SkipForward size={14} />
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setTabletInitialApp('player');
                  setIsDocketOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <Disc3 size={13} className="text-emerald-400" />
                <span>Back to Zynx Player</span>
              </button>
            </div>
          )}

          {focusedTarget === 'printer' && printedReceipt && (
            <button
              onClick={() => {
                soundFX.playClick();
                setIsReceiptModalOpen(true);
              }}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-2 shadow-xl backdrop-blur-xl active:scale-95 transition-all"
              title="View Printed Receipt"
            >
              <Printer size={14} />
              <span>View Receipt</span>
            </button>
          )}

          {/* Dedicated prominent Close / Back to Desk button */}
          <button
            onClick={() => focusObject('reset')}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black/90 hover:bg-black text-white text-xs font-mono font-bold flex items-center gap-2 border border-white/20 shadow-2xl backdrop-blur-xl active:scale-95 transition-all"
            title="Exit zoom and return to desk overview"
            aria-label="Back to desk overview"
          >
            <X size={14} className="text-red-400" />
            <span>Back to Desk</span>
          </button>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {!focusedTarget && !isMusicOpen && !isXRayMode && !isCardHeld && !isWearingSpecs && (
        <nav
          ref={actionsNavRef}
          className="absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-white/15 bg-[#171411]/75 px-2 py-1.5 text-white shadow-xl shadow-black/20 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Explore items on the work desk"
        >
          <button onClick={() => focusObject('laptop')} className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white">
            Laptop <span className="ml-1 text-white/50">Projects</span>
          </button>
          <button onClick={() => focusObject('tablet')} className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white">
            Tablet <span className="ml-1 text-white/50">Dockets, QR, music</span>
          </button>
          <button onClick={() => focusObject('phone')} className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white">
            Phone <span className="ml-1 text-white/50">Live site &amp; AI</span>
          </button>
          <button onClick={() => focusObject('diary')} className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white">
            Death Note
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleMusicRef.current?.();
            }}
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            Talk to the speaker
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              soundFX.playZoom();
              setIsWearingSpecs(true);
            }}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-900 transition hover:bg-zinc-100"
          >
            See how it’s made
          </button>
        </nav>
      )}

      {/* Floating Hover Tooltips (Matching pradiplabs.dev) */}
      {hoveredObject === 'diary' && (
        <div className="absolute top-[58%] left-[65%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-zinc-100 text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Open Death Note · anyone can write in it</span>
          </div>
        </div>
      )}

      {(hoveredObject === 'card' || hoveredObject === 'zcard') && !isCardHeld && (
        <div className="absolute top-[62%] left-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Take my card</span>
          </div>
        </div>
      )}

      {hoveredObject === 'printer' && (
        <div className="absolute top-[48%] left-[26%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2">
            <Printer className="w-3.5 h-3.5" />
            <span>Thermal Docket Printer · Click to Print</span>
          </div>
        </div>
      )}

      {hoveredObject === 'speaker' && (
        <div className="absolute top-[66%] left-[17%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/40 text-cyan-200 text-xs font-mono shadow-xl flex items-center gap-2">
            <span aria-hidden="true">♫</span>
            <span>{isMusicOpen ? 'Desk speaker · Radio is open' : 'Talk to the desk speaker'}</span>
          </div>
        </div>
      )}

      {hoveredObject === 'turntable' && (
        <div className="absolute top-[70%] left-[79%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/40 text-amber-100 text-xs font-sans shadow-xl">
            {isMusicPlaying ? 'Record player · spinning now' : 'Play a record'}
          </div>
        </div>
      )}

      {hoveredObject === 'zoro' && (
        <div className="absolute top-[43%] left-[34%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/40 text-emerald-100 text-xs font-sans shadow-xl">
            Roronoa Zoro · give him a tap
          </div>
        </div>
      )}

      {hoveredObject === 'tablet' && !isCardHeld && !isDocketOpen && (
        <div className="absolute top-[52%] left-[33%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>iPad OS · Dockets, QR codes &amp; Zynx Player</span>
          </div>
        </div>
      )}

      {hoveredObject === 'mug' && (
        <div className="absolute top-[59%] left-[71%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs font-sans shadow-xl flex items-center gap-2">
            <span>☕ Hot Brew Coffee · Fresh & Steaming</span>
          </div>
        </div>
      )}

      {hoveredObject === 'lamp' && (
        <div className="absolute top-[38%] left-[75%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-sans shadow-xl">
            Click to toggle desk lamp {lampOn ? 'OFF' : 'ON'}
          </div>
        </div>
      )}

      {hoveredObject === 'glasses' && !isWearingSpecs && !isCardHeld && (
        <div className="absolute top-[62%] left-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="whitespace-nowrap rounded-full bg-white text-zinc-900 px-3.5 py-1.5 text-[13px] font-medium shadow-xl flex items-center gap-2 ring-1 ring-black/10">
            <SpectaclesIcon className="w-4 h-4 text-amber-600" />
            <span className="font-bold">Wearable Spectacles</span>
            <span className="text-zinc-600 font-normal">· Click to put on</span>
          </div>
        </div>
      )}

      {hoveredObject === 'laptop' && !isCardHeld && !isMonitorOpen && (
        <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Laptop · Eight live projects, open to click through</span>
          </div>
        </div>
      )}

      {hoveredObject === 'phone' && !isCardHeld && !isPhoneOpen && (
        <div className="absolute top-[44%] left-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-emerald-400/50 text-emerald-200 text-xs font-sans shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phone · Live Website &amp; AI Chat</span>
          </div>
        </div>
      )}

      {/* Plant Hover Tooltip (Matching v2_03.png) */}
      {hoveredObject === 'plant' && (
        <div className="absolute top-[43%] left-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-xs font-sans shadow-xl flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>Water the plant · watered {plantWaterCount} times</span>
          </div>
        </div>
      )}

      {/* Plant Watering Floating Drop Animation */}
      {waterDropAnim && (
        <div className="absolute top-[39%] left-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-bounce">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs shadow-xl shadow-emerald-500/40">
            <Droplets className="w-3.5 h-3.5" />
            <span>+1 Hydrated! ({plantWaterCount})</span>
          </div>
        </div>
      )}

      {/* ── WEARABLE SPECTACLES FIRST-PERSON HUD & CONTROLS ── */}
      {isWearingSpecs && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden animate-fadeIn">
          {/* Subtle Ambient Optics Glow — no obstructive frame border blocking the desk view */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(34,211,238,0.14)]" />
          
          {/* Tech Optics Telemetry HUD Header */}
          <div className="absolute top-3 sm:top-4 inset-x-0 flex justify-center pointer-events-none">
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-black/85 px-4 py-1 text-[10px] font-mono tracking-wider text-cyan-300 shadow-xl backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>OPTICAL SPECTACLES ACTIVE // X-RAY INSPECT MODE</span>
            </div>
          </div>

          {/* Prominent Action Bar at Bottom Center: Take Off Specs */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2">
            <button
              onClick={takeOffSpecs}
              className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-2xl shadow-amber-400/40 active:scale-95 transition-all"
              title="Take off glasses and return to desk"
              aria-label="Take off spectacles"
            >
              <SpectaclesIcon className="w-4 h-4 text-black" />
              <span>Take Off Specs (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* Blueprint Grid Paper Background when X-Ray is Active (Matching v2_10.png) */}
      {isXRayMode && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      )}

      {/* X-Ray / Anatomy Blueprint Top Headline (Matching pradiplabs.dev v2_10.png) */}
      {isXRayMode && (
        <div className="absolute top-6 inset-x-0 z-30 pointer-events-none text-center px-4 animate-fadeIn">
          <p className="text-[11px] font-mono tracking-widest uppercase font-bold text-blue-600">
            X-RAY
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mt-1 font-display">
            How it's made.
          </h1>
          <p className="mt-2 text-xs md:text-sm max-w-xl mx-auto text-slate-600 font-sans">
            No 3D model files here: everything on this desk is built in code. Tap anything to see how.
          </p>
        </div>
      )}

      {/* 15 Interactive Numbered Badges pinned to 3D Coordinates (Matching v2_10.png) */}
      {isXRayMode && Object.entries(badgePositions).map(([idStr, pos]) => {
        if (!pos.visible) return null;
        const idNum = parseInt(idStr, 10);
        const isSelected = selectedXRayItem?.id === idNum;
        const itemData = XRAY_DESK_ITEMS.find((it) => it.id === idNum);
        return (
          <div
            key={idNum}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => {
              soundFX.playClick();
              if (itemData) setSelectedXRayItem(itemData);
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer pointer-events-auto transition-transform hover:scale-125 select-none ${
              isSelected ? 'scale-110' : ''
            }`}
            title={itemData?.name || `Item ${idNum}`}
          >
            <div
              className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-sm sm:text-xs shadow-lg transition-all ${
                isSelected
                  ? 'bg-[#2563eb] text-white ring-4 ring-blue-400/40 shadow-blue-500/40'
                  : 'bg-white/95 text-zinc-900 border border-zinc-400/70 hover:border-blue-500 shadow-md'
              }`}
            >
              {idNum}
            </div>
          </div>
        );
      })}

      {/* X-Ray Right Inspector Drawer (Matching v2_10.png) */}
      {isXRayMode && selectedXRayItem && (
        <XRayDeskInspector
          selectedItem={selectedXRayItem}
          onClose={() => setSelectedXRayItem(null)}
          onOpenAnatomy={onOpenAnatomy}
        />
      )}

      {/* Interactive iPad OS (Home Dashboard, Demo Metals Docket, QR Pass & Zynx Player) */}
      <TabletDocketModal
        isOpen={isDocketOpen}
        onClose={() => {
          setIsDocketOpen(false);
          setTabletInitialAddSong(false);
        }}
        initialApp={tabletInitialApp}
        initialAddSong={tabletInitialAddSong}
        onOpenDiary={onOpenDiary}
        onFocusTurntable={() => focusObject('turntable')}
        plantWaterCount={plantWaterCount}
        diaryPageCount={diaryPageCount}
        docketsPrintedCount={docketsPrintedCount}
        onPrintDocket={(order) => {
          setCurrentDocketOrder(order);
          setDocketsPrintedCount((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem('zynx_dockets_printed_count', next.toString());
            } catch {}
            return next;
          });
          setPrintedReceipt(true);
          receiptAnimRef.current = 1.0;
          if (rCtxRef.current && receiptTextureRef.current) {
            drawReceiptOnCanvas(rCtxRef.current, order);
            receiptTextureRef.current.needsUpdate = true;
          }
          focusObject('reset');
        }}
      />

      {/* Thermal POS Receipt Inspection Modal (Matching v2_02.png & v2_09.png) */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={currentDocketOrder}
        onReprint={() => {
          receiptAnimRef.current = 1.0;
        }}
      />

      {/* Interactive Business Card Held Overlay (Matching pradiplabs.dev hC floating action dock) */}
      {isCardHeld && (
        <div className="fixed inset-x-0 bottom-3 sm:bottom-6 z-40 flex flex-col items-center gap-2 pointer-events-none px-2 sm:px-4 animate-fade-in pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {/* Floating Action Dock */}
          <div className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-white/95 dark:bg-black/85 p-1.5 sm:p-2 shadow-2xl ring-1 ring-black/10 dark:ring-white/15 backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar">
            {/* Social Quick Links */}
            <div className="flex items-center gap-0.5 sm:gap-1 px-0.5 sm:px-1 shrink-0">
              <a
                href="https://wa.me/917259987691"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-500/20 text-slate-800 dark:text-zinc-200 hover:text-emerald-500 flex items-center justify-center transition-all shrink-0"
                title="WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="tel:+917259987691"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-cyan-500/20 text-slate-800 dark:text-zinc-200 hover:text-cyan-400 flex items-center justify-center transition-all shrink-0"
                title="Call Joshua"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="mailto:joshuadecedbit@gmail.com"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-blue-500/20 text-slate-800 dark:text-zinc-200 hover:text-blue-400 flex items-center justify-center transition-all shrink-0"
                title="Email Joshua"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://linkedin.com/in/Zynx"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-blue-600/20 text-slate-800 dark:text-zinc-200 hover:text-blue-500 flex items-center justify-center transition-all shrink-0"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://github.com/Zynxx777"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-zinc-500/20 text-slate-800 dark:text-zinc-200 hover:text-white flex items-center justify-center transition-all shrink-0"
                title="GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://instagram.com/7osh___"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-pink-500/20 text-slate-800 dark:text-zinc-200 hover:text-pink-400 flex items-center justify-center transition-all shrink-0"
                title="Instagram · @7osh___"
              >
                <InstagramIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>

            <div className="h-5 sm:h-6 w-px bg-black/10 dark:bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

            {/* Save Contact vCard */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                soundFX.playClick();
                downloadVCard();
              }}
              className="h-8 sm:h-10 px-3 sm:px-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Save my contact</span>
              <span className="sm:hidden">Save</span>
            </button>

            {/* Flip Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                soundFX.playCardFlip();
                const nextSide = cardAnimRef.current.side === 1 ? 0 : 1;
                triggerFlip(nextSide);
              }}
              className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Flip card (Space or F)"
            >
              <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Flip</span>
            </button>

            {/* Put it back */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                putDownCard();
              }}
              className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Put card back (Esc)"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Put it back</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Sticky Notes Modal */}
      <StickyNotesModal
        isOpen={isStickyNotesOpen}
        onClose={() => setIsStickyNotesOpen(false)}
        initialNoteId={activeStickyNoteId}
      />

      {/* Full Desktop Monitor Experience (pradiplabs.dev replica) */}
      <MonitorDesktopModal
        isOpen={isMonitorOpen}
        onClose={() => {
          setIsMonitorOpen(false);
          focusObject('reset');
        }}
        onOpenAnatomy={onOpenAnatomy}
        onOpenProject={onOpenProject}
      />

      {/* 7YNX Smartphone Experience Modal */}
      {isPhoneOpen && (
        <PhoneExperience
          onOpenProject={onOpenProject}
          onClose={() => {
            soundFX.playClick();
            setIsPhoneOpen(false);
            setFocusedTarget(null);
            const container = mountRef.current;
            const w = container?.clientWidth || window.innerWidth;
            const h = container?.clientHeight || window.innerHeight;
            const frame = getResponsiveCameraFrame(w, h);
            targetCamPos.current.copy(frame.pos);
            targetLookAt.current.copy(frame.lookAt);
          }}
        />
      )}
    </div>
  );
};
