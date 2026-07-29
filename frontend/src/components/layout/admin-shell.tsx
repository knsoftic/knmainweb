"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from './admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsCheckingAuth(false);
    }
    
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    router.replace('/admin/login');
  };

  if (isCheckingAuth) return null;

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9', color: '#333' }}>
      <AdminSidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
      
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <div className="admin-main" style={{ 
        flex: 1, 
        minWidth: 0,
        paddingLeft: isMobile ? '0' : '260px', 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'padding-left 0.3s ease' 
      }}>
        <header className="admin-header" style={{ minHeight: '70px', background: '#fff', borderBottom: '1px solid #e0e4e8', display: 'flex', alignItems: 'center', padding: isMobile ? '10px 15px' : '0 30px', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#1e1e1e', cursor: 'pointer', padding: '5px' }}
              >
                <i className="fa fa-bars"></i>
              </button>
            )}
            <h5 style={{ margin: 0, fontWeight: 600, color: '#1e1e1e', fontSize: isMobile ? '1.1rem' : '1.25rem', whiteSpace: 'nowrap' }}>Admin Dashboard</h5>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '15px' }}>
            <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8D18D0', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginRight: isMobile ? '0' : '10px', background: 'rgba(141, 24, 208, 0.08)', padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(141, 24, 208, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(141, 24, 208, 0.08)'; }}
            >
              <i className="fa fa-external-link"></i> {!isMobile && 'View Website'}
            </Link>
            <div style={{ width: isMobile ? '30px' : '35px', height: isMobile ? '30px' : '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #8D18D0, #3930C7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '1rem' }}>A</div>
            {!isMobile && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>Admin User</span>}
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: isMobile ? '1.2rem' : '0.9rem', fontWeight: 500, marginLeft: isMobile ? '0' : '10px', padding: isMobile ? '5px' : '0' }}
              title="Logout"
            >
              {!isMobile && 'Logout '} <i className="fa fa-sign-out"></i>
            </button>
          </div>
        </header>
        <main className="admin-content" style={{ padding: isMobile ? '15px' : '30px', flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}