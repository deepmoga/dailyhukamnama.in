import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  getPosterPagesForDate, 
  anmolLipiToGurmukhi, 
  forceRegeneratePoster 
} from '@/lib/hukamnama-service';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const rows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, 
              title, gurmukhi_header, shabad_title, ang, raag, author, 
              content_html, gurmukhi_only, punjabi_arth, english_translation, hindi_translation, 
              source_pdf, source_image, views, created_at
       FROM hukamnamas WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Hukamnama not found' }, { status: 404 });
    }

    const h = rows[0];
    h.gurmukhi_header = anmolLipiToGurmukhi(h.gurmukhi_header);
    h.poster_pages = getPosterPagesForDate(h.hukamnama_date, h.source_image);

    return NextResponse.json({ success: true, hukamnama: h });
  } catch (err) {
    console.error('Error fetching hukamnama by ID:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      hukamnama_date,
      title,
      ang,
      raag,
      author,
      gurmukhi_header,
      shabad_title,
      gurmukhi_only,
      punjabi_arth,
      english_translation,
      hindi_translation,
      content_html,
      regenerate_poster = false,
    } = body;

    if (!hukamnama_date) {
      return NextResponse.json({ error: 'Hukamnama date is required' }, { status: 400 });
    }

    const cleanDate = String(hukamnama_date).split('T')[0].trim();

    await query(
      `UPDATE hukamnamas SET
        hukamnama_date = ?,
        title = ?,
        ang = ?,
        raag = ?,
        author = ?,
        gurmukhi_header = ?,
        shabad_title = ?,
        gurmukhi_only = ?,
        punjabi_arth = ?,
        english_translation = ?,
        hindi_translation = ?,
        content_html = ?
       WHERE id = ?`,
      [
        cleanDate,
        title || `Daily Hukamnama Sri Darbar Sahib – ${cleanDate}`,
        ang ? String(ang).trim() : null,
        raag || null,
        author || null,
        gurmukhi_header ? anmolLipiToGurmukhi(gurmukhi_header) : null,
        shabad_title || null,
        gurmukhi_only || null,
        punjabi_arth || null,
        english_translation || null,
        hindi_translation || null,
        content_html || null,
        id,
      ]
    );

    let posterResult = null;
    if (regenerate_poster) {
      try {
        posterResult = await forceRegeneratePoster(cleanDate);
      } catch (postErr) {
        console.warn('Poster regeneration warning after manual edit:', postErr.message);
      }
    }

    const updatedRows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, 
              title, gurmukhi_header, shabad_title, ang, raag, author, 
              content_html, gurmukhi_only, punjabi_arth, english_translation, hindi_translation, 
              source_pdf, source_image, views, created_at
       FROM hukamnamas WHERE id = ? LIMIT 1`,
      [id]
    );

    const updated = updatedRows[0];
    if (updated) {
      updated.gurmukhi_header = anmolLipiToGurmukhi(updated.gurmukhi_header);
      updated.poster_pages = getPosterPagesForDate(updated.hukamnama_date, updated.source_image);
    }

    return NextResponse.json({
      success: true,
      message: 'Hukamnama updated successfully!',
      hukamnama: updated,
      posterResult,
    });
  } catch (err) {
    console.error('Error updating hukamnama:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query('DELETE FROM hukamnamas WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Hukamnama deleted successfully' });
  } catch (err) {
    console.error('Error deleting hukamnama:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
