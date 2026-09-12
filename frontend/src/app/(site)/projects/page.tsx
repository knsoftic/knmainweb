import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';
import { SectionHeader } from '../../../components/common/section-header';
import { PageSchema } from '../../../components/seo/json-ld';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { ProjectCard } from '../../../components/common/project-card';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('projects');
}

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Used for both the filter tabs and the items, so uncategorized projects land under the "Projects" tab.
const DEFAULT_CATEGORY = 'Projects';

export default async function ProjectsPage() {
  const [data, pageSeo] = await Promise.all([
    safeFetch(apiUrl('/projects'), []),
    safeFetch(apiUrl('/seo/pages/projects'), null),
  ]);
  const projects = (Array.isArray(data) ? data : [])
    .filter((project: any) => project.status === 'active')
    .sort((a: any, b: any) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  // One tab per category name: different projects can carry different slugs for the same
  // category ("Portfolio"), which used to show the same tab twice.
  const categoryMap = new Map<string, string>();
  projects.forEach((project: any) => {
    const category = project.category || DEFAULT_CATEGORY;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, slugify(category));
    }
  });

  // Four projects sit in one clean row; any other count reads better three across.
  const columns = projects.length % 4 === 0 ? 4 : 3;

  return (
    <>
      <PageSchema slug="projects" />
      <PageHero
        badge="PROJECTS"
        title={pageSeo?.h1_heading || "Our Work"}
        description="A selection of client projects and the software products we build and maintain in-house."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects', active: true }]}
      />

      <section className="ks-section" id="projects">
        <div className="ks-container">
          <SectionHeader
            eyebrow="Portfolio"
            title={pageSeo?.h2_heading || 'Our Projects'}
            description="Client work and our own software products. Want something similar for your business?"
            action={<Link href="/contact" className="ks-link">Start a project <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
          />

          <FilteredGrid
            columns={columns as 2 | 3 | 4}
            filters={[
              { label: 'Show All', value: '*' },
              ...Array.from(categoryMap.entries()).map(([label, slug]) => ({ label, value: `.${slug}` })),
            ]}
            emptyText="Projects will be listed here soon."
            items={projects.map((project: any, index: number) => ({
              id: project.id,
              filter: slugify(project.category || DEFAULT_CATEGORY),
              content: <ProjectCard project={project} index={index} columns={columns} />,
            }))}
          />
        </div>
      </section>
    </>
  );
}
