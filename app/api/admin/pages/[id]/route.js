import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page: rows[0] });
  } catch (err) {
    console.error('Get page error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    let { title, slug, content, meta_title, meta_desc, meta_keywords, page_type, author, punjabi_title, audio_url, related_buttons } = data;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
      // Check slug uniqueness excluding current id
      const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Slug already exists. Please choose a unique slug.' }, { status: 400 });
      }
    }

    const buttonsJson = related_buttons 
      ? (typeof related_buttons === 'string' ? related_buttons : JSON.stringify(related_buttons))
      : null;

    await pool.query(
      `UPDATE pages 
       SET title = ?, slug = ?, content = ?, meta_title = ?, meta_desc = ?, meta_keywords = ?, page_type = ?, author = ?, punjabi_title = ?, audio_url = ?, related_buttons = ?
       WHERE id = ?`,
      [
        title,
        slug,
        content || '',
        meta_title || title,
        meta_desc || '',
        meta_keywords || '',
        page_type || 'page',
        author || null,
        punjabi_title || null,
        audio_url || null,
        buttonsJson,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Page updated successfully' });
  } catch (err) {
    console.error('Update page error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await pool.query('DELETE FROM pages WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (err) {
    console.error('Delete page error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
