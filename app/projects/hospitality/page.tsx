"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { renderWithSup } from '../../utils/text';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faCheckCircle, 
  faSlidersH, 
  faCube, 
  faLightbulb, 
  faBookOpen, 
  faFilePdf,
  faServer
} from '@fortawesome/free-solid-svg-icons';

interface ZoneDetail {
  title: string;
  subtitle: string;
  image: string;
  concept: string;
  features: string[];
  specs: { label: string; value: string }[];
  products: { name: string; type: string; link: string }[];
}

const ZONES: Record<string, ZoneDetail> = {
  lobby: {
    title: 'The Grand Lobby & Reception',
    subtitle: 'PRECISE COVE LAYERING & WELCOMING UNIFORMITY',
    image: '/hotel_lobby_lighting.png',
    concept: 'Lobbies are the visual signature of a hospitality environment. The lighting design combines warm lateral cove reflection (using linear indirect pathways) with high-intensity accent beams on reception desks to naturally guide guests and create an immediate sense of grandeur.',
    features: [
      'Layered horizontal coves for atmospheric height extension',
      'Precise warm spotlights (3000K, CRI > 90) on checking counters',
      'Anti-glare optical diffusers providing premium visual comfort',
      'Integrated light sensors adjusting brightness dynamically'
    ],
    specs: [
      { label: 'Recommended CCT', value: '2700K – 3000K (Warm White)' },
      { label: 'Color Rendering', value: 'CRI ≥ 90 (Ra)' },
      { label: 'Glare Index limit', value: 'UGR < 19' },
      { label: 'Control Protocol', value: 'DALI-2 / Matter scenes' }
    ],
    products: [
      { name: 'Toledo Toledo Spots', type: 'Low-Glare Spotlights', link: '/products?category=Indoor%20Lighting&search=Toledo' },
      { name: 'Renzo Xchange Ceiling', type: 'Architectural Bulkhead', link: '/products?category=Indoor%20Lighting&search=Renzo' }
    ]
  },
  lounge: {
    title: 'The Lounge & Dining Bar',
    subtitle: 'COZY CONTRASTS & ATMOSPHERIC DIM-TO-WARM SCENOGRAPHY',
    image: '/hotel_lounge_bar.png',
    concept: 'A hospitality lounge and restaurant require atmospheric, intimate contrasts. Dynamic dim-to-warm track spots (transitioning from 3000K down to 1800K) create highly focused pools of light on dining tables, keeping transit pathways subtle and secondary for absolute privacy.',
    features: [
      'Focused spot beams emphasizing tabletop textures',
      'Warm amber decorative elements forming cozy sightlines',
      'Micro-reflective optics preventing unwanted glare spill',
      'Zoned control gear supporting customizable dining scenes'
    ],
    specs: [
      { label: 'Recommended CCT', value: '1800K – 2700K (Dim-to-Warm)' },
      { label: 'Color Rendering', value: 'CRI ≥ 95 (Vibrant skin tones)' },
      { label: 'Glare Index limit', value: 'UGR < 16 (Ultra-cozy)' },
      { label: 'Zonings', value: 'Pre-set dinner/cocktail scenes' }
    ],
    products: [
      { name: 'Toledo Premium Spot', type: 'Recessed Downlights', link: '/products?category=Indoor%20Lighting&search=Toledo' },
      { name: 'INGENIUM Matter Dimmer', type: 'Light Management Node', link: '/products?category=Light%20Management' }
    ]
  },
  suite: {
    title: 'The Luxury Suites & Rooms',
    subtitle: 'HUMAN CENTRIC LIGHTING & PERSONAL COGNITIVE BALANCES',
    image: '/hotel_suite_bedroom.png',
    concept: 'Guest rooms serve as multi-functional sanctuaries for relaxation, work, and sleep. Tunable Human Centric Lighting (HCL) mimics natural circadian shifts, delivering active cool light during midday and calming amber glows at bedtime, all operated via intuitive smart controls.',
    features: [
      'Circadian rhythm synchronization (Tunable HCL system)',
      'Hidden linear backlighting forming relaxing ambient coves',
      'Ultra-low minimum dimming values (down to 1% current)',
      'Pre-programmed intuitive night-light pathways'
    ],
    specs: [
      { label: 'CCT Range', value: '2200K – 6500K (Tunable White)' },
      { label: 'Color Rendering', value: 'CRI ≥ 90' },
      { label: 'Insulation Rating', value: 'IP44 (Suitable for bathrooms)' },
      { label: 'Smart Ecosystem', value: 'Infinite IoT / Matter mesh' }
    ],
    products: [
      { name: 'Renzo Xchange IP44', type: 'Corridor & Bath Bulkhead', link: '/products?category=Indoor%20Lighting&search=Renzo' },
      { name: 'Toledo Spots HCL', type: 'Tunable White spots', link: '/products?category=Indoor%20Lighting&search=Toledo' }
    ]
  }
};

export default function HospitalityProjectsPage() {
  const [activeZone, setActiveZone] = useState<'lobby' | 'lounge' | 'suite'>('lobby');
  const zone = ZONES[activeZone];

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen pb-24 font-sans selection:bg-[#005288] selection:text-white relative">
      {/* Drafting Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-black"></div>
        <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-black"></div>
        <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-black"></div>
      </div>

      {/* Hero Header Canvas with visual backdrop */}
      <section className="relative bg-slate-950 text-white min-h-[480px] flex items-center overflow-hidden border-b border-gray-900">
        {/* Background Image with warm overlay */}
        <div className="absolute inset-0 opacity-50 select-none">
          <Image 
            src="/hotel_lobby_lighting.png" 
            alt="Hospitality Architectural Lighting"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-blue-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">
                APPLICATION STUDY • HOSPITALITY
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              LIGHT FOR <span className="font-bold text-[#005288] text-white">WELLBEING</span>
            </h1>
            
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed">
              In premium hotel and hospitality design, light is not merely functional—it shapes the atmospheric identity, reinforces architectural spaces, and orchestrates comfort. Explore how MEGAMAN<sup>®</sup>&apos;s state-of-the-art engineering elevates emotional luxury.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 font-mono text-[9px] uppercase tracking-wider">
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">DIN-EN 12464 compliance</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">CRI ≥ 90 standard</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">CIRCADIAN BIOLOGY READY</span>
            </div>
          </div>
        </div>

        {/* Dynamic blueprint drafting metrics */}
        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          SCALE: 1:25 • BEAM SHIELD: UGR &lt; 19
        </div>
      </section>

      {/* Dynamic Zone configurator section */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl uppercase tracking-widest text-gray-900 font-light">
            INTERACTIVE APPLICATION DESIGN STUDY
          </h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider leading-relaxed">
            Click on a lighting zone to explore the customized technical planning requirements and suggested product configurations.
          </p>
        </div>

        {/* Tab switch Navigation */}
        <div className="flex justify-center border-b border-gray-200 mb-12 text-xs uppercase font-mono tracking-widest">
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            {Object.keys(ZONES).map((key) => {
              const isActive = activeZone === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveZone(key as 'lobby' | 'lounge' | 'suite')}
                  className={`py-4 px-6 border-b-2 font-bold cursor-pointer transition-all ${
                    isActive
                      ? 'border-[#005288] text-[#005288]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {key === 'lobby' ? 'Reception Lobby' : key === 'lounge' ? 'Dining Lounge' : 'Luxury Suite'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone study display grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white border border-gray-200 p-8 shadow-sm">
          {/* Left: Render Image with dynamic overlay */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="relative aspect-video w-full border border-gray-200 overflow-hidden bg-gray-50 shadow-inner group">
              <Image 
                src={zone.image} 
                alt={zone.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute bottom-4 left-4 bg-slate-950/80 text-white font-mono text-[9px] px-3 py-1 tracking-wider uppercase backdrop-blur-sm">
                PLAN FILE STUDY RENDER
              </div>
            </div>
            
            {/* Architectural Concept details */}
            <div className="bg-gray-50 border border-gray-150 p-6 space-y-3 shadow-inner">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                ARCHITECTURAL LIGHTING CONCEPT
              </span>
              <p className="text-[12px] text-gray-600 leading-relaxed font-light font-sans">
                {zone.concept}
              </p>
            </div>
          </div>

          {/* Right: Technical specifications list */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#005288]">
                {zone.subtitle}
              </span>
              <h3 className="text-2xl uppercase tracking-widest text-gray-900 font-light font-sans leading-none">
                {zone.title}
              </h3>
            </div>

            {/* Zonal Key design guidelines */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-gray-400 pb-1.5 border-b border-gray-150">
                Key Design Requirements
              </h4>
              <div className="space-y-3 font-sans">
                {zone.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[#005288] text-sm mt-0.5" />
                    <span className="text-xs text-gray-600 font-light leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Planning Specs table */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-gray-400 pb-1.5 border-b border-gray-150">
                Target Planning Parameters
              </h4>
              <table className="w-full border-collapse font-mono text-[11px] text-gray-600">
                <tbody>
                  {zone.specs.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 px-1 font-bold text-gray-400 w-1/2">{row.label}</td>
                      <td className="py-2 px-1 text-gray-900 font-medium">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommended Products */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-gray-400 pb-1.5 border-b border-gray-150">
                Recommended Luminaires
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zone.products.map((p, idx) => (
                  <Link 
                    key={idx}
                    href={p.link}
                    className="flex justify-between items-center p-3.5 border border-gray-200 bg-white hover:border-[#005288] hover:text-[#005288] transition-all text-left font-mono text-[10px] shadow-sm group"
                  >
                    <div>
                      <span className="font-bold block uppercase">{p.name}</span>
                      <span className="text-[9px] text-gray-400 mt-0.5 block">{p.type}</span>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-xs" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RZB Core lighting pillars section */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-24 relative z-10">
        <div className="bg-slate-950 border border-slate-900 text-white p-8 md:p-12 relative shadow-lg">
          <div className="max-w-3xl space-y-4 mb-12">
            <h2 className="text-2xl uppercase tracking-widest font-light">
              HOSPITALITY DESIGN PILLARS
            </h2>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Essential technical foundations governing professional architectural planning.
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

      {/* Premium Product recommendations Showcase */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-gray-200 mb-10 gap-4">
          <div>
            <h2 className="text-2xl uppercase tracking-widest text-gray-900 font-light">
              RECOMMENDED LUMINAIRE ECOSYSTEM
            </h2>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">
              German-engineered precision fixtures perfectly suited for luxury spaces.
            </p>
          </div>
          <Link 
            href="/products"
            className="text-xs font-bold uppercase tracking-widest text-[#005288] hover:underline"
          >
            Explore Catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Renzo Xchange Bulkhead',
              desc: 'Premium ceiling luminaire featuring circular visual perfection and plug-and-play parameter modules. Ideal for suites and restrooms.',
              img: '/FCL76100v0 sc.png',
              link: '/products?category=Indoor%20Lighting&search=Renzo',
              tag: 'IP44 PROTECTION'
            },
            {
              title: 'Toledo Recessed spot',
              desc: 'High-performance architect spot featuring ultra-slim profile depth and sidelite reflection. Ideal for lobbies and high ceilings.',
              img: '/original (3).png',
              link: '/products?category=Indoor%20Lighting&search=Toledo',
              tag: 'UGR < 19 LOW GLARE'
            },
            {
              title: 'INGENIUM® Matter Gear',
              desc: 'State-of-the-art Matter mesh controller, enabling flexible zoning, scheduling, and scenes without central hubs.',
              img: '/media/original (3).png', // fallback or reuse
              link: '/products?category=Light%20Management',
              tag: 'INTELLIGENT IOT'
            }
          ].map((prod, idx) => (
            <div 
              key={idx}
              className="group flex flex-col bg-white border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Aspect Square Image */}
              <div className="relative aspect-square w-full bg-gray-50 border-b border-gray-150 flex items-center justify-center p-8 overflow-hidden">
                {/* Fallback to generated default placeholder if not resolved */}
                <Image 
                  src={prod.img.includes('/media/') && !idx ? '/original (3).png' : prod.img} 
                  alt={prod.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-102"
                />
                <span className="absolute top-4 left-4 bg-white border border-gray-150 font-mono text-[8px] font-bold px-2.5 py-1 tracking-wider uppercase">
                  {prod.tag}
                </span>
              </div>

              {/* Specs & Link Card */}
              <div className="p-6 md:p-8 flex flex-col flex-grow justify-between bg-white">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#005288] transition-colors">{renderWithSup(prod.title)}</h3>
                  <p className="text-xs text-gray-500 font-light mt-3 leading-relaxed">
                    {prod.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between font-mono text-[10px] font-bold">
                  <span className="text-[#005288] group-hover:underline">VIEW SPECIFICATIONS &rarr;</span>
                  <Link 
                    href={prod.link} 
                    className="bg-[#005288] text-white hover:bg-[#003c64] px-4 py-2 uppercase tracking-widest transition-all rounded-none shadow-sm"
                  >
                    CONFIGURATOR
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architectural Consultation Resources CTA */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-24 relative z-10">
        <div className="border border-gray-250 p-8 md:p-12 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
          <div className="max-w-2xl space-y-4">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-gray-400 block">
              DIALUX PLANNING & TECHNICAL CATALOGS
            </span>
            <h3 className="text-2xl uppercase tracking-widest text-gray-900 font-light font-sans leading-tight">
              Schedule a Professional Lighting Consultation
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              Access DIALux planning files, compliance certificates, and Revit BIM object databases. Our professional planning engineers are ready to support your next project matching and verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => alert('Hospitality Lighting Plan brochure will be downloaded as a PDF.')}
              className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 text-xs font-bold uppercase tracking-widest px-6 py-4 transition-all flex items-center justify-center gap-2 group shadow-sm rounded-none font-sans"
            >
              <FontAwesomeIcon icon={faFilePdf} className="text-gray-500" />
              PLANNING BROCHURE
            </button>
            <button 
              onClick={() => alert('Revit BIM Object and DIALux ULD databases are available for direct access. Please contact Megaman Engineering.')}
              className="bg-[#005288] text-white hover:bg-[#003c64] text-xs font-bold uppercase tracking-widest px-6 py-4 transition-all flex items-center justify-center gap-2 shadow-sm rounded-none font-sans"
            >
              <FontAwesomeIcon icon={faBookOpen} />
              DOWNLOAD CAD FILES
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
