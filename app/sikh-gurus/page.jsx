import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { sikhGurusData } from '@/lib/gurus-data';
import { Sparkles, BookOpen, ArrowRight, Calendar, MapPin } from 'lucide-react';

export const metadata = {
  title: 'The Ten Sikh Gurus & Sri Guru Granth Sahib Ji | History & Teachings',
  description: 'Learn about the lives, eternal teachings, divine poetry, and historical sacrifices of the Ten Sikh Gurus from Guru Nanak Dev Ji to Sri Guru Gobind Singh Ji and the living Guru Sri Guru Granth Sahib Ji.',
};

export default function SikhGurusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Divine Lineage of Enlightenment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            The Ten Sikh Gurus
          </h1>
          <p className="text-lg font-gurmukhi text-gold-200">
            ਸਭ ਤੇ ਵਡਾ ਸਤਿਗੁਰੁ ਨਾਨਕੁ ਜਿਨਿ ਕਲ ਰਾਖੀ ਮੇਰੀ ॥
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light">
            Discover the life stories, profound spiritual wisdom, and righteous courage of the Sikh Gurus who illuminated humanity.
          </p>
        </div>
      </section>

      {/* Gurus Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sikhGurusData.map((guru) => (
            <div
              key={guru.id}
              className="bg-white rounded-2xl shadow-sm border border-gold-200 hover:border-gold-400 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200">
                    {guru.id === 11 ? 'Eternal Living Guru' : `Guru #${guru.id}`}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {guru.dates}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-gold-600 transition-colors font-serif-heading">
                    {guru.name}
                  </h3>
                  <p className="font-gurmukhi text-sm font-semibold text-gold-700">
                    {guru.punjabiName}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {guru.summary}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                    <span className="truncate">{guru.birthPlace}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                    <span className="truncate">{guru.baniCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/sikh-gurus/${guru.slug}`}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gold-50 hover:bg-gold-500 text-gold-800 hover:text-white font-medium text-xs transition duration-200"
                >
                  <span>Read Full Biography & Teachings</span>
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
