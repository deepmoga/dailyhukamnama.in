import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ?', [slug]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page: rows[0] });
  } catch (err) {
    console.error('Public page error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
