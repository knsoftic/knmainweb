"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';
import { MotionEffects } from './motion-effects';
import { ContactWidget } from '../sections/contact-widget';
import { resolveImageUrl } from '../../utils/image-url';
import { SiteSettingsProvider, getWhatsappNumber } from './site-settings';

type SiteShellProps = {
  children: React.ReactNode;
  /** Settings loaded on the server by the (site) layout; null if the API failed. */
  initialSettings?: any;
  services?: any[];
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

export function SiteShell({ children, initialSettings = null, services = [] }: SiteShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navPill = useRef<HTMLLIElement>(null);
  const settings = initialSettings;
  const logoUrl = settings?.light_logo_url || settings?.logo_url;
  const siteName = settings?.site_name || 'KN Softic';

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowTop(y > 300);
      // Hide the header while scrolling down past the hero, bring it back on any scroll up.
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) > 8) {
        setHeaderHidden(delta > 0 && y > 480);
        lastScrollY.current = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Glides the soft highlight behind the hovered nav link.
  const showNavPill = (event: React.MouseEvent<HTMLAnchorElement> | React.FocusEvent<HTMLAnchorElement>) => {
    const pill = navPill.current;
    const item = event.currentTarget.parentElement;
    if (!pill || !item) return;
    pill.style.width = `${item.offsetWidth}px`;
    pill.style.transform = `translateX(${item.offsetLeft}px)`;
    pill.style.opacity = '1';
  };
  const hideNavPill = () => {
    if (navPill.current) navPill.current.style.opacity = '0';
  };

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <SiteSettingsProvider settings={settings}>
      <MotionEffects />
      {/* First thing a keyboard reaches, so a visitor can jump past eight navigation links.
          Invisible until it is focused. */}
      <a href="#main-content" className="ks-skip-link">Skip to content</a>
      <span className="ks-scroll-progress" aria-hidden="true"></span>
      <header className={`ks-header${scrolled || menuOpen ? ' is-scrolled' : ''}${headerHidden && !menuOpen ? ' is-hidden' : ''}`}>
        <div className="ks-container ks-header__bar">
          <Link href="/" className="ks-logo" onClick={closeMenu} aria-label={`${siteName} home`}>
            {logoUrl ? (
              <img src={resolveImageUrl(logoUrl)} alt={siteName} />
            ) : (
              <span className="ks-logo__text">
                <span className="ks-logo__name">{siteName}</span>
                <span className="ks-logo__tag">{settings?.website_tagline || 'Software House & IT Institute'}</span>
              </span>
            )}
          </Link>

          <nav aria-label="Main">
            <ul className="ks-nav" onMouseLeave={hideNavPill}>
              <li className="ks-nav__pill" ref={navPill} aria-hidden="true"></li>
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={isActive(item.href) ? 'is-active' : undefined}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onMouseEnter={showNavPill}
                    onFocus={showNavPill}
                    onBlur={hideNavPill}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ks-header__actions">
            <Link href="/contact" className="ks-btn ks-btn--light ks-header__cta">
              Get a Quote <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <button
              type="button"
              className="ks-burger"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="ks-mobile-menu"
            >
              <i className={menuOpen ? 'bi bi-x-lg' : 'bi bi-list'} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div id="ks-mobile-menu" className={`ks-mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`ks-mobile-link${isActive(item.href) ? ' is-active' : ''}`}
                  onClick={closeMenu}
                  tabIndex={menuOpen ? undefined : -1}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="ks-btn ks-btn--primary ks-btn--block" onClick={closeMenu} tabIndex={menuOpen ? undefined : -1}>
            Get a Quote <i className="fa fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </header>

      <main id="main-content">{children}</main>

      {pathname !== '/contact' && <ContactWidget />}

      <SiteFooter settings={settings} services={services} />

      <a
        href={`https://wa.me/${getWhatsappNumber(settings)}?text=Hello!%20I%20visited%20your%20website%20and%20want%20to%20inquire%20about%20your%20services.`}
        className="ks-fab ks-fab--whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <i className="fab fa-whatsapp" aria-hidden="true" />
      </a>

      <button
        className={`ks-fab ks-fab--top${showTop ? ' is-visible' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        tabIndex={showTop ? undefined : -1}
      >
        <i className="fa fa-arrow-up" aria-hidden="true" />
      </button>
    </SiteSettingsProvider>
  );
}
