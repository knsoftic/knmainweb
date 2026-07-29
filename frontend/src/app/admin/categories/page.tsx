"use client";

import { useState, useEffect } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/service-categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Category Name' },
    { key: 'filter_slug', label: 'Filter Slug' },
    { key: 'id', label: 'ID' },
  ];

  const handleEdit = (item: any) => {
    setCurrentCategory({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await apiService.delete(`/service-categories/${item.id}`);
        setCategories(categories.filter(c => c.id !== item.id));
      } catch (e) {
        alert('Failed to delete category');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentCategory
      };

      // Auto-generate filter_slug if not set
      if (!payload.filter_slug) {
        payload.filter_slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      }

      if (currentCategory.id_exists) {
        await apiService.put(`/service-categories/${currentCategory.id}`, payload);
      } else {
        // For new categories, use filter_slug as id (varchar primary key)
        payload.id = payload.filter_slug;
        await apiService.post('/service-categories', payload);
      }
      fetchCategories();
      setIsEditing(false);
      setCurrentCategory(null);
    } catch (e: any) {
      console.error('Save category error:', e);
      alert('Failed to save category: ' + (e?.message || 'Unknown error'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Categories Management</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentCategory({ id_exists: false, name: '' }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Category
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentCategory?.id_exists ? 'Edit Category' : 'Add New Category'}</h4>
          <form onSubmit={handleSave}>
            <AdminInput 
              label="Category Name" 
              value={currentCategory?.name || ''} 
              onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} 
              required
            />
            <AdminInput 
              label="Filter Slug (Optional, auto-generated)" 
              value={currentCategory?.filter_slug || ''} 
              onChange={(e) => setCurrentCategory({...currentCategory, filter_slug: e.target.value})} 
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <AdminButton type="submit">Save Category</AdminButton>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <AdminTable 
          columns={columns} 
          data={categories} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
