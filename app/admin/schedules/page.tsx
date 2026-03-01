'use client';
import { useEffect, useState } from 'react';

interface Schedule { id:number; day:string; start_time:string; end_time:string; subject:string; teacher:string|null; slot_number:number|null; }
interface Subject { id:number; name:string; teacher:string|null; }

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];
const SLOTS = [1,2,3,4,5,6,7,8];

const inputStyle: React.CSSProperties = {
  width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',
  borderRadius:12,padding:'11px 14px',color:'#fff',fontSize:13,fontFamily:'inherit',
  outline:'none',boxSizing:'border-box',transition:'all .2s',
};

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [clickedSlot, setClickedSlot] = useState<{day:string;slot:number}|null>(null);
  const [form, setForm] = useState({ subject_id:'', subject_name:'', teacher:'', day:'Senin', slot_number:'1', start_time:'07:00', end_time:'08:00' });
  const [newSubject, setNewSubject] = useState({ name:'', teacher:'' });
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breakSettings, setBreakSettings] = useState({ break_start:'11:00', break_end:'13:00', break_label:'☀️ Istirahat', break_slot:'5' });
  const [breakLoading, setBreakLoading] = useState(false);

  const fetchAll = () => {
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)&&setSchedules(d));
    fetch('/api/subjects').then(r=>r.json()).then(d=>Array.isArray(d)&&setSubjects(d));
    fetch('/api/settings').then(r=>r.json()).then(d=>d?.break_start&&setBreakSettings({...d,break_slot:d.break_slot||'5'}));
  };
  useEffect(()=>{ fetchAll(); },[]);

  const openSlot = (day:string, slot:number) => {
    const existing = schedules.find(s=>s.day===day&&s.slot_number===slot);
    if(existing) return; // already filled
    setClickedSlot({day,slot});
    setForm({subject_id:'',subject_name:'',teacher:'',day,slot_number:String(slot),start_time:'07:00',end_time:'08:00'});
    setUseCustom(false);
    setShowModal(true);
  };

  const addSubject = async() => {
    if(!newSubject.name.trim()) return;
    const res = await fetch('/api/subjects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newSubject)});
    if(res.ok){const d=await res.json();setSubjects(p=>[...p,d]);setForm(f=>({...f,subject_id:String(d.id),teacher:d.teacher||''}));setNewSubject({name:'',teacher:''});setShowSubjectModal(false);}
  };

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let sid = form.subject_id;
    if(useCustom&&form.subject_name.trim()){
      const res=await fetch('/api/subjects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.subject_name,teacher:form.teacher})});
      if(res.ok){const d=await res.json();sid=String(d.id);}
    }
    await fetch('/api/schedules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject_id:sid,day:form.day,start_time:form.start_time,end_time:form.end_time,slot_number:parseInt(form.slot_number)})});
    setLoading(false); setShowModal(false); setClickedSlot(null); fetchAll();
  };

  const del = async(id:number) => {
    if(!confirm('Hapus jadwal ini?'))return;
    await fetch('/api/schedules',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    fetchAll();
  };

  const saveBreak = async() => {
    setBreakLoading(true);
    await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(breakSettings)});
    setBreakLoading(false); setShowBreakModal(false);
  };

  const getSlot = (day:string, slot:number) => schedules.find(s=>s.day===day&&s.slot_number===slot);
  const breakSlot = parseInt(breakSettings.break_slot)||5;

  return (
    <div style={{padding:16,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        input::placeholder,textarea::placeholder,select option{color:rgba(255,255,255,.3)}
        input:focus,select:focus,textarea:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.12)!important}
        select option{background:#1a1740;color:#fff}
        .slot-cell{transition:all .15s;cursor:pointer}
        .slot-cell:hover{background:rgba(99,102,241,.15)!important}
        .slot-cell:active{transform:scale(.97)}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>📅 Jadwal Pelajaran</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>Klik sel kosong untuk isi jadwal</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowBreakModal(true)} style={{background:'rgba(245,158,11,.15)',border:'1px solid rgba(245,158,11,.3)',color:'#fbbf24',borderRadius:10,padding:'8px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>⏰ Istirahat</button>
          <button onClick={()=>setShowSubjectModal(true)} style={{background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.3)',color:'#c7d2fe',borderRadius:10,padding:'8px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Mapel</button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div style={{background:'rgba(255,255,255,.05)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,overflow:'hidden',marginBottom:16}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
            <thead>
              <tr style={{background:'rgba(99,102,241,.25)',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
                <th style={{padding:'12px 10px',textAlign:'left',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:1,textTransform:'uppercase',width:60,whiteSpace:'nowrap'}}>HARI</th>
                {SLOTS.map(n=>(
                  n===breakSlot
                    ? <th key={`break-${n}`} style={{padding:'12px 4px',fontSize:9,fontWeight:700,color:'#fbbf24',letterSpacing:.5,textAlign:'center',background:'rgba(245,158,11,.1)'}}>
                        IST<br/><span style={{fontSize:7,opacity:.7}}>☀️</span>
                      </th>
                    : <th key={n} style={{padding:'12px 6px',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:.5,textAlign:'center'}}>JP {n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day,di)=>(
                <tr key={day} style={{borderBottom:di<4?'1px solid rgba(255,255,255,.06)':'none',background:di%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                  <td style={{padding:'8px 10px',fontWeight:800,fontSize:11,color:'rgba(255,255,255,.7)',letterSpacing:.5,whiteSpace:'nowrap',verticalAlign:'middle'}}>{day.toUpperCase()}</td>
                  {SLOTS.map(slot=>{
                    if(slot===breakSlot){
                      return (
                        <td key={slot} style={{padding:'6px 3px',background:'rgba(245,158,11,.06)',verticalAlign:'middle',textAlign:'center'}}>
                          <div style={{fontSize:8,color:'#fbbf24',fontWeight:700,opacity:.6}}>☀️</div>
                        </td>
                      );
                    }
                    const s=getSlot(day,slot);
                    return (
                      <td key={slot} className="slot-cell" onClick={()=>s?null:openSlot(day,slot)}
                        style={{padding:'4px 3px',verticalAlign:'top',minWidth:72,height:72,background:'transparent',cursor:s?'default':'pointer'}}>
                        {s ? (
                          <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.3),rgba(139,92,246,.2))',border:'1px solid rgba(99,102,241,.4)',borderRadius:10,padding:'6px 7px',height:'100%',position:'relative',minHeight:64}}>
                            <div style={{fontSize:11,fontWeight:800,color:'#e0e7ff',lineHeight:1.2,marginBottom:3}}>{s.subject}</div>
                            {s.teacher&&<div style={{fontSize:8,color:'rgba(255,255,255,.45)',lineHeight:1.3}}>{s.teacher}</div>}
                            <button onClick={(e)=>{e.stopPropagation();del(s.id);}} style={{position:'absolute',top:4,right:4,background:'rgba(239,68,68,.3)',border:'none',borderRadius:4,width:16,height:16,color:'#fca5a5',fontSize:9,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
                          </div>
                        ) : (
                          <div style={{height:64,borderRadius:10,border:'1px dashed rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'rgba(255,255,255,.1)'}}>+</div>
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

      {/* Subjects list */}
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:10}}>📚 Mata Pelajaran Terdaftar</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {subjects.map(s=>(
            <div key={s.id} style={{background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',borderRadius:8,padding:'4px 10px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#c7d2fe'}}>{s.name}</div>
              {s.teacher&&<div style={{fontSize:9,color:'rgba(255,255,255,.4)',marginTop:1}}>{s.teacher}</div>}
            </div>
          ))}
          {subjects.length===0&&<div style={{fontSize:12,color:'rgba(255,255,255,.25)'}}>Belum ada mata pelajaran</div>}
        </div>
      </div>

      {/* Modal Isi Jadwal */}
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,.6)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:4}}>
              ➕ Isi Jadwal
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:18}}>
              {form.day} · JP {form.slot_number}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Mata Pelajaran</label>
                <div style={{display:'flex',gap:6,marginBottom:8}}>
                  <button type="button" onClick={()=>setUseCustom(false)} style={{flex:1,padding:'7px',borderRadius:8,border:`1.5px solid ${!useCustom?'#6366f1':'rgba(255,255,255,.12)'}`,background:!useCustom?'rgba(99,102,241,.2)':'transparent',color:!useCustom?'#c7d2fe':'rgba(255,255,255,.4)',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>Pilih dari daftar</button>
                  <button type="button" onClick={()=>setUseCustom(true)} style={{flex:1,padding:'7px',borderRadius:8,border:`1.5px solid ${useCustom?'#6366f1':'rgba(255,255,255,.12)'}`,background:useCustom?'rgba(99,102,241,.2)':'transparent',color:useCustom?'#c7d2fe':'rgba(255,255,255,.4)',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>Ketik baru</button>
                </div>
                {!useCustom
                  ? <select value={form.subject_id} onChange={e=>{const s=subjects.find(s=>String(s.id)===e.target.value);setForm({...form,subject_id:e.target.value,teacher:s?.teacher||''}); }} required={!useCustom} style={inputStyle}>
                      <option value="">Pilih mata pelajaran...</option>
                      {subjects.map(s=><option key={s.id} value={s.id}>{s.name}{s.teacher?` — ${s.teacher}`:''}</option>)}
                    </select>
                  : <input value={form.subject_name} onChange={e=>setForm({...form,subject_name:e.target.value})} required={useCustom} placeholder="Nama mapel baru..." style={inputStyle}/>
                }
              </div>
              {(useCustom||(form.subject_id&&!subjects.find(s=>String(s.id)===form.subject_id)?.teacher)) && (
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Nama Guru</label>
                  <input value={form.teacher} onChange={e=>setForm({...form,teacher:e.target.value})} placeholder="Nama guru pengajar..." style={inputStyle}/>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Jam Mulai</label>
                  <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} required style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Jam Selesai</label>
                  <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} required style={inputStyle}/>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>{setShowModal(false);setClickedSlot(null);}} style={{flex:1,border:'1px solid rgba(255,255,255,.12)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.5)',fontFamily:'inherit'}}>Batal</button>
                <button type="submit" disabled={loading} style={{flex:2,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:loading?.7:1}}>
                  {loading?'Menyimpan...':'Simpan Jadwal ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Mapel */}
      {showSubjectModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:380,boxShadow:'0 32px 80px rgba(0,0,0,.6)'}}>
            <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:18}}>📚 Tambah Mata Pelajaran</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Nama Mapel *</label>
              <input value={newSubject.name} onChange={e=>setNewSubject({...newSubject,name:e.target.value})} placeholder="Contoh: Matematika, BIG, PENJAS..." style={inputStyle}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Nama Guru</label>
              <input value={newSubject.teacher} onChange={e=>setNewSubject({...newSubject,teacher:e.target.value})} placeholder="Nama guru pengajar..." style={inputStyle}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowSubjectModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.12)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.5)',fontFamily:'inherit'}}>Batal</button>
              <button onClick={addSubject} style={{flex:1,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit'}}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setting Istirahat */}
      {showBreakModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:380,boxShadow:'0 32px 80px rgba(0,0,0,.6)'}}>
            <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:4}}>⏰ Atur Istirahat</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:18}}>Tentukan posisi & waktu istirahat</div>

            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Posisi Istirahat (JP ke-)</label>
              <select value={breakSettings.break_slot} onChange={e=>setBreakSettings({...breakSettings,break_slot:e.target.value})} style={inputStyle}>
                {SLOTS.map(n=><option key={n} value={n}>Setelah JP {n-1} (kolom {n})</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Mulai</label>
                <input type="time" value={breakSettings.break_start} onChange={e=>setBreakSettings({...breakSettings,break_start:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Selesai</label>
                <input type="time" value={breakSettings.break_end} onChange={e=>setBreakSettings({...breakSettings,break_end:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Label</label>
              <input value={breakSettings.break_label} onChange={e=>setBreakSettings({...breakSettings,break_label:e.target.value})} placeholder="☀️ Istirahat" style={inputStyle}/>
            </div>

            {/* Preview */}
            <div style={{background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.25)',borderRadius:12,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'#fbbf24',fontWeight:700}}>Preview:</span>
              <span style={{fontSize:12,color:'#fbbf24',fontWeight:700}}>{breakSettings.break_start} → {breakSettings.break_end}</span>
              <span style={{fontSize:10,color:'rgba(245,158,11,.8)'}}>Kolom {breakSettings.break_slot}</span>
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowBreakModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.12)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.5)',fontFamily:'inherit'}}>Batal</button>
              <button onClick={saveBreak} disabled={breakLoading} style={{flex:1,background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:breakLoading?.7:1}}>
                {breakLoading?'Menyimpan...':'Simpan ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
