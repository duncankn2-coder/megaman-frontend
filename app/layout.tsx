// app/layout.tsx
import Header from './components/Header';
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Megaman',
  description: 'The new Megaman Official website',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}