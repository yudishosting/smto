'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login gagal'); setLoading(false); return; }
      if (data.role === 'admin') router.push('/admin');
      else { setError('Akun ini bukan admin.'); setLoading(false); }
    } catch { setError('Terjadi kesalahan. Coba lagi.'); setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#0f0c29,#302b63,#24243e)',
      display:'flex',alignItems:'center',justifyContent:'center',
      padding:20,fontFamily:"'Plus Jakarta Sans',sans-serif",
      position:'relative',overflow:'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .card{animation:fadeUp .5s ease forwards}
        .inp:focus{outline:none;border-color:rgba(129,140,248,.6)!important;background:rgba(255,255,255,.12)!important}
        .inp::placeholder{color:rgba(255,255,255,.3)}
        .btn:hover{transform:translateY(-1px);box-shadow:0 10px 32px rgba(99,102,241,.5)!important}
        .btn:active{transform:translateY(0)}
      `}</style>

      <div style={{position:'absolute',width:320,height:320,borderRadius:'50%',background:'rgba(99,102,241,.12)',top:-80,left:-80,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:260,height:260,borderRadius:'50%',background:'rgba(168,85,247,.1)',bottom:-60,right:-60,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:50,height:50,borderRadius:14,background:'rgba(255,255,255,.04)',top:80,right:80,animation:'float 6s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,.05)',bottom:120,left:60,animation:'float 4s ease-in-out infinite'}}/>

      <div className="card" style={{width:'100%',maxWidth:380,position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:68,height:68,margin:'0 auto 14px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,boxShadow:'0 8px 28px rgba(99,102,241,.45)'}}>🎓</div>
          <div style={{color:'#fff',fontSize:22,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.3}}>SMKN 2 Jember</div>
          <div style={{color:'rgba(255,255,255,.4)',fontSize:12,marginTop:4}}>XI TSM 2 · Panel Admin</div>
        </div>

        <div style={{background:'rgba(255,255,255,.07)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:24,padding:28,boxShadow:'0 24px 64px rgba(0,0,0,.4)'}}>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:14}}>
              <label style={{color:'rgba(255,255,255,.5)',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',display:'block',marginBottom:7}}>Username Admin</label>
              <input className="inp" type="text" value={username} onChange={e=>setUsername(e.target.value)} required placeholder="Username..."
                style={{width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:13,padding:'12px 15px',color:'#fff',fontSize:14,fontFamily:'inherit',transition:'all .2s'}}/>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{color:'rgba(255,255,255,.5)',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',display:'block',marginBottom:7}}>Password</label>
              <input className="inp" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Password..."
                style={{width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:13,padding:'12px 15px',color:'#fff',fontSize:14,fontFamily:'inherit',transition:'all .2s'}}/>
            </div>

            {error&&(
              <div style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',borderRadius:11,padding:'9px 13px',color:'#fca5a5',fontSize:12,marginBottom:14,display:'flex',gap:7,alignItems:'center'}}>
                <span>⚠️</span>{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn" style={{
              width:'100%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',
              border:'none',borderRadius:13,padding:'13px',fontSize:14,fontWeight:700,
              cursor:'pointer',fontFamily:'inherit',transition:'all .2s',
              boxShadow:'0 4px 18px rgba(99,102,241,.35)',opacity:loading?.7:1,
            }}>
              {loading?'⏳ Memproses...':'Masuk sebagai Admin →'}
            </button>
          </form>

          <div style={{marginTop:16,textAlign:'center'}}>
            <a href="/student" style={{color:'rgba(255,255,255,.3)',fontSize:11,textDecoration:'none',fontWeight:500}}>
              ← Kembali ke halaman kelas
            </a>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:16,color:'rgba(255,255,255,.2)',fontSize:10}}>© 2025 SMKN 2 Jember · XI TSM 2</div>
      </div>
    </div>
  );
}
