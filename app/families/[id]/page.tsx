import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FamilyDetailClient from './FamilyDetailClient';

export const revalidate = 300;

interface Product {
  id: string;
  name: string;
  description?: string;
  categories: { id: string; name: string }[];
  images?: { url: string; alt?: string; filename?: string };
  colour?: string;
  power?: string;
  colourTemperature?: string;
  specifications?: Record<string, unknown> | null;
  symbols?: SymbolItem[] | null;
  userManual?: any;
  lightSpectrumGraph?: any;
  lightSpectrumGraphs?: any[];
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

interface Family {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  media: MediaItem[];
  products: Product[];
  accessoryProducts?: Product[];
  userManual?: any;
  dismantleInstructionPdf?: any;
  lineDrawing?: any;
  lightSpectrumGraph?: any;
  spectrumImage?: any;
  lightSpectrumGraphs?: any[];
  photometryLdt?: any;
  photometryIes?: any;
  features?: { id?: string; feature: string }[];
  symbols?: SymbolItem[];
  layout?: any[];
  selectedParameters?: string[];
  datasheet?: any;
  accessories?: any[];
}

const getFamily = cache(async function getFamily(idOrSlug: string): Promise<Family | null> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    // 1. Try finding by readable slug first
    const slugRes = await fetch(`${payloadUrl}/api/families?where[slug][equals]=${encodeURIComponent(idOrSlug)}&depth=2`, {
      next: { revalidate: 300 },
    });
    if (slugRes.ok) {
      const data = await slugRes.json();
      if (data.docs && data.docs.length > 0) {
        return data.docs[0];
      }
    }
    // 2. Fallback to direct ID fetch for backward compatibility
    const response = await fetch(`${payloadUrl}/api/families/${encodeURIComponent(idOrSlug)}?depth=2`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch family: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching family:', error);
    return null;
  }
});

export async function generateStaticParams() {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const res = await fetch(`${payloadUrl}/api/families?limit=100&depth=0`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs || []).flatMap((fam: any) => {
      const entries: { id: string }[] = [];
      if (fam.id) entries.push({ id: String(fam.id) });
      if (fam.slug) entries.push({ id: String(fam.slug) });
      return entries;
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const family = await getFamily(resolvedParams.id);

  if (!family) {
    return {
      title: 'Series Not Found | MEGAMAN®',
    };
  }

  return {
    title: `${family.name} Series | MEGAMAN® Architectural Lighting`,
    description: family.description || `Explore the technical configurations, photometrics and specifications of the MEGAMAN® ${family.name} series downlights.`,
  };
}

async function fetchSkusByProductIds(productIds: string[], productsById: Map<string, any>): Promise<any[]> {
  if (productIds.length === 0) return [];
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const queryParams = productIds.map((id, idx) => `where[product][in][${idx}]=${encodeURIComponent(id)}`).join('&');
    const res = await fetch(`${payloadUrl}/api/skus?${queryParams}&limit=1000&depth=1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs || []).map((sku: any) => {
      const rawProdId = typeof sku.product === 'object' && sku.product !== null ? sku.product.id : sku.product;
      const populatedProd = rawProdId ? productsById.get(String(rawProdId)) : null;
      return populatedProd ? { ...sku, product: populatedProd } : sku;
    });
  } catch (err) {
    console.error('Error fetching SKUs in FamilyDetailPage:', err);
    return [];
  }
}

async function fetchAllSymbols(): Promise<any[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const res = await fetch(`${payloadUrl}/api/symbols?limit=1000&depth=1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch (err) {
    console.error('Error fetching symbols in FamilyDetailPage:', err);
    return [];
  }
}

export default async function FamilyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const family = await getFamily(resolvedParams.id);

  if (!family) {
    notFound();
  }

  const accessoryIdSet = new Set<string>(
    ((family as any).accessoryProducts || [])
      .map((p: any) => (typeof p === 'object' && p?.id ? String(p.id) : String(p)))
      .filter(Boolean)
  );

  const mainProducts = (family.products || []).filter(
    (p: any) => typeof p === 'object' && p !== null && !accessoryIdSet.has(String(p.id))
  );
  const mainProductIds = mainProducts.map((p: any) => String(p.id));
  const mainProductsById = new Map<string, any>(mainProducts.map((p: any) => [String(p.id), p]));

  const accIdSet = new Set<string>();
  const accProductsById = new Map<string, any>();
  ((family as any).accessoryProducts || []).forEach((p: any) => {
    if (typeof p === 'object' && p?.id) {
      accIdSet.add(String(p.id));
      accProductsById.set(String(p.id), p);
    } else if (typeof p === 'string' && p) {
      accIdSet.add(p);
    }
  });
  ((family as any).accessories || []).forEach((acc: any) => {
    if (acc?.product) {
      const pid = typeof acc.product === 'object' && acc.product?.id ? String(acc.product.id) : String(acc.product);
      if (pid) accIdSet.add(pid);
    }
  });
  (family.products || []).forEach((p: any) => {
    if (p && typeof p === 'object' && p.id) {
      accProductsById.set(String(p.id), p);
    }
  });
  const accProductIds = Array.from(accIdSet);

  const [initialSkus, initialAccessorySkus, initialSymbols] = await Promise.all([
    fetchSkusByProductIds(mainProductIds, mainProductsById),
    fetchSkusByProductIds(accProductIds, accProductsById),
    fetchAllSymbols(),
  ]);

  return (
    <FamilyDetailClient
      family={family}
      initialSkus={initialSkus}
      initialAccessorySkus={initialAccessorySkus}
      initialSymbols={initialSymbols}
    />
  );
}
