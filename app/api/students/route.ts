import { NextResponse } from 'next/server';
import { getAuthFromCookies, hashPassword } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Public endpoint - no auth required
  const sql = getDb();
  const students = await sql`
    SELECT s.id, s.name, s.nis, s.position, s.photo_url, u.username
    FROM students s
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.id
  `;
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { name, nis, position, photo_url, username, password } = await req.json();
    if (!name || !nis || !username || !password) return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 });
    const sql = getDb();
    const existing = await sql`SELECT id FROM students WHERE nis = ${nis}`;
    if (existing.length > 0) return NextResponse.json({ error: 'NIS sudah digunakan' }, { status: 400 });
    const hashedPw = await hashPassword(password);
    const userResult = await sql`INSERT INTO users (username, password, role) VALUES (${username}, ${hashedPw}, 'student') RETURNING id`;
    const userId = userResult[0].id;
    const student = await sql`INSERT INTO students (name, nis, position, photo_url, user_id) VALUES (${name}, ${nis}, ${position || 'Anggota'}, ${photo_url || null}, ${userId}) RETURNING *`;
    return NextResponse.json(student[0], { status: 201 });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === '23505') return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
