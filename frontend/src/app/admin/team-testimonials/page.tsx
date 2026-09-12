"use client";

import { useState } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';
import { resolveImageUrl } from '../../../utils/image-url';
import { confirmAction, notify } from '../../../components/common/admin-feedback';

export default function TeamTestimonialsManager() {
  const [activeTab, setActiveTab] = useState<'team' | 'testimonials'>('team');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const teamData = await apiService.get('/team');
    const testData = await apiService.get('/testimonials');
    return { team: (teamData || []) as any[], testimonials: (testData || []) as any[] };
  };

  const applyData = (data: { team: any[]; testimonials: any[] }) => {
    setTeamMembers(data.team);
    setTestimonials(data.testimonials);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      applyData(await loadData());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useLoadOnMount(loadData, applyData, { onSettled: () => setLoading(false) });

  const handleEdit = (item: any) => {
    setCurrentItem({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (await confirmAction(`Are you sure you want to delete ${item.name}?`)) {
      try {
        const endpoint = activeTab === 'team' ? `/team/${item.id}` : `/testimonials/${item.id}`;
        await apiService.delete(endpoint);
        if (activeTab === 'team') setTeamMembers(teamMembers.filter(t => t.id !== item.id));
        else setTestimonials(testimonials.filter(t => t.id !== item.id));
      } catch (e) {
        notify('Failed to delete');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        ...currentItem,
        is_active: 1
      };
      
      const endpoint = activeTab === 'team' ? '/team' : '/testimonials';
      
      if (currentItem.id_exists) {
        await apiService.put(`${endpoint}/${currentItem.id}`, payload);
      } else {
        await apiService.post(endpoint, payload);
      }
      
      fetchData();
      setIsEditing(false);
      setCurrentItem(null);
    } catch (e) {
      notify('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentItem?.id_exists ? `Edit ${activeTab === 'team' ? 'Team Member' : 'Testimonial'}` : `Add New ${activeTab === 'team' ? 'Team Member' : 'Testimonial'}`}</h4>
      <form onSubmit={handleSave}>
        <AdminInput 
          label="Name" 
          value={currentItem?.name || ''} 
          onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} 
          required
        />
        <AdminInput 
          label="Role / Category" 
          value={currentItem?.category || ''} 
          onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})} 
          required
        />
        
        <AdminImageUpload 
          label="Profile Photo" 
          value={currentItem?.image_url || ''} 
          onChange={(url) => setCurrentItem({...currentItem, image_url: url})} 
        />

        {activeTab === 'team' && (
          <div style={{ display: 'flex', gap: '15px' }}>
            <AdminInput 
              label="Facebook URL" 
              value={currentItem?.facebook_url || ''} 
              onChange={(e) => setCurrentItem({...currentItem, facebook_url: e.target.value})} 
            />
            <AdminInput 
              label="Twitter URL" 
              value={currentItem?.twitter_url || ''} 
              onChange={(e) => setCurrentItem({...currentItem, twitter_url: e.target.value})} 
            />
            <AdminInput 
              label="LinkedIn URL" 
              value={currentItem?.linkedin_url || ''} 
              onChange={(e) => setCurrentItem({...currentItem, linkedin_url: e.target.value})} 
            />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <AdminTextarea 
            label="Quote" 
            value={currentItem?.quote || ''} 
            onChange={(e) => setCurrentItem({...currentItem, quote: e.target.value})} 
            required
          />
        )}
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <AdminButton type="submit" loading={saving}>{saving ? 'Saving...' : 'Save'}</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
        </div>
      </form>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Team & Testimonials</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentItem({ id_exists: false }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New {activeTab === 'team' ? 'Team Member' : 'Testimonial'}
          </AdminButton>
        )}
      </div>
      
      {!isEditing && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <button 
            onClick={() => setActiveTab('team')}
            style={{ padding: '10px 20px', background: activeTab === 'team' ? '#8D18D0' : '#fff', color: activeTab === 'team' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Manage Team
          </button>
          <button 
            onClick={() => setActiveTab('testimonials')}
            style={{ padding: '10px 20px', background: activeTab === 'testimonials' ? '#8D18D0' : '#fff', color: activeTab === 'testimonials' ? '#fff' : '#495057', border: '1px solid #dee2e6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Manage Testimonials
          </button>
        </div>
      )}

      {isEditing ? renderForm() : loading ? (
        <p>Loading data...</p>
      ) : activeTab === 'team' ? (
        <AdminTable 
          columns={[
            { key: 'image_url', label: 'Photo', render: (val: string) => <img src={resolveImageUrl(val, '/assets/images/cover-object.png')} alt="Team" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} /> },
            { key: 'name', label: 'Name' },
            { key: 'category', label: 'Role' }
          ]} 
          data={teamMembers.map(t => ({ ...t, id_exists: true }))} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      ) : (
        <AdminTable 
          columns={[
            { key: 'image_url', label: 'Photo', render: (val: string) => <img src={resolveImageUrl(val, '/assets/images/client-default.jpg')} alt="Client" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} /> },
            { key: 'name', label: 'Client Name' },
            { key: 'category', label: 'Client Role' },
            { key: 'quote', label: 'Quote', render: (val: string) => <span style={{ display: 'inline-block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span> }
          ]} 
          data={testimonials.map(t => ({ ...t, id_exists: true }))} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}
    </div>
  );
}
