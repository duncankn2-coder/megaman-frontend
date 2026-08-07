"use client";

import Link from 'next/link';

interface PrintControllerProps {
  cancelUrl: string;
  pdfApiUrl?: string;
}

export default function PrintController({ cancelUrl, pdfApiUrl }: PrintControllerProps) {
  return (
    <div className="no-print mb-8 p-4 bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
      <div>
        <span className="font-bold uppercase tracking-wider text-[#005288]">DOWNLOAD DATASHEET</span>
        <p className="text-gray-500 mt-0.5">Click &quot;Download Merged PDF&quot; to obtain the complete PDF document with DI merged.</p>
      </div>
      <div className="flex gap-2">
        <Link href={cancelUrl} className="border border-gray-300 hover:border-gray-400 px-4 py-2 font-bold uppercase transition-colors">
          Cancel
        </Link>
        {pdfApiUrl && (
          <a
            href={pdfApiUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[#005288] hover:bg-[#003c64] text-white px-5 py-2 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Download Merged PDF
          </a>
        )}
        <button 
          onClick={() => window.print()} 
          className="border border-[#005288] text-[#005288] hover:bg-slate-100 px-4 py-2 font-bold uppercase transition-colors cursor-pointer"
        >
          Print Page
        </button>
      </div>
    </div>
  );
}
