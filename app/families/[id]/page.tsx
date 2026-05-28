import { Metadata } from 'next';
import FamilyDetailClient from './FamilyDetailClient';

export const dynamic = 'force-dynamic';

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

async function getFamily(id: string): Promise<Family | null> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/families/${id}?depth=2`, {
      cache: 'no-store',
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

export default async function FamilyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const family = await getFamily(resolvedParams.id);

  if (!family) {
    return (
      <div className="container mx-auto p-12 text-center text-gray-500">
        <h2 className="text-xl font-bold mb-2">Series Not Found</h2>
        <p className="text-sm">The product series you are looking for does not exist or has been moved.</p>
      </div>
    );
  }

  return <FamilyDetailClient family={family} />;
}
