# 🎓 School App - Sistem Informasi Kelas

Aplikasi manajemen kelas digital berbasis Next.js yang siap deploy ke **Vercel** dengan database **Neon (PostgreSQL)**.

## ✨ Fitur

- 🔐 **Login Admin & Siswa** — Autentikasi berbasis JWT
- 👥 **Manajemen Siswa** — CRUD siswa + buat akun login otomatis
- 📅 **Jadwal Pelajaran** — Kelola jadwal per hari
- 📢 **Pengumuman** — Admin buat, siswa lihat
- 🎯 **Kegiatan** — Jadwal kegiatan kelas
- 📊 **Dashboard Admin** — Statistik dan grafik
- 📱 **Responsive** — Mobile-friendly

---

## 🚀 Setup & Deploy

### 1. Clone & Install

```bash
git clone <repo-url>
cd school-app
npm install
```

### 2. Setup Database (Neon)

1. Daftar di [neon.tech](https://neon.tech) (gratis)
2. Buat project baru
3. Copy **Connection String** dari dashboard

### 3. Environment Variables

Buat file `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=ganti-ini-dengan-string-random-panjang
```

### 4. Inisialisasi Database

```bash
npm run db:init
```

Ini akan membuat semua tabel dan data awal.

**Default Admin:** `username: admin` | `password: admin123`

### 5. Jalankan Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy ke Vercel

### Cara 1: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Cara 2: Via GitHub
1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import Project
3. Pilih repo GitHub kamu
4. Tambahkan **Environment Variables**:
   - `DATABASE_URL` → Connection string dari Neon
   - `JWT_SECRET` → String random panjang (minimal 32 karakter)
5. Klik **Deploy**

### Cara 3: Vercel + Neon Integration
1. Di Vercel dashboard → Storage → Add Neon Database
2. Neon otomatis set `DATABASE_URL`
3. Jalankan `npm run db:init` setelah deploy pertama

---

## 📁 Struktur Project

```
school-app/
├── app/
│   ├── api/
│   │   ├── auth/login/     # POST login
│   │   ├── auth/logout/    # POST logout
│   │   ├── students/       # GET, POST, PUT, DELETE
│   │   ├── schedules/      # GET, POST, DELETE
│   │   ├── announcements/  # GET, POST, DELETE
│   │   ├── activities/     # GET, POST, DELETE
│   │   ├── subjects/       # GET, POST
│   │   └── stats/          # GET (admin only)
│   ├── admin/              # Admin panel (protected)
│   │   ├── page.tsx        # Dashboard
│   │   ├── students/       # Manajemen siswa
│   │   ├── schedules/      # Manajemen jadwal
│   │   ├── announcements/  # Manajemen pengumuman
│   │   └── activities/     # Manajemen kegiatan
│   ├── student/            # Halaman siswa
│   ├── login/              # Halaman login
│   └── globals.css
├── components/
│   └── AdminSidebar.tsx
├── lib/
│   ├── auth.ts             # JWT utilities
│   └── db.ts               # Database connection
└── scripts/
    └── init-db.js          # Database setup
```

---

## 👤 Role & Akses

| Fitur | Admin | Siswa |
|-------|-------|-------|
| Dashboard statistik | ✅ | ❌ |
| CRUD Siswa | ✅ | ❌ |
| CRUD Jadwal | ✅ | ❌ |
| CRUD Pengumuman | ✅ | ❌ |
| CRUD Kegiatan | ✅ | ❌ |
| Lihat Siswa | ✅ | ✅ |
| Lihat Jadwal | ✅ | ✅ |
| Lihat Pengumuman | ✅ | ✅ |
| Lihat Kegiatan | ✅ | ✅ |

---

## 🔒 Keamanan

- Password di-hash dengan **bcrypt** (salt rounds: 10)
- Autentikasi via **JWT** disimpan di HttpOnly cookie
- API routes dilindungi middleware autentikasi
- Role-based access control (Admin vs Student)

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Neon PostgreSQL (Serverless)
- **Auth:** JWT + bcrypt
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Fonts:** Sora + Plus Jakarta Sans
- **Hosting:** Vercel

---

## 📝 Customization

### Ganti Nama Kelas
Di `app/student/page.tsx`, ubah:
```tsx
const [className] = useState('Kelas 9A');
```

### Tambah Jabatan
Di `app/admin/students/page.tsx`, ubah array `positions`:
```tsx
const positions = ['Ketua', 'Sekretaris', 'Bendahara', 'Wakil Ketua', 'Anggota'];
```

### Ganti Nama Sekolah
Di `app/student/page.tsx`, ubah:
```tsx
<p className="text-blue-200 text-sm">SMPN 1 · Tahun Ajaran 2025/2026</p>
```
