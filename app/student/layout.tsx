import { redirect } from 'next/navigation';
import { getAuthFromCookies } from '@/lib/auth';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const auth = getAuthFromCookies();
  
  if (!auth) redirect('/login');
  // Admin can also view student page
  
  return <>{children}</>;
}
