import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | MEGAMAN',
  description: 'The requested page could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <span className="text-5xl font-extrabold text-[#005288] mb-2 block">404</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-sm text-gray-600 mb-6">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[#005288] text-white rounded-lg text-sm font-medium hover:bg-[#003e66] transition shadow-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
