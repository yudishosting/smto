'use client';
import { useEffect, useState } from 'react';

type Tab = 'beranda' | 'anggota' | 'jadwal' | 'info' | 'kegiatan';
interface Student { id:number; name:string; nis:string; position:string; photo_url:string|null; }
interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Announcement { id:number; title:string; content:string; created_at:string; }
interface Activity { id:number; title:string; description:string; date:string; }

const PCOLOR: Record<string,string> = {
  'Wali Kelas':'#e879f9','Ketua':'#818cf8','Wakil Ketua':'#a78bfa',
  'Sekretaris':'#38bdf8','Bendahara':'#fb923c','Anggota':'#4ade80',
};
const clr = (p:string) => PCOLOR[p]||'#4ade80';

export default function StudentPage() {
  const [tab,setTab]   = useState<Tab>('beranda');
  const [students,setStudents]           = useState<Student[]>([]);
  const [schedules,setSchedules]         = useState<Schedule[]>([]);
  const [announcements,setAnnouncements] = useState<Announcement[]>([]);
  const [activities,setActivities]       = useState<Activity[]>([]);
  const [brk,setBrk] = useState({break_start:'11:00',break_end:'13:00',break_label:'Istirahat',break_slot:'5'});
  const [q,setQ]     = useState('');
  const [openId,setOpenId] = useState<number|null>(null);

  useEffect(()=>{
    fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)&&setStudents(d)).catch(()=>{});
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)&&setSchedules(d)).catch(()=>{});
    fetch('/api/announcements').then(r=>r.json()).then(d=>Array.isArray(d)&&setAnnouncements(d)).catch(()=>{});
    fetch('/api/activities').then(r=>r.json()).then(d=>Array.isArray(d)&&setActivities(d)).catch(()=>{});
    fetch('/api/settings').then(r=>r.json()).then(d=>d?.break_start&&setBrk(d)).catch(()=>{});
  },[]);

  const now      = new Date();
  const upcoming = activities.filter(a=>new Date(a.date)>=now).sort((a,b)=>+new Date(a.date)-+new Date(b.date));
  const past     = activities.filter(a=>new Date(a.date)<now).sort((a,b)=>+new Date(b.date)-+new Date(a.date));
  const bSlot    = parseInt(brk.break_slot||'5');
  const DAYS     = ['Senin','Selasa','Rabu','Kamis','Jumat'];
  const SLOTS    = [1,2,3,4,5,6,7,8];
  const filt     = students.filter(s=>s.name.toLowerCase().includes(q.toLowerCase())||s.nis.includes(q));
  const wali     = filt.filter(s=>s.position==='Wali Kelas');
  const pengurus = filt.filter(s=>!['Anggota','Wali Kelas'].includes(s.position));
  const anggota  = filt.filter(s=>s.position==='Anggota');

  const Photo = ({name,photo,color,size,br=14}:{name:string;photo:string|null;color:string;size:number;br?:number}) => (
    <div style={{width:size,height:size,borderRadius:br,flexShrink:0,overflow:'hidden',
      background:`linear-gradient(135deg,${color}30,${color}10)`,
      border:`2px solid ${color}40`,display:'flex',alignItems:'center',
      justifyContent:'center',fontSize:size*.4,fontWeight:800,color}}>
      {photo
        ? <img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}
            onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
        : name[0]?.toUpperCase()}
    </div>
  );

  const Chip = ({label,color}:{label:string;color:string}) => (
    <span style={{display:'inline-block',fontSize:10,fontWeight:700,color,
      background:color+'18',border:`1px solid ${color}30`,
      borderRadius:20,padding:'2px 10px',whiteSpace:'nowrap' as const}}>{label}</span>
  );

  const Card = ({children,style={}}:{children:React.ReactNode;style?:React.CSSProperties}) => (
    <div style={{background:'#fff',borderRadius:20,padding:20,
      boxShadow:'0 1px 4px rgba(0,0,0,.06), 0 4px 24px rgba(0,0,0,.06)',...style}}>
      {children}
    </div>
  );

  const SHead = ({text}:{text:string}) => (
    <p style={{fontSize:11,fontWeight:700,color:'#aaa',letterSpacing:1.2,
      textTransform:'uppercase' as const,marginBottom:10}}>{text}</p>
  );

  const NAV = [
    {id:'beranda'  as Tab,label:'Beranda',emoji:'🏠'},
    {id:'anggota'  as Tab,label:'Anggota',emoji:'👥'},
    {id:'jadwal'   as Tab,label:'Jadwal',  emoji:'📅'},
    {id:'info'     as Tab,label:'Info',    emoji:'📢'},
    {id:'kegiatan' as Tab,label:'Acara',   emoji:'🎯'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#F2F4F8',fontFamily:"'Outfit',sans-serif",color:'#111'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:#F2F4F8}
        ::-webkit-scrollbar{display:none}
        input::placeholder{color:#C4C9D4}
        input:focus{outline:none}
        .nb:active{transform:scale(.85);transition:transform .1s}
        .tap:active{opacity:.6}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .pg{animation:up .28s ease}
      `}</style>

      {/* ░░ TOPBAR ░░ */}
      <div style={{background:'#fff',padding:'16px 20px',display:'flex',
        alignItems:'center',justifyContent:'space-between',
        borderBottom:'1px solid #EBEBEF',position:'sticky',top:0,zIndex:40,
        boxShadow:'0 1px 0 #EBEBEF'}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:'#111',letterSpacing:-.5,lineHeight:1}}>XI TSM 2</div>
          <div style={{fontSize:11,color:'#AAA',marginTop:3,fontWeight:500}}>SMKN 2 Jember · 2024 – 2027</div>
        </div>
        <a href="/login" style={{fontSize:12,fontWeight:600,color:'#999',
          background:'#F5F5F7',borderRadius:10,padding:'7px 14px',
          textDecoration:'none',border:'1px solid #EBEBEF'}}>Admin ⚙</a>
      </div>

      {/* ░░ PAGES ░░ */}
      <div style={{padding:'20px 16px',paddingBottom:100}}>

        {/* ── BERANDA ── */}
        {tab==='beranda' && (
          <div className="pg" style={{display:'flex',flexDirection:'column',gap:16}}>

            {/* Hero */}
            <div style={{background:'linear-gradient(145deg,#0F172A 0%,#1E293B 100%)',
              borderRadius:24,padding:'28px 24px',overflow:'hidden',position:'relative'}}>
              <div style={{position:'absolute',width:180,height:180,borderRadius:'50%',
                background:'rgba(255,255,255,.03)',top:-50,right:-40}}/>
              <div style={{position:'absolute',width:100,height:100,borderRadius:'50%',
                background:'rgba(255,255,255,.04)',bottom:-20,left:30}}/>
              <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',
                letterSpacing:2,textTransform:'uppercase' as const,marginBottom:8}}>Selamat Datang</p>
              <h1 style={{fontSize:28,fontWeight:900,color:'#fff',lineHeight:1.15,marginBottom:6,letterSpacing:-.5}}>
                Kelas XI TSM 2
              </h1>
              <p style={{fontSize:13,color:'rgba(255,255,255,.45)',fontWeight:500,marginBottom:22}}>
                SMKN 2 Jember · Angkatan 2024–2027
              </p>
              <div style={{display:'flex',gap:10}}>
                {[{n:students.length,l:'Anggota'},{n:announcements.length,l:'Info'},{n:upcoming.length,l:'Acara'}].map((s,i)=>(
                  <div key={i} style={{flex:1,background:'rgba(255,255,255,.07)',
                    borderRadius:14,padding:'12px 8px',textAlign:'center'}}>
                    <div style={{fontSize:22,fontWeight:800,color:'#fff',lineHeight:1}}>{s.n}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:4,fontWeight:500}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wali kelas */}
            {students.filter(s=>s.position==='Wali Kelas')[0] && (() => {
              const w = students.filter(s=>s.position==='Wali Kelas')[0];
              return (
                <Card style={{display:'flex',alignItems:'center',gap:16,padding:'18px 20px'}}>
                  <Photo name={w.name} photo={w.photo_url} color={clr(w.position)} size={56} br={18}/>
                  <div>
                    <p style={{fontSize:10,fontWeight:700,color:clr(w.position),
                      letterSpacing:1,textTransform:'uppercase' as const,marginBottom:4}}>Wali Kelas</p>
                    <p style={{fontSize:16,fontWeight:700,color:'#111',lineHeight:1.2}}>{w.name}</p>
                  </div>
                </Card>
              );
            })()}

            {/* Info terbaru */}
            {announcements[0] && (
              <Card>
                <p style={{fontSize:10,fontWeight:700,color:'#6366F1',letterSpacing:1,
                  textTransform:'uppercase' as const,marginBottom:12}}>📢 Info Terbaru</p>
                <p style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:8,lineHeight:1.35}}>
                  {announcements[0].title}</p>
                <p style={{fontSize:13,color:'#666',lineHeight:1.75}}>
                  {announcements[0].content.substring(0,130)}{announcements[0].content.length>130?'…':''}</p>
                <button className="tap" onClick={()=>setTab('info')}
                  style={{marginTop:12,background:'none',border:'none',color:'#6366F1',
                    fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                  Lihat semua pengumuman →
                </button>
              </Card>
            )}

            {/* Acara mendatang */}
            {upcoming[0] && (
              <Card>
                <p style={{fontSize:10,fontWeight:700,color:'#10B981',letterSpacing:1,
                  textTransform:'uppercase' as const,marginBottom:12}}>🎯 Acara Terdekat</p>
                <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{background:'#0F172A',borderRadius:14,padding:'10px 14px',
                    textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:22,fontWeight:800,color:'#fff',lineHeight:1}}>
                      {new Date(upcoming[0].date).getDate()}</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.5)',marginTop:3,fontWeight:600}}>
                      {new Date(upcoming[0].date).toLocaleDateString('id-ID',{month:'short'})}</div>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.3,marginBottom:5}}>
                      {upcoming[0].title}</p>
                    {upcoming[0].description&&
                      <p style={{fontSize:12,color:'#888',lineHeight:1.6}}>{upcoming[0].description}</p>}
                  </div>
                </div>
              </Card>
            )}

            {/* About */}
            <Card>
              <p style={{fontSize:10,fontWeight:700,color:'#F59E0B',letterSpacing:1,
                textTransform:'uppercase' as const,marginBottom:16}}>🏫 Tentang Kelas</p>
              {[
                {t:'Siapa Kita?',d:'Kelas XI TSM 2 adalah bagian dari Program Keahlian Teknik Sepeda Motor di SMKN 2 Jember. Kami bergabung sejak 2024 dan akan lulus pada 2027.'},
                {t:'Jurusan TSM',d:'Teknik Sepeda Motor membekali kita dengan keahlian merawat dan memperbaiki kendaraan roda dua — dari mesin 2-tak hingga sistem injeksi modern.'},
                {t:'Semangat Kita',d:'Bukan sekadar kumpulan nama di absensi — kita adalah satu tim. Tiga tahun singkat, namun kenangan dan ilmu yang kita raih akan bertahan selamanya. 🔥'},
              ].map((c,i)=>(
                <div key={i} style={{marginBottom:i<2?16:0,paddingBottom:i<2?16:0,
                  borderBottom:i<2?'1px solid #F0F0F5':'none'}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:6}}>{c.t}</p>
                  <p style={{fontSize:13,color:'#666',lineHeight:1.8}}>{c.d}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── ANGGOTA ── */}
        {tab==='anggota' && (
          <div className="pg" style={{display:'flex',flexDirection:'column',gap:14}}>
            {/* search */}
            <div style={{position:'relative'}}>
              <input value={q} onChange={e=>setQ(e.target.value)}
                placeholder="Cari nama atau NIS…"
                style={{width:'100%',background:'#fff',border:'1.5px solid #EBEBEF',
                  borderRadius:16,padding:'13px 16px 13px 46px',
                  fontSize:14,fontFamily:'inherit',color:'#111',
                  boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}/>
              <span style={{position:'absolute',left:16,top:'50%',
                transform:'translateY(-50%)',fontSize:16,opacity:.3}}>🔍</span>
            </div>

            {/* Wali Kelas — center card */}
            {wali.length>0 && (
              <div>
                <SHead text="Wali Kelas"/>
                {wali.map(s=>(
                  <Card key={s.id} style={{display:'flex',flexDirection:'column',
                    alignItems:'center',gap:14,textAlign:'center',padding:'28px 20px'}}>
                    <Photo name={s.name} photo={s.photo_url} color={clr(s.position)} size={88} br={28}/>
                    <div>
                      <p style={{fontSize:18,fontWeight:800,color:'#111',marginBottom:8,lineHeight:1.2}}>{s.name}</p>
                      <Chip label="Wali Kelas" color={clr(s.position)}/>
                      <p style={{fontSize:11,color:'#CCC',marginTop:10,fontFamily:'monospace'}}>NIS: {s.nis}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pengurus — 2 col grid */}
            {pengurus.length>0 && (
              <div>
                <SHead text="Pengurus Inti"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {pengurus.map(s=>(
                    <Card key={s.id} style={{display:'flex',flexDirection:'column',
                      alignItems:'center',gap:12,textAlign:'center',padding:'22px 14px'}}>
                      <Photo name={s.name} photo={s.photo_url} color={clr(s.position)} size={64} br={20}/>
                      <div style={{width:'100%'}}>
                        <p style={{fontSize:13,fontWeight:700,color:'#111',lineHeight:1.3,
                          marginBottom:7,overflow:'hidden',textOverflow:'ellipsis',
                          whiteSpace:'nowrap' as const}}>{s.name}</p>
                        <Chip label={s.position} color={clr(s.position)}/>
                        <p style={{fontSize:10,color:'#CCC',marginTop:8,fontFamily:'monospace'}}>{s.nis}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Anggota — list */}
            {anggota.length>0 && (
              <div>
                <SHead text={`Anggota · ${anggota.length} orang`}/>
                <Card style={{padding:0,overflow:'hidden'}}>
                  {anggota.map((s,i)=>(
                    <div key={s.id} style={{display:'flex',alignItems:'center',
                      gap:14,padding:'15px 18px',
                      borderBottom:i<anggota.length-1?'1px solid #F5F5F8':'none'}}>
                      <Photo name={s.name} photo={s.photo_url} color={clr(s.position)} size={44} br={14}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:14,fontWeight:600,color:'#111',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{s.name}</p>
                        <p style={{fontSize:11,color:'#BBB',marginTop:3,fontFamily:'monospace'}}>NIS: {s.nis}</p>
                      </div>
                      <Chip label="Anggota" color={clr(s.position)}/>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {filt.length===0&&(
              <div style={{textAlign:'center',color:'#CCC',padding:'60px 0',fontSize:14}}>Tidak ditemukan</div>
            )}
          </div>
        )}

        {/* ── JADWAL ── */}
        {tab==='jadwal' && (
          <div className="pg" style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <p style={{fontSize:18,fontWeight:800,color:'#111',letterSpacing:-.3}}>Jadwal Pelajaran</p>
              <p style={{fontSize:12,color:'#AAA',marginTop:3}}>XI TSM 2 · SMKN 2 Jember</p>
            </div>

            {/* break info */}
            <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',
              borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>☀️</span>
              <div>
                <p style={{fontSize:12,fontWeight:700,color:'#92400E'}}>{brk.break_label}</p>
                <p style={{fontSize:11,color:'#B45309',marginTop:2}}>{brk.break_start} – {brk.break_end}</p>
              </div>
            </div>

            {/* timetable */}
            <Card style={{padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch' as unknown as string}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:520}}>
                  <thead>
                    <tr style={{background:'#0F172A'}}>
                      <th style={{padding:'13px 14px',textAlign:'left',fontSize:10,
                        fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:1,
                        textTransform:'uppercase' as const,width:54,whiteSpace:'nowrap' as const}}>HARI</th>
                      {SLOTS.map(n=>n===bSlot
                        ? <th key={n} style={{padding:'13px 4px',fontSize:10,fontWeight:700,
                            color:'#FCD34D',textAlign:'center',
                            background:'rgba(251,191,36,.1)',minWidth:38}}>☀️</th>
                        : <th key={n} style={{padding:'13px 6px',fontSize:10,fontWeight:700,
                            color:'rgba(255,255,255,.4)',textAlign:'center',minWidth:74}}>JP {n}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day,di)=>(
                      <tr key={day} style={{borderBottom:di<4?'1px solid #F2F4F8':'none',
                        background:di%2===0?'#fff':'#FAFBFC'}}>
                        <td style={{padding:'6px 14px',fontWeight:700,fontSize:11,
                          color:'#555',whiteSpace:'nowrap' as const,verticalAlign:'middle'}}>
                          {day.substring(0,3).toUpperCase()}
                        </td>
                        {SLOTS.map(slot=>{
                          if(slot===bSlot) return (
                            <td key={slot} style={{background:'#FFFBEB',textAlign:'center',
                              verticalAlign:'middle',padding:'4px 2px'}}>
                              <span style={{fontSize:13,opacity:.3}}>☀️</span>
                            </td>
                          );
                          const f = schedules.find(s=>s.day===day&&s.slot_number===slot);
                          return (
                            <td key={slot} style={{padding:'4px 3px',verticalAlign:'top',height:78}}>
                              {f ? (
                                <div style={{background:'#0F172A',borderRadius:10,
                                  padding:'8px 9px',minHeight:70}}>
                                  <p style={{fontSize:11,fontWeight:700,color:'#E2E8F0',
                                    lineHeight:1.3,marginBottom:4}}>{f.subject}</p>
                                  {f.teacher&&<p style={{fontSize:8,color:'rgba(255,255,255,.35)',
                                    lineHeight:1.4}}>{f.teacher}</p>}
                                  <p style={{fontSize:7.5,color:'rgba(255,255,255,.2)',
                                    marginTop:5,fontFamily:'monospace'}}>
                                    {f.start_time}–{f.end_time}</p>
                                </div>
                              ) : (
                                <div style={{minHeight:70,borderRadius:10,
                                  border:'1.5px dashed #EBEBEF',
                                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <span style={{color:'#E5E7EB',fontSize:16}}>–</span>
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
            </Card>
            {schedules.length===0&&(
              <p style={{textAlign:'center',color:'#CCC',padding:'20px 0',fontSize:13}}>Belum ada jadwal</p>
            )}
          </div>
        )}

        {/* ── INFO ── */}
        {tab==='info' && (
          <div className="pg" style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <p style={{fontSize:18,fontWeight:800,color:'#111',letterSpacing:-.3}}>Pengumuman</p>
              <p style={{fontSize:12,color:'#AAA',marginTop:3}}>Info terbaru untuk kelas</p>
            </div>
            {announcements.length===0&&(
              <div style={{textAlign:'center',color:'#CCC',padding:'60px 0'}}>
                <p style={{fontSize:36,marginBottom:10}}>📭</p>
                <p style={{fontSize:14}}>Belum ada pengumuman</p>
              </div>
            )}
            {announcements.map(a=>(
              <Card key={a.id} style={{borderLeft:'4px solid #6366F1',padding:'18px 20px'}}>
                <p style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6,lineHeight:1.35}}>{a.title}</p>
                <p style={{fontSize:11,color:'#BBB',marginBottom:12,display:'flex',alignItems:'center',gap:5}}>
                  <span>📅</span>
                  {new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </p>
                <p style={{fontSize:13,color:'#555',lineHeight:1.85}}>
                  {openId===a.id||a.content.length<=160?a.content:a.content.substring(0,160)+'…'}
                </p>
                {a.content.length>160&&(
                  <button className="tap" onClick={()=>setOpenId(openId===a.id?null:a.id)}
                    style={{marginTop:10,background:'none',border:'none',color:'#6366F1',
                      fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                    {openId===a.id?'Tutup ↑':'Baca selengkapnya ↓'}
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* ── KEGIATAN ── */}
        {tab==='kegiatan' && (
          <div className="pg" style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <p style={{fontSize:18,fontWeight:800,color:'#111',letterSpacing:-.3}}>Kegiatan Kelas</p>
              <p style={{fontSize:12,color:'#AAA',marginTop:3}}>Acara dan agenda</p>
            </div>

            {upcoming.length>0&&(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <SHead text="Mendatang"/>
                {upcoming.map(a=>(
                  <Card key={a.id} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'18px 20px'}}>
                    <div style={{background:'#0F172A',borderRadius:14,
                      padding:'10px 13px',textAlign:'center',flexShrink:0}}>
                      <p style={{fontSize:22,fontWeight:800,color:'#fff',lineHeight:1}}>
                        {new Date(a.date).getDate()}</p>
                      <p style={{fontSize:9,color:'rgba(255,255,255,.45)',marginTop:3,fontWeight:600}}>
                        {new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</p>
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.3,marginBottom:6}}>{a.title}</p>
                      {a.description&&<p style={{fontSize:12,color:'#777',lineHeight:1.7}}>{a.description}</p>}
                      <p style={{fontSize:11,color:'#BBB',marginTop:8}}>
                        {new Date(a.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {past.length>0&&(
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                <SHead text="Arsip"/>
                {past.map(a=>(
                  <div key={a.id} style={{background:'#fff',borderRadius:14,
                    padding:'14px 18px',display:'flex',gap:12,alignItems:'center',
                    opacity:.6,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                    <div style={{background:'#F2F4F8',borderRadius:10,padding:'8px 11px',
                      textAlign:'center',flexShrink:0,minWidth:46}}>
                      <p style={{fontSize:18,fontWeight:700,lineHeight:1,color:'#777'}}>
                        {new Date(a.date).getDate()}</p>
                      <p style={{fontSize:8,color:'#BBB',marginTop:1}}>
                        {new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</p>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:'#666'}}>{a.title}</p>
                      {a.description&&<p style={{fontSize:11,color:'#999',marginTop:2}}>{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcoming.length===0&&past.length===0&&(
              <div style={{textAlign:'center',color:'#CCC',padding:'60px 0'}}>
                <p style={{fontSize:36,marginBottom:10}}>📭</p>
                <p style={{fontSize:14}}>Belum ada kegiatan</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ░░ BOTTOM NAV ░░ */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:50,
        background:'rgba(255,255,255,.96)',backdropFilter:'blur(16px)',
        borderTop:'1px solid #EBEBEF',
        boxShadow:'0 -2px 20px rgba(0,0,0,.06)',
        display:'flex',paddingBottom:'env(safe-area-inset-bottom)'}}>
        {[
          {id:'beranda'  as Tab,label:'Beranda',emoji:'🏠'},
          {id:'anggota'  as Tab,label:'Anggota',emoji:'👥'},
          {id:'jadwal'   as Tab,label:'Jadwal',  emoji:'📅'},
          {id:'info'     as Tab,label:'Info',    emoji:'📢'},
          {id:'kegiatan' as Tab,label:'Acara',   emoji:'🎯'},
        ].map(t=>{
          const active = tab===t.id;
          return (
            <button key={t.id} className="nb" onClick={()=>setTab(t.id)} style={{
              flex:1,border:'none',background:'transparent',cursor:'pointer',
              fontFamily:'inherit',padding:'10px 4px 12px',
              display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:22,filter:active?'none':'grayscale(1) opacity(.4)',transition:'filter .2s'}}>{t.emoji}</span>
              <span style={{fontSize:9.5,fontWeight:700,letterSpacing:.2,transition:'color .2s',
                color:active?'#0F172A':'#BBB'}}>{t.label}</span>
              {active&&<div style={{width:18,height:3,borderRadius:99,background:'#0F172A',marginTop:-2}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
