"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Grouped so the thirteen pages read as four short lists instead of one long one. */
const SECTIONS = [
  {
    title: '',
    links: [{ name: 'Dashboard', href: '/admin/dashboard', icon: 'fa-tachometer' }],
  },
  {
    title: 'Website content',
    links: [
      { name: 'Homepage', href: '/admin/homepage', icon: 'fa-home' },
      { name: 'Homepage Cards', href: '/admin/homepage-cards', icon: 'fa-th-large' },
      { name: 'Services', href: '/admin/services', icon: 'fa-cogs' },
      { name: 'Courses', href: '/admin/courses', icon: 'fa-graduation-cap' },
      { name: 'Projects', href: '/admin/projects', icon: 'fa-briefcase' },
      { name: 'Categories', href: '/admin/categories', icon: 'fa-tags' },
    ],
  },
  {
    title: 'Blog & people',
    links: [
      { name: 'Blog', href: '/admin/blog', icon: 'fa-book' },
      { name: 'Team & Testimonials', href: '/admin/team-testimonials', icon: 'fa-users' },
      { name: 'Contact Messages', href: '/admin/contact-messages', icon: 'fa-envelope' },
    ],
  },
  {
    title: 'Settings',
    links: [
      { name: 'Global Settings', href: '/admin/settings', icon: 'fa-sliders' },
      { name: 'SEO', href: '/admin/seo', icon: 'fa-search' },
      { name: 'Change Password', href: '/admin/change-password', icon: 'fa-key' },
    ],
  },
];

export function AdminSidebar({ isOpen, isMobile, onClose }: { isOpen?: boolean, isMobile?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Tapping outside closes the drawer on a phone. */}
      {isMobile && isOpen && <div className="admin-sidebar__overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`admin-sidebar${isMobile ? ' is-mobile' : ''}${isOpen ? ' is-open' : ''}`} aria-label="Admin sections">
        <div className="admin-sidebar__header">
          <Link href="/admin/dashboard" className="admin-sidebar__brand" onClick={isMobile ? onClose : undefined}>
            KN Admin
          </Link>
          {isMobile && (
            <button type="button" onClick={onClose} aria-label="Close menu" className="admin-sidebar__close">
              <i className="fa fa-times"></i>
            </button>
          )}
        </div>

        <nav className="admin-sidebar__nav">
          {SECTIONS.map((section, index) => (
            <div className="admin-sidebar__group" key={section.title || index}>
              {section.title && <p className="admin-sidebar__group-title">{section.title}</p>}
              {section.links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={isMobile ? onClose : undefined}
                    className={`admin-sidebar__link${isActive ? ' is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <i className={`fa ${link.icon}`} aria-hidden="true"></i>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__view-site">
            <i className="fa fa-external-link" aria-hidden="true"></i> View website
          </a>
        </div>
      </aside>
    </>
  );
}
