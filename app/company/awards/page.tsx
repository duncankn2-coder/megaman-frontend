import { Metadata } from 'next';
import AwardsClientPage, { AwardItem } from './AwardsClientPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Honors & Awards | MEGAMAN®',
  description: 'MEGAMAN® has been endorsed globally by international bodies for Environmental Achievement, Quality Standards, Technological Innovation, and CSR Management.',
};

async function getAwards(): Promise<AwardItem[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    // Fetch up to 150 awards. Set depth=1 to populate the upload media relationship
    const response = await fetch(`${payloadUrl}/api/awards?limit=150&depth=1`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.docs || [];
    }
    console.error('Failed to fetch awards, status code:', response.status);
    return [];
  } catch (error) {
    console.error('Error fetching awards from payload:', error);
    return [];
  }
}

export default async function AwardsPage() {
  const awards = await getAwards();
  return <AwardsClientPage initialAwards={awards} />;
}
