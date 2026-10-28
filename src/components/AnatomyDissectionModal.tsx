import React, { useState } from 'react';
import { X, Layers, Sun, Fingerprint, BatteryCharging, Cpu, ShieldCheck, Box, Sliders } from 'lucide-react';

interface AnatomyDissectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Part {
  id: string;
  name: string;
  assembly: string;
  offsetZ: number;
  material: string;
  role: string;
  thickness: string;
  color: string;
}

const PARTS: Part[] = [
  {
    id: 'film',
    name: 'Top Anti-Scratch PET Hardcoat Film',
    assembly: 'Surface Protection Layer',
    offsetZ: 95,
    material: 'Polyethylene terephthalate with optical anti-glare finish',
    role: 'Protects the e-paper screen, solar ribbon, and biometric sensor against abrasion and moisture.',
    thickness: '0.10 mm',
    color: 'border-cyan-400 text-cyan-300'
  },
  {
    id: 'solar',
    name: 'Ambient Micro-Solar Photovoltaic Ribbon',
    assembly: 'Energy Harvesting Strip',
    offsetZ: 75,
    material: 'Amorphous silicon (a-Si) with silver collector busbars',
    role: 'Harvests 15–30 µW indoor (200 lux) and up to 1.5 mW sun to keep the bistable display controller perpetually active.',
    thickness: '0.20 mm',
    color: 'border-amber-400 text-amber-300'
  },
  {
    id: 'biometric',
    name: 'Capacitive Biometric Fingerprint Ring',
    assembly: 'Authentication Module',
    offsetZ: 70,
    material: 'Capacitive sapphire electrode with diamond-cut steel bezel',
    role: 'Authenticates user fingerprint locally via Match-on-Card (MoC) algorithms before enabling NFC transmission.',
    thickness: '0.25 mm',
    color: 'border-emerald-400 text-emerald-300'
  },
  {
    id: 'display',
    name: '1.54" Bi-Stable E-Paper Display Module',
    assembly: 'Visual Credential Interface',
    offsetZ: 48,
    material: 'Electrophoretic micro-capsule film with active TFT backplane',
    role: 'Draws power ONLY during image refresh. Renders dynamic card faces, dynamic CVV security codes, and flight/ticket snippets.',
    thickness: '0.25 mm',
    color: 'border-blue-400 text-blue-300'
  },
  {
    id: 'chip',
    name: 'ISO/IEC 7816 Micro-Coated Contact Module',
    assembly: 'Galvanic Dip Terminal',
    offsetZ: 44,
    material: '8-pad gold-plated beryllium copper alloy',
    role: 'Provides backward compatibility with traditional dip POS terminals, ATMs, and physical smartcard readers.',
    thickness: '0.20 mm',
    color: 'border-yellow-400 text-yellow-300'
  },
  {
    id: 'pcb',
    name: '4-Layer High-Density Flex-Rigid PCB Core',
    assembly: 'Substrate & Silicon Core',
    offsetZ: 18,
    material: 'Polyimide flex circuit with EAL6+ Secure Element & nRF52840 SoC',
    role: 'Hosts the cryptographic vault and BLE radio while flexing without broken solder joints under ISO 7810 bend cycles.',
    thickness: '0.40 mm',
    color: 'border-indigo-400 text-indigo-300'
  },
  {
    id: 'coil',
    name: 'Planar Inductive Qi Wireless Charging Coil',
    assembly: 'Resonant Inductive Receiver',
    offsetZ: -10,
    material: 'Concentric 4-turn copper spiral with ultra-thin ferrite shielding',
    role: 'Enables rapid wireless drop-and-charge convenience on standard Qi phone charging pads.',
    thickness: '0.25 mm',
    color: 'border-orange-400 text-orange-300'
  },
  {
    id: 'battery',
    name: 'Solid-State Lithium Ceramic Battery Pouch',
    assembly: 'Energy Buffer & Safety Pouch',
    offsetZ: -35,
    material: 'Solid-state ceramic lithium electrolyte with Kapton safety tab',
    role: 'Non-combustible, bend-tolerant power source providing current bursts for e-paper refresh and BLE synchronization.',
    thickness: '0.45 mm',
    color: 'border-rose-400 text-rose-300'
  },
  {
    id: 'chassis',
    name: 'Structural Polycarbonate Bottom Chassis',
    assembly: 'Enclosure Base',
    offsetZ: -75,
    material: 'Magnesium-reinforced matte dark polycarbonate',
    role: 'Provides torsional rigidity and structural containment adhering to ISO/IEC 7810 ID-1 standard.',
    thickness: '0.35 mm',
    color: 'border-slate-500 text-slate-300'
  }
];

export const AnatomyDissectionModal: React.FC<AnatomyDissectionModalProps> = ({ isOpen, onClose }) => {
  const [explodeFactor, setExplodeFactor] = useState(0.85); // 0 to 1
  const [selectedPart, setSelectedPart] = useState<Part>(PARTS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-[#090b10] border border-cyan-500/30 text-slate-100 shadow-2xl overflow-hidden relative my-auto">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#0c0e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Anatomy Reveal Engine
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Z Card v0.1 — 9-Layer Anatomical Dissection
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Dissection Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          
          {/* Left: Interactive 3D Exploded Visual Stack */}
          <div className="lg:col-span-7 bg-[#050609] p-6 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            
            {/* Top Explode Slider Control */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono mb-4">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Sliders className="w-3.5 h-3.5" /> Separation: {Math.round(explodeFactor * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-44 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Exploded Layers Display (Isometric projection) */}
            <div className="relative w-full h-[360px] flex items-center justify-center">
              {PARTS.map((part) => {
                const isSelected = selectedPart.id === part.id;
                const translateY = -part.offsetZ * explodeFactor;

                return (
                  <div
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    style={{
                      transform: `translate(-50%, -50%) translateY(${translateY}px) rotateX(55deg) rotateZ(-38deg)`,
                    }}
                    className={`absolute top-1/2 left-1/2 w-56 h-36 rounded-xl border-2 transition-all duration-300 cursor-pointer shadow-xl flex items-center justify-between p-3 select-none ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/70 shadow-cyan-500/30 scale-105 z-30'
                        : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/60 z-10'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">
                      <span className={`block font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {part.name.split(' ')[0]} {part.name.split(' ')[1]}
                      </span>
                      <span>{part.thickness}</span>
                    </div>

                    <div className="text-right">
                      {part.id === 'solar' && <Sun className="w-4 h-4 text-amber-400" />}
                      {part.id === 'biometric' && <Fingerprint className="w-4 h-4 text-emerald-400" />}
                      {part.id === 'display' && <Layers className="w-4 h-4 text-blue-400" />}
                      {part.id === 'chip' && <Cpu className="w-4 h-4 text-yellow-400" />}
                      {part.id === 'pcb' && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                      {part.id === 'coil' && <BatteryCharging className="w-4 h-4 text-orange-400" />}
                      {part.id === 'battery' && <Box className="w-4 h-4 text-rose-400" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[11px] font-mono text-slate-500">
              Drag separation slider or click layer to inspect physical anatomy.
            </div>
          </div>

          {/* Right: Selected Component Detailed Anatomy Card */}
          <div className="lg:col-span-5 bg-[#0b0e14] p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {selectedPart.assembly}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5 font-display">
                  {selectedPart.name}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Layer Thickness:</span>
                  <p className="text-cyan-300 font-mono font-bold text-sm mt-0.5">
                    {selectedPart.thickness}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Material Composition:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {selectedPart.material}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Anatomical Function:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {selectedPart.role}
                  </p>
                </div>
              </div>

              {/* Quick Jump List */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                  Select Anatomical Layer:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PARTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPart(p)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                        selectedPart.id === p.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Total Stack Target: 1.40 mm</span>
              <span className="text-cyan-400">Honest ISO ID-1 Profile</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
