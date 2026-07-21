"use client";

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';
import { renderWithSup } from '../../utils/text';

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  category: string;
  duration: string;
}

interface VideosPageClientProps {
  initialVideos: VideoItem[];
}

const DEFAULT_CATEGORIES = ['All', 'Corporate', 'Smart Lighting', 'Installation', 'Case Study', 'Sustainability', 'Technical'];

export default function VideosPageClient({ initialVideos }: VideosPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Dynamically compute categories in case new ones are added in Payload
  const categories = useMemo(() => {
    const cats = new Set(DEFAULT_CATEGORIES);
    initialVideos.forEach(v => {
      if (v.category) cats.add(v.category);
    });
    return Array.from(cats);
  }, [initialVideos]);

  const filtered = useMemo(() => {
    return initialVideos.filter((v) => {
      if (activeCategory !== 'All' && v.category !== activeCategory) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesDesc = v.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [initialVideos, activeCategory, search]);

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen font-sans selection:bg-[#005288] selection:text-white">

      {/* Hero */}
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
                RESOURCES • MEDIA LIBRARY
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              TUTORIALS &amp; <span className="font-bold text-white">VIDEOS</span>
            </h1>
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              Product tutorials, installation guides, case studies, and corporate films from the MEGAMAN<sup>®</sup> media library.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200 py-3.5 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            <li><Link href="/" className="hover:text-[#005288] transition-colors">Home</Link></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300"><span className="text-gray-400">Resources</span></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300"><span className="text-gray-800 font-bold">Videos</span></li>
          </ol>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="container mx-auto max-w-7xl px-6 md:px-12 py-4 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH VIDEOS..."
              className="pl-8 pr-4 py-2 text-[10px] font-mono uppercase border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#005288] w-52"
            />
          </div>

          <div className="flex items-center gap-1 text-gray-300">
            <FontAwesomeIcon icon={faFilter} className="text-xs" />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'border-[#005288] bg-[#005288] text-white'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-20">
        {filtered.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-gray-300 bg-white">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">NO VIDEOS FOUND</p>
            <p className="text-sm text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((video) => (
              <div key={video.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col">

                {/* Thumbnail / Player */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  {playingId === video.id ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {/* Play button */}
                      <button
                        onClick={() => setPlayingId(video.id)}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        aria-label={`Play ${video.title}`}
                      >
                        <div className="w-14 h-14 rounded-full bg-[#005288] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faPlay} className="text-white text-lg ml-1" />
                        </div>
                      </button>
                      {/* Duration badge */}
                      <span className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-[9px] px-2 py-0.5 tracking-wider">
                        {video.duration}
                      </span>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-[#005288]/10 text-[#005288] px-2 py-1 font-bold">
                      {video.category}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2 leading-snug group-hover:text-[#005288] transition-colors line-clamp-2">
                    {renderWithSup(video.title)}
                  </h2>
                  {video.description && (
                    <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed line-clamp-3">
                      {renderWithSup(video.description)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="bg-[#005288] text-white py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-300 mb-2">TECHNICAL RESOURCES</p>
            <h3 className="text-xl font-light uppercase tracking-widest">Looking for Data Sheets &amp; Catalogs?</h3>
          </div>
          <Link
            href="/resources/downloads"
            className="border border-white/30 hover:bg-white hover:text-[#005288] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 self-start"
          >
            Go to Downloads →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
