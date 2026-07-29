"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminTable } from '../../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../../components/common/admin-form-elements';
import { apiService } from '../../../../services/api';
import { resolveImageUrl } from '../../../../utils/image-url';

export default function BlogCategoriesManager() {
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
      const data = await apiService.get('/blog/categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Category Name' },
    { key: 'slug', label: 'URL Slug' },
    { key: 'image_url', label: 'Image', render: (val: string) => val ? <img src={resolveImageUrl(val)} style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover'}} alt="img" /> : '-' },
    { key: 'display_order', label: 'Order' },
  ];

  const handleEdit = (item: any) => {
    setCurrentCategory({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Are you sure you want to delete category "${item.name}"?`)) {
      try {
        await apiService.delete(`/blog/categories/${item.id}`);
        setCategories(categories.filter(c => c.id !== item.id));
      } catch (e) {
        alert('Failed to delete category');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = currentCategory.slug || currentCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        ...currentCategory,
        slug,
        display_order: parseInt(currentCategory.display_order || 0),
        is_active: currentCategory.is_active === false ? 0 : 1
      };

      if (currentCategory.id_exists) {
        await apiService.put(`/blog/categories/${currentCategory.id}`, payload);
      } else {
        await apiService.post('/blog/categories', payload);
      }
      fetchCategories();
      setIsEditing(false);
      setCurrentCategory(null);
    } catch (e) {
      alert('Failed to save category');
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
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Blog Categories</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentCategory({ id_exists: false }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Category
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentCategory?.id_exists ? 'Edit Category' : 'Add New Category'}</h4>
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-6">
                <AdminInput 
                  label="Category Name" 
                  value={currentCategory?.name || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} 
                  required
                />
              </div>
              <div className="col-md-6">
                <AdminInput 
                  label="URL Slug (Optional, auto-generated)" 
                  value={currentCategory?.slug || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})} 
                />
              </div>
              <div className="col-12">
                <AdminTextarea 
                  label="Description" 
                  value={currentCategory?.description || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})} 
                />
              </div>
              <div className="col-md-6">
                <AdminImageUpload 
                  label="Category Image" 
                  value={currentCategory?.image_url || ''} 
                  onChange={(url) => setCurrentCategory({...currentCategory, image_url: url})} 
                />
              </div>
              <div className="col-md-6">
                <AdminInput 
                  label="Display Order" 
                  type="number"
                  value={currentCategory?.display_order || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, display_order: e.target.value})} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <AdminButton type="submit">Save Category</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
            </div>
          </form>
        </div>
      ) : (
        <AdminTable 
          columns={columns} 
          data={categories} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          loading={loading}
        />
      )}
    </div>
  );
}
