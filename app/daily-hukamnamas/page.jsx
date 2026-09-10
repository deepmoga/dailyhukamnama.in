import HomeClient from '@/components/HomeClient';
import {
  getLatestHukamnama,
  getLast5Hukamnamas,
  getMonthHukamnamaDates,
} from '@/lib/hukamnama-service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Daily Hukamnama Sri Darbar Sahib Amritsar | ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ',
  description: 'Read and listen to Daily Hukamnama Sahib from Sachkhand Sri Harmandir Sahib (Golden Temple) Amritsar with Gurmukhi, Punjabi Viakhya, Hindi and English translation.',
};

export default async function DailyHukamnamasPage() {
  const current = await getLatestHukamnama();
  const last5 = await getLast5Hukamnamas();

  const now = new Date();
  const monthDates = await getMonthHukamnamaDates(now.getFullYear(), now.getMonth() + 1);

  const initialData = {
    current: current ? JSON.parse(JSON.stringify(current)) : null,
    last5: last5 ? JSON.parse(JSON.stringify(last5)) : [],
    monthDates: monthDates || [],
  };

  return <HomeClient initialData={initialData} />;
}
