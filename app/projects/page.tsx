import { Suspense } from 'react';
import { Metadata } from 'next';
import ProjectsListClient from './ProjectsListClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects & Case Studies | MEGAMAN® High-Performance LED Solutions',
  description: 'Explore Megaman\'s architectural lighting portfolio. Filter by application type and discover our global references across Hospitality, Retail, Residential, and Commercial projects.',
};

async function getProjects() {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/projects?limit=100&depth=2`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching projects from CMS:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-24 text-center font-mono text-xs uppercase tracking-widest text-gray-400">Loading portfolio...</div>}>
      <ProjectsListClient initialProjects={projects} />
    </Suspense>
  );
}
