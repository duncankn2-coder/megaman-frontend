import { MetadataRoute } from 'next';

async function fetchCollectionDocs(collection: string, selectQuery: string): Promise<any[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const res = await fetch(`${payloadUrl}/api/${collection}?limit=1000&depth=0&${selectQuery}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.docs) ? data.docs : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://megaman.cc';
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/company/about-megaman`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/company/news-and-press`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/company/awards`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/company/quality`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/company/environment-and-sustainability`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/resources/downloads`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/resources/videos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const [families, projects, news] = await Promise.all([
    fetchCollectionDocs('families', 'select[slug]=true&select[updatedAt]=true'),
    fetchCollectionDocs('projects', 'select[slug]=true&select[updatedAt]=true'),
    fetchCollectionDocs('news', 'select[updatedAt]=true'),
  ]);

  const familyEntries: MetadataRoute.Sitemap = families
    .filter((f) => f?.slug || f?.id)
    .map((f) => ({
      url: `${baseUrl}/families/${encodeURIComponent(String(f.slug || f.id))}`,
      lastModified: f.updatedAt ? new Date(f.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const projectEntries: MetadataRoute.Sitemap = projects
    .filter((p) => p?.slug)
    .map((p) => ({
      url: `${baseUrl}/projects/${encodeURIComponent(String(p.slug))}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const newsEntries: MetadataRoute.Sitemap = news
    .filter((n) => n?.id)
    .map((n) => ({
      url: `${baseUrl}/company/news-and-press/${encodeURIComponent(String(n.id))}`,
      lastModified: n.updatedAt ? new Date(n.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticEntries, ...familyEntries, ...projectEntries, ...newsEntries];
}
