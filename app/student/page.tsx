'use client';
import { useEffect, useState } from 'react';

type Tab = 'home' | 'siswa' | 'jadwal' | 'info' | 'kegiatan';

interface Student { id:number; name:string; nis:string; position:string; photo_url:string|null; }
interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Announcement { id:number; title:string; content:string; created_at:string; }
interface Activity { id:number; title:string; description:string; date:string; }

const POS: Record<string,{bg:string;light:string;glow:string}> = {
  'Wali Kelas':  {bg:'#ec4899',light:'rgba(236,72,153,.1)',glow:'rgba(236,72,153,.3)'},
  'Ketua':       {bg:'#6366f1',light:'rgba(99,102,241,.1)',glow:'rgba(99,102,241,.3)'},
  'Wakil Ketua': {bg:'#8b5cf6',light:'rgba(139,92,246,.1)',glow:'rgba(139,92,246,.3)'},
  'Sekretaris':  {bg:'#3b82f6',light:'rgba(59,130,246,.1)',glow:'rgba(59,130,246,.3)'},
  'Bendahara':   {bg:'#f59e0b',light:'rgba(245,158,11,.1)',glow:'rgba(245,158,11,.3)'},
  'Anggota':     {bg:'#10b981',light:'rgba(16,185,129,.1)',glow:'rgba(16,185,129,.3)'},
};
const getP = (p:string) => POS[p] || POS['Anggota'];
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];

export default function StudentPage() {
  const [tab, setTab] = useState<Tab>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [breakCfg, setBreakCfg] = useState({break_start:'11:00',break_end:'13:00',break_label:'☀️ Istirahat',break_slot:'5'});
  const [search, setSearch] = useState('');

  useEffect(()=>{
    fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)&&setStudents(d)).catch(()=>{});
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)&&setSchedules(d)).catch(()=>{});
    fetch('/api/announcements').then(r=>r.json()).then(d=>Array.isArray(d)&&setAnnouncements(d)).catch(()=>{});
    fetch('/api/activities').then(r=>r.json()).then(d=>Array.isArray(d)&&setActivities(d)).catch(()=>{});
    fetch('/api/settings').then(r=>r.json()).then(d=>d?.break_start&&setBreakCfg(d)).catch(()=>{});
  },[]);

  const filtered = students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.nis.includes(search));
  const wali    = students.filter(s=>s.position==='Wali Kelas');
  const pengurus = students.filter(s=>!['Anggota','Wali Kelas'].includes(s.position));
  const anggota = students.filter(s=>s.position==='Anggota');
  const times   = Array.from(new Set<string>(schedules.map(s=>s.start_time))).sort();
  const now     = new Date();
  const upcoming = activities.filter(a=>new Date(a.date)>=now).sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  const past     = activities.filter(a=>new Date(a.date)<now).sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());

  const tabs = [
    {key:'home' as Tab,   label:'Home',     icon:'🏠'},
    {key:'siswa' as Tab,  label:'Siswa',    icon:'👥'},
    {key:'jadwal' as Tab, label:'Jadwal',   icon:'📅'},
    {key:'info' as Tab,   label:'Info',     icon:'📢'},
    {key:'kegiatan' as Tab,label:'Kegiatan',icon:'🎯'},
  ];

  const Avatar = ({name,photo,color,size=42}:{name:string;photo:string|null;color:string;size?:number})=>(
    <div style={{width:size,height:size,borderRadius:size*.28,background:color+'20',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.38,fontWeight:800,color,overflow:'hidden',flexShrink:0,letterSpacing:-.5}}>
      {photo?<img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:name[0]?.toUpperCase()}
    </div>
  );

  const Card = ({children,style={}}:{children:React.ReactNode;style?:React.CSSProperties})=>(
    <div style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:16,marginBottom:12,...style}}>
      {children}
    </div>
  );

  const SectionLabel = ({text}:{text:string})=>(
    <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:10,paddingLeft:2}}>{text}</div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0f0c29 0%,#302b63 60%,#24243e 100%)',fontFamily:"'Plus Jakarta Sans',sans-serif",color:'#fff'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        .tab-btn{transition:all .2s}
        .tab-btn:active{transform:scale(.92)}
        .row-item{transition:background .15s}
        .row-item:active{background:rgba(255,255,255,.05)!important}
        input::placeholder{color:rgba(255,255,255,.3)}
        input:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.1)!important}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:'rgba(15,12,41,.8)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.08)',padding:'14px 16px 0',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>🎓</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.3}}>XI TSM 2</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:500}}>SMKN 2 Jember · 2025/2026</div>
            </div>
          </div>
          <a href="/login" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'6px 12px',color:'rgba(255,255,255,.4)',fontSize:10,fontFamily:'inherit',fontWeight:600,textDecoration:'none'}}>⚙️ Admin</a>
        </div>
        <div style={{display:'flex',overflowX:'auto'}}>
          {tabs.map(t=>(
            <button key={t.key} className="tab-btn" onClick={()=>setTab(t.key)} style={{
              flex:1,minWidth:52,padding:'8px 2px 10px',border:'none',background:'transparent',
              borderBottom:tab===t.key?'2px solid #818cf8':'2px solid transparent',
              cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:3,
            }}>
              <span style={{fontSize:17}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:tab===t.key?'#c7d2fe':'rgba(255,255,255,.35)',letterSpacing:.3}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:'16px 14px 90px'}}>

        {/* ═ HOME ═ */}
        {tab==='home' && (
          <div>
            {/* Wali kelas */}
            {wali.length>0 && (
              <div style={{marginBottom:14}}>
                <SectionLabel text="Wali Kelas"/>
                {wali.map(w=>{
                  const p=getP(w.position);
                  return (
                    <div key={w.id} style={{background:`linear-gradient(135deg,${p.light},rgba(255,255,255,.04))`,border:`1px solid ${p.bg}30`,borderRadius:20,padding:'16px',display:'flex',alignItems:'center',gap:14,boxShadow:`0 4px 20px ${p.glow}`}}>
                      <Avatar name={w.name} photo={w.photo_url} color={p.bg} size={56}/>
                      <div>
                        <div style={{fontSize:10,color:p.bg,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:3}}>Wali Kelas</div>
                        <div style={{fontSize:17,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.3}}>{w.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pengurus */}
            {pengurus.length>0 && (
              <div style={{marginBottom:14}}>
                <SectionLabel text="Pengurus Inti"/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
                  {pengurus.map(s=>{
                    const p=getP(s.position);
                    return (
                      <div key={s.id} style={{background:'rgba(255,255,255,.06)',border:`1px solid ${p.bg}25`,borderRadius:16,padding:'12px',display:'flex',alignItems:'center',gap:10}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={40}/>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:p.bg,fontWeight:600,marginTop:2}}>{s.position}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anggota preview */}
            {anggota.length>0 && (
              <div style={{marginBottom:14}}>
                <SectionLabel text={`Anggota · ${anggota.length} orang`}/>
                <Card>
                  {anggota.slice(0,5).map((s,i)=>{
                    const p=getP(s.position);
                    return (
                      <div key={s.id} className="row-item" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<Math.min(anggota.length,5)-1?'1px solid rgba(255,255,255,.06)':'none'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={34}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:1}}>NIS: {s.nis}</div>
                        </div>
                        <span style={{background:p.light,color:p.bg,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,flexShrink:0,border:`1px solid ${p.bg}30`}}>Anggota</span>
                      </div>
                    );
                  })}
                  {anggota.length>5 && (
                    <div onClick={()=>setTab('siswa')} style={{paddingTop:12,textAlign:'center',fontSize:12,color:'#818cf8',fontWeight:700,cursor:'pointer'}}>
                      +{anggota.length-5} anggota lainnya →
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Info terbaru */}
            {announcements.length>0 && (
              <div style={{marginBottom:14}}>
                <SectionLabel text="Info Terbaru"/>
                <div style={{background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.3)',borderRadius:16,padding:'14px',borderLeft:'3px solid #6366f1'}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>{announcements[0].title}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.6)',lineHeight:1.7}}>{announcements[0].content.substring(0,120)}{announcements[0].content.length>120?'...':''}</div>
                  <button onClick={()=>setTab('info')} style={{marginTop:8,background:'none',border:'none',color:'#818cf8',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',padding:0}}>Baca selengkapnya →</button>
                </div>
              </div>
            )}

            {/* Kegiatan mendatang */}
            {upcoming.length>0 && (
              <div>
                <SectionLabel text="Kegiatan Mendatang"/>
                {upcoming.slice(0,2).map(a=>(
                  <Card key={a.id} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:8}}>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:14,padding:'10px 12px',textAlign:'center',flexShrink:0,minWidth:50,boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>
                      <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.75)',marginTop:2,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.6}}>{a.description}</div>}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {students.length===0&&announcements.length===0&&(
              <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(255,255,255,.3)'}}>
                <div style={{fontSize:48,marginBottom:12}}>🎓</div>
                <div style={{fontSize:14,fontWeight:600}}>Selamat datang!</div>
                <div style={{fontSize:12,marginTop:4}}>Data sedang dimuat...</div>
              </div>
            )}
          </div>
        )}

        {/* ═ SISWA ═ */}
        {tab==='siswa' && (
          <div>
            <div style={{position:'relative',marginBottom:14}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
                style={{width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:14,padding:'12px 16px 12px 44px',color:'#fff',fontSize:13,fontFamily:'inherit',transition:'all .2s'}}/>
              <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:.4}}>🔍</span>
            </div>

            {[
              {label:'Wali Kelas', list:filtered.filter(s=>s.position==='Wali Kelas')},
              {label:'Pengurus', list:filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position))},
              {label:`Anggota · ${filtered.filter(s=>s.position==='Anggota').length} orang`, list:filtered.filter(s=>s.position==='Anggota')},
            ].map(group=>group.list.length>0&&(
              <div key={group.label} style={{marginBottom:14}}>
                <SectionLabel text={group.label}/>
                <Card style={{padding:'4px 14px'}}>
                  {group.list.map((s,i,arr)=>{
                    const p=getP(s.position);
                    return (
                      <div key={s.id} className="row-item" style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.06)':'none'}}>
                        <Avatar name={s.name} photo={s.photo_url} color={p.bg} size={s.position==='Wali Kelas'?46:38}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:2,fontFamily:'monospace'}}>NIS: {s.nis}</div>
                        </div>
                        <span style={{background:p.light,color:p.bg,borderRadius:99,padding:'3px 10px',fontSize:9,fontWeight:700,flexShrink:0,border:`1px solid ${p.bg}25`}}>{s.position}</span>
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))}
            {filtered.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'40px',fontSize:13}}>Tidak ditemukan</div>}
          </div>
        )}

        {/* ═ JADWAL ═ */}
        {tab==='jadwal' && (
          <div>
            <SectionLabel text="Jadwal Pelajaran · XI TSM 2"/>
            <div style={{background:'rgba(255,255,255,.05)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
                  <thead>
                    <tr style={{background:'rgba(99,102,241,.25)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                      <th style={{padding:'12px 10px',textAlign:'left',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:1,textTransform:'uppercase',width:52,whiteSpace:'nowrap'}}>HARI</th>
                      {[1,2,3,4,5,6,7,8].map(n=>{
                        const bSlot=parseInt(breakCfg.break_slot||'5');
                        return n===bSlot
                          ? <th key={n} style={{padding:'12px 4px',fontSize:9,fontWeight:700,color:'#fbbf24',textAlign:'center',background:'rgba(245,158,11,.12)',minWidth:38}}>IST<br/><span style={{fontSize:7}}>☀️</span></th>
                          : <th key={n} style={{padding:'12px 6px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:.5,textAlign:'center',minWidth:72}}>JP {n}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {['Senin','Selasa','Rabu','Kamis','Jumat'].map((day,di)=>(
                      <tr key={day} style={{borderBottom:di<4?'1px solid rgba(255,255,255,.05)':'none',background:di%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                        <td style={{padding:'6px 10px',fontWeight:800,fontSize:10,color:'rgba(255,255,255,.6)',letterSpacing:.5,verticalAlign:'middle',whiteSpace:'nowrap'}}>{day.substring(0,3).toUpperCase()}</td>
                        {[1,2,3,4,5,6,7,8].map(slot=>{
                          const bSlot=parseInt(breakCfg.break_slot||'5');
                          if(slot===bSlot){
                            return <td key={slot} style={{padding:'4px 2px',background:'rgba(245,158,11,.06)',textAlign:'center',verticalAlign:'middle'}}>
                              <div style={{fontSize:10,color:'rgba(245,158,11,.4)'}}>☀️</div>
                            </td>;
                          }
                          const found=schedules.find((s:Schedule)=>s.day===day&&s.slot_number===slot);
                          return (
                            <td key={slot} style={{padding:'4px 3px',verticalAlign:'top',height:72}}>
                              {found ? (
                                <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.15))',border:'1px solid rgba(99,102,241,.35)',borderRadius:10,padding:'6px 7px',minHeight:64,height:'100%'}}>
                                  <div style={{fontSize:11,fontWeight:800,color:'#e0e7ff',lineHeight:1.2,marginBottom:3}}>{found.subject}</div>
                                  {found.teacher&&<div style={{fontSize:8,color:'rgba(255,255,255,.4)',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{found.teacher}</div>}
                                  <div style={{fontSize:8,color:'rgba(255,255,255,.25)',marginTop:3,fontFamily:'monospace'}}>{found.start_time}–{found.end_time}</div>
                                </div>
                              ) : (
                                <div style={{minHeight:64,borderRadius:10,border:'1px dashed rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <span style={{color:'rgba(255,255,255,.08)',fontSize:14}}>·</span>
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
              {/* Keterangan istirahat */}
              <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:10,height:10,background:'rgba(245,158,11,.3)',border:'1px solid rgba(245,158,11,.4)',borderRadius:3,flexShrink:0}}/>
                <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>{breakCfg.break_label} · {breakCfg.break_start}–{breakCfg.break_end}</div>
              </div>
            </div>
            {schedules.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'30px 0',fontSize:12}}>Belum ada jadwal</div>}
          </div>
        )}

        {/* ═ INFO ═ */}
        {tab==='info' && (
          <div>
            <SectionLabel text="Pengumuman Kelas"/>
            {announcements.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'60px 0',fontSize:13}}><div style={{fontSize:36,marginBottom:8}}>📭</div>Belum ada pengumuman</div>}
            {announcements.map(a=>(
              <div key={a.id} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:18,padding:'16px',marginBottom:10,borderLeft:'3px solid #6366f1'}}>
                <div style={{fontSize:14,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:6}}>{a.title}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:10}}>📅 {new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.7)',lineHeight:1.8}}>{a.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═ KEGIATAN ═ */}
        {tab==='kegiatan' && (
          <div>
            {upcoming.length>0&&(
              <>
                <SectionLabel text="Mendatang"/>
                {upcoming.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:18,padding:'14px',display:'flex',gap:12,alignItems:'flex-start',marginBottom:10}}>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:14,padding:'10px 12px',textAlign:'center',flexShrink:0,minWidth:50,boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>
                      <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.7)',marginTop:2,fontWeight:600}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif",marginBottom:4}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:12,color:'rgba(255,255,255,.55)',lineHeight:1.7}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {past.length>0&&(
              <>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.25)',letterSpacing:1.5,textTransform:'uppercase',margin:'16px 0 10px 2px'}}>🗂 Arsip</div>
                {past.map(a=>(
                  <div key={a.id} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:14,padding:'12px 14px',display:'flex',gap:12,alignItems:'center',marginBottom:8,opacity:.65}}>
                    <div style={{background:'rgba(255,255,255,.08)',borderRadius:10,padding:'8px 10px',textAlign:'center',flexShrink:0,minWidth:46}}>
                      <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1,color:'rgba(255,255,255,.6)'}}>{new Date(a.date).getDate()}</div>
                      <div style={{fontSize:8,color:'rgba(255,255,255,.35)',marginTop:1}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.55)'}}>{a.title}</div>
                      {a.description&&<div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:2}}>{a.description}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {upcoming.length===0&&past.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'60px 0',fontSize:13}}><div style={{fontSize:36,marginBottom:8}}>📭</div>Belum ada kegiatan</div>}
          </div>
        )}
      </div>
    </div>
  );
}
