'use client';

import { useEffect, useState } from 'react';

interface Student { id: number; name: string; nis: string; position: string; photo_url: string | null; username: string; }

const POSITIONS = ['Anggota','Ketua','Wakil Ketua','Sekretaris','Bendahara','Wali Kelas'];

const POS_COLOR: Record<string,{bg:string;light:string}> = {
  Ketua:      {bg:'#3b82f6',light:'#eff6ff'},
  'Wakil Ketua':{bg:'#6366f1',light:'#eef2ff'},
  Sekretaris: {bg:'#8b5cf6',light:'#f5f3ff'},
  Bendahara:  {bg:'#f59e0b',light:'#fffbeb'},
  'Wali Kelas':{bg:'#ec4899',light:'#fdf2f8'},
  Anggota:    {bg:'#10b981',light:'#ecfdf5'},
};
const getPC = (p:string) => POS_COLOR[p] || POS_COLOR['Anggota'];

const inputStyle: React.CSSProperties = {
  width:'100%', border:'1.5px solid #e2e8f0', borderRadius:12,
  padding:'10px 12px', fontSize:13, fontFamily:'inherit',
  outline:'none', boxSizing:'border-box', background:'#f8faff',
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Student|null>(null);
  const [form, setForm] = useState({ name:'', nis:'', position:'Anggota', photo_url:'', username:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchData = () => {
    fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)?setStudents(d):null);
  };
  useEffect(()=>{ fetchData(); },[]);

  const openAdd = () => { setEditData(null); setForm({name:'',nis:'',position:'Anggota',photo_url:'',username:'',password:''}); setError(''); setShowModal(true); };
  const openEdit = (s:Student) => { setEditData(s); setForm({name:s.name,nis:s.nis,position:s.position,photo_url:s.photo_url||'',username:s.username,password:''}); setError(''); setShowModal(true); };

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      let res;
      if (editData) {
        res = await fetch(`/api/students/${editData.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:form.name,nis:form.nis,position:form.position,photo_url:form.photo_url}) });
      } else {
        res = await fetch('/api/students', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      }
      const data = await res.json();
      if (!res.ok) { setError(data.error||'Gagal menyimpan'); setLoading(false); return; }
      setShowModal(false); fetchData();
    } catch { setError('Server error'); }
    setLoading(false);
  };

  const handleDelete = async (id:number) => {
    if (!confirm('Hapus siswa ini? Akun loginnya juga akan terhapus.')) return;
    await fetch(`/api/students/${id}`, { method:'DELETE' });
    fetchData();
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search));

  return (
    <div style={{padding:'16px', fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:'#1e293b',fontFamily:"'Sora',sans-serif"}}>👥 Data Siswa</div>
          <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{students.length} siswa terdaftar</div>
        </div>
        <button onClick={openAdd} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:12,padding:'10px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ Tambah</button>
      </div>

      <div style={{position:'relative',marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
          style={{...inputStyle,paddingLeft:38}}/>
        <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:14,opacity:.5}}>🔍</span>
      </div>

      <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #e8eef8',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
        {filtered.length === 0 && <div style={{padding:'40px',textAlign:'center',color:'#94a3b8',fontSize:13}}>Tidak ditemukan</div>}
        {filtered.map((s,i) => {
          const pc = getPC(s.position);
          return (
            <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:i<filtered.length-1?'1px solid #f1f5f9':'none'}}>
              <div style={{width:40,height:40,borderRadius:12,background:pc.light,border:`2px solid ${pc.bg}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:pc.bg,flexShrink:0,overflow:'hidden'}}>
                {s.photo_url ? <img src={s.photo_url} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : s.name[0]?.toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1e293b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div>
                <div style={{fontSize:10,color:'#94a3b8',marginTop:1,fontFamily:'monospace'}}>NIS: {s.nis}</div>
              </div>
              <span style={{display:'inline-block',background:pc.light,color:pc.bg,borderRadius:99,padding:'2px 8px',fontSize:9,fontWeight:700,flexShrink:0}}>{s.position}</span>
              <div style={{display:'flex',gap:4,flexShrink:0}}>
                <button onClick={()=>openEdit(s)} style={{background:'#dbeafe',color:'#2563eb',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✏️</button>
                <button onClick={()=>handleDelete(s.id)} style={{background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:24,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.2)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontSize:16,fontWeight:800,color:'#1e293b',marginBottom:20,fontFamily:"'Sora',sans-serif"}}>{editData ? '✏️ Edit Siswa' : '➕ Tambah Siswa'}</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>NAMA LENGKAP *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Nama lengkap..." style={inputStyle}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>NIS *</label>
                <input value={form.nis} onChange={e=>setForm({...form,nis:e.target.value})} required placeholder="Nomor Induk Siswa..." style={inputStyle}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>JABATAN</label>
                <select value={form.position} onChange={e=>setForm({...form,position:e.target.value})} style={inputStyle}>
                  {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>FOTO URL (opsional)</label>
                <input value={form.photo_url} onChange={e=>setForm({...form,photo_url:e.target.value})} placeholder="https://..." style={inputStyle}/>
              </div>
              {!editData && (
                <>
                  <div style={{background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:10,color:'#0369a1'}}>
                    ✨ Akun login otomatis dibuat untuk siswa ini
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>USERNAME LOGIN *</label>
                    <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required placeholder="Username untuk login..." style={inputStyle}/>
                  </div>
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontWeight:600,color:'#64748b',display:'block',marginBottom:5}}>PASSWORD *</label>
                    <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required placeholder="Password..." style={inputStyle}/>
                  </div>
                </>
              )}
              {error && <div style={{background:'#fee2e2',border:'1px solid #fecaca',borderRadius:10,padding:'8px 12px',color:'#dc2626',fontSize:12,marginBottom:12}}>{error}</div>}
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{flex:1,border:'1.5px solid #e2e8f0',background:'#fff',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'#64748b',fontFamily:'inherit'}}>Batal</button>
                <button type="submit" disabled={loading} style={{flex:1,background:'#2563eb',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:loading?.7:1}}>
                  {loading?'Menyimpan...':'Simpan ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
