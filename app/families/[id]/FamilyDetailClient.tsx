"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollVideoBlock from './ScrollVideoBlock';
import {
  resolveTitleColor,
  resolveTitleSize,
  resolveSubtitleColor,
  resolveSubtitleSize
} from '../../utils/typography';
import { formatSpecValue, roundToTwoDecimals, roundEfficacyToWholeNumber } from '../../utils/formatDecimals';
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
  symbols?: SymbolItem[] | null;
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
  icon?: { url?: string; alt?: string; filename?: string; [key: string]: any } | string | null;
  isHighlighted?: boolean;
}

interface Block {
  blockType: string;
  id?: string;
  title?: string;
  hideTitle?: boolean;
  titleColor?: string;
  titleCustomColor?: string;
  titleSize?: string;
  subtitle?: string;
  subtitleColor?: string;
  subtitleCustomColor?: string;
  subtitleSize?: string;
  content?: string;
  image?: any;
  linkText?: string;
  linkUrl?: string;
  layout?: 'grid' | 'split-left' | 'split-right';
  products?: any[];
  projects?: any[];
  video?: any;
  mobileVideo?: any;
  captions?: any[];
}

export interface AccessoryItem {
  id?: string;
  modelNumber?: string;
  modelNo?: string;
  mmCode?: string;
  name?: string;
  title?: string;
  description?: string;
  colour?: string;
  color?: string;
  image?: { url: string; alt?: string; filename?: string } | string | null;
  product?: Product | string | null;
  specifications?: Record<string, unknown> | null;
}

interface Family {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  media: MediaItem[];
  products: Product[];
  accessories?: AccessoryItem[];
  features?: { id?: string; feature: string }[];
  symbols?: SymbolItem[];
  layout?: Block[];
  selectedParameters?: string[];
  dismantleInstructionPdf?: MediaFile | null;
  lineDrawing?: MediaFile | null;
  lightSpectrumGraph?: MediaFile | null;
  spectrumImage?: MediaFile | null;
  photometryLdt?: MediaFile | null;
  photometryIes?: MediaFile | null;
  datasheet?: {
    enabled?: boolean;
    title?: string | null;
    subtitle?: string | null;
    headerImage?: any;
    pages?: any[];
    notes?: string | null;
  } | null;
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
    if (/^[0-9a-fA-F]{24}$/.test(image)) {
      return '/placeholder.png';
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image}`;
  }

  if (image.url) {
    if (image.url.startsWith('http') || image.url.startsWith('//')) {
      return resolveAbsoluteUrl(image.url);
    }
    if (/^[0-9a-fA-F]{24}$/.test(image.url)) {
      return '/placeholder.png';
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

// Helper to format beam angle values and safely display legacy compound angles (e.g. "2436" -> "24/36")
const formatBeamAngle = (angleStr: unknown): string => {
  if (angleStr === null || angleStr === undefined || angleStr === '' || angleStr === '—' || angleStr === 'undefined' || angleStr === 'null') return '—';
  const clean = String(angleStr).trim();
  if (/^(2436|2445|2545)$/.test(clean)) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
};

// Helper to expand lookups with database schema keys dynamically
const expandSpecNames = (specNames: string[]): string[] => {
  const expanded: string[] = [];
  for (const name of specNames) {
    const lower = name.toLowerCase();
    if (lower.includes('model') || lower.includes('item_no') || lower.includes('art_nr')) {
      expanded.push('customer_model_no_new', 'model_number', 'yk_model_no', 'model_identifier', 'customer_model_no_old', 'modelNo');
    }
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
    if ((lower.includes('cct') || lower.includes('temp')) && !lower.includes('operat') && !lower.includes('ambient')) {
      expanded.push(
        'correlated_colour_temperature',
        'cct_k',
        'cct',
        'colourtemperature',
        'colortemperature',
        'colour_temperature',
        'color_temperature',
        'colour_temp',
        'colortemp',
        'correlated_color_temperature'
      );
    }
    if (lower.includes('operat') || lower.includes('ambient')) {
      expanded.push('operating_temperature', 'temperature_of_ambient');
    }
    if ((lower.includes('colour') || lower.includes('color')) && !lower.includes('temp') && !lower.includes('cct') && !lower.includes('rendering') && !lower.includes('consistency')) {
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
    if (lower.includes('cri') || /(^|[^a-z])ra([^a-z]|$)/i.test(lower) || lower.includes('rendering')) {
      expanded.push('ra', 'cri', 'colour_rendering_index', 'color_rendering_index', 'cri_lower_80');
    }
    if (lower.includes('gear') || lower.includes('control') || lower.includes('connector')) {
      expanded.push('control_gear', 'driver_type', 'driver_model', 'dimming_type', 'type_terminal block');
    }
    if (lower.includes('volt')) {
      expanded.push('rated_voltage_v', 'voltage', 'input_voltage', 'operating_voltage');
    }
    if (lower.includes('beam')) {
      expanded.push('beam_angle', 'beam', 'beamAngle', 'dls_beam_angle');
    }
    if (lower.includes('base') || lower.includes('cap')) {
      expanded.push('cap_type', 'lamp_holder_type', 'lamp_source', 'lampBase', 'lamp_base');
    }
    if (lower.includes('housing') || lower.includes('material')) {
      expanded.push('housing_material', 'housingMaterial');
    }
    if (lower.includes('diffuser') || lower.includes('cover')) {
      expanded.push('diffuser_material', 'cover_material', 'coverMaterial');
    }
    if (lower.includes('dimen') || lower.includes('size')) {
      expanded.push('dimensions_mm', 'dimensions', 'height_mm', 'width_mm', 'length_mm');
    }
    expanded.push(name);
  }
  return Array.from(new Set(expanded));
};

const isFieldFilled = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  const str = String(val).trim();
  return str !== '' && str !== '—' && str !== '-' && str.toLowerCase() !== 'undefined' && str.toLowerCase() !== 'null' && str.toLowerCase() !== 'n/a';
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

// Extraction utility for technical parameters inside product specifications JSON (RZB Style)
// Prioritizes General Data specifications first for all parameters
const getRawProductSpec = (productObj: any, specNames: string[], defaultValue = '—'): string => {
  if (!productObj) return defaultValue;

  const targetProduct = productObj.product && typeof productObj.product === 'object' ? productObj.product : productObj;
  const expandedNames = expandSpecNames(specNames);

  // 1. MM Code check: if looking specifically for MM code
  for (const name of expandedNames) {
    if (name === 'mm_code' || name === 'sku_name' || name === 'yk_product_code') {
      if (isFieldFilled(productObj.name) && /^MM/i.test(String(productObj.name))) return String(productObj.name).trim();
      if (isFieldFilled(targetProduct.name) && /^MM/i.test(String(targetProduct.name))) return String(targetProduct.name).trim();
    }
  }

  // 2. ALL PARAMETERS COME FROM GENERAL DATA FIRST:
  const specs = (targetProduct.specifications || productObj.specifications) as Record<string, unknown> | undefined;
  if (specs) {
    for (const name of expandedNames) {
      if (isFieldFilled(specs[name])) {
        return String(specs[name]).trim();
      }
    }
  }

  // 3. Parsed description specifications from General Data description
  const generalDesc = (specs?.description as string) || targetProduct.description || productObj.description || '';
  if (generalDesc) {
    const descSpecs = parseDescriptionSpecs(generalDesc);
    for (const name of expandedNames) {
      if (isFieldFilled(descSpecs[name])) {
        return descSpecs[name];
      }
    }
  }

  // 4. Fallback to direct entry attributes on targetProduct / productObj only if not found in General Data
  for (const name of expandedNames) {
    if (name === 'customer_model_no_new' || name === 'model_number' || name === 'modelNo' || name === 'model_identifier' || name === 'customer_model_no_old') {
      if (isFieldFilled(targetProduct.name)) return String(targetProduct.name).trim();
      if (isFieldFilled(productObj.name)) return String(productObj.name).trim();
      if (isFieldFilled(productObj.modelNumber)) return String(productObj.modelNumber).trim();
    }
    if (name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w') {
      const pwr = targetProduct.power || targetProduct.wattage || productObj.wattage || productObj.power;
      if (isFieldFilled(pwr)) return String(pwr).trim();
    }
    if (name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k' || name === 'correlated_colour_temperature' || name === 'colour_temperature') {
      const ct = targetProduct.colourTemperature || targetProduct.colorTemperature || productObj.colourTemperature;
      if (isFieldFilled(ct)) return String(ct).trim();
    }
    if (name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour') {
      const col = targetProduct.colour || targetProduct.color || productObj.colour;
      if (isFieldFilled(col) && !/^\d{4}/.test(String(col).trim())) return String(col).trim();
    }
    if (name === 'ipRating' || name === 'IP rating' || name === 'IP Rating' || name === 'ip') {
      const ipVal = targetProduct.ip || productObj.ip;
      if (isFieldFilled(ipVal)) return String(ipVal).trim();
    }
    if (name === 'controlGear' || name === 'control_gear' || name === 'Control gear' || name === 'type_terminal block' || name === 'cap_type') {
      const gear = targetProduct.connector || productObj.connector;
      if (isFieldFilled(gear)) return String(gear).trim();
    }
  }

  return defaultValue;
};

const getProductSpec = (productObj: any, specNames: string[], defaultValue = '—'): string => {
  const raw = getRawProductSpec(productObj, specNames, defaultValue);
  return raw === defaultValue ? defaultValue : formatSpecValue(raw, specNames);
};

const getRawSkuSpec = (sku: any, specNames: string[], defaultValue = ''): string => {
  if (!sku) return defaultValue;

  const parent = sku.product && typeof sku.product === 'object' ? sku.product : null;
  const expandedNames = expandSpecNames(specNames);

  // 1. MM Code check: MM code is the ONLY parameter that comes from the SKU document
  for (const name of expandedNames) {
    if (name === 'mm_code' || name === 'sku_name' || name === 'yk_product_code') {
      if (isFieldFilled(sku.name)) return String(sku.name).trim();
    }
  }

  // 2. ALL PARAMETERS COME FROM GENERAL DATA FIRST (specifications JSON):
  // A) Check SKU specifications JSON (holds General Data spreadsheet row linked to this SKU)
  const skuSpecs = sku.specifications as Record<string, unknown> | undefined;
  if (skuSpecs) {
    for (const name of expandedNames) {
      if (isFieldFilled(skuSpecs[name])) {
        return String(skuSpecs[name]).trim();
      }
    }
  }

  // B) Check Parent Product specifications JSON (holds General Data spreadsheet row of parent base model)
  const parentSpecs = parent?.specifications as Record<string, unknown> | undefined;
  if (parentSpecs) {
    for (const name of expandedNames) {
      if (isFieldFilled(parentSpecs[name])) {
        return String(parentSpecs[name]).trim();
      }
    }
  }

  // C) Check parsed description specifications from General Data description
  const generalDesc = (skuSpecs?.description as string) || (parentSpecs?.description as string) || parent?.description || sku.description || '';
  if (generalDesc) {
    const descSpecs = parseDescriptionSpecs(generalDesc);
    for (const name of expandedNames) {
      if (isFieldFilled(descSpecs[name])) {
        return descSpecs[name];
      }
    }
  }

  // 3. Fallback: Only if not found in General Data, check SKU or Parent Product direct entry fields
  for (const name of expandedNames) {
    if (name === 'customer_model_no_new' || name === 'model_number' || name === 'modelNo' || name === 'model_identifier' || name === 'customer_model_no_old') {
      if (isFieldFilled(parent?.name)) return String(parent.name).trim();
      if (isFieldFilled(sku.modelNumber)) return String(sku.modelNumber).trim();
      if (isFieldFilled(sku.name)) return String(sku.name).trim();
    }
    if (name === 'colour' || name === 'color' || name === 'Colour' || name === 'Color' || name === 'fitting_colour' || name === 'luminaires_color') {
      const col = sku.colour || sku.color || parent?.colour || parent?.color;
      if (isFieldFilled(col) && !/^\d{4}/.test(String(col).trim())) return String(col).trim();
    }
    if (name === 'power' || name === 'System power' || name === 'wattage' || name === 'on_mode_power_w' || name === 'light_source_on_mode_power_w') {
      const pwr = sku.wattage || sku.power || parent?.power || parent?.wattage;
      if (isFieldFilled(pwr)) return String(pwr).trim();
    }
    if (name === 'colourTemperature' || name === 'Color Temperature' || name === 'CCT' || name === 'cct_k' || name === 'colour_temp' || name === 'colortemp' || name === 'correlated_colour_temperature' || name === 'colour_temperature') {
      const ct = sku.colourTemperature || sku.colorTemperature || parent?.colourTemperature || parent?.colorTemperature;
      if (isFieldFilled(ct)) return String(ct).trim();
    }
    if (name === 'ipRating' || name === 'IP rating' || name === 'IP Rating' || name === 'ip' || name === 'ip_rating') {
      const ipVal = sku.ip || parent?.ip;
      if (isFieldFilled(ipVal)) return String(ipVal).trim();
    }
    if (name === 'controlGear' || name === 'control_gear' || name === 'Control gear' || name === 'type_terminal block' || name === 'cap_type' || name === 'connector') {
      const gear = sku.connector || parent?.connector;
      if (isFieldFilled(gear)) return String(gear).trim();
    }
    if (name === 'voltage' || name === 'Voltage' || name === 'rated_voltage_v') {
      const volt = sku.voltage || parent?.inputVoltage;
      if (isFieldFilled(volt)) return String(volt).trim();
    }
    if (name === 'lampBase' || name === 'lamp base' || name === 'cap_type' || name === 'base') {
      const base = sku.lampBase;
      if (isFieldFilled(base)) return String(base).trim();
    }
  }

  return defaultValue;
};

const getSkuSpec = (sku: any, specNames: string[], defaultValue = ''): string => {
  const raw = getRawSkuSpec(sku, specNames, defaultValue);
  return raw === defaultValue ? defaultValue : formatSpecValue(raw, specNames);
};

const parseCcts = (cctStr: any): string[] => {
  if (!cctStr || cctStr === '—') return [];

  const clean = String(cctStr).trim();
  if (!clean || clean === '—' || clean === 'undefined' || clean === 'null') return [];

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
    const num = parseInt(part);
    if (!isNaN(num) && num < 1000) {
      return ''; // Guard against invalid non-CCT numbers (e.g. CRI 80)
    }
    if (/^\d+$/.test(part)) {
      part += 'K';
    } else if (/^\d+k$/i.test(part)) {
      part = part.toUpperCase();
    }
    return part;
  }).filter(Boolean);
};

const parseFluxMap = (fluxStr: any): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!fluxStr || fluxStr === '—') return result;

  const clean = String(fluxStr).trim();
  if (clean.includes('@')) {
    const regex = /([0-9\/\s+]+)\s*@\s*([0-9a-zA-Z\/\+]+)/g;
    let match;
    while ((match = regex.exec(clean)) !== null) {
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

const getFluxForCct = (fluxStr: any, targetCct: string, cctIndex: number, totalCcts: number): string => {
  if (!fluxStr || fluxStr === '—') return '—';

  const clean = String(fluxStr).trim();
  const fluxMap = parseFluxMap(clean);
  if (fluxMap[targetCct]) {
    return fluxMap[targetCct];
  }

  // If the string is formatted with '@' CCT conditions (e.g. "125 @4000K 110 @5700K"),
  // but targetCct was not matched, return '—' so fallback calculation can compute it dynamically
  // instead of leaking the raw multi-CCT string into the table cell
  if (clean.includes('@')) {
    return '—';
  }

  const fluxParts = clean.split(/[\/+]/).map(s => s.trim()).filter(Boolean);
  if (fluxParts.length === totalCcts && cctIndex < fluxParts.length) {
    return fluxParts[cctIndex];
  }

  return clean;
};

const formatCctDisplay = (rawCct: any): string => {
  if (!rawCct || rawCct === '—') return '—';
  const parsed = parseCcts(rawCct);
  if (parsed.length > 0) return parsed.join(' / ');
  return String(rawCct).trim();
};

const formatCurrent = (rawCurrent: any, powerStr: any): string => {
  if (!rawCurrent || rawCurrent === '—') return '—';
  const clean = String(rawCurrent).trim();
  if (clean.includes('/')) return clean;
  const powerParts = String(powerStr || '').split(/[\/+]/).filter(Boolean);
  if (powerParts.length > 1 && /^\d+$/.test(clean) && clean.length % powerParts.length === 0) {
    const chunkLen = clean.length / powerParts.length;
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += chunkLen) {
      parts.push(clean.substring(i, i + chunkLen));
    }
    return parts.join(' / ');
  }
  return clean;
};

const formatMultiCondition = (str: any): string => {
  if (!str || str === '—') return '—';
  const clean = String(str).trim();
  if (!clean.includes('@')) return clean;
  return clean.replace(/\s+(?=\d+(?:\/\d+)*\s*@)/g, ' | ');
};

const getRatedLife = (sku: any): string => {
  const directLife = getSkuSpec(sku, ['norminal_life_h', 'nominal_life_h', 'rated_life_h', 'rated_life', 'norminal_life_l70b50_h'], '');
  if (directLife && directLife !== '—' && directLife !== 'null') return directLife;
  const desc = String(sku?.specifications?.description || sku?.description || '');
  const match = desc.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*hrs?(?:\s*([A-Za-z0-9@℃°C]+))?/i);
  if (match) {
    return match[2] ? `${match[1]} (${match[2]})` : match[1];
  }
  return '—';
};

const formatOperatingTemp = (val: any): string => {
  if (!val || val === '—' || val === 'null' || val === 'undefined') return '—';
  let s = String(val).trim();
  s = s.replace(/℃/g, '°C');
  const num = parseInt(s);
  if (!isNaN(num) && (num >= 500 || num <= -100)) {
    return '—';
  }
  if (/^-?\d+$/.test(s)) {
    return `-20°C to +${s}°C`;
  }
  if (/^[-+]?\d+\s*to\s*[-+]?\d+$/i.test(s)) {
    const parts = s.split(/\s*to\s*/i);
    const from = parts[0].includes('°C') ? parts[0] : `${parts[0]}°C`;
    const to = parts[1].includes('°C') ? parts[1] : `${parts[1]}°C`;
    return `${from} to ${to}`;
  }
  return s;
};

const formatSwitchingCycles = (val: any): string => {
  if (!val || val === '—' || val === 'null' || val === 'undefined' || val === '') {
    return '100,000';
  }
  const clean = String(val).trim().replace(/[^\d]/g, '');
  const num = parseInt(clean);
  if (!isNaN(num)) {
    return num.toLocaleString();
  }
  return String(val).trim();
};

const splitParamAndUnit = (label: string): { name: string; unit?: string } => {
  if (!label) return { name: '' };
  const match = label.match(/^(.*?)\s*([([][^)\]]+[)\]])$/);
  if (match) {
    return {
      name: match[1].trim(),
      unit: match[2].trim(),
    };
  }
  return { name: label };
};

const renderParamHeader = (label: string, isCenter = false) => {
  const { name, unit } = splitParamAndUnit(label);
  if (!unit) {
    return <span>{name}</span>;
  }
  return (
    <span className={`flex flex-col leading-tight ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
      <span>{name}</span>
      <span className="text-[10px] font-normal text-gray-500 mt-0.5 normal-case tracking-normal">
        {unit}
      </span>
    </span>
  );
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
    'connector',
    'symbols',
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
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [previewAccessoryImage, setPreviewAccessoryImage] = useState<{ url: string; title: string } | null>(null);

  // Memoized accessory items from family.accessories or fallback extraction from products' specifications
  const accessoriesList = useMemo<AccessoryItem[]>(() => {
    // 1. Explicitly configured accessories on family (from CMS)
    if (Array.isArray(family.accessories) && family.accessories.length > 0) {
      return family.accessories.filter(item => {
        if (!item) return false;
        return Boolean(
          item.modelNumber ||
          item.modelNo ||
          item.mmCode ||
          item.name ||
          item.title ||
          item.description ||
          item.colour ||
          item.product ||
          item.image
        );
      });
    }

    // 2. Secondary fallback: check products for standard_accessories / optional_accessories
    const extracted: AccessoryItem[] = [];
    const seen = new Set<string>();

    (family.products || []).forEach((prod: any) => {
      if (!prod || !prod.specifications) return;
      const opt = prod.specifications.optional_accessories;
      const std = prod.specifications.standard_accessories;

      [opt, std].forEach(val => {
        if (!val || typeof val !== 'string') return;
        const trimmed = val.trim();
        if (!trimmed || trimmed.toUpperCase() === 'N/A') return;

        // Split by common delimiters like /, +, comma
        const tokens = trimmed.split(/[\/,+]/).map(t => t.trim()).filter(Boolean);
        tokens.forEach(tok => {
          const key = tok.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            extracted.push({
              modelNumber: tok,
              name: tok.startsWith('LA') ? `Accessory (${tok})` : tok,
              colour: '—',
            });
          }
        });
      });
    });

    return extracted;
  }, [family.accessories, family.products]);

  const [allSymbolsMap, setAllSymbolsMap] = useState<Record<string, SymbolItem>>(() => {
    const initialMap: Record<string, SymbolItem> = {};
    (family.symbols || []).forEach((s: any) => {
      if (s && typeof s === 'object' && s.id) {
        initialMap[String(s.id)] = s;
      }
    });
    (family.products || []).forEach((p: any) => {
      if (p && typeof p === 'object' && Array.isArray(p.symbols)) {
        p.symbols.forEach((s: any) => {
          if (s && typeof s === 'object' && s.id) {
            initialMap[String(s.id)] = s;
          }
        });
      }
    });
    return initialMap;
  });

  useEffect(() => {
    async function fetchAllSymbols() {
      try {
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        const res = await fetch(`${payloadUrl}/api/symbols?limit=100&depth=2`);
        if (res.ok) {
          const data = await res.json();
          setAllSymbolsMap(prev => {
            const nextMap = { ...prev };
            (data.docs || []).forEach((s: any) => {
              if (s && s.id) {
                nextMap[String(s.id)] = s;
              }
            });
            return nextMap;
          });
        }
      } catch (err) {
        console.error('Error fetching symbols in FamilyDetailClient:', err);
      }
    }
    fetchAllSymbols();
  }, []);

  const resolveSymbol = useCallback((sym: any): SymbolItem | null => {
    if (!sym) return null;
    const symId = typeof sym === 'string' ? sym : (sym.id || sym._id);
    const fromMap = symId ? allSymbolsMap[String(symId)] : null;

    if (typeof sym === 'string') {
      return fromMap || { id: sym, name: sym };
    }

    const iconObj = (sym.icon && typeof sym.icon === 'object' && (sym.icon.url || sym.icon.filename))
      ? sym.icon
      : fromMap?.icon || sym.icon;

    return {
      id: String(sym.id || symId || Math.random()),
      name: sym.name || fromMap?.name || '',
      isHighlighted: sym.isHighlighted ?? fromMap?.isHighlighted ?? false,
      icon: iconObj,
    };
  }, [allSymbolsMap]);

  // Map family products by model number and ID to call back symbols according to product model number
  const productModelSymbolsMap = useMemo(() => {
    const map = new Map<string, SymbolItem[]>();
    (family.products || []).forEach(p => {
      if (p && typeof p === 'object') {
        const syms = (p.symbols || []) as SymbolItem[];
        if (p.name) {
          map.set(p.name.trim().toLowerCase(), syms);
        }
        if (p.id) {
          map.set(String(p.id), syms);
        }
      }
    });
    return map;
  }, [family.products]);

  // Helper to reliably call back symbols according to the model no. of the product
  const getSymbolsForProduct = useCallback((prodOrSku: any): SymbolItem[] => {
    if (!prodOrSku) return [];
    const model = (typeof prodOrSku.product === 'object' ? prodOrSku.product?.name : '') || 
                  prodOrSku.modelNumber || 
                  prodOrSku.name || 
                  '';
    const prodId = typeof prodOrSku.product === 'object' ? prodOrSku.product?.id : (prodOrSku.product || prodOrSku.id);
    
    let matchedSymbols: any[] | undefined;
    if (model && model !== '—') {
      matchedSymbols = productModelSymbolsMap.get(model.trim().toLowerCase());
    }
    if ((!matchedSymbols || matchedSymbols.length === 0) && prodId) {
      matchedSymbols = productModelSymbolsMap.get(String(prodId));
    }
    if (!matchedSymbols || matchedSymbols.length === 0) {
      const parent = typeof prodOrSku.product === 'object' ? prodOrSku.product : null;
      matchedSymbols = parent?.symbols || prodOrSku.symbols || [];
    }
    
    return (matchedSymbols || [])
      .map(resolveSymbol)
      .filter((s): s is SymbolItem => Boolean(s && s.name));
  }, [productModelSymbolsMap, resolveSymbol]);

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
        const response = await fetch(`${payloadUrl}/api/skus?${queryParams}&limit=1000&depth=3`);
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
      colourTemperature: p.colourTemperature || (p as any).colorTemperature || getProductSpec(p, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature']),
      isFallbackProduct: true,
      product: p,
      modelNumber: p.name,
      specifications: p.specifications,
      description: p.description,
      symbols: p.symbols,
    }));

    const combinedSkus = [...skus, ...fallbackSkus];

    combinedSkus.forEach(item => {
      const pwr = getSkuSpec(item, ['power', 'System power', 'wattage', 'on_mode_power_w']);
      const ct = getSkuSpec(item, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature']);
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
      colourTemperature: p.colourTemperature || (p as any).colorTemperature || getProductSpec(p, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature']),
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
      const ct = getSkuSpec(sku, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature']);
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

  const hasAnyProductSymbols = useMemo(() => {
    return (family.products || []).some(p => {
      if (typeof p === 'object' && p !== null && Array.isArray((p as any).symbols) && (p as any).symbols.length > 0) {
        return true;
      }
      return false;
    }) || skus.some(s => {
      const syms = getSymbolsForProduct(s);
      return syms.length > 0;
    });
  }, [family.products, skus, getSymbolsForProduct]);

  const showSymbolsColumn = activeParams.includes('symbols') || hasAnyProductSymbols;

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left Column: Interactive Product Gallery (Sidelite Optical Vibe) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="relative aspect-video w-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                {activeMedia ? (
                  activeMedia.type === 'image' ? (
                    <Image
                      src={getImageUrl(activeMedia)}
                      alt={activeMedia.alt || family.name}
                      fill
                      className="object-contain w-full h-full transition-transform duration-700 hover:scale-102"
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
                      className={`relative aspect-video w-full bg-white border focus:outline-none transition-all cursor-pointer shadow-sm ${activeMediaIndex === idx
                        ? 'border-[#005288] ring-1 ring-[#005288]/30 bg-[#005288]/5'
                        : 'border-gray-250 hover:border-gray-400'
                        }`}
                    >
                      {media.type === 'image' ? (
                        <Image
                          src={getImageUrl(media)}
                          alt={media.alt || ''}
                          fill
                          className="object-contain w-full h-full"
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
                {family.symbols && family.symbols.length > 0 ? (
                  <div className="flex flex-wrap gap-4 items-center">
                    {family.symbols.map((rawSym) => {
                      const symbol = resolveSymbol(rawSym);
                      if (!symbol || !symbol.name) return null;
                      const iconUrl = symbol.icon ? getImageUrl(symbol.icon) : '';
                      const hasValidIcon = !failedImageIds[symbol.id] && iconUrl && iconUrl !== '/placeholder.png';
                      if (hasValidIcon) {
                        return (
                          <div
                            key={symbol.id}
                            className="relative h-12 w-12 md:h-14 md:w-14 flex items-center justify-center transition-transform hover:scale-105"
                            title={symbol.name}
                          >
                            <Image
                              src={iconUrl}
                              alt={symbol.name}
                              fill
                              className="object-contain"
                              unoptimized
                              onError={() => setFailedImageIds(prev => ({ ...prev, [symbol.id]: true }))}
                            />
                          </div>
                        );
                      }
                      return (
                        <span
                          key={symbol.id}
                          className={`px-3 py-1 text-xs md:text-sm font-mono uppercase tracking-wider ${symbol.isHighlighted
                            ? 'text-[#005288] bg-[#005288]/10 font-bold'
                            : 'bg-gray-100 text-gray-700 font-medium'
                            }`}
                          title={symbol.name}
                        >
                          {symbol.name}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex flex-col gap-2.5">
                  <a
                    href="#variants"
                    className="bg-[#005288] hover:bg-[#003c64] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-all duration-300 shadow-sm text-center"
                  >
                    Configure {family.products?.length || 0} Models &darr;
                  </a>
                  {Boolean(family.datasheet?.enabled) && (
                    <Link
                      href={`/families/${family.slug || family.id}/datasheet`}
                      target="_blank"
                      className="bg-white border border-[#005288] text-[#005288] hover:bg-[#005288] hover:text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-all duration-300 shadow-sm inline-flex items-center justify-center gap-2 text-center"
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="text-xs" />
                      Family Datasheet
                    </Link>
                  )}
                </div>
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

            const edTitleColor = resolveTitleColor(block.titleColor, block.titleCustomColor, 'text-gray-900');
            const edTitleSize = resolveTitleSize(block.titleSize, 'text-3xl');
            const edSubColor = resolveSubtitleColor(block.subtitleColor, block.subtitleCustomColor, 'text-[#005288]');
            const edSubSize = resolveSubtitleSize(block.subtitleSize, 'text-[10px]');
            const isEdExplicitColor = block.titleColor && block.titleColor !== 'default';

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
                          <span
                            className={`h-[2px] w-10 ${edSubColor.barClass || ''}`}
                            style={edSubColor.barStyle}
                          />
                          <p
                            className={`${edSubSize} uppercase tracking-[0.25em] font-bold ${edSubColor.className}`}
                            style={edSubColor.style}
                          >
                            {block.subtitle}
                          </p>
                        </div>
                      )}

                      {!block.hideTitle && block.title && (
                        <h2
                          className={`${edTitleSize} font-light uppercase tracking-widest leading-snug ${edTitleColor.className}`}
                          style={edTitleColor.style}
                        >
                          {block.title.split(' ').map((w, idx) => {
                            const isKeyword = w.toLowerCase() === 'technology' || w.toLowerCase() === 'precision';
                            return (
                              <span key={idx} className={isKeyword ? (isEdExplicitColor ? "font-bold" : "font-bold text-[#005288]") : ""}>
                                {w}{' '}
                              </span>
                            );
                          })}
                        </h2>
                      )}

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

            const insTitleColor = resolveTitleColor(block.titleColor, block.titleCustomColor, 'text-gray-900');
            const insTitleSize = resolveTitleSize(block.titleSize, 'text-3xl');
            const insSubColor = resolveSubtitleColor(block.subtitleColor, block.subtitleCustomColor, 'text-[#005288]');
            const insSubSize = resolveSubtitleSize(block.subtitleSize, 'text-[10px]');

            return (
              <section key={`inspiration-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
                <div className="mb-16">
                  {block.subtitle && (
                    <span
                      className={`${insSubSize} font-bold uppercase tracking-[0.25em] mb-2 block ${insSubColor.className}`}
                      style={insSubColor.style}
                    >
                      {block.subtitle}
                    </span>
                  )}
                  {!block.hideTitle && block.title && (
                    <h2
                      className={`${insTitleSize} font-light uppercase tracking-widest ${insTitleColor.className}`}
                      style={insTitleColor.style}
                    >
                      {block.title.split(' ')[0]} <span className="font-bold">{block.title.split(' ').slice(1).join(' ')}</span>
                    </h2>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {projects.map((proj, idx) => {
                    const imageUrl = getImageUrl(proj.listImage || proj.bannerImage || proj.images);

                    return (
                      <div key={proj.id || idx} className="flex flex-col gap-6 group">
                        <Link href={`/projects/${proj.slug}`} className="block">
                          <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 cursor-pointer flex items-center justify-center">
                            <Image
                              src={imageUrl}
                              alt={proj.title}
                              fill
                              quality={95}
                              className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-102 sharpen-media"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
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

            const hpTitleColor = resolveTitleColor(block.titleColor, block.titleCustomColor, 'text-gray-900');
            const hpTitleSize = resolveTitleSize(block.titleSize, 'text-3xl');
            const hpSubColor = resolveSubtitleColor(block.subtitleColor, block.subtitleCustomColor, 'text-[#005288]');
            const hpSubSize = resolveSubtitleSize(block.subtitleSize, 'text-[10px]');

            return (
              <section key={`highlights-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200 bg-[#fafafa]/50">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div>
                    {block.subtitle && (
                      <span
                        className={`${hpSubSize} font-bold uppercase tracking-[0.25em] mb-2 block ${hpSubColor.className}`}
                        style={hpSubColor.style}
                      >
                        {block.subtitle}
                      </span>
                    )}
                    {!block.hideTitle && block.title && (
                      <h2
                        className={`${hpTitleSize} font-light uppercase tracking-widest ${hpTitleColor.className}`}
                        style={hpTitleColor.style}
                      >
                        {block.title.split(' ')[0]} <span className="font-bold">{block.title.split(' ').slice(1).join(' ')}</span>
                      </h2>
                    )}
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
                    const firstFamilyShot = (family.media || []).find((m: any) => {
                      if (!m) return false;
                      if (m.type === 'video') return false;
                      if (m.mimeType && typeof m.mimeType === 'string' && !m.mimeType.startsWith('image/')) return false;
                      return Boolean(m.url || m.filename || (typeof m === 'string' && m.trim().length > 0));
                    }) || (family.media && family.media.length > 0 ? family.media[0] : null);

                    const imageItem = p.images || firstFamilyShot;
                    let imageUrl = getImageUrl(imageItem);
                    if (!imageUrl || imageUrl === '/placeholder.png') {
                      if (firstFamilyShot) {
                        imageUrl = getImageUrl(firstFamilyShot);
                      }
                    }
                    const familyId = p.families?.slug || p.families?.id || p.families;

                    return (
                      <div
                        key={p.id || idx}
                        className="bg-white border border-gray-200 rounded-none overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0 w-[290px] md:w-[340px] snap-start"
                      >
                        <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                          {imageUrl && imageUrl !== '/placeholder.png' ? (
                            <Image
                              src={imageUrl}
                              alt={p.name}
                              fill
                              quality={95}
                              className="object-contain w-full h-full sharpen-media"
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
                  <option value="All">All Voltages (V)</option>
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
                    {activeParams.includes('mmCode') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('MM Code')}</th>}
                    {activeParams.includes('modelNo') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Model No.')}</th>}
                    {activeParams.includes('colour') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Finish / Colour')}</th>}
                    {activeParams.includes('wattage') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Power (W)', true)}</th>}
                    {activeParams.includes('luminousFlux') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Luminous Flux (lm)', true)}</th>}
                    {activeParams.includes('colourTemperature') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('CCT (K)', true)}</th>}
                    {activeParams.includes('cri') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('CRI (Ra)', true)}</th>}
                    {activeParams.includes('efficacy') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Efficacy (lm/W)', true)}</th>}
                    {activeParams.includes('beamAngle') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Beam Angle (°)', true)}</th>}
                    {activeParams.includes('ip') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('IP', true)}</th>}
                    {activeParams.includes('ik') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('IK Rating', true)}</th>}
                    {activeParams.includes('length') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Length (mm)', true)}</th>}
                    {activeParams.includes('width') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Width (mm)', true)}</th>}
                    {activeParams.includes('height') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Height (mm)', true)}</th>}
                    {activeParams.includes('diameter') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Diameter (mm)', true)}</th>}
                    {activeParams.includes('dimensions') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Dimensions (mm)', true)}</th>}
                    {activeParams.includes('recessedCutOut') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Cut-out (mm)', true)}</th>}
                    {activeParams.includes('weight') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Weight (g)', true)}</th>}
                    {activeParams.includes('connector') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Control Gear', true)}</th>}
                    {activeParams.includes('lampBase') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Lamp Base', true)}</th>}
                    {activeParams.includes('voltage') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Voltage (V)', true)}</th>}
                    {activeParams.includes('inrushCurrent') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Inrush Current (A)', true)}</th>}
                    {activeParams.includes('inrushDuration') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Inrush Duration (µs)', true)}</th>}
                    {activeParams.includes('maxNoOfLuminaire') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Max. Luminaires on MCB', true)}</th>}
                    {activeParams.includes('mcbB10') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('MCB B10', true)}</th>}
                    {activeParams.includes('mcbB16') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('MCB B16', true)}</th>}
                    {activeParams.includes('mcbC10') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('MCB C10', true)}</th>}
                    {activeParams.includes('mcbC16') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('MCB C16', true)}</th>}
                    {activeParams.includes('thd') && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('THD (%)', true)}</th>}
                    {showSymbolsColumn && <th className="sticky top-[68px] lg:top-[76px] z-30 bg-gray-100 py-3 px-4 text-center border-b border-gray-300 shadow-sm whitespace-nowrap align-bottom">{renderParamHeader('Features', true)}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-black font-normal">
                  {filteredSkus.map((sku, modelIndex) => {
                    const parent = typeof sku.product === 'object' && sku.product !== null ? sku.product : null;
                    const mmCode = sku.name;
                    const modelNo = getSkuSpec(sku, ['customer_model_no_new', 'model_number', 'yk_model_no', 'model_identifier', 'modelNo'], parent?.name || sku.modelNumber || '—');
                    // Call back symbols according to the model no. of the product
                    const productSymbols = getSymbolsForProduct(sku);

                    const isEvenModel = modelIndex % 2 === 0;
                    const modelBgClass = isEvenModel ? 'bg-white' : 'bg-[#f4f8fc]';
                    const modelHoverClass = isEvenModel ? 'hover:bg-blue-50/50' : 'hover:bg-blue-100/40';

                    const color = getSkuSpec(sku, ['fitting_colour', 'colour', 'color', 'luminaires_color'], '—');
                    const power = getSkuSpec(sku, ['on_mode_power_w', 'power', 'System power', 'wattage'], '—');
                    const flux = getSkuSpec(sku, ['total_luminous_flux_lm', 'useful_luminous_flux_lm', 'luminousFlux', 'Luminous flux', 'flux', 'lumens'], '—');
                    const cct = getSkuSpec(sku, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature'], '—');
                    const cri = getSkuSpec(sku, ['ra', 'cri', 'CRI', 'Colour rendering index'], '—');
                    const ip = formatIpRating(getSkuSpec(sku, ['ip', 'ipRating', 'IP rating', 'IP Rating', 'ip_rating'], '—'));
                    const control = getSkuSpec(sku, ['control_gear', 'driver_type', 'driver_model', 'dimming_type', 'type_terminal block', 'controlGear', 'connector'], '—');

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
                          if (efficacy !== '—' && efficacy.includes('@')) {
                            efficacy = getFluxForCct(efficacy, subCct, cctIndex, allCcts.length);
                          }

                          if (efficacy === '—' && fluxParts.length > 0 && powerParts.length > 0) {
                            const efficacies = fluxParts.map((f, idx) => {
                              const p = powerParts[idx] || powerParts[0];
                              const numF = parseInt(f);
                              const numP = parseFloat(p);
                              return (!isNaN(numF) && !isNaN(numP) && numP > 0) ? Math.round(numF / numP) : null;
                            }).filter(val => val !== null) as number[];

                            if (efficacies.length > 1) {
                              const uniqueEff = Array.from(new Set(efficacies));
                              efficacy = uniqueEff.length === 1 ? `${uniqueEff[0]}` : efficacies.join('/');
                            } else if (efficacies.length === 1) {
                              efficacy = `${efficacies[0]}`;
                            }
                          }
                          if (efficacy !== '—') {
                            efficacy = efficacy.replace(/\s*(?:lm\/w|lmw)\b/gi, '').trim();
                          }
                          efficacy = roundEfficacyToWholeNumber(efficacy);

                          const isFirst = i === 0;

                          return (
                            <tr
                              key={`${sku.id}-sub-${subCct}`}
                              onClick={() => handleOpenProduct(sku)}
                              className={`text-xs md:text-sm font-normal text-black ${modelBgClass} ${modelHoverClass} cursor-pointer transition-all duration-150 border-b border-gray-200/70`}
                            >
                              {activeParams.includes('mmCode') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {mmCode}
                                </td>
                              )}
                              {activeParams.includes('modelNo') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 font-sans font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {modelNo}
                                </td>
                              )}
                              {activeParams.includes('colour') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {color}
                                </td>
                              )}
                              {activeParams.includes('wattage') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {power}
                                </td>
                              )}
                              {activeParams.includes('luminousFlux') && (
                                <td className="py-2.5 px-4 text-center font-normal text-black whitespace-nowrap">
                                  {subFlux}
                                </td>
                              )}
                              {activeParams.includes('colourTemperature') && (
                                <td className="py-2.5 px-4 text-center font-normal text-black whitespace-nowrap">
                                  {subCct}
                                </td>
                              )}
                              {activeParams.includes('cri') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {cri}
                                </td>
                              )}
                              {activeParams.includes('efficacy') && (
                                <td className="py-2.5 px-4 text-center font-normal text-black whitespace-nowrap">
                                  {efficacy}
                                </td>
                              )}
                              {activeParams.includes('beamAngle') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {formatBeamAngle(getSkuSpec(sku, ['beam_angle', 'beamAngle', 'beam_angle_deg'], '—'))}
                                </td>
                              )}
                              {activeParams.includes('ip') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {ip}
                                </td>
                              )}
                              {activeParams.includes('ik') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['ik', 'ikRating', 'ik_rating'], '—')}
                                </td>
                              )}
                              {activeParams.includes('length') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['length_mm', 'length'], '—').replace(/\s*\(?mm\)?\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('width') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['width_mm', 'width', 'width_w', 'light_source_outer_dimensions_width_mm'], '—').replace(/\s*\(?mm\)?\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('height') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['height_mm', 'height', 'height_h', 'depth_mm', 'depth_d', 'light_source_outer_dimensions_high_mm'], '—').replace(/\s*\(?mm\)?\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('diameter') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['diameter_mm', 'diameter'], '—').replace(/\s*\(?mm\)?\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('dimensions') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['dimensions', 'dimension_mm'], '—').replace(/\s*\(?mm\)?\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('recessedCutOut') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['recessed_cut_out_mm', 'recessed_cut_out', 'cut_out_mm'], '—').replace(/\s*mm\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('weight') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['net_weight_g', 'weight'], '—').replace(/\s*g\b/gi, '').trim()}
                                </td>
                              )}
                              {activeParams.includes('connector') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {control}
                                </td>
                              )}
                              {activeParams.includes('lampBase') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['cap_type', 'lamp_holder_type', 'lamp_source', 'lampBase'], '—')}
                                </td>
                              )}
                              {activeParams.includes('voltage') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getSkuSpec(sku, ['rated_voltage_v', 'voltage', 'Voltage'], '—')}
                                </td>
                              )}
                              {activeParams.includes('inrushCurrent') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['inrush_current_a', 'inrushCurrent']) ? `${getRawSkuSpec(sku, ['inrush_current_a', 'inrushCurrent'])} A` : '—'}
                                </td>
                              )}
                              {activeParams.includes('inrushDuration') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['inrush_current_duration_uS', 'inrushDuration']) ? `${getRawSkuSpec(sku, ['inrush_current_duration_uS', 'inrushDuration'])} μs` : '—'}
                                </td>
                              )}
                              {activeParams.includes('maxNoOfLuminaire') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['max_no_lum', 'maxNoOfLuminaire']) || '—'}
                                </td>
                              )}
                              {activeParams.includes('mcbB10') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['mcb_b10', 'mcbB10']) || '—'}
                                </td>
                              )}
                              {activeParams.includes('mcbB16') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['mcb_b16', 'mcbB16']) || '—'}
                                </td>
                              )}
                              {activeParams.includes('mcbC10') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['mcb_c10', 'mcbC10']) || '—'}
                                </td>
                              )}
                              {activeParams.includes('mcbC16') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['mcb_c16', 'mcbC16']) || '—'}
                                </td>
                              )}
                              {activeParams.includes('thd') && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black font-sans align-middle ${modelBgClass} whitespace-nowrap`}>
                                  {getRawSkuSpec(sku, ['thd']) ? (getRawSkuSpec(sku, ['thd']).includes('%') ? getRawSkuSpec(sku, ['thd']) : `${getRawSkuSpec(sku, ['thd'])}%`) : '—'}
                                </td>
                              )}
                              {showSymbolsColumn && isFirst && (
                                <td rowSpan={N} className={`py-2.5 px-4 text-center font-normal text-black align-middle ${modelBgClass}`}>
                                  {productSymbols && productSymbols.length > 0 ? (
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[70px]">
                                      {productSymbols.map((symbol) => {
                                        const iconUrl = symbol.icon ? getImageUrl(symbol.icon) : '';
                                        const hasValidIcon = !failedImageIds[symbol.id] && iconUrl && iconUrl !== '/placeholder.png';
                                        if (hasValidIcon) {
                                          return (
                                            <div
                                              key={symbol.id}
                                              className="relative h-6 w-10 bg-white flex items-center justify-center p-0.5 shadow-xs border border-gray-200 rounded hover:border-[#005288]/40 transition-colors"
                                              title={symbol.name}
                                            >
                                              <Image
                                                src={iconUrl}
                                                alt={symbol.name}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                                onError={() => setFailedImageIds(prev => ({ ...prev, [symbol.id]: true }))}
                                              />
                                            </div>
                                          );
                                        }
                                        return (
                                          <span
                                            key={symbol.id}
                                            className={`border px-1.5 py-0.5 text-[9px] font-mono leading-tight whitespace-nowrap rounded font-normal text-black ${symbol.isHighlighted
                                              ? 'border-[#005288]/30 bg-[#005288]/5'
                                              : 'border-gray-200 bg-gray-50'
                                              }`}
                                            title={symbol.name}
                                          >
                                            {symbol.name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-black font-normal">—</span>
                                  )}
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

          {/* Table disclaimer / footnote */}
          <p className="mt-4 text-xs text-gray-500 font-sans">
            Rated values are based on average performance, individual products will vary.
          </p>

          {/* ACCESSORIES TABLE (Rendered below technical configurations if accessories exist) */}
          {accessoriesList.length > 0 && (
            <div id="accessories" className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl uppercase tracking-widest text-gray-900 font-light flex items-center gap-2.5">
                    ACCESSORIES
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">
                    Optional and compatible accessories for the {family.name} series.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] font-mono text-gray-600 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005288]"></span>
                  <span>{accessoriesList.length} {accessoriesList.length === 1 ? 'Accessory' : 'Accessories'}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 shadow-xs bg-white">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-700 font-sans font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 w-20 text-center">Image</th>
                      <th className="py-3 px-4 min-w-[140px]">Model No.</th>
                      <th className="py-3 px-4 min-w-[120px]">MM Code</th>
                      <th className="py-3 px-6 min-w-[240px]">Description</th>
                      <th className="py-3 px-4 min-w-[100px]">Colour</th>
                      <th className="py-3 px-4 w-28 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {accessoriesList.map((acc, index) => {
                      const modelNo = acc.modelNumber || acc.modelNo || (typeof acc.product === 'object' ? acc.product?.name : '') || '—';
                      const mmCode = acc.mmCode || '—';
                      const title = acc.name || acc.title || (typeof acc.product === 'object' ? acc.product?.description : '') || '—';
                      const description = acc.description || '';
                      const colour = acc.colour || acc.color || (typeof acc.product === 'object' ? acc.product?.colour : '') || '—';

                      const rawImage = acc.image || (typeof acc.product === 'object' ? acc.product?.images : null);
                      const imgUrl = rawImage ? getImageUrl(rawImage) : '';
                      const hasValidImg = Boolean(imgUrl && imgUrl !== '/placeholder.png');

                      const linkedProduct = typeof acc.product === 'object' && acc.product ? acc.product : null;

                      return (
                        <tr
                          key={acc.id || `acc-${index}-${modelNo}`}
                          className="hover:bg-blue-50/40 transition-colors duration-150 group"
                        >
                          {/* Image Thumbnail */}
                          <td className="py-3 px-4 text-center align-middle">
                            {hasValidImg ? (
                              <button
                                type="button"
                                onClick={() => setPreviewAccessoryImage({ url: imgUrl, title: `${modelNo} ${title !== '—' ? `- ${title}` : ''}` })}
                                className="relative w-12 h-12 mx-auto bg-gray-50 border border-gray-200 rounded p-1 overflow-hidden group-hover:border-[#005288]/40 transition-all hover:scale-105 cursor-zoom-in block"
                                title="Click to view full image"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={title || modelNo}
                                  fill
                                  sizes="48px"
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </button>
                            ) : (
                              <div className="w-12 h-12 mx-auto bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 group-hover:text-[#005288] transition-colors">
                                <FontAwesomeIcon icon={faCogs} className="text-sm opacity-60" />
                              </div>
                            )}
                          </td>

                          {/* Model No. */}
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900 align-middle whitespace-nowrap">
                            <span className="tracking-tight">{modelNo}</span>
                          </td>

                          {/* MM Code */}
                          <td className="py-3 px-4 font-mono text-gray-700 align-middle whitespace-nowrap">
                            {mmCode !== '—' ? (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[11px] font-mono border border-gray-200/60">
                                {mmCode}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="py-3 px-6 font-sans text-gray-800 align-middle">
                            <div className="font-medium text-[13px] leading-snug">{title}</div>
                            {description && (
                              <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {description}
                              </div>
                            )}
                          </td>

                          {/* Colour */}
                          <td className="py-3 px-4 font-sans text-gray-700 align-middle whitespace-nowrap">
                            {colour !== '—' ? (
                              <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                                {colour}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                            {linkedProduct ? (
                              <button
                                type="button"
                                onClick={() => handleOpenProduct(linkedProduct)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#005288] hover:bg-[#003e66] text-white text-[11px] font-sans font-medium rounded transition-all shadow-xs"
                              >
                                <span>Details</span>
                                <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                              </button>
                            ) : hasValidImg ? (
                              <button
                                type="button"
                                onClick={() => setPreviewAccessoryImage({ url: imgUrl, title: `${modelNo} ${title !== '—' ? `- ${title}` : ''}` })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-sans border border-gray-300 rounded transition-all"
                              >
                                <FontAwesomeIcon icon={faSearch} className="text-[10px] text-gray-500" />
                                <span>Preview</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                    {(() => {
                      const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                      const isMmCode = /^MM\d+/i.test(activeDrawerProduct.name);
                      const mmCode = isMmCode ? activeDrawerProduct.name : (activeDrawerProduct.isFallbackProduct ? '—' : (activeDrawerProduct.mmCode || '—'));
                      const modelNo = getSkuSpec(activeDrawerProduct, ['customer_model_no_new', 'model_number', 'yk_model_no', 'model_identifier', 'modelNo'], parent?.name || activeDrawerProduct.modelNumber || (!isMmCode ? activeDrawerProduct.name : '—'));

                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {mmCode && mmCode !== '—' && (
                              <span className="text-[10px] font-mono font-bold bg-[#005288]/10 text-[#005288] px-2 py-0.5 rounded tracking-wider uppercase">
                                MM CODE: {mmCode}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl uppercase tracking-widest font-light text-gray-900 font-sans">
                            {modelNo && modelNo !== '—' ? modelNo : activeDrawerProduct.name}
                          </h3>
                        </div>
                      );
                    })()}

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
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeModalTab === 'overview'
                        ? 'border-[#005288] text-[#005288]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveModalTab('technical')}
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeModalTab === 'technical'
                        ? 'border-[#005288] text-[#005288]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      <FontAwesomeIcon icon={faCogs} />
                      Technical Data
                    </button>
                    <button
                      onClick={() => setActiveModalTab('photometrics')}
                      className={`py-4 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeModalTab === 'photometrics'
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

                          // Default to the first product shot of the family to save uploading time
                          const firstFamilyProductShot = (family.media || []).find((m: any) => {
                            if (!m) return false;
                            if (m.type === 'video') return false;
                            if (m.mimeType && typeof m.mimeType === 'string' && !m.mimeType.startsWith('image/')) return false;
                            return Boolean(m.url || m.filename || (typeof m === 'string' && m.trim().length > 0));
                          }) || (family.media && family.media.length > 0 ? family.media[0] : null);

                          // Use the parent model No.'s image or SKU image if available; otherwise default to family's first product shot
                          const candidateImage = parent?.images || activeDrawerProduct.images;
                          const candidateUrl = candidateImage ? getImageUrl(candidateImage) : '';
                          const finalImageUrl = (candidateUrl && candidateUrl !== '/placeholder.png')
                            ? candidateUrl
                            : (firstFamilyProductShot ? getImageUrl(firstFamilyProductShot) : '');
                          const hasValidImage = Boolean(finalImageUrl && finalImageUrl !== '/placeholder.png');

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                              <div className="md:col-span-5 flex flex-col space-y-4">
                                <div className="relative aspect-square w-full bg-gray-50 border border-gray-200 rounded-none overflow-hidden flex items-center justify-center shadow-sm">
                                  {hasValidImage ? (
                                    <Image
                                      src={finalImageUrl}
                                      alt={activeDrawerProduct.name || family.name}
                                      fill
                                      className="object-contain w-full h-full"
                                      unoptimized
                                    />
                                  ) : (
                                    <FontAwesomeIcon icon={faLightbulb} className="text-gray-300 text-4xl" />
                                  )}
                                </div>
                                {/* Line Drawing / Dimensional Outline Box (Hidden if no file uploaded) */}
                                {(() => {
                                  // Line drawing defaults to the family's default line drawing if not specified on the product
                                  const rawLineDrawing = activeDrawerProduct.lineDrawing || parent?.lineDrawing || family?.lineDrawing;
                                  const lineDrawingFile = (rawLineDrawing && (typeof rawLineDrawing === 'string' ? rawLineDrawing.trim().length > 0 : Boolean(rawLineDrawing.url || rawLineDrawing.filename))) ? rawLineDrawing : null;
                                  if (!lineDrawingFile) return null;

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
                                        <img
                                          src={getImageUrl(lineDrawingFile)}
                                          alt="Line Drawing"
                                          className="max-h-full max-w-full object-contain"
                                        />
                                      </div>

                                      <div className="w-full flex items-center justify-between mt-2 text-[8px] font-mono text-gray-400">
                                        <span>{lineDrawingFile.filename || 'Uploaded File'}</span>
                                        <button
                                          onClick={() => handleDownloadFile(lineDrawingFile, 'Line Drawing')}
                                          className="inline-flex items-center gap-1 font-bold text-[#005288] hover:underline cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faDownload} className="text-[8px]" />
                                          <span>Download</span>
                                        </button>
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

                                {/* Product Symbols & Certifications */}
                                {(() => {
                                  const drawerSymbols = getSymbolsForProduct(activeDrawerProduct);
                                  if (!drawerSymbols || drawerSymbols.length === 0) return null;
                                  return (
                                    <div className="pt-4 border-t border-gray-200 space-y-2">
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] font-sans">
                                        Certifications & Features
                                      </h4>
                                      <div className="flex flex-wrap gap-3 items-center">
                                        {drawerSymbols.map((symbol) => {
                                          const iconUrl = symbol.icon ? getImageUrl(symbol.icon) : '';
                                          const hasValidIcon = !failedImageIds[symbol.id] && iconUrl && iconUrl !== '/placeholder.png';
                                          if (hasValidIcon) {
                                            return (
                                              <div
                                                key={symbol.id}
                                                className="relative h-10 w-10 md:h-11 md:w-11 flex items-center justify-center transition-transform hover:scale-105"
                                                title={symbol.name}
                                              >
                                                <Image
                                                  src={iconUrl}
                                                  alt={symbol.name}
                                                  fill
                                                  className="object-contain"
                                                  unoptimized
                                                  onError={() => setFailedImageIds(prev => ({ ...prev, [symbol.id]: true }))}
                                                />
                                              </div>
                                            );
                                          }
                                          return (
                                            <span
                                              key={symbol.id}
                                              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${symbol.isHighlighted
                                                ? 'text-[#005288] bg-[#005288]/10 font-bold'
                                                : 'bg-gray-100 text-gray-700 font-medium'
                                                }`}
                                              title={symbol.name}
                                            >
                                              {symbol.name}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    )}

                    {/* TAB 2: TECHNICAL DATA (Detailed parameters) */}
                    {activeModalTab === 'technical' && (
                      <div className="space-y-6 animate-fade-in font-mono text-[11px] text-gray-700">
                        {(() => {
                          const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;
                          const isMmCode = /^MM\d+/i.test(activeDrawerProduct.name);
                          const mmCode = isMmCode ? activeDrawerProduct.name : (activeDrawerProduct.isFallbackProduct ? '—' : (activeDrawerProduct.mmCode || '—'));
                          const modelNo = getSkuSpec(activeDrawerProduct, ['customer_model_no_new', 'model_number', 'yk_model_no', 'model_identifier', 'modelNo'], parent?.name || activeDrawerProduct.modelNumber || (!isMmCode ? activeDrawerProduct.name : '—'));
                          const rawPower = getSkuSpec(activeDrawerProduct, ['power', 'wattage', 'on_mode_power_w', 'light_source_on_mode_power_w'], '—');
                          const rawCurrent = getSkuSpec(activeDrawerProduct, ['input_current_ma', 'input_current', 'light_source_input_current_ma'], '—');
                          const formattedCurrent = formatCurrent(rawCurrent, rawPower);

                          const rawCct = getSkuSpec(activeDrawerProduct, ['correlated_colour_temperature', 'cct_k', 'colourTemperature', 'Color Temperature', 'CCT', 'colour_temperature'], '—');
                          const formattedCct = formatCctDisplay(rawCct);

                          const rawFlux = getSkuSpec(activeDrawerProduct, ['total_luminous_flux_lm', 'total_luminous_flux', 'useful_luminous_flux_lm', 'useful_luminous_flux', 'flux', 'lumens', 'light_source_useful_luminous_flux_lm'], '—');
                          const formattedFlux = formatMultiCondition(rawFlux);

                          const rawEfficacy = getSkuSpec(activeDrawerProduct, ['total_mains_efficacy_lmw', 'efficacy', 'luminous_efficacy'], '');
                          let efficacyVal = rawEfficacy;
                          if (!efficacyVal || efficacyVal === '—') {
                            const numFlux = parseInt(rawFlux);
                            const numPower = parseFloat(rawPower);
                            if (!isNaN(numFlux) && !isNaN(numPower) && numPower > 0) {
                              efficacyVal = `${Math.round(numFlux / numPower)}`;
                            } else {
                              efficacyVal = '—';
                            }
                          } else {
                            efficacyVal = efficacyVal.replace(/\s*(?:lm\/w|lmw)\b/gi, '').trim();
                            efficacyVal = roundEfficacyToWholeNumber(efficacyVal);
                            efficacyVal = formatMultiCondition(efficacyVal);
                          }

                          const diamVal = getSkuSpec(activeDrawerProduct, ['diameter_mm', 'diameter'], '—');
                          const widthVal = getSkuSpec(activeDrawerProduct, ['width_mm', 'width'], '—');
                          const heightVal = getSkuSpec(activeDrawerProduct, ['height_mm', 'height', 'depth_mm'], '—');
                          const lengthVal = getSkuSpec(activeDrawerProduct, ['length_mm', 'length'], '—');
                          const cutOutVal = getSkuSpec(activeDrawerProduct, ['recessed_cut_out_mm', 'recessed_cut_out', 'cut_out_mm'], '—');

                          const dimensionRows = [
                            ...(diamVal !== '—' ? [{ label: 'Diameter (mm)', value: diamVal }] : []),
                            ...(lengthVal !== '—' ? [{ label: 'Length (mm)', value: lengthVal }] : []),
                            ...(widthVal !== '—' ? [{ label: 'Width (mm)', value: widthVal }] : []),
                            ...(heightVal !== '—' ? [{ label: 'Height (mm)', value: heightVal }] : []),
                            ...(cutOutVal !== '—' ? [{ label: 'Cut-out (mm)', value: cutOutVal }] : [])
                          ];
                          if (dimensionRows.length === 0) {
                            dimensionRows.push(
                              { label: 'Diameter (mm)', value: diamVal },
                              { label: 'Width (mm)', value: widthVal },
                              { label: 'Height (mm)', value: heightVal }
                            );
                          }

                          const drawerSymbols = getSymbolsForProduct(activeDrawerProduct);

                          return (
                            <>
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
                                        { label: 'Current (mA)', value: formattedCurrent },
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
                                        { label: 'Model No.', value: modelNo },
                                        { label: 'MM Code', value: mmCode },
                                        { label: 'Product Wattage (W)', value: rawPower },
                                        { label: 'Lamp Base / Light Source', value: getSkuSpec(activeDrawerProduct, ['cap_type', 'lamp_holder_type', 'lamp_source', 'lampBase', 'lamp_base', 'luminaire_category', 'base'], '—') },
                                        { label: 'Equivalent Wattage (W)', value: getSkuSpec(activeDrawerProduct, ['equivalent_power_w', 'equivalent_power', 'equivalent_wattage'], '—') },
                                        { label: 'Colour Temperature (K)', value: formattedCct },
                                        { label: 'Colour Render Index (Ra)', value: getSkuSpec(activeDrawerProduct, ['cri', 'CRI', 'ra', 'colour_rendering_index', 'color_rendering_index'], '—') },
                                        { label: 'Colour Consistency (SDCM)', value: getSkuSpec(activeDrawerProduct, ['colour_consistency', 'color_consistency', 'sdcm'], '—') },
                                        { label: 'Beam Angle (°)', value: formatBeamAngle(getSkuSpec(activeDrawerProduct, ['beam_angle', 'beamAngle', 'beam_angle_deg'], '—')) },
                                        { label: 'IP Rating', value: formatIpRating(getSkuSpec(activeDrawerProduct, ['ip', 'ipRating', 'IP rating', 'IP Rating', 'ip_rating'], '—')) },
                                        { label: 'IK Rating', value: getSkuSpec(activeDrawerProduct, ['ik', 'ikRating', 'ik_rating'], '—') },
                                        { label: 'Control Gear', value: getSkuSpec(activeDrawerProduct, ['control_gear', 'driver_type', 'driver_model', 'dimming_type', 'type_terminal block', 'controlGear', 'connector'], '—') },
                                        { label: 'Dimmable', value: getSkuSpec(activeDrawerProduct, ['dimmable', 'light_source_dimmable'], '—') },
                                        { label: 'Operating Temperature (°C)', value: formatOperatingTemp(getSkuSpec(activeDrawerProduct, ['operating_temperature', 'temperature_of_ambient'], '—')) },
                                        { label: 'Switching Cycles (times)', value: formatSwitchingCycles(getSkuSpec(activeDrawerProduct, ['switching_cycles', 'switching_Cycles'], '')) },
                                        { label: 'Weight (g)', value: getSkuSpec(activeDrawerProduct, ['net_weight_g', 'net_weight', 'weight'], '—') },
                                        { label: 'Application', value: getSkuSpec(activeDrawerProduct, ['application', 'intended_use'], '—') }
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

                              {/* Symbols & Certifications */}
                              {drawerSymbols && drawerSymbols.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                                    Features & Certifications
                                  </h4>
                                  <div className="py-2 flex flex-wrap items-center gap-3">
                                    {drawerSymbols.map(symbol => {
                                      const iconUrl = symbol.icon ? getImageUrl(symbol.icon) : '';
                                      const hasValidIcon = !failedImageIds[symbol.id] && iconUrl && iconUrl !== '/placeholder.png';
                                      if (hasValidIcon) {
                                        return (
                                          <div key={symbol.id} className="relative h-9 w-9 md:h-10 md:w-10 flex items-center justify-center transition-transform hover:scale-105" title={symbol.name}>
                                            <Image src={iconUrl} alt={symbol.name} fill className="object-contain" unoptimized onError={() => setFailedImageIds(prev => ({ ...prev, [symbol.id]: true }))} />
                                          </div>
                                        );
                                      }
                                      return (
                                        <span key={symbol.id} className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider ${symbol.isHighlighted ? 'text-[#005288] bg-[#005288]/10 font-bold' : 'bg-gray-100 text-gray-700 font-medium'}`} title={symbol.name}>
                                          {symbol.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Table 3: Performance Data */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                                  Performance Data
                                </h4>
                                <div className="border border-gray-250 overflow-hidden shadow-sm">
                                  <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-gray-150 bg-white">
                                      {[
                                        { label: 'Total Luminous Flux (lm)', value: formattedFlux },
                                        { label: 'Luminous Efficacy (lm/W)', value: efficacyVal },
                                        { label: 'Rated Life (hrs)', value: getRatedLife(activeDrawerProduct) }
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

                              {/* Table 4: Product Dimensions */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#005288] pb-1 border-b border-gray-200 font-sans">
                                  Product Dimensions
                                </h4>
                                <div className="border border-gray-250 overflow-hidden shadow-sm">
                                  <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-gray-150 bg-white">
                                      {dimensionRows.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                                          <td className="py-2 px-4 font-bold text-gray-500 w-1/2">{row.label}</td>
                                          <td className="py-2 px-4 text-gray-900 font-medium">{row.value}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* TAB 3: PHOTOMETRICS (Vector light curves & CADs) */}
                    {activeModalTab === 'photometrics' && (
                      <div className="space-y-8 animate-fade-in">

                        {/* Section 1 & Section 2: Photometrics, CAD, and Technical Documents */}
                        {(() => {
                          const parent = typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product : null;

                          // Helper to check for a valid uploaded media file
                          const isValidFile = (f: any) => Boolean(f && (typeof f === 'string' ? f.trim().length > 0 && f !== '/placeholder.png' : Boolean(f.url || f.filename)));

                          // Spectrum graph defaults to family's default spectrum image if not specified on the product
                          const rawSpectrum = activeDrawerProduct.lightSpectrumGraph 
                            || (activeDrawerProduct as any)?.spectrumImage 
                            || parent?.lightSpectrumGraph 
                            || (parent as any)?.spectrumImage 
                            || family?.lightSpectrumGraph 
                            || (family as any)?.spectrumImage;
                          const spectrumFile = isValidFile(rawSpectrum) ? rawSpectrum : null;

                          const rawPolar = activeDrawerProduct.photometricPolarDiagram || parent?.photometricPolarDiagram;
                          const polarFile = isValidFile(rawPolar) ? rawPolar : null;

                          const rawBeam = activeDrawerProduct.beamAngleDiagram || parent?.beamAngleDiagram;
                          const beamFile = isValidFile(rawBeam) ? rawBeam : null;

                          const hasAnyDiagram = Boolean(spectrumFile || polarFile || beamFile);

                          // CAD / Databases files
                          const rawLdt = activeDrawerProduct.photometryLdt 
                            || (activeDrawerProduct as any)?.photometryLdtZip
                            || parent?.photometryLdt 
                            || (parent as any)?.photometryLdtZip
                            || family?.photometryLdt
                            || (family as any)?.photometryLdtZip;
                          const ldtFile = isValidFile(rawLdt) ? rawLdt : null;

                          const rawIes = activeDrawerProduct.photometryIes 
                            || (activeDrawerProduct as any)?.photometryIesZip
                            || parent?.photometryIes 
                            || (parent as any)?.photometryIesZip
                            || family?.photometryIes
                            || (family as any)?.photometryIesZip;
                          const iesFile = isValidFile(rawIes) ? rawIes : null;

                          const rawLineDrawing = activeDrawerProduct.lineDrawing || parent?.lineDrawing || family?.lineDrawing;
                          const lineDrawingFile = isValidFile(rawLineDrawing) ? rawLineDrawing : null;

                          const hasCadFiles = Boolean(lineDrawingFile || ldtFile || iesFile);

                          // Technical Documents
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

                          const hasTechDocs = Boolean(showControlGearDoc || showContainingProductDoc || showLightSourceDoc);

                          const parentId = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                            ? activeDrawerProduct.id
                            : (typeof activeDrawerProduct.product === 'object' ? activeDrawerProduct.product.id : activeDrawerProduct.product);
                          const skuQuery = activeDrawerProduct.isFallbackProduct || !activeDrawerProduct.product
                            ? ''
                            : `?sku=${activeDrawerProduct.name}`;

                          // If no diagrams, no CAD/LDT/IES files, and no technical documents are available
                          if (!hasAnyDiagram && !hasCadFiles && !hasTechDocs) {
                            return (
                              <div className="py-16 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                                  <FontAwesomeIcon icon={faInfoCircle} className="text-xl" />
                                </div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-600 font-sans">
                                  No Photometrics or CAD Files Available
                                </h5>
                                <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                                  Photometric diagrams, CAD line drawings, and data files have not been uploaded for this model.
                                </p>
                              </div>
                            );
                          }

                          const activeDiagramCount = [spectrumFile, polarFile, beamFile].filter(Boolean).length;

                          return (
                            <>
                              {/* Section 1: Photometric & Technical Diagrams Grid */}
                              {hasAnyDiagram && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] font-sans">
                                      Photometric & Technical Diagrams
                                    </h4>
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                                      Optical Specs & Distribution
                                    </span>
                                  </div>

                                  <div className={`grid grid-cols-1 ${
                                    activeDiagramCount === 1 
                                      ? 'max-w-md' 
                                      : activeDiagramCount === 2 
                                        ? 'md:grid-cols-2' 
                                        : 'md:grid-cols-3'
                                  } gap-4`}>

                                    {/* 1. Light Spectrum Graph */}
                                    {spectrumFile && (
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
                                            <img
                                              src={getImageUrl(spectrumFile)}
                                              alt="Light Spectrum Graph"
                                              className="max-h-full max-w-full object-contain"
                                            />
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                          <span className="text-[8px] font-mono text-gray-400 truncate max-w-[160px]">
                                            {spectrumFile.filename || 'Uploaded File'}
                                          </span>
                                          <button
                                            onClick={() => handleDownloadFile(spectrumFile, 'Light Spectrum Graph')}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline cursor-pointer"
                                          >
                                            <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* 2. Photometric Polar Diagram */}
                                    {polarFile && (
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
                                            <img
                                              src={getImageUrl(polarFile)}
                                              alt="Photometric Polar Diagram"
                                              className="max-h-full max-w-full object-contain"
                                            />
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                          <span className="text-[8px] font-mono text-gray-400 truncate max-w-[160px]">
                                            {polarFile.filename || 'Uploaded File'}
                                          </span>
                                          <button
                                            onClick={() => handleDownloadFile(polarFile, 'Photometric Polar Diagram')}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline cursor-pointer"
                                          >
                                            <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* 3. Beam Angle Diagram */}
                                    {beamFile && (
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
                                            <img
                                              src={getImageUrl(beamFile)}
                                              alt="Beam Angle Diagram"
                                              className="max-h-full max-w-full object-contain"
                                            />
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                          <span className="text-[8px] font-mono text-gray-400 truncate max-w-[160px]">
                                            {beamFile.filename || 'Uploaded File'}
                                          </span>
                                          <button
                                            onClick={() => handleDownloadFile(beamFile, 'Beam Angle Diagram')}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005288] hover:underline cursor-pointer"
                                          >
                                            <FontAwesomeIcon icon={faDownload} className="text-[9px]" />
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              )}

                              {/* Section 2: CAD & Architectural Databases + Technical Documents */}
                              {(hasCadFiles || hasTechDocs) && (
                                <div className={`grid grid-cols-1 ${hasCadFiles && hasTechDocs ? 'md:grid-cols-2' : ''} gap-8 ${hasAnyDiagram ? 'border-t border-gray-200 pt-6' : ''}`}>

                                  {/* CAD & Architectural Databases */}
                                  {hasCadFiles && (
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
                                        CAD & Architectural Databases
                                      </h4>

                                      <div className="grid grid-cols-1 gap-2 text-xs">
                                        {lineDrawingFile && (
                                          <button
                                            onClick={() => handleDownloadFile(lineDrawingFile, 'Dimensional Line Drawing')}
                                            className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                          >
                                            <span>DIMENSIONAL LINE DRAWING [CAD]</span>
                                            <FontAwesomeIcon icon={faDownload} />
                                          </button>
                                        )}
                                        {ldtFile && (
                                          <button
                                            onClick={() => handleDownloadFile(ldtFile, 'Dialux Photometric (LDT)')}
                                            className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                          >
                                            <span>DIALUX PHOTOMETRIC [LDT]{((typeof ldtFile === 'object' && ldtFile?.filename?.toLowerCase().endsWith('.zip')) || (typeof ldtFile === 'string' && ldtFile.toLowerCase().endsWith('.zip'))) ? ' [.ZIP]' : ''}</span>
                                            <FontAwesomeIcon icon={faDownload} />
                                          </button>
                                        )}
                                        {iesFile && (
                                          <button
                                            onClick={() => handleDownloadFile(iesFile, 'IES Data Sheet Calculations (IES)')}
                                            className="w-full flex justify-between items-center p-3 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono cursor-pointer shadow-sm"
                                          >
                                            <span>IES DATA SHEET CALCULATIONS [IES]{((typeof iesFile === 'object' && iesFile?.filename?.toLowerCase().endsWith('.zip')) || (typeof iesFile === 'string' && iesFile.toLowerCase().endsWith('.zip'))) ? ' [.ZIP]' : ''}</span>
                                            <FontAwesomeIcon icon={faDownload} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Technical Documents */}
                                  {hasTechDocs && (
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#005288] pb-2 border-b border-gray-200 font-sans">
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
                                  )}

                                </div>
                              )}
                            </>
                          );
                        })()}

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

      {/* Accessory Image Lightbox Modal */}
      {previewAccessoryImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setPreviewAccessoryImage(null)}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 border border-gray-200 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider font-mono">
                {previewAccessoryImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewAccessoryImage(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-base" />
              </button>
            </div>
            <div className="relative w-full h-80 sm:h-96 bg-gray-50 rounded border border-gray-200 flex items-center justify-center overflow-hidden p-4">
              <Image
                src={previewAccessoryImage.url}
                alt={previewAccessoryImage.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
