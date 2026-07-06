"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from 'react';
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
  faChartLine,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faProjectDiagram
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
  techDocControlGear?: MediaFile | null;
  techDocContainingProduct?: MediaFile | null;
  techDocLightSource?: MediaFile | null;
}

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  filename?: string;
  type: 'image' | 'video';
}

interface SymbolItem {
  id: string;
  name: string;
  icon?: { url: string; alt?: string; filename?: string } | null;
  isHighlighted?: boolean;
}

interface Block {
  blockType: string;
  id?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image?: any;
  linkText?: string;
  linkUrl?: string;
  layout?: 'grid' | 'split-left' | 'split-right';
  products?: any[];
  projects?: any[];
}

interface Family {
  id: string;
  name: string;
  description?: string;
  media: MediaItem[];
  products: Product[];
  features?: { id?: string; feature: string }[];
  symbols?: SymbolItem[];
  layout?: Block[];
}

interface FamilyDetailClientProps {
  family: Family;
}

// Helper to safely resolve media and image URLs (supporting Vercel Blob CDN)
const getImageUrl = (image: any): string => {
  if (!image) return '/placeholder.png';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  const resolveAbsoluteUrl = (url: string): string => {
    if (url.startsWith('http') || url.startsWith('//')) {
      const isLocalhostUrl = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
      const isBaseUrlLocalhost = baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000');
      if (isLocalhostUrl && !isBaseUrlLocalhost) {
        return url
          .replace(/^https?:\/\/localhost:3000/, baseUrl)
          .replace(/^https?:\/\/127.0.0.1:3000/, baseUrl);
      }
      return url;
    }
    return '';
  };

  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('//')) {
      const resolved = resolveAbsoluteUrl(image);
      return resolved || image;
    }
    if (image.startsWith('/')) {
      return image;
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image}`;
  }

  if (image.url) {
    if (image.url.startsWith('http') || image.url.startsWith('//')) {
      return resolveAbsoluteUrl(image.url);
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.url.startsWith('/') ? image.url : `/${image.url}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }
  if (image.filename) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image.filename}`;
  }
  return '/placeholder.png';
};

const getMediaUrl = (media: any): string => {
  if (!media) return '';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  const resolveAbsoluteUrl = (url: string): string => {
    if (url.startsWith('http') || url.startsWith('//')) {
      const isLocalhostUrl = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
      const isBaseUrlLocalhost = baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000');
      if (isLocalhostUrl && !isBaseUrlLocalhost) {
        return url
          .replace(/^https?:\/\/localhost:3000/, baseUrl)
          .replace(/^https?:\/\/127.0.0.1:3000/, baseUrl);
      }
      return url;
    }
    return '';
  };

  if (typeof media === 'string') {
    if (media.startsWith('http') || media.startsWith('//')) {
      return resolveAbsoluteUrl(media);
    }
    if (media.startsWith('/')) {
      return media;
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${media}`;
  }

  if (media.url) {
    if (media.url.startsWith('http') || media.url.startsWith('//')) {
      return resolveAbsoluteUrl(media.url);
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = media.url.startsWith('/') ? media.url : `/${media.url}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }
  if (media.filename) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${media.filename}`;
  }
  return '';
};

// Helper to expand lookups with database schema keys dynamically
const expandSpecNames = (specNames: string[]): string[] => {
  const expanded = [...specNames];
  for (const name of specNames) {
    const lower = name.toLowerCase();
    if (lower.includes('flux') || lower.includes('lumen')) {
      expanded.push(
        'useful_luminous_flux_lm',
        'total_luminous_flux_lm',
        'light_source_useful_luminous_flux_lm',
        'useful_luminous_flux',
        'total_luminous_flux',
        'light_source_useful_luminous_flux'
      );
    }
    if (lower.includes('cct') || lower.includes('temp')) {
      expanded.push('cct_k');
    }
    if (lower.includes('colour') || lower.includes('color')) {
      expanded.push('fitting_colour');
    }
    if (lower.includes('power') || lower.includes('watt') || lower.includes('system power')) {
      expanded.push('on_mode_power_w');
    }
    if (lower.includes('ip')) {
      expanded.push('ip');
    }
    if (lower.includes('cri') || lower.includes('ra') || lower.includes('rendering')) {
      expanded.push('ra', 'colour_rendering_index', 'color_rendering_index');
    }
    if (lower.includes('gear') || lower.includes('control') || lower.includes('connector')) {
      expanded.push('type_terminal block', 'cap_type', 'driver_type', 'driver_model');
    }
  }
  return Array.from(new Set(expanded));
};

// Extraction utility for technical parameters inside product specifications JSON (RZB Style)
const getProductSpec = (product: Product, specNames: string[], defaultValue = '—'): string => {
  const expandedNames = expandSpecNames(specNames);
  
  if (!product.specifications) {
    if (expandedNames.some(name => name.includes('power')) && product.power) return product.power;
    if (expandedNames.some(name => name.includes('colourTemperature')) && product.colourTemperature) return product.colourTemperature;
    if (expandedNames.some(name => name.includes('colour')) && product.colour) return product.colour;
    return defaultValue;
  }

  const specs = product.specifications as Record<string, unknown>;
  for (const name of expandedNames) {
    if (specs[name] !== undefined && specs[name] !== null) {
      return String(specs[name]);
    }
  }

  return defaultValue;
};

const parseDescriptionSpecs = (desc: string): Record<string, string> => {
  const specs: Record<string, string> = {};
  if (!desc) return specs;
  const parts = desc.split('/').map(p => p.trim());
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, val] = part.split(':').map(x => x.trim());
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'housing material') specs['housing_material'] = val;
      else if (lowerKey === 'cover material') specs['diffuser_material'] = val;
      else if (lowerKey === 'color' || lowerKey === 'colour') specs['fitting_colour'] = val;
      else if (lowerKey === 'dimming type') {
        specs['dimming_type'] = val;
        specs['control_gear'] = val;
        specs['connector'] = val;
      }
      else if (lowerKey === 'recessed cut out') specs['recessed_cut_out'] = val;
      else if (lowerKey === 'shape') specs['shape'] = val;
    } else {
      const lowerPart = part.toLowerCase();
      if (/^ac\d+~\d+/i.test(part) || /^ac\d+-\d+/i.test(part)) {
        const v = part.replace(/^ac/i, '').replace('~', '-');
        specs['rated_voltage_v'] = `${v} VAC`;
        specs['voltage'] = `${v} VAC`;
        specs['frequency_hz'] = '50/60 Hz';
        specs['frequency'] = '50/60 Hz';
      }
      else if (/^ip\d+/i.test(part)) {
        specs['ip'] = part;
        specs['ipRating'] = part;
      }
      else if (/^cl\s+[i|v|x]+/i.test(part)) {
        specs['protection_class'] = part;
      }
      else if (lowerPart.includes('hrs') || lowerPart.includes('lifetime') || lowerPart.includes('life')) {
        specs['norminal_life_h'] = part;
        specs['nominal_life_h'] = part;
      }
      else if (/^\d+°/.test(part)) {
        specs['beam_angle'] = part;
      }
    }
  }
  return specs;
};

const getSkuSpec = (sku: any, specNames: string[], defaultValue = ''): string => {
  if (!sku) return defaultValue;
  
  const expandedNames = expandSpecNames(specNames);

  if (sku.isFallbackProduct || !sku.product) {
    const descSpecs = parseDescriptionSpecs(sku.description || '');
    const productVal = getProductSpec(sku, expandedNames, defaultValue);
    if (productVal && productVal !== '—') return productVal;
    
    for (const name of expandedNames) {
      if (descSpecs[name] !== undefined) return descSpecs[name];
    }
    return defaultValue;
  }
  
  const parent = typeof sku.product === 'object' ? sku.product : null;
  const descSpecs = parseDescriptionSpecs(parent?.description || sku.description || '');
  
  for (const name of expandedNames) {
    // 1. Try SKU specifications JSON first (holds imported General Data spreadsheet values)
    if (sku.specifications && sku.specifications[name] !== undefined && sku.specifications[name] !== null) {
      return String(sku.specifications[name]);
    }
    
    // 2. Try Parent specifications JSON
    if (parent?.specifications && parent.specifications[name] !== undefined && parent.specifications[name] !== null) {
      return String(parent.specifications[name]);
    }

    // 3. Try parsed description specifications (from parent or SKU description string)
    if (descSpecs[name] !== undefined) {
      return descSpecs[name];
    }

    // 4. Fallback to direct attributes
    if (name === 'yk_product_code' || name === 'model_identifier' || name === 'customer_model_no_old' || name === 'mm_code') {
      if (sku.name) return sku.name;
    }
    if ((name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') && sku.colour) return sku.colour;
    if ((name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') && sku.wattage) return sku.wattage;
    if ((name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k') && sku.colourTemperature) return sku.colourTemperature;
    if ((name === 'ipRating' || name === 'IP rating' || name === 'IP Rating' || name === 'ip') && sku.ip) return sku.ip;
    if ((name === 'controlGear' || name === 'control_gear' || name === 'Control gear' || name === 'type_terminal block' || name === 'cap_type') && sku.connector) return sku.connector;
    
    if (parent) {
      if ((name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') && (parent.power || parent.wattage)) return parent.power || parent.wattage;
      if ((name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k') && (parent.colourTemperature || parent.colorTemperature)) return parent.colourTemperature || parent.colorTemperature;
      if ((name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') && (parent.colour || parent.color)) return parent.colour || parent.color;
      if (name === 'customer_model_no_new' && parent.name) return parent.name;
    }
  }
  return defaultValue;
};

export default function FamilyDetailClient({ family }: FamilyDetailClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [powerFilter, setPowerFilter] = useState('All');
  const [colorTempFilter, setColorTempFilter] = useState('All');
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'technical' | 'photometrics'>('overview');
  const [skus, setSkus] = useState<any[]>([]);
  const [isLoadingSkus, setIsLoadingSkus] = useState(true);

  useEffect(() => {
    async function fetchSkus() {
      if (!family.products || family.products.length === 0) {
        setIsLoadingSkus(false);
        return;
      }
      try {
        const productIds = family.products.map(p => typeof p === 'string' ? p : p.id);
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        const queryParams = productIds.map((id, idx) => `where[product][in][${idx}]=${id}`).join('&');
        const response = await fetch(`${payloadUrl}/api/skus?${queryParams}&limit=1000&depth=2`);
        if (response.ok) {
          const data = await response.json();
          setSkus(data.docs || []);
        }
      } catch (err) {
        console.error('Error fetching SKUs in FamilyDetailClient:', err);
      } finally {
        setIsLoadingSkus(false);
      }
    }
    fetchSkus();
  }, [family.products]);

  const highlightScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollHighlight = (direction: 'left' | 'right') => {
    if (highlightScrollRef.current) {
      const scrollAmount = 380;
      highlightScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Local state to keep product content during slide-out animation (400ms)
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<any | null>(null);

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
      let fullUrl = fileObj.url;
      if (fileObj.url.startsWith('http') || fileObj.url.startsWith('//')) {
        const isLocalhostUrl = fileObj.url.includes('localhost:3000') || fileObj.url.includes('127.0.0.1:3000');
        const isBaseUrlLocalhost = payloadUrl.includes('localhost:3000') || payloadUrl.includes('127.0.0.1:3000');
        if (isLocalhostUrl && !isBaseUrlLocalhost) {
          fullUrl = fileObj.url
            .replace(/^https?:\/\/localhost:3000/, payloadUrl)
            .replace(/^https?:\/\/127.0.0.1:3000/, payloadUrl);
        }
      } else {
        const cleanBaseUrl = payloadUrl.endsWith('/') ? payloadUrl.slice(0, -1) : payloadUrl;
        const cleanPath = fileObj.url.startsWith('/') ? fileObj.url : `/${fileObj.url}`;
        fullUrl = `${cleanBaseUrl}${cleanPath}`;
      }
      const filename = fileObj.filename || fileObj.url.split('/').pop() || 'download';
      
      // Fetch the file as a blob to force direct download without opening in a new tab
      fetch(fullUrl)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch file');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
          console.warn('Direct blob download failed, falling back to direct URL target_blank', err);
          const link = document.createElement('a');
          link.href = fullUrl;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    } else {
      alert(defaultMsg || 'No file is available for this product.');
    }
  };

  const mediaList = useMemo(() => family.media || [], [family.media]);
  const activeMedia = mediaList[activeMediaIndex];

  // Dynamically extract unique filtering parameters from products/SKUs
  const filtersData = useMemo(() => {
    const powers = new Set<string>();
    const colorTemps = new Set<string>();
    
    const productIdsWithSkus = new Set(
      skus.map(s => {
        const prodId = typeof s.product === 'object' ? s.product?.id : s.product;
        return String(prodId);
      })
    );

    const productsWithoutSkus = (family.products || []).filter(p => !productIdsWithSkus.has(String(p.id)));
    const fallbackSkus = productsWithoutSkus.map(p => ({
      id: p.id,
      name: '—',
      colour: p.colour || getProductSpec(p, ['colour', 'color', 'Colour', 'Color']),
      wattage: p.power || getProductSpec(p, ['power', 'System power', 'wattage']),
      colourTemperature: p.colourTemperature || getProductSpec(p, ['colourTemperature', 'Color Temperature', 'CCT']),
      isFallbackProduct: true,
      product: p,
      modelNumber: p.name,
    }));

    const combinedSkus = [...skus, ...fallbackSkus];

    combinedSkus.forEach(item => {
      const pwr = item.wattage || getSkuSpec(item, ['power', 'System power', 'wattage']);
      const ct = item.colourTemperature || getSkuSpec(item, ['colourTemperature', 'Color Temperature', 'CCT']);
      if (pwr && pwr !== '—') powers.add(pwr);
      if (ct && ct !== '—') colorTemps.add(ct);
    });

    return {
      powers: Array.from(powers),
      colorTemps: Array.from(colorTemps)
    };
  }, [family.products, skus]);

  // Handle SKU filtering & searching
  const filteredSkus = useMemo(() => {
    const productIdsWithSkus = new Set(
      skus.map(s => {
        const prodId = typeof s.product === 'object' ? s.product?.id : s.product;
        return String(prodId);
      })
    );

    const productsWithoutSkus = (family.products || []).filter(p => !productIdsWithSkus.has(String(p.id)));
    const fallbackSkus = productsWithoutSkus.map(p => ({
      id: p.id,
      name: '—',
      colour: p.colour || getProductSpec(p, ['colour', 'color', 'Colour', 'Color']),
      wattage: p.power || getProductSpec(p, ['power', 'System power', 'wattage']),
      colourTemperature: p.colourTemperature || getProductSpec(p, ['colourTemperature', 'Color Temperature', 'CCT']),
      ip: getProductSpec(p, ['ipRating', 'IP rating', 'IP Rating']),
      connector: getProductSpec(p, ['controlGear', 'control_gear', 'Control gear']),
      isFallbackProduct: true,
      product: p,
      modelNumber: p.name,
    }));

    const combinedSkus = [...skus, ...fallbackSkus];

    return combinedSkus.filter(sku => {
      const pwr = sku.wattage || getSkuSpec(sku, ['power', 'System power', 'wattage']);
      const ct = sku.colourTemperature || getSkuSpec(sku, ['colourTemperature', 'Color Temperature', 'CCT']);
      
      const matchesPower = powerFilter === 'All' || pwr === powerFilter || pwr.replace(/[^\d]/g, '') === powerFilter.replace(/[^\d]/g, '');
      const matchesColorTemp = colorTempFilter === 'All' || ct === colorTempFilter || ct.replace(/[^\d]/g, '') === colorTempFilter.replace(/[^\d]/g, '');
      
      const parentName = typeof sku.product === 'object' ? sku.product?.name : '';
      const matchesSearch = searchQuery === '' || 
        (sku.name && sku.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sku.modelNumber && sku.modelNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (parentName && parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesPower && matchesColorTemp && matchesSearch;
    });
  }, [family.products, skus, powerFilter, colorTempFilter, searchQuery]);

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
                      src={getImageUrl(activeMedia)}
                      alt={activeMedia.alt || family.name}
                      fill
                      className="object-contain p-12 transition-transform duration-700 hover:scale-102"
                      priority
                      unoptimized
                    />
                  ) : (
                    <video controls className="w-full h-full object-contain">
                      <source 
                        src={getMediaUrl(activeMedia)} 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <FontAwesomeIcon icon={faLightbulb} className="text-5xl text-gray-300 mb-3" />
                    <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">MEGAMAN® VISUAL GALLERY</span>
                  </div>
                )}


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
                          : 'border-gray-250 hover:border-gray-400'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={getImageUrl(media)}
                          alt={media.alt || ''}
                          fill
                          className="object-contain p-1"
                          unoptimized
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
                
                <h1 className="text-4xl lg:text-5xl font-light uppercase tracking-widest text-gray-900 leading-none mb-6">
                  {family.name}
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
                  Key Features
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {((family.features && family.features.length > 0)
                    ? family.features.map(f => f.feature)
                    : [
                        "Excellent light uniformity through high-performance PMMA diffuser",
                        "Circadian biology support with optional Tunable White (HCL) controls",
                        "Ultra-thin recessed height, ideal for tight ceiling cutouts",
                        "Pre-wired plug & play connection for rapid installation",
                        "Spring clip system for immediate, tool-free mounting",
                        "Ingress protection class IP54/IP65 options available"
                      ]
                  ).map((feat, idx) => (
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
                <div className="flex flex-wrap gap-3 items-center text-[9px] uppercase tracking-wider font-mono text-gray-500">
                  {family.symbols && family.symbols.length > 0 ? (
                    family.symbols.map((symbol) => {
                      if (symbol.icon) {
                        return (
                          <div key={symbol.id} className="relative h-6 w-12 bg-white flex items-center justify-center p-0.5 shadow-sm border border-gray-200" title={symbol.name}>
                            <Image
                              src={getImageUrl(symbol.icon)}
                              alt={symbol.name}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        );
                      }
                      return (
                        <span 
                          key={symbol.id} 
                          className={`border px-2 py-0.5 ${
                            symbol.isHighlighted 
                              ? 'border-[#005288]/20 text-[#005288] bg-[#005288]/5 font-bold' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          {symbol.name}
                        </span>
                      );
                    })
                  ) : (
                    <>
                      <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">CE</span>
                      <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">IP54</span>
                      <span className="border border-gray-200 bg-gray-50 px-2 py-0.5">IK08</span>
                      <span className="border border-[#005288]/20 text-[#005288] bg-[#005288]/5 px-2 py-0.5 font-bold">HCL Ready</span>
                    </>
                  )}
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

      {/* Dynamic CMS Layout Sections (Rendered above Technical Configurator) */}
      {family.layout && family.layout.map((block, blockIdx) => {
        switch (block.blockType) {
          case 'editorial': {
            const isSplitLeft = block.layout === 'split-left';
            const isSplitRight = block.layout === 'split-right';
            const imageUrl = getImageUrl(block.image);

            return (
              <section key={`editorial-${blockIdx}`} className="py-24 border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    
                    {/* Left Column (Image if split-left, otherwise text) */}
                    {isSplitLeft && block.image && (
                      <div className="lg:col-span-6 relative h-[450px] w-full border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
                        <Image 
                          src={imageUrl}
                          alt={block.title || "Editorial"}
                          fill
                          quality={95}
                          className="object-cover sharpen-media"
                        />
                      </div>
                    )}

                    <div className={block.image ? "lg:col-span-6 space-y-6" : "lg:col-span-12 space-y-6 max-w-3xl mx-auto text-center"}>
                      {block.subtitle && (
                        <div className={`flex items-center gap-3 ${!block.image ? "justify-center" : ""}`}>
                          <span className="h-[2px] w-10 bg-[#005288]"></span>
                          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                            {block.subtitle}
                          </p>
                        </div>
                      )}

                      <h2 className="text-3xl font-light uppercase tracking-widest leading-snug text-gray-900">
                        {block.title?.split(' ').map((w, idx) => (
                          <span key={idx} className={w.toLowerCase() === 'technology' || w.toLowerCase() === 'precision' ? "font-bold text-[#005288]" : ""}>
                            {w}{' '}
                          </span>
                        ))}
                      </h2>

                      {block.content && (
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                          {block.content}
                        </p>
                      )}

                      {block.linkUrl && block.linkText && (
                        <div className="pt-4">
                          <Link 
                            href={block.linkUrl}
                            className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                          >
                            <FontAwesomeIcon icon={faProjectDiagram} />
                            {block.linkText}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Right Column (Image if split-right) */}
                    {isSplitRight && block.image && (
                      <div className="lg:col-span-6 relative h-[450px] w-full border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
                        <Image 
                          src={imageUrl}
                          alt={block.title || "Editorial"}
                          fill
                          quality={95}
                          className="object-cover sharpen-media"
                        />
                      </div>
                    )}

                  </div>
                </div>
              </section>
            );
          }

          case 'inspiration': {
            const projects = block.projects || [];
            if (projects.length === 0) return null;

            return (
              <section key={`inspiration-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
                <div className="mb-16">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                    {block.subtitle || 'PROJECTS & REFERENCES'}
                  </span>
                  <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                    {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {projects.map((proj, idx) => {
                    const imageUrl = getImageUrl(proj.images);
                    
                    return (
                      <div key={proj.id || idx} className="flex flex-col gap-6 group">
                        <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                          <Image 
                            src={imageUrl} 
                            alt={proj.title}
                            fill
                            quality={95}
                            className="object-cover transition-transform duration-700 group-hover:scale-102 sharpen-media"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>

                        <div>
                          <div className="flex gap-4 items-center font-mono">
                            <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">PROJECT REFERENCE</span>
                            <span className="h-[1px] w-8 bg-gray-200"></span>
                            <span className="text-[9px] text-gray-400 tracking-wider uppercase">{proj.location || 'GLOBAL'}</span>
                          </div>
                          <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">{proj.title}</h3>
                          <p className="text-xs text-gray-500 font-light leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          case 'highlightProducts': {
            const products = block.products || [];
            if (products.length === 0) return null;
            
            return (
              <section key={`highlights-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200 bg-[#fafafa]/50">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                      {block.subtitle || 'PREMIUM SELECTIONS'}
                    </span>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                      {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                    </h2>
                  </div>
                  {/* Navigation Buttons for Horizontal Scroll */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => scrollHighlight('left')}
                      className="w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-[#005288] flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm"
                      aria-label="Scroll left"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                    <button 
                      onClick={() => scrollHighlight('right')}
                      className="w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-[#005288] flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm"
                      aria-label="Scroll right"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={highlightScrollRef}
                  className="flex overflow-x-auto gap-8 pb-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth no-scrollbar"
                >
                  {products.map((p, idx) => {
                    const imageItem = p.images;
                    const imageUrl = getImageUrl(imageItem);
                    const familyId = p.families?.id || p.families;

                    return (
                      <div 
                        key={p.id || idx}
                        className="bg-white border border-gray-200 rounded-none overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0 w-[290px] md:w-[340px] snap-start"
                      >
                        <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-8 border-b border-gray-100">
                          {imageItem ? (
                            <Image 
                              src={imageUrl}
                              alt={p.name}
                              fill
                              quality={95}
                              className="object-contain p-6 sharpen-media"
                              unoptimized
                            />
                          ) : (
                            <div className="text-gray-300 font-mono text-xs uppercase tracking-widest">MEGAMAN® Optic</div>
                          )}
                        </div>

                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-bold uppercase text-gray-900 tracking-wider mb-2">{p.name}</h3>
                            {p.description && (
                              <p className="text-xs text-gray-500 font-light line-clamp-3 mb-4 leading-relaxed">
                                {p.description}
                              </p>
                            )}
                          </div>

                          <div className="border-t border-gray-100 pt-4 mt-4 font-mono text-[10px] text-gray-400">
                            {p.specifications?.model_identifier && (
                              <div className="flex justify-between mb-1.5">
                                <span>MODEL IDENTIFIER</span>
                                <span className="text-gray-700 font-semibold">{p.specifications.model_identifier}</span>
                              </div>
                            )}
                            {p.power && (
                              <div className="flex justify-between mb-1.5">
                                <span>ON-MODE POWER</span>
                                <span className="text-gray-700 font-semibold">{p.power} W</span>
                              </div>
                            )}
                            {p.colour && (
                              <div className="flex justify-between">
                                <span>FITTING COLOR</span>
                                <span className="text-[#005288] font-semibold">{p.colour}</span>
                              </div>
                            )}

                            {familyId && (
                              <Link 
                                href={`/families/${familyId}`}
                                className="mt-6 w-full bg-gray-50 border border-gray-200 text-gray-700 hover:text-white hover:bg-[#005288] hover:border-[#005288] py-2.5 text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                              >
                                View Series Range &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}

      {/* SECTION: Technical Configurator (RZB Toledo Configurator Spreadsheet) */}
      <section id="variants" className="container mx-auto px-6 md:px-12 max-w-7xl mt-16">
        <div className="bg-white border border-gray-200 p-6 md:p-8 relative shadow-sm">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl uppercase tracking-widest text-gray-900 font-light">TECHNICAL CONFIGURATIONS</h2>
              <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Configure specific technical MM Code variants of the {family.name} series.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search MM codes..."
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
          {filteredSkus.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FontAwesomeIcon icon={faSlidersH} className="text-gray-300 text-3xl mb-3" />
              <p className="text-xs uppercase tracking-widest font-mono">No models matching the filters found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 pl-4">MM Code</th>
                    <th className="py-4">Model No.</th>
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
                  {filteredSkus.map((sku) => {
                    const parent = typeof sku.product === 'object' ? sku.product : null;
                    const mmCode = sku.name;
                    const modelNo = parent?.name || sku.modelNumber || '—';
                    
                    const color = sku.colour || getSkuSpec(sku, ['colour', 'color', 'Colour', 'Color'], '—');
                    const power = sku.wattage || getSkuSpec(sku, ['power', 'System power', 'wattage'], '—');
                    const flux = getSkuSpec(sku, ['luminousFlux', 'Luminous flux', 'flux', 'lumens'], '—');
                    const cct = sku.colourTemperature || getSkuSpec(sku, ['colourTemperature', 'Color Temperature', 'CCT'], '—');
                    const cri = getSkuSpec(sku, ['cri', 'CRI', 'Colour rendering index', 'ra'], '—');
                    const ip = sku.ip || getSkuSpec(sku, ['ipRating', 'IP rating', 'IP Rating', 'ip'], '—');
                    const control = sku.connector || getSkuSpec(sku, ['controlGear', 'control_gear', 'Control gear'], '—');
                    
                    const numFlux = parseInt(flux);
                    const numPower = parseFloat(power);
                    const efficacy = (!isNaN(numFlux) && !isNaN(numPower) && numPower > 0) 
                      ? `${Math.round(numFlux / numPower)} lm/W`
                      : '—';

                    const rowImage = sku.isFallbackProduct ? sku.images : (parent?.images || sku.images);

                    return (
                      <tr 
                        key={sku.id} 
                        onClick={() => handleOpenProduct(sku)}
                        className="text-[11px] hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-all duration-150 border-b border-gray-100"
                      >
                        <td className="py-4 pl-4 font-bold text-[#005288]">{mmCode}</td>
                        <td className="py-4 font-sans font-medium text-gray-900">{modelNo}</td>
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
                            onClick={() => handleOpenProduct(sku)}
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
                      <h3 className="text-xl uppercase tracking-widest font-light text-gray-900 mt-1.5 font-sans">
                        MM CODE: {activeDrawerProduct.name}
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
                        {(() => {
                          const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                          // Use the parent model No.'s image — SKUs (MM codes) don't carry their own images
                          const activeImage = parent?.images || activeDrawerProduct.images;
                          const mmCodeVal = activeDrawerProduct.isFallbackProduct ? getProductSpec(activeDrawerProduct, ['yk_product_code', 'model_identifier', 'customer_model_no_old'], activeDrawerProduct.name) : activeDrawerProduct.name;
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                              <div className="md:col-span-5 flex flex-col space-y-4">
                                <div className="relative aspect-square w-full bg-gray-50 border border-gray-200 rounded-none overflow-hidden flex items-center justify-center p-4 shadow-sm">
                                  {activeImage ? (
                                    <Image
                                      src={getImageUrl(activeImage)}
                                      alt={activeDrawerProduct.name}
                                      fill
                                      className="object-contain p-2"
                                      unoptimized
                                    />
                                  ) : (
                                    <FontAwesomeIcon icon={faLightbulb} className="text-gray-300 text-4xl" />
                                  )}
                                </div>
                                <div className="bg-gray-50 border border-gray-200 p-3.5 text-center font-mono shadow-inner">
                                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">MM CODE</span>
                                  <span className="text-xs font-bold text-[#005288] block mt-1">
                                    {mmCodeVal}
                                  </span>
                                </div>
                              </div>

                              <div className="md:col-span-7 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                                  Optical Innovation Engine
                                </h4>
                                <p className="text-xs text-gray-600 font-light leading-relaxed">
                                  {activeDrawerProduct.description || parent?.description || "The Toledo-Triona system represents circular rimless optical perfection. Delivers elegant, homogenous distribution across premium corporate environments."}
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
                          );
                        })()}

                      </div>
                    )}

                    {/* TAB 2: TECHNICAL DATA (Detailed parameters) */}
                    {activeModalTab === 'technical' && (
                      <div className="space-y-6 animate-fade-in font-mono text-[11px] text-gray-700">
                        
                        {/* Table 1: Electrical Data */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                            Electrical Data
                          </h4>
                          <div className="border border-gray-250 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <tbody className="divide-y divide-gray-150 bg-white">
                                {[
                                  { label: 'Voltage (V)', value: getSkuSpec(activeDrawerProduct, ['rated_voltage_v', 'light_source_rated_voltage_v', 'voltage', 'Input Voltage'], '—') },
                                  { label: 'Frequency (Hz)', value: getSkuSpec(activeDrawerProduct, ['frequency_hz', 'frequency', 'mains_frequency_hz'], '—') },
                                  { label: 'Current (mA)', value: getSkuSpec(activeDrawerProduct, ['input_current_ma', 'input_current', 'light_source_input_current_ma'], '—') },
                                  { label: 'Power Factor (λ)', value: getSkuSpec(activeDrawerProduct, ['power_factor', 'displacement_factor'], '—') },
                                  { label: 'Starting Time (sec)', value: getSkuSpec(activeDrawerProduct, ['starting_time_sec', 'starting_time', 'start_time'], '—') },
                                  { label: 'Warm-up Time Up to 60% of the Full Light Output (sec)', value: getSkuSpec(activeDrawerProduct, ['warm_up_time_sec', 'warm_up_time', 'warmup_time', 'warm_up_time_up_to_60_of_the_full_light_output_sec'], '—') }
                                ].map((row, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                    <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                    <td className="py-2 px-4 text-gray-900 font-medium">{row.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Table 2: Product Data */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                            Product Data
                          </h4>
                          <div className="border border-gray-250 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <tbody className="divide-y divide-gray-150 bg-white">
                                {[
                                  { label: 'Lamp Base', value: getSkuSpec(activeDrawerProduct, ['lampBase', 'lamp_base', 'cap_type', 'cap_base', 'base', 'lamp_holder_type'], '—') },
                                  { label: 'Product Wattage (W)', value: getSkuSpec(activeDrawerProduct, ['power', 'wattage', 'on_mode_power_w', 'light_source_on_mode_power_w'], '—') },
                                  { label: 'Equivalent Wattage (W)', value: getSkuSpec(activeDrawerProduct, ['equivalent_power_w', 'equivalent_power', 'equivalent_wattage'], '—') },
                                  { label: 'Colour Temperature (K)', value: getSkuSpec(activeDrawerProduct, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k'], '—') },
                                  { label: 'Colour Render Index (Ra)', value: getSkuSpec(activeDrawerProduct, ['cri', 'CRI', 'ra', 'colour_rendering_index', 'color_rendering_index'], '—') },
                                  { label: 'Colour Consistency (SDCM)', value: getSkuSpec(activeDrawerProduct, ['colour_consistency', 'color_consistency', 'sdcm'], '—') },
                                  { label: 'Dimmable', value: getSkuSpec(activeDrawerProduct, ['dimmable', 'light_source_dimmable'], '—') },
                                  { label: 'Operating Temperature', value: getSkuSpec(activeDrawerProduct, ['operating_temperature', 'temperature_of_ambient'], '—') },
                                  { label: 'Switching Cycles (times)', value: getSkuSpec(activeDrawerProduct, ['switching_cycles', 'switching_Cycles'], '—') },
                                  { label: 'Weight (g)', value: getSkuSpec(activeDrawerProduct, ['net_weight_g', 'net_weight', 'weight'], '—') },
                                  { label: 'Application', value: getSkuSpec(activeDrawerProduct, ['application', 'intended_use', 'zone'], '—') }
                                ].map((row, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                    <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                    <td className="py-2 px-4 text-gray-900 font-medium">{row.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Table 3: Performance Data */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                            Performance Data
                          </h4>
                          <div className="border border-gray-250 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <tbody className="divide-y divide-gray-150 bg-white">
                                {(() => {
                                  const totalFlux = getSkuSpec(activeDrawerProduct, ['total_luminous_flux_lm', 'total_luminous_flux', 'useful_luminous_flux_lm', 'useful_luminous_flux', 'flux', 'lumens', 'light_source_useful_luminous_flux_lm'], '—');
                                  const rawEfficacy = getSkuSpec(activeDrawerProduct, ['total_mains_efficacy_lmw', 'efficacy', 'luminous_efficacy'], '');
                                  const rawPower = getSkuSpec(activeDrawerProduct, ['power', 'wattage', 'on_mode_power_w'], '');
                                  
                                  let efficacyVal = rawEfficacy;
                                  if (!efficacyVal) {
                                    const numFlux = parseInt(totalFlux);
                                    const numPower = parseFloat(rawPower);
                                    if (!isNaN(numFlux) && !isNaN(numPower) && numPower > 0) {
                                      efficacyVal = `${Math.round(numFlux / numPower)} lm/W`;
                                    } else {
                                      efficacyVal = '—';
                                    }
                                  }

                                  return [
                                    { label: 'Total Luminous Flux (lm)', value: totalFlux },
                                    { label: 'Luminous Efficacy (lm/W)', value: efficacyVal },
                                    { label: 'Rated Life (hrs)', value: getSkuSpec(activeDrawerProduct, ['norminal_life_h', 'nominal_life_h', 'rated_life_h', 'rated_life'], '—') }
                                  ].map((row, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                      <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                      <td className="py-2 px-4 text-gray-900 font-medium">{row.value}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Table 4: Product Dimensions */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                            Product Dimensions
                          </h4>
                          <div className="border border-gray-250 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <tbody className="divide-y divide-gray-150 bg-white">
                                {[
                                  { label: 'Diameter (mm)', value: getSkuSpec(activeDrawerProduct, ['diameter_mm', 'diameter'], '—') },
                                  { label: 'Width (mm)', value: getSkuSpec(activeDrawerProduct, ['width_mm', 'width'], '—') },
                                  { label: 'Height (mm)', value: getSkuSpec(activeDrawerProduct, ['height_mm', 'height', 'depth_mm'], '—') }
                                ].map((row, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                    <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                    <td className="py-2 px-4 text-gray-900 font-medium">{row.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>


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
                            
                            {(() => {
                              const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                              const ldtFile = activeDrawerProduct.photometryLdt || parent?.photometryLdt;
                              const iesFile = activeDrawerProduct.photometryIes || parent?.photometryIes;
                              const bimFile = activeDrawerProduct.bimRevit || parent?.bimRevit;
                              
                              return (
                                <div className="grid grid-cols-1 gap-2 text-xs">
                                  <button 
                                    onClick={() => handleDownloadFile(ldtFile, 'Dialux LDT File is available on request. Please contact Megaman support.')}
                                    className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                  >
                                    <span>DIALUX PHOTOMETRIC [LDT]</span>
                                    <FontAwesomeIcon icon={faDownload} />
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadFile(iesFile, 'IES lighting calculations are available on request. Please contact Megaman support.')}
                                    className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                  >
                                    <span>IES DATA SHEET CALCULATIONS [IES]</span>
                                    <FontAwesomeIcon icon={faDownload} />
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadFile(bimFile, 'BIM Revit Object is available on request. Please contact Megaman support.')}
                                    className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                  >
                                    <span>BIM OBJECT DATABASE [REVIT]</span>
                                    <FontAwesomeIcon icon={faGlobe} />
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Compliance documents section */}
                            {(() => {
                              const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                              const docControlGear = activeDrawerProduct.techDocControlGear || parent?.techDocControlGear;
                              const docContainingProduct = activeDrawerProduct.techDocContainingProduct || parent?.techDocContainingProduct;
                              const docLightSource = activeDrawerProduct.techDocLightSource || parent?.techDocLightSource;
                              
                              if (!docControlGear && !docContainingProduct && !docLightSource) return null;
                              
                              return (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans mb-3">
                                    Technical Compliance & Ecodesign
                                  </h4>
                                  <div className="grid grid-cols-1 gap-2 text-xs">
                                    {docControlGear && (
                                      <button 
                                        onClick={() => handleDownloadFile(docControlGear, 'Control Gear document is available on request.')}
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - CONTROL GEAR</span>
                                        <FontAwesomeIcon icon={faDownload} />
                                      </button>
                                    )}
                                    {docContainingProduct && (
                                      <button 
                                        onClick={() => handleDownloadFile(docContainingProduct, 'Containing Product document is available on request.')}
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - CONTAINING PRODUCT</span>
                                        <FontAwesomeIcon icon={faDownload} />
                                      </button>
                                    )}
                                    {docLightSource && (
                                      <button 
                                        onClick={() => handleDownloadFile(docLightSource, 'Light Source document is available on request.')}
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - LIGHT SOURCE</span>
                                        <FontAwesomeIcon icon={faDownload} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
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
                    {(() => {
                      const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                      const parentId = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                        ? activeDrawerProduct.id
                        : (typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product.id : activeDrawerProduct.product);
                      const skuQuery = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                        ? ''
                        : `?sku=${activeDrawerProduct.name}`;
                      const pdfLink = `/products/${parentId}/datasheet${skuQuery}`;
                      const pdfFile = activeDrawerProduct.datasheetPdf || parent?.datasheetPdf;
                      const ldtFile = activeDrawerProduct.photometryLdt || parent?.photometryLdt;

                      return (
                        <>
                          {pdfFile ? (
                            <button 
                              onClick={() => handleDownloadFile(pdfFile, '')}
                              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none transition-all cursor-pointer font-sans shadow-sm"
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-gray-500" />
                              DOWNLOAD DATASHEET
                            </button>
                          ) : (
                            <Link 
                              href={pdfLink}
                              target="_blank"
                              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none transition-all cursor-pointer font-sans shadow-sm inline-flex items-center justify-center"
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-gray-500" />
                              DOWNLOAD DATASHEET
                            </Link>
                          )}
                          <button 
                            onClick={() => {
                              if (ldtFile) {
                                handleDownloadFile(ldtFile, '');
                              } else if (pdfFile) {
                                handleDownloadFile(pdfFile, '');
                              } else {
                                alert('Technical planning databases are available on request. Please contact Megaman support.');
                              }
                            }}
                            className="bg-[#005288] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-none hover:bg-[#003c64] transition-all cursor-pointer font-sans shadow-sm"
                          >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            DOWNLOAD CAD FILES
                          </button>
                        </>
                      );
                    })()}
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
