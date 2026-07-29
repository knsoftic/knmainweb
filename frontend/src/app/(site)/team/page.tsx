import { PageHero } from '../../../components/common/page-hero';
import { PortraitTeamCard } from '../../../components/common/portrait-team-card';

import { safeFetch } from '../../../utils/safe-fetch';
import { apiUrl } from '../../../utils/api-url';
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('team');
}

export default async function TeamPage() {
  const data = await safeFetch(apiUrl('/team?_source=team'), []);
  const pageSeo = await safeFetch(apiUrl('/seo/pages/team'), null);
  const teamMembers = (Array.isArray(data) ? data : []).filter((t: any) => t.is_active);

  return (
    <>
      <PageHero
        badge="OUR TEAM"
        title={pageSeo?.h1_heading || "Meet the Team"}
        description="The people behind the screens who plan, build, and polish the KN Softic experience."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team', active: true }]}
      />

      <div className="team section" id="team">
        <div className="container">
          <div className="row">
            {teamMembers.map((member: any) => (
              <div className="col-lg-3 col-md-6 mb-4" key={member.name}>
                <PortraitTeamCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}