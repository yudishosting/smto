-- Tabel galeri/kegiatan kelas dengan foto
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  photo_url TEXT NOT NULL,
  event_date DATE,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
