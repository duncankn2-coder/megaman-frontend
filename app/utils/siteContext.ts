import { headers } from 'next/headers';

export type SiteContext = 'international' | 'hk' | 'uk';

export async function getSiteContext(): Promise<SiteContext> {
  const headersList = await headers();
  const context = headersList.get('x-site-context');
  return (context as SiteContext) || 'international';
}

