"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight, faFilter, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
  media: MediaItem[];
  products: Product[];
  categories?: { id: string; name: string }[];
}

interface ProductsCatalogProps {
  families: Family[];
}

// Map families to primary categories for precise catalog filtering (XAL Style)
const resolveCategories = (family: Family): string[] => {
  const cats = new Set<string>();
  
  // 1. From family categories inside CMS
  family.categories?.forEach(c => {
    if (c.name) {
      cats.add(c.name);
      
      // Dynamically map specific CMS category names to their parent catalog filter categories
      const catLower = c.name.toLowerCase();
      if (
        catLower.includes('classic') ||
        catLower.includes('filament') ||
        catLower.includes('reflector') ||
        catLower.includes('tube') ||
        catLower.includes('lamp') ||
        catLower.includes('bulb')
      ) {
        cats.add('Lamps');
      }
      if (
        catLower.includes('bulkhead') ||
        catLower.includes('downlight') ||
        catLower.includes('batten') ||
        catLower.includes('panel') ||
        catLower.includes('track') ||
        catLower.includes('cabinet') ||
        catLower.includes('ceiling') ||
        catLower.includes('indoor') ||
        catLower.includes('high bay') ||
        catLower.includes('wall')
      ) {
        cats.add('Indoor Lighting');
      }
      if (
        catLower.includes('floodlight') ||
        catLower.includes('garden') ||
        catLower.includes('outdoor')
      ) {
        cats.add('Outdoor Lighting');
      }
      if (
        catLower.includes('exit') ||
        catLower.includes('emergency') ||
        catLower.includes('twinspot') ||
        catLower.includes('sign')
      ) {
        cats.add('Emergency Lighting');
      }
      if (
        catLower.includes('iot') ||
        catLower.includes('ngenium') ||
        catLower.includes('management') ||
        catLower.includes('infinite') ||
        catLower.includes('matter')
      ) {
        cats.add('Light Management');
      }
      if (catLower.includes('driver')) {
        cats.add('Drivers');
      }
    }
  });
  
  // 2. Fallback matching rules based on family name
  const name = family.name.toLowerCase();
  if (
    name.includes('bulb') || 
    name.includes('lamp') || 
    name.includes('tubes') || 
    name.includes('efficiency') || 
    name.includes('filament') ||
    name.includes('classic') ||
    name.includes('reflector') ||
    name.includes('decorative') ||
    name.includes('dim-to-warm') ||
    name.includes('360')
  ) {
    cats.add('Lamps');
  }
  if (
    name.includes('downlight') || 
    name.includes('batten') || 
    name.includes('panel') || 
    name.includes('track') || 
    name.includes('cabinet') || 
    name.includes('ceiling') || 
    name.includes('indoor') || 
    name.includes('bulkhead') ||
    name.includes('high bay') ||
    name.includes('wall lamp') ||
    name.includes('damp proof')
  ) {
    cats.add('Indoor Lighting');
  }
  if (
    name.includes('floodlight') || 
    name.includes('garden') || 
    name.includes('outdoor')
  ) {
    cats.add('Outdoor Lighting');
  }
  if (
    name.includes('exit') || 
    name.includes('emergency') || 
    name.includes('twinspot') || 
    name.includes('bulkhead') ||
    name.includes('sign') ||
    name.includes('recessed downlight')
  ) {
    cats.add('Emergency Lighting');
  }
  if (
    name.includes('iot') || 
    name.includes('ngenium') || 
    name.includes('management') || 
    name.includes('infinite') ||
    name.includes('matter')
  ) {
    cats.add('Light Management');
  }
  if (name.includes('driver')) {
    cats.add('Drivers');
  }

  // Fallback to "Others" if no categories mapped
  if (cats.size === 0) {
    cats.add('Others');
  }

  return Array.from(cats);
};

const CATEGORIES = [
  'All',
  'Lamps',
  'Indoor Lighting',
  'Outdoor Lighting',
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
    const category = searchParams.get('category') || 'All';
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
    return enrichedFamilies.filter(family => {
      const matchesCategory = selectedCategory === 'All' || family.resolvedCategories.includes(selectedCategory);
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        family.name.toLowerCase().includes(searchLower) ||
        (family.description && family.description.toLowerCase().includes(searchLower)) ||
        (family.products?.some(p => p.name.toLowerCase().includes(searchLower)) ?? false) ||
        family.resolvedCategories.some(cat => cat.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [enrichedFamilies, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-24">
      {/* Premium Minimalist Hero Header */}
      <section className="bg-white border-b border-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#005288] mb-3 block">
                MEGAMAN® PRODUCT CATALOG
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                Architectural & Technical Lighting
              </h1>
              <p className="text-gray-500 font-light text-base md:text-lg leading-relaxed">
                Discover our high-precision product portfolio. Explore innovative, energy-efficient luminaires and smart control systems engineered to enrich modern spaces.
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredFamilies.map((family) => {
              const categoryTag = family.resolvedCategories[0] || 'Others';
              const imageItem = family.media?.find(m => m.type === 'image');
              
              return (
                <Link
                  key={family.id}
                  href={`/families/${family.id}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100/50"
                >
                  {/* Aspect Square Image Canvas */}
                  <div className="relative aspect-square w-full bg-gradient-to-b from-gray-50/50 to-gray-100/50 overflow-hidden flex items-center justify-center">
                    {imageItem ? (
                      <Image
                        src={imageItem.url && (imageItem.url.startsWith('http') || imageItem.url.startsWith('/'))
                          ? imageItem.url
                          : imageItem.filename
                            ? `${process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}/media/${imageItem.filename}`
                            : '/placeholder.png'
                        }
                        alt={imageItem.alt || family.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        {/* Elegant Geometric Vector Wireframe Placeholder */}
                        <div className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-3 animate-pulse">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">MEGAMAN® Precision Light</span>
                      </div>
                    )}
                    
                    {/* Corner Tag */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold text-gray-600 tracking-wider uppercase">
                        {categoryTag}
                      </span>
                    </div>
                  </div>

                  {/* Details Card Section */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow justify-between bg-white border-t border-gray-50">
                    <div>
                      {/* Family Name */}
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#005288] transition-colors leading-tight flex items-center justify-between">
                        <span>{family.name}</span>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-[10px] text-gray-300 group-hover:text-[#005288] group-hover:translate-x-1.5 transition-all duration-300"
                        />
                      </h2>
                      
                      {/* Description */}
                      {family.description ? (
                        <p className="text-gray-500 font-light text-sm mt-2.5 leading-relaxed line-clamp-3">
                          {family.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 font-light text-sm mt-2.5 italic">
                          Explore our full premium lighting collection options under the {family.name} series.
                        </p>
                      )}
                    </div>

                    {/* Footer Specifications & CTA */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
                        {family.products?.length || 0} Model Variations
                      </span>
                      <span className="text-xs font-bold text-[#005288] group-hover:underline flex items-center gap-1">
                        View Models
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
