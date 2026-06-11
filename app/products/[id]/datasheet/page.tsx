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
    <div className="relative border border-gray-300 shadow-lg mx-auto bg-white p-12 mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 print:mb-0" 
         style={{ width: '210mm', height: '296.5mm', pageBreakAfter: 'always', boxSizing: 'border-box' }}>
      
      {/* Content Area with bottom margin to prevent collision with footer */}
      <div className="h-[238mm] overflow-hidden">
        {children}
      </div>

      {/* Global Footer (absolutely positioned inside the page container) */}
      <footer className="absolute bottom-6 left-12 right-12 text-[8px] text-gray-400 font-mono border-t border-gray-200 pt-4 z-50">
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
const DatasheetHeader = ({ familyName, typeName, refCode }: { familyName: string; typeName: string; refCode: string }) => {
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
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-500 font-bold block">
          PRODUCT DATASHEET
        </span>
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

export default async function ProductDatasheetPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return (
      <div className="p-12 text-center text-red-500 font-mono">
        <h1>Product not found</h1>
        <p>The requested product specifications could not be loaded.</p>
      </div>
    );
  }

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
  const refCode = getSpec('customer_model_no_new') || getSpec('yk_product_code') || product.name;

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

  // Page 2 Specifications Lists
  const productInfoSpecs = filterSpecs([
    { label: 'Model Number', value: getSpec('customer_model_no_new') || product.name },
    { label: 'Product Code', value: 'To be confirmed' },
    { label: 'MM Code', value: 'To be confirmed' },
  ]);

  const electricalSpecs = filterSpecs([
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

  const dimmingSpecs = filterSpecs([
    { label: 'Dimmability status', value: getSpec('dimmable') },
    { label: 'Dimming Type', value: getSpec('dimming_type') },
    { label: 'Dimming Range', value: getSpec('dimming_range') },
  ]);

  const photometricalSpecs = filterSpecs([
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

  const lifeSpecs = filterSpecs([
    { label: 'Lifetime', value: getSpec('norminal_life_h') },
    { label: 'Number of Switching Cycles', value: getSpec('switching_Cycles') },
  ]);

  // Page 3 Specifications Lists
  const standardsSpecs = filterSpecs([
    { label: 'IK', value: getSpec('ik') },
    { label: 'Protection Class', value: getSpec('protection_class') },
    { label: 'Glow Wire', value: getSpec('glow_wire') ? `${getSpec('glow_wire')} °C` : '' },
    { label: 'Photobiological Safety Group', value: getSpec('photobiological_risk_group') },
    { label: 'Energy Class', value: getSpec('energy_efficiency_class') },
    { label: 'Standards Compliance', value: getSpec('standards') },
  ]);

  const installationSpecs = filterSpecs([
    { label: 'Installation', value: getSpec('mounting') },
    { label: 'B10', value: getSpec('mcb_b10') },
    { label: 'B16', value: getSpec('mcb_b16') },
    { label: 'C10', value: getSpec('mcb_c10') },
    { label: 'C16', value: getSpec('mcb_c16') },
  ]);

  const mechanicalSpecs = filterSpecs([
    { label: 'Optics Material', value: getSpec('diffuser_material') },
    { label: 'Housing Material', value: getSpec('housing_material') },
    { label: 'Housing Colour', value: getSpec('fitting_colour') },
    { label: 'Diameter', value: getSpec('diameter_mm') ? `${getSpec('diameter_mm')} mm` : '' },
    { label: 'Height', value: getSpec('height_mm') ? `${getSpec('height_mm')} mm` : '' },
    { label: 'Weights', value: getSpec('net_weight_g') ? `${getSpec('net_weight_g')} g` : '' },
  ]);

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
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} />

        <div className="grid grid-cols-[42%_54%] gap-x-[4%] h-[210mm] mt-2">
          {/* Left Column: Visuals */}
          <div className="flex flex-col justify-start">
            <div className="relative w-full aspect-square bg-white border border-gray-150 rounded-lg shadow-sm flex items-center justify-center p-6">
              <Image 
                src={packshotImageUrl} 
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col space-y-8 justify-start">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-100 pb-2 mb-4 font-sans">
                PRODUCT FEATURES
              </h3>
              <ul className="space-y-3.5 text-[10px] text-gray-600 font-light leading-relaxed font-sans list-none">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#009fe3] font-bold mt-0.5">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#009fe3] border-b border-gray-100 pb-2 mb-3 font-sans">
                APPLICATIONS
              </h3>
              {hasCustomApps ? (
                <ul className="space-y-3.5 text-[10px] text-gray-600 font-light leading-relaxed font-sans list-none">
                  {applications.map((app, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#009fe3] font-bold mt-0.5">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-gray-600 font-light leading-relaxed font-sans">
                  {product.description || "Ideally specified for light corporate environments, corridors, office spaces, utility storage rooms, hallways, and multi-residential building walkways. Meets requirements for ingress protection classifications and high mechanical impact resistance levels."}
                </p>
              )}
            </div>
          </div>
        </div>
      </A4Page>

      {/* PAGE 2: TECHNICAL SPECIFICATIONS */}
      <A4Page pageNumber={2} totalPages={3}>
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} />
        
        <div className="flex flex-col space-y-2">
          <TechSection title="PRODUCT INFORMATION" specs={productInfoSpecs} />
          <TechSection title="ELECTRICAL INFORMATION" specs={electricalSpecs} />
          <TechSection title="DIMMING AND CONTROLS" specs={dimmingSpecs} />
          <TechSection title="PHOTOMETRICAL INFORMATION" specs={photometricalSpecs} />
          <TechSection title="LIFE PERFORMANCE" specs={lifeSpecs} />
        </div>
      </A4Page>

      {/* PAGE 3: TECHNICAL SPECIFICATIONS */}
      <A4Page pageNumber={3} totalPages={3}>
        <DatasheetHeader familyName={familyName} typeName={typeName} refCode={refCode} />
        
        <div className="flex flex-col space-y-4">
          <TechSection title="STANDARDS AND APPLICATION" specs={standardsSpecs} />
          <TechSection title="INSTALLATION AND CAPABILITIES" specs={installationSpecs} />
          <TechSection title="MECHANICAL AND MATERIAL" specs={mechanicalSpecs} />
          
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
                  <td className="p-1.5 border border-gray-200 font-mono text-gray-900 font-medium">{getSpec('model_identifier', '—')}</td>
                  <td className="p-1.5 border border-gray-200 text-gray-900 font-medium">—</td>
                  <td className="p-1 border border-gray-200 text-gray-900 font-medium">—</td>
                  <td className="p-1 border border-gray-200 text-gray-900 font-medium">—</td>
                  <td className="p-1 border border-gray-200 text-gray-900 font-medium">—</td>
                  <td className="p-1.5 border border-gray-200 text-gray-900 font-medium">—</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </A4Page>

    </div>
  );
}
