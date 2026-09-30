"use client";

import Link from 'next/link';

interface FamilyPrintControllerProps {
  familyId: string;
  seriesTitle: string;
}

export default function FamilyPrintController({ familyId, seriesTitle }: FamilyPrintControllerProps) {
  return (
    <div className="no-print mb-6 p-4 bg-white border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4 text-xs">
      <div>
        <span className="font-bold uppercase tracking-wider text-[#005288]">MEGAMAN® Family Datasheet</span>
        <p className="text-gray-500 mt-0.5">{seriesTitle} &mdash; Multi-Page Technical Documentation</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/families/${familyId}`}
          className="border border-gray-300 hover:border-gray-400 px-4 py-2 font-bold uppercase transition-colors"
        >
          Back to Series
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
