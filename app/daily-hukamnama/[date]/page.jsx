import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HukamnamaViewer from '@/components/HukamnamaViewer';
import Sidebar from '@/components/Sidebar';
import { getHukamnamaByDate, getLast5Hukamnamas, getMonthHukamnamaDates } from '@/lib/hukamnama-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export async function generateMetadata({ params }) {
  const dateStr = params.date;
  const hukamnama = await getHukamnamaByDate(dateStr);
  if (!hukamnama) return { title: 'Hukamnama Not Found' };

  const description = hukamnama.meta_desc || `Read the Daily Hukamnama from Sri Darbar Sahib, Amritsar for ${dateStr} with Gurmukhi text, Punjabi Viakhya, English, and Hindi translations.`;
  const keywords = hukamnama.meta_keywords || `daily hukamnama, golden temple hukamnama, sri darbar sahib mukhwak, ${dateStr}`;
  const imageAlt = hukamnama.image_alt || hukamnama.title || 'Daily Hukamnama Sri Darbar Sahib Amritsar';
  const imageUrl = hukamnama.source_image || '/slider1.jpg';

  return {
    title: `${hukamnama.title} | Sri Darbar Sahib Amritsar`,
    description,
    keywords,
    openGraph: {
      title: hukamnama.title,
      description,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: hukamnama.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DailyHukamnamaDatePage({ params }) {
  const dateStr = params.date;
  const hukamnama = await getHukamnamaByDate(dateStr);
  const last5 = await getLast5Hukamnamas();

  if (!hukamnama) {
    notFound();
  }

  const d = new Date(dateStr);
  const monthDates = await getMonthHukamnamaDates(d.getFullYear(), d.getMonth() + 1);

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-slate-900 text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-gold-500/30">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs">
          <Link href="/" className="text-gold-400 hover:underline flex items-center space-x-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span className="text-slate-500">/</span>
          <Link href="/daily-hukamnamas" className="text-slate-300 hover:text-white">
            Archives
          </Link>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{dateStr}</span>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 8 Column Main View */}
          <div className="lg:col-span-8">
            <HukamnamaViewer 
              hukamnama={JSON.parse(JSON.stringify(hukamnama))} 
              loading={false} 
            />
          </div>

          {/* 4 Column Sidebar */}
          <div className="lg:col-span-4">
            <Sidebar
              last5Hukamnamas={JSON.parse(JSON.stringify(last5))}
              monthDates={monthDates}
              selectedDate={dateStr}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
