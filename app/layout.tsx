import type { Metadata } from 'next';
import Header from './components/Header';
import './globals.css';
import { ReactNode } from 'react';

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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}