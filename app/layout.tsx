import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import Header from './components/Header';
import './globals.css';
import { ReactNode } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

config.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://megaman.cc'),
  title: {
    default: 'MEGAMAN | LED, Luminaires, Components, Smart Lighting & Energy-efficient Lighting',
    template: '%s | MEGAMAN',
  },
  description: 'Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994. Explore LED luminaires, smart lighting, lamps, and components.',
  applicationName: 'megaman.cc',
  authors: [{ name: 'megaman.cc', url: 'https://megaman.cc' }],
  creator: 'MEGAMAN',
  publisher: 'MEGAMAN',
  openGraph: {
    siteName: 'megaman.cc',
    title: 'MEGAMAN | LED, Luminaires, Components, Smart Lighting & Energy-efficient Lighting',
    description: 'Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994. Explore LED luminaires, smart lighting, lamps, and components.',
    url: 'https://megaman.cc',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://megaman.cc',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'megaman.cc',
  alternateName: ['MEGAMAN', 'megaman.cc'],
  url: 'https://megaman.cc/',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://megaman-backend.vercel.app" />
        <link rel="dns-prefetch" href="https://megaman-backend.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}