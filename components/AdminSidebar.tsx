'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Props { username: string; }

const navItems = [
  { href:'/admin',               label:'Dashboard', icon:'⚡' },
  { href:'/admin/students',      label:'Siswa',     icon:'👥' },
  { href:'/admin/schedules',     label:'Jadwal',    icon:'📅' },
  { href:'/admin/announcements', label:'Info',      icon:'📢' },
  { href:'/admin/activities',    label:'Kegiatan',  icon:'🎯' },
];

export default function AdminSidebar({ username }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Sora:wght@700;800&display=swap');
        .nav-link { transition: all .15s; }
        .nav-link:active { transform: scale(.95); }
        .logout-btn:hover { background: rgba(239,68,68,.25) !important; }
      `}</style>
      <div style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        background:'linear-gradient(135deg,#0f0c29 0%,#302b63 100%)',
        boxShadow:'0 4px 24px rgba(0,0,0,.4)',
        borderBottom:'1px solid rgba(255,255,255,.08)',
      }}>
        {/* Top bar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:'0 4px 12px rgba(99,102,241,.4)'}}>🎓</div>
            <div>
              <div style={{color:'#fff',fontSize:14,fontWeight:800,fontFamily:"'Sora',sans-serif",lineHeight:1.1}}>SMKN 2 Jember</div>
              <div style={{color:'rgba(255,255,255,.45)',fontSize:10,fontWeight:500}}>Admin: {username}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.25)',borderRadius:10,padding:'6px 14px',color:'#fca5a5',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>
            Keluar
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{display:'flex',borderTop:'1px solid rgba(255,255,255,.06)'}}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="nav-link" style={{
                flex:1,minWidth:52,display:'flex',flexDirection:'column',alignItems:'center',
                padding:'9px 4px 8px',textDecoration:'none',gap:3,
                background: isActive ? 'rgba(255,255,255,.08)' : 'transparent',
                borderBottom: isActive ? '2px solid #818cf8' : '2px solid transparent',
                transition:'all .15s',
              }}>
                <span style={{fontSize:17}}>{item.icon}</span>
                <span style={{fontSize:9,fontWeight:700,color:isActive?'#c7d2fe':'rgba(255,255,255,.4)',letterSpacing:.3}}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{height:108}}/>
    </>
  );
}
