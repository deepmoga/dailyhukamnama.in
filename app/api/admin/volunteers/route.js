import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = 'SELECT * FROM volunteers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY sort_order ASC, id ASC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, volunteers: rows });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, image, description, sort_order } = data;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO volunteers (name, image, description, sort_order) VALUES (?, ?, ?, ?)',
      [name.trim(), image || '', description || '', parseInt(sort_order) || 0]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Volunteer added successfully',
    });
  } catch (err) {
    console.error('Add volunteer error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
