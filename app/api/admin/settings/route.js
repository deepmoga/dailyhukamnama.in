import { NextResponse } from 'next/server';
import { getAllSettings, updateSettings } from '@/lib/settings-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Failed to get admin settings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const updated = await updateSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully!',
      settings: updated,
    });
  } catch (err) {
    console.error('Failed to update admin settings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
