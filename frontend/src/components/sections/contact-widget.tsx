"use client";

import { useState } from 'react';
import { apiService } from '../../services/api';

export function ContactWidget() {
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
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
    <div className="contact-us section" id="contact">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 align-self-center">
            <div className="section-heading">
              <h6 style={{ color: '#8D18D0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CONTACT US</h6>
              <h2>Feel Free To Contact Us Anytime</h2>
              <p>
                Ready to kickstart your next digital project? Reach out today to discuss how we can elevate your brand with custom web development, mobile applications, and impactful visual design tailored to your goals.
              </p>
              <div className="special-offer-box">
                <div className="offer-badge">
                  OFF
                  <strong>20%</strong>
                </div>
                <div className="offer-content">
                  <h6>LIMITED: TIME ONLY</h6>
                  <h4>Special Offer 20% OFF Your First Project!</h4>
                </div>
                <a href="#" className="offer-arrow" aria-label="Claim Offer"><i className="fa fa-angle-right"></i></a>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="contact-us-content gradient-contact-box">
              <div className="transparent-circle-1"></div>
              <div className="transparent-circle-2"></div>
              <form id="contact-form" onSubmit={handleSubmit}>
                <input type="text" name="name" id="name" placeholder="Your Name *" autoComplete="name" className="custom-contact-input" value={formData.name} onChange={handleChange} />
                
                <input type="text" inputMode="email" name="email" id="email" placeholder="Your E-mail *" className="custom-contact-input" value={formData.email} onChange={handleChange} />
                
                <input type="tel" name="phone" id="phone" placeholder="Phone / WhatsApp" className="custom-contact-input" value={formData.phone} onChange={handleChange} />
                
                <input type="text" name="subject" id="subject" placeholder="Subject / Interest" className="custom-contact-input" value={formData.subject} onChange={handleChange} />
                
                <textarea name="message" id="message" rows={4} placeholder="Your Message *" className="custom-contact-input" value={formData.message} onChange={handleChange}></textarea>
                
                <div className="text-end">
                  <button type="submit" id="form-submit" className="btn-premium-gradient w-100">
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message Now'}</span>
                    <i className="bi bi-send-fill ms-2"></i>
                  </button>
                </div>
                {(statusMessage || statusError) && (
                  <div className="mt-3">
                    {statusMessage && <div className="alert alert-success mb-0 py-2 small">{statusMessage}</div>}
                    {statusError && <div className="alert alert-danger mb-0 py-2 small">{statusError}</div>}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
