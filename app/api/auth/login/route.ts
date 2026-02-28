import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getDb from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    const sql = getDb();
    const users = await sql`SELECT id, username, password, role FROM users WHERE username = ${username} LIMIT 1`;
    if (users.length === 0) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    const user = users[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    const token = signToken({ userId: user.id, username: user.username, role: user.role });
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
