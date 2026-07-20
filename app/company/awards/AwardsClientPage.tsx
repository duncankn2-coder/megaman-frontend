"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faSeedling, 
  faCheckDouble,
  faLightbulb,
  faStar,
  faBuildingColumns
} from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';

export interface AwardLogo {
  id: string;
  url: string;
  alt?: string;
}

export interface AwardItem {
  id: string;
  category: 'environmental' | 'quality' | 'technological' | 'other';
  year: string;
  title: string;
  institution: string;
  logo?: string | AwardLogo | null;
}

interface AwardsClientPageProps {
  initialAwards: AwardItem[];
}

export default function AwardsClientPage({ initialAwards }: AwardsClientPageProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Dynamically calculate counts based on initialAwards
  const counts = useMemo(() => {
    const total = initialAwards.length;
    let environmental = 0;
    let quality = 0;
    let technological = 0;
    let other = 0;

    initialAwards.forEach((award) => {
      if (award.category === 'environmental') environmental++;
      else if (award.category === 'quality') quality++;
      else if (award.category === 'technological') technological++;
      else if (award.category === 'other') other++;
    });

    return { total, environmental, quality, technological, other };
  }, [initialAwards]);

  const tabs = [
    { id: 'all', name: 'All Awards', count: counts.total, color: 'text-slate-900 border-slate-950 bg-slate-950/5', activeColor: 'bg-slate-900 text-white' },
    { id: 'environmental', name: 'Environmental', count: counts.environmental, color: 'text-emerald-700 border-emerald-500 bg-emerald-50/50', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { id: 'quality', name: 'Quality Recognition', count: counts.quality, color: 'text-blue-700 border-blue-500 bg-blue-50/50', activeColor: 'bg-[#005288] text-white border-[#005288]' },
    { id: 'technological', name: 'Technology', count: counts.technological, color: 'text-orange-700 border-orange-500 bg-orange-50/50', activeColor: 'bg-orange-600 text-white border-orange-600' },
    { id: 'other', name: 'Other Endorsements', count: counts.other, color: 'text-purple-700 border-purple-500 bg-purple-50/50', activeColor: 'bg-purple-600 text-white border-purple-600' }
  ];

  const filteredAwards = useMemo(() => {
    if (activeTab === 'all') {
      return initialAwards;
    }
    return initialAwards.filter(item => item.category === activeTab);
  }, [initialAwards, activeTab]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'environmental':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          accent: 'group-hover:bg-emerald-600',
          border: 'group-hover:border-emerald-500',
          icon: faSeedling
        };
      case 'quality':
        return {
          bg: 'bg-blue-50 border-blue-100 text-blue-700',
          accent: 'group-hover:bg-[#005288]',
          border: 'group-hover:border-[#005288]',
          icon: faCheckDouble
        };
      case 'technological':
        return {
          bg: 'bg-orange-50 border-orange-100 text-orange-700',
          accent: 'group-hover:bg-orange-600',
          border: 'group-hover:border-orange-500',
          icon: faLightbulb
        };
      default:
        return {
          bg: 'bg-purple-50 border-purple-100 text-purple-700',
          accent: 'group-hover:bg-purple-600',
          border: 'group-hover:border-purple-500',
          icon: faStar
        };
    }
  };

  const getImageUrl = (logo: any) => {
    if (!logo) return '';
    if (typeof logo === 'string') return logo;
    if (logo.url) {
      const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
      if (logo.url.startsWith('http://') || logo.url.startsWith('https://')) {
        return logo.url;
      }
      return `${payloadUrl}${logo.url}`;
    }
    return '';
  };

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen pb-0 font-sans selection:bg-[#005288] selection:text-white relative overflow-hidden">
      {/* Drafting Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-black"></div>
        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-black"></div>
        <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-black"></div>
        <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-black"></div>
      </div>

      {/* Hero Header Banner */}
      <section className="relative bg-slate-900 text-white min-h-[380px] flex items-center overflow-hidden border-b border-gray-200 z-10">
        <div className="absolute inset-0 opacity-80 select-none">
          <Image 
            src="/banners/award.jpg" 
            alt="Megaman Awards Banner"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#002b47]/75 via-[#002b47]/25 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-amber-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 font-mono">
                GLOBAL RECOGNITION • BRAND HONORS
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              HONORS & <span className="font-bold text-[#005288] text-white">AWARDS</span>
            </h1>
            
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              MEGAMAN® has been endorsed globally by international bodies for Environmental Achievement, Quality Standards, Technological Innovation, and CSR Management.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-[9px] uppercase tracking-wider">
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">ESG VALUE AWARDS</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">LUX INNOVATIONS</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">GERMAN CONSUMER RATINGS</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          STANDARDS: WORLDWIDE • BRAND ENDORSEMENTS: 50+
        </div>
      </section>

      {/* Breadcrumb Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-3.5 px-6 md:px-12 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-[10px] uppercase font-mono tracking-wider text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#005288] transition-colors">Home</Link>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-400">Company</span>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-800 font-bold">Awards</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Interactive Tabs Filtering Navigation */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-16 relative z-10">
        <div className="flex flex-wrap gap-3 justify-center pb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                activeTab === tab.id 
                  ? tab.activeColor
                  : `${tab.color} border-transparent hover:border-gray-300`
              }`}
            >
              {tab.name} <span className="ml-1 text-[9px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Awards Layout Grid Display */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-12 relative z-10 min-h-[400px]">
        {filteredAwards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 bg-white">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">No awards found</p>
            <p className="text-sm text-gray-500">Awards in this category will appear here once published in the CMS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAwards.map((item) => {
              const styles = getCategoryStyles(item.category);
              const logoUrl = getImageUrl(item.logo);

              return (
                <div 
                  key={item.id} 
                  className={`border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative ${styles.border}`}
                >
                  <div className="space-y-4">
                    {/* Category badge & Year */}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                        {item.category === 'environmental' && 'Environmental'}
                        {item.category === 'quality' && 'Quality Recognition'}
                        {item.category === 'technological' && 'Technology'}
                        {item.category === 'other' && 'General Honors'}
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-none border ${styles.bg}`}>
                        {item.year}
                      </span>
                    </div>

                    {/* Logo Image */}
                    <div className="w-full h-24 flex items-center justify-center overflow-hidden bg-slate-50 border border-gray-100 p-3 shadow-inner">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={logoUrl}
                          alt={`${item.title} Logo`}
                          className="max-w-full max-h-full object-contain"
                          style={{ maxHeight: '72px' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300 gap-1">
                          <FontAwesomeIcon icon={styles.icon} className="text-2xl" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">Award</span>
                        </div>
                      )}
                    </div>

                    {/* Award Title */}
                    <h4 className="text-sm font-bold text-gray-900 leading-snug tracking-wide group-hover:text-[#005288] transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  {/* Institution & Icon Footer */}
                  <div className="pt-6 mt-6 flex items-center justify-between border-t border-gray-100 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <div className="flex items-center gap-2 text-[10px] font-mono leading-none">
                      <FontAwesomeIcon icon={faBuildingColumns} className="text-[11px] shrink-0" />
                      <span className="truncate max-w-[150px]">{item.institution}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors shrink-0">
                      <FontAwesomeIcon icon={styles.icon} className="text-[10px] group-hover:text-[#005288]" />
                    </div>
                  </div>

                  {/* Accent Top Border Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-transparent ${styles.accent} transition-colors`}></div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA section to other company pages */}
      <section className="bg-slate-900 text-white py-16 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h4 className="text-xl font-light uppercase tracking-widest">DISCOVER CORPORATE HERITAGE</h4>
            <p className="text-xs text-slate-400 font-light max-w-xl">
              Learn about our brand background origin, our environment program lifecycles, and quality management standard processes.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider">
            <Link 
              href="/company/about-megaman" 
              className="border border-white/20 bg-white/5 hover:bg-[#005288] hover:border-[#005288] px-5 py-3 transition-colors flex items-center gap-2"
            >
              <span>About MEGAMAN®</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
            </Link>
            <Link 
              href="/company/quality" 
              className="border border-white/20 bg-white/5 hover:bg-[#005288] hover:border-[#005288] px-5 py-3 transition-colors flex items-center gap-2"
            >
              <span>Quality Assurance</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
