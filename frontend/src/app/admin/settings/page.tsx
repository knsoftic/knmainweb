"use client";

import { useMemo, useState } from 'react';
import { AdminButton, AdminImageUpload, AdminInput, AdminTextarea } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { parseSocialLinks } from '../../../utils/settings';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';

const LOAD_FAILED_MESSAGE = 'Failed to load settings from the server. Saving is disabled until they load.';

type SocialLinkRow = {
  platform: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  display_order: number;
};

const defaultSettings = {
  site_name: 'KN Softic',
  website_tagline: 'Software House & IT Institute',
  company_name: 'KN Softic',
  company_description: 'We build high-performance digital products, websites, mobile apps, and modern learning experiences.',
  about_subtitle: 'About Us',
  about_title: 'What make us the best?',
  about_description: 'We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity.',
  logo_url: '',
  favicon_url: '',
  copyright_text: 'Copyright © 2026 KN Softic. All rights reserved.',
  footer_text: 'Software House & IT Institute',
  company_address: 'KN Softic, Faisalabad, Pakistan',
  working_hours: 'Mon – Sat: 9:00 AM – 7:00 PM',
  primary_email: 'info@knsoftic.com',
  secondary_email: 'hello@knsoftic.com',
  support_email: 'support@knsoftic.com',
  sales_email: 'sales@knsoftic.com',
  phone_number: '+92 345 2470250',
  whatsapp_number: '+92 345 2470250',
  office_address: 'KN Softic, Faisalabad, Pakistan',
  google_maps_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.119794358897!2d72.92739457632612!3d31.367049554605915!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x39225b00438c21f1%3A0x9ae7c88be0aa71d9!2sKn%20Softic!5e0!3m2!1sen!2pk',
  business_name: 'KN Softic',
  registration_number: '',
  vat_number: '',
  customer_care_number: '+92 345 2470250',
  light_logo_url: '',
  default_og_image_url: '/assets/images/cover-object.png',
  social_links: [],
  contact_email: 'info@knsoftic.com',
  contact_phone: '+92 345 2470250',
  contact_address: 'KN Softic, Faisalabad, Pakistan',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  linkedin_url: '',
  youtube_url: '',
  tiktok_url: '',
  github_url: '',
  behance_url: '',
  dribbble_url: '',
};

const presetSocialRows: SocialLinkRow[] = [
  { platform: 'facebook', label: 'Facebook', url: '', icon: 'fab fa-facebook-f', enabled: true, display_order: 1 },
  { platform: 'instagram', label: 'Instagram', url: '', icon: 'fab fa-instagram', enabled: true, display_order: 2 },
  { platform: 'linkedin', label: 'LinkedIn', url: '', icon: 'fab fa-linkedin-in', enabled: true, display_order: 3 },
  { platform: 'twitter', label: 'X / Twitter', url: '', icon: 'fab fa-x-twitter', enabled: true, display_order: 4 },
  { platform: 'youtube', label: 'YouTube', url: '', icon: 'fab fa-youtube', enabled: true, display_order: 5 },
  { platform: 'tiktok', label: 'TikTok', url: '', icon: 'fab fa-tiktok', enabled: false, display_order: 6 },
  { platform: 'github', label: 'GitHub', url: '', icon: 'fab fa-github', enabled: false, display_order: 7 },
  { platform: 'behance', label: 'Behance', url: '', icon: 'fab fa-behance', enabled: false, display_order: 8 },
  { platform: 'dribbble', label: 'Dribbble', url: '', icon: 'fab fa-dribbble', enabled: false, display_order: 9 },
  { platform: 'custom', label: 'Custom Link', url: '', icon: 'fa fa-link', enabled: false, display_order: 10 },
];

const cloneDefaults = () => ({ ...defaultSettings, social_links: presetSocialRows });

const normalizeLoadedSettings = (data: any) => ({
  ...cloneDefaults(),
  ...data,
  social_links: parseSocialLinks(data).length > 0 ? parseSocialLinks(data) : presetSocialRows,
});

type TabType = 'general' | 'contact' | 'business' | 'branding' | 'social' | 'about';

export default function SettingsManager() {
  const [settings, setSettings] = useState<any>(cloneDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  // Set when the settings couldn't be loaded: the form (still holding defaults) is hidden and saving is blocked.
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('general');


  const loadSettings = async () => normalizeLoadedSettings(await apiService.get('/settings'));

  // `silent` refreshes after a save without the full-page spinner and without clearing the status message.
  const fetchSettings = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) {
      setLoading(true);
      setStatusMessage('');
      setStatusError('');
    }

    try {
      setSettings(await loadSettings());
      setLoadError('');
    } catch (error) {
      console.error(error);
      if (!silent) setLoadError(LOAD_FAILED_MESSAGE);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useLoadOnMount(loadSettings, setSettings, {
    onError: (error) => {
      console.error(error);
      setLoadError(LOAD_FAILED_MESSAGE);
    },
    onSettled: () => setLoading(false),
  });

  const socialLinks: SocialLinkRow[] = useMemo(() => {
    return Array.isArray(settings.social_links) ? settings.social_links : presetSocialRows;
  }, [settings.social_links]);

  const updateField = (key: string, value: any) => {
    setSettings((current: any) => ({ ...current, [key]: value }));
  };

  const updateSocialLink = (index: number, key: keyof SocialLinkRow, value: string | boolean | number) => {
    setSettings((current: any) => {
      const nextLinks = [...(Array.isArray(current.social_links) ? current.social_links : presetSocialRows)];
      nextLinks[index] = { ...nextLinks[index], [key]: value };
      return { ...current, social_links: nextLinks };
    });
  };

  const addCustomSocialLink = () => {
    setSettings((current: any) => ({
      ...current,
      social_links: [
        ...(Array.isArray(current.social_links) ? current.social_links : presetSocialRows),
        { platform: 'custom', label: 'Custom Link', url: '', icon: 'fa fa-link', enabled: false, display_order: (current.social_links?.length || 0) + 1 },
      ],
    }));
  };

  const removeSocialLink = (index: number) => {
    setSettings((current: any) => ({
      ...current,
      social_links: (Array.isArray(current.social_links) ? current.social_links : presetSocialRows).filter((_: any, linkIndex: number) => linkIndex !== index),
    }));
  };

  const resetToDefaults = () => {
    setSettings(cloneDefaults());
    setStatusMessage('Settings reset locally. Save to apply the defaults to the database.');
    setStatusError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || loadError) return;
    setSaving(true);
    setStatusMessage('');
    setStatusError('');

    try {
      const payload = {
        ...settings,
        social_links: socialLinks.map((link, index) => ({ ...link, display_order: Number(link.display_order ?? index + 1) })),
      };

      await apiService.put('/settings', payload);
      setStatusMessage('Global settings saved successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
      await fetchSettings({ silent: true });
    } catch (error) {
      console.error(error);
      setStatusError('Failed to save global settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'general', label: 'General Settings', icon: 'fa-globe' },
    { id: 'contact', label: 'Contact Info', icon: 'fa-address-book' },
    { id: 'business', label: 'Business Info', icon: 'fa-briefcase' },
    { id: 'branding', label: 'Branding', icon: 'fa-paint-brush' },
    { id: 'social', label: 'Social Media', icon: 'fa-hashtag' },
    { id: 'about', label: 'Homepage About', icon: 'fa-info-circle' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f3f3f3', borderTop: '3px solid #8D18D0', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6c757d', fontWeight: 500 }}>Loading global configuration...</p>
    </div>
  );

  // Never render the (default-filled) form when the real settings failed to load, so it can't be saved over them.
  if (loadError) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 24px', fontWeight: 800, color: '#1a1d20', fontSize: '2rem', letterSpacing: '-0.5px' }}>Global Settings</h2>
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        background: 'rgba(220,53,69,0.1)',
        color: '#dc3545',
        border: '1px solid rgba(220,53,69,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        fontWeight: 500,
      }}>
        <span>
          <i className="fa fa-exclamation-circle" style={{ fontSize: '1.2rem', marginRight: '10px' }}></i>
          {loadError}
        </span>
        <AdminButton type="button" variant="secondary" onClick={() => fetchSettings()}>
          <i className="fa fa-refresh" style={{ marginRight: '8px' }}></i> Retry
        </AdminButton>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '120px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1a1d20', fontSize: '2rem', letterSpacing: '-0.5px' }}>Global Settings</h2>
          <p style={{ margin: '8px 0 0', color: '#6c757d', fontSize: '1.05rem' }}>Centralized configuration panel for all website-wide data.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <AdminButton type="button" variant="secondary" onClick={() => fetchSettings()}>
            <i className="fa fa-refresh" style={{ marginRight: '8px' }}></i> Reload
          </AdminButton>
        </div>
      </div>

      {(statusMessage || statusError) && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: statusError ? 'rgba(220,53,69,0.1)' : 'rgba(25,135,84,0.1)',
          color: statusError ? '#dc3545' : '#198754',
          border: `1px solid ${statusError ? 'rgba(220,53,69,0.2)' : 'rgba(25,135,84,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <i className={`fa ${statusError ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ fontSize: '1.2rem' }}></i>
          {statusError || statusMessage}
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-settings-grid">

        {/* Sidebar Navigation */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: '20px',
          minWidth: 0
        }}>
          <h5 style={{ padding: '0 12px 16px', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#adb5bd', fontWeight: 700, borderBottom: '1px solid #f1f3f5', marginBottom: '12px' }}>Categories</h5>
          <nav className="admin-pages-list">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(141, 24, 208, 0.1), rgba(141, 24, 208, 0.03))' : 'transparent',
                  color: activeTab === tab.id ? '#8D18D0' : '#495057',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                <i className={`fa ${tab.icon}`} style={{ width: '20px', textAlign: 'center', fontSize: '1.1rem', opacity: activeTab === tab.id ? 1 : 0.6 }}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: 'clamp(20px, 5vw, 40px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          minHeight: '600px',
          minWidth: 0
        }}>

          {/* 1. General Settings */}
          {activeTab === 'general' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>General Website Settings</h3>
                <p style={{ margin: '8px 0 0', color: '#6c757d' }}>These values control the brand and default identity shown across the website.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6"><AdminInput label="Website Name" value={settings.site_name || ''} onChange={(e) => updateField('site_name', e.target.value)} required /></div>
                <div className="col-md-6"><AdminInput label="Website Tagline" value={settings.website_tagline || ''} onChange={(e) => updateField('website_tagline', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Company Name" value={settings.company_name || ''} onChange={(e) => updateField('company_name', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Footer Text" value={settings.footer_text || ''} onChange={(e) => updateField('footer_text', e.target.value)} /></div>
                <div className="col-12"><AdminTextarea label="Company Description" value={settings.company_description || ''} onChange={(e) => updateField('company_description', e.target.value)} /></div>
                <div className="col-12"><AdminTextarea label="Copyright Text" value={settings.copyright_text || ''} onChange={(e) => updateField('copyright_text', e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* 2. Contact Info */}
          {activeTab === 'contact' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>Contact Information</h3>
                <p style={{ margin: '8px 0 0', color: '#6c757d' }}>These fields feed the footer, contact page, WhatsApp action, and other contact surfaces.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6"><AdminInput label="Primary Email" type="email" value={settings.primary_email || ''} onChange={(e) => updateField('primary_email', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Secondary Email" type="email" value={settings.secondary_email || ''} onChange={(e) => updateField('secondary_email', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Support Email" type="email" value={settings.support_email || ''} onChange={(e) => updateField('support_email', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Sales Email" type="email" value={settings.sales_email || ''} onChange={(e) => updateField('sales_email', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Phone Number" type="tel" value={settings.phone_number || ''} onChange={(e) => updateField('phone_number', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="WhatsApp Number" type="tel" value={settings.whatsapp_number || ''} onChange={(e) => updateField('whatsapp_number', e.target.value)} /></div>
                <div className="col-12"><AdminInput label="Company / Office Address" value={settings.office_address || ''} onChange={(e) => updateField('office_address', e.target.value)} /></div>
                <div className="col-12"><AdminTextarea label="Google Maps Embed URL" value={settings.google_maps_embed_url || ''} onChange={(e) => updateField('google_maps_embed_url', e.target.value)} /></div>
                <div className="col-12"><AdminInput label="Working Hours" value={settings.working_hours || ''} onChange={(e) => updateField('working_hours', e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* 3. Business Info */}
          {activeTab === 'business' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>Business Information</h3>
                <p style={{ margin: '8px 0 0', color: '#6c757d' }}>Optional business metadata for the company profile and future compliance displays.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6"><AdminInput label="Business Name" value={settings.business_name || ''} onChange={(e) => updateField('business_name', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Company Registration Number" value={settings.registration_number || ''} onChange={(e) => updateField('registration_number', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Tax / VAT Number" value={settings.vat_number || ''} onChange={(e) => updateField('vat_number', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="Customer Care Number" value={settings.customer_care_number || ''} onChange={(e) => updateField('customer_care_number', e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* 4. Branding */}
          {activeTab === 'branding' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>Branding Assets</h3>
                <p style={{ margin: '8px 0 0', color: '#6c757d' }}>Manage logos, the favicon, and the default social sharing image.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6"><AdminImageUpload label="Primary Website Logo" value={settings.logo_url || ''} onChange={(url) => updateField('logo_url', url)} /></div>
                <div className="col-md-6"><AdminImageUpload label="Favicon" value={settings.favicon_url || ''} onChange={(url) => updateField('favicon_url', url)} /></div>
                <div className="col-md-6"><AdminImageUpload label="Light Logo (For Dark Backgrounds)" value={settings.light_logo_url || ''} onChange={(url) => updateField('light_logo_url', url)} /></div>
                <div className="col-md-6"><AdminImageUpload label="Default Open Graph (SEO) Image" value={settings.default_og_image_url || ''} onChange={(url) => updateField('default_og_image_url', url)} /></div>
              </div>
            </div>
          )}

          {/* 5. Social Media */}
          {activeTab === 'social' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>Social Media Links</h3>
                  <p style={{ margin: '8px 0 0', color: '#6c757d' }}>Only enabled links will appear on the public website.</p>
                </div>
                <AdminButton type="button" variant="secondary" onClick={addCustomSocialLink}>
                  <i className="fa fa-plus" style={{ marginRight: '6px' }}></i> Add Custom Link
                </AdminButton>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {socialLinks.map((link, index) => (
                  <div key={`${link.platform}-${index}`} style={{
                    border: '1px solid #edf2f7',
                    borderRadius: '16px',
                    padding: '24px',
                    background: link.enabled ? '#ffffff' : '#f8f9fa',
                    boxShadow: link.enabled ? '0 4px 15px rgba(0,0,0,0.02)' : 'none',
                    transition: 'all 0.3s ease',
                    opacity: link.enabled ? 1 : 0.7
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #8D18D0, #5b1088)',
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          <i className={link.icon || 'fa fa-link'}></i>
                        </div>
                        <h5 style={{ margin: 0, fontWeight: 700, color: '#2d3748', textTransform: 'capitalize' }}>
                          {link.label || link.platform}
                        </h5>
                      </div>

                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
                        fontWeight: 600, color: link.enabled ? '#198754' : '#6c757d', cursor: 'pointer',
                        padding: '6px 12px', background: link.enabled ? 'rgba(25,135,84,0.1)' : '#e9ecef',
                        borderRadius: '20px', transition: 'all 0.2s'
                      }}>
                        <input type="checkbox" checked={link.enabled !== false} onChange={(e) => updateSocialLink(index, 'enabled', e.target.checked)} style={{ accentColor: '#198754' }} />
                        {link.enabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-3"><AdminInput label="Platform ID" value={link.platform} onChange={(e) => updateSocialLink(index, 'platform', e.target.value)} /></div>
                      <div className="col-md-3"><AdminInput label="Display Label" value={link.label} onChange={(e) => updateSocialLink(index, 'label', e.target.value)} /></div>
                      <div className="col-md-4"><AdminInput label="URL Link" value={link.url} onChange={(e) => updateSocialLink(index, 'url', e.target.value)} /></div>
                      <div className="col-md-2"><AdminInput label="Sort Order" type="number" value={link.display_order} onChange={(e) => updateSocialLink(index, 'display_order', Number(e.target.value))} /></div>

                      <div className="col-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                        <div style={{ flex: 1, maxWidth: '300px' }}>
                          <AdminInput label="Icon Class (FontAwesome)" value={link.icon} onChange={(e) => updateSocialLink(index, 'icon', e.target.value)} />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          style={{
                            padding: '10px 16px', borderRadius: '10px',
                            border: '1px solid rgba(220,53,69,0.3)', background: '#fff',
                            color: '#dc3545', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,53,69,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        >
                          <i className="fa fa-trash" style={{ marginRight: '6px' }}></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Homepage About */}
          {activeTab === 'about' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: 0, color: '#1a1d20', fontWeight: 700, fontSize: '1.5rem' }}>Homepage About Section</h3>
                <p style={{ margin: '8px 0 0', color: '#6c757d' }}>Keeps the homepage about copy editable from this centralized panel.</p>
              </div>
              <div className="row g-4">
                <div className="col-md-6"><AdminInput label="About Subtitle" value={settings.about_subtitle || ''} onChange={(e) => updateField('about_subtitle', e.target.value)} /></div>
                <div className="col-md-6"><AdminInput label="About Title" value={settings.about_title || ''} onChange={(e) => updateField('about_title', e.target.value)} /></div>
                <div className="col-12"><AdminTextarea label="About Description" value={settings.about_description || ''} onChange={(e) => updateField('about_description', e.target.value)} /></div>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Global Footer Actions */}
        <div className="admin-sticky-footer">
          <AdminButton type="button" variant="secondary" onClick={resetToDefaults}>
            <i className="fa fa-undo" style={{ marginRight: '8px' }}></i> Reset to Default
          </AdminButton>
          <AdminButton type="submit" disabled={saving}>
            {saving ? (
              <><i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Saving...</>
            ) : (
              <><i className="fa fa-save" style={{ marginRight: '8px' }}></i> Save All Changes</>
            )}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}