'use client';
import { useEffect, useState } from 'react';

interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Subject { id:number; name:string; teacher:string|null; }

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];

const inp: React.CSSProperties = {
  width:'100%', background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)',
  borderRadius:12, padding:'11px 14px', color:'#fff', fontSize:13, fontFamily:'inherit',
  outline:'none', boxSizing:'border-box', transition:'all .2s',
};

export default function AdminSchedules() {
  const [schedules, setSchedules]   = useState<Schedule[]>([]);
  const [subjects, setSubjects]     = useState<Subject[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showCfgModal, setShowCfgModal] = useState(false);
  const [form, setForm] = useState({ subject_id:'', subject_name:'', teacher:'', day:'Senin', slot_number:'1', start_time:'07:00', end_time:'08:00' });
  const [newSub, setNewSub] = useState({ name:'', teacher:'' });
  const [useNew, setUseNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState({ break_start:'11:00', break_end:'13:00', break_label:'Istirahat', break_slot:'5', total_slots:'8' });
  const [cfgLoading, setCfgLoading] = useState(false);

  const fetchAll = () => {
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)&&setSchedules(d));
    fetch('/api/subjects').then(r=>r.json()).then(d=>Array.isArray(d)&&setSubjects(d));
    fetch('/api/settings').then(r=>r.json()).then(d=>{
      if(d?.break_start) setCfg({
        break_start: d.break_start||'11:00',
        break_end:   d.break_end||'13:00',
        break_label: d.break_label||'Istirahat',
        break_slot:  d.break_slot||'5',
        total_slots: d.total_slots||'8',
      });
    });
  };
  useEffect(()=>{ fetchAll(); },[]);

  const totalSlots  = Math.max(1, Math.min(20, parseInt(cfg.total_slots)||8));
  const SLOTS       = Array.from({length:totalSlots},(_,i)=>i+1);
  const bSlot       = parseInt(cfg.break_slot)||5;

  const openSlot = (day:string, slot:number) => {
    if(schedules.find(s=>s.day===day&&s.slot_number===slot)) return;
    setForm({subject_id:'',subject_name:'',teacher:'',day,slot_number:String(slot),start_time:'07:00',end_time:'08:00'});
    setUseNew(false);
    setShowModal(true);
  };

  const addSubject = async() => {
    if(!newSub.name.trim()) return;
    const res = await fetch('/api/subjects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newSub)});
    if(res.ok){ const d=await res.json(); setSubjects(p=>[...p,d]); setForm(f=>({...f,subject_id:String(d.id),teacher:d.teacher||''})); setNewSub({name:'',teacher:''}); setShowSubModal(false); }
  };

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let sid = form.subject_id;
    if(useNew && form.subject_name.trim()){
      const res = await fetch('/api/subjects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.subject_name,teacher:form.teacher})});
      if(res.ok){ const d=await res.json(); sid=String(d.id); }
    }
    await fetch('/api/schedules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject_id:sid,day:form.day,start_time:form.start_time,end_time:form.end_time,slot_number:parseInt(form.slot_number)})});
    setLoading(false); setShowModal(false); fetchAll();
  };

  const del = async(id:number) => {
    if(!confirm('Hapus jadwal ini?'))return;
    await fetch('/api/schedules',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    fetchAll();
  };

  const saveCfg = async() => {
    setCfgLoading(true);
    await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg)});
    setCfgLoading(false); setShowCfgModal(false); fetchAll();
  };

  const getSlot = (day:string, slot:number) => schedules.find(s=>s.day===day&&s.slot_number===slot);

  return (
    <div style={{padding:16,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        input::placeholder,select option{color:rgba(255,255,255,.3)}
        input:focus,select:focus{outline:none;border-color:rgba(129,140,248,.5)!important;background:rgba(255,255,255,.1)!important}
        select option{background:#1a1740;color:#fff}
        .cell:active{opacity:.7}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:8}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>📅 Jadwal</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>Klik sel kosong untuk isi · {totalSlots} JP · Istirahat JP {bSlot}</div>
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap' as const,justifyContent:'flex-end'}}>
          <button onClick={()=>setShowCfgModal(true)} style={{background:'rgba(245,158,11,.18)',border:'1px solid rgba(245,158,11,.3)',color:'#fcd34d',borderRadius:10,padding:'8px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>⚙️ Atur</button>
          <button onClick={()=>setShowSubModal(true)} style={{background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.3)',color:'#c7d2fe',borderRadius:10,padding:'8px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Mapel</button>
        </div>
      </div>

      {/* Timetable */}
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,overflow:'hidden',marginBottom:16}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:Math.max(400, 52 + totalSlots * 72)}}>
            <thead>
              <tr style={{background:'rgba(99,102,241,.22)',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <th style={{padding:'12px 12px',textAlign:'left',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.45)',letterSpacing:1,textTransform:'uppercase' as const,width:52,whiteSpace:'nowrap' as const}}>HARI</th>
                {SLOTS.map(n=>n===bSlot
                  ? <th key={n} style={{padding:'12px 4px',fontSize:9,fontWeight:700,color:'#fbbf24',textAlign:'center',background:'rgba(245,158,11,.12)',minWidth:38,whiteSpace:'nowrap' as const}}>☀️<br/><span style={{fontSize:8,opacity:.7}}>IST</span></th>
                  : <th key={n} style={{padding:'12px 5px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.45)',textAlign:'center',minWidth:72}}>JP {n}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day,di)=>(
                <tr key={day} style={{borderBottom:di<4?'1px solid rgba(255,255,255,.05)':'none',background:di%2===0?'transparent':'rgba(255,255,255,.015)'}}>
                  <td style={{padding:'6px 12px',fontWeight:800,fontSize:10,color:'rgba(255,255,255,.55)',letterSpacing:.5,verticalAlign:'middle',whiteSpace:'nowrap' as const}}>{day.substring(0,3).toUpperCase()}</td>
                  {SLOTS.map(slot=>{
                    if(slot===bSlot) return (
                      <td key={slot} style={{padding:'4px 2px',background:'rgba(245,158,11,.05)',textAlign:'center',verticalAlign:'middle'}}>
                        <span style={{fontSize:14,opacity:.25}}>☀️</span>
                      </td>
                    );
                    const s = getSlot(day,slot);
                    return (
                      <td key={slot} className="cell" onClick={()=>s?null:openSlot(day,slot)}
                        style={{padding:'4px 3px',verticalAlign:'top',height:76,cursor:s?'default':'pointer'}}>
                        {s ? (
                          <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.28),rgba(139,92,246,.16))',border:'1px solid rgba(99,102,241,.35)',borderRadius:11,padding:'7px 8px',minHeight:68,position:'relative'}}>
                            <div style={{fontSize:11,fontWeight:800,color:'#e0e7ff',lineHeight:1.25,marginBottom:3}}>{s.subject}</div>
                            {s.teacher&&<div style={{fontSize:8,color:'rgba(255,255,255,.38)',lineHeight:1.4}}>{s.teacher}</div>}
                            <div style={{fontSize:7.5,color:'rgba(255,255,255,.22)',marginTop:4,fontFamily:'monospace'}}>{s.start_time}–{s.end_time}</div>
                            <button onClick={e=>{e.stopPropagation();del(s.id);}}
                              style={{position:'absolute',top:4,right:4,background:'rgba(239,68,68,.35)',border:'none',borderRadius:4,width:16,height:16,color:'#fca5a5',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,padding:0}}>×</button>
                          </div>
                        ) : (
                          <div style={{minHeight:68,borderRadius:11,border:'1px dashed rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s'}}>
                            <span style={{color:'rgba(255,255,255,.1)',fontSize:18,fontWeight:300}}>+</span>
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

      {/* Mata pelajaran */}
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'14px 16px'}}>
        <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:10,letterSpacing:.5}}>📚 MATA PELAJARAN</div>
        <div style={{display:'flex',flexWrap:'wrap' as const,gap:6}}>
          {subjects.map(s=>(
            <div key={s.id} style={{background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',borderRadius:8,padding:'5px 11px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#c7d2fe'}}>{s.name}</div>
              {s.teacher&&<div style={{fontSize:9,color:'rgba(255,255,255,.35)',marginTop:1}}>{s.teacher}</div>}
            </div>
          ))}
          {subjects.length===0&&<div style={{fontSize:12,color:'rgba(255,255,255,.2)'}}>Belum ada mapel</div>}
        </div>
      </div>

      {/* ── MODAL ISI JADWAL ── */}
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.6)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Isi Jadwal</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:20}}>{form.day} · JP {form.slot_number}</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Mata Pelajaran</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                  {['pilih','baru'].map(v=>(
                    <button key={v} type="button" onClick={()=>setUseNew(v==='baru')}
                      style={{padding:'8px',borderRadius:9,border:`1.5px solid ${(v==='baru')===useNew?'#6366f1':'rgba(255,255,255,.1)'}`,background:(v==='baru')===useNew?'rgba(99,102,241,.2)':'transparent',color:(v==='baru')===useNew?'#c7d2fe':'rgba(255,255,255,.35)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      {v==='pilih'?'Pilih dari daftar':'Ketik mapel baru'}
                    </button>
                  ))}
                </div>
                {!useNew
                  ? <select value={form.subject_id} onChange={e=>{const s=subjects.find(s=>String(s.id)===e.target.value);setForm({...form,subject_id:e.target.value,teacher:s?.teacher||''}); }} required={!useNew} style={inp}>
                      <option value="">Pilih mata pelajaran...</option>
                      {subjects.map(s=><option key={s.id} value={s.id}>{s.name}{s.teacher?` — ${s.teacher}`:''}</option>)}
                    </select>
                  : <input value={form.subject_name} onChange={e=>setForm({...form,subject_name:e.target.value})} required={useNew} placeholder="Nama mapel..." style={inp}/>
                }
              </div>
              {(useNew||(form.subject_id&&!subjects.find(s=>String(s.id)===form.subject_id)?.teacher))&&(
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Nama Guru</label>
                  <input value={form.teacher} onChange={e=>setForm({...form,teacher:e.target.value})} placeholder="Nama guru..." style={inp}/>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Mulai</label>
                  <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} required style={inp}/>
                </div>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Selesai</label>
                  <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} required style={inp}/>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.1)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.4)',fontFamily:'inherit'}}>Batal</button>
                <button type="submit" disabled={loading} style={{flex:2,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:loading?.7:1}}>
                  {loading?'Menyimpan...':'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH MAPEL ── */}
      {showSubModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:380,boxShadow:'0 24px 64px rgba(0,0,0,.6)'}}>
            <div style={{fontSize:15,fontWeight:800,marginBottom:20}}>Tambah Mata Pelajaran</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Nama Mapel *</label>
              <input value={newSub.name} onChange={e=>setNewSub({...newSub,name:e.target.value})} placeholder="Contoh: Matematika, PENJAS..." style={inp}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Nama Guru</label>
              <input value={newSub.teacher} onChange={e=>setNewSub({...newSub,teacher:e.target.value})} placeholder="Nama guru pengajar..." style={inp}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowSubModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.1)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.4)',fontFamily:'inherit'}}>Batal</button>
              <button onClick={addSubject} style={{flex:1,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit'}}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PENGATURAN JADWAL ── */}
      {showCfgModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.6)'}}>
            <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>⚙️ Pengaturan Jadwal</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:20}}>Atur jumlah JP, posisi & waktu istirahat</div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Jumlah JP per hari</label>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <input type="number" min={1} max={20} value={cfg.total_slots}
                  onChange={e=>setCfg({...cfg,total_slots:e.target.value})}
                  style={{...inp,width:100,textAlign:'center' as const,fontSize:20,fontWeight:800,padding:'10px'}}/>
                <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.6}}>
                  Jumlah kolom jam pelajaran<br/>yang tampil di tabel jadwal
                </div>
              </div>
              {/* quick pick */}
              <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap' as const}}>
                {[4,5,6,7,8,10].map(n=>(
                  <button key={n} onClick={()=>setCfg({...cfg,total_slots:String(n)})}
                    style={{padding:'5px 12px',borderRadius:8,border:`1.5px solid ${cfg.total_slots===String(n)?'#6366f1':'rgba(255,255,255,.12)'}`,background:cfg.total_slots===String(n)?'rgba(99,102,241,.25)':'transparent',color:cfg.total_slots===String(n)?'#c7d2fe':'rgba(255,255,255,.4)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    {n} JP
                  </button>
                ))}
              </div>
            </div>

            <div style={{height:1,background:'rgba(255,255,255,.07)',marginBottom:14}}/>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Istirahat di JP ke-</label>
              <input type="number" min={1} max={totalSlots} value={cfg.break_slot}
                onChange={e=>setCfg({...cfg,break_slot:e.target.value})}
                style={{...inp,width:'100%'}}
                placeholder="Contoh: 5 artinya istirahat di kolom JP 5"/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Waktu Mulai</label>
                <input type="time" value={cfg.break_start} onChange={e=>setCfg({...cfg,break_start:e.target.value})} style={inp}/>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Waktu Selesai</label>
                <input type="time" value={cfg.break_end} onChange={e=>setCfg({...cfg,break_end:e.target.value})} style={inp}/>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.38)',display:'block',marginBottom:7,textTransform:'uppercase' as const,letterSpacing:.5}}>Label Istirahat</label>
              <input value={cfg.break_label} onChange={e=>setCfg({...cfg,break_label:e.target.value})} placeholder="Istirahat" style={inp}/>
            </div>

            {/* Preview */}
            <div style={{background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.25)',borderRadius:12,padding:'10px 14px',marginBottom:18,fontSize:11,color:'#fbbf24'}}>
              Preview: <strong>{totalSlots} kolom JP</strong> · Istirahat di JP {cfg.break_slot} · {cfg.break_start}–{cfg.break_end}
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowCfgModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.1)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.4)',fontFamily:'inherit'}}>Batal</button>
              <button onClick={saveCfg} disabled={cfgLoading} style={{flex:1,background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:cfgLoading?.7:1}}>
                {cfgLoading?'Menyimpan...':'Simpan ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
