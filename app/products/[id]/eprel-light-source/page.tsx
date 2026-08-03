/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { Metadata } from 'next';
import PrintController from './PrintController';

interface Product {
  id: string;
  name: string; // Model Number
  description?: string;
  colour?: string;
  power?: string;
  colourTemperature?: string;
  specifications?: Record<string, any> | null;
  families?: {
    id: string;
    name: string;
    description?: string;
    dismantleInstructionPdf?: {
      url: string;
      filename: string;
    } | string | null;
  } | null;
}

interface SKU {
  id: string;
  name: string; // MM Code
  modelNumber?: string;
  colour?: string;
  wattage?: string;
  lampBase?: string;
  colourTemperature?: string;
  voltage?: string;
  specifications?: Record<string, any> | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sku?: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/products/${id}?depth=2`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching product for EPREL document:', error);
    return null;
  }
}

async function getProductSKUs(productId: string): Promise<SKU[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/skus?where[product][equals]=${productId}&limit=100`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching SKUs for EPREL document:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  return {
    title: product ? `Technical Document (Light Source) - ${product.name} | MEGAMAN®` : 'Technical Document | MEGAMAN®',
  };
}

// Global A4 Page Container
const A4Page = ({ children, pageNumber, totalPages }: { children: React.ReactNode; pageNumber: number; totalPages?: number }) => {
  return (
    <div 
      className="relative border border-gray-300 shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:mb-0 font-sans" 
      style={{ 
        width: '210mm', 
        height: '296.5mm', 
        pageBreakAfter: 'always', 
        boxSizing: 'border-box',
        paddingTop: '10mm',
        paddingLeft: '14mm',
        paddingRight: '14mm',
        paddingBottom: '10mm'
      }}
    >
      <div className="h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default async function EprelLightSourceDocumentPage({ params, searchParams }: PageProps) {
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

  const selectedSku = resolvedSearchParams.sku 
    ? skus.find(s => s.name === resolvedSearchParams.sku) || skus[0]
    : skus[0];

  // Helper to extract values from specifications or SKU direct attributes
  const getSpec = (key: string, fallback = 'N/A'): string => {
    // 1. Check SKU specifications
    if (selectedSku?.specifications && selectedSku.specifications[key] !== undefined && selectedSku.specifications[key] !== null) {
      const val = String(selectedSku.specifications[key]).trim();
      if (val && val.toLowerCase() !== 'undefined' && val !== '-') return val;
    }
    // 2. Check Product specifications
    if (product.specifications && product.specifications[key] !== undefined && product.specifications[key] !== null) {
      const val = String(product.specifications[key]).trim();
      if (val && val.toLowerCase() !== 'undefined' && val !== '-') return val;
    }
    return fallback;
  };

  const getMultiSpec = (keys: string[], fallback = 'N/A'): string => {
    for (const k of keys) {
      const val = getSpec(k, '');
      if (val && val !== 'N/A' && val !== '—' && val.toLowerCase() !== 'undefined') return val;
    }
    return fallback;
  };

  // -------------------------------------------------------------
  // EPREL GENERAL DATA SPECIFICATIONS MAPPING
  // -------------------------------------------------------------
  // Model Identifier comes directly from Column BZ (model_identifier)
  const modelIdentifier = getMultiSpec(['model_identifier', 'new_erp_model_no', 'new_erp_supplier_model'], product.name || selectedSku?.modelNumber || 'N/A');
  const familyName = product.families?.name || getMultiSpec(['series', 'shape', 'series_name'], 'MEGAMAN® LIGHT SOURCE');
  const supplierName = getSpec('supplier_name', 'MEGAMAN GmbH');
  const supplierAddress = getSpec('supplier_address', 'Halskestraße 22-26, AircomParc A140880 Ratingen Germany');
  const equivalentModels = getMultiSpec(['equivalent_models', 'supplementary_code'], 'N/A');

  // Technical Document 23 Table Items
  const usefulFlux = getMultiSpec(['useful_luminous_flux', 'useful_luminous_flux_lm', 'total_luminous_flux_lm', 'total_luminous_flux'], 'N/A');
  
  let pon = getMultiSpec(['on_mode_power', 'on_mode_power_w', 'power', 'wattage'], 'N/A');
  if (pon !== 'N/A' && !pon.toLowerCase().includes('w')) pon = `${pon} W`;

  const beamAngle = getMultiSpec(['beam_angle', 'beam_angle_correspondence'], 'N/A');
  const peakIntensity = getMultiSpec(['peak_luminous_intensity', 'maximum_intensity_cd'], 'N/A');
  
  let cct = getMultiSpec(['correlated_colour_temperature', 'cct_k', 'colourTemperature'], 'N/A');
  if (cct !== 'N/A' && !cct.toLowerCase().includes('k')) cct = `${cct} K`;

  const chromaticity = getMultiSpec(['chromaticity_coordinates_x_and_y', 'chromaticity_coordinates_x'], '0.38, 0.38');
  
  let cri = getMultiSpec(['colour_rendering_index', 'ra', 'cri'], 'Ra 80');
  if (cri !== 'N/A' && !cri.toLowerCase().includes('ra')) cri = `Ra ${cri}`;

  const psb = getMultiSpec(['standby_power', 'standby_power_psb'], '0');
  const pnet = getMultiSpec(['networked_standby_power', 'networked_standby_power_pnet'], 'N/A');
  const r9Cri = getMultiSpec(['r9_colour_rendering_index_value', 'r9'], '0');
  const survivalFactor = getMultiSpec(['survival_factor'], '0.90');
  const lumenMaintenance = getMultiSpec(['lumen_maintenance_factor', 'llmf'], '0.96');
  const indicativeLifetime = getMultiSpec(['indicative_lifetime_l70b50', 'norminal_life_l70b50_h', 'norminal_life_h'], '50000');
  const displacementFactor = getMultiSpec(['displacement_factor_cos_1', 'displacement_factor', 'power_factor'], '0.9');
  
  let colourConsistency = getMultiSpec(['colour_consistency'], 'SDCM ≤ 6');
  if (colourConsistency !== 'N/A' && !colourConsistency.includes('SDCM')) colourConsistency = `SDCM ≤ ${colourConsistency}`;

  const luminanceHlls = getMultiSpec(['luminance_for_hlls', 'high_luminance_light_source'], 'N/A');
  const pstlm = getMultiSpec(['flicker_metric_pstlm', 'flicker_metric'], '1');
  const svm = getMultiSpec(['stroboscopic_effect_metric_svm', 'svm'], '0.4');
  const ctlsPurity = getMultiSpec(['excitation_purity_for_ctls'], 'N/A');
  
  let weightedEnergy = getMultiSpec(['weighted_energy_consumption', 'energy_consumption_on_mode'], 'N/A');
  if (weightedEnergy !== 'N/A' && !weightedEnergy.toLowerCase().includes('kwh')) weightedEnergy = `${weightedEnergy} kWh/1000hrs`;

  const energyClass = getMultiSpec(['energy_class', 'energy_efficiency_class'], 'D');
  const heightMm = getMultiSpec(['height_h', 'height_mm'], '30');
  const widthMm = getMultiSpec(['width_w', 'width_mm'], '158');
  const depthMm = getMultiSpec(['depth_d', 'depth_mm', 'diameter_mm'], '158');
  const standardsCompliance = getMultiSpec(['standards_compliance', 'standards', 'approvals'], 'CE, RoHS');

  // Dismantle Instruction PDF link
  const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  let diPdfUrl: string | null = null;
  if (product.families?.dismantleInstructionPdf) {
    const diObj = product.families.dismantleInstructionPdf;
    if (typeof diObj === 'string') {
      diPdfUrl = diObj.startsWith('http') ? diObj : `${payloadUrl}/media/${diObj}`;
    } else if (diObj.url) {
      diPdfUrl = diObj.url.startsWith('http') ? diObj.url : `${payloadUrl}${diObj.url.startsWith('/') ? diObj.url : '/' + diObj.url}`;
    }
  }

  // 23 Tech Table Rows
  const techRows = [
    { label: 'Useful luminous flux', val: usefulFlux },
    { label: 'On-mode Power (Pon)', val: pon },
    { label: 'Beam angle in degrees for directional light sources (DLS)', val: beamAngle },
    { label: 'Peak luminous intensity in cd for directional light sources (DLS)', val: peakIntensity },
    { label: 'Correlated Colour Temperature', val: cct },
    { label: 'Chromaticity coordinates (x,y)', val: chromaticity },
    { label: 'Colour Rendering Index (CRI)', val: cri },
    { label: 'Standby Power (Psb)', val: psb },
    { label: 'Networked Standby Power (Pnet)', val: pnet },
    { label: 'R9 colour rendering index value for LED and OLED light sources', val: r9Cri },
    { label: 'Survival factor for LED and OLED light sources', val: survivalFactor },
    { label: 'Lumen maintenance factor for LED and OLED light sources', val: lumenMaintenance },
    { label: 'Indicative lifetime L70B50 for LED and OLED light sources', val: indicativeLifetime },
    { label: 'Displacement Factor (cos φ1)', val: displacementFactor },
    { label: 'Colour Consistency', val: colourConsistency },
    { label: 'Luminance for HLLS', val: luminanceHlls },
    { label: 'Flicker metric (PstLM)', val: pstlm },
    { label: 'Stroboscopic effect metric (SVM)', val: svm },
    { label: 'Excitation purity for CTLS', val: ctlsPurity },
    { label: 'Weighted Energy Consumption', val: weightedEnergy },
    { label: 'Energy Efficiency Class', val: energyClass },
  ];

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:p-0">
      
      {/* Print styling overrides */}
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
            font-size: 9pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Top action toolbar */}
      <PrintController cancelUrl={`/products/${product.id}`} documentTitle={`EPREL Technical Document - ${modelIdentifier}`} />

      {/* PAGE 1: EPREL HEADER & TECHNICAL DOCUMENT TABLE */}
      <A4Page pageNumber={1} totalPages={2}>
        <div>
          {/* Top Banner Header */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-3">
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-extrabold uppercase text-[#009fe3] tracking-wide font-sans leading-tight">
                {familyName}
              </h1>
              <span className="text-xs font-bold text-gray-700 font-mono tracking-wider">
                {modelIdentifier}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <img 
                src="/MEGAMAN_Logo.png" 
                alt="MEGAMAN®" 
                className="h-7 object-contain mb-1" 
                style={{ maxHeight: '28px' }}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-800 font-sans">
                TECHNICAL DOCUMENT- LIGHT SOURCE
              </span>
            </div>
          </div>

          {/* Supplier Info Block */}
          <div className="text-[10px] text-gray-800 space-y-1 mb-3 font-sans border-b border-gray-200 pb-2">
            <div className="flex">
              <span className="font-bold w-48 text-gray-700">Supplier’s name or trade mark:</span>
              <span className="font-semibold">{supplierName}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-48 text-gray-700">Supplier’s address</span>
              <span>{supplierAddress}</span>
            </div>
            <div className="flex border-t border-gray-100 pt-1 mt-1">
              <span className="font-bold w-48 text-gray-700">Model identifier</span>
              <span className="font-mono font-bold text-gray-900">{modelIdentifier}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-48 text-gray-700">Equivalent Models</span>
              <span>{equivalentModels}</span>
            </div>
          </div>

          {/* Technical Document Table */}
          <div className="mb-3">
            <h2 className="text-[10px] font-bold text-[#009fe3] uppercase border-b border-[#009fe3] pb-0.5 mb-1.5">
              Technical Document
            </h2>
            <table className="w-full text-[8.5px] border-collapse font-sans">
              <tbody>
                {techRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-0.5 pr-2 text-gray-700 font-medium w-[70%]">{row.label}</td>
                    <td className="py-0.5 pl-2 text-gray-900 font-bold w-[30%]">{row.val}</td>
                  </tr>
                ))}
                
                {/* Outer Dimensions Section */}
                <tr className="border-b border-gray-200">
                  <td colSpan={2} className="py-0.5 text-gray-700 font-semibold italic">Outer dimensions in mm</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pl-4 text-gray-600 font-medium">Height</td>
                  <td className="py-0.5 pl-2 text-gray-900 font-bold">{heightMm}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pl-4 text-gray-600 font-medium">Width</td>
                  <td className="py-0.5 pl-2 text-gray-900 font-bold">{widthMm}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pl-4 text-gray-600 font-medium">Depth</td>
                  <td className="py-0.5 pl-2 text-gray-900 font-bold">{depthMm}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 text-gray-700 font-medium">Standards Compliance</td>
                  <td className="py-0.5 pl-2 text-gray-900 font-bold">{standardsCompliance}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CALCULATIONS - GENERAL RULE */}
          <div className="mt-2 text-[8px] text-gray-800 font-sans">
            <h3 className="text-[9px] font-bold uppercase text-[#009fe3] tracking-wide mb-1">
              CALCULATIONS - GENERAL RULE
            </h3>
            <p className="text-gray-600 italic mb-1">Refer to Annex II of Energy Labelling (EU) 2019/2015</p>
            
            <h4 className="font-bold text-[8.5px] text-gray-800 mb-1">Energy efficiency classes and calculation method</h4>
            <p className="leading-tight text-gray-600 mb-1.5">
              The energy efficiency class of light sources shall be determined as set out in Table 1, on the basis of the total mains efficacy ηTM, which is calculated by dividing the declared useful luminous flux Φuse (expressed in lm) by the declared on-mode power consumption Pon (expressed in W) and multiplying by the applicable factor FTM of Table 2, as follows:
            </p>
            
            <div className="text-center font-bold text-[9px] text-gray-900 my-1 font-mono">
              ηTM = (Φuse/Pon) × FTM (lm/W)
            </div>

            <p className="text-center font-bold text-[8px] italic text-gray-600 mb-1">Table 1: Energy efficiency classes of light sources</p>
            
            <table className="w-full text-[7.5px] border border-gray-300 text-center font-sans">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold">
                  <th className="p-1 border-r border-gray-300 w-1/2">Energy efficiency class</th>
                  <th className="p-1 w-1/2">Total mains efficacy ηTM (lm/W)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">A</td><td className="p-0.5">210 ≤ ηTM</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">B</td><td className="p-0.5">185 ≤ ηTM &lt; 210</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">C</td><td className="p-0.5">160 ≤ ηTM &lt; 185</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">D</td><td className="p-0.5">135 ≤ ηTM &lt; 160</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">E</td><td className="p-0.5">110 ≤ ηTM &lt; 135</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">F</td><td className="p-0.5">85 ≤ ηTM &lt; 110</td></tr>
                <tr><td className="p-0.5 border-r border-gray-300 font-bold">G</td><td className="p-0.5">ηTM &lt; 85</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </A4Page>

      {/* PAGE 2: TABLE 2 CONTINUATION, ADDITIONAL PART & COMPANY FOOTER */}
      <A4Page pageNumber={2} totalPages={2}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <p className="text-center font-bold text-[8.5px] italic text-black mb-1">
              Table 2: Factors FTM by light source type
            </p>
            <table className="w-full text-[8px] border border-gray-300 text-left font-sans mb-6 text-black">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 font-bold text-black">
                  <th className="p-1.5 border-r border-gray-300 w-3/4 text-black">Light source type</th>
                  <th className="p-1.5 w-1/4 text-center text-black">Factor FTM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-black">
                <tr className="text-black">
                  <td className="p-1.5 border-r border-gray-300 text-black">Non-directional (NDLS) operating on mains (MLS)</td>
                  <td className="p-1.5 text-center font-bold text-black">1,000</td>
                </tr>
                <tr className="text-black">
                  <td className="p-1.5 border-r border-gray-300 text-black">Non-directional (NDLS) not operating on mains (NMLS)</td>
                  <td className="p-1.5 text-center font-bold text-black">0,926</td>
                </tr>
                <tr className="text-black">
                  <td className="p-1.5 border-r border-gray-300 text-black">Directional (DLS) operating on mains (MLS)</td>
                  <td className="p-1.5 text-center font-bold text-black">1,176</td>
                </tr>
                <tr className="text-black">
                  <td className="p-1.5 border-r border-gray-300 text-black">Directional (DLS) not operating on mains (NMLS)</td>
                  <td className="p-1.5 text-center font-bold text-black">1,089</td>
                </tr>
              </tbody>
            </table>

            {/* ADDITIONAL PART */}
            <div className="mt-8 text-[9px] font-sans border-t border-gray-200 pt-4">
              <h3 className="font-bold text-[10px] uppercase text-[#009fe3] tracking-wide mb-2">
                ADDITIONAL PART
              </h3>
              <p className="text-gray-800 mb-2">
                A list of compatible dimmers shall be provided on the website{' '}
                <a href="https://www.megaman.cc" target="_blank" rel="noreferrer" className="text-[#009fe3] underline font-semibold">
                  www.megaman.cc
                </a>
              </p>
              <p className="text-gray-800 leading-relaxed mb-2">
                MEGAMAN | WEEE - Green Room | LED, Energy-efficient &amp; Eco-friendly Lighting, Restriction of Hazardous Substances
                <br />
                <a href="https://www.megaman.cc/resources/green-room/weee" target="_blank" rel="noreferrer" className="text-[#009fe3] underline font-semibold">
                  https://www.megaman.cc/resources/green-room/weee
                </a>
              </p>
            </div>
          </div>

          {/* Footer & Company Address Block */}
          <div className="border-t border-gray-300 pt-4 relative">
            <div className="flex justify-between items-end">
              <div className="text-[9px] text-gray-700 font-sans leading-tight">
                <p className="font-bold text-gray-900">MEGAMAN GmbH</p>
                <p>Halskestraße 22-26, AircomParc A1</p>
                <p>40880 Ratingen</p>
                <p>Germany</p>
              </div>

              {/* Company Chop Image */}
              <div className="w-28 h-28 relative flex items-center justify-center">
                <img 
                  src="/company_chop.png" 
                  alt="NEONLITE DISTRIBUTION LIMITED Chop" 
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-gray-200 mt-4 pt-2 font-sans">
              <span>© Copyright 2020. All rights reserved by MEGAMAN®</span>
              <span>Version 1.2021</span>
            </div>
          </div>
        </div>
      </A4Page>

      {/* PAGE 3+: DISMANTLE INSTRUCTION (MERGED PDF FROM FAMILY) */}
      <div className="page-break">
        <A4Page pageNumber={3}>
          <div className="h-full flex flex-col justify-between font-sans">
            <div>
              {/* Header matching Dismantle Instruction style */}
              <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-4">
                <div className="flex flex-col text-left">
                  <h1 className="text-xl font-extrabold text-[#009fe3] uppercase tracking-wide">
                    {familyName}
                  </h1>
                  <span className="text-xs font-bold text-gray-800 tracking-wider">
                    DISMANTLE INSTRUCTION FOR MARKET SURVEILLANCE
                  </span>
                </div>
                <img 
                  src="/MEGAMAN_Logo.png" 
                  alt="MEGAMAN®" 
                  className="h-7 object-contain" 
                  style={{ maxHeight: '28px' }}
                />
              </div>

              {diPdfUrl ? (
                <div className="w-full h-[220mm] border border-gray-200 rounded overflow-hidden">
                  <iframe 
                    src={`${diPdfUrl}#toolbar=0&navpanes=0`} 
                    className="w-full h-full border-none"
                    title="Dismantle Instruction PDF"
                  />
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-gray-300 rounded text-center my-12 bg-gray-50">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-1">
                    Dismantle Instruction Pending Upload
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    The dismantle instruction file <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">{familyName.toLowerCase().replace(/\s+/g, '_')}_di.pdf</code> has not been uploaded for family <span className="font-bold">{familyName}</span> yet.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-gray-200 pt-2 font-sans">
              <div className="flex space-x-4">
                <span>www.megaman.cc</span>
                <span>info@megaman.cc</span>
              </div>
              <span>© Copyright 2026. All rights reserved by MEGAMAN®</span>
              <span>Data subject to change</span>
            </div>
          </div>
        </A4Page>
      </div>
    </div>
  );
}
