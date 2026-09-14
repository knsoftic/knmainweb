import Link from 'next/link';
import { optimizedImage, resolveImageUrl } from '../../utils/image-url';
import { revealDelay } from '../../utils/reveal';
import { getImageSeo } from '../../utils/seo';
import { getImageSize } from '../../utils/image-size';

const splitList = (value?: string | null) =>
  String(value || '').split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

/** Card for one project. The whole card opens that project's page. */
export async function ProjectCard({ project, index = 0, columns = 3 }: { project: any; index?: number; columns?: number }) {
  const imageUrl = project.image_url ? resolveImageUrl(project.image_url) : '';
  const [imgSeo, imgSize] = await Promise.all([getImageSeo(project.image_url), getImageSize(imageUrl)]);
  const tags = [...splitList(project.technologies), ...splitList(project.features)].slice(0, 3);
  const badge = project.badge || project.label || project.category;
  const owner = String(project.client_name || project.category || 'Project').replace(/^client:\s*/i, '');

  return (
    <Link
      href={`/projects/${encodeURIComponent(project.id)}`}
      className="ks-card ks-card--hover ks-project-card"
      data-reveal=""
      style={revealDelay(index, columns)}
      aria-label={`${project.title} — view project`}
    >
      <span className="ks-project-card__media">
        {imageUrl ? (
          <>
            {/* A blurred copy fills the frame, so wide logos and tall screenshots both sit well.
                It is heavily blurred, so the smallest optimized size is more than enough. */}
            <span
              className="ks-project-card__fill"
              style={{ backgroundImage: `url(${optimizedImage(imageUrl, '384px', [384]).src})` }}
              aria-hidden="true"
            ></span>
            <img
              {...optimizedImage(imageUrl, '(max-width: 700px) calc(100vw - 36px), (max-width: 1799px) 375px, 460px')}
              alt={imgSeo.alt_text || project.title}
              width={imgSize?.width ?? 1600}
              height={imgSize?.height ?? 1000}
              title={imgSeo.title}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <span className="ks-project-card__icon" aria-hidden="true">
            <i className={`fa ${project.icon || 'fa-folder-open'}`}></i>
          </span>
        )}
        {badge && <span className="ks-chip ks-chip--white">{badge}</span>}
      </span>

      <span className="ks-card__body">
        <span className="ks-card__title">{project.title}</span>
        <span className="ks-card__text ks-clamp-3">{project.description}</span>

        {tags.length > 0 && (
          <span className="ks-tags">
            {tags.map((tag) => <span key={tag} className="ks-chip">{tag}</span>)}
          </span>
        )}

        <span className="ks-card__foot ks-card__foot--line">
          <span className="ks-meta">{owner}</span>
          <span className="ks-link">View project <i className="fa fa-arrow-right" aria-hidden="true"></i></span>
        </span>
      </span>
    </Link>
  );
}
