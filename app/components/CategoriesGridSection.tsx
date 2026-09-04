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
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 100
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
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
    setScrollProgress(progress);
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrollProgress(val);
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      scrollRef.current.scrollTo({
        left: (val / 100) * maxScroll,
        behavior: 'auto',
      });
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !scrollRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollRef.current.scrollTo({
      left: ratio * maxScroll,
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

  // Calculate thumb width based on visible ratio
  const thumbWidth = Math.max(15, Math.min(60, (4 / Math.max(5, categories.length)) * 100));

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
        
        <div className="flex items-center gap-6">
          <Link 
            href="/products" 
            className="text-xs uppercase tracking-widest font-bold border-b border-gray-300 pb-1 hover:border-[#005288] hover:text-[#005288] transition-colors"
          >
            Browse Catalogues
          </Link>

          {/* Header Navigation Arrows for Slider Mode */}
          {isSlider && (
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => scrollByDirection('left')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-gray-300 text-gray-600 hover:border-[#005288] hover:text-[#005288] hover:bg-gray-50 cursor-pointer'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Previous categories"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              <button 
                onClick={() => scrollByDirection('right')}
                disabled={!canScrollRight}
                className={`w-10 h-10 border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-gray-300 text-gray-600 hover:border-[#005288] hover:text-[#005288] hover:bg-gray-50 cursor-pointer'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Next categories"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid vs Slider Layout */}
      {!isSlider ? (
        // Standard Grid for 4 or fewer categories
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => renderCategoryCard(cat, idx))}
        </div>
      ) : (
        // Horizontal Slider for more than 4 categories
        <div>
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

          {/* Interactive Slide Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="w-full sm:max-w-xl flex items-center gap-4">
              {/* Mini Left Arrow */}
              <button
                onClick={() => scrollByDirection('left')}
                disabled={!canScrollLeft}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-gray-300 text-gray-700 hover:border-[#005288] hover:text-[#005288] hover:bg-gray-50 cursor-pointer shadow-xs'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Slide Left"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              </button>

              {/* Slide Bar Track */}
              <div 
                ref={trackRef}
                onClick={handleTrackClick}
                className="relative flex-grow h-7 flex items-center cursor-pointer group"
                title="Slide bar to move left and right"
              >
                {/* Track Background */}
                <div className="w-full h-2 bg-gray-200/80 group-hover:bg-gray-300/80 transition-colors rounded-full overflow-hidden relative">
                  {/* Active Thumb Indicator */}
                  <div
                    className="h-full bg-[#005288] group-hover:bg-[#003c64] rounded-full transition-all duration-75 ease-out shadow-xs"
                    style={{
                      width: `${thumbWidth}%`,
                      marginLeft: `${(scrollProgress / 100) * (100 - thumbWidth)}%`,
                    }}
                  />
                </div>

                {/* Range Slider for Drag & Touch scrub */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={scrollProgress}
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                  aria-label="Slide categories left and right"
                />
              </div>

              {/* Mini Right Arrow */}
              <button
                onClick={() => scrollByDirection('right')}
                disabled={!canScrollRight}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-gray-300 text-gray-700 hover:border-[#005288] hover:text-[#005288] hover:bg-gray-50 cursor-pointer shadow-xs'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Slide Right"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>
            </div>

            {/* Helper Hint & Category Counter */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#005288]/70 animate-pulse"></span>
              <span>Slide Bar ({categories.length} Categories)</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
