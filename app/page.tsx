/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'High-Performance LED Lighting Solutions | MEGAMAN® Official',
  description: 'Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994. Explore Siena, Toledo, Triona, and Ingenium Matter solutions.',
};

async function getHomePageData() {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/globals/home-page?depth=4`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch home page: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching home page layout from CMS:', error);
    return null;
  }
}

async function getProductsCount(): Promise<number> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/products`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.totalDocs || data.docs?.length || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching products count:', error);
    return 0;
  }
}

async function getLatestNews(): Promise<any[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/news?sort=-publishDate&limit=3`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.docs || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching latest news articles:', error);
    return [];
  }
}

export default async function Home() {
  // Fetch home page data, product counts, and news in parallel on the server
  const [homePageData, productsCount, latestNews] = await Promise.all([
    getHomePageData(),
    getProductsCount(),
    getLatestNews()
  ]);

  const layoutData = homePageData?.layout || null;

  return (
    <HomeClient 
      layoutData={layoutData}
      initialProductsCount={productsCount}
      initialLatestNews={latestNews}
    />
  );
}