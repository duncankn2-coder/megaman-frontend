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
    console.error('Error fetching product for Containing Product document:', error);
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
    console.error('Error fetching SKUs for Containing Product document:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  return {
    title: product ? `Technical Document (Containing Product) - ${product.name} | MEGAMAN®` : 'Technical Document (Containing Product) | MEGAMAN®',
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

export default async function ContainingProductDocumentPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(resolvedParams.id);
  const skus = await getProductSKUs(resolvedParams.id);

  if (!product) {
    return (
      <div className="p-12 text-center text-red-500 font-mono">
        <h1>Product not found</h1>
        <p>The requested containing product specifications could not be loaded.</p>
      </div>
    );
  }

  const selectedSku = resolvedSearchParams.sku 
    ? skus.find(s => s.name === resolvedSearchParams.sku) || skus[0]
    : skus[0];

  const isInvalid = (val?: string | null): boolean => {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return lower === '' || lower === 'n/a' || lower === 'n.a.' || lower === 'na' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === '—';
  };

  // Helper to extract values from specifications or SKU direct attributes
  const getSpec = (key: string, fallback = 'N/A'): string => {
    if (selectedSku?.specifications && selectedSku.specifications[key] !== undefined && selectedSku.specifications[key] !== null) {
      const val = String(selectedSku.specifications[key]).trim();
      if (!isInvalid(val)) return val;
    }
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
  // CONTAINING PRODUCT SPECIFICATIONS MAPPING
  // -------------------------------------------------------------
  const familyName = product.families?.name || getMultiSpec(['series_name', 'series'], 'MEGAMAN® LUMINAIRE');
  const containingProductModel = getMultiSpec(['customer_model_no_new', 'new_erp_model_no', 'model_number', 'model_no'], product.name || 'N/A');
  const supplierName = getSpec('supplier_name', 'MEGAMAN GmbH');
  const supplierAddress = getSpec('supplier_address', 'Halskestraße 22-26, AircomParc A140880 Ratingen Germany');
  const lightSourceModelIdentifier = getMultiSpec(['model_identifier', 'new_erp_supplier_model', 'light_source_model_number'], 'N/A');

  let lightSourcePower = getMultiSpec(['light_source_on_mode_power_w', 'on_mode_power_w', 'on_mode_power', 'power', 'wattage'], 'N/A');
  if (!isInvalid(lightSourcePower) && lightSourcePower !== 'N/A' && !lightSourcePower.toLowerCase().includes('w')) {
    lightSourcePower = `${lightSourcePower} W`;
  }

  let lightSourceWeightedEnergy = getMultiSpec(['energy_consumption_on_mode', 'weighted_energy_consumption', 'light_source_weighted_energy_consumption'], 'N/A');
  if (!isInvalid(lightSourceWeightedEnergy) && lightSourceWeightedEnergy !== 'N/A' && !lightSourceWeightedEnergy.toLowerCase().includes('kwh')) {
    lightSourceWeightedEnergy = `${lightSourceWeightedEnergy} kWh/1000hrs`;
  }

  const energyEfficiencyClass = getMultiSpec(['energy_efficiency_class', 'energy_class'], 'D');
  const controlGearModelIdentifier = getMultiSpec(['scg_driver_model_no', 'driver_model', 'control_gear_model_no'], 'N/A');

  const lightSourceRepRaw = getMultiSpec(['replacable_light_source', 'replaceable_light_source'], 'yes');
  const lightSourceReplaceable = (lightSourceRepRaw.toLowerCase() === 'no' || lightSourceRepRaw.toLowerCase() === 'false') ? 'NO' : 'YES';

  const controlGearRepRaw = getMultiSpec(['replaceble_control_gear', 'replaceable_control_gear'], 'yes');
  const controlGearReplaceable = (controlGearRepRaw.toLowerCase() === 'no' || controlGearRepRaw.toLowerCase() === 'false') ? 'NO' : 'YES';

  const standardsCompliance = getMultiSpec(['standards', 'standards_compliance', 'scg_standards_compliance'], 'IEC/EN60598-1,IEC/EN60598-2-1');

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
        documentTitle={`Technical Document (Containing Product) - ${containingProductModel}`}
        pdfApiUrl={`${payloadUrl}/api/products/${product.id}/technical-document?type=containing-product`}
      />

      {/* PAGE 1: CONTAINING PRODUCT TECHNICAL DOCUMENT TABLE */}
      <A4Page>
        <div className="h-full flex flex-col justify-between font-sans text-[11px] text-gray-800">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col text-left">
                <h1 className="text-2xl font-normal text-[#009fe3] tracking-wide leading-tight uppercase">
                  {familyName}
                </h1>
                <div className="text-xs font-bold text-gray-800 tracking-wide mt-1 flex items-center gap-1 font-mono">
                  <span>{containingProductModel}</span>
                  <span className="font-sans font-bold uppercase">TECHNICAL DOCUMENT- CONTAINING PRODUCT</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <img src="/MEGAMAN_Logo.png" alt="MEGAMAN® Logo" className="h-8 w-auto object-contain" />
              </div>
            </div>

            {/* Supplier Info Table */}
            <table className="w-full border-collapse border border-gray-400 text-left mb-3">
              <tbody>
                <tr className="border-b border-gray-400">
                  <td className="w-[38%] p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Supplier’s name or trade mark:</td>
                  <td className="p-1.5 font-semibold">{supplierName}</td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Supplier’s address</td>
                  <td className="p-1.5">{supplierAddress}</td>
                </tr>
              </tbody>
            </table>

            {/* Containing Product Technical Details Table */}
            <table className="w-full border-collapse border border-gray-400 text-left mb-3">
              <tbody>
                <tr className="border-b border-gray-400">
                  <td className="w-[38%] p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Model No. of Containing Product</td>
                  <td className="p-1.5 font-semibold">{containingProductModel}</td>
                </tr>
                <tr className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Model Identifier of Light Source</td>
                  <td className="p-1.5 font-semibold">{lightSourceModelIdentifier}</td>
                </tr>
                <tr className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Light Source On-mode Power (Pon)</td>
                  <td className="p-1.5">{lightSourcePower}</td>
                </tr>
                <tr className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Light Source Weighted Energy Consumption</td>
                  <td className="p-1.5">{lightSourceWeightedEnergy}</td>
                </tr>
                <tr className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Energy Efficiency Class</td>
                  <td className="p-1.5 font-semibold">{energyEfficiencyClass}</td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Model Identifier of Control Gear</td>
                  <td className="p-1.5">{controlGearModelIdentifier}</td>
                </tr>
              </tbody>
            </table>

            {/* Replaceability Section */}
            <div className="mb-3">
              <div className="border border-b-0 border-gray-400 p-1.5 bg-gray-50 font-medium text-xs">
                Replaceability<sup>(1)</sup>
              </div>
              <table className="w-full border-collapse border border-gray-400 text-left">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="w-[38%] p-1.5 border-r border-gray-400 bg-gray-50">Light Source(s)</td>
                    <td className="p-1.5 font-bold">{lightSourceReplaceable}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-gray-400 bg-gray-50">Control Gear(s)</td>
                    <td className="p-1.5 font-bold">{controlGearReplaceable}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Standards Compliance Table */}
            <table className="w-full border-collapse border border-gray-400 text-left mb-4">
              <tbody>
                <tr>
                  <td className="w-[38%] p-1.5 border-r border-gray-400 bg-gray-50 font-medium">Standards Compliance</td>
                  <td className="p-1.5 font-mono">{standardsCompliance}</td>
                </tr>
              </tbody>
            </table>

            {/* WEEE / Eco Link Section */}
            <div className="border-t border-b border-gray-400 py-2 space-y-1 mb-4 text-[10px]">
              <p className="font-semibold text-gray-900">
                MEGAMAN | WEEE - Green Room | LED, Energy-efficient &amp; Eco-friendly Lighting, Restriction of Hazardous Substances
              </p>
              <p>
                <a href="https://www.megaman.cc/resources/green-room/weee" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                  https://www.megaman.cc/resources/green-room/weee
                </a>
              </p>
            </div>

            {/* Remarks Section */}
            <div className="text-[10px] leading-snug text-gray-800 space-y-1 font-sans">
              <p className="font-bold text-gray-900">Remarks:</p>
              <p className="font-semibold">1) Replaceability</p>
              <p className="pl-3">
                <span className="font-bold">Yes:</span> Replaceable. Light sources or/and separate control gears on this luminaire can be replaced with the use of common available tools and without permanent damage to the containing product
              </p>
              <p className="pl-3 pt-1">
                <span className="font-bold">NO:</span> Non replaceable. Replacement of light sources or/and separate control gear(s) is not applicable to this luminaires in, because of the following cases:
              </p>
              <ul className="pl-6 space-y-1 pt-0.5">
                <li className="flex items-start">
                  <span className="mr-1.5 font-bold">▪</span>
                  <span>If, due to the required technical design of the luminaire, there is no protection against electric shock when replacing the light source or the control-gear.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1.5 font-bold">▪</span>
                  <span>If, due to IP protection requirements, the luminaire housing is glued to provide effective protection against the ingress of water, moisture, and foreign bodies (e.g., tools, dirt, etc.).</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1.5 font-bold">▪</span>
                  <span>If the luminaire is designed in such a way that the light sources could be contaminated and/or damaged during replacement due to dirt particles or electrostatic discharge (ESD) and/or if the method of fixing the light sources could impact its thermal efficiency (heat dissipation).</span>
                </li>
              </ul>
              <p className="pl-6 pt-1 text-gray-600 italic">
                Examples of the abovementioned include, but are not limited to, the luminaires designed in such a way that the optical control is altered, prison cell lighting, and luminaires that could be easily accessed by a child.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-400 pt-2 text-center text-[9px] text-gray-600 font-sans mt-auto">
            © Copyright 2020. All rights reserved by MEGAMAN®
          </div>
        </div>
      </A4Page>
    </div>
  );
}
