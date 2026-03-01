'use client';
import { useEffect, useState } from 'react';

interface Announcement { id:number; title:string; content:string; created_at:string; }

const inputStyle: React.CSSProperties = {
  width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',
  borderRadius:12,padding:'11px 14px',color:'#fff',fontSize:13,fontFamily:'inherit',
  outline:'none',boxSizing:'border-box',transition:'all .2s',
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', content:'' });
  const [loading, setLoading] = useState(false);

  const fetch_ = () => fetch('/api/announcements').then(r=>r.json()).then(d=>Array.isArray(d)&&setItems(d));
  useEffect(()=>{ fetch_(); },[]);

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await fetch('/api/announcements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    setLoading(false); setShowModal(false); setForm({title:'',content:''}); fetch_();
  };
  const del = async(id:number) => { if(!confirm('Hapus pengumuman ini?'))return; await fetch('/api/announcements',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); fetch_(); };

  return (
    <div style={{padding:16,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`input::placeholder,textarea::placeholder{color:rgba(255,255,255,.3)} input:focus,textarea:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.12)!important}`}</style>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>📢 Pengumuman</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2}}>{items.length} pengumuman aktif</div>
        </div>
        <button onClick={()=>setShowModal(true)} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',borderRadius:12,padding:'10px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(99,102,241,.4)'}}>+ Buat</button>
      </div>

      {items.length===0&&<div style={{textAlign:'center',color:'rgba(255,255,255,.3)',padding:'60px 0'}}><div style={{fontSize:40,marginBottom:10}}>📭</div><div style={{fontSize:13}}>Belum ada pengumuman</div></div>}
      {items.map(a=>(
        <div key={a.id} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:18,padding:16,marginBottom:10,borderLeft:'3px solid #6366f1'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:6}}>
            <div style={{fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif",flex:1}}>{a.title}</div>
            <button onClick={()=>del(a.id)} style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.2)',color:'#fca5a5',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🗑</button>
          </div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginBottom:10}}>📅 {new Date(a.created_at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.8}}>{a.content}</div>
        </div>
      ))}

      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#1a1740',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:24,width:'100%',maxWidth:440,boxShadow:'0 32px 80px rgba(0,0,0,.5)'}}>
            <div style={{fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif",color:'#fff',marginBottom:20}}>📢 Buat Pengumuman</div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,letterSpacing:.5,textTransform:'uppercase'}}>Judul *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="Judul pengumuman..." style={inputStyle}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.4)',display:'block',marginBottom:6,letterSpacing:.5,textTransform:'uppercase'}}>Isi Pengumuman *</label>
                <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} required placeholder="Tulis isi pengumuman..." rows={5}
                  style={{...inputStyle,resize:'vertical' as const}}/>
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
