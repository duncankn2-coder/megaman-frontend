"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faSeedling, 
  faRecycle,
  faLightbulb,
  faEye,
  faCompass,
  faLeaf,
  faHandHoldingHeart,
  faBookOpen,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer';

export default function EnvironmentAndSustainabilityPage() {
  const policyPoints = [
    { 
      title: "Pollution-Free Processes", 
      desc: "Implement pollution-free processes across the entire product life cycle, from early engineering to fabrication.", 
      icon: faSeedling 
    },
    { 
      title: "Renewable Materials", 
      desc: "Use renewable or recyclable materials to minimise the use of resources and optimize material recovery.", 
      icon: faRecycle 
    },
    { 
      title: "Legal & Code Compliance", 
      desc: "Strictly comply with international environmental legislation, safety guidelines, and industry codes of practice.", 
      icon: faCheck 
    },
    { 
      title: "Awareness Programs", 
      desc: "Promote active environmental protection awareness among staff members, suppliers, and global business partners.", 
      icon: faEye 
    }
  ];

  const objectives = [
    { title: "Better office resource utilization", desc: "Digital workflow transitions to minimize paper and office supply footprints.", icon: faLeaf },
    { title: "Office wastage recycling", desc: "Structured recycling programs across global offices for hardware and materials.", icon: faRecycle },
    { title: "Energy conservation", desc: "Transitioning operations to solar arrays and building automation sensors.", icon: faLightbulb },
    { title: "Operational awareness", desc: "Training campaigns promoting energy-saving habits and ecological best practices.", icon: faEye },
    { title: "Design for environment", desc: "Prioritizing modular assembly for simple component replacement and circular end-of-life recovery.", icon: faCompass }
  ];

  const activities = [
    { title: "WWF Earth Hour Support", desc: "Active global corporate participant in reducing electrical footprints annually.", year: "Annual Partner" },
    { title: "Sponsoring 'Go Green'", desc: "Publication sponsorships promoting ecological sustainability guides.", year: "Educational Campaign" },
    { title: "SDI 'Climate Action' Program", desc: "Partnership with Sustainable Development International to align operations with carbon reduction plans.", year: "International Alliance" },
    { title: "Friends of the Earth 'Dim it 621'", desc: "Advocating for the reduction of light pollution and excessive architectural outdoor projection.", year: "Community Campaign" },
    { title: "WWF Walk for Nature", desc: "Sponsorship of local community ecological walks to fund biodiverse habitat conservation.", year: "Eco Sponsorship" },
    { title: "HKSEA Art of Light", desc: "Encouraging young designers to innovate energy-efficient light installations and smart designs.", year: "Design Incubation" }
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
            src="/banners/environment-banner.jpg" 
            alt="Megaman Environment and Sustainability Banner"
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
              <span className="h-[1px] w-8 bg-emerald-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 font-mono">
                SUSTAINABLE DEVELOPMENT • POLICY PROTOCOL
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              ENVIRONMENT & <span className="font-bold text-[#005288] text-white">SUSTAINABILITY</span>
            </h1>
            
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              Emphasising a high priority in reducing environmental impact, from product development to disposal and recycling, MEGAMAN® offers lighting solutions that substantially benefit consumers as well as the planet.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 font-mono text-[9px] uppercase tracking-wider">
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">RoHS COMPLIANT</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">ISO 14001:2015</span>
              <span className="border border-white/20 bg-white/5 px-3 py-1.5 rounded-none backdrop-blur-sm">CIRCULAR LIFECYCLE</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 hidden lg:block text-[9px] font-mono text-white/30 uppercase tracking-widest">
          POLICY: BUILDING A BETTER TOMORROW • GOAL: CO2 REDUCTION
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
              <span className="text-gray-800 font-bold">Environment & Sustainability</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Section 1: Environmental Policy */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Policy overview */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                ENVIRONMENTAL POLICY
              </span>
              <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                Enhancing Quality of Life and Conserving the Planet
              </h2>
              <div className="h-[2px] w-12 bg-[#005288]"></div>
            </div>

            <p className="text-sm text-gray-600 font-light leading-relaxed">
              MEGAMAN® is passionately dedicated in enhancing the quality of life and conserving the environment. By setting environmental management as one of our highest priorities, MEGAMAN® is committed to reducing the environmental impact arising across the product life cycle, which is from design, manufacture, packaging and transportation, use, disposal and recycle.
            </p>

            <div className="border-l-4 border-[#005288] bg-gray-50 p-6 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 font-mono">OUR MISSION SENTENCE</span>
              <h4 className="text-lg font-bold font-serif italic text-[#005288] leading-none">“BUILDING A BETTER TOMORROW”</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Striving to incorporate sustainable protocols at every stage, assuring carbon footprint minimization and circular operations.
              </p>
            </div>
          </div>

          {/* Right: Policy commitments grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {policyPoints.map((point, idx) => (
              <div key={idx} className="border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#005288] shrink-0">
                    <FontAwesomeIcon icon={point.icon} className="text-sm text-[#005288]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">{point.title}</h4>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">{point.desc}</p>
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#005288] transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Objectives Grid */}
      <section className="bg-gray-50 border-y border-gray-200 py-24 mt-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-20">
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
              OPERATIONAL GOALS
            </span>
            <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900">
              Environmental Objectives
            </h2>
            <div className="h-[2px] w-12 bg-[#005288] mx-auto"></div>
            <p className="text-xs text-gray-500 font-light max-w-xl mx-auto pt-2">
              MEGAMAN® translates our mission statement into tangible, auditable operational milestones across global facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {objectives.map((obj, idx) => (
              <div key={idx} className="border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group relative">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005288] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={obj.icon} className="text-base" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 leading-tight min-h-[32px] flex items-center justify-center">
                  {obj.title}
                </h4>
                <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                  {obj.desc}
                </p>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#005288] transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Sustainable Development (Design for Environment) */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-24 relative z-10">
        <div className="border border-gray-200 bg-white p-8 md:p-12 shadow-sm relative group overflow-hidden max-w-4xl mx-auto">
          {/* Subtle blueprint accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#005288] -translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#005288] translate-x-1 translate-y-1"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#005288]">
                <FontAwesomeIcon icon={faSeedling} className="text-3xl text-[#005288]" />
              </div>
            </div>
            <div className="md:col-span-8 space-y-4">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                PRODUCT ENGINEERING FRAMEWORK
              </span>
              <h3 className="text-2xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                Sustainable Development & Design for Environment
              </h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Our internal **&ldquo;Design for Environment&rdquo;** program guides every stage of product development. Our target is to create eco-friendly lamps offering high energy-efficiency, minimum environmental footprints, zero hazardous substances (fully RoHS compliant), maximized durability, and complete component recyclability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Social Responsibility */}
      <section className="bg-gray-50 border-y border-gray-200 py-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: CSR Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#005288] block">
                  CORPORATE CITIZENSHIP
                </span>
                <h2 className="text-3xl font-light uppercase tracking-widest text-gray-900 leading-tight">
                  Running a Socially Responsible Business
                </h2>
                <div className="h-[2px] w-12 bg-[#005288]"></div>
              </div>

              <p className="text-sm text-gray-600 font-light leading-relaxed">
                MEGAMAN® takes its social responsibility seriously and has been actively involved in a wide variety of ecological, community, and educational projects worldwide. 
              </p>
              
              <div className="space-y-4 text-xs text-gray-500 font-light leading-relaxed">
                <p>
                  <strong>Environmental Protection:</strong> Active publishing of green books, participating in local and global green events, and designing innovative energy-saving light sources.
                </p>
                <p>
                  <strong>Nurturing Talent:</strong> Collaboration with design organizations and universities—such as the Royal College of Art, UK—to research and formulate sustainable lighting concepts.
                </p>
                <p>
                  <strong>Society Care:</strong> Providing donations, direct relief assistance, and reconstruction support in the aftermath of natural disasters.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 font-mono pt-2">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[#005288]" />
                <span>MEGAMAN® SOCIAL COMMITMENT</span>
              </div>
            </div>

            {/* Right: Activities Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activities.map((act, idx) => (
                <div key={idx} className="border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 bg-gray-100 text-gray-600 rounded-none">
                      {act.year}
                    </span>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                      {act.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#005288] transition-colors"></div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Section 5: Sustainability Report CTA */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-24 relative z-10">
        <div className="bg-slate-900 text-white p-8 md:p-12 text-center space-y-6 max-w-3xl mx-auto shadow-md relative overflow-hidden">
          {/* Subtle structural pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,82,136,0.15),transparent)] pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#005288] text-white mx-auto mb-4">
              <FontAwesomeIcon icon={faBookOpen} className="text-lg" />
            </div>
            
            <h3 className="text-2xl font-light uppercase tracking-widest leading-tight">
              MEGAMAN® Sustainability Report
            </h3>
            
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Read our comprehensive corporate reports outlining direct ecological audits, energy reduction figures, and lifecycle governance policies.
            </p>

            <div className="pt-4">
              <Link 
                href="/resources/downloads" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#005288] text-white hover:bg-[#003c64] transition-colors text-xs font-mono font-bold uppercase tracking-wider shadow-md"
              >
                <span>View Sustainability Report</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
}
