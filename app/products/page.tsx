import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsCatalog from './ProductsCatalog';
import { getSiteContext } from '../utils/siteContext';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Products Catalog | MEGAMAN® High-Performance LED Solutions',
  description: 'Explore Megaman\'s full architectural lighting catalog, featuring state-of-the-art Lamps, Indoor & Outdoor Lighting, Emergency systems, and Smart IoT Light Management solutions.',
};

interface Product {
  id: string;
  name: string;
  description?: string;
  images?: { url: string; alt?: string; filename?: string };
  sites?: string[];
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
  priority?: number;
  media: MediaItem[];
  products: Product[];
  categories?: {
    id: string;
    name: string;
    image?: { url: string; alt?: string; filename?: string } | string | null;
  }[];
}

async function getFamilies(): Promise<Family[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/families?depth=2&limit=1000&pagination=false&sort=-priority`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch families: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching families:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const [families, siteContext] = await Promise.all([
    getFamilies(),
    getSiteContext(),
  ]);

  // Filter products in each family to match the current site context and sort by priority
  const filteredFamilies = families
    .map(family => {
      const rawProducts = family.products || [];
      if (rawProducts.length === 0) {
        return family;
      }
      const matchingProducts = rawProducts.filter(product => {
        return !product.sites || product.sites.length === 0 || product.sites.includes(siteContext);
      });
      return {
        ...family,
        products: matchingProducts,
      };
    })
    .filter(family => {
      const origFamily = families.find(f => f.id === family.id);
      const origCount = (origFamily?.products || []).length;
      // If the family had products assigned, only hide if none match the current site context
      if (origCount > 0 && family.products.length === 0) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const pA = typeof a.priority === 'number' ? a.priority : 0;
      const pB = typeof b.priority === 'number' ? b.priority : 0;
      if (pB !== pA) {
        return pB - pA;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-24 text-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading catalog...</div>}>
      <ProductsCatalog families={filteredFamilies} />
    </Suspense>
  );
}