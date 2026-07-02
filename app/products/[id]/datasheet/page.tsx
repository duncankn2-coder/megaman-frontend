/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import Image from 'next/image';
import PrintController from './PrintController';

interface Product {
  id: string;
  name: string; // Model Number
  description?: string;
  colour?: string;
  power?: string;
  colourTemperature?: string;
  images?: { url: string; alt?: string; filename?: string } | string | null;
  specifications?: Record<string, any> | null;
  families?: {
    id: string;
    name: string;
    description?: string;
    features?: { id?: string; feature: string }[];
    applications?: { id?: string; application: string }[];
    media?: { url: string; alt?: string; filename?: string }[];
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sku?: string }>;
}

interface SKU {
  id: string;
  name: string; // MM Code
  modelNumber?: string;
  colour?: string;
  specialFeatures?: string;
  wattage?: string;
  lampBase?: string;
  colourTemperature?: string;
  voltage?: string;
  connector?: string;
  ip?: string;
  eanBarcode?: string;
  innerBoxItf?: string;
  outerBoxItf?: string;
  packingMethod?: string;
  remark?: string;
  optionCode?: string;
  specifications?: Record<string, any> | null;
}

async function getProductSKUs(productId: string): Promise<SKU[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/skus?where[product][equals]=${productId}&limit=100`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch SKUs: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching product SKUs:', error);
    return [];
  }
}


async function getProduct(id: string): Promise<Product | null> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/products/${id}?depth=2`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product for datasheet:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  return {
    title: product ? `Datasheet - ${product.name} | MEGAMAN®` : 'Datasheet | MEGAMAN®',
  };
}

// Global A4 Page Wrapper for strict print formatting
const A4Page = ({ children, pageNumber, totalPages }: { children: React.ReactNode; pageNumber: number; totalPages: number }) => {
  return (
    <div className="relative border border-gray-300 shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:mb-0" 
         style={{ 
           width: '210mm', 
           height: '296.5mm', 
           pageBreakAfter: 'always', 
           boxSizing: 'border-box',
           paddingTop: '9mm',
           paddingLeft: '15mm',
           paddingRight: '15mm',
           paddingBottom: '9mm'
         }}>
      
      {/* Content Area with bottom margin to prevent collision with footer */}
      <div className="h-[238mm] overflow-hidden">
        {children}
      </div>

      {/* Global Footer (absolutely positioned inside the page container) */}
      <footer 
        className="absolute text-[8px] text-gray-400 font-mono border-t border-gray-200 pt-4 z-50"
        style={{
          bottom: '9mm',
          left: '15mm',
          right: '15mm'
        }}
      >
        <div className="grid grid-cols-3 items-end">
          {/* Left: Links & Copyright */}
          <div className="flex flex-col space-y-0.5 text-left">
            <a href="https://www.megaman.cc" target="_blank" rel="noreferrer" className="hover:underline text-[9px] font-semibold text-gray-500 font-sans">www.megaman.cc</a>
            <a href="mailto:info@megaman.cc" className="hover:underline text-[9px] font-semibold text-gray-500 font-sans">info@megaman.cc</a>
            <span className="text-gray-400 mt-1">© Copyright 2026. All rights reserved by MEGAMAN.</span>
          </div>

          {/* Center: Pagination */}
          <div className="text-center">
            <span className="font-bold text-gray-600 text-[10px]">Page {pageNumber} of {totalPages}</span>
          </div>

          {/* Right: Revision controls */}
          <div className="text-right flex flex-col space-y-0.5">
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <span>Version 1.0</span>
            <span className="italic text-[7.5px]">Data subject to change</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Global Document Header component matching layout profile
const DatasheetHeader = ({ familyName, typeName, refCode, specSummaryStr }: { familyName: string; typeName: string; refCode: string; specSummaryStr?: string }) => {
  return (
    <header className="border-b border-[#009fe3] pb-4 mb-6 flex justify-between items-end">
      <div className="flex flex-col text-left">
        <span className="font-light text-2xl tracking-wide text-[#009fe3] uppercase leading-none mb-1 font-sans">{familyName}</span>
        <span className="text-gray-800 text-xs font-medium uppercase font-sans mb-1">{typeName}</span>
        <span className="text-[#009fe3] font-mono text-[10px] tracking-wider uppercase">{refCode}</span>
      </div>
      <div className="text-right flex flex-col items-end">
        {/* MEGAMAN logo block (white on blue) */}
        <div className="bg-[#005288] text-white px-3 py-1 text-sm font-bold uppercase tracking-widest leading-none font-sans mb-1">
          MEGAMAN®
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-500 font-bold block mb-1">
          PRODUCT DATASHEET
        </span>
        {specSummaryStr && (
          <span className="text-[8.5px] font-mono font-bold text-gray-700 block">
            {specSummaryStr}
          </span>
        )}
      </div>
    </header>
  );
};

// Section Divider for specifications tables (Strict Two-Column Grid)
const TechSection = ({ title, specs }: { title: string; specs: { label: string; value: string }[] }) => {
  if (specs.length === 0) return null;
  return (
    <div className="mb-5 print-break-inside-avoid text-left">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-250 pb-1 mb-2 font-sans">
        {title}
      </h4>
      <div className="flex flex-col text-[8.5px] font-sans">
        {specs.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[55%_45%] py-1 border-b border-gray-100 items-baseline">
            <span className="text-gray-500 font-semibold uppercase">{row.label}</span>
            <span className="text-gray-900 font-bold text-left pl-2">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default async function ProductDatasheetPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(resolvedParams.id);
  const skus = await getProductSKUs(resolvedParams.id);

  if (!product) {
    return (
      <div className="p-12 text-center text-red-500 font-mono">
        <h1>Product not found</h1>
        <p>The requested product specifications could not be loaded.</p>
      </div>
    );
  }

  // Determine the selected SKU (defaults to first SKU, or matches search param)
  const selectedSku = resolvedSearchParams.sku 
    ? skus.find(s => s.name === resolvedSearchParams.sku) || skus[0]
    : skus[0];

  // Resolve URLs and fields safely
  const getImageUrl = (image: any): string => {
    if (!image) return '/placeholder.png';
    const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    if (typeof image === 'string') {
      if (image.startsWith('http') || image.startsWith('//')) return image;
      return `${baseUrl}/media/${image}`;
    }
    if (image.url) {
      if (image.url.startsWith('http') || image.url.startsWith('//')) return image.url;
      return `${baseUrl}${image.url.startsWith('/') ? image.url : '/' + image.url}`;
    }
    return '/placeholder.png';
  };

  const getSpec = (specName: string, defaultValue = ''): string => {
    // 1. Try to fetch from selected SKU specifications JSON first
    if (selectedSku?.specifications && selectedSku.specifications[specName] !== undefined && selectedSku.specifications[specName] !== null) {
      return String(selectedSku.specifications[specName]);
    }
    
    // 2. Try to fetch from SKU direct attributes
    if (specName === 'model_identifier' && selectedSku?.name) return selectedSku.name;
    if (specName === 'customer_model_no_new' && selectedSku?.modelNumber) return selectedSku.modelNumber;
    if (specName === 'fitting_colour' && selectedSku?.colour) return selectedSku.colour;
    if (specName === 'colourTemp' && selectedSku?.colourTemperature) return selectedSku.colourTemperature;
    if (specName === 'cct_k' && selectedSku?.colourTemperature) return selectedSku.colourTemperature.replace(/[^\d]/g, '');
    if (specName === 'on_mode_power_w' && selectedSku?.wattage) return selectedSku.wattage;
    if (specName === 'mounting' && selectedSku?.lampBase) return selectedSku.lampBase;
    if (specName === 'ean' && selectedSku?.eanBarcode) return selectedSku.eanBarcode;
    if (specName === 'inner_itf' && selectedSku?.innerBoxItf) return selectedSku.innerBoxItf;
    if (specName === 'outer_itf' && selectedSku?.outerBoxItf) return selectedSku.outerBoxItf;
    if (specName === 'packaging' && selectedSku?.packingMethod) return selectedSku.packingMethod;

    // 3. Fallback to product specifications JSON (legacy format)
    if (product.specifications && product.specifications[specName] !== undefined && product.specifications[specName] !== null) {
      return String(product.specifications[specName]);
    }
    if (specName === 'power' && product.power) return product.power;
    if (specName === 'colourTemperature' && product.colourTemperature) return product.colourTemperature;
    if (specName === 'colour' && product.colour) return product.colour;
    return defaultValue;
  };

  // Header tracking variables
  const familyName = product.families?.name || getSpec('series_name') || 'MEGAMAN® SERIES';
  const typeName = getSpec('product_type') || 'LED Luminaire';
  const refCode = product.name || selectedSku?.modelNumber || getSpec('customer_model_no_new') || getSpec('yk_product_code');

  // Resolve packshot image URL
  const packshotImageUrl = product.images ? getImageUrl(product.images) : '/placeholder.png';

  // Dynamic Features List
  const features = (product.families?.features && product.families.features.length > 0)
    ? product.families.features.map(f => f.feature)
    : [
        "Modular structural design optimized for rapid ceiling mount installations.",
        "Uniform, low-glare visual distribution using dynamic casing optics.",
        "Circadian rhythm and energy-saving controls ready.",
        "Ingress protection class IP ratings suited for heavy service environments.",
        "Vandal-resistant construction with high IK impact protection.",
        "Pre-wired plug-and-play terminals supporting direct daisy-chain wiring."
      ];

  // Dynamic Applications List
  const hasCustomApps = !!(product.families?.applications && product.families.applications.length > 0);
  const applications = hasCustomApps
    ? product.families!.applications!.map(a => a.application)
    : [];

  const filterSpecs = (specsList: { label: string; value: string }[]) => {
    return specsList.filter(s => s.value && s.value !== '—' && s.value !== 'N/A' && s.value !== 'undefined' && s.value.trim() !== '');
  };

  const getMultiSpec = (keys: string[], defaultValue = '—'): string => {
    for (const key of keys) {
      const val = getSpec(key);
      if (val && val !== '—' && val.toLowerCase() !== 'n/a' && val !== 'undefined') {
        return val;
      }
    }
    return defaultValue;
  };

  const totalFlux = getMultiSpec(['total_luminous_flux_lm', 'total_luminous_flux', 'useful_luminous_flux_lm', 'useful_luminous_flux', 'flux', 'lumens', 'light_source_useful_luminous_flux_lm'], '—');
  const rawEfficacy = getMultiSpec(['total_mains_efficacy_lmw', 'efficacy', 'luminous_efficacy'], '');
  const rawPower = getMultiSpec(['power', 'wattage', 'on_mode_power_w'], '');
  
  let efficacyVal = rawEfficacy;
  if (!efficacyVal && totalFlux !== '—') {
    const numFlux = parseInt(totalFlux);
    const numPower = parseFloat(rawPower);
    if (!isNaN(numFlux) && !isNaN(numPower) && numPower > 0) {
      efficacyVal = `${Math.round(numFlux / numPower)} lm/W`;
    } else {
      efficacyVal = '—';
    }
  } else if (efficacyVal) {
    efficacyVal = `${efficacyVal} lm/W`;
  } else {
    efficacyVal = '—';
  }

  // Compute dynamic spec summary string for right header
  const specSummaryParts = [];
  const equivW = getMultiSpec(['equivalent_power_w']);
  const actualW = getMultiSpec(['power', 'wattage', 'on_mode_power_w']);
  if (equivW && actualW) specSummaryParts.push(`${equivW}W/${actualW}W`);
  else if (actualW) specSummaryParts.push(`${actualW}W`);
  
  const capBase = getMultiSpec(['lampBase', 'lamp_base', 'cap_type', 'cap_base']);
  if (capBase) specSummaryParts.push(capBase);
  
  if (totalFlux !== '—') specSummaryParts.push(`${totalFlux}lm`);
  
  const cctVal = getMultiSpec(['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']);
  if (cctVal) specSummaryParts.push(cctVal.includes('K') ? cctVal : `${cctVal}K`);
  
  const criVal = getMultiSpec(['cri', 'CRI', 'ra', 'colour_rendering_index', 'color_rendering_index']);
  if (criVal) specSummaryParts.push(`Ra${criVal}`);
  
  const dimmingStatus = getMultiSpec(['dimmable', 'light_source_dimmable']);
  if (dimmingStatus) {
    if (dimmingStatus.toLowerCase().includes('dim')) {
      specSummaryParts.push(dimmingStatus);
    } else if (dimmingStatus.toLowerCase() === 'yes') {
      specSummaryParts.push('Dimmable');
    }
  }
  const specSummaryStr = specSummaryParts.join(' ');

  // Check if this product is a light source (lamp) or a luminaire.
  const isLuminaire = getSpec('luminaire_category') !== '' || !getSpec('new_erp_model_no');

  // -------------------------------------------------------------
  // LUMINAIRE SPECIFICATION LISTS (RESTORED ORIGINAL LAYOUT)
  // -------------------------------------------------------------
  const luminaireProductInfoSpecs = filterSpecs([
    { label: 'Model Number', value: product.name || selectedSku?.modelNumber || getSpec('customer_model_no_new') || getSpec('customer_model_no_old') },
    { label: 'Product Code', value: selectedSku?.optionCode || getSpec('option_code') || getSpec('yk_product_code') || '—' },
    { label: 'MM Code', value: selectedSku?.name || getSpec('model_identifier') || '—' },
    { label: 'Housing Colour', value: getSpec('fitting_colour') },
    { label: 'IP Rating', value: getSpec('ip') },
    { label: 'Series', value: familyName },
  ]);

  const luminaireElectricalSpecs = filterSpecs([
    { label: 'Input Voltage', value: getSpec('rated_voltage_v') },
    { label: 'Frequency', value: getSpec('frequency_hz') ? `${getSpec('frequency_hz')} Hz` : '' },
    { label: 'Input Current', value: getSpec('input_current_ma') ? `${getSpec('input_current_ma')} mA` : '' },
    { label: 'Power', value: getSpec('on_mode_power_w') ? `${getSpec('on_mode_power_w')} W` : '' },
    { label: 'Power Factor', value: getSpec('power_factor') ? (Number(getSpec('power_factor')) > 0 && Number(getSpec('power_factor')) < 1 ? `>${getSpec('power_factor')}` : getSpec('power_factor')) : '' },
    { label: 'Total harmonic distortion', value: getSpec('thd') ? (getSpec('thd').toString().includes('%') ? getSpec('thd').toString() : `${getSpec('thd')}%`) : '' },
    { label: 'Surge Protection', value: getSpec('surge_voltage_l_n_v') ? `${getSpec('surge_voltage_l_n_v')} V` : '' },
    { label: 'Inrush Current', value: getSpec('inrush_current_a') ? `${getSpec('inrush_current_a')} A` : '' },
    { label: 'Inrush Duration', value: getSpec('inrush_current_duration_uS') ? `${getSpec('inrush_current_duration_uS')} μs` : '' },
  ]);

  const luminaireDimmingSpecs = filterSpecs([
    { label: 'Dimmability status', value: getSpec('dimmable') },
    { label: 'Dimming Type', value: getSpec('dimming_type') },
    { label: 'Dimming Range', value: getSpec('dimming_range') },
  ]);

  const luminairePhotometricalSpecs = filterSpecs([
    { label: 'Luminous Flux', value: getSpec('useful_luminous_flux_lm') ? `${getSpec('useful_luminous_flux_lm')} lm` : (getSpec('total_luminous_flux_lm') ? `${getSpec('total_luminous_flux_lm')} lm` : '') },
    { label: 'Luminous Efficacy', value: getSpec('total_mains_efficacy_lmw') ? `${getSpec('total_mains_efficacy_lmw')} lm/W` : '' },
    { label: 'Colour Temp', value: getSpec('cct_k') ? `${getSpec('cct_k')} K` : '' },
    { label: 'CRI', value: getSpec('ra') ? `Ra${getSpec('ra')}` : '' },
    { label: 'Beam Angle', value: getSpec('beam_angle') ? `${getSpec('beam_angle')}°` : '' },
    { label: 'Colour Consistency', value: getSpec('colour_consistency') },
    { label: 'Flickering', value: getSpec('flickering') },
    { label: 'SVM', value: getSpec('svm') },
    { label: 'Pst LM', value: getSpec('flicker_metric') },
  ]);

  const luminaireLifeSpecs = filterSpecs([
    { label: 'Lifetime', value: getSpec('norminal_life_h') || getSpec('norminal_life_h ') },
    { label: 'Number of Switching Cycles', value: getSpec('switching_Cycles') || getSpec('switching_cycles') },
  ]);

  const luminaireStandardsSpecs = filterSpecs([
    { label: 'IK', value: getSpec('ik') },
    { label: 'Protection Class', value: getSpec('protection_class') },
    { label: 'Glow Wire', value: getSpec('glow_wire') ? `${getSpec('glow_wire')} °C` : '' },
    { label: 'Photobiological Safety Group', value: getSpec('photobiological_risk_group') },
    { label: 'Energy Class', value: getSpec('energy_efficiency_class') },
    { label: 'Standards Compliance', value: getSpec('standards') },
  ]);

  const luminaireInstallationSpecs = filterSpecs([
    { label: 'Installation', value: getSpec('mounting') },
    { label: 'B10', value: getSpec('mcb_b10') },
    { label: 'B16', value: getSpec('mcb_b16') },
    { label: 'C10', value: getSpec('mcb_c10') },
    { label: 'C16', value: getSpec('mcb_c16') },
  ]);

  const luminaireMechanicalSpecs = filterSpecs([
    { label: 'Optics Material', value: getSpec('diffuser_material') },
    { label: 'Housing Material', value: getSpec('housing_material') },
    { label: 'Housing Colour', value: getSpec('fitting_colour') },
    { label: 'Diameter', value: getSpec('diameter_mm') ? `${getSpec('diameter_mm')} mm` : '' },
    { label: 'Height', value: getSpec('height_mm') ? `${getSpec('height_mm')} mm` : '' },
    { label: 'Weights', value: getSpec('net_weight_g') ? `${getSpec('net_weight_g')} g` : '' },
  ]);

  // -------------------------------------------------------------
  // LIGHT SOURCE (LAMP) SPECIFICATION LISTS (ERP LAYOUT)
  // -------------------------------------------------------------
  const lightSourceGeneralSpecs = filterSpecs([
    { label: 'Model Number', value: getMultiSpec(['new_erp_model_no', 'model_identifier', 'customer_model_no_new']) },
    { label: 'Product Code', value: getMultiSpec(['yk_product_code', 'customer_model_no_new', 'yk_model_no']) },
    { label: 'Cap Base', value: getMultiSpec(['lampBase', 'lamp_base', 'cap_type', 'cap_base', 'base', 'lamp_holder_type']) },
    { label: 'Dimmable', value: getMultiSpec(['dimmable', 'light_source_dimmable']) },
    { label: 'Warm Up Time 60% of Full Light', value: getMultiSpec(['warm_up_time_sec', 'warmup_time', 'warm_up_time_up_to_60_of_the_full_light_output_sec']) },
    { label: 'Starting Time', value: getMultiSpec(['starting_time_sec', 'starting_time', 'start_time']) },
    { label: 'Working Temperature', value: getMultiSpec(['operating_temperature', 'temperature_of_ambient']) },
    { label: 'Housing Colour', value: getMultiSpec(['fitting_colour', 'colour', 'color']) },
    { label: 'Cover Design', value: getMultiSpec(['diffuser_material', 'cover_design']) },
    { label: 'Flammability of Plastic Component', value: getMultiSpec(['glow_wire', 'flammability_of_plastic_component']) },
    { label: 'Series', value: familyName },
  ]);

  const lightSourceLifeSpecs = filterSpecs([
    { label: 'Lifetime (L70 B50)', value: getMultiSpec(['norminal_life_h', 'nominal_life_h', 'rated_life_h', 'rated_life']) },
    { label: 'Number of Switching Cycles', value: getMultiSpec(['switching_cycles', 'switching_Cycles']) },
  ]);

  const lightSourceElectricalSpecs = filterSpecs([
    { label: 'Input Voltage', value: getMultiSpec(['rated_voltage_v', 'light_source_rated_voltage_v', 'voltage', 'Input Voltage']) },
    { label: 'Frequency', value: getMultiSpec(['frequency_hz', 'frequency', 'mains_frequency_hz']) },
    { label: 'Power Factor', value: getMultiSpec(['power_factor', 'displacement_factor']) },
    { label: 'Displacement Factor', value: getMultiSpec(['displacement_factor']) },
    { label: 'Equivalent Wattage', value: getMultiSpec(['equivalent_power_w', 'equivalent_power', 'equivalent_wattage']) },
    { label: 'Input Current', value: getMultiSpec(['input_current_ma', 'input_current', 'light_source_input_current_ma']) },
    { label: 'Surge Protection', value: getMultiSpec(['surge_voltage_l_n_v']) },
  ]);

  const lightSourcePhotometricalSpecs = filterSpecs([
    { label: 'Luminous Flux', value: getMultiSpec(['total_luminous_flux_lm', 'total_luminous_flux', 'useful_luminous_flux_lm', 'useful_luminous_flux', 'flux', 'lumens', 'light_source_useful_luminous_flux_lm']) },
    { label: 'Luminous Efficacy', value: efficacyVal },
    { label: 'Colour Temperature', value: getMultiSpec(['colourTemperature', 'Color Temperature', 'CCT', 'cct_k']) },
    { label: 'Colour Consistency', value: getMultiSpec(['colour_consistency', 'color_consistency', 'sdcm']) },
    { label: 'CRI', value: getMultiSpec(['cri', 'CRI', 'ra', 'colour_rendering_index', 'color_rendering_index']) },
    { label: 'SVM', value: getMultiSpec(['svm']) },
    { label: 'Pst LM', value: getMultiSpec(['flicker_metric']) },
    { label: 'Chromaticity Coordinates (x and y)', value: (getMultiSpec(['chromaticity_coordinates_x']) && getMultiSpec(['chromaticity_coordinates_y'])) ? `${getMultiSpec(['chromaticity_coordinates_x'])}, ${getMultiSpec(['chromaticity_coordinates_y'])}` : '' },
  ]);

  const lightSourceCertificatesSpecs = filterSpecs([
    { label: 'Weighted Energy Consumption', value: getMultiSpec(['energy_consumption_on_mode']) },
    { label: 'Energy Class', value: getMultiSpec(['energy_efficiency_class']) },
    { label: 'Photobiological Safety Group', value: getMultiSpec(['photobiological_risk_group']) },
    { label: 'Lamp Cap Twist Safe', value: getMultiSpec(['lamp_cap_twist_safe']) },
    { label: 'Approvals', value: getMultiSpec(['approvals', 'standards']) },
    { label: 'Standards Compliance', value: getMultiSpec(['standards']) },
  ]);

  const sceneImageUrl = (product.families?.media && product.families.media.length > 0) 
    ? getImageUrl(product.families.media[0]) 
    : '/placeholder.png';

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:p-0">
      
      {/* Styles for print formatting */}
      <style>{`
        body > header {
          display: none !important;
        }
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
            color: black;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
 
      {/* Interactive print control bar (hidden in prints) */}
      <PrintController cancelUrl="/products" />

      {/* PAGE 1: FEATURES & MARKETING OVERVIEW */}
      <A4Page pageNumber={1} totalPages={3}>
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} specSummaryStr={specSummaryStr} />

        <div className="flex justify-between items-start gap-4 mb-6">
          {/* Bulb Image (Left) */}
          <div className="w-[30%] relative h-[45mm] border border-gray-150 bg-white flex items-center justify-center p-2">
            <Image 
              src={packshotImageUrl} 
              alt={product.name}
              fill
              className="object-contain p-2"
              priority
              unoptimized
            />
          </div>

          {/* Applications list (Middle) */}
          <div className="w-[30%] h-[45mm] flex flex-col justify-start text-left pl-2">
            <span className="text-[10px] font-bold text-[#009fe3] uppercase tracking-wider mb-2 font-sans">APPLICATIONS</span>
            <ul className="text-[8px] text-gray-600 font-light leading-relaxed font-sans space-y-1">
              {(applications.length > 0 ? applications : ['Commercial Areas', 'Hospitality Installations', 'Residential Lightings', 'Retail shops', 'Social Areas']).map((app, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <span className="text-[#009fe3]">•</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scene image (Right) */}
          <div className="w-[40%] relative h-[45mm] border border-gray-150 bg-gray-50 overflow-hidden">
            <Image 
              src={sceneImageUrl} 
              alt="Application Scene"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* General Information Table */}
        <TechSection title="GENERAL INFORMATION" specs={isLuminaire ? luminaireProductInfoSpecs : lightSourceGeneralSpecs} />
      </A4Page>

      {/* PAGE 2: TECHNICAL SPECIFICATIONS */}
      <A4Page pageNumber={2} totalPages={3}>
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} specSummaryStr={specSummaryStr} />
        
        <div className="flex flex-col space-y-2">
          {isLuminaire ? (
            <>
              <TechSection title="ELECTRICAL INFORMATION" specs={luminaireElectricalSpecs} />
              <TechSection title="DIMMING AND CONTROLS" specs={luminaireDimmingSpecs} />
              <TechSection title="PHOTOMETRICAL INFORMATION" specs={luminairePhotometricalSpecs} />
              <TechSection title="LIFE PERFORMANCE" specs={luminaireLifeSpecs} />
            </>
          ) : (
            <>
              <TechSection title="LIFE PERFORMANCE" specs={lightSourceLifeSpecs} />
              <TechSection title="ELECTRICAL DATA" specs={lightSourceElectricalSpecs} />
              <TechSection title="PHOTOMETRICAL INFORMATION" specs={lightSourcePhotometricalSpecs} />
              <TechSection title="CERTIFICATES & STANDARDS" specs={lightSourceCertificatesSpecs} />
            </>
          )}
        </div>
      </A4Page>

      {/* PAGE 3: DIMENSIONS & WEIGHT / DETAILED TABLES */}
      <A4Page pageNumber={3} totalPages={3}>
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} specSummaryStr={specSummaryStr} />
        
        {isLuminaire ? (
          <div className="flex flex-col space-y-4">
            <TechSection title="STANDARDS AND APPLICATION" specs={luminaireStandardsSpecs} />
            <TechSection title="INSTALLATION AND CAPABILITIES" specs={luminaireInstallationSpecs} />
            <TechSection title="MECHANICAL AND MATERIAL" specs={luminaireMechanicalSpecs} />
            
            {/* OPTIONAL ACCESSORIES Section with standard table layout */}
            <div className="mb-5 print-break-inside-avoid text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-250 pb-1 mb-2 font-sans">
                OPTIONAL ACCESSORIES
              </h4>
              <table className="w-full text-[8px] border-collapse font-sans mt-2">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <th className="p-1.5 text-left w-1/3">Model No.</th>
                    <th className="p-1.5 text-left w-1/3">MM Code</th>
                    <th className="p-1.5 text-left w-1/3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-1.5 text-gray-500 font-medium">—</td>
                    <td className="p-1.5 text-gray-500 font-medium">—</td>
                    <td className="p-1.5 text-gray-500 font-medium">To be confirmed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* LOGISTIC INFORMATION Section with dimensions and units */}
            <div className="mb-5 print-break-inside-avoid text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-250 pb-1 mb-2 font-sans">
                LOGISTIC INFORMATION
              </h4>
              <table className="w-full text-[7.5px] border-collapse font-sans mt-2 text-center">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold border border-gray-200">
                    <th className="p-1.5 border border-gray-200 align-middle" rowSpan={2}>MM Code</th>
                    <th className="p-1.5 border border-gray-200 align-middle" rowSpan={2}>Packaging Unit (pcs/unit)</th>
                    <th className="p-1 border border-gray-200" colSpan={3}>Outer Box Dimensions (mm)</th>
                    <th className="p-1.5 border border-gray-200 align-middle" rowSpan={2}>Gross Weight per Outer Box (kg)</th>
                  </tr>
                  <tr className="bg-gray-50 text-gray-500 text-[6.5px] border border-gray-200">
                    <th className="p-0.5 border border-gray-200">Length</th>
                    <th className="p-0.5 border border-gray-200">Width</th>
                    <th className="p-0.5 border border-gray-200">Height</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-gray-200">
                    <td className="p-1.5 border border-gray-200 font-mono text-gray-900 font-medium">{selectedSku?.name || getSpec('model_identifier', '—')}</td>
                    <td className="p-1.5 border border-gray-200 text-gray-900 font-medium">{selectedSku?.packingMethod || getSpec('packaging', '—')}</td>
                    <td className="p-1 border border-gray-200 text-gray-900 font-medium">{getSpec('outer_box_length_mm', '—')}</td>
                    <td className="p-1 border border-gray-200 text-gray-900 font-medium">{getSpec('outer_box_width_mm', '—')}</td>
                    <td className="p-1 border border-gray-200 text-gray-900 font-medium">{getSpec('outer_box_height_mm', '—')}</td>
                    <td className="p-1.5 border border-gray-200 text-gray-900 font-medium">{getSpec('gross_weight_outer_box_kg', '—')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mb-5 print-break-inside-avoid text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-250 pb-1 mb-6 font-sans">
              DIMENSIONS & WEIGHT
            </h4>
            
            <div className="grid grid-cols-[40%_55%] gap-[5%] items-center mt-8">
              {/* Left: Annotated SVG light bulb */}
              <div className="flex flex-col items-center justify-center p-4 border border-gray-150 bg-gray-50/50 relative rounded">
                <svg viewBox="0 0 140 200" className="w-36 h-48 text-gray-500">
                  {/* Outer Glass */}
                  <path d="M70 25 C45 25 30 45 30 70 C30 95 45 115 53 130 L53 150 L87 150 L87 130 C95 115 110 95 110 70 C110 45 95 25 70 25 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  {/* Base Screw E27 */}
                  <path d="M53 150 L87 150 M53 155 L87 155 M53 160 L87 160 M55 165 L85 165 M57 170 L83 170 M60 175 C60 178 80 178 80 175" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* Height annotation line on the left */}
                  <line x1="15" y1="25" x2="15" y2="175" stroke="#009fe3" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="10" y1="25" x2="20" y2="25" stroke="#009fe3" strokeWidth="1" />
                  <line x1="10" y1="175" x2="20" y2="175" stroke="#009fe3" strokeWidth="1" />
                  <text x="8" y="105" fill="#009fe3" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(-90 8 105)">H</text>
                  
                  {/* Diameter annotation line at the bottom */}
                  <line x1="30" y1="190" x2="110" y2="190" stroke="#009fe3" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="185" x2="30" y2="195" stroke="#009fe3" strokeWidth="1" />
                  <line x1="110" y1="185" x2="110" y2="195" stroke="#009fe3" strokeWidth="1" />
                  <text x="70" y="198" fill="#009fe3" fontSize="10" fontWeight="bold" textAnchor="middle">D</text>
                </svg>
              </div>
              
              {/* Right: Dimension specifications table */}
              <div className="flex flex-col text-[9px] font-sans">
                {[
                  { label: 'Width (W)', value: getMultiSpec(['width_mm', 'diameter_mm']) ? `${getMultiSpec(['width_mm', 'diameter_mm'])} mm` : '—' },
                  { label: 'Height (H)', value: getMultiSpec(['height_mm']) ? `${getMultiSpec(['height_mm'])} mm` : '—' },
                  { label: 'Diameter (D)', value: getMultiSpec(['diameter_mm']) ? `${getMultiSpec(['diameter_mm'])} mm` : '—' },
                  { label: 'Weight', value: getMultiSpec(['net_weight_g', 'weight']) ? `${getMultiSpec(['net_weight_g', 'weight'])} g` : '—' }
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[50%_50%] py-2 border-b border-gray-150 items-baseline">
                    <span className="text-gray-500 font-semibold uppercase">{row.label}</span>
                    <span className="text-gray-900 font-bold text-left pl-2">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </A4Page>
    </div>
  );
}
