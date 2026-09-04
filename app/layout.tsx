// app/layout.tsx
import Header from './components/Header';
import './globals.css';
import { ReactNode } from 'react';
import { getSiteContext } from './utils/siteContext';

export const metadata = {
  title: 'Megaman',
  description: 'The new Megaman Official website',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const siteContext = await getSiteContext();

  return (
    <html lang="en">
      <body>
        <Header initialSiteContext={siteContext} />
        <main>{children}</main>
      </body>
    </html>
  );
}