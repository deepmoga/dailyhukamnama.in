import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pool from '@/lib/db';
import { Sparkles } from 'lucide-react';

export async function generateMetadata() {
  try {
    const [rows] = await pool.query('SELECT meta_title, meta_desc, meta_keywords FROM pages WHERE slug = ?', ['about-hukam']);
    if (rows.length > 0 && rows[0].meta_title) {
      return {
        title: rows[0].meta_title,
        description: rows[0].meta_desc || 'Significance of Mukhwak from Sri Darbar Sahib',
        keywords: rows[0].meta_keywords || '',
      };
    }
  } catch (err) {
    console.error(err);
  }
  return {
    title: 'About Daily Hukamnama | Significance of Mukhwak from Sri Darbar Sahib',
    description: 'Understand the profound spiritual meaning, history, and sacred tradition of receiving the Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib, Amritsar.',
  };
}

export default async function AboutHukamPage() {
  let dbPage = null;
  try {
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ?', ['about-hukam']);
    if (rows.length > 0) {
      dbPage = rows[0];
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Divine Guidance for Daily Life</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {dbPage?.title || 'About Daily Hukamnama'}
          </h1>
          <p className="text-lg sm:text-xl font-gurmukhi text-gold-200">
            {dbPage?.punjabi_title || 'ਹੁਕਮਿ ਮੰਨਿਐ ਹੋਵੈ ਪਰਵਾਣੁ ਤਾ ਖਸਮੈ ਕਾ ਮਹਲੁ ਪਾਇਸੀ ॥'}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            The sacred Royal Decree and divine command received daily from Sri Guru Granth Sahib Ji at Sachkhand Sri Harmandir Sahib, Amritsar.
          </p>
        </div>
      </section>

      {/* Main Content - Dynamic Admin Description Only */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gold-200/90">
          {dbPage?.content ? (
            <div 
              className="rich-text-content prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed prose-headings:font-serif-heading prose-headings:text-slate-900 prose-img:rounded-xl prose-img:shadow"
              dangerouslySetInnerHTML={{ __html: dbPage.content }}
            />
          ) : (
            <p className="text-slate-500 text-sm italic">
              Content for this page can be edited in the Admin Panel under Standard Pages.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
