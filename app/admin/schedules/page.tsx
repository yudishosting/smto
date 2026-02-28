'use client';

import { useEffect, useState } from 'react';

interface Schedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
}

interface Subject {
  id: number;
  name: string;
}

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [form, setForm] = useState({ subject_id: '', subject_name: '', day: 'Senin', start_time: '08:00', end_time: '09:00' });
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  const fetchData = () => {
    fetch('/api/schedules').then(r => r.json()).then(d => Array.isArray(d) ? setSchedules(d) : null);
    fetch('/api/subjects').then(r => r.json()).then(d => Array.isArray(d) ? setSubjects(d) : null);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSubjectName }),
    });
    if (res.ok) {
      const data = await res.json();
      setSubjects(prev => [...prev, data]);
      setForm(f => ({ ...f, subject_id: String(data.id) }));
      setNewSubjectName('');
      setShowAddSubject(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let subjectId = form.subject_id;

    // If custom name typed, create subject first
    if (useCustom && form.subject_name.trim()) {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.subject_name }),
      });
      if (res.ok) {
        const data = await res.json();
        subjectId = String(data.id);
      }
    }

    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject_id: subjectId, day: form.day, start_time: form.start_time, end_time: form.end_time }),
    });
    setLoading(false);
    setShowModal(false);
    setForm({ subject_id: '', subject_name: '', day: 'Senin', start_time: '08:00', end_time: '09:00' });
    setUseCustom(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    await fetch('/api/schedules', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };

  return (
    <div style={{padding:'24px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <div style={{fontSize:'20px',fontWeight:'800',color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>Jadwal Pelajaran</div>
          <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>Kelola jadwal mata pelajaran</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:'12px',padding:'10px 16px',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
          + Tambah Jadwal
        </button>
      </div>

      {/* Subjects list */}
      <div style={{background:'#fff',borderRadius:'16px',padding:'16px',marginBottom:'16px',border:'1px solid #e2e8f0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'#1e293b'}}>Mata Pelajaran Tersedia</div>
          <button onClick={() => setShowAddSubject(!showAddSubject)} style={{background:'#eff6ff',color:'#2563eb',border:'none',borderRadius:'8px',padding:'5px 10px',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
            + Tambah Mapel
          </button>
        </div>
        {showAddSubject && (
          <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
            <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="Nama mata pelajaran baru..."
              style={{flex:1,border:'1.5px solid #e2e8f0',borderRadius:'10px',padding:'8px 12px',fontSize:'12px',fontFamily:'inherit',outline:'none'}}/>
            <button onClick={handleAddSubject} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>Simpan</button>
          </div>
        )}
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {subjects.map(s => (
            <span key={s.id} style={{background:'#f1f5f9',color:'#475569',borderRadius:'8px',padding:'4px 10px',fontSize:'11px',fontWeight:'500'}}>{s.name}</span>
          ))}
          {subjects.length === 0 && <span style={{color:'#94a3b8',fontSize:'12px'}}>Belum ada mata pelajaran</span>}
        </div>
      </div>

      {/* Schedule table */}
      <div style={{background:'#fff',borderRadius:'16px',overflow:'hidden',border:'1px solid #e2e8f0'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px',minWidth:'400px'}}>
            <thead>
              <tr style={{background:'linear-gradient(90deg,#1d4ed8,#4338ca)',color:'#fff'}}>
                <th style={{padding:'12px',textAlign:'left',fontWeight:'700'}}>Jam</th>
                {days.map(d => <th key={d} style={{padding:'12px 8px',fontWeight:'700'}}>{d}</th>)}
                <th style={{padding:'12px',fontWeight:'700'}}>Hapus</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{background:'#fff7ed',borderBottom:'1px solid #fed7aa'}}>
                <td style={{padding:'10px 12px',color:'#b45309',fontFamily:'monospace',fontSize:'10px'}}>11:00-13:00</td>
                <td colSpan={5} style={{textAlign:'center',color:'#b45309',fontWeight:'700'}}>ISTIRAHAT</td>
                <td></td>
              </tr>
              {schedules.map(s => (
                <tr key={s.id} style={{borderBottom:'1px solid #f8faff'}}>
                  <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:'10px',color:'#64748b',whiteSpace:'nowrap'}}>{s.start_time}-{s.end_time}</td>
                  {days.map(d => (
                    <td key={d} style={{padding:'10px 8px',textAlign:'center',color: s.day===d ? '#1e293b' : '#cbd5e1',fontWeight: s.day===d ? '600' : '400'}}>
                      {s.day === d ? s.subject : '—'}
                    </td>
                  ))}
                  <td style={{padding:'10px',textAlign:'center'}}>
                    <button onClick={() => handleDelete(s.id)} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'8px',width:'28px',height:'28px',cursor:'pointer',fontSize:'12px'}}>🗑</button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={7} style={{padding:'30px',textAlign:'center',color:'#94a3b8'}}>Belum ada jadwal</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'#fff',borderRadius:'20px',padding:'24px',width:'100%',maxWidth:'420px',boxShadow:'0 24px 64px rgba(0,0,0,0.2)'}}>
            <div style={{fontSize:'16px',fontWeight:'800',color:'#1e293b',marginBottom:'20px',fontFamily:"'Sora',sans-serif"}}>Tambah Jadwal</div>
            <form onSubmit={handleSubmit}>

              {/* Toggle pilih atau ketik */}
              <div style={{marginBottom:'14px'}}>
                <label style={{fontSize:'11px',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'6px'}}>MATA PELAJARAN</label>
                <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                  <button type="button" onClick={() => setUseCustom(false)}
                    style={{flex:1,padding:'7px',borderRadius:'8px',border:`1.5px solid ${!useCustom ? '#2563eb' : '#e2e8f0'}`,background: !useCustom ? '#eff6ff' : '#fff',color: !useCustom ? '#2563eb' : '#64748b',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                    Pilih dari daftar
                  </button>
                  <button type="button" onClick={() => setUseCustom(true)}
                    style={{flex:1,padding:'7px',borderRadius:'8px',border:`1.5px solid ${useCustom ? '#2563eb' : '#e2e8f0'}`,background: useCustom ? '#eff6ff' : '#fff',color: useCustom ? '#2563eb' : '#64748b',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                    Ketik sendiri
                  </button>
                </div>

                {!useCustom ? (
                  <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required={!useCustom}
                    style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'12px',padding:'10px 12px',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}>
                    <option value="">Pilih mata pelajaran...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <input value={form.subject_name} onChange={e => setForm({...form, subject_name: e.target.value})} required={useCustom}
                    placeholder="Ketik nama mata pelajaran..."
                    style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'12px',padding:'10px 12px',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
                )}
              </div>

              <div style={{marginBottom:'14px'}}>
                <label style={{fontSize:'11px',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'6px'}}>HARI</label>
                <select value={form.day} onChange={e => setForm({...form, day: e.target.value})}
                  style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'12px',padding:'10px 12px',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}}>
                <div>
                  <label style={{fontSize:'11px',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'6px'}}>JAM MULAI</label>
                  <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required
                    style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'12px',padding:'10px 12px',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'11px',fontWeight:'600',color:'#64748b',display:'block',marginBottom:'6px'}}>JAM SELESAI</label>
                  <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required
                    style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'12px',padding:'10px 12px',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
                </div>
              </div>

              <div style={{display:'flex',gap:'10px'}}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{flex:1,border:'1.5px solid #e2e8f0',background:'#fff',borderRadius:'12px',padding:'11px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:'#64748b',fontFamily:'inherit'}}>
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  style={{flex:1,background:'#2563eb',border:'none',borderRadius:'12px',padding:'11px',fontSize:'13px',fontWeight:'700',cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity: loading ? 0.7 : 1}}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
