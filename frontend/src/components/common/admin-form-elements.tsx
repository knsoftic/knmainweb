"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };
export function AdminInput({ label, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>{label}</label>
      <input
        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', color: '#495057', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' }}
        onFocus={(e) => e.target.style.borderColor = '#8D18D0'}
        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
        {...props}
      />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };
export function AdminTextarea({ label, ...props }: TextareaProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>{label}</label>
      <textarea
        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', color: '#495057', transition: 'border-color 0.2s, outline 0.2s', outline: 'none', minHeight: '120px' }}
        onFocus={(e) => e.target.style.borderColor = '#8D18D0'}
        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
        {...props}
      />
    </div>
  );
}

export function AdminButton({ children, onClick, type = "button", variant = "primary", disabled = false, loading = false }: { children: React.ReactNode, onClick?: (e: any) => void, type?: "button" | "submit", variant?: "primary" | "secondary" | "danger", disabled?: boolean, loading?: boolean }) {
  let bg = 'linear-gradient(135deg, #8D18D0, #3930C7)';
  let color = '#fff';
  if (variant === 'secondary') { bg = '#f8f9fa'; color = '#343a40'; }
  if (variant === 'danger') { bg = '#dc3545'; color = '#fff'; }
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={{ padding: '10px 24px', borderRadius: '8px', background: bg, color, border: variant === 'secondary' ? '1px solid #ced4da' : 'none', fontWeight: 600, fontSize: '0.95rem', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', width: 'fit-content', opacity: isDisabled ? 0.65 : 1 }}
      onMouseOver={(e) => { if (!isDisabled) e.currentTarget.style.opacity = '0.9'; }}
      onMouseOut={(e) => { e.currentTarget.style.opacity = isDisabled ? '0.65' : '1'; }}
    >
      {loading && <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }} />}
      {children}
    </button>
  );
}

import { useRef, useState } from 'react';
import { apiService } from './../../services/api';
import { resolveImageUrl } from '../../utils/image-url';
import { notify } from './admin-feedback';

const REMOVE_RED = '#dc3545';
const REMOVE_RED_HOVER = '#b02a37';

export function AdminImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      setUploading(true);
      try {
        const data = await apiService.uploadFile(input.files[0]);
        onChange(data.url);
      } catch (err: any) {
        // Show the server's reason (e.g. file too large, unsupported type) when available.
        notify(err?.message ? `Failed to upload image: ${err.message}` : 'Failed to upload image.', 'error');
        // Reset so picking the same file again re-triggers onChange.
        input.value = '';
      } finally {
        setUploading(false);
      }
    }
  };

  // Clears the field only. Nothing is saved until the form is, so closing without saving brings the
  // image back; the file itself stays in the media library, since other pages may still use it.
  const removeImage = () => {
    onChange('');
    // Otherwise the picker keeps its last file, and choosing that same file again would do nothing.
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {value && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={resolveImageUrl(value)} alt="Preview" style={{ display: 'block', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ced4da' }} />
            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              aria-label={`Remove ${label}`}
              title="Remove image"
              style={{
                position: 'absolute',
                top: '-9px',
                right: '-9px',
                width: '26px',
                height: '26px',
                minHeight: 0,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid #fff',
                background: REMOVE_RED,
                color: '#fff',
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                transition: 'background-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.background = REMOVE_RED_HOVER; e.currentTarget.style.transform = 'scale(1.08)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = REMOVE_RED; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Drawn inline rather than from an icon font: the admin theme loads its own older Font
                  Awesome over the site's, and the two name this icon differently. */}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon,.ico" onChange={handleFileChange} style={{ display: 'block', width: '100%', fontSize: '0.9rem' }} disabled={uploading} />
          {uploading && <span style={{ fontSize: '0.85rem', color: '#8D18D0', marginTop: '5px', display: 'block' }}>Uploading...</span>}
        </div>
      </div>
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: {label: string, value: string | number}[] };
export function AdminSelect({ label, options, ...props }: SelectProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>{label}</label>
      <select
        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '0.95rem', color: '#495057', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none', backgroundColor: '#fff' }}
        onFocus={(e) => e.target.style.borderColor = '#8D18D0'}
        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
