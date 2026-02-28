'use client';

import { useEffect, useState } from 'react';

interface Schedule { id: number; day: string; start_time: string; end_time: string; subject: string; }
interface Subject { id: number; name: string; }

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];

const inputStyle: React.CSSProperties = {
  width:'100%', border:'1.5px solid #e2e8f0', borderRadius:12,
  padding:'10px 12px', fontSize:13, fontFamily:'inherit',
  outline:'none', boxSizing:'border-box', background:'#f8faff',
};

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [form, setForm] = useState({ subject_id:'', subject_name:'', day:'Senin', start_time:'08:00', end_time:'09:00' });
  const [newSubject, setNewSubject] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breakSettings, setBreakSettings] = useState({ break_start:'11:00', break_end:'13:00', break_label:'☀️ Jam Istirahat' });
  const [breakLoading, setBreakLoading] = useState(false);
  const [breakSaved, setBreakSaved] = useState(false);

  const fetchAll = () => {
    fetch('/api/schedules').then(r=>r.json()).then(d=>Array.isArray(d)?setSchedules(d):null);
    fetch('/api/subjects').then(r=>r.json()).then(d=>Array.isArray(d)?setSubjects(d):null);
    fetch('/api/settings').then(r=>r.json()).then(d=>{ if(d.break_start) setBreakSettings({break_start:d.break_start,break_end:d.break_end,break_label:d.break_label}); });
  };
  useEffect(()=>{ fetchAll(); },[]);

  const saveBreak = async () => {
    setBreakLoading(true);
    await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(breakSettings) });
    setBreakLoading(false); setBreakSaved(true); setTimeout(()=>setBreakSaved(false),2000); setShowBreakModal(false);
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const res = await fetch('/api/subjects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newSubject}) });
    if (res.ok) { const d = await res.json(); setSubjects(p=>[...p,d]); setForm(f=>({...f,subject_id:String(d.id)})); setNewSubject(''); setShowSubjectModal(false); }
  };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let sid = form.subject_id;
    if (useCustom && form.subject_name.trim()) {
      const res = await fetch('/api/subjects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:form.subject_name}) });
      if (res.ok) { const d = await res.json(); sid = String(d.id); }
    }
    await fetch('/api/schedules', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({subject_id:sid,day:form.day,start_time:form.start_time,end_time:form.end_time}) });
    setLoading(false); setShowModal(false); setForm({subject_id:'',subject_name:'',day:'Senin',start_time:'08:00',end_time:'09:00'}); setUseCustom(false); fetchAll();
  };

  const delSchedule = async (id:number) => {
    if(!confirm('Hapus jadwal ini?')) return;
    await fetch('/api/schedules',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    fetchAll();
  };

  const allTimes = Array.from(new Set<string>(schedules.map(s=>s.start_time))).sort();

  return (
    <div style={{padding:'16px', fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>📅 Jadwal Pelajaran</div>
          <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>Kelola jadwal & istirahat</div>
        </div>
        <button onClick={()=>setShowModal(true)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:12,padding:'10px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Jadwal</button>
      </div>

      {/* Istirahat Card */}
      <div style={{background:'#fff7ed',border:'1.5px solid #fed7aa',borderRadius:16,padding:'14px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:'#b45309',marginBottom:2}}>⏰ Jam Istirahat</div>
          <div style={{fontSize:20,fontWeight:800,color:'#92400e',fontFamily:"'Sora',sans-serif"}}>{breakSettings.break_start} <span style={{fontSize:14,opacity:.6}}>→</span> {breakSettings.break_end}</div>
          <div style={{fontSize:10,color:'#b45309',marginTop:2}}>{breakSettings.break_label}</div>
        </div>
        <button onClick={()=>setShowBreakModal(true)} style={{background:'#f59e0b',color:'#fff',border:'none',borderRadius:10,padding:'8px 14px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
          🔧 Ubah
        </button>
      </div>

      {/* Subjects */}
      <div style={{background:'#fff',borderRadius:16,padding:'14px',marginBottom:14,border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>📚 Mata Pelajaran</div>
          <button onClick={()=>setShowSubjectModal(true)} style={{background:'#eff6ff',color:'#2563eb',border:'none',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Tambah</button>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {subjects.map(s=>(
            <span key={s.id} style={{background:'#f1f5f9',color:'#475569',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:500}}>{s.name}</span>
          ))}
          {subjects.length===0 && <span style={{color:'#94a3b8',fontSize:12}}>Belum ada mata pelajaran</span>}
        </div>
      </div>

      {/* Tabel jadwal */}
      <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10,minWidth:380}}>
            <thead>
              <tr style={{background:'#f8faff'}}>
                <th style={{padding:'10px 12px',textAlign:'left',fontWeight:700,color:'#64748b',fontSize:9,letterSpacing:.5,textTransform:'uppercase',borderBottom:'1px solid #f1f5f9',whiteSpace:'nowrap'}}>JAM</th>
                {DAYS.map(d=><th key={d} style={{padding:'10px 6px',fontWeight:700,color:'#64748b',fontSize:9,letterSpacing:.5,textTransform:'uppercase',borderBottom:'1px solid #f1f5f9'}}>{d.substring(0,3)}</th>)}
                <th style={{padding:'10px 6px',fontWeight:700,color:'#64748b',fontSize:9,textTransform:'uppercase',borderBottom:'1px solid #f1f5f9'}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Istirahat row */}
              <tr style={{background:'#fff7ed'}}>
                <td style={{padding:'10px 12px',color:'#b45309',fontSize:9,fontFamily:'monospace',fontWeight:700,whiteSpace:'nowrap'}}>{breakSettings.break_start}<br/><span style={{fontSize:8,opacity:.7}}>{breakSettings.break_end}</span></td>
                <td colSpan={5} style={{textAlign:'center',color:'#b45309',fontWeight:700,fontSize:10,padding:'10px'}}>☀️ ISTIRAHAT</td>
                <td></td>
              </tr>
              {schedules.map((s,i)=>(
                <tr key={s.id} style={{borderBottom:'1px solid #f8faff',background:i%2===0?'#fff':'#fafbff'}}>
                  <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:9,color:'#94a3b8',whiteSpace:'nowrap'}}>{s.start_time}<br/><span style={{fontSize:8}}>{s.end_time}</span></td>
                  {DAYS.map(d=>(
                    <td key={d} style={{padding:'8px 4px',textAlign:'center'}}>
                      {s.day===d ? <span style={{display:'inline-block',background:'#eff6ff',color:'#1d4ed8',borderRadius:8,padding:'3px 5px',fontSize:9,fontWeight:700,lineHeight:1.3,maxWidth:60,wordBreak:'break-word' as const}}>{s.subject}</span> : <span style={{color:'#e2e8f0'}}>·</span>}
                    </td>
                  ))}
                  <td style={{padding:'8px',textAlign:'center'}}>
                    <button onClick={()=>delSchedule(s.id)} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:8,width:26,height:26,cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>🗑</button>
                  </td>
                </tr>
              ))}
              {schedules.length===0 && <tr><td colSpan={7} style={{padding:'30px',textAlign:'center',color:'#94a3b8',fontSize:12}}>Belum ada jadwal</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:24,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.2)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:800,color:'#1e293b',marginBottom:18,fontFamily:"'Sora',sans-serif"}}>➕ Tambah Jadwal</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>MATA PELAJARAN</label>
                <div style={{display:'flex',gap:6,marginBottom:8}}>
                  <button type="button" onClick={()=>setUseCustom(false)} style={{flex:1,padding:'7px',borderRadius:8,border:`1.5px solid ${!useCustom?'#2563eb':'#e2e8f0'}`,background:!useCustom?'#eff6ff':'#fff',color:!useCustom?'#2563eb':'#64748b',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Pilih dari daftar</button>
                  <button type="button" onClick={()=>setUseCustom(true)} style={{flex:1,padding:'7px',borderRadius:8,border:`1.5px solid ${useCustom?'#2563eb':'#e2e8f0'}`,background:useCustom?'#eff6ff':'#fff',color:useCustom?'#2563eb':'#64748b',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Ketik sendiri</button>
                </div>
                {!useCustom
                  ? <select value={form.subject_id} onChange={e=>setForm({...form,subject_id:e.target.value})} required={!useCustom} style={inputStyle}>
                      <option value="">Pilih mata pelajaran...</option>
                      {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  : <input value={form.subject_name} onChange={e=>setForm({...form,subject_name:e.target.value})} required={useCustom} placeholder="Nama mata pelajaran..." style={inputStyle}/>
                }
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>HARI</label>
                <select value={form.day} onChange={e=>setForm({...form,day:e.target.value})} style={inputStyle}>
                  {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>JAM MULAI</label>
                  <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} required style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>JAM SELESAI</label>
                  <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} required style={inputStyle}/>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{flex:1,border:'1.5px solid #e2e8f0',background:'#fff',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'#64748b',fontFamily:'inherit'}}>Batal</button>
                <button type="submit" disabled={loading} style={{flex:1,background:'#2563eb',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:loading?.7:1}}>{loading?'Menyimpan...':'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Mapel */}
      {showSubjectModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:24,width:'100%',maxWidth:360,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:15,fontWeight:800,color:'#1e293b',marginBottom:16,fontFamily:"'Sora',sans-serif"}}>📚 Tambah Mata Pelajaran</div>
            <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Nama mata pelajaran..." style={{...inputStyle,marginBottom:14}}
              onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSubject())}/>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowSubjectModal(false)} style={{flex:1,border:'1.5px solid #e2e8f0',background:'#fff',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'#64748b',fontFamily:'inherit'}}>Batal</button>
              <button onClick={addSubject} style={{flex:1,background:'#2563eb',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit'}}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setting Istirahat */}
      {showBreakModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:24,width:'100%',maxWidth:380,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:15,fontWeight:800,color:'#1e293b',marginBottom:6,fontFamily:"'Sora',sans-serif"}}>⏰ Atur Jam Istirahat</div>
            <div style={{fontSize:11,color:'#94a3b8',marginBottom:18}}>Sesuaikan dengan jadwal sekolah kamu</div>
            
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>JAM MULAI</label>
                <input type="time" value={breakSettings.break_start} onChange={e=>setBreakSettings({...breakSettings,break_start:e.target.value})} style={inputStyle}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>JAM SELESAI</label>
                <input type="time" value={breakSettings.break_end} onChange={e=>setBreakSettings({...breakSettings,break_end:e.target.value})} style={inputStyle}/>
              </div>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:6}}>LABEL ISTIRAHAT</label>
              <input value={breakSettings.break_label} onChange={e=>setBreakSettings({...breakSettings,break_label:e.target.value})} placeholder="☀️ Jam Istirahat" style={inputStyle}/>
            </div>

            {/* Preview */}
            <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:'12px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#b45309'}}>Preview:</div>
              <div style={{fontSize:13,fontWeight:700,color:'#92400e'}}>{breakSettings.break_start} → {breakSettings.break_end}</div>
              <div style={{fontSize:11,color:'#b45309'}}>{breakSettings.break_label}</div>
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowBreakModal(false)} style={{flex:1,border:'1.5px solid #e2e8f0',background:'#fff',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'#64748b',fontFamily:'inherit'}}>Batal</button>
              <button onClick={saveBreak} disabled={breakLoading} style={{flex:1,background:'#f59e0b',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:breakLoading?.7:1}}>
                {breakLoading?'Menyimpan...':breakSaved?'✓ Tersimpan!':'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
