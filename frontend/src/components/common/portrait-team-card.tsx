import React from 'react';
import Image from 'next/image';
import { resolveImageUrl } from '../../utils/image-url';
import { getImageSeo } from '../../utils/seo';

export interface TeamMember {
  image_url?: string;
  image?: string;
  category: string;
  name: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
}

export async function PortraitTeamCard({ member }: { member: TeamMember }) {
  const imgSrc = member.image_url || member.image || '';
  const finalImgSrc = resolveImageUrl(imgSrc);
  const imgSeo = await getImageSeo(imgSrc);

  return (
    <div className="portrait-team-card" itemScope itemType="https://schema.org/Person">
      <div className="card-inner">
        <div className="portrait-thumb-container">
          <div className="glow-backdrop"></div>
          <div className="portrait-img-box">
            <img itemProp="image" src={finalImgSrc} alt={imgSeo.alt_text || member.name} title={imgSeo.title} className="portrait-img" style={{ objectFit: 'cover', width: '250px', height: '300px' }} />
          </div>
        </div>
        <div className="member-details">
          <span className="member-category" itemProp="jobTitle">{member.category}</span>
          <h4 className="member-name" itemProp="name">{member.name}</h4>
          <ul className="member-social-icons">
            {member.facebook_url && <li><a itemProp="sameAs" href={member.facebook_url} aria-label="Facebook"><i className="fab fa-facebook-f"></i></a></li>}
            {member.twitter_url && <li><a itemProp="sameAs" href={member.twitter_url} aria-label="Twitter"><i className="fab fa-twitter"></i></a></li>}
            {member.linkedin_url && <li><a itemProp="sameAs" href={member.linkedin_url} aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a></li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
