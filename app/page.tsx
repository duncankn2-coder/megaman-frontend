"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import Footer from './components/Footer';

interface CmsMedia {
  id: string;
  url?: string;
  filename?: string;
  alt?: string;
  type?: 'image' | 'video' | 'document';
  mimeType?: string;
}

interface CmsProduct {
  id: string;
  name: string;
  description?: string;
  images?: CmsMedia | null;
  families?: {
    id: string;
    name: string;
  } | string | null;
  colour?: string;
  power?: string;
  colourTemperature?: string;
}

interface CmsProject {
  id: string;
  title: string;
  description?: string;
  location?: string;
  images?: CmsMedia | null;
}

interface CmsNewsItem {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  summary: string;
  image?: CmsMedia | null;
  linkText?: string;
  linkUrl?: string;
}

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  image: CmsMedia | null;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroBlock {
  blockType: 'hero';
  slides: HeroSlide[];
}

interface CategoryItem {
  id?: string;
  number: string;
  title: string;
  description?: string;
  parameterLabel?: string;
  parameterValue: string;
  linkUrl: string;
  linkText?: string;
}

interface CategoriesGridBlock {
  blockType: 'categoriesGrid';
  title: string;
  subtitle?: string;
  categories: CategoryItem[];
}

interface EditorialBlock {
  blockType: 'editorial';
  id?: string;
  title: string;
  subtitle?: string;
  content?: string;
  image?: CmsMedia | null;
  linkText?: string;
  linkUrl?: string;
  layout?: 'grid' | 'split-left' | 'split-right';
}

interface HighlightProductsBlock {
  blockType: 'highlightProducts';
  title: string;
  subtitle?: string;
  products: CmsProduct[];
}

interface InspirationBlock {
  blockType: 'inspiration';
  title: string;
  subtitle?: string;
  projects: CmsProject[];
}

interface NewsBlock {
  blockType: 'news';
  title: string;
  subtitle?: string;
  source: 'latest' | 'custom';
  featuredNews?: CmsNewsItem[];
}

type CmsBlock = HeroBlock | CategoriesGridBlock | EditorialBlock | HighlightProductsBlock | InspirationBlock | NewsBlock;

export default function Home() {

  // Dynamic Layout Blocks from CMS Globals
  const [cmsBlocks, setCmsBlocks] = useState<CmsBlock[]>([]);
  const [latestNews, setLatestNews] = useState<CmsNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carousel Hero States
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const heroBlock = cmsBlocks.find(b => b.blockType === 'hero') as HeroBlock | undefined;
  const heroSlides = heroBlock?.slides || [];
  const totalSlides = heroSlides.length > 0 ? heroSlides.length : 3;

  // Autoplay functionality: slide transitions every 6 seconds, pauses on mouse hover
  useEffect(() => {
    if (!isHovered) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
    }
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isHovered, totalSlides]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  // Highlighted Products Slider controls
  const highlightSliderRef = useRef<HTMLDivElement>(null);
  const scrollHighlight = (direction: 'left' | 'right') => {
    if (highlightSliderRef.current) {
      const container = highlightSliderRef.current;
      const scrollAmount = container.clientWidth * 0.8; // scroll by 80% of container width to keep context
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Helper function to resolve media image URLs safely
  const getCmsImageUrl = (image: CmsMedia | string | null | undefined) => {
    if (!image) return null;
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    
    // Trim trailing slash to avoid double-slashes or missed slashes
    const cleanBaseUrl = payloadUrl.endsWith('/') ? payloadUrl.slice(0, -1) : payloadUrl;

    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      if (image.startsWith('/')) return `${cleanBaseUrl}${image}`;
      // If it is a 24-character hex string, it is an unpopulated MongoDB ObjectId, so return null
      if (/^[0-9a-fA-F]{24}$/.test(image)) return null;
      // Otherwise, assume it is a filename and append under media path
      return `${cleanBaseUrl}/media/${image}`;
    }

    const url = image.url || '';
    if (url) {
      if (url.startsWith('http')) return url;
      return url.startsWith('/') ? `${cleanBaseUrl}${url}` : `${cleanBaseUrl}/${url}`;
    }

    if (image.filename) {
      return `${cleanBaseUrl}/media/${image.filename}`;
    }

    return null;
  };

  // Helper function to check if a media item is a video
  const isCmsVideo = (image: CmsMedia | string | null | undefined) => {
    if (!image) return false;
    if (typeof image === 'string') {
      const lower = image.toLowerCase();
      return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov');
    }
    if (image.type === 'video') return true;
    if (image.mimeType?.startsWith('video/')) return true;
    
    const url = image.url || '';
    const filename = image.filename || '';
    const lowerUrl = url.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    return (
      lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.ogg') || lowerUrl.endsWith('.mov') ||
      lowerFilename.endsWith('.mp4') || lowerFilename.endsWith('.webm') || lowerFilename.endsWith('.ogg') || lowerFilename.endsWith('.mov')
    );
  };

  // Fetch product counts dynamically and dynamic Home Page config on mount
  useEffect(() => {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

    async function fetchLatestNews() {
      try {
        const response = await fetch(`${payloadUrl}/api/news?sort=-publishDate&limit=3&depth=2`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setLatestNews(data.docs || []);
        }
      } catch (error) {
        console.error("Could not fetch latest news feed", error);
      }
    }

    async function fetchHomePageData() {
      try {
        setIsLoading(true);
        const response = await fetch(`${payloadUrl}/api/globals/home-page?depth=2`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.layout && data.layout.length > 0) {
            setCmsBlocks(data.layout as CmsBlock[]);
            
            // Check if we need to fetch the latest news feed
            const hasLatestNewsBlock = (data.layout as CmsBlock[]).some(
              (block) => block.blockType === 'news' && block.source === 'latest'
            );
            if (hasLatestNewsBlock) {
              await fetchLatestNews();
            }
          }
        }
      } catch (error) {
        console.error("Could not fetch API home page configuration.", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHomePageData();
  }, []);



  return (
    <div className="bg-white text-gray-800 min-h-screen relative font-sans selection:bg-[#005288] selection:text-white overflow-x-hidden">
      {isLoading ? (
        <div className="fixed inset-0 bg-[#08080a] z-50 flex flex-col items-center justify-center text-white">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-2 border-t-[#0082d8] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="tracking-[0.3em] font-light text-xs text-[#e2c285] uppercase">
              MEGAMAN®
            </div>
            <div className="tracking-[0.15em] font-mono text-[9px] text-gray-500 uppercase">
              Precision Light
            </div>
          </div>
        </div>
      ) : cmsBlocks.length > 0 ? (
        cmsBlocks.map((block, index) => {
          switch (block.blockType) {
            case 'hero':
              return (
                <section 
                  key={index}
                  className="relative bg-gray-50 border-b border-gray-200 min-h-[640px] md:h-[75vh] flex items-center overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {/* Fine crosshairs & grids */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                    <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-black"></div>
                    <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-black"></div>
                    <div className="absolute left-0 right-0 top-[50%] h-[1px] bg-black"></div>
                  </div>

                  {/* Dynamic Slidings Area */}
                  {block.slides?.map((slide: HeroSlide, idx: number) => {
                    const imageUrl = getCmsImageUrl(slide.image);
                    const isVideo = isCmsVideo(slide.image);

                    return (
                      <div 
                        key={slide.id || idx} 
                        className={`absolute inset-0 w-full h-full flex items-center transition-all duration-700 ease-in-out ${
                          activeSlide === idx ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 pointer-events-none z-0'
                        }`}
                      >
                        {/* Background Media covering the entire section */}
                        {imageUrl && (
                          isVideo ? (
                            <video 
                              src={imageUrl} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                          ) : (
                            <Image 
                              src={imageUrl} 
                              alt={slide.title || 'Slide Image'} 
                              fill
                              className="absolute inset-0 w-full h-full object-cover z-0"
                              priority={idx === 0}
                            />
                          )
                        )}

                        {/* Fallback pattern if no media is selected */}
                        {!imageUrl && (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#021526] to-[#0a2540] z-0 flex items-center justify-center text-white/5">
                            <FontAwesomeIcon icon={faLightbulb} className="text-9xl opacity-20" />
                          </div>
                        )}

                        {/* Dark cinematic gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/25 z-10"></div>
                        
                        {/* Text overlay inside container alignment */}
                        <div className="container mx-auto max-w-7xl px-6 md:px-12 relative z-20 w-full text-white space-y-6">
                          <div className="flex items-center gap-3">
                            <span className="h-[2px] w-10 bg-[#0082d8]"></span>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#e2c285]">
                              {slide.subtitle || 'INNOVATION'}
                            </p>
                          </div>

                          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest leading-[1.1] text-white max-w-2xl">
                            {slide.title}
                          </h1>

                          {slide.description && (
                            <p className="text-xs md:text-sm text-gray-300 font-light max-w-md leading-relaxed">
                              {slide.description}
                            </p>
                          )}

                          <div className="pt-6">
                            <a 
                              href={slide.ctaLink || '#categories-section'} 
                              className="bg-[#0082d8] hover:bg-[#006bb3] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg border border-transparent hover:border-[#0082d8]/30"
                            >
                              <FontAwesomeIcon icon={faLightbulb} />
                              {slide.ctaText || 'EXPLORE RANGE'}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Sidebar Chevrons for Slides Navigation */}
                  {totalSlides > 1 && (
                    <>
                      <button 
                        onClick={handlePrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-30"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                      </button>
                      <button 
                        onClick={handleNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-30"
                      >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                      </button>
                    </>
                  )}

                  {/* Bottom Slide Indicators (Horizontal Dashed Bars) */}
                  {totalSlides > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                      {[...Array(totalSlides)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`h-1 cursor-pointer transition-all duration-300 rounded-none focus:outline-none ${
                            activeSlide === idx 
                              ? 'bg-[#005288] w-10' 
                              : 'bg-gray-300 w-6 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            case 'categoriesGrid':
              return (
                <section key={index} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200" id="categories-section">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                        {block.subtitle || 'PORTFOLIO OVERVIEW'}
                      </span>
                      <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                        {block.title || 'PRODUCT CATEGORIES'}
                      </h2>
                    </div>
                  </div>

                  {/* Dynamic Column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {block.categories?.map((cat: CategoryItem, idx: number) => (
                      <div key={idx} className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="text-[#005288] font-mono text-3xl mb-6">{cat.number || `0${idx + 1}`}</div>
                          <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">{cat.title}</h3>
                          {cat.description && (
                            <p className="text-xs text-gray-500 font-light leading-relaxed mb-6 font-sans">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">
                            {cat.parameterLabel || 'SYSTEM PARAMETERS'}
                          </span>
                          <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                            <span>PARAMETER</span>
                            <span className="font-bold text-[#005288]">{cat.parameterValue}</span>
                          </div>
                          <Link 
                            href={cat.linkUrl || '#'}
                            className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
                          >
                            {cat.linkText || 'Explore'} &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'editorial':
              const isSplitLeft = block.layout === 'split-left';
              const isSplitRight = block.layout === 'split-right';
              const secImageUrl = getCmsImageUrl(block.image);

              return (
                <section key={index} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
                  <div className={`grid grid-cols-1 ${secImageUrl ? 'lg:grid-cols-12' : ''} gap-16 items-center`}>
                    
                    {/* Left Column in Split Left */}
                    {secImageUrl && isSplitLeft && (
                      <div className="lg:col-span-6 relative h-[380px] w-full bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center p-4">
                        {isCmsVideo(block.image) ? (
                          <video 
                            src={secImageUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover opacity-95 p-2"
                          />
                        ) : (
                          <Image src={secImageUrl} alt={block.title || 'Section Image'} fill className="object-cover opacity-95 p-2" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
                      </div>
                    )}

                    {/* Narrative details column */}
                    <div className={secImageUrl ? 'lg:col-span-6' : 'max-w-3xl'}>
                      <div className="space-y-6">
                        {block.subtitle && (
                          <div className="flex items-center gap-3">
                            <span className="h-[2px] w-10 bg-[#005288]"></span>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                              {block.subtitle}
                            </p>
                          </div>
                        )}

                        <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                          {block.title}
                        </h2>

                        {block.content && (
                          <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
                            {block.content}
                          </p>
                        )}

                        {block.linkText && block.linkUrl && (
                          <div className="pt-4">
                            <a 
                              href={block.linkUrl} 
                              className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                            >
                              {block.linkText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column in Split Right or standard Grid */}
                    {secImageUrl && (isSplitRight || block.layout === 'grid') && (
                      <div className="lg:col-span-6 relative h-[380px] w-full bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center p-4">
                        {isCmsVideo(block.image) ? (
                          <video 
                            src={secImageUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover opacity-95 p-2"
                          />
                        ) : (
                          <Image src={secImageUrl} alt={block.title || 'Section Image'} fill className="object-cover opacity-95 p-2" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
                      </div>
                    )}

                  </div>
                </section>
              );
            case 'highlightProducts':
              return (
                <section key={index} className="py-24 px-6 md:px-12 bg-gradient-to-br from-[#021526] via-[#032B44] to-[#021526] text-white relative overflow-hidden">
                  {/* Fine crosshairs & grids */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
                    <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-white"></div>
                    <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-white"></div>
                  </div>

                  <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0082d8] mb-2 block">
                          {block.subtitle || 'PREMIUM SELECTIONS'}
                        </span>
                        <h2 className="text-3xl font-light uppercase tracking-widest text-white">
                          {block.title || 'HIGHLIGHTED PRODUCTS'}
                        </h2>
                      </div>

                      {/* Premium Slider Controls */}
                      {block.products && block.products.length > 0 && (
                        <div className="flex gap-3 relative z-20">
                          <button 
                            onClick={() => scrollHighlight('left')}
                            className="w-10 h-10 border border-white/10 hover:border-white/35 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                            aria-label="Previous products"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                          </button>
                          <button 
                            onClick={() => scrollHighlight('right')}
                            className="w-10 h-10 border border-white/10 hover:border-white/35 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                            aria-label="Next products"
                          >
                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div 
                      ref={highlightSliderRef}
                      className="flex flex-row flex-nowrap overflow-x-auto snap-x snap-mandatory gap-8 no-scrollbar scroll-smooth pb-4"
                    >
                      {block.products?.map((prod: CmsProduct, idx: number) => {
                        const prodImageUrl = getCmsImageUrl(prod.images);
                        const familyObj = prod.families;
                        const familyName = familyObj && typeof familyObj === 'object' ? familyObj.name : 'Product Family';
                        const familyId = familyObj && typeof familyObj === 'object' ? familyObj.id : familyObj;
                        
                        const detailLink = familyId ? `/families/${familyId}` : `/products?search=${encodeURIComponent(prod.name)}`;

                        return (
                          <div 
                            key={prod.id || idx}
                            className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between min-h-[440px] hover:border-[#0082d8]/50 hover:bg-white/10 transition-all duration-300 group relative shadow-xl backdrop-blur-sm w-[85vw] sm:w-[380px] md:w-[350px] lg:w-[380px] flex-shrink-0 snap-start"
                          >
                            <div>
                              <div className="relative aspect-[4/3] w-full bg-white border border-white/5 overflow-hidden flex items-center justify-center p-4 mb-6">
                                {prodImageUrl ? (
                                  isCmsVideo(prod.images) ? (
                                    <video 
                                      src={prodImageUrl} 
                                      autoPlay 
                                      loop 
                                      muted 
                                      playsInline
                                      className="w-full h-full object-contain p-2"
                                    />
                                  ) : (
                                    <Image 
                                      src={prodImageUrl} 
                                      alt={prod.name} 
                                      fill 
                                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                    />
                                  )
                                ) : (
                                  <div className="text-white/20 flex flex-col items-center justify-center">
                                    <FontAwesomeIcon icon={faLightbulb} className="text-3xl mb-2" />
                                    <span className="text-[9px] uppercase tracking-wider font-mono">No Image Available</span>
                                  </div>
                                )}
                                <div className="absolute top-3 right-3 bg-[#0082d8] text-white text-[8px] font-mono font-bold uppercase px-2 py-0.5 tracking-wider">
                                  PREMIUM
                                </div>
                              </div>

                              <span className="text-[9px] font-mono text-[#e2c285] uppercase tracking-widest font-bold block mb-1">
                                {familyName}
                              </span>
                              <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-4 leading-tight">
                                {prod.name}
                              </h3>
                              
                              {prod.description && (
                                <p className="text-xs text-gray-300 font-light leading-relaxed mb-6 line-clamp-2">
                                  {prod.description}
                                </p>
                              )}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-4">
                                <div>
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5">POWER</span>
                                  <span className="font-bold text-white">{prod.power || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5">CCT</span>
                                  <span className="font-bold text-white">{prod.colourTemperature || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] text-gray-500 font-bold mb-0.5">COLOUR</span>
                                  <span className="font-bold text-[#0082d8]">{prod.colour || 'N/A'}</span>
                                </div>
                              </div>

                              <Link 
                                href={detailLink}
                                className="w-full bg-[#0082d8] hover:bg-[#006bb3] text-white py-3 text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg"
                              >
                                <span>EXPLORE SPECIFICATIONS</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transform group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            case 'inspiration':
              return (
                <section key={index} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
                  <div className="mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                      {block.subtitle || 'PROJECTS & REFERENCES'}
                    </span>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                      {block.title || 'CREATIVE INSPIRATION'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {block.projects?.map((proj: CmsProject, idx: number) => {
                      const projImageUrl = getCmsImageUrl(proj.images);
                      return (
                        <div key={proj.id || idx} className="flex flex-col gap-6 group">
                          <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                            {projImageUrl ? (
                              isCmsVideo(proj.images) ? (
                                <video 
                                  src={projImageUrl} 
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image 
                                  src={projImageUrl} 
                                  alt={proj.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-102"
                                />
                              )
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <FontAwesomeIcon icon={faLightbulb} className="text-3xl" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            
                            {/* Floating details overlay on hover */}
                            {proj.location && (
                              <div className="absolute left-6 bottom-6 right-6 flex justify-between items-end bg-white border border-gray-200 p-4 max-w-sm rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md text-gray-800">
                                <div>
                                  <p className="text-[8px] font-mono uppercase tracking-widest text-gray-400 font-bold">PROJECT LOCATION</p>
                                  <h4 className="text-xs font-bold text-gray-900">{proj.title}</h4>
                                  <p className="text-[9px] text-[#005288] font-light mt-1 font-mono">{proj.location.toUpperCase()}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex gap-4 items-center font-mono">
                              <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">REFERENCE</span>
                              {proj.location && (
                                <>
                                  <span className="h-[1px] w-8 bg-gray-200"></span>
                                  <span className="text-[9px] text-gray-400 tracking-wider">{proj.location.toUpperCase()}</span>
                                </>
                              )}
                            </div>
                            <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">{proj.title}</h3>
                            {proj.description && (
                              <p className="text-xs text-gray-500 font-light leading-relaxed">
                                {proj.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            case 'news':
              const newsFeed = block.source === 'custom' ? (block.featuredNews || []) : latestNews;
              const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }).toUpperCase();
              };
              return (
                <section key={index} className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                  <div className="mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                      {block.subtitle || 'PRESS & MEDIA'}
                    </span>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                      {block.title || 'LATEST NEWS'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsFeed.length === 0 ? (
                      <div className="col-span-full border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs uppercase tracking-wider">
                        No news articles available.
                      </div>
                    ) : (
                      newsFeed.map((item: CmsNewsItem, idx: number) => {
                        const itemImageUrl = getCmsImageUrl(item.image);
                        return (
                          <div 
                            key={item.id || idx} 
                            className="border border-gray-200 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
                          >
                            <div>
                              {itemImageUrl && (
                                <div className="relative aspect-[16/9] w-full bg-gray-50 border-b border-gray-100 overflow-hidden">
                                  {isCmsVideo(item.image) ? (
                                    <video 
                                      src={itemImageUrl} 
                                      autoPlay 
                                      loop 
                                      muted 
                                      playsInline
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Image 
                                      src={itemImageUrl} 
                                      alt={item.title} 
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                                    />
                                  )}
                                </div>
                              )}
                              <div className="p-6">
                                <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                                  <span>{item.category.toUpperCase()}</span>
                                  <span className="font-bold text-[#005288]">{formatDate(item.publishDate)}</span>
                                </div>
                                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors line-clamp-2">
                                  {item.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-3">
                                  {item.summary}
                                </p>
                              </div>
                            </div>
                            
                            <div className="px-6 pb-6">
                              <button 
                                onClick={() => {
                                  if (!item.linkUrl || item.linkUrl === '#') {
                                    alert(`${item.title}\n\n${item.summary}`);
                                  } else {
                                    window.open(item.linkUrl, '_blank');
                                  }
                                }}
                                className="text-[10px] uppercase font-bold text-gray-700 tracking-widest pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans font-bold"
                              >
                                <span>{item.linkText || 'Read More'}</span>
                                <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            default:
              return null;
          }
        })
      ) : (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 bg-[#08080a] border-b border-white/5">
          <FontAwesomeIcon icon={faLightbulb} className="text-4xl mb-4 text-[#0082d8] opacity-55 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-2">No Layout Configured</h2>
          <p className="text-xs text-gray-400 max-w-xs text-center font-light leading-relaxed">
            Please log into the Payload CMS Admin panel to build and configure your homepage layout blocks.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}