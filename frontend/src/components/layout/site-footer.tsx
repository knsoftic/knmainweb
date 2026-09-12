"use client";

import Link from 'next/link';
import { getPrimaryPhone, getRealSocialLinks, getSetting } from '../../utils/settings';
import { resolveImageUrl } from '../../utils/image-url';
import { getWhatsappNumber } from './site-settings';
import { serviceAnchor } from '../../utils/site';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'About Us', href: '/about' },
  // /team is indexable and in the sitemap; without a link from somewhere it collects nothing.
  { label: 'Our Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

// Shown when the services list cannot be loaded. Each one still lands on the services page.
const FALLBACK_SERVICE_LINKS = [
  { label: 'Web Development', href: '/services' },
  { label: 'Graphics Designing', href: '/services' },
  { label: 'Digital Marketing', href: '/services' },
];

/**
 * Footer service links built from the services that actually exist, each pointing at that
 * service's own section rather than dropping every visitor at the top of the same page.
 */
const buildServiceLinks = (services: any[]) => {
  const real = (Array.isArray(services) ? services : [])
    .map((service: any) => String(service?.title || '').trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((title: string) => ({ label: title, href: `/services#${serviceAnchor(title)}` }));

  return [
    ...(real.length ? real : FALLBACK_SERVICE_LINKS),
    { label: 'IT Courses', href: '/courses' },
    { label: 'Tech Blog', href: '/blog' },
  ];
};

export function SiteFooter({ settings, services = [] }: { settings?: any; services?: any[] }) {
  const serviceLinks = buildServiceLinks(services);
  // Only profiles that really exist: an icon linking to linkedin.com's front page wastes a click.
  const socialLinks = getRealSocialLinks(settings);
  const companyName = getSetting(settings, ['site_name', 'company_name'], 'KN Softic');
  const tagline = getSetting(settings, ['footer_text', 'website_tagline'], 'Software House & IT Institute');
  const address = getSetting(settings, ['contact_address', 'office_address', 'company_address'], 'Faisalabad, Pakistan');
  const phone = getPrimaryPhone(settings);
  const email = getSetting(settings, ['contact_email', 'primary_email'], 'info@knsoftic.com');
  const logoUrl = settings?.light_logo_url || settings?.logo_url;

  return (
    <footer className="ks-footer">
      <div className="ks-container">
        <div className="ks-footer__cta" data-reveal="stagger">
          <div>
            <p className="ks-eyebrow ks-eyebrow--light">Let&apos;s work together</p>
            <h2 className="ks-footer__cta-title">Have a project in mind or want to learn a new skill?</h2>
          </div>
          <div className="ks-footer__cta-actions">
            <Link href="/contact" className="ks-btn ks-btn--light">
              Start a Project <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <a
              href={`https://wa.me/${getWhatsappNumber(settings)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ks-btn ks-btn--ghost"
            >
              <i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Us
            </a>
          </div>
        </div>

        <div className="ks-footer__grid" data-reveal="stagger">
          <div>
            <Link href="/" className="ks-footer__logo" aria-label={`${companyName} home`}>
              {logoUrl ? (
                <img src={resolveImageUrl(logoUrl)} alt={companyName} />
              ) : (
                <span className="ks-footer__logo-text">{companyName}</span>
              )}
            </Link>
            <p className="ks-footer__desc">
              {tagline}. We bring your digital visions to life through cutting-edge development and striking visual identity.
            </p>
            {socialLinks.length > 0 && (
              <div className="ks-socials">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-badge-${link.platform?.toLowerCase() || 'unknown'}`}
                    aria-label={`Visit our ${link.label || link.platform}`}
                  >
                    <i className={link.icon || 'fa fa-link'} aria-hidden="true"></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="ks-footer__heading">Quick Links</h3>
            <ul className="ks-footer__links">
              {quickLinks.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="ks-footer__heading">Our Services</h3>
            <ul className="ks-footer__links">
              {serviceLinks.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="ks-footer__heading">Contact Us</h3>
            <ul className="ks-footer__contact">
              <li>
                <i className="fa fa-location-dot" aria-hidden="true"></i>
                <span>{address}</span>
              </li>
              <li>
                <i className="fa fa-phone" aria-hidden="true"></i>
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
              </li>
              <li>
                <i className="fa fa-envelope" aria-hidden="true"></i>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ks-footer__bottom">
          <span>{getSetting(settings, ['copyright_text'], `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`)}</span>
          <span>
            <Link href="/about">About</Link> · <Link href="/blog">Blog</Link> · <Link href="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
