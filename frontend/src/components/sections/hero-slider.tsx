'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { resolveImageUrl } from '../../utils/image-url';

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
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    badge_text: 'SOFTWARE HOUSE & IT INSTITUTE',
    title: 'Build Your Future With Technology',
    description: 'At KN Softic, we turn ideas into powerful digital products. From websites and mobile apps to enterprise software, we build solutions that drive business success.',
    image_url: '/assets/images/cover-object.png',
    btn_primary_text: 'Explore Services',
    btn_primary_url: '/services',
    btn_secondary_text: 'View Courses',
    btn_secondary_url: '/courses'
  }];

  const handleNext = useCallback(() => {
    if (isTransitioning || activeSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500); // 500ms transition match
  }, [isTransitioning, activeSlides.length]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || activeSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000); // Auto slide every 5 seconds
    return () => clearInterval(timer);
  }, [handleNext, activeSlides.length]);

  return (
    <section className="premium-hero-section d-flex align-items-center position-relative" id="top" style={{ overflow: 'hidden', minHeight: '600px', backgroundColor: '#faf9fc' }}>
      
      {/* Dynamic Background Effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes blob-bounce {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes driftUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
        }
        .hero-grid-bg {
          position: absolute;
          top: -50%; left: -50%; right: -50%; bottom: -50%;
          background-image: 
            linear-gradient(to right, rgba(141, 24, 208, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(141, 24, 208, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: moveGrid 3s linear infinite;
          z-index: 0;
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }
        .hero-glow-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          z-index: 0;
          animation: blob-bounce 15s infinite ease-in-out;
        }
        .blob-1 { top: -10%; left: -10%; width: 400px; height: 400px; background: rgba(141, 24, 208, 0.3); }
        .blob-2 { bottom: -10%; right: -5%; width: 500px; height: 500px; background: rgba(184, 74, 245, 0.25); animation-delay: 2s; }
        .blob-3 { top: 40%; left: 50%; width: 300px; height: 300px; background: rgba(116, 235, 213, 0.2); animation-delay: 4s; }
        .floating-image {
          animation: float 6s ease-in-out infinite;
          filter: drop-shadow(0 20px 30px rgba(141,24,208,0.2));
        }
        .glowing-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(141, 24, 208, 0.8), 0 0 20px 4px rgba(184, 74, 245, 0.4);
          z-index: 1;
          animation: driftUp linear infinite;
        }
        .text-gradient-premium {
          background: linear-gradient(135deg, #2c3e50 0%, #8D18D0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-shading-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(20, 10, 40, 0.05) 100%);
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.03);
          z-index: 1;
          pointer-events: none;
        }
        .hero-title-shadow {
          text-shadow: 0 4px 15px rgba(141, 24, 208, 0.15);
        }
      `}} />

      <div className="hero-grid-bg"></div>
      <div className="hero-shading-overlay"></div>
      <div className="hero-glow-blob blob-1"></div>
      <div className="hero-glow-blob blob-2"></div>
      <div className="hero-glow-blob blob-3"></div>

      {/* Drifting Particles - Statically seeded for SSR Hydration */}
      {[
        { left: '15%', duration: '8.5s', delay: '1.2s' },
        { left: '85%', duration: '6.2s', delay: '0.4s' },
        { left: '35%', duration: '11.1s', delay: '2.5s' },
        { left: '55%', duration: '7.8s', delay: '3.1s' },
        { left: '25%', duration: '9.4s', delay: '0.8s' },
        { left: '75%', duration: '12.3s', delay: '4.2s' },
        { left: '45%', duration: '6.9s', delay: '1.9s' },
        { left: '95%', duration: '10.5s', delay: '0.2s' },
        { left: '5%', duration: '8.8s', delay: '3.7s' },
        { left: '65%', duration: '7.2s', delay: '2.1s' },
        { left: '10%', duration: '11.8s', delay: '4.8s' },
        { left: '90%', duration: '9.1s', delay: '1.5s' }
      ].map((particle, i) => (
        <div key={i} className="glowing-particle" style={{
          left: particle.left,
          animationDuration: particle.duration,
          animationDelay: particle.delay,
          opacity: 0
        }}></div>
      ))}

      <div className="container position-relative z-index-2" style={{ zIndex: 2 }}>
        <div className="tab-content" id="heroTabContent" style={{ position: 'relative', minHeight: '500px' }}>
          
          {activeSlides.map((slide, index) => {
            const isActive = index === currentIndex;
            const imgSrc = resolveImageUrl(slide.image_url, '/assets/images/cover-object.png');
            
            return (
              <div
                key={slide.id}
                className={`tab-pane fade ${isActive ? 'show active' : ''}`}
                style={{
                  position: isActive ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <div className="row align-items-center gy-5">
                  <div className="col-lg-6 text-center text-lg-start">
                    {slide.badge_text && (
                      <div className="hero-badge mb-4" style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)', opacity: isActive ? 1 : 0, transition: 'all 0.6s ease 0.1s' }}>
                        <span className="badge-dot"></span> {slide.badge_text}
                      </div>
                    )}
                    <h2 className="hero-title mb-3 hero-title-shadow" style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)', opacity: isActive ? 1 : 0, transition: 'all 0.6s ease 0.2s', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', margin: 0, fontWeight: 800 }}>
                      {slide.title}
                    </h2>
                    <p className="hero-description mb-5" style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)', opacity: isActive ? 1 : 0, transition: 'all 0.6s ease 0.3s' }}>
                      {slide.description}
                    </p>
                    <div className="hero-actions d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start" style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)', opacity: isActive ? 1 : 0, transition: 'all 0.6s ease 0.4s' }}>
                      {slide.btn_primary_text && (
                        <a href={slide.btn_primary_url || '#'} className="btn btn-premium-primary">
                          {slide.btn_primary_text}
                        </a>
                      )}
                      {slide.btn_secondary_text && (
                        <a href={slide.btn_secondary_url || '#'} className="btn btn-premium-outline">
                          {slide.btn_secondary_text}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6 d-flex justify-content-center position-relative">
                    <div className="hero-graphic-container" style={{ transform: isActive ? 'scale(1)' : 'scale(0.95)', opacity: isActive ? 1 : 0, transition: 'all 0.8s ease' }}>
                      <img 
                        src={imgSrc} 
                        alt={slide.title} 
                        className="img-fluid hero-3d-graphic floating-image" 
                        style={{ objectFit: 'contain', maxHeight: '500px' }} 
                      />
                      <div className="graphic-shadow"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
