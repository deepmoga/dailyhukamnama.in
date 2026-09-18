import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  getPosterPagesForDate, 
  anmolLipiToGurmukhi, 
  forceRegeneratePoster,
  generateHukamnamaSeoMetadata 
} from '@/lib/hukamnama-service';

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

export async function POST(request) {
  try {
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
      source_image,
      meta_desc,
      meta_keywords,
      image_alt,
      generate_poster = false,
    } = body;

    if (!hukamnama_date) {
      return NextResponse.json({ error: 'Hukamnama date is required' }, { status: 400 });
    }

    const cleanDate = String(hukamnama_date).split('T')[0].trim();

    // Check if a Hukamnama already exists for this date
    const existing = await query(
      "SELECT id FROM hukamnamas WHERE DATE_FORMAT(hukamnama_date, '%Y-%m-%d') = ? LIMIT 1",
      [cleanDate]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({
        error: `A Hukamnama already exists for date ${cleanDate} (ID #${existing[0].id}). You can edit it from the directory list.`,
        existingId: existing[0].id,
      }, { status: 409 });
    }

    // Auto-generate fallback SEO if empty
    const fallbackSeo = generateHukamnamaSeoMetadata({
      dateStr: cleanDate,
      ang,
      raag,
      author,
    });

    const finalMetaDesc = meta_desc !== undefined && meta_desc !== null && meta_desc !== '' ? meta_desc : fallbackSeo.metaDesc;
    const finalMetaKeywords = meta_keywords !== undefined && meta_keywords !== null && meta_keywords !== '' ? meta_keywords : fallbackSeo.metaKeywords;
    const finalImageAlt = image_alt !== undefined && image_alt !== null && image_alt !== '' ? image_alt : fallbackSeo.imageAlt;
    const finalTitle = title || `Daily Hukamnama Sri Darbar Sahib – ${cleanDate}`;

    const insertResult = await query(
      `INSERT INTO hukamnamas (
        hukamnama_date, title, ang, raag, author, gurmukhi_header,
        shabad_title, gurmukhi_only, punjabi_arth, english_translation,
        hindi_translation, content_html, source_image, meta_desc,
        meta_keywords, image_alt, views
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        cleanDate,
        finalTitle,
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
        source_image || null,
        finalMetaDesc,
        finalMetaKeywords,
        finalImageAlt,
      ]
    );

    let posterResult = null;
    if (generate_poster) {
      try {
        posterResult = await forceRegeneratePoster(cleanDate);
      } catch (postErr) {
        console.warn('Poster generation warning on create:', postErr.message);
        posterResult = { success: false, error: postErr.message };
      }
    }

    return NextResponse.json({
      success: true,
      id: insertResult.insertId,
      posterResult,
      message: 'Hukamnama created successfully!',
    });
  } catch (err) {
    console.error('Error creating hukamnama:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

