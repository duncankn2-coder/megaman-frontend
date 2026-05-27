"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faFilePdf, 
  faLightbulb, 
  faCheck, 
  faTimes, 
  faInfoCircle,
  faSlidersH,
  faSearch,
  faCogs,
  faGlobe,
  faFileAlt,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

interface MediaFile {
  url: string;
  filename?: string;
}

interface Product {
  id: string;
  name: string; // Model Number
  description?: string;
  categories: { id: string; name: string }[];
  images?: { url: string; alt?: string; filename?: string };
  colour?: string;
  power?: string;
  colourTemperature?: string;
  specifications?: Record<string, unknown> | null;
  datasheetPdf?: MediaFile | null;
  photometryLdt?: MediaFile | null;
  photometryIes?: MediaFile | null;
  bimRevit?: MediaFile | null;
}

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  filename?: string;
  type: 'image' | 'video';
}

interface Family {
  id: string;
  name: string;
  description?: string;
  media: MediaItem[];
  products: Product[];
}

interface FamilyDetailClientProps {
  family: Family;
}

// Extraction utility for technical parameters inside product specifications JSON (RZB Style)
const getProductSpec = (product: Product, specNames: string[], defaultValue = '—'): string => {
  if (!product.specifications) {
    if (specNames.includes('power') && product.power) return product.power;
    if (specNames.includes('colourTemperature') && product.colourTemperature) return product.colourTemperature;
    if (specNames.includes('colour') && product.colour) return product.colour;
    return defaultValue;
  }
  
  const specs = product.specifications as Record<string, unknown>;
  for (const name of specNames) {
    if (specs[name] !== undefined && specs[name] !== null) {
      return String(specs[name]);
    }
  }

  // Fallback fields
  if (specNames.includes('power') && product.power) return product.power;
  if (specNames.includes('colourTemperature') && product.colourTemperature) return product.colourTemperature;
  if (specNames.includes('colour') && product.colour) return product.colour;
  
  return defaultValue;
};

export default function FamilyDetailClient({ family }: FamilyDetailClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [powerFilter, setPowerFilter] = useState('All');
  const [colorTempFilter, setColorTempFilter] = useState('All');
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'technical' | 'photometrics'>('overview');

  // Local state to keep product content during slide-out animation (400ms)
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      setActiveDrawerProduct(selectedProduct);
    } else {
      const timer = setTimeout(() => {
        setActiveDrawerProduct(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedProduct]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveModalTab('overview');
  };

  const handleDownloadFile = (fileObj: MediaFile | null | undefined, defaultMsg: string) => {
    if (fileObj && fileObj.url) {
      const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
      window.open(`${payloadUrl}${fileObj.url}`, '_blank');
    } else {
      alert(defaultMsg);
    }
  };

  const mediaList = useMemo(() => family.media || [], [family.media]);
  const activeMedia = mediaList[activeMediaIndex];

  // Dynamically extract unique filtering parameters from products
  const filtersData = useMemo(() => {
    const powers = new Set<string>();
    const colorTemps = new Set<string>();
    
    family.products?.forEach(p => {
      const pwr = getProductSpec(p, ['power', 'System power', 'systemPower', 'wattage']);
      const ct = getProductSpec(p, ['colourTemperature', 'Color Temperature', 'colorTemp', 'CCT']);
      if (pwr && pwr !== '—') powers.add(pwr);
      if (ct && ct !== '—') colorTemps.add(ct);
    });

    return {
      powers: Array.from(powers),
      colorTemps: Array.from(colorTemps)
    };
  }, [family.products]);

  // Handle product filtering & searching
  const filteredProducts = useMemo(() => {
    return (family.products || []).filter(product => {
      const pwr = getProductSpec(product, ['power', 'System power', 'systemPower', 'wattage']);
      const ct = getProductSpec(product, ['colourTemperature', 'Color Temperature', 'colorTemp', 'CCT']);
      
      const matchesPower = powerFilter === 'All' || pwr === powerFilter;
      const matchesColorTemp = colorTempFilter === 'All' || ct === colorTempFilter;
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesPower && matchesColorTemp && matchesSearch;
    });
  }, [family.products, powerFilter, colorTempFilter, searchQuery]);

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen pb-24 relative font-sans selection:bg-[#005288] selection:text-white">
      
      {/* Self-contained high-performance slide keyframe animation for the drawer */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-drawer-slide {
          animation: drawerSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Dynamic Breadcrumbs with clean gray border */}
      <nav className="border-b border-gray-200 bg-gray-50 py-5 relative">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <Link href="/" className="hover:text-[#005288] transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="hover:text-[#005288] transition-colors">Products</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#005288]">{family.name} Series</span>
          </div>
        </div>
      </nav>

      {/* RZB Triona-style Hero Product Showcase (RZB Dual-Column Split Grid) */}
      <section className="border-b border-gray-200 py-16 bg-white relative">
        
        {/* Fine drafting-blueprint crosshairs & grids */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-black"></div>
          <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-black"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Interactive Product Gallery (Sidelite Optical Vibe) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="relative aspect-video w-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                {activeMedia ? (
                  activeMedia.type === 'image' ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${activeMedia.url}`}
                      alt={activeMedia.alt || family.name}
                      fill
                      className="object-contain p-12 transition-transform duration-700 hover:scale-102"
                      priority
                    />
                  ) : (
                    <video controls className="w-full h-full object-contain">
                      <source src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${activeMedia.url}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <FontAwesomeIcon icon={faLightbulb} className="text-5xl text-gray-300 mb-3" />
                    <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">MEGAMAN® VISUAL GALLERY</span>
                  </div>
                )}

                {/* Sidelite Glowing Tech Badge */}
                <div className="absolute left-6 top-6 bg-[#005288] text-white py-1.5 px-3 text-[9px] uppercase tracking-widest font-semibold shadow-sm">
                  SIDELITE® OPTICAL ENGINE
                </div>
              </div>

              {/* Thumbnails grid with fine borders */}
              {mediaList.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {mediaList.map((media, idx) => (
                    <button
                      key={media.id}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative aspect-video bg-white border focus:outline-none transition-all cursor-pointer shadow-sm ${
                        activeMediaIndex === idx
                          ? 'border-[#005288] ring-1 ring-[#005288]/30 bg-[#005288]/5'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${media.url}`}
                          alt={media.alt || ''}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[8px] font-bold text-gray-500">
                          VIDEO
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: RZB Toledo Series Key Information & Certifications */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-[1px] w-8 bg-[#005288]"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288]">
                    ARCHITECTURAL SERIES
                  </span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-light uppercase tracking-widest text-gray-900 leading-none mb-6">
                  {family.name} <span className="font-bold text-[#005288]">SYSTEM</span>
                </h1>
                
                {family.description ? (
                  <p className="text-gray-500 font-light text-xs leading-relaxed mb-8">
                    {family.description}
                  </p>
                ) : (
                  <p className="text-gray-400 font-light text-xs italic leading-relaxed mb-8">
                    An elegant product series featuring tool-free mounting, sleek profile design, and low glare emissions, perfectly customized for clean architectural ceilings.
                  </p>
                )}

                {/* Technical Characteristics Grid (RZB Toledo Features style) */}
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-150">
                  Key Technical Characteristics
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {[
                    "Excellent light uniformity through high-performance PMMA diffuser",
                    "Circadian biology support with optional Tunable White (HCL) controls",
                    "Ultra-thin recessed height, ideal for tight ceiling cutouts",
                    "Pre-wired plug & play connection for rapid installation",
                    "Spring clip system for immediate, tool-free mounting",
                    "Ingress protection class IP54/IP65 options available"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#005288]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[8px]" />
                      </div>
                      <span className="text-[11px] text-gray-600 leading-relaxed font-light">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RZB Certifications Bar */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 text-[9px] uppercase tracking-wider font-mono text-gray-500">
                  <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">CE</span>
                  <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">IP54</span>
                  <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">IK08</span>
                  <span className="border border-[#005288]/20 text-[#005288] bg-[#005288]/5 px-2 py-0.5">HCL Ready</span>
                </div>
                <a
                  href="#variants"
                  className="bg-[#005288] hover:bg-[#003c64] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-all duration-300 shadow-sm"
                >
                  Configure {family.products?.length || 0} Models &darr;
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION: Technical Configurator (RZB Toledo Configurator Spreadsheet) */}
      <section id="variants" className="container mx-auto px-6 md:px-12 max-w-7xl mt-16">
        <div className="bg-white border border-gray-200 p-6 md:p-8 relative shadow-sm">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl uppercase tracking-widest text-gray-900 font-light">TECHNICAL CONFIGURATIONS</h2>
              <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Configure specific technical article variants of the {family.name} series.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-800 text-xs pl-8 pr-4 py-2.5 focus:outline-none focus:border-[#005288] focus:ring-1 focus:ring-[#005288] transition-all placeholder:text-gray-400 font-mono shadow-inner"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 text-gray-400 text-xs" />
              </div>

              {/* Power Filter */}
              {filtersData.powers.length > 0 && (
                <select
                  value={powerFilter}
                  onChange={(e) => setPowerFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All Power (W)</option>
                  {filtersData.powers.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}

              {/* Color Temp Filter */}
              {filtersData.colorTemps.length > 0 && (
                <select
                  value={colorTempFilter}
                  onChange={(e) => setColorTempFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All CCT (K)</option>
                  {filtersData.colorTemps.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* RZB-style SpreadSheet Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FontAwesomeIcon icon={faSlidersH} className="text-gray-300 text-3xl mb-3" />
              <p className="text-xs uppercase tracking-widest font-mono">No models matching the filters found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 pl-4">Article Code</th>
                    <th className="py-4">Model Description</th>
                    <th className="py-4">Optical Visual</th>
                    <th className="py-4">Luminaire Finish</th>
                    <th className="py-4 text-center">Power</th>
                    <th className="py-4 text-center">Luminous Flux</th>
                    <th className="py-4 text-center">CCT (K)</th>
                    <th className="py-4 text-center">CRI</th>
                    <th className="py-4 text-center">Efficacy</th>
                    <th className="py-4 text-center">IP</th>
                    <th className="py-4 text-center">Control Gear</th>
                    <th className="py-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-gray-700">
                  {filteredProducts.map((prod) => {
                    const mmCode = getProductSpec(prod, ['yk_product_code', 'model_identifier', 'customer_model_no_old'], prod.name);
                    const color = getProductSpec(prod, ['colour', 'color', 'Colour', 'Color']);
                    const power = getProductSpec(prod, ['power', 'System power', 'wattage']);
                    const flux = getProductSpec(prod, ['luminousFlux', 'Luminous flux', 'flux', 'lumens']);
                    const cct = getProductSpec(prod, ['colourTemperature', 'Color Temperature', 'CCT']);
                    const cri = getProductSpec(prod, ['cri', 'CRI', 'Colour rendering index']);
                    const ip = getProductSpec(prod, ['ipRating', 'IP rating', 'IP Rating']);
                    const control = getProductSpec(prod, ['controlGear', 'control_gear', 'Control gear']);
                    
                    const numFlux = parseInt(flux);
                    const numPower = parseFloat(power);
                    const efficacy = (!isNaN(numFlux) && !isNaN(numPower) && numPower > 0) 
                      ? `${Math.round(numFlux / numPower)} lm/W`
                      : '—';

                    return (
                      <tr 
                        key={prod.id} 
                        onClick={() => handleOpenProduct(prod)}
                        className="text-[11px] hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-all duration-150 border-b border-gray-100"
                      >
                        <td className="py-4 pl-4 font-bold text-[#005288]">{mmCode}</td>
                        <td className="py-4 font-sans font-medium text-gray-900">{prod.name}</td>
                        <td className="py-4">
                          <div className="relative w-8 h-8 bg-white border border-gray-200 rounded-none overflow-hidden flex items-center justify-center p-1 shadow-sm">
                            {prod.images && prod.images.url ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${prod.images.url}`}
                                alt={prod.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            ) : (
                              <FontAwesomeIcon icon={faLightbulb} className="text-gray-300 text-xs" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-gray-500">{color}</td>
                        <td className="py-4 text-center font-bold text-gray-900">{power}</td>
                        <td className="py-4 text-center">{flux}</td>
                        <td className="py-4 text-center">{cct}</td>
                        <td className="py-4 text-center">{cri}</td>
                        <td className="py-4 text-center text-[#005288] font-bold">{efficacy}</td>
                        <td className="py-4 text-center font-bold">{ip}</td>
                        <td className="py-4 text-center text-gray-500 font-sans">{control}</td>
                        <td className="py-4 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenProduct(prod)}
                            className="bg-white hover:bg-[#005288] hover:text-white border border-gray-300 hover:border-transparent text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-none transition-all cursor-pointer font-sans shadow-sm"
                          >
                            Specs Drawer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* RZB-Style Technical Drawer Overlay Container (Fully Accessible and Clickable Fix) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Dark Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out cursor-pointer"
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Right sliding detail panel drawer (Light Re-Themed) */}
          <div className="relative h-full w-full max-w-2xl bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-drawer-slide z-10 text-gray-800">
            
            {activeDrawerProduct && (
              <>
                {/* Drawer Content Scroll Wrapper */}
                <div className="flex-grow flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
                  
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent">
                    <div>
                      <span className="text-[9px] font-bold font-mono uppercase tracking-[0.25em] text-[#005288]">
                        RZB-STYLE TECHNICAL DATASHEET
                      </span>
                      <h3 className="text-xl uppercase tracking-widest font-light text-gray-900 mt-1.5 font-sans">
                        ARTICLE: {activeDrawerProduct.name}
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  </div>

                  {/* Technical Drawer Tabs Bar (RZB Style Light Re-Themed) */}
                  <div className="flex border-b border-gray-200 bg-gray-50 px-8 text-xs font-bold uppercase tracking-widest font-sans">
                    <button 
                      onClick={() => setActiveModalTab('overview')}
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeModalTab === 'overview' 
                          ? 'border-[#005288] text-[#005288]' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                      Overview
                    </button>
                    <button 
                      onClick={() => setActiveModalTab('technical')}
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeModalTab === 'technical' 
                          ? 'border-[#005288] text-[#005288]' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={faCogs} />
                      Technical Data
                    </button>
                    <button 
                      onClick={() => setActiveModalTab('photometrics')}
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeModalTab === 'photometrics' 
                          ? 'border-[#005288] text-[#005288]' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                      Photometrics & BIM
                    </button>
                  </div>

                  {/* Tab Contents Area */}
                  <div className="p-8 flex-grow">
                    
                    {/* TAB 1: OVERVIEW */}
                    {activeModalTab === 'overview' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          <div className="md:col-span-5 flex flex-col space-y-4">
                            <div className="relative aspect-square w-full bg-gray-50 border border-gray-200 rounded-none overflow-hidden flex items-center justify-center p-4 shadow-sm">
                              {activeDrawerProduct.images && activeDrawerProduct.images.url ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${activeDrawerProduct.images.url}`}
                                  alt={activeDrawerProduct.name}
                                  fill
                                  className="object-contain p-2"
                                />
                              ) : (
                                <FontAwesomeIcon icon={faLightbulb} className="text-gray-300 text-4xl" />
                              )}
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-3.5 text-center font-mono shadow-inner">
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">ARTICLE NO</span>
                              <span className="text-xs font-bold text-[#005288] block mt-1">
                                {getProductSpec(activeDrawerProduct, ['yk_product_code', 'model_identifier', 'customer_model_no_old'], activeDrawerProduct.name)}
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-7 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                              Optical Innovation Engine
                            </h4>
                            <p className="text-xs text-gray-600 font-light leading-relaxed">
                              {activeDrawerProduct.description || "The Toledo-Triona system represents circular rimless optical perfection. Delivers elegant, homogenous distribution across premium corporate environments."}
                            </p>

                            <div className="grid grid-cols-1 gap-2 pt-2">
                              <div className="flex items-center gap-2 text-xs text-gray-600 font-light">
                                <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[10px]" />
                                <span>SIDELITE® Lateral optical reflection system</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 font-light">
                                <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[10px]" />
                                <span>Circadian Human Centric lighting support</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 font-light">
                                <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[10px]" />
                                <span>Dimmable via architectural DALI systems</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PDF download promo */}
                        <div className="border border-gray-200 p-5 bg-gray-50 flex items-center justify-between gap-4 mt-6 shadow-sm">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faFileAlt} className="text-[#005288] text-xl" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-700 tracking-widest">PRODUCT DATASHEET DOCUMENTATION</p>
                              <p className="text-[9px] text-gray-400 font-light">Complete compliance parameter certifications</p>
                            </div>
                          </div>
                          {activeDrawerProduct.datasheetPdf ? (
                            <button 
                              onClick={() => handleDownloadFile(activeDrawerProduct.datasheetPdf, '')}
                              className="text-[10px] uppercase font-mono text-white font-bold bg-[#005288] hover:bg-[#003c64] px-4 py-2 transition-all cursor-pointer shadow-sm"
                            >
                              DOWNLOAD PDF
                            </button>
                          ) : (
                            <button 
                              onClick={() => window.print()}
                              className="text-[10px] uppercase font-mono text-white font-bold bg-[#005288] hover:bg-[#003c64] px-4 py-2 transition-all cursor-pointer shadow-sm"
                            >
                              PRINT SPEC
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 2: TECHNICAL DATA (Detailed parameters) */}
                    {activeModalTab === 'technical' && (
                      <div className="space-y-6 animate-fade-in font-mono text-[11px] text-gray-700">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                          Mechanical & Photometric Schema
                        </h4>
                        
                        <div className="border border-gray-250 overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-gray-150 bg-white">
                              {[
                                { label: 'Article Code', value: getProductSpec(activeDrawerProduct, ['yk_product_code', 'model_identifier'], activeDrawerProduct.name) },
                                { label: 'System Power Input', value: `${getProductSpec(activeDrawerProduct, ['power', 'System power'])} W` },
                                { label: 'Luminous Flux Output', value: `${getProductSpec(activeDrawerProduct, ['luminousFlux', 'Luminous flux'])} lm` },
                                { label: 'Color Temperature (CCT)', value: `${getProductSpec(activeDrawerProduct, ['colourTemperature', 'Color Temperature'])} K` },
                                { label: 'Color Rendering (CRI)', value: `Ra ≥ ${getProductSpec(activeDrawerProduct, ['cri', 'CRI'])}` },
                                { label: 'Ingress Protection class', value: `IP ${getProductSpec(activeDrawerProduct, ['ipRating', 'IP rating'], '54')}` },
                                { label: 'Luminaire Casing Finish', value: getProductSpec(activeDrawerProduct, ['colour', 'color']) },
                                { label: 'Impact Resistance class', value: 'IK 08' },
                                { label: 'Protection Insulation Class', value: 'Protection Class I' },
                                { label: 'Driver Control Gear type', value: getProductSpec(activeDrawerProduct, ['controlGear', 'Control gear'], 'DALI-2 / Matter relay') }
                              ].map((row, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                  <td className="py-2.5 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                  <td className="py-2.5 px-4 text-gray-900 font-medium">{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Display Extra CMS parsed details */}
                        {activeDrawerProduct.specifications && Object.keys(activeDrawerProduct.specifications).length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                              Extended compliance data
                            </h4>
                            <div className="border border-gray-250 overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                              <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-gray-150 bg-white">
                                  {Object.entries(activeDrawerProduct.specifications).map(([key, value], idx) => {
                                    const standardKeys = ['power', 'wattage', 'flux', 'luminousFlux', 'CCT', 'colourTemperature', 'Color Temperature', 'CRI', 'cri', 'ipRating', 'IP rating', 'colour', 'color', 'controlGear', 'Control gear'];
                                    if (standardKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) return null;
                                    
                                    return (
                                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                        <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{key.replace(/_/g, ' ')}</td>
                                        <td className="py-2 px-4 text-gray-900 font-medium">{String(value)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: PHOTOMETRICS & BIM (Vector light curves & CADs) */}
                    {activeModalTab === 'photometrics' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                          
                          {/* Left: Custom SVG Lighting Curve representation */}
                          <div className="md:col-span-5 flex flex-col items-center border border-gray-200 p-4 bg-gray-50 shadow-sm">
                            <p className="text-[9px] uppercase font-mono text-gray-400 tracking-widest mb-3">Luminous Distribution curve</p>
                            <svg viewBox="0 0 120 120" className="w-28 h-28 text-[#005288]">
                              {/* Grid circles */}
                              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                              <circle cx="60" cy="60" r="35" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                              <circle cx="60" cy="60" r="20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                              {/* Axis lines */}
                              <line x1="60" y1="5" x2="60" y2="115" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                              <line x1="5" y1="60" x2="115" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                              {/* Light intensity curve representation */}
                              <path 
                                d="M60 60 Q45 80 40 90 T25 95 T45 85 Q60 60 75 85 T95 95 T80 90 Z" 
                                fill="rgba(0, 82, 136, 0.08)" 
                                stroke="#005288" 
                                strokeWidth="1"
                              />
                              {/* Directional ticks */}
                              <text x="60" y="12" fill="rgba(0,0,0,0.3)" fontSize="6" textAnchor="middle">180°</text>
                              <text x="60" y="112" fill="rgba(0,0,0,0.3)" fontSize="6" textAnchor="middle">0°</text>
                            </svg>
                            <span className="text-[8px] font-mono text-gray-400 mt-3">Direct/Indirect symmetric beam</span>
                          </div>

                          {/* Right: Technical Downloads List */}
                          <div className="md:col-span-7 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                              CAD, BIM & Architectural Databases
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              <button 
                                onClick={() => handleDownloadFile(activeDrawerProduct.photometryLdt, 'Dialux LDT File is available on request. Please contact Megaman support.')}
                                className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                              >
                                <span>DIALUX PHOTOMETRIC [LDT]</span>
                                <FontAwesomeIcon icon={faDownload} />
                              </button>
                              <button 
                                onClick={() => handleDownloadFile(activeDrawerProduct.photometryIes, 'IES lighting calculations are available on request. Please contact Megaman support.')}
                                className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                              >
                                <span>IES DATA SHEET CALCULATIONS [IES]</span>
                                <FontAwesomeIcon icon={faDownload} />
                              </button>
                              <button 
                                onClick={() => handleDownloadFile(activeDrawerProduct.bimRevit, 'BIM Revit Object is available on request. Please contact Megaman support.')}
                                className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                              >
                                <span>BIM OBJECT DATABASE [REVIT]</span>
                                <FontAwesomeIcon icon={faGlobe} />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                </div>

                {/* Persistent Footer Action Buttons inside Drawer (Light Re-Themed) */}
                <div className="h-20 border-t border-gray-200 px-8 bg-gray-50 flex items-center justify-between gap-4 relative z-20 shadow-[0_-4px_12px_-5px_rgba(0,0,0,0.05)]">
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Compliance data L80/B10 verified
                  </span>
                  
                  <div className="flex gap-3">
                    {activeDrawerProduct.datasheetPdf ? (
                      <button 
                        onClick={() => handleDownloadFile(activeDrawerProduct.datasheetPdf, '')}
                        className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-gray-500" />
                        DOWNLOAD DATASHEET
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.print()}
                        className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-gray-500" />
                        PRINT DATASHEET
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (activeDrawerProduct.photometryLdt) {
                          handleDownloadFile(activeDrawerProduct.photometryLdt, '');
                        } else if (activeDrawerProduct.datasheetPdf) {
                          handleDownloadFile(activeDrawerProduct.datasheetPdf, '');
                        } else {
                          alert('Technical planning databases are available on request. Please contact Megaman support.');
                        }
                      }}
                      className="bg-[#005288] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none hover:bg-[#003c64] transition-all cursor-pointer font-sans shadow-sm"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      DOWNLOAD CAD FILES
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
