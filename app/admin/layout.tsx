import { redirect } from 'next/navigation';
import { getAuthFromCookies } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = getAuthFromCookies();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') redirect('/student');

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c29 0%,#302b63 60%,#24243e 100%)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <AdminSidebar username={auth.username} />
      <main>{children}</main>
    </div>
  );
}
