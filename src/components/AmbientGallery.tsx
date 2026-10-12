import React, { useState } from "react";
import { Sparkles, Maximize2, X, Download, Eye, Compass } from "lucide-react";

interface AmbientItem {
  id: string;
  title: string;
  category: string;
  mood: string;
  image: string;
  tag: string;
}

export const AmbientGallery: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AmbientItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const items: AmbientItem[] = [
    {
      id: "black-hole-accretion",
      title: "4K Black Hole Accretion Disk",
      category: "space",
      tag: "4K Relativistic Space",
      mood: "Gravitational lensing and photon sphere warping around an active Schwarzschild black hole singularity.",
      image: "/images/space/black-hole-accretion.jpg",
    },
    {
      id: "deep-nebula-4k",
      title: "Deep Space Stellar Nebula",
      category: "space",
      tag: "8K Cosmic Vista",
      mood: "Vast glowing interstellar clouds and hydrogen star clusters drifting across deep cosmos.",
      image: "/images/space/deep-nebula-4k.jpg",
    },
    {
      id: "interstellar-gateway",
      title: "Interstellar Orbital Gateway",
      category: "space",
      tag: "4K Celestial",
      mood: "Planetary orbit aligned with distant spiral galaxy arms and cosmic starlight.",
      image: "/images/space/interstellar-gateway.jpg",
    },
    {
      id: "gaming-cyber-room",
      title: "Cyber Battlestation & Gaming Hub",
      category: "gaming",
      tag: "Battlestation Rig",
      mood: "RGB-backlit dual monitor rig optimized for competitive gaming, coding, and live streaming.",
      image: "/images/space/gaming-cyber-room.jpg",
    },
    {
      id: "lofi-study",
      title: "Lo-Fi Study Sanctuary",
      category: "lofi",
      tag: "4K Lo-Fi Aesthetic",
      mood: "Cozy desk lamps, rainy window reflections, and warm analog headphones.",
      image: "/images/ambient/lofi-study-night.jpg",
    },
    {
      id: "soothing-rain",
      title: "Rain on the Timber Bridge",
      category: "atmospheric",
      tag: "Atmospheric Calm",
      mood: "Gentle raindrops descending over lantern-lit waters and quiet mountain silhouettes.",
      image: "/images/ambient/soothing-rain.jpg",
    },
    {
      id: "winter-evening",
      title: "Winter Evening Village",
      category: "atmospheric",
      tag: "Japanese Village",
      mood: "Crisp snowy air, glowing wooden tavern lanterns, and serene silence.",
      image: "/images/ambient/winter-evening.jpg",
    },
    {
      id: "celestial-moon",
      title: "Celestial Moon & Horizon",
      category: "space",
      tag: "Cosmic Serenity",
      mood: "Supermoon casting soft cyan reflections across tranquil night tides.",
      image: "/images/ambient/anime-moon.jpg",
    },
    {
      id: "anime-city-sunset",
      title: "Neo-Tokyo Twilight City",
      category: "anime",
      tag: "Anime Cityscape",
      mood: "Towering neon skyscrapers glowing against an amber twilight sky.",
      image: "/images/gallery/illustration-anime-city.jpg",
    },
    {
      id: "anime-waterfall",
      title: "Hidden Waterfall Sanctuary",
      category: "atmospheric",
      tag: "Anime Nature",
      mood: "Pristine mountain waterfalls flowing through ancient lush forests.",
      image: "/images/gallery/anime-waterfall-scene.jpg",
    },
    {
      id: "alien-forest",
      title: "Alien Bioluminescent Forest",
      category: "space",
      tag: "Cosmic Sci-Fi",
      mood: "Luminescent alien flora casting surreal purple and teal glows in the cosmic night.",
      image: "/images/gallery/alien-forest-illustration.jpg",
    },
    {
      id: "wp-lofi-pc",
      title: "Lo-Fi Study Battlestation (4K)",
      category: "lofi",
      tag: "4K Desktop",
      mood: "Cozy bedroom desktop setup with warm desk lamps and rain acoustics.",
      image: "/images/gallery/wp12671622-pc-lofi-wallpapers.png",
    },
    {
      id: "cockpit-hud",
      title: "Automotive Cockpit Telemetry",
      category: "gaming",
      tag: "Cockpit HUD",
      mood: "Instrument cluster HUD with CAN telemetry and high-tech cockpit illumination.",
      image: "/images/projects/cockpit-cdc.jpg",
    },
  ];

  const categories = [
    { id: "all", label: "All Media (4K/8K)" },
    { id: "space", label: "4K Space & Black Holes" },
    { id: "lofi", label: "Lo-Fi & Cozy" },
    { id: "atmospheric", label: "Atmospheric & Rain" },
    { id: "anime", label: "Anime & Cyberpunk" },
    { id: "gaming", label: "Gaming & Battlestations" },
  ];

  const filteredItems = items.filter((item) =>
    activeFilter === "all" ? true : item.category === activeFilter
  );

  return (
    <section id="ambient-gallery" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-pink-400"></span>
          <span className="text-xs font-mono tracking-widest text-pink-400 uppercase">
            04 // VISUAL AESTHETICS & SANCTUARY
          </span>
          <span className="w-8 h-px bg-pink-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Curated Visuals & Ambient Art
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Inspiring, soothing high-definition media and artwork that fuel the creative world of <span className="text-cyan-400">ZYNX</span> and the sound design of <span className="text-purple-400">7YNX</span>.
        </p>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-300 border ${
                activeFilter === cat.id
                  ? "bg-pink-600/30 border-pink-400 text-pink-200 font-semibold shadow-md shadow-pink-600/20"
                  : "cyber-glass border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Ambient Media Cards */}
      <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-2xl overflow-hidden cyber-glass border border-white/10 hover:border-pink-400/50 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 flex flex-col"
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Tag Pill */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
                <Sparkles size={11} className="text-pink-400" />
                <span>{item.tag}</span>
              </div>

              {/* Expand Action Icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-pink-300 group-hover:border-pink-400/40 transition-colors opacity-0 group-hover:opacity-100">
                <Maximize2 size={13} />
              </div>
            </div>

            {/* Information Card Bottom */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-zinc-100 group-hover:text-pink-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                  {item.mood}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-400 group-hover:text-pink-400 transition-colors">
                  <Eye size={12} />
                  <span>Inspect High-Res</span>
                </span>
                <span className="text-zinc-600">HQ Media</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-5xl w-full cyber-glass border border-white/15 rounded-3xl overflow-hidden shadow-2xl bg-[#080811]/95 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse"></span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {selectedItem.title}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {selectedItem.tag} // Inspiring Visual Archive
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedItem.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg cyber-glass border border-white/10 hover:border-pink-400 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Full View</span>
                </a>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-lg cyber-glass border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="relative flex-1 overflow-auto bg-black flex items-center justify-center max-h-[60vh] p-2">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Description Footer */}
            <div className="p-5 px-6 border-t border-white/10 bg-black/40 flex items-center justify-between sm:flex-col sm:items-start gap-4">
              <p className="text-xs text-zinc-300 font-sans max-w-xl leading-relaxed">
                <span className="font-mono text-pink-400 mr-2">MOOD:</span>
                {selectedItem.mood}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 whitespace-nowrap">
                <Compass size={13} className="text-pink-400" />
                <span>ZYNX AESTHETIC DIRECTORY</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
