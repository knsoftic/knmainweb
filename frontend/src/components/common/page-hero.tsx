import Link from 'next/link';
import { SplitWords } from './split-words';

type BreadcrumbItem = {
  label: string;
  href?: string;
  active?: boolean;
};

type PageHeroProps = {
  badge: string;
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Extra classes for the section (e.g. a taller variant). */
  minHeightClassName?: string;
  children?: React.ReactNode;
};

/** Shared animated background for the inner-page banners (also used by the blog post header). */
export function PageHeroBackground() {
  return (
    <div className="ks-page-hero__bg" aria-hidden="true">
      <span className="ks-blob ks-blob--1"></span>
      <span className="ks-blob ks-blob--2"></span>
      <span className="ks-page-hero__rings"><i></i></span>
      <span className="ks-grain"></span>
    </div>
  );
}

export function PageHero({
  badge,
  title,
  description,
  breadcrumbs,
  minHeightClassName,
  children,
}: PageHeroProps) {
  return (
    <section className={`ks-page-hero${minHeightClassName ? ` ${minHeightClassName}` : ''}`} id="top">
      <PageHeroBackground />
      <div className="ks-container">
        <div className="ks-page-hero__inner">
          <nav aria-label="Breadcrumb">
            <ol className="ks-crumbs">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`}>
                  {crumb.href && !crumb.active ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={crumb.active ? 'page' : undefined}>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <span className="ks-badge">
            <span className="ks-badge__dot" aria-hidden="true"></span> {badge}
          </span>
          <h1 className="ks-display ks-page-hero__title"><SplitWords text={title} /></h1>
          {description && <p className="ks-page-hero__desc">{description}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
