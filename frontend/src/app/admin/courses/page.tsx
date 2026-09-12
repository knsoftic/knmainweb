"use client";

import { useState, useMemo } from 'react';
import { AdminTable } from '../../../components/common/admin-table';
import { AdminButton, AdminInput, AdminImageUpload } from '../../../components/common/admin-form-elements';
import { apiService } from '../../../services/api';
import { useLoadOnMount } from '../../../utils/use-load-on-mount';
import { resolveImageUrl } from '../../../utils/image-url';
import CreatableSelect from 'react-select/creatable';
import { confirmAction, notify } from '../../../components/common/admin-feedback';

// Must match how the public /courses page derives its filter classes from `course.category`.
const toCourseFilterSlug = (category: string) => category.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export default function CoursesManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Course categories live on the courses themselves (the public page builds its filter tabs from them),
  // so suggest the ones already in use instead of the unrelated service categories.
  const categoryOptions = useMemo(() => {
    const names = courses
      .map((c) => (typeof c.category === 'string' ? c.category.trim() : ''))
      .filter(Boolean);
    return Array.from(new Set(names)).sort().map((name) => ({ value: name, label: name }));
  }, [courses]);

  const loadCourses = async () => {
    const data = await apiService.get('/courses');
    return data || [];
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      setCourses(await loadCourses());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useLoadOnMount(loadCourses, setCourses, { onSettled: () => setLoading(false) });

  const columns = [
    { key: 'image_url', label: 'Image', render: (val: string) => <img src={resolveImageUrl(val, '/assets/images/cover-object.png')} alt="Course" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> },
    { key: 'title', label: 'Course Title' },
    { key: 'category', label: 'Category' },
    { key: 'duration', label: 'Duration' },
  ];

  const handleEdit = (item: any) => {
    setCurrentCourse({ ...item, id_exists: true });
    setIsEditing(true);
  };

  const handleDelete = async (item: any) => {
    if (await confirmAction(`Are you sure you want to delete ${item.title}?`)) {
      try {
        await apiService.delete(`/courses/${item.id}`);
        setCourses(courses.filter(c => c.id !== item.id));
      } catch (e) {
        notify('Failed to delete');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const finalCategoryName = (currentCourse.category || '').trim() || 'Course';

      const payload = {
        ...currentCourse,
        category: finalCategoryName,
        filter_slug: toCourseFilterSlug(finalCategoryName),
        image_url: currentCourse.image_url || '',
        is_active: 1
      };

      if (currentCourse.id_exists) {
        await apiService.put(`/courses/${currentCourse.id}`, payload);
      } else {
        payload.id = currentCourse.id || currentCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await apiService.post('/courses', payload);
      }
      fetchCourses();
      setIsEditing(false);
      setCurrentCourse(null);
    } catch (e) {
      notify('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Courses Management</h2>
        {!isEditing && (
          <AdminButton onClick={() => { setCurrentCourse({ id_exists: false }); setIsEditing(true); }}>
            <i className="fa fa-plus"></i> Add New Course
          </AdminButton>
        )}
      </div>

      {isEditing ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#8D18D0' }}>{currentCourse?.id_exists ? 'Edit Course' : 'Add New Course'}</h4>
          <form onSubmit={handleSave}>
            <AdminInput 
              label="Course Title" 
              value={currentCourse?.title || ''} 
              onChange={(e) => setCurrentCourse({...currentCourse, title: e.target.value})} 
              required
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50' }}>
                  Course Category <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <CreatableSelect
                  isClearable
                  options={categoryOptions}
                  value={
                    currentCourse?.category
                      ? { value: currentCourse.category, label: currentCourse.category }
                      : null
                  }
                  onChange={(newValue: any) => {
                    setCurrentCourse({
                      ...currentCourse,
                      category: newValue?.value || ''
                    });
                  }}
                  styles={{
                    control: (base) => ({ ...base, borderColor: '#e1e5ea', padding: '2px', borderRadius: '8px' })
                  }}
                  placeholder="Search or type to create a new category..."
                />
              </div>
              <div style={{ flex: 1 }}>
                <AdminInput 
                label="Duration" 
                value={currentCourse?.duration || ''} 
                onChange={(e) => setCurrentCourse({...currentCourse, duration: e.target.value})} 
                placeholder="e.g. 3 Months"
                required
              />
              </div>
            </div>
            <AdminImageUpload 
              label="Course Thumbnail Image" 
              value={currentCourse?.image_url || ''} 
              onChange={(url) => setCurrentCourse({...currentCourse, image_url: url})} 
            />
            <AdminInput 
              label="Enrollment URL" 
              value={currentCourse?.enroll_url || ''} 
              onChange={(e) => setCurrentCourse({...currentCourse, enroll_url: e.target.value})} 
              required
            />
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <AdminButton type="submit" loading={saving}>{saving ? 'Saving...' : 'Save Course'}</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AdminButton>
            </div>
          </form>
        </div>
      ) : loading ? (
        <p>Loading courses...</p>
      ) : (
        <AdminTable 
          columns={columns} 
          data={courses.map(c => ({ ...c, id_exists: true }))} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
