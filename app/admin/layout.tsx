import { redirect } from 'next/navigation';
import { getAuthFromCookies } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = getAuthFromCookies();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') redirect('/student');

  return (
    <div style={{minHeight:'100vh', background:'#f0f4ff', fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <AdminSidebar username={auth.username} />
      <main style={{padding:'0'}}>
        {children}
      </main>
    </div>
  );
}
