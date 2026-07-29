'use client';

import { useState } from 'react';

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `https://knsoftic.com/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: copied ? '#22c55e' : 'rgba(122,106,216,0.12)',
        color: copied ? '#fff' : '#7a6ad8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer', fontSize: '0.95rem',
        boxShadow: copied ? '0 4px 12px rgba(34,197,94,0.35)' : '0 2px 8px rgba(122,106,216,0.12)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}
      onMouseOver={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(122,106,216,0.22)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
        }
      }}
      onMouseOut={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(122,106,216,0.12)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'none';
        }
      }}
    >
      {copied ? (
        <i className="fa fa-check" />
      ) : (
        <i className="fa fa-link" />
      )}
    </button>
  );
}
