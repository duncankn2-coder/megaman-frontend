"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6 md:px-12 relative z-10 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Col 1: Megaman Corporate Info */}
        <div>
          <Link href="/">
            <Image 
              src="/MEGAMAN_Logo.png" 
              alt="Megaman Logo" 
              width={140} 
              height={45} 
              className="h-10 w-auto object-contain mb-6 mix-blend-multiply"
            />
          </Link>
          <p className="text-[11px] text-gray-500 font-light leading-relaxed max-w-xs">
            Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4 font-sans">PRODUCTS</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light font-sans">
            <li><Link href="/products?category=Lamps" className="hover:text-[#005288] transition-colors">LED Lamps & Classic Bulbs</Link></li>
            <li><Link href="/products?category=Indoor%20Lighting" className="hover:text-[#005288] transition-colors">Architectural Downlights</Link></li>
            <li><Link href="/products?category=Outdoor%20Lighting" className="hover:text-[#005288] transition-colors">Outdoor Battens & Floodlights</Link></li>
            <li><Link href="/products?category=Light%20Management" className="hover:text-[#005288] transition-colors">INGENIUM Smart Matter</Link></li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4 font-sans">RESOURCES</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light font-sans">
            <li><Link href="/resources/downloads" className="hover:text-[#005288] transition-colors">Technical Download Center</Link></li>
            <li><Link href="/company/news-and-press" className="hover:text-[#005288] transition-colors">Latest News & Press</Link></li>
            <li><Link href="/company/quality" className="hover:text-[#005288] transition-colors">Quality Assurance Standards</Link></li>
            <li><Link href="/resources/videos" className="hover:text-[#005288] transition-colors">Tutorials & Case Videos</Link></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4 font-sans font-semibold">NEWSLETTER</h4>
          <p className="text-[11px] text-gray-500 font-light mb-4 leading-relaxed font-sans">
            Sign up for professional specifications updates, DIALux models release, and design releases.
          </p>
          <div className="flex border border-gray-300 bg-white shadow-sm">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="bg-transparent text-xs p-3 flex-1 focus:outline-none placeholder:text-gray-400 uppercase text-gray-700 font-mono"
            />
            <button 
              onClick={() => alert('Subscription successful!')}
              className="bg-[#005288] text-white text-xs px-4 uppercase font-bold hover:bg-[#003c64] transition-colors cursor-pointer font-sans"
            >
              JOIN
            </button>
          </div>
        </div>
      </div>

      {/* Copy / Legals row */}
      <div className="max-w-7xl mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-light gap-4">
        <p>&copy; {new Date().getFullYear()} MEGAMAN®. ALL RIGHTS RESERVED. POWERED BY ARCHITECTURAL STANDARDS.</p>
        <div className="flex gap-6 uppercase tracking-wider font-mono">
          <Link href="#" className="hover:text-[#005288] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#005288] transition-colors">Terms of Use</Link>
          <Link href="#" className="hover:text-[#005288] transition-colors">Cookies Config</Link>
        </div>
      </div>
    </footer>
  );
}
