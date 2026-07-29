import { PageHero } from '../../../components/common/page-hero';
import { FilteredGrid } from '../../../components/common/filtered-grid';
import { CourseCard } from '../../../components/common/course-card';
import Image from 'next/image';
import { resolveImageUrl } from '../../../utils/image-url';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('courses');
}

export default async function CoursesPage() {
  const data = await safeFetch(apiUrl('/courses'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/courses'), null);
  const courses = (Array.isArray(data) ? data : []).filter((c: any) => c.is_active);

  return (
    <>
      <PageHero
        badge="IT COURSES"
        title={pageSeo?.h1_heading || "Our Courses"}
        description="Professional IT courses with certifications, hands-on projects, and career support. Join 500+ trained students."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', active: true }]}
      />

      <section className="section courses" id="courses">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center"><div className="section-heading"><h2>{pageSeo?.h2_heading || 'Latest Courses'}</h2></div></div>
          </div>

          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...Array.from(new Set(courses.map((c: any) => c.category).filter(Boolean))).map((cat: any) => ({
                label: String(cat).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: `.${String(cat).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
              }))
            ]}
            items={courses.map((course: any) => {
              const catSlug = course.category ? String(course.category).toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'uncategorized';
              return {
                id: course.id,
                filter: `col-lg-4 col-md-6 align-self-center mb-30 event_outer ${catSlug}`,
                className: `col-lg-4 col-md-6 align-self-center mb-30 event_outer ${catSlug}`,
                content: <CourseCard course={course} />
              };
            })}
          />
        </div>
      </section>
    </>
  );
}