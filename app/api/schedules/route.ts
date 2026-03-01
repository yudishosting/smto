import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Public endpoint - no auth required
  const sql = getDb();

  // Add teacher column if not exists
  try { await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS teacher VARCHAR(200)`; } catch {}

  const schedules = await sql`
    SELECT sc.id, sc.day, sc.start_time, sc.end_time, sc.slot_number,
           s.name as subject, s.teacher
    FROM schedules sc
    JOIN subjects s ON sc.subject_id = s.id
    ORDER BY CASE sc.day WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 END, sc.slot_number, sc.start_time
  `;
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { subject_id, day, start_time, end_time, slot_number } = await req.json();
  const sql = getDb();

  try { await sql`ALTER TABLE schedules ADD COLUMN IF NOT EXISTS slot_number INT`; } catch {}

  const result = await sql`
    INSERT INTO schedules (subject_id, day, start_time, end_time, slot_number)
    VALUES (${subject_id}, ${day}, ${start_time}, ${end_time}, ${slot_number || null})
    RETURNING *
  `;
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
