"use client";

import { useState, useEffect } from 'react';
import { AdminButton, AdminInput, AdminTextarea, AdminImageUpload, AdminSelect } from '../../../components/common/admin-form-elements';
import { resolveImageUrl } from '../../../utils/image-url';
import { apiService } from '../../../services/api';

export default function SeoManager() {
  const [activeTab, setActiveTab] = useState('global');
  const [globalSeo, setGlobalSeo] = useState<any>({});
  const [pagesSeo, setPagesSeo] = useState<any[]>([]);
  const [redirects, setRedirects] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [headingCounts, setHeadingCounts] = useState<{h1: number, h2: number, h3: number, h4: number, h5: number, h6: number} | null>(null);
  const [analyzingHeadings, setAnalyzingHeadings] = useState(false);
  
  const [loading, setLoading] = useState(true);

  const standardPages = ['home', 'about', 'services', 'projects', 'products', 'blog', 'courses', 'team', 'contact'];



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const gSeo = await apiService.getGlobalSeo();
      setGlobalSeo(gSeo || {});
      const pSeo = await apiService.get('/seo/pages');
      setPagesSeo(pSeo || []);
      const rData = await apiService.get('/seo/redirects');
      setRedirects(rData || []);
      const mData = await apiService.get('/media');
      setMediaItems(mData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGlobalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateGlobalSeo(globalSeo);
      alert('Global SEO updated successfully!');
    } catch (e) {
      alert('Failed to update Global SEO');
    }
  };

  const handlePageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    try {
      await apiService.updatePageSeo(selectedPage.page_slug, selectedPage);
      alert(`SEO for ${selectedPage.page_slug} updated successfully!`);
      fetchData(); // Refresh to update list
      
      // Re-analyze headings to reflect changes, with a slight delay to allow revalidation
      setTimeout(() => {
        analyzePageHeadings(selectedPage.page_slug);
      }, 1000);
    } catch (e) {
      alert('Failed to update Page SEO');
    }
  };

  const loadPageSeo = (slug: string) => {
    const existing = pagesSeo.find(p => p.page_slug === slug);
    setSelectedPage(existing || { page_slug: slug, is_index: 1, is_follow: 1 });
  };

  useEffect(() => {
    if (selectedPage?.page_slug) {
      analyzePageHeadings(selectedPage.page_slug);
    } else {
      setHeadingCounts(null);
    }
  }, [selectedPage?.page_slug]);

  const analyzePageHeadings = async (slug: string) => {
    setAnalyzingHeadings(true);
    setHeadingCounts(null);
    try {
      const url = slug === 'home' ? '/' : `/${slug}`;
      const response = await fetch(url, { cache: 'no-store' }); // bypass browser cache
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Count tags within the main content if possible, or entire body
        setHeadingCounts({
          h1: doc.querySelectorAll('h1').length,
          h2: doc.querySelectorAll('h2').length,
          h3: doc.querySelectorAll('h3').length,
          h4: doc.querySelectorAll('h4').length,
          h5: doc.querySelectorAll('h5').length,
          h6: doc.querySelectorAll('h6').length,
        });
      }
    } catch (error) {
      console.error('Failed to analyze headings', error);
    }
    setAnalyzingHeadings(false);
  };

  const handleRedirectSave = async (e: React.FormEvent, id?: number) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const source = (form.elements.namedItem('source') as HTMLInputElement).value;
    const target = (form.elements.namedItem('target') as HTMLInputElement).value;
    const status = parseInt((form.elements.namedItem('status') as HTMLSelectElement).value);

    try {
      if (id) {
        await apiService.put(`/seo/redirects/${id}`, { source_url: source, target_url: target, status_code: status });
      } else {
        await apiService.post('/seo/redirects', { source_url: source, target_url: target, status_code: status });
      }
      form.reset();
      fetchData();
    } catch (err) { alert('Failed to save redirect'); }
  };

  const handleDeleteRedirect = async (id: number) => {
    if (confirm('Delete redirect?')) {
      await apiService.delete(`/seo/redirects/${id}`);
      fetchData();
    }
  };

  const handleMediaUpdate = async (item: any, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.put(`/media/${item.id}`, item);
      alert('Media SEO updated!');
    } catch (err) { alert('Failed to update media SEO'); }
  };

  const renderCharacterCount = (text: string, min: number, max: number) => {
    const len = (text || '').length;
    let color = '#dc3545'; // red
    if (len >= min && len <= max) color = '#198754'; // green
    else if (len > 0) color = '#ffc107'; // yellow
    
    return (
      <div style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '15px', color }}>
        Characters: {len} / {max} (Recommended: {min}-{max})
      </div>
    );
  };

  const renderSeoPreview = (title: string, desc: string, siteUrl: string, slug: string) => {
    const fullUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}${slug !== 'home' ? `/${slug}` : ''}` : `https://example.com/${slug !== 'home' ? slug : ''}`;
    const displayTitle = title || globalSeo.meta_title || globalSeo.website_title || 'Page Title';
    const displayDesc = desc || globalSeo.meta_description || 'No description provided...';

    return (
      <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>Google Search Preview</h5>
        <div style={{ fontFamily: 'arial, sans-serif' }}>
          <div style={{ fontSize: '12px', color: '#202124', marginBottom: '2px' }}>{fullUrl}</div>
          <div style={{ fontSize: '20px', color: '#1a0dab', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayTitle}</div>
          <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.4' }}>{displayDesc}</div>
        </div>
      </div>
    );
  };



  const renderHeadingAnalysis = () => {
    if (analyzingHeadings) {
      return <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>Analyzing page headings...</div>;
    }
    if (!headingCounts) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(141, 24, 208, 0.1)', color: '#8D18D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          <i className="bi bi-layout-text-window-reverse"></i>
        </div>
        <div style={{ display: 'flex', gap: '30px', textAlign: 'center' }}>
          {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map((tag, idx) => {
            const count = headingCounts[tag.toLowerCase() as keyof typeof headingCounts];
            const isH1 = tag === 'H1';
            let color = '#495057';
            if (isH1 && count === 0) color = '#dc3545'; // Error if no H1
            if (isH1 && count > 1) color = '#dc3545';   // Error if multiple H1s

            return (
              <div key={tag}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#003366', marginBottom: '5px' }}>{tag}</div>
                <div style={{ fontSize: '14px', color: color, fontWeight: isH1 ? 700 : 400 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <p>Loading SEO Data...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 25px 0', fontWeight: 700, color: '#2c3e50' }}>SEO Management System</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #dee2e6', paddingBottom: '15px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <button onClick={() => setActiveTab('global')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'global' ? '#8D18D0' : 'transparent', color: activeTab === 'global' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Global SEO</button>
        <button onClick={() => setActiveTab('pages')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'pages' ? '#8D18D0' : 'transparent', color: activeTab === 'pages' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Page-Level SEO</button>
        <button onClick={() => setActiveTab('schema')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'schema' ? '#8D18D0' : 'transparent', color: activeTab === 'schema' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Schema & Analytics</button>
        <button onClick={() => setActiveTab('redirects')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'redirects' ? '#8D18D0' : 'transparent', color: activeTab === 'redirects' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Redirects</button>
        <button onClick={() => setActiveTab('media')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'media' ? '#8D18D0' : 'transparent', color: activeTab === 'media' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Image SEO</button>
        <button onClick={() => setActiveTab('robots')} style={{ whiteSpace: 'nowrap', padding: '10px 20px', background: activeTab === 'robots' ? '#8D18D0' : 'transparent', color: activeTab === 'robots' ? '#fff' : '#495057', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Sitemap & Robots</button>
      </div>

      {activeTab === 'global' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <form onSubmit={handleGlobalSave}>
            <AdminInput label="Website Name" value={globalSeo.website_title || ''} onChange={(e) => setGlobalSeo({...globalSeo, website_title: e.target.value})} />
            <AdminInput label="Site URL (Base)" value={globalSeo.site_url || ''} onChange={(e) => setGlobalSeo({...globalSeo, site_url: e.target.value})} placeholder="e.g. https://www.knsoftic.com" />
            <AdminInput label="Global Meta Title" value={globalSeo.meta_title || ''} onChange={(e) => setGlobalSeo({...globalSeo, meta_title: e.target.value})} />
            {renderCharacterCount(globalSeo.meta_title, 50, 60)}
            <AdminTextarea label="Global Meta Description" value={globalSeo.meta_description || ''} onChange={(e) => setGlobalSeo({...globalSeo, meta_description: e.target.value})} />
            {renderCharacterCount(globalSeo.meta_description, 150, 160)}
            <AdminInput label="Global Keywords (comma separated)" value={globalSeo.keywords || ''} onChange={(e) => setGlobalSeo({...globalSeo, keywords: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}><AdminInput label="Author" value={globalSeo.author || ''} onChange={(e) => setGlobalSeo({...globalSeo, author: e.target.value})} /></div>
              <div style={{ flex: 1 }}><AdminInput label="Language Code (e.g. en-US)" value={globalSeo.language || ''} onChange={(e) => setGlobalSeo({...globalSeo, language: e.target.value})} /></div>
              <div style={{ flex: 1 }}><AdminInput label="Timezone" value={globalSeo.timezone || ''} onChange={(e) => setGlobalSeo({...globalSeo, timezone: e.target.value})} /></div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div style={{ flex: 1 }}><AdminImageUpload label="Logo URL" value={globalSeo.logo_url || ''} onChange={(url) => setGlobalSeo({...globalSeo, logo_url: url})} /></div>
              <div style={{ flex: 1 }}><AdminImageUpload label="Favicon URL" value={globalSeo.favicon_url || ''} onChange={(url) => setGlobalSeo({...globalSeo, favicon_url: url})} /></div>
            </div>
            <AdminImageUpload label="Default Open Graph Image" value={globalSeo.default_og_image || ''} onChange={(url) => setGlobalSeo({...globalSeo, default_og_image: url})} />

            <div style={{ marginTop: '30px' }}><AdminButton type="submit">Save Global SEO</AdminButton></div>
          </form>
        </div>
      )}

      {activeTab === 'pages' && (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', minWidth: '250px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Pages</h4>
            <div className="admin-pages-list">
              {standardPages.map(slug => (
                <div 
                  key={slug} 
                  onClick={() => loadPageSeo(slug)}
                  style={{ padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', background: selectedPage?.page_slug === slug ? 'rgba(141, 24, 208, 0.1)' : 'transparent', color: selectedPage?.page_slug === slug ? '#8D18D0' : '#495057', fontWeight: selectedPage?.page_slug === slug ? 600 : 400 }}
                >
                  {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '3 1 400px', minWidth: '300px' }}>
            {selectedPage ? (
              <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#8D18D0', wordBreak: 'break-word' }}>SEO Settings: /{selectedPage.page_slug === 'home' ? '' : selectedPage.page_slug}</h3>
                <form onSubmit={handlePageSave}>
                  
                  {renderSeoPreview(selectedPage.seo_title, selectedPage.meta_description, globalSeo.site_url, selectedPage.page_slug)}
                  {renderHeadingAnalysis()}
                  
                  <AdminInput label="SEO Title" value={selectedPage.seo_title || ''} onChange={(e) => setSelectedPage({...selectedPage, seo_title: e.target.value})} />
                  {renderCharacterCount(selectedPage.seo_title, 50, 60)}
                  
                  <AdminInput label="H1 Heading (Main Page Heading)" value={selectedPage.h1_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h1_heading: e.target.value})} />

                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', margin: '20px 0' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2c3e50' }}>Page Sub-Headings (H2-H6)</h4>
                    <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px' }}>
                      Explicitly define the SEO headings for this page. The system will map these to the appropriate sections automatically. Leave blank to use the default text.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <AdminInput label="H2 Heading (Primary Sub-section)" value={selectedPage.h2_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h2_heading: e.target.value})} />
                      <AdminInput label="H3 Heading (Secondary Sub-section)" value={selectedPage.h3_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h3_heading: e.target.value})} />
                      <AdminInput label="H4 Heading (Tertiary Sub-section)" value={selectedPage.h4_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h4_heading: e.target.value})} />
                      <AdminInput label="H5 Heading" value={selectedPage.h5_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h5_heading: e.target.value})} />
                      <AdminInput label="H6 Heading" value={selectedPage.h6_heading || ''} onChange={(e) => setSelectedPage({...selectedPage, h6_heading: e.target.value})} />
                    </div>
                  </div>
                  
                  <AdminTextarea label="Meta Description" value={selectedPage.meta_description || ''} onChange={(e) => setSelectedPage({...selectedPage, meta_description: e.target.value})} />
                  {renderCharacterCount(selectedPage.meta_description, 150, 160)}
                  
                  <AdminInput label="Keywords" value={selectedPage.keywords || ''} onChange={(e) => setSelectedPage({...selectedPage, keywords: e.target.value})} />
                  <AdminInput label="Canonical URL (Optional)" value={selectedPage.canonical_url || ''} onChange={(e) => setSelectedPage({...selectedPage, canonical_url: e.target.value})} />
                  <AdminTextarea label="Custom Page JSON-LD Schema (Optional)" value={selectedPage.schema_markup || ''} onChange={(e) => setSelectedPage({...selectedPage, schema_markup: e.target.value})} placeholder='{"@context": "https://schema.org", "@type": "...", ...}' />
                  
                  <div style={{ display: 'flex', gap: '20px', margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <AdminSelect label="Index (Search Engines)" value={selectedPage.is_index?.toString() || '1'} onChange={(e) => setSelectedPage({...selectedPage, is_index: parseInt(e.target.value)})} options={[{label: 'Index', value: '1'}, {label: 'No Index', value: '0'}]} />
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <AdminSelect label="Follow Links" value={selectedPage.is_follow?.toString() || '1'} onChange={(e) => setSelectedPage({...selectedPage, is_follow: parseInt(e.target.value)})} options={[{label: 'Follow', value: '1'}, {label: 'No Follow', value: '0'}]} />
                    </div>
                  </div>

                  <h4 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginTop: '30px' }}>Social Media SEO (Open Graph & Twitter)</h4>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <AdminInput label="OG Title" value={selectedPage.og_title || ''} onChange={(e) => setSelectedPage({...selectedPage, og_title: e.target.value})} />
                      <AdminTextarea label="OG Description" value={selectedPage.og_description || ''} onChange={(e) => setSelectedPage({...selectedPage, og_description: e.target.value})} />
                      <AdminImageUpload label="OG Image" value={selectedPage.og_image || ''} onChange={(url) => setSelectedPage({...selectedPage, og_image: url})} />
                    </div>
                    <div style={{ flex: '1 1 300px' }}>
                      <AdminInput label="Twitter Title" value={selectedPage.twitter_title || ''} onChange={(e) => setSelectedPage({...selectedPage, twitter_title: e.target.value})} />
                      <AdminTextarea label="Twitter Description" value={selectedPage.twitter_description || ''} onChange={(e) => setSelectedPage({...selectedPage, twitter_description: e.target.value})} />
                      <AdminImageUpload label="Twitter Image" value={selectedPage.twitter_image || ''} onChange={(url) => setSelectedPage({...selectedPage, twitter_image: url})} />
                    </div>
                  </div>

                  <div style={{ marginTop: '30px' }}><AdminButton type="submit">Save Page SEO</AdminButton></div>
                </form>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#6c757d' }}>Select a page from the sidebar to manage its SEO.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <form onSubmit={handleGlobalSave}>
            <h4 style={{ margin: '0 0 20px 0' }}>Analytics & Tracking</h4>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <AdminInput label="Google Analytics ID (G-XXXXX)" value={globalSeo.google_analytics_id || ''} onChange={(e) => setGlobalSeo({...globalSeo, google_analytics_id: e.target.value})} />
                <AdminInput label="Google Tag Manager ID" value={globalSeo.gtm_id || ''} onChange={(e) => setGlobalSeo({...globalSeo, gtm_id: e.target.value})} />
                <AdminInput label="Facebook Pixel ID" value={globalSeo.facebook_pixel_id || ''} onChange={(e) => setGlobalSeo({...globalSeo, facebook_pixel_id: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <AdminInput label="Search Console Verification Code" value={globalSeo.search_console_code || ''} onChange={(e) => setGlobalSeo({...globalSeo, search_console_code: e.target.value})} />
                <AdminInput label="Bing Webmaster Verification" value={globalSeo.bing_verification || ''} onChange={(e) => setGlobalSeo({...globalSeo, bing_verification: e.target.value})} />
                <AdminInput label="Microsoft Clarity ID" value={globalSeo.clarity_id || ''} onChange={(e) => setGlobalSeo({...globalSeo, clarity_id: e.target.value})} />
              </div>
            </div>

            <h4 style={{ margin: '30px 0 20px 0', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>Global Schema Markup (JSON-LD)</h4>
            <AdminTextarea label="Organization Schema" value={globalSeo.schema_organization || ''} onChange={(e) => setGlobalSeo({...globalSeo, schema_organization: e.target.value})} placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}' />
            <AdminTextarea label="Local Business Schema" value={globalSeo.schema_local_business || ''} onChange={(e) => setGlobalSeo({...globalSeo, schema_local_business: e.target.value})} placeholder='{"@context": "https://schema.org", "@type": "LocalBusiness", ...}' />
            <AdminTextarea label="Website Schema" value={globalSeo.schema_website || ''} onChange={(e) => setGlobalSeo({...globalSeo, schema_website: e.target.value})} placeholder='{"@context": "https://schema.org", "@type": "WebSite", ...}' />

            <div style={{ marginTop: '30px' }}><AdminButton type="submit">Save Changes</AdminButton></div>
          </form>
        </div>
      )}

      {activeTab === 'robots' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <form onSubmit={handleGlobalSave}>
            <h4 style={{ margin: '0 0 20px 0' }}>Sitemap Management</h4>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '5px' }}>Automatic Sitemap Generation</strong>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Sitemap is automatically generated at <a href="/sitemap.xml" target="_blank" style={{ color: '#0d6efd' }}>/sitemap.xml</a></span>
              </div>
              <AdminSelect label="" value={globalSeo.sitemap_status?.toString() || '1'} onChange={(e) => setGlobalSeo({...globalSeo, sitemap_status: parseInt(e.target.value)})} options={[{label: 'Enabled', value: '1'}, {label: 'Disabled', value: '0'}]} />
            </div>

            <h4 style={{ margin: '30px 0 20px 0', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>Robots.txt Content</h4>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>Leave blank to use the default automatically generated robots.txt file.</p>
            <AdminTextarea label="robots.txt rules" value={globalSeo.robots_txt_content || ''} onChange={(e) => setGlobalSeo({...globalSeo, robots_txt_content: e.target.value})} placeholder="User-agent: *&#10;Allow: /" />

            <div style={{ marginTop: '30px' }}><AdminButton type="submit">Save Settings</AdminButton></div>
          </form>
        </div>
      )}
      {activeTab === 'redirects' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '1000px' }}>
          <h4 style={{ margin: '0 0 20px 0' }}>Manage 301/302 Redirects</h4>
          <form onSubmit={(e) => handleRedirectSave(e)} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ flex: 2 }}><AdminInput label="Source URL (e.g. /old-page)" name="source" required /></div>
            <div style={{ flex: 2 }}><AdminInput label="Target URL (e.g. /new-page)" name="target" required /></div>
            <div style={{ flex: 1 }}><AdminSelect label="Type" name="status" options={[{label: '301 Permanent', value: '301'}, {label: '302 Temporary', value: '302'}]} /></div>
            <div style={{ paddingBottom: '20px' }}><AdminButton type="submit">Add Redirect</AdminButton></div>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Source URL</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Target URL</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{r.source_url}</td>
                  <td style={{ padding: '12px' }}>{r.target_url}</td>
                  <td style={{ padding: '12px' }}>{r.status_code}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDeleteRedirect(r.id)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No redirects added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'media' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 20px 0' }}>Image SEO (Media Library)</h4>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>Add Alt text, titles, and descriptions to your uploaded images to boost image search rankings.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {mediaItems.map((item, idx) => (
              <div key={item.id} style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <img src={resolveImageUrl(item.url)} alt={item.alt_text} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '15px' }} />
                <p style={{ margin: '0 0 10px', fontSize: '14px', wordBreak: 'break-all' }}>{item.title}</p>
                <form onSubmit={(e) => handleMediaUpdate(item, e)}>
                  <AdminInput label="Alt Text" value={item.alt_text || ''} onChange={(e) => {
                    const newItems = [...mediaItems];
                    newItems[idx].alt_text = e.target.value;
                    setMediaItems(newItems);
                  }} />
                  <AdminInput label="Image Title" value={item.title || ''} onChange={(e) => {
                    const newItems = [...mediaItems];
                    newItems[idx].title = e.target.value;
                    setMediaItems(newItems);
                  }} />
                  <div style={{ marginTop: '10px' }}><AdminButton type="submit">Update Image</AdminButton></div>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
