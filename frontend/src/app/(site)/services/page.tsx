import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';

import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('services');
}

const categoryMap: any = {
  1: 'ui_ux',
  2: 'e_commerce',
  3: 'custom_software',
  4: 'video_editing',
  5: 'seo_mastery',
  6: 'digital_marketing'
};

export default async function ServicesPage() {
  const categoriesData = await safeFetch(apiUrl('/service-categories'), []);
  const servicesData = await safeFetch(apiUrl('/services'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/services'), null);

  const services = (Array.isArray(servicesData) ? servicesData : []).filter((s: any) => s.is_active);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <>
      <PageHero
        badge="OUR SERVICES"
        title={pageSeo?.h1_heading || "Our Services"}
        description="Empowering your brand with premium digital solutions, customized software engineering, and strategic marketing models."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', active: true }]}
      />

      <section className="section services" id="services">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="section-heading"><h2>{pageSeo?.h2_heading || 'What We Do'}</h2></div>
            </div>
          </div>

          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...categories.map((cat: any) => ({
                label: String(cat.name || cat.id).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: `.${cat.filter_slug || cat.id}`
              }))
            ]}
            items={services.map((service: any) => {
              const catObj = categories.find((c: any) => c.id == service.category_id);
              const filterClass = catObj ? (catObj.filter_slug || catObj.id) : service.category_id;
              
              return {
                id: service.id,
                filter: `col-lg-4 col-md-6 mb-4 event_outer ${filterClass}`,
                className: `col-lg-4 col-md-6 mb-4 event_outer ${filterClass}`,
                content: (
                  <div className="service-page-card">
                    <div className="card-icon-top">
                      <i className={`fa ${service.icon || 'fa-desktop'}`}></i>
                    </div>
                    <h4>{service.page_title || service.title}</h4>
                  <p className="card-desc">{service.description}</p>
                  
                  {service.features && typeof service.features === 'string' && service.features.trim() !== '' && (
                    <ul className="card-features">
                      {service.features.split('\n').map((feature: string, idx: number) => {
                        const trimmed = feature.trim();
                        if (!trimmed) return null;
                        return (
                          <li key={idx}><i className="fa fa-check check-icon"></i> {trimmed}</li>
                        );
                      })}
                    </ul>
                  )}

                  <a href="/contact" className="btn-quote">{service.button_label || 'Get a Quote →'}</a>
                </div>
              )
            };
            })}
          />
        </div>
      </section>
    </>
  );
}