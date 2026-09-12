import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';
import { SectionHeader } from '../../../components/common/section-header';
import { PageSchema } from '../../../components/seo/json-ld';

import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';
import { serviceAnchor } from '../../../utils/site';
import { renderInlineBold } from '../../../utils/inline-bold';
import { iconClass } from '../../../utils/icon-class';

export async function generateMetadata() {
  return generatePageMetadata('services');
}

const splitFeatures = (features: unknown) =>
  typeof features === 'string' ? features.split('\n').map((feature) => feature.trim()).filter(Boolean) : [];

export default async function ServicesPage() {
  const [categoriesData, servicesData, pageSeo] = await Promise.all([
    safeFetch(apiUrl('/service-categories'), []),
    safeFetch(apiUrl('/services'), []),
    safeFetch(apiUrl('/seo/pages/services'), null),
  ]);

  const services = (Array.isArray(servicesData) ? servicesData : [])
    .filter((s: any) => s.is_active)
    .sort((a: any, b: any) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  // Only offer filter tabs for categories that actually have services (the table also holds course categories).
  const usedCategories = categories.filter((cat: any) => services.some((s: any) => s.category_id == cat.id));

  return (
    <>
      <PageSchema slug="services" />
      <PageHero
        badge="OUR SERVICES"
        title={pageSeo?.h1_heading || "Our Services"}
        description="Empowering your brand with premium digital solutions, customized software engineering, and strategic marketing models."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', active: true }]}
      />

      <section className="ks-section" id="services">
        <div className="ks-container">
          <SectionHeader
            eyebrow="Services"
            title={pageSeo?.h2_heading || 'What We Do'}
            description="Pick a category to narrow the list, or ask us for a quote on anything you don't see here."
            action={<Link href="/contact" className="ks-link">Request a quote <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
          />

          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...usedCategories.map((cat: any) => ({
                label: String(cat.name || cat.id).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: `.${cat.filter_slug || cat.id}`
              }))
            ]}
            emptyText="No services are listed right now."
            items={services.map((service: any) => {
              const catObj = categories.find((c: any) => c.id == service.category_id);
              const filterClass = catObj ? (catObj.filter_slug || catObj.id) : service.category_id;
              const features = splitFeatures(service.features);

              return {
                id: service.id,
                filter: String(filterClass ?? ''),
                content: (
                  <article className="ks-card ks-card--hover ks-service-card" id={serviceAnchor(service.title)}>
                    <div className="ks-card__body">
                      <span className="ks-icon-tile" aria-hidden="true">
                        <i className={iconClass(service.icon)}></i>
                      </span>
                      <h3 className="ks-card__title">{service.page_title || service.title}</h3>
                      <p className="ks-card__text">{renderInlineBold(service.description)}</p>
                      {features.length > 0 && (
                        <ul className="ks-checklist">
                          {features.map((feature) => <li key={feature}>{feature}</li>)}
                        </ul>
                      )}
                      <div className="ks-card__foot ks-card__foot--line">
                        <Link href="/contact" className="ks-link">
                          {(service.button_label || 'Get a Quote').replace(/\s*→\s*$/, '')} <i className="fa fa-arrow-right" aria-hidden="true"></i>
                        </Link>
                      </div>
                    </div>
                  </article>
                ),
              };
            })}
          />
        </div>
      </section>
    </>
  );
}
