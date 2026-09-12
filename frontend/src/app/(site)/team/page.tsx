import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { PortraitTeamCard } from '../../../components/common/portrait-team-card';
import { SectionHeader } from '../../../components/common/section-header';
import { PageSchema } from '../../../components/seo/json-ld';

import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('team');
}

const byDisplayOrder = (a: any, b: any) => (Number(a?.display_order) || 0) - (Number(b?.display_order) || 0);

export default async function TeamPage() {
  const [data, pageSeo] = await Promise.all([
    safeFetch(apiUrl('/team?_source=team'), []),
    safeFetch(apiUrl('/seo/pages/team'), null),
  ]);
  const teamMembers = (Array.isArray(data) ? data : []).filter((t: any) => t.is_active).sort(byDisplayOrder);

  return (
    <>
      <PageSchema slug="team" />
      <PageHero
        badge="OUR TEAM"
        title={pageSeo?.h1_heading || "Meet the Team"}
        description="The people behind the screens who plan, build, and polish the KN Softic experience."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team', active: true }]}
      />

      <section className="ks-section" id="team">
        <div className="ks-container">
          <SectionHeader
            eyebrow="Team"
            title={pageSeo?.h2_heading || 'The people behind KN Softic'}
            description="Developers, designers and instructors working on client projects and teaching our courses."
            action={<Link href="/contact" className="ks-link">Work with us <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>}
          />
          {teamMembers.length > 0 ? (
            <div className="ks-grid ks-grid--4">
              {teamMembers.map((member: any, index: number) => (
                <PortraitTeamCard member={member} index={index} key={member.id} />
              ))}
            </div>
          ) : (
            <div className="ks-empty">Team profiles will be listed here soon.</div>
          )}
        </div>
      </section>
    </>
  );
}
