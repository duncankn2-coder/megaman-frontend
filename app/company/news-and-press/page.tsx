/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../../components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News & Press | MEGAMAN®',
  description: 'Stay up to date with the latest news, press releases, and media announcements from MEGAMAN® LED Lighting.',
};

async function getNewsArticles() {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/news?sort=-publishDate&limit=24&depth=1`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.docs || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NewsAndPressPage() {
  const articles: any[] = await getNewsArticles();

  const categories = ['All', ...Array.from(new Set(articles.map((a: any) => a.category).filter(Boolean)))];

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen font-sans selection:bg-[#005288] selection:text-white">

      {/* Hero */}
      <section className="relative bg-slate-950 text-white min-h-[320px] flex items-center overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-white" />
          <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-white" />
          <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-white" />
          <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-white" />
        </div>
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 py-16">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">
                COMPANY • MEDIA CENTRE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight uppercase tracking-widest leading-none">
              NEWS &amp; <span className="font-bold text-white">PRESS</span>
            </h1>
            <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-2xl">
              The latest announcements, product launches, sustainability milestones, and media coverage from MEGAMAN® worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200 py-3.5 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-[10px] uppercase font-mono tracking-wider text-gray-500">
            <li><Link href="/" className="hover:text-[#005288] transition-colors">Home</Link></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300"><span className="text-gray-400">Company</span></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300"><span className="text-gray-800 font-bold">News &amp; Press</span></li>
          </ol>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 1 && (
        <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="container mx-auto max-w-7xl px-6 md:px-12 py-4 flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-gray-200 bg-gray-50 text-gray-500 cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl py-20">
        {articles.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-gray-300 bg-white">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">NO ARTICLES FOUND</p>
            <p className="text-sm text-gray-500">Press releases and news articles will appear here once published in the CMS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any, idx: number) => (
              <article
                key={article.id || idx}
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="p-6 flex flex-col flex-grow">
                  {/* Meta row */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
                    <span className="bg-gray-100 px-2 py-1 text-gray-500">{article.category || 'PRESS'}</span>
                    <span className="text-[#005288] font-bold">
                      {article.publishDate
                        ? new Date(article.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-3 leading-snug group-hover:text-[#005288] transition-colors line-clamp-3 flex-grow">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-4 mb-6">
                      {article.summary}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {article.linkUrl ? (
                      <a
                        href={article.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase font-bold text-[#005288] tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        {article.linkText || 'Read Full Release'}
                        <span>→</span>
                      </a>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        {article.linkText || 'Press Release'}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
