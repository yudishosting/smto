import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Public endpoint - no auth required
  const sql = getDb();
  const announcements = await sql`
    SELECT a.id, a.title, a.content, a.created_at, u.username as author
    FROM announcements a
    LEFT JOIN users u ON a.created_by = u.id
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, content } = await req.json();
  const sql = getDb();
  const result = await sql`
    INSERT INTO announcements (title, content, created_by)
    VALUES (${title}, ${content}, ${auth.userId})
    RETURNING *
  `;
  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
