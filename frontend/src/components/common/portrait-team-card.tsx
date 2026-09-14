import { optimizedImage, resolveImageUrl } from '../../utils/image-url';
import { revealDelay } from '../../utils/reveal';
import { getImageSeo } from '../../utils/seo';
import { isRealProfileUrl } from '../../utils/settings';
import { getImageSize } from '../../utils/image-size';

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
  const [imgSeo, imgSize] = imgSrc
    ? await Promise.all([getImageSeo(imgSrc), getImageSize(finalImgSrc)])
    : [null, null];
  // An unfilled profile field often holds the company homepage or the network's own front page.
  // Hiding those icons is better than sending a visitor in a circle.
  const socials = [
    { url: member.facebook_url, label: 'Facebook', icon: 'fab fa-facebook-f' },
    { url: member.twitter_url, label: 'X / Twitter', icon: 'fab fa-x-twitter' },
    { url: member.linkedin_url, label: 'LinkedIn', icon: 'fab fa-linkedin-in' },
  ].filter((social) => isRealProfileUrl(social.url));

  return (
    <article className="ks-card ks-card--hover ks-team-card" itemScope itemType="https://schema.org/Person" data-reveal="" style={revealDelay(index, 4)}>
      <div className="ks-team-card__photo">
        {finalImgSrc ? (
          <img
            itemProp="image"
            // Measured: two columns (145px) on a phone, 375-385px to laptops, 451px on a wide monitor.
            // 375 rather than a round 390 keeps laptops on the exact-fit 384 file instead of 480.
            {...optimizedImage(finalImgSrc, '(max-width: 700px) calc(50vw - 27px), (max-width: 1799px) 375px, 460px')}
            alt={imgSeo?.alt_text || member.name}
            // The photo's real dimensions, so the declared shape matches the file. The frame's own
            // CSS aspect-ratio decides the layout either way; 4:5 is the fallback if unreadable.
            width={imgSize?.width ?? 800}
            height={imgSize?.height ?? 1000}
            title={imgSeo?.title}
            loading="lazy"
            decoding="async"
          />
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
