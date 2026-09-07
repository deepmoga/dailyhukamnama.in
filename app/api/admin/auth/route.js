import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, name FROM admin_users WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0 || rows[0].password_hash !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const admin = rows[0];

    // Simple secure cookie payload
    const sessionToken = Buffer.from(
      JSON.stringify({ id: admin.id, username: admin.username, name: admin.name, ts: Date.now() })
    ).toString('base64');

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: { id: admin.id, username: admin.username, name: admin.name },
    });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    return NextResponse.json({ authenticated: true, user: session });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
