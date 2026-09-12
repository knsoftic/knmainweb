import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { PageHero } from '../../../../components/common/page-hero';
import { SectionHeader } from '../../../../components/common/section-header';
import { ProjectCard } from '../../../../components/common/project-card';
import { safeFetch } from '../../../../utils/safe-fetch';
import { apiUrl } from '../../../../utils/api-url';
import { optimizedImage, resolveImageUrl } from '../../../../utils/image-url';
import { getImageSeo } from '../../../../utils/seo';

type Props = { params: Promise<{ id: string }> };

const splitList = (value?: string | null) =>
  String(value || '').split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

// The API lists projects rather than serving them one by one; cache() keeps this to a single
// request per visit, shared by the metadata and the page.
const getProjects = cache(async () => {
  const data = await safeFetch(apiUrl('/projects'), []);
  return (Array.isArray(data) ? data : []).filter((project: any) => project.status === 'active');
});

const findProject = async (id: string) => {
  const projects = await getProjects();
  const wanted = decodeURIComponent(id).trim().toLowerCase();
  return projects.find((project: any) => String(project.id).toLowerCase() === wanted) || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await findProject((await params).id);
  if (!project) return { title: 'Project Not Found', robots: { index: false } };

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.image_url ? [{ url: resolveImageUrl(project.image_url) }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await findProject(id);
  if (!project) {
    notFound();
  }

  const [imgSeo, projects] = await Promise.all([getImageSeo(project.image_url), getProjects()]);
  const imageUrl = project.image_url ? resolveImageUrl(project.image_url) : '';
  const technologies = splitList(project.technologies);
  const features = splitList(project.features);
  const others = projects.filter((other: any) => other.id !== project.id).slice(0, 3);

  return (
    <>
      <PageHero
        badge={project.category || 'PROJECT'}
        title={project.title}
        description={project.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project.title, active: true },
        ]}
      />

      <section className="ks-section">
        <div className="ks-container">
          <div className="ks-split" style={{ alignItems: 'start' }}>
            <div className="ks-project-hero" data-reveal="left">
              {imageUrl ? (
                <>
                  {/* The blurred copy fills the frame behind, so screenshots and logos both sit well. */}
                  <span
                    className="ks-project-hero__fill"
                    style={{ backgroundImage: `url(${optimizedImage(imageUrl, '384px', [384]).src})` }}
                    aria-hidden="true"
                  ></span>
                  <img
                    {...optimizedImage(imageUrl, '(max-width: 1000px) 100vw, 620px', [384, 640, 828, 1200])}
                    alt={imgSeo.alt_text || project.title}
                    title={imgSeo.title}
                    fetchPriority="high"
                    decoding="async"
                  />
                </>
              ) : (
                <span className="ks-project-card__icon" aria-hidden="true">
                  <i className={`fa ${project.icon || 'fa-folder-open'}`}></i>
                </span>
              )}
            </div>

            <div data-reveal="right">
              <p className="ks-eyebrow">{project.badge || project.label || 'Project'}</p>
              <h2 className="ks-title">About this project</h2>
              <p className="ks-lead" style={{ marginTop: '18px' }}>{project.description}</p>

              <dl className="ks-spec">
                {project.client_name && (
                  <div>
                    <dt>Client</dt>
                    <dd>{String(project.client_name).replace(/^client:\s*/i, '')}</dd>
                  </div>
                )}
                <div>
                  <dt>Category</dt>
                  <dd>{project.category || 'Project'}</dd>
                </div>
                {project.badge && (
                  <div>
                    <dt>Status</dt>
                    <dd>{project.badge}</dd>
                  </div>
                )}
              </dl>

              {technologies.length > 0 && (
                <div style={{ marginTop: '28px' }}>
                  <p className="ks-label">Built with</p>
                  <div className="ks-tags">
                    {technologies.map((technology) => <span key={technology} className="ks-chip">{technology}</span>)}
                  </div>
                </div>
              )}

              {features.length > 0 && (
                <div style={{ marginTop: '28px' }}>
                  <p className="ks-label">What it does</p>
                  <ul className="ks-checklist ks-checklist--2">
                    {features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px' }}>
                {project.primary_link_url && (
                  <a href={project.primary_link_url} className="ks-btn ks-btn--primary" target="_blank" rel="noreferrer">
                    {project.primary_link_label || 'View Live'} <i className="fa fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  </a>
                )}
                {project.secondary_link_url && (
                  <a href={project.secondary_link_url} className="ks-btn ks-btn--outline" target="_blank" rel="noreferrer">
                    {project.secondary_link_label || 'Open Link'} <i className="fa fa-link" aria-hidden="true"></i>
                  </a>
                )}
                <Link href="/contact" className={project.primary_link_url ? 'ks-btn ks-btn--outline' : 'ks-btn ks-btn--primary'}>
                  Request something similar <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="ks-section ks-section--white">
          <div className="ks-container">
            <SectionHeader
              eyebrow="More work"
              title="Other projects"
              action={<Link href="/projects" className="ks-link">View all projects <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
            />
            <div className="ks-grid">
              {others.map((other: any, index: number) => (
                <ProjectCard key={other.id} project={other} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
