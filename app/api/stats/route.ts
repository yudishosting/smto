import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sql = getDb();
  const [students, subjects, announcements, activities] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM students`,
    sql`SELECT COUNT(*) as count FROM subjects`,
    sql`SELECT COUNT(*) as count FROM announcements`,
    sql`SELECT COUNT(*) as count FROM activities`,
  ]);
  return NextResponse.json({
    students: students[0].count,
    subjects: subjects[0].count,
    announcements: announcements[0].count,
    activities: activities[0].count,
  });
}
