"use client";

import { useMemo, useState } from 'react';
import { revealDelay } from '../../utils/reveal';

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGridItem = {
  id: string;
  /** Space-separated filter slugs this item belongs to (matched against a filter's value without the leading dot). */
  filter: string;
  className?: string;
  content: React.ReactNode;
};

type FilteredGridProps = {
  filters: FilterOption[];
  items: FilterGridItem[];
  activeFilter?: string;
  columns?: 2 | 3 | 4;
  emptyText?: string;
};

export function FilteredGrid({ filters, items, activeFilter = '*', columns = 3, emptyText = 'Nothing to show here yet.' }: FilteredGridProps) {
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);
  const [hasFiltered, setHasFiltered] = useState(false);

  const visibleItems = useMemo(() => {
    if (selectedFilter === '*') {
      return items;
    }

    return items.filter((item) => item.filter.split(' ').includes(selectedFilter.replace('.', '')));
  }, [items, selectedFilter]);

  // "Show All" plus a single category adds nothing, so only offer filters when there is a real choice.
  const showFilters = filters.filter((filter) => filter.value !== '*').length > 1;
  const gridClass = `${columns === 3 ? 'ks-grid' : `ks-grid ks-grid--${columns}`}${hasFiltered ? ' is-filtering' : ''}`;

  const selectFilter = (value: string) => {
    setSelectedFilter(value);
    setHasFiltered(true);
  };

  return (
    <>
      {showFilters && (
        <div className="ks-filter" role="group" aria-label="Filter" data-reveal="stagger">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className="ks-filter__btn"
              data-filter={filter.value}
              aria-pressed={selectedFilter === filter.value}
              onClick={() => selectFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="ks-empty">{emptyText}</div>
      ) : (
        // Keyed by the filter so a new selection re-mounts the cards and they animate in.
        <div className={gridClass} key={selectedFilter}>
          {visibleItems.map((item, index) => (
            <div key={item.id} className={item.className} data-reveal="" style={revealDelay(index, columns)}>
              {item.content}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
