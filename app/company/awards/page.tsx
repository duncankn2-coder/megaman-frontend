"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
import logoMap from './award_logos_map.json';

interface AwardItem {
  category: 'environmental' | 'quality' | 'technological' | 'other';
  year: string;
  title: string;
  institution: string;
  logoKey: string;
}

export default function AwardsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', name: 'All Awards', count: 54, color: 'text-slate-900 border-slate-950 bg-slate-950/5', activeColor: 'bg-slate-900 text-white' },
    { id: 'environmental', name: 'Environmental', count: 16, color: 'text-emerald-700 border-emerald-500 bg-emerald-50/50', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { id: 'quality', name: 'Quality Recognition', count: 17, color: 'text-blue-700 border-blue-500 bg-blue-50/50', activeColor: 'bg-[#005288] text-white border-[#005288]' },
    { id: 'technological', name: 'Technology', count: 10, color: 'text-orange-700 border-orange-500 bg-orange-50/50', activeColor: 'bg-orange-600 text-white border-orange-600' },
    { id: 'other', name: 'Other Endorsements', count: 11, color: 'text-purple-700 border-purple-500 bg-purple-50/50', activeColor: 'bg-purple-600 text-white border-purple-600' }
  ];

  const awards: AwardItem[] = [
    // Environmental Achievement
    {
      category: "environmental",
      year: "2025",
      title: "Outstanding ESG Sustainable Enterprise Award",
      institution: "H.K. Commercial Daily",
      logoKey: "/var/files/about_us/awards/2025/2025ESGValueRankings.jpg"
    },
    {
      category: "environmental",
      year: "2023",
      title: "Environmental Protection Enterprise Award",
      institution: "H.K. Commercial Daily",
      logoKey: "/var/files/about_us/awards/2024/green_asia_pacific_2023.png"
    },
    {
      category: "environmental",
      year: "2013-14",
      title: "Green Office Award",
      institution: "World Green Organisation, Hong Kong",
      logoKey: "/var/files/about_us/awards/wgo_goals_logo.jpg"
    },
    {
      category: "environmental",
      year: "2013",
      title: "United Nations Millennium Development Goals (UNMDG) - Better World Company",
      institution: "United Nations Better World Initiative",
      logoKey: "/var/files/about_us/awards/better_world_co_logo.png"
    },
    {
      category: "environmental",
      year: "2013",
      title: "Eco Award (also received in 2005, 2009)",
      institution: "BATIBOUW, Belgium",
      logoKey: "/var/files/about_us/awards/batibouw.jpg"
    },
    {
      category: "environmental",
      year: "2012",
      title: "Green New Product Award",
      institution: "ARCHIDEX, Malaysia",
      logoKey: "/var/files/about_us/awards/archidex_green_new_product_award_2012.png"
    },
    {
      category: "environmental",
      year: "2010",
      title: "Capital Outstanding Green Excellence Award",
      institution: "Capital Magazine, Hong Kong",
      logoKey: "/var/files/about_us/awards/capital_outstanding_green.jpg"
    },
    {
      category: "environmental",
      year: "2010",
      title: "Hong Kong Green Awards (Bronze)",
      institution: "Green Council, Hong Kong",
      logoKey: "/var/files/about_us/awards/hk_green.jpg"
    },
    {
      category: "environmental",
      year: "2009",
      title: "U Green Award - Electrical Appliances",
      institution: "U Magazine, Hong Kong",
      logoKey: "/var/files/about_us/awards/u_green.jpg"
    },
    {
      category: "environmental",
      year: "2009",
      title: "The Best for Home - The Green Brand Award",
      institution: "The Best for Home Association, Hong Kong",
      logoKey: "/var/files/about_us/awards/best_for_home_02.jpg"
    },
    {
      category: "environmental",
      year: "2008",
      title: "Sustainable Building Services Award - Green Product of the Year",
      institution: "Sustainable Building Services Society",
      logoKey: "/var/files/about_us/awards/sustainable-awards-2008.jpg"
    },
    {
      category: "environmental",
      year: "2007",
      title: "Eco-products Award",
      institution: "Eco-products Council, Hong Kong",
      logoKey: "/var/files/about_us/awards/ec-products-award07.gif"
    },
    {
      category: "environmental",
      year: "2005/07",
      title: "Eco-Products Gold Award and Silver Award",
      institution: "Eco-Products Committee, Hong Kong",
      logoKey: "/var/files/about_us/awards/goldaward-hk.gif"
    },
    {
      category: "environmental",
      year: "SGLS",
      title: "Singapore Green Labelling Scheme Certification",
      institution: "Singapore Environment Council (SEC)",
      logoKey: "/var/files/about_us/awards/greenlabel.gif"
    },
    {
      category: "environmental",
      year: "2007",
      title: "Prime Award for Eco-Business - Prime Eco-Corporate Award",
      institution: "Prime Magazine, Hong Kong",
      logoKey: "/var/files/about_us/awards/prime-awards-2007.gif"
    },
    {
      category: "environmental",
      year: "2005",
      title: "Hong Kong Awards for Industries - Environmental Performance Grand Award",
      institution: "Federation of Hong Kong Industries",
      logoKey: "/var/files/about_us/awards/hongkong-award-2005.gif"
    },

    // Quality Recognition
    {
      category: "quality",
      year: "2017-19",
      title: "Golden Palace Award Top 10",
      institution: "China Hospitality Awards Board",
      logoKey: "/var/files/about_us/awards/2019/golden_place_award_binlb_cn_2018-190.jpg"
    },
    {
      category: "quality",
      year: "2018",
      title: "Technical Lighting Award",
      institution: "China International Lighting Design Competition",
      logoKey: "/var/files/news/top_news/event_news/2018/10/26/CILD_logo.jpg"
    },
    {
      category: "quality",
      year: "2017",
      title: "Golden Design Award & Best Lighting Brand Award",
      institution: "China Lighting Design Committee",
      logoKey: "/var/files/about_us/awards/2017/golden_design_award_2017.jpg"
    },
    {
      category: "quality",
      year: "2016-17",
      title: "Alighting Award",
      institution: "Alighting Association, China",
      logoKey: "/var/files/about_us/awards/2017/alighting-award2017.jpg"
    },
    {
      category: "quality",
      year: "2013/16",
      title: "「Best Buy」 Product Endorsement",
      institution: "Which? Magazine, United Kingdom",
      logoKey: "/var/files/about_us/awards/2016/which_best_buy_201606.png"
    },
    {
      category: "quality",
      year: "2015",
      title: "LED Classic Bulb Rated “Five-Star”",
      institution: "Consumer Council, Hong Kong",
      logoKey: "/var/files/about_us/awards/2016/consumer_council_hk.png"
    },
    {
      category: "quality",
      year: "2012-13",
      title: "ARCHIDEX New Product Award",
      institution: "ARCHIDEX, Malaysia",
      logoKey: "/var/files/about_us/awards/archidex_new_product_award_2012.jpg"
    },
    {
      category: "quality",
      year: "2002-13",
      title: "Stiftung Warentest regular tested “Good” CFL & LED ratings",
      institution: "Stiftung Warentest, Germany",
      logoKey: "/var/files/about_us/awards/gut.gif"
    },
    {
      category: "quality",
      year: "2013",
      title: "Rated “The BEST Dimmable LED Classic”",
      institution: "Dutch Consumer Test Association, Netherlands",
      logoKey: "/var/files/about_us/awards/2016/dutch_consumer_test.png"
    },
    {
      category: "quality",
      year: "2013",
      title: "“Best Value for Money” Product",
      institution: "Lux Magazine, United Kingdom",
      logoKey: "/var/files/about_us/awards/lux_magazine_best_value_for_money.png"
    },
    {
      category: "quality",
      year: "2012",
      title: "Hong Kong International Lighting Products Award - Best of the Fair Award for “Light Source”",
      institution: "HKTDC, Hong Kong",
      logoKey: "/var/files/about_us/awards/hk_intl_lighting_products_award_2012_light_source.png"
    },
    {
      category: "quality",
      year: "2012",
      title: "HOMEDEC Quality Award",
      institution: "HOMEDEC Association, Malaysia",
      logoKey: "/var/files/about_us/awards/homedec_quality_award_2012.png"
    },
    {
      category: "quality",
      year: "2010",
      title: "Test Winner in Choice Magazine “CFL Testing”",
      institution: "Choice Magazine, Australia",
      logoKey: "/var/files/about_us/awards/choice.jpg"
    },
    {
      category: "quality",
      year: "2009",
      title: "Rated “Very Good” ÖKO Test for CFL Durability",
      institution: "ÖKO Test, Germany",
      logoKey: "/var/files/about_us/awards/oko_test.jpg"
    },
    {
      category: "quality",
      year: "2008",
      title: "Test Winner in Guter Rat Magazine 'Energy Saving Lamp Testing'",
      institution: "Guter Rat Magazine, Germany",
      logoKey: "/var/files/about_us/awards/guter_rate_2007-08.png"
    },
    {
      category: "quality",
      year: "2004",
      title: "VDE Test Report - Brightest Light & Best Price-Performance Ratio",
      institution: "VDE Institute, Germany",
      logoKey: "/var/files/about_us/awards/technik.jpg"
    },
    {
      category: "quality",
      year: "2003",
      title: "Hong Kong Awards for Industry - Quality Award",
      institution: "Trade and Industry Department, Hong Kong",
      logoKey: "/var/files/about_us/awards/hongkong-award-2005.gif"
    },

    // Technological Accomplishment
    {
      category: "technological",
      year: "2019",
      title: "LUX AWARDS Finalist - DBT Technology (Dual Beam)",
      institution: "Lux Awards, United Kingdom",
      logoKey: "/var/files/about_us/awards/2019/lux_uk_2019.jpg"
    },
    {
      category: "technological",
      year: "2015",
      title: "“Top Innovation of the Year” in diy Magazine",
      institution: "diy Magazine, Germany",
      logoKey: "/var/files/about_us/awards/diyonline_de.png"
    },
    {
      category: "technological",
      year: "2014",
      title: "HOMEDEC Good Design Award",
      institution: "HOMEDEC Association, Malaysia",
      logoKey: "/var/files/about_us/awards/homedec_good_design_award_2014_my.png"
    },
    {
      category: "technological",
      year: "2009-13",
      title: "ETOP Innovation Silver Award",
      institution: "ETOP Organisation, Netherlands",
      logoKey: "/var/files/about_us/awards/etop_innovation_awards_silver_2013.jpg"
    },
    {
      category: "technological",
      year: "2008",
      title: "designEX New Product Award",
      institution: "designEX, Australia",
      logoKey: "/var/files/about_us/awards/designex_2008_newprod.png"
    },
    {
      category: "technological",
      year: "2007",
      title: "LivinLuce and EnerMotive - Innovation & Design Award Finalist",
      institution: "LivinLuce Expo, Italy",
      logoKey: "/var/files/about_us/awards/premio-intel-2007.gif"
    },
    {
      category: "technological",
      year: "2005",
      title: "Intel Design Awards - Innovative Award",
      institution: "Intel Expo, Italy",
      logoKey: "/var/files/about_us/awards/premio-intel-2005.gif"
    },
    {
      category: "technological",
      year: "2005",
      title: "Lighting Design Awards - Winner in Innovations: Light Sources & Electronics Gear",
      institution: "Lighting Design Awards Committee, United Kingdom",
      logoKey: "/var/files/about_us/awards/lighting-design-2005.gif"
    },
    {
      category: "technological",
      year: "2005/09",
      title: "Batibouw Innovation Award",
      institution: "BATIBOUW, Belgium",
      logoKey: "/var/files/about_us/awards/batibouw.jpg"
    },
    {
      category: "technological",
      year: "2004",
      title: "Hong Kong Awards for Industry - Technological Achievement Award",
      institution: "Federation of Hong Kong Industries",
      logoKey: "/var/files/about_us/awards/hongkong-award-2005.gif"
    },

    // Other Awards
    {
      category: "other",
      year: "2018",
      title: "Advanced Member Association Award",
      institution: "SHGBC, China",
      logoKey: "/var/files/about_us/awards/2018/shgbc_association_image.png"
    },
    {
      category: "other",
      year: "2016",
      title: "Excellent Entrepreneur Award",
      institution: "Excellent Entrepreneur 2016, China",
      logoKey: "/var/files/about_us/awards/2017/excellent_entrepreneur.jpg"
    },
    {
      category: "other",
      year: "2015",
      title: "Top 100 LED Companies in China",
      institution: "CBDA Association, China",
      logoKey: "/var/files/news/top_news/corporate_news/2015/12/28/1/CBDA.png"
    },
    {
      category: "other",
      year: "2013",
      title: "Asia Excellence Award",
      institution: "Business Association, Singapore",
      logoKey: "/var/files/about_us/awards/asia_excellence_award_2013.jpg"
    },
    {
      category: "other",
      year: "2013-17",
      title: "Caring Company Logo Recognition",
      institution: "Hong Kong Council of Social Service",
      logoKey: "/var/files/about_us/awards/caring-company_2013-17.jpg"
    },
    {
      category: "other",
      year: "2008-16",
      title: "Caring Company Logo Recognition",
      institution: "Hong Kong Council of Social Service",
      logoKey: "/var/files/about_us/awards/caring-company.jpg"
    },
    {
      category: "other",
      year: "2005/09",
      title: "Batibouw Communication Award",
      institution: "BATIBOUW, Belgium",
      logoKey: "/var/files/about_us/awards/batibouw.jpg"
    },
    {
      category: "other",
      year: "2008",
      title: "Excellence in Action Awards - Innovation",
      institution: "Excellence in Action, Hong Kong",
      logoKey: "/var/files/about_us/awards/excellence-awards-2008.jpg"
    },
    {
      category: "other",
      year: "2008",
      title: "HKIM Brand-with-a-Conscience Certificate with Merit",
      institution: "Hong Kong Institute of Marketing",
      logoKey: "/var/files/about_us/awards/hkim-award.jpg"
    },
    {
      category: "other",
      year: "2005/06",
      title: "Superbrands Hong Kong Status",
      institution: "Superbrands Organization",
      logoKey: "/var/files/about_us/awards/superbrands.gif"
    },
    {
      category: "other",
      year: "2004",
      title: "Marketing Excellence Awards - Outstanding Energy-Saving Performance",
      institution: "Marketing Council, Philippines",
      logoKey: "/var/files/about_us/awards/philippines.gif"
    }
  ];

  const filteredAwards = activeTab === 'all' 
    ? awards 
    : awards.filter(item => item.category === activeTab);

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
      <section className="relative bg-slate-950 text-white min-h-[380px] flex items-center overflow-hidden border-b border-gray-900 z-10">
        <div className="absolute inset-0 opacity-40 select-none">
          <Image 
            src="/banners/award.jpg" 
            alt="Megaman Awards Banner"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAwards.map((item, idx) => {
            const styles = getCategoryStyles(item.category);
            const localLogoPath = logoMap[item.logoKey as keyof typeof logoMap] || '';

            return (
              <div 
                key={idx} 
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
                  {localLogoPath && (
                    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden bg-slate-50 border border-gray-100 p-2 shadow-inner">
                      <Image 
                        src={localLogoPath} 
                        alt={`${item.title} Logo`}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-contain p-2"
                      />
                    </div>
                  )}

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
