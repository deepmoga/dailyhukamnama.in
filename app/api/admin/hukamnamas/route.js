import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getPosterPagesForDate, anmolLipiToGurmukhi } from '@/lib/hukamnama-service';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const search = (searchParams.get('search') || '').trim();
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = `WHERE title LIKE ? OR ang LIKE ? OR raag LIKE ? OR author LIKE ? OR shabad_title LIKE ? OR DATE_FORMAT(hukamnama_date, '%Y-%m-%d') LIKE ?`;
      const term = `%${search}%`;
      params = [term, term, term, term, term, term];
    }

    const countRows = await query(
      `SELECT COUNT(*) as total FROM hukamnamas ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const listParams = [...params, limit, offset];
    const rows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, 
              title, gurmukhi_header, shabad_title, ang, raag, author, 
              source_image, views, created_at
       FROM hukamnamas 
       ${whereClause}
       ORDER BY hukamnama_date DESC, id DESC 
       LIMIT ? OFFSET ?`,
      listParams
    );

    const formatted = (rows || []).map((h) => {
      return {
        ...h,
        gurmukhi_header: anmolLipiToGurmukhi(h.gurmukhi_header),
        poster_pages: getPosterPagesForDate(h.hukamnama_date, h.source_image),
      };
    });

    return NextResponse.json({
      success: true,
      hukamnamas: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error('Error fetching admin hukamnamas:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
