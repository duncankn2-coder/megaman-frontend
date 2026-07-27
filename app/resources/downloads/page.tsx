import { Metadata } from 'next';
import DownloadsPageClient, { CatalogItem } from './DownloadsPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Downloads & Catalogs | MEGAMAN® High-Performance LED Solutions',
  description: 'Access Megaman\'s technical planning resources, product brochures, dialux files, and comprehensive catalogs.',
};

// Fallback high-quality mock catalogs to show if CMS is empty or unreachable
const FALLBACK_CATALOGS: CatalogItem[] = [
  {
    id: 'mock-1',
    title: 'MEGAMAN® Complete Lamps Catalog 2026',
    description: 'Explore the full spectrum of MEGAMAN® LED Lamps, including classic models, warm decorative filament series, smart mesh networks, and custom tubes.',
    category: 'lamps',
    catalogFile: '#',
    image: '/banners/products.jpg',
  },
  {
    id: 'mock-2',
    title: 'MEGAMAN® Indoor Lighting Solutions',
    description: 'Recessed low-glare downlights, customizable track profiles, continuous linear fixtures, and human-centric panel options for commercial/retail design.',
    category: 'indoor',
    catalogFile: '#',
    image: '/hospitality_project_lobby.png',
  },
  {
    id: 'mock-3',
    title: 'MEGAMAN® Outdoor Lighting Solutions',
    description: 'High-efficiency industrial floodlights, garden spike lights, wall-mounted bulkhead systems, and municipal path illumination.',
    category: 'outdoor',
    catalogFile: '#',
    image: '/banners/environment-banner.jpg',
  },
  {
    id: 'mock-4',
    title: 'MEGAMAN® Emergency Lighting & Control systems',
    description: 'Architectural compliance guidelines, standalone emergency twinspots, exit signs, and backup power battery configurations.',
    category: 'technical',
    catalogFile: '#',
    image: '/banners/award.jpg',
  },
];

async function getCatalogs(): Promise<CatalogItem[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/catalogs?limit=100`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch catalogs: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching catalogs from CMS:', error);
    return [];
  }
}

export default async function DownloadsPage() {
  const catalogs = await getCatalogs();
  return <DownloadsPageClient initialCatalogs={catalogs.length > 0 ? catalogs : FALLBACK_CATALOGS} />;
}
