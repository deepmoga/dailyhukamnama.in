import HomeClient from '@/components/HomeClient';
import {
  getLatestHukamnama,
  getLast5Hukamnamas,
  getMonthHukamnamaDates,
  formatDate,
} from '@/lib/hukamnama-service';

export const revalidate = 60; // ISR revalidate every 60 seconds

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
