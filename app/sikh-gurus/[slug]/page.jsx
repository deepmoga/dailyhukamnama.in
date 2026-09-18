import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sikhGurusData } from '@/lib/gurus-data';
import pool from '@/lib/db';
import { ChevronLeft, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGuru(slug) {
  const cleanSlug = slug.toLowerCase().trim();
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pages WHERE (slug = ? OR slug = ? OR slug = ?) AND page_type = 'sikh_guru'",
      [cleanSlug, `sikh-gurus/${cleanSlug}`, cleanSlug.replace('sikh-gurus/', '')]
    );
    if (rows.length > 0) {
      const row = rows[0];
      const staticData = sikhGurusData.find((g) => g.slug === cleanSlug || (cleanSlug === 'guru-granth-sahib-ji' && g.slug === 'sri-guru-granth-sahib-ji')) || {};
      
      let relatedButtons = [];
      if (row.related_buttons) {
        try {
          relatedButtons = typeof row.related_buttons === 'string'
            ? JSON.parse(row.related_buttons)
            : row.related_buttons;
        } catch (e) {
          relatedButtons = [];
        }
      }
      if (!Array.isArray(relatedButtons)) relatedButtons = [];
      relatedButtons = relatedButtons.filter((b) => b && b.name && b.link);

      return {
        id: row.sort_order || staticData.id || 1,
        name: row.title,
        punjabiName: row.punjabi_title || staticData.punjabiName || '',
        dates: row.author || staticData.dates || '',
        summary: row.meta_desc || staticData.summary || '',
        biography: row.content || staticData.biography || '',
        relatedButtons,
      };
    }
  } catch (e) {
    console.error('Error fetching guru from DB:', e);
  }

  const staticData = sikhGurusData.find((g) => g.slug === slug || (slug === 'guru-granth-sahib-ji' && g.slug === 'sri-guru-granth-sahib-ji'));
  if (staticData) {
    return {
      id: staticData.id,
      name: staticData.name,
      punjabiName: staticData.punjabiName,
      dates: staticData.dates,
      summary: staticData.summary,
      biography: staticData.biography,
      relatedButtons: [],
    };
  }
  return null;
}

export async function generateMetadata({ params }) {
  const guru = await getGuru(params.slug);
  if (!guru) return { title: 'Guru Not Found' };
  return {
    title: `${guru.name} (${guru.dates}) | Biography & Teachings`,
    description: guru.summary,
  };
}

export default async function GuruDetailPage({ params }) {
  const guru = await getGuru(params.slug);

  if (!guru) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/sikh-gurus"
            className="inline-flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Sikh Gurus</span>
          </Link>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gold-400 bg-gold-500/20 px-3 py-1 rounded-full border border-gold-400/30">
                {guru.id === 11 ? 'Eternal Guru' : `Guru #${guru.id}`}
              </span>
              {guru.dates && (
                <span className="text-xs text-slate-300 font-mono">
                  {guru.dates}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading">
              {guru.name}
            </h1>
            {guru.punjabiName && (
              <p className="font-gurmukhi text-2xl font-bold text-gold-300">
                {guru.punjabiName}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Backend Description */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Related language buttons if any */}
        {guru.relatedButtons && guru.relatedButtons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {guru.relatedButtons.map((btn, idx) => (
              <Link
                key={idx}
                href={btn.link}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gold-300 text-gold-800 hover:bg-gold-50 shadow-xs transition"
              >
                <span>{btn.name}</span>
                <ExternalLink className="w-3 h-3 text-gold-500" />
              </Link>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gold-200">
          {guru.biography && guru.biography.includes('<') ? (
            <div 
              className="rich-text-content prose prose-slate max-w-none 
                prose-headings:font-serif-heading prose-headings:text-slate-900 
                prose-h2:text-2xl prose-h2:border-b prose-h2:border-gold-200 prose-h2:pb-2 
                prose-h3:text-xl 
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base 
                prose-strong:text-slate-900 
                prose-blockquote:border-gold-500 prose-blockquote:bg-gold-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
                prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-slate-200"
              dangerouslySetInnerHTML={{ __html: guru.biography }}
            />
          ) : (
            <div className="text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-base">
              {guru.biography}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
