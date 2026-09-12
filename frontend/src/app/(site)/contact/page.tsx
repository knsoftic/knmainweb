import { ContactPageClient } from './contact-page-client';
import { apiUrl } from '../../../utils/api-url';
import { safeFetch } from '../../../utils/safe-fetch';

// Loaded on the server so the custom headings and course list are in the first HTML (and visible to crawlers).
export default async function ContactPage() {
  const [pageSeo, courses] = await Promise.all([
    safeFetch(apiUrl('/seo/pages/contact?_metadata=1'), null, { next: { revalidate: 60 } }),
    safeFetch(apiUrl('/courses'), [], { next: { revalidate: 60 } }),
  ]);

  const activeCourses = (Array.isArray(courses) ? courses : [])
    .filter((course: any) => course.is_active !== 0 && course.is_active !== false)
    .sort((a: any, b: any) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  const courseNames = [...new Set(activeCourses.map((course: any) => String(course.title || '').trim()).filter(Boolean))];

  return <ContactPageClient pageSeo={pageSeo} courseNames={courseNames} />;
}
