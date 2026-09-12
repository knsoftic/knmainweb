"use client";

import { useState } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminInput, AdminTextarea, AdminButton, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';
import { resolveImageUrl } from '../../../utils/image-url';
import { confirmAction, notify } from '../../../components/common/admin-feedback';

type LoadKey = 'hero' | 'funFacts' | 'settings' | 'services' | 'featuredServices' | 'courses' | 'featuredCourses';

const LOAD_LABELS: Record<LoadKey, string> = {
  hero: 'hero slides',
  funFacts: 'fun facts',
  settings: 'About Us settings',
  services: 'services',
  featuredServices: 'featured services',
  courses: 'courses',
  featuredCourses: 'featured courses',
};

export default function HomepageManager() {
  // Load state: a section whose data failed to load can't be saved, so empty values never overwrite real data.
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<LoadKey[]>([]);

  // Hero Slides State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState<any>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Settings & Fun Facts State
  const [settings, setSettings] = useState<any>({
    about_subtitle: '', about_title: '', about_description: ''
  });
  const [funFacts, setFunFacts] = useState<any[]>([]);
  const [isSavingOther, setIsSavingOther] = useState(false);

  // Homepage Services State
  const [allServices, setAllServices] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [isSavingServices, setIsSavingServices] = useState(false);

  // Homepage Courses State
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [isSavingCourses, setIsSavingCourses] = useState(false);

  // Load each resource independently so one failing request doesn't blank out unrelated sections.
  const loadData = () => Promise.allSettled([
    apiService.get('/hero_slides'),
    apiService.get('/fun_facts'),
    apiService.get('/settings'),
    apiService.get('/services'),
    apiService.get('/homepage_services'),
    apiService.get('/courses'),
    apiService.get('/homepage_courses')
  ]);

  const applyData = (results: PromiseSettledResult<any>[]) => {
    const [heroRes, factsRes, settingsRes, allSvcRes, featuredSvcRes, allCoursesRes, featuredCoursesRes] = results;
    const failed: LoadKey[] = [];
    const settle = (key: LoadKey, result: PromiseSettledResult<any>, apply: (value: any) => void) => {
      if (result.status === 'fulfilled') {
        apply(result.value);
      } else {
        console.error(`Failed to load ${LOAD_LABELS[key]}`, result.reason);
        failed.push(key);
      }
    };

    settle('hero', heroRes, (value: any) => setHeroSlides(value || []));
    settle('funFacts', factsRes, (value: any) => setFunFacts(Array.isArray(value) ? value : []));
    settle('settings', settingsRes, (value: any) => { if (value) setSettings(value); });
    settle('services', allSvcRes, (value: any) => setAllServices(value || []));
    settle('featuredServices', featuredSvcRes, (value: any) => setFeaturedServices(value || []));
    settle('courses', allCoursesRes, (value: any) => setAllCourses(value || []));
    settle('featuredCourses', featuredCoursesRes, (value: any) => setFeaturedCourses(value || []));

    setLoadErrors(failed);
    setLoading(false);
  };

  // Reload (Retry button, after saves).
  const fetchData = async () => {
    setLoading(true);
    applyData(await loadData());
  };

  useLoadOnMount(loadData, applyData);

  const heroLoadFailed = loadErrors.includes('hero');
  const servicesLoadFailed = loadErrors.includes('services') || loadErrors.includes('featuredServices');
  const coursesLoadFailed = loadErrors.includes('courses') || loadErrors.includes('featuredCourses');
  const aboutLoadFailed = loadErrors.includes('settings') || loadErrors.includes('funFacts');

  // --- Hero Slide Handlers ---
  const handleEditHero = (slide: any) => {
    setCurrentHeroSlide({ ...slide, id_exists: true });
    setIsEditingHero(true);
  };

  const handleDeleteHero = async (slide: any) => {
    if (await confirmAction(`Are you sure you want to delete this slide?`)) {
      try {
        await apiService.delete(`/hero_slides/${slide.id}`);
        setHeroSlides(heroSlides.filter(s => s.id !== slide.id));
      } catch (e) {
        notify('Failed to delete slide');
      }
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingHero) return;
    setIsSavingHero(true);
    try {
      const payload = {
        ...currentHeroSlide,
        is_active: 1
      };

      if (currentHeroSlide.id_exists) {
        await apiService.put(`/hero_slides/${currentHeroSlide.id}`, payload);
      } else {
        // hero_slides uses an auto-increment id assigned by the server.
        await apiService.post('/hero_slides', payload);
      }

      fetchData();
      setIsEditingHero(false);
      setCurrentHeroSlide(null);
    } catch (e) {
      notify('Failed to save hero slide');
    } finally {
      setIsSavingHero(false);
    }
  };

  const heroColumns = [
    { key: 'title', label: 'Slide Title' },
    { key: 'image_url', label: 'Background Image', render: (val: string) => val ? <img src={resolveImageUrl(val, '/assets/images/cover-object.png')} style={{width: 60, height: 40, borderRadius: 4, objectFit: 'cover'}} alt="img" /> : <span>No Image</span> },
    { key: 'btn_primary_text', label: 'Primary Button' },
  ];

  // --- Other Settings Handlers ---
  const handleSaveOther = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingOther || loading || aboutLoadFailed) return;
    setIsSavingOther(true);
    try {
      // Only send the fields this form edits; PUT /settings leaves every other key untouched.
      await apiService.put('/settings', {
        about_subtitle: settings.about_subtitle ?? '',
        about_title: settings.about_title ?? '',
        about_description: settings.about_description ?? '',
      });

      for (const fact of funFacts) {
        if (fact.id) {
          await apiService.put(`/fun_facts/${fact.id}`, fact);
        }
      }
      notify('About Us & Fun Facts saved successfully!');
    } catch (err) {
      console.error(err);
      notify('Failed to save data.');
    } finally {
      setIsSavingOther(false);
    }
  };

  const handleFactChange = (index: number, field: string, value: any) => {
    const updated = [...funFacts];
    updated[index][field] = value;
    setFunFacts(updated);
  };

  // --- Homepage Services Handlers ---
  const handleAddService = (serviceId: string) => {
    if (featuredServices.length >= 3) {
      notify('Maximum of 3 services can be featured on the homepage.');
      return;
    }
    if (featuredServices.find(s => s.id === serviceId)) return;
    const s = allServices.find(s => s.id === serviceId);
    if (s) setFeaturedServices([...featuredServices, s]);
  };

  const handleRemoveService = (serviceId: string) => {
    setFeaturedServices(featuredServices.filter(s => s.id !== serviceId));
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    const newFeatured = [...featuredServices];
    if (direction === 'up' && index > 0) {
      [newFeatured[index - 1], newFeatured[index]] = [newFeatured[index], newFeatured[index - 1]];
    } else if (direction === 'down' && index < newFeatured.length - 1) {
      [newFeatured[index + 1], newFeatured[index]] = [newFeatured[index], newFeatured[index + 1]];
    }
    setFeaturedServices(newFeatured);
  };

  const handleSaveServices = async () => {
    if (isSavingServices || loading || servicesLoadFailed) return;
    if (featuredServices.length > 3) {
      notify('Maximum of 3 services can be featured.');
      return;
    }
    setIsSavingServices(true);
    try {
      await apiService.put('/homepage_services', { serviceIds: featuredServices.map(s => s.id) });
      notify('Homepage Services saved successfully!');
    } catch (err) {
      notify('Failed to save homepage services.');
    } finally {
      setIsSavingServices(false);
    }
  };

  // --- Homepage Courses Handlers ---
  const handleAddCourse = (courseId: string) => {
    if (featuredCourses.length >= 3) {
      notify('Maximum of 3 courses can be featured on the homepage.');
      return;
    }
    if (featuredCourses.find(c => c.id === courseId)) return;
    const c = allCourses.find(c => c.id === courseId);
    if (c) setFeaturedCourses([...featuredCourses, c]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setFeaturedCourses(featuredCourses.filter(c => c.id !== courseId));
  };

  const handleMoveCourse = (index: number, direction: 'up' | 'down') => {
    const newFeatured = [...featuredCourses];
    if (direction === 'up' && index > 0) {
      [newFeatured[index - 1], newFeatured[index]] = [newFeatured[index], newFeatured[index - 1]];
    } else if (direction === 'down' && index < newFeatured.length - 1) {
      [newFeatured[index + 1], newFeatured[index]] = [newFeatured[index], newFeatured[index + 1]];
    }
    setFeaturedCourses(newFeatured);
  };

  const handleSaveCourses = async () => {
    if (isSavingCourses || loading || coursesLoadFailed) return;
    if (featuredCourses.length > 3) {
      notify('Maximum of 3 courses can be featured.');
      return;
    }
    setIsSavingCourses(true);
    try {
      await apiService.put('/homepage_courses', { courseIds: featuredCourses.map(c => c.id) });
      notify('Homepage Courses saved successfully!');
    } catch (err) {
      notify('Failed to save homepage courses.');
    } finally {
      setIsSavingCourses(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '25px', fontWeight: 700, color: '#2c3e50' }}>Homepage Content Management</h2>

      {!loading && loadErrors.length > 0 && (
        <div style={{ marginBottom: '25px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontWeight: 500 }}>
          <span>
            <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            Failed to load {loadErrors.map((key) => LOAD_LABELS[key]).join(', ')}. Saving the affected sections is disabled so existing data isn&apos;t overwritten.
          </span>
          <AdminButton type="button" variant="secondary" onClick={fetchData}>
            <i className="fa fa-refresh" style={{ marginRight: '6px' }}></i> Retry
          </AdminButton>
        </div>
      )}

      {/* --- HERO SLIDER MANAGEMENT --- */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#8D18D0' }}>Hero Slider</h4>
          {!isEditingHero && (
            <AdminButton disabled={loading || heroLoadFailed} onClick={() => { setCurrentHeroSlide({ id_exists: false }); setIsEditingHero(true); }}>
              <i className="fa fa-plus"></i> Add New Slide
            </AdminButton>
          )}
        </div>

        {!isEditingHero ? (
          <AdminTable 
            columns={heroColumns} 
            data={heroSlides} 
            onEdit={handleEditHero} 
            onDelete={handleDeleteHero} 
          />
        ) : (
          <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: '#fcfcfc' }}>
            <h5 style={{ marginBottom: '20px' }}>{currentHeroSlide?.id_exists ? 'Edit Slide' : 'Add New Slide'}</h5>
            <form onSubmit={handleSaveHero}>
              <AdminInput 
                label="Badge Text (Optional)" 
                value={currentHeroSlide?.badge_text || ''} 
                onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, badge_text: e.target.value})} 
              />
              <AdminInput 
                label="Hero Headline" 
                value={currentHeroSlide?.title || ''} 
                onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, title: e.target.value})} 
                required
              />
              <AdminTextarea 
                label="Hero Description" 
                value={currentHeroSlide?.description || ''} 
                onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, description: e.target.value})} 
              />
              <AdminImageUpload 
                label="Slide Background Image / 3D Graphic" 
                value={currentHeroSlide?.image_url || ''} 
                onChange={(url) => setCurrentHeroSlide({...currentHeroSlide, image_url: url})} 
              />
              <div style={{ display: 'flex', gap: '15px' }}>
                <AdminInput 
                  label="Primary Button Text" 
                  value={currentHeroSlide?.btn_primary_text || ''} 
                  onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, btn_primary_text: e.target.value})} 
                />
                <AdminInput 
                  label="Primary Button URL" 
                  value={currentHeroSlide?.btn_primary_url || ''} 
                  onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, btn_primary_url: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <AdminInput 
                  label="Secondary Button Text" 
                  value={currentHeroSlide?.btn_secondary_text || ''} 
                  onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, btn_secondary_text: e.target.value})} 
                />
                <AdminInput 
                  label="Secondary Button URL" 
                  value={currentHeroSlide?.btn_secondary_url || ''} 
                  onChange={(e) => setCurrentHeroSlide({...currentHeroSlide, btn_secondary_url: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <AdminButton type="submit" loading={isSavingHero}>{isSavingHero ? 'Saving...' : 'Save Slide'}</AdminButton>
                <button type="button" onClick={() => { setIsEditingHero(false); setCurrentHeroSlide(null); }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* --- HOMEPAGE SERVICES MANAGEMENT --- */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Homepage Services</h4>
        <p style={{ color: '#666', marginBottom: '20px' }}>Select exactly 3 services to feature on the homepage.</p>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h6 style={{ marginBottom: '15px' }}>Selected Featured Services (Max 3)</h6>
            {featuredServices.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>No services selected. The homepage might appear empty.</p>}
            {featuredServices.map((svc, index) => (
              <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <i className={`fa ${svc.icon || 'fa-desktop'}`} style={{ color: '#8D18D0', fontSize: '1.2rem' }}></i>
                  <div>
                    <strong>{svc.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>Order: {index + 1}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleMoveService(index, 'up')} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#ccc' : '#555' }}><i className="fa fa-arrow-up"></i></button>
                  <button type="button" onClick={() => handleMoveService(index, 'down')} disabled={index === featuredServices.length - 1} style={{ background: 'none', border: 'none', cursor: index === featuredServices.length - 1 ? 'not-allowed' : 'pointer', color: index === featuredServices.length - 1 ? '#ccc' : '#555' }}><i className="fa fa-arrow-down"></i></button>
                  <button type="button" onClick={() => handleRemoveService(svc.id)} style={{ background: '#ffebee', border: 'none', color: '#e53935', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa fa-times"></i></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <h6 style={{ marginBottom: '15px' }}>Available Services</h6>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
              {allServices.filter(s => !featuredServices.find(fs => fs.id === s.id)).map(svc => (
                <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fa ${svc.icon || 'fa-desktop'}`} style={{ color: '#aaa', fontSize: '1rem' }}></i>
                    <span>{svc.title}</span>
                  </div>
                  <button type="button" onClick={() => handleAddService(svc.id)} disabled={featuredServices.length >= 3} style={{ background: featuredServices.length >= 3 ? '#eee' : '#e0f2f1', color: featuredServices.length >= 3 ? '#999' : '#00897b', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: featuredServices.length >= 3 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>Select</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <AdminButton onClick={handleSaveServices} disabled={isSavingServices || loading || servicesLoadFailed || featuredServices.length > 3}>
            {isSavingServices ? 'Saving...' : 'Save Featured Services'}
          </AdminButton>
        </div>
      </div>

      {/* --- HOMEPAGE COURSES MANAGEMENT --- */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Homepage Courses</h4>
        <p style={{ color: '#666', marginBottom: '20px' }}>Select exactly 3 courses to feature on the homepage.</p>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h6 style={{ marginBottom: '15px' }}>Selected Featured Courses (Max 3)</h6>
            {featuredCourses.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>No courses selected. The homepage might appear empty.</p>}
            {featuredCourses.map((crs, index) => (
              <div key={crs.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={resolveImageUrl(crs.image_url, '/assets/images/cover-object.png')} alt="course" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                  <div>
                    <strong>{crs.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>Order: {index + 1}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => handleMoveCourse(index, 'up')} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#ccc' : '#555' }}><i className="fa fa-arrow-up"></i></button>
                  <button type="button" onClick={() => handleMoveCourse(index, 'down')} disabled={index === featuredCourses.length - 1} style={{ background: 'none', border: 'none', cursor: index === featuredCourses.length - 1 ? 'not-allowed' : 'pointer', color: index === featuredCourses.length - 1 ? '#ccc' : '#555' }}><i className="fa fa-arrow-down"></i></button>
                  <button type="button" onClick={() => handleRemoveCourse(crs.id)} style={{ background: '#ffebee', border: 'none', color: '#e53935', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa fa-times"></i></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <h6 style={{ marginBottom: '15px' }}>Available Courses</h6>
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
              {allCourses.filter(c => !featuredCourses.find(fc => fc.id === c.id)).map(crs => (
                <div key={crs.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={resolveImageUrl(crs.image_url, '/assets/images/cover-object.png')} alt="course" style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover' }} />
                    <span>{crs.title}</span>
                  </div>
                  <button type="button" onClick={() => handleAddCourse(crs.id)} disabled={featuredCourses.length >= 3} style={{ background: featuredCourses.length >= 3 ? '#eee' : '#e0f2f1', color: featuredCourses.length >= 3 ? '#999' : '#00897b', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: featuredCourses.length >= 3 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>Select</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <AdminButton onClick={handleSaveCourses} disabled={isSavingCourses || loading || coursesLoadFailed || featuredCourses.length > 3}>
            {isSavingCourses ? 'Saving...' : 'Save Featured Courses'}
          </AdminButton>
        </div>
      </div>

      {/* --- ABOUT US & FUN FACTS MANAGEMENT --- */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSaveOther}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>About Us Section</h4>
          <AdminInput 
            label="Section Subtitle" 
            value={settings.about_subtitle || ''} 
            onChange={(e) => setSettings({...settings, about_subtitle: e.target.value})} 
          />
          <AdminInput 
            label="Section Title" 
            value={settings.about_title || ''} 
            onChange={(e) => setSettings({...settings, about_title: e.target.value})} 
          />
          <AdminTextarea 
            label="Section Description" 
            value={settings.about_description || ''} 
            onChange={(e) => setSettings({...settings, about_description: e.target.value})} 
          />
          
          <h4 style={{ margin: '30px 0 20px 0', color: '#8D18D0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Fun Facts Counters</h4>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {funFacts.map((fact, index) => (
              <div key={fact.id || index} style={{ flex: '1 1 30%' }}>
                <AdminInput 
                  label={fact.label} 
                  type="number" 
                  value={fact.target || 0} 
                  onChange={(e) => handleFactChange(index, 'target', parseInt(e.target.value))} 
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px' }}>
            <AdminButton type="submit" disabled={isSavingOther || loading || aboutLoadFailed}>
              {isSavingOther ? 'Saving...' : 'Save About Us & Facts'}
            </AdminButton>
          </div>
        </form>
      </div>

    </div>
  );
}
