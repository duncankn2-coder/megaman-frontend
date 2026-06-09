/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';

interface HeroSlide {
  title: string;
  subtitle: string;
  description?: string;
  image: any;
  ctaText?: string;
  ctaLink?: string;
}

interface CategoryItem {
  number: string;
  title: string;
  description?: string;
  parameterLabel?: string;
  parameterValue: string;
  linkUrl: string;
  linkText?: string;
}

interface Block {
  blockType: string;
  id?: string;
  slides?: HeroSlide[];
  title?: string;
  subtitle?: string;
  categories?: CategoryItem[];
  content?: string;
  image?: any;
  linkText?: string;
  linkUrl?: string;
  layout?: 'grid' | 'split-left' | 'split-right';
  products?: any[];
  projects?: any[];
  source?: 'latest' | 'custom';
  featuredNews?: any[];
}

interface HomeClientProps {
  layoutData: Block[] | null;
  initialProductsCount: number;
  initialLatestNews: any[];
}

// Utility to safely resolve image URLs from Payload CMS or static paths
const getImageUrl = (image: any): string => {
  if (!image) return '/placeholder.png';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  const resolveAbsoluteUrl = (url: string): string => {
    if (url.startsWith('http') || url.startsWith('//')) {
      const isLocalhostUrl = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
      const isBaseUrlLocalhost = baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000');
      if (isLocalhostUrl && !isBaseUrlLocalhost) {
        return url
          .replace(/^https?:\/\/localhost:3000/, baseUrl)
          .replace(/^https?:\/\/127.0.0.1:3000/, baseUrl);
      }
      return url;
    }
    return '';
  };

  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('//')) {
      const resolved = resolveAbsoluteUrl(image);
      return resolved || image;
    }
    if (image.startsWith('/')) {
      return image;
    }
    // Safeguard: Check if the string is a MongoDB ObjectId (24-char hex)
    // If it is, this means the relationship was not populated, so we return a placeholder
    // instead of a URL like /media/67f4dbfe04e4e1bf223c74e3 which is guaranteed to 404.
    if (/^[0-9a-fA-F]{24}$/.test(image)) {
      return '/placeholder.png';
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image}`;
  }
  
  if (image.url) {
    if (image.url.startsWith('http') || image.url.startsWith('//')) {
      return resolveAbsoluteUrl(image.url);
    }
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.url.startsWith('/') ? image.url : `/${image.url}`;
    return `${cleanBaseUrl}${cleanPath}`;
  }
  if (image.filename) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image.filename}`;
  }
  
  return '/placeholder.png';
};

const getImageAlt = (image: any, fallback: string): string => {
  if (image && typeof image === 'object' && image.alt) {
    return image.alt;
  }
  return fallback;
};

const isVideoMedia = (image: any): boolean => {
  if (!image) return false;
  
  const getUrl = (): string => {
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (image.filename) return image.filename;
    return '';
  };
  
  const url = getUrl().toLowerCase();
  
  // Check typical video extensions
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.endsWith('.mov')) {
    return true;
  }
  
  // Check mimeType from Payload CMS if available
  if (image && typeof image === 'object' && image.mimeType) {
    return image.mimeType.startsWith('video/');
  }
  
  return false;
};

export default function HomeClient({ layoutData, initialProductsCount, initialLatestNews }: HomeClientProps) {
  const productsCount = initialProductsCount;


  // Carousel Hero States
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scrollable highlight products container ref
  const highlightScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollHighlight = (direction: 'left' | 'right') => {
    if (highlightScrollRef.current) {
      const scrollAmount = 380;
      highlightScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Find dynamic hero slides
  const heroBlock = layoutData?.find(b => b.blockType === 'hero');
  const dynamicSlidesCount = heroBlock?.slides?.length || 0;

  // Autoplay functionality: slide transitions every 6 seconds, pauses on mouse hover
  useEffect(() => {
    if (!isHovered && dynamicSlidesCount > 1) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % dynamicSlidesCount);
      }, 6000);
    }
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isHovered, dynamicSlidesCount]);

  const handlePrevSlide = () => {
    if (dynamicSlidesCount > 0) {
      setActiveSlide((prev) => (prev - 1 + dynamicSlidesCount) % dynamicSlidesCount);
    }
  };

  const handleNextSlide = () => {
    if (dynamicSlidesCount > 0) {
      setActiveSlide((prev) => (prev + 1) % dynamicSlidesCount);
    }
  };



  // Check if we render dynamic layout or fall back to static
  const hasDynamicLayout = layoutData && layoutData.length > 0;

  return (
    <div className="bg-white text-gray-800 min-h-screen relative font-sans selection:bg-[#005288] selection:text-white overflow-x-hidden">
      
      {hasDynamicLayout ? (
        // Render dynamically configured blocks from CMS
        layoutData.map((block, blockIdx) => {
          switch (block.blockType) {
            case 'hero': {
              const slides = block.slides || [];
              if (slides.length === 0) return null;
              
              const currentSlideData = slides[activeSlide] || slides[0];

              return (
                <section 
                  key={`hero-${blockIdx}`}
                  className="relative bg-gray-50 border-b border-gray-200 min-h-[640px] md:h-[75vh] flex items-center overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                    <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-black"></div>
                    <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-black"></div>
                    <div className="absolute left-0 right-0 top-[50%] h-[1px] bg-black"></div>
                  </div>

                  {/* Slide Background Image or Video */}
                  <div className="absolute inset-0 z-0">
                    {(() => {
                      const media = currentSlideData.image;
                      if (!media) return null;
                      
                      const url = getImageUrl(media);
                      const isVideo = isVideoMedia(media);

                      if (isVideo) {
                        return (
                          <video
                            src={url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover transition-opacity duration-700 sharpen-media"
                          />
                        );
                      } else {
                        return (
                          <Image 
                            src={url} 
                            alt={getImageAlt(media, currentSlideData.title)} 
                            fill
                            quality={100}
                            className="object-cover transition-opacity duration-700 sharpen-media"
                            priority
                          />
                        );
                      }
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent z-10"></div>
                  </div>

                  <div className="container mx-auto max-w-7xl px-6 md:px-12 relative z-20 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                      
                      {/* Left: Text Details */}
                      <div className="lg:col-span-6 space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="h-[2px] w-10 bg-[#005288]"></span>
                          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                            {currentSlideData.subtitle}
                          </p>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest leading-[1.1] text-gray-900">
                          {currentSlideData.title.split(' ').map((word, i) => {
                            const isBlue = word.toLowerCase() === 'downloads' || word.toLowerCase() === 'circular' || word.toLowerCase() === 'elegance' || word.toLowerCase() === 'smart' || word.toLowerCase() === 'home' || word.toLowerCase() === 'iot';
                            return (
                              <span key={i} className={isBlue ? "font-bold text-[#005288]" : ""}>
                                {word}{' '}
                                {i === 1 && currentSlideData.title.split(' ').length > 2 && <br />}
                              </span>
                            );
                          })}
                        </h1>

                        {currentSlideData.description && (
                          <p className="text-xs md:text-sm text-gray-500 font-light max-w-md leading-relaxed">
                            {currentSlideData.description}
                          </p>
                        )}

                        {/* CTA button */}
                        {currentSlideData.ctaLink && (
                          <div className="pt-6">
                            <a 
                              href={currentSlideData.ctaLink}
                              className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                            >
                              <FontAwesomeIcon icon={faArrowRight} />
                              {currentSlideData.ctaText || 'EXPLORE RANGE'}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right: Empty Column / Spacer to let full bleed background show */}
                      <div className="lg:col-span-6 w-full"></div>

                    </div>
                  </div>

                  {/* Sidebar Chevrons for Slides Navigation */}
                  {slides.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-20"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                      </button>
                      <button 
                        onClick={handleNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm z-20"
                      >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                      </button>
                    </>
                  )}

                  {/* Bottom Slide Indicators */}
                  {slides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {slides.map((_, idx) => (
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
            }

            case 'categoriesGrid': {
              const categories = block.categories || [];
              return (
                <section key={`categories-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200" id="categories-section">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                        {block.subtitle || 'PORTFOLIO OVERVIEW'}
                      </span>
                      <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                        {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                      </h2>
                    </div>
                    <Link 
                      href="/products" 
                      className="text-xs uppercase tracking-widest font-bold border-b border-gray-300 pb-1 hover:border-[#005288] hover:text-[#005288] transition-colors"
                    >
                      Browse Catalogues
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="text-[#005288] font-mono text-3xl mb-6">{cat.number}</div>
                          <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">{cat.title}</h3>
                          {cat.description && (
                            <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">
                            {cat.parameterLabel || 'SYSTEM PARAMETERS'}
                          </span>
                          <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                            <span>METRIC STATUS</span>
                            <span className="font-bold text-[#005288]">{cat.parameterValue}</span>
                          </div>
                          <Link 
                            href={cat.linkUrl}
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
            }

            case 'highlightProducts': {
              const products = block.products || [];
              if (products.length === 0) return null;
              
              return (
                <section key={`highlights-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200 bg-[#fafafa]/50">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                        {block.subtitle || 'PREMIUM SELECTIONS'}
                      </span>
                      <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                        {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                      </h2>
                    </div>
                    {/* Navigation Buttons for Horizontal Scroll */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => scrollHighlight('left')}
                        className="w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-[#005288] flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm"
                        aria-label="Scroll left"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                      </button>
                      <button 
                        onClick={() => scrollHighlight('right')}
                        className="w-10 h-10 border border-gray-200 hover:border-gray-400 bg-white text-gray-500 hover:text-[#005288] flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-sm"
                        aria-label="Scroll right"
                      >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div 
                    ref={highlightScrollRef}
                    className="flex overflow-x-auto gap-8 pb-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent snap-x snap-mandatory scroll-smooth no-scrollbar"
                  >
                    {products.map((p, idx) => {
                      const imageItem = p.images;
                      const imageUrl = getImageUrl(imageItem);
                      const familyId = p.families?.id || p.families;

                      return (
                        <div 
                          key={p.id || idx}
                          className="bg-white border border-gray-200 rounded-none overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0 w-[290px] md:w-[340px] snap-start"
                        >
                          <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-8 border-b border-gray-100">
                            {imageItem ? (
                              <Image 
                                src={imageUrl}
                                alt={p.name}
                                fill
                                quality={95}
                                className="object-contain p-6 sharpen-media"
                              />
                            ) : (
                              <div className="text-gray-300 font-mono text-xs uppercase tracking-widest">MEGAMAN® Optic</div>
                            )}
                          </div>

                          <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-bold uppercase text-gray-900 tracking-wider mb-2">{p.name}</h3>
                              {p.description && (
                                <p className="text-xs text-gray-500 font-light line-clamp-3 mb-4 leading-relaxed">
                                  {p.description}
                                </p>
                              )}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4 font-mono text-[10px] text-gray-400">
                              {p.specifications?.model_identifier && (
                                <div className="flex justify-between mb-1.5">
                                  <span>MODEL IDENTIFIER</span>
                                  <span className="text-gray-700 font-semibold">{p.specifications.model_identifier}</span>
                                </div>
                              )}
                              {p.power && (
                                <div className="flex justify-between mb-1.5">
                                  <span>ON-MODE POWER</span>
                                  <span className="text-gray-700 font-semibold">{p.power} W</span>
                                </div>
                              )}
                              {p.colour && (
                                <div className="flex justify-between">
                                  <span>FITTING COLOR</span>
                                  <span className="text-[#005288] font-semibold">{p.colour}</span>
                                </div>
                              )}

                              {familyId && (
                                <Link 
                                  href={`/families/${familyId}`}
                                  className="mt-6 w-full bg-gray-50 border border-gray-200 text-gray-700 hover:text-white hover:bg-[#005288] hover:border-[#005288] py-2.5 text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                  View Series Range &rarr;
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            case 'editorial': {
              const isSplitLeft = block.layout === 'split-left';
              const isSplitRight = block.layout === 'split-right';
              const imageUrl = getImageUrl(block.image);

              return (
                <section key={`editorial-${blockIdx}`} className="py-24 border-b border-gray-200 bg-white">
                  <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                      
                      {/* Left Column (Image if split-left, otherwise text) */}
                      {isSplitLeft && block.image && (
                        <div className="lg:col-span-6 relative h-[450px] w-full border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
                          <Image 
                            src={imageUrl}
                            alt={block.title || "Editorial"}
                            fill
                            quality={95}
                            className="object-cover sharpen-media"
                          />
                        </div>
                      )}

                      <div className={block.image ? "lg:col-span-6 space-y-6" : "lg:col-span-12 space-y-6 max-w-3xl mx-auto text-center"}>
                        {block.subtitle && (
                          <div className={`flex items-center gap-3 ${!block.image ? "justify-center" : ""}`}>
                            <span className="h-[2px] w-10 bg-[#005288]"></span>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#005288]">
                              {block.subtitle}
                            </p>
                          </div>
                        )}

                        <h2 className="text-3xl font-light uppercase tracking-widest leading-snug text-gray-900">
                          {block.title?.split(' ').map((w, idx) => (
                            <span key={idx} className={w.toLowerCase() === 'technology' || w.toLowerCase() === 'precision' ? "font-bold text-[#005288]" : ""}>
                              {w}{' '}
                            </span>
                          ))}
                        </h2>

                        {block.content && (
                          <p className="text-sm text-gray-500 font-light leading-relaxed">
                            {block.content}
                          </p>
                        )}

                        {block.linkUrl && block.linkText && (
                          <div className="pt-4">
                            <Link 
                              href={block.linkUrl}
                              className="bg-[#005288] hover:bg-[#003c64] text-white py-3.5 px-8 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all shadow-sm"
                            >
                              <FontAwesomeIcon icon={faProjectDiagram} />
                              {block.linkText}
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Right Column (Image if split-right) */}
                      {isSplitRight && block.image && (
                        <div className="lg:col-span-6 relative h-[450px] w-full border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
                          <Image 
                            src={imageUrl}
                            alt={block.title || "Editorial"}
                            fill
                            quality={95}
                            className="object-cover sharpen-media"
                          />
                        </div>
                      )}

                    </div>
                  </div>
                </section>
              );
            }

            case 'inspiration': {
              const projects = block.projects || [];
              if (projects.length === 0) return null;

              return (
                <section key={`inspiration-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
                  <div className="mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                      {block.subtitle || 'PROJECTS & REFERENCES'}
                    </span>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                      {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {projects.map((proj, idx) => {
                      const imageUrl = getImageUrl(proj.images);
                      
                      return (
                        <div key={proj.id || idx} className="flex flex-col gap-6 group">
                          <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                            <Image 
                              src={imageUrl} 
                              alt={proj.title}
                              fill
                              quality={95}
                              className="object-cover transition-transform duration-700 group-hover:scale-102 sharpen-media"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          </div>

                          <div>
                            <div className="flex gap-4 items-center font-mono">
                              <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">PROJECT REFERENCE</span>
                              <span className="h-[1px] w-8 bg-gray-200"></span>
                              <span className="text-[9px] text-gray-400 tracking-wider uppercase">{proj.location || 'GLOBAL'}</span>
                            </div>
                            <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">{proj.title}</h3>
                            <p className="text-xs text-gray-500 font-light leading-relaxed">
                              {proj.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            case 'news': {
              const displayNews = block.source === 'custom' && block.featuredNews && block.featuredNews.length > 0
                ? block.featuredNews 
                : initialLatestNews;
              
              if (displayNews.length === 0) return null;

              return (
                <section key={`news-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                  <div className="mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                      {block.subtitle || 'PRESS & MEDIA'}
                    </span>
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                      {block.title?.split(' ')[0]} <span className="font-bold">{block.title?.split(' ').slice(1).join(' ')}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayNews.map((article, idx) => (
                      <div key={article.id || idx} className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
                        <div>
                          <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                            <span>{article.category || 'PRESS'}</span>
                            <span className="font-bold text-[#005288]">
                              {article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'NEWS'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors line-clamp-3">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-4">
                            {article.summary}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => alert(`Redirecting to article ${article.title}`)}
                          className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
                        >
                          <span>{article.linkText || 'Read Press Release'}</span>
                          <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            default:
              return null;
          }
        })
      ) : (
        // Fallback layout when there's no layout data from CMS
        <>
          {/* SECTION 2: Categories */}
          <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200" id="categories-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                  PORTFOLIO OVERVIEW
                </span>
                <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                  PRODUCT <span className="font-bold">CATEGORIES</span>
                </h2>
              </div>
              <Link 
                href="/products" 
                className="text-xs uppercase tracking-widest font-bold border-b border-gray-300 pb-1 hover:border-[#005288] hover:text-[#005288] transition-colors"
              >
                Browse Catalogues
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[#005288] font-mono text-3xl mb-6">01</div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">LED LAMPS</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                    Classic lightbulbs, custom linear tubes, warm decorative filaments, and energy-efficient reflector lamps replacing legacy halogens.
                  </p>
                </div>
                <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                    <span>TOTAL DESIGNS</span>
                    <span className="font-bold text-[#005288]">150+ Lamps</span>
                  </div>
                  <Link 
                    href="/products?category=Lamps"
                    className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
                  >
                    Explore Lamps &rarr;
                  </Link>
                </div>
              </div>

              <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[#005288] font-mono text-3xl mb-6">02</div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">INDOOR SYSTEMS</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                    Deep recessed low-glare downlights (UGR &lt; 19), customizable track spotlights, panels, and continuous seamless linear profiles.
                  </p>
                </div>
                <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                    <span>TOTAL FIXTURES</span>
                    <span className="font-bold text-[#005288]">80+ Downlights</span>
                  </div>
                  <Link 
                    href="/products?category=Indoor%20Lighting"
                    className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
                  >
                    Explore Indoor &rarr;
                  </Link>
                </div>
              </div>

              <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[#005288] font-mono text-3xl mb-6">03</div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">OUTDOOR LIGHTING</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                    Heavy-duty floodlights, damp-proof utility battens, bulkheads, and architectural garden bollards designed for high weatherability.
                  </p>
                </div>
                <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                    <span>PROTECTION RATING</span>
                    <span className="font-bold text-[#005288]">IP65 / IP66</span>
                  </div>
                  <Link 
                    href="/products?category=Outdoor%20Lighting"
                    className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
                  >
                    Explore Outdoor &rarr;
                  </Link>
                </div>
              </div>

              <div className="border border-gray-200 p-8 flex flex-col justify-between min-h-[380px] bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[#005288] font-mono text-3xl mb-6">04</div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mb-4">SMART CONTROLS</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                    INGENIUM® Matter mesh controllers, sensors, and professional TECOH® LED modules for in-fixture specifications.
                  </p>
                </div>
                <div className="border-t border-gray-150 pt-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-3">SYSTEM PARAMETERS</span>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-50 pb-1 mb-2">
                    <span>DATABASE STATUS</span>
                    <span className="font-bold text-[#005288]">{productsCount || 24} Active Items</span>
                  </div>
                  <Link 
                    href="/products?category=Light%20Management"
                    className="text-xs uppercase tracking-widest text-[#005288] font-bold mt-2 inline-block hover:text-[#003c64] group-hover:translate-x-1 transition-transform"
                  >
                    Explore Smart &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 3: Projects */}
          <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200">
            <div className="mb-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                PROJECTS & REFERENCES
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                CREATIVE <span className="font-bold">INSPIRATION</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div className="flex flex-col gap-6 group">
                <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <Image 
                    src="/hospitality_project_lobby.png" 
                    alt="Hospitality Lounge Project Showcase"
                    fill
                    quality={95}
                    className="object-cover transition-transform duration-700 group-hover:scale-102 sharpen-media"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div>
                  <div className="flex gap-4 items-center font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">HOSPITALITY</span>
                    <span className="h-[1px] w-8 bg-gray-200"></span>
                    <span className="text-[9px] text-gray-400 tracking-wider">ATHENS, GREECE</span>
                  </div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">The Grand Plaza Lounge</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Utilizing low-glare deep recessed LED downlights to establish a welcoming, cozy environment with dynamic twilight dimming support. Reduces operational lighting energy by 68%.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 group">
                <div className="relative h-[420px] w-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <Image 
                    src="/retail_project_showroom.png" 
                    alt="Luxury Retail Showroom Showcase"
                    fill
                    quality={95}
                    className="object-cover transition-transform duration-700 group-hover:scale-102 sharpen-media"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>

                <div>
                  <div className="flex gap-4 items-center font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#005288] tracking-widest">RETAIL</span>
                    <span className="h-[1px] w-8 bg-gray-200"></span>
                    <span className="text-[9px] text-gray-400 tracking-wider">MILAN, ITALY</span>
                  </div>
                  <h3 className="text-xl uppercase tracking-widest font-bold text-gray-900 mt-2 mb-3">Quadrilatero Fashion Hub</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Implementing high-CRI 97 track spot luminaires. Meticulously engineered optics deliver striking high-contrast visual display while accurately rendering fine fabrics and textures.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 4: News */}
          <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
                PRESS & MEDIA
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
                LATEST <span className="font-bold">NEWS</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                    <span>MATTER SMART HOME</span>
                    <span className="font-bold text-[#005288]">24 MAY 2026</span>
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                    INGENIUM® Matter Smart Lighting Mesh Rolled Out Globally
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Megaman announces the international deployment of our new Matter-compliant smart LED nodes and control relays, bringing seamless mesh reliability and dynamic CCT circadian tuning.
                  </p>
                </div>
                
                <button 
                  onClick={() => alert('Matter Smart release press release download initiated.')}
                  className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
                >
                  <span>Read Press Release</span>
                  <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                    <span>ECO SYSTEM</span>
                    <span className="font-bold text-[#005288]">12 MAY 2026</span>
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                    Carbon Neutral Target: 100% Recyclable Casings by 2027
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Aligning with international eco-efficiency goals, Megaman commits to transitioning all indoor structural downlights to pure recyclable copper-alloy heat sinks, cutting plastic waste.
                  </p>
                </div>
                
                <button 
                  onClick={() => alert('Eco Targets document downloaded.')}
                  className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
                >
                  <span>Read Environmental Report</span>
                  <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="border border-gray-200 p-6 bg-white flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex gap-4 items-center text-[9px] font-mono text-gray-400 mb-4 pb-2 border-b border-gray-100 justify-between">
                    <span>NEW ARRIVALS</span>
                    <span className="font-bold text-[#005288]">05 MAY 2026</span>
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors">
                    SIENA Ultra-Slim Series Achieves Complete IP65 Ingress Rating
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Our popular, super-slim profile recessed spots (ideal for tight ceiling spaces) have successfully passed testing to receive a complete IP65 dust and moisture certification.
                  </p>
                </div>
                
                <button 
                  onClick={() => alert('SIENA IP65 Datasheet opened.')}
                  className="text-[10px] uppercase font-bold text-gray-700 tracking-widest mt-6 pt-4 border-t border-gray-100 flex items-center justify-between group-hover:text-[#005288] transition-colors cursor-pointer w-full text-left font-sans"
                >
                  <span>View Product Specifications</span>
                  <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </section>
        </>
      )}

      {/* Modern High-Density Minimalist Footer (Light Re-Themed) */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Megaman Corporate Info */}
          <div>
            <Image 
              src="/MEGAMAN_Logo.png" 
              alt="Megaman Logo" 
              width={140} 
              height={45} 
              className="h-10 w-auto object-contain mb-6 mix-blend-multiply"
            />
            <p className="text-[11px] text-gray-500 font-light leading-relaxed max-w-xs">
              Pioneering energy-efficient architectural and smart home LED lighting systems worldwide since 1994.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">PRODUCTS</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light">
              <li><Link href="/products?category=Lamps" className="hover:text-[#005288] transition-colors">LED Lamps & Classic Bulbs</Link></li>
              <li><Link href="/products?category=Indoor%20Lighting" className="hover:text-[#005288] transition-colors">Architectural Downlights</Link></li>
              <li><Link href="/products?category=Outdoor%20Lighting" className="hover:text-[#005288] transition-colors">Outdoor Battens & Floodlights</Link></li>
              <li><Link href="/products?category=Light%20Management" className="hover:text-[#005288] transition-colors">INGENIUM Smart Matter</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">RESOURCES</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-500 font-light">
              <li><Link href="/resources/downloads" className="hover:text-[#005288] transition-colors">Technical Download Center</Link></li>
              <li><Link href="/company/news-and-press" className="hover:text-[#005288] transition-colors">Latest News & Press</Link></li>
              <li><Link href="/company/quality" className="hover:text-[#005288] transition-colors">Quality Assurance Standards</Link></li>
              <li><Link href="/resources/videos" className="hover:text-[#005288] transition-colors">Tutorials & Case Videos</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#005288] font-bold mb-4">NEWSLETTER</h4>
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
                className="bg-[#005288] text-white text-xs px-4 uppercase font-bold hover:bg-[#003c64] transition-colors cursor-pointer"
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

    </div>
  );
}
