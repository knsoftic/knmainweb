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
  minHeightClassName?: string;
};

export function PageHero({
  badge,
  title,
  description,
  breadcrumbs,
  minHeightClassName,
}: PageHeroProps) {
  return (
    <section className={`premium-hero-section d-flex align-items-center${minHeightClassName ? ` ${minHeightClassName}` : ''}`} id="top">
      <div className="container position-relative z-index-2">
        <div className="tab-content" id="heroTabContent">
          <div className="tab-pane fade show active" id="slide-1" role="tabpanel" aria-labelledby="slide-1-tab">
            <div className="row align-items-center gy-5">
              <div className="col-lg-12 text-center">
                <div className="hero-badge mb-4">
                  <span className="badge-dot"></span> {badge}
                </div>
                <h1 className="hero-title mb-3">{title}</h1>
                <p className="hero-description mb-5 text-center" style={{ margin: 'auto' }}>
                  {description}
                </p>
                <nav aria-label="breadcrumb" className="d-flex justify-content-center">
                  <ol className="breadcrumb mb-0 justify-content-center">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={`${crumb.label}-${index}`} className={`breadcrumb-item${crumb.active ? ' active fw-semibold text-white' : ''}`} aria-current={crumb.active ? 'page' : undefined}>
                        {crumb.href ? (
                          <a href={crumb.href} className="text-decoration-none text-muted-custom transition-all">
                            {crumb.label}
                          </a>
                        ) : (
                          crumb.label
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
