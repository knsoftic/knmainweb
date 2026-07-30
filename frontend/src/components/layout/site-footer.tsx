"use client";

import Link from 'next/link';
import { getEnabledSocialLinks, getSetting } from '../../utils/settings';
import { resolveImageUrl } from '../../utils/image-url';

export function SiteFooter({ settings }: { settings?: any }) {
  const socialLinks = getEnabledSocialLinks(settings);
  const companyName = getSetting(settings, ['site_name', 'company_name'], 'KN Softic');
  const tagline = getSetting(settings, ['footer_text', 'website_tagline'], 'Software House & IT Institute');
  const address = getSetting(settings, ['contact_address', 'office_address', 'company_address'], 'Faisalabad, Pakistan');
  const phone = getSetting(settings, ['contact_phone', 'phone_number'], '+92 345 2470250');
  const email = getSetting(settings, ['contact_email', 'primary_email'], 'info@knsoftic.com');

  return (
    <footer className="premium-footer">
      <div className="container">
        <div className="row">
          
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6 col-12 footer-widget">
            <div className="footer-logo-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              {(settings?.light_logo_url || settings?.logo_url) ? (
                <img
                  src={resolveImageUrl(settings?.light_logo_url || settings?.logo_url)}
                  alt={companyName}
                  className="footer-logo-img"
                  style={{ width: '220px', height: 'auto', objectFit: 'contain' }}
                />
              ) : (
                <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.5rem', color: '#fff', fontFamily: "'Conthrax', 'Inter', sans-serif", textTransform: 'uppercase' }}>{companyName}</h3>
              )}
            </div>
            <p className="footer-desc">
              {tagline}. We bring your digital visions to life through cutting-edge development and striking visual identity.
            </p>
            {socialLinks.length > 0 && (
              <div className="footer-social-cluster">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-badge social-badge-${link.platform?.toLowerCase() || 'unknown'}`}
                    aria-label={`Visit our ${link.platform}`}
                  >
                    <i className={link.icon || 'fa fa-link'}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 col-12 footer-widget offset-lg-1">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/"><i className="bi bi-chevron-right me-2"></i>Home</Link></li>
              <li><Link href="/services"><i className="bi bi-chevron-right me-2"></i>Services</Link></li>
              <li><Link href="/projects"><i className="bi bi-chevron-right me-2"></i>Projects</Link></li>
              <li><Link href="/about"><i className="bi bi-chevron-right me-2"></i>About Us</Link></li>
              <li><Link href="/contact"><i className="bi bi-chevron-right me-2"></i>Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Services Links (Optional extra column) */}
          <div className="col-lg-2 col-md-6 col-12 footer-widget">
            <h4>Our Services</h4>
            <ul className="footer-links">
              <li><Link href="/services"><i className="bi bi-chevron-right me-2"></i>Web Development</Link></li>
              <li><Link href="/services"><i className="bi bi-chevron-right me-2"></i>Mobile Apps</Link></li>
              <li><Link href="/services"><i className="bi bi-chevron-right me-2"></i>UI/UX Design</Link></li>
              <li><Link href="/courses"><i className="bi bi-chevron-right me-2"></i>IT Courses</Link></li>
              <li><Link href="/blog"><i className="bi bi-chevron-right me-2"></i>Tech Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="col-lg-3 col-md-6 col-12 footer-widget">
            <h4>Contact Us</h4>
            <ul className="footer-contact-info">
              <li>
                <i className="bi bi-geo-alt"></i>
                <span>{address}</span>
              </li>
              <li>
                <i className="bi bi-telephone"></i>
                <span>{phone}</span>
              </li>
              <li>
                <i className="bi bi-envelope"></i>
                <a href={`mailto:${email}`} style={{color: 'inherit', textDecoration: 'none'}}>{email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            {getSetting(settings, ['copyright_text'], `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`)}
          </p>
          <div className="footer-bottom-links" style={{display:'flex', gap:'24px', fontSize:'0.8rem'}}>
            <Link href="/about" style={{color:'rgba(255,255,255,0.45)', textDecoration:'none', letterSpacing:'0.02em', transition:'color 0.2s'}}>Privacy Policy</Link>
            <Link href="/contact" style={{color:'rgba(255,255,255,0.45)', textDecoration:'none', letterSpacing:'0.02em', transition:'color 0.2s'}}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}