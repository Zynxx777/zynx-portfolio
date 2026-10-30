import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  Layers, 
  ExternalLink,
  Sun,
  Moon,
  Printer,
  Sparkles,
  RotateCw,
  Download,
  MessageSquare,
  Phone,
  Mail,
  X,
  Droplets,
  Volume2,
  VolumeX,
  StickyNote
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import { MonitorDesktopModal } from './MonitorDesktopModal';
import PhoneExperience from './PhoneExperience';
import { TabletDocketModal, type DocketOrder } from './TabletDocketModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { XRayDeskInspector, XRAY_DESK_ITEMS, type XRayDeskItem } from './XRayDeskInspector';
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

const CARD_DIM = { w: 0.086, h: 0.055, t: 0.0012 };
const CARD_LAYOUT = { height: 0.50, width: 0.86 };
const CARD_REST_POS = new THREE.Vector3(0, 0.024, 0.006);
const CARD_REST_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.28, 0, 0));

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

function getResponsiveCameraFrame(w: number, h: number): { pos: THREE.Vector3; lookAt: THREE.Vector3 } {
  const aspect = w / Math.max(1, h);
  if (h < 500 && aspect > 1.4) {
    // Mobile landscape (e.g. phone held sideways: 844x390)
    return {
      pos: new THREE.Vector3(0.0, 0.78, 1.70),
      lookAt: new THREE.Vector3(0.0, 0.22, 0.0)
    };
  } else if (aspect < 0.75) {
    // Tall mobile portrait (e.g. modern iPhone / Android: 390x844)
    return {
      pos: new THREE.Vector3(0.0, 1.35, 2.45),
      lookAt: new THREE.Vector3(0.0, 0.28, 0.0)
    };
  } else if (aspect < 1.0) {
    // Standard mobile portrait
    return {
      pos: new THREE.Vector3(0.0, 1.25, 2.20),
      lookAt: new THREE.Vector3(0.0, 0.30, 0.0)
    };
  } else if (aspect < 1.35) {
    // Tablet / iPad / Foldable screens
    return {
      pos: new THREE.Vector3(0.0, 1.08, 1.75),
      lookAt: new THREE.Vector3(0.0, 0.30, 0.0)
    };
  } else if (aspect > 2.0) {
    // Ultra-wide displays (21:9 / 32:9)
    return {
      pos: new THREE.Vector3(0.0, 0.90, 1.35),
      lookAt: new THREE.Vector3(0.0, 0.32, 0.0)
    };
  } else {
    // Standard desktop (16:9 / 16:10)
    return {
      pos: new THREE.Vector3(0.0, 0.95, 1.45),
      lookAt: new THREE.Vector3(0.0, 0.32, 0.0)
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

  // 2. Top Menu Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fillRect(0, 0, w, 36);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, 35, w, 1);

  // Z OS Badge
  ctx.fillStyle = '#2F5BEA';
  round(16, 8, 20, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Z', 26, 22);

  // Menu Items
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1D1D1F';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Z OS', 44, 23);

  ctx.fillStyle = '#2F5BEA';
  ctx.fillText('Work', 104, 23);
  ctx.fillStyle = '#55555A';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('About', 158, 23);
  ctx.fillText('Contact', 214, 23);

  // Right Menu Status: Live pulse dot + Bengaluru Time
  ctx.textAlign = 'right';
  const dotAlpha = 0.4 + 0.6 * Math.abs(Math.sin(pulse * 3));
  ctx.fillStyle = `rgba(16, 185, 129, ${dotAlpha})`;
  ctx.beginPath();
  ctx.arc(1110, 18, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('LIVE', 1100, 22);

  ctx.fillStyle = '#1D1D1F';
  ctx.font = '500 12px monospace';
  ctx.fillText(`Bengaluru ${timeStr || '1:20 am'}`, 1260, 22);

  // 3. Desktop Shortcut Icons on Right
  const rightIcons = [
    { label: 'Work', icon: '📁', y: 70 },
    { label: 'About', icon: '👤', y: 155 },
    { label: 'Contact', icon: '✉️', y: 240 }
  ];
  rightIcons.forEach((item) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    round(1190, item.y, 56, 56, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.icon, 1218, item.y + 36);

    ctx.fillStyle = '#1D1D1F';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(item.label, 1218, item.y + 72);
  });

  // 4. Main Floating Window (Work: Eight projects, all running)
  const wx = 50;
  const wy = 52;
  const ww = 1100;
  const wh = 650;

  // Window Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
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

  // Traffic lights
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
  ctx.fillText('Open one to use the real site. Everything here was built by me alone.', wx + 36, wy + 102);

  // Grid of 8 Project Tiles (2 rows x 4 cols)
  const tiles = [
    { title: 'Z Card v0.1', sub: 'Smart Card System', tag: 'HARDWARE', tint: '#EBF1F7', icon: '💳' },
    { title: 'S.M. School Web', sub: 'School Management', tag: 'LIVE SITE', tint: '#EBF5FB', icon: '🏫' },
    { title: 'Arch Workstation', sub: 'Hyprland & Kernel', tag: 'SYSTEM', tint: '#F0F4F8', icon: '⚡' },
    { title: 'Luxoft AAOS', sub: 'Automotive CAN Bus', tag: 'RESEARCH', tint: '#F2EEF9', icon: '🚗' },
    { title: 'MediVend', sub: 'Verilog FSM Prototype', tag: 'EMBEDDED', tint: '#E7F6EF', icon: '💊' },
    { title: '7YNX Sound Lab', sub: 'Electronic Soundscapes', tag: 'AUDIO', tint: '#FDF0F3', icon: '🎧' },
    { title: 'Jesper Wave 3D', sub: 'Curved WebGL Wave', tag: 'CREATIVE', tint: '#E8F0FE', icon: '🌊' },
    { title: '3D Bedroom', sub: 'Three.js Spatial Web', tag: 'SPATIAL', tint: '#FDF6E2', icon: '🛋️' }
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

    // Card background
    ctx.fillStyle = t.tint;
    round(tx, ty, tileW, tileH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top icon/preview box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    round(tx + 8, ty + 8, tileW - 16, 110, 8);
    ctx.fill();

    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.icon, tx + tileW / 2, ty + 74);

    // Tag badge
    ctx.fillStyle = '#2F5BEA';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(t.tag, tx + 14, ty + 26);

    // Title & Subtitle
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(t.title, tx + 12, ty + 150);

    ctx.fillStyle = '#6B7280';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(t.sub, tx + 12, ty + 172);

    // Live indicator
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(tx + tileW - 18, ty + 150, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Bottom MacOS Glass Dock
  const dockW = 460;
  const dockH = 54;
  const dockX = (w - dockW) / 2;
  const dockY = h - 68;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  round(dockX, dockY, dockW, dockH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dock icons
  const dockIcons = ['📁', '💳', '🏫', '⚡', '🚗', '💊', '🎧', '|', '👤', '✉️'];
  ctx.textAlign = 'center';
  dockIcons.forEach((dIcon, di) => {
    const ix = dockX + 28 + di * 42;
    if (dIcon === '|') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(ix - 6, dockY + 12, 1, 30);
    } else {
      ctx.font = '20px sans-serif';
      ctx.fillText(dIcon, ix, dockY + 35);
      if (di === 0) {
        // Active dot under Work folder
        ctx.fillStyle = '#1D1D1F';
        ctx.beginPath();
        ctx.arc(ix, dockY + 47, 2, 0, Math.PI * 2);
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

// 12 Target Coordinates for Isometric X-Ray Blueprint Badges (Matching v2_10.png)
const XRAY_TARGETS: { id: number; key: string; pos: THREE.Vector3 }[] = [
  { id: 1, key: 'printer', pos: new THREE.Vector3(-0.52, 0.22, -0.06) },  // 1: Thermal POS Printer
  { id: 2, key: 'zoro', pos: new THREE.Vector3(-0.54, 0.32, 0.15) },     // 2: Zoro Bobblehead
  { id: 3, key: 'tablet', pos: new THREE.Vector3(-0.32, 0.28, 0.04) },   // 3: Tablet (Docket system)
  { id: 4, key: 'laptop', pos: new THREE.Vector3(0.0, 0.35, -0.10) },    // 4: Laptop (MacBook)
  { id: 5, key: 'notes', pos: new THREE.Vector3(-0.16, 0.36, -0.09) },   // 5: Sticky Notes
  { id: 6, key: 'card', pos: new THREE.Vector3(0.0, 0.19, 0.01) },       // 6: Z Business Card
  { id: 7, key: 'diary', pos: new THREE.Vector3(0.24, 0.18, 0.14) },     // 7: Guestbook Diary & Stylus
  { id: 8, key: 'photo', pos: new THREE.Vector3(0.14, 0.23, -0.20) },    // 8: Picture Frame
  { id: 9, key: 'mug', pos: new THREE.Vector3(0.31, 0.21, -0.16) },      // 9: Coffee Mug
  { id: 10, key: 'lamp', pos: new THREE.Vector3(0.42, 0.28, -0.08) },    // 10: Mushroom Desk Lamp
  { id: 11, key: 'phone', pos: new THREE.Vector3(0.27, 0.24, 0.05) },    // 11: Smartphone & Stand
  { id: 12, key: 'plant', pos: new THREE.Vector3(0.44, 0.28, -0.22) },   // 12: Succulent Plant
];

interface BedroomDesk3DProps {
  onOpenDiary: () => void;
  onOpenProject: (projectId: string) => void;
  onSwitchToShowcase: () => void;
  onOpenAnatomy: () => void;
  onOpenMonitor?: () => void;
  onOpenPhone?: () => void;
  onToggleMusic?: () => void;
  isMusicPlaying?: boolean;
}

export const BedroomDesk3D: React.FC<BedroomDesk3DProps> = ({
  onOpenDiary,
  onOpenProject,
  onSwitchToShowcase,
  onOpenAnatomy,
  onOpenMonitor,
  onOpenPhone,
  onToggleMusic,
  isMusicPlaying = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [dayMode, setDayMode] = useState(false); // Day Studio vs Cozy Night
  const [isXRayMode, setIsXRayMode] = useState(false); // Matching pradiplabs X-Ray mode
  const [printedReceipt, setPrintedReceipt] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [focusedTarget, setFocusedTarget] = useState<'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'zoro' | null>(null);
  const [isCardHeld, setIsCardHeld] = useState(false);
  const [, setCardSide] = useState<0 | 1>(0);

  const [isDocketOpen, setIsDocketOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
  const [activeStickyNoteId, setActiveStickyNoteId] = useState<number | undefined>(undefined);
  const [currentDocketOrder, setCurrentDocketOrder] = useState<DocketOrder | null>(null);
  const [selectedXRayItem, setSelectedXRayItem] = useState<XRayDeskItem | null>(null);
  const [plantWaterCount, setPlantWaterCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zynx_plant_water_count');
      return saved ? parseInt(saved, 10) : 87;
    } catch {
      return 87;
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

  // Zoro spring wobble reference
  const zoroWobbleRef = useRef<number>(0.15);
  const zoroHeadRef = useRef<THREE.Group | null>(null);

  // Succulent plant bounce & leaf sway references
  const plantBounceRef = useRef<number>(0);
  const succulentLeavesRef = useRef<THREE.Mesh[]>([]);

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

    // 1. Scene & Camera Setup (Responsive framing)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialFrame = getResponsiveCameraFrame(width, height);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(initialFrame.pos);
    camera.lookAt(initialFrame.lookAt);
    targetCamPos.current.copy(initialFrame.pos);
    targetLookAt.current.copy(initialFrame.lookAt);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 0.55;
    controls.maxDistance = 3.6;
    controls.target.copy(initialFrame.lookAt);
    controlsRef.current = controls;

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, dayMode ? 1.6 : 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, dayMode ? 2.4 : 1.2);
    keyLight.position.set(1.5, 3.5, 2.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    daySunLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.6);
    fillLight.position.set(-2, 1.5, 1);
    scene.add(fillLight);

    // Warm Mushroom Desk Lamp Point Light
    const lampLight = new THREE.PointLight(0xffaa55, lampOn ? 3.6 : 0.0, 1.8, 1.8);
    lampLight.position.set(0.42, 0.34, -0.05);
    lampLight.castShadow = true;
    lampLight.shadow.bias = -0.001;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    // 3. Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.45,
      metalness: 0.05,
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      roughness: 0.6,
      metalness: 0.4,
    });

    const laptopAlu = new THREE.MeshStandardMaterial({
      color: 0xc8cdd5,
      roughness: 0.22,
      metalness: 0.85,
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

    const plantGreen = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.5,
      metalness: 0.0,
    });

    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xd97757,
      roughness: 0.7,
      metalness: 0.0,
    });

    const diaryLeather = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.4,
      metalness: 0.1,
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
      color: dayMode ? 0xf0f0f4 : 0x242220,
      roughness: 0.85,
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

    // Wall Sticky Notes
    const stickyColors = [0xfef08a, 0xfbcfe8, 0xbae6fd, 0xbbf7d0];
    const stickyPositions = [
      [-0.20, 0.52, -0.335],
      [-0.13, 0.47, -0.335],
      [0.16, 0.53, -0.335],
      [0.23, 0.48, -0.335]
    ];
    stickyPositions.forEach(([sx, sy, sz], idx) => {
      const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.058, 0.058),
        new THREE.MeshStandardMaterial({ color: stickyColors[idx % stickyColors.length], roughness: 0.7 })
      );
      note.position.set(sx, sy, sz);
      note.rotation.z = (idx % 2 === 0 ? 0.05 : -0.06);
      note.userData = { clickableName: 'notes', noteId: idx + 1 };
      interactiveObjects.push(note);
      scene.add(note);
    });

    // 5. Desk Top & Chamfers
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.038, 0.68),
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

    // 6b. Tablet Screen Texture: "Docket Telemetry & Print Action"
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 680;
    tabletCanvas.height = 480;
    const tCtx = tabletCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#060a12';
      tCtx.fillRect(0, 0, 680, 480);
      
      tCtx.fillStyle = '#00f0ff';
      tCtx.font = 'bold 20px monospace';
      tCtx.fillText('Z-DOCKET SYSTEM // ARCH TELEMETRY', 30, 45);
      tCtx.fillStyle = '#64748b';
      tCtx.font = '12px monospace';
      tCtx.fillText('KERNEL: 6.12.1-ARCH · 6 ACTIVE NODES', 30, 70);

      const stats = [
        { label: 'CPU UTILIZATION', val: '18% @ 3.8GHz', color: '#10b981' },
        { label: 'RAM WORKING SET', val: '8.4 / 32 GB', color: '#38bdf8' },
        { label: 'BATTERY SOLAR', val: '3.78 V (CHARGING)', color: '#fbbf24' },
        { label: 'ECE FIRMWARE', val: 'REV 0.81 STABLE', color: '#a855f7' }
      ];

      stats.forEach((st, i) => {
        const sx = 30 + (i % 2) * 315;
        const sy = 95 + Math.floor(i / 2) * 115;
        tCtx.fillStyle = '#0f172a';
        tCtx.roundRect(sx, sy, 295, 95, 8);
        tCtx.fill();
        tCtx.fillStyle = '#64748b';
        tCtx.font = '11px monospace';
        tCtx.fillText(st.label, sx + 15, sy + 30);
        tCtx.fillStyle = st.color;
        tCtx.font = 'bold 18px monospace';
        tCtx.fillText(st.val, sx + 15, sy + 65);
      });

      // Big "Print Docket Receipt" Banner Button on Tablet
      tCtx.fillStyle = '#00f0ff';
      tCtx.roundRect(30, 360, 620, 80, 14);
      tCtx.fill();
      tCtx.fillStyle = '#000000';
      tCtx.font = 'bold 22px monospace';
      tCtx.fillText('🖨️  PRINT DOCKET RECEIPT NOW', 160, 410);
    }
    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    tabletTexture.colorSpace = THREE.SRGBColorSpace;

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
    receiptTextureRef.current = receiptTexture;

    // 6d. Phone Screen Texture: "AI Chat & 7YNX Audio"
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 400;
    phoneCanvas.height = 800;
    const pCtx = phoneCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#0a0f1d';
      pCtx.fillRect(0, 0, 400, 800);
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 16px sans-serif';
      pCtx.fillText('9:41', 30, 40);
      pCtx.fillText('5G 100%', 320, 40);

      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(20, 70, 360, 60, 14);
      pCtx.fill();
      pCtx.fillStyle = '#38bdf8';
      pCtx.font = 'bold 18px sans-serif';
      pCtx.fillText('7YNX Smart Chat & Player', 40, 107);

      pCtx.fillStyle = '#1e293b';
      pCtx.roundRect(25, 160, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#e2e8f0';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Hi! Looking for hardware prototype', 40, 190);
      pCtx.fillText('or Linux automation consulting?', 40, 212);

      pCtx.fillStyle = '#0284c7';
      pCtx.roundRect(95, 260, 280, 75, 12);
      pCtx.fill();
      pCtx.fillStyle = '#ffffff';
      pCtx.font = '13px sans-serif';
      pCtx.fillText('Yes! Interested in the Z Card', 115, 290);
      pCtx.fillText('and universal smart ID concept!', 115, 312);

      pCtx.fillStyle = '#0f172a';
      pCtx.roundRect(25, 420, 350, 180, 16);
      pCtx.fill();
      pCtx.fillStyle = '#00f0ff';
      pCtx.font = 'bold 15px monospace';
      pCtx.fillText('LIVE RADIO: 7YNX STUDY BEATS', 45, 460);
      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '12px sans-serif';
      pCtx.fillText('Lo-fi Beats & Warm Ambient Waves', 45, 485);

      for (let b = 0; b < 24; b++) {
        const barH = 20 + Math.sin(b * 0.7) * 35;
        pCtx.fillStyle = '#00f0ff';
        pCtx.fillRect(45 + b * 13, 550 - barH, 8, barH);
      }
    }
    const phoneTexture = new THREE.CanvasTexture(phoneCanvas);
    phoneTexture.colorSpace = THREE.SRGBColorSpace;

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

    // 7. Realistic Opened Laptop Model (Center of Desk)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.0, 0.17, -0.04);

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.22), laptopAlu);
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptopGroup.add(laptopBase);

    // Front thumb groove
    const frontGroove = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.003, 0.004), blackPlastic);
    frontGroove.position.set(0.0, 0.005, 0.109);
    laptopGroup.add(frontGroove);

    // Recessed keyboard well
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.002, 0.105), blackPlastic);
    keyboard.position.set(0.0, 0.007, -0.035);
    laptopGroup.add(keyboard);

    // Speaker grilles flanking keyboard
    const speakerL = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.001, 0.105), blackPlastic);
    speakerL.position.set(-0.136, 0.0068, -0.035);
    laptopGroup.add(speakerL);
    const speakerR = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.001, 0.105), blackPlastic);
    speakerR.position.set(0.136, 0.0068, -0.035);
    laptopGroup.add(speakerR);

    // Trackpad
    const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.001, 0.065), laptopAlu);
    trackpad.position.set(0.0, 0.007, 0.065);
    laptopGroup.add(trackpad);

    // Black hinge cylinder
    const hingeCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.26, 16), blackPlastic);
    hingeCylinder.rotation.z = Math.PI / 2;
    hingeCylinder.position.set(0.0, 0.006, -0.11);
    laptopGroup.add(hingeCylinder);

    // Screen Hinge (OPENED: tilted backwards slightly, facing the desk observer directly)
    const screenHinge = new THREE.Group();
    screenHinge.position.set(0.0, 0.006, -0.11);
    screenHinge.rotation.x = -0.21;

    const screenLid = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.008), laptopAlu);
    screenLid.position.set(0.0, 0.11, 0.0);
    screenLid.castShadow = true;
    screenHinge.add(screenLid);

    // Black screen bezel border
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.316, 0.216), blackPlastic);
    bezel.position.set(0.0, 0.11, 0.0042);
    screenHinge.add(bezel);

    // FaceTime / WebCam lens dot at top of bezel
    const camDot = new THREE.Mesh(new THREE.CircleGeometry(0.0015, 12), blackPlastic);
    camDot.position.set(0.0, 0.212, 0.0045);
    screenHinge.add(camDot);

    // Active Display Plane (16:10 aspect ratio matching 1280x800 Z OS display, toneMapped: false for luminous LCD glow)
    const screenDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.295, 0.184),
      new THREE.MeshBasicMaterial({
        map: laptopTexture,
        toneMapped: false
      })
    );
    screenDisplay.position.set(0.0, 0.110, 0.0048);
    screenHinge.add(screenDisplay);

    // Subtle soft ambient screen glow casting onto the keyboard & trackpad
    const screenGlowLight = new THREE.PointLight(0xb2d2ff, 0.45, 0.5);
    screenGlowLight.position.set(0.0, 0.11, 0.045);
    screenHinge.add(screenGlowLight);

    laptopGroup.add(screenHinge);
    scene.add(laptopGroup);

    registerClickable(laptopBase, 'laptop');
    registerClickable(keyboard, 'laptop');
    registerClickable(trackpad, 'laptop');
    registerClickable(screenLid, 'laptop');
    registerClickable(screenDisplay, 'laptop');

    // 8. Tablet on Stand (Left of Laptop)
    const tabletGroup = new THREE.Group();
    tabletGroup.position.set(-0.32, 0.17, 0.04);
    tabletGroup.rotation.y = Math.PI / 11;

    const tabletStand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.01, 24), silverMetal);
    tabletStand.position.set(0.0, 0.005, 0.0);
    tabletGroup.add(tabletStand);

    const tabletArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.02), silverMetal);
    tabletArm.position.set(0.0, 0.06, -0.01);
    tabletArm.rotation.x = 0.2;
    tabletGroup.add(tabletArm);

    const tabletBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.01), blackPlastic);
    tabletBody.position.set(0.0, 0.13, 0.01);
    tabletBody.rotation.x = -0.22;
    tabletBody.castShadow = true;
    tabletGroup.add(tabletBody);

    const tabletScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.14),
      new THREE.MeshBasicMaterial({ map: tabletTexture })
    );
    tabletScreen.position.set(0.0, 0.13, 0.016);
    tabletScreen.rotation.x = -0.22;
    tabletGroup.add(tabletScreen);

    scene.add(tabletGroup);
    registerClickable(tabletBody, 'tablet');
    registerClickable(tabletScreen, 'tablet');

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
    const paperGeo = new THREE.PlaneGeometry(0.08, 0.18, 12, 12);
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

    // 10. Zoro Bobblehead Figurine on a Spring (Left desk edge, matching pradiplabs.dev)
    const zoroGroup = new THREE.Group();
    zoroGroup.position.set(-0.54, 0.17, 0.15);

    // Circular base
    const zoroBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.01, 20),
      new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.6 })
    );
    zoroBase.position.y = 0.005;
    zoroGroup.add(zoroBase);

    // Zoro Body (Dark Green Coat)
    const zoroBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.024, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.5 })
    );
    zoroBody.position.y = 0.035;
    zoroBody.castShadow = true;
    zoroGroup.add(zoroBody);

    // Zoro's 3 Katanas strapped to his sash
    for (let k = 0; k < 3; k++) {
      const sword = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, 0.065, 8),
        new THREE.MeshStandardMaterial({ color: k === 0 ? 0xffffff : k === 1 ? 0x7e22ce : 0xb91c1c, metalness: 0.7 })
      );
      sword.position.set(0.022, 0.032 + k * 0.004, -0.005 + k * 0.006);
      sword.rotation.set(0.4, 0.1, -0.6);
      zoroGroup.add(sword);
    }

    // Spring (connecting body to head)
    const spring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.02, 12),
      silverMetal
    );
    spring.position.y = 0.065;
    zoroGroup.add(spring);

    // Zoro Head Group (mounted on spring for harmonic wobbling)
    const zoroHead = new THREE.Group();
    zoroHead.position.set(0.0, 0.09, 0.0);

    // Head sphere (skin tone)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd2b8, roughness: 0.4 });
    const zoroFace = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 16), skinMat);
    zoroHead.add(zoroFace);

    // Zoro Green Hair (Spiky dome)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const zoroHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8),
      hairMat
    );
    zoroHair.position.y = 0.004;
    zoroHead.add(zoroHair);

    // Black Pirate Bandana tied around head
    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
    const bandana = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 10, 24), bandanaMat);
    bandana.rotation.x = Math.PI / 2;
    bandana.position.y = 0.006;
    zoroHead.add(bandana);

    zoroHead.castShadow = true;
    zoroHeadRef.current = zoroHead;
    zoroGroup.add(zoroHead);

    scene.add(zoroGroup);
    registerClickable(zoroFace, 'zoro');
    registerClickable(zoroBody, 'zoro');

    // 11. Smartphone & Stand (Right of Laptop)
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.27, 0.17, 0.07);
    phoneGroup.rotation.y = -Math.PI / 12;

    const phoneStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.01), silverMetal);
    phoneStand.position.set(0.0, 0.035, -0.02);
    phoneStand.rotation.x = -0.4;
    phoneGroup.add(phoneStand);

    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.008), blackPlastic);
    phoneBody.position.set(0.0, 0.075, 0.005);
    phoneBody.rotation.x = -0.35;
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);

    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.068, 0.135),
      new THREE.MeshBasicMaterial({ map: phoneTexture })
    );
    phoneScreen.position.set(0.0, 0.075, 0.01);
    phoneScreen.rotation.x = -0.35;
    phoneGroup.add(phoneScreen);

    scene.add(phoneGroup);
    registerClickable(phoneBody, 'phone');
    registerClickable(phoneScreen, 'phone');
    registerClickable(phoneStand, 'phone');

    // 12. Personal Guestbook Diary (Front Right)
    const diaryGroup = new THREE.Group();
    diaryGroup.position.set(0.12, 0.17, 0.17);
    diaryGroup.rotation.y = -0.15;

    const diaryBook = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.016, 0.22), diaryLeather);
    diaryBook.castShadow = true;
    diaryGroup.add(diaryBook);

    const diaryPages = new THREE.Mesh(
      new THREE.BoxGeometry(0.174, 0.012, 0.214),
      new THREE.MeshStandardMaterial({ color: 0xf2ebd9, roughness: 0.8 })
    );
    diaryPages.position.set(0.002, 0.0, 0.0);
    diaryGroup.add(diaryPages);

    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.15, 16), silverMetal);
    pen.position.set(0.01, 0.012, 0.0);
    pen.rotation.z = Math.PI / 2;
    pen.castShadow = true;
    diaryGroup.add(pen);

    scene.add(diaryGroup);
    registerClickable(diaryBook, 'diary');
    registerClickable(pen, 'diary');

    // 13. Interactive Walnut Business Card Holder & Brushed Titanium Card
    const cardHolderGroup = new THREE.Group();
    cardHolderGroup.position.set(-0.04, 0.169, 0.22);
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

    // 14. Mushroom Desk Lamp (Right rear)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.42, 0.17, -0.05);

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

    // 15. Ceramic Coffee Mug with Rising Steam
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.085, 20), ceramicMat);
    mug.position.set(0.31, 0.21, -0.16);
    mug.castShadow = true;
    scene.add(mug);
    registerClickable(mug, 'mug');

    const coffeeSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.034, 16),
      new THREE.MeshBasicMaterial({ color: 0x3d2314 })
    );
    coffeeSurface.position.set(0.31, 0.25, -0.16);
    coffeeSurface.rotation.x = -Math.PI / 2;
    scene.add(coffeeSurface);

    // Subtle Steam Particles
    const steamCount = 18;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let s = 0; s < steamCount; s++) {
      steamPositions[s * 3] = 0.31 + (Math.random() - 0.5) * 0.03;
      steamPositions[s * 3 + 1] = 0.26 + Math.random() * 0.08;
      steamPositions[s * 3 + 2] = -0.16 + (Math.random() - 0.5) * 0.03;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.015,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    // 16. Succulent Plant in Terracotta Pot (Interactive rosette with leaf sway)
    const plantGroup = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.07, 16), terracottaMat);
    pot.position.set(0.44, 0.20, -0.22);
    pot.castShadow = true;
    plantGroup.add(pot);

    succulentLeavesRef.current = [];
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.09, 8), plantGreen);
      leaf.position.set(0.44 + (Math.cos(i * 0.785) * 0.018), 0.265, -0.22 + (Math.sin(i * 0.785) * 0.018));
      leaf.rotation.set((Math.sin(i) * 0.28), i * 0.785, (Math.cos(i) * 0.28));
      leaf.castShadow = true;
      leaf.userData = { initialRot: leaf.rotation.clone(), leafIndex: i };
      plantGroup.add(leaf);
      succulentLeavesRef.current.push(leaf);
    }
    scene.add(plantGroup);
    registerClickable(pot, 'plant');
    registerClickable(plantGroup, 'plant');

    // 17. Framed Photo & Spectacles
    const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.095, 0.008), blackPlastic);
    photoFrame.position.set(0.14, 0.215, -0.20);
    photoFrame.rotation.y = -0.18;
    photoFrame.castShadow = true;
    scene.add(photoFrame);
    registerClickable(photoFrame, 'photo');

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

      glassesGroup.add(eyeGroup);
    });

    // Keyhole bridge arch connecting the two rims
    const bridgeGeom = new THREE.TorusGeometry(0.0055, 0.0018, 12, 24, Math.PI);
    const bridgeMesh = new THREE.Mesh(bridgeGeom, spectFrameMat);
    bridgeMesh.position.set(0, sCenterY + 0.003, 0);
    bridgeMesh.castShadow = true;
    glassesGroup.add(bridgeMesh);
    registerClickable(bridgeMesh, 'glasses');

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

        // Hover Zoro causes head to wobble
        if (name === 'zoro') {
          zoroWobbleRef.current = Math.max(zoroWobbleRef.current, 0.35);
        }
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
        } else if (name === 'zoro') {
          soundFX.playClick();
          zoroWobbleRef.current = 0.65;
          focusObject('zoro');
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
          setIsXRayMode(prev => {
            const next = !prev;
            if (next) setSelectedXRayItem(XRAY_DESK_ITEMS[3]);
            else setSelectedXRayItem(null);
            return next;
          });
        } else if (name === 'tablet') {
          soundFX.playClick();
          setIsDocketOpen(true);
        } else if (name === 'phone') {
          soundFX.playClick();
          handleOpenPhone();
        } else if (name === 'plant') {
          soundFX.playWaterDrop();
          plantBounceRef.current = 1.0;
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
        // Empty space clicked: if card is held, smoothly put it back down
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
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Lerping & Mouse Parallax Inertia (Matching pradiplabs.dev)
      if (!focusedTargetRef.current && cardAnimRef.current.out < 0.1 && !isXRayModeRef.current) {
        const parallaxX = mouseParallaxRef.current.x * 0.08;
        const parallaxY = mouseParallaxRef.current.y * 0.04;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamPos.current.x + parallaxX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamPos.current.y + parallaxY, 0.05);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamPos.current.z, 0.07);
        controls.target.x = THREE.MathUtils.lerp(controls.target.x, targetLookAt.current.x + parallaxX * 0.4, 0.05);
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, targetLookAt.current.y + parallaxY * 0.4, 0.05);
        controls.target.z = THREE.MathUtils.lerp(controls.target.z, targetLookAt.current.z, 0.07);
      } else {
        camera.position.lerp(targetCamPos.current, 0.07);
        controls.target.lerp(targetLookAt.current, 0.07);
      }
      controls.update();

      // Dynamic 3D Object Projection for X-Ray Numbered Badges (1 to 12)
      if (isXRayModeRef.current && container) {
        const rect = container.getBoundingClientRect();
        const pVec = new THREE.Vector3();
        const newCoords: Record<number, { x: number; y: number; visible: boolean }> = {};
        for (const t of XRAY_TARGETS) {
          pVec.copy(t.pos).project(camera);
          if (pVec.z > 1) {
            newCoords[t.id] = { x: 0, y: 0, visible: false };
          } else {
            const px = (pVec.x * 0.5 + 0.5) * rect.width;
            const py = (-pVec.y * 0.5 + 0.5) * rect.height;
            newCoords[t.id] = { x: px, y: py, visible: true };
          }
        }
        setBadgePositions(newCoords);
      }

      // Zoro Spring Wobble Physics (Harmonic multi-axis wobble + bounce)
      if (zoroHeadRef.current) {
        zoroWobbleRef.current *= 0.972; // Damped harmonic decay
        const wobble = zoroWobbleRef.current;
        zoroHeadRef.current.rotation.x = Math.sin(elapsedTime * 9.2) * wobble;
        zoroHeadRef.current.rotation.z = Math.cos(elapsedTime * 7.4) * wobble;
        zoroHeadRef.current.rotation.y = Math.sin(elapsedTime * 5.1) * (wobble * 0.4);
        zoroHeadRef.current.position.y = 0.09 + Math.abs(Math.sin(elapsedTime * 14.0)) * (wobble * 0.012);
      }

      // Succulent Plant Organic Leaf Sway & Water Drop Bounce
      if (succulentLeavesRef.current.length > 0) {
        if (plantBounceRef.current > 0.005) {
          plantBounceRef.current *= 0.94; // Spring recovery
        }
        const bounce = plantBounceRef.current;
        const swayBase = Math.sin(elapsedTime * 1.8) * 0.03;
        succulentLeavesRef.current.forEach((leaf, idx) => {
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
            arr[s * 3] = 0.31 + (Math.random() - 0.5) * 0.025;
            arr[s * 3 + 2] = -0.16 + (Math.random() - 0.5) * 0.025;
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
          flipQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * w.flip);
          turnQ.copy(tiltQ).multiply(flipQ);

          const containerSize = {
            width: container?.clientWidth || window.innerWidth,
            height: container?.clientHeight || window.innerHeight
          };
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
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;

      // Adapt camera FOV / distance based on viewport aspect ratio (Mobile & ultrawide compatibility)
      const frame = getResponsiveCameraFrame(w, h);
      if (!focusedTargetRef.current && cardAnimRef.current.out < 0.1 && !isXRayModeRef.current) {
        targetCamPos.current.copy(frame.pos);
        targetLookAt.current.copy(frame.lookAt);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    handleResize(); // Initial setup on load
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      cardMeshRef.current = null;
      cardGroupRef.current = null;
      cardMaterialsRef.current = null;
      succulentLeavesRef.current = [];
      sceneRef.current = null;
    };
  }, [dayMode, takeCard, putDownCard, triggerFlip]);

  const focusObject = (target: 'laptop' | 'tablet' | 'phone' | 'diary' | 'zcard' | 'printer' | 'zoro' | 'reset') => {
    soundFX.playClick();
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
    } else if (target === 'zoro') {
      setFocusedTarget('zoro');
      targetCamPos.current.set(-0.54, 0.36, 0.38);
      targetLookAt.current.set(-0.54, 0.24, 0.15);
    } else if (target === 'phone') {
      setFocusedTarget('phone');
      targetCamPos.current.set(0.27, 0.36, 0.32);
      targetLookAt.current.set(0.27, 0.24, 0.07);
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
        : 'bg-[#090b10] text-white'
    }`}>
      {/* Top Banner Headline (Matching pradiplabs.dev - cleanly hidden in X-Ray mode or when inspecting card) */}
      {!isXRayMode && !isCardHeld && (
        <div className="absolute top-14 sm:top-6 inset-x-0 z-20 pointer-events-none text-center px-4 max-w-2xl mx-auto transition-opacity duration-300">
          <h1 className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md font-display ${
            dayMode ? 'text-slate-900' : 'text-white'
          }`}>
            Hi, I'm Joshua (ZYNX).
          </h1>
          <p className={`mt-1.5 sm:mt-2 text-[11px] sm:text-xs md:text-sm max-w-xl mx-auto drop-shadow-sm font-sans ${
            dayMode ? 'text-slate-600' : 'text-slate-300'
          }`}>
            I build embedded systems, Arch Linux environments, and modern web applications. 
            Everything on this desk is real and running.
          </p>
        </div>
      )}

      {/* Top HUD Controls: Day/Night, X-Ray, Reset, Music, Showcase */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2">
        {(focusedTarget === 'laptop' || isMonitorOpen) && (
          <button
            onClick={() => { soundFX.playClick(); if (onOpenMonitor) onOpenMonitor(); else setIsMonitorOpen(true); }}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-[11px] sm:text-xs font-mono text-cyan-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Desktop</span>
            <span className="sm:hidden">OS</span>
          </button>
        )}

        {focusedTarget && (
          <button
            onClick={() => focusObject('reset')}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-[11px] sm:text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        )}

        {/* Spectacles (X-Ray Glasses Toggle) */}
        <button
          onClick={() => { soundFX.playClick(); setIsXRayMode(!isXRayMode); }}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md ${
            isXRayMode
              ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-amber-400/40'
              : 'bg-black/60 border-white/20 text-zinc-300 hover:text-white'
          }`}
          title="X-ray glasses · see how it's all made"
        >
          <SpectaclesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{isXRayMode ? 'Glasses On' : 'Spectacles'}</span>
        </button>

        {/* Showcase Switcher */}
        <button
          onClick={() => { soundFX.playClick(); onSwitchToShowcase(); }}
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 bg-black/60 hover:bg-black/90 text-[11px] sm:text-xs font-mono text-zinc-200 transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md"
          title="Switch to Showcase Carousel (jesperlandberg.com replica)"
        >
          <span className="hidden sm:inline">Showcase</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Ambient FM / 7YNX Audio Toggle (Matching pradiplabs.dev top-right speaker) */}
        <button
          onClick={() => {
            soundFX.playClick();
            if (onToggleMusic) onToggleMusic();
          }}
          className={`p-2 sm:p-2.5 rounded-full border transition-all shadow-lg backdrop-blur-md ${
            isMusicPlaying
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
              : 'border-white/15 bg-black/60 text-slate-300 hover:text-white'
          }`}
          title={isMusicPlaying ? 'Mute 7YNX Audio' : 'Play 7YNX Audio'}
        >
          {isMusicPlaying ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Day Studio vs Cozy Night Toggle */}
        <button
          onClick={() => { soundFX.playClick(); setDayMode(!dayMode); }}
          className="p-2 sm:p-2.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-amber-300 hover:text-white transition-all shadow-lg"
          title={dayMode ? 'Switch to Night Cozy Mode' : 'Switch to Day Studio Mode'}
        >
          {dayMode ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Tooltips (Matching pradiplabs.dev) */}
      {hoveredObject === 'diary' && (
        <div className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-sans shadow-xl flex items-center gap-2">
            <span>Open my diary · anyone can write in it</span>
          </div>
        </div>
      )}

      {(hoveredObject === 'card' || hoveredObject === 'zcard') && !isCardHeld && (
        <div className="absolute top-[55%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
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

      {hoveredObject === 'zoro' && (
        <div className="absolute top-[58%] left-[23%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-sans shadow-xl flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Zoro Bobblehead on a Spring · Click to Wobble!</span>
          </div>
        </div>
      )}

      {hoveredObject === 'lamp' && (
        <div className="absolute top-[48%] left-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-sans shadow-xl">
            Click to toggle desk lamp {lampOn ? 'OFF' : 'ON'}
          </div>
        </div>
      )}

      {hoveredObject === 'glasses' && !isCardHeld && (
        <div className="absolute top-[62%] left-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="whitespace-nowrap rounded-full bg-white text-zinc-900 px-3.5 py-1.5 text-[13px] font-medium shadow-xl flex items-center gap-2 ring-1 ring-black/10">
            <SpectaclesIcon className="w-4 h-4 text-amber-600" />
            <span>X-ray glasses</span>
            <span className="text-zinc-500 font-normal">· see how it's all made</span>
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
        <div className="absolute top-[48%] left-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>7YNX Smartphone · Live Audio & AI Chat</span>
          </div>
        </div>
      )}

      {/* Plant Hover Tooltip (Matching v2_03.png) */}
      {hoveredObject === 'plant' && (
        <div className="absolute top-[48%] left-[76%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-fade-in">
          <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-xs font-sans shadow-xl flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>Water the plant · watered {plantWaterCount} times</span>
          </div>
        </div>
      )}

      {/* Plant Watering Floating Drop Animation */}
      {waterDropAnim && (
        <div className="absolute top-[45%] left-[75%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-bounce">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs shadow-xl shadow-emerald-500/40">
            <Droplets className="w-3.5 h-3.5" />
            <span>+1 Hydrated! ({plantWaterCount})</span>
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
          <div className="mt-2.5 pointer-events-auto inline-block">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsXRayMode(false);
                setSelectedXRayItem(null);
              }}
              className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono transition shadow-lg flex items-center gap-2 mx-auto"
            >
              <SpectaclesIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Take off glasses (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* 12 Interactive Numbered Badges pinned to 3D Coordinates (Matching v2_10.png) */}
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
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
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

      {/* Interactive Tablet Docket Weighbridge Modal (Matching v2_02.png) */}
      <TabletDocketModal
        isOpen={isDocketOpen}
        onClose={() => setIsDocketOpen(false)}
        onPrintDocket={(order) => {
          setCurrentDocketOrder(order);
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

      {/* Bottom Bar Pills (Exact Navigation from pradiplabs.dev - scrollable on mobile, centered on desktop) */}
      {!isCardHeld && !focusedTarget && !isMonitorOpen && !isPhoneOpen && (
        <div className="absolute bottom-3 sm:bottom-6 inset-x-0 z-30 flex items-center justify-start sm:justify-center gap-2 px-3 sm:px-4 pointer-events-auto animate-fade-in overflow-x-auto no-scrollbar py-1 scroll-smooth pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => {
              soundFX.playClick();
              focusObject('laptop');
              setTimeout(() => {
                if (onOpenMonitor) onOpenMonitor();
                else setIsMonitorOpen(true);
              }, 360);
            }}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              focusedTarget === 'laptop' || isMonitorOpen
                ? 'bg-white text-slate-950 font-bold border-white'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <span className="font-semibold text-white">Laptop</span>
            <span className="hidden sm:inline text-slate-400">My websites</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsDocketOpen(true);
            }}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              isDocketOpen
                ? 'bg-white text-slate-950 font-bold border-white'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <span className="font-semibold text-white">Tablet</span>
            <span className="hidden sm:inline text-slate-400">Docket system</span>
          </button>

          <button
            onClick={handleOpenPhone}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              focusedTarget === 'phone' || isPhoneOpen
                ? 'bg-white text-slate-950 font-bold border-white'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <span className="font-semibold text-white">Phone</span>
            <span className="hidden sm:inline text-slate-400">7YNX Chat & Audio</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsStickyNotesOpen(true);
            }}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              isStickyNotesOpen
                ? 'bg-yellow-400 text-slate-950 font-bold border-yellow-300'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-semibold text-white">Notes</span>
            <span className="hidden sm:inline text-slate-400">Sticky notes</span>
          </button>

          <button
            onClick={onOpenDiary}
            className="px-3.5 py-2 rounded-full border border-white/15 bg-black/70 text-xs font-sans text-slate-300 hover:text-white hover:bg-black/90 transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0"
          >
            <span className="text-amber-300">✎</span>
            <span className="font-semibold text-white">Diary</span>
            <span className="hidden sm:inline text-slate-400">Guestbook</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setIsXRayMode((prev) => {
                const next = !prev;
                if (next) setSelectedXRayItem(XRAY_DESK_ITEMS[3]);
                else setSelectedXRayItem(null);
                return next;
              });
            }}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              isXRayMode
                ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-amber-400/40'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <SpectaclesIcon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">{isXRayMode ? 'Take off glasses' : "See how it's made"}</span>
          </button>

          <button
            onClick={takeCard}
            className={`px-3.5 py-2 rounded-full border text-xs font-sans transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shrink-0 ${
              isCardHeld
                ? 'bg-white text-slate-950 font-bold border-white'
                : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
            }`}
          >
            <span className="font-semibold text-white">Card</span>
            <span className="hidden sm:inline text-slate-400">Take my card</span>
          </button>

          <button
            onClick={onOpenAnatomy}
            className="px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-500/20 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-2 backdrop-blur-md shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Z Card Anatomy</span>
          </button>
        </div>
      )}

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

      {/* 7YNX Smartphone Experience Modal (Matching pradiplabs.dev phone experience) */}
      {isPhoneOpen && (
        <PhoneExperience
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
