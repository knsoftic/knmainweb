"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminTable } from '../../../../components/common/admin-table';
import { apiService } from '../../../../services/api';

export default function BlogCommentsManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [posts, setPosts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Reply modal state
  const [replyToComment, setReplyToComment] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [commentsData, postsData] = await Promise.all([
        apiService.get('/blog/comments'),
        apiService.get('/blog/posts'),
      ]);
      setComments(commentsData || []);
      // Build a id -> title map
      const postMap: Record<number, string> = {};
      (postsData || []).forEach((p: any) => { postMap[p.id] = p.title; });
      setPosts(postMap);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`Delete comment by "${item.name}"?`)) {
      try {
        await apiService.delete(`/blog/comments/${item.id}`);
        setComments((prev) => prev.filter((c) => c.id !== item.id));
      } catch {
        alert('Failed to delete comment');
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyToComment || !replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      await apiService.post('/blog/comments/public', {
        post_id: replyToComment.post_id,
        parent_id: replyToComment.id,
        name: 'Admin',
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@knsoftic.com',
        comment: replyMessage.trim(),
      });
      alert('Reply posted successfully!');
      setReplyToComment(null);
      setReplyMessage('');
      fetchData();
    } catch (e: any) {
      alert('Failed to post reply: ' + (e?.message || 'Unknown error'));
    }
    setSubmittingReply(false);
  };

  const columns = [
    {
      key: 'post_id',
      label: 'Post',
      render: (_: any, item: any) => (
        <div>
          <span style={{ maxWidth: '180px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem', color: '#7a6ad8', fontWeight: 600 }}>
            {posts[item.post_id] || `#${item.post_id}`}
          </span>
          {item.parent_id && (
            <span style={{ fontSize: '0.75rem', color: '#8D18D0', background: 'rgba(141,24,208,0.08)', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
              ↳ Reply to #{item.parent_id}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Author',
      render: (val: string) => (
        <span style={{ display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>
          <strong>{val}</strong>
          {val === 'Admin' && (
            <span style={{ marginLeft: 6, fontSize: '0.72rem', background: '#8D18D0', color: '#fff', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
              STAFF
            </span>
          )}
        </span>
      ),
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (val: string) => (
        <div style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.88rem' }} title={val}>
          {val}
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (val: string) => (
        <div style={{ maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }} title={val}>
          {val}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '-',
    },
  ];

  const extraActions = [
    {
      label: 'Reply',
      icon: 'fa-reply',
      color: '#8D18D0',
      bgColor: 'rgba(141, 24, 208, 0.1)',
      onClick: (item: any) => {
        setReplyToComment(item);
        setReplyMessage('');
      },
    },
  ];

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

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50', fontSize: '1.5rem' }}>Blog Comments</h2>
          <p style={{ margin: '6px 0 0', color: '#6c757d', fontSize: '0.95rem' }}>
            View, reply to, and manage reader comments across all blog posts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', color: '#6c757d', background: '#f8f9fa', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            Total Comments: <strong style={{ color: '#8D18D0' }}>
              {comments.length}
            </strong>
          </span>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={comments}
        onDelete={handleDelete}
        extraActions={extraActions}
        loading={loading}
      />

      {/* Reply Modal */}
      {replyToComment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '550px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden',
          }}>
            <div style={{
              background: '#f8f9fa', padding: '16px 24px', borderBottom: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>
                <i className="fa fa-reply" style={{ marginRight: 8, color: '#8D18D0' }} />
                Reply to Comment
              </h4>
              <button
                type="button"
                onClick={() => setReplyToComment(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#aaa' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReply} style={{ padding: '24px' }}>
              {/* Target comment preview */}
              <div style={{
                background: '#f8f9fc', borderLeft: '4px solid #8D18D0', padding: '12px 16px',
                borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '0.9rem',
              }}>
                <div style={{ fontWeight: 600, color: '#1e1e1e', marginBottom: '4px' }}>
                  {replyToComment.name} <span style={{ fontWeight: 400, color: '#888', fontSize: '0.82rem' }}>({replyToComment.email})</span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#555', 
                  fontStyle: 'italic',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  "{replyToComment.comment}"
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#444', marginBottom: '8px' }}>
                  Admin Reply Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to this user..."
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    border: '1px solid #ced4da', fontSize: '0.92rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReplyToComment(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #8D18D0, #3930C7)', color: '#fff',
                    fontWeight: 700, cursor: (submittingReply || !replyMessage.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (submittingReply || !replyMessage.trim()) ? 0.7 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  {submittingReply ? (
                    <><i className="fa fa-spinner fa-spin" /> Sending...</>
                  ) : (
                    <><i className="fa fa-paper-plane" /> Post Reply</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
