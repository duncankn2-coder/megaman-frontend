/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';

export const dynamic = 'force-dynamic';

interface Media {
  id: string;
  url: string;
  alt?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  summary: string;
  content?: any;
  image: Media | string;
  linkText?: string;
  linkUrl?: string;
}

async function getNewsArticle(id: string): Promise<NewsArticle | null> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/news/${id}?depth=2`, {
      cache: 'no-store',
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching news article with ID ${id}:`, error);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getNewsArticle(id);
  if (!article) {
    return {
      title: 'Article Not Found | MEGAMAN®',
    };
  }
  return {
    title: `${article.title} | News & Press | MEGAMAN®`,
    description: article.summary || `Read the latest announcement: ${article.title}`,
  };
}

function LexicalRenderer({ content }: { content: any }) {
  if (!content || !content.root) return null;

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    // Handle text nodes
    if (node.type === 'text') {
      let text = node.text;
      if (!text) return null;

      const format = node.format;
      let element: React.ReactNode = text;

      if (typeof format === 'number') {
        if (format & 1) element = <strong className="font-bold text-gray-900">{element}</strong>;
        if (format & 2) element = <em className="italic">{element}</em>;
        if (format & 4) element = <span className="line-through">{element}</span>;
        if (format & 8) element = <span className="underline">{element}</span>;
        if (format & 16) element = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{element}</code>;
      } else if (typeof format === 'string') {
        if (format.includes('bold')) element = <strong className="font-bold text-gray-900">{element}</strong>;
        if (format.includes('italic')) element = <em className="italic">{element}</em>;
        if (format.includes('underline')) element = <span className="underline">{element}</span>;
        if (format.includes('strikethrough')) element = <span className="line-through">{element}</span>;
        if (format.includes('code')) element = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{element}</code>;
      }

      return <span key={index}>{element}</span>;
    }

    // Handle link nodes
    if (node.type === 'link') {
      return (
        <a
          key={index}
          href={node.fields?.url || '#'}
          target={node.fields?.newTab ? '_blank' : undefined}
          rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
          className="text-[#005288] hover:underline transition-colors font-medium"
        >
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </a>
      );
    }

    // Handle structural nodes
    const children = node.children?.map((child: any, i: number) => renderNode(child, i)) || [];

    switch (node.type) {
      case 'root':
        return <div key={index} className="space-y-6">{children}</div>;
      case 'paragraph':
        return <div key={index} className="text-gray-600 font-light leading-relaxed text-sm md:text-base mb-4">{children}</div>;
      case 'heading':
        const Tag = node.tag || 'h2';
        const headingClasses: Record<string, string> = {
          h1: 'text-3xl md:text-4xl font-extralight uppercase tracking-wider text-gray-900 mt-8 mb-4 border-b border-gray-100 pb-2',
          h2: 'text-2xl md:text-3xl font-light uppercase tracking-wider text-gray-800 mt-8 mb-4',
          h3: 'text-xl font-bold uppercase tracking-wider text-gray-800 mt-6 mb-3',
          h4: 'text-lg font-bold text-gray-800 mt-4 mb-2',
          h5: 'text-base font-bold text-gray-800 mt-4 mb-2',
          h6: 'text-sm font-bold text-gray-800 mt-4 mb-2',
        };
        const className = headingClasses[Tag] || headingClasses.h2;
        return <Tag key={index} className={className}>{children}</Tag>;
      case 'list':
        if (node.tag === 'ol') {
          return <ol key={index} className="list-decimal pl-6 space-y-2 my-4 text-gray-600 font-light text-sm md:text-base">{children}</ol>;
        }
        return <ul key={index} className="list-disc pl-6 space-y-2 my-4 text-gray-600 font-light text-sm md:text-base">{children}</ul>;
      case 'listitem':
        return <li key={index}>{children}</li>;
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-[#005288] pl-4 italic my-6 text-gray-700 bg-gray-50 py-4 pr-4 rounded-r-md">
            {children}
          </blockquote>
        );
      default:
        return <span key={index}>{children}</span>;
    }
  };

  return renderNode(content.root, 0);
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getNewsArticle(id);

  if (!article) {
    notFound();
  }

  const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  const imageUrl = article.image && typeof article.image === 'object' && article.image.url
    ? (article.image.url.startsWith('http://') || article.image.url.startsWith('https://')
      ? article.image.url
      : `${payloadUrl}${article.image.url}`)
    : '';

  return (
    <div className="bg-[#fcfcfc] text-gray-800 min-h-screen font-sans selection:bg-[#005288] selection:text-white">
      {/* Header spacer or context hero */}
      <section className="relative bg-gradient-to-r from-[#003457] to-[#005288] text-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col gap-4">
            <Link
              href="/company/news-and-press"
              className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-blue-300 hover:text-white transition-colors w-fit group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to News
            </Link>

            <div className="flex items-center gap-3 mt-4">
              <span className="h-[1px] w-6 bg-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 font-mono">
                {article.category || 'PRESS RELEASE'}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-light uppercase tracking-wider leading-snug max-w-4xl">
              {article.title}
            </h1>

            <p className="text-[11px] font-mono text-blue-300 uppercase tracking-widest mt-2">
              Published on {article.publishDate
                ? new Date(article.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200 py-3 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <ol className="flex items-center space-x-2 text-[10px] uppercase font-mono tracking-wider text-gray-500">
            <li><Link href="/" className="hover:text-[#005288] transition-colors">Home</Link></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300"><span className="text-gray-400">Company</span></li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300">
              <Link href="/company/news-and-press" className="hover:text-[#005288] transition-colors">News &amp; Press</Link>
            </li>
            <li className="before:content-['/'] before:mr-2 before:text-gray-300 truncate max-w-[200px]">
              <span className="text-gray-800 font-bold">{article.title}</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Article Content */}
      <main className="container mx-auto px-6 md:px-12 max-w-5xl py-12 md:py-16">
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-8">
            {/* Feature Image */}
            {imageUrl && (
              <div className="relative w-full aspect-[16/9] overflow-hidden border border-gray-200 shadow-sm rounded-sm">
                <Image
                  src={imageUrl}
                  alt={typeof article.image === 'object' ? article.image.alt || article.title : article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Rich Text Body */}
            {article.content ? (
              <div className="prose max-w-none text-gray-700">
                <LexicalRenderer content={article.content} />
              </div>
            ) : (
              <div className="text-gray-600 font-light leading-relaxed space-y-4">
                <p className="font-medium text-gray-800">{article.summary}</p>
                <p className="italic text-sm text-gray-400">No additional details have been published for this article.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:border-l lg:border-gray-200 lg:pl-8">
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
                Release Metadata
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-gray-400 font-mono uppercase text-[9px] tracking-wider mb-1">Category</p>
                  <p className="font-bold text-gray-800 uppercase">{article.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-mono uppercase text-[9px] tracking-wider mb-1">Release Date</p>
                  <p className="font-bold text-[#005288]">
                    {article.publishDate
                      ? new Date(article.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                {article.linkUrl && article.linkUrl !== '#' && (
                  <div className="pt-2">
                    <a
                      href={article.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#005288] hover:bg-[#003457] text-white font-bold uppercase tracking-wider text-[10px] text-center transition-colors rounded-sm"
                    >
                      {article.linkText || 'External Source'}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-dashed border-gray-200 p-6 rounded-sm text-center">
              <p className="text-xs text-gray-500 font-light mb-4">
                For media inquiries or press kit requests, please contact our PR department.
              </p>
              <Link
                href="/company/about-megaman"
                className="text-[10px] font-bold uppercase tracking-widest text-[#005288] hover:underline"
              >
                Contact Info →
              </Link>
            </div>
          </aside>
        </article>
      </main>

      <Footer />
    </div>
  );
}
