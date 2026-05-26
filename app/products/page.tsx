import { Metadata } from 'next';
import ProductsCatalog from './ProductsCatalog';

export const metadata: Metadata = {
  title: 'Products Catalog | MEGAMAN® High-Performance LED Solutions',
  description: 'Explore Megaman\'s full architectural lighting catalog, featuring state-of-the-art Lamps, Indoor & Outdoor Lighting, Emergency systems, and Smart IoT Light Management solutions.',
};

interface Product {
  id: string;
  name: string;
  description?: string;
  categories: { id: string; name: string }[];
  images?: { url: string; alt?: string; filename?: string };
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
  media: MediaItem[];
  products: Product[];
}

async function getFamilies(): Promise<Family[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/families?depth=2`, {
      cache: 'no-store',
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
  const families = await getFamilies();

  return <ProductsCatalog families={families} />;
}