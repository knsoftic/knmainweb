'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../../utils/api-url';

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || !trimmedEmail || !trimmedComment) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/blog/comments/public'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, name: trimmedName, email: trimmedEmail, comment: trimmedComment }),
      });

      if (!res.ok) {
        let msg = 'Failed to submit comment';
        try {
          const errBody = await res.json();
          if (errBody.error) msg = errBody.error;
        } catch {}
        throw new Error(msg);
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setComment('');
      
      // Refresh the page data to show the new comment immediately
      router.refresh();
      
      // Reset success state after a few seconds so they can post again
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit your comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#f8f9fc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '13px 16px',
    fontSize: '0.95rem',
    color: '#1e293b',
    width: '100%',
    outline: 'none',
    transition: 'all 0.25s ease',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(122,106,216,0.12)',
        boxShadow: '0 15px 40px rgba(122,106,216,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(135deg, #8D18D0, #3930C7)' }} />

      <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e1e1e', marginBottom: '6px' }}>
        Leave a Reply
      </h4>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>
        Join the discussion. Your comment will be posted immediately.
      </p>

      {success ? (
        <div style={{
          background: '#d1e7dd',
          border: '1px solid #badbcc',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#0f5132',
        }}>
          <i className="fa fa-check-circle" style={{ fontSize: '1.4rem' }} />
          <div>
            <strong>Comment posted successfully!</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>It is now visible below.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row g-3" style={{ marginBottom: '16px' }}>
            <div className="col-md-6">
              <label htmlFor="comment-name" style={{ display: 'block', marginBottom: '7px', fontWeight: 600, color: '#4a4a4a', fontSize: '0.88rem' }}>
                Name *
              </label>
              <input
                id="comment-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#7a6ad8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(122,106,216,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#f8f9fc';
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="comment-email" style={{ display: 'block', marginBottom: '7px', fontWeight: 600, color: '#4a4a4a', fontSize: '0.88rem' }}>
                Email *
              </label>
              <input
                id="comment-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#7a6ad8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(122,106,216,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#f8f9fc';
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="comment-body" style={{ display: 'block', marginBottom: '7px', fontWeight: 600, color: '#4a4a4a', fontSize: '0.88rem' }}>
              Comment *
            </label>
            <textarea
              id="comment-body"
              required
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              style={{ ...inputStyle, borderRadius: '16px', resize: 'vertical' }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#7a6ad8';
                e.target.style.boxShadow = '0 0 0 3px rgba(122,106,216,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f8f9fc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#842029', fontSize: '0.9rem' }}>
              <i className="fa fa-exclamation-circle" style={{ marginRight: 8 }} />{error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'linear-gradient(135deg, #8D18D0, #3930C7)',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              padding: '13px 32px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.8 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 22px rgba(122,106,216,0.3)',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {submitting ? (
              <><i className="fa fa-spinner fa-spin" /> Submitting...</>
            ) : (
              <><i className="fa-regular fa-paper-plane" /> Post Comment</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
