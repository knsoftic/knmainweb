"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AdminTable } from '../../../../components/common/admin-table';
import { AdminButton } from '../../../../components/common/admin-form-elements';
import { apiService } from '../../../../services/api';
import { useLoadOnMount } from '../../../../utils/use-load-on-mount';
import { resolveImageUrl } from '../../../../utils/image-url';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { confirmAction, notify } from '../../../../components/common/admin-feedback';

function BlogPostsManagerInner() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const loadPosts = async () => {
    const data = await apiService.get('/blog/posts');
    return data || [];
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      setPosts(await loadPosts());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useLoadOnMount(loadPosts, setPosts, { onSettled: () => setLoading(false) });

  const filteredPosts = statusFilter === 'all'
    ? posts
    : posts.filter((p) => p.status === statusFilter);

  const columns = [
    {
      key: 'featured_image',
      label: 'Image',
      render: (val: string) =>
        val ? (
          <img src={resolveImageUrl(val)} style={{ width: 54, height: 44, borderRadius: 8, objectFit: 'cover', display: 'block' }} alt="thumb" />
        ) : (
          <div style={{ width: 54, height: 44, borderRadius: 8, background: '#f1f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a6ad8' }}>
            <i className="fa fa-image" />
          </div>
        ),
    },
    { key: 'title', label: 'Title' },
    { key: 'category_name', label: 'Category', render: (val: string) => val || <span style={{ color: '#adb5bd' }}>—</span> },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => {
        const map: Record<string, { bg: string; color: string }> = {
          published: { bg: '#d1e7dd', color: '#0f5132' },
          scheduled: { bg: '#cff4fc', color: '#055160' },
          draft: { bg: '#f8f9fa', color: '#495057' },
        };
        const s = map[val] || map.draft;
        return (
          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: s.bg, color: s.color, textTransform: 'capitalize' }}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'view_count',
      label: 'Views',
      render: (val: number) => (
        <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          <i className="fa fa-eye" style={{ marginRight: 4, color: '#7a6ad8' }} />{val || 0}
        </span>
      ),
    },
    {
      key: 'like_count',
      label: 'Likes',
      render: (val: number) => (
        <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          <i className="fa fa-heart" style={{ marginRight: 4, color: '#e74c3c' }} />{val || 0}
        </span>
      ),
    },
    {
      key: 'published_at',
      label: 'Date',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : <span style={{ color: '#adb5bd' }}>—</span>,
    },
  ];

  const handleEdit = (item: any) => {
    router.push(`/admin/blog/posts/editor?id=${item.id}`);
  };

  const handleDelete = async (item: any) => {
    if (await confirmAction(`Delete post "${item.title}"?`)) {
      try {
        await apiService.delete(`/blog/posts/${item.id}`);
        setPosts((prev) => prev.filter((p) => p.id !== item.id));
      } catch {
        notify('Failed to delete post');
      }
    }
  };

  const handleDuplicate = async (item: any) => {
    if (await confirmAction(`Duplicate "${item.title}"?`)) {
      try {
        await apiService.post(`/blog/posts/${item.id}/duplicate`, {});
        fetchPosts();
      } catch {
        notify('Failed to duplicate post');
      }
    }
  };

  const handlePreview = (item: any) => {
    const slug = String(item.slug || '').trim();
    if (!slug) {
      notify('This post has no URL slug yet. Save it with a title first.');
      return;
    }
    if (item.status === 'published') {
      window.open(`/blog/${encodeURIComponent(slug)}`, '_blank');
    } else {
      // Drafts/scheduled posts 404 on the public blog; use the authenticated admin preview instead.
      router.push(`/admin/blog/posts/preview?slug=${encodeURIComponent(slug)}`);
    }
  };

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Scheduled', value: 'scheduled' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/admin/blog" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem',
          fontWeight: 600, color: '#6c757d', background: '#f8f9fa',
          border: '1px solid #e9ecef', textDecoration: 'none',
        }}>
          <i className="fa fa-arrow-left" /> Back to Blog
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Blog Posts</h2>
          <p style={{ margin: '6px 0 0', color: '#6c757d', fontSize: '0.95rem' }}>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
          </p>
        </div>
        <Link href="/admin/blog/posts/editor" style={{ textDecoration: 'none' }}>
          <AdminButton>
            <i className="fa fa-plus" /> Write New Post
          </AdminButton>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f8f9fa', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.replace(`/admin/blog/posts?status=${tab.value}`)}
            style={{
              background: statusFilter === tab.value ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: statusFilter === tab.value ? '#8D18D0' : '#6c757d',
              cursor: 'pointer',
              boxShadow: statusFilter === tab.value ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: '6px',
              background: statusFilter === tab.value ? 'rgba(141,24,208,0.12)' : '#e9ecef',
              color: statusFilter === tab.value ? '#8D18D0' : '#6c757d',
              borderRadius: '12px',
              padding: '1px 7px',
              fontSize: '0.75rem',
            }}>
              {tab.value === 'all' ? posts.length : posts.filter(p => p.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filteredPosts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        extraActions={[
          {
            label: 'Duplicate',
            icon: 'fa-copy',
            color: '#7a6ad8',
            bgColor: 'rgba(122,106,216,0.1)',
            onClick: handleDuplicate,
          },
          {
            label: 'Preview',
            icon: 'fa-external-link',
            color: '#0d6efd',
            bgColor: 'rgba(13,110,253,0.08)',
            onClick: handlePreview,
          },
        ]}
      />
    </div>
  );
}

export default function BlogPostsManager() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}><i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} /></div>}>
      <BlogPostsManagerInner />
    </Suspense>
  );
}
