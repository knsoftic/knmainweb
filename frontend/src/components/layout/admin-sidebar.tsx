"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar({ isOpen, isMobile, onClose }: { isOpen?: boolean, isMobile?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'fa-tachometer' },
    { name: 'Homepage Content', href: '/admin/homepage', icon: 'fa-home' },
    { name: 'Services', href: '/admin/services', icon: 'fa-cogs' },
    { name: 'Categories', href: '/admin/categories', icon: 'fa-tags' },
    { name: 'Courses', href: '/admin/courses', icon: 'fa-graduation-cap' },
    { name: 'Projects', href: '/admin/projects', icon: 'fa-briefcase' },
    { name: 'Blog Management', href: '/admin/blog', icon: 'fa-book' },
    { name: 'Contact Messages', href: '/admin/contact-messages', icon: 'fa-envelope' },
    { name: 'Team & Testimonials', href: '/admin/team-testimonials', icon: 'fa-users' },
    { name: 'Global Settings', href: '/admin/settings', icon: 'fa-sliders' },
    { name: 'SEO Management', href: '/admin/seo', icon: 'fa-search' },
    { name: 'Change Password', href: '/admin/change-password', icon: 'fa-key' },
  ];

  const sidebarStyle: React.CSSProperties = {
    width: '260px',
    height: '100vh',
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: isMobile ? (isOpen ? 0 : '-260px') : 0,
    top: 0,
    zIndex: 1000,
    boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
    transition: 'left 0.3s ease'
  };

  return (
    <div className="admin-sidebar" style={sidebarStyle}>
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
      <div className="sidebar-header" style={headerStyle}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Conthrax', 'Inter', sans-serif" }}>KN Admin</h3>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>
      <nav className="sidebar-nav" style={navStyle}>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.name} href={link.href} onClick={isMobile ? onClose : undefined} style={{ ...linkStyle, ...(isActive ? activeLinkStyle : {}) }}>
              <i className={`fa ${link.icon}`} style={iconStyle}></i> {link.name}
            </Link>
          );
        })}
      </nav>
      {/* Footer removed */}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '24px',
  background: 'linear-gradient(135deg, #8D18D0, #3930C7)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px 0',
  overflowY: 'auto'
};

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 24px',
  color: 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  transition: 'all 0.3s ease'
};

const activeLinkStyle: React.CSSProperties = {
  color: '#fff',
  background: 'rgba(255,255,255,0.08)',
  borderLeft: '4px solid #8D18D0'
};

const iconStyle: React.CSSProperties = {
  width: '24px',
  marginRight: '10px',
  textAlign: 'center'
};

const footerStyle: React.CSSProperties = {
  padding: '20px',
  borderTop: '1px solid rgba(255,255,255,0.1)'
};
