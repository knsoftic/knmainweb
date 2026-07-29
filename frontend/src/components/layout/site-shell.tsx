"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';
import { ContactWidget } from '../sections/contact-widget';
import { resolveImageUrl } from '../../utils/image-url';
import { apiService } from '../../services/api';
import { getSetting } from '../../utils/settings';

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Courses', href: '/courses' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiService.get('/settings')
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === '/') {
        return pathname === '/';
      }

      return pathname === href || pathname.startsWith(`${href}/`);
    };
  }, [pathname]);

  return (
    <>
      {/* Preloader removed as per user request */}

      <header className={`header-area header-sticky${showTop ? ' background-header' : ''}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav className="main-nav">
                <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                    {settings?.light_logo_url || settings?.logo_url ? (
                      <img
                        src={resolveImageUrl(settings?.light_logo_url || settings?.logo_url)}
                        alt={settings?.site_name || 'KN Softic'}
                        style={{ maxHeight: '120px', width: 'auto', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                        <div style={{ whiteSpace: 'nowrap', fontFamily: "'Conthrax', 'Inter', sans-serif", fontSize: '1.5rem', margin: 0, fontWeight: 'bold', color: '#fff' }}>
                          {settings?.site_name || 'KN Softic'}
                        </div>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8, color: '#ffffff', letterSpacing: '0.02em', marginTop: '2px' }}>{settings?.website_tagline || 'Software House & IT Institute'}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <ul className={`nav${menuOpen ? ' open' : ''}`}>
                  {navItems.map((item) => (
                    <li key={item.label} className="scroll-to-section">
                      <Link href={item.href} className={isActive(item.href) ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`menu-trigger${menuOpen ? ' active' : ''}`}
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-label="Toggle menu"
                >
                  <span>Menu</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {pathname !== '/contact' && <ContactWidget />}

      <SiteFooter settings={settings} />

      <a
        href={`https://wa.me/${(settings?.whatsapp_number || settings?.contact_phone || '923001234567').replace(/\D/g, '')}?text=Hello!%20I%20visited%20your%20website%20and%20want%20to%20inquire%20about%20your%20services.`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <i className="fab fa-whatsapp whatsapp-icon" />
      </a>

      <button
        id="backToTop"
        className={`back-to-top${showTop ? ' show' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <i className="fa fa-arrow-up" />
      </button>
    </>
  );
}