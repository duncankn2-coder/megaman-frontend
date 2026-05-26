"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDownload, 
  faFilePdf, 
  faLightbulb, 
  faCheck, 
  faTimes, 
  faInfoCircle,
  faSlidersH,
  faSearch,
  faEye,
  faCogs,
  faRulerCombined,
  faFileContract
} from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string; // Model Number
  description?: string;
  categories: { id: string; name: string }[];
  images?: { url: string; alt?: string; filename?: string };
  colour?: string;
  power?: string;
  colourTemperature?: string;
  specifications?: any;
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
  
  const specs = product.specifications;
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
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'technical' | 'dimensions' | 'downloads'>('overview');

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveModalTab('overview');
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
    <div className="bg-[#fafafa] min-h-screen pb-24">
      {/* Dynamic Breadcrumbs */}
      <nav className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-[#005288] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#005288] transition-colors">Products</Link>
            <span>/</span>
            <span className="text-[#005288]">{family.name}</span>
          </div>
        </div>
      </nav>

      {/* Hero Product Showcase (RZB Style Dual-Column Layout) */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Interactive Product Gallery */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="relative aspect-video w-full bg-slate-50 border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                {activeMedia ? (
                  activeMedia.type === 'image' ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${activeMedia.url}`}
                      alt={activeMedia.alt || family.name}
                      fill
                      className="object-contain p-8"
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
                    <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400 mt-2 font-medium">MEGAMAN® Visual Assets</span>
                  </div>
                )}
              </div>

              {/* Thumbnails grid */}
              {mediaList.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {mediaList.map((media, idx) => (
                    <button
                      key={media.id}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative aspect-video bg-gray-50 border rounded-lg overflow-hidden flex items-center justify-center p-2 focus:outline-none transition-all ${
                        activeMediaIndex === idx
                          ? 'border-[#005288] ring-2 ring-[#005288]/10'
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
                        <div className="flex flex-col items-center justify-center text-[#005288]">
                          <span className="text-[8px] font-bold uppercase tracking-tighter">VIDEO</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Key Series Information */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#005288] mb-3 block">
                  ARCHITECTURAL DOWNLIGHT
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {family.name} Series
                </h1>
                
                {/* Highlights description */}
                {family.description ? (
                  <p className="text-gray-500 font-light text-base leading-relaxed mb-8">
                    {family.description}
                  </p>
                ) : (
                  <p className="text-gray-400 font-light text-base italic mb-8">
                    An elegant product series featuring tool-free mounting, sleek profile design, and low glare emissions, perfectly customized for clean architectural ceilings.
                  </p>
                )}

                {/* Bullets grid (RZB Toledo Features style) */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 pb-2 border-b border-gray-100">
                  Key Technical Characteristics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Excellent light uniformity through high-performance PMMA diffuser",
                    "Ultra-thin recessed height, ideal for tight ceiling cutouts",
                    "Pre-wired plug & play connection for rapid installation",
                    "Spring clip system for immediate, tool-free mounting",
                    "High color consistency and long lifetime operation",
                    "Available in multiple lumen packages and color temperatures"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#005288]/5 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[9px]" />
                      </div>
                      <span className="text-xs text-gray-600 leading-relaxed font-light">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action and specs anchor */}
              <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {family.products?.length || 0} configurations
                </span>
                <a
                  href="#variants"
                  className="bg-[#005288] hover:bg-[#003c64] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-colors shadow-sm"
                >
                  Configure Models
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Technical Configurator Section (RZB-style Toledo Variant Grid) */}
      <section id="variants" className="container mx-auto px-6 max-w-7xl mt-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Technical Model Variants</h2>
              <p className="text-xs text-gray-400 mt-1">Select from the available model listings in this family.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search variants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs pl-8 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#005288] focus:bg-white transition-all shadow-sm"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
              </div>

              {/* Power Filter */}
              {filtersData.powers.length > 0 && (
                <select
                  value={powerFilter}
                  onChange={(e) => setPowerFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#005288] transition-all cursor-pointer"
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
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#005288] transition-all cursor-pointer"
                >
                  <option value="All">All CCT (K)</option>
                  {filtersData.colorTemps.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Variants Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FontAwesomeIcon icon={faSlidersH} className="text-gray-300 text-3xl mb-3" />
              <p className="text-sm">No models found matching the select filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-4">MM Code</th>
                    <th className="pb-3">Model Number</th>
                    <th className="pb-3">Visual</th>
                    <th className="pb-3">Colour</th>
                    <th className="pb-3 text-center">Power</th>
                    <th className="pb-3 text-center">Luminous Flux</th>
                    <th className="pb-3 text-center">CCT (K)</th>
                    <th className="pb-3 text-center">CRI</th>
                    <th className="pb-3 text-center">IP Rating</th>
                    <th className="pb-3 text-center">Dimming</th>
                    <th className="pb-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((prod) => {
                    const mmCode = getProductSpec(prod, ['yk_product_code', 'model_identifier', 'customer_model_no_old'], prod.name);
                    const color = getProductSpec(prod, ['colour', 'color', 'Colour', 'Color']);
                    const power = getProductSpec(prod, ['power', 'System power', 'wattage']);
                    const flux = getProductSpec(prod, ['luminousFlux', 'Luminous flux', 'flux', 'lumens']);
                    const cct = getProductSpec(prod, ['colourTemperature', 'Color Temperature', 'CCT']);
                    const cri = getProductSpec(prod, ['cri', 'CRI', 'Colour rendering index']);
                    const ip = getProductSpec(prod, ['ipRating', 'IP rating', 'IP Rating']);
                    const control = getProductSpec(prod, ['controlGear', 'control_gear', 'Control gear']);
                    
                    return (
                      <tr 
                        key={prod.id} 
                        onClick={() => handleOpenProduct(prod)}
                        className="text-xs text-gray-700 hover:bg-[#005288]/5 cursor-pointer transition-all border-b border-gray-50/50"
                      >
                        <td className="py-4 pl-4 font-mono font-semibold text-gray-800 text-[11px]">{mmCode}</td>
                        <td className="py-4 font-bold text-gray-900">{prod.name}</td>
                        <td className="py-4">
                          <div className="relative w-10 h-10 bg-slate-50 border border-gray-100 rounded-md overflow-hidden flex items-center justify-center p-1">
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
                        <td className="py-4">{color}</td>
                        <td className="py-4 text-center font-medium">{power}</td>
                        <td className="py-4 text-center">{flux}</td>
                        <td className="py-4 text-center">{cct}</td>
                        <td className="py-4 text-center">{cri}</td>
                        <td className="py-4 text-center">{ip}</td>
                        <td className="py-4 text-center text-gray-500">{control}</td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProduct(prod);
                            }}
                            className="bg-gray-50 hover:bg-[#005288] hover:text-white border border-gray-200 hover:border-transparent text-gray-600 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-md transition-all cursor-pointer"
                          >
                            View Specs
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

      {/* Elegant Technical Spec Sheet Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#005288]/5 to-transparent">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#005288]">MEGAMAN® PRODUCT DATASHEET</span>
                <h3 className="text-lg font-bold text-gray-900">Technical Datasheet: {selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer focus:outline-none"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Modal Visual Area */}
                <div className="md:col-span-4 flex flex-col space-y-4">
                  <div className="relative aspect-square w-full bg-slate-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-4">
                    {selectedProduct.images && selectedProduct.images.url ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}${selectedProduct.images.url}`}
                        alt={selectedProduct.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faLightbulb} className="text-gray-300 text-3xl" />
                    )}
                  </div>
                  
                  {/* Category tag */}
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">SERIES</span>
                    <span className="text-xs font-semibold text-gray-700 block mt-0.5">{family.name}</span>
                  </div>
                </div>

                {/* Modal Table Area */}
                <div className="md:col-span-8 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-1.5 border-b border-gray-100">
                    Product Parameters
                  </h4>
                  
                  <div className="overflow-hidden border border-gray-100 rounded-lg shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-gray-50">
                        {[
                          { label: 'Model Number', value: selectedProduct.name },
                          { label: 'Power Rating (W)', value: getProductSpec(selectedProduct, ['power', 'System power']) },
                          { label: 'Luminous Flux (lm)', value: getProductSpec(selectedProduct, ['luminousFlux', 'Luminous flux']) },
                          { label: 'Colour Temperature (K)', value: getProductSpec(selectedProduct, ['colourTemperature', 'Color Temperature']) },
                          { label: 'Colour Rendering Index (CRI)', value: getProductSpec(selectedProduct, ['cri', 'CRI', 'Colour rendering index']) },
                          { label: 'IP Rating', value: getProductSpec(selectedProduct, ['ipRating', 'IP rating']) },
                          { label: 'Luminaire Colour', value: getProductSpec(selectedProduct, ['colour', 'color']) },
                          { label: 'Control Gear', value: getProductSpec(selectedProduct, ['controlGear', 'Control gear']) }
                        ].map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="py-2.5 px-4 font-semibold text-gray-500 w-1/2">{row.label}</td>
                            <td className="py-2.5 px-4 text-gray-800 font-medium">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Extra specifications JSON loop */}
                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-1.5 border-b border-gray-100">
                        Deep Specifications
                      </h4>
                      <div className="overflow-hidden border border-gray-100 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <tbody className="divide-y divide-gray-50">
                            {Object.entries(selectedProduct.specifications).map(([key, value], idx) => {
                              // Skip rendering standard keys already shown above
                              const standardKeys = ['power', 'wattage', 'flux', 'luminousFlux', 'CCT', 'colourTemperature', 'Color Temperature', 'CRI', 'cri', 'ipRating', 'IP rating', 'colour', 'color', 'controlGear', 'Control gear'];
                              if (standardKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) return null;
                              
                              return (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                  <td className="py-2 px-4 font-semibold text-gray-500 w-1/2">{key.replace(/_/g, ' ')}</td>
                                  <td className="py-2 px-4 text-gray-800 font-medium">{String(value)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer (Action Panel) */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                <FontAwesomeIcon icon={faInfoCircle} />
                Datasheet generated dynamically.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                  Print spec
                </button>
                <button
                  onClick={() => alert('Dialux LDT / IES technical planning file has been prepared for download.')}
                  className="bg-[#005288] hover:bg-[#003c64] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download LDT
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
