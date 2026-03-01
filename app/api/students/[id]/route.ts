import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, nis, position, photo_url } = await req.json();
  const sql = getDb();
  const result = await sql`
    UPDATE students SET name=${name}, nis=${nis}, position=${position}, photo_url=${photo_url||null}
    WHERE id=${params.id} RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  await sql`DELETE FROM students WHERE id=${params.id}`;
  return NextResponse.json({ success: true });
}
