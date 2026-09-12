import Link from 'next/link';
import { AboutAccordion } from '../../../components/sections/about-accordion';
import { PageHero } from '../../../components/common/page-hero';
import { PortraitTeamCard } from '../../../components/common/portrait-team-card';
import { SectionHeader } from '../../../components/common/section-header';
import { FunFactsSection } from '../../../components/sections/fun-facts';
import { TestimonialsSection } from '../../../components/sections/testimonials-section';
import { PageSchema } from '../../../components/seo/json-ld';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';
import { revealDelay } from '../../../utils/reveal';

export async function generateMetadata() {
  return generatePageMetadata('about');
}

const byDisplayOrder = (a: any, b: any) => (Number(a?.display_order) || 0) - (Number(b?.display_order) || 0);

const VALUES = [
  { icon: 'fa-code', title: 'Software House', text: 'Websites, mobile apps, e-commerce and custom software built to perform and to grow with your business.' },
  { icon: 'fa-graduation-cap', title: 'IT Institute', text: 'Practical, project-based courses with certificates and career support for the next generation of developers.' },
  { icon: 'fa-handshake', title: 'Long-term Partner', text: 'Transparent communication, milestone reviews and post-launch support long after the first release.' },
];

export default async function AboutPage() {
  const [teamMembers, testimonialsData, pageSeo, factsData] = await Promise.all([
    safeFetch(apiUrl('/team?_source=about'), []),
    safeFetch(apiUrl('/testimonials?_source=about'), []),
    safeFetch(apiUrl('/seo/pages/about'), null),
    safeFetch(apiUrl('/fun_facts?_source=about'), []),
  ]);

  const activeTeamMembers = (Array.isArray(teamMembers) ? teamMembers : []).filter((t: any) => t.is_active).sort(byDisplayOrder);
  const testimonials = (Array.isArray(testimonialsData) ? testimonialsData : []).filter((t: any) => t.is_approved);
  const funFacts = (Array.isArray(factsData) ? factsData : []).sort(byDisplayOrder);

  return (
    <>
      <PageSchema slug="about" />
      <PageHero
        badge="ABOUT US"
        title={pageSeo?.h1_heading || "Who We Are"}
        description="A passionate team of developers, designers, and educators building the future of technology in Pakistan."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', active: true }]}
      />

      <section className="ks-section">
        <div className="ks-container">
          <div className="ks-split" style={{ alignItems: 'start' }}>
            <div data-reveal="left">
              <p className="ks-eyebrow">Our Approach</p>
              <h2 className="ks-title">{pageSeo?.h2_heading || 'What make us the best?'}</h2>
              <p className="ks-lead" style={{ marginTop: '18px' }}>
                We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity. From full-featured e-commerce platforms and intuitive mobile apps to complete brand transformations, we deliver high-performance, tailored solutions that don&apos;t just look spectacular—they drive real results for your business.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px' }}>
                <Link href="/services" className="ks-btn ks-btn--primary">Discover More <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
                <Link href="/contact" className="ks-btn ks-btn--outline">Talk to Us</Link>
              </div>
            </div>
            <div data-reveal="right">
              <AboutAccordion />
            </div>
          </div>

          {funFacts.length > 0 && (
            <div style={{ marginTop: '72px' }}>
              <FunFactsSection stats={funFacts} variant="strip" />
            </div>
          )}
        </div>
      </section>

      <section className="ks-section ks-section--white">
        <div className="ks-container">
          <SectionHeader
            eyebrow="What we do"
            title="One team for building and for teaching"
            description="KN Softic is both a software house and an IT institute, so what we teach comes straight from real client work."
          />
          <div className="ks-grid">
            {VALUES.map((value, index) => (
              <article className="ks-card ks-card--hover ks-service-card" key={value.title} data-reveal="" style={revealDelay(index)}>
                <div className="ks-card__body">
                  <span className="ks-icon-tile" aria-hidden="true"><i className={`fa ${value.icon}`}></i></span>
                  <h3 className="ks-card__title">{value.title}</h3>
                  <p className="ks-card__text">{value.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeTeamMembers.length > 0 && (
        <section className="ks-section" id="team">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Team"
              title={pageSeo?.h3_heading || 'Meet Our Team'}
              action={<Link href="/team" className="ks-link">See the whole team <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
            />
            <div className="ks-grid ks-grid--4">
              {activeTeamMembers.map((member: any, index: number) => (
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
