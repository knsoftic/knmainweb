const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/authMiddleware');
const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('FATAL ERROR: CORS_ORIGIN is not defined in environment variables.');
  process.exit(1);
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Allow cross-origin images
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for login
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Rate Limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 contact messages per hour
  message: { error: 'Too many messages sent from this IP, please try again later' }
});

// Rate Limiting for public blog interactions (comments, likes)
const blogPublicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per 15 minutes
  message: { error: 'Too many requests from this IP, please try again later' }
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authLimiter, authRoutes);

// Media Upload
const mediaRoutes = require('./routes/mediaRoutes');
app.use('/api', mediaRoutes);

// Dashboard Stats
const db = require('./config/db');

const settingsFieldDefinitions = [
  ['site_name', "KN Softic"],
  ['website_tagline', 'Software House & IT Institute'],
  ['company_name', 'KN Softic'],
  ['company_description', 'We build high-performance digital products, websites, mobile apps, and modern learning experiences.'],
  ['about_subtitle', 'About Us'],
  ['about_title', 'What make us the best?'],
  ['about_description', 'We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity.'],
  ['logo_url', null],
  ['favicon_url', null],
  ['copyright_text', 'Copyright © 2026 KN Softic. All rights reserved.'],
  ['footer_text', 'Software House & IT Institute'],
  ['company_address', 'KN Softic, Faisalabad, Pakistan'],
  ['working_hours', 'Mon – Sat: 9:00 AM – 7:00 PM'],
  ['primary_email', 'info@knsoftic.com'],
  ['secondary_email', 'support@knsoftic.com'],
  ['support_email', 'support@knsoftic.com'],
  ['sales_email', 'sales@knsoftic.com'],
  ['phone_number', '+92 345 2470250'],
  ['whatsapp_number', '+92 345 2470250'],
  ['office_address', 'KN Softic, Faisalabad, Pakistan'],
  ['google_maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108922.38793082573!2d72.99617277637845!3d31.439055811776595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392242a895a55ca9%3A0xdec58f88932671c6!2sFaisalabad%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1717360000000!5m2!1sen!2s'],
  ['business_name', 'KN Softic'],
  ['registration_number', ''],
  ['vat_number', ''],
  ['customer_care_number', '+92 345 2470250'],
  ['light_logo_url', null],
  ['dark_logo_url', null],
  ['mobile_logo_url', null],
  ['default_banner_url', '/assets/images/cover-object.png'],
  ['default_og_image_url', '/assets/images/cover-object.png'],
  ['social_links', '[]'],
  ['contact_email', 'info@knsoftic.com'],
  ['contact_phone', '+92 345 2470250'],
  ['contact_address', 'KN Softic, Faisalabad, Pakistan'],
  ['facebook_url', ''],
  ['instagram_url', ''],
  ['linkedin_url', ''],
  ['twitter_url', ''],
  ['youtube_url', ''],
  ['tiktok_url', ''],
  ['github_url', ''],
  ['behance_url', ''],
  ['dribbble_url', '']
];

const settingsFields = settingsFieldDefinitions.map(([field]) => field);

const normalizeSettingsPayload = (body) => {
  const payload = {};

  for (const [field] of settingsFieldDefinitions) {
    if (field === 'social_links') {
      const socialLinks = body.social_links;
      payload[field] = Array.isArray(socialLinks) ? JSON.stringify(socialLinks) : (typeof socialLinks === 'string' ? socialLinks : '[]');
      continue;
    }

    payload[field] = body[field] !== undefined ? body[field] : null;
  }

  if (payload.site_name && !payload.company_name) {
    payload.company_name = payload.site_name;
  }

  if (payload.company_name && !payload.site_name) {
    payload.site_name = payload.company_name;
  }

  if (payload.primary_email && !payload.contact_email) {
    payload.contact_email = payload.primary_email;
  }

  if (payload.contact_email && !payload.primary_email) {
    payload.primary_email = payload.contact_email;
  }

  if (payload.phone_number && !payload.contact_phone) {
    payload.contact_phone = payload.phone_number;
  }

  if (payload.contact_phone && !payload.phone_number) {
    payload.phone_number = payload.contact_phone;
  }

  if (payload.office_address && !payload.contact_address) {
    payload.contact_address = payload.office_address;
  }

  if (payload.contact_address && !payload.office_address) {
    payload.office_address = payload.contact_address;
  }

  return payload;
};

app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const [services] = await db.query('SELECT COUNT(*) as count FROM services');
    const [courses] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [projects] = await db.query('SELECT COUNT(*) as count FROM projects');
    const [team] = await db.query('SELECT COUNT(*) as count FROM team_members');
    const [testimonials] = await db.query('SELECT COUNT(*) as count FROM testimonials');
    const [contactMessages] = await db.query('SELECT COUNT(*) as count FROM contact_messages');

    res.json({
      services: services.count || 0,
      courses: courses.count || 0,
      projects: projects.count || 0,
      team: team.count || 0,
      testimonials: testimonials.count || 0,
      contact_messages: contactMessages.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// Generic CRUD controllers and routes
const { createCRUDController } = require('./controllers/crudController');
const { createCRUDRouter } = require('./routes/crudRoutes');
const { createContactRouter } = require('./routes/contactRoutes');

// SEO
const seoRoutes = require('./routes/seoRoutes');
app.use('/api/seo', seoRoutes);

// Contact messages
app.use('/api/contact-messages', contactLimiter, createContactRouter());

// Service Categories
const serviceCategoriesController = createCRUDController('service_categories', [
  'id', 'name', 'filter_slug'
]);
app.use('/api/service-categories', createCRUDRouter(serviceCategoriesController));

// Services
const servicesController = createCRUDController('services', [
  'id', 'category_id', 'icon', 'image_url', 'title', 'page_title', 'description', 'home_description', 'display_order', 'is_active', 'features'
]);
app.use('/api/services', createCRUDRouter(servicesController));

// Homepage Services
const homepageServicesRoutes = require('./routes/homepageServicesRoutes');
const homepageCoursesRoutes = require('./routes/homepageCoursesRoutes');

app.use('/api/homepage_services', homepageServicesRoutes);
app.use('/api/homepage_courses', homepageCoursesRoutes);

// Courses
const coursesController = createCRUDController('courses', [
  'id', 'filter_slug', 'category', 'image_url', 'title', 'duration', 'enroll_url', 'display_order', 'is_active'
]);
app.use('/api/courses', createCRUDRouter(coursesController));

// Projects
const projectsController = createCRUDController('projects', [
  'id',
  'filter_slug',
  'icon',
  'image_url',
  'title',
  'description',
  'category',
  'badge',
  'label',
  'client_name',
  'technologies',
  'features',
  'primary_link_label',
  'primary_link_url',
  'secondary_link_label',
  'secondary_link_url',
  'status',
  'display_order'
]);
app.use('/api/projects', createCRUDRouter(projectsController));

// Team
const teamController = createCRUDController('team_members', [
  'id', 'name', 'category', 'image_url', 'facebook_url', 'twitter_url', 'linkedin_url', 'display_order', 'is_active'
]);
app.use('/api/team', createCRUDRouter(teamController));

// Testimonials
const testimonialsController = createCRUDController('testimonials', [
  'id', 'name', 'category', 'quote', 'image_url', 'is_approved'
]);
app.use('/api/testimonials', createCRUDRouter(testimonialsController));

// Hero Slides
const heroSlidesController = createCRUDController('hero_slides', [
  'id', 'badge_text', 'title', 'description', 'image_url', 'btn_primary_text', 'btn_primary_url', 'btn_secondary_text', 'btn_secondary_url', 'display_order', 'is_active'
]);
app.use('/api/hero_slides', createCRUDRouter(heroSlidesController));

// Fun Facts
const funFactsController = createCRUDController('fun_facts', [
  'id', 'label', 'target', 'display_order'
]);
app.use('/api/fun_facts', createCRUDRouter(funFactsController));

// Homepage Cards
const homepageCardsController = createCRUDController('homepage_cards', [
  'id', 'title', 'description', 'image_url', 'read_more_url', 'display_order', 'is_active'
]);
app.use('/api/homepage_cards', createCRUDRouter(homepageCardsController));

// Settings (Special case, only UPDATE and GET)

app.get('/api/settings', async (req, res) => {
  const data = await db.query('SELECT * FROM settings WHERE id = 1');
  const settings = data[0] || {};

  try {
    settings.social_links = settings.social_links ? JSON.parse(settings.social_links) : [];
  } catch (error) {
    settings.social_links = [];
  }

  res.json(settings);
});
app.put('/api/settings', authMiddleware, async (req, res) => {
  const payload = normalizeSettingsPayload(req.body);
  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  await db.query(`UPDATE settings SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = 1`, values);
  res.json({ success: true });
});

// SEO Redirects & Media Library
const seoRedirectsController = createCRUDController('seo_redirects', [
  'id', 'source_url', 'target_url', 'status_code'
]);
app.use('/api/seo/redirects', createCRUDRouter(seoRedirectsController));

const mediaLibraryController = createCRUDController('media_library', [
  'id', 'url', 'alt_text', 'title', 'caption', 'description'
]);
app.use('/api/media', createCRUDRouter(mediaLibraryController));

// Blog Routes
const blogCategoriesController = createCRUDController('blog_categories', [
  'id', 'name', 'slug', 'description', 'image_url', 'display_order', 'is_active'
]);
app.use('/api/blog/categories', createCRUDRouter(blogCategoriesController));

const blogTagsController = createCRUDController('blog_tags', [
  'id', 'name', 'slug'
]);
app.use('/api/blog/tags', createCRUDRouter(blogTagsController));

const blogCommentsController = createCRUDController('blog_comments', [
  'id', 'post_id', 'parent_id', 'name', 'email', 'comment', 'status'
]);
app.use('/api/blog/comments', createCRUDRouter(blogCommentsController));

// Public route for submitting comments (supports parent_id for replies)
app.post('/api/blog/comments/public', blogPublicLimiter, async (req, res) => {
  try {
    const { post_id, parent_id, name, email, comment } = req.body;

    if (!post_id || !name || !email || !comment) {
      return res.status(400).json({ error: 'All fields (Name, Email, Comment) are required' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || !trimmedEmail || !trimmedComment) {
      return res.status(400).json({ error: 'Fields cannot be empty' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (trimmedName.length > 150) {
      return res.status(400).json({ error: 'Name must be 150 characters or less' });
    }

    if (trimmedEmail.length > 150) {
      return res.status(400).json({ error: 'Email must be 150 characters or less' });
    }

    await db.query(
      'INSERT INTO blog_comments (post_id, parent_id, name, email, comment, status) VALUES (?, ?, ?, ?, ?, ?)',
      [post_id, parent_id || null, trimmedName, trimmedEmail, trimmedComment, 'approved']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Public route to fetch comments for a post (including parent_id for threaded replies)
app.get('/api/blog/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await db.query(
      'SELECT id, post_id, parent_id, name, comment, created_at FROM blog_comments WHERE post_id = ? ORDER BY created_at ASC',
      [id]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Public route to like a post
app.post('/api/blog/posts/:id/like', blogPublicLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE blog_posts SET like_count = like_count + 1 WHERE id = ?', [id]);
    const [post] = await db.query('SELECT like_count FROM blog_posts WHERE id = ?', [id]);
    res.json({ success: true, like_count: post ? post.like_count : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blog/posts', blogRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
