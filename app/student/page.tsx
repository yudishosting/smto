'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'ringkasan' | 'siswa' | 'jadwal' | 'pengumuman' | 'kegiatan' | 'galeri';

interface Student { id: number; name: string; nis: string; position: string; photo_url: string | null; }
interface Schedule { id: number; day: string; start_time: string; end_time: string; subject: string; }
interface Announcement { id: number; title: string; content: string; author: string; created_at: string; }
interface Activity { id: number; title: string; description: string; date: string; }
interface GalleryItem { id: number; title: string; description: string | null; photo_url: string; event_date: string | null; }
interface BreakSettings { break_start: string; break_end: string; break_label: string; }

const POS_COLOR: Record<string,{bg:string;light:string;border:string}> = {
  'Wali Kelas': {bg:'#ec4899',light:'#fdf2f8',border:'#fbcfe8'},
  'Ketua':      {bg:'#3b82f6',light:'#eff6ff',border:'#bfdbfe'},
  'Wakil Ketua':{bg:'#6366f1',light:'#eef2ff',border:'#c7d2fe'},
  'Sekretaris': {bg:'#8b5cf6',light:'#f5f3ff',border:'#ddd6fe'},
  'Bendahara':  {bg:'#f59e0b',light:'#fffbeb',border:'#fde68a'},
  'Anggota':    {bg:'#10b981',light:'#ecfdf5',border:'#a7f3d0'},
};
const getPC = (p:string) => POS_COLOR[p] || POS_COLOR['Anggota'];

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f172a}
  ::-webkit-scrollbar{display:none}
`;

export default function StudentPage() {
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [breakSettings, setBreakSettings] = useState<BreakSettings>({ break_start:'11:00', break_end:'13:00', break_label:'☀️ Jam Istirahat' });
  const [search, setSearch] = useState('');
  const [previewImg, setPreviewImg] = useState<GalleryItem|null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)?setStudents(d):null).catch(()=>{});
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)?setSchedules(d):null).catch(()=>{});
    fetch('/api/announcements').then(r=>r.json()).then(d=>Array.isArray(d)?setAnnouncements(d):null).catch(()=>{});
    fetch('/api/activities').then(r=>r.json()).then(d=>Array.isArray(d)?setActivities(d):null).catch(()=>{});
    fetch('/api/gallery').then(r=>r.json()).then(d=>Array.isArray(d)?setGallery(d):null).catch(()=>{});
    fetch('/api/settings').then(r=>r.json()).then(d=>{ if(d?.break_start) setBreakSettings(d); }).catch(()=>{});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );

  const waliKelas  = students.filter(s => s.position === 'Wali Kelas');
  const pengurus   = students.filter(s => !['Anggota','Wali Kelas'].includes(s.position));
  const anggota    = students.filter(s => s.position === 'Anggota');
  const allTimes   = Array.from(new Set<string>(schedules.map(s=>s.start_time))).sort();
  const now        = new Date();
  const upcoming   = activities.filter(a => new Date(a.date) >= now);
  const archived   = activities.filter(a => new Date(a.date) < now);

  const tabs: {key:Tab;label:string;icon:string}[] = [
    {key:'ringkasan',label:'Ringkasan',icon:'🏠'},
    {key:'siswa',    label:'Siswa',    icon:'👥'},
    {key:'jadwal',   label:'Jadwal',   icon:'📅'},
    {key:'pengumuman',label:'Info',   icon:'📢'},
    {key:'kegiatan', label:'Kegiatan', icon:'🎯'},
    {key:'galeri',   label:'Galeri',   icon:'📸'},
  ];

  const Avatar = ({name,photoUrl,color,size=40}:{name:string;photoUrl:string|null;color:string;size?:number}) => (
    <div style={{width:size,height:size,borderRadius:size*.3,background:color+'25',border:`2px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.38,fontWeight:800,color,overflow:'hidden',flexShrink:0}}>
      {photoUrl
        ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
        : name[0]?.toUpperCase()}
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f1f5fb',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{background:'linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#6366f1 100%)',padding:'14px 16px 0',position:'sticky',top:0,zIndex:50,boxShadow:'0 4px 20px rgba(30,64,175,.4)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,background:'rgba(255,255,255,.18)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🎓</div>
            <div>
              <div style={{color:'#fff',fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1.1}}>XI TSM 2</div>
              <div style={{color:'rgba(255,255,255,.65)',fontSize:10}}>SMKN 2 Jember · 2025/2026</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',borderRadius:8,padding:'6px 12px',color:'#fff',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Keluar →</button>
        </div>
        <div style={{display:'flex',overflowX:'auto'}}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,minWidth:48,padding:'8px 2px 10px',border:'none',background:'transparent',borderBottom:tab===t.key?'3px solid #fff':'3px solid transparent',cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <span style={{fontSize:16}}>{t.icon}</span>
              <span style={{fontSize:8,fontWeight:700,color:tab===t.key?'#fff':'rgba(255,255,255,.55)',letterSpacing:.3,whiteSpace:'nowrap'}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:'14px 14px 80px'}}>

        {/* ═══ RINGKASAN ═══ */}
        {tab==='ringkasan' && (
          <div>
            {/* Wali Kelas */}
            {waliKelas.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Wali Kelas</div>
                {waliKelas.map(w => {
                  const pc = getPC(w.position);
                  return (
                    <div key={w.id} style={{background:'#fff',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:14,border:`1.5px solid ${pc.border}`,boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
                      <Avatar name={w.name} photoUrl={w.photo_url} color={pc.bg} size={52}/>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:pc.bg,letterSpacing:.5,textTransform:'uppercase',marginBottom:2}}>Wali Kelas</div>
                        <div style={{fontSize:16,fontWeight:800,color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>{w.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pengurus inti */}
            {pengurus.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Pengurus Inti</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                  {pengurus.map(p=>{
                    const pc = getPC(p.position);
                    return (
                      <div key={p.id} style={{background:'#fff',borderRadius:14,padding:'12px',display:'flex',alignItems:'center',gap:10,border:`1px solid ${pc.border}`,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                        <Avatar name={p.name} photoUrl={p.photo_url} color={pc.bg} size={40}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:'#1e293b',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                          <div style={{fontSize:10,fontWeight:600,color:pc.bg,marginTop:2}}>{p.position}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anggota preview */}
            {anggota.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Anggota</div>
                <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                  {anggota.slice(0,5).map((s,i)=>{
                    const pc = getPC(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:i<Math.min(anggota.length,5)-1?'1px solid #f1f5f9':'none'}}>
                        <Avatar name={s.name} photoUrl={s.photo_url} color={pc.bg} size={34}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}>NIS: {s.nis}</div>
                        </div>
                        <span style={{display:'inline-block',background:pc.light,color:pc.bg,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,flexShrink:0}}>Anggota</span>
                      </div>
                    );
                  })}
                  {anggota.length > 5 && (
                    <div onClick={()=>setTab('siswa')} style={{padding:'10px 14px',textAlign:'center',fontSize:12,color:'#3b82f6',fontWeight:600,cursor:'pointer',borderTop:'1px solid #f1f5f9'}}>
                      {anggota.length-5} anggota lainnya →
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info terbaru */}
            {announcements.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Info Terbaru</div>
                <div style={{background:'#fff',borderRadius:16,padding:'14px',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)',borderLeft:'4px solid #3b82f6'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{announcements[0].title}</div>
                  <div style={{fontSize:11,color:'#64748b',marginTop:6,lineHeight:1.7}}>{announcements[0].content.substring(0,120)}{announcements[0].content.length>120?'...':''}</div>
                  <button onClick={()=>setTab('pengumuman')} style={{marginTop:8,background:'none',border:'none',color:'#3b82f6',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>Baca selengkapnya →</button>
                </div>
              </div>
            )}

            {/* Foto terbaru */}
            {gallery.length > 0 && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase'}}>Foto Kegiatan</div>
                  <button onClick={()=>setTab('galeri')} style={{background:'none',border:'none',color:'#3b82f6',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Lihat semua →</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {gallery.slice(0,6).map(g=>(
                    <div key={g.id} onClick={()=>setPreviewImg(g)} style={{paddingTop:'100%',position:'relative',borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                      <img src={g.photo_url} alt={g.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/150x150?text=📷'}}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SISWA ═══ */}
        {tab==='siswa' && (
          <div>
            <div style={{position:'relative',marginBottom:12}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
                style={{width:'100%',background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:12,padding:'11px 14px 11px 40px',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
              <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,opacity:.5}}>🔍</span>
            </div>

            {/* Wali Kelas */}
            {filtered.filter(s=>s.position==='Wali Kelas').length > 0 && (
              <>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Wali Kelas</div>
                <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #fbcfe8',boxShadow:'0 2px 8px rgba(0,0,0,.04)',marginBottom:14}}>
                  {filtered.filter(s=>s.position==='Wali Kelas').map((s,i,arr)=>{
                    const pc=getPC(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px',borderBottom:i<arr.length-1?'1px solid #f1f5f9':'none'}}>
                        <Avatar name={s.name} photoUrl={s.photo_url} color={pc.bg} size={44}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:800,color:'#1e293b'}}>{s.name}</div>
                          <div style={{fontSize:10,color:pc.bg,fontWeight:600,marginTop:2}}>Wali Kelas XI TSM 2</div>
                        </div>
                        <span style={{display:'inline-block',background:pc.light,color:pc.bg,borderRadius:99,padding:'3px 10px',fontSize:9,fontWeight:700}}>Wali Kelas</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Pengurus */}
            {filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position)).length > 0 && (
              <>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Pengurus</div>
                <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)',marginBottom:14}}>
                  {filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position)).map((s,i,arr)=>{
                    const pc=getPC(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:i<arr.length-1?'1px solid #f1f5f9':'none'}}>
                        <Avatar name={s.name} photoUrl={s.photo_url} color={pc.bg} size={40}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:'#94a3b8',marginTop:1,fontFamily:'monospace'}}>NIS: {s.nis}</div>
                        </div>
                        <span style={{display:'inline-block',background:pc.light,color:pc.bg,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,flexShrink:0}}>{s.position}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Anggota */}
            {filtered.filter(s=>s.position==='Anggota').length > 0 && (
              <>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Anggota ({filtered.filter(s=>s.position==='Anggota').length})</div>
                <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                  {filtered.filter(s=>s.position==='Anggota').map((s,i,arr)=>{
                    const pc=getPC(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderBottom:i<arr.length-1?'1px solid #f1f5f9':'none'}}>
                        <Avatar name={s.name} photoUrl={s.photo_url} color={pc.bg} size={36}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:'#94a3b8',marginTop:1,fontFamily:'monospace'}}>NIS: {s.nis}</div>
                        </div>
                        <span style={{display:'inline-block',background:pc.light,color:pc.bg,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,flexShrink:0}}>Anggota</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {filtered.length===0 && <div style={{textAlign:'center',color:'#94a3b8',padding:'40px',fontSize:13}}>Tidak ditemukan</div>}
          </div>
        )}

        {/* ═══ JADWAL ═══ */}
        {tab==='jadwal' && (
          <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{padding:'14px 14px 10px',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>📅 Jadwal Pelajaran</div>
              <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>XI TSM 2 · SMKN 2 Jember</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:10,minWidth:340}}>
                <thead>
                  <tr style={{background:'#f8faff'}}>
                    <th style={{padding:'10px 12px',textAlign:'left',fontWeight:700,color:'#64748b',fontSize:9,letterSpacing:.5,textTransform:'uppercase',borderBottom:'1px solid #f1f5f9',whiteSpace:'nowrap'}}>JAM</th>
                    {DAYS.map(d=><th key={d} style={{padding:'10px 6px',fontWeight:700,color:'#64748b',fontSize:9,letterSpacing:.5,textTransform:'uppercase',borderBottom:'1px solid #f1f5f9'}}>{d.substring(0,3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {allTimes.map((time,i)=>{
                    const slots=schedules.filter(sc=>sc.start_time===time);
                    const endTime=slots[0]?.end_time||'';
                    return (
                      <tr key={time} style={{borderBottom:'1px solid #f8faff',background:i%2===0?'#fff':'#fafbff'}}>
                        <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:9,color:'#94a3b8',whiteSpace:'nowrap'}}>
                          {time}<br/><span style={{fontSize:8,opacity:.7}}>{endTime}</span>
                        </td>
                        {DAYS.map(day=>{
                          const found=slots.find(sc=>sc.day===day);
                          return (
                            <td key={day} style={{padding:'8px 4px',textAlign:'center'}}>
                              {found
                                ? <span style={{display:'inline-block',background:'#eff6ff',color:'#1d4ed8',borderRadius:8,padding:'4px 5px',fontSize:9,fontWeight:700,lineHeight:1.3,maxWidth:60,wordBreak:'break-word' as const}}>{found.subject}</span>
                                : <span style={{color:'#e2e8f0',fontSize:12}}>·</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Istirahat - custom dari settings */}
                  <tr style={{background:'#fff7ed',borderTop:'1px solid #fed7aa'}}>
                    <td style={{padding:'10px 12px',fontSize:9,color:'#b45309',fontFamily:'monospace',fontWeight:700,whiteSpace:'nowrap'}}>
                      {breakSettings.break_start}<br/><span style={{fontSize:8,opacity:.7}}>{breakSettings.break_end}</span>
                    </td>
                    <td colSpan={5} style={{textAlign:'center',color:'#b45309',fontWeight:700,fontSize:11,padding:'10px'}}>
                      {breakSettings.break_label}
                    </td>
                  </tr>
                  {allTimes.length===0 && (
                    <tr><td colSpan={6} style={{padding:'40px',textAlign:'center',color:'#94a3b8',fontSize:12}}>Belum ada jadwal ditambahkan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PENGUMUMAN ═══ */}
        {tab==='pengumuman' && (
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Pengumuman Kelas</div>
            {announcements.length===0 && <div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0',fontSize:13}}><div style={{fontSize:36,marginBottom:8}}>📭</div>Belum ada pengumuman</div>}
            {announcements.map(a=>(
              <div key={a.id} style={{background:'#fff',borderRadius:16,padding:'16px',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)',marginBottom:10,borderLeft:'4px solid #3b82f6'}}>
                <div style={{fontSize:14,fontWeight:800,color:'#1e293b',fontFamily:"'Sora',sans-serif",marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:10,color:'#94a3b8',marginBottom:10}}>📅 {new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                <div style={{fontSize:13,color:'#475569',lineHeight:1.8}}>{a.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ KEGIATAN ═══ */}
        {tab==='kegiatan' && (
          <div>
            {upcoming.length>0 && (
              <>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Acara Mendatang</div>
                {upcoming.map(a=>(
                  <div key={a.id} style={{background:'#fff',borderRadius:16,padding:'14px',display:'flex',gap:12,alignItems:'flex-start',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)',marginBottom:10}}>
                    <div style={{background:'linear-gradient(135deg,#1d4ed8,#6366f1)',borderRadius:14,padding:'10px 12px',textAlign:'center',flexShrink:0,minWidth:52,boxShadow:'0 4px 12px rgba(29,78,216,.35)'}}>
                      <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.8)',marginTop:2,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:12,color:'#64748b',marginTop:4,lineHeight:1.7}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {archived.length>0 && (
              <>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',margin:'16px 0 10px'}}>🗂 Arsip</div>
                {archived.map(a=>(
                  <div key={a.id} style={{background:'#f8faff',borderRadius:14,padding:'12px 14px',display:'flex',gap:12,alignItems:'center',border:'1px solid #f1f5f9',marginBottom:8,opacity:.75}}>
                    <div style={{background:'#e2e8f0',borderRadius:10,padding:'8px 10px',textAlign:'center',flexShrink:0,minWidth:46}}>
                      <div style={{fontSize:18,fontWeight:800,color:'#64748b',fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:8,color:'#94a3b8',marginTop:1}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#64748b'}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {upcoming.length===0&&archived.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0',fontSize:13}}><div style={{fontSize:36,marginBottom:8}}>📭</div>Belum ada kegiatan</div>}
          </div>
        )}

        {/* ═══ GALERI ═══ */}
        {tab==='galeri' && (
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Galeri Kegiatan Kelas</div>
            {gallery.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0'}}><div style={{fontSize:48,marginBottom:12}}>📷</div><div style={{fontSize:13}}>Belum ada foto kegiatan</div></div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
              {gallery.map(g=>(
                <div key={g.id} onClick={()=>setPreviewImg(g)} style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.06)',cursor:'pointer'}}>
                  <div style={{position:'relative',paddingTop:'72%'}}>
                    <img src={g.photo_url} alt={g.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/300x200?text=📷'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%)'}}/>
                    {g.event_date&&<div style={{position:'absolute',bottom:8,left:8,background:'rgba(0,0,0,.6)',color:'#fff',fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:99,backdropFilter:'blur(4px)'}}>{new Date(g.event_date).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</div>}
                  </div>
                  <div style={{padding:'10px 12px'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#1e293b',lineHeight:1.3}}>{g.title}</div>
                    {g.description&&<div style={{fontSize:10,color:'#64748b',marginTop:3,lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{g.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImg&&(
        <div onClick={()=>setPreviewImg(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.95)',zIndex:200,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
          <button onClick={()=>setPreviewImg(null)} style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,.15)',border:'none',borderRadius:'50%',width:36,height:36,color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          <img src={previewImg.photo_url} alt={previewImg.title} style={{maxWidth:'100%',maxHeight:'70vh',borderRadius:16,objectFit:'contain'}}/>
          <div style={{marginTop:16,textAlign:'center',padding:'0 20px'}}>
            <div style={{color:'#fff',fontSize:16,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>{previewImg.title}</div>
            {previewImg.description&&<div style={{color:'rgba(255,255,255,.7)',fontSize:12,marginTop:6,lineHeight:1.6}}>{previewImg.description}</div>}
            {previewImg.event_date&&<div style={{color:'rgba(255,255,255,.45)',fontSize:11,marginTop:6}}>📅 {new Date(previewImg.event_date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
