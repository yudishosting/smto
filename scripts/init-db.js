// scripts/init-db.js
// Run with: node scripts/init-db.js
// Make sure DATABASE_URL is set in .env

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function initDB() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      nis VARCHAR(20) UNIQUE NOT NULL,
      position VARCHAR(50) DEFAULT 'Anggota',
      photo_url TEXT,
      user_id INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      subject_id INT REFERENCES subjects(id),
      day VARCHAR(20) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      content TEXT NOT NULL,
      created_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Insert default admin
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  await sql`
    INSERT INTO users (username, password, role)
    VALUES ('admin', ${adminPassword}, 'admin')
    ON CONFLICT (username) DO NOTHING
  `;

  // Insert sample subjects
  const subjects = [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Ilmu Pengetahuan Alam (IPA)',
    'Ilmu Pengetahuan Sosial (IPS)',
    'Seni Budaya',
    'Pendidikan Jasmani',
    'Prakarya',
  ];

  for (const subject of subjects) {
    await sql`
      INSERT INTO subjects (name)
      VALUES (${subject})
      ON CONFLICT DO NOTHING
    `;
  }

  // Insert sample schedules
  const scheduleData = [
    { subject: 'Bahasa Indonesia', day: 'Senin', start: '08:00', end: '09:00' },
    { subject: 'Bahasa Inggris', day: 'Senin', start: '09:00', end: '10:00' },
    { subject: 'Matematika', day: 'Senin', start: '10:00', end: '11:00' },
    { subject: 'Ilmu Pengetahuan Alam (IPA)', day: 'Senin', start: '13:00', end: '15:00' },
    { subject: 'Ilmu Pengetahuan Sosial (IPS)', day: 'Selasa', start: '09:00', end: '10:00' },
    { subject: 'Seni Budaya', day: 'Rabu', start: '10:00', end: '11:00' },
    { subject: 'Pendidikan Jasmani', day: 'Kamis', start: '13:00', end: '15:00' },
    { subject: 'Prakarya', day: 'Jumat', start: '08:00', end: '09:00' },
  ];

  for (const s of scheduleData) {
    const subjectResult = await sql`SELECT id FROM subjects WHERE name = ${s.subject} LIMIT 1`;
    if (subjectResult.length > 0) {
      await sql`
        INSERT INTO schedules (subject_id, day, start_time, end_time)
        VALUES (${subjectResult[0].id}, ${s.day}, ${s.start}, ${s.end})
      `;
    }
  }

  console.log('✅ Database initialized successfully!');
  console.log('Admin credentials: username=admin, password=admin123');
}

initDB().catch(console.error);
