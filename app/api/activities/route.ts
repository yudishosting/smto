import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const activities = await sql`
    SELECT a.id, a.title, a.description, a.date, a.created_at, u.username as author
    FROM activities a
    LEFT JOIN users u ON a.created_by = u.id
    ORDER BY a.date DESC
  `;
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, description, date } = await req.json();
  const sql = getDb();
  const result = await sql`
    INSERT INTO activities (title, description, date, created_by)
    VALUES (${title}, ${description || null}, ${date}, ${auth.userId})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM activities WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
