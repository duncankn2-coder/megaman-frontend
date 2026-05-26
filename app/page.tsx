"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faSliders,
  faLeaf,
  faDownload,
  faArrowRight,
  faCheck,
  faTools,
  faBolt
} from '@fortawesome/free-solid-svg-icons';

interface Category {
  id: string;
  name: string;
}

interface Family {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
  families?: Family;
  // Tech Specs added for the premium interactive spec-planner
  cri: number;
  cct: number; // in Kelvin
  beamAngle: string;
  wattage: number;
  lumens: number;
  imageUrl?: string;
  modelCode: string;
}

// Curated architectural premium products matching Megaman.cc branding & XAL styling
const CURATED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "SIENA Recessed LED Downlight",
    description: "Ultra-slim structural downlight with deep recess for superior glare control (UGR < 19). Fully dimmable and high efficacy.",
    categories: [{ id: "downlights", name: "Downlights" }, { id: "luminaires", name: "Indoor Lighting" }],
    families: { id: "siena", name: "SIENA" },
    cri: 92,
    cct: 3000,
    beamAngle: "36°",
    wattage: 12,
    lumens: 1050,
    modelCode: "F50309RC",
    imageUrl: "/hospitality_project_lobby.png"
  },
  {
    id: "2",
    name: "FITO Sleek Track Light",
    description: "Premium architectural track spotlight. Delivers high luminous flux with advanced thermal management and CRI 97 color rendering.",
    categories: [{ id: "track", name: "Track Lighting" }, { id: "luminaires", name: "Indoor Lighting" }],
    families: { id: "fito", name: "FITO" },
    cri: 97,
    cct: 4000,
    beamAngle: "24°",
    wattage: 18,
    lumens: 1620,
    modelCode: "F52802TR",
    imageUrl: "/retail_project_showroom.png"
  },
  {
    id: "3",
    name: "INGENIUM Matter Smart LED Reflector",
    description: "Matter-compatible smart lamp. Features ultra-smooth dimming, full color temperature tuning, and mesh reliability.",
    categories: [{ id: "lamps", name: "Lamps" }, { id: "smart", name: "Light Management" }],
    families: { id: "ingenium", name: "INGENIUM® Matter" },
    cri: 90,
    cct: 2700,
    beamAngle: "60°",
    wattage: 6.5,
    lumens: 520,
    modelCode: "LR5907-MTR",
    imageUrl: "/smart_lighting_matter.png"
  },
  {
    id: "4",
    name: "ESTELA Architectural Linear LED",
    description: "Minimalist surface-mounted batten creating a continuous line of glare-free architectural light. Tailor-made for office environments.",
    categories: [{ id: "batten", name: "Indoor Batten" }, { id: "luminaires", name: "Indoor Lighting" }],
    families: { id: "estela", name: "ESTELA" },
    cri: 95,
    cct: 4000,
    beamAngle: "120°",
    wattage: 28,
    lumens: 2950,
    modelCode: "B50812LN",
    imageUrl: "/hero_architectural_light.png"
  },
  {
    id: "5",
    name: "TOTT Damp Proof Batten",
    description: "Heavy-duty outdoor battens with IP66 protection. Offers exceptional efficacy and durability in tough industrial settings.",
    categories: [{ id: "outdoor", name: "Outdoor Lighting" }, { id: "damp-proof", name: "Damp Proof Batten" }],
    families: { id: "tott", name: "TOTT" },
    cri: 82,
    cct: 5000,
    beamAngle: "120°",
    wattage: 36,
    lumens: 4320,
    modelCode: "L51036DP",
    imageUrl: "/hero_architectural_light.png"
  },
  {
    id: "6",
    name: "AMBIE Golden Filament LED Globe",
    description: "Vintage-styled decorative glass bulb emitting cozy 2200K warm glow. Perfect replica of classical carbon filament lamps.",
    categories: [{ id: "lamps", name: "Lamps" }, { id: "decorative", name: "Decorative" }],
    families: { id: "ambie", name: "AMBIE" },
    cri: 90,
    cct: 2200,
    beamAngle: "360°",
    wattage: 4.8,
    lumens: 420,
    modelCode: "G50248DF",
    imageUrl: "/smart_lighting_matter.png"
  }
];

interface ApiProduct {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
  families?: Family;
  modelCode?: string;
}

export default function Home() {
  const [isLightOn, setIsLightOn] = useState(true);
  const [products, setProducts] = useState<Product[]>(CURATED_PRODUCTS);

  // Smart Light Simulator States
  const [smartBrightness, setSmartBrightness] = useState(80);
  const [smartCCT, setSmartCCT] = useState(3200);
  const [smartPower, setSmartPower] = useState(true);

  // Technical Filter States
  const [filterCRI, setFilterCRI] = useState<number | null>(null);
  const [filterCCT, setFilterCCT] = useState<number | null>(null);
  const [filterBeam, setFilterBeam] = useState<string | null>(null);

  // Selected Detail Modal
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);

  // Fetch API products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
          const data = await response.json();
          const fetchedDocs = (data.docs || []) as ApiProduct[];
          
          // Hybrid: Enhance fetched items with detailed specifications for the interactive planner
          if (fetchedDocs.length > 0) {
            const enhanced = fetchedDocs.map((item: ApiProduct, idx: number) => {
              const baseCurated = CURATED_PRODUCTS[idx % CURATED_PRODUCTS.length];
              return {
                id: item.id || `api-${idx}`,
                name: item.name || baseCurated.name,
                description: item.description || baseCurated.description,
                categories: item.categories || baseCurated.categories,
                families: item.families || baseCurated.families,
                cri: idx % 2 === 0 ? 95 : 90,
                cct: idx % 3 === 0 ? 2700 : idx % 3 === 1 ? 4000 : 3000,
                beamAngle: idx % 3 === 0 ? "24°" : idx % 3 === 1 ? "36°" : "60°",
                wattage: baseCurated.wattage,
                lumens: baseCurated.lumens,
                modelCode: item.modelCode || `F-${Math.floor(10000 + Math.random() * 90000)}`,
                imageUrl: baseCurated.imageUrl
              };
            });
            setProducts(enhanced);
          }
        }
      } catch (error) {
        console.error("Could not fetch API products, falling back to curated list.", error);
      }
    };
    fetchProducts();
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter(prod => {
    if (filterCRI && prod.cri < filterCRI) return false;
    if (filterCCT && prod.cct !== filterCCT) return false;
    if (filterBeam && prod.beamAngle !== filterBeam) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f3f4f6] relative font-sans selection:bg-[#e2c285] selection:text-[#08080a]">
      
      {/* SECTION 1: Architectural Full-Bleed Hero Section */}
      <section className="relative h-[92vh] w-full flex flex-col justify-end items-start px-6 md:px-16 py-16 overflow-hidden arch-grid-line arch-grid-line-horizontal">
        {/* Background Image Container with dynamic glow & transitions */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            isLightOn ? 'opacity-85 scale-100' : 'opacity-25 scale-105 filter grayscale contrast-125'
          }`}
        >
          <Image 
            src="/hero_architectural_light.png" 
            alt="Megaman Architectural Lighting" 
            fill
            priority
            className="object-cover transition-all duration-700"
          />
          {/* Subtle gradient vignette to overlay readable text */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-black/35"></div>
        </div>

        {/* Floating Drafting Grid Overlay simulating XAL blueprint aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-700">
          <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-white/20"></div>
          <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-white/20"></div>
          <div className="absolute left-[85%] top-0 bottom-0 w-[1px] bg-white/20"></div>
          <div className="absolute left-0 right-0 top-[35%] h-[1px] bg-white/20"></div>
          <div className="absolute left-0 right-0 top-[70%] h-[1px] bg-white/20"></div>
        </div>

        {/* Ambient Glow Aura */}
        <div className={`absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
          isLightOn ? 'bg-orange-300/20 opacity-100' : 'bg-blue-900/10 opacity-40'
        }`}></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-12 bg-[#e2c285] inline-block animate-pulse"></span>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#e2c285]">
              MEGAMAN® LIFE IN LIGHT
            </p>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light uppercase tracking-widest leading-[1.1] font-sans">
            {isLightOn ? (
              <>LIGHTING<br /><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#e2c285]">WITHOUT LIMITS</span></>
            ) : (
              <>PRECISION<br /><span className="font-bold text-neutral-500">IN DARKNESS</span></>
            )}
          </h1>

          <p className="text-sm md:text-base text-neutral-400 font-light max-w-lg leading-relaxed">
            {isLightOn 
              ? "Bridging energy-efficiency and elegant design. Discover our state-of-the-art LED Downlights, luminaires, and light components engineered to curate architectural excellence."
              : "Designing optical perfection for shadows. Lowering energy footprints while elevating modern space designs with architectural-grade LED systems."
            }
          </p>

          {/* Interactive Light Switch CTA */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => setIsLightOn(!isLightOn)}
              className={`px-8 py-3.5 border text-xs uppercase tracking-widest font-semibold flex items-center gap-3 transition-all duration-300 rounded-none cursor-pointer ${
                isLightOn 
                  ? 'border-[#e2c285] bg-[#e2c285]/5 text-[#e2c285] hover:bg-[#e2c285] hover:text-[#08080a]' 
                  : 'border-neutral-700 bg-transparent text-neutral-400 hover:border-white hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faLightbulb} className={isLightOn ? 'animate-bounce text-[#e2c285]' : ''} />
              Simulate: {isLightOn ? 'Lights Off' : 'Lights On'}
            </button>
            <a 
              href="#products-section" 
              className="text-xs uppercase tracking-widest font-bold hover:text-[#e2c285] transition-colors flex items-center gap-2 group py-3 px-4"
            >
              Explore Catalogue
              <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Side Specification Badge */}
        <div className="absolute right-6 md:right-16 bottom-16 hidden md:flex flex-col border border-white/10 p-5 glass-card pointer-events-none rounded-none text-left">
          <p className="text-[10px] uppercase text-neutral-500 tracking-[0.2em] mb-3">SYSTEM PARAMETERS</p>
          <div className="flex gap-8">
            <div>
              <p className="text-[9px] uppercase text-neutral-500 font-bold">STATE</p>
              <p className={`text-xs font-semibold ${isLightOn ? 'text-green-400' : 'text-neutral-500'}`}>
                {isLightOn ? 'ACTIVE (100%)' : 'STANDBY (5%)'}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-neutral-500 font-bold">ECO STATUS</p>
              <p className="text-xs font-semibold text-emerald-400">CLASS A++</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Smart Lighting & Technology Showcase (Asymmetrical Architectural Grid) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e2c285] mb-2 font-bold">INTELLIGENT INTEGRATION</p>
          <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-widest">INGENIUM® SMART SYSTEMS</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Smart lighting panel control (66% space spans 2 columns) */}
          <div className="lg:col-span-2 relative min-h-[500px] border border-white/10 p-8 flex flex-col justify-between overflow-hidden group glass-card">
            
            {/* Visual background image representing the smart system */}
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
              <Image 
                src="/smart_lighting_matter.png" 
                alt="Smart home matter lighting controller"
                fill
                className="object-cover"
              />
              {/* Dynamic light tint overlay driven by CCT slider */}
              <div 
                className="absolute inset-0 mix-blend-color transition-colors duration-300"
                style={{
                  backgroundColor: smartPower 
                    ? `rgba(255, ${Math.min(255, 150 + (smartCCT - 2000) / 20)}, ${Math.min(255, 100 + (smartCCT - 2000) / 10)}, ${smartBrightness / 400})` 
                    : 'rgba(0, 0, 0, 0.8)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-black/25 to-[#08080a]/50"></div>
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#e2c285] px-2 py-0.5 border border-[#e2c285] tracking-widest bg-[#e2c285]/5">
                  MATTER-COMPATIBLE
                </span>
                <h3 className="text-2xl uppercase tracking-widest font-light mt-3">INGENIUM® Matter Smart Hub</h3>
              </div>

              {/* Power Switch */}
              <button 
                onClick={() => setSmartPower(!smartPower)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                  smartPower ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 transform ${
                  smartPower ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </button>
            </div>

            {/* Smart Interactive Controller Panel */}
            <div className="relative z-10 bg-[#08080a]/80 backdrop-blur-md border border-white/5 p-6 mt-16 max-w-md w-full">
              <p className="text-xs uppercase tracking-widest font-bold mb-4 text-[#e2c285] flex items-center gap-2">
                <FontAwesomeIcon icon={faSliders} />
                Live Control Simulator
              </p>

              {/* Brightness slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>BRIGHTNESS</span>
                  <span className="text-[#e2c285] font-semibold">{smartPower ? `${smartBrightness}%` : 'OFF'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={smartBrightness} 
                  disabled={!smartPower}
                  onChange={(e) => setSmartBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#e2c285] disabled:opacity-30"
                />
              </div>

              {/* Color Temp (CCT) Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>COLOR TEMPERATURE (CCT)</span>
                  <span className="text-[#e2c285] font-semibold">{smartPower ? `${smartCCT}K` : 'OFF'}</span>
                </div>
                <input 
                  type="range" 
                  min="2200" 
                  max="6500" 
                  value={smartCCT} 
                  disabled={!smartPower}
                  onChange={(e) => setSmartCCT(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#e2c285] disabled:opacity-30"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                  <span>2200K (Candlelight)</span>
                  <span>4000K (Neutral)</span>
                  <span>6500K (Daylight)</span>
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 font-light border-t border-white/5 pt-3">
                {smartPower ? (
                  <p className="flex items-center gap-2 text-emerald-400">
                    <FontAwesomeIcon icon={faCheck} /> Mesh connected. Energy consumption: {Math.round(18 * (smartBrightness/100))}W
                  </p>
                ) : (
                  <p className="text-neutral-500">Device in deep standby mode. Low consumption (&lt;0.5W).</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 2 stacked Technical Resource Panels */}
          <div className="flex flex-col gap-6">
            
            {/* Top Box: Catalogues & Downloads */}
            <div className="border border-white/10 p-6 flex flex-col justify-between glass-card min-h-[238px]">
              <div>
                <p className="text-[10px] uppercase text-[#e2c285] tracking-[0.2em] font-semibold mb-1">TECHNICAL HUB</p>
                <h3 className="text-xl uppercase tracking-widest font-light">Resources & IES</h3>
                <p className="text-xs text-neutral-400 font-light mt-3 leading-relaxed">
                  Access direct PDF product catalogues, DIALux models, and complete architectural photometry files (IES/LDT) for your lighting calculations.
                </p>
              </div>

              <a 
                href="/resources/downloads" 
                className="text-xs uppercase tracking-widest font-bold text-white hover:text-[#e2c285] flex items-center justify-between border-t border-white/5 pt-4 group transition-colors"
              >
                <span>Download Library</span>
                <FontAwesomeIcon icon={faDownload} className="group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Bottom Box: TECOH LED Components */}
            <div className="border border-white/10 p-6 flex flex-col justify-between glass-card min-h-[238px]">
              <div>
                <p className="text-[10px] uppercase text-[#e2c285] tracking-[0.2em] font-semibold mb-1">COMPONENTS</p>
                <h3 className="text-xl uppercase tracking-widest font-light">TECOH® LED Modules</h3>
                <p className="text-xs text-neutral-400 font-light mt-3 leading-relaxed">
                  High-efficiency modules for fixtures. Excellent thermal design and uniform illumination providing robust solutions for developers.
                </p>
              </div>

              <a 
                href="/products/drivers" 
                className="text-xs uppercase tracking-widest font-bold text-white hover:text-[#e2c285] flex items-center justify-between border-t border-white/5 pt-4 group transition-colors"
              >
                <span>Modules & Drivers</span>
                <FontAwesomeIcon icon={faBolt} className="group-hover:animate-pulse" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: Sectors & Product Categories (XAL Clean Grid Layout) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5" id="products-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#e2c285] mb-2 font-bold">PORTFOLIO OVERVIEW</p>
            <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-widest">PRODUCT SECTORS</h2>
          </div>
          <Link 
            href="/products" 
            className="text-xs uppercase tracking-widest font-bold border-b border-white/20 pb-1 hover:border-[#e2c285] hover:text-[#e2c285] transition-colors"
          >
            Browse All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: LED Lamps */}
          <div className="border border-white/10 p-8 flex flex-col justify-between min-h-[380px] glass-card relative group">
            <div>
              <div className="text-[#e2c285] text-3xl mb-6">01</div>
              <h3 className="text-2xl uppercase tracking-widest font-light mb-4">LED LAMPS</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6">
                Meticulously designed bulbs including reflector bulbs, designer golden glass filaments, high-efficiency tubes, and dim-to-warm solutions replacing traditional energy-heavy halogen bulbs.
              </p>
            </div>
            
            {/* Tech Specs Sheet Slider */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">TYPICAL PARAMETERS</span>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 font-light">
                <div>CRI: <span className="font-bold text-white">90-95</span></div>
                <div>CCT: <span className="font-bold text-white">2200-4000K</span></div>
                <div>LIFETIME: <span className="font-bold text-white">25k h</span></div>
              </div>
              <Link 
                href="/products/lamps"
                className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                View Lamps &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Indoor Lighting */}
          <div className="border border-white/10 p-8 flex flex-col justify-between min-h-[380px] glass-card relative group">
            <div>
              <div className="text-[#e2c285] text-3xl mb-6">02</div>
              <h3 className="text-2xl uppercase tracking-widest font-light mb-4">LUMINAIRES</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6">
                Premium architectural lighting fixtures. Highlights include custom low-glare downlights, adjustable retail track spot lamps, office-grade linears, high bays, and decorative sleek wall sconces.
              </p>
            </div>
            
            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">TYPICAL PARAMETERS</span>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 font-light">
                <div>CRI: <span className="font-bold text-white">92-97</span></div>
                <div>UGR: <span className="font-bold text-white">&lt;19</span></div>
                <div>LIFETIME: <span className="font-bold text-white">50k h</span></div>
              </div>
              <Link 
                href="/products/indoor-lighting"
                className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                View Luminaires &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Light Management & Smart Controls */}
          <div className="border border-white/10 p-8 flex flex-col justify-between min-h-[380px] glass-card relative group">
            <div>
              <div className="text-[#e2c285] text-3xl mb-6">03</div>
              <h3 className="text-2xl uppercase tracking-widest font-light mb-4">SMART & CONTROL</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6">
                Future-ready light control structures including smart Matter nodes, ZigBee relays, controllers, motion sensors, exit signs, and high-efficiency TECOH components.
              </p>
            </div>
            
            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block mb-2">TYPICAL PARAMETERS</span>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 font-light">
                <div>PROTOCOL: <span className="font-bold text-white">Matter</span></div>
                <div>STANDBY: <span className="font-bold text-white">&lt;0.5W</span></div>
                <div>RANGE: <span className="font-bold text-white">Mesh</span></div>
              </div>
              <Link 
                href="/products/light-management"
                className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                View Smart Range &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: Premium Architectural Project Showcase (Brochure Aesthetic) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e2c285] mb-2 font-bold">PROJECTS IN LIGHT</p>
          <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-widest">GLOBAL REFERENCES</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Case 1: Hospitality Lobby */}
          <div className="flex flex-col gap-6 group">
            <div className="relative h-[400px] w-full overflow-hidden border border-white/10">
              <Image 
                src="/hospitality_project_lobby.png" 
                alt="Hospitality Lounge Project Showcase"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent"></div>
              
              {/* Technical Specifications Overlay on Project Image */}
              <div className="absolute left-6 bottom-6 right-6 flex justify-between items-end bg-[#08080a]/90 backdrop-blur-sm border border-white/10 p-4 max-w-sm rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">FIXTURE HIGHLIGHT</p>
                  <h4 className="text-sm font-semibold text-white">SIENA Recessed Spot</h4>
                  <p className="text-[10px] text-neutral-400 font-light mt-1">CRI &gt; 92, CCT 3000K, UGR &lt; 19</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">LUX LEVEL</p>
                  <p className="text-sm font-bold text-[#e2c285]">350 lx avg.</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4 items-center">
                <span className="text-[10px] uppercase font-bold text-[#e2c285] tracking-widest">HOSPITALITY</span>
                <span className="h-[1px] w-8 bg-neutral-800"></span>
                <span className="text-[10px] text-neutral-500 tracking-wider">ATHENS, GREECE</span>
              </div>
              <h3 className="text-xl uppercase tracking-widest font-light mt-2 mb-3">The Grand Plaza Lounge</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Utilizing low-glare deep recessed LED downlights to establish a welcoming, cozy environment with dynamic twilight dimming support. Reduces operational lighting energy by 68%.
              </p>
            </div>
          </div>

          {/* Case 2: Retail Showroom */}
          <div className="flex flex-col gap-6 group">
            <div className="relative h-[400px] w-full overflow-hidden border border-white/10">
              <Image 
                src="/retail_project_showroom.png" 
                alt="Luxury Retail Showroom Showcase"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent"></div>
              
              <div className="absolute left-6 bottom-6 right-6 flex justify-between items-end bg-[#08080a]/90 backdrop-blur-sm border border-white/10 p-4 max-w-sm rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">FIXTURE HIGHLIGHT</p>
                  <h4 className="text-sm font-semibold text-white">FITO Track Spotlight</h4>
                  <p className="text-[10px] text-neutral-400 font-light mt-1">CRI 97, CCT 4000K, Beam 24°</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">COLOR RENDERING</p>
                  <p className="text-sm font-bold text-[#e2c285]">Ra 97 (Perfect)</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4 items-center">
                <span className="text-[10px] uppercase font-bold text-[#e2c285] tracking-widest">RETAIL</span>
                <span className="h-[1px] w-8 bg-neutral-800"></span>
                <span className="text-[10px] text-neutral-500 tracking-wider">MILAN, ITALY</span>
              </div>
              <h3 className="text-xl uppercase tracking-widest font-light mt-2 mb-3">Quadrilatero Fashion Hub</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Implementing high-CRI 97 track spot luminaires. Meticulously engineered optics deliver striking high-contrast visual display while accurately rendering fine fabrics and textures.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: Technical Specification Planner (Engineered Interactive Tool) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e2c285] mb-2 font-bold">LIGHT PLANNING TOOL</p>
          <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-widest">SPECIFICATION FILTER</h2>
        </div>

        {/* Filters Controls Panel */}
        <div className="border border-white/10 p-6 md:p-8 bg-[#0a0a0c] mb-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-8">
            
            {/* CRI Filter */}
            <div>
              <label className="text-[10px] uppercase text-neutral-500 tracking-widest font-bold block mb-2">CRI (Color Rendering)</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilterCRI(null)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCRI === null ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterCRI(90)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCRI === 90 ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Ra &ge; 90
                </button>
                <button 
                  onClick={() => setFilterCRI(95)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCRI === 95 ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Ra &ge; 95 (Extreme)
                </button>
              </div>
            </div>

            {/* CCT Filter */}
            <div>
              <label className="text-[10px] uppercase text-neutral-500 tracking-widest font-bold block mb-2">Color Temp (CCT)</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilterCCT(null)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCCT === null ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterCCT(2700)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCCT === 2700 ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  2700K (Warm)
                </button>
                <button 
                  onClick={() => setFilterCCT(4000)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterCCT === 4000 ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  4000K (Neutral)
                </button>
              </div>
            </div>

            {/* Beam Angle Filter */}
            <div>
              <label className="text-[10px] uppercase text-neutral-500 tracking-widest font-bold block mb-2">Beam Angle</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilterBeam(null)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterBeam === null ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterBeam("24°")}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterBeam === "24°" ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Narrow (24°)
                </button>
                <button 
                  onClick={() => setFilterBeam("36°")}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-none cursor-pointer ${
                    filterBeam === "36°" ? 'bg-[#e2c285] text-[#08080a] font-bold' : 'border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Medium (36°)
                </button>
              </div>
            </div>

          </div>

          {/* Reset button */}
          {(filterCRI || filterCCT || filterBeam) && (
            <button 
              onClick={() => {
                setFilterCRI(null);
                setFilterCCT(null);
                setFilterBeam(null);
              }}
              className="text-xs uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-[#08080a] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Matching Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full border border-white/5 py-16 text-center text-neutral-500 font-light">
              No matching high-end specs found in current configuration.
            </div>
          ) : (
            filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                onClick={() => setActiveProductDetail(prod)}
                className="border border-white/10 p-6 flex flex-col justify-between glass-card hover:border-[#e2c285] cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{prod.modelCode}</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#e2c285] border border-[#e2c285]/20 px-2 py-0.5">
                      CRI {prod.cri}
                    </span>
                  </div>

                  <h3 className="text-lg uppercase tracking-wider font-light mb-2 group-hover:text-[#e2c285] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed mb-4">
                    {prod.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-neutral-400">
                  <div className="flex gap-4">
                    <div>CCT: <span className="font-bold text-white">{prod.cct}K</span></div>
                    <div>BEAM: <span className="font-bold text-white">{prod.beamAngle}</span></div>
                  </div>
                  <span className="text-[#e2c285] font-semibold text-[9px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW SPEC SHEET &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Technical Specification Sheet Drawer Modal */}
        {activeProductDetail && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm transition-all duration-300">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setActiveProductDetail(null)}
            ></div>
            
            <div className="relative z-10 w-full max-w-lg bg-[#0a0a0c] border-l border-white/10 h-full p-8 md:p-12 overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Close Button */}
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
                  <span className="text-xs uppercase tracking-widest text-[#e2c285] font-bold">TECHNICAL SPEC SHEET</span>
                  <button 
                    onClick={() => setActiveProductDetail(null)}
                    className="text-neutral-500 hover:text-white uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Close [ESC]
                  </button>
                </div>

                {/* Main Product Header */}
                <h3 className="text-2xl uppercase tracking-widest font-light mb-2">
                  {activeProductDetail.name}
                </h3>
                <p className="text-xs font-mono text-neutral-500 mb-6">MODEL REF: {activeProductDetail.modelCode}</p>

                <p className="text-xs text-neutral-400 font-light leading-relaxed mb-8">
                  {activeProductDetail.description}
                </p>

                {/* Data Sheet Parameter Table */}
                <div className="border-t border-b border-white/5 py-4 mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">OPTICAL & ELECTRICAL SCHEMATICS</h4>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-light">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Color Temperature (CCT)</span>
                      <span className="font-semibold text-white">{activeProductDetail.cct} K</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Color Rendering (CRI)</span>
                      <span className="font-semibold text-white">Ra &ge; {activeProductDetail.cri}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Beam Angle Option</span>
                      <span className="font-semibold text-white">{activeProductDetail.beamAngle}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Luminous Flux Output</span>
                      <span className="font-semibold text-white">{activeProductDetail.lumens} lm</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Rated Wattage</span>
                      <span className="font-semibold text-white">{activeProductDetail.wattage} W</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-500">Luminous Efficacy</span>
                      <span className="font-semibold text-white">{Math.round(activeProductDetail.lumens / activeProductDetail.wattage)} lm/W</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 col-span-2">
                      <span className="text-neutral-500">Dimmability</span>
                      <span className="font-semibold text-white">Yes (Linear DALI / Matter Mesh)</span>
                    </div>
                  </div>
                </div>

                {/* Additional Tech Resources */}
                <div className="border border-white/10 p-4 bg-[#08080a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faTools} className="text-[#e2c285]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white tracking-widest">DIALUX CAD DATABASES</p>
                      <p className="text-[9px] text-neutral-500 font-light">3D modeling IES light ray geometry included</p>
                    </div>
                  </div>
                  <button className="text-[10px] uppercase font-bold border border-white/20 px-3 py-1.5 hover:bg-[#e2c285] hover:text-[#08080a] hover:border-transparent transition-all cursor-pointer">
                    Get CAD
                  </button>
                </div>
              </div>

              {/* Action buttons at drawer bottom */}
              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-[#e2c285] text-[#08080a] py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors rounded-none cursor-pointer">
                  Download LDT/IES Data Sheet
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: Sustainability (Premium Clean Minimal Banner) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto relative overflow-hidden">
        {/* Dynamic backdrop accent */}
        <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-emerald-950/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="border border-[#1b3d2e] p-8 md:p-16 bg-gradient-to-br from-[#0c1a13] to-[#08080a] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <FontAwesomeIcon icon={faLeaf} className="text-lg animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold">ECO-EFFICIENCY & SUSTAINABILITY</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-widest text-white leading-tight">
              LIFE IN LIGHT: <br /><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">OUR CARBON ZERO GOAL</span>
            </h2>

            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed mt-4">
              Megaman is dedicated to offering genuine replacement energy-efficient designs. By utilizing modular components, plastic-free recycable alloy casings, zero mercury materials, and long-life drivers, our smart LED downlights reduce carbon impact by up to 86% over traditional bulbs.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-xs font-mono text-neutral-400 border-l border-emerald-900/40 pl-6 lg:pl-12 min-w-[200px]">
            <div>
              <span className="text-[#e2c285] font-bold text-lg block">&gt; 86%</span>
              <span>LUMEN ENERGY SAVING</span>
            </div>
            <div>
              <span className="text-[#e2c285] font-bold text-lg block">50,000 hrs</span>
              <span>DESIGNED PRODUCT LIFETIME</span>
            </div>
            <div>
              <span className="text-emerald-400 font-bold text-lg block">100%</span>
              <span>RECYCLABLE MATERIAL CASING</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-Density Minimalist Footer */}
      <footer className="bg-[#050507] border-t border-white/5 py-16 px-6 md:px-16 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Megaman Corporate Info */}
          <div>
            <Image 
              src="/MEGAMAN_Logo.png" 
              alt="Megaman Logo" 
              width={140} 
              height={45} 
              className="h-10 w-auto object-contain mb-6 brightness-125"
            />
            <p className="text-[11px] text-neutral-400 font-light leading-relaxed max-w-xs">
              Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mb-4">PRODUCTS</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
              <li><Link href="/products/lamps" className="hover:text-white transition-colors">LED Lamps & Classic Bulbs</Link></li>
              <li><Link href="/products/indoor-lighting" className="hover:text-white transition-colors">Architectural Downlights</Link></li>
              <li><Link href="/products/outdoor-lighting" className="hover:text-white transition-colors">Outdoor Battens & Floodlights</Link></li>
              <li><Link href="/products/light-management" className="hover:text-white transition-colors">INGENIUM Smart Matter</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mb-4">RESOURCES</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-neutral-400 font-light">
              <li><Link href="/resources/downloads" className="hover:text-white transition-colors">Technical Download Center</Link></li>
              <li><Link href="/company/news-and-press" className="hover:text-white transition-colors">Latest News & Press</Link></li>
              <li><Link href="/company/quality" className="hover:text-white transition-colors">Quality Assurance Standards</Link></li>
              <li><Link href="/resources/videos" className="hover:text-white transition-colors">Tutorials & Case Videos</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#e2c285] font-bold mb-4">NEWSLETTER</h4>
            <p className="text-[11px] text-neutral-400 font-light mb-4 leading-relaxed">
              Sign up for professional specifications updates, DIALux models release, and design releases.
            </p>
            <div className="flex border border-white/10">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="bg-transparent text-xs p-3 flex-1 focus:outline-none placeholder:text-neutral-600 uppercase text-white font-mono"
              />
              <button className="bg-[#e2c285] text-[#08080a] text-xs px-4 uppercase font-bold hover:bg-white transition-colors cursor-pointer">
                JOIN
              </button>
            </div>
          </div>

        </div>

        {/* Copy / Legals row */}
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-light gap-4">
          <p>&copy; {new Date().getFullYear()} MEGAMAN®. ALL RIGHTS RESERVED. POWERED BY ARCHITECTURAL STANDARDS.</p>
          <div className="flex gap-6 uppercase tracking-wider">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies Config</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}