'use client';
import { useEffect, useState } from 'react';

type Tab = 'home' | 'siswa' | 'jadwal' | 'info' | 'kegiatan';

interface Student { id:number; name:string; nis:string; position:string; photo_url:string|null; }
interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Announcement { id:number; title:string; content:string; created_at:string; }
interface Activity { id:number; title:string; description:string; date:string; }

const POS: Record<string,{bg:string;dim:string;glow:string}> = {
  'Wali Kelas':  {bg:'#ec4899',dim:'rgba(236,72,153,.18)',glow:'rgba(236,72,153,.35)'},
  'Ketua':       {bg:'#6366f1',dim:'rgba(99,102,241,.18)',glow:'rgba(99,102,241,.35)'},
  'Wakil Ketua': {bg:'#8b5cf6',dim:'rgba(139,92,246,.18)',glow:'rgba(139,92,246,.35)'},
  'Sekretaris':  {bg:'#3b82f6',dim:'rgba(59,130,246,.18)',glow:'rgba(59,130,246,.35)'},
  'Bendahara':   {bg:'#f59e0b',dim:'rgba(245,158,11,.18)',glow:'rgba(245,158,11,.35)'},
  'Anggota':     {bg:'#10b981',dim:'rgba(16,185,129,.18)',glow:'rgba(16,185,129,.35)'},
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

  const Avatar = ({name,photo,color,size=48}:{name:string;photo:string|null;color:string;size?:number}) => (
    <div style={{width:size,height:size,borderRadius:size*.28,background:color+'22',border:`2px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.38,fontWeight:800,color,overflow:'hidden',flexShrink:0}}>
      {photo?<img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:name[0]?.toUpperCase()}
    </div>
  );

  const Badge = ({text,color}:{text:string;color:string}) => (
    <span style={{background:color+'20',color,border:`1px solid ${color}35`,borderRadius:99,padding:'3px 11px',fontSize:10,fontWeight:700,flexShrink:0}}>{text}</span>
  );

  const Label = ({text}:{text:string}) => (
    <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:12,paddingLeft:2}}>{text}</div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0f0c29 0%,#302b63 55%,#24243e 100%)',fontFamily:"'Plus Jakarta Sans',sans-serif",color:'#fff'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        input::placeholder{color:rgba(255,255,255,.3)}
        input:focus{outline:none;border-color:rgba(129,140,248,.5)!important;background:rgba(255,255,255,.1)!important}
        .tab-btn{transition:all .2s}
        .tab-btn:active{transform:scale(.9)}
        .pressable{transition:opacity .15s}
        .pressable:active{opacity:.7}
      `}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(12,10,35,.85)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        {/* Top bar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px 12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:42,height:42,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 4px 18px rgba(99,102,241,.5)',flexShrink:0}}>🎓</div>
            <div>
              <div style={{fontSize:17,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.4,lineHeight:1.1}}>XI TSM 2</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:500,marginTop:1}}>SMKN 2 Jember · 2025/2026</div>
            </div>
          </div>
          <a href="/login" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'7px 14px',color:'rgba(255,255,255,.35)',fontSize:11,fontFamily:'inherit',fontWeight:600,textDecoration:'none'}}>⚙️ Admin</a>
        </div>

        {/* Tab bar */}
        <div style={{display:'flex',padding:'0 6px'}}>
          {tabs.map(t=>(
            <button key={t.key} className="tab-btn" onClick={()=>setTab(t.key)} style={{
              flex:1,padding:'8px 4px 11px',border:'none',background:'transparent',
              borderBottom:tab===t.key?'2.5px solid #818cf8':'2.5px solid transparent',
              cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:4,
            }}>
              <span style={{fontSize:19}}>{t.icon}</span>
              <span style={{fontSize:9.5,fontWeight:700,color:tab===t.key?'#c7d2fe':'rgba(255,255,255,.3)',letterSpacing:.3}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:'18px 16px 100px'}}>

        {/* ═══════ HOME ═══════ */}
        {tab==='home' && (
          <div>
            {/* Wali Kelas — BESAR */}
            {wali.map(w => {
              const p = getP(w.position);
              return (
                <div key={w.id} style={{background:`linear-gradient(135deg,${p.dim},rgba(255,255,255,.03))`,border:`1.5px solid ${p.bg}35`,borderRadius:24,padding:'20px',display:'flex',alignItems:'center',gap:16,marginBottom:16,boxShadow:`0 8px 32px ${p.glow}`}}>
                  <Avatar name={w.name} photo={w.photo_url} color={p.bg} size={66}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:p.bg,fontWeight:700,letterSpacing:1.2,textTransform:'uppercase',marginBottom:4}}>Wali Kelas</div>
                    <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.4,lineHeight:1.2}}>{w.name}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.45)',marginTop:4}}>XI TSM 2 · SMKN 2 Jember</div>
                  </div>
                </div>
              );
            })}

            {/* Pengurus — GRID 2 kolom besar */}
            {pengurus.length > 0 && (
              <div style={{marginBottom:16}}>
                <Label text="Pengurus Inti"/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                  {pengurus.map(s => {
                    const p = getP(s.position);
                    return (
                      <div key={s.id} style={{background:`linear-gradient(135deg,${p.dim},rgba(255,255,255,.03))`,border:`1px solid ${p.bg}30`,borderRadius:18,padding:'14px 14px 12px'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={50}/>
                        <div style={{marginTop:10}}>
                          <div style={{fontSize:14,fontWeight:800,lineHeight:1.3,marginBottom:4}}>{s.name}</div>
                          <span style={{background:p.bg+'25',color:p.bg,borderRadius:99,padding:'3px 10px',fontSize:10,fontWeight:700,border:`1px solid ${p.bg}35`}}>{s.position}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anggota preview */}
            {anggota.length > 0 && (
              <div style={{marginBottom:16}}>
                <Label text={`Anggota Kelas · ${anggota.length} orang`}/>
                <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,overflow:'hidden'}}>
                  {anggota.slice(0,6).map((s,i) => {
                    const p = getP(s.position);
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderBottom:i<Math.min(anggota.length,6)-1?'1px solid rgba(255,255,255,.05)':'none'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={40}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:2}}>NIS: {s.nis}</div>
                        </div>
                        <Badge text="Anggota" color={p.bg}/>
                      </div>
                    );
                  })}
                  {anggota.length > 6 && (
                    <div className="pressable" onClick={()=>setTab('siswa')} style={{padding:'13px 16px',textAlign:'center',fontSize:13,color:'#818cf8',fontWeight:700,cursor:'pointer',borderTop:'1px solid rgba(255,255,255,.05)'}}>
                      Lihat semua {anggota.length} anggota →
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info terbaru */}
            {announcements.length > 0 && (
              <div style={{marginBottom:16}}>
                <Label text="Info Terbaru"/>
                <div style={{background:'rgba(99,102,241,.1)',border:'1.5px solid rgba(99,102,241,.25)',borderRadius:20,padding:'18px',borderLeft:'4px solid #6366f1'}}>
                  <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:8,lineHeight:1.3}}>{announcements[0].title}</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.6)',lineHeight:1.8}}>{announcements[0].content.substring(0,150)}{announcements[0].content.length>150?'...':''}</div>
                  <button className="pressable" onClick={()=>setTab('info')} style={{marginTop:12,background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.35)',color:'#c7d2fe',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:'7px 16px',borderRadius:10}}>
                    Baca semua pengumuman →
                  </button>
                </div>
              </div>
            )}

            {/* Kegiatan mendatang */}
            {upcoming.length > 0 && (
              <div>
                <Label text="Kegiatan Mendatang"/>
                {upcoming.slice(0,2).map(a => (
                  <div key={a.id} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)',borderRadius:20,padding:'16px',display:'flex',gap:14,alignItems:'flex-start',marginBottom:10}}>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,padding:'12px 14px',textAlign:'center',flexShrink:0,minWidth:54,boxShadow:'0 6px 20px rgba(99,102,241,.45)'}}>
                      <div style={{fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.75)',marginTop:3,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:5,lineHeight:1.3}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.7}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {students.length===0&&announcements.length===0&&(
              <div style={{textAlign:'center',padding:'80px 20px',color:'rgba(255,255,255,.25)'}}>
                <div style={{fontSize:56,marginBottom:14}}>🎓</div>
                <div style={{fontSize:16,fontWeight:700}}>Selamat datang!</div>
                <div style={{fontSize:13,marginTop:6}}>Data sedang dimuat...</div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ SISWA ═══════ */}
        {tab==='siswa' && (
          <div>
            <div style={{position:'relative',marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
                style={{width:'100%',background:'rgba(255,255,255,.07)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:16,padding:'13px 16px 13px 46px',color:'#fff',fontSize:14,fontFamily:'inherit',transition:'all .2s'}}/>
              <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:18,opacity:.35}}>🔍</span>
            </div>

            {[
              {label:'Wali Kelas', list:filtered.filter(s=>s.position==='Wali Kelas')},
              {label:'Pengurus', list:filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position))},
              {label:`Anggota · ${filtered.filter(s=>s.position==='Anggota').length} orang`, list:filtered.filter(s=>s.position==='Anggota')},
            ].map(grp => grp.list.length===0 ? null : (
              <div key={grp.label} style={{marginBottom:16}}>
                <Label text={grp.label}/>
                <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,overflow:'hidden'}}>
                  {grp.list.map((s,i,arr) => {
                    const p = getP(s.position);
                    const big = s.position==='Wali Kelas';
                    return (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:14,padding:big?'16px':' 13px 16px',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.05)':'none'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={big?52:42}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:big?16:14,fontWeight:800,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.2}}>{s.name}</div>
                          <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:3,fontFamily:'monospace'}}>NIS: {s.nis}</div>
                        </div>
                        <Badge text={s.position} color={p.bg}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.25)',padding:'50px 0',fontSize:14}}>😕 Tidak ditemukan</div>}
          </div>
        )}

        {/* ═══════ JADWAL ═══════ */}
        {tab==='jadwal' && (
          <div>
            <Label text="Jadwal Pelajaran · XI TSM 2"/>

            {/* Info istirahat */}
            <div style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',borderRadius:14,padding:'11px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>☀️</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#fbbf24'}}>{breakCfg.break_label}</div>
                <div style={{fontSize:11,color:'rgba(245,158,11,.65)',marginTop:1}}>{breakCfg.break_start} – {breakCfg.break_end} · JP ke-{breakCfg.break_slot}</div>
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:20,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:460}}>
                  <thead>
                    <tr style={{background:'rgba(99,102,241,.2)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                      <th style={{padding:'13px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.45)',letterSpacing:1,textTransform:'uppercase',width:56,whiteSpace:'nowrap'}}>HARI</th>
                      {SLOTS.map(n => n===bSlot
                        ? <th key={n} style={{padding:'13px 4px',fontSize:9,fontWeight:700,color:'#fbbf24',textAlign:'center',background:'rgba(245,158,11,.1)',minWidth:36}}>IST<br/><span style={{fontSize:8}}>☀️</span></th>
                        : <th key={n} style={{padding:'13px 6px',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.45)',textAlign:'center',minWidth:72}}>JP {n}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_FULL.map((day,di) => (
                      <tr key={day} style={{borderBottom:di<4?'1px solid rgba(255,255,255,.05)':'none',background:di%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                        <td style={{padding:'6px 12px',fontWeight:800,fontSize:11,color:'rgba(255,255,255,.55)',letterSpacing:.5,verticalAlign:'middle',whiteSpace:'nowrap'}}>{day.substring(0,3).toUpperCase()}</td>
                        {SLOTS.map(slot => {
                          if(slot===bSlot) return <td key={slot} style={{padding:'4px 2px',background:'rgba(245,158,11,.05)',textAlign:'center',verticalAlign:'middle'}}><div style={{fontSize:12,opacity:.3}}>☀️</div></td>;
                          const found = schedules.find((s:Schedule)=>s.day===day&&s.slot_number===slot);
                          return (
                            <td key={slot} style={{padding:'4px 3px',verticalAlign:'top',height:76}}>
                              {found ? (
                                <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.12))',border:'1px solid rgba(99,102,241,.3)',borderRadius:12,padding:'7px 8px',minHeight:68}}>
                                  <div style={{fontSize:12,fontWeight:800,color:'#e0e7ff',lineHeight:1.2,marginBottom:4}}>{found.subject}</div>
                                  {found.teacher&&<div style={{fontSize:9,color:'rgba(255,255,255,.38)',lineHeight:1.4}}>{found.teacher}</div>}
                                  <div style={{fontSize:8,color:'rgba(255,255,255,.22)',marginTop:4,fontFamily:'monospace'}}>{found.start_time}–{found.end_time}</div>
                                </div>
                              ) : (
                                <div style={{minHeight:68,borderRadius:12,border:'1px dashed rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <span style={{color:'rgba(255,255,255,.07)',fontSize:16}}>·</span>
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
            {schedules.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.25)',padding:'30px 0',fontSize:13}}>Belum ada jadwal</div>}
          </div>
        )}

        {/* ═══════ INFO ═══════ */}
        {tab==='info' && (
          <div>
            <Label text="Pengumuman Kelas"/>
            {announcements.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.25)',padding:'70px 0'}}><div style={{fontSize:44,marginBottom:12}}>📭</div><div style={{fontSize:14}}>Belum ada pengumuman</div></div>}
            {announcements.map(a => (
              <div key={a.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,padding:'18px',marginBottom:12,borderLeft:'4px solid #6366f1'}}>
                <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:8,lineHeight:1.3}}>{a.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                  <span>📅</span>
                  {new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </div>
                <div style={{fontSize:14,color:'rgba(255,255,255,.65)',lineHeight:1.85}}>
                  {expandedAnn===a.id||a.content.length<=200
                    ? a.content
                    : a.content.substring(0,200)+'...'}
                </div>
                {a.content.length>200&&(
                  <button className="pressable" onClick={()=>setExpandedAnn(expandedAnn===a.id?null:a.id)}
                    style={{marginTop:10,background:'none',border:'none',color:'#818cf8',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                    {expandedAnn===a.id?'Tutup ↑':'Baca selengkapnya ↓'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════ KEGIATAN ═══════ */}
        {tab==='kegiatan' && (
          <div>
            {upcoming.length>0&&(
              <>
                <Label text="Acara Mendatang"/>
                {upcoming.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)',borderRadius:20,padding:'16px',display:'flex',gap:14,alignItems:'flex-start',marginBottom:12}}>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,padding:'12px 14px',textAlign:'center',flexShrink:0,minWidth:54,boxShadow:'0 6px 20px rgba(99,102,241,.4)'}}>
                      <div style={{fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.7)',marginTop:3,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:5,lineHeight:1.3}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.75}}>{a.description}</div>}
                      <div style={{marginTop:8,fontSize:11,color:'rgba(255,255,255,.3)'}}>
                        📅 {new Date(a.date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {past.length>0&&(
              <>
                <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.2)',letterSpacing:1.5,textTransform:'uppercase',margin:'20px 0 12px 2px'}}>🗂 Arsip Kegiatan</div>
                {past.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.05)',borderRadius:16,padding:'13px 16px',display:'flex',gap:12,alignItems:'center',marginBottom:8,opacity:.6}}>
                    <div style={{background:'rgba(255,255,255,.07)',borderRadius:12,padding:'9px 11px',textAlign:'center',flexShrink:0,minWidth:48}}>
                      <div style={{fontSize:20,fontWeight:800,lineHeight:1,color:'rgba(255,255,255,.5)'}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.3)',marginTop:1}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,.5)'}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {upcoming.length===0&&past.length===0&&(
              <div style={{textAlign:'center',color:'rgba(255,255,255,.25)',padding:'70px 0'}}>
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
