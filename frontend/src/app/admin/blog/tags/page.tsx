"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AdminTable } from '../../../../components/common/admin-table';
import { AdminButton, AdminInput } from '../../../../components/common/admin-form-elements';
import { apiService } from '../../../../services/api';
import { useLoadOnMount } from '../../../../utils/use-load-on-mount';
import { confirmAction, notify } from '../../../../components/common/admin-feedback';

export default function BlogTagsManager() {
  const [tags, setTags] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTags = async () => {
    const data = await apiService.get('/blog/tags');
    return data || [];
  };

  const fetchTags = async () => {
    setLoading(true);
    try {
      setTags(await loadTags());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useLoadOnMount(loadTags, setTags, { onSettled: () => setLoading(false) });

  const columns = [
    { key: 'name', label: 'Tag Name' },
    { key: 'slug', label: 'URL Slug' },
    { key: 'created_at', label: 'Created At', render: (val: string) => new Date(val).toLocaleDateString() },
  ];

  const handleEdit = (item: any) => {
    setCurrentTag({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (await confirmAction(`Are you sure you want to delete tag "${item.name}"?`)) {
      try {
        await apiService.delete(`/blog/tags/${item.id}`);
        setTags(tags.filter(t => t.id !== item.id));
      } catch (e) {
        notify('Failed to delete tag');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const slug = currentTag.slug || currentTag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        ...currentTag,
        slug
      };

      if (currentTag.id_exists) {
        await apiService.put(`/blog/tags/${currentTag.id}`, payload);
      } else {
        await apiService.post('/blog/tags', payload);
      }
      fetchTags();
      setIsEditing(false);
      setCurrentTag(null);
    } catch (e) {
      notify('Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Blog Tags</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentTag({ id_exists: false }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Tag
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentTag?.id_exists ? 'Edit Tag' : 'Add New Tag'}</h4>
          <form onSubmit={handleSave}>
            <AdminInput 
              label="Tag Name" 
              value={currentTag?.name || ''} 
              onChange={(e) => setCurrentTag({...currentTag, name: e.target.value})} 
              required
            />
            <AdminInput 
              label="URL Slug (Optional, auto-generated)" 
              value={currentTag?.slug || ''} 
              onChange={(e) => setCurrentTag({...currentTag, slug: e.target.value})} 
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <AdminButton type="submit" loading={saving}>{saving ? 'Saving...' : 'Save Tag'}</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
            </div>
          </form>
        </div>
      ) : (
        <AdminTable 
          columns={columns} 
          data={tags} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          loading={loading}
        />
      )}
    </div>
  );
}
