"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface CaptionItem {
  id?: string;
  title: string;
  content?: string;
  align?: 'left' | 'center' | 'right';
  startPercent?: number;
  endPercent?: number;
  linkText?: string;
  linkUrl?: string;
}

interface ScrollVideoBlockProps {
  block: {
    title?: string;
    subtitle?: string;
    video?: any;
    mobileVideo?: any;
    captions?: CaptionItem[];
  };
}

const getMediaUrl = (media: any): string => {
  if (!media) return '';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  if (typeof media === 'object' && media !== null) {
    if (media.filename) {
      return `${cleanBase}/media/${media.filename}`;
    }
    if (media.url) {
      let url = media.url;
      if (url.includes('/api/media/file/')) {
        url = url.replace('/api/media/file/', '/media/');
      }
      if (url.startsWith('http') || url.startsWith('//')) return url;
      return `${cleanBase}${url.startsWith('/') ? url : `/${url}`}`;
    }
  }

  if (typeof media === 'string') {
    if (media.startsWith('http') || media.startsWith('//')) {
      if (media.includes('/api/media/file/')) {
        return media.replace('/api/media/file/', '/media/');
      }
      return media;
    }
    if (media.startsWith('/')) {
      if (media.includes('/api/media/file/')) {
        return `${cleanBase}${media.replace('/api/media/file/', '/media/')}`;
      }
      return media;
    }
    return `${cleanBase}/media/${media}`;
  }

  return '';
};

// High quality default video demo URL if no custom video is uploaded or valid
const DEFAULT_VIDEO_URL = "https://d19snafwln6jq8.cloudfront.net/xom-rest/assets/efdce06f-ce9e-4805-ad3e-751251b0c627/content?";

export default function ScrollVideoBlock({ block }: ScrollVideoBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);

  const rawVideoUrl = getMediaUrl(block.video);
  const videoUrl = rawVideoUrl || DEFAULT_VIDEO_URL;

  // Default storytelling captions if none configured in CMS
  const captionsList: CaptionItem[] = (block.captions && block.captions.length > 0)
    ? block.captions
    : [
        {
          id: 'c1',
          title: block.title || 'Precision Engineering & Design',
          content: block.subtitle || 'Experience architectural lighting designed to transform space with smooth optical control and low glare.',
          align: 'left',
          startPercent: 5,
          endPercent: 35,
          linkText: 'Explore Features',
          linkUrl: '#variants',
        },
        {
          id: 'c2',
          title: 'Light That Plays Along',
          content: 'Robust construction and tool-free mounting systems ensure long-term durability and versatile mounting options.',
          align: 'center',
          startPercent: 40,
          endPercent: 70,
        },
        {
          id: 'c3',
          title: 'Smart Control & Human Centric Lighting',
          content: 'Seamless circadian rhythm synchronization with Tunable White and high color accuracy across every installation.',
          align: 'right',
          startPercent: 75,
          endPercent: 95,
          linkText: 'Configure Models',
          linkUrl: '#variants',
        },
      ];

  // Helper to seek video currentTime safely
  const seekVideo = useCallback((progress: number) => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration;
    if (isNaN(duration) || duration <= 0) return;

    const targetTime = Math.max(0, Math.min(duration - 0.05, duration * progress));

    if (Math.abs(video.currentTime - targetTime) > 0.01) {
      try {
        if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
          (video as any).fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
      } catch {
        video.currentTime = targetTime;
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const totalScrollable = containerHeight - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      scrollProgressRef.current = clampedProgress;
      setScrollProgress(clampedProgress);
      seekVideo(clampedProgress);
    };

    const handleLoadedMetadata = () => {
      video.pause();
      seekVideo(scrollProgressRef.current);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleLoadedMetadata);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleLoadedMetadata);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [videoUrl, seekVideo]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[320vh] w-full border-b border-gray-200 bg-black selection:bg-[#005288] selection:text-white"
    >
      {/* Sticky Fullscreen Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        
        {/* Background Video directly with src attribute */}
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              seekVideo(scrollProgressRef.current);
            }
          }}
          onCanPlay={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              seekVideo(scrollProgressRef.current);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-500"
        />

        {/* Ambient Dark Gradient Overlays for High Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/70 pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none z-10"></div>

        {/* Top Scroll Progress Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
          <div 
            className="h-full bg-[#005288] transition-all duration-150 ease-out" 
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          ></div>
        </div>

        {/* Section Subtitle Badge (Fixed top center - rendered only if block.subtitle exists) */}
        {block.subtitle && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#005288] animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-300">
              {block.subtitle}
            </span>
          </div>
        )}

        {/* Storytelling Captions Stack */}
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-20 w-full h-full flex items-center">
          {captionsList.map((cap, idx) => {
            const start = cap.startPercent !== undefined ? cap.startPercent / 100 : 0;
            const end = cap.endPercent !== undefined ? cap.endPercent / 100 : 1;
            const isVisible = scrollProgress >= start && scrollProgress <= end;

            const alignClass = 
              cap.align === 'center' 
                ? 'mx-auto text-center items-center' 
                : cap.align === 'right' 
                ? 'ml-auto text-right items-end' 
                : 'mr-auto text-left items-start';

            return (
              <div
                key={cap.id || idx}
                className={`absolute left-6 right-6 md:left-12 md:right-12 transition-all duration-700 ease-out flex flex-col max-w-xl p-8 md:p-10 bg-black/60 backdrop-blur-md border-l-2 border-[#005288] shadow-2xl ${alignClass}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#005288] mb-2">
                  0{idx + 1} / 0{captionsList.length}
                </span>

                <h3 className="text-2xl md:text-4xl font-light uppercase tracking-wider text-white mb-4 leading-tight">
                  {cap.title}
                </h3>

                {cap.content && (
                  <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed mb-6 whitespace-pre-line">
                    {cap.content}
                  </p>
                )}

                {cap.linkText && cap.linkUrl && (
                  <div>
                    <Link
                      href={cap.linkUrl}
                      className="inline-flex items-center gap-2 bg-[#005288] hover:bg-[#003c64] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md group"
                    >
                      <span>{cap.linkText}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
