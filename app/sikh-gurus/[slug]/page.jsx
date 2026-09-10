import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sikhGurusData } from '@/lib/gurus-data';
import pool from '@/lib/db';
import { Sparkles, MapPin, Calendar, BookOpen, CheckCircle2, ChevronLeft } from 'lucide-react';

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
      return {
        id: row.sort_order || staticData.id || 1,
        name: row.title,
        punjabiName: row.punjabi_title || staticData.punjabiName || '',
        dates: row.author || staticData.dates || '',
        guruship: staticData.guruship || row.author || '',
        birthPlace: staticData.birthPlace || '',
        jotiJotPlace: staticData.jotiJotPlace || '',
        baniCount: staticData.baniCount || '',
        summary: row.meta_desc || staticData.summary || '',
        coreTeachings: staticData.coreTeachings || [],
        biography: row.content || staticData.biography || '',
        isHtmlContent: !!row.content,
        majorBanis: staticData.majorBanis || [],
      };
    }
  } catch (e) {
    console.error('Error fetching guru from DB:', e);
  }
  return sikhGurusData.find((g) => g.slug === slug || (slug === 'guru-granth-sahib-ji' && g.slug === 'sri-guru-granth-sahib-ji'));
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
        <div className="max-w-4xl mx-auto space-y-4">
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
              <span className="text-xs text-slate-300 font-mono">
                {guru.dates}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading">
              {guru.name}
            </h1>
            <p className="font-gurmukhi text-2xl font-bold text-gold-300">
              {guru.punjabiName}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Quick Facts Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Guruship</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{guru.guruship}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Birthplace</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{guru.birthPlace}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Joti Jot Place</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{guru.jotiJotPlace}</p>
          </div>
          <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bani in Sri Guru Granth Sahib</span>
            <p className="text-sm font-bold text-gold-700 mt-0.5">{guru.baniCount}</p>
          </div>
        </div>

        {/* Core Teachings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
            <Sparkles className="w-5 h-5 text-gold-600" />
            <h2 className="text-xl font-bold text-slate-900 font-serif-heading">
              Core Teachings & Contributions
            </h2>
          </div>
          <ul className="space-y-3">
            {guru.coreTeachings.map((teaching, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{teaching}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full Biography */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
            <BookOpen className="w-5 h-5 text-gold-600" />
            <h2 className="text-xl font-bold text-slate-900 font-serif-heading">
              Life History & Divine Mission
            </h2>
          </div>
          {guru.biography.includes('<') ? (
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

        {/* Major Banis / Compositions */}
        {guru.majorBanis && guru.majorBanis.length > 0 && (
          <div className="bg-gradient-to-r from-gold-50 via-white to-amber-50 rounded-2xl p-6 border border-gold-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900 font-serif-heading">
              Major Sacred Banis & Milestones
            </h3>
            <div className="flex flex-wrap gap-2">
              {guru.majorBanis.map((b, idx) => (
                <span key={idx} className="bg-white border border-gold-300 text-gold-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
