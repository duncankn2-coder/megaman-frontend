import type { NextConfig } from "next";
import path from "path";

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
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          'E:/System Volume Information/**',
          'E:/found.*/**',
          '**/System Volume Information/**',
          '**/found.*/**',
        ],
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress: true,
  experimental: {
    optimizePackageImports: [
      '@fortawesome/free-solid-svg-icons',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/**',
      },
      // Dynamically support whatever NEXT_PUBLIC_PAYLOAD_URL is configured
      {
        protocol: protocol,
        hostname: hostname,
        port: port || undefined,
        pathname: '/**',
      },
      // Add wildcard vercel.app domains just in case they are used
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
      // Explicit backend production hostname
      {
        protocol: 'https',
        hostname: 'megaman-backend.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/resources',
        destination: '/resources/downloads',
        permanent: false,
      },
      {
        source: '/company',
        destination: '/company/about-megaman',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/media/file/:path*',
        destination: `${payloadUrl}/api/media/file/:path*`,
      },
      {
        source: '/api/media/:path*',
        destination: `${payloadUrl}/api/media/:path*`,
      },
    ];
  },
};

export default nextConfig;

