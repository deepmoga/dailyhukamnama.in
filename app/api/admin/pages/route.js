import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = 'SELECT id, title, slug, meta_title, meta_desc, meta_keywords, page_type, author, punjabi_title, audio_url, related_buttons, show_in_menu, sort_order, created_at, updated_at FROM pages';
    const params = [];

    const conditions = [];
    if (type && type !== 'all') {
      conditions.push('page_type = ?');
      params.push(type);
    }
    if (search) {
      conditions.push('(title LIKE ? OR slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (type === 'path' || type === 'sikh_guru') {
      query += ' ORDER BY sort_order ASC, id ASC';
    } else {
      query += ' ORDER BY sort_order ASC, id DESC';
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, pages: rows });
  } catch (err) {
    console.error('Fetch pages error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    let { 
      title, slug, content, meta_title, meta_desc, meta_keywords, 
      page_type, author, punjabi_title, audio_url, related_buttons,
      show_in_menu, sort_order
    } = data;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Check slug uniqueness
    const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const buttonsJson = related_buttons 
      ? (typeof related_buttons === 'string' ? related_buttons : JSON.stringify(related_buttons))
      : null;

    const menuFlag = show_in_menu !== undefined && show_in_menu !== null ? (show_in_menu ? 1 : 0) : 1;
    const orderVal = sort_order !== undefined && sort_order !== null && !isNaN(parseInt(sort_order, 10))
      ? parseInt(sort_order, 10) 
      : 0;

    const [result] = await pool.query(
      `INSERT INTO pages (title, slug, content, meta_title, meta_desc, meta_keywords, page_type, author, punjabi_title, audio_url, related_buttons, show_in_menu, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        menuFlag,
        orderVal,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      slug,
      message: 'Page created successfully',
    });
  } catch (err) {
    console.error('Create page error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
