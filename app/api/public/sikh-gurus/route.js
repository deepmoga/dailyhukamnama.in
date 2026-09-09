import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, slug, punjabi_title, author, sort_order FROM pages WHERE page_type = 'sikh_guru' AND show_in_menu = 1 ORDER BY sort_order ASC, id ASC"
    );
    return NextResponse.json({ success: true, gurus: rows });
  } catch (err) {
    console.error('Error fetching public sikh gurus:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
