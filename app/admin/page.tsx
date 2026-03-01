import { redirect } from 'next/navigation';
import { getAuthFromCookies } from '@/lib/auth';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const auth = getAuthFromCookies();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') redirect('/student');

  const sql = getDb();
  let stats = { students: 0, announcements: 0, schedules: 0, activities: 0 };
  try {
    const [s, a, sc, ac] = await Promise.all([
      sql`SELECT COUNT(*) as c FROM students`,
      sql`SELECT COUNT(*) as c FROM announcements`,
      sql`SELECT COUNT(*) as c FROM schedules`,
      sql`SELECT COUNT(*) as c FROM activities`,
    ]);
    stats = { students: Number(s[0].c), announcements: Number(a[0].c), schedules: Number(sc[0].c), activities: Number(ac[0].c) };
  } catch {}

  const statCards = [
    { label:'Total Siswa',    value:stats.students,      icon:'👥', color:'#6366f1' },
    { label:'Pengumuman',     value:stats.announcements, icon:'📢', color:'#3b82f6' },
    { label:'Jadwal Aktif',   value:stats.schedules,     icon:'📅', color:'#8b5cf6' },
    { label:'Kegiatan',       value:stats.activities,    icon:'🎯', color:'#ec4899' },
  ];

  return (
    <div style={{ padding:'16px', fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#fff' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Sora:wght@700;800&display=swap');`}</style>

      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.3}}>Dashboard Admin</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.45)',marginTop:3}}>Selamat datang, {auth.username}!</div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:20}}>
        {statCards.map(s=>(
          <div key={s.label} style={{background:`linear-gradient(135deg,${s.color}20,${s.color}08)`,border:`1px solid ${s.color}30`,borderRadius:18,padding:'16px'}}>
            <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:"'Sora',sans-serif",color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginTop:4,fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Menu Cepat</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {[
          {href:'/admin/students',      label:'Tambah Siswa',       icon:'➕',  desc:'Tambah anggota baru'},
          {href:'/admin/schedules',     label:'Atur Jadwal',        icon:'📅',  desc:'Kelola jadwal pelajaran'},
          {href:'/admin/announcements', label:'Buat Pengumuman',    icon:'📢',  desc:'Info untuk kelas'},
          {href:'/admin/activities',    label:'Tambah Kegiatan',    icon:'🎯',  desc:'Event dan acara kelas'},
        ].map(item=>(
          <a key={item.href} href={item.href} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:16,padding:'14px',textDecoration:'none',color:'#fff',display:'block'}}>
            <div style={{fontSize:24,marginBottom:8}}>{item.icon}</div>
            <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{item.label}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)'}}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
