import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Scale,
  Printer,
  Trash2
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export interface DocketItem {
  id: string;
  name: string;
  pricePerKg: number;
  weightKg: number;
  total: number;
}

export interface DocketOrder {
  docketNumber: string;
  customer: string;
  dateStr: string;
  items: DocketItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: string;
}

interface TabletDocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintDocket: (order: DocketOrder) => void;
}

const AVAILABLE_METALS = [
  { id: 'copper_bright', name: 'Bright copper wire', price: 11.60 },
  { id: 'copper_1', name: 'No. 1 copper', price: 11.10 },
  { id: 'mixed_brass', name: 'Mixed brass', price: 6.60 },
  { id: 'aluminium_rims', name: 'Aluminium rims', price: 2.70 },
  { id: 'stainless_304', name: 'Stainless 304', price: 1.40 },
  { id: 'car_batteries', name: 'Car batteries', price: 0.60 },
];

export const TabletDocketModal: React.FC<TabletDocketModalProps> = ({
  isOpen,
  onClose,
  onPrintDocket,
}) => {
  const [selectedMetal, setSelectedMetal] = useState(AVAILABLE_METALS[0]);
  const [currentWeight, setCurrentWeight] = useState<number>(45.5);
  const [docketItems, setDocketItems] = useState<DocketItem[]>([
    {
      id: 'init-1',
      name: 'Bright copper wire',
      pricePerKg: 11.60,
      weightKg: 38.2,
      total: 443.12,
    },
  ]);
  const [activeTab, setActiveTab] = useState<'purchases' | 'dashboard' | 'packing' | 'invoices'>('purchases');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handleAddWeight = (delta: number) => {
    soundFX.playClick();
    setCurrentWeight((prev) => Math.max(0.5, Math.round((prev + delta) * 10) / 10));
  };

  const handleAddItem = () => {
    if (currentWeight <= 0) return;
    soundFX.playClick();
    const lineTotal = Math.round(selectedMetal.price * currentWeight * 100) / 100;
    const newItem: DocketItem = {
      id: `${selectedMetal.id}-${Date.now()}`,
      name: selectedMetal.name,
      pricePerKg: selectedMetal.price,
      weightKg: currentWeight,
      total: lineTotal,
    };
    setDocketItems((prev) => [...prev, newItem]);
    setCurrentWeight(24.0); // Reset to standard payload for next item
  };

  const handleRemoveItem = (id: string) => {
    soundFX.playClick();
    setDocketItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = docketItems.reduce((acc, it) => acc + it.total, 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const grandTotal = Math.round((subtotal + gst) * 100) / 100;

  const handlePayAndPrint = () => {
    soundFX.playClick();
    setIsPrinting(true);
    soundFX.playPrinterThermalFeed();

    const order: DocketOrder = {
      docketNumber: '#044813',
      customer: 'Riverbend Demolition Pty',
      dateStr: new Date().toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: docketItems.length > 0 ? docketItems : [
        {
          id: 'def-1',
          name: 'Bright copper wire',
          pricePerKg: 11.60,
          weightKg: 45.5,
          total: 527.80,
        }
      ],
      subtotal: subtotal || 527.80,
      gst: gst || 52.78,
      total: grandTotal || 580.58,
      paymentMethod: 'EFT Transfer (ANZ - 4920)',
    };

    setTimeout(() => {
      onPrintDocket(order);
      setIsPrinting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <button
          onClick={() => { soundFX.playClick(); onClose(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono backdrop-blur-md border border-white/15 transition shadow-lg"
          title="Back to desk (Esc)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to the desk (Esc)</span>
        </button>
      </div>

      {/* Realistic Tablet Hardware Bezel & Enclosure */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[720px] rounded-[32px] bg-[#121620] p-3 sm:p-4 shadow-2xl border border-white/20 ring-1 ring-black/80 flex flex-col overflow-hidden">
        {/* Tablet Top Camera Dot */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-black border border-white/10 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-blue-900/60" />
        </div>

        {/* Tablet Screen Container */}
        <div className="relative w-full h-full rounded-[22px] bg-slate-900 overflow-hidden flex flex-col md:flex-row text-slate-800 shadow-inner">
          
          {/* ── Left Sidebar Navigation (Matching v2_02.png) ── */}
          <div className="w-full md:w-60 bg-[#0d1527] text-white flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 select-none">
            <div className="space-y-4">
              {/* App Brand Header */}
              <div className="flex items-center gap-2.5 px-2 pt-1">
                <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white font-bold flex items-center justify-center text-xs shadow-md tracking-wider">
                  DM
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-white leading-none">Demo Metals</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Docket Weighbridge</p>
                </div>
              </div>

              {/* Action Button: New purchase */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setDocketItems([]);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New purchase</span>
              </button>

              {/* Sidebar Menu Items */}
              <nav className="space-y-1 text-xs font-medium pt-2">
                <button
                  onClick={() => { soundFX.playClick(); setActiveTab('dashboard'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-800/80 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-slate-400">📊</span>
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => { soundFX.playClick(); setActiveTab('purchases'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                    activeTab === 'purchases'
                      ? 'bg-[#1e293b] text-white font-semibold border-l-2 border-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-blue-400">📋</span>
                  <span>Purchases</span>
                </button>
                <button
                  onClick={() => { soundFX.playClick(); setActiveTab('packing'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                    activeTab === 'packing'
                      ? 'bg-slate-800/80 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-slate-400">📦</span>
                  <span>Packing slips</span>
                </button>
                <button
                  onClick={() => { soundFX.playClick(); setActiveTab('invoices'); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                    activeTab === 'invoices'
                      ? 'bg-slate-800/80 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-slate-400">💼</span>
                  <span>Sales invoices</span>
                </button>
              </nav>
            </div>

            {/* Bottom User Card */}
            <div className="pt-4 border-t border-slate-800/80 px-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
                AM
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Alex Morgan</p>
                <p className="text-[10px] text-slate-400 truncate">Reception · demo data</p>
              </div>
            </div>
          </div>

          {/* ── Main Content Area (Matching v2_02.png) ── */}
          <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-y-auto">
            
            {/* Top Workspace Bar */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">New purchase</h1>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Docket #044813 · Riverbend Demolition
                </p>
              </div>

              {/* Hardware Status Chips */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Printer ready
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Xero connected
                </span>
              </div>
            </div>

            {/* Two-Column Interactive Work Area */}
            <div className="flex-1 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5 overflow-y-auto">
              
              {/* Left Column: 1. Pick Metal + 2. Weighbridge */}
              <div className="space-y-5">
                
                {/* 1 · PICK THE METAL */}
                <div>
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    1 · PICK THE METAL
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_METALS.map((metal) => {
                      const isSelected = selectedMetal.id === metal.id;
                      return (
                        <button
                          key={metal.id}
                          onClick={() => {
                            soundFX.playClick();
                            setSelectedMetal(metal);
                          }}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#2563eb] ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {metal.name}
                          </p>
                          <p className={`text-xs font-mono font-semibold mt-1 ${isSelected ? 'text-[#2563eb]' : 'text-slate-500'}`}>
                            ${metal.price.toFixed(2)}/kg
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2 · WEIGH IT */}
                <div>
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    2 · WEIGH IT
                  </h3>
                  
                  {/* Digital Scale Readout Box */}
                  <div className="rounded-2xl bg-[#0b1324] text-white p-5 shadow-lg border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <Scale className="w-3.5 h-3.5" />
                        Weighbridge · net
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Live Platform #1
                      </span>
                    </div>

                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white tabular-nums">
                        {currentWeight.toFixed(1)}
                      </span>
                      <span className="text-lg font-mono text-cyan-400 font-semibold">kg</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                      <span className="text-slate-400">
                        Rate: <strong className="text-white">${selectedMetal.price.toFixed(2)}/kg</strong>
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        = ${(selectedMetal.price * currentWeight).toFixed(2)}
                      </span>
                    </div>

                    {/* Weight Adjustment Nudges */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2">
                      <span className="text-[10px] text-slate-400 font-mono">Simulate:</span>
                      <button
                        onClick={() => handleAddWeight(5.0)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                      >
                        +5 kg
                      </button>
                      <button
                        onClick={() => handleAddWeight(25.0)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                      >
                        +25 kg
                      </button>
                      <button
                        onClick={() => handleAddWeight(50.0)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                      >
                        +50 kg
                      </button>
                      <button
                        onClick={() => { soundFX.playClick(); setCurrentWeight(10.0); }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 ml-auto"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Add to Docket Button */}
                  <button
                    onClick={handleAddItem}
                    className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to the docket</span>
                  </button>
                </div>
              </div>

              {/* Right Column: 3. THE DOCKET Summary & Print */}
              <div className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div>
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                    3 · THE DOCKET
                  </h3>

                  {docketItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Nothing on the docket yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {docketItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <p className="text-[11px] font-mono text-slate-500">
                              {item.weightKg.toFixed(1)} kg @ ${item.pricePerKg.toFixed(2)}/kg
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              ${item.total.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Calculation & Print Button */}
                <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>GST included (10%)</span>
                    <span className="font-mono">${gst.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total to pay</span>
                    <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handlePayAndPrint}
                    disabled={isPrinting}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isPrinting ? 'Transmitting to Thermal Printer...' : '🖨 Pay by EFT and print'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
