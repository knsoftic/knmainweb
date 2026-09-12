"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { SectionHeader } from '../../../components/common/section-header';
import { getWhatsappNumber, useSiteSettings } from '../../../components/layout/site-settings';
import { apiService } from '../../../services/api';
import { getPrimaryPhone, getRealSocialLinks, getSetting } from '../../../utils/settings';
import { revealDelay } from '../../../utils/reveal';

const DEFAULT_CONTACT = {
  address: 'KN Softic, Faisalabad, Pakistan',
  email: 'info@knsoftic.com',
  phone: '+92 345 2470250',
  workingHours: 'Mon – Sat: 9:00 AM – 7:00 PM',
};

const MAP_EMBED_PREFIX = 'https://www.google.com/maps/embed';
const DEFAULT_MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.119794358897!2d72.92739457632612!3d31.367049554605915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39225b00438c21f1%3A0x9ae7c88be0aa71d9!2sKn%20Softic!5e0!3m2!1sen!2spk!4v1717360000000!5m2!1sen!2pk';

/** Accepts a Google Maps embed URL or a pasted `<iframe src="...">` snippet; anything else gets the default map. */
const getMapEmbedUrl = (value?: string | null) => {
  let url = (value || '').trim();
  const iframeSrc = url.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
  if (iframeSrc) {
    url = iframeSrc[1].trim().replace(/&amp;/g, '&');
  }

  return url.startsWith(MAP_EMBED_PREFIX) ? url : DEFAULT_MAP_EMBED_URL;
};

const formatAddress = (value?: string | null) => {
  const normalized = (value || '').trim();

  if (!normalized || normalized.toLowerCase() === 'pakistan' || normalized.length < 12) {
    return DEFAULT_CONTACT.address;
  }

  return normalized;
};

const formatEmail = (value?: string | null) => {
  const normalized = (value || '').trim();
  return normalized || DEFAULT_CONTACT.email;
};

const formatPhone = (value?: string | null) => {
  const normalized = (value || '').trim();
  return normalized || DEFAULT_CONTACT.phone;
};

type ContactPageClientProps = {
  /** Row from Admin → SEO → Pages for "contact" (custom headings), or null. */
  pageSeo: any;
  /** Titles of active courses, offered as inquiry subjects. */
  courseNames: string[];
};

export function ContactPageClient({ pageSeo, courseNames }: ContactPageClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const settings = useSiteSettings();

  const headquartersAddress = formatAddress(getSetting(settings, ['office_address', 'company_address', 'contact_address']));
  const primaryEmail = formatEmail(getSetting(settings, ['primary_email', 'contact_email']));
  const supportEmail = formatEmail(getSetting(settings, ['support_email', 'secondary_email']));
  const primaryPhone = formatPhone(getPrimaryPhone(settings));
  const whatsappNumber = getWhatsappNumber(settings);
  const workingHours = getSetting(settings, ['working_hours'], DEFAULT_CONTACT.workingHours);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(headquartersAddress)}`;
  const mapEmbedUrl = getMapEmbedUrl(getSetting(settings, ['google_maps_embed_url']));
  const socialLinks = getRealSocialLinks(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
      setSubmitError('Please fill in all required fields (*).');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setSubmitError('Please enter a valid email address (make sure there are no spaces).');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await apiService.post('/contact-messages', {
        ...formData,
        email: formData.email.trim(),
        subject: formData.subject || 'Website Contact',
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError(`We could not send your message right now. Error: ${error?.message || 'Network issue'}. Please try again.`);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmitError('');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const infoCards = [
    {
      icon: 'fa fa-location-dot',
      title: 'Our Headquarters',
      body: (
        <>
          <p className="ks-card__text" style={{ color: 'var(--ks-ink)', fontWeight: 500 }}>{headquartersAddress}</p>
          <p className="ks-meta" style={{ margin: '6px 0 0' }}>In-person meetings by appointment. We serve clients across Pakistan and beyond.</p>
        </>
      ),
      foot: (
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="ks-link">
          Get Directions <i className="fa fa-arrow-up-right-from-square" aria-hidden="true"></i>
        </a>
      ),
    },
    {
      icon: 'fa fa-envelope',
      title: 'Email Support',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <a href={`mailto:${primaryEmail}`} className="ks-card__text" style={{ color: 'var(--ks-ink)', fontWeight: 500 }}>{primaryEmail}</a>
          {supportEmail !== primaryEmail && <a href={`mailto:${supportEmail}`} className="ks-card__text">{supportEmail}</a>}
        </div>
      ),
      foot: <span className="ks-meta">We reply within 24 hours</span>,
    },
    {
      icon: 'fab fa-whatsapp',
      title: 'Phone & WhatsApp',
      body: (
        <>
          <p className="ks-card__text" style={{ color: 'var(--ks-ink)', fontWeight: 600 }}>{primaryPhone}</p>
          <p className="ks-meta" style={{ margin: '6px 0 0' }}>Direct Consultation & Engineering Desk</p>
        </>
      ),
      foot: (
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="ks-link text-success">
          Chat on WhatsApp <i className="fa fa-arrow-right" aria-hidden="true"></i>
        </a>
      ),
    },
    {
      icon: 'fa fa-clock',
      title: 'Working Hours',
      body: <p className="ks-card__text" style={{ color: 'var(--ks-ink)', fontWeight: 500 }}>{workingHours}</p>,
      foot: <span className="ks-meta">Pakistan time (PKT)</span>,
    },
  ];

  return (
    <>
      <PageHero
        badge="CONTACT US"
        title={pageSeo?.h1_heading || "Let's Build Something Extraordinary"}
        description="Have an ambitious software project, need enterprise digital transformation, or looking to advance your career at Pakistan's premier IT institute? We're ready when you are."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us', active: true }]}
      >
        <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-success bg-opacity-10 text-white fw-semibold small" style={{ marginTop: '28px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <i className="fa fa-clock text-success" aria-hidden="true"></i>
          <span>{workingHours} • Quick replies during working hours</span>
        </div>
      </PageHero>

      <section className="ks-section">
        <div className="ks-container">
          <SectionHeader
            eyebrow="Official Contact Points"
            title={pageSeo?.h2_heading || 'We Are Here For You'}
            description="Whether you're an enterprise seeking custom software development, a startup looking for an MVP, or an ambitious student joining our institute, our doors are always open."
          />

          <div className="ks-contact-layout">
            <div className="ks-card ks-contact-form-card" data-reveal="left">
              {!isSubmitted ? (
                <>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ marginBottom: '8px' }}>
                    <h3 className="ks-card__title" style={{ fontSize: '1.4rem', margin: 0 }}>
                      {pageSeo?.h3_heading || 'Send Us A Message'}
                    </h3>
                    <span className="ks-chip"><i className="fa fa-bolt text-warning" aria-hidden="true"></i> Quick Response</span>
                  </div>
                  <p className="ks-card__text" style={{ marginBottom: '26px' }}>
                    Fill out the form below and our engineering & support team will respond within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="ks-form">
                    <div>
                      <label htmlFor="contact-name" className="ks-label">Full Name <span className="text-danger">*</span></label>
                      <input type="text" id="contact-name" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} className="ks-input" placeholder="e.g. Muhammad Sohaib" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="ks-label">Email Address <span className="text-danger">*</span></label>
                      <input type="email" inputMode="email" autoComplete="email" id="contact-email" name="email" required value={formData.email} onChange={handleChange} className="ks-input" placeholder="e.g. sohaibmuhammad429@gmail.com" />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="ks-label">Phone / WhatsApp <span className="ks-meta">(optional)</span></label>
                      <input type="tel" id="contact-phone" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} className="ks-input" placeholder="e.g. +923094257950" />
                    </div>
                    <div>
                      <label htmlFor="cSubject" className="ks-label">Subject / Interest <span className="text-danger">*</span></label>
                      <select id="cSubject" name="subject" required value={formData.subject} onChange={handleChange} className="ks-input">
                        <option value="" disabled>Select inquiry type...</option>
                        <optgroup label="Software & Digital Solutions">
                          <option value="Custom Software / Web">Web & Custom Software</option>
                          <option value="Mobile App / UI/UX">Mobile App & UI/UX</option>
                          <option value="UI/UX Design Strategy">UI/UX Design Strategy</option>
                          <option value="Custom Enterprise Software">Custom Enterprise Software</option>
                          <option value="SEO & Digital Marketing">SEO & Digital Marketing</option>
                        </optgroup>
                        <optgroup label="IT Institute & Career Training">
                          {/* The courses actually offered, from Admin → Courses. */}
                          {courseNames.map((name) => (
                            <option key={name} value={`Course: ${name}`}>Course: {name}</option>
                          ))}
                          <option value="IT Institute & Courses">Other course / general training</option>
                        </optgroup>
                        <option value="Other / General Inquiry">Other / Partnership Inquiry</option>
                      </select>
                    </div>
                    <div className="ks-form__full">
                      <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="contact-message" className="ks-label">Your Message / Project Brief <span className="text-danger">*</span></label>
                        <span className="ks-meta" style={{ fontSize: '0.78rem', marginBottom: '8px' }}>{formData.message.length} / 500</span>
                      </div>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={500}
                        required
                        className="ks-input"
                        placeholder="Tell us about your project timeline, goals, or the specific course you wish to join..."
                      ></textarea>
                    </div>
                    <div className="ks-form__full d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <span className="ks-meta d-inline-flex align-items-center gap-2">
                        <i className="fa fa-shield-alt text-success" aria-hidden="true"></i> Your privacy is 100% protected.
                      </span>
                      <button type="submit" className="ks-btn ks-btn--primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message Now</span>
                            <i className="fa fa-paper-plane" aria-hidden="true"></i>
                          </>
                        )}
                      </button>
                    </div>
                    {submitError && <div className="ks-form__full text-danger small" role="alert">{submitError}</div>}
                  </form>
                </>
              ) : (
                <div className="text-center" style={{ padding: '40px 0' }} role="status">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-success text-white shadow-lg mb-4"
                    style={{ width: '80px', height: '80px', fontSize: '2.2rem', borderRadius: '24px' }}
                  >
                    <i className="fa fa-check" aria-hidden="true"></i>
                  </div>
                  <h3 className="ks-card__title" style={{ fontSize: '1.5rem' }}>Message Received Successfully!</h3>
                  <p className="ks-card__text mx-auto" style={{ maxWidth: '420px', marginBottom: '28px' }}>
                    Thank you for reaching out, <strong>{formData.name}</strong>. Our senior technical team has logged your request and will contact you via email or WhatsApp within 24 hours.
                  </p>
                  <button type="button" className="ks-btn ks-btn--outline" onClick={handleReset}>
                    <i className="fa fa-arrow-rotate-left" aria-hidden="true"></i> Send Another Message
                  </button>
                </div>
              )}
            </div>

            <div className="ks-contact-side">
              <div className="ks-grid ks-grid--2" style={{ gap: '16px' }}>
                {infoCards.map((card, index) => (
                  <div className="ks-card ks-card--hover" key={card.title} data-reveal="" style={revealDelay(index, 2)}>
                    <div className="ks-card__body" style={{ padding: '24px' }}>
                      <span className="ks-icon-tile ks-icon-tile--sm" aria-hidden="true" style={{ marginBottom: '16px' }}><i className={card.icon}></i></span>
                      <h3 className="ks-card__title" style={{ fontSize: '1.02rem', marginBottom: '8px' }}>{card.title}</h3>
                      {card.body}
                      <div className="ks-card__foot ks-card__foot--line" style={{ marginTop: '18px', paddingTop: '14px' }}>{card.foot}</div>
                    </div>
                  </div>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div className="ks-card" style={{ marginTop: '16px', height: 'auto' }}>
                  <div className="ks-card__body" style={{ padding: '22px 24px' }}>
                    <p className="ks-eyebrow" style={{ marginBottom: '14px' }}>Connect with KN Softic</p>
                    <div className="d-flex flex-wrap gap-2">
                      {socialLinks.map((link) => (
                        <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" className={`contact-social-pill contact-social-pill-${link.platform?.toLowerCase() || 'unknown'}`}>
                          <i className={link.icon || 'fa fa-link'} aria-hidden="true"></i> <span>{link.label || link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '80px' }}>
            <SectionHeader
              eyebrow="Find us"
              title="Visit Our Technology Hub in Faisalabad"
              description="Convenient parking and modern facilities available for clients and students."
              action={<a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="ks-link">Open in Google Maps <i className="fa fa-arrow-up-right-from-square" aria-hidden="true"></i></a>}
              as="h3"
              compact
            />
            <div className="ks-map" data-reveal="zoom">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="450"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KN Softic Office Location"
              ></iframe>
            </div>
          </div>

          <div className="ks-banner" data-reveal="zoom">
            <div style={{ maxWidth: '640px' }}>
              <p className="ks-eyebrow ks-eyebrow--light">Ready to get started?</p>
              <h3 className="ks-title ks-title--light" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                {pageSeo?.h4_heading || 'Turn Your Digital Vision Into Reality Today'}
              </h3>
              <p className="ks-lead ks-lead--light" style={{ marginTop: '14px', fontSize: '0.98rem' }}>
                Whether you want custom enterprise software tailored to your workflows or wish to master modern tech skills in our institute, we provide end-to-end guidance every step of the way.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <Link href="/services" className="ks-btn ks-btn--light">
                Explore All Services <i className="fa fa-arrow-right" aria-hidden="true"></i>
              </Link>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="ks-btn ks-btn--ghost">
                <i className="fab fa-whatsapp" aria-hidden="true"></i> Instant WhatsApp Call
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
