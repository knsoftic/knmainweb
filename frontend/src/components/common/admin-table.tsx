"use client";

import React, { useMemo, useState } from 'react';

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
  /** Search box; shown by default once there are more than five rows. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown when there is nothing to list at all. */
  emptyMessage?: string;
};

const textOf = (item: any, columns: Column[]) =>
  columns.map((col) => String(item?.[col.key] ?? '')).join(' ').toLowerCase();

export function AdminTable({
  columns,
  data,
  onEdit,
  onDelete,
  extraActions,
  loading,
  searchable,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No records yet.',
}: AdminTableProps) {
  const [query, setQuery] = useState('');
  const hasActions = !!(onEdit || onDelete || (extraActions && extraActions.length > 0));
  const showSearch = searchable ?? data.length > 5;

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((item) => textOf(item, columns).includes(term));
  }, [data, columns, query]);

  if (loading) {
    return (
      <div className="admin-table__panel admin-table__loading">
        <i className="fa fa-spinner fa-spin" aria-hidden="true" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-table">
      {(showSearch || data.length > 0) && (
        <div className="admin-table__bar">
          {showSearch ? (
            <div className="admin-table__search">
              <i className="fa fa-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search this list"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : <span />}
          <span className="admin-table__count">
            {query ? `${rows.length} of ${data.length}` : `${data.length} ${data.length === 1 ? 'record' : 'records'}`}
          </span>
        </div>
      )}

      <div className="admin-table__panel">
        <table>
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
              {hasActions && <th className="admin-table__actions-head">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="admin-table__empty">
                  <i className={`fa ${query ? 'fa-search' : 'fa-inbox'}`} aria-hidden="true" />
                  {query ? (
                    <>
                      <p>Nothing matches &ldquo;{query}&rdquo;.</p>
                      <button type="button" className="admin-table__clear" onClick={() => setQuery('')}>Clear search</button>
                    </>
                  ) : (
                    <p>{emptyMessage}</p>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((item, idx) => (
                <tr key={item.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key} data-label={col.label}>
                      {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '-')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="admin-table__actions" data-label="Actions">
                      <div>
                        {extraActions?.map((action, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => action.onClick(item)}
                            title={action.label}
                            className="admin-table__btn"
                            style={{ background: action.bgColor || 'rgba(73,80,87,0.08)', color: action.color || '#495057' }}
                          >
                            {action.icon && <i className={`fa ${action.icon}`} aria-hidden="true" />}
                            {action.label}
                          </button>
                        ))}
                        {onEdit && (
                          <button type="button" onClick={() => onEdit(item)} className="admin-table__btn admin-table__btn--edit">
                            <i className="fa fa-pencil" aria-hidden="true" /> Edit
                          </button>
                        )}
                        {onDelete && (
                          <button type="button" onClick={() => onDelete(item)} className="admin-table__btn admin-table__btn--delete">
                            <i className="fa fa-trash" aria-hidden="true" /> Delete
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
    </div>
  );
}
