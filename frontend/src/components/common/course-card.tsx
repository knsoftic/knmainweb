"use client";

import { optimizedImage, resolveImageUrl } from '../../utils/image-url';
import { getWhatsappNumber, useSiteSettings } from '../layout/site-settings';

const FALLBACK_IMAGE = '/assets/images/cover-object.png';
// The admin used to save this (non-existent) file as the default course image.
const MISSING_DEFAULT_IMAGE = '/assets/images/course-default.jpg';

export const CourseCard = ({ course }: { course: any }) => {
  const settings = useSiteSettings();
  const rawImage = course.image_url || course.image;
  const imageSrc = resolveImageUrl(rawImage === MISSING_DEFAULT_IMAGE ? '' : rawImage, FALLBACK_IMAGE);
  const customEnrollUrl = String(course.enroll_url || course.enrollUrl || '').trim();
  const enrollUrl = customEnrollUrl
    || `https://wa.me/${getWhatsappNumber(settings)}?text=Hi,%20I%20want%20to%20enroll%20in%20the%20${encodeURIComponent(course.title)}%20course`;
  const viaWhatsapp = /wa\.me|whatsapp/i.test(enrollUrl);

  return (
    <article className="ks-card ks-card--hover ks-course-card">
      <div className="ks-course-card__media">
        <img
          {...optimizedImage(imageSrc, '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw')}
          alt={course.title}
          // Real dimensions are looked up on the server (course.image_size); the frame's CSS
          // aspect-ratio decides the layout either way, so 16:10 is only a fallback.
          width={course.image_size?.width ?? 1600}
          height={course.image_size?.height ?? 1000}
          loading="lazy"
          decoding="async"
        />
        {course.category && <span className="ks-chip ks-chip--white">{course.category}</span>}
      </div>

      <div className="ks-card__body">
        <div className="ks-course-card__meta">
          <span className="ks-chip">
            <i className="fa-regular fa-clock" aria-hidden="true"></i> {course.duration || 'Flexible'}
          </span>
        </div>

        <h3 className="ks-card__title">{course.title}</h3>

        <div className="ks-card__foot ks-card__foot--line">
          <span className="ks-meta">{viaWhatsapp ? 'Enroll via WhatsApp' : 'Online enrollment'}</span>
          <a
            href={enrollUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ks-btn ks-btn--primary ks-btn--sm"
            aria-label={`Enroll now in ${course.title}`}
          >
            Enroll Now <i className={viaWhatsapp ? 'fab fa-whatsapp' : 'fa fa-arrow-right'} aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </article>
  );
};
