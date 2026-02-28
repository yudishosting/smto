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
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal');
        setLoading(false);
        return;
      }
      if (data.role === 'admin') router.push('/admin');
      else router.push('/student');
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg,#1e3a8a 0%,#1d4ed8 50%,#4338ca 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Decorative circles */}
      <div style={{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',background:'rgba(255,255,255,0.05)',top:'-150px',left:'-100px'}}/>
      <div style={{position:'absolute',width:'300px',height:'300px',borderRadius:'50%',background:'rgba(255,255,255,0.05)',bottom:'-100px',right:'-80px'}}/>
      <div style={{position:'absolute',width:'60px',height:'60px',borderRadius:'10px',background:'rgba(255,255,255,0.08)',top:'80px',right:'80px',transform:'rotate(20deg)'}}/>
      <div style={{position:'absolute',width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',top:'160px',left:'60px'}}/>
      <div style={{position:'absolute',width:'50px',height:'50px',borderRadius:'10px',background:'rgba(255,255,255,0.08)',bottom:'120px',left:'80px',transform:'rotate(15deg)'}}/>

      <div style={{width:'100%',maxWidth:'400px',position:'relative',zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{
            width:'72px',height:'72px',
            background:'rgba(255,255,255,0.15)',
            borderRadius:'22px',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 16px',
            fontSize:'32px',
            backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,0.2)',
          }}>🎓</div>
          <h1 style={{color:'#fff',fontSize:'26px',fontWeight:'800',margin:'0 0 4px',fontFamily:"'Sora',sans-serif",letterSpacing:'-0.5px'}}>SMKN 2 JEMBER</h1>
          <p style={{color:'#93c5fd',fontSize:'13px',margin:'0 0 4px'}}>XI TSM 2 · Sistem Informasi Kelas</p>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.12)',
          backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:'28px',
          padding:'32px',
          boxShadow:'0 24px 64px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{color:'#fff',fontSize:'18px',fontWeight:'700',textAlign:'center',margin:'0 0 24px',fontFamily:"'Sora',sans-serif"}}>Masuk ke Akun</h2>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'16px'}}>
              <label style={{color:'#bfdbfe',fontSize:'12px',fontWeight:'600',display:'block',marginBottom:'6px',letterSpacing:'0.5px'}}>USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                required
                style={{
                  width:'100%',background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',
                  borderRadius:'14px',padding:'12px 16px',color:'#fff',fontSize:'14px',outline:'none',
                  fontFamily:'inherit',boxSizing:'border-box',
                }}
              />
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{color:'#bfdbfe',fontSize:'12px',fontWeight:'600',display:'block',marginBottom:'6px',letterSpacing:'0.5px'}}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                required
                style={{
                  width:'100%',background:'rgba(255,255,255,0.1)',border:'1.5px solid rgba(255,255,255,0.25)',
                  borderRadius:'14px',padding:'12px 16px',color:'#fff',fontSize:'14px',outline:'none',
                  fontFamily:'inherit',boxSizing:'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'12px',padding:'10px 14px',color:'#fca5a5',fontSize:'13px',marginBottom:'16px'}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%',background:'#fff',color:'#1e3a8a',border:'none',
                borderRadius:'14px',padding:'13px',fontSize:'14px',fontWeight:'700',
                cursor:'pointer',fontFamily:"'Sora',sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Memproses...' : 'Login →'}
            </button>
          </form>
        </div>

        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',textAlign:'center',marginTop:'20px'}}>
          © 2025 SMKN 2 Jember · XI TSM 2
        </p>
      </div>
    </div>
  );
}
