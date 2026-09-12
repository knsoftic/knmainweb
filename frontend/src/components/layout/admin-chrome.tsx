'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from './admin-shell';

// Admin theme and icon fonts; the public site doesn't load these.
const ADMIN_STYLESHEETS = [
  '/admin/fonts/phosphor/duotone/style.css',
  '/admin/fonts/tabler-icons.min.css',
  '/admin/fonts/feather.css',
  '/admin/fonts/fontawesome.css',
  '/admin/fonts/material.css',
  '/admin/css/style.css',
  '/admin/css/custom.css',
  '/assets/css/animate.css',
];

/** Loads the admin theme and wraps every page except the sign-in screen in the admin shell. */
export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div suppressHydrationWarning>
      {ADMIN_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {isLoginPage ? children : <AdminShell>{children}</AdminShell>}
    </div>
  );
}
