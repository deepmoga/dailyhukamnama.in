import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { storeVolunteerApplication } from '@/lib/settings-service';
import { sendVolunteerNotification } from '@/lib/email-service';
import { verifyCaptcha } from '@/lib/recaptcha';

export const dynamic = 'force-dynamic';

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, city, sevaArea, message, captchaToken } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    // Verify reCAPTCHA token if configured
    const captchaResult = await verifyCaptcha(captchaToken, ip);
    if (!captchaResult.success) {
      return NextResponse.json({ error: captchaResult.error }, { status: 400 });
    }

    // Store in volunteer_applications table
    const applicationId = await storeVolunteerApplication({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      city: (city || '').trim(),
      sevaArea: (sevaArea || 'General').trim(),
      message: (message || '').trim(),
      ip,
    });

    // Send Google SMTP notification
    const emailResult = await sendVolunteerNotification({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      city: (city || '').trim(),
      sevaArea: (sevaArea || 'General').trim(),
      message: (message || '').trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Dhanvaad Ji! Your volunteer application has been received. Our team will contact you shortly.',
      applicationId,
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error('Volunteer application error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your application. Please try again.' },
      { status: 500 }
    );
  }
}
