"use client";

import Link from 'next/link';
import { useState } from 'react';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';

const backBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem',
  fontWeight: 600, color: '#6c757d', background: '#f8f9fa',
  border: '1px solid #e9ecef', textDecoration: 'none', transition: 'all 0.2s',
};

export default function BlogDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categories: 0,
    tags: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const posts = await apiService.get('/blog/posts');
    const categories = await apiService.get('/blog/categories');
    const tags = await apiService.get('/blog/tags');
    const comments = await apiService.get('/blog/comments');

    return {
      totalPosts: posts.length || 0,
      publishedPosts: posts.filter((p: any) => p.status === 'published').length || 0,
      draftPosts: posts.filter((p: any) => p.status === 'draft').length || 0,
      categories: categories.length || 0,
      tags: tags.length || 0,
      comments: comments.length || 0,
    };
  };

  useLoadOnMount(loadStats, setStats, {
    onError: (err) => console.error('Failed to load blog stats', err),
    onSettled: () => setLoading(false),
  });

  const statCard = (title: string, value: number | string, icon: string, linkHref: string, bgColor: string, lightBg: string) => (
    <Link href={linkHref} style={{ textDecoration: 'none', display: 'block' }}>
      <div 
        style={{ 
          background: '#fff', borderRadius: '16px', padding: '16px 20px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', 
          gap: '12px', border: '1px solid rgba(0,0,0,0.03)', transition: 'all 0.3s ease',
          position: 'relative', overflow: 'hidden'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = lightBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
        }}
      >
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '80px', height: '80px', background: lightBg, borderRadius: '50%', opacity: 0.5, filter: 'blur(15px)', zIndex: 0 }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          <div>
            <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
            <h2 style={{ margin: '6px 0 0', color: '#1a1d20', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
              {loading ? <i className="fa fa-arrows-rotate spin" style={{ fontSize: '1.2rem', color: '#adb5bd', display: 'inline-block', animation: 'spin 1s linear infinite' }}></i> : value}
            </h2>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bgColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: `0 6px 12px ${lightBg}` }}>
            <i className={icon}></i>
          </div>
        </div>
        <div style={{ color: '#8D18D0', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', zIndex: 1, marginTop: '4px' }}>
          Manage <i className="fa fa-arrow-right" style={{ fontSize: '1.1rem' }}></i>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{ paddingBottom: '60px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hero-banner {
          background: linear-gradient(135deg, #7a6ad8 0%, #8D18D0 100%);
          border-radius: 20px;
          padding: 24px 32px;
          color: white;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(122, 106, 216, 0.25);
        }
        .hero-banner::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%);
          z-index: 1;
        }
        .hero-content { position: relative; z-index: 2; display: flex; justify-content: space-between; alignItems: center; flex-wrap: wrap; gap: 16px; }
      `}</style>
      
      {/* Back button removed per request */}

      <div className="hero-banner">
        <div className="hero-content">
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.5px', color: '#ffffff' }}>Blog CMS Dashboard</h2>
            <p style={{ margin: '6px 0 0', fontSize: '1rem', opacity: 0.9, maxWidth: '500px', color: '#ffffff' }}>Manage your complete blog ecosystem, categories, tags, and incoming comments all in one place.</p>
          </div>
          <div>
            <Link href="/admin/blog/posts/editor" style={{ background: '#fff', color: '#8D18D0', textDecoration: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}>
              <i className="fa fa-pen-to-square" style={{ fontSize: '1.1rem' }}></i> Write New Post
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {statCard('Total Posts', stats.totalPosts, 'fa fa-file-lines', '/admin/blog/posts', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'rgba(79, 172, 254, 0.4)')}
        {statCard('Published', stats.publishedPosts, 'fa fa-circle-check', '/admin/blog/posts?status=published', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'rgba(67, 233, 123, 0.4)')}
        {statCard('Drafts', stats.draftPosts, 'fa fa-book-medical', '/admin/blog/posts?status=draft', 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 'rgba(246, 211, 101, 0.4)')}
        {statCard('Categories', stats.categories, 'fa fa-tags', '/admin/blog/categories', 'linear-gradient(135deg, #8D18D0 0%, #3930C7 100%)', 'rgba(141, 24, 208, 0.4)')}
        {statCard('Tags', stats.tags, 'fa fa-hashtag', '/admin/blog/tags', 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 'rgba(255, 8, 68, 0.4)')}
        {statCard('Comments', stats.comments, 'fa fa-comments', '/admin/blog/comments', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'rgba(240, 147, 251, 0.4)')}
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: '#1a1d20', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa fa-compass" style={{ color: '#8D18D0' }}></i> Quick Navigation
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Manage All Posts', href: '/admin/blog/posts', icon: 'fa fa-copy' },
            { label: 'Manage Categories', href: '/admin/blog/categories', icon: 'fa fa-folder' },
            { label: 'Manage Tags', href: '/admin/blog/tags', icon: 'fa fa-tags' },
            { label: 'Manage Comments', href: '/admin/blog/comments', icon: 'fa fa-comment-dots' },
            { label: 'View Public Blog', href: '/blog', icon: 'fa fa-arrow-up-right-from-square' },
          ].map((nav, i) => (
            <Link key={i} href={nav.href} style={{ 
              display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', 
              background: '#f8f9fa', borderRadius: '16px', textDecoration: 'none', 
              color: '#495057', fontWeight: 600, border: '1px solid #e9ecef',
              transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = '#8D18D0';
              e.currentTarget.style.color = '#8D18D0';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(141, 24, 208, 0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.color = '#495057';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <i className={nav.icon} style={{ fontSize: '1.4rem', width: '28px', textAlign: 'center', opacity: 0.8 }}></i>
              <span style={{ fontSize: '1rem' }}>{nav.label}</span>
              <i className="fa fa-chevron-right" style={{ marginLeft: 'auto', fontSize: '0.9rem', opacity: 0.5 }}></i>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
