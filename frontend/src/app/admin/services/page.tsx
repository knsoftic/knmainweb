"use client";

import { useState, useEffect } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { resolveImageUrl } from '../../../utils/image-url';
import CreatableSelect from 'react-select/creatable';

export default function ServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/services');
      setServices(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.get('/service-categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: 'title', label: 'Service Title' },
    { key: 'image_url', label: 'Image', render: (val: string) => <img src={resolveImageUrl(val)} style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover'}} alt="img" /> },
    { key: 'icon', label: 'Icon', render: (val: string) => <i className={`fa ${val || 'fa-cog'}`} style={{ color: '#8D18D0', fontSize: '1.2rem' }}></i> },
    { key: 'category_id', label: 'Category' },
  ];

  const handleEdit = (item: any) => {
    setCurrentService({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Are you sure you want to delete ${item.title}?`)) {
      try {
        await apiService.delete(`/services/${item.id}`);
        setServices(services.filter(s => s.id !== item.id));
      } catch (e) {
        alert('Failed to delete');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalCategoryId = currentService.category_id || 'web_development';
      
      // If the user created a new category on the fly (it doesn't have an ID in our predefined list)
      if (currentService.isNewCategory) {
        const filterSlug = finalCategoryId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        await apiService.post('/service-categories', {
          id: filterSlug,
          name: finalCategoryId,
          filter_slug: filterSlug
        });
        finalCategoryId = filterSlug;
        fetchCategories(); // Refresh categories
      }

      const payload = {
        ...currentService,
        category_id: finalCategoryId,
        image_url: currentService.image_url || '/assets/images/service-01.png',
        home_description: currentService.home_description || currentService.description,
        is_active: 1
      };
      delete payload.isNewCategory;

      if (currentService.id_exists) {
        await apiService.put(`/services/${currentService.id}`, payload);
      } else {
        payload.id = currentService.id || currentService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await apiService.post('/services', payload);
      }
      fetchServices();
      setIsEditing(false);
      setCurrentService(null);
    } catch (e) {
      alert('Failed to save service');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Services Management</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentService({ id_exists: false, category_id: 1 }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Service
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentService?.id_exists ? 'Edit Service' : 'Add New Service'}</h4>
          <form onSubmit={handleSave}>
            <AdminInput 
              label="Service Title" 
              value={currentService?.title || ''} 
              onChange={(e) => setCurrentService({...currentService, title: e.target.value})} 
              required
            />
            <AdminInput 
              label="Page Title" 
              value={currentService?.page_title || ''} 
              onChange={(e) => setCurrentService({...currentService, page_title: e.target.value})} 
              required
            />
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50' }}>
                Service Category <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <CreatableSelect
                isClearable
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={
                  currentService?.category_id 
                    ? { 
                        value: currentService.category_id, 
                        label: categories.find(c => c.id === currentService.category_id)?.name || currentService.category_id 
                      } 
                    : null
                }
                onChange={(newValue: any) => {
                  setCurrentService({
                    ...currentService,
                    category_id: newValue?.value || '',
                    isNewCategory: newValue?.__isNew__ || false
                  });
                }}
                styles={{
                  control: (base) => ({ ...base, borderColor: '#e1e5ea', padding: '2px', borderRadius: '8px' })
                }}
                placeholder="Search or type to create a new category..."
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50' }}>
                Icon Class (FontAwesome) <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <CreatableSelect
                isClearable
                options={[
                  { value: 'fa-desktop', label: 'Desktop (fa-desktop)' },
                  { value: 'fa-mobile', label: 'Mobile (fa-mobile)' },
                  { value: 'fa-code', label: 'Code (fa-code)' },
                  { value: 'fa-paint-brush', label: 'Design (fa-paint-brush)' },
                  { value: 'fa-search', label: 'Search/SEO (fa-search)' },
                  { value: 'fa-cogs', label: 'Gears/Settings (fa-cogs)' },
                  { value: 'fa-video-camera', label: 'Video (fa-video-camera)' },
                  { value: 'fa-bullhorn', label: 'Marketing (fa-bullhorn)' },
                  { value: 'fa-shopping-cart', label: 'E-commerce (fa-shopping-cart)' },
                  { value: 'fa-wordpress', label: 'WordPress (fa-wordpress)' }
                ]}
                value={
                  currentService?.icon 
                    ? { value: currentService.icon, label: currentService.icon } 
                    : null
                }
                onChange={(newValue: any) => {
                  setCurrentService({
                    ...currentService,
                    icon: newValue?.value || ''
                  });
                }}
                styles={{
                  control: (base) => ({ ...base, borderColor: '#e1e5ea', padding: '2px', borderRadius: '8px' })
                }}
                placeholder="Select an icon or type e.g. fa-laptop..."
              />
            </div>
            <AdminImageUpload 
              label="Service Image" 
              value={currentService?.image_url || ''} 
              onChange={(url) => setCurrentService({...currentService, image_url: url})} 
            />
            <AdminTextarea 
              label="Detailed Description" 
              value={currentService?.description || ''} 
              onChange={(e) => setCurrentService({...currentService, description: e.target.value})} 
              required
            />
            <AdminTextarea 
              label="Home Page Short Description" 
              value={currentService?.home_description || ''} 
              onChange={(e) => setCurrentService({...currentService, home_description: e.target.value})} 
              required
            />
            <AdminTextarea 
              label="Service Features (One per line)" 
              value={currentService?.features || ''} 
              onChange={(e) => setCurrentService({...currentService, features: e.target.value})} 
            />
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <AdminButton type="submit">Save Service</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
            </div>
          </form>
        </div>
      ) : loading ? (
        <p>Loading services...</p>
      ) : (
        <AdminTable 
          columns={columns} 
          data={services.map(s => ({ ...s, id_exists: true }))} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
