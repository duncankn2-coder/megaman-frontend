'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import React, { useEffect, useState, useRef } from 'react';

interface DismantleInstructionPagesProps {
  diPdfUrl: string | null;
  familyName: string;
  startPageNumber?: number;
}

export default function DismantleInstructionPages({
  diPdfUrl,
  familyName,
  startPageNumber = 3,
}: DismantleInstructionPagesProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);
  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    const urlStr = typeof diPdfUrl === 'string' ? diPdfUrl : (diPdfUrl as any)?.url;
    if (!urlStr || typeof urlStr !== 'string') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js dynamically via CDN if not present on window or module
        let pdfjsLib = (window as any).pdfjsLib;

        if (!pdfjsLib) {
          try {
            // Try importing installed pdfjs-dist
            pdfjsLib = await import('pdfjs-dist');
            if (pdfjsLib.GlobalWorkerOptions) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }
          } catch {
            // Fallback to CDN
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load PDF.js library'));
              document.head.appendChild(script);
            });
            pdfjsLib = (window as any).pdfjsLib;
            if (pdfjsLib) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
            }
          }
        } else if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        }

        if (!pdfjsLib) {
          throw new Error('PDF.js library could not be loaded');
        }

        let targetUrl = urlStr;
        const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
        if (!targetUrl.endsWith('.pdf') && !targetUrl.includes('/api/media/file/')) {
          try {
            const res = await fetch(targetUrl);
            if (res.ok) {
              const mediaData = await res.json();
              if (mediaData?.url) {
                targetUrl = mediaData.url.startsWith('http')
                  ? mediaData.url
                  : `${payloadUrl}${mediaData.url.startsWith('/') ? '' : '/'}${mediaData.url}`;
              }
            }
          } catch (e) {
            // fallback to original targetUrl
          }
        }

        const loadingTask = pdfjsLib.getDocument({ url: targetUrl });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading Dismantle Instruction PDF:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load PDF document');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [diPdfUrl]);

  // Render individual pages onto their respective canvas elements
  useEffect(() => {
    if (!pdfDocRef.current || numPages === 0 || loading) return;

    let isMounted = true;

    async function renderAllPages() {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const canvas = canvasRefs.current[pageNum];
          if (!canvas) continue;

          const page = await pdfDocRef.current.getPage(pageNum);
          if (!isMounted) return;

          // Scale for crisp rendering at high resolution
          const scale = 2.0;
          const viewport = page.getViewport({ scale });

          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
        } catch (err) {
          console.error(`Error rendering PDF page ${pageNum}:`, err);
        }
      }
    }

    renderAllPages();

    return () => {
      isMounted = false;
    };
  }, [numPages, loading]);

  if (!diPdfUrl) {
    return (
      <div className="page-break">
        <div 
          className="relative border border-gray-300 shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:mb-0 font-sans" 
          style={{ 
            width: '210mm', 
            height: '296.5mm', 
            pageBreakAfter: 'always', 
            boxSizing: 'border-box',
            paddingTop: '10mm',
            paddingLeft: '14mm',
            paddingRight: '14mm',
            paddingBottom: '10mm'
          }}
        >
          <div className="h-full flex flex-col justify-between font-sans">
            <div>
              <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-4">
                <div className="flex flex-col text-left">
                  <h1 className="text-xl font-extrabold text-[#009fe3] uppercase tracking-wide">
                    {familyName}
                  </h1>
                  <span className="text-xs font-bold text-gray-800 tracking-wider">
                    DISMANTLE INSTRUCTION FOR MARKET SURVEILLANCE
                  </span>
                </div>
                <img 
                  src="/MEGAMAN_Logo.png" 
                  alt="MEGAMAN®" 
                  className="h-7 object-contain" 
                  style={{ maxHeight: '28px' }}
                />
              </div>

              <div className="p-12 border-2 border-dashed border-gray-300 rounded text-center my-12 bg-gray-50">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-1">
                  Dismantle Instruction Pending Upload
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  The dismantle instruction file <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">{familyName.toLowerCase().replace(/\s+/g, '_')}_di.pdf</code> has not been uploaded for family <span className="font-bold">{familyName}</span> yet.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-gray-500 border-t border-gray-200 pt-2 font-sans">
              <div className="flex space-x-4">
                <span>www.megaman.cc</span>
                <span>info@megaman.cc</span>
              </div>
              <span>© Copyright 2026. All rights reserved by MEGAMAN®</span>
              <span>Data subject to change</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-break">
        <div 
          className="relative border border-gray-300 shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:mb-0 font-sans" 
          style={{ width: '210mm', height: '296.5mm', boxSizing: 'border-box', padding: '20mm' }}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="animate-spin h-8 w-8 text-[#009fe3] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold">Rendering Dismantle Instruction Pages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-break">
        <div 
          className="relative border border-gray-300 shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:border-none print:m-0 print:mb-0 font-sans" 
          style={{ width: '210mm', height: '296.5mm', boxSizing: 'border-box', padding: '14mm' }}
        >
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-4">
                <div className="flex flex-col text-left">
                  <h1 className="text-xl font-extrabold text-[#009fe3] uppercase tracking-wide">
                    {familyName}
                  </h1>
                  <span className="text-xs font-bold text-gray-800 tracking-wider">
                    DISMANTLE INSTRUCTION FOR MARKET SURVEILLANCE
                  </span>
                </div>
                <img src="/MEGAMAN_Logo.png" alt="MEGAMAN®" className="h-7 object-contain" style={{ maxHeight: '28px' }} />
              </div>

              {/* Fallback to direct iframe if rendering failed */}
              <div className="w-full h-[220mm] border border-gray-200 rounded overflow-hidden">
                <iframe src={`${diPdfUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none" title="Dismantle Instruction PDF" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render a clean A4 page for each page of the Dismantle Instruction PDF
  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <>
      {pagesArray.map((pageNum) => {
        return (
          <div key={pageNum} className="page-break">
            <div 
              className="relative shadow-lg mx-auto bg-white mb-8 overflow-hidden print:shadow-none print:m-0 print:mb-0" 
              style={{ 
                width: '210mm', 
                height: '296.5mm', 
                pageBreakAfter: 'always', 
                boxSizing: 'border-box',
              }}
            >
              <canvas
                ref={(el) => {
                  canvasRefs.current[pageNum] = el;
                }}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
