"use client";

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faUser,
  faSearch,
  faChevronDown,
  faBars,
  faXmark,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface SubmenuItem {
  name: string;
  path: string;
  items?: SubmenuItem[];
}

interface NavItem {
  name: string;
  path: string;
  description: string;
  tagline: string;
  submenu: SubmenuItem[];
}

const navItems: NavItem[] = [
  {
    name: 'Products',
    path: '/products',
    description: 'Discover Megaman\'s state-of-the-art energy-efficient LED lighting systems, meticulously engineered for performance, durability, and visual comfort.',
    tagline: 'INNOVATIVE LED SOLUTIONS',
    submenu: [
      {
        name: 'Lamps',
        path: '/products/lamps',
        items: [
          { name: 'Classic Bulbs', path: '/products/lamps/classic-bulbs' },
          { name: 'Filament Lamps', path: '/products/lamps/filament-lamps' },
          { name: '360° Illumination', path: '/products/lamps/360-illumination' },
          { name: 'Golden Filament', path: '/products/lamps/golden-filament' },
          { name: 'Reflector Lamps', path: '/products/lamps/reflector-lamps' },
          { name: 'LED Tubes', path: '/products/lamps/led-tubes' },
          { name: 'Special Applications', path: '/products/lamps/special-applications' },
          { name: 'Decorative', path: '/products/lamps/decorative' },
          { name: 'Dim-to-Warm', path: '/products/lamps/dim-to-warm' },
          { name: 'Mega Efficiency', path: '/products/lamps/mega-efficiency' },
        ],
      },
      {
        name: 'Indoor Lighting',
        path: '/products/indoor-lighting',
        items: [
          { name: 'Bulkhead', path: '/products/indoor-lighting/bulkhead' },
          { name: 'Downlight', path: '/products/indoor-lighting/downlight' },
          { name: 'Damp Proof Batten', path: '/products/indoor-lighting/damp-proof-batten' },
          { name: 'Indoor Batten', path: '/products/indoor-lighting/indoor-batten' },
          { name: 'High Bay', path: '/products/indoor-lighting/high-bay' },
          { name: 'Panel', path: '/products/indoor-lighting/panel' },
          { name: 'Track Lighting', path: '/products/indoor-lighting/track-lighting' },
          { name: 'Under Cabinet', path: '/products/indoor-lighting/under-cabinet' },
          { name: 'Wall Lamp', path: '/products/indoor-lighting/wall-lamp' },
          { name: 'Indoor Ceiling', path: '/products/indoor-lighting/indoor-ceiling' },
        ],
      },
      {
        name: 'Outdoor Lighting',
        path: '/products/outdoor-lighting',
        items: [
          { name: 'Floodlight', path: '/products/outdoor-lighting/floodlight' },
          { name: 'Bulkhead', path: '/products/outdoor-lighting/bulkhead' },
          { name: 'Garden Lighting', path: '/products/outdoor-lighting/garden-lighting' },
        ],
      },
      {
        name: 'Emergency Lighting',
        path: '/products/emergency-lighting',
        items: [
          { name: 'Exit Box', path: '/products/emergency-lighting/exit-box' },
          { name: 'Exit Sign', path: '/products/emergency-lighting/exit-sign' },
          { name: 'Emergency Module', path: '/products/emergency-lighting/emergency-module' },
          { name: 'Recessed Downlight', path: '/products/emergency-lighting/recessed-downlight' },
          { name: 'Slim Bulkhead', path: '/products/emergency-lighting/slim-bulkhead' },
          { name: 'Surface Mounted Downlight', path: '/products/emergency-lighting/surface-mounted-downlight' },
          { name: 'Twinspot', path: '/products/emergency-lighting/twinspot' },
        ],
      },
      {
        name: 'Light Management',
        path: '/products/light-management',
        items: [
          { name: 'NGENIUM® Matter', path: '/products/light-management/ngenium-matter' },
          { name: 'Infinite IoT Lighting', path: '/products/light-management/infinite-iot-lighting' },
        ],
      },
      { name: 'Drivers', path: '/products/drivers' },
      { name: 'Others', path: '/products/others' },
    ],
  },
  {
    name: 'Projects',
    path: '/projects',
    description: 'Explore how Megaman brings spaces to life across global portfolios, tailoring light to elevate experiences and meet stringent architectural demands.',
    tagline: 'LIGHTING THE WORLD',
    submenu: [
      { name: 'Hospitality', path: '/projects/hospitality' },
      { name: 'Retail', path: '/projects/retail' },
      { name: 'Residential', path: '/projects/residential' },
      { name: 'Commercial', path: '/projects/commercial' },
    ],
  },
  {
    name: 'Resources',
    path: '/resources',
    description: 'Access essential technical data sheets, catalogs, installation manuals, dialux files, and interactive videos for your next project planning.',
    tagline: 'KNOWLEDGE & TOOLS',
    submenu: [
      { name: 'Videos', path: '/resources/videos' },
      { name: 'Downloads', path: '/resources/downloads' },
    ],
  },
  {
    name: 'Company',
    path: '/company',
    description: 'Learn about Megaman\'s commitment to sustainability, pioneering quality assurance standards, global awards, and latest corporate news.',
    tagline: 'LIFE IN LIGHT',
    submenu: [
      { name: 'About Megaman', path: '/company/about-megaman' },
      { name: 'Quality', path: '/company/quality' },
      { name: 'Environment and Sustainability', path: '/company/environment-and-sustainability' },
      { name: 'Awards', path: '/company/awards' },
      { name: 'News and Press', path: '/company/news-and-press' },
    ],
  },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [expandedMobileSubMenu, setExpandedMobileSubMenu] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth hover handlers for desktop
  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // slight delay to prevent sudden closes
  };

  // Close menus on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setExpandedMobileMenu(null);
        setExpandedMobileSubMenu(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileCategory = (name: string) => {
    setExpandedMobileMenu(expandedMobileMenu === name ? null : name);
    setExpandedMobileSubMenu(null); // reset submenu when changing main category
  };

  const toggleMobileSubCategory = (name: string) => {
    setExpandedMobileSubMenu(expandedMobileSubMenu === name ? null : name);
  };

  return (
    <header className="bg-[#005288] sticky top-0 z-50 shadow-md transition-all duration-300">
      {/* Main Navbar */}
      <div className="container mx-auto flex justify-between items-center px-4 py-4 lg:py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/MEGAMAN_Logo.png"
            height={42}
            width={130}
            alt="Megaman Logo"
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          ref={menuContainerRef}
          className="hidden lg:flex space-x-1"
          onMouseLeave={handleMouseLeave}
        >
          {navItems.map((item) => {
            const isOpen = activeMenu === item.name;
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                <button
                  className={`px-4 py-2 font-medium text-[15px] rounded-md transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${isOpen
                      ? 'bg-[#004a7b] text-white'
                      : 'text-white hover:bg-[#005e9c]/50 hover:text-white'
                    }`}
                >
                  {item.name}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] opacity-80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                  item.name === 'Products' ? (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[960px] lg:w-[1020px] xl:w-[1140px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="grid grid-cols-12 bg-gradient-to-r from-[#005288]/5 to-transparent border-b border-gray-50 px-8 py-5">
                        <div className="col-span-8">
                          <span className="text-[10px] tracking-widest font-bold text-[#005288] uppercase block mb-1">
                            {item.tagline}
                          </span>
                          <h4 className="text-xl font-bold text-gray-900">{item.name} Catalog</h4>
                        </div>
                        <div className="col-span-4 flex items-center justify-end">
                          <Link 
                            href={item.path} 
                            onClick={() => setActiveMenu(null)}
                            className="text-xs font-semibold text-[#005288] hover:text-[#003c64] flex items-center gap-2 group/cta transition-colors"
                          >
                            Explore Full Catalog
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform duration-300 group-hover/cta:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 p-8 bg-gray-50/50">
                        {/* Column 1: Lamps */}
                        <div className="space-y-4">
                          <div>
                            <Link 
                              href="/products/lamps" 
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#005288] transition-colors mb-3 block border-b border-gray-100 pb-1.5"
                            >
                              Lamps
                            </Link>
                            <ul className="space-y-1">
                              {[
                                'Classic Bulbs', 'Filament Lamps', '360° Illumination', 
                                'Golden Filament', 'Reflector Lamps', 'LED Tubes', 
                                'Special Applications', 'Decorative', 'Dim-to-Warm', 'Mega Efficiency'
                              ].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/lamps/${name.toLowerCase().replace(/ /g, '-').replace(/°/g, '')}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 2: Indoor Lighting */}
                        <div className="space-y-4">
                          <div>
                            <Link 
                              href="/products/indoor-lighting" 
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#005288] transition-colors mb-3 block border-b border-gray-100 pb-1.5"
                            >
                              Indoor Lighting
                            </Link>
                            <ul className="space-y-1">
                              {[
                                'Bulkhead', 'Downlight', 'Damp Proof Batten', 'Indoor Batten', 
                                'High Bay', 'Panel', 'Track Lighting', 'Under Cabinet', 
                                'Wall Lamp', 'Indoor Ceiling'
                              ].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/indoor-lighting/${name.toLowerCase().replace(/ /g, '-')}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 3: Outdoor & Emergency */}
                        <div className="space-y-6">
                          <div>
                            <Link 
                              href="/products/outdoor-lighting" 
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#005288] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
                            >
                              Outdoor Lighting
                            </Link>
                            <ul className="space-y-1">
                              {['Floodlight', 'Bulkhead', 'Garden Lighting'].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/outdoor-lighting/${name.toLowerCase().replace(/ /g, '-')}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <Link 
                              href="/products/emergency-lighting" 
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#005288] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
                            >
                              Emergency Lighting
                            </Link>
                            <ul className="space-y-1">
                              {[
                                'Exit Box', 'Exit Sign', 'Emergency Module', 'Recessed Downlight', 
                                'Slim Bulkhead', 'Surface Mounted Downlight', 'Twinspot'
                              ].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/emergency-lighting/${name.toLowerCase().replace(/ /g, '-')}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 4: Light Management & Others */}
                        <div className="space-y-6">
                          <div>
                            <Link 
                              href="/products/light-management" 
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#005288] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
                            >
                              Light Management
                            </Link>
                            <ul className="space-y-1">
                              {['NGENIUM® Matter', 'Infinite IoT Lighting'].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/light-management/${name.toLowerCase().replace(/®/g, '').replace(/ /g, '-')}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                  >
                                    {name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block border-b border-gray-100 pb-1.5">
                              Technical & Extras
                            </span>
                            <ul className="space-y-2">
                              {['Drivers', 'Others'].map((name) => (
                                <li key={name}>
                                  <Link
                                    href={`/products/${name.toLowerCase()}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="inline-flex items-center text-[14px] font-semibold text-gray-800 hover:text-[#005288] hover:translate-x-1 transition-all duration-150"
                                  >
                                    {name}
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px] ml-1.5 opacity-60 hover:opacity-100" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[640px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="grid grid-cols-12">
                        {/* Left Promo / Highlight Panel */}
                        <div className="col-span-5 bg-gradient-to-br from-[#005288] to-[#003457] p-6 text-white flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] tracking-widest font-bold text-blue-300 uppercase block mb-1">
                              {item.tagline}
                            </span>
                            <h4 className="text-xl font-bold mb-3">{item.name}</h4>
                            <p className="text-xs text-blue-100 leading-relaxed font-light">
                              {item.description}
                            </p>
                          </div>
                          <div className="mt-8 pt-4 border-t border-blue-400/30">
                            <Link
                              href={item.path}
                              onClick={() => setActiveMenu(null)}
                              className="text-xs font-semibold text-white hover:text-blue-200 flex items-center gap-2 group/cta"
                            >
                              Explore All {item.name}
                              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform duration-300 group-hover/cta:translate-x-1" />
                            </Link>
                          </div>
                        </div>

                        {/* Right Submenu List */}
                        <div className="col-span-7 p-6 bg-gray-50 flex flex-col justify-center">
                          <ul className="space-y-1">
                            {item.submenu.map((sub) => (
                              <li key={sub.name}>
                                <Link
                                  href={sub.path}
                                  onClick={() => setActiveMenu(null)}
                                  className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all duration-200 group"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-medium text-gray-800 group-hover:text-[#005288] transition-colors">
                                      {sub.name}
                                    </span>
                                    <FontAwesomeIcon
                                      icon={faArrowRight}
                                      className="text-[10px] text-gray-300 group-hover:text-[#005288] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200"
                                    />
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side Icons & Mobile Toggle */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button
            aria-label="Globe"
            className="w-9 h-9 rounded-full border border-blue-200/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faGlobe} className="text-[14px]" />
          </button>
          <button
            aria-label="Search"
            className="w-9 h-9 rounded-full border border-blue-200/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faSearch} className="text-[14px]" />
          </button>
          <button
            aria-label="User profile"
            className="w-9 h-9 rounded-full border border-blue-200/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faUser} className="text-[14px]" />
          </button>

          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full border border-blue-200/30 flex items-center justify-center text-white hover:bg-white/10 transition-all focus:outline-none"
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-[72px] bg-[#004e82] border-t border-[#005e9c] shadow-xl z-50 animate-in slide-in-from-top-5 duration-300 max-h-[calc(100vh-72px)] overflow-y-auto">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const isExpanded = expandedMobileMenu === item.name;
              return (
                <div key={item.name} className="border-b border-[#005e9c]/40 last:border-b-0 pb-2">
                  <button
                    onClick={() => toggleMobileCategory(item.name)}
                    className="w-full flex justify-between items-center py-3 text-white font-medium text-left focus:outline-none"
                  >
                    <span>{item.name}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-[12px] opacity-80 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expandable Submenu */}
                  {isExpanded && (
                    <div className="pl-4 py-1 space-y-1 bg-[#00416d] rounded-lg mt-1 overflow-hidden animate-in slide-in-from-top duration-200">
                      {item.submenu.map((sub) => {
                        const isSubExpanded = expandedMobileSubMenu === sub.name;

                        if (sub.items && sub.items.length > 0) {
                          return (
                            <div key={sub.name} className="border-b border-[#005e9c]/25 last:border-0 pb-1 last:pb-0">
                              <button
                                onClick={() => toggleMobileSubCategory(sub.name)}
                                className="w-full flex justify-between items-center py-2.5 px-3 text-[14px] text-blue-100 hover:text-white font-medium text-left focus:outline-none"
                              >
                                <span>{sub.name}</span>
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  className={`text-[10px] opacity-85 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {isSubExpanded && (
                                <div className="pl-4 py-1 space-y-1 bg-[#003457] rounded-md mt-1 mb-2 overflow-hidden animate-in slide-in-from-top duration-150">
                                  {sub.items.map((subItem) => (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.path}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="block py-2 px-3 text-[13px] text-blue-200 hover:text-white hover:bg-[#005288]/40 rounded transition-all"
                                    >
                                      {subItem.name}
                                    </Link>
                                  ))}
                                  <Link
                                    href={sub.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 px-3 text-[13px] font-semibold text-white hover:bg-[#005288]/40 rounded transition-all"
                                  >
                                    Explore All {sub.name} →
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2.5 px-3 text-[14px] text-blue-100 hover:text-white hover:bg-[#005288]/40 rounded transition-all"
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                      <Link
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2.5 px-3 text-[14px] font-semibold text-white border-t border-[#004e82]/50 hover:bg-[#005288]/40 rounded transition-all"
                      >
                        Explore All {item.name} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contact & Careers for Mobile */}
            <div className="pt-4 flex flex-col space-y-2 border-t border-[#005e9c]/50">
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm text-blue-200 hover:text-white py-2"
              >
                Contact Us
              </Link>
              <Link
                href="/careers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm text-blue-200 hover:text-white py-2"
              >
                Careers
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
