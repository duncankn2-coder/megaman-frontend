'use client';

import React from 'react';

interface PrintControllerProps {
  cancelUrl?: string;
  documentTitle?: string;
  pdfApiUrl?: string;
}

export default function PrintController({ 
  cancelUrl = '/products', 
  documentTitle = 'EPREL Technical Document',
}: PrintControllerProps) {
  const handlePrint = () => {
    if (documentTitle) {
      document.title = documentTitle;
    }
    window.print();
  };

  return (
    <div className="no-print sticky top-0 z-50 bg-slate-900/90 backdrop-blur text-white py-3 px-6 shadow-xl mb-6 flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center space-x-3">
        <a 
          href={cancelUrl}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded transition flex items-center gap-1.5"
        >
          <span>←</span> Back to Product
        </a>
        <span className="text-slate-400 text-sm">|</span>
        <h1 className="text-sm font-bold text-slate-100 font-sans tracking-wide">{documentTitle}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handlePrint}
          className="bg-[#009fe3] hover:bg-[#0086c0] text-white text-xs font-bold px-4 py-2 rounded shadow transition flex items-center space-x-2 font-sans cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </svg>
          <span>Save as PDF</span>
        </button>
      </div>
    </div>
  );
}
