"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faGlobe, 
  faSeedling, 
  faHistory,
  faLightbulb,
  faCheck,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';

export default function QualityPage() {
  const benefits = [
    { title: "High energy efficiency", desc: "Delivering the same light levels using about 20% of the electricity.", icon: faSeedling },
    { title: "Lower carbon footprint", desc: "Generating 80% less CO2 to combat environmental impact.", icon: faGlobe },
    { title: "Longer life", desc: "LED technology achieves an impressive lifespan of up to 50,000 hours.", icon: faHistory },
    { title: "LED Technology breakthrough", desc: "Superior thermal management with exceptionally high lumen output.", icon: faLightbulb },
    { title: "Early payback", desc: "Significantly more cost-effective over its operational lifecycle.", icon: faAward },
    { title: "Minimal heat production", desc: "Greatly improves operating safety and reduces ambient heat load.", icon: faCheck },
    { title: "Better lighting experience", desc: "A wide range of colour temperatures tailored for specific atmospheres.", icon: faCheck },
    { title: "Wide choice of lamps", desc: "Lamps for home, office, industrial, and public buildings (internal and external).", icon: faCheck },
    { title: "Universal compatibility", desc: "Compatible with the majority of existing systems for quick and easy replacement.", icon: faCheck }
  ];

  const innovations = [
    { year: "2022", text: "Infinite IoT lighting solution developed based on Bluetooth Low Energy which is widely adopted in smartphones and tablets." },
    { year: "2019", text: "Total Solution Provider of innovate and design LEDs with high degree of flexibility and adaptability." },
    { year: "2018", text: "Launched innovative Dual Beam Technology (DBT) which empowers to have two beam angles in one single luminaire, achieving both narrow and a wider light shape." },
    { year: "2016", text: "Launched U-DIM™ Technology – seamless dimming and compatible with the widest range of existing dimmers. Launched Hybrid Reflector Technology offering excellent optics, efficacy and beam control." },
    { year: "2015", text: "Launched INGENIUM® ZB Smart Lighting Solution and a full range of LED Luminaires. Expansion of TECOH® range with TECOH® APx." },
    { year: "2014", text: "Launched first smart lighting range, INGENIUM® BLU. Industry first full range of Dim to Warm LED Products." },
    { year: "2013", text: "Integrated LED luminaires introduced." },
    { year: "2012", text: "Patented LED module - TECOH® MHx. TECOH® CFx – World’s first 2000lm Zhaga Book2 Certified Light Engine." },
    { year: "2011", text: "R9 technology introduced to LED range. The first NVLAP lab certification for LED products." },
    { year: "2010", text: "Launched the first MEGAMAN® LED Candle and Classic." },
    { year: "2009", text: "Innovative Thermal Conductive Highway technology incorporated into MEGAMAN® LED reflectors. NVLAP lab certification for CFL products." },
    { year: "2008", text: "Amalgam technology is employed in full CFL range." },
    { year: "2007", text: "DIMMERABLE® technology introduced to CFL range." },
    { year: "2005", text: "DorS technology introduced to CFL range. Industry first RoHS compliant CFL. MEGAMAN® goes global, selling lamps in over 90 countries." },
    { year: "2004", text: "INGENIUM® technology is introduced to CFL lamps for long life and short preheating time." },
    { year: "2002", text: "Industry first CFL GU10 reflector launched. Introduced Silicone Protection technology to CFL range." },
    { year: "1999", text: "Patented Cooling-Tube technology introduced to CFL range." },
    { year: "1997", text: "Industry first candle-shaped CFL launched." },
    { year: "1994", text: "MEGAMAN® incorporated." }
  ];

  const standards = [
    { 
      id: "9001",
      name: "ISO 9001:2015", 
      title: "Quality Management System", 
      desc: "Ensuring products consistently meet customer requirements, and that quality is consistently improved.", 
      image: "/images/quality_logo_1.png" 
    },
    { 
      id: "14001",
      name: "ISO 14001:2015", 
      title: "Environmental Management", 
      desc: "Framework to protect the environment and respond to changing environmental conditions in balance with socio-economic needs.", 
      image: "/images/quality_logo_14001.png" 
    },
    { 
      id: "18001",
      name: "OHSAS 18001:2007", 
      title: "Occupational Health & Safety", 
      desc: "International standard specifying requirements for an occupational health and safety management system.", 
      image: "/images/quality_logo_4.png" 
    },
    { 
      id: "8000",
      name: "SA 8000:2014", 
      title: "Social Accountability System", 
      desc: "Leading social certification standard promoting decent work and ethical labor practices throughout global supply chains.", 
      image: "/images/quality_logo_SA8000-BV.jpg" 
    }
  ];

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
            src="/banners/products.jpg" 
            alt="Megaman Quality Assurance Banner"
            fill
            className="object-cover object-center"
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
                ENGINEERING STANDARDS • SYSTEM COMPLIANCE
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              QUALITY <span className="font-bold text-[#005288] text-white">ASSURANCE</span>
            </h1>
            
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              Delivering international success through rigorous product testing, innovative engineering standards, and worldwide quality certificates.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-[9px] uppercase tracking-wider">
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">ISO 9001 CERTIFIED</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">RoHS COMPLIANT</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">SA 8000 CERTIFIED</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          STANDARDS: INTERNATIONAL • COMPLIANCE: 100%
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
              <span className="text-gray-800 font-bold">Quality</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Grid of Quality Images */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative aspect-video md:aspect-[4/3] w-full border border-gray-200 bg-white p-2 shadow-sm group overflow-hidden">
            <div className="relative w-full h-full overflow-hidden">
              <Image 
                src="/images/quality_photo_1.png" 
                alt="Megaman Quality Control Laboratory"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="relative aspect-video md:aspect-[4/3] w-full border border-gray-200 bg-white p-2 shadow-sm group overflow-hidden">
            <div className="relative w-full h-full overflow-hidden">
              <Image 
                src="/images/quality_photo_2.png" 
                alt="Luminaires Rigorous Quality Testing"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="relative aspect-video md:aspect-[4/3] w-full border border-gray-200 bg-white p-2 shadow-sm group overflow-hidden">
            <div className="relative w-full h-full overflow-hidden">
              <Image 
                src="/images/quality_photo_3.png" 
                alt="International Standard Quality Inspection"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Excellence & Benefits Section */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                DELIVERING CUSTOMER VALUES
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                Excellence in Product Innovation and Quality
              </h2>
              <div className="h-[2px] w-12 bg-[#005288]"></div>
            </div>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              The international success of MEGAMAN® has been built on the ability of its lighting products to deliver substantial benefits to a wide range of customers globally.
            </p>
          </div>

          {/* Right Column: Benefits Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((item, idx) => (
              <div key={idx} className="border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005288] shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={item.icon} className="text-[9px]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#005288] transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rigorous Quality Certifications Section */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Management systems description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                GLOBAL COMPLIANCE STRATEGY
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                Rigorous Quality and Management Systems
              </h2>
              <div className="h-[2px] w-12 bg-[#005288]"></div>
            </div>
            
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              MEGAMAN® products comply with the highest international quality standards. The manufacturing sites and operational systems have achieved global recognition to standard qualifications, assuring reliability and social accountability in all business layers.
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
              <FontAwesomeIcon icon={faAward} className="text-[#005288]" />
              <span>CERTIFICATION STANDARD AUDIT LEVEL: PASS</span>
            </div>
          </div>

          {/* Right Column: Certification cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {standards.map((std) => (
              <div key={std.id} className="border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col items-center text-center">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center overflow-hidden">
                  <Image 
                    src={std.image} 
                    alt={`${std.name} Standard Certificate`}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                
                <h4 className="text-sm font-bold text-gray-900 tracking-wider font-mono">{std.name}</h4>
                <span className="text-[10px] text-[#005288] uppercase tracking-widest font-mono font-bold mt-1 mb-2">{std.title}</span>
                <p className="text-xs text-gray-500 font-light leading-relaxed">{std.desc}</p>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#005288] transition-colors"></div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* World-beating Product Innovation Timeline */}
      <section className="bg-gray-50 border-y border-gray-200 py-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-20">
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
              HERITAGE OF PIONEERING LIGHT
            </span>
            <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
              World-beating Product Innovation
            </h2>
            <div className="h-[2px] w-12 bg-[#005288] mx-auto"></div>
            <p className="text-xs text-gray-500 font-light max-w-xl mx-auto pt-2">
              For nearly three decades, MEGAMAN® has led the lighting industry with technological breakthroughs, from early CFL improvements to circular IoT-powered LED engines.
            </p>
          </div>

          {/* Timeline Components */}
          <div className="max-w-4xl mx-auto relative border-l border-gray-200 pl-8 md:pl-12 space-y-12">
            {innovations.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] md:-left-[57px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-200 group-hover:border-[#005288] transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-[#005288] transition-colors"></div>
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-[#005288] text-white text-xs font-mono font-bold tracking-wider uppercase">
                    {item.year}
                  </span>
                  <p className="text-sm text-gray-600 font-light leading-relaxed max-w-2xl">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation CTA to other company profiles */}
      <section className="bg-slate-900 text-white py-16 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h4 className="text-xl font-light uppercase tracking-widest">DISCOVER CORPORATE RESPONSIBILITY</h4>
            <p className="text-xs text-slate-400 font-light max-w-xl">
              Learn how MEGAMAN® integrates ecological sustainability into raw material lifecycles, and our brand heritage.
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
              href="/company/environment-and-sustainability" 
              className="border border-white/20 bg-white/5 hover:bg-[#005288] hover:border-[#005288] px-5 py-3 transition-colors flex items-center gap-2"
            >
              <span>Environmental Protection</span>
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
