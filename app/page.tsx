"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faSearch,
  faFilePdf,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faLightbulb,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [productsCount, setProductsCount] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'indoor' | 'smart'>('all');

  // Carousel Hero States
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = 3;

  // Autoplay functionality: slide transitions every 6 seconds, pauses on mouse hover
  useEffect(() => {
    if (!isHovered) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
    }
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isHovered]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  // Fetch product counts dynamically on mount to showcase database integration
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
          const data = await response.json();
          setProductsCount(data.totalDocs || data.docs?.length || 0);
        }
      } catch (error) {
        console.error("Could not fetch API products count, using static metrics.", error);
      }
    }
    fetchProducts();
  }, []);

  // Curated list of high-end catalog sheets matching XAL/Megaman branding
  const catalogues = [
    {
      id: "indoor",
      title: "Indoor Luminaires 2026/27",
      version: "Vol. 4.2",
      pages: 348,
      size: "42.8 MB",
      released: "April 2026",
      coverUrl: "/hospitality_project_lobby.png",
      tag: "indoor"
    },
    {
      id: "lamps",
      title: "LED Lamps & Modules",
      version: "Vol. 7.1",
      pages: 184,
      size: "24.5 MB",
      released: "May 2026",
      coverUrl: "/retail_project_showroom.png",
      tag: "indoor"
    },
    {
      id: "smart",
      title: "INGENIUM® Smart IoT Matter",
      version: "Vol. 2.0",
      pages: 96,
      size: "12.2 MB",
      released: "March 2026",
      coverUrl: "/smart_lighting_matter.png",
      tag: "smart"
    }
  ];

  const filteredCatalogues = catalogues.filter(cat => {
    if (activeCatalogTab !== 'all' && cat.tag !== activeCatalogTab) return false;
    if (catalogSearch !== '' && !cat.title.toLowerCase().includes(catalogSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white text-gray-800 min-h-screen relative font-sans selection:bg-[#005288] selection:text-white overflow-x-hidden">
      
      {/* SECTION 1: XAL-Style Light-Themed Hero Carousel */}
      <section 
        className="relative bg-gray-50 border-b border-gray-200 min-h-[640px] md:h-[75vh] flex items-center overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fine crosshairs & grids */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
          <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-black"></div>
          <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-black"></div>
          <div className="absolute left-0 right-0 top-[50%] h-[1px] bg-black"></div>
        </div>

        {/* Dynamic Slidings Area */}
        <div className="container mx-auto max-w-7xl px-6 md:px-12 relative z-10 w-full">
          
          {/* SLIDE 0: CATALOGUES & DOWNLOADS */}
          <div className={`transition-all duration-700 ease-in-out grid grid-cols-1 lg:grid-cols-12 gap-16 items-center ${
            activeSlide === 0 ? 'opacity-100 translate-x-0 relative block' : 'opacity-0 translate-x-12 absolute hidden'
          }`}>
            {/* Left: Headline & Filter controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-[#005288]"></span>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                  TECHNICAL ARCHITECTURE
                </p>
              </div>

              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest leading-[1.1] text-gray-900">
                CATALOGUES &<br /><span className="font-bold text-[#005288]">DOWNLOADS</span>
              </h1>

              <p className="text-xs md:text-sm text-gray-500 font-light max-w-md leading-relaxed">
                Access our comprehensive library of professional lighting planners, complete with photometric LDT files, Dialux calculations, BIM databases, and PDF product catalogs.
              </p>

              {/* Dynamic Catalog Search */}
              <div className="relative max-w-md border border-gray-300 bg-white shadow-sm mt-8">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="SEARCH SPECIFICATIONS..."
                  className="w-full text-xs font-mono p-3.5 focus:outline-none focus:ring-1 focus:ring-[#005288] uppercase text-gray-800"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute right-4 top-4 text-gray-400 text-sm" />
              </div>

              {/* Quick Tab Switcher */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setActiveCatalogTab('all')}
                  className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-none cursor-pointer border transition-all ${
                    activeCatalogTab === 'all' 
                      ? 'border-[#005288] bg-[#005288] text-white shadow-sm' 
                      : 'border-gray-250 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-400'
                  }`}
                >
                  All Documentation
                </button>
                <button
                  onClick={() => setActiveCatalogTab('indoor')}
                  className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-none cursor-pointer border transition-all ${
                    activeCatalogTab === 'indoor' 
                      ? 'border-[#005288] bg-[#005288] text-white shadow-sm' 
                      : 'border-gray-250 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-400'
                  }`}
                >
                  Indoor Systems
                </button>
                <button
                  onClick={() => setActiveCatalogTab('smart')}
                  className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-none cursor-pointer border transition-all ${
                    activeCatalogTab === 'smart' 
                      ? 'border-[#005288] bg-[#005288] text-white shadow-sm' 
                      : 'border-gray-250 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-400'
                  }`}
                >
                  Smart & IoT
                </button>
              </div>
            </div>

            {/* Right: Stacked Catalog Covers Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCatalogues.length === 0 ? (
                <div className="col-span-full border border-gray-200 bg-white p-12 text-center text-gray-400 font-mono text-xs uppercase tracking-wider shadow-sm">
                  No matching catalogs found.
                </div>
              ) : (
                filteredCatalogues.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="bg-white border border-gray-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      {/* Technical brochure stack representation */}
                      <div className="relative aspect-[3/4] w-full bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center p-3 mb-4 shadow-sm group-hover:border-gray-300 transition-colors">
                        <Image 
                          src={cat.coverUrl} 
                          alt={cat.title} 
                          fill
                          className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>
                        
                        {/* Overlay spec label */}
                        <div className="absolute bottom-4 left-4 right-4 text-left">
                          <span className="text-[8px] font-mono font-bold text-[#e2c285] tracking-widest block">{cat.version}</span>
                          <span className="text-xs font-bold text-white tracking-wide block mt-0.5 line-clamp-2">{cat.title}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-gray-400 space-y-1 mt-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>PAGES</span>
                          <span className="font-bold text-gray-700">{cat.pages}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>RELEASED</span>
                          <span className="font-bold text-gray-700">{cat.released}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>FILE SIZE</span>
                          <span className="font-bold text-[#005288]">{cat.size}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Catalog ${cat.title} PDF download initiated.`)}
                      className="w-full mt-5 bg-[#005288] hover:bg-[#003c64] text-white py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                      DOWNLOAD PDF
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SLIDE 1: TOLEDO & TRIONA SYSTEM SHOWCASE */}
          <div className={`transition-all duration-700 ease-in-out grid grid-cols-1 lg:grid-cols-12 gap-16 items-center ${
            activeSlide === 1 ? 'opacity-100 translate-x-0 relative block' : 'opacity-0 translate-x-12 absolute hidden'
          }`}>
            {/* Left Column: Product System details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-[#005288]"></span>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                  ARCHITECTURAL COMPLIANCE
                </p>
              </div>

              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest leading-[1.1] text-gray-900">
                TRIONA SYSTEM<br /><span className="font-bold text-[#005288]">CIRCULAR ELEGANCE</span>
              </h1>

              <p className="text-xs md:text-sm text-gray-500 font-light max-w-md leading-relaxed">
                Replicating circular rimless perfection with lateral SIDELITE® light injection. Meticulously designed for low glare output, biological human-centric (HCL) rhythm tuning, and tool-free mounting connection.
              </p>

              {/* Specs checklist */}
              <div className="grid grid-cols-1 gap-2 pt-4">
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>High color rendering performance (CRI &ge; 95)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>Microprismatic office glare index (UGR &le; 19)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>Water protection ingress ratings IP54/IP65</span>
                </div>
              </div>

              <div className="pt-6">
                <a 
                  href="#categories-section" 
                  className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faLightbulb} />
                  EXPLORE ARCHITECTURAL RANGE
                </a>
              </div>
            </div>

            {/* Right Column: Visual render representation */}
            <div className="lg:col-span-7 relative h-[420px] w-full bg-white border border-gray-250 shadow-sm overflow-hidden flex items-center justify-center">
              <Image 
                src="/hero_architectural_light.png" 
                alt="Megaman Triona Sidelite System" 
                fill
                className="object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              
              {/* Technical floating spec overlay badge */}
              <div className="absolute bottom-6 right-6 bg-white border border-gray-200 p-4 font-mono text-[10px] text-gray-500 shadow-md">
                <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-2">SYSTEM PARAMETER METRICS</p>
                <div className="flex gap-6">
                  <div>CRI: <span className="font-bold text-gray-900">Ra 95+</span></div>
                  <div>GLARE: <span className="font-bold text-[#005288]">UGR &le; 19</span></div>
                  <div>PROTECTION: <span className="font-bold text-gray-900">IP54</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: INGENIUM MATTER SMART LIGHTING SHOWCASE */}
          <div className={`transition-all duration-700 ease-in-out grid grid-cols-1 lg:grid-cols-12 gap-16 items-center ${
            activeSlide === 2 ? 'opacity-100 translate-x-0 relative block' : 'opacity-0 translate-x-12 absolute hidden'
          }`}>
            {/* Left Column: Smart System details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-[#005288]"></span>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                  INTELLIGENT SMART NETWORKS
                </p>
              </div>

              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest leading-[1.1] text-gray-900">
                INGENIUM® MATTER<br /><span className="font-bold text-[#005288]">SMART HOME IOT</span>
              </h1>

              <p className="text-xs md:text-sm text-gray-500 font-light max-w-md leading-relaxed">
                Connect your architectural downlights into a single, unified smart mesh network. Matter mesh compatibility allows robust multi-admin local router integrations, auto-routing meshes, and dynamic dim-to-warm circadian parameters.
              </p>

              {/* Specs checklist */}
              <div className="grid grid-cols-1 gap-2 pt-4">
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>Standard Matter dynamic mesh connectivity</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>Dynamic color temperature (CCT 2200K - 6500K) controls</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 font-light">
                  <div className="w-5 h-5 rounded-full bg-[#005288]/10 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                  </div>
                  <span>Deep standby low energy consumption (&le;0.5W)</span>
                </div>
              </div>

              <div className="pt-6">
                <a 
                  href="#categories-section" 
                  className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faSlidersH} />
                  EXPLORE INGENIUM RANGE
                </a>
              </div>
            </div>

            {/* Right Column: Smart home ambient visual preview */}
            <div className="lg:col-span-7 relative h-[420px] w-full bg-white border border-gray-250 shadow-sm overflow-hidden flex items-center justify-center">
              <Image 
                src="/smart_lighting_matter.png" 
                alt="Megaman Smart Matter downlights system" 
                fill
                className="object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              
              {/* Technical control absolute overlay */}
              <div className="absolute bottom-6 right-6 bg-white border border-gray-200 p-4 font-mono text-[10px] text-gray-500 shadow-md">
                <p className="text-[8px] uppercase tracking-widest text-[#005288] font-bold mb-2">LIVE CONTROL STATUS</p>
                <div className="flex gap-6">
                  <div>BRIGHTNESS: <span className="font-bold text-gray-900">80%</span></div>
                  <div>CCT: <span className="font-bold text-[#005288]">3200K</span></div>
                  <div>MESH: <span className="font-bold text-green-600">CONNECTED</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Chevrons for Slides Navigation */}
        <button 
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-20"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>
        <button 
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-20"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>

        {/* Bottom Slide Indicators (Horizontal Dashed Bars, XAL Style) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {[...Array(totalSlides)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1 cursor-pointer transition-all duration-300 rounded-none focus:outline-none ${
                activeSlide === idx 
                  ? 'bg-[#005288] w-10' 
                  : 'bg-gray-300 w-6 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Visual 4-Column Product Categories Grid (XAL Style) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200" id="categories-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
              PORTFOLIO OVERVIEW
            </span>
            <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
              PRODUCT <span className="font-bold">CATEGORIES</span>
            </h2>
          </div>
          <Link 
            href="/products" 
            className="text-xs uppercase tracking-widest font-bold border-b border-gray-300 pb-1 hover:border-[#005288] hover:text-[#005288] transition-colors"
          >
            Browse Catalogues
          </Link>
        </div>

        {/* 4-Column visual grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Category 1: LED Lamps */}
          <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[#005288] font-mono text-3xl mb-6">01</div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">LED LAMPS</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Classic lightbulbs, custom linear tubes, warm decorative filaments, and energy-efficient reflector lamps replacing legacy halogens.
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                <span>TOTAL DESIGNS</span>
                <span className="font-bold text-[#005288]">150+ Lamps</span>
              </div>
              <Link 
                href="/products?category=Lamps"
                className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
              >
                Explore Lamps &rarr;
              </Link>
            </div>
          </div>

          {/* Category 2: Indoor Luminaires */}
          <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[#005288] font-mono text-3xl mb-6">02</div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">INDOOR SYSTEMS</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Deep recessed low-glare downlights (UGR &lt; 19), customizable track spotlights, panels, and continuous seamless linear profiles.
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                <span>TOTAL FIXTURES</span>
                <span className="font-bold text-[#005288]">80+ Downlights</span>
              </div>
              <Link 
                href="/products?category=Indoor%20Lighting"
                className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
              >
                Explore Indoor &rarr;
              </Link>
            </div>
          </div>

          {/* Category 3: Outdoor Systems */}
          <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[#005288] font-mono text-3xl mb-6">03</div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">OUTDOOR LIGHTING</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Heavy-duty floodlights, damp-proof utility battens, bulkheads, and architectural garden bollards designed for high weatherability.
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                <span>PROTECTION RATING</span>
                <span className="font-bold text-[#005288]">IP65 / IP66</span>
              </div>
              <Link 
                href="/products?category=Outdoor%20Lighting"
                className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
              >
                Explore Outdoor &rarr;
              </Link>
            </div>
          </div>

          {/* Category 4: Smart Controls & Modules */}
          <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[#005288] font-mono text-3xl mb-6">04</div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">SMART CONTROLS</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                INGENIUM® Matter mesh controllers, sensors, and professional TECOH® LED modules for in-fixture specifications.
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                <span>DATABASE STATUS</span>
                <span className="font-bold text-[#005288]">{productsCount || 24} Active Items</span>
              </div>
              <Link 
                href="/products?category=Light%20Management"
                className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
              >
                Explore Smart &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: Global Reference Projects Portfolio Grid (XAL Brochure Aesthetic) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
        <div className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
            PROJECTS & REFERENCES
          </span>
          <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
            CREATIVE <span className="font-bold">INSPIRATION</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Reference Case 1: Hospitality Lobby */}
          <div className="flex flex-col gap-6 group">
            <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
              <Image 
                src="/hospitality_project_lobby.png" 
                alt="Hospitality Lounge Project Showcase"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              {/* Technical Specifications Overlay on Project Image */}
              <div className="absolute left-6 bottom-6 right-6 flex justify-between items-end bg-white border border-gray-200 p-4 max-w-sm rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md">
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-gray-400 font-bold">LUMINAIRES HIGHLIGHT</p>
                  <h4 className="text-xs font-bold text-gray-900">SIENA Recessed Downlight</h4>
                  <p className="text-[9px] text-gray-500 font-light mt-1">CRI &gt; 92, CCT 3000K, UGR &lt; 19</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">LUX LEVEL</p>
                  <p className="text-xs font-bold text-[#005288]">350 lx avg.</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4 items-center font-mono">
                <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">HOSPITALITY</span>
                <span className="h-[1px] w-8 bg-gray-200"></span>
                <span className="text-[9px] text-gray-400 tracking-wider">ATHENS, GREECE</span>
              </div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">The Grand Plaza Lounge</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Utilizing low-glare deep recessed LED downlights to establish a welcoming, cozy environment with dynamic twilight dimming support. Reduces operational lighting energy by 68%.
              </p>
            </div>
          </div>

          {/* Reference Case 2: Retail Showroom */}
          <div className="flex flex-col gap-6 group">
            <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
              <Image 
                src="/retail_project_showroom.png" 
                alt="Luxury Retail Showroom Showcase"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              <div className="absolute left-6 bottom-6 right-6 flex justify-between items-end bg-white border border-gray-200 p-4 max-w-sm rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md">
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-gray-400 font-bold">LUMINAIRES HIGHLIGHT</p>
                  <h4 className="text-xs font-bold text-gray-900">FITO Track Spotlight</h4>
                  <p className="text-[9px] text-gray-500 font-light mt-1">CRI 97, CCT 4000K, Beam 24°</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">COLOR RENDERING</p>
                  <p className="text-xs font-bold text-[#005288]">Ra 97 (Perfect)</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-4 items-center font-mono">
                <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">RETAIL</span>
                <span className="h-[1px] w-8 bg-gray-200"></span>
                <span className="text-[9px] text-gray-400 tracking-wider">MILAN, ITALY</span>
              </div>
              <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">Quadrilatero Fashion Hub</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Implementing high-CRI 97 track spot luminaires. Meticulously engineered optics deliver striking high-contrast visual display while accurately rendering fine fabrics and textures.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: Corporate News & Announcements (Minimal 3-Column Press List) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
            PRESS & MEDIA
          </span>
          <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
            LATEST <span className="font-bold">NEWS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* News Item 1 */}
          <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                <span>MATTER SMART HOME</span>
                <span className="font-bold text-[#005288]">24 MAY 2026</span>
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                INGENIUM® Matter Smart Lighting Mesh Rolled Out Globally
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Megaman announces the international deployment of our new Matter-compliant smart LED nodes and control relays, bringing seamless mesh reliability and dynamic CCT circadian tuning.
              </p>
            </div>
            
            <button 
              onClick={() => alert('Matter Smart release press release download initiated.')}
              className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
            >
              <span>Read Press Release</span>
              <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* News Item 2 */}
          <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                <span>ECO SYSTEM</span>
                <span className="font-bold text-[#005288]">12 MAY 2026</span>
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                Carbon Neutral Target: 100% Recyclable Casings by 2027
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Aligning with international eco-efficiency goals, Megaman commits to transitioning all indoor structural downlights to pure recyclable copper-alloy heat sinks, cutting plastic waste.
              </p>
            </div>
            
            <button 
              onClick={() => alert('Eco Targets document downloaded.')}
              className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
            >
              <span>Read Environmental Report</span>
              <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* News Item 3 */}
          <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
            <div>
              <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                <span>NEW ARRIVALS</span>
                <span className="font-bold text-[#005288]">05 MAY 2026</span>
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                SIENA Ultra-Slim Series Achieves Complete IP65 Ingress Rating
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Our popular, super-slim profile recessed spots (ideal for tight ceiling spaces) have successfully passed testing to receive a complete IP65 dust and moisture certification.
              </p>
            </div>
            
            <button 
              onClick={() => alert('SIENA IP65 Datasheet opened.')}
              className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
            >
              <span>View Product Specifications</span>
              <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* Modern High-Density Minimalist Footer (Light Re-Themed) */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Megaman Corporate Info */}
          <div>
            <Image 
              src="/MEGAMAN_Logo.png" 
              alt="Megaman Logo" 
              width={140} 
              height={45} 
              className="h-10 w-auto object-contain mb-6 mix-blend-multiply"
            />
            <p className="text-[11px] text-gray-500 font-light leading-relaxed max-w-xs">
              Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">PRODUCTS</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light">
              <li><Link href="/products/lamps" className="hover:text-[#005288] transition-colors">LED Lamps & Classic Bulbs</Link></li>
              <li><Link href="/products/indoor-lighting" className="hover:text-[#005288] transition-colors">Architectural Downlights</Link></li>
              <li><Link href="/products/outdoor-lighting" className="hover:text-[#005288] transition-colors">Outdoor Battens & Floodlights</Link></li>
              <li><Link href="/products/light-management" className="hover:text-[#005288] transition-colors">INGENIUM Smart Matter</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">RESOURCES</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light">
              <li><Link href="/resources/downloads" className="hover:text-[#005288] transition-colors">Technical Download Center</Link></li>
              <li><Link href="/company/news-and-press" className="hover:text-[#005288] transition-colors">Latest News & Press</Link></li>
              <li><Link href="/company/quality" className="hover:text-[#005288] transition-colors">Quality Assurance Standards</Link></li>
              <li><Link href="/resources/videos" className="hover:text-[#005288] transition-colors">Tutorials & Case Videos</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">NEWSLETTER</h4>
            <p className="text-[11px] text-gray-500 font-light mb-4 leading-relaxed font-sans">
              Sign up for professional specifications updates, DIALux models release, and design releases.
            </p>
            <div className="flex border border-gray-300 bg-white shadow-sm">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="bg-transparent text-xs p-3 flex-1 focus:outline-none placeholder:text-gray-400 uppercase text-gray-700 font-mono"
              />
              <button 
                onClick={() => alert('Subscription successful!')}
                className="bg-[#005288] text-white text-xs px-4 uppercase font-bold hover:bg-[#003c64] transition-colors cursor-pointer"
              >
                JOIN
              </button>
            </div>
          </div>

        </div>

        {/* Copy / Legals row */}
        <div className="max-w-7xl mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-light gap-4">
          <p>&copy; {new Date().getFullYear()} MEGAMAN®. ALL RIGHTS RESERVED. POWERED BY ARCHITECTURAL STANDARDS.</p>
          <div className="flex gap-6 uppercase tracking-wider font-mono">
            <Link href="#" className="hover:text-[#005288] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#005288] transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-[#005288] transition-colors">Cookies Config</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}