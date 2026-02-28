'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Props { username: string; }

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/students', label: 'Siswa', icon: '👥' },
  { href: '/admin/schedules', label: 'Jadwal', icon: '📅' },
  { href: '/admin/announcements', label: 'Pengumuman', icon: '📢' },
  { href: '/admin/activities', label: 'Kegiatan', icon: '🎯' },
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
      {/* TOP NAV BAR - full width mobile */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
        boxShadow:'0 2px 16px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{width:'36px', height:'36px', background:'rgba(255,255,255,0.2)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>🎓</div>
            <div>
              <div style={{color:'#fff', fontSize:'14px', fontWeight:'800', fontFamily:"'Sora',sans-serif", lineHeight:1}}>SMKN 2 Jember</div>
              <div style={{color:'#93c5fd', fontSize:'10px'}}>Admin: {username}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'6px 12px', color:'#fca5a5', fontSize:'11px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit'}}>
            Keluar
          </button>
        </div>

        {/* Bottom nav tabs */}
        <div style={{display:'flex', overflowX:'auto'}}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                flex:1, minWidth:'60px', display:'flex', flexDirection:'column', alignItems:'center',
                padding:'8px 4px 6px', textDecoration:'none', gap:'2px',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderBottom: isActive ? '3px solid #fff' : '3px solid transparent',
                transition:'all .15s',
              }}>
                <span style={{fontSize:'18px'}}>{item.icon}</span>
                <span style={{fontSize:'9px', fontWeight:'700', color: isActive ? '#fff' : 'rgba(255,255,255,0.6)', letterSpacing:'0.3px'}}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer so content doesnt hide behind fixed nav */}
      <div style={{height:'100px'}} />
    </>
  );
}
