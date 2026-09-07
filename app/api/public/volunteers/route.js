import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM volunteers';
    let dataQuery = 'SELECT * FROM volunteers';
    const params = [];

    if (search.trim()) {
      const condition = ' WHERE name LIKE ? OR description LIKE ?';
      countQuery += condition;
      dataQuery += condition;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    dataQuery += ' ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?';

    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const dataParams = [...params, limit, offset];
    const [rows] = await pool.query(dataQuery, dataParams);

    return NextResponse.json({
      success: true,
      volunteers: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Public volunteers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
