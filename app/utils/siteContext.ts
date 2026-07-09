import { headers } from 'next/headers';

export async function getSiteContext(): Promise<'hk' | 'international'> {
  const headersList = await headers();
  const context = headersList.get('x-site-context');
  return (context as 'hk' | 'international') || 'international';
}
