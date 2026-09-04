"use client";

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faSearch,
  faChevronDown,
  faBars,
  faXmark,
  faArrowRight,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { renderWithSup } from '../utils/text';

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
        path: '/products?category=Lamps',
        items: [
          { name: 'Classic Bulbs', path: '/products?category=Lamps&search=Classic%20Bulbs' },
          { name: 'Filament Lamps', path: '/products?category=Lamps&search=Filament%20Lamps' },
          { name: '360° Illumination', path: '/products?category=Lamps&search=360' },
          { name: 'Golden Filament', path: '/products?category=Lamps&search=Golden%20Filament' },
          { name: 'Reflector Lamps', path: '/products?category=Lamps&search=Reflector%20Lamps' },
          { name: 'LED Tubes', path: '/products?category=Lamps&search=LED%20Tubes' },
          { name: 'Special Applications', path: '/products?category=Lamps&search=Special%20Applications' },
          { name: 'Decorative', path: '/products?category=Lamps&search=Decorative' },
          { name: 'Dim-to-Warm', path: '/products?category=Lamps&search=Dim-to-Warm' },
          { name: 'Mega Efficiency', path: '/products?category=Lamps&search=Mega%20Efficiency' },
        ],
      },
      {
        name: 'Indoor Lighting',
        path: '/products?category=Indoor%20Lighting',
        items: [
          { name: 'Ceiling', path: '/products?category=Indoor%20Lighting&search=Ceiling' },
          { name: 'Downlight', path: '/products?category=Indoor%20Lighting&search=Downlight' },
          { name: 'Damp Proof Batten', path: '/products?category=Indoor%20Lighting&search=Damp%20Proof%20Batten' },
          { name: 'Indoor Batten', path: '/products?category=Indoor%20Lighting&search=Indoor%20Batten' },
          { name: 'High Bay', path: '/products?category=Indoor%20Lighting&search=High%20Bay' },
          { name: 'Panel', path: '/products?category=Indoor%20Lighting&search=Panel' },
          { name: 'Track Lighting', path: '/products?category=Indoor%20Lighting&search=Track%20Lighting' },
          { name: 'Under Cabinet', path: '/products?category=Indoor%20Lighting&search=Under%20Cabinet' },
          { name: 'Wall Lamp', path: '/products?category=Indoor%20Lighting&search=Wall%20Lamp' },
        ],
      },
      {
        name: 'Outdoor Lighting',
        path: '/products?category=Outdoor%20Lighting',
        items: [
          { name: 'Floodlight', path: '/products?category=Outdoor%20Lighting&search=Floodlight' },
          { name: 'Bulkhead', path: '/products?category=Outdoor%20Lighting&search=Bulkhead' },
          { name: 'Garden Lighting', path: '/products?category=Outdoor%20Lighting&search=Garden%20Lighting' },
        ],
      },
      {
        name: 'Emergency Lighting',
        path: '/products?category=Emergency%20Lighting',
        items: [
          { name: 'Exit Box', path: '/products?category=Emergency%20Lighting&search=Exit%20Box' },
          { name: 'Exit Sign', path: '/products?category=Emergency%20Lighting&search=Exit%20Sign' },
          { name: 'Emergency Module', path: '/products?category=Emergency%20Lighting&search=Emergency%20Module' },
          { name: 'Recessed Downlight', path: '/products?category=Emergency%20Lighting&search=Recessed%20Downlight' },
          { name: 'Slim Bulkhead', path: '/products?category=Emergency%20Lighting&search=Slim%20Bulkhead' },
          { name: 'Surface Mounted Downlight', path: '/products?category=Emergency%20Lighting&search=Surface%20Mounted%20Downlight' },
          { name: 'Twinspot', path: '/products?category=Emergency%20Lighting&search=Twinspot' },
        ],
      },
      {
        name: 'Light Management',
        path: '/products?category=Light%20Management',
        items: [
          { name: 'NGENIUM® Matter', path: '/products?category=Light%20Management&search=NGENIUM' },
          { name: 'Infinite IoT Lighting', path: '/products?category=Light%20Management&search=Infinite' },
        ],
      },
      { name: 'Drivers', path: '/products?category=Drivers' },
      { name: 'Others', path: '/products?category=Others' },
    ],
  },
  {
    name: 'Projects',
    path: '/projects',
    description: 'Explore how Megaman brings spaces to life across global portfolios, tailoring light to elevate experiences and meet stringent architectural demands.',
    tagline: 'LIGHTING THE WORLD',
    submenu: [
      { name: 'Hospitality', path: '/projects?category=hospitality' },
      { name: 'Retail', path: '/projects?category=retail' },
      { name: 'Residential', path: '/projects?category=residential' },
      { name: 'Commercial', path: '/projects?category=commercial' },
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

export interface LocationOption {
  id: 'international' | 'hk' | 'uk';
  name: string;
  shortCode: string;
  domain: string;
  flag: string;
  description: string;
}

export const LOCATIONS: LocationOption[] = [
  {
    id: 'international',
    name: 'International',
    shortCode: 'GLOBAL',
    domain: 'megaman.cc',
    flag: '🌐',
    description: 'International Site (megaman.cc)',
  },
  {
    id: 'hk',
    name: 'Hong Kong',
    shortCode: 'HK',
    domain: 'hk.megaman.cc',
    flag: '🇭🇰',
    description: 'Hong Kong Site (hk.megaman.cc)',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    shortCode: 'UK',
    domain: 'megamanuk.com',
    flag: '🇬🇧',
    description: 'United Kingdom Site (megamanuk.com)',
  },
];

interface HeaderProps {
  initialSiteContext?: 'international' | 'hk' | 'uk';
}

export default function Header({ initialSiteContext = 'international' }: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [expandedMobileSubMenu, setExpandedMobileSubMenu] = useState<string | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<'international' | 'hk' | 'uk'>(initialSiteContext);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLocationConfig = LOCATIONS.find((l) => l.id === currentLocation) || LOCATIONS[0];

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

  // Close menus on resize and detect location
  useEffect(() => {
    // Detect site context
    const host = window.location.hostname;
    if (host.includes('megamanuk.com') || host.includes('uk.')) {
      setCurrentLocation('uk');
    } else if (host.includes('hk.megaman.cc') || host.startsWith('hk.')) {
      setCurrentLocation('hk');
    } else {
      const match = document.cookie.match(/x-site-context=([^;]+)/);
      if (match && (match[1] === 'hk' || match[1] === 'uk' || match[1] === 'international')) {
        setCurrentLocation(match[1] as 'hk' | 'uk' | 'international');
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setExpandedMobileMenu(null);
        setExpandedMobileSubMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const switchLocation = (site: 'international' | 'hk' | 'uk') => {
    document.cookie = `x-site-context=${site}; path=/; max-age=31536000`;
    setIsLocationOpen(false);

    const host = window.location.hostname;
    if (host.includes('megaman.cc') || host.includes('megamanuk.com')) {
      if (site === 'uk') {
        window.location.href = 'https://megamanuk.com';
        return;
      } else if (site === 'hk') {
        window.location.href = 'https://hk.megaman.cc';
        return;
      } else {
        window.location.href = 'https://megaman.cc';
        return;
      }
    }

    // In local dev or preview, append query param and reload
    const url = new URL(window.location.href);
    url.searchParams.set('site', site);
    window.location.href = url.toString();
  };

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
                className="static"
                onMouseEnter={() => handleMouseEnter(item.name)}
              >
                <Link
                  href={item.path}
                  onClick={() => setActiveMenu(null)}
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
                </Link>

                {/* Dropdown Panel */}
                {isOpen && (
                  item.name === 'Products' ? (
                    <div className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="container mx-auto px-4 py-8">
                        {/* Product Categories Grid */}
                        <div className="w-full grid grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            {/* Column 1: Lamps */}
                            <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100/80 shadow-sm">
                              <div>
                                <Link 
                                  href="/products?category=Lamps" 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-xs font-bold uppercase tracking-wider text-[#005288] hover:text-[#003c64] transition-colors mb-3 block border-b border-gray-100 pb-1.5"
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
                                        href={`/products?category=Lamps&search=${encodeURIComponent(name)}`}
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
                            <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100/80 shadow-sm">
                              <div>
                                <Link 
                                  href="/products?category=Indoor%20Lighting" 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-xs font-bold uppercase tracking-wider text-[#005288] hover:text-[#003c64] transition-colors mb-3 block border-b border-gray-100 pb-1.5"
                                >
                                  Indoor Lighting
                                </Link>
                                <ul className="space-y-1">
                                  {[
                                    'Ceiling', 'Downlight', 'Damp Proof Batten', 'Indoor Batten', 
                                    'High Bay', 'Panel', 'Track Lighting', 'Under Cabinet', 
                                    'Wall Lamp'
                                  ].map((name) => (
                                    <li key={name}>
                                      <Link
                                        href={`/products?category=Indoor%20Lighting&search=${encodeURIComponent(name)}`}
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
                            <div className="space-y-5 bg-white p-5 rounded-xl border border-gray-100/80 shadow-sm flex flex-col justify-between">
                              <div>
                                <Link 
                                  href="/products?category=Outdoor%20Lighting" 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-xs font-bold uppercase tracking-wider text-[#005288] hover:text-[#003c64] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
                                >
                                  Outdoor Lighting
                                </Link>
                                <ul className="space-y-1">
                                  {['Floodlight', 'Bulkhead', 'Garden Lighting'].map((name) => (
                                    <li key={name}>
                                      <Link
                                        href={`/products?category=Outdoor%20Lighting&search=${encodeURIComponent(name)}`}
                                        onClick={() => setActiveMenu(null)}
                                        className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                      >
                                        {name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2">
                                <Link 
                                  href="/products?category=Emergency%20Lighting" 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-xs font-bold uppercase tracking-wider text-[#005288] hover:text-[#003c64] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
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
                                        href={`/products?category=Emergency%20Lighting&search=${encodeURIComponent(name)}`}
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

                            {/* Column 4: Light Management & Technical/Extras */}
                            <div className="space-y-5 bg-white p-5 rounded-xl border border-gray-100/80 shadow-sm flex flex-col justify-between">
                              <div>
                                <Link 
                                  href="/products?category=Light%20Management" 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-xs font-bold uppercase tracking-wider text-[#005288] hover:text-[#003c64] transition-colors mb-2 block border-b border-gray-100 pb-1.5"
                                >
                                  Light Management
                                </Link>
                                <ul className="space-y-1">
                                  {['NGENIUM® Matter', 'Infinite IoT Lighting'].map((name) => (
                                    <li key={name}>
                                      <Link
                                        href={`/products?category=Light%20Management&search=${encodeURIComponent(name.replace(/®/g, ''))}`}
                                        onClick={() => setActiveMenu(null)}
                                        className="block text-[13px] py-1 text-gray-600 hover:text-[#005288] hover:translate-x-1 transition-all duration-150 font-medium"
                                      >
                                        {renderWithSup(name)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block border-b border-gray-100 pb-1.5">
                                  Technical & Extras
                                </span>
                                <ul className="space-y-2">
                                  {['Drivers', 'Others'].map((name) => (
                                    <li key={name}>
                                      <Link
                                        href={`/products?category=${encodeURIComponent(name)}`}
                                        onClick={() => setActiveMenu(null)}
                                        className="inline-flex items-center text-[13px] font-semibold text-gray-800 hover:text-[#005288] hover:translate-x-1 transition-all duration-150"
                                      >
                                        {name}
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px] ml-1.5 opacity-60 hover:opacity-100" />
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  ) : (
                    <div className="absolute top-full left-0 right-0 w-full bg-white shadow-2xl border-t border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="container mx-auto px-4 py-8">
                        {/* Submenu List */}
                        <div className="w-full flex items-center">
                          <div className={`grid ${item.submenu.length >= 4 ? (item.submenu.length === 5 ? 'grid-cols-5' : 'grid-cols-4') : 'grid-cols-3'} gap-6 w-full bg-gray-50/50 p-6 rounded-2xl border border-gray-100`}>
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.path}
                                onClick={() => setActiveMenu(null)}
                                className="block p-5 bg-white hover:bg-[#005288]/5 rounded-xl border border-gray-100 hover:border-[#005288]/20 hover:shadow-sm transition-all duration-200 group"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#005288] transition-colors">
                                    {sub.name}
                                  </span>
                                  <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="text-xs text-gray-400 group-hover:text-[#005288] translate-x-0 group-hover:translate-x-1 transition-all duration-200"
                                  />
                                </div>
                              </Link>
                            ))}
                          </div>
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
          <div className="relative" ref={locationRef}>
            <button
              aria-label="Select Location / Region"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className={`h-9 px-3 rounded-full border border-blue-200/30 flex items-center space-x-2 text-white hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer ${
                isLocationOpen ? 'bg-white/20 border-white/50 shadow-inner' : ''
              }`}
              title={`Current Location: ${currentLocationConfig.name}`}
            >
              <span className="text-sm leading-none">{currentLocationConfig.flag}</span>
              <span className="text-[11px] font-semibold tracking-wider uppercase font-mono">
                {currentLocationConfig.shortCode}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-[9px] opacity-70 transition-transform duration-200 ${
                  isLocationOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Location Dropdown */}
            {isLocationOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    Select Region / Location
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Currently browsing: <strong className="text-[#005288]">{currentLocationConfig.name}</strong>
                  </p>
                </div>
                <div className="p-1.5 space-y-1">
                  {LOCATIONS.map((loc) => {
                    const isActive = currentLocation === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => switchLocation(loc.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#005288]/10 text-[#005288] font-semibold ring-1 ring-[#005288]/20'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl leading-none">{loc.flag}</span>
                          <div>
                            <div className="text-xs font-semibold flex items-center gap-1.5">
                              <span>{loc.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                                {loc.shortCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">{loc.domain}</div>
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-[#005288] text-white flex items-center justify-center text-[10px]">
                            <FontAwesomeIcon icon={faCheck} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            aria-label="Search"
            className="w-9 h-9 rounded-full border border-blue-200/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faSearch} className="text-[14px]" />
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
                                <span>{renderWithSup(sub.name)}</span>
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
                                      {renderWithSup(subItem.name)}
                                    </Link>
                                  ))}
                                  <Link
                                    href={sub.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 px-3 text-[13px] font-semibold text-white hover:bg-[#005288]/40 rounded transition-all flex items-center gap-1"
                                  >
                                    Explore All {renderWithSup(sub.name)} →
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
                            {renderWithSup(sub.name)}
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

            {/* Region / Location Selector for Mobile */}
            <div className="pt-4 border-t border-[#005e9c]/50">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200/70">
                  Region / Location
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                  Active: {currentLocationConfig.shortCode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LOCATIONS.map((loc) => {
                  const isActive = currentLocation === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        switchLocation(loc.id);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'bg-[#003457] border-white/40 text-white font-semibold shadow-inner'
                          : 'bg-[#00416d] border-transparent text-blue-100 hover:text-white hover:bg-[#004e82]'
                      }`}
                    >
                      <span className="text-xl">{loc.flag}</span>
                      <span className="text-xs mt-1 font-semibold">{loc.shortCode}</span>
                      <span className="text-[9px] text-blue-200/70 truncate max-w-full">{loc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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
