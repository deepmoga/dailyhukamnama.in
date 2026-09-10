import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Failed to get public settings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
