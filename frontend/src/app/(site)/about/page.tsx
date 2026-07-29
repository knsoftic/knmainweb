import { AboutAccordion } from '../../../components/sections/about-accordion';
import { PageHero } from '../../../components/common/page-hero';
import { PortraitTeamCard } from '../../../components/common/portrait-team-card';
import { TestimonialsSection } from '../../../components/sections/testimonials-section';
import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('about');
}

export default async function AboutPage() {
  const teamMembers = await safeFetch(apiUrl('/team?_source=about'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/about'), null);
  
  const activeTeamMembers = teamMembers.filter((t: any) => t.is_active);
  
  return (
    <>
      <PageHero
        badge="ABOUT US"
        title={pageSeo?.h1_heading || "Who We Are"}
        description="A passionate team of developers, designers, and educators building the future of technology in Pakistan."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', active: true }]}
      />

      <div className="section about-us">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-1">
              <AboutAccordion />
            </div>
            <div className="col-lg-5 align-self-center">
              <div className="section-heading">
                <div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>ABOUT US</div>
                <h2>{pageSeo?.h2_heading || 'What make us the best?'}</h2>
                <p>We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity. From full-featured e-commerce platforms and intuitive mobile apps to complete brand transformations, we deliver high-performance, tailored solutions that don't just look spectacular—they drive real results for your business.</p>
                <div className="main-button"><a href="#">Discover More</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="team section" id="team">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="section-heading mb-5">
                <div style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.9rem', marginBottom: '10px' }}>TEAM</div>
                <h2>{pageSeo?.h3_heading || 'Meet Our Team'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {activeTeamMembers.map((member: any) => (
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