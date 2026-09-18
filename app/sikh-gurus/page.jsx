import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import pool from '@/lib/db';
import { Sparkles, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  try {
    const [rows] = await pool.query(
      "SELECT meta_title, meta_desc, meta_keywords, title FROM pages WHERE id = 4 OR slug = 'sikh-gurus' LIMIT 1"
    );
    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        title: p.meta_title || `${p.title} | Daily Hukamnama`,
        description: p.meta_desc || 'Learn about the lives, eternal teachings, divine poetry, and sacrifices of the Ten Sikh Gurus.',
        keywords: p.meta_keywords || '',
      };
    }
  } catch (e) {
    console.error('Metadata fetch error for sikh-gurus:', e);
  }

  return {
    title: 'The Ten Sikh Gurus & Sri Guru Granth Sahib Ji | History & Teachings',
    description: 'Learn about the lives, eternal teachings, divine poetry, and historical sacrifices of the Ten Sikh Gurus from Guru Nanak Dev Ji to Sri Guru Gobind Singh Ji and the living Guru Sri Guru Granth Sahib Ji.',
  };
}

async function getPageFourData() {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, content, punjabi_title FROM pages WHERE id = 4 OR slug = 'sikh-gurus' LIMIT 1"
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error('Error fetching page 4 data from DB:', err);
  }
  return {
    id: 4,
    title: 'The Ten Sikh Gurus',
    punjabi_title: 'ਦਸ ਗੁਰੂ ਸਾਹਿਬਾਨ',
    content: '<p>Sikhism was founded and nurtured by ten divine spiritual teachers who lived between 1469 and 1708, each embodying the same divine light (Jyot) of Sri Guru Nanak Dev Ji.</p>',
  };
}

const sikhGurusList = [
  { id: 1, name: 'Guru Nanak Dev Ji', punjabiName: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ', slug: 'guru-nanak-dev-ji' },
  { id: 2, name: 'Guru Angad Dev Ji', punjabiName: 'ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ', slug: 'guru-angad-dev-ji' },
  { id: 3, name: 'Guru Amar Das Ji', punjabiName: 'ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ', slug: 'guru-amar-das-ji' },
  { id: 4, name: 'Guru Ram Das Ji', punjabiName: 'ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ', slug: 'guru-ram-das-ji' },
  { id: 5, name: 'Guru Arjan Dev Ji', punjabiName: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ', slug: 'guru-arjan-dev-ji' },
  { id: 6, name: 'Guru Har Gobind Ji', punjabiName: 'ਗੁਰੂ ਹਰ ਗੋਵਿੰਦ ਜੀ', slug: 'guru-har-gobind-ji' },
  { id: 7, name: 'Guru Har Rai Ji', punjabiName: 'ਗੁਰੂ ਹਰਿਰਾਇ ਜੀ', slug: 'guru-har-rai-ji' },
  { id: 8, name: 'Guru Har Krishan Ji', punjabiName: 'ਗੁਰੂ ਹਰਿਕ੍ਰਿਸ਼ਨ ਜੀ', slug: 'guru-har-krishan-ji' },
  { id: 9, name: 'Guru Teg Bahadar Ji', punjabiName: 'ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ', slug: 'guru-teg-bahadar-ji' },
  { id: 10, name: 'Guru Gobind Singh Ji', punjabiName: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', slug: 'guru-gobind-singh-ji' },
  { id: 11, name: 'Sri Guru Granth Sahib Ji', punjabiName: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ', slug: 'sri-guru-granth-sahib' },
];

export default async function SikhGurusHubPage() {
  const pageData = await getPageFourData();

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Divine Lineage of Enlightenment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {pageData.title || 'The Ten Sikh Gurus'}
          </h1>
          {pageData.punjabi_title ? (
            <p className="text-xl sm:text-2xl font-gurmukhi text-gold-200">
              {pageData.punjabi_title}
            </p>
          ) : (
            <p className="text-lg font-gurmukhi text-gold-200">
              ਸਭ ਤੇ ਵਡਾ ਸਤਿਗੁਰੁ ਨਾਨਕੁ ਜਿਨਿ ਕਲ ਰਾਖੀ ਮੇਰੀ ॥
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Discover the life stories, profound spiritual wisdom, and righteous courage of the Sikh Gurus who illuminated humanity.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* 1. Page ID 4 Content from Database */}
        {pageData.content && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gold-200/90">
            <div 
              className="rich-text-content prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        )}

        {/* 2. All Gurus Pill Links (Exact layout as /path) */}
        <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 sm:p-10 border border-gold-200 shadow-sm">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-800 border border-gold-200 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Sacred Lineage</span>
            </div>
            <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-slate-900">
              Divine Sikh Gurus & Sri Guru Granth Sahib Ji
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click any Guru Sahib below to read their sacred life history, holy banis, and spiritual message
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 max-w-7xl mx-auto">
            {sikhGurusList.map((guru) => (
              <Link
                key={guru.slug}
                href={`/sikh-gurus/${guru.slug}`}
                className="group flex flex-col items-center justify-center text-center py-4 px-6 rounded-full border-2 border-rose-300 hover:border-gold-500 bg-white hover:bg-gradient-to-r hover:from-gold-500 hover:to-amber-500 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="font-bold text-xs sm:text-sm tracking-wider text-slate-800 group-hover:text-white transition-colors uppercase font-serif-heading">
                  {guru.name}
                </span>
                {guru.punjabiName && (
                  <span className="font-gurmukhi text-xs text-gold-700 group-hover:text-gold-100 transition-colors mt-0.5 font-medium">
                    {guru.punjabiName}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
