import React from 'react';
import { X, Printer } from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import { type DocketOrder } from './TabletDocketModal';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DocketOrder | null;
  onReprint?: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  onReprint
}) => {
  if (!isOpen) return null;

  const currentOrder: DocketOrder = order || {
    docketNumber: '#044813',
    customer: 'Riverbend Demolition Pty',
    dateStr: new Date().toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    items: [
      {
        id: 'copper-1',
        name: 'Bright copper wire',
        pricePerKg: 11.60,
        weightKg: 45.5,
        total: 527.80
      }
    ],
    subtotal: 527.80,
    gst: 52.78,
    total: 580.58,
    paymentMethod: 'EFT Transfer (ANZ - 4920)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-cyan-400/30">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Thermal POS Receipt
          </span>
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Paper Slip with Serrated Perforated Edges */}
        <div className="relative w-full bg-[#fdfdfc] text-zinc-900 shadow-2xl rounded-sm p-6 font-mono text-[11px] leading-relaxed select-text border border-zinc-200">
          
          {/* Top Perforation / Tear Jagged Teeth */}
          <div className="absolute -top-2 left-0 right-0 h-2 bg-[#fdfdfc] [clip-path:polygon(0%_100%,2.5%_0%,5%_100%,7.5%_0%,10%_100%,12.5%_0%,15%_100%,17.5%_0%,20%_100%,22.5%_0%,25%_100%,27.5%_0%,30%_100%,32.5%_0%,35%_100%,37.5%_0%,40%_100%,42.5%_0%,45%_100%,47.5%_0%,50%_100%,52.5%_0%,55%_100%,57.5%_0%,60%_100%,62.5%_0%,65%_100%,67.5%_0%,70%_100%,72.5%_0%,75%_100%,77.5%_0%,80%_100%,82.5%_0%,85%_100%,87.5%_0%,90%_100%,92.5%_0%,95%_100%,97.5%_0%,100%_100%)]" />

          {/* Store Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-400">
            <p className="font-bold text-sm tracking-wider uppercase text-zinc-950">DEMO METALS RECYCLING</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">INDUSTRIAL WEIGHBRIDGE & RECEPTION</p>
            <p className="text-[10px] text-zinc-500">ABN 84 920 184 329 · DOCKET TERMINAL #1</p>
          </div>

          {/* Order Details */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-zinc-700">
            <div className="flex justify-between font-bold text-zinc-900">
              <span>DOCKET NUMBER:</span>
              <span>{currentOrder.docketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{currentOrder.dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>CUSTOMER:</span>
              <span className="truncate max-w-[170px] text-right">{currentOrder.customer}</span>
            </div>
            <div className="flex justify-between">
              <span>OPERATOR:</span>
              <span>ALEX MORGAN (ID: 04)</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-zinc-400 space-y-2">
            <div className="flex justify-between font-bold text-zinc-900 text-[10px] uppercase border-b border-zinc-200 pb-1">
              <span>ITEM / RATE</span>
              <span>WEIGHT</span>
              <span>TOTAL</span>
            </div>
            {currentOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div className="truncate max-w-[130px]">
                  <p className="font-semibold text-zinc-900 truncate">{it.name}</p>
                  <p className="text-[10px] text-zinc-500">${it.pricePerKg.toFixed(2)}/kg</p>
                </div>
                <span className="text-zinc-600">{it.weightKg.toFixed(1)}kg</span>
                <span className="font-bold text-zinc-950">${it.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1">
            <div className="flex justify-between text-zinc-600">
              <span>SUBTOTAL (EX GST):</span>
              <span>${currentOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>GST (10%):</span>
              <span>${currentOrder.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1">
              <span>TOTAL PAID (AUD):</span>
              <span>${currentOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
              <span>PAYMENT METHOD:</span>
              <span>{currentOrder.paymentMethod}</span>
            </div>
          </div>

          {/* Barcode & Footer */}
          <div className="pt-4 text-center space-y-2">
            {/* Monospace SVG Barcode Simulation */}
            <div className="flex items-center justify-center gap-[2px] h-9 px-4 overflow-hidden opacity-85">
              {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7, 9, 5, 0, 2, 8, 8, 4, 1, 9, 7, 1, 6, 9, 3, 9, 9, 3, 7, 5, 1, 0, 5, 8, 2, 0, 9, 7, 4, 9, 4, 4, 5, 9, 2, 3, 0, 7].map((w, i) => (
                <div
                  key={i}
                  className="h-full bg-zinc-900"
                  style={{ width: `${(w % 3) + 1}px` }}
                />
              ))}
            </div>
            <p className="text-[9px] tracking-widest text-zinc-500 font-mono">* 0 4 4 8 1 3 - D O C K E T *</p>
            <p className="text-[10px] text-zinc-600 font-semibold pt-1">
              *** THANK YOU FOR RECYCLING ***
            </p>
          </div>

          {/* Bottom Perforation / Tear Jagged Teeth */}
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#fdfdfc] [clip-path:polygon(0%_0%,2.5%_100%,5%_0%,7.5%_100%,10%_0%,12.5%_100%,15%_0%,17.5%_100%,20%_0%,22.5%_100%,25%_0%,27.5%_100%,30%_0%,32.5%_100%,35%_0%,37.5%_100%,40%_0%,42.5%_100%,45%_0%,47.5%_100%,50%_0%,52.5%_100%,55%_0%,57.5%_100%,60%_0%,62.5%_100%,65%_0%,67.5%_100%,70%_0%,72.5%_100%,75%_0%,77.5%_100%,80%_0%,82.5%_100%,85%_0%,87.5%_100%,90%_0%,92.5%_100%,95%_0%,97.5%_100%,100%_0%)]" />
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex items-center gap-2">
          {onReprint && (
            <button
              onClick={() => {
                soundFX.playPrinterThermalFeed();
                onReprint();
              }}
              className="px-4 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Feed Paper Again
            </button>
          )}
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono border border-white/20 transition shadow"
          >
            Tuck Back In (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
