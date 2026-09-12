"use client";

import { useState } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';
import { resolveImageUrl } from '../../../utils/image-url';
import { confirmAction, notify } from '../../../components/common/admin-feedback';

export default function HomepageCardsManager() {
  const [cards, setCards] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCards = async () => {
    const data = await apiService.get('/homepage_cards');
    return data || [];
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      setCards(await loadCards());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useLoadOnMount(loadCards, setCards, { onSettled: () => setLoading(false) });

  const columns = [
    { key: 'title', label: 'Card Title' },
    { key: 'image_url', label: 'Image/Icon', render: (val: string) => <img src={resolveImageUrl(val)} style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover'}} alt="img" /> },
    { key: 'is_active', label: 'Status', render: (val: number) => (val ? <span style={{color: 'green'}}>Active</span> : <span style={{color: 'red'}}>Inactive</span>) }
  ];

  const handleEdit = (item: any) => {
    setCurrentCard({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (await confirmAction(`Are you sure you want to delete ${item.title}?`)) {
      try {
        await apiService.delete(`/homepage_cards/${item.id}`);
        setCards(cards.filter(c => c.id !== item.id));
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
        ...currentCard,
        image_url: currentCard.image_url || '/assets/images/service-01.png',
        is_active: currentCard.is_active !== undefined ? currentCard.is_active : 1
      };

      if (currentCard.id_exists) {
        await apiService.put(`/homepage_cards/${currentCard.id}`, payload);
      } else {
        payload.id = currentCard.id || currentCard.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await apiService.post('/homepage_cards', payload);
      }
      fetchCards();
      setIsEditing(false);
      setCurrentCard(null);
    } catch (e) {
      notify('Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Homepage Cards Management</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentCard({ id_exists: false, is_active: 1 }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Card
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentCard?.id_exists ? 'Edit Card' : 'Add New Card'}</h4>
          <form onSubmit={handleSave}>
            <AdminInput 
              label="Card Title" 
              value={currentCard?.title || ''} 
              onChange={(e) => setCurrentCard({...currentCard, title: e.target.value})} 
              required
            />
            <AdminImageUpload 
              label="Card Image/Icon" 
              value={currentCard?.image_url || ''} 
              onChange={(url) => setCurrentCard({...currentCard, image_url: url})} 
            />
            <AdminTextarea 
              label="Description" 
              value={currentCard?.description || ''} 
              onChange={(e) => setCurrentCard({...currentCard, description: e.target.value})} 
              required
            />
            <AdminInput 
              label="Read More Link (Optional)" 
              value={currentCard?.read_more_url || ''} 
              onChange={(e) => setCurrentCard({...currentCard, read_more_url: e.target.value})} 
            />
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Status</label>
              <select 
                value={currentCard?.is_active}
                onChange={(e) => setCurrentCard({...currentCard, is_active: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value={1}>Active (Visible)</option>
                <option value={0}>Inactive (Hidden)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <AdminButton type="submit" loading={saving}>{saving ? 'Saving...' : 'Save Card'}</AdminButton>
              <button type="button" onClick={() => { setIsEditing(false); setCurrentCard(null); }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <AdminTable columns={columns} data={cards} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
