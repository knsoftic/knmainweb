import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';
import { CourseCard } from '../../../components/common/course-card';
import { SectionHeader } from '../../../components/common/section-header';
import { PageSchema } from '../../../components/seo/json-ld';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';
import { revealDelay } from '../../../utils/reveal';

export async function generateMetadata() {
  return generatePageMetadata('courses');
}

const categorySlug = (value: unknown) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_');

const PERKS = [
  { icon: 'fa-laptop-code', title: 'Hands-on projects', text: 'Build real work you can show, not just slides.' },
  { icon: 'fa-certificate', title: 'Certificates', text: 'Get certified when you complete a course.' },
  { icon: 'fa-briefcase', title: 'Career support', text: 'Guidance on portfolios, freelancing and jobs.' },
];

export default async function CoursesPage() {
  const [data, pageSeo, facts] = await Promise.all([
    safeFetch(apiUrl('/courses'), []),
    safeFetch(apiUrl('/seo/pages/courses'), null),
    safeFetch(apiUrl('/fun_facts'), []),
  ]);
  const courses = (Array.isArray(data) ? data : [])
    .filter((c: any) => c.is_active)
    .sort((a: any, b: any) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  // Same number as the homepage "students" counter (Admin → Homepage → Fun Facts), so the two never disagree.
  const studentsFact = (Array.isArray(facts) ? facts : []).find((fact: any) => fact.id === 'students');
  const studentsCount = Number(studentsFact?.target) || 0;
  const heroDescription = 'Professional IT courses with certifications, hands-on projects, and career support.'
    + (studentsCount > 0 ? ` Join ${studentsCount}+ trained students.` : '');

  return (
    <>
      <PageSchema slug="courses" />
      <PageHero
        badge="IT COURSES"
        title={pageSeo?.h1_heading || "Our Courses"}
        description={heroDescription}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', active: true }]}
      />

      <section className="ks-section ks-section--tight" aria-label="Why study with us">
        <div className="ks-container">
          <div className="ks-grid">
            {PERKS.map((perk, index) => (
              <div className="ks-card ks-card--hover" key={perk.title} data-reveal="" style={revealDelay(index)}>
                <div className="ks-card__body" style={{ flexDirection: 'row', alignItems: 'center', gap: '18px', padding: '24px' }}>
                  <span className="ks-icon-tile ks-icon-tile--grad" aria-hidden="true"><i className={`fa ${perk.icon}`}></i></span>
                  <div>
                    <p className="ks-card__title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{perk.title}</p>
                    <p className="ks-card__text" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{perk.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ks-section ks-section--flush-top" id="courses">
        <div className="ks-container">
          <SectionHeader
            eyebrow="Courses"
            title={pageSeo?.h2_heading || 'Latest Courses'}
            description="Not sure which course fits you? Message us and we'll help you choose."
            action={<Link href="/contact" className="ks-link">Ask about a course <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
          />

          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...Array.from(new Set(courses.map((c: any) => c.category).filter(Boolean))).map((cat: any) => ({
                label: String(cat).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: `.${categorySlug(cat)}`
              }))
            ]}
            emptyText="New courses are coming soon."
            items={courses.map((course: any) => ({
              id: course.id,
              filter: course.category ? categorySlug(course.category) : 'uncategorized',
              content: <CourseCard course={course} />
            }))}
          />
        </div>
      </section>
    </>
  );
}
