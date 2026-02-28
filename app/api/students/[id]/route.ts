import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, nis, position, photo_url } = await req.json();
  const id = parseInt(params.id);
  const sql = getDb();
  const result = await sql`UPDATE students SET name = ${name}, nis = ${nis}, position = ${position}, photo_url = ${photo_url || null} WHERE id = ${id} RETURNING *`;
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = parseInt(params.id);
  const sql = getDb();
  const student = await sql`SELECT user_id FROM students WHERE id = ${id}`;
  if (student.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await sql`DELETE FROM students WHERE id = ${id}`;
  if (student[0].user_id) await sql`DELETE FROM users WHERE id = ${student[0].user_id}`;
  return NextResponse.json({ success: true });
}
