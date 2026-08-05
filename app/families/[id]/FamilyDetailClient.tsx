"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollVideoBlock from './ScrollVideoBlock';
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
  faChevronLeft,
  faChevronRight,
  faProjectDiagram,
  faExternalLinkAlt
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
  lightSpectrumGraph?: MediaFile | null;
  photometricPolarDiagram?: MediaFile | null;
  beamAngleDiagram?: MediaFile | null;
  lineDrawing?: MediaFile | null;
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
  description?: string;
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
  selectedParameters?: string[];
  dismantleInstructionPdf?: MediaFile | null;
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

// Helper to clean up and deduplicate raw IP values (e.g. "IP65/IP65" -> "IP65")
const formatIpRating = (ipStr: string): string => {
  if (!ipStr || ipStr === '—' || ipStr === 'undefined' || ipStr === 'null') return '—';
  
  const clean = String(ipStr).trim();
  const parts = clean.split(/[\/,;]/).map(p => p.trim()).filter(Boolean);
  
  const normalizedParts = parts.map(p => {
    if (/^ip\d+/i.test(p)) {
      return p.toUpperCase();
    }
    return p;
  });

  const unique = Array.from(new Set(normalizedParts));
  if (unique.length === 1) {
    return unique[0];
  }
  
  return unique.join('/');
};

// Helper to expand lookups with database schema keys dynamically
const expandSpecNames = (specNames: string[]): string[] => {
  const expanded = [...specNames];
  for (const name of specNames) {
    const lower = name.toLowerCase();
    if (lower.includes('flux') || lower.includes('lumen')) {
      expanded.push(
        'total_luminous_flux_lm',
        'useful_luminous_flux_lm',
        'light_source_useful_luminous_flux_lm',
        'total_luminous_flux',
        'useful_luminous_flux',
        'light_source_useful_luminous_flux',
        'flux',
        'lumens'
      );
    }
    if (lower.includes('cct') || lower.includes('temp')) {
      expanded.push('cct_k', 'cct', 'colourtemperature', 'colortemperature', 'colour_temp', 'colortemp');
    }
    if (lower.includes('colour') || lower.includes('color')) {
      expanded.push('fitting_colour', 'colour', 'color', 'luminaires_color');
    }
    if (lower.includes('power') || lower.includes('watt') || lower.includes('system power')) {
      expanded.push('on_mode_power_w', 'wattage', 'power', 'on_mode_power', 'light_source_on_mode_power_w', 'energy_consumption_on_mode');
    }
    if (lower.includes('efficacy')) {
      expanded.push('total_mains_efficacy_lmw', 'luminous_efficacy', 'efficacy', 'total_efficacy_lmw', 'mains_efficacy');
    }
    if (lower.includes('ip')) {
      expanded.push('ip', 'ip_rating', 'iprating');
    }
    if (lower.includes('cri') || lower.includes('ra') || lower.includes('rendering')) {
      expanded.push('ra', 'cri', 'colour_rendering_index', 'color_rendering_index', 'cri_lower_80');
    }
    if (lower.includes('gear') || lower.includes('control') || lower.includes('connector')) {
      expanded.push('type_terminal block', 'cap_type', 'driver_type', 'driver_model', 'dimming_type', 'control_gear');
    }
  }
  return Array.from(new Set(expanded));
};

// Extraction utility for technical parameters inside product specifications JSON (RZB Style)
const getProductSpec = (productObj: any, specNames: string[], defaultValue = '—'): string => {
  if (!productObj) return defaultValue;

  const targetProduct = productObj.product && typeof productObj.product === 'object' ? productObj.product : productObj;
  const expandedNames = expandSpecNames(specNames);

  // 1. Try specifications JSON (on targetProduct or productObj)
  const specs = (targetProduct.specifications || productObj.specifications) as Record<string, unknown> | undefined;
  if (specs) {
    for (const name of expandedNames) {
      if (specs[name] !== undefined && specs[name] !== null) {
        const val = String(specs[name]).trim();
        if (val !== '' && val !== 'undefined' && val !== 'null') {
          return val;
        }
      }
    }
  }

  // 2. Try parsed description specifications
  const desc = targetProduct.description || productObj.description || '';
  if (desc) {
    const descSpecs = parseDescriptionSpecs(desc);
    for (const name of expandedNames) {
      if (descSpecs[name] !== undefined && String(descSpecs[name]).trim() !== '') {
        return descSpecs[name];
      }
    }
  }

  // 3. Try direct attributes
  for (const name of expandedNames) {
    if (name === 'yk_product_code' || name === 'model_identifier' || name === 'customer_model_no_old' || name === 'mm_code') {
      if (targetProduct.name && targetProduct.name !== '—') return targetProduct.name;
      if (productObj.name && productObj.name !== '—') return productObj.name;
      if (productObj.modelNumber) return productObj.modelNumber;
    }
    if ((name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') && (targetProduct.power || targetProduct.wattage || productObj.wattage || productObj.power)) {
      return targetProduct.power || targetProduct.wattage || productObj.wattage || productObj.power;
    }
    if ((name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k') && (targetProduct.colourTemperature || targetProduct.colorTemperature || productObj.colourTemperature)) {
      return targetProduct.colourTemperature || targetProduct.colorTemperature || productObj.colourTemperature;
    }
    if ((name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') && (targetProduct.colour || targetProduct.color || productObj.colour)) {
      return targetProduct.colour || targetProduct.color || productObj.colour;
    }
    if ((name === 'ipRating' || name === 'IP rating' || name === 'IP Rating' || name === 'ip') && (targetProduct.ip || productObj.ip)) {
      return targetProduct.ip || productObj.ip;
    }
    if ((name === 'controlGear' || name === 'control_gear' || name === 'Control gear' || name === 'type_terminal block' || name === 'cap_type') && (targetProduct.connector || productObj.connector)) {
      return targetProduct.connector || productObj.connector;
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
  
  const parent = sku.product && typeof sku.product === 'object' ? sku.product : null;
  const expandedNames = expandSpecNames(specNames);

  // 1. Try SKU specifications JSON first (holds SKU or General Data spreadsheet values)
  if (sku.specifications) {
    for (const name of expandedNames) {
      if (sku.specifications[name] !== undefined && sku.specifications[name] !== null) {
        const val = String(sku.specifications[name]).trim();
        if (val !== '' && val !== 'undefined' && val !== 'null') return val;
      }
    }
  }

  // 2. Try Parent Product specifications JSON (holds General Data spreadsheet values)
  if (parent?.specifications) {
    for (const name of expandedNames) {
      if (parent.specifications[name] !== undefined && parent.specifications[name] !== null) {
        const val = String(parent.specifications[name]).trim();
        if (val !== '' && val !== 'undefined' && val !== 'null') return val;
      }
    }
  }

  // 3. Try parsed description specifications (from parent or SKU description string)
  const descSpecs = parseDescriptionSpecs(parent?.description || sku.description || '');
  for (const name of expandedNames) {
    if (descSpecs[name] !== undefined && String(descSpecs[name]).trim() !== '') {
      return descSpecs[name];
    }
  }

  // 4. Fallback to direct attributes on SKU
  for (const name of expandedNames) {
    if (name === 'yk_product_code' || name === 'model_identifier' || name === 'customer_model_no_old' || name === 'mm_code') {
      if (sku.name && sku.name !== '—') return sku.name;
    }
    if ((name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') && sku.colour) return sku.colour;
    if ((name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') && sku.wattage) return sku.wattage;
    if ((name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k') && sku.colourTemperature) return sku.colourTemperature;
    if ((name === 'ipRating' || name === 'IP rating' || name === 'IP Rating' || name === 'ip') && sku.ip) return sku.ip;
    if ((name === 'controlGear' || name === 'control_gear' || name === 'Control gear' || name === 'type_terminal block' || name === 'cap_type') && sku.connector) return sku.connector;
    if ((name === 'voltage' || name === 'Voltage' || name === 'rated_voltage_v') && sku.voltage) return sku.voltage;
    if ((name === 'lampBase' || name === 'lamp base' || name === 'cap_type') && sku.lampBase) return sku.lampBase;
  }

  // 5. Fallback to direct attributes on Parent Product
  if (parent) {
    for (const name of expandedNames) {
      if ((name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') && (parent.power || parent.wattage)) return parent.power || parent.wattage;
      if ((name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k') && (parent.colourTemperature || parent.colorTemperature)) return parent.colourTemperature || parent.colorTemperature;
      if ((name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') && (parent.colour || parent.color)) return parent.colour || parent.color;
      if (name === 'customer_model_no_new' && parent.name) return parent.name;
    }
  }

  return defaultValue;
};

const parseCcts = (cctStr: string): string[] => {
  if (!cctStr || cctStr === '—') return [];
  
  const clean = cctStr.trim();
  
  // Check if it matches a sequence of 4-digit numbers like "300040006500"
  if (/^\d{8,16}$/.test(clean) && clean.length % 4 === 0) {
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4) + 'K');
    }
    return parts;
  }
  
  const splitParts = clean.split(/[\/,;+]/).map(p => p.trim()).filter(Boolean);
  return splitParts.map(p => {
    let part = p;
    if (/^\d+$/.test(part)) {
      part += 'K';
    } else if (/^\d+k$/i.test(part)) {
      part = part.toUpperCase();
    }
    return part;
  });
};

const parseFluxMap = (fluxStr: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!fluxStr || fluxStr === '—') return result;

  if (fluxStr.includes('@')) {
    const regex = /([0-9\/\s+]+)\s*@\s*([0-9a-zA-Z\/\+]+)/g;
    let match;
    while ((match = regex.exec(fluxStr)) !== null) {
      const fluxVal = match[1].trim();
      const cctCondition = match[2].trim();
      
      const ccts = parseCcts(cctCondition);
      for (const cct of ccts) {
        result[cct] = fluxVal;
      }
    }
  }
  return result;
};

const getFluxForCct = (fluxStr: string, targetCct: string, cctIndex: number, totalCcts: number): string => {
  if (!fluxStr || fluxStr === '—') return '—';
  
  const fluxMap = parseFluxMap(fluxStr);
  if (fluxMap[targetCct]) {
    return fluxMap[targetCct];
  }
  
  const fluxParts = fluxStr.split(/[\/+]/).map(s => s.trim()).filter(Boolean);
  if (fluxParts.length === totalCcts && cctIndex < fluxParts.length) {
    return fluxParts[cctIndex];
  }
  
  return fluxStr;
};

export default function FamilyDetailClient({ family }: FamilyDetailClientProps) {
  const activeParams = family.selectedParameters || [
    'mmCode',
    'modelNo',
    'colour',
    'wattage',
    'luminousFlux',
    'colourTemperature',
    'cri',
    'efficacy',
    'ip',
    'connector'
  ];

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [powerFilter, setPowerFilter] = useState('All');
  const [colorTempFilter, setColorTempFilter] = useState('All');
  const [finishFilter, setFinishFilter] = useState('All');
  const [ipFilter, setIpFilter] = useState('All');
  const [baseFilter, setBaseFilter] = useState('All');
  const [voltageFilter, setVoltageFilter] = useState('All');
  const [gearFilter, setGearFilter] = useState('All');
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'technical' | 'photometrics'>('overview');
  const [skus, setSkus] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSkus() {
      const validProducts = (family.products || []).filter(p => typeof p === 'object' && p !== null);
      if (validProducts.length === 0) {
        return;
      }
      try {
        const productIds = validProducts.map(p => p.id);
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        const queryParams = productIds.map((id, idx) => `where[product][in][${idx}]=${id}`).join('&');
        const response = await fetch(`${payloadUrl}/api/skus?${queryParams}&limit=1000&depth=2`);
        if (response.ok) {
          const data = await response.json();
          setSkus(data.docs || []);
        }
      } catch (err) {
        console.error('Error fetching SKUs in FamilyDetailClient:', err);
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
    const finishes = new Set<string>();
    const ips = new Set<string>();
    const bases = new Set<string>();
    const voltages = new Set<string>();
    const gears = new Set<string>();
    
    const productIdsWithSkus = new Set(
      skus.map(s => {
        const prodId = typeof s.product === 'object' ? s.product?.id : s.product;
        return String(prodId);
      })
    );

    const validProducts = (family.products || []).filter(p => typeof p === 'object' && p !== null);
    const productsWithoutSkus = validProducts.filter(p => !productIdsWithSkus.has(String(p.id)));
    const fallbackSkus = productsWithoutSkus.map(p => ({
      id: p.id,
      name: '—',
      colour: p.colour || getProductSpec(p, ['colour', 'color', 'Colour', 'Color', 'fitting_colour']),
      wattage: p.power || (p as any).wattage || getProductSpec(p, ['power', 'System power', 'wattage', 'on_mode_power_w']),
      colourTemperature: p.colourTemperature || (p as any).colorTemperature || getProductSpec(p, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']),
      isFallbackProduct: true,
      product: p,
      modelNumber: p.name,
      specifications: p.specifications,
      description: p.description,
    }));

    const combinedSkus = [...skus, ...fallbackSkus];

    combinedSkus.forEach(item => {
      const pwr = getSkuSpec(item, ['power', 'System power', 'wattage', 'on_mode_power_w']);
      const ct = getSkuSpec(item, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']);
      const col = getSkuSpec(item, ['colour', 'color', 'Colour', 'Color', 'fitting_colour']);
      const ipVal = formatIpRating(getSkuSpec(item, ['ipRating', 'IP rating', 'IP Rating', 'ip']));
      const baseVal = getSkuSpec(item, ['lampBase', 'lamp base', 'cap_type']);
      const voltVal = getSkuSpec(item, ['voltage', 'Voltage', 'rated_voltage_v']);
      const gearVal = getSkuSpec(item, ['controlGear', 'control_gear', 'Control gear', 'type_terminal block']);

      if (pwr && pwr !== '—') {
        const parts = pwr.split(/[\/+]/).map((p: string) => p.trim()).filter(Boolean);
        parts.forEach((p: string) => {
          let normalized = p;
          if (/^\d+(\.\d+)?$/.test(p)) {
            normalized = p + 'W';
          } else if (/^\d+(\.\d+)?\s*w$/i.test(p)) {
            normalized = p.toUpperCase().replace(/\s+/g, '');
          }
          powers.add(normalized);
        });
      }
      if (ct && ct !== '—') {
        const parts = parseCcts(ct);
        parts.forEach(c => colorTemps.add(c));
      }
      if (col && col !== '—') finishes.add(col);
      if (ipVal && ipVal !== '—') ips.add(ipVal);
      if (baseVal && baseVal !== '—') bases.add(baseVal);
      if (voltVal && voltVal !== '—') voltages.add(voltVal);
      if (gearVal && gearVal !== '—') gears.add(gearVal);
    });

    const sortNumeric = (arr: string[]) => {
      return arr.sort((a, b) => {
        const na = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
        const nb = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
        return na - nb;
      });
    };

    return {
      powers: sortNumeric(Array.from(powers)),
      colorTemps: sortNumeric(Array.from(colorTemps)),
      finishes: Array.from(finishes),
      ips: Array.from(ips),
      bases: Array.from(bases),
      voltages: Array.from(voltages),
      gears: Array.from(gears)
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

    const validProducts = (family.products || []).filter(p => typeof p === 'object' && p !== null);
    const productsWithoutSkus = validProducts.filter(p => !productIdsWithSkus.has(String(p.id)));
    const fallbackSkus = productsWithoutSkus.map(p => ({
      id: p.id,
      name: '—',
      colour: p.colour || getProductSpec(p, ['colour', 'color', 'Colour', 'Color', 'fitting_colour']),
      wattage: p.power || (p as any).wattage || getProductSpec(p, ['power', 'System power', 'wattage', 'on_mode_power_w']),
      colourTemperature: p.colourTemperature || (p as any).colorTemperature || getProductSpec(p, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']),
      ip: getProductSpec(p, ['ipRating', 'IP rating', 'IP Rating', 'ip']),
      connector: getProductSpec(p, ['controlGear', 'control_gear', 'Control gear', 'type_terminal block']),
      isFallbackProduct: true,
      product: p,
      modelNumber: p.name,
      specifications: p.specifications,
      description: p.description,
    }));

    const combinedSkus = [...skus, ...fallbackSkus];

    return combinedSkus.filter(sku => {
      const pwr = getSkuSpec(sku, ['power', 'System power', 'wattage', 'on_mode_power_w']);
      const ct = getSkuSpec(sku, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']);
      const col = getSkuSpec(sku, ['colour', 'color', 'Colour', 'Color', 'fitting_colour']);
      const ipVal = formatIpRating(getSkuSpec(sku, ['ipRating', 'IP rating', 'IP Rating', 'ip']));
      const baseVal = getSkuSpec(sku, ['lampBase', 'lamp base', 'cap_type']);
      const voltVal = getSkuSpec(sku, ['voltage', 'Voltage', 'rated_voltage_v']);
      const gearVal = getSkuSpec(sku, ['controlGear', 'control_gear', 'Control gear', 'type_terminal block']);
      
      const matchesPower = powerFilter === 'All' || pwr === powerFilter || (() => {
        const powerParts = pwr.split(/[\/+]/).map((p: string) => p.trim()).filter(Boolean);
        return powerParts.some((part: string) => {
          const partNum = part.replace(/[^\d.]/g, '');
          const filterNum = powerFilter.replace(/[^\d.]/g, '');
          return partNum === filterNum;
        });
      })();

      const matchesColorTemp = colorTempFilter === 'All' || ct === colorTempFilter || (() => {
        const cctParts = parseCcts(ct);
        return cctParts.some((part: string) => {
          const partNum = part.replace(/[^\d]/g, '');
          const filterNum = colorTempFilter.replace(/[^\d]/g, '');
          return partNum === filterNum;
        });
      })();
      const matchesFinish = finishFilter === 'All' || col === finishFilter;
      const matchesIp = ipFilter === 'All' || ipVal === ipFilter;
      const matchesBase = baseFilter === 'All' || baseVal === baseFilter;
      const matchesVoltage = voltageFilter === 'All' || voltVal === voltageFilter;
      const matchesGear = gearFilter === 'All' || gearVal === gearFilter;
      
      const parentName = typeof sku.product === 'object' ? sku.product?.name : '';
      const matchesSearch = searchQuery === '' || 
        (sku.name && sku.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sku.modelNumber && sku.modelNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (parentName && parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesPower && matchesColorTemp && matchesFinish && matchesIp && matchesBase && matchesVoltage && matchesGear && matchesSearch;
    });
  }, [family.products, skus, powerFilter, colorTempFilter, finishFilter, ipFilter, baseFilter, voltageFilter, gearFilter, searchQuery]);

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
          <div className="flex items-center space-x-3 text-sm font-bold uppercase tracking-wider text-gray-500">
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
                    <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">MEGAMAN<sup>®</sup> VISUAL GALLERY</span>
                  </div>
                )}


              </div>

              {/* Optional Image Description Slot */}
              {activeMedia?.description && (
                <div className="bg-white border-l-2 border-[#005288] border-y border-r border-gray-200 p-4 shadow-sm transition-all duration-300">
                  <p className="text-xs md:text-sm text-gray-600 font-light leading-relaxed">
                    {activeMedia.description}
                  </p>
                </div>
              )}

              {/* Thumbnails grid with fine borders */}
              {mediaList.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {mediaList.map((media, idx) => (
                    <button
                      key={media.id}
                      onClick={() => setActiveMediaIndex(idx)}
                      title={media.description || media.alt || ''}
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
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed mb-8">
                    {family.description}
                  </p>
                ) : (
                  <p className="text-gray-400 font-light text-sm md:text-base italic leading-relaxed mb-8">
                    An elegant product series featuring tool-free mounting, sleek profile design, and low glare emissions, perfectly customized for clean architectural ceilings.
                  </p>
                )}

                {/* Technical Characteristics Grid (RZB Toledo Features style) */}
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-150">
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
                      <span className="text-sm text-gray-600 leading-relaxed font-light">{feat}</span>
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
      {(family.layout && family.layout.length > 0 ? family.layout : []).map((block, blockIdx) => {
        switch (block.blockType) {
          case 'scrollVideo': {
            return <ScrollVideoBlock key={`scroll-video-${blockIdx}`} block={block} />;
          }

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
                    const imageUrl = getImageUrl(proj.listImage || proj.bannerImage || proj.images);
                    
                    return (
                      <div key={proj.id || idx} className="flex flex-col gap-6 group">
                        <Link href={`/projects/${proj.slug}`} className="block">
                          <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 cursor-pointer">
                            <Image 
                              src={imageUrl} 
                              alt={proj.title}
                              fill
                              quality={95}
                              className="object-cover transition-transform duration-700 group-hover:scale-102 sharpen-media"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          </div>
                        </Link>

                        <div>
                          <div className="flex gap-4 items-center font-mono">
                            <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">PROJECT REFERENCE</span>
                            <span className="h-[1px] w-8 bg-gray-200"></span>
                            <span className="text-[9px] text-gray-400 tracking-wider uppercase">{proj.location || 'GLOBAL'}</span>
                          </div>
                          <Link href={`/projects/${proj.slug}`}>
                            <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3 hover:text-[#005288] transition-colors cursor-pointer">{proj.title}</h3>
                          </Link>
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
                            <div className="text-gray-300 font-mono text-xs uppercase tracking-widest">MEGAMAN<sup>®</sup> Optic</div>
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
              {activeParams.includes('wattage') && filtersData.powers.length > 0 && (
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
              {activeParams.includes('colourTemperature') && filtersData.colorTemps.length > 0 && (
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

              {/* Finish Filter */}
              {activeParams.includes('colour') && filtersData.finishes.length > 0 && (
                <select
                  value={finishFilter}
                  onChange={(e) => setFinishFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All Finishes</option>
                  {filtersData.finishes.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              )}

              {/* IP Rating Filter */}
              {activeParams.includes('ip') && filtersData.ips.length > 0 && (
                <select
                  value={ipFilter}
                  onChange={(e) => setIpFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All IP Ratings</option>
                  {filtersData.ips.map(ipVal => (
                    <option key={ipVal} value={ipVal}>{ipVal}</option>
                  ))}
                </select>
              )}

              {/* Cap / Base Filter */}
              {activeParams.includes('lampBase') && filtersData.bases.length > 0 && (
                <select
                  value={baseFilter}
                  onChange={(e) => setBaseFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All Bases</option>
                  {filtersData.bases.map(baseVal => (
                    <option key={baseVal} value={baseVal}>{baseVal}</option>
                  ))}
                </select>
              )}

              {/* Voltage Filter */}
              {activeParams.includes('voltage') && filtersData.voltages.length > 0 && (
                <select
                  value={voltageFilter}
                  onChange={(e) => setVoltageFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All Voltages</option>
                  {filtersData.voltages.map(voltVal => (
                    <option key={voltVal} value={voltVal}>{voltVal}</option>
                  ))}
                </select>
              )}

              {/* Control Gear Filter */}
              {activeParams.includes('connector') && filtersData.gears.length > 0 && (
                <select
                  value={gearFilter}
                  onChange={(e) => setGearFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 focus:outline-none focus:border-[#005288] transition-all cursor-pointer font-mono shadow-sm"
                >
                  <option value="All">All Control Gear</option>
                  {filtersData.gears.map(gearVal => (
                    <option key={gearVal} value={gearVal}>{gearVal}</option>
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
            <div className="overflow-x-auto lg:overflow-visible">
              <table className="w-full text-left border-collapse font-mono">
                <thead className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 shadow-md">
                  <tr className="border-b border-gray-300 bg-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {activeParams.includes('mmCode') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap">MM Code</th>}
                    {activeParams.includes('modelNo') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap">Model No.</th>}
                    {activeParams.includes('colour') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap">Finish / Colour</th>}
                    {activeParams.includes('wattage') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Power</th>}
                    {activeParams.includes('luminousFlux') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Luminous Flux</th>}
                    {activeParams.includes('colourTemperature') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">CCT (K)</th>}
                    {activeParams.includes('cri') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">CRI</th>}
                    {activeParams.includes('efficacy') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Efficacy</th>}
                    {activeParams.includes('ip') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">IP</th>}
                    {activeParams.includes('connector') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Control Gear</th>}
                    {activeParams.includes('lampBase') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Lamp Base</th>}
                    {activeParams.includes('voltage') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap">Voltage</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-gray-700">
                  {filteredSkus.map((sku, modelIndex) => {
                    const parent = typeof sku.product === 'object' ? sku.product : null;
                    const mmCode = sku.name;
                    const modelNo = parent?.name || sku.modelNumber || '—';
                    
                    const isEvenModel = modelIndex % 2 === 0;
                    const modelBgClass = isEvenModel ? 'bg-white' : 'bg-[#f4f8fc]';
                    const modelHoverClass = isEvenModel ? 'hover:bg-blue-50/50' : 'hover:bg-blue-100/40';

                    const color = getSkuSpec(sku, ['colour', 'color', 'Colour', 'Color', 'fitting_colour'], '—');
                    const power = getSkuSpec(sku, ['power', 'System power', 'wattage', 'on_mode_power_w'], '—');
                    const flux = getSkuSpec(sku, ['luminousFlux', 'Luminous flux', 'flux', 'lumens', 'total_luminous_flux_lm', 'useful_luminous_flux_lm'], '—');
                    const cct = getSkuSpec(sku, ['colourTemperature', 'Color Temperature', 'CCT', 'cct_k'], '—');
                    const cri = getSkuSpec(sku, ['cri', 'CRI', 'Colour rendering index', 'ra'], '—');
                    const ip = formatIpRating(getSkuSpec(sku, ['ipRating', 'IP rating', 'IP Rating', 'ip'], '—'));
                    const control = getSkuSpec(sku, ['controlGear', 'control_gear', 'Control gear', 'connector', 'type_terminal block', 'cap_type'], '—');
                    
                    const allCcts = parseCcts(cct);
                    const cctsToRender = allCcts.filter(part => {
                      if (colorTempFilter === 'All') return true;
                      const partNum = part.replace(/[^\d]/g, '');
                      const filterNum = colorTempFilter.replace(/[^\d]/g, '');
                      return partNum === filterNum;
                    });

                    const displayCcts = cctsToRender.length > 0 ? cctsToRender : (allCcts.length > 0 ? allCcts : ['—']);
                    const N = displayCcts.length;

                    return (
                      <Fragment key={sku.id}>
                        {displayCcts.map((subCct, i) => {
                          const originalIndex = allCcts.indexOf(subCct);
                          const cctIndex = originalIndex >= 0 ? originalIndex : 0;
                          const subFlux = getFluxForCct(flux, subCct, cctIndex, allCcts.length);

                          const fluxParts = subFlux.split(/[\/+]/).map(s => s.trim()).filter(Boolean);
                          const powerParts = power.split(/[\/+]/).map(s => s.trim()).filter(Boolean);
                          
                          let efficacy = getSkuSpec(sku, ['total_mains_efficacy_lmw', 'efficacy', 'luminous_efficacy'], '—');
                          if (efficacy === '—' && fluxParts.length > 0 && powerParts.length > 0) {
                            const efficacies = fluxParts.map((f, idx) => {
                              const p = powerParts[idx] || powerParts[0];
                              const numF = parseInt(f);
                              const numP = parseFloat(p);
                              return (!isNaN(numF) && !isNaN(numP) && numP > 0) ? Math.round(numF / numP) : null;
                            }).filter(val => val !== null) as number[];
                            
                            if (efficacies.length > 1) {
                              const minEff = Math.min(...efficacies);
                              const maxEff = Math.max(...efficacies);
                              efficacy = minEff === maxEff ? `${minEff} lm/W` : `${minEff}-${maxEff} lm/W`;
                            } else if (efficacies.length === 1) {
                              efficacy = `${efficacies[0]} lm/W`;
                            }
                          }
                          if (efficacy !== '—' && !efficacy.toLowerCase().includes('lm/w') && !isNaN(parseFloat(efficacy))) {
                            efficacy = `${efficacy} lm/W`;
                          }

                          const isFirst = i === 0;

                          return (
                            <tr 
                              key={`${sku.id}-sub-${subCct}`} 
                              onClick={() => handleOpenProduct(sku)}
                              className={`text-xs md:text-sm ${modelBgClass} ${modelHoverClass} hover:text-gray-900 cursor-pointer transition-all duration-150 border-b border-gray-200/70`}
                            >
                              {activeParams.includes('mmCode') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 font-bold text-[#005288] align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {mmCode}
                                </td>
                              )}
                              {activeParams.includes('modelNo') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 font-sans font-medium text-gray-900 align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {modelNo}
                                </td>
                              )}
                              {activeParams.includes('colour') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-gray-600 align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {color}
                                </td>
                              )}
                              {activeParams.includes('wattage') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-bold text-gray-900 align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {power}
                                </td>
                              )}
                              {activeParams.includes('luminousFlux') && (
                                <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                  {subFlux}
                                </td>
                              )}
                              {activeParams.includes('colourTemperature') && (
                                <td className="py-2.5 px-4 text-center font-bold text-gray-800 whitespace-nowrap">
                                  {subCct}
                                </td>
                              )}
                              {activeParams.includes('cri') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {cri}
                                </td>
                              )}
                              {activeParams.includes('efficacy') && (
                                <td className="py-2.5 px-4 text-center text-[#005288] font-bold whitespace-nowrap">
                                  {efficacy}
                                </td>
                              )}
                              {activeParams.includes('ip') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-bold align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {ip}
                                </td>
                              )}
                              {activeParams.includes('connector') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center text-gray-600 font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {control}
                                </td>
                              )}
                              {activeParams.includes('lampBase') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center text-gray-600 font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['lampBase', 'lamp base', 'cap_type'], '—')}
                                </td>
                              )}
                              {activeParams.includes('voltage') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center text-gray-600 font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['voltage', 'Voltage', 'rated_voltage_v'], '—')}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </Fragment>
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
                      <FontAwesomeIcon icon={faDownload} />
                      Download
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
                                 {/* Line Drawing / Dimensional Outline Box */}
                                 {(() => {
                                   const lineDrawingFile = activeDrawerProduct.lineDrawing || parent?.lineDrawing;
                                   const heightVal = getSkuSpec(activeDrawerProduct, ['height_mm', 'height', 'depth_mm'], '');
                                   const diamVal = getSkuSpec(activeDrawerProduct, ['diameter_mm', 'diameter', 'width_mm'], '');

                                   return (
                                     <div className="bg-gray-50 border border-gray-200 p-3 flex flex-col items-center justify-center shadow-sm relative group overflow-hidden">
                                       <div className="w-full flex items-center justify-between border-b border-gray-200/80 pb-1.5 mb-2">
                                         <span className="text-[9px] font-bold uppercase tracking-widest text-[#005288] font-sans">
                                           Dimensional Line Drawing
                                         </span>
                                         <span className="text-[8px] font-mono text-gray-400 uppercase">
                                           CAD Outline
                                         </span>
                                       </div>

                                       <div className="relative aspect-[4/3] w-full bg-white border border-gray-150 rounded flex items-center justify-center p-2 overflow-hidden">
                                         {lineDrawingFile ? (
                                           <img 
                                             src={getImageUrl(lineDrawingFile)} 
                                             alt="Line Drawing" 
                                             className="max-h-full max-w-full object-contain"
                                           />
                                         ) : (
                                           <svg viewBox="0 0 160 140" className="w-full h-full text-gray-600">
                                             {/* Outer Luminaire Contour */}
                                             <path d="M 80 18 C 50 18 35 38 35 62 C 35 86 50 102 58 114 L 58 126 L 102 126 L 102 114 C 110 102 125 86 125 62 C 125 38 110 18 80 18 Z" fill="none" stroke="#005288" strokeWidth="1.5" />
                                             <path d="M 58 126 L 102 126 M 58 129 L 102 129 M 60 132 L 100 132" fill="none" stroke="#005288" strokeWidth="1.2" />

                                             {/* Internal Lens / Reflector outline */}
                                             <ellipse cx="80" cy="50" rx="32" ry="12" fill="none" stroke="#9ca3af" strokeWidth="0.8" strokeDasharray="2,2" />
                                             <line x1="80" y1="18" x2="80" y2="126" stroke="#e5e7eb" strokeWidth="0.6" strokeDasharray="3,3" />

                                             {/* Height Dimension line on left */}
                                             <line x1="18" y1="18" x2="18" y2="132" stroke="#009fe3" strokeWidth="1" />
                                             <line x1="13" y1="18" x2="23" y2="18" stroke="#009fe3" strokeWidth="1" />
                                             <line x1="13" y1="132" x2="23" y2="132" stroke="#009fe3" strokeWidth="1" />
                                             <text x="10" y="78" fill="#009fe3" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(-90 10 78)">
                                               {heightVal ? `${heightVal}mm` : 'H'}
                                             </text>

                                             {/* Diameter Dimension line at bottom */}
                                             <line x1="35" y1="137" x2="125" y2="137" stroke="#009fe3" strokeWidth="1" />
                                             <line x1="35" y1="133" x2="35" y2="139" stroke="#009fe3" strokeWidth="1" />
                                             <line x1="125" y1="133" x2="125" y2="139" stroke="#009fe3" strokeWidth="1" />
                                             <text x="80" y="139" fill="#009fe3" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                                               {diamVal ? `Ø ${diamVal}mm` : 'D'}
                                             </text>
                                           </svg>
                                         )}
                                       </div>

                                       <div className="w-full flex items-center justify-between mt-2 text-[8px] font-mono text-gray-400">
                                         <span>{lineDrawingFile ? (lineDrawingFile.filename || 'Uploaded File') : 'Technical CAD Outline'}</span>
                                         {lineDrawingFile && (
                                           <button 
                                             onClick={() => handleDownloadFile(lineDrawingFile, 'Line Drawing')}
                                             className="inline-flex items-center gap-1 font-bold text-[#005288] hover:underline cursor-pointer"
                                           >
                                             <FontAwesomeIcon icon={faDownload} className="text-[8px]" />
                                             <span>Download</span>
                                           </button>
                                         )}
                                       </div>
                                     </div>
                                   );
                                 })()}
                              </div>

                              <div className="md:col-span-7 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                                  Optical Innovation Engine
                                </h4>
                                <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed">
                                  {activeDrawerProduct.description || parent?.description || "The Toledo-Triona system represents circular rimless optical perfection. Delivers elegant, homogenous distribution across premium corporate environments."}
                                </p>

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 font-light">
                                    <FontAwesomeIcon icon={faCheck} className="text-[#005288] text-[10px]" />
                                    <span>SIDELITE<sup>®</sup> Lateral optical reflection system</span>
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

                    {/* TAB 3: PHOTOMETRICS (Vector light curves & CADs) */}
                    {activeModalTab === 'photometrics' && (
                      <div className="space-y-8 animate-fade-in">
                        
                        {/* Section 1: Photometric & Technical Diagrams Grid */}
                        {(() => {
                          const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                          const spectrumFile = activeDrawerProduct.lightSpectrumGraph || parent?.lightSpectrumGraph;
                          const polarFile = activeDrawerProduct.photometricPolarDiagram || parent?.photometricPolarDiagram;
                          const beamFile = activeDrawerProduct.beamAngleDiagram || parent?.beamAngleDiagram;

                          return (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] font-sans">
                                  Photometric & Technical Diagrams
                                </h4>
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                                  Optical Specs & Distribution
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                {/* 1. Light Spectrum Graph */}
                                <div className="border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-sm hover:border-[#005288]/40 transition-all group">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 font-sans">
                                        Light Spectrum Graph
                                      </span>
                                      <span className="text-[8px] font-mono uppercase bg-blue-50 text-[#005288] px-1.5 py-0.5 rounded border border-blue-100">
                                        SPD
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-mono mb-3">Visible Wavelength Spectrum (380 - 780nm)</p>

                                    <div className="relative aspect-[4/3] w-full bg-gray-50/80 border border-gray-150 rounded flex items-center justify-center p-2 overflow-hidden">
                                      {spectrumFile ? (
                                        <img 
                                          src={getImageUrl(spectrumFile)} 
                                          alt="Light Spectrum Graph" 
                                          className="max-h-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <svg viewBox="0 0 200 130" className="w-full h-full text-[#005288]">
                                          <defs>
                                            <linearGradient id="spectrumRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                                              <stop offset="0%" stopColor="#8b00ff" stopOpacity="0.4" />
                                              <stop offset="20%" stopColor="#0000ff" stopOpacity="0.4" />
                                              <stop offset="40%" stopColor="#00ff00" stopOpacity="0.4" />
                                              <stop offset="60%" stopColor="#ffff00" stopOpacity="0.4" />
                                              <stop offset="80%" stopColor="#ff7f00" stopOpacity="0.4" />
                                              <stop offset="100%" stopColor="#ff0000" stopOpacity="0.4" />
                                            </linearGradient>
                                            <linearGradient id="spectrumFill" x1="0%" y1="0%" x2="0%" y2="100%">
                                              <stop offset="0%" stopColor="#005288" stopOpacity="0.25" />
                                              <stop offset="100%" stopColor="#005288" stopOpacity="0.0" />
                                            </linearGradient>
                                          </defs>

                                          {/* Grid lines */}
                                          <line x1="25" y1="20" x2="185" y2="20" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
                                          <line x1="25" y1="45" x2="185" y2="45" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
                                          <line x1="25" y1="70" x2="185" y2="70" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
                                          <line x1="25" y1="95" x2="185" y2="95" stroke="#e5e7eb" strokeWidth="0.5" />
                                          <line x1="25" y1="10" x2="25" y2="95" stroke="#e5e7eb" strokeWidth="0.5" />

                                          {/* Rainbow band below curve */}
                                          <rect x="25" y="96" width="160" height="4" fill="url(#spectrumRainbow)" rx="1" />

                                          {/* Spectral Emission Curve */}
                                          <path 
                                            d="M 25 95 Q 40 93 48 30 T 65 75 T 100 40 T 145 65 T 185 95 Z" 
                                            fill="url(#spectrumFill)" 
                                          />
                                          <path 
                                            d="M 25 95 Q 40 93 48 30 T 65 75 T 100 40 T 145 65 T 185 95" 
                                            fill="none" 
                                            stroke="#005288" 
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                          />

                                          {/* Peak marker */}
                                          <circle cx="48" cy="30" r="2.5" fill="#005288" />
                                          <text x="48" y="22" fontSize="6" fill="#005288" fontWeight="bold" textAnchor="middle">450nm</text>

                                          {/* Wavelength Ticks */}
                                          <text x="25" y="112" fontSize="6" fill="#9ca3af" textAnchor="middle">380</text>
                                          <text x="65" y="112" fontSize="6" fill="#9ca3af" textAnchor="middle">500</text>
                                          <text x="115" y="112" fontSize="6" fill="#9ca3af" textAnchor="middle">600</text>
                                          <text x="165" y="112" fontSize="6" fill="#9ca3af" textAnchor="middle">700</text>
                                          <text x="185" y="112" fontSize="6" fill="#9ca3af" textAnchor="middle">780nm</text>
                                        </svg>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-gray-400">
                                      {spectrumFile ? (spectrumFile.filename || 'Uploaded File') : 'Standard Spectral Power'}
                                    </span>
                                    {spectrumFile ? (
                                      <button 
                                        onClick={() => handleDownloadFile(spectrumFile, 'Light Spectrum Graph')}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline"
                                      >
                                        <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                        <span>Download</span>
                                      </button>
                                    ) : (
                                      <span className="text-[9px] font-mono text-gray-400 italic">Preview Curve</span>
                                    )}
                                  </div>
                                </div>

                                {/* 2. Photometric Polar Diagram */}
                                <div className="border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-sm hover:border-[#005288]/40 transition-all group">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 font-sans">
                                        Photometric Polar Diagram
                                      </span>
                                      <span className="text-[8px] font-mono uppercase bg-blue-50 text-[#005288] px-1.5 py-0.5 rounded border border-blue-100">
                                        POLAR
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-mono mb-3">Luminous Intensity (cd/klm)</p>

                                    <div className="relative aspect-[4/3] w-full bg-gray-50/80 border border-gray-150 rounded flex items-center justify-center p-2 overflow-hidden">
                                      {polarFile ? (
                                        <img 
                                          src={getImageUrl(polarFile)} 
                                          alt="Photometric Polar Diagram" 
                                          className="max-h-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <svg viewBox="0 0 140 130" className="w-full h-full text-[#005288]">
                                          {/* Polar Grid Circles */}
                                          <circle cx="70" cy="65" r="50" fill="none" stroke="#e5e7eb" strokeWidth="0.6" />
                                          <circle cx="70" cy="65" r="35" fill="none" stroke="#e5e7eb" strokeWidth="0.6" strokeDasharray="2,2" />
                                          <circle cx="70" cy="65" r="20" fill="none" stroke="#e5e7eb" strokeWidth="0.6" strokeDasharray="2,2" />
                                          <circle cx="70" cy="65" r="2" fill="#005288" />

                                          {/* Radial Axis Lines */}
                                          <line x1="70" y1="10" x2="70" y2="120" stroke="#d1d5db" strokeWidth="0.6" />
                                          <line x1="15" y1="65" x2="125" y2="65" stroke="#d1d5db" strokeWidth="0.6" />
                                          <line x1="30" y1="25" x2="110" y2="105" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
                                          <line x1="110" y1="25" x2="30" y2="105" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />

                                          {/* C0-C180 Luminous Intensity Curve */}
                                          <path 
                                            d="M 70 65 Q 52 85 45 98 T 32 105 T 52 92 Q 70 65 88 92 T 108 105 T 95 98 Z" 
                                            fill="rgba(0, 82, 136, 0.08)" 
                                            stroke="#005288" 
                                            strokeWidth="1.6"
                                          />

                                          {/* C90-C270 Luminous Intensity Curve (Dashed) */}
                                          <path 
                                            d="M 70 65 Q 56 82 50 94 T 38 100 T 56 88 Q 70 65 84 88 T 102 100 T 90 94 Z" 
                                            fill="none" 
                                            stroke="#009fe3" 
                                            strokeWidth="1.2"
                                            strokeDasharray="3,2"
                                          />

                                          {/* Angle Ticks Labels */}
                                          <text x="70" y="8" fill="#9ca3af" fontSize="5" textAnchor="middle">180°</text>
                                          <text x="70" y="126" fill="#9ca3af" fontSize="5" textAnchor="middle">0°</text>
                                          <text x="8" y="66" fill="#9ca3af" fontSize="5" textAnchor="middle">90°</text>
                                          <text x="132" y="66" fill="#9ca3af" fontSize="5" textAnchor="middle">90°</text>

                                          {/* Candela Legend */}
                                          <text x="72" y="28" fill="#9ca3af" fontSize="4.5">300</text>
                                          <text x="72" y="43" fill="#9ca3af" fontSize="4.5">150</text>
                                        </svg>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-gray-400">
                                      {polarFile ? (polarFile.filename || 'Uploaded File') : 'Direct/Indirect Polar Curve'}
                                    </span>
                                    {polarFile ? (
                                      <button 
                                        onClick={() => handleDownloadFile(polarFile, 'Photometric Polar Diagram')}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline"
                                      >
                                        <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                        <span>Download</span>
                                      </button>
                                    ) : (
                                      <span className="text-[9px] font-mono text-gray-400 italic">Preview Curve</span>
                                    )}
                                  </div>
                                </div>

                                {/* 3. Beam Angle Diagram */}
                                <div className="border border-gray-200 bg-white p-4 flex flex-col justify-between shadow-sm hover:border-[#005288]/40 transition-all group">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 font-sans">
                                        Beam Angle Diagram
                                      </span>
                                      <span className="text-[8px] font-mono uppercase bg-blue-50 text-[#005288] px-1.5 py-0.5 rounded border border-blue-100">
                                        CONE
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-mono mb-3">Illuminance Cone & Distance</p>

                                    <div className="relative aspect-[4/3] w-full bg-gray-50/80 border border-gray-150 rounded flex items-center justify-center p-2 overflow-hidden">
                                      {beamFile ? (
                                        <img 
                                          src={getImageUrl(beamFile)} 
                                          alt="Beam Angle Diagram" 
                                          className="max-h-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <svg viewBox="0 0 160 130" className="w-full h-full text-[#005288]">
                                          <defs>
                                            <linearGradient id="beamConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                              <stop offset="0%" stopColor="#005288" stopOpacity="0.3" />
                                              <stop offset="100%" stopColor="#005288" stopOpacity="0.05" />
                                            </linearGradient>
                                          </defs>

                                          {/* Luminaire Source Icon */}
                                          <rect x="70" y="8" width="20" height="6" fill="#005288" rx="1" />
                                          <line x1="80" y1="14" x2="80" y2="18" stroke="#005288" strokeWidth="1" />

                                          {/* Beam Cone Spread */}
                                          <polygon points="80,18 20,110 140,110" fill="url(#beamConeGrad)" />
                                          <line x1="80" y1="18" x2="20" y2="110" stroke="#005288" strokeWidth="1.2" />
                                          <line x1="80" y1="18" x2="140" y2="110" stroke="#005288" strokeWidth="1.2" />
                                          <line x1="80" y1="18" x2="80" y2="110" stroke="#005288" strokeWidth="0.8" strokeDasharray="2,2" />

                                          {/* Distance levels (1m, 2m, 3m) */}
                                          <line x1="45" y1="50" x2="115" y2="50" stroke="#d1d5db" strokeWidth="0.6" strokeDasharray="2,2" />
                                          <line x1="32" y1="80" x2="128" y2="80" stroke="#d1d5db" strokeWidth="0.6" strokeDasharray="2,2" />
                                          <line x1="20" y1="110" x2="140" y2="110" stroke="#d1d5db" strokeWidth="0.6" />

                                          {/* Distance & Lux Labels */}
                                          <text x="14" y="52" fill="#6b7280" fontSize="5" textAnchor="end">1.0m</text>
                                          <text x="14" y="82" fill="#6b7280" fontSize="5" textAnchor="end">2.0m</text>
                                          <text x="14" y="112" fill="#6b7280" fontSize="5" textAnchor="end">3.0m</text>

                                          <text x="120" y="52" fill="#005288" fontSize="5" fontWeight="bold">E₀: 1250 lx</text>
                                          <text x="132" y="82" fill="#005288" fontSize="5" fontWeight="bold">E₀: 312 lx</text>
                                          <text x="143" y="112" fill="#005288" fontSize="5" fontWeight="bold">E₀: 138 lx</text>

                                          {/* Beam Angle Arc */}
                                          <path d="M 72,32 A 15,15 0 0 1 88,32" fill="none" stroke="#009fe3" strokeWidth="1" />
                                          <text x="80" y="29" fill="#009fe3" fontSize="5.5" fontWeight="bold" textAnchor="middle">36°</text>
                                        </svg>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-gray-400">
                                      {beamFile ? (beamFile.filename || 'Uploaded File') : 'Illuminance Cone Angle'}
                                    </span>
                                    {beamFile ? (
                                      <button 
                                        onClick={() => handleDownloadFile(beamFile, 'Beam Angle Diagram')}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline"
                                      >
                                        <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                        <span>Download</span>
                                      </button>
                                    ) : (
                                      <span className="text-[9px] font-mono text-gray-400 italic">Preview Cone</span>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })()}

                        {/* Section 2: CAD & Architectural Databases + Technical Documents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
                          
                          {/* CAD & Architectural Databases */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                              CAD & Architectural Databases
                            </h4>
                            
                            {(() => {
                              const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                              const ldtFile = activeDrawerProduct.photometryLdt || parent?.photometryLdt;
                              const iesFile = activeDrawerProduct.photometryIes || parent?.photometryIes;
                              
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
                                </div>
                              );
                            })()}
                          </div>

                          {/* Technical Documents */}
                          <div className="space-y-4">
                            {(() => {
                              const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                              const famObj = family || (parent && typeof parent.families === 'object' ? parent.families : null);
                              const familyDi = famObj?.dismantleInstructionPdf || null;
                              
                              const specs = (activeDrawerProduct.specifications || parent?.specifications || {}) as Record<string, any>;
                              
                              const isValidDriverModel = (val: any) => {
                                if (val === null || val === undefined) return false;
                                const str = String(val).trim().toLowerCase();
                                if (!str) return false;
                                return !(str === 'undefined' || str === 'null' || str === 'n/a' || str === 'n.a.' || str === 'na' || str === 'none' || str === '-' || str === '—');
                              };

                              const hasDriverModel = isValidDriverModel(specs.driver_model) || isValidDriverModel(specs.scg_driver_model_no);
                              const showControlGearDoc = hasDriverModel || Boolean(activeDrawerProduct.techDocControlGear || parent?.techDocControlGear);
                              const hasContainingProductSpecs = isValidDriverModel(specs.customer_model_no_new) || isValidDriverModel(specs.model_identifier) || isValidDriverModel(specs.replacable_light_source) || isValidDriverModel(specs.replaceble_control_gear);
                              const showContainingProductDoc = hasContainingProductSpecs || Boolean(activeDrawerProduct.techDocContainingProduct || parent?.techDocContainingProduct) || Boolean(familyDi);
                              const techDocLightSourceFile = activeDrawerProduct.techDocLightSource || parent?.techDocLightSource;
                              const showLightSourceDoc = Boolean(techDocLightSourceFile) || Boolean(familyDi) || isValidDriverModel(specs.model_identifier) || Boolean(parent);
                              
                              const parentId = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                                ? activeDrawerProduct.id
                                : (typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product.id : activeDrawerProduct.product);
                              const skuQuery = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                                ? ''
                                : `?sku=${activeDrawerProduct.name}`;

                              if (!showControlGearDoc && !showContainingProductDoc && !showLightSourceDoc) return null;
                              
                              return (
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans mb-4">
                                    Technical Documents
                                  </h4>
                                  <div className="grid grid-cols-1 gap-2 text-xs">
                                    {showLightSourceDoc && (
                                      <Link 
                                        href={`/products/${parentId}/eprel-light-source${skuQuery}`}
                                        target="_blank"
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - LIGHT SOURCE</span>
                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                      </Link>
                                    )}
                                    {showControlGearDoc && (
                                      <Link 
                                        href={`/products/${parentId}/control-gear${skuQuery}`}
                                        target="_blank"
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - CONTROL GEAR</span>
                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                      </Link>
                                    )}
                                    {showContainingProductDoc && (
                                      <Link 
                                        href={`/products/${parentId}/containing-product${skuQuery}`}
                                        target="_blank"
                                        className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                      >
                                        <span>TECHNICAL DOCUMENT - CONTAINING PRODUCT</span>
                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                      </Link>
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
                <div className="h-20 border-t border-gray-200 px-8 bg-gray-50 flex items-center justify-end gap-4 relative z-20 shadow-[0_-4px_12px_-5px_rgba(0,0,0,0.05)]">
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
