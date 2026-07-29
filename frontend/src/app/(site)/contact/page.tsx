"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHero } from '../../../components/common/page-hero';
import { apiService } from '../../../services/api';
import { getEnabledSocialLinks, getSetting } from '../../../utils/settings';

const DEFAULT_CONTACT = {
  address: 'KN Softic, Faisalabad, Pakistan',
  email: 'info@knsoftic.com',
  phone: '+92 345 2470250',
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

const toWhatsappNumber = (value?: string | null) => formatPhone(value).replace(/\D/g, '');

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [pageSeo, setPageSeo] = useState<any>({});

  const headquartersAddress = formatAddress(getSetting(settings, ['office_address', 'company_address', 'contact_address']));
  const primaryEmail = formatEmail(getSetting(settings, ['primary_email', 'contact_email']));
  const supportEmail = formatEmail(getSetting(settings, ['support_email', 'secondary_email']));
  const primaryPhone = formatPhone(getSetting(settings, ['whatsapp_number', 'phone_number', 'contact_phone']));
  const socialLinks = getEnabledSocialLinks(settings);

  useEffect(() => {
    Promise.all([
      apiService.get('/settings'),
      apiService.get('/seo/pages/contact')
    ]).then(([settingsData, seoData]) => {
      setSettings(settingsData || {});
      setPageSeo(seoData || {});
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await apiService.post('/contact-messages', {
        ...formData,
        subject: formData.subject || 'Website Contact',
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setReferenceCode(`INQ-2026-${randomId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError('We could not send your message right now. Please try again in a moment.');
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmitError('');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-contact-input { 
          width: 100% !important; 
          background: #f8f9fa !important; 
          border: 2px solid #e1e5ea !important; 
          border-radius: 12px !important; 
          padding: 14px 20px !important; 
          font-size: 15px !important; 
          color: #2c3e50 !important; 
          transition: all 0.3s ease !important; 
        } 
        .custom-contact-input:focus { 
          outline: none !important; 
          border-color: #8D18D0 !important; 
          background: #ffffff !important; 
          box-shadow: 0 0 0 4px rgba(141, 24, 208, 0.1) !important; 
        }
        .btn-premium-gradient {
          background: linear-gradient(135deg, #8D18D0 0%, #a83af0 100%) !important;
          color: #fff !important;
          border: none !important;
          padding: 12px 36px !important;
          border-radius: 50px !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          letter-spacing: 0.5px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 6px 20px rgba(141, 24, 208, 0.25) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          cursor: pointer !important;
        }
        .btn-premium-gradient:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 25px rgba(141, 24, 208, 0.4) !important;
          background: linear-gradient(135deg, #7b12b8 0%, #9b28e0 100%) !important;
          color: #fff !important;
        }
      `}} />
      <PageHero
        badge="CONTACT US"
        title={pageSeo?.h1_heading || "Let's Build Something Extraordinary"}
        description="Have an ambitious software project, need enterprise digital transformation, or looking to advance your career at Pakistan's premier IT institute? We're ready when you are."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us', active: true }]}
      />

      <div className="contact-section-wrapper">
        <div className="container">
          <div className="section-heading mb-5 text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="badge-dot"></span>
              <div className="text-uppercase fw-bold mb-0" style={{ color: '#7b2cbf', fontSize: '0.85rem', letterSpacing: '1px' }}>
                Official Contact Points
              </div>
            </div>
            <div className="section-heading"><h2 className="fw-bold text-dark display-6 mb-3 mx-auto">{pageSeo?.h2_heading || 'We Are Here For You 24/7'}</h2></div>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '600px' }}>
              Whether you're an enterprise seeking custom software development, a startup looking for an MVP, or an ambitious student joining our institute, our doors are always open.
            </p>
            <div className="d-inline-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-pill bg-success bg-opacity-10 text-success fw-semibold small mb-0 mx-auto">
              <span className="spinner-grow spinner-grow-sm" role="status"></span>
              <span>Live Support Currently Available • Replies within 15 mins</span>
            </div>
          </div>
          
          <div className="row g-5 align-items-stretch">
            {/* Left Column: Interactive Contact Form & Celebration Card */}
            <div className="col-lg-6 d-flex align-items-center">
              <div className="contact-form-container w-100 pb-4">
                {!isSubmitted ? (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333', marginBottom: '30px' }}>
                        {pageSeo?.h3_heading || 'Send Us A Message'}
                      </h3>
                      <span className="badge bg-light text-primary border px-3 py-2 rounded-pill small fw-semibold d-flex align-items-center gap-1">
                        <i className="bi bi-lightning-charge-fill text-warning"></i> Quick Response
                      </span>
                    </div>
                    <p className="text-muted mb-4 small">
                      Fill out the form below and our engineering & support team will respond within 24 hours.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-dark">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control custom-contact-input"
                            placeholder="e.g. Muhammad Sohaib"
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-dark">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control custom-contact-input"
                            placeholder="e.g. sohaib@company.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-dark">Phone / WhatsApp</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-control custom-contact-input"
                            placeholder="+92 300 0000000"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-dark">
                            Subject / Interest <span className="text-danger">*</span>
                          </label>
                          <select
                            id="cSubject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="form-control custom-contact-input"
                            required
                          >
                            <option value="" disabled>Select inquiry type...</option>
                            <optgroup label="Software & Digital Solutions">
                              <option value="Custom Software / Web">Web & Custom Software</option>
                              <option value="Mobile App / UI/UX">Mobile App & UI/UX</option>
                              <option value="UI/UX Design Strategy">UI/UX Design Strategy</option>
                              <option value="Custom Enterprise Software">Custom Enterprise Software</option>
                              <option value="SEO & Digital Marketing">SEO & Digital Marketing</option>
                            </optgroup>
                            <optgroup label="IT Institute & Career Training">
                              <option value="IT Institute & Courses">Course: Full Stack Web Development</option>
                              <option value="Course: Graphic Designing & UI/UX">Course: Graphic Designing & UI/UX</option>
                              <option value="Course: Video Editing & Animation">Course: Video Editing & Animation</option>
                              <option value="Course: Android & Flutter Mastery">Course: Android & Flutter Mastery</option>
                              <option value="Course: SEO Mastery & Freelancing">Course: SEO Mastery & Freelancing</option>
                            </optgroup>
                            <option value="Other / General Inquiry">Other / Partnership Inquiry</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label small fw-semibold text-dark mb-0">
                            Your Message / Project Brief <span className="text-danger">*</span>
                          </label>
                          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                            {formData.message.length} / 500 chars
                          </span>
                        </div>
                        <textarea
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          maxLength={500}
                          className="form-control custom-contact-input"
                          placeholder="Tell us about your project timeline, goals, or the specific course you wish to join..."
                          required
                        ></textarea>
                      </div>

                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="small text-muted d-flex align-items-center gap-2">
                          <i className="bi bi-shield-check text-success fs-6"></i>
                          <span>Your privacy is 100% protected.</span>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <button type="submit" className="btn-premium-gradient" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                <span>Sending Inquiry...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Message Now</span>
                                <i className="bi bi-send-fill ms-2"></i>
                              </>
                            )}
                          </button>
                          {submitError && <span className="text-danger small">{submitError}</span>}
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Glassmorphic Success Celebration State */
                  <div className="contact-success-card py-5">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow-lg mb-4"
                      style={{ width: '80px', height: '80px', fontSize: '2.2rem' }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Message Received Successfully!</h3>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                      Thank you for reaching out, <strong>{formData.name}</strong>. Our senior technical team has logged your request and will contact you via email or WhatsApp within 24 hours.
                    </p>
                    <div className="bg-light border rounded-3 p-3 d-inline-block mb-4 px-4">
                      <span className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
                        Your Inquiry Tracking Code
                      </span>
                      <span className="fw-bold text-primary fs-5" style={{ fontFamily: 'monospace' }}>
                        {referenceCode}
                      </span>
                    </div>
                    <div>
                      <button type="button" className="btn btn-outline-primary px-4 py-2 rounded-pill fw-semibold" onClick={handleReset}>
                        <i className="bi bi-arrow-counterclockwise me-2"></i> Send Another Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Comprehensive Contact Information Grid & Social Bar */}
            <div className="col-lg-6 d-flex flex-column justify-content-between">
              <div>


                <div className="row g-4 mt-1">
                  {/* Card 1: Headquarters */}
                  <div className="col-md-6">
                    <div className="contact-info-card">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="contact-icon-circle">
                            <i className="bi bi-geo-alt-fill"></i>
                          </div>
                          <h5>Our Headquarters</h5>
                        </div>
                        <p className="text-dark fw-medium mb-2" style={{ lineHeight: 1.6 }}>
                          {headquartersAddress}
                        </p>
                        <p className="text-muted small mb-0">
                          In-person meetings by appointment. We serve clients across Pakistan and beyond.
                        </p>
                      </div>
                      <div className="pt-3 mt-4 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <span className="badge bg-light text-muted border px-2 py-1 small fw-medium">📍 Faisalabad Hub</span>
                        <a
                          href="https://maps.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="small fw-bold text-primary text-decoration-none d-inline-flex align-items-center gap-1 text-nowrap"
                        >
                          <span>Get Directions</span> <i className="bi bi-arrow-up-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Email Support */}
                  <div className="col-md-6">
                    <div className="contact-info-card">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="contact-icon-circle">
                            <i className="bi bi-envelope-fill"></i>
                          </div>
                          <h5>Email Support</h5>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <a href={`mailto:${primaryEmail}`} className="text-decoration-none text-dark fw-medium">{primaryEmail}</a>
                          <a href={`mailto:${supportEmail}`} className="text-decoration-none text-muted">{supportEmail}</a>
                        </div>
                      </div>
                      <div className="pt-3 mt-4 border-top d-flex align-items-center justify-content-between">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 small fw-medium">✉️ 2 Email Lines</span>
                        <span className="small text-success fw-bold d-inline-flex align-items-center gap-1">
                          <i className="bi bi-lightning-charge-fill"></i> Instant Ticket
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Phone & WhatsApp */}
                  <div className="col-md-6">
                    <div className="contact-info-card">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="contact-icon-circle">
                            <i className="bi bi-whatsapp"></i>
                          </div>
                          <h5>Phone & WhatsApp</h5>
                        </div>
                        <p className="text-dark fw-semibold mb-1">{primaryPhone}</p>
                        <p className="text-muted small">Direct Consultation & Engineering Desk</p>
                      </div>
                      <div className="pt-3 mt-4 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small fw-medium text-nowrap">🟢 Online Now</span>
                        <a
                          href={`https://wa.me/${toWhatsappNumber(getSetting(settings, ['whatsapp_number', 'phone_number', 'contact_phone']))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="small fw-bold text-success text-decoration-none d-inline-flex align-items-center gap-1 text-nowrap"
                        >
                          <span>Chat on WhatsApp</span> <i className="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Working Hours */}
                  <div className="col-md-6">
                    <div className="contact-info-card">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="contact-icon-circle">
                            <i className="bi bi-clock-fill"></i>
                          </div>
                          <h5>Working Hours</h5>
                        </div>
                        <p className="text-dark fw-medium mb-1">Mon – Sat: 9:00 AM – 7:00 PM</p>
                        <p className="text-muted small mb-0">Sunday: Closed for maintenance</p>
                      </div>
                      <div className="pt-3 mt-4 border-top d-flex align-items-center justify-content-between">
                        <span className="badge bg-dark text-white px-2 py-1 small fw-medium">🕒 6 Days / Wk</span>
                        <span className="small text-primary fw-bold d-inline-flex align-items-center gap-1">
                          <i className="bi bi-headset"></i> 24/7 Digital Desk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Connect Bar */}
              <div className="mt-5 pt-3 border-top">
                <div className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.8px' }}>
                  Connect With KN Softic on Socials
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" className={`contact-social-pill contact-social-pill-${link.platform?.toLowerCase() || 'unknown'}`}>
                      <i className={link.icon || 'bi bi-link-45deg'}></i> <span>{link.label || link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Section */}
          <div className="row mt-5 pt-4">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-map text-primary"></i> Visit Our Technology Hub in Faisalabad
                </h5>
                <span className="text-muted small">Convenient parking and modern facilities available for clients and students</span>
              </div>
              <div className="map-container">
                  <iframe
                  src={getSetting(settings, ['google_maps_embed_url'], 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.119794358897!2d72.92739457632612!3d31.367049554605915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39225b00438c21f1%3A0x9ae7c88be0aa71d9!2sKn%20Softic!5e0!3m2!1sen!2spk!4v1717360000000!5m2!1sen!2pk')}
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
          </div>

          {/* Call-to-Action (CTA) Section */}
          <div className="row mt-5 pt-4">
            <div className="col-12">
              <div className="contact-cta-banner text-center text-lg-start d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">
                <div style={{ maxWidth: '640px' }}>
                  <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-3 py-2 rounded-pill small fw-semibold mb-3 d-inline-block">
                    🚀 READY TO GET STARTED?
                  </span>
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '20px' }}>
                    {pageSeo?.h4_heading || 'Turn Your Digital Vision Into Reality Today'}
                  </h3>
                  <p className="mb-0 text-white text-opacity-75 fs-6" style={{ lineHeight: 1.6 }}>
                    Whether you want custom enterprise software tailored to your workflows or wish to master modern tech skills in our institute, we provide end-to-end guidance every step of the way.
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <Link href="/services" className="btn btn-light px-4 py-3 rounded-3 fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2" style={{ borderRadius: '12px' }}>
                    <span>Explore All Services</span> <i className="bi bi-arrow-right"></i>
                  </Link>
                  <a
                    href={`https://wa.me/${toWhatsappNumber(settings.contact_phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-light px-4 py-3 rounded-3 fw-bold d-inline-flex align-items-center gap-2"
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-whatsapp"></i> <span>Instant WhatsApp Call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}