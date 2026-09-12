"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../../../components/common/admin-form-elements';
import { apiService } from '../../../../../services/api';
import { useLoadOnMount } from '../../../../../utils/use-load-on-mount';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { confirmAction, notify } from '../../../../../components/common/admin-feedback';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: 8 }}>
      <i className="fa fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#8D18D0' }} />
    </div>
  ),
});

// <input type="datetime-local"> works in local time, so build "YYYY-MM-DDTHH:mm" from local components
// (toISOString() is UTC and shifted the date by the UTC offset on every save).
const toLocalDateTimeInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// A datetime-local value (no offset) is parsed as local time; send it to the API as an ISO 8601 UTC string.
const fromLocalDateTimeInput = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

// The admin list endpoint includes drafts and scheduled posts.
const findPost = async (postId: string) => {
  const posts = await apiService.get('/blog/posts');
  return (Array.isArray(posts) ? posts : []).find((p: any) => String(p.id) === postId) || null;
};

function BlogPostEditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  // Status as last saved on the server (null for a new post); decides whether the primary action is "Update".
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick-add state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const [post, setPost] = useState<any>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    tags_json: [],
    status: 'draft',
    is_featured: false,
    allow_comments: true,
    author: 'Admin',
    reading_time: '',
    published_at: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card: 'summary_large_image',
  });

  const loadMetadata = async () => {
    const [cats, tgs] = await Promise.all([
      apiService.get('/blog/categories'),
      apiService.get('/blog/tags'),
    ]);
    return { cats: (cats || []) as any[], tgs: (tgs || []) as any[] };
  };

  const applyMetadata = ({ cats, tgs }: { cats: any[]; tgs: any[] }) => {
    setCategories(cats);
    setTags(tgs);
  };

  const fetchMetadata = async () => {
    try {
      applyMetadata(await loadMetadata());
    } catch (e) {
      console.error(e);
    }
  };

  useLoadOnMount(loadMetadata, applyMetadata);

  const handleQuickAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name || addingCategory) return;
    setAddingCategory(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const res = await apiService.post('/blog/categories', { name, slug, display_order: 0 });
      await fetchMetadata();
      // The create endpoint returns the new row's id; select it once it's in the refreshed list.
      if (res?.id != null) set('category_id', String(res.id));
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (e) {
      notify('Failed to create category');
    }
    setAddingCategory(false);
  };

  const handleQuickAddTag = async () => {
    const name = newTagName.trim();
    if (!name || addingTag) return;
    setAddingTag(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      await apiService.post('/blog/tags', { name, slug });
      await fetchMetadata();
      // Auto-select the new tag
      set('tags_json', [...(post.tags_json || []), name]);
      setNewTagName('');
      setShowAddTag(false);
    } catch (e) {
      notify('Failed to create tag');
    }
    setAddingTag(false);
  };

  // Editing an existing post: load it once the id is known; state is set when the data arrives.
  useEffect(() => {
    if (!id) return;
    let active = true;
    findPost(id)
      .then((current) => {
        if (!active || !current) return;
        setSavedStatus(current.status || null);
        setPost({
          ...current,
          // Normalise published_at to the datetime-local input format (local time)
          published_at: toLocalDateTimeInput(current.published_at),
          tags_json: typeof current.tags_json === 'string'
            ? (() => { try { return JSON.parse(current.tags_json); } catch { return []; } })()
            : (current.tags_json || []),
        });
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (_e: React.MouseEvent | React.FormEvent, status: 'draft' | 'published' | 'scheduled') => {
    if ('preventDefault' in _e) _e.preventDefault();
    if (saving) return;

    if (status === 'scheduled' && !post.published_at) {
      notify('Pick a publish date to schedule this post.');
      return;
    }
    if (status === 'draft' && savedStatus === 'published' && !await confirmAction('This post is live. Saving it as a draft will unpublish it. Continue?')) {
      return;
    }

    setSaving(true);

    try {
      const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Convert empty strings to null for optional fields (MySQL DATETIME/INT won't accept "")
      const nullIfEmpty = (val: any) => (val === '' || val === undefined ? null : val);

      const payload = {
        ...post,
        slug,
        status,
        category_id: post.category_id ? parseInt(post.category_id) : null,
        reading_time: post.reading_time ? parseInt(post.reading_time) : null,
        published_at: fromLocalDateTimeInput(post.published_at),
        canonical_url: nullIfEmpty(post.canonical_url),
        og_title: nullIfEmpty(post.og_title),
        og_description: nullIfEmpty(post.og_description),
        og_image: nullIfEmpty(post.og_image),
        meta_title: nullIfEmpty(post.meta_title),
        meta_description: nullIfEmpty(post.meta_description),
        meta_keywords: nullIfEmpty(post.meta_keywords),
      };

      if (id) {
        await apiService.put(`/blog/posts/${id}`, payload);
      } else {
        await apiService.post('/blog/posts', payload);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.push('/admin/blog/posts');
    } catch (err: any) {
      notify(err.message || 'Failed to save post. Please try again.');
      setSaving(false);
    }
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  }), []);

  const p = (key: string) => post[key] ?? '';
  const set = (key: string, val: any) => setPost((prev: any) => ({ ...prev, [key]: val }));

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.93rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'Inter, sans-serif',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} />
        <span style={{ color: '#6c757d' }}>Loading editor...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Content', icon: 'far fa-file-alt' },
    { id: 'seo', label: 'SEO', icon: 'fa fa-search' },
    { id: 'settings', label: 'Open Graph & Social', icon: 'fa fa-share-alt' },
  ];

  // "Save Draft" always saves a draft. The primary action schedules when the status select is "Scheduled";
  // otherwise it publishes, or — for a post that's already live — updates it and keeps it published.
  const primaryStatus: 'published' | 'scheduled' = p('status') === 'scheduled' ? 'scheduled' : 'published';
  const primaryLabel = primaryStatus === 'scheduled' ? 'Schedule' : savedStatus === 'published' ? 'Update' : 'Publish';
  const primaryIcon = primaryStatus === 'scheduled' ? 'far fa-clock' : savedStatus === 'published' ? 'fa fa-check' : 'far fa-paper-plane';

  // Every tag on the post gets a removable chip, including names no longer in the tag list (renamed/deleted).
  const postTags: string[] = Array.isArray(post.tags_json) ? post.tags_json : [];
  const knownTagNames = new Set(tags.map((t) => t.name));

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50', fontSize: '1.6rem' }}>
            {id ? 'Edit Post' : 'Write New Post'}
          </h2>
          {id && <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: '0.9rem' }}>ID: {id}</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <AdminButton type="button" variant="secondary" onClick={() => router.push('/admin/blog/posts')}>
            <i className="fa fa-arrow-left" /> Cancel
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={(e) => handleSave(e, 'draft')} disabled={saving}>
            <i className="far fa-save" /> Save Draft
          </AdminButton>
          <AdminButton type="button" onClick={(e) => handleSave(e, primaryStatus)} disabled={saving}>
            {saving ? <><i className="fa fa-spinner fa-spin" /> Saving...</> : <><i className={primaryIcon} /> {primaryLabel}</>}
          </AdminButton>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#d1e7dd', border: '1px solid #badbcc', color: '#0f5132', borderRadius: '8px', padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa fa-check-circle" /> Post saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef', gap: '2px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #8D18D0' : '2px solid transparent',
                  marginBottom: '-2px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: activeTab === tab.id ? '#8D18D0' : '#6c757d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.2s',
                }}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: '20px' }}>
                <AdminInput
                  label="Post Title *"
                  value={p('title')}
                  onChange={(e) => set('title', e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <AdminTextarea
                  label="Short Excerpt (shown on listing page)"
                  value={p('excerpt')}
                  onChange={(e) => set('excerpt', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#343a40', fontSize: '0.9rem' }}>Content Body *</label>
                <ReactQuill
                  theme="snow"
                  value={p('content')}
                  onChange={(val) => set('content', val)}
                  modules={modules}
                  style={{ height: '420px', marginBottom: '56px' }}
                />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AdminInput
                label="SEO Title (Meta Title)"
                value={p('meta_title')}
                onChange={(e) => set('meta_title', e.target.value)}
              />
              <AdminTextarea
                label="SEO Meta Description"
                value={p('meta_description')}
                onChange={(e) => set('meta_description', e.target.value)}
              />
              <AdminInput
                label="Meta Keywords (comma separated)"
                value={p('meta_keywords')}
                onChange={(e) => set('meta_keywords', e.target.value)}
              />
              <AdminInput
                label="URL Slug (leave blank to auto-generate from title)"
                value={p('slug')}
                onChange={(e) => set('slug', e.target.value)}
              />
              <AdminInput
                label="Canonical URL (optional)"
                value={p('canonical_url')}
                onChange={(e) => set('canonical_url', e.target.value)}
              />

              {/* Live preview */}
              <div style={{ background: '#f6f5ff', borderRadius: '10px', padding: '20px', border: '1px solid rgba(122,106,216,0.12)' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: '#7a6ad8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Google Preview</p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#1a0dab', fontWeight: 500 }}>{p('meta_title') || p('title') || 'Post Title'}</p>
                <p style={{ margin: '2px 0', fontSize: '0.83rem', color: '#006621' }}>
                  {typeof window !== 'undefined' ? window.location.hostname : 'knsoftic.com'}/blog/{p('slug') || '...'}
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#545454' }}>{p('meta_description') || p('excerpt') || 'No description set.'}</p>
              </div>
            </div>
          )}

          {/* Open Graph / Social Tab */}
          {activeTab === 'settings' && (
            <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 18px', background: '#f6f5ff', borderRadius: '8px', border: '1px solid rgba(122,106,216,0.12)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <i className="fa fa-info-circle" style={{ color: '#7a6ad8', marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>
                  Open Graph fields control how this post appears when shared on Facebook, LinkedIn etc. Twitter Card controls Twitter previews. Leave blank to inherit from SEO fields.
                </p>
              </div>

              <AdminInput
                label="OG Title (Facebook / LinkedIn title)"
                value={p('og_title')}
                onChange={(e) => set('og_title', e.target.value)}
              />
              <AdminTextarea
                label="OG Description"
                value={p('og_description')}
                onChange={(e) => set('og_description', e.target.value)}
              />
              <AdminImageUpload
                label="OG Image (1200×630 recommended)"
                value={p('og_image')}
                onChange={(url) => set('og_image', url)}
              />

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#343a40', fontSize: '0.9rem' }}>Twitter Card Type</label>
                <select
                  value={p('twitter_card')}
                  onChange={(e) => set('twitter_card', e.target.value)}
                  style={{ ...inputStyle, background: '#fff' }}
                >
                  <option value="summary_large_image">Summary with Large Image (recommended)</option>
                  <option value="summary">Summary (small image)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Publishing */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ margin: '0 0 14px 0', fontWeight: 700, color: '#2c3e50', fontSize: '1rem' }}>
              <i className="far fa-paper-plane" style={{ marginRight: 8, color: '#7a6ad8' }} />Publishing
            </h5>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '6px', fontWeight: 600 }}>Status</label>
              <select
                value={p('status')}
                onChange={(e) => set('status', e.target.value)}
                style={{ ...inputStyle, background: '#fff' }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '6px', fontWeight: 600 }}>Publish Date</label>
              <input
                type="datetime-local"
                value={p('published_at')}
                onChange={(e) => set('published_at', e.target.value)}
                style={{ ...inputStyle }}
              />
              {p('status') === 'scheduled' && (
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#6c757d' }}>
                  The post goes live automatically at this date and time.
                </p>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#495057' }}>
                <input type="checkbox" checked={!!post.is_featured} onChange={(e) => set('is_featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                ⭐ Featured Post
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#495057' }}>
                <input type="checkbox" checked={!!post.allow_comments} onChange={(e) => set('allow_comments', e.target.checked)} style={{ width: 16, height: 16 }} />
                💬 Allow Comments
              </label>
            </div>
          </div>

          {/* Categorization */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ margin: '0 0 14px 0', fontWeight: 700, color: '#2c3e50', fontSize: '1rem' }}>
              <i className="fa fa-tag" style={{ marginRight: 8, color: '#7a6ad8' }} />Categorization
            </h5>

            {/* Category */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Category</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory((v) => !v)}
                  style={{ fontSize: '0.75rem', color: '#7a6ad8', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(122,106,216,0.08)' }}
                >
                  <i className="fa fa-plus" style={{ marginRight: 4 }} />Add New
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={p('category_id')}
                  onChange={(e) => set('category_id', e.target.value)}
                  style={{ ...inputStyle, background: '#fff', flex: 1, margin: 0 }}
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {p('category_id') && (
                  <button
                    type="button"
                    title="Remove selected category from this post"
                    onClick={() => set('category_id', '')}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', color: '#adb5bd', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
                {p('category_id') && (
                  <button
                    type="button"
                    title="Delete this category permanently"
                    onClick={async () => {
                      if (!await confirmAction('Delete this category permanently?')) return;
                      try {
                        await apiService.delete(`/blog/categories/${p('category_id')}`);
                        set('category_id', '');
                        await fetchMetadata();
                      } catch (err: any) { notify('Failed to delete category: ' + (err?.message || 'Unknown error')); }
                    }}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #ffcccc', background: '#fff5f5', cursor: 'pointer', color: '#dc3545', flexShrink: 0 }}
                  >
                    <i className="fa fa-trash" />
                  </button>
                )}
              </div>
              {showAddCategory && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAddCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddCategory}
                    disabled={!newCategoryName.trim() || addingCategory}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#7a6ad8', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', opacity: (!newCategoryName.trim() || addingCategory) ? 0.6 : 1 }}
                  >
                    {addingCategory ? <i className="fa fa-spinner fa-spin" /> : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', color: '#6c757d' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Tags</label>
                <button
                  type="button"
                  onClick={() => setShowAddTag((v) => !v)}
                  style={{ fontSize: '0.75rem', color: '#7a6ad8', background: 'rgba(122,106,216,0.08)', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}
                >
                  <i className="fa fa-plus" style={{ marginRight: 4 }} />Add New
                </button>
              </div>
              {showAddTag && (
                <div style={{ marginBottom: '10px', display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="New tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddTag}
                    disabled={!newTagName.trim() || addingTag}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#7a6ad8', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', opacity: (!newTagName.trim() || addingTag) ? 0.6 : 1 }}
                  >
                    {addingTag ? <i className="fa fa-spinner fa-spin" /> : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddTag(false); setNewTagName(''); }}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', color: '#6c757d' }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {postTags.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#adb5bd', fontWeight: 600 }}>On this post</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {postTags.map((name, index) => {
                      const missing = !knownTagNames.has(name);
                      return (
                        <span
                          key={`${name}-${index}`}
                          title={missing ? 'This tag is no longer in the tag list (renamed or deleted).' : undefined}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: missing ? '#fff8e1' : 'rgba(141,24,208,0.12)',
                            color: missing ? '#8a6d00' : '#8D18D0',
                            border: `1px ${missing ? 'dashed #e0c36b' : 'solid rgba(141,24,208,0.3)'}`,
                            padding: '4px 6px 4px 10px', borderRadius: '20px',
                            fontSize: '0.82rem', fontWeight: 600,
                          }}
                        >
                          # {name}
                          <button
                            type="button"
                            title="Remove from this post"
                            onClick={() => set('tags_json', postTags.filter((tg) => tg !== name))}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'inherit', opacity: 0.6,
                              padding: '0 2px', lineHeight: 1, fontSize: '0.75rem',
                              display: 'flex', alignItems: 'center',
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  {tags.length > 0 && (
                    <p style={{ margin: '10px 0 6px', fontSize: '0.78rem', color: '#adb5bd', fontWeight: 600 }}>All tags</p>
                  )}
                </div>
              )}
              {tags.length === 0 ? (
                <p style={{ fontSize: '0.83rem', color: '#adb5bd', fontStyle: 'italic' }}>No tags created yet. Use "+ Add New" to create one.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tags.map((t) => {
                    const selected = (post.tags_json || []).includes(t.name);
                    return (
                      <span
                        key={t.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: selected ? 'rgba(141,24,208,0.12)' : '#f8f9fa',
                          color: selected ? '#8D18D0' : '#495057',
                          border: `1px solid ${selected ? 'rgba(141,24,208,0.3)' : '#dee2e6'}`,
                          padding: '4px 6px 4px 10px', borderRadius: '20px',
                          fontSize: '0.82rem', fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        {/* Toggle selection */}
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            const newTags = selected
                              ? (post.tags_json || []).filter((tg: string) => tg !== t.name)
                              : [...(post.tags_json || []), t.name];
                            set('tags_json', newTags);
                          }}
                        >
                          # {t.name}
                        </span>
                        {/* Delete tag permanently */}
                        <button
                          type="button"
                          title="Delete tag permanently"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!await confirmAction(`Delete tag "${t.name}" permanently?`)) return;
                            try {
                              await apiService.delete(`/blog/tags/${t.id}`);
                              set('tags_json', (post.tags_json || []).filter((tg: string) => tg !== t.name));
                              await fetchMetadata();
                            } catch (err: any) { notify('Failed to delete tag: ' + (err?.message || 'Unknown error')); }
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: selected ? 'rgba(141,24,208,0.5)' : '#adb5bd',
                            padding: '0 2px', lineHeight: 1, fontSize: '0.75rem',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ margin: '0 0 14px 0', fontWeight: 700, color: '#2c3e50', fontSize: '1rem' }}>
              <i className="fa fa-image" style={{ marginRight: 8, color: '#7a6ad8' }} />Featured Image
            </h5>
            <AdminImageUpload label="" value={p('featured_image')} onChange={(url) => set('featured_image', url)} />
          </div>

          {/* Post Details */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ margin: '0 0 14px 0', fontWeight: 700, color: '#2c3e50', fontSize: '1rem' }}>
              <i className="fa fa-info-circle" style={{ marginRight: 8, color: '#7a6ad8' }} />Post Details
            </h5>
            <div style={{ marginBottom: '14px' }}>
              <AdminInput
                label="Author Name"
                value={p('author')}
                onChange={(e) => set('author', e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6c757d', marginBottom: '6px', fontWeight: 600 }}>Reading Time (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={p('reading_time')}
                onChange={(e) => set('reading_time', e.target.value)}
                placeholder="e.g. 5"
                style={{ ...inputStyle }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BlogPostEditor() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} />
        <span style={{ color: '#6c757d' }}>Loading editor...</span>
      </div>
    }>
      <BlogPostEditorInner />
    </Suspense>
  );
}
