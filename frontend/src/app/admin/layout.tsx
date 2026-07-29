'use client';
import { AdminShell } from '../../components/layout/admin-shell';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div suppressHydrationWarning>
      {isLoginPage ? children : <AdminShell>{children}</AdminShell>}
    </div>
  );
}
