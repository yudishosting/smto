'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'ringkasan' | 'siswa' | 'jadwal' | 'pengumuman' | 'kegiatan';

interface Student { id: number; name: string; nis: string; position: string; photo_url: string | null; }
interface Schedule { id: number; day: string; start_time: string; end_time: string; subject: string; }
interface Announcement { id: number; title: string; content: string; author: string; created_at: string; }
interface Activity { id: number; title: string; description: string; date: string; }

const positionColor: Record<string, string> = {
  Ketua: '#3b82f6', Sekretaris: '#8b5cf6', Bendahara: '#f59e0b', Anggota: '#10b981',
};
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function StudentPage() {
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => Array.isArray(d) ? setStudents(d) : null);
    fetch('/api/schedules').then(r => r.json()).then(d => Array.isArray(d) ? setSchedules(d) : null);
    fetch('/api/announcements').then(r => r.json()).then(d => Array.isArray(d) ? setAnnouncements(d) : null);
    fetch('/api/activities').then(r => r.json()).then(d => Array.isArray(d) ? setActivities(d) : null);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );
  const pengurus = students.filter(s => ['Ketua','Sekretaris','Bendahara'].includes(s.position));
  const allTimes = Array.from(new Set<string>(schedules.map(s => s.start_time))).sort();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'ringkasan', label: 'Ringkasan', icon: '🏠' },
    { key: 'siswa', label: 'Siswa', icon: '👥' },
    { key: 'jadwal', label: 'Jadwal', icon: '📅' },
    { key: 'pengumuman', label: 'Pengumuman', icon: '📢' },
    { key: 'kegiatan', label: 'Kegiatan', icon: '🎯' },
  ];

  const s: Record<string, React.CSSProperties> = {
    root: { minHeight:'100vh', background:'#f0f4ff', fontFamily:"'Plus Jakarta Sans',sans-serif" },
    header: { background:'linear-gradient(135deg,#1d4ed8 0%,#4338ca 100%)', padding:'16px', position:'sticky' as const, top:0, zIndex:50 },
    headerInner: { display:'flex', alignItems:'center', justifyContent:'space-between' },
    logoBox: { display:'flex', alignItems:'center', gap:'10px' },
    logoIcon: { width:'40px', height:'40px', background:'rgba(255,255,255,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 },
    schoolName: { color:'#fff', fontSize:'16px', fontWeight:'800', fontFamily:"'Sora',sans-serif", lineHeight:1.2 },
    schoolSub: { color:'#93c5fd', fontSize:'10px', marginTop:'2px' },
    logoutBtn: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'8px', padding:'6px 12px', color:'#fff', fontSize:'11px', cursor:'pointer', fontFamily:'inherit', fontWeight:'600' },
    tabBar: { background:'#fff', display:'flex', borderBottom:'2px solid #f1f5f9', overflowX:'auto' as const, position:'sticky' as const, top:'72px', zIndex:40, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
    content: { padding:'16px' },
    sectionTitle: { fontSize:'15px', fontWeight:'800', color:'#1e293b', marginBottom:'14px', fontFamily:"'Sora',sans-serif" },
    card: { background:'#fff', borderRadius:'16px', padding:'16px', border:'1px solid #e8eef8', marginBottom:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoBox}>
            <div style={s.logoIcon}>🎓</div>
            <div>
              <div style={s.schoolName}>XI TSM 2</div>
              <div style={s.schoolSub}>SMKN 2 Jember · 2025/2026</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, minWidth:'60px', padding:'10px 4px 8px', border:'none', background:'transparent',
            borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
            color: tab === t.key ? '#2563eb' : '#94a3b8',
            cursor:'pointer', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
            marginBottom:'-2px', transition:'all .15s',
          }}>
            <span style={{fontSize:'18px'}}>{t.icon}</span>
            <span style={{fontSize:'9px', fontWeight:'700', letterSpacing:'0.3px'}}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>

        {/* RINGKASAN */}
        {tab === 'ringkasan' && (
          <div>
            {/* Stats row */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px'}}>
              {[
                {n:students.length, l:'Siswa', bg:'#eff6ff', c:'#2563eb', icon:'👥'},
                {n:announcements.length, l:'Info', bg:'#f5f3ff', c:'#6d28d9', icon:'📢'},
                {n:schedules.length, l:'Jadwal', bg:'#ecfdf5', c:'#059669', icon:'📅'},
                {n:activities.length, l:'Event', bg:'#fffbeb', c:'#b45309', icon:'🎯'},
              ].map(item => (
                <div key={item.l} style={{background:item.bg, borderRadius:'14px', padding:'12px 8px', textAlign:'center'}}>
                  <div style={{fontSize:'14px', marginBottom:'2px'}}>{item.icon}</div>
                  <div style={{fontSize:'20px', fontWeight:'800', color:item.c, fontFamily:"'Sora',sans-serif", lineHeight:1}}>{item.n}</div>
                  <div style={{fontSize:'9px', color:'#64748b', marginTop:'3px', fontWeight:'600'}}>{item.l}</div>
                </div>
              ))}
            </div>

            {/* Pengurus */}
            <div style={s.card}>
              <div style={s.sectionTitle}>👑 Pengurus Kelas</div>
              {pengurus.length === 0 ? (
                <div style={{color:'#94a3b8', fontSize:'13px', textAlign:'center', padding:'16px 0'}}>Belum ada pengurus</div>
              ) : (
                <div style={{display:'grid', gridTemplateColumns:`repeat(${Math.min(pengurus.length,3)},1fr)`, gap:'12px'}}>
                  {pengurus.map(p => (
                    <div key={p.id} style={{textAlign:'center'}}>
                      <div style={{width:'56px', height:'56px', borderRadius:'18px', margin:'0 auto 8px', background:positionColor[p.position]+'20', border:`2px solid ${positionColor[p.position]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'800', color:positionColor[p.position], overflow:'hidden'}}>
                        {p.photo_url ? <img src={p.photo_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : p.name[0]}
                      </div>
                      <div style={{fontSize:'12px', fontWeight:'700', color:'#1e293b', lineHeight:1.3}}>{p.name}</div>
                      <div style={{fontSize:'10px', fontWeight:'600', color:positionColor[p.position], marginTop:'2px'}}>{p.position}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pengumuman terbaru */}
            {announcements.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>📢 Pengumuman Terbaru</div>
                <div style={{borderLeft:'3px solid #2563eb', paddingLeft:'12px'}}>
                  <div style={{fontSize:'13px', fontWeight:'700', color:'#1e293b'}}>{announcements[0].title}</div>
                  <div style={{fontSize:'11px', color:'#64748b', marginTop:'6px', lineHeight:1.6}}>{announcements[0].content.substring(0,120)}{announcements[0].content.length > 120 ? '...' : ''}</div>
                  <button onClick={() => setTab('pengumuman')} style={{marginTop:'8px', background:'none', border:'none', color:'#2563eb', fontSize:'11px', fontWeight:'700', cursor:'pointer', padding:0, fontFamily:'inherit'}}>Lihat semua →</button>
                </div>
              </div>
            )}

            {/* Kegiatan mendatang */}
            {activities.length > 0 && (
              <div style={s.card}>
                <div style={s.sectionTitle}>🎯 Kegiatan Mendatang</div>
                {activities.slice(0,2).map(a => (
                  <div key={a.id} style={{display:'flex', gap:'12px', alignItems:'center', marginBottom:'10px'}}>
                    <div style={{background:'#eff6ff', borderRadius:'12px', padding:'8px 10px', textAlign:'center', flexShrink:0, minWidth:'44px'}}>
                      <div style={{fontSize:'18px', fontWeight:'800', color:'#2563eb', fontFamily:"'Sora',sans-serif", lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:'9px', color:'#64748b'}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{fontSize:'12px', fontWeight:'600', color:'#1e293b'}}>{a.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SISWA */}
        {tab === 'siswa' && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Cari nama atau NIS..."
              style={{width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'12px', padding:'12px 14px', fontSize:'13px', fontFamily:'inherit', outline:'none', marginBottom:'14px', boxSizing:'border-box', background:'#fff'}}/>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px'}}>
              {filtered.map(s => (
                <div key={s.id} style={{background:'#fff', borderRadius:'16px', padding:'16px', textAlign:'center', border:'1px solid #e8eef8', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                  <div style={{width:'52px', height:'52px', borderRadius:'16px', margin:'0 auto 10px', background:positionColor[s.position]+'15', border:`2px solid ${positionColor[s.position]}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'800', color:positionColor[s.position], overflow:'hidden'}}>
                    {s.photo_url ? <img src={s.photo_url} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : s.name[0]}
                  </div>
                  <div style={{fontSize:'13px', fontWeight:'700', color:'#1e293b', lineHeight:1.3}}>{s.name}</div>
                  <div style={{fontSize:'10px', color:'#94a3b8', margin:'3px 0', fontFamily:'monospace'}}>{s.nis}</div>
                  <span style={{display:'inline-block', background:positionColor[s.position], color:'#fff', fontSize:'9px', fontWeight:'700', padding:'3px 10px', borderRadius:'99px'}}>{s.position}</span>
                </div>
              ))}
              {filtered.length === 0 && <div style={{gridColumn:'span 2', textAlign:'center', color:'#94a3b8', padding:'40px', fontSize:'13px'}}>Tidak ditemukan</div>}
            </div>
          </div>
        )}

        {/* JADWAL */}
        {tab === 'jadwal' && (
          <div>
            <div style={s.card}>
              <div style={s.sectionTitle}>📅 Jadwal Pelajaran</div>
              <div style={{overflowX:'auto', margin:'0 -4px'}}>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'10px', minWidth:'320px'}}>
                  <thead>
                    <tr style={{background:'linear-gradient(90deg,#1d4ed8,#4338ca)', color:'#fff'}}>
                      <th style={{padding:'10px 8px', textAlign:'left', fontWeight:'700', borderRadius:'10px 0 0 0', whiteSpace:'nowrap'}}>Jam</th>
                      {days.map((d,i) => <th key={d} style={{padding:'10px 4px', fontWeight:'700', borderRadius: i===4 ? '0 10px 0 0' : 0}}>{d.substring(0,3)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{background:'#fff7ed'}}>
                      <td style={{padding:'8px', color:'#b45309', fontSize:'9px', fontFamily:'monospace', whiteSpace:'nowrap'}}>11:00</td>
                      <td colSpan={5} style={{textAlign:'center', color:'#b45309', fontWeight:'700', fontSize:'10px', padding:'8px'}}>☀️ ISTIRAHAT</td>
                    </tr>
                    {allTimes.map((time,i) => {
                      const slots = schedules.filter(sc => sc.start_time === time);
                      return (
                        <tr key={time} style={{background: i%2===0 ? '#fff' : '#f8faff', borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'8px', fontFamily:'monospace', fontSize:'9px', color:'#94a3b8', whiteSpace:'nowrap'}}>{time}</td>
                          {days.map(day => {
                            const found = slots.find(sc => sc.day === day);
                            return (
                              <td key={day} style={{padding:'6px 4px', textAlign:'center'}}>
                                {found ? (
                                  <span style={{display:'inline-block', background:'#eff6ff', color:'#1d4ed8', borderRadius:'6px', padding:'3px 4px', fontSize:'9px', fontWeight:'600', lineHeight:1.3}}>{found.subject.split(' ')[0]}</span>
                                ) : <span style={{color:'#e2e8f0', fontSize:'10px'}}>—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {allTimes.length === 0 && <tr><td colSpan={6} style={{padding:'30px', textAlign:'center', color:'#94a3b8'}}>Belum ada jadwal</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PENGUMUMAN */}
        {tab === 'pengumuman' && (
          <div>
            {announcements.length === 0 && <div style={{textAlign:'center', color:'#94a3b8', padding:'60px 0', fontSize:'13px'}}>📭 Belum ada pengumuman</div>}
            {announcements.map(a => (
              <div key={a.id} style={{...s.card, borderLeft:'4px solid #2563eb'}}>
                <div style={{fontSize:'14px', fontWeight:'800', color:'#1e293b', fontFamily:"'Sora',sans-serif", marginBottom:'4px'}}>{a.title}</div>
                <div style={{fontSize:'10px', color:'#94a3b8', marginBottom:'10px'}}>
                  📅 {new Date(a.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
                </div>
                <div style={{fontSize:'13px', color:'#475569', lineHeight:1.8}}>{a.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* KEGIATAN */}
        {tab === 'kegiatan' && (
          <div>
            {activities.length === 0 && <div style={{textAlign:'center', color:'#94a3b8', padding:'60px 0', fontSize:'13px'}}>📭 Belum ada kegiatan</div>}
            {activities.map(a => (
              <div key={a.id} style={{...s.card, display:'flex', gap:'14px', alignItems:'flex-start'}}>
                <div style={{background:'linear-gradient(135deg,#1d4ed8,#4338ca)', borderRadius:'14px', padding:'10px 14px', textAlign:'center', flexShrink:0, minWidth:'54px', boxShadow:'0 4px 12px rgba(29,78,216,0.3)'}}>
                  <div style={{fontSize:'22px', fontWeight:'800', color:'#fff', fontFamily:"'Sora',sans-serif", lineHeight:1}}>{new Date(a.date).getDate()}</div>
                  <div style={{fontSize:'9px', color:'rgba(255,255,255,0.8)', marginTop:'2px', fontWeight:'600'}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px', fontWeight:'700', color:'#1e293b', fontFamily:"'Sora',sans-serif"}}>{a.title}</div>
                  {a.description && <div style={{fontSize:'12px', color:'#64748b', marginTop:'4px', lineHeight:1.7}}>{a.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
