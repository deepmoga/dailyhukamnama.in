import Header from '@/components/Header';
import Footer from '@/components/Footer';
import pool from '@/lib/db';
import { Mail, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  try {
    const [rows] = await pool.query(
      "SELECT meta_title, meta_desc, meta_keywords, title FROM pages WHERE slug = 'contact-us' LIMIT 1"
    );
    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        title: p.meta_title || `${p.title} | Daily Hukamnama`,
        description: p.meta_desc || 'Get in touch with the Daily Hukamnama Seva team. We welcome your feedback, suggestions, and inquiries.',
        keywords: p.meta_keywords || '',
      };
    }
  } catch (e) {
    console.error('Metadata fetch error for contact-us:', e);
  }

  return {
    title: 'Contact Us | Daily Hukamnama Seva',
    description: 'Get in touch with the Daily Hukamnama Seva team. We welcome your feedback, suggestions, and inquiries.',
  };
}

async function getContactPageData() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pages WHERE slug = 'contact-us' LIMIT 1"
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error('Error fetching contact-us page from DB:', err);
  }
  return {
    title: 'Contact Us',
    punjabi_title: 'ਸੰਪਰਕ ਕਰੋ',
    content: '<h2>Get in Touch with Daily Hukamnama Seva</h2><p>We welcome your feedback, inquiries, and suggestions regarding our Daily Hukamnama updates, Nitnem paths, mobile applications, and Gurbani resources.</p><p>Please manage and customize this content in the Admin Panel under Standard Pages.</p>',
  };
}

export default async function ContactUsPage() {
  const page = await getContactPageData();

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-gold-400" />
            <span>We are here to help</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {page.title || 'Contact Us'}
          </h1>
          {page.punjabi_title ? (
            <p className="text-xl sm:text-2xl font-gurmukhi text-gold-200">
              {page.punjabi_title}
            </p>
          ) : (
            <p className="text-lg font-gurmukhi text-gold-200">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥
            </p>
          )}
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            Reach out to our seva team for any questions, suggestions, or feedback about the Daily Hukamnama portal.
          </p>
        </div>
      </section>

      {/* Standard Page Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gold-200/90">
          {page.content ? (
            <div 
              className="rich-text-content prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }}
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
