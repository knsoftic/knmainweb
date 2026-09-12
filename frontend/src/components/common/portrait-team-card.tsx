import { resolveImageUrl } from '../../utils/image-url';
import { revealDelay } from '../../utils/reveal';
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

const getInitials = (name?: string) => (name || '')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((word) => word.charAt(0).toUpperCase())
  .join('');

/** `index` (position in the grid) staggers the scroll-in animation across each row of four. */
export async function PortraitTeamCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  const imgSrc = member.image_url || member.image || '';
  const finalImgSrc = resolveImageUrl(imgSrc);
  const imgSeo = imgSrc ? await getImageSeo(imgSrc) : null;
  const socials = [
    { url: member.facebook_url, label: 'Facebook', icon: 'fab fa-facebook-f' },
    { url: member.twitter_url, label: 'X / Twitter', icon: 'fab fa-x-twitter' },
    { url: member.linkedin_url, label: 'LinkedIn', icon: 'fab fa-linkedin-in' },
  ].filter((social) => Boolean(social.url));

  return (
    <article className="ks-card ks-card--hover ks-team-card" itemScope itemType="https://schema.org/Person" data-reveal="" style={revealDelay(index, 4)}>
      <div className="ks-team-card__photo">
        {finalImgSrc ? (
          <img itemProp="image" src={finalImgSrc} alt={imgSeo?.alt_text || member.name} title={imgSeo?.title} loading="lazy" />
        ) : (
          // No photo uploaded: show the member's initials instead of a broken image.
          <div className="ks-team-card__initials" role="img" aria-label={member.name}>
            {getInitials(member.name) || <i className="fa fa-user" aria-hidden="true"></i>}
          </div>
        )}
      </div>
      <div className="ks-team-card__info">
        <div>
          <h3 className="ks-team-card__name" itemProp="name">{member.name}</h3>
          <span className="ks-team-card__role" itemProp="jobTitle">{member.category}</span>
        </div>
        {socials.length > 0 && (
          <ul className="ks-team-card__social">
            {socials.map((social) => (
              <li key={social.label}>
                <a itemProp="sameAs" href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${social.label}`}>
                  <i className={social.icon} aria-hidden="true"></i>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
