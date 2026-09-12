"use client";

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { renderInlineBold, stripInlineBold } from '../../utils/inline-bold';
import { iconClass } from '../../utils/icon-class';

export type ExplorerService = {
  id: string | number;
  title: string;
  description?: string;
  icon?: string;
  features?: string;
  button_label?: string;
};

const splitFeatures = (features?: string) =>
  typeof features === 'string' ? features.split('\n').map((feature) => feature.trim()).filter(Boolean) : [];

/** Featured services as tabs on the left and the selected service's details on the right. */
export function ServiceExplorer({ services }: { services: ExplorerService[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  if (services.length === 0) return null;

  const index = Math.min(activeIndex, services.length - 1);
  const active = services[index];
  const features = splitFeatures(active.features);

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = index;
    if (event.key in keys) next = (index + keys[event.key] + services.length) % services.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = services.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="ks-explorer" data-reveal="stagger">
      <div className="ks-explorer__list" role="tablist" aria-label="Our services" aria-orientation="vertical">
        {services.map((service, i) => (
          <button
            key={service.id}
            ref={(element) => { tabRefs.current[i] = element; }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === index}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === index ? 0 : -1}
            className="ks-explorer__tab"
            onClick={() => setActiveIndex(i)}
            onKeyDown={onKeyDown}
          >
            <span className="ks-icon-tile ks-icon-tile--sm" aria-hidden="true">
              <i className={iconClass(service.icon)}></i>
            </span>
            <span>
              <span className="ks-explorer__tab-title">{service.title}</span>
              {service.description && <span className="ks-explorer__tab-sub">{stripInlineBold(service.description)}</span>}
            </span>
            <i className="fa fa-arrow-right ks-explorer__tab-arrow" aria-hidden="true"></i>
          </button>
        ))}
      </div>

      <div
        className="ks-explorer__panel"
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${index}`}
        key={active.id}
      >
        <span className="ks-icon-tile ks-icon-tile--lg ks-icon-tile--grad" aria-hidden="true">
          <i className={iconClass(active.icon)}></i>
        </span>
        <h3 className="ks-explorer__panel-title">{active.title}</h3>
        {active.description && <p className="ks-card__text">{renderInlineBold(active.description)}</p>}
        {features.length > 0 && (
          <ul className="ks-checklist ks-checklist--2">
            {features.map((feature, i) => <li key={feature} style={{ '--i': i } as React.CSSProperties}>{feature}</li>)}
          </ul>
        )}
        <div className="ks-explorer__actions">
          <Link href="/contact" className="ks-btn ks-btn--primary">
            {(active.button_label || 'Get a Quote').replace(/\s*→\s*$/, '')} <i className="fa fa-arrow-right" aria-hidden="true"></i>
          </Link>
          <Link href="/services" className="ks-btn ks-btn--outline">All Services</Link>
        </div>
      </div>
    </div>
  );
}
