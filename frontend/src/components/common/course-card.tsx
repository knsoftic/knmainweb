"use client";

import React from 'react';
import { resolveImageUrl } from '../../utils/image-url';

export const CourseCard = ({ course }: { course: any }) => {
  return (
    <div 
      className="course-card-premium hover-lift" 
      style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: '1px solid rgba(141, 24, 208, 0.05)',
        cursor: 'pointer'
      }}
    >
      {/* Image Container with Gradient Overlay */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          src={resolveImageUrl(course.image_url || course.image, '/assets/images/course-default.jpg')} 
          alt={course.title}
          style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none'
        }}></div>

        {/* Category Badge - Vibrant Gradient */}
        {course.category && (
          <span style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #8D18D0 0%, #b84af5 100%)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(141, 24, 208, 0.4)'
          }}>
            {course.category}
          </span>
        )}
      </div>

      {/* Content Container */}
      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Meta Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '700', 
            color: '#8D18D0',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(141, 24, 208, 0.08)',
            padding: '5px 12px',
            borderRadius: '20px'
          }}>
            <i className="fa fa-clock-o"></i> {course.duration || 'Flexible'}
          </span>
        </div>

        {/* Title */}
        <h4 style={{ 
          fontSize: '22px', 
          fontWeight: '800', 
          marginBottom: '25px',
          lineHeight: '1.4',
          color: '#1a1a2e',
          transition: 'color 0.3s'
        }}>
          {course.title}
        </h4>

        {/* Footer (Enroll Button Only) */}
        <div style={{ 
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <a 
            href={`https://wa.me/923452470250?text=Hi,%20I%20want%20to%20enroll%20in%20the%20${encodeURIComponent(course.title)}%20course`}
            target="_blank" 
            rel="noreferrer" 
            className="enroll-hover-btn"
            style={{ 
              width: '100%',
              textAlign: 'center',
              padding: '14px 20px',
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#8D18D0',
              background: 'transparent',
              border: '2px solid #8D18D0',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }} 
          >
            Enroll Now <i className="fa fa-whatsapp" style={{ fontSize: '18px' }}></i>
          </a>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 45px rgba(141, 24, 208, 0.15) !important;
        }
        .enroll-hover-btn:hover {
          background: #8D18D0 !important;
          color: #fff !important;
        }
      `}} />
    </div>
  );
};
