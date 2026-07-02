"use client";

import Link from 'next/link';

interface PrintControllerProps {
  cancelUrl: string;
}

export default function PrintController({ cancelUrl }: PrintControllerProps) {


  return (
    <div className="no-print mb-8 p-4 bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
      <div>
        <span className="font-bold uppercase tracking-wider text-[#005288]">DOWNLOAD DATASHEET</span>
        <p className="text-gray-500 mt-0.5">Press the DOWNLOAD button and select &quot;Save as PDF&quot; to download the file directly.</p>
      </div>
      <div className="flex gap-2">
        <Link href={cancelUrl} className="border border-gray-300 hover:border-gray-400 px-4 py-2 font-bold uppercase transition-colors">
          Cancel
        </Link>
        <button 
          onClick={() => window.print()} 
          className="bg-[#005288] hover:bg-[#003c64] text-white px-5 py-2 font-bold uppercase transition-colors cursor-pointer"
        >
          DOWNLOAD
        </button>
      </div>
    </div>
  );
}
