"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSearch, faFilePdf, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';

export interface CatalogItem {
  id: string;
  title: string;
  description?: string;
  category: 'general' | 'lamps' | 'indoor' | 'outdoor' | 'technical' | string;
  catalogFile: {
    url: string;
    filename?: string;
    alt?: string;
  } | string;
  image?: {
    url: string;
    filename?: string;
    alt?: string;
  } | string | null;
}

interface DownloadsPageClientProps {
  initialCatalogs: CatalogItem[];
}

const CATEGORY_MAP: Record<string, string> = {
  All: 'All Resources',
  general: 'General / Corporate',
  lamps: 'Lamps Catalogues',
  indoor: 'Indoor Lighting',
  outdoor: 'Outdoor Lighting',
  technical: 'Technical Guides',
};

const getImageUrl = (image: any): string => {
  if (!image) return '';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('//') || image.startsWith('/')) return image;
    return `${baseUrl}/media/${image}`;
  }
  if (image.url) {
    if (image.url.startsWith('http') || image.url.startsWith('//')) return image.url;
    return `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }
  if (image.filename) {
    return `${baseUrl}/media/${image.filename}`;
  }
  return '';
};

const getFileUrl = (file: any): string => {
  if (!file) return '#';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  if (typeof file === 'string') {
    if (file.startsWith('http') || file.startsWith('//') || file.startsWith('/')) return file;
    return `${baseUrl}/media/${file}`;
  }
  if (file.url) {
    if (file.url.startsWith('http') || file.url.startsWith('//')) return file.url;
    return `${baseUrl}${file.url.startsWith('/') ? '' : '/'}${file.url}`;
  }
  if (file.filename) {
    return `${baseUrl}/media/${file.filename}`;
  }
  return '#';
};

export default function DownloadsPageClient({ initialCatalogs }: DownloadsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    initialCatalogs.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats);
  }, [initialCatalogs]);

  const filtered = useMemo(() => {
    return initialCatalogs.filter((c) => {
      if (activeCategory !== 'All' && c.category !== activeCategory) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [initialCatalogs, activeCategory, search]);

  const handleDownload = async (fileObj: any, title: string) => {
    const fileUrl = getFileUrl(fileObj);
    if (!fileUrl || fileUrl === '#') {
      alert('The selected catalog is currently unavailable for download. Please contact support.');
      return;
    }
    
    // Attempt elegant direct blob download to enforce file saving
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileObj?.filename || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Direct download failed, falling back to open in tab', err);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen font-sans selection:bg-[#005288] selection:text-white">
      {/* Premium Hero Header */}
      <section className="relative bg-gradient-to-r from-[#003457] to-[#005288] text-white min-h-[320px] flex items-center overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-white" />
          <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-white" />
          <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-white" />
        </div>
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">
                TECHNICAL RESOURCES
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              CATALOGUES &amp; <span className="font-bold text-white">DOWNLOADS</span>
            </h1>
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              Access the complete range of MEGAMAN® lighting catalogs, technical planning data, and environmental reports in high-quality PDF formats.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200 py-3.5 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#005288] transition-colors">Home</Link>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-400">Resources</span>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-800 font-bold">Downloads</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Filters & Search sticky bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#005288] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {CATEGORY_MAP[cat] || cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 order-1 md:order-2">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog title..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 text-xs rounded-none focus:outline-none focus:border-[#005288] transition-colors font-mono uppercase tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* Main Catalogues Grid */}
      <section className="py-20 px-6 md:px-12 container mx-auto max-w-7xl">
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 bg-white max-w-lg mx-auto">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-300 text-3xl mb-4" />
            <p className="text-gray-500 font-light text-sm">No downloadable catalogues found matching your selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((item) => {
              const coverUrl = getImageUrl(item.image);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 flex flex-col group hover:shadow-lg transition-all duration-500 overflow-hidden relative"
                >
                  {/* Card Cover Wrapper */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border-b border-gray-100">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      /* Minimalist Premium Typographic Cover Placeholder when no image is uploaded */
                      <div className="absolute inset-0 bg-gradient-to-br from-[#003457] via-[#005288] to-blue-900 text-white p-6 flex flex-col justify-between select-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono tracking-widest font-bold text-blue-300 uppercase">
                            MEGAMAN® OFFICIAL
                          </span>
                          <FontAwesomeIcon icon={faFilePdf} className="text-blue-300 text-base" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-0.5 w-8 bg-blue-400" />
                          <h4 className="text-lg font-light leading-snug uppercase tracking-wider">
                            {item.title}
                          </h4>
                        </div>
                        <div className="text-[8px] font-mono text-blue-300 uppercase tracking-widest">
                          PDF DOCUMENT ARCHIVE
                        </div>
                      </div>
                    )}

                    {/* Quick Download Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <button className="bg-white text-gray-900 border border-gray-100 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <FontAwesomeIcon icon={faDownload} />
                        Download File
                      </button>
                    </div>
                  </div>

                  {/* Card Info Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#005288] font-bold mb-2.5 block">
                        {CATEGORY_MAP[item.category] || item.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#005288] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 font-light mt-3 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownload(item.catalogFile, item.title)}
                      className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-[#005288] text-[#005288] hover:text-white border border-gray-100 hover:border-[#005288] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-sans"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-xs" />
                      Get PDF Document
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
