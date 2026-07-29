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

export function AdminButton({ children, onClick, type = "button", variant = "primary", disabled = false }: { children: React.ReactNode, onClick?: (e: any) => void, type?: "button" | "submit", variant?: "primary" | "secondary" | "danger", disabled?: boolean }) {
  let bg = 'linear-gradient(135deg, #8D18D0, #3930C7)';
  let color = '#fff';
  if (variant === 'secondary') { bg = '#f8f9fa'; color = '#343a40'; }
  if (variant === 'danger') { bg = '#dc3545'; color = '#fff'; }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ padding: '10px 24px', borderRadius: '8px', background: bg, color, border: variant === 'secondary' ? '1px solid #ced4da' : 'none', fontWeight: 600, fontSize: '0.95rem', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', width: 'fit-content', opacity: disabled ? 0.65 : 1 }}
      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  );
}

import { useState } from 'react';
import { apiService } from './../../services/api';
import { resolveImageUrl } from '../../utils/image-url';

export function AdminImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const data = await apiService.uploadFile(e.target.files[0]);
        onChange(data.url);
      } catch (err) {
        alert("Failed to upload image.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#343a40' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {value && (
          <img src={resolveImageUrl(value)} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ced4da' }} />
        )}
        <div style={{ flex: 1 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', width: '100%', fontSize: '0.9rem' }} disabled={uploading} />
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
