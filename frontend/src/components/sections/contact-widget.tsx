"use client";

import { useState } from 'react';
import Link from 'next/link';
import { apiService } from '../../services/api';
import { getSetting } from '../../utils/settings';
import { getWhatsappNumber, useSiteSettings } from '../layout/site-settings';

export function ContactWidget() {
  const settings = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');

  const phone = getSetting(settings, ['contact_phone', 'phone_number'], '+92 345 2470250');
  const email = getSetting(settings, ['contact_email', 'primary_email'], 'info@knsoftic.com');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatusError('Please fill in all required fields (*).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatusError('Please enter a valid email address (make sure there are no spaces).');
      return;
    }

    setIsSubmitting(true);
    setStatusError('');
    setStatusMessage('');

    try {
      await apiService.post('/contact-messages', {
        ...formData,
        email: formData.email.trim(),
        subject: formData.subject || 'Homepage Contact',
      });

      setStatusMessage('Thanks. Your message has been sent successfully.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      console.error(error);
      setStatusError(`Unable to send your message right now. Error: ${error?.message || 'Network issue'}. Please try again later.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ks-section" id="contact">
      <div className="ks-container">
        <div className="ks-cta" data-reveal="zoom">
          <div className="ks-cta__intro">
            <p className="ks-eyebrow ks-eyebrow--light">Contact Us</p>
            <h2 className="ks-title ks-title--light">Feel Free To Contact Us Anytime</h2>
            <p className="ks-lead ks-lead--light" style={{ marginTop: '16px', fontSize: '0.98rem' }}>
              Ready to kickstart your next digital project? Reach out today to discuss how we can elevate your brand with custom web development, mobile applications, and impactful visual design tailored to your goals.
            </p>

            <ul className="ks-contact-list">
              <li>
                <a href={`https://wa.me/${getWhatsappNumber(settings)}`} target="_blank" rel="noopener noreferrer">
                  <span className="ks-icon-tile ks-icon-tile--sm" aria-hidden="true"><i className="fab fa-whatsapp"></i></span>
                  <span><small>Call or WhatsApp</small>{phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`}>
                  <span className="ks-icon-tile ks-icon-tile--sm" aria-hidden="true"><i className="bi bi-envelope"></i></span>
                  <span><small>Email us</small>{email}</span>
                </a>
              </li>
            </ul>

            <div className="ks-offer-spacer" aria-hidden="true"></div>
            <Link href="/contact" className="ks-offer" aria-label="Claim the special offer: 20% off your first project">
              <span>
                <span className="ks-offer__value">20%</span>
                <span className="ks-offer__label">Off</span>
              </span>
              <span>
                <span className="ks-offer__label">Limited time only</span>
                <span className="ks-offer__text" style={{ display: 'block' }}>Special offer on your first project</span>
              </span>
              <i className="fa fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          <div className="ks-cta__form">
            <form className="ks-form" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="ks-label" htmlFor="cw-name">Your Name *</label>
                <input type="text" name="name" id="cw-name" placeholder="e.g. Ali Khan" autoComplete="name" className="ks-input" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className="ks-label" htmlFor="cw-email">Your E-mail *</label>
                <input type="text" inputMode="email" name="email" id="cw-email" placeholder="you@company.com" autoComplete="email" className="ks-input" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="ks-label" htmlFor="cw-phone">Phone / WhatsApp</label>
                <input type="tel" name="phone" id="cw-phone" placeholder="+92 300 0000000" autoComplete="tel" className="ks-input" value={formData.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="ks-label" htmlFor="cw-subject">Subject / Interest</label>
                <input type="text" name="subject" id="cw-subject" placeholder="Website, app, course…" className="ks-input" value={formData.subject} onChange={handleChange} />
              </div>
              <div className="ks-form__full">
                <label className="ks-label" htmlFor="cw-message">Your Message *</label>
                <textarea name="message" id="cw-message" rows={4} placeholder="Tell us a little about what you need" className="ks-input" value={formData.message} onChange={handleChange}></textarea>
              </div>
              <div className="ks-form__full">
                <button type="submit" className="ks-btn ks-btn--primary ks-btn--block" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Message...' : 'Send Message Now'} <i className="bi bi-send-fill" aria-hidden="true"></i>
                </button>
              </div>
              {(statusMessage || statusError) && (
                <div className="ks-form__full" role="status">
                  {statusMessage && <div className="alert alert-success mb-0 py-2 small">{statusMessage}</div>}
                  {statusError && <div className="alert alert-danger mb-0 py-2 small">{statusError}</div>}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
