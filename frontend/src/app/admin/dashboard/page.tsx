'use client';
import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.get('/dashboard/stats');
        setStats(data);
      } catch (err: any) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  const statCards = [
    { title: 'Total Services', value: stats?.services || 0, icon: 'fa-cogs', color: '#4CAF50' },
    { title: 'Total Courses', value: stats?.courses || 0, icon: 'fa-graduation-cap', color: '#2196F3' },
    { title: 'Projects', value: stats?.projects || 0, icon: 'fa-briefcase', color: '#9C27B0' },
    { title: 'Team Members', value: stats?.team || 0, icon: 'fa-users', color: '#00BCD4' },
    { title: 'Testimonials', value: stats?.testimonials || 0, icon: 'fa-comments', color: '#E91E63' },
    { title: 'Contact Messages', value: stats?.contact_messages || 0, icon: 'fa-envelope', color: '#FF9800' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '25px', fontWeight: 700, color: '#2c3e50' }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <i className={`fa ${stat.icon}`}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#2c3e50' }}>{stat.value}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 500 }}>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/admin/services" style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', color: '#495057', textDecoration: 'none', fontWeight: 500 }}><i className="fa fa-plus"></i> Add Service</a>
          <a href="/admin/courses" style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', color: '#495057', textDecoration: 'none', fontWeight: 500 }}><i className="fa fa-plus"></i> Add Course</a>
          <a href="/admin/projects" style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', color: '#495057', textDecoration: 'none', fontWeight: 500 }}><i className="fa fa-plus"></i> Add Project</a>
          <a href="/admin/contact-messages" style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', color: '#495057', textDecoration: 'none', fontWeight: 500 }}><i className="fa fa-inbox"></i> View Messages</a>
          <a href="/admin/settings" style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', color: '#495057', textDecoration: 'none', fontWeight: 500 }}><i className="fa fa-cog"></i> Update Settings</a>
        </div>
      </div>
    </div>
  );
}
