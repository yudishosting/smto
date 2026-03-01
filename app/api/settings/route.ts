import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  const defaults: Record<string,string> = {
    break_start: '11:00',
    break_end: '13:00',
    break_label: 'Istirahat',
    break_slot: '5',
    total_slots: '8',
  };
  for (const [key, value] of Object.entries(defaults)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
  }
  const rows = await sql`SELECT key, value FROM settings`;
  const result: Record<string, string> = {};
  for (const row of rows as Array<{ key: string; value: string }>) {
    result[row.key] = row.value;
  }
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  for (const [key, value] of Object.entries(body)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value as string})
      ON CONFLICT (key) DO UPDATE SET value = ${value as string}, updated_at = NOW()`;
  }
  return NextResponse.json({ success: true });
}
