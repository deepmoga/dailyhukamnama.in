import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import pool from '@/lib/db';
import { BookOpen, Sparkles, Sun, Compass, Heart, CheckCircle2 } from 'lucide-react';

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
      <section className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-4 py-1.5 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Divine Guidance for Daily Life</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {dbPage?.title || 'About Daily Hukamnama Sahib'}
          </h1>
          <p className="text-lg sm:text-xl font-gurmukhi text-gold-200">
            ਹੁਕਮਿ ਮੰਨਿਐ ਹੋਵੈ ਪਰਵਾਣੁ ਤਾ ਖਸਮੈ ਕਾ ਮਹਲੁ ਪਾਇਸੀ ॥
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            The sacred Royal Decree and divine command received daily from Sri Guru Granth Sahib Ji at Sachkhand Sri Harmandir Sahib, Amritsar.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Dynamic Admin Body if provided */}
        {dbPage?.content && (
          <div 
            className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gold-200/80 rich-text-content prose prose-slate max-w-none prose-headings:font-serif-heading prose-headings:text-slate-900 prose-img:rounded-xl prose-img:shadow"
            dangerouslySetInnerHTML={{ __html: dbPage.content }}
          />
        )}
        {/* Section 1: What is a Hukamnama? */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center space-x-3 border-b border-gold-100 pb-3">
            <BookOpen className="w-6 h-6 text-gold-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              What is a Hukamnama?
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-base">
            The word <strong>Hukamnama</strong> (ਹੁਕਮਨਾਮਾ) is derived from two Persian words: <em>Hukam</em> (command or royal decree) and <em>Nama</em> (letter or written document). In Sikh tradition, the Hukamnama—also known reverently as the <strong>Mukhwak</strong> (ਮੁਖਵਾਕ) or <strong>Vak</strong>—is the divine order given directly by the living Eternal Guru, <strong>Sri Guru Granth Sahib Ji</strong>, to guide Sikhs through every situation in life.
          </p>
          <p className="text-slate-700 leading-relaxed text-base">
            Whenever a Sikh seeks wisdom, begins a new endeavor, conducts a life ceremony (such as birth, naming, marriage, or starting a new day), they take a Hukamnama to align their thoughts, speech, and actions with the divine Will of the Creator.
          </p>
        </section>

        {/* Section 2: The Sacred Ceremony at Sri Harmandir Sahib */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center space-x-3 border-b border-gold-100 pb-3">
            <Sun className="w-6 h-6 text-gold-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              The Daily Ceremony at Sachkhand Sri Harmandir Sahib
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-base">
            Every morning during the ambrosial hours (<em>Amrit Vela</em>), around 2:00 AM to 3:00 AM, the sacred Golden Temple in Amritsar witnesses a deeply devotional ceremony:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
            <div className="bg-gold-50/50 p-5 rounded-xl border border-gold-200/80 space-y-2">
              <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">Step 1: Prakash</span>
              <h3 className="font-bold text-slate-900 text-sm">Prakash Ceremony</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sri Guru Granth Sahib Ji is carried from Sri Akal Takht Sahib in a ceremonial golden palanquin (Palki Sahib) with Gurbani Kirtan and installed reverently inside Sri Harmandir Sahib.
              </p>
            </div>
            <div className="bg-gold-50/50 p-5 rounded-xl border border-gold-200/80 space-y-2">
              <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">Step 2: Ardas</span>
              <h3 className="font-bold text-slate-900 text-sm">Supplication Prayer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A humble Ardas prayer is offered on behalf of the global Sikh Sangat, seeking the Guru’s divine guidance and decree for the day.
              </p>
            </div>
            <div className="bg-gold-50/50 p-5 rounded-xl border border-gold-200/80 space-y-2">
              <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">Step 3: Mukhwak</span>
              <h3 className="font-bold text-slate-900 text-sm">The Royal Decree</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Granthi Singh respectfully opens Sri Guru Granth Sahib Ji at random. The first Shabad starting on the top-left side of the opened Ang is read aloud for the Sangat.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How to Live by the Hukamnama */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center space-x-3 border-b border-gold-100 pb-3">
            <Compass className="w-6 h-6 text-gold-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              How to Live by the Daily Hukamnama
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-base">
            Taking or listening to the Daily Hukamnama is not simply an outward ritual; it is a spiritual compass for daily life:
          </p>
          <ul className="space-y-3 pt-2">
            {[
              'Contemplate the Message: Read the Gurmukhi original followed by Punjabi Viakhya and English translation to understand its spiritual meaning.',
              'Reflect During the Day: Keep the Guru’s teaching at the front of your mind during work, challenges, and relationships.',
              'Overcome Ego and Desire: Let the Hukamnama guide you to abandon anger, greed, ego, and falsehood.',
              'Share with Others: Share the daily holy decree with family, friends, and Sangat so all may benefit from Guru Ji’s wisdom.',
            ].map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Call to action */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white p-8 rounded-2xl text-center space-y-4 shadow-md">
          <h3 className="text-2xl font-bold font-serif-heading">
            Receive Today&apos;s Divine Hukamnama
          </h3>
          <p className="text-sm text-gold-100 max-w-xl mx-auto">
            Experience peace, clarity, and guidance directly from Sri Darbar Sahib right now.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center bg-white text-slate-900 hover:bg-gold-50 font-bold px-6 py-3 rounded-full text-sm shadow transition"
            >
              Read Today&apos;s Hukamnama
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
