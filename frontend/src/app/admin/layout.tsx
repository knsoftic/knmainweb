import type { Metadata } from 'next';
import { AdminChrome } from '../../components/layout/admin-chrome';

// The admin panel must never be indexed, whatever robots.txt happens to say.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
