import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const schedules = await sql`
    SELECT sc.id, sc.day, sc.start_time, sc.end_time, s.name as subject
    FROM schedules sc
    JOIN subjects s ON sc.subject_id = s.id
    ORDER BY CASE sc.day WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 END, sc.start_time
  `;
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { subject_id, day, start_time, end_time } = await req.json();
  const sql = getDb();
  const result = await sql`INSERT INTO schedules (subject_id, day, start_time, end_time) VALUES (${subject_id}, ${day}, ${start_time}, ${end_time}) RETURNING *`;
  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM schedules WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
