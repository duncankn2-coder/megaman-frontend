"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string;
  description?: string;
  images?: { url: string; alt?: string; filename?: string };
}

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  filename?: string;
  type: 'image' | 'video';
}

interface Family {
  id: string;
  name: string;
  description?: string;
  priority?: number;
  media: MediaItem[];
  products: Product[];
  categories?: {
    id: string;
    name: string;
    image?: { url: string; alt?: string; filename?: string } | string | null;
  }[];
}

interface ProductsCatalogProps {
  families: Family[];
}

const getImageUrl = (image: { url?: string; filename?: string; alt?: string } | string | null | undefined): string => {
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
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/media/${image}`;
  }

  if (image && typeof image === 'object') {
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
  }
  return '/placeholder.png';
};

// Map families to primary categories for precise catalog filtering (XAL Style)
const resolveCategories = (family: Family): string[] => {
  const resultCategories = new Set<string>();

  // 1. Check CMS categories first
  if (family.categories && family.categories.length > 0) {
    for (const c of family.categories) {
      if (!c?.name) continue;
      const catLower = c.name.toLowerCase();

      // Check for Indoor Luminaires
      if (
        catLower === 'indoor luminaires' ||
        catLower === 'indoor lighting' ||
        catLower.includes('downlight') ||
        catLower.includes('batten') ||
        catLower.includes('panel') ||
        catLower.includes('track') ||
        catLower.includes('cabinet') ||
        catLower.includes('ceiling') ||
        catLower.includes('indoor') ||
        catLower.includes('high bay') ||
        catLower.includes('highbay') ||
        catLower.includes('low bay') ||
        catLower.includes('lowbay') ||
        catLower.includes('wall luminaire') ||
        catLower.includes('wall lamp') ||
        catLower.includes('spotlight') ||
        catLower.includes('pendant') ||
        catLower.includes('linear') ||
        catLower.includes('bunker') ||
        catLower.includes('bulkhead')
      ) {
        resultCategories.add('Indoor Luminaires');
      }

      // Check for Outdoor Luminaires
      if (
        catLower === 'outdoor luminaires' ||
        catLower === 'outdoor lighting' ||
        catLower.includes('floodlight') ||
        catLower.includes('garden') ||
        catLower.includes('outdoor') ||
        catLower.includes('bulkhead') ||
        catLower.includes('bunker') ||
        catLower.includes('bollard') ||
        catLower.includes('street')
      ) {
        resultCategories.add('Outdoor Luminaires');
      }

      // Check for Emergency Lighting
      if (
        catLower === 'emergency lighting' ||
        catLower.includes('exit') ||
        catLower.includes('emergency') ||
        catLower.includes('twinspot') ||
        catLower.includes('sign')
      ) {
        resultCategories.add('Emergency Lighting');
      }

      // Check for Light Management
      if (
        catLower === 'light management' ||
        catLower.includes('iot') ||
        catLower.includes('ngenium') ||
        catLower.includes('management') ||
        catLower.includes('infinite') ||
        catLower.includes('matter') ||
        catLower.includes('smart')
      ) {
        resultCategories.add('Light Management');
      }

      // Check for Drivers
      if (
        catLower === 'drivers' ||
        catLower.includes('driver') ||
        catLower.includes('control gear') ||
        catLower.includes('ballast')
      ) {
        resultCategories.add('Drivers');
      }

      // Check for LED Lamps (Retrofit bulbs/tubes)
      if (
        catLower === 'led lamps' ||
        catLower === 'lamps' ||
        catLower.includes('filament') ||
        catLower.includes('reflector') ||
        catLower.includes('tube') ||
        catLower.includes('bulb') ||
        catLower.includes('gu10') ||
        catLower.includes('mr16') ||
        catLower.includes('classic') ||
        catLower.includes('dim-to-warm')
      ) {
        resultCategories.add('LED Lamps');
      }
    }
  }

  // 2. Fallback matching rules based on family name / description if not resolved yet
  const name = (family.name || '').toLowerCase();
  const desc = (family.description || '').toLowerCase();
  const text = `${name} ${desc}`;

  if (
    text.includes('downlight') ||
    text.includes('batten') ||
    text.includes('panel') ||
    text.includes('track') ||
    text.includes('cabinet') ||
    text.includes('ceiling') ||
    text.includes('indoor') ||
    text.includes('high bay') ||
    text.includes('highbay') ||
    text.includes('low bay') ||
    text.includes('wall lamp') ||
    text.includes('wall luminaire') ||
    text.includes('damp proof') ||
    text.includes('linear') ||
    text.includes('pendant') ||
    text.includes('spotlight') ||
    text.includes('bulkhead') ||
    text.includes('bunker') ||
    text.includes('lyra') ||
    text.includes('siena') ||
    text.includes('toledo') ||
    text.includes('triona') ||
    text.includes('renzo') ||
    text.includes('berto') ||
    text.includes('fonda') ||
    text.includes('dino') ||
    text.includes('dani') ||
    text.includes('marcus') ||
    text.includes('morris') ||
    text.includes('carl') ||
    text.includes('conor') ||
    text.includes('estela') ||
    text.includes('enzo') ||
    text.includes('kepler') ||
    text.includes('lucas') ||
    text.includes('mila') ||
    text.includes('toby') ||
    text.includes('claudia') ||
    text.includes('berna') ||
    text.includes('gemma') ||
    text.includes('luca') ||
    text.includes('gabio') ||
    text.includes('bruno') ||
    text.includes('garron') ||
    text.includes('hagon') ||
    text.includes('kana') ||
    text.includes('karina') ||
    text.includes('keo') ||
    text.includes('keto') ||
    text.includes('marco')
  ) {
    resultCategories.add('Indoor Luminaires');
  }

  if (
    text.includes('floodlight') ||
    text.includes('garden') ||
    text.includes('outdoor') ||
    text.includes('bulkhead') ||
    text.includes('bunker') ||
    text.includes('bollard') ||
    text.includes('street') ||
    text.includes('fonda') ||
    text.includes('hera')
  ) {
    resultCategories.add('Outdoor Luminaires');
  }

  if (
    text.includes('exit') ||
    text.includes('emergency') ||
    text.includes('twinspot') ||
    text.includes('sign')
  ) {
    resultCategories.add('Emergency Lighting');
  }

  if (
    text.includes('iot') ||
    text.includes('ngenium') ||
    text.includes('management') ||
    text.includes('infinite') ||
    text.includes('matter') ||
    text.includes('smart')
  ) {
    resultCategories.add('Light Management');
  }

  if (text.includes('driver') || text.includes('control gear') || text.includes('ballast')) {
    resultCategories.add('Drivers');
  }

  if (
    text.includes('bulb') ||
    text.includes('tubes') ||
    text.includes('tube') ||
    text.includes('filament') ||
    text.includes('reflector') ||
    text.includes('gu10') ||
    text.includes('mr16') ||
    text.includes('e27') ||
    text.includes('e14') ||
    text.includes('candle') ||
    text.includes('globe') ||
    text.includes('lamp')
  ) {
    resultCategories.add('LED Lamps');
  }

  if (resultCategories.size === 0) {
    resultCategories.add('Others');
  }

  return Array.from(resultCategories);
};

// Intelligent search & subcategory matching function
const matchesFamilySearch = (family: Family & { resolvedCategories: string[] }, searchQuery: string): boolean => {
  if (!searchQuery || !searchQuery.trim()) return true;

  const rawQuery = searchQuery.trim().toLowerCase();
  const normQuery = rawQuery.replace(/[^a-z0-9]/g, '');

  const categoryNames = (family.categories || []).map(c => c?.name?.toLowerCase() || '').filter(Boolean);
  const resolvedCats = (family.resolvedCategories || []).map(c => c.toLowerCase());
  const familyName = (family.name || '').toLowerCase();
  const familyDesc = (family.description || '').toLowerCase();
  const productNames = (family.products || []).map(p => p?.name?.toLowerCase() || '').filter(Boolean);
  const productDescs = (family.products || []).map(p => p?.description?.toLowerCase() || '').filter(Boolean);

  const allStrings = [
    familyName,
    familyDesc,
    ...categoryNames,
    ...resolvedCats,
    ...productNames,
    ...productDescs,
  ];

  // 1. Direct substring match
  if (allStrings.some(str => str.includes(rawQuery))) {
    return true;
  }

  // 2. Normalized alphanumeric match (ignores spaces, hyphens, slashes)
  const allNormStrings = allStrings.map(str => str.replace(/[^a-z0-9]/g, ''));
  if (normQuery && allNormStrings.some(str => str.includes(normQuery) || normQuery.includes(str))) {
    return true;
  }

  // 3. Subcategory and Synonym mapping for navbar items
  if (rawQuery.includes('ceiling')) {
    if (allStrings.some(s => s.includes('ceiling'))) return true;
  }
  if (rawQuery.includes('downlight')) {
    if (allStrings.some(s => s.includes('downlight') || s.includes('recessed') || s.includes('spotlight'))) return true;
  }
  if (rawQuery.includes('batten')) {
    if (allStrings.some(s => s.includes('batten') || s.includes('linear') || s.includes('waterproof'))) return true;
  }
  if (rawQuery.includes('high bay') || rawQuery.includes('highbay')) {
    if (allStrings.some(s => s.includes('highbay') || s.includes('high bay') || s.includes('high-bay') || s.includes('low bay') || s.includes('keo'))) return true;
  }
  if (rawQuery.includes('track')) {
    if (allStrings.some(s => s.includes('track') || s.includes('marco') || s.includes('spotlight'))) return true;
  }
  if (rawQuery.includes('panel')) {
    if (allStrings.some(s => s.includes('panel') || s.includes('berto'))) return true;
  }
  if (rawQuery.includes('cabinet')) {
    if (allStrings.some(s => s.includes('cabinet') || s.includes('batten') || s.includes('linear') || s.includes('keto') || s.includes('bruno'))) return true;
  }
  if (rawQuery.includes('wall') || rawQuery.includes('bulkhead')) {
    if (allStrings.some(s => s.includes('wall') || s.includes('bulkhead') || s.includes('bunker') || s.includes('fonda') || s.includes('hera') || s.includes('renzo'))) return true;
  }
  if (rawQuery.includes('floodlight')) {
    if (allStrings.some(s => s.includes('floodlight') || s.includes('flood'))) return true;
  }
  if (rawQuery.includes('garden')) {
    if (allStrings.some(s => s.includes('garden') || s.includes('spike') || s.includes('bollard'))) return true;
  }
  if (rawQuery.includes('exit') || rawQuery.includes('emergency') || rawQuery.includes('twinspot')) {
    if (allStrings.some(s => s.includes('exit') || s.includes('emergency') || s.includes('twinspot') || s.includes('sign') || s.includes('module'))) return true;
  }
  if (rawQuery.includes('tube')) {
    if (allStrings.some(s => s.includes('tube') || s.includes('tubes') || s.includes('t8') || s.includes('t5'))) return true;
  }
  if (rawQuery.includes('filament')) {
    if (allStrings.some(s => s.includes('filament'))) return true;
  }
  if (rawQuery.includes('reflector')) {
    if (allStrings.some(s => s.includes('reflector') || s.includes('par') || s.includes('gu10') || s.includes('mr16') || s.includes('ar111'))) return true;
  }
  if (rawQuery.includes('classic') || rawQuery.includes('bulb')) {
    if (allStrings.some(s => s.includes('classic') || s.includes('bulb') || s.includes('candle') || s.includes('globe') || s.includes('e27') || s.includes('e14') || s.includes('b22'))) return true;
  }

  // 4. Multi-token matching
  const tokens = rawQuery.split(/\s+/).filter(t => t.length > 1);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every(token => 
      allStrings.some(str => str.includes(token)) ||
      (token === 'indoor' && resolvedCats.includes('indoor luminaires')) ||
      (token === 'outdoor' && resolvedCats.includes('outdoor luminaires')) ||
      (token === 'lighting' && (resolvedCats.includes('indoor luminaires') || resolvedCats.includes('outdoor luminaires') || resolvedCats.includes('emergency lighting'))) ||
      ((token === 'lamp' || token === 'lamps') && (resolvedCats.includes('led lamps') || allStrings.some(s => s.includes('lamp') || s.includes('bulb'))))
    );
    if (allTokensMatch) return true;
  }

  return false;
};

const CATEGORIES = [
  'All',
  'LED Lamps',
  'Indoor Luminaires',
  'Outdoor Luminaires',
  'Emergency Lighting',
  'Light Management',
  'Drivers',
  'Others'
];

export default function ProductsCatalog({ families }: ProductsCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL params when URL changes
  useEffect(() => {
    let category = searchParams.get('category') || 'All';
    // Map URL category params to our new display names
    const catLower = category.toLowerCase();
    if (catLower === 'lamps' || catLower === 'led lamps') category = 'LED Lamps';
    else if (catLower === 'indoor' || catLower === 'indoor lighting' || catLower === 'indoor luminaires') category = 'Indoor Luminaires';
    else if (catLower === 'outdoor' || catLower === 'outdoor lighting' || catLower === 'outdoor luminaires') category = 'Outdoor Luminaires';
    else if (catLower === 'emergency' || catLower === 'emergency lighting') category = 'Emergency Lighting';
    else if (catLower === 'light management' || catLower === 'iot') category = 'Light Management';
    else if (catLower === 'drivers') category = 'Drivers';
    
    const search = searchParams.get('search') || '';
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Helper to update categories parameter in URL
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      // Set simplified string for URL cleaness, or matching tag
      params.set('category', category);
    }
    // Clear search when changing main categories to prevent conflicts
    params.delete('search');
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Helper to update search parameter in URL
  const handleSearchChange = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!query) {
      params.delete('search');
    } else {
      params.set('search', query);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Enrich families with resolved category tags
  const enrichedFamilies = useMemo(() => {
    return families.map(f => ({
      ...f,
      resolvedCategories: resolveCategories(f)
    }));
  }, [families]);

  // Dynamic filtering and search calculations
  const filteredFamilies = useMemo(() => {
    return enrichedFamilies
      .filter(family => {
        const matchesCategory = selectedCategory === 'All' || family.resolvedCategories.includes(selectedCategory);
        const matchesSearch = matchesFamilySearch(family, searchQuery);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const pA = typeof a.priority === 'number' ? a.priority : 0;
        const pB = typeof b.priority === 'number' ? b.priority : 0;
        if (pB !== pA) {
          return pB - pA;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [enrichedFamilies, selectedCategory, searchQuery]);

  // Find category object with image dynamically from families
  const selectedCategoryObj = useMemo(() => {
    if (selectedCategory === 'All') return null;
    for (const family of families) {
      if (family.categories) {
        for (const cat of family.categories) {
          if (cat.name?.toLowerCase() === selectedCategory.toLowerCase() && cat.image) {
            return cat;
          }
        }
      }
    }
    return null;
  }, [families, selectedCategory]);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-24">
      {/* Premium Minimalist Hero Header */}
      <section className="bg-white border-b border-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-center max-w-4xl">
              {selectedCategoryObj && (
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 border border-gray-100 overflow-hidden rounded-xl shadow-sm group">
                  <Image
                    src={getImageUrl(selectedCategoryObj.image)}
                    alt={selectedCategoryObj.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#005288] mb-3 block">
                  {selectedCategory === 'All' ? 'MEGAMAN® PRODUCT CATALOG' : `MEGAMAN® ${selectedCategory.toUpperCase()}`}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                  {selectedCategory === 'All' ? 'Architectural & Technical Lighting' : selectedCategory}
                </h1>
                <p className="text-gray-500 font-light text-base md:text-lg leading-relaxed">
                  {selectedCategory === 'All'
                    ? 'Discover our high-precision product portfolio. Explore innovative, energy-efficient luminaires and smart control systems engineered to enrich modern spaces.'
                    : `Explore our premium range of ${selectedCategory.toLowerCase()} solutions, built with state-of-the-art thermal engineering and visual comfort specifications.`}
                </p>
              </div>
            </div>
            
            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#005288] focus:bg-white transition-all shadow-sm"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-3.5 text-gray-400 text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Horizontal Category Filtering System */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2.5">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#005288] text-white shadow-md shadow-blue-500/10'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <main className="container mx-auto px-6 max-w-7xl mt-12">
        {/* Count and Filters Summary */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
            Showing {filteredFamilies.length} of {enrichedFamilies.length} product families
          </p>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                handleCategoryChange('All');
              }}
              className="text-xs font-semibold text-[#005288] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* XAL-style Visual Grid */}
        {filteredFamilies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No collections match your criteria</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Try adjusting your search query or switching to another product category to discover our solutions.
            </p>
          </div>
        ) : (
          <div>
            {(() => {
              // Grouped mode vs single mode
              // If All is selected, we group by each main category
              const categoriesToRender = selectedCategory === 'All' 
                ? CATEGORIES.filter(c => c !== 'All')
                : [selectedCategory];

              return categoriesToRender.map((category) => {
                const familiesInCategory = filteredFamilies.filter(family => 
                  family.resolvedCategories.includes(category)
                );

                if (familiesInCategory.length === 0) return null;

                return (
                  <div key={category} className="mb-20">
                    {/* Category Section Title with premium style */}
                    <div className="border-b border-gray-150 pb-4 mb-8">
                      <div className="flex items-center gap-3">
                        <span className="h-5 w-1 bg-[#005288]" />
                        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-gray-900">
                          {category}
                        </h2>
                        <span className="text-xs text-gray-400 font-mono font-bold bg-gray-100 px-2 py-0.5 rounded">
                          {familiesInCategory.length}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-light mt-1.5 pl-4 max-w-2xl leading-relaxed">
                        {category === 'LED Lamps' && 'Classic retrofit lightbulbs, decorative filament series, high-efficacy reflector lamps, and custom linear tubes.'}
                        {category === 'Indoor Luminaires' && 'Deep-recessed low-glare downlights, adjustable track fixtures, continuous profiles, and customizable panels.'}
                        {category === 'Outdoor Luminaires' && 'High-performance architectural floodlights, spike garden lamps, and IP-rated municipal bulkheads.'}
                        {category === 'Emergency Lighting' && 'Standalone backup twinspots, egress pathway exit signs, and central battery compliance accessories.'}
                        {category === 'Light Management' && 'Intelligent smart nodes, Ingenium IoT components, and circadian rhythm tuning networks.'}
                        {category === 'Drivers' && 'High-reliability constant current drivers and custom dimming interfaces.'}
                        {category === 'Others' && 'Specialty light sources and related system options.'}
                      </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                      {familiesInCategory.map((family) => {
                        const categoryTag = (family.categories && family.categories.length > 0 && family.categories[0]?.name)
                          ? family.categories[0].name
                          : family.resolvedCategories[0] || 'Luminaires';
                        const imageItem = family.media?.find(m => m.type === 'image');
                        
                        return (
                          <Link
                            key={family.id}
                            href={`/families/${family.id}`}
                            className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100/50"
                          >
                            {/* Aspect Square Image Canvas */}
                            <div className="relative aspect-square w-full bg-transparent overflow-hidden flex items-center justify-center">
                              {imageItem ? (
                                <Image
                                  src={getImageUrl(imageItem)}
                                  alt={imageItem.alt || family.name}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                                  priority={false}
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                  {/* Elegant Geometric Vector Wireframe Placeholder */}
                                  <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-3 animate-pulse">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                  </div>
                                  <span className="text-xs text-black font-medium">MEGAMAN<sup>®</sup> Precision Light</span>
                                </div>
                              )}
                              
                              {/* Corner Tag */}
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                                <span className="text-[10px] font-bold text-black tracking-wider uppercase">
                                  {categoryTag}
                                </span>
                              </div>
                            </div>

                            {/* Details Card Section */}
                            <div className="p-5 bg-white border-t border-gray-50">
                              {/* Family Name */}
                              <h2 className="text-base font-bold text-black group-hover:text-[#005288] transition-colors leading-tight flex items-center justify-between">
                                <span>{family.name}</span>
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className="text-[10px] text-gray-400 group-hover:text-[#005288] group-hover:translate-x-1.5 transition-all duration-300"
                                />
                              </h2>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
