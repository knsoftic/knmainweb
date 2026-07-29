'use client';

import { useState } from 'react';

function ShareLink({
  href,
  title,
  bg,
  shadow,
  children,
}: {
  href: string;
  title: string;
  bg: string;
  shadow: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        fontSize: '1rem',
        boxShadow: hovered ? shadow.replace('0.3)', '0.55)').replace('0.18)', '0.32)') : shadow,
        transform: hovered ? 'translateY(-3px) scale(1.08)' : 'none',
        transition: 'all 0.22s ease',
        flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
}

function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `https://knsoftic.com/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
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
      title={copied ? 'Copied!' : 'Copy link'}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: copied ? '#22c55e' : 'rgba(122,106,216,0.12)',
        color: copied ? '#fff' : '#7a6ad8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem',
        boxShadow: copied
          ? '0 4px 14px rgba(34,197,94,0.38)'
          : '0 2px 8px rgba(122,106,216,0.1)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
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

export default function ShareButtons({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const pageUrl = `https://knsoftic.com/blog/${slug}`;
  const encodedTitle = encodeURIComponent(title);

  return (
    <div
      style={{
        marginTop: '30px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(122,106,216,0.12)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontWeight: 700,
          color: '#1e1e1e',
          fontSize: '0.9rem',
          marginRight: '4px',
        }}
      >
        Share:
      </span>

      {/* X / Twitter */}
      <ShareLink
        href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodedTitle}`}
        title="Share on X (Twitter)"
        bg="#000"
        shadow="0 4px 12px rgba(0,0,0,0.18)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.26 5.638 5.904-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </ShareLink>

      {/* Facebook */}
      <ShareLink
        href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
        title="Share on Facebook"
        bg="#1877F2"
        shadow="0 4px 12px rgba(24,119,242,0.3)"
      >
        <i className="fab fa-facebook-f" />
      </ShareLink>

      {/* LinkedIn */}
      <ShareLink
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${encodedTitle}`}
        title="Share on LinkedIn"
        bg="#0A66C2"
        shadow="0 4px 12px rgba(10,102,194,0.3)"
      >
        <i className="fab fa-linkedin-in" />
      </ShareLink>

      {/* WhatsApp */}
      <ShareLink
        href={`https://wa.me/?text=${encodeURIComponent(title + ' — ' + pageUrl)}`}
        title="Share on WhatsApp"
        bg="#25D366"
        shadow="0 4px 12px rgba(37,211,102,0.3)"
      >
        <i className="fab fa-whatsapp" />
      </ShareLink>

      {/* Copy Link */}
      <CopyButton slug={slug} />
    </div>
  );
}
