import { AboutAccordion } from '../../components/sections/about-accordion';
import { FilteredGrid } from '../../components/common/filtered-grid';
import { CourseCard } from '../../components/common/course-card';
import { FunFactsSection } from '../../components/sections/fun-facts';
import { PortraitTeamCard } from '../../components/common/portrait-team-card';
import { TestimonialsSection } from '../../components/sections/testimonials-section';
import { HeroSlider } from '../../components/sections/hero-slider';
import { safeFetch } from '../../utils/safe-fetch';
import { resolveImageUrl } from '../../utils/image-url';
import { apiUrl } from '../../utils/api-url';
import Image from 'next/image';
import { generatePageMetadata } from '../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('home');
}

export default async function HomePage() {
  const servicesData = await safeFetch(apiUrl('/homepage_services?_source=home'), []);
  const coursesData = await safeFetch(apiUrl('/homepage_courses?_source=home'), []);
  const teamMembersData = await safeFetch(apiUrl('/team?_source=home'), []);
  const heroData = await safeFetch(apiUrl('/hero_slides?_source=home'), []);
  const settingsData = await safeFetch(apiUrl('/settings?_source=home'), null);
  const factsData = await safeFetch(apiUrl('/fun_facts?_source=home'), []);
  const cardsData = await safeFetch(apiUrl('/homepage_cards?_source=home'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/home?_source=home'), null);
  
  const hero = Array.isArray(heroData) && heroData.length > 0 ? heroData[0] : {};
  const funFacts = Array.isArray(factsData) && factsData.length > 0 ? factsData : undefined;
  const homepageCards = Array.isArray(cardsData) ? cardsData.filter((c: any) => c.is_active).slice(0, 3) : [];

  const services = (Array.isArray(servicesData) ? servicesData : []).filter((s: any) => s.is_active);
  const courses = (Array.isArray(coursesData) ? coursesData : []).filter((c: any) => c.is_active);
  const teamMembers = (Array.isArray(teamMembersData) ? teamMembersData : []).filter((t: any) => t.is_active);

  const courseCards = courses.map((c: any) => ({
    ...c,
    image: resolveImageUrl(c.image_url, '/assets/images/course-default.jpg'),
    enrollUrl: c.enroll_url,
    filter: c.filter_slug,
    bullets: [] // Bullets would be fetched from a separate endpoint or joined in backend
  }));

  const formattedTeam = teamMembers.map((m: any) => ({
    ...m,
    image: resolveImageUrl(m.image_url, '/assets/images/team-default.jpg'),
    role: m.category,
    facebook: m.facebook_url,
    twitter: m.twitter_url,
    linkedin: m.linkedin_url
  }));

  return (
    <>
      <h1 className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        {pageSeo?.h1_heading || 'KN Softic - Software House & IT Institute'}
      </h1>
      <HeroSlider slides={Array.isArray(heroData) && heroData.length > 0 ? heroData : []} />

      <section className="section services" id="services">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="section-heading mb-5">
                <div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>OUR SERVICES</div>
                <h2>{pageSeo?.h2_heading || 'What We Do'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {services.map((service: any) => (
              <div className="col-lg-4 col-md-6 mb-4 event_outer" key={service.id}>
                <div className="service-page-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-icon-top">
                    <i className={`fa ${service.icon || 'fa-desktop'}`}></i>
                  </div>
                  <h4>{service.page_title || service.title}</h4>
                  <p className="card-desc" style={{ flexGrow: 1 }}>{service.description}</p>
                  
                  {service.features && typeof service.features === 'string' && service.features.trim() !== '' && (
                    <ul className="card-features" style={{ marginBottom: '20px' }}>
                      {service.features.split('\n').map((feature: string, idx: number) => {
                        const trimmed = feature.trim();
                        if (!trimmed) return null;
                        return (
                          <li key={idx}><i className="fa fa-check check-icon"></i> {trimmed}</li>
                        );
                      })}
                    </ul>
                  )}

                  <a href="/contact" className="btn-quote" style={{ marginTop: 'auto' }}>{service.button_label || 'Get a Quote →'}</a>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-5">
            <div className="col-lg-12 text-center">
              <div className="main-button">
                <a href="/services">View All Services <i className="fa fa-arrow-right" style={{ marginLeft: '6px' }}></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section courses" id="courses">
        <div className="container">
          <div className="row"><div className="col-lg-12 text-center"><div className="section-heading"><div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>LATEST COURSES</div><h2>{pageSeo?.h3_heading || 'Latest Courses'}</h2></div></div></div>
          <FilteredGrid
            filters={[
              { label: 'Show All', value: '*' },
              ...Array.from(new Set(courseCards.map((c: any) => c.category).filter(Boolean))).map((cat: any) => ({
                label: String(cat).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: `.${String(cat).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
              }))
            ]}
            items={courseCards.map((course: any) => {
              const catSlug = course.category ? String(course.category).toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'uncategorized';
              return {
                id: course.id,
                filter: `col-lg-4 col-md-6 align-self-center mb-30 event_outer ${catSlug}`,
                className: `col-lg-4 col-md-6 align-self-center mb-30 event_outer ${catSlug}`,
                content: <CourseCard course={course} />
              };
            })}
          />
          <div className="row mt-5">
            <div className="col-lg-12 text-center">
              <div className="main-button">
                <a href="/courses">Explore All Courses <i className="fa fa-arrow-right" style={{ marginLeft: '6px' }}></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section about-us">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-1">
              <AboutAccordion />
            </div>
            <div className="col-lg-5 align-self-center">
              <div className="section-heading">
                <div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>{settingsData?.about_subtitle || 'ABOUT US'}</div>
                <h2>{pageSeo?.h4_heading || settingsData?.about_title || 'What make us the best?'}</h2>
                <p>{settingsData?.about_description || "We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity. From full-featured e-commerce platforms and intuitive mobile apps to complete brand transformations, we deliver high-performance, tailored solutions that don't just look spectacular—they drive real results for your business."}</p>
                <div className="main-button"><a href="/about">Discover More</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FunFactsSection stats={funFacts} />

      <div className="team section" id="team">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="section-heading mb-5">
                <div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>TEAM</div>
                <h2>{pageSeo?.h5_heading || 'Meet Our Team'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {formattedTeam.map((member: any) => (
              <div className="col-lg-3 col-md-6 mb-4" key={member.name}>
                <PortraitTeamCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <TestimonialsSection />
    </>
  );
}