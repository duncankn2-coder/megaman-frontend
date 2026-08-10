/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { Metadata } from 'next';
import PrintController from '../eprel-light-source/PrintController';
import DismantleInstructionPages from '../eprel-light-source/DismantleInstructionPages';

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
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching product for Control Gear document:', error);
    return null;
  }
}

async function getProductSKUs(productId: string): Promise<SKU[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/skus?where[product][equals]=${productId}&limit=100`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching SKUs for Control Gear document:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  return {
    title: product ? `Technical Document (Control Gear) - ${product.name} | MEGAMAN®` : 'Technical Document (Control Gear) | MEGAMAN®',
  };
}

// Global A4 Page Container
const A4Page = ({ children }: { children: React.ReactNode }) => {
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

export default async function ControlGearDocumentPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(resolvedParams.id);
  const skus = await getProductSKUs(resolvedParams.id);

  if (!product) {
    return (
      <div className="p-12 text-center text-red-500 font-mono">
        <h1>Product not found</h1>
        <p>The requested control gear specifications could not be loaded.</p>
      </div>
    );
  }

  const selectedSku = resolvedSearchParams.sku 
    ? skus.find(s => s.name === resolvedSearchParams.sku) || skus[0]
    : skus[0];

  const isInvalid = (val?: string | null): boolean => {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return lower === '' || lower === 'n/a' || lower === 'na' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === '—';
  };

  // Helper to extract values from specifications or SKU direct attributes
  const getSpec = (key: string, fallback = 'N/A'): string => {
    // 1. Check SKU specifications
    if (selectedSku?.specifications && selectedSku.specifications[key] !== undefined && selectedSku.specifications[key] !== null) {
      const val = String(selectedSku.specifications[key]).trim();
      if (!isInvalid(val)) return val;
    }
    // 2. Check Product specifications
    if (product.specifications && product.specifications[key] !== undefined && product.specifications[key] !== null) {
      const val = String(product.specifications[key]).trim();
      if (!isInvalid(val)) return val;
    }
    return fallback;
  };

  const getMultiSpec = (keys: string[], fallback = 'N/A'): string => {
    for (const k of keys) {
      const val = getSpec(k, '');
      if (!isInvalid(val)) return val;
    }
    return fallback;
  };

  // -------------------------------------------------------------
  // CONTROL GEAR SPECIFICATIONS MAPPING (Cols DU - EE)
  // -------------------------------------------------------------
  const familyName = product.families?.name || getMultiSpec(['series', 'series_name'], 'MEGAMAN® LUMINAIRE');
  // Column DU: Model Number
  const driverModelNumber = getMultiSpec(['driver_model', 'scg_driver_model_no', 'control_gear_model_no'], product.name || 'N/A');
  const supplierName = getSpec('supplier_name', 'MEGAMAN GmbH');
  const supplierAddress = getSpec('supplier_address', 'Halskestraße 22-26, AircomParc A140880 Ratingen Germany');

  // Specs
  // Column O (Input) & Columns DV, EO, EP (Output)
  let inputVoltage = getMultiSpec(['scg_input_voltage', 'rated_voltage_v', 'input_voltage'], 'AC220~240V');
  if (!isInvalid(inputVoltage) && !inputVoltage.toLowerCase().includes('v')) {
    inputVoltage = `${inputVoltage}V`;
  }

  const outputPowerSpec = getMultiSpec(['scg_max_output_power', 'max_output_power', 'on_mode_power_w'], '');
  const outputVoltageSpec = getMultiSpec(['output_votage_fixture_v', 'output_voltage_fixture_v', 'output_voltage'], '');
  const outputCurrentSpec = getMultiSpec(['output_current_fixture_ma', 'output_current'], '');

  const outputParts: string[] = [];
  if (!isInvalid(outputPowerSpec)) {
    outputParts.push(outputPowerSpec.toLowerCase().includes('w') ? outputPowerSpec : `${outputPowerSpec}W`);
  }
  if (!isInvalid(outputVoltageSpec)) {
    outputParts.push(outputVoltageSpec.toLowerCase().includes('v') ? outputVoltageSpec : `${outputVoltageSpec}V`);
  }
  if (!isInvalid(outputCurrentSpec)) {
    outputParts.push(outputCurrentSpec.toLowerCase().includes('ma') || outputCurrentSpec.toLowerCase().includes('a') ? outputCurrentSpec : `${outputCurrentSpec}mA`);
  }
  const formattedOutput = outputParts.length > 0 ? outputParts.join(' ') : '16.5W';

  const generalDesc = getMultiSpec(
    ['scg_general_description'], 
    `Input: ${inputVoltage} Output: ${formattedOutput}`
  );
  
  // Column DV: Maximum output power
  let maxOutputPower = getMultiSpec(['scg_max_output_power', 'max_output_power', 'on_mode_power_w'], '16.5W');
  if (!isInvalid(maxOutputPower) && maxOutputPower !== 'N/A' && !maxOutputPower.toLowerCase().includes('w')) {
    maxOutputPower = `${maxOutputPower}W`;
  }

  const typeLightSource = getMultiSpec(['lighting_tech', 'lamp_source', 'type_of_light_source'], 'LED');
  
  // Column DW: Efficiency in full-load
  let efficiencyFullLoad = getMultiSpec(['scg_efficiency_full_load', 'efficiency_full_load', 'total_mains_efficacy_lmw'], '92%');
  if (!isInvalid(efficiencyFullLoad) && efficiencyFullLoad !== 'N/A' && !efficiencyFullLoad.includes('%')) {
    efficiencyFullLoad = `${efficiencyFullLoad}%`;
  }

  // Column DX: No-load power (Pno)
  const noLoadPower = getMultiSpec(['scg_no_load_power', 'no_load_power'], 'not applicable');
  // Column DY: Standby Power (Psb)
  const standbyPower = getMultiSpec(['scg_standby_power', 'standby_power'], 'N/A');
  // Column DZ: Networked Standby Power (Pnet)
  const networkedStandbyPower = getMultiSpec(['scg_networked_standby_power', 'networked_standby_power'], 'N/A');

  // Column EA: Height
  const heightMm = getMultiSpec(['scg_outer_dimensions_height_mm', 'scg_height_mm', 'height_mm'], '25');
  // Column EB: Width
  const widthMm = getMultiSpec(['scg_outer_dimensions_width_mm', 'scg_width_mm', 'width_mm'], '47');
  // Column EC: Depth
  const depthMm = getMultiSpec(['scg_outer_dimensions_depth_mm', 'scg_depth_mm', 'depth_mm', 'length_mm'], '95');
  
  // Column ED: Mass in grams
  let massGrams = getMultiSpec(['scg_mass_g', 'mass_g', 'net_weight_g', 'weight'], '75');
  if (!isInvalid(massGrams) && massGrams !== 'N/A' && !massGrams.toLowerCase().includes('g')) {
    massGrams = `${massGrams}`;
  }

  // Column EE: Standards Compliance
  const standardsCompliance = getMultiSpec(['scg_standards_compliance', 'standards_compliance', 'standards'], 'EN 61347-1:2015 & EN61347-2-13:2014');

  // Dismantle Instruction PDF link
  const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  let diPdfUrl: string | null = null;
  if (product.families?.dismantleInstructionPdf) {
    const diObj = product.families.dismantleInstructionPdf;
    if (typeof diObj === 'string') {
      diPdfUrl = diObj.startsWith('http') ? diObj : `${payloadUrl}/api/media/${diObj}`;
    } else if (typeof diObj === 'object' && diObj !== null) {
      if (diObj.url) {
        diPdfUrl = diObj.url.startsWith('http') ? diObj.url : `${payloadUrl}${diObj.url.startsWith('/') ? '' : '/'}${diObj.url}`;
      } else if ((diObj as any).filename) {
        diPdfUrl = `${payloadUrl}/api/media/file/${(diObj as any).filename}`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <PrintController 
        cancelUrl={`/products/${product.id}`} 
        documentTitle={`Technical Document (Control Gear) - ${driverModelNumber}`}
        pdfApiUrl={`${payloadUrl}/api/products/${product.id}/technical-document?type=control-gear`}
      />

      {/* PAGE 1: CONTROL GEAR TECHNICAL DOCUMENT TABLE */}
      <A4Page>
        <div className="h-full flex flex-col justify-between font-sans text-[11px] text-gray-800">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col text-left">
                <h1 className="text-2xl font-normal text-[#009fe3] tracking-wide leading-tight">
                  {familyName}
                </h1>
                <span className="text-sm font-semibold text-gray-800 tracking-wide mt-0.5">
                  {driverModelNumber}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <img src="/MEGAMAN_Logo.png" alt="MEGAMAN® Logo" className="h-8 w-auto object-contain mb-1" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  TECHNICAL DOCUMENT- CONTROL GEAR
                </h2>
              </div>
            </div>

            {/* Top Info Table */}
            <table className="w-full border-collapse border border-gray-400 text-left mb-4">
              <tbody>
                <tr className="border-b border-gray-400">
                  <td className="w-1/3 p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Supplier’s name or trade mark:</td>
                  <td className="p-1.5 font-semibold">{supplierName}</td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Supplier’s address</td>
                  <td className="p-1.5">{supplierAddress}</td>
                </tr>
              </tbody>
            </table>

            {/* Model identifier Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-[#009fe3] mb-1">Model identifier</h3>
              <table className="w-full border-collapse border border-gray-400 text-left">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="w-1/3 p-1.5 border-r border-gray-400 bg-gray-50">Model Number</td>
                    <td className="p-1.5 font-semibold">{driverModelNumber}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">General description</td>
                    <td className="p-1.5">{generalDesc}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Technical Document Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-[#009fe3] mb-1">Technical Document</h3>
              <table className="w-full border-collapse border border-gray-400 text-left">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="w-1/3 p-1.5 border-r border-gray-400 bg-gray-50">Maximum output power</td>
                    <td className="p-1.5">{maxOutputPower}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Type of light source(s)</td>
                    <td className="p-1.5">{typeLightSource}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Efficiency in full-load</td>
                    <td className="p-1.5">{efficiencyFullLoad}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">No-load power (Pno)</td>
                    <td className="p-1.5">{noLoadPower}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Standby Power (Psb)</td>
                    <td className="p-1.5">{standbyPower}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Networked Standby Power (Pnet)</td>
                    <td className="p-1.5">{networkedStandbyPower}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Outer dimensions in mm Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-700 mb-1">Outer dimensions in mm</h3>
              <table className="w-full border-collapse border border-gray-400 text-left">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="w-1/3 p-1.5 border-r border-gray-400 bg-gray-50 pl-6">Height</td>
                    <td className="p-1.5">{heightMm}</td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50 pl-6">Width</td>
                    <td className="p-1.5">{widthMm}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50 pl-6">Depth</td>
                    <td className="p-1.5">{depthMm}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Other Attributes Section */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-gray-400 text-left">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="w-1/3 p-1.5 border-r border-gray-400 bg-gray-50">Mass in grams</td>
                    <td className="p-1.5">{massGrams}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Standards Compliance</td>
                    <td className="p-1.5">{standardsCompliance}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Warning Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-700 mb-1">Warning</h3>
              <div className="w-full border border-gray-400 min-h-[24px] p-1.5 bg-white"></div>
            </div>

            {/* Compatible Dimmers & WEEE Section */}
            <div className="border-t border-b border-gray-400 py-2 space-y-1 my-3 text-[10px]">
              <p className="text-gray-800">
                A list of compatible dimmers shall be provided on the website{' '}
                <a href="https://www.megaman.cc" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                  www.megaman.cc
                </a>
              </p>
              <p className="font-semibold text-gray-900">
                MEGAMAN | WEEE - Green Room | LED, Energy-efficient & Eco-friendly Lighting, Restriction of Hazardous Substances
              </p>
              <p>
                <a href="https://www.megaman.cc/resources/green-room/weee" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                  https://www.megaman.cc/resources/green-room/weee
                </a>
              </p>
            </div>

            {/* Identification and signature Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-700 mb-1">Identification and signature</h3>
              <div className="w-full border border-gray-400 min-h-[40px] p-1.5 bg-white"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-400 pt-2 text-center text-[9px] text-gray-600 font-sans">
            © Copyright 2026. All rights reserved by MEGAMAN®
          </div>
        </div>
      </A4Page>

      {/* Dismantle Instruction Pages */}
      <DismantleInstructionPages diPdfUrl={diPdfUrl} familyName={familyName} startPageNumber={2} />
    </div>
  );
}
