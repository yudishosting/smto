import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sql = getDb();
  const students = await sql`
    SELECT id, name, nis, position, photo_url
    FROM students
    ORDER BY CASE position
      WHEN 'Wali Kelas' THEN 1
      WHEN 'Ketua' THEN 2
      WHEN 'Wakil Ketua' THEN 3
      WHEN 'Sekretaris' THEN 4
      WHEN 'Bendahara' THEN 5
      ELSE 6
    END, name
  `;
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { name, nis, position, photo_url } = await req.json();
    if (!name || !nis) return NextResponse.json({ error: 'Nama dan NIS wajib diisi' }, { status: 400 });
    const sql = getDb();
    const existing = await sql`SELECT id FROM students WHERE nis = ${nis}`;
    if (existing.length > 0) return NextResponse.json({ error: 'NIS sudah digunakan' }, { status: 400 });
    const student = await sql`
      INSERT INTO students (name, nis, position, photo_url)
      VALUES (${name}, ${nis}, ${position || 'Anggota'}, ${photo_url || null})
      RETURNING *
    `;
    return NextResponse.json(student[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
