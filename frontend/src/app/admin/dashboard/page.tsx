'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';

type Stats = Record<string, number>;

const CARDS = [
  { key: 'services', title: 'Services', href: '/admin/services', icon: 'fa-cogs', color: '#8D18D0' },
  { key: 'courses', title: 'Courses', href: '/admin/courses', icon: 'fa-graduation-cap', color: '#3930C7' },
  { key: 'projects', title: 'Projects', href: '/admin/projects', icon: 'fa-briefcase', color: '#7a6ad8' },
  { key: 'team', title: 'Team members', href: '/admin/team-testimonials', icon: 'fa-users', color: '#00897b' },
  { key: 'testimonials', title: 'Testimonials', href: '/admin/team-testimonials', icon: 'fa-comments', color: '#b84af5' },
  { key: 'contact_messages', title: 'Messages', href: '/admin/contact-messages', icon: 'fa-envelope', color: '#e8710a' },
];

const SHORTCUTS = [
  { label: 'Add a service', href: '/admin/services', icon: 'fa-plus' },
  { label: 'Add a course', href: '/admin/courses', icon: 'fa-plus' },
  { label: 'Add a project', href: '/admin/projects', icon: 'fa-plus' },
  { label: 'Write a blog post', href: '/admin/blog/posts/editor', icon: 'fa-pencil' },
  { label: 'Read messages', href: '/admin/contact-messages', icon: 'fa-inbox' },
  { label: 'Homepage content', href: '/admin/homepage', icon: 'fa-home' },
  { label: 'Site settings', href: '/admin/settings', icon: 'fa-sliders' },
  { label: 'SEO', href: '/admin/seo', icon: 'fa-search' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLoadOnMount(
    () => apiService.get('/dashboard/stats'),
    (data) => setStats(data),
    {
      onError: () => setError('Could not load the dashboard figures. Check that the API is running, then refresh.'),
      onSettled: () => setLoading(false),
    }
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>An overview of your website content. Pick a card or a shortcut to start editing.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="admin-page-head__action">
          <i className="fa fa-external-link" aria-hidden="true"></i> View website
        </a>
      </header>

      {error && (
        <div className="admin-note admin-note--error">
          <i className="fa fa-exclamation-circle" aria-hidden="true"></i> {error}
        </div>
      )}

      <div className="admin-stats">
        {CARDS.map((card) => (
          <Link href={card.href} key={card.key} className="admin-stat">
            <span className="admin-stat__icon" style={{ background: `${card.color}15`, color: card.color }}>
              <i className={`fa ${card.icon}`} aria-hidden="true"></i>
            </span>
            <span className="admin-stat__body">
              <span className="admin-stat__value">{loading ? '—' : (stats?.[card.key] ?? 0)}</span>
              <span className="admin-stat__label">{card.title}</span>
            </span>
            <i className="fa fa-angle-right admin-stat__go" aria-hidden="true"></i>
          </Link>
        ))}
      </div>

      <section className="admin-card">
        <h2>Quick actions</h2>
        <div className="admin-shortcuts">
          {SHORTCUTS.map((shortcut) => (
            <Link href={shortcut.href} key={shortcut.label} className="admin-shortcut">
              <i className={`fa ${shortcut.icon}`} aria-hidden="true"></i> {shortcut.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-card admin-help">
        <h2>Getting around</h2>
        <ul>
          <li><strong>Website content</strong> — everything visitors see: homepage, services, courses, projects.</li>
          <li><strong>Blog &amp; people</strong> — posts, your team, testimonials and messages from the contact form.</li>
          <li><strong>Settings</strong> — company details, contact information, social links, and SEO.</li>
          <li>Changes appear on the website within a minute of saving.</li>
        </ul>
      </section>
    </div>
  );
}
