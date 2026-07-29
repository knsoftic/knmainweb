import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { resolveImageUrl } from '../../../utils/image-url';
import { generatePageMetadata, getImageSeo } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('projects');
}

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const resolveMediaUrl = (url?: string | null) => {
  if (!url) {
    return '';
  }

  return resolveImageUrl(url);
};

const splitList = (value?: string | null) => {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default async function ProjectsPage() {
  const data = await safeFetch(apiUrl('/projects'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/projects'), null);
  const projects = (Array.isArray(data) ? data : []).filter((project: any) => project.status === 'active');

  const categoryMap = new Map<string, string>();
  projects.forEach((project: any) => {
    const category = project.category || 'Projects';
    const categorySlug = slugify(project.filter_slug || category);
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, category);
    }
  });

  const projectsWithSeo = await Promise.all(projects.map(async (project: any) => {
    const imgSeo = await getImageSeo(project.image_url);
    return { ...project, imgSeo };
  }));

  return (
    <>
      <PageHero
        badge="PROJECTS"
        title={pageSeo?.h1_heading || "Unified Portfolio / Products"}
        description="A single source of truth for client work, software products, and featured builds."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects', active: true }]}
      />

      <section className="section services" id="projects">
        <div className="container">
          <div className="row"><div className="col-lg-12 text-center"><div className="section-heading"><h2>{pageSeo?.h2_heading || 'Our Projects'}</h2></div></div></div>

          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...Array.from(categoryMap.entries()).map(([slug, label]) => ({ label, value: `.${slug}` })),
            ]}
            items={projectsWithSeo.map((project: any) => {
              const categorySlug = slugify(project.filter_slug || project.category || project.title || 'projects');
              const imageUrl = resolveMediaUrl(project.image_url);
              const technologies = splitList(project.technologies);
              const features = splitList(project.features);
              const primaryLink = project.primary_link_url;
              const secondaryLink = project.secondary_link_url;

              return {
                id: project.id,
                filter: `col-lg-4 col-md-6 mb-4 event_outer ${categorySlug}`,
                className: `col-lg-4 col-md-6 mb-4 event_outer ${categorySlug}`,
                content: (
                  <div className="service-card">
                    <div className="card-graphic-panel">
                      {imageUrl ? (
                        <img src={imageUrl} alt={project.imgSeo.alt_text || project.title} title={project.imgSeo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="card-icon"><i className={`fa ${project.icon || 'fa-folder-open'}`}></i></div>
                      )}
                    </div>
                    <div className="card-details-panel">
                      <h4>{project.title}</h4>
                      <p className="card-description">{project.description}</p>
                      <div className="card-meta-footer">
                        <a href="#" className="btn-quote">{project.badge || project.label || project.category}</a>
                        <span className="client-tag">{project.client_name || project.category}</span>
                      </div>

                      {technologies.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                          {technologies.map((technology: string) => (
                            <span key={technology} style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(141,24,208,0.08)', color: '#8D18D0', fontSize: '0.8rem', fontWeight: 600 }}>
                              {technology}
                            </span>
                          ))}
                        </div>
                      )}

                      {features.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                          {features.map((feature: string) => (
                            <span key={feature} style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(25,118,210,0.08)', color: '#1976d2', fontSize: '0.8rem', fontWeight: 600 }}>
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      {(primaryLink || secondaryLink) && (
                        <div className="card-footer-actions" style={{ marginTop: '14px' }}>
                          {primaryLink && (
                            <a href={primaryLink} className="btn-demo" target="_blank" rel="noreferrer">
                              <i className="fa fa-external-link"></i> {project.primary_link_label || 'View Details'}
                            </a>
                          )}
                          {secondaryLink && (
                            <a href={secondaryLink} className="btn-whatsapp" target="_blank" rel="noreferrer">
                              <i className="fa fa-link"></i> {project.secondary_link_label || 'Open Link'}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              };
            })}
          />
        </div>
      </section>
    </>
  );
}