import Link from 'next/link';
import { AboutAccordion } from '../../components/sections/about-accordion';
import { FilteredGrid } from '../../components/common/filtered-grid';
import { CourseCard } from '../../components/common/course-card';
import { PortraitTeamCard } from '../../components/common/portrait-team-card';
import { SectionHeader } from '../../components/common/section-header';
import { TestimonialsSection } from '../../components/sections/testimonials-section';
import { HeroSlider } from '../../components/sections/hero-slider';
import { ServiceExplorer } from '../../components/sections/service-explorer';
import { PageSchema } from '../../components/seo/json-ld';
import { safeFetch } from '../../utils/safe-fetch';
import { optimizedImage, resolveImageUrl } from '../../utils/image-url';
import { getImageSize } from '../../utils/image-size';
import { apiUrl } from '../../utils/api-url';
import { generatePageMetadata } from '../../utils/seo';
import { revealDelay } from '../../utils/reveal';

export async function generateMetadata() {
  return generatePageMetadata('home');
}

const asList = (value: any): any[] => (Array.isArray(value) ? value : []);

/** Sorts rows by a numeric order column (display_order by default). The sort is stable, so ties keep the API order. */
const sortByOrder = (rows: any[], key = 'display_order') =>
  [...rows].sort((a, b) => (Number(a?.[key]) || 0) - (Number(b?.[key]) || 0));

const categorySlug = (value: unknown) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_');
const titleCase = (value: unknown) => String(value).split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const WHY_POINTS = ['Agile delivery with milestone reviews', 'Fast, SEO-friendly builds', 'Post-launch support', 'Hands-on, career-focused training'];

export default async function HomePage() {
  const [servicesData, coursesData, teamMembersData, heroData, settingsData, factsData, cardsData, testimonialsData, pageSeo] = await Promise.all([
    safeFetch(apiUrl('/homepage_services?_source=home'), []),
    safeFetch(apiUrl('/homepage_courses?_source=home'), []),
    safeFetch(apiUrl('/team?_source=home'), []),
    safeFetch(apiUrl('/hero_slides?_source=home'), []),
    safeFetch(apiUrl('/settings?_source=home'), null),
    safeFetch(apiUrl('/fun_facts?_source=home'), []),
    safeFetch(apiUrl('/homepage_cards?_source=home'), []),
    safeFetch(apiUrl('/testimonials?_source=home'), []),
    safeFetch(apiUrl('/seo/pages/home?_source=home'), null),
  ]);

  // Each uploaded picture's real dimensions, so the space for it is reserved before it arrives.
  const withImageSize = (items: any[]) =>
    Promise.all(items.map(async (item: any) => ({ ...item, image_size: await getImageSize(resolveImageUrl(item.image_url)) })));
  const heroSlides = await withImageSize(sortByOrder(asList(heroData).filter((s: any) => s.is_active)));
  const funFacts = sortByOrder(asList(factsData));
  const homepageCards = await withImageSize(sortByOrder(asList(cardsData).filter((c: any) => c.is_active)).slice(0, 3));

  // Featured services/courses come with the order chosen in Admin → Homepage.
  const services = sortByOrder(asList(servicesData).filter((s: any) => s.is_active), 'homepage_order');
  const courses = sortByOrder(asList(coursesData).filter((c: any) => c.is_active), 'homepage_order');
  const teamMembers = sortByOrder(asList(teamMembersData).filter((t: any) => t.is_active));
  const testimonials = asList(testimonialsData).filter((t: any) => t.is_approved);

  const courseCards = await Promise.all(courses.map(async (c: any) => ({
    ...c,
    image: resolveImageUrl(c.image_url, '/assets/images/cover-object.png'),
    image_size: await getImageSize(resolveImageUrl(c.image_url)),
    enrollUrl: c.enroll_url,
  })));

  const formattedTeam = teamMembers.map((m: any) => ({
    ...m,
    image: resolveImageUrl(m.image_url),
  }));

  const explorerServices = services.map((service: any) => ({
    id: service.id,
    title: service.page_title || service.title,
    description: service.description,
    icon: service.icon,
    features: service.features,
    button_label: service.button_label,
  }));

  // Names that scroll along the bottom of the hero.
  const marquee = Array.from(new Set([
    ...explorerServices.map((service) => service.title),
    ...courses.map((course: any) => course.title),
  ].filter(Boolean).map(String)));

  const courseCategories = Array.from(new Set(courseCards.map((c: any) => c.category).filter(Boolean)));

  return (
    <>
      <PageSchema slug="home" />
      <HeroSlider slides={heroSlides} stats={funFacts} marquee={marquee} />

      {homepageCards.length > 0 && (
        <section className="ks-section ks-section--tight" id="highlights" aria-label="Highlights">
          <div className="ks-container">
            <div className="ks-grid">
              {homepageCards.map((card: any, index: number) => (
                <article className="ks-card ks-card--hover ks-highlight" key={card.id} data-reveal="" style={revealDelay(index)}>
                  <div className="ks-card__body">
                    {/* Gradient tile behind the icon: the default card icons are white. */}
                    <span className="ks-icon-tile ks-icon-tile--lg ks-icon-tile--grad" aria-hidden="true">
                      <img
                        {...optimizedImage(resolveImageUrl(card.image_url, '/assets/images/service-01.png'), '44px', [48, 96, 128])}
                        // Its container is aria-hidden, so screen readers still skip it (the title
                        // sits right below); the text is for image search, which ignores that.
                        alt={`${card.title} icon`}
                        {...(card.image_size ? { width: card.image_size.width, height: card.image_size.height } : {})}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <h3 className="ks-card__title">{card.title}</h3>
                    <p className="ks-card__text">{card.description}</p>
                    {card.read_more_url && card.read_more_url.trim() !== '#' && (
                      <div className="ks-card__foot">
                        <a href={card.read_more_url} className="ks-link">Read More <i className="fa fa-arrow-right" aria-hidden="true"></i></a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {explorerServices.length > 0 && (
        <section className={`ks-section${homepageCards.length > 0 ? ' ks-section--flush-top' : ''}`} id="services">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Our Services"
              title={pageSeo?.h2_heading || 'What We Do'}
              description="From idea to launch: websites, apps, custom software and digital marketing, built by one team that also trains the next generation of developers."
              action={<Link href="/services" className="ks-link">View All Services <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
            />
            <ServiceExplorer services={explorerServices} />
          </div>
        </section>
      )}

      {courseCards.length > 0 && (
        <section className="ks-section ks-section--white" id="courses">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Latest Courses"
              title={pageSeo?.h3_heading || 'Latest Courses'}
              description="Practical, project-based IT courses with certificates and career support."
              action={<Link href="/courses" className="ks-link">Explore All Courses <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
            />
            <FilteredGrid
              filters={[
                { label: 'Show All', value: '*' },
                ...courseCategories.map((cat: any) => ({ label: titleCase(cat), value: `.${categorySlug(cat)}` })),
              ]}
              items={courseCards.map((course: any) => ({
                id: course.id,
                filter: course.category ? categorySlug(course.category) : 'uncategorized',
                content: <CourseCard course={course} />,
              }))}
            />
          </div>
        </section>
      )}

      <section className="ks-section" id="about">
        <div className="ks-container">
          <div className="ks-dark-panel" data-reveal="zoom">
            <div className="ks-why">
              <div data-reveal="stagger">
                <p className="ks-eyebrow ks-eyebrow--light">{settingsData?.about_subtitle || 'About Us'}</p>
                <h2 className="ks-title ks-title--light">{pageSeo?.h4_heading || settingsData?.about_title || 'What make us the best?'}</h2>
                <p className="ks-lead ks-lead--light">
                  {settingsData?.about_description || "We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity. From full-featured e-commerce platforms and intuitive mobile apps to complete brand transformations, we deliver high-performance, tailored solutions that don't just look spectacular—they drive real results for your business."}
                </p>
                <ul className="ks-checklist ks-checklist--2 ks-checklist--light" style={{ marginTop: '28px' }}>
                  {WHY_POINTS.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <div style={{ marginTop: '36px' }}>
                  <Link href="/about" className="ks-btn ks-btn--light">Discover More <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
                </div>
              </div>
              <AboutAccordion dark />
            </div>
          </div>
        </div>
      </section>

      {formattedTeam.length > 0 && (
        <section className="ks-section ks-section--flush-top" id="team">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Team"
              title={pageSeo?.h5_heading || 'Meet Our Team'}
              description="Developers, designers and instructors who plan, build and teach at KN Softic."
            />
            <div className="ks-grid ks-grid--4">
              {formattedTeam.map((member: any, index: number) => (
                <PortraitTeamCard member={member} index={index} key={member.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}
