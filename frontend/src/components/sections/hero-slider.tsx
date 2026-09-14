'use client';

import { useRef, useState } from 'react';
import { optimizedImage, resolveImageUrl } from '../../utils/image-url';
import { SplitWords } from '../common/split-words';
import type { ImageSize } from '../../utils/image-size';
import { CountUp, type FunFactItem } from './fun-facts';

export interface HeroSlide {
  id: string | number;
  badge_text: string;
  title: string;
  description: string;
  image_url: string;
  btn_primary_text: string;
  btn_primary_url: string;
  btn_secondary_text: string;
  btn_secondary_url: string;
  /** Real pixel dimensions of image_url, looked up on the server when available. */
  image_size?: ImageSize | null;
}

const DEFAULT_SLIDE: HeroSlide = {
  id: 'default',
  badge_text: 'SOFTWARE HOUSE & IT INSTITUTE',
  title: 'Build Your Future With Technology',
  description: 'At KN Softic, we turn ideas into powerful digital products. From websites and mobile apps to enterprise software, we build solutions that drive business success.',
  image_url: '/assets/images/cover-object.png',
  btn_primary_text: 'Explore Services',
  btn_primary_url: '/services',
  btn_secondary_text: 'View Courses',
  btn_secondary_url: '/courses',
};

const AUTOPLAY_MS = 7000;

// Decorative "code" lines: width, indent and start delay of each.
const CODE_LINES = [
  { w: '72%', d: '0s' },
  { w: '54%', indent: '14px', d: '0.25s', variant: 'accent' },
  { w: '66%', indent: '14px', d: '0.5s' },
  { w: '40%', indent: '28px', d: '0.75s', variant: 'ok' },
  { w: '58%', d: '1s' },
];

type HeroSliderProps = {
  slides: HeroSlide[];
  /** Admin → Homepage → Fun Facts, shown under the slides (first four). */
  stats?: FunFactItem[];
  /** Service / course names scrolling along the bottom of the hero. */
  marquee?: string[];
};

function HeroHeading({ as: Tag, className, children }: { as: 'h1' | 'h2'; className: string; children: React.ReactNode }) {
  return <Tag className={className}>{children}</Tag>;
}

export function HeroSlider({ slides, stats = [], marquee = [] }: HeroSliderProps) {
  const activeSlides = slides && slides.length > 0 ? slides : [DEFAULT_SLIDE];
  const count = activeSlides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pointerFrame = useRef(0);

  const goTo = (index: number) => setCurrentIndex(((index % count) + count) % count);
  const heroStats = stats.slice(0, 4);
  const showBar = heroStats.length > 0 || count > 1;
  const showMarquee = marquee.length >= 3;

  // Mouse position → CSS variables for the spotlight and the tilt/parallax of the picture.
  // Written straight to the element (once per frame), so moving the mouse never re-renders React.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;
    const section = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      section.style.setProperty('--mx', `${x}px`);
      section.style.setProperty('--my', `${y}px`);
      section.style.setProperty('--px', (x / rect.width - 0.5).toFixed(3));
      section.style.setProperty('--py', (y / rect.height - 0.5).toFixed(3));
    });
  };

  const onPointerLeave = () => {
    const section = sectionRef.current;
    if (!section) return;
    cancelAnimationFrame(pointerFrame.current);
    section.style.setProperty('--px', '0');
    section.style.setProperty('--py', '0');
  };

  return (
    <section
      ref={sectionRef}
      className={`ks-hero${showMarquee ? '' : ' ks-hero--plain'}`}
      id="top"
      style={{ '--autoplay': `${AUTOPLAY_MS}ms` } as React.CSSProperties}
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="ks-hero__bg" aria-hidden="true">
        <span className="ks-blob ks-blob--1"></span>
        <span className="ks-blob ks-blob--2"></span>
        <span className="ks-blob ks-blob--3"></span>
        <span className="ks-hero__grid"></span>
        <span className="ks-hero__spot"></span>
        <span className="ks-grain"></span>
      </div>

      <div className="ks-container">
        <div className="ks-hero__slides">
          {activeSlides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                className={`ks-hero__slide${isActive ? '' : ' is-hidden'}`}
                aria-hidden={!isActive}
                role={count > 1 ? 'group' : undefined}
                aria-roledescription={count > 1 ? 'slide' : undefined}
                aria-label={count > 1 ? `${index + 1} of ${count}` : undefined}
              >
                <div className="ks-hero__copy">
                  {/* The badge and the headline form one heading. The first slide's is the page's H1,
                      so it carries what the site actually is ("Software House & IT Institute") as
                      well as the slogan - the terms people search for - using only text a visitor
                      already sees. The wrapper adds no styling, so both look exactly as before. */}
                  <HeroHeading className="ks-hero__heading" as={index === 0 ? 'h1' : 'h2'}>
                    {slide.badge_text && (
                      <>
                        <span className="ks-badge">
                          <span className="ks-badge__dot" aria-hidden="true"></span> {slide.badge_text}
                        </span>
                        {/* Keeps a screen reader from running the two phrases together. */}
                        <span className="ks-visually-hidden"> - </span>
                      </>
                    )}
                    <span className="ks-display ks-hero__title"><SplitWords text={slide.title} /></span>
                  </HeroHeading>
                  {slide.description && <p className="ks-hero__desc">{slide.description}</p>}
                  <div className="ks-hero__actions">
                    {slide.btn_primary_text && (
                      <a href={slide.btn_primary_url || '#'} className="ks-btn ks-btn--light">
                        {slide.btn_primary_text} <i className="fa fa-arrow-right" aria-hidden="true"></i>
                      </a>
                    )}
                    {slide.btn_secondary_text && (
                      <a href={slide.btn_secondary_url || '#'} className="ks-btn ks-btn--ghost">
                        {slide.btn_secondary_text}
                      </a>
                    )}
                  </div>
                </div>

                <div className="ks-hero__visual">
                  <div className="ks-hero__stage">
                    <span className="ks-hero__ring ks-hero__ring--1" aria-hidden="true"><i></i></span>
                    <span className="ks-hero__ring ks-hero__ring--2" aria-hidden="true"><i></i><i></i></span>
                    <span className="ks-hero__ring ks-hero__ring--3" aria-hidden="true"></span>
                    <span className="ks-hero__halo" aria-hidden="true"></span>
                    <img
                      {...optimizedImage(
                        resolveImageUrl(slide.image_url, '/assets/images/cover-object.png'),
                        '(max-width: 900px) 90vw, 620px',
                        [384, 640, 828, 1200]
                      )}
                      alt={slide.title}
                      // The slide's real dimensions (looked up on the server), so the stage keeps its
                      // shape while the picture loads instead of growing when it lands.
                      {...(slide.image_size ? { width: slide.image_size.width, height: slide.image_size.height } : {})}
                      className="ks-hero__image"
                      fetchPriority={index === 0 ? 'high' : undefined}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding={index === 0 ? 'sync' : 'async'}
                    />
                    <div className="ks-hero__float ks-hero__float--a" aria-hidden="true">
                      <span className="ks-icon-tile ks-icon-tile--sm ks-icon-tile--grad"><i className="fa fa-code"></i></span>
                      <span>Software House<small>Web · Mobile · Custom</small></span>
                    </div>
                    <div className="ks-hero__float ks-hero__float--b" aria-hidden="true">
                      <span className="ks-icon-tile ks-icon-tile--sm ks-icon-tile--grad"><i className="fa fa-graduation-cap"></i></span>
                      <span>IT Institute<small>Hands-on courses</small></span>
                    </div>
                    <div className="ks-hero__code" aria-hidden="true">
                      <span className="ks-hero__code-dots"><i></i><i></i><i></i></span>
                      {CODE_LINES.map((line, lineIndex) => (
                        <span
                          key={lineIndex}
                          className={`ks-hero__code-line${line.variant ? ` ks-hero__code-line--${line.variant}` : ''}`}
                          style={{ '--w': line.w, '--indent': line.indent, '--d': line.d } as React.CSSProperties}
                        ></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showBar && (
          <div className="ks-hero__bar">
            {heroStats.length > 0 ? (
              <dl className="ks-hero__stats">
                {heroStats.map((stat) => (
                  <div className="ks-hero__stat" key={stat.id}>
                    <dt className="ks-hero__stat-label">{stat.label}</dt>
                    <dd className="ks-hero__stat-num"><CountUp target={Number(stat.target) || 0} /></dd>
                  </div>
                ))}
              </dl>
            ) : <span />}

            {count > 1 && (
              <div className="ks-hero__controls">
                <button type="button" className="ks-hero__arrow" onClick={() => goTo(currentIndex - 1)} aria-label="Previous slide">
                  <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </button>
                <div className="ks-hero__dots">
                  {activeSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={`ks-hero__dot${index === currentIndex ? ' is-active' : ''}`}
                      onClick={() => goTo(index)}
                      aria-label={`Show slide ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : undefined}
                    >
                      {/* Autoplay: when this bar finishes filling, the next slide shows. Being a CSS animation,
                          it pauses with the page (background tab, hover, reduced motion turns it off). */}
                      {index === currentIndex && (
                        <span
                          className="ks-hero__dot-fill"
                          onAnimationEnd={(event) => {
                            if (event.target === event.currentTarget) goTo(currentIndex + 1);
                          }}
                        ></span>
                      )}
                    </button>
                  ))}
                </div>
                <button type="button" className="ks-hero__arrow" onClick={() => goTo(currentIndex + 1)} aria-label="Next slide">
                  <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </button>
                <span className="ks-hero__count" aria-hidden="true">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {showMarquee && (
        <div className="ks-marquee" aria-hidden="true">
          <div className="ks-marquee__track">
            {[...marquee, ...marquee].map((item, index) => (
              <span className="ks-marquee__item" key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
