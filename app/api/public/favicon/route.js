import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const settings = await getPublicSettings();
    const faviconUrl = settings.favicon || '/logo.png';
    const destination = new URL(faviconUrl, request.url);
    return NextResponse.redirect(destination, 307);
  } catch (err) {
    const fallback = new URL('/logo.png', request.url);
    return NextResponse.redirect(fallback, 307);
  }
}
