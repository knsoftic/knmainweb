"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { apiService } from '../../../../../services/api';
import { resolveImageUrl } from '../../../../../utils/image-url';

// Only the markup the Quill editor produces; everything else (scripts, styles, event handlers) is stripped.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's', 'a',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'span', 'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
  },
  // Quill formatting classes (ql-align-*, ql-indent-*, ql-video, ...).
  allowedClasses: { '*': [/^ql-[a-z0-9-]+$/] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Quill's default image handler embeds pasted/uploaded images as data URIs.
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  allowIframeRelativeUrls: false,
  allowProtocolRelative: false,
  // `style` is never allowed, so skip parsing it.
  parseStyleAttributes: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

const parseTags = (value: any): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

function BlogPostPreviewInner() {
  const searchParams = useSearchParams();
  const slug = (searchParams.get('slug') || '').trim();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [loadError, setLoadError] = useState('');
  const [loadedAt, setLoadedAt] = useState(0);
  const error = slug ? loadError : 'No post was specified for preview.';

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        // With the admin token the API also returns drafts and scheduled posts (and doesn't count a view).
        const data = await apiService.get(`/blog/posts/${encodeURIComponent(slug)}`);
        if (!cancelled) {
          setPost(data);
          setLoadedAt(Date.now());
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError('Failed to load this post. It may have been deleted or its slug changed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const safeContent = useMemo(() => sanitizeHtml(post?.content || '', SANITIZE_OPTIONS), [post?.content]);
  const tags = useMemo(() => parseTags(post?.tags_json), [post?.tags_json]);

  const backLink = (
    <Link href="/admin/blog/posts" style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem',
      fontWeight: 600, color: '#6c757d', background: '#f8f9fa',
      border: '1px solid #e9ecef', textDecoration: 'none',
    }}>
      <i className="fa fa-arrow-left" /> Back to Posts
    </Link>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} />
        <span style={{ color: '#6c757d' }}>Loading preview...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>{backLink}</div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)', fontWeight: 500 }}>
          <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }} />
          {error || 'Post not found.'}
        </div>
      </div>
    );
  }

  const status = post.status || 'draft';
  const isLive = status === 'published'
    || (status === 'scheduled' && !!post.published_at && new Date(post.published_at).getTime() <= loadedAt);

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {backLink}
        <Link href={`/admin/blog/posts/editor?id=${post.id}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem',
          fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #8D18D0, #3930C7)',
          textDecoration: 'none',
        }}>
          <i className="fa fa-pencil" /> Edit Post
        </Link>
      </div>

      {isLive ? (
        <div style={{ marginBottom: '24px', padding: '14px 20px', borderRadius: '12px', background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontWeight: 600 }}>
          <span><i className="fa fa-check-circle" style={{ marginRight: '8px' }} />Preview — this post is live on the public blog.</span>
          <a href={`/blog/${encodeURIComponent(String(post.slug || slug).trim())}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f5132', textDecoration: 'underline' }}>
            View public page
          </a>
        </div>
      ) : (
        <div style={{ marginBottom: '24px', padding: '14px 20px', borderRadius: '12px', background: '#fff3cd', color: '#664d03', border: '1px solid #ffe69c', fontWeight: 600 }}>
          <i className="fa fa-eye-slash" style={{ marginRight: '8px' }} />
          Draft preview — not public.
          <span style={{ fontWeight: 400, marginLeft: '8px' }}>
            {status === 'scheduled'
              ? (post.published_at ? `Scheduled to publish on ${formatDate(post.published_at)}.` : 'Scheduled, but no publish date is set.')
              : 'Only admins can see this page.'}
          </span>
        </div>
      )}

      <article style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: 'clamp(20px, 5vw, 48px)', maxWidth: '900px', margin: '0 auto' }}>
        {post.category_name && (
          <span style={{ display: 'inline-block', background: 'rgba(122,106,216,0.1)', color: '#7a6ad8', padding: '4px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(122,106,216,0.2)', marginBottom: '16px' }}>
            {post.category_name}
          </span>
        )}

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#1e1e1e', lineHeight: 1.25, margin: '0 0 16px', overflowWrap: 'break-word' }}>
          {post.title || 'Untitled post'}
        </h1>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666', paddingBottom: '24px', borderBottom: '1px solid #eee', marginBottom: '28px' }}>
          <span><i className="fa fa-user" style={{ marginRight: '6px', color: '#7a6ad8' }} />{post.author || 'Admin'}</span>
          {(post.published_at || post.created_at) && (
            <span><i className="far fa-calendar" style={{ marginRight: '6px', color: '#7a6ad8' }} />{formatDate(post.published_at || post.created_at)}</span>
          )}
          {post.reading_time && (
            <span><i className="far fa-clock" style={{ marginRight: '6px', color: '#7a6ad8' }} />{post.reading_time} min read</span>
          )}
        </div>

        {post.featured_image && (
          <img
            src={resolveImageUrl(post.featured_image)}
            alt={post.title || 'Featured image'}
            style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', borderRadius: '16px', marginBottom: '32px', display: 'block' }}
          />
        )}

        {safeContent ? (
          <div className="admin-post-preview-body" dangerouslySetInnerHTML={{ __html: safeContent }} />
        ) : (
          <p style={{ color: '#adb5bd', fontStyle: 'italic' }}>This post has no content yet.</p>
        )}

        {tags.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e1e1e', fontSize: '0.9rem' }}>
              <i className="fa fa-tags" style={{ marginRight: '6px', color: '#7a6ad8' }} />Tags:
            </span>
            {tags.map((tag) => (
              <span key={tag} style={{ background: 'rgba(122,106,216,0.08)', color: '#7a6ad8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                # {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <style>{`
        .admin-post-preview-body { font-size: 1.05rem; line-height: 1.85; color: #3a3a3a; overflow-wrap: break-word; }
        .admin-post-preview-body * { max-width: 100%; }
        .admin-post-preview-body h1, .admin-post-preview-body h2, .admin-post-preview-body h3,
        .admin-post-preview-body h4, .admin-post-preview-body h5, .admin-post-preview-body h6 { color: #1e1e1e; font-weight: 700; line-height: 1.3; margin: 32px 0 16px; }
        .admin-post-preview-body p { margin-bottom: 20px; }
        .admin-post-preview-body ul, .admin-post-preview-body ol { margin-bottom: 20px; padding-left: 24px; }
        .admin-post-preview-body li { margin-bottom: 8px; }
        .admin-post-preview-body blockquote { border-left: 4px solid #7a6ad8; background: #f6f5ff; padding: 16px 20px; margin: 24px 0; border-radius: 0 12px 12px 0; font-style: italic; color: #555; }
        .admin-post-preview-body pre { background: #1e1e1e; color: #f8f8f2; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 24px 0; font-size: 0.9rem; white-space: pre; }
        .admin-post-preview-body a { color: #8D18D0; text-decoration: underline; }
        .admin-post-preview-body img { height: auto; border-radius: 12px; margin: 24px 0; display: block; }
        .admin-post-preview-body iframe { width: 100%; aspect-ratio: 16 / 9; height: auto; border: 0; border-radius: 12px; margin: 24px 0; display: block; }
        .admin-post-preview-body .ql-align-center { text-align: center; }
        .admin-post-preview-body .ql-align-right { text-align: right; }
        .admin-post-preview-body .ql-align-justify { text-align: justify; }
        .admin-post-preview-body .ql-indent-1 { padding-left: 3em; }
        .admin-post-preview-body .ql-indent-2 { padding-left: 6em; }
        .admin-post-preview-body .ql-indent-3 { padding-left: 9em; }
      `}</style>
    </div>
  );
}

export default function BlogPostPreview() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} />
        <span style={{ color: '#6c757d' }}>Loading preview...</span>
      </div>
    }>
      <BlogPostPreviewInner />
    </Suspense>
  );
}
