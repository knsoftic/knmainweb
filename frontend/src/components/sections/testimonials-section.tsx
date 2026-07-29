'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { resolveImageUrl } from '../../utils/image-url';
import { apiService } from '../../services/api';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    apiService.get('/testimonials')
      .then(data => {
        setTestimonials((Array.isArray(data) ? data : []).filter((t: any) => t.is_active || t.is_approved));
      })
      .catch(console.error);
  }, []);

  const handlePrev = () => {
    if (isTransitioning || testimonials.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 350);
  };

  const handleNext = () => {
    if (isTransitioning || testimonials.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 350);
  };

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isTransitioning, testimonials.length]);

  const current = testimonials && testimonials.length > 0 ? testimonials[currentIndex] : null;

  if (!current) {
    return null;
  }

  return (
    <div className="section testimonials position-relative" style={{ overflow: 'hidden' }}>
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7 order-2 order-lg-1 position-relative">
            <div className="testimonial-card-wrapper position-relative" style={{ paddingRight: '25px' }}>
              <div
                className="item testimonial-gradient-box"
                style={{
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                <p className="testimonial-quote-text">
                  “{current.quote}”
                </p>
                <div className="author d-flex align-items-center gap-3">
                  <img
                    src={resolveImageUrl(current.image_url, '/assets/images/testimonial-author.jpg')}
                    alt={current.name}
                    width={75}
                    height={75}
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(255, 255, 255, 0.35)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)',
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        color: '#ffffff',
                        fontSize: '1.35rem',
                        fontWeight: '700',
                        margin: 0,
                        marginBottom: '4px',
                      }}
                    >
                      {current.name}
                    </h4>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: '500',
                        margin: 0,
                      }}
                    >
                      {current.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transparent Navigation Arrows right beside the card edge on desktop/tablet, centered bottom on mobile */}
              <div className="testimonial-nav-arrows">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Testimonial"
                  className="testimonial-arrow-btn d-flex align-items-center justify-content-center"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(122, 106, 216, 0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <i className="fa fa-chevron-left" style={{ marginRight: '2px' }}></i>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Testimonial"
                  className="testimonial-arrow-btn d-flex align-items-center justify-content-center"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(122, 106, 216, 0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <i className="fa fa-chevron-right" style={{ marginLeft: '2px' }}></i>
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-5 order-1 order-lg-2 align-self-center ps-lg-5">
            <div className="section-heading" style={{ marginLeft: '0px', marginBottom: '0px' }}>
              <h6 style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.5px' }}>
                TESTIMONIALS
              </h6>
              <h2 className="testimonial-heading">
                What They Say About Us?
              </h2>
              <p style={{ color: '#555555', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '0px', marginTop: '0px' }}>
                Discover how we’ve helped our clients transform their ideas into reality. Read through their honest experiences and see why businesses trust us to deliver exceptional results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
