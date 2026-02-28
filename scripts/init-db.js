const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_nPkZXqENy2I9@ep-dawn-math-aidqyj66-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function initDB() {
  const sql = neon(DATABASE_URL);
  console.log('Creating/updating tables...');

  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'student',
    display_name VARCHAR(200), created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, nis VARCHAR(20) UNIQUE NOT NULL,
    position VARCHAR(50) DEFAULT 'Anggota', photo_url TEXT,
    user_id INT REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY, subject_id INT REFERENCES subjects(id),
    day VARCHAR(20) NOT NULL, start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL, created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY, title VARCHAR(300) NOT NULL, content TEXT NOT NULL,
    created_by INT REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY, title VARCHAR(300) NOT NULL, description TEXT,
    date DATE NOT NULL, is_archived BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Add is_archived column if not exists
  try {
    await sql`ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE`;
  } catch(e) {}

  // Add display_name to users if not exists  
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(200)`;
  } catch(e) {}

  const bcrypt = require('bcryptjs');
  
  // Admin
  const adminPw = await bcrypt.hash('admin123', 10);
  await sql`INSERT INTO users (username, password, role, display_name) VALUES ('admin', ${adminPw}, 'admin', 'Administrator') ON CONFLICT (username) DO NOTHING`;

  // Wali Kelas default
  const waliPw = await bcrypt.hash('walikelas123', 10);
  await sql`INSERT INTO users (username, password, role, display_name) VALUES ('walikelas', ${waliPw}, 'walikelas', 'Wali Kelas XI TSM 2') ON CONFLICT (username) DO NOTHING`;

  console.log('✅ Done!');
  console.log('Admin: admin / admin123');
  console.log('Wali Kelas: walikelas / walikelas123');
}

initDB().catch(console.error);
