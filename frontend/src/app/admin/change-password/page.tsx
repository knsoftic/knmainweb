"use client";

import { useState } from 'react';
import { apiService } from '../../../services/api';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! You will be logged out shortly.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Log the user out after a short delay so they can use the new password
        setTimeout(() => {
          sessionStorage.removeItem('admin_token');
          router.replace('/admin/login');
        }, 2500);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to change password.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while changing password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', color: '#1a1a2e', fontFamily: "'Conthrax', 'Inter', sans-serif" }}>
        Change Password
      </h2>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: message.type === 'success' ? '#e6f7eb' : '#fbeaea',
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          border: `1px solid ${message.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Current Password</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #8D18D0, #3930C7)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
