import HomeClient from '@/components/HomeClient';
import {
  getLatestHukamnama,
  getLast5Hukamnamas,
  getMonthHukamnamaDates,
} from '@/lib/hukamnama-service';

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function Page() {
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
