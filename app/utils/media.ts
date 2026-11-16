export interface MediaLike {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
}

export function getPayloadUrl(): string {
  return (process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

function rewriteLocalhostUrl(url: string, baseUrl: string): string {
  const isLocalhostUrl = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
  const isBaseUrlLocalhost = baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000');
  if (isLocalhostUrl && !isBaseUrlLocalhost) {
    return url
      .replace(/^https?:\/\/localhost:3000/, baseUrl)
      .replace(/^https?:\/\/127\.0\.0\.1:3000/, baseUrl);
  }
  return url;
}

export function getImageUrl(
  image: MediaLike | string | null | undefined,
  fallback = '/placeholder.png',
): string {
  if (!image) return fallback;
  const baseUrl = getPayloadUrl();

  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('http') || trimmed.startsWith('//')) {
      return rewriteLocalhostUrl(trimmed, baseUrl);
    }
    if (trimmed.startsWith('/api/') || trimmed.startsWith('/media/')) {
      return `${baseUrl}${trimmed}`;
    }
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      return fallback;
    }
    return `${baseUrl}/media/${trimmed}`;
  }

  if (image.url) {
    const url = image.url.trim();
    if (url.startsWith('http') || url.startsWith('//')) {
      return rewriteLocalhostUrl(url, baseUrl);
    }
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  if (image.filename) {
    return `${baseUrl}/api/media/file/${encodeURIComponent(image.filename)}`;
  }

  return fallback;
}
