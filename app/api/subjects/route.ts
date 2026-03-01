import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  try { await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher VARCHAR(200)`; } catch {}
  const subjects = await sql`SELECT id, name, teacher FROM subjects ORDER BY name`;
  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, teacher } = await req.json();
  const sql = getDb();
  try { await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher VARCHAR(200)`; } catch {}
  const result = await sql`INSERT INTO subjects (name, teacher) VALUES (${name}, ${teacher||null}) RETURNING *`;
  return NextResponse.json(result[0], { status: 201 });
}
