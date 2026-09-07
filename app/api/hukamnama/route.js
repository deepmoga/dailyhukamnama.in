import { NextResponse } from 'next/server';
import {
  getLatestHukamnama,
  getHukamnamaByDate,
  getLast5Hukamnamas,
  getMonthHukamnamaDates,
  extractAndStoreHukamnama,
} from '@/lib/hukamnama-service';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    let current = null;
    if (dateParam) {
      current = await getHukamnamaByDate(dateParam);
    }
    
    if (!current) {
      current = await getLatestHukamnama();
    }

    const last5 = await getLast5Hukamnamas();

    const now = new Date();
    const targetYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const targetMonth = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
    const monthDates = await getMonthHukamnamaDates(targetYear, targetMonth);

    return NextResponse.json({
      success: true,
      data: {
        current,
        last5,
        monthDates,
        year: targetYear,
        month: targetMonth,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const result = await extractAndStoreHukamnama();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
