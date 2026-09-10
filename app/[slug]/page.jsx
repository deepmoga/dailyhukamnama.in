import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PathAudioPlayer from '@/components/PathAudioPlayer';
import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calendar, Share2, Sparkles, ChevronRight, User, Languages, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPageData(slug) {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ?', [cleanSlug]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (err) {
    console.error('Error fetching page data by slug:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const page = await getPageData(params.slug);
  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: `${page.meta_title || page.title} | Daily Hukamnama`,
    description: page.meta_desc || page.title,
    keywords: page.meta_keywords || '',
  };
}

export default async function DynamicSlugPage({ params }) {
  const page = await getPageData(params.slug);

  if (!page) {
    notFound();
  }

  const isPath = page.page_type === 'path';

  let relatedButtons = [];
  if (page.related_buttons) {
    try {
      relatedButtons = typeof page.related_buttons === 'string'
        ? JSON.parse(page.related_buttons)
        : page.related_buttons;
    } catch (e) {
      relatedButtons = [];
    }
  }
  if (!Array.isArray(relatedButtons)) relatedButtons = [];
  relatedButtons = relatedButtons.filter((b) => b && b.name && b.link);

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-gold-400 font-medium">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            {isPath ? (
              <>
                <Link href="/path" className="hover:underline">Nitnem Path</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </>
            ) : null}
            <span className="text-slate-300 truncate">{page.title}</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPath ? 'Sacred Gurbani Path' : 'Daily Hukamnama Resource'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide text-white">
              {page.title}
            </h1>

            {page.punjabi_title && (
              <p className="font-gurmukhi text-xl sm:text-2xl text-gold-300 pt-1">
                {page.punjabi_title}
              </p>
            )}

            {page.author && (
              <div className="flex items-center space-x-2 text-xs text-slate-300 pt-1">
                <User className="w-3.5 h-3.5 text-gold-400" />
                <span>Composed by: <strong>{page.author}</strong></span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
          {/* Audio Player for Path at the top */}
          {page.audio_url && (
            <div className="pb-2">
              <PathAudioPlayer
                audioUrl={page.audio_url}
                title={page.title}
                punjabiTitle={page.punjabi_title}
              />
            </div>
          )}

          {/* Language & Related Page Buttons */}
          {relatedButtons.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mr-1">
                <Languages className="w-4 h-4 text-gold-600" />
                <span>Read in:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {relatedButtons.map((btn, idx) => {
                  const href = btn.link.startsWith('/') || btn.link.startsWith('http') ? btn.link : `/${btn.link}`;
                  return (
                    <Link
                      key={idx}
                      href={href}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gold-500 hover:text-white text-slate-800 text-xs font-semibold rounded-lg border border-amber-300/80 shadow-xs transition-all duration-150 group"
                    >
                      <span>{btn.name}</span>
                      <ExternalLink className="w-3 h-3 text-gold-600 group-hover:text-white transition" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formatted Rich Text Content Render */}
          <div 
            className="rich-text-content prose prose-slate max-w-none 
              prose-headings:font-serif-heading prose-headings:text-slate-900 
              prose-h2:text-2xl prose-h2:border-b prose-h2:border-gold-200 prose-h2:pb-2 
              prose-h3:text-xl 
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base 
              prose-strong:text-slate-900 
              prose-blockquote:border-gold-500 prose-blockquote:bg-gold-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
              prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-slate-200"
            dangerouslySetInnerHTML={{ __html: page.content || '' }}
          />

          {/* Social share & footer salutation */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-gurmukhi text-sm text-gold-700">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥
            </p>

            <div className="flex items-center space-x-2">
              <Link
                href="/path"
                className="px-4 py-2 bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Explore More Gurbani
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Today&apos;s Hukamnama
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
