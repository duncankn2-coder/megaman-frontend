"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

interface Media {
  id: string;
  url: string;
  alt?: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location: string;
  applicationType: 'hospitality' | 'retail' | 'residential' | 'commercial';
  listImage: Media | string; // support populated media object or string url
}

interface ProjectsListClientProps {
  initialProjects: Project[];
}

const CATEGORY_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Retail', value: 'retail' },
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
];

// Fallback high-quality mock projects to show if CMS is empty or during initial load
const MOCK_PROJECTS: Project[] = [
  {
    id: 'mock-1',
    title: 'The Grand Hyatt Lobby & Reception',
    slug: 'grand-hyatt-lobby',
    location: 'Munich, Germany',
    applicationType: 'hospitality',
    listImage: '/hotel_lobby_lighting.png',
    description: 'Dynamic cove layering and high-color rendering ambient spotlights for standard visual excellence.',
  },
  {
    id: 'mock-2',
    title: 'Luminary Premium Concept Store',
    slug: 'luminary-concept-store',
    location: 'Tokyo, Japan',
    applicationType: 'retail',
    listImage: '/retail_project_showroom.png',
    description: 'High-contrast spotlighting and glare-free downlights designed to emphasize premium merchandise textures.',
  },
  {
    id: 'mock-3',
    title: 'The Minimalist Sky Penthouse',
    slug: 'sky-penthouse',
    location: 'London, UK',
    applicationType: 'residential',
    listImage: '/hotel_suite_bedroom.png',
    description: 'Circadian-biology-ready tunable white light solutions operated via intuitive smart control gear.',
  },
  {
    id: 'mock-4',
    title: 'Vanguard Corporate Innovation Hub',
    slug: 'vanguard-tech-hub',
    location: 'Hong Kong',
    applicationType: 'commercial',
    listImage: '/smart_lighting_matter.png',
    description: 'Full integration of low-glare LED office fixtures with smart IoT matter mesh control nodes.',
  },
];

export default function ProjectsListClient({ initialProjects }: ProjectsListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      const lower = category.toLowerCase();
      if (['hospitality', 'retail', 'residential', 'commercial'].includes(lower)) {
        setSelectedFilter(lower);
        return;
      }
    }
    setSelectedFilter('all');
  }, [searchParams]);

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    router.push(`/projects?${params.toString()}`, { scroll: false });
  };

  // If no projects exist in database, display the fallbacks so page is immediately gorgeous
  const displayProjects = initialProjects.length > 0 ? initialProjects : MOCK_PROJECTS;

  const filteredProjects = selectedFilter === 'all'
    ? displayProjects
    : displayProjects.filter(p => p.applicationType === selectedFilter);

  // Helper to safely get the image URL from dynamic CMS payload structure or fallback
  const getImageUrl = (listImage: Media | string): string => {
    if (typeof listImage === 'string') return listImage;
    if (listImage && listImage.url) {
      // If it's a relative URL from CMS, prefix it with payload url
      if (listImage.url.startsWith('/')) {
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        return `${payloadUrl}${listImage.url}`;
      }
      return listImage.url;
    }
    return '/placeholder.png';
  };

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen pb-24 font-sans relative">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-black"></div>
      </div>

      {/* 1. Banner */}
      <section className="relative bg-slate-950 text-white min-h-[360px] md:min-h-[440px] flex items-center overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 opacity-40 select-none">
          <Image 
            src="/hero_architectural_light.png" 
            alt="MEGAMAN Architectural Projects Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-blue-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">
                APPLICATIONS IN LIGHT
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              SHAPING <span className="font-bold text-[#005288] text-white">SPACES</span>
            </h1>
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed">
              MEGAMAN® premium lighting systems are engineered with German precision, bringing dynamic design, energy efficiency, and comfort to award-winning portfolios.
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          PROJECT DATABASE • GLOBAL REFERENCES
        </div>
      </section>

      {/* 2. Main Page Content (Title, Description, Filter, Grid) */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-16 md:mt-24 relative z-10">
        
        {/* Title & Description */}
        <div className="max-w-3xl space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-gray-900">
            Projects
          </h2>
          <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">
            From luxury hospitality suites to high-intensity retail concept galleries, discover how our custom lighting engineering provides high color rendering and precise beam delivery for architectural mastery.
          </p>
        </div>

        {/* 3. Filter of application type */}
        <div className="border-b border-gray-200 pb-6 mb-12">
          <div className="flex flex-wrap gap-2 md:gap-4 font-mono text-xs uppercase tracking-widest">
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-5 py-2.5 transition-all duration-300 border font-bold cursor-pointer rounded-none text-[11px] ${
                    isActive
                      ? 'border-[#005288] bg-[#005288] text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-400'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Project list grid (3 columns, square layout) */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group relative aspect-square w-full overflow-hidden bg-slate-900 border border-gray-150 shadow-sm transition-transform duration-300"
              >
                {/* Image background */}
                <Image
                  src={getImageUrl(project.listImage)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                {/* Content at the bottom-left */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-1.5 pointer-events-none">
                  <h3 className="text-white text-lg font-bold uppercase tracking-wide leading-tight group-hover:text-blue-300 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <span className="text-gray-300 text-xs font-mono uppercase tracking-wider">
                    {project.location}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200">
            <span className="text-xs uppercase tracking-widest font-mono text-gray-400 block mb-2">No projects found</span>
            <p className="text-xs text-gray-500 font-light">Add projects or select a different category filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
