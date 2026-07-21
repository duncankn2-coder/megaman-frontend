"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faGlobe, 
  faSeedling, 
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';

export default function AboutMegamanPage() {
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

      {/* Hero Header Canvas with visual backdrop */}
      <section className="relative bg-slate-900 text-white min-h-[380px] flex items-center overflow-hidden border-b border-gray-200 z-10">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 opacity-80 select-none">
          <Image 
            src="/technology_directing-light.jpg" 
            alt="Megaman Brand Heritage Banner"
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
              <span className="h-[1px] w-8 bg-blue-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">
                COMPANY BACKGROUND • BRAND PROFILE
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              ABOUT <span className="font-bold text-[#005288] text-white">MEGAMAN<sup>®</sup></span>
            </h1>
            
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              German-engineered lighting solutions crafted for performance, visual excellence, and circular sustainability. Shaping the future of light for over three decades.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-[9px] uppercase tracking-wider">
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">Established 1994</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">GERMAN HERITAGE</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">100% ECO-LIGHTING</span>
            </div>
          </div>
        </div>

        {/* Dynamic blueprint drafting metrics */}
        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          SYSTEM: LIFE IN LIGHT • SCALE: GLOBAL
        </div>
      </section>

      {/* Breadcrumb Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-3.5 px-6 md:px-12 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#005288] transition-colors">Home</Link>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-400">Company</span>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <span className="text-gray-800 font-bold">About Megaman</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Section 1: Corporate Overview & Video */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Detail & Stats */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                GLOBAL LEADER IN ECO-LIGHTING
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                MEGAMAN<sup>®</sup> - Leading the World in Energy Efficient Lighting
              </h2>
              <div className="h-[2px] w-12 bg-[#005288]"></div>
            </div>

            <p className="text-base text-gray-700 font-light leading-relaxed font-sans">
              MEGAMAN<sup>®</sup> is a global brand in high-performance, energy-efficient lighting and an innovative leader in LED bulbs and luminaires, with technology targeting a sustainable solution. MEGAMAN<sup>®</sup> originated in Germany, our inception since 1994. MEGAMAN<sup>®</sup> products and service offering have evolved over time to meet the every-changing demands of the dynamic market. By setting environmental management as one of the company&apos;s highest priorities, MEGAMAN<sup>®</sup> delivers brilliant lighting solutions engineered to brighten us today and protect our world for tomorrow.
            </p>

            {/* Micro Stats Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="border border-gray-200 bg-white p-4 text-center shadow-sm">
                <FontAwesomeIcon icon={faHistory} className="text-[#005288] text-lg mb-2" />
                <span className="block text-xl font-bold text-gray-900 font-mono">1994</span>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-mono">incorporated</span>
              </div>
              <div className="border border-gray-200 bg-white p-4 text-center shadow-sm">
                <FontAwesomeIcon icon={faGlobe} className="text-[#005288] text-lg mb-2" />
                <span className="block text-xl font-bold text-gray-900 font-mono">GERMANY</span>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-mono">originated</span>
              </div>
              <div className="border border-gray-200 bg-white p-4 text-center shadow-sm">
                <FontAwesomeIcon icon={faSeedling} className="text-[#005288] text-lg mb-2" />
                <span className="block text-xl font-bold text-gray-900 font-mono">100%</span>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-mono">committed to sustainability</span>
              </div>
            </div>
          </div>

          {/* Right Column: Responsive Video Embed */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-video w-full border border-gray-200 shadow-md overflow-hidden bg-slate-900">
              <iframe 
                className="w-full h-full object-cover" 
                src="https://www.youtube.com/embed/0YZaNLINlVY?rel=0&amp;autohide=1&amp;showinfo=0&amp;fs=0" 
                title="MEGAMAN® Corporate Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-dashed border-gray-300 -z-10 pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* Section 2: Our Philosophy */}
      <section className="bg-gray-50 border-y border-gray-200 py-24 mt-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Image with architectural border styling */}
            <div className="lg:col-span-5 order-2 lg:order-1 relative">
              <div className="relative aspect-square w-full max-w-[420px] mx-auto border border-gray-200 bg-white p-4 shadow-sm">
                <div className="relative w-full h-full overflow-hidden">
                  <Image 
                    src="/life_in_light.jpg" 
                    alt="Life in Light Philosophy"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* Visual corners crosshairs */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#005288] -translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#005288] translate-x-1 translate-y-1"></div>
              </div>
            </div>

            {/* Right Column: Philosophy Narrative */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                  BRAND ESSENCE
                </span>
                <h3 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-none">
                  Our Philosophy – <span className="font-bold font-serif italic text-[#005288]">“Life in Light!”</span>
                </h3>
              </div>

              <div className="space-y-4 text-base text-gray-700 font-light leading-relaxed font-sans">
                <p>
                  A glowing sphere of light is symbolic of life. Light’s power is in its ability to provide a dynamic focus in an ever-changing universe. Light is alive, radiating its colourful character and sparkling vibrancy to the world.
                </p>
                <p>
                  Artificial light transforms how we live, work, and play. It drives workplace productivity, ensures safe travel at any hour, and brings evening entertainment to life. By overcoming the limits of daylight, modern lighting allows us to make the most of every hour of the day.
                </p>
                <p>
                  MEGAMAN<sup>®</sup> is dedicated to enhancing the quality of life through innovation. We offer a diverse range of advanced LED solutions—spanning various shapes, sizes, and colour temperatures—designed to benefit both consumers and the environment. By embedding eco-conscious practices across our entire product lifecycle to achieve sustainability, we deliver innovative lighting solutions that protect our world. MEGAMAN<sup>®</sup> continues to pioneer sustainable technologies that illuminate a better tomorrow for all.
                </p>
                <p className="font-semibold text-lg text-[#005288] pt-2">
                  MEGAMAN<sup>®</sup> - The light that lights up the world in a sustainable and socially responsible way.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Environmental Commitment & Pillars */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#005288]"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] font-mono">
              SUSTAINABILITY & COMPLIANCE
            </span>
            <span className="h-[2px] w-8 bg-[#005288]"></span>
          </div>

          <h3 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-gray-900 leading-snug">
            MEGAMAN<sup>®</sup> - The light that lights up the world in a <span className="font-bold text-[#005288]">sustainable</span> and <span className="font-bold text-[#005288]">socially responsible</span> way.
          </h3>

          <p className="text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            With an emphasis on reducing the environmental impact, from product development to disposal and recycling, MEGAMAN<sup>®</sup> leads the way with its innovations and new lighting technology, striving for a better tomorrow for all.
          </p>
        </div>
      </section>

      {/* Section 4: Design Philosophy */}
      <section className="bg-gray-50 border-t border-gray-200 py-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[#005288] block">
                  PRODUCT VISION
                </span>
                <h3 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                  Design Philosophy
                </h3>
                <div className="h-[2px] w-12 bg-[#005288]"></div>
              </div>
              
              <p className="text-base text-gray-700 font-light leading-relaxed font-sans">
                Our design philosophy unites modular flexibility and intelligent control with an uncompromising commitment to sustainability and effortless convenience.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono uppercase tracking-wider text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#005288] shrink-0"></span>
                  <span>Flexibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#005288] shrink-0"></span>
                  <span>Convenience</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#005288] shrink-0"></span>
                  <span>Sustainability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#005288] shrink-0"></span>
                  <span>Intelligence</span>
                </div>
              </div>
            </div>

            {/* Right Column: Image Display */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative w-full aspect-[4/1] bg-white p-4 border border-gray-200 shadow-sm group overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/design-philosophy.png" 
                    alt="Megaman Design Philosophy: Flexibility, Convenience, Sustainability, Intelligence"
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-contain group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                {/* Crosshairs styling accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#005288]/40"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#005288]/40"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA section to other company pages */}
      <section className="bg-slate-900 text-white py-16 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h4 className="text-xl font-light uppercase tracking-widest">WANT TO DISCOVER MORE?</h4>
            <p className="text-sm text-slate-400 font-light max-w-xl">
              Learn about our certification systems, environmental report metrics, quality standards, and the awards MEGAMAN<sup>®</sup> has won over the years.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider">
            <Link 
              href="/company/quality" 
              className="border border-white/20 bg-white/5 hover:bg-[#005288] hover:border-[#005288] px-5 py-3 transition-colors flex items-center gap-2"
            >
              <span>Quality Assurance</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
            </Link>
            <Link 
              href="/company/environment-and-sustainability" 
              className="border border-white/20 bg-white/5 hover:bg-[#005288] hover:border-[#005288] px-5 py-3 transition-colors flex items-center gap-2"
            >
              <span>Environment</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
}
