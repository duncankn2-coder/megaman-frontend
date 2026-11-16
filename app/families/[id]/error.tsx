'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function FamilyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Family page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center bg-white">
      <h2 className="text-2xl font-bold text-[#005288] mb-3">Unable to load product series</h2>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        We encountered an issue while loading this series. Please try again or browse our full product catalog.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#005288] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#003c64] transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/products"
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:border-[#005288] hover:text-[#005288] transition-colors"
        >
          All Products
        </Link>
      </div>
    </div>
  );
}
