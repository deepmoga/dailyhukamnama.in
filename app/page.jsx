import HomeClient from '@/components/HomeClient';
import {
  getLatestHukamnama,
  getLast5Hukamnamas,
  getMonthHukamnamaDates,
  formatDate,
} from '@/lib/hukamnama-service';

export const revalidate = 60; // ISR revalidate every 60 seconds

export async function generateMetadata() {
  const current = await getLatestHukamnama();
  if (!current) {
    return {
      title: 'Daily Hukamnama Sri Darbar Sahib Amritsar Today',
      description: 'Read today’s Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib Amritsar with Gurmukhi, Punjabi Viakhya, Hindi, and English translations.',
    };
  }

  const description = current.meta_desc || `Read today’s Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib Amritsar with Gurmukhi, Punjabi Viakhya, Hindi, and English translations.`;
  const keywords = current.meta_keywords || 'daily hukamnama, golden temple hukamnama, darbar sahib mukhwak, harmandir sahib';
  const imageAlt = current.image_alt || current.title || 'Daily Hukamnama Sri Darbar Sahib Amritsar';
  const imageUrl = current.source_image || '/slider1.jpg';

  return {
    title: `${current.title || 'Daily Hukamnama'} | Sri Darbar Sahib Amritsar`,
    description,
    keywords,
    openGraph: {
      title: current.title,
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
      title: current.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page() {
  const current = await getLatestHukamnama();
  const last5 = await getLast5Hukamnamas();

  const todayIst = formatDate(new Date());
  const [istYear, istMonth] = todayIst.split('-').map(Number);
  const monthDates = await getMonthHukamnamaDates(istYear, istMonth);

  const initialData = {
    current: current ? JSON.parse(JSON.stringify(current)) : null,
    last5: last5 ? JSON.parse(JSON.stringify(last5)) : [],
    monthDates: monthDates || [],
  };

  return <HomeClient initialData={initialData} />;
}
