'use client';

import { useState } from 'react';
import { optimizedImage, resolveImageUrl } from '../../utils/image-url';

const AUTOPLAY_MS = 7000;

/** `testimonials` are fetched (approved only) by the page on the server so they are in the initial HTML. */
export function TestimonialsSection({ testimonials = [] }: { testimonials?: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = testimonials.length;

  if (count === 0) {
    return null;
  }

  const index = currentIndex % count;
  const current = testimonials[index];
  const goTo = (next: number) => setCurrentIndex(((next % count) + count) % count);

  return (
    <section
      className="ks-section ks-section--white"
      id="testimonials"
      style={{ '--autoplay': `${AUTOPLAY_MS}ms` } as React.CSSProperties}
    >
      <div className="ks-container ks-testimonials">
        <div data-reveal="left">
          <p className="ks-eyebrow">Testimonials</p>
          <h2 className="ks-title">What They Say About Us?</h2>
          <p className="ks-lead" style={{ marginTop: '18px' }}>
            Discover how we&apos;ve helped our clients transform their ideas into reality. Read through their honest experiences and see why businesses trust us to deliver exceptional results.
          </p>
          {count > 1 && (
            <div className="ks-testimonials__controls">
              <button type="button" className="ks-icon-btn" onClick={() => goTo(index - 1)} aria-label="Previous testimonial">
                <i className="fa fa-arrow-left" aria-hidden="true"></i>
              </button>
              <button type="button" className="ks-icon-btn" onClick={() => goTo(index + 1)} aria-label="Next testimonial">
                <i className="fa fa-arrow-right" aria-hidden="true"></i>
              </button>
              <span className="ks-testimonials__count" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              {/* Autoplay: the next quote shows when this bar has filled (paused on hover / keyboard focus). */}
              <span className="ks-testimonials__progress" aria-hidden="true">
                <span
                  key={index}
                  onAnimationEnd={(event) => {
                    if (event.target === event.currentTarget) goTo(index + 1);
                  }}
                ></span>
              </span>
            </div>
          )}
        </div>

        <div data-reveal="right">
          <figure className="ks-quote" key={current.id ?? index} style={{ margin: 0 }}>
            <span className="ks-icon-tile ks-icon-tile--grad ks-quote__mark" aria-hidden="true">
              <i className="fa fa-quote-left"></i>
            </span>
            <blockquote className="ks-quote__text" style={{ margin: '0 0 32px' }}>
              “{current.quote}”
            </blockquote>
            <figcaption className="ks-quote__author">
              <img
                {...optimizedImage(
                  resolveImageUrl(current.image_url, '/assets/images/testimonial-author.jpg'),
                  '54px',
                  [64, 96, 128]
                )}
                // Hidden from screen readers, which read the name beside it; the alt text is for
                // search engines, which index images by it.
                alt={current.name ? `Photo of ${current.name}` : 'Client photo'}
                aria-hidden="true"
                width={54}
                height={54}
                className="ks-quote__avatar"
                loading="lazy"
              />
              <div>
                <p className="ks-quote__name">{current.name}</p>
                {current.category && <span className="ks-quote__role">{current.category}</span>}
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
