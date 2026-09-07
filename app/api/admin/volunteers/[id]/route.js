import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, volunteer: rows[0] });
  } catch (err) {
    console.error('Get volunteer error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const { name, image, description, sort_order } = data;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await pool.query(
      'UPDATE volunteers SET name = ?, image = ?, description = ?, sort_order = ? WHERE id = ?',
      [name.trim(), image || '', description || '', parseInt(sort_order) || 0, id]
    );

    return NextResponse.json({ success: true, message: 'Volunteer updated successfully' });
  } catch (err) {
    console.error('Update volunteer error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await pool.query('DELETE FROM volunteers WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (err) {
    console.error('Delete volunteer error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
