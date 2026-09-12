"use client";

import { useMemo, useState } from 'react';
import { AdminButton } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';
import { confirmAction, notify } from '../../../components/common/admin-feedback';

const statusOptions = ['all', 'new', 'read', 'replied', 'closed'] as const;

const statusStyles: Record<string, { background: string; color: string }> = {
  new: { background: 'rgba(255,193,7,0.14)', color: '#b78103' },
  read: { background: 'rgba(13,110,253,0.12)', color: '#0d6efd' },
  replied: { background: 'rgba(25,135,84,0.12)', color: '#198754' },
  closed: { background: 'rgba(108,117,125,0.14)', color: '#6c757d' },
};

const resolveStatus = (value: string) => statusStyles[value] || statusStyles.new;

// Strict address check so a crafted value (e.g. "a@b.com?bcc=x@y.com") can't inject mailto headers.
const SAFE_EMAIL_REGEX = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const getSafeReplyEmail = (value: unknown) => {
  const email = typeof value === 'string' ? value.trim() : '';
  return SAFE_EMAIL_REGEX.test(email) ? email : null;
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadMessages = async () => {
    const data = await apiService.get('/contact-messages');
    return (Array.isArray(data) ? data : []) as any[];
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await loadMessages();
      setMessages(data);
      if (selectedMessage) {
        const refreshed = data.find((message) => message.id === selectedMessage.id);
        if (refreshed) {
          setSelectedMessage(refreshed);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useLoadOnMount(loadMessages, setMessages, { onSettled: () => setLoading(false) });

  const filteredMessages = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      const matchesSearch = !searchValue || [message.name, message.email, message.phone, message.subject, message.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue));

      return matchesStatus && matchesSearch;
    });
  }, [messages, search, statusFilter]);

  const openMessage = async (message: any) => {
    setSelectedMessage(message);

    if (message.status === 'new') {
      try {
        setSavingStatus(true);
        await apiService.put(`/contact-messages/${message.id}`, { status: 'read' });
        const updated = { ...message, status: 'read' };
        setMessages((current) => current.map((item) => (item.id === message.id ? updated : item)));
        setSelectedMessage(updated);
      } catch (error) {
        console.error(error);
      } finally {
        setSavingStatus(false);
      }
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedMessage) {
      return;
    }

    try {
      setSavingStatus(true);
      await apiService.put(`/contact-messages/${selectedMessage.id}`, { status });
      const updated = { ...selectedMessage, status };
      setSelectedMessage(updated);
      setMessages((current) => current.map((item) => (item.id === selectedMessage.id ? updated : item)));
    } catch (error) {
      notify('Failed to update message status');
    } finally {
      setSavingStatus(false);
    }
  };

  const deleteMessage = async () => {
    if (!selectedMessage) {
      return;
    }

    if (!await confirmAction(`Delete the message from ${selectedMessage.name}?`)) {
      return;
    }

    try {
      await apiService.delete(`/contact-messages/${selectedMessage.id}`);
      setMessages((current) => current.filter((item) => item.id !== selectedMessage.id));
      setSelectedMessage(null);
    } catch (error) {
      notify('Failed to delete message');
    }
  };

  const counts = useMemo(() => ({
    total: messages.length,
    new: messages.filter((item) => item.status === 'new').length,
    read: messages.filter((item) => item.status === 'read').length,
    replied: messages.filter((item) => item.status === 'replied').length,
    closed: messages.filter((item) => item.status === 'closed').length,
  }), [messages]);

  const safeReplyEmail = selectedMessage ? getSafeReplyEmail(selectedMessage.email) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Contact Messages</h2>
          <p style={{ margin: '6px 0 0', color: '#6c757d' }}>Website submissions stored from the live contact form.</p>
        </div>
        <AdminButton onClick={fetchMessages}>Refresh</AdminButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: counts.total },
          { label: 'New', value: counts.new },
          { label: 'Read', value: counts.read },
          { label: 'Replied', value: counts.replied },
          { label: 'Closed', value: counts.closed },
        ].map((card) => (
          <div key={card.label} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>{card.label}</p>
            <h3 style={{ margin: '8px 0 0', color: '#2c3e50', fontSize: '1.8rem' }}>{card.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        <div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, subject, or message"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', background: '#fff' }}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option === 'all' ? 'All Messages' : option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                <tr>
                  {['Sender', 'Subject', 'Received', 'Status', 'Actions'].map((label) => (
                    <th key={label} style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>Loading messages...</td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>No contact messages found.</td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => {
                    const activeStyle = resolveStatus(message.status);
                    return (
                      <tr key={message.id} style={{ borderBottom: '1px solid #f1f3f5', cursor: 'pointer', background: selectedMessage?.id === message.id ? '#f8f9fa' : 'transparent' }} onClick={() => openMessage(message)}>
                        <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#2c3e50' }}>{message.name}</div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{message.email}</div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{message.phone || 'No phone provided'}</div>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#495057' }}>{message.subject || 'Website Contact'}</td>
                        <td style={{ padding: '16px 24px', color: '#495057' }}>{message.created_at ? new Date(message.created_at).toLocaleString() : '-'}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '999px', background: activeStyle.background, color: activeStyle.color, fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                            {message.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button type="button" onClick={(event) => { event.stopPropagation(); openMessage(message); }} style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>Open</button>
                            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedMessage(message); }} style={{ background: 'rgba(141,24,208,0.1)', color: '#8D18D0', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}>Details</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedMessage(null)}>
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: '30px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedMessage(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6c757d' }}
            >
              &times;
            </button>
            <h4 style={{ margin: '0 0 20px', color: '#2c3e50', fontSize: '1.5rem', fontWeight: '700' }}>Message Details</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '4px' }}>Sender</div>
              <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '1.1rem' }}>{selectedMessage.name}</div>
              <div style={{ color: '#0d6efd' }}>{selectedMessage.email}</div>
              <div style={{ color: '#6c757d' }}>{selectedMessage.phone || 'No phone provided'}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '4px' }}>Subject</div>
              <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '1.1rem' }}>{selectedMessage.subject || 'Website Contact'}</div>
            </div>

            <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <div style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '8px' }}>Message</div>
              <div style={{ whiteSpace: 'pre-wrap', color: '#495057', lineHeight: 1.6 }}>{selectedMessage.message}</div>
            </div>

            {selectedMessage.admin_notes && (
              <div style={{ marginBottom: '20px', background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffe69c' }}>
                <div style={{ color: '#664d03', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Admin Notes</div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#664d03', lineHeight: 1.6 }}>{selectedMessage.admin_notes}</div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '4px' }}>Received</div>
              <div style={{ color: '#495057' }}>{selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : '-'}</div>
            </div>

            <div style={{ marginBottom: '24px', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
              <div style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '12px' }}>Update Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['new', 'read', 'replied', 'closed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(status)}
                    disabled={savingStatus}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: savingStatus ? 'not-allowed' : 'pointer',
                      border: selectedMessage.status === status ? '2px solid #8D18D0' : '1px solid #ced4da',
                      background: selectedMessage.status === status ? 'rgba(141,24,208,0.1)' : '#fff',
                      color: selectedMessage.status === status ? '#8D18D0' : '#495057',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
              {safeReplyEmail ? (
                <a
                  href={`mailto:${safeReplyEmail}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject || 'Website Contact'}`)}`}
                  style={{ background: '#0d6efd', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    if (selectedMessage.status !== 'replied') {
                      updateStatus('replied');
                    }
                  }}
                >
                  <i className="fa fa-reply"></i> Reply via Email
                </a>
              ) : (
                <span style={{ color: '#6c757d', fontSize: '0.9rem', alignSelf: 'center' }}>
                  <i className="fa fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                  Invalid email address — cannot reply from here.
                </span>
              )}
              <button
                type="button"
                onClick={deleteMessage}
                disabled={savingStatus}
                style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: savingStatus ? 'not-allowed' : 'pointer' }}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}