import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { pathsData } from '@/lib/paths-data';
import { BookOpen, Sparkles, Clock, ArrowRight, Sun, Sunset, Moon } from 'lucide-react';

export const metadata = {
  title: 'Nitnem & Gurbani Paths in Punjabi, Hindi & English | Daily Hukamnama',
  description: 'Read and listen to sacred Nitnem banis including Japji Sahib, Jaap Sahib, Tav Prasad Savaiye, Chaupai Sahib, Anand Sahib, Rehras Sahib, Sukhmani Sahib, and more with Gurmukhi text and translations.',
};

export default function PathHubPage() {
  const morningPaths = pathsData.filter((p) => p.timeOfDay.includes('Morning'));
  const eveningPaths = pathsData.filter((p) => p.timeOfDay.includes('Evening') || p.timeOfDay.includes('Protection'));
  const nightPaths = pathsData.filter((p) => p.timeOfDay.includes('Night') || p.timeOfDay.includes('Anytime') || p.timeOfDay.includes('Healing'));

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
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
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light">
            Read and listen to the daily Sikh prayers with Gurmukhi calligraphy, Romanized English transliteration, and spiritual translations.
          </p>
        </div>
      </section>

      {/* Paths Directory */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathsData.map((item) => (
            <div
              key={item.slug}
              className="bg-white rounded-2xl shadow-sm border border-gold-200 hover:border-gold-400 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gold-600" />
                    <span>{item.timeOfDay}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.author}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-gold-600 transition-colors font-serif-heading">
                    {item.title}
                  </h3>
                  <p className="font-gurmukhi text-base font-bold text-gold-700 mt-0.5">
                    {item.punjabiTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-900">
                  <span className="font-semibold">Spiritual Essence: </span>
                  <span>{item.benefits}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/path/${item.slug}`}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-medium text-xs shadow-sm transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
