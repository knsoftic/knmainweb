"use client";

import React from 'react';

type Column = {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
};

type ExtraAction = {
  label: string;
  icon?: string;
  color?: string;         // text colour (default #495057)
  bgColor?: string;       // background (default rgba(73,80,87,0.1))
  onClick: (item: any) => void;
};

type AdminTableProps = {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  extraActions?: ExtraAction[];
  loading?: boolean;
};

export function AdminTable({ columns, data, onEdit, onDelete, extraActions, loading }: AdminTableProps) {
  const hasActions = !!(onEdit || onDelete || (extraActions && extraActions.length > 0));

  if (loading) {
    return (
      <div style={{
        background: '#fff', borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        padding: '60px', textAlign: 'center',
      }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8D18D0' }} />
        <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
      overflowX: 'auto',
      width: '100%',
      maxWidth: '100%'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '12px 10px', fontSize: '0.82rem', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th style={{ padding: '12px 10px', fontSize: '0.82rem', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} style={{ padding: '40px', textAlign: 'center', color: '#adb5bd' }}>
                <i className="fa fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }} />
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={item.id || idx}
                style={{ borderBottom: '1px solid #f1f3f5', transition: 'background 0.15s ease' }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '12px 10px', fontSize: '0.93rem', color: '#495057', verticalAlign: 'middle' }}>
                    {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '-')}
                  </td>
                ))}
                {hasActions && (
                  <td style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {extraActions?.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => action.onClick(item)}
                          title={action.label}
                          style={{
                            background: action.bgColor || 'rgba(73,80,87,0.08)',
                            color: action.color || '#495057',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            fontWeight: 600,
                          }}
                        >
                          {action.icon && <i className={`fa ${action.icon}`} />}
                          {action.label}
                        </button>
                      ))}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, transition: 'all 0.2s' }}
                        >
                          <i className="fa fa-pencil" /> Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, transition: 'all 0.2s' }}
                        >
                          <i className="fa fa-trash" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
