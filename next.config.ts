import type { NextConfig } from "next";

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
let protocol: 'http' | 'https' = 'http';
let hostname = 'localhost';
let port = '3000';

try {
  const url = new URL(payloadUrl);
  protocol = url.protocol.replace(':', '') as 'http' | 'https';
  hostname = url.hostname;
  port = url.port || '';
} catch (e) {
  // Ignore parsing errors and keep defaults
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      // Dynamically support whatever NEXT_PUBLIC_PAYLOAD_URL is configured
      {
        protocol: protocol,
        hostname: hostname,
        port: port || undefined,
        pathname: '/api/media/file/**',
      },
      {
        protocol: protocol,
        hostname: hostname,
        port: port || undefined,
        pathname: '/media/**',
      },
      // Add wildcard vercel.app domains just in case they are used
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/media/file/**',
      },
      // Vercel Blob Storage CDN (used in production for Payload media)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

