"use client";

import { useEffect } from 'react';
import Link from 'next/link';

interface PrintControllerProps {
  cancelUrl: string;
}

export default function PrintController({ cancelUrl }: PrintControllerProps) {
  useEffect(() => {
    // Trigger window.print() after a brief delay to ensure styles and images have settled
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="no-print mb-8 p-4 bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
      <div>
        <span className="font-bold uppercase tracking-wider text-[#005288]">Print Preview Mode</span>
        <p className="text-gray-500 mt-0.5">Adjust settings to "Save as PDF" or print directly.</p>
      </div>
      <div className="flex gap-2">
        <Link href={cancelUrl} className="border border-gray-300 hover:border-gray-400 px-4 py-2 font-bold uppercase transition-colors">
          Cancel
        </Link>
        <button 
          onClick={() => window.print()} 
          className="bg-[#005288] hover:bg-[#003c64] text-white px-5 py-2 font-bold uppercase transition-colors cursor-pointer"
        >
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}
