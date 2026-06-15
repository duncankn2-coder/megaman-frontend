import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMapMarkerAlt, faBuilding, faSlidersH, faLightbulb, faCube, faServer } from '@fortawesome/free-solid-svg-icons';

export const dynamic = 'force-dynamic';

interface Media {
  id: string;
  url: string;
  alt?: string;
}

interface ContentRow {
  id?: string;
  layoutType: 'full' | 'one-third-two-thirds' | 'two-thirds-one-third' | 'half-half';
  leftImage: Media | string;
  rightImage?: Media | string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location: string;
  applicationType: 'hospitality' | 'retail' | 'residential' | 'commercial';
  bannerImage: Media | string;
  contentRows?: ContentRow[];
}

// Fallback high-quality mock detail data matching listing fallback
const MOCK_PROJECTS_DETAIL: Record<string, Project> = {
  'grand-hyatt-lobby': {
    id: 'mock-1',
    title: 'The Grand Hyatt Lobby & Reception',
    slug: 'grand-hyatt-lobby',
    location: 'Munich, Germany',
    applicationType: 'hospitality',
    bannerImage: '/hotel_lobby_lighting.png',
    description: 'Lobbies are the visual signature of a hospitality environment. The lighting design combines warm lateral cove reflection (using linear indirect pathways) with high-intensity accent beams on reception desks to naturally guide guests and create an immediate sense of grandeur. Warm white (2700K - 3000K) and high color rendering indexes (CRI ≥ 90) ensure that the premium materials and textures of the architectural design are fully highlighted with supreme comfort.',
    contentRows: [
      {
        layoutType: 'half-half',
        leftImage: '/hotel_lobby_lighting.png',
        rightImage: '/hotel_lounge_bar.png',
      },
      {
        layoutType: 'full',
        leftImage: '/hospitality_project_lobby.png',
      }
    ]
  },
  'luminary-concept-store': {
    id: 'mock-2',
    title: 'Luminary Premium Concept Store',
    slug: 'luminary-concept-store',
    location: 'Tokyo, Japan',
    applicationType: 'retail',
    bannerImage: '/retail_project_showroom.png',
    description: 'A premium retail concept store demands focused beam delivery and deep color fidelity to accentuate fabrics and merchandise. The design utilizes high-efficiency low-glare spots. High color rendering (CRI ≥ 95) guarantees color fidelity, and targeted spots ensure that product displays are highlight-focused while secondary walkways remain ambient, creating a luxurious and focused shopping experience.',
    contentRows: [
      {
        layoutType: 'two-thirds-one-third',
        leftImage: '/retail_project_showroom.png',
        rightImage: '/hotel_lounge_bar.png',
      }
    ]
  },
  'sky-penthouse': {
    id: 'mock-3',
    title: 'The Minimalist Sky Penthouse',
    slug: 'sky-penthouse',
    location: 'London, UK',
    applicationType: 'residential',
    bannerImage: '/hotel_suite_bedroom.png',
    description: 'Human centric residential design focusing on smart controls, tunable circadian lighting curves, and hidden architectural coves for absolute visual serenity. Guests can transition light parameters dynamically from 2200K up to 6500K to perfectly match their biological cognitive balances, using custom-programmed Matter control gear nodes for total control.',
    contentRows: [
      {
        layoutType: 'one-third-two-thirds',
        leftImage: '/hotel_suite_bedroom.png',
        rightImage: '/hotel_lobby_lighting.png',
      }
    ]
  },
  'vanguard-tech-hub': {
    id: 'mock-4',
    title: 'Vanguard Corporate Innovation Hub',
    slug: 'vanguard-tech-hub',
    location: 'Hong Kong',
    applicationType: 'commercial',
    bannerImage: '/smart_lighting_matter.png',
    description: 'Modern energy efficiency compliant workspace combining clean linear fixtures, high-intensity task beams, and DALI-2 control protocols for optimal collaboration environments. Fully glare-restricted downlights (UGR < 19) reduce eyestrain and enhance concentration across open-office grids, while low-power LED profiles keep operations within green compliance standards.',
    contentRows: [
      {
        layoutType: 'half-half',
        leftImage: '/smart_lighting_matter.png',
        rightImage: '/hero_architectural_light.png',
      }
    ]
  }
};

async function getProject(slug: string): Promise<Project | null> {
  // First attempt: fetch from CMS
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/projects?where[slug][equals]=${slug}&depth=2`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        return data.docs[0];
      }
    }
  } catch (error) {
    console.error(`Error fetching project detail for slug ${slug}:`, error);
  }

  // Fallback: match from local mocks
  if (MOCK_PROJECTS_DETAIL[slug]) {
    return MOCK_PROJECTS_DETAIL[slug];
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return {
      title: 'Project Not Found | MEGAMAN®',
    };
  }
  return {
    title: `${project.title} - MEGAMAN® Case Study`,
    description: project.description || `Case study for MEGAMAN® lighting installations in ${project.location}.`,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  // Helper to safely get the image URL from dynamic CMS structure
  const getImageUrl = (image: Media | string | undefined): string => {
    if (!image) return '/placeholder.png';
    if (typeof image === 'string') return image;
    if (image.url) {
      if (image.url.startsWith('/')) {
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        return `${payloadUrl}${image.url}`;
      }
      return image.url;
    }
    return '/placeholder.png';
  };

  const getApplicationLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen pb-24 font-sans relative">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-black"></div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative bg-slate-950 text-white min-h-[460px] md:min-h-[520px] flex items-center overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 opacity-45 select-none">
          <Image 
            src={getImageUrl(project.bannerImage)} 
            alt={`${project.title} Banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-6">
            <Link 
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Projects
            </Link>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-wider text-blue-400">
                <FontAwesomeIcon icon={faBuilding} className="opacity-80" />
                <span>{getApplicationLabel(project.applicationType)} Application Study</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-widest leading-none">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gray-300">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#005288]" />
              <span>{project.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Description Block */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-16 md:mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-[11px] font-bold font-mono uppercase tracking-[0.25em] text-[#005288]">
              PROJECT OVERVIEW & NARRATIVE
            </h2>
            <p className="text-gray-600 font-light text-sm md:text-base leading-relaxed whitespace-pre-line">
              {project.description || "Detailed case study description is currently being formatted. MEGAMAN® high-performance optical gear delivers premium luminance control and low glare parameters."}
            </p>
          </div>

          <div className="lg:col-span-4 bg-white border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-2.5">
              Technical Details
            </h3>
            <div className="space-y-4 text-xs font-mono text-gray-600">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-400">LOCATION</span>
                <span className="text-gray-900">{project.location}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-400">APPLICATION</span>
                <span className="text-gray-900">{getApplicationLabel(project.applicationType)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-400">COMPLIANCE</span>
                <span className="text-gray-900">EN 12464-1 Standard</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-bold text-gray-400">LIGHT ENGINE</span>
                <span className="text-gray-900">CRI ≥ 90 / CRI ≥ 95</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Image Rows Section */}
      {project.contentRows && project.contentRows.length > 0 && (
        <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-16 md:mt-24 space-y-8 md:space-y-12 relative z-10">
          <h2 className="text-[11px] font-bold font-mono uppercase tracking-[0.25em] text-[#005288] border-b border-gray-200 pb-3">
            GALLERY & APPLICATION DETAIL SCENES
          </h2>

          <div className="space-y-8 md:space-y-12">
            {project.contentRows.map((row, idx) => {
              const layout = row.layoutType;
              const leftSrc = getImageUrl(row.leftImage);
              const rightSrc = row.rightImage ? getImageUrl(row.rightImage) : '';

              if (layout === 'full') {
                return (
                  <div key={idx} className="w-full relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                    <Image 
                      src={leftSrc} 
                      alt={`${project.title} detailed scene full width ${idx}`} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                );
              }

              if (layout === 'one-third-two-thirds') {
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    <div className="md:col-span-4 relative aspect-[4/3] md:aspect-square overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      <Image 
                        src={leftSrc} 
                        alt={`${project.title} detailed scene 1/3 layout ${idx}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="md:col-span-8 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      {rightSrc && (
                        <Image 
                          src={rightSrc} 
                          alt={`${project.title} detailed scene 2/3 layout ${idx}`} 
                          fill 
                          className="object-cover" 
                        />
                      )}
                    </div>
                  </div>
                );
              }

              if (layout === 'two-thirds-one-third') {
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    <div className="md:col-span-8 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      <Image 
                        src={leftSrc} 
                        alt={`${project.title} detailed scene 2/3 layout ${idx}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="md:col-span-4 relative aspect-[4/3] md:aspect-square overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      {rightSrc && (
                        <Image 
                          src={rightSrc} 
                          alt={`${project.title} detailed scene 1/3 layout ${idx}`} 
                          fill 
                          className="object-cover" 
                        />
                      )}
                    </div>
                  </div>
                );
              }

              if (layout === 'half-half') {
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      <Image 
                        src={leftSrc} 
                        alt={`${project.title} detailed scene left half ${idx}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                      {rightSrc && (
                        <Image 
                          src={rightSrc} 
                          alt={`${project.title} detailed scene right half ${idx}`} 
                          fill 
                          className="object-cover" 
                        />
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </section>
      )}

      {/* Pillars of Lighting Excellence CTA */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-24 relative z-10">
        <div className="bg-slate-950 border border-slate-900 text-white p-8 md:p-12 relative shadow-lg">
          <div className="max-w-3xl space-y-4 mb-12">
            <h3 className="text-2xl uppercase tracking-widest font-light">
              ARCHITECTURAL INTEGRITY
            </h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              MEGAMAN® system parameters governing advanced project layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Visual Comfort & Shield',
                desc: 'Utilizing micro-lens reflectors and sidelite engineering to keep glare indices (UGR < 19) extremely low, maintaining guest visual comfort.',
                icon: faSlidersH
              },
              {
                title: 'Human Centric Design',
                desc: 'Integrating circadian rhythm lighting curves that sync warm to cool shifts, naturally matching biological cognitive balances.',
                icon: faLightbulb
              },
              {
                title: 'Energy & Matter Mesh',
                desc: 'Leveraging professional low-power IoT control gears, scheduling matrices, and automated ambient sensors.',
                icon: faCube
              },
              {
                title: 'High Color Fidelity',
                desc: 'Ensuring deep architectural texture matches using Ra ≥ 90/95 high color rendering LED modules.',
                icon: faServer
              }
            ].map((pillar, idx) => (
              <div key={idx} className="space-y-4 border-t border-slate-800/80 pt-6">
                <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  <FontAwesomeIcon icon={pillar.icon} className="text-xs" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider">{pillar.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
