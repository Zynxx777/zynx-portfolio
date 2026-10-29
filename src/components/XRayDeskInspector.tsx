import React from 'react';
import { X, Layers } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export interface XRayDeskItem {
  id: number;
  key: string;
  name: string;
  description: string;
  pieces: number;
  triangles: string;
  lines: number;
  filePath: string;
  lineRange: string;
  codeSnippet: string;
}

export const XRAY_DESK_ITEMS: XRayDeskItem[] = [
  {
    id: 1,
    key: 'printer',
    name: 'Thermal POS Printer',
    description: 'Procedural dark chassis with a precision paper slit, glowing multi-state status LED, and animated thermal paper slip that feeds forward dynamically on docket dispatch.',
    pieces: 4,
    triangles: '1,840',
    lines: 48,
    filePath: 'src/desk/scene/Printer.tsx',
    lineRange: 'lines 45-92',
    codeSnippet: `const printerBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.14, 0.11, 0.15),
  new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.85 })
);
const printerSlot = new THREE.Mesh(
  new THREE.BoxGeometry(0.09, 0.005, 0.015),
  new THREE.MeshStandardMaterial({ color: 0x050505 })
);
// Real-time thermal paper feed animation
if (receiptPaperMeshRef.current && receiptAnimRef.current > 0.01) {
  const curScale = receiptPaperMeshRef.current.scale.y;
  receiptPaperMeshRef.current.scale.y = THREE.MathUtils.lerp(curScale, 1.0, 0.08);
}`
  },
  {
    id: 2,
    key: 'zoro',
    name: 'Zoro Bobblehead',
    description: 'Chibi bobblehead figure mounted on a tempered spring with real-time damped harmonic oscillation physics. Click or hover him to see him wobble.',
    pieces: 6,
    triangles: '3,460',
    lines: 65,
    filePath: 'src/desk/scene/ZoroFigurine.tsx',
    lineRange: 'lines 70-134',
    codeSnippet: `// Damped harmonic oscillator physics for head wobble
if (zoroHeadRef.current) {
  zoroWobbleRef.current *= 0.965; // Harmonic energy decay
  const wobble = zoroWobbleRef.current;
  zoroHeadRef.current.rotation.x = Math.sin(elapsedTime * 8.5) * wobble;
  zoroHeadRef.current.rotation.z = Math.cos(elapsedTime * 6.8) * wobble;
}
const bandana = new THREE.Mesh(
  new THREE.SphereGeometry(0.038, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 })
);`
  },
  {
    id: 3,
    key: 'tablet',
    name: 'Tablet (Docket System)',
    description: 'Runs the real Demo Metals weighbridge and docket system. Select scrap metals, adjust net weight on the scale, and send the order straight to the desk printer.',
    pieces: 6,
    triangles: '12,256',
    lines: 202,
    filePath: 'src/desk/store.ts',
    lineRange: 'lines 158-189',
    codeSnippet: `/** Send a receipt to the printer and step the camera back */
print(lines: string[]) {
  desk.set({
    printJob: { id: Date.now(), lines },
    printing: true,
    paperOut: false,
    holding: false,
    folded: false,
    arrived: false,
    rect: null,
  });
}`
  },
  {
    id: 4,
    key: 'laptop',
    name: 'Laptop',
    description: 'Rounded slabs cut from flat outlines, and a keyboard laid out key by key and drawn in one go. Open it and the real site is laid exactly over the glass.',
    pieces: 11,
    triangles: '9,420',
    lines: 90,
    filePath: 'src/desk/scene/Laptop.tsx',
    lineRange: 'lines 28-57',
    codeSnippet: `const lidGroup = new THREE.Group();
lidGroup.position.set(0, 0.008, -0.11);
lidGroup.rotation.x = 1.85; // Opened screen angle

const screenMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(0.32, 0.20),
  new THREE.MeshBasicMaterial({ map: laptopTexture })
);
lidGroup.add(screenMesh);
// Laying out scissor keyboard keys in continuous matrix
for (let row = 0; row < rows.length; row++) {
  addKeyRow(row, rows[row]);
}`
  },
  {
    id: 5,
    key: 'notes',
    name: 'Sticky notes',
    description: 'Every doodle is a list of pen strokes. Pick a note up and they\'re drawn onto it a little at a time, so it looks written while you watch.',
    pieces: 4,
    triangles: '96',
    lines: 377,
    filePath: 'src/desk/scene/doodles.ts',
    lineRange: 'lines 354-376',
    codeSnippet: `/** Draws a note: its paper, its title if it has one, and pen marks */
export function drawNote(g: CanvasRenderingContext2D, note: Note) {
  const s = NOTE_PX;
  g.fillStyle = note.color;
  g.fillRect(0, 0, s, s);
  // Sticky strip along top is a touch darker
  g.fillStyle = "rgba(0,0,0,0.035)";
  g.fillRect(0, 0, s, 64);
  g.textBaseline = "alphabetic";
  if (note.title) {
    g.fillStyle = INK;
    g.font = "700 50px Caveat, cursive";
    g.fillText(note.title, 34, 100);
  }
}`
  },
  {
    id: 6,
    key: 'zcard',
    name: 'Z Business Card',
    description: 'Universal Smart Everything Card. Click to pull the card from its wooden dock along a cubic Bézier arc to camera eye-level, then tap to flip to contact links or view full 3D layer dissection.',
    pieces: 9,
    triangles: '18,600',
    lines: 292,
    filePath: 'src/components/AnatomyDissectionModal.tsx',
    lineRange: 'lines 12-85',
    codeSnippet: `// 9 micro-subsystems: e-paper, solar ribbon, biometric, Qi coil
const bezierCurve = new THREE.CubicBezierCurve3(
  CARD_REST_POS,
  aVec.copy(CARD_REST_POS).setY(CARD_REST_POS.y + 0.16),
  bVec.copy(heldTarget.p).lerp(aVec, 0.4),
  heldTarget.p
);
bezierCurve.getPoint(w.out, cardMesh.position);
cardMesh.quaternion.slerpQuaternions(CARD_REST_ROT, heldTarget.q, slerpProgress);`
  },
  {
    id: 7,
    key: 'diary',
    name: 'Guestbook Diary & Stylus',
    description: 'Hand-stitched leatherbound guestbook journal with parchment pages and silver capacitive stylus. Anyone visiting can leave their entry and sign their name.',
    pieces: 5,
    triangles: '2,420',
    lines: 140,
    filePath: 'src/components/DiaryModal.tsx',
    lineRange: 'lines 24-88',
    codeSnippet: `const leatherCover = new THREE.Mesh(
  new THREE.BoxGeometry(0.18, 0.018, 0.24),
  new THREE.MeshStandardMaterial({ color: 0x1f1917, roughness: 0.9 })
);
const silverStylus = new THREE.Mesh(
  new THREE.CylinderGeometry(0.004, 0.004, 0.17, 16),
  new THREE.MeshStandardMaterial({ metalness: 0.95, roughness: 0.2 })
);`
  },
  {
    id: 8,
    key: 'photo',
    name: 'Picture Frame',
    description: 'Minimalist aluminum desk picture frame with matte black border and beveled stand, holding a personal photo.',
    pieces: 3,
    triangles: '840',
    lines: 52,
    filePath: 'src/desk/scene/PhotoFrame.tsx',
    lineRange: 'lines 1396-1406',
    codeSnippet: `const photoFrame = new THREE.Mesh(
  new THREE.BoxGeometry(0.08, 0.095, 0.008),
  new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 })
);
photoFrame.position.set(0.14, 0.215, -0.20);
photoFrame.rotation.y = -0.18;
photoFrame.castShadow = true;`
  },
  {
    id: 9,
    key: 'mug',
    name: 'Coffee Mug',
    description: 'Slip-cast ceramic coffee mug with extruded torus ear handle and realistic rising steam particle system.',
    pieces: 3,
    triangles: '2,880',
    lines: 68,
    filePath: 'src/desk/scene/CoffeeMug.tsx',
    lineRange: 'lines 1350-1375',
    codeSnippet: `const mugBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.034, 0.032, 0.085, 24, 1, true),
  ceramicWhiteMat
);
const handle = new THREE.Mesh(
  new THREE.TorusGeometry(0.024, 0.005, 12, 24, Math.PI),
  ceramicWhiteMat
);
handle.position.set(0.036, 0, 0);`
  },
  {
    id: 10,
    key: 'lamp',
    name: 'Mushroom Desk Lamp',
    description: 'Warm 3.6W mushroom dome desk lamp casting a rich radial pool of warm light on the wooden desk. Tap it anytime to toggle lighting on/off.',
    pieces: 4,
    triangles: '4,120',
    lines: 85,
    filePath: 'src/desk/scene/MushroomLamp.tsx',
    lineRange: 'lines 1310-1345',
    codeSnippet: `const lampDome = new THREE.Mesh(
  new THREE.SphereGeometry(0.08, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  lampShadeMat
);
const lampStem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.009, 0.18, 16),
  copperMat
);
const pointLight = new THREE.PointLight(0xff9944, 3.6, 2.2, 1.8);`
  },
  {
    id: 11,
    key: 'phone',
    name: 'Smartphone (7YNX DSP & AI)',
    description: 'Smartphone on an anodized angled aluminum desktop stand running live 7YNX DSP radio audio and local AI sales assistant.',
    pieces: 5,
    triangles: '4,680',
    lines: 120,
    filePath: 'src/desk/scene/Smartphone.tsx',
    lineRange: 'lines 1250-1290',
    codeSnippet: `const phoneGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(0.068, 0.14),
  new THREE.MeshBasicMaterial({ map: phoneTexture })
);
const standBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.045, 0.048, 0.008, 24),
  silverMetalMat
);`
  },
  {
    id: 12,
    key: 'plant',
    name: 'Potted Succulent Plant',
    description: 'Succulent plant in a terracotta pot with 8 radial fleshy leaves. Click to water the plant and keep it hydrated.',
    pieces: 9,
    triangles: '3,240',
    lines: 75,
    filePath: 'src/desk/scene/SucculentPlant.tsx',
    lineRange: 'lines 1380-1395',
    codeSnippet: `const pot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.045, 0.032, 0.07, 16),
  terracottaMat
);
for (let i = 0; i < 8; i++) {
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.09, 8), plantGreen);
  leaf.position.set(Math.cos(i * 1.05) * 0.016, 0.27, Math.sin(i * 1.05) * 0.016);
  leaf.rotation.set(Math.sin(i) * 0.25, i * 1.05, Math.cos(i) * 0.25);
}`
  }
];

interface XRayDeskInspectorProps {
  selectedItem: XRayDeskItem | null;
  onClose: () => void;
  onOpenAnatomy?: () => void;
}

export const XRayDeskInspector: React.FC<XRayDeskInspectorProps> = ({
  selectedItem,
  onClose,
  onOpenAnatomy
}) => {
  if (!selectedItem) return null;

  return (
    <div className="absolute top-16 right-4 sm:right-8 z-40 w-full max-w-[400px] pointer-events-auto animate-fadeIn select-text">
      {/* Floating Card Styled Exactly like v2_10.png */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-zinc-200/90 shadow-2xl p-5 sm:p-6 text-zinc-900 transition-all">
        
        {/* Header: Badge Number + Title + Close Button */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25">
              {selectedItem.id}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">
              {selectedItem.name}
            </h3>
          </div>
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 leading-relaxed mt-1">
          {selectedItem.description}
        </p>

        {/* 3 Metric Cards (Matching v2_10.png) */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-2xl bg-zinc-100/90 border border-zinc-200/60">
            <p className="text-base font-bold font-mono text-zinc-900 leading-none">
              {selectedItem.pieces}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">pieces</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-100/90 border border-zinc-200/60">
            <p className="text-base font-bold font-mono text-zinc-900 leading-none">
              {selectedItem.triangles}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">triangles</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-100/90 border border-zinc-200/60">
            <p className="text-base font-bold font-mono text-zinc-900 leading-none">
              {selectedItem.lines}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 truncate">
              lines in code
            </p>
          </div>
        </div>

        {/* File and Lines Metadata */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-4 px-1">
          <span className="truncate">{selectedItem.filePath}</span>
          <span className="shrink-0">{selectedItem.lineRange}</span>
        </div>

        {/* Syntax-Highlighted Code Box */}
        <div className="mt-2 rounded-2xl bg-[#0f141f] text-zinc-200 p-3.5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[220px] shadow-inner border border-zinc-800">
          <pre className="text-emerald-300 font-mono whitespace-pre-wrap">
            <code>{selectedItem.codeSnippet}</code>
          </pre>
        </div>

        {/* Special Action for Item 6 (Z Card) */}
        {selectedItem.id === 6 && onOpenAnatomy && (
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenAnatomy();
            }}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Open 3D Layer Dissection</span>
          </button>
        )}
      </div>
    </div>
  );
};
