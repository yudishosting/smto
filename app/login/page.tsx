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
      else router.push('/student');
    } catch { setError('Terjadi kesalahan. Coba lagi.'); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .login-card { animation: fadeUp .6s ease forwards; }
        .inp:focus { border-color: #818cf8 !important; background: rgba(255,255,255,.12) !important; }
        .btn-login:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,102,241,.5) !important; }
        .btn-login:active { transform: translateY(0); }
      `}</style>

      {/* Decorative blobs */}
      <div style={{position:'absolute',width:340,height:340,borderRadius:'50%',background:'rgba(99,102,241,.15)',top:-100,left:-100,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',background:'rgba(168,85,247,.12)',bottom:-80,right:-80,filter:'blur(60px)'}}/>
      <div style={{position:'absolute',width:60,height:60,borderRadius:16,background:'rgba(255,255,255,.04)',top:80,right:80,animation:'float 6s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,.05)',bottom:120,left:60,animation:'float2 5s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:20,height:20,borderRadius:'50%',background:'rgba(129,140,248,.3)',top:200,left:120,animation:'float 4s ease-in-out infinite'}}/>

      <div className="login-card" style={{width:'100%',maxWidth:400,position:'relative',zIndex:1}}>
        {/* Logo area */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{
            width:72,height:72,margin:'0 auto 16px',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:32,boxShadow:'0 8px 32px rgba(99,102,241,.4)',
          }}>🎓</div>
          <div style={{color:'#fff',fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:-.5}}>SMKN 2 Jember</div>
          <div style={{color:'rgba(255,255,255,.5)',fontSize:13,marginTop:4,fontWeight:500}}>XI TSM 2 · Sistem Informasi Kelas</div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,.07)',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,.12)',
          borderRadius:28,padding:32,
          boxShadow:'0 32px 80px rgba(0,0,0,.4)',
        }}>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label style={{color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',display:'block',marginBottom:8}}>Username</label>
              <input className="inp" type="text" value={username} onChange={e=>setUsername(e.target.value)} required
                placeholder="Masukkan username..."
                style={{width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,padding:'13px 16px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',transition:'all .2s'}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',display:'block',marginBottom:8}}>Password</label>
              <input className="inp" type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                placeholder="Masukkan password..."
                style={{width:'100%',background:'rgba(255,255,255,.08)',border:'1.5px solid rgba(255,255,255,.12)',borderRadius:14,padding:'13px 16px',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',transition:'all .2s'}}/>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.3)',borderRadius:12,padding:'10px 14px',color:'#fca5a5',fontSize:13,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                <span>⚠️</span>{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-login" style={{
              width:'100%',
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff',border:'none',borderRadius:14,
              padding:'14px',fontSize:14,fontWeight:700,cursor:'pointer',
              fontFamily:'inherit',transition:'all .2s',
              boxShadow:'0 4px 20px rgba(99,102,241,.35)',
              opacity:loading?.7:1,
            }}>
              {loading ? '⏳ Memproses...' : 'Masuk ke Kelas →'}
            </button>
          </form>
        </div>

        <div style={{textAlign:'center',marginTop:20,color:'rgba(255,255,255,.25)',fontSize:11}}>
          © 2025 SMKN 2 Jember · XI TSM 2
        </div>
      </div>
    </div>
  );
}
