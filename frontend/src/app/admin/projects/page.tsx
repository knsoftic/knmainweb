"use client";

import { useEffect, useState } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';

const emptyProject = {
  id: '',
  filter_slug: '',
  icon: '',
  image_url: '',
  title: '',
  description: '',
  category: '',
  badge: '',
  label: '',
  client_name: '',
  technologies: '',
  features: '',
  primary_link_label: '',
  primary_link_url: '',
  secondary_link_label: '',
  secondary_link_url: '',
  status: 'active',
  display_order: 0,
};

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const normalizeOptionalField = (value: any) => {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function ProjectsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/projects');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEdit = (item: any) => {
    setCurrentItem({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Are you sure you want to delete ${item.title}?`)) {
      try {
        await apiService.delete(`/projects/${item.id}`);
        setItems(items.filter((project) => project.id !== item.id));
      } catch (e) {
        alert('Failed to delete');
      }
    }
  };

  const buildPayload = (item: any) => {
    const title = item?.title?.trim() || '';
    const category = item?.category?.trim() || 'Projects';
    const filterSlug = item?.filter_slug?.trim() || slugify(category || title || 'projects');

    return {
      ...item,
      id: item?.id?.trim() || slugify(title || category || 'project-item'),
      filter_slug: filterSlug,
      category,
      icon: normalizeOptionalField(item?.icon),
      image_url: normalizeOptionalField(item?.image_url),
      badge: normalizeOptionalField(item?.badge),
      label: normalizeOptionalField(item?.label),
      client_name: normalizeOptionalField(item?.client_name),
      technologies: normalizeOptionalField(item?.technologies),
      features: normalizeOptionalField(item?.features),
      primary_link_label: normalizeOptionalField(item?.primary_link_label),
      primary_link_url: normalizeOptionalField(item?.primary_link_url),
      secondary_link_label: normalizeOptionalField(item?.secondary_link_label),
      secondary_link_url: normalizeOptionalField(item?.secondary_link_url),
      status: item?.status || 'active',
      display_order: Number(item?.display_order) || 0,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = buildPayload(currentItem || emptyProject);

      if (currentItem?.id_exists) {
        await apiService.put(`/projects/${currentItem.id}`, payload);
      } else {
        await apiService.post('/projects', payload);
      }

      fetchData();
      setIsEditing(false);
      setCurrentItem(null);
    } catch (e) {
      alert('Failed to save');
    }
  };

  const renderForm = () => (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '1000px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentItem?.id_exists ? 'Edit Project' : 'Add New Project'}</h4>
      <form onSubmit={handleSave}>
        <AdminInput
          label="Title"
          value={currentItem?.title || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
          required
        />

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminInput
            label="Category"
            value={currentItem?.category || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
            required
          />
          <AdminInput
            label="Filter Slug"
            value={currentItem?.filter_slug || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, filter_slug: e.target.value })}
            required
          />
        </div>

        <AdminImageUpload
          label="Project Image"
          value={currentItem?.image_url || ''}
          onChange={(url) => setCurrentItem({ ...currentItem, image_url: url })}
        />

        <AdminInput
          label="Icon (Font Awesome, optional)"
          value={currentItem?.icon || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
        />

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminInput
            label="Badge / Tag"
            value={currentItem?.badge || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, badge: e.target.value })}
          />
          <AdminInput
            label="Label / Subtitle"
            value={currentItem?.label || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, label: e.target.value })}
          />
        </div>

        <AdminInput
          label="Client / Details"
          value={currentItem?.client_name || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, client_name: e.target.value })}
        />

        <AdminTextarea
          label="Description"
          value={currentItem?.description || ''}
          onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
          required
        />

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminTextarea
            label="Technologies (comma separated)"
            value={currentItem?.technologies || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, technologies: e.target.value })}
          />
          <AdminTextarea
            label="Features (comma separated)"
            value={currentItem?.features || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, features: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminInput
            label="Primary Link Label"
            value={currentItem?.primary_link_label || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, primary_link_label: e.target.value })}
          />
          <AdminInput
            label="Primary Link URL"
            value={currentItem?.primary_link_url || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, primary_link_url: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminInput
            label="Secondary Link Label"
            value={currentItem?.secondary_link_label || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, secondary_link_label: e.target.value })}
          />
          <AdminInput
            label="Secondary Link URL"
            value={currentItem?.secondary_link_url || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, secondary_link_url: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <AdminInput
            label="Display Order"
            type="number"
            value={currentItem?.display_order ?? 0}
            onChange={(e) => setCurrentItem({ ...currentItem, display_order: e.target.value })}
          />
          <div style={{ flex: 1, marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>Status</label>
            <select
              value={currentItem?.status || 'active'}
              onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', color: '#495057', background: '#fff' }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <AdminButton type="submit">Save</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Projects</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentItem({ ...emptyProject, id_exists: false }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Project
          </AdminButton>
        )}
      </div>

      {isEditing ? renderForm() : loading ? (
        <p>Loading data...</p>
      ) : (
        <AdminTable
          columns={[
            { key: 'title', label: 'Project Title' },
            { key: 'category', label: 'Category' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span style={{ display: 'inline-block', padding: '6px 10px', borderRadius: '999px', background: value === 'active' ? 'rgba(40,167,69,0.12)' : 'rgba(108,117,125,0.12)', color: value === 'active' ? '#28a745' : '#6c757d', fontWeight: 600, fontSize: '0.85rem' }}>
                  {value || 'inactive'}
                </span>
              )
            },
            { key: 'display_order', label: 'Order' },
          ]}
          data={items.map((item) => ({ ...item, id_exists: true }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}