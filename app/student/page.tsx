'use client';
import { useEffect, useState } from 'react';

type Tab = 'home' | 'siswa' | 'jadwal' | 'info' | 'kegiatan';

interface Student { id:number; name:string; nis:string; position:string; photo_url:string|null; }
interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Announcement { id:number; title:string; content:string; created_at:string; }
interface Activity { id:number; title:string; description:string; date:string; }

const POS: Record<string,{bg:string;dim:string;glow:string}> = {
  'Wali Kelas':  {bg:'#ec4899',dim:'rgba(236,72,153,.15)',glow:'rgba(236,72,153,.3)'},
  'Ketua':       {bg:'#6366f1',dim:'rgba(99,102,241,.15)',glow:'rgba(99,102,241,.3)'},
  'Wakil Ketua': {bg:'#8b5cf6',dim:'rgba(139,92,246,.15)',glow:'rgba(139,92,246,.3)'},
  'Sekretaris':  {bg:'#3b82f6',dim:'rgba(59,130,246,.15)',glow:'rgba(59,130,246,.3)'},
  'Bendahara':   {bg:'#f59e0b',dim:'rgba(245,158,11,.15)',glow:'rgba(245,158,11,.3)'},
  'Anggota':     {bg:'#10b981',dim:'rgba(16,185,129,.15)',glow:'rgba(16,185,129,.3)'},
};
const getP = (p:string) => POS[p] || POS['Anggota'];
const SLOTS = [1,2,3,4,5,6,7,8];
const DAYS_FULL = ['Senin','Selasa','Rabu','Kamis','Jumat'];

export default function StudentPage() {
  const [tab, setTab] = useState<Tab>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [breakCfg, setBreakCfg] = useState({break_start:'11:00',break_end:'13:00',break_label:'☀️ Istirahat',break_slot:'5'});
  const [search, setSearch] = useState('');
  const [expandedAnn, setExpandedAnn] = useState<number|null>(null);

  useEffect(()=>{
    fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)&&setStudents(d)).catch(()=>{});
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)&&setSchedules(d)).catch(()=>{});
    fetch('/api/announcements').then(r=>r.json()).then(d=>Array.isArray(d)&&setAnnouncements(d)).catch(()=>{});
    fetch('/api/activities').then(r=>r.json()).then(d=>Array.isArray(d)&&setActivities(d)).catch(()=>{});
    fetch('/api/settings').then(r=>r.json()).then(d=>d?.break_start&&setBreakCfg(d)).catch(()=>{});
  },[]);

  const filtered = students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.nis.includes(search));
  const wali     = students.filter(s=>s.position==='Wali Kelas');
  const pengurus = students.filter(s=>!['Anggota','Wali Kelas'].includes(s.position));
  const anggota  = students.filter(s=>s.position==='Anggota');
  const now      = new Date();
  const upcoming = activities.filter(a=>new Date(a.date)>=now).sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  const past     = activities.filter(a=>new Date(a.date)<now).sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  const bSlot    = parseInt(breakCfg.break_slot||'5');

  const tabs = [
    {key:'home' as Tab,     icon:'🏠', label:'Home'},
    {key:'siswa' as Tab,    icon:'👥', label:'Siswa'},
    {key:'jadwal' as Tab,   icon:'📅', label:'Jadwal'},
    {key:'info' as Tab,     icon:'📢', label:'Info'},
    {key:'kegiatan' as Tab, icon:'🎯', label:'Acara'},
  ];

  /* ── Avatar component ── */
  const Avatar = ({name,photo,color,size=48,radius}:{name:string;photo:string|null;color:string;size?:number;radius?:number}) => (
    <div style={{
      width:size, height:size,
      borderRadius: radius ?? size * 0.28,
      background: color+'20',
      border: `2.5px solid ${color}50`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.38, fontWeight:800, color,
      overflow:'hidden', flexShrink:0,
      boxShadow: `0 4px 14px ${color}30`,
    }}>
      {photo
        ? <img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}
            onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
        : name[0]?.toUpperCase()}
    </div>
  );

  const Badge = ({text,color}:{text:string;color:string}) => (
    <span style={{background:color+'1a',color,border:`1px solid ${color}40`,borderRadius:99,padding:'4px 12px',fontSize:10,fontWeight:700,flexShrink:0,whiteSpace:'nowrap' as const}}>{text}</span>
  );

  const SectionLabel = ({text}:{text:string}) => (
    <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.28)',letterSpacing:1.5,textTransform:'uppercase' as const,marginBottom:12,paddingLeft:2}}>{text}</div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0f0c29 0%,#302b63 55%,#1e1b4b 100%)',fontFamily:"'Plus Jakarta Sans',sans-serif",color:'#fff'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        input::placeholder{color:rgba(255,255,255,.25)}
        input:focus{outline:none;border-color:rgba(129,140,248,.5)!important;background:rgba(255,255,255,.1)!important}
        .tab-btn{transition:all .2s;-webkit-tap-highlight-color:transparent}
        .tab-btn:active{transform:scale(.88)}
        .card-press{transition:opacity .15s;-webkit-tap-highlight-color:transparent}
        .card-press:active{opacity:.7}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(10,8,30,.88)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 18px 11px'}}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:40,height:40,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,boxShadow:'0 4px 18px rgba(99,102,241,.55)',flexShrink:0}}>🎓</div>
            <div>
              <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.4,lineHeight:1.1}}>XI TSM 2</div>
              <div style={{fontSize:10.5,color:'rgba(255,255,255,.38)',fontWeight:500,marginTop:1}}>SMKN 2 Jember · 2024–2027</div>
            </div>
          </div>
          <a href="/login" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'7px 14px',color:'rgba(255,255,255,.3)',fontSize:10.5,fontFamily:'inherit',fontWeight:600,textDecoration:'none'}}>⚙️ Admin</a>
        </div>
        <div style={{display:'flex',padding:'0 8px'}}>
          {tabs.map(t=>(
            <button key={t.key} className="tab-btn" onClick={()=>setTab(t.key)} style={{
              flex:1,padding:'7px 2px 10px',border:'none',background:'transparent',
              borderBottom:tab===t.key?'2.5px solid #818cf8':'2.5px solid transparent',
              cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:3.5,
            }}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:tab===t.key?'#c7d2fe':'rgba(255,255,255,.28)',letterSpacing:.3}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:'20px 16px 100px'}}>

        {/* ════════════════ HOME ════════════════ */}
        {tab==='home' && (
          <div>
            {/* Hero */}
            <div style={{textAlign:'center',padding:'8px 4px 26px'}}>
              <div style={{fontSize:54,marginBottom:14,filter:'drop-shadow(0 0 28px rgba(99,102,241,.65))'}}>🎓</div>
              <div style={{fontSize:12,fontWeight:700,color:'rgba(129,140,248,.75)',letterSpacing:2.5,textTransform:'uppercase',marginBottom:10}}>Selamat Datang</div>
              <div style={{fontSize:30,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.6,lineHeight:1.15,marginBottom:8}}>Kelas XI TSM 2</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.45)',fontWeight:500}}>SMKN 2 Jember · 2024 – 2027</div>
            </div>

            <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,.45),transparent)',marginBottom:26}}/>

            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                {emoji:'👋',label:'Halo, Keluarga XI TSM 2!',color:'#6366f1',border:'rgba(99,102,241,.22)',bg:'rgba(99,102,241,.07)',text:'Selamat datang di halaman resmi Kelas XI TSM 2 — SMKN 2 Jember. Website ini adalah ruang digital milik kita bersama, tempat seluruh informasi kelas tersaji dengan rapi dan mudah diakses kapan saja, di mana saja.'},
                {emoji:'🏫',label:'Tentang Kelas Kita',color:'#8b5cf6',border:'rgba(139,92,246,.22)',bg:'rgba(139,92,246,.07)',text:'Kami adalah bagian dari Program Keahlian Teknik Sepeda Motor (TSM) di SMKN 2 Jember. Angkatan kami resmi bergabung pada tahun 2024 dan akan menyelesaikan masa belajar pada tahun 2027. Tiga tahun penuh semangat, kerja keras, dan kenangan yang tidak akan terlupakan.'},
                {emoji:'🔧',label:'Jurusan TSM',color:'#3b82f6',border:'rgba(59,130,246,.22)',bg:'rgba(59,130,246,.07)',text:'Teknik Sepeda Motor adalah jurusan yang membekali kita dengan keahlian di bidang perawatan, perbaikan, dan diagnosa kendaraan roda dua. Di sini kita tidak hanya belajar teori, tapi langsung terjun ke praktik nyata — dari mesin 2-tak hingga sistem injeksi modern. Ilmu yang kita pelajari hari ini adalah bekal nyata untuk masa depan.'},
                {emoji:'🌟',label:'Semangat Kita',color:'#10b981',border:'rgba(16,185,129,.22)',bg:'rgba(16,185,129,.07)',text:'Kelas XI TSM 2 bukan sekadar kumpulan nama di absensi — kita adalah sebuah tim. Bersama kita melewati ulangan, praktik, tugas, dan segala tantangan sekolah. Setiap hari adalah kesempatan untuk belajar lebih baik, menjadi lebih kuat, dan membuktikan bahwa kita mampu.'},
                {emoji:'📱',label:'Tentang Website Ini',color:'#f59e0b',border:'rgba(245,158,11,.22)',bg:'rgba(245,158,11,.07)',text:'Website ini dibuat khusus untuk kelas kita. Di sini kamu bisa melihat daftar seluruh anggota kelas, mengecek jadwal pelajaran terbaru, membaca pengumuman penting, dan memantau kegiatan yang akan datang. Semua informasi dikelola langsung oleh admin kelas dan selalu diperbarui.'},
                {emoji:'💪',label:'Pesan untuk Kita Semua',color:'#ec4899',border:'rgba(236,72,153,.22)',bg:'rgba(236,72,153,.07)',text:'Tiga tahun terasa singkat, tapi apa yang kita bangun bersama akan bertahan selamanya. Jadikan setiap hari di sekolah sebagai investasi — investasi ilmu, investasi karakter, dan investasi persahabatan. Semangat terus, XI TSM 2! 🔥'},
              ].map((c,i)=>(
                <div key={i} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:20,padding:'18px 20px',borderLeft:`3.5px solid ${c.color}`}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:c.color,marginBottom:9,letterSpacing:.4}}>{c.emoji} {c.label}</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,.68)',lineHeight:1.9}}>{c.text}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign:'center',marginTop:30}}>
              <div style={{fontSize:11.5,color:'rgba(255,255,255,.18)',lineHeight:1.9}}>XI TSM 2 · SMKN 2 Jember<br/>Angkatan 2024 – 2027</div>
              <div style={{width:36,height:2,background:'linear-gradient(90deg,#6366f1,#8b5cf6)',borderRadius:99,margin:'12px auto 0'}}/>
            </div>
          </div>
        )}

        {/* ════════════════ SISWA ════════════════ */}
        {tab==='siswa' && (
          <div>
            <div style={{position:'relative',marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
                style={{width:'100%',background:'rgba(255,255,255,.07)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:16,padding:'13px 16px 13px 46px',color:'#fff',fontSize:14,fontFamily:'inherit',transition:'all .2s'}}/>
              <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:17,opacity:.3}}>🔍</span>
            </div>

            {/* Wali Kelas */}
            {filtered.filter(s=>s.position==='Wali Kelas').map(s => {
              const p = getP(s.position);
              return (
                <div key={s.id} style={{marginBottom:16}}>
                  <SectionLabel text="Wali Kelas"/>
                  <div style={{background:`linear-gradient(135deg,${p.dim},rgba(255,255,255,.02))`,border:`1.5px solid ${p.bg}30`,borderRadius:22,padding:'20px',display:'flex',flexDirection:'column',alignItems:'center',gap:14,boxShadow:`0 8px 30px ${p.glow}`}}>
                    <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={84} radius={24}/>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.3,marginBottom:6}}>{s.name}</div>
                      <Badge text="Wali Kelas" color={p.bg}/>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:8}}>NIS: {s.nis}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pengurus */}
            {filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position)).length > 0 && (
              <div style={{marginBottom:16}}>
                <SectionLabel text="Pengurus Inti"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position)).map(s => {
                    const p = getP(s.position);
                    return (
                      <div key={s.id} style={{background:`linear-gradient(160deg,${p.dim},rgba(255,255,255,.02))`,border:`1px solid ${p.bg}28`,borderRadius:18,padding:'16px 14px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={64} radius={20}/>
                        <div style={{textAlign:'center',width:'100%'}}>
                          <div style={{fontSize:13,fontWeight:800,lineHeight:1.3,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{s.name}</div>
                          <Badge text={s.position} color={p.bg}/>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.28)',marginTop:6,fontFamily:'monospace'}}>{s.nis}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anggota */}
            {filtered.filter(s=>s.position==='Anggota').length > 0 && (
              <div>
                <SectionLabel text={`Anggota · ${filtered.filter(s=>s.position==='Anggota').length} orang`}/>
                <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,overflow:'hidden'}}>
                  {filtered.filter(s=>s.position==='Anggota').map((s,i,arr) => {
                    const p = getP(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.05)':'none'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={44} radius={14}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,lineHeight:1.3}}>{s.name}</div>
                          <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:3,fontFamily:'monospace'}}>NIS: {s.nis}</div>
                        </div>
                        <Badge text="Anggota" color={p.bg}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filtered.length===0 && (
              <div style={{textAlign:'center',color:'rgba(255,255,255,.2)',padding:'60px 0',fontSize:14}}>😕 Tidak ditemukan</div>
            )}
          </div>
        )}

        {/* ════════════════ JADWAL ════════════════ */}
        {tab==='jadwal' && (
          <div>
            <SectionLabel text="Jadwal Pelajaran · XI TSM 2"/>
            <div style={{background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.2)',borderRadius:14,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>☀️</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#fbbf24'}}>{breakCfg.break_label}</div>
                <div style={{fontSize:11,color:'rgba(245,158,11,.6)',marginTop:1}}>{breakCfg.break_start} – {breakCfg.break_end} · JP ke-{breakCfg.break_slot}</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:20,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:460}}>
                  <thead>
                    <tr style={{background:'rgba(99,102,241,.2)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                      <th style={{padding:'13px 12px',textAlign:'left',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:1,textTransform:'uppercase' as const,width:52,whiteSpace:'nowrap' as const}}>HARI</th>
                      {SLOTS.map(n => n===bSlot
                        ? <th key={n} style={{padding:'13px 4px',fontSize:9,fontWeight:700,color:'#fbbf24',textAlign:'center',background:'rgba(245,158,11,.1)',minWidth:36}}>IST<br/><span style={{fontSize:8}}>☀️</span></th>
                        : <th key={n} style={{padding:'13px 6px',fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,.4)',textAlign:'center',minWidth:72}}>JP {n}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_FULL.map((day,di) => (
                      <tr key={day} style={{borderBottom:di<4?'1px solid rgba(255,255,255,.05)':'none',background:di%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                        <td style={{padding:'6px 12px',fontWeight:800,fontSize:10.5,color:'rgba(255,255,255,.5)',letterSpacing:.5,verticalAlign:'middle',whiteSpace:'nowrap' as const}}>{day.substring(0,3).toUpperCase()}</td>
                        {SLOTS.map(slot => {
                          if(slot===bSlot) return <td key={slot} style={{padding:'4px 2px',background:'rgba(245,158,11,.04)',textAlign:'center',verticalAlign:'middle'}}><span style={{fontSize:13,opacity:.25}}>☀️</span></td>;
                          const found = schedules.find(s=>s.day===day&&s.slot_number===slot);
                          return (
                            <td key={slot} style={{padding:'4px 3px',verticalAlign:'top',height:76}}>
                              {found ? (
                                <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.12))',border:'1px solid rgba(99,102,241,.3)',borderRadius:12,padding:'7px 8px',minHeight:68}}>
                                  <div style={{fontSize:12,fontWeight:800,color:'#e0e7ff',lineHeight:1.2,marginBottom:4}}>{found.subject}</div>
                                  {found.teacher&&<div style={{fontSize:8.5,color:'rgba(255,255,255,.35)',lineHeight:1.4}}>{found.teacher}</div>}
                                  <div style={{fontSize:8,color:'rgba(255,255,255,.2)',marginTop:4,fontFamily:'monospace'}}>{found.start_time}–{found.end_time}</div>
                                </div>
                              ) : (
                                <div style={{minHeight:68,borderRadius:12,border:'1px dashed rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <span style={{color:'rgba(255,255,255,.06)',fontSize:16}}>·</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {schedules.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.2)',padding:'28px 0',fontSize:13}}>Belum ada jadwal</div>}
          </div>
        )}

        {/* ════════════════ INFO ════════════════ */}
        {tab==='info' && (
          <div>
            <SectionLabel text="Pengumuman Kelas"/>
            {announcements.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.2)',padding:'70px 0'}}><div style={{fontSize:44,marginBottom:12}}>📭</div><div style={{fontSize:14}}>Belum ada pengumuman</div></div>}
            {announcements.map(a=>(
              <div key={a.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,padding:'18px',marginBottom:12,borderLeft:'4px solid #6366f1'}}>
                <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:8,lineHeight:1.3}}>{a.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.28)',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span>📅</span>{new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </div>
                <div style={{fontSize:14,color:'rgba(255,255,255,.62)',lineHeight:1.9}}>
                  {expandedAnn===a.id||a.content.length<=200?a.content:a.content.substring(0,200)+'...'}
                </div>
                {a.content.length>200&&(
                  <button className="card-press" onClick={()=>setExpandedAnn(expandedAnn===a.id?null:a.id)}
                    style={{marginTop:10,background:'none',border:'none',color:'#818cf8',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                    {expandedAnn===a.id?'Tutup ↑':'Baca selengkapnya ↓'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════ KEGIATAN ════════════════ */}
        {tab==='kegiatan' && (
          <div>
            {upcoming.length>0&&(
              <>
                <SectionLabel text="Acara Mendatang"/>
                {upcoming.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)',borderRadius:20,padding:'16px',display:'flex',gap:14,alignItems:'flex-start',marginBottom:12}}>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,padding:'12px 14px',textAlign:'center',flexShrink:0,minWidth:54,boxShadow:'0 6px 20px rgba(99,102,241,.4)'}}>
                      <div style={{fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.7)',marginTop:3,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:5,lineHeight:1.3}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.75}}>{a.description}</div>}
                      <div style={{marginTop:8,fontSize:11,color:'rgba(255,255,255,.28)'}}>📅 {new Date(a.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {past.length>0&&(
              <>
                <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.2)',letterSpacing:1.5,textTransform:'uppercase' as const,margin:'20px 0 12px 2px'}}>🗂 Arsip</div>
                {past.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.05)',borderRadius:16,padding:'13px 16px',display:'flex',gap:12,alignItems:'center',marginBottom:8,opacity:.55}}>
                    <div style={{background:'rgba(255,255,255,.07)',borderRadius:12,padding:'9px 11px',textAlign:'center',flexShrink:0,minWidth:48}}>
                      <div style={{fontSize:20,fontWeight:800,lineHeight:1,color:'rgba(255,255,255,.45)'}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginTop:1}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,.45)'}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:11,color:'rgba(255,255,255,.28)',marginTop:2}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {upcoming.length===0&&past.length===0&&(
              <div style={{textAlign:'center',color:'rgba(255,255,255,.2)',padding:'70px 0'}}>
                <div style={{fontSize:44,marginBottom:12}}>📭</div>
                <div style={{fontSize:14}}>Belum ada kegiatan</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
