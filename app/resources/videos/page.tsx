import { Metadata } from 'next';
import VideosPageClient, { VideoItem } from './VideosPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tutorials & Videos | MEGAMAN® High-Performance LED Solutions',
  description: 'Product tutorials, installation guides, case studies, and corporate films from the MEGAMAN® media library.',
};

// Fallback high-quality mock videos to show if CMS is empty or unreachable
const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'MEGAMAN® Corporate Overview',
    description: 'Discover the story of MEGAMAN® — a global leader in energy-efficient LED lighting since 1994, with innovation at its core.',
    youtubeId: 'E8vXpMvPILk',
    category: 'Corporate',
    duration: '3:42',
  },
  {
    id: '2',
    title: 'INGENIUM® Matter Smart Lighting System',
    description: 'Learn how the INGENIUM® IoT platform integrates with Apple Home, Google Home, and Amazon Alexa via the Matter protocol.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'Smart Lighting',
    duration: '4:15',
  },
  {
    id: '3',
    title: 'Siena LED Downlight Series – Installation Guide',
    description: 'Step-by-step installation guide for the Siena recessed downlight family, covering ceiling cut-out, driver wiring, and commissioning.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'Installation',
    duration: '6:28',
  },
  {
    id: '4',
    title: 'Toledo Architectural Track Lighting – Case Study',
    description: 'A walkthrough of the Toledo Pro-Track system installed across a luxury boutique retail space in Munich.',
    youtubeId: 'E8vXpMvPILk',
    category: 'Case Study',
    duration: '5:10',
  },
  {
    id: '5',
    title: 'MEGAMAN® Circular Economy & Sustainability',
    description: 'How MEGAMAN® approaches product lifecycle from design to responsible disposal under its Green Procurement standards.',
    youtubeId: 'E8vXpMvPILk',
    category: 'Sustainability',
    duration: '2:55',
  },
  {
    id: '6',
    title: 'Triona LED Panel – LM80 Tested Performance',
    description: 'An in-depth review of the Triona LED panel photometric performance, LM80 lumen depreciation results, and warranty conditions.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'Technical',
    duration: '7:02',
  },
];

async function getVideos(): Promise<VideoItem[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/videos?limit=100`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching videos from CMS:', error);
    return FALLBACK_VIDEOS;
  }
}

export default async function VideosPage() {
  const videos = await getVideos();
  return <VideosPageClient initialVideos={videos.length > 0 ? videos : FALLBACK_VIDEOS} />;
}
