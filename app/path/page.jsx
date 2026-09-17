import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import pool from '@/lib/db';
import { Sparkles, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Nitnem & Gurbani Paths in Punjabi, Hindi & English | Daily Hukamnama',
  description: 'Read and listen to sacred Nitnem banis including Japji Sahib, Jaap Sahib, Tav Prasad Savaiye, Chaupai Sahib, Anand Sahib, Rehras Sahib, Sukhmani Sahib, and more with Gurmukhi text and translations.',
};

function formatPathTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s+in\s+Punjabi\s+Gurmukhi/gi, '')
    .replace(/\s+in\s+Punjabi/gi, '')
    .trim();
}

async function getMenuPaths() {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, slug, punjabi_title, sort_order FROM pages WHERE page_type = 'path' AND show_in_menu = 1 ORDER BY sort_order ASC, id ASC"
    );
    if (rows && rows.length > 0) {
      return rows.map((p) => ({
        ...p,
        cleanTitle: formatPathTitle(p.title),
      }));
    }
  } catch (err) {
    console.error('Error fetching paths from DB:', err);
  }

  // Graceful fallback if database empty
  const defaultList = [
    { id: 1, title: 'Japji Sahib', cleanTitle: 'JAPJI SAHIB', slug: 'japji-sahib-in-punjabi-gurmukhi', punjabi_title: 'ਜਪੁਜੀ ਸਾਹਿਬ' },
    { id: 2, title: 'Jaap Sahib', cleanTitle: 'JAAP SAHIB', slug: 'path/jaap-sahib', punjabi_title: 'ਜਾਪੁ ਸਾਹਿਬ' },
    { id: 3, title: 'Tav Prasad Savaiye', cleanTitle: 'TAV PRASAD SAVAIYE', slug: 'path/tav-prasad-savaiye', punjabi_title: 'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵਯੇ' },
    { id: 4, title: 'Chaupai Sahib', cleanTitle: 'CHAUPAI SAHIB', slug: 'path/chaupai-sahib', punjabi_title: 'ਚੌਪਈ ਸਾਹਿਬ' },
    { id: 5, title: 'Anand Sahib', cleanTitle: 'ANAND SAHIB', slug: 'path/anand-sahib', punjabi_title: 'ਅਨੰਦੁ ਸਾਹਿਬ' },
    { id: 6, title: 'Rehras Sahib', cleanTitle: 'REHRAS SAHIB', slug: 'path/rehras-sahib', punjabi_title: 'ਰਹਿਰਾਸ ਸਾਹਿਬ' },
    { id: 7, title: 'Kirtan Sohila', cleanTitle: 'KIRTAN SOHILA', slug: 'path/kirtan-sohila', punjabi_title: 'ਕੀਰਤਨ ਸੋਹਿਲਾ' },
    { id: 8, title: 'Sukhmani Sahib', cleanTitle: 'SUKHMANI SAHIB', slug: 'path/sukhmani-sahib', punjabi_title: 'ਸੁਖਮਨੀ ਸਾਹਿਬ' },
    { id: 9, title: 'Dukh Bhanjani Sahib', cleanTitle: 'DUKH BHANJANI SAHIB', slug: 'path/dukh-bhanjani-sahib', punjabi_title: 'ਦੁਖ ਭੰਜਨੀ ਸਾਹਿਬ' },
    { id: 10, title: 'Asa Di Vaar', cleanTitle: 'ASA DI VAAR', slug: 'path/asa-di-vaar', punjabi_title: 'ਆਸਾ ਦੀ ਵਾਰ' },
  ];
  return defaultList;
}

export default async function PathHubPage() {
  const paths = await getMenuPaths();

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Daily Nitnem & Sacred Gurbani</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            Nitnem Gurbani Paths
          </h1>
          <p className="text-lg font-gurmukhi text-gold-200">
            ਬਾਣੀ ਗੁਰੂ ਗੁਰੂ ਹੈ ਬਾਣੀ ਵਿਚਿ ਬਾਣੀ ਅੰਮ੍ਰਿਤੁ ਸਾਰੇ ॥
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Read complete daily Nitnem and Gurbani paths in authentic Gurmukhi script with Punjabi Viakhya, Hindi, and English translations.
          </p>
        </div>
      </section>

      {/* Beautiful Paths Pill Grid (matching screenshot layout) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 sm:p-10 border border-gold-200 shadow-sm">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-slate-900">
              Sacred Nitnem & Gurbani Banis
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any holy path below to read in Gurmukhi, Hindi, or English
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-w-5xl mx-auto">
            {paths.map((item) => {
              const href = item.slug.startsWith('path/') || item.slug.startsWith('/')
                ? (item.slug.startsWith('/') ? item.slug : `/${item.slug}`)
                : `/${item.slug}`;

              return (
                <Link
                  key={item.id || item.slug}
                  href={href}
                  className="group relative flex flex-col items-center justify-center py-4 px-6 rounded-full border-2 border-rose-300 hover:border-gold-500 bg-white hover:bg-gradient-to-r hover:from-gold-500 hover:to-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-center"
                >
                  <span className="font-serif-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-500 group-hover:text-white transition-colors">
                    {item.cleanTitle}
                  </span>
                  {item.punjabi_title && (
                    <span className="font-gurmukhi text-[11px] font-semibold text-gold-600 group-hover:text-gold-100 transition-colors mt-0.5">
                      {item.punjabi_title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
