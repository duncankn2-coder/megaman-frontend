"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface CategoryItem {
  title: string;
  image?: any;
  description?: string;
  linkUrl: string;
  linkText?: string;
}

interface CategoriesGridSectionProps {
  title?: string;
  subtitle?: string;
  categories: CategoryItem[];
  blockIdx?: number | string;
}

const getImageUrl = (image: any): string => {
  if (!image) return '/placeholder.png';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  }
  if (image.url) {
    if (image.url.startsWith('http')) return image.url;
    return `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }
  return '/placeholder.png';
};

export default function CategoriesGridSection({
  title = 'PRODUCT CATEGORIES',
  subtitle = 'PORTFOLIO OVERVIEW',
  categories = [],
  blockIdx = 0,
}: CategoriesGridSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag-to-scroll state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const isSlider = categories.length > 4;

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    if (isSlider) {
      updateScrollState();
      window.addEventListener('resize', updateScrollState);
      return () => window.removeEventListener('resize', updateScrollState);
    }
  }, [isSlider, updateScrollState]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 300;
    const gap = 32;
    const distance = cardWidth + gap;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  const renderCategoryCard = (cat: CategoryItem, idx: number) => (
    <Link
      href={cat.linkUrl || '#'}
      key={idx}
      onClick={handleCardClick}
      className="flex flex-col group h-full select-none"
    >
      <div className="relative aspect-square w-full overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-200 bg-gray-50 flex items-center justify-center">
        {cat.image ? (
          <Image
            src={getImageUrl(cat.image)}
            alt={cat.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs font-light">No Image Available</span>
          </div>
        )}
      </div>
      
      <div className="pt-4 flex flex-col flex-grow">
        <h3 className="text-base uppercase tracking-widest font-bold text-gray-900 mb-2 group-hover:text-[#005288] transition-colors">
          {cat.title}
        </h3>
        {cat.description && (
          <p className="text-xs text-gray-500 font-light leading-relaxed mb-4 line-clamp-2">
            {cat.description}
          </p>
        )}
        <span 
          className="text-xs uppercase tracking-widest text-[#005288] font-bold inline-flex items-center gap-2 group-hover:text-[#003c64] transition-colors w-fit border-b border-[#005288] pb-0.5 mt-auto"
        >
          {cat.linkText || 'Explore'} &rarr;
        </span>
      </div>
    </Link>
  );

  return (
    <section key={`categories-${blockIdx}`} className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-200" id="categories-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-2 block">
            {subtitle}
          </span>
          <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
            {title?.split(' ')[0]} <span className="font-bold">{title?.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        
        <div>
          <Link 
            href="/products" 
            className="text-xs uppercase tracking-widest font-bold border-b border-gray-300 pb-1 hover:border-[#005288] hover:text-[#005288] transition-colors"
          >
            Browse Catalogues
          </Link>
        </div>
      </div>

      {/* Grid vs Slider Layout */}
      {!isSlider ? (
        // Standard Grid for 4 or fewer categories
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => renderCategoryCard(cat, idx))}
        </div>
      ) : (
        // Horizontal Slider for more than 4 categories with flanking side buttons
        <div className="relative">
          {/* Left Button on the Left Side of the Grids */}
          <button
            onClick={() => scrollByDirection('left')}
            disabled={!canScrollLeft}
            className={`absolute -left-3 sm:-left-5 md:-left-6 top-[38%] -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-xl flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'text-gray-800 hover:text-[#005288] hover:border-[#005288] hover:scale-105 cursor-pointer opacity-100'
                : 'text-gray-300 opacity-0 pointer-events-none cursor-not-allowed'
            }`}
            aria-label="Previous categories"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs md:text-sm" />
          </button>

          {/* Cards container */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex overflow-x-auto gap-8 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none"
          >
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="w-[280px] sm:w-[320px] lg:w-[calc(25%-1.5rem)] flex-shrink-0 snap-start flex flex-col"
              >
                {renderCategoryCard(cat, idx)}
              </div>
            ))}
          </div>

          {/* Right Button on the Right Side of the Grids */}
          <button
            onClick={() => scrollByDirection('right')}
            disabled={!canScrollRight}
            className={`absolute -right-3 sm:-right-5 md:-right-6 top-[38%] -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-xl flex items-center justify-center transition-all ${
              canScrollRight
                ? 'text-gray-800 hover:text-[#005288] hover:border-[#005288] hover:scale-105 cursor-pointer opacity-100'
                : 'text-gray-300 opacity-0 pointer-events-none cursor-not-allowed'
            }`}
            aria-label="Next categories"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs md:text-sm" />
          </button>
        </div>
      )}
    </section>
  );
}
