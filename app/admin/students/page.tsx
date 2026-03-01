'use client';
import { useEffect, useState } from 'react';

interface Student { id:number; name:string; nis:string; position:string; photo_url:string|null; }

const POSITIONS = ['Anggota','Ketua','Wakil Ketua','Sekretaris','Bendahara','Wali Kelas'];

const POS_COLOR: Record<string,{bg:string;light:string}> = {
  'Wali Kelas':  {bg:'#ec4899',light:'rgba(236,72,153,.15)'},
  'Ketua':       {bg:'#6366f1',light:'rgba(99,102,241,.15)'},
  'Wakil Ketua': {bg:'#8b5cf6',light:'rgba(139,92,246,.15)'},
  'Sekretaris':  {bg:'#3b82f6',light:'rgba(59,130,246,.15)'},
  'Bendahara':   {bg:'#f59e0b',light:'rgba(245,158,11,.15)'},
  'Anggota':     {bg:'#10b981',light:'rgba(16,185,129,.15)'},
};
const getPC = (p:string) => POS_COLOR[p] || POS_COLOR['Anggota'];

const inp: React.CSSProperties = {
  width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',
  borderRadius:12,padding:'11px 14px',color:'#fff',fontSize:13,fontFamily:'inherit',
  outline:'none',boxSizing:'border-box',transition:'all .2s',
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Student|null>(null);
  const [form, setForm] = useState({name:'',nis:'',position:'Anggota',photo_url:''});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchData = () => fetch('/api/students').then(r=>r.json()).then(d=>Array.isArray(d)&&setStudents(d));
  useEffect(()=>{fetchData();},[]);

  const openAdd = () => { setEditData(null); setForm({name:'',nis:'',position:'Anggota',photo_url:''}); setError(''); setShowModal(true); };
  const openEdit = (s:Student) => { setEditData(s); setForm({name:s.name,nis:s.nis,position:s.position,photo_url:s.photo_url||''}); setError(''); setShowModal(true); };

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      let res;
      if(editData) {
        res = await fetch(`/api/students/${editData.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      } else {
        res = await fetch('/api/students',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      }
      const data = await res.json();
      if(!res.ok){setError(data.error||'Gagal menyimpan');setLoading(false);return;}
      setShowModal(false); fetchData();
    } catch { setError('Server error'); }
    setLoading(false);
  };

  const handleDelete = async(id:number) => {
    if(!confirm('Hapus siswa ini?'))return;
    await fetch(`/api/students/${id}`,{method:'DELETE'});
    fetchData();
  };

  const filtered = students.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase())||s.nis.includes(search)
  );

  const wali     = filtered.filter(s=>s.position==='Wali Kelas');
  const pengurus = filtered.filter(s=>!['Anggota','Wali Kelas'].includes(s.position));
  const anggota  = filtered.filter(s=>s.position==='Anggota');

  const Avatar = ({s}:{s:Student}) => {
    const pc = getPC(s.position);
    return (
      <div style={{width:38,height:38,borderRadius:11,background:pc.light,border:`1.5px solid ${pc.bg}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:pc.bg,overflow:'hidden',flexShrink:0}}>
        {s.photo_url?<img src={s.photo_url} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:s.name[0]?.toUpperCase()}
      </div>
    );
  };

  const Row = ({s}:{s:Student}) => {
    const pc = getPC(s.position);
    return (
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <Avatar s={s}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:1,fontFamily:'monospace'}}>NIS: {s.nis}</div>
        </div>
        <span style={{background:pc.light,color:pc.bg,borderRadius:99,padding:'2px 9px',fontSize:9,fontWeight:700,flexShrink:0,border:`1px solid ${pc.bg}25`}}>{s.position}</span>
        <div style={{display:'flex',gap:5,flexShrink:0}}>
          <button onClick={()=>openEdit(s)} style={{background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.3)',color:'#c7d2fe',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✏️</button>
          <button onClick={()=>handleDelete(s.id)} style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.2)',color:'#fca5a5',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>🗑</button>
        </div>
      </div>
    );
  };

  const Section = ({label,list}:{label:string;list:Student[]}) => list.length===0 ? null : (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,paddingLeft:2}}>{label}</div>
      <div style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,overflow:'hidden'}}>
        {list.map(s=><Row key={s.id} s={s}/>)}
      </div>
    </div>
  );

  return (
    <div style={{padding:16,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        input::placeholder,select option{color:rgba(255,255,255,.3)}
        input:focus,select:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.12)!important}
        select option{background:#1a1740;color:#fff}
      `}</style>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>👥 Data Siswa</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>{students.length} orang terdaftar</div>
        </div>
        <button onClick={openAdd} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',borderRadius:12,padding:'10px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>+ Tambah</button>
      </div>

      <div style={{position:'relative',marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau NIS..."
          style={{...inp,paddingLeft:42}}/>
        <span style={{position:'absolute',left:15,top:'50%',transform:'translateY(-50%)',fontSize:15,opacity:.4}}>🔍</span>
      </div>

      <Section label="Wali Kelas" list={wali}/>
      <Section label="Pengurus" list={pengurus}/>
      <Section label={`Anggota · ${anggota.length} orang`} list={anggota}/>
      {filtered.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.25)',padding:'50px 0',fontSize:13}}>Tidak ditemukan</div>}

      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:400,boxShadow:'0 32px 80px rgba(0,0,0,.6)'}}>
            <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",marginBottom:20}}>{editData?'✏️ Edit Siswa':'➕ Tambah Siswa'}</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Nama Lengkap *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Nama lengkap..." style={inp}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>NIS *</label>
                <input value={form.nis} onChange={e=>setForm({...form,nis:e.target.value})} required placeholder="Nomor Induk Siswa..." style={inp}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Jabatan</label>
                <select value={form.position} onChange={e=>setForm({...form,position:e.target.value})} style={inp}>
                  {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Foto URL <span style={{opacity:.5}}>(opsional)</span></label>
                <input value={form.photo_url} onChange={e=>setForm({...form,photo_url:e.target.value})} placeholder="https://..." style={inp}/>
              </div>
              {error&&<div style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',borderRadius:10,padding:'9px 13px',color:'#fca5a5',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.12)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.5)',fontFamily:'inherit'}}>Batal</button>
                <button type="submit" disabled={loading} style={{flex:1,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,padding:11,fontSize:13,fontWeight:700,cursor:'pointer',color:'#fff',fontFamily:'inherit',opacity:loading?.7:1}}>
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
