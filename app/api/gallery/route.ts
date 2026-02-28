import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const items = await sql`
    SELECT g.id, g.title, g.description, g.photo_url, g.event_date, g.created_at, u.username as author
    FROM gallery g
    LEFT JOIN users u ON g.created_by = u.id
    ORDER BY g.event_date DESC, g.created_at DESC
  `;
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, description, photo_url, event_date } = await req.json();
  if (!title || !photo_url) return NextResponse.json({ error: 'Title dan foto wajib' }, { status: 400 });
  const sql = getDb();
  const result = await sql`
    INSERT INTO gallery (title, description, photo_url, event_date, created_by)
    VALUES (${title}, ${description||null}, ${photo_url}, ${event_date||null}, ${auth.userId})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM gallery WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
