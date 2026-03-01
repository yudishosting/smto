'use client';
import { useEffect, useState } from 'react';

interface Activity { id:number; title:string; description:string; date:string; }

const inputStyle: React.CSSProperties = {
  width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',
  borderRadius:12,padding:'11px 14px',color:'#fff',fontSize:13,fontFamily:'inherit',
  outline:'none',boxSizing:'border-box',transition:'all .2s',
};

export default function AdminActivities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', date:'' });
  const [loading, setLoading] = useState(false);

  const fetch_ = () => fetch('/api/activities').then(r=>r.json()).then(d=>Array.isArray(d)&&setItems(d));
  useEffect(()=>{ fetch_(); },[]);

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await fetch('/api/activities',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    setLoading(false); setShowModal(false); setForm({title:'',description:'',date:''}); fetch_();
  };
  const del = async(id:number) => { if(!confirm('Hapus kegiatan ini?'))return; await fetch('/api/activities',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); fetch_(); };

  const now = new Date();
  const upcoming = items.filter(a=>new Date(a.date)>=now);
  const past = items.filter(a=>new Date(a.date)<now);

  return (
    <div style={{padding:16,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(255,255,255,.3)} input:focus,textarea:focus{outline:none;border-color:rgba(129,140,248,.6)!important}`}</style>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>🎯 Kegiatan Kelas</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>{upcoming.length} mendatang · {past.length} selesai</div>
        </div>
        <button onClick={()=>setShowModal(true)} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',borderRadius:12,padding:'10px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>+ Tambah</button>
      </div>

      {upcoming.length>0&&(
        <>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Mendatang</div>
          {upcoming.map(a=>(
            <div key={a.id} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:18,padding:14,display:'flex',gap:12,alignItems:'flex-start',marginBottom:10}}>
              <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:14,padding:'10px 12px',textAlign:'center',flexShrink:0,minWidth:50,boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>
                <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1}}>{new Date(a.date).getDate()}</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.7)',marginTop:2}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short'})}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{a.title}</div>
                {a.description&&<div style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.6}}>{a.description}</div>}
              </div>
              <button onClick={()=>del(a.id)} style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.2)',color:'#fca5a5',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🗑</button>
            </div>
          ))}
        </>
      )}

      {past.length>0&&(
        <>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.25)',letterSpacing:1.5,textTransform:'uppercase',margin:'16px 0 10px'}}>🗂 Arsip</div>
          {past.map(a=>(
            <div key={a.id} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:14,padding:'12px 14px',display:'flex',gap:12,alignItems:'center',marginBottom:8,opacity:.6}}>
              <div style={{background:'rgba(255,255,255,.08)',borderRadius:10,padding:'8px 10px',textAlign:'center',flexShrink:0,minWidth:46}}>
                <div style={{fontSize:18,fontWeight:800,lineHeight:1,color:'rgba(255,255,255,.5)'}}>{new Date(a.date).getDate()}</div>
                <div style={{fontSize:8,color:'rgba(255,255,255,.3)',marginTop:1}}>{new Date(a.date).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.5)'}}>{a.title}</div>
              </div>
              <button onClick={()=>del(a.id)} style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.15)',color:'#fca5a5',borderRadius:8,width:26,height:26,cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🗑</button>
            </div>
          ))}
        </>
      )}

      {items.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'60px 0'}}><div style={{fontSize:40,marginBottom:10}}>📭</div><div style={{fontSize:13}}>Belum ada kegiatan</div></div>}

      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,.5)'}}>
            <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",color:'#fff',marginBottom:20}}>🎯 Tambah Kegiatan</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Judul *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="Nama kegiatan..." style={inputStyle}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Tanggal *</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required style={inputStyle}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Keterangan</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Deskripsi singkat..." rows={3} style={{...inputStyle,resize:'vertical' as const}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{flex:1,border:'1px solid rgba(255,255,255,.12)',background:'transparent',borderRadius:12,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',color:'rgba(255,255,255,.6)',fontFamily:'inherit'}}>Batal</button>
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
