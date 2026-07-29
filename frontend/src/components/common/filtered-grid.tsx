"use client";

import { useMemo, useState } from 'react';

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterGridItem = {
  id: string;
  filter: string;
  className?: string;
  content: React.ReactNode;
};

type FilteredGridProps = {
  filters: FilterOption[];
  items: FilterGridItem[];
  activeFilter?: string;
};

export function FilteredGrid({ filters, items, activeFilter = '*' }: FilteredGridProps) {
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);

  const visibleItems = useMemo(() => {
    if (selectedFilter === '*') {
      return items;
    }

    return items.filter((item) => item.filter.split(' ').includes(selectedFilter.replace('.', '')));
  }, [items, selectedFilter]);

  return (
    <>
      <ul className="event_filter">
        {filters.map((filter) => (
          <li key={filter.value}>
            <a
              href="#"
              className={selectedFilter === filter.value ? 'is_active' : ''}
              data-filter={filter.value}
              onClick={(event) => {
                event.preventDefault();
                setSelectedFilter(filter.value);
              }}
            >
              {filter.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="row event_box">
        {visibleItems.map((item) => (
          <div key={item.id} className={item.className}>
            {item.content}
          </div>
        ))}
      </div>
    </>
  );
}
