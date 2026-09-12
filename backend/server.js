require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/authMiddleware');
const { UPLOAD_DIR, LEGACY_UPLOAD_DIRS } = require('./config/paths');
const { hasColumn } = require('./config/schema');
const { PUBLIC_POST_CONDITION } = require('./controllers/blogController');
const app = express();

// Behind Hostinger's proxy/CDN, so rate limits must key on the visitor's IP from X-Forwarded-For,
// not the proxy's. TRUST_PROXY accepts a hop count, true/false, or an Express trust-proxy string.
const parseTrustProxy = (value) => {
  if (value === undefined || value === '') return 1;
  if (/^\d+$/.test(value)) return Number(value);
  if (value === 'true' || value === 'false') return value === 'true';
  return value;
};
app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

// Health check endpoint for Hostinger deployment
app.get('/', (req, res) => {
  res.status(200).send('API is running successfully.');
});

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('FATAL ERROR: CORS_ORIGIN is not defined in environment variables.');
  process.exit(1);
}

// CORS_ORIGIN may list several origins separated by commas. The www and bare-domain forms of each
// domain are both allowed, so the site works whichever address a visitor uses.
const buildAllowedOrigins = (value) => {
  const origins = new Set();
  for (const entry of value.split(',')) {
    const origin = entry.trim().replace(/\/+$/, '');
    if (!origin) continue;
    origins.add(origin);
    try {
      const url = new URL(origin);
      const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname);
      if (url.hostname.includes('.') && !isIp) {
        const twin = url.hostname.startsWith('www.') ? url.hostname.slice(4) : `www.${url.hostname}`;
        origins.add(`${url.protocol}//${twin}${url.port ? `:${url.port}` : ''}`);
      }
    } catch {
      console.warn(`Ignoring malformed CORS origin: ${origin}`);
    }
  }
  return [...origins];
};

const allowedOrigins = buildAllowedOrigins(corsOrigin);
// Outside production the site runs on localhost / 127.0.0.1, and the browser treats those two
// spellings (and each port) as different origins. Allowing them in development only means signing
// in works whichever address the developer opens, without loosening anything in production.
const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const allowDevOrigins = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (allowDevOrigins && isLocalOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Allow cross-origin images
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting for auth routes (login, refresh, logout, change password).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // refreshes happen on a timer, so this ceiling is only for runaway clients
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Password guessing is limited separately and much harder: only failed sign-ins count, so
// somebody working normally is never locked out by their own successful logins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' }
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

// Static file serving for uploads. The strict policy stops an uploaded SVG from running script when
// opened directly; it doesn't affect images embedded with <img>.
const uploadStaticOptions = {
  // Uploads are saved under a name that includes a timestamp and random text, so a given address
  // always returns the same picture and replacing an image produces a new address. Browsers can
  // therefore keep these for a year instead of asking again on every page.
  maxAge: '365d',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  },
};
app.use('/uploads', express.static(UPLOAD_DIR, uploadStaticOptions));
// Images uploaded before the folder moved still live in the old place on some installations.
for (const dir of LEGACY_UPLOAD_DIRS) {
  app.use('/uploads', express.static(dir, uploadStaticOptions));
}

// Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth/login', loginLimiter);
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

// Pairs where the admin edits the first field and parts of the site read the second.
const MIRRORED_SETTINGS = [
  ['primary_email', 'contact_email'],
  ['phone_number', 'contact_phone'],
  ['office_address', 'contact_address'],
];

// Builds an update from only the fields present in the request, so a partial save never blanks the rest.
const normalizeSettingsPayload = (body = {}) => {
  const payload = {};

  for (const [field] of settingsFieldDefinitions) {
    if (body[field] === undefined) continue;

    if (field === 'social_links') {
      const socialLinks = body.social_links;
      payload[field] = Array.isArray(socialLinks) ? JSON.stringify(socialLinks) : (typeof socialLinks === 'string' ? socialLinks : '[]');
      continue;
    }

    payload[field] = body[field];
  }

  // Both names are editable on their own; only fill one in when it would otherwise be empty.
  if (payload.site_name && payload.company_name === '') {
    payload.company_name = payload.site_name;
  }

  if (payload.company_name && payload.site_name === '') {
    payload.site_name = payload.company_name;
  }

  for (const [edited, mirror] of MIRRORED_SETTINGS) {
    if (payload[edited]) {
      payload[mirror] = payload[edited];
    } else if (payload[mirror] && payload[edited] === undefined) {
      payload[edited] = payload[mirror];
    }
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

// Contact messages (only the public form is rate limited; the admin inbox isn't)
app.use('/api/contact-messages', createContactRouter({ submitLimiter: contactLimiter }));

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
], { autoId: true });
app.use('/api/team', createCRUDRouter(teamController));

// Testimonials
const testimonialsController = createCRUDController('testimonials', [
  'id', 'name', 'category', 'quote', 'image_url', 'is_approved'
], { autoId: true });
app.use('/api/testimonials', createCRUDRouter(testimonialsController));

// Hero Slides
const heroSlidesController = createCRUDController('hero_slides', [
  'id', 'badge_text', 'title', 'description', 'image_url', 'btn_primary_text', 'btn_primary_url', 'btn_secondary_text', 'btn_secondary_url', 'display_order', 'is_active'
], { autoId: true });
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
  try {
    const data = await db.query('SELECT * FROM settings WHERE id = 1');
    const settings = data[0] || {};

    try {
      settings.social_links = settings.social_links ? JSON.parse(settings.social_links) : [];
    } catch (error) {
      settings.social_links = [];
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});
app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const payload = normalizeSettingsPayload(req.body);
    const fields = Object.keys(payload);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No settings to update' });
    }

    const values = fields.map((field) => payload[field]);
    await db.query(`UPDATE settings SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = 1`, values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// SEO Redirects & Media Library
const seoRedirectsController = createCRUDController('seo_redirects', [
  'id', 'source_url', 'target_url', 'status_code'
], { autoId: true });
app.use('/api/seo/redirects', createCRUDRouter(seoRedirectsController));

const mediaLibraryController = createCRUDController('media_library', [
  'id', 'url', 'alt_text', 'title', 'caption', 'description'
], { autoId: true });
app.use('/api/media', createCRUDRouter(mediaLibraryController));

// Blog Routes
const blogCategoriesController = createCRUDController('blog_categories', [
  'id', 'name', 'slug', 'description', 'image_url', 'display_order', 'is_active'
], { autoId: true });
app.use('/api/blog/categories', createCRUDRouter(blogCategoriesController));

const blogTagsController = createCRUDController('blog_tags', [
  'id', 'name', 'slug'
], { autoId: true });
app.use('/api/blog/tags', createCRUDRouter(blogTagsController));

const COMMENT_MAX_LENGTH = 5000;

// Visitors can't comment under the company's or an admin's name.
const RESERVED_COMMENT_NAMES = new Set(['admin', 'administrator', 'author', 'staff', 'moderator', 'kn softic', 'knsoftic', 'kn softic admin', 'kn softic team']);

const isReservedCommentName = async (name) => {
  const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (RESERVED_COMMENT_NAMES.has(normalized)) return true;
  const admins = await db.query('SELECT id FROM admin_users WHERE LOWER(TRIM(full_name)) = ? LIMIT 1', [normalized]);
  return admins.length > 0;
};

// Public route for submitting comments. Replies are staff-only (see /reply below), so parent_id is ignored.
app.post('/api/blog/comments/public', blogPublicLimiter, async (req, res) => {
  try {
    const { post_id, name, email, comment } = req.body || {};

    if (!post_id || typeof name !== 'string' || typeof email !== 'string' || typeof comment !== 'string') {
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

    if (trimmedComment.length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({ error: `Comment must be ${COMMENT_MAX_LENGTH} characters or less` });
    }

    if (await isReservedCommentName(trimmedName)) {
      return res.status(400).json({ error: 'Please comment using your own name' });
    }

    const [post] = await db.query(`SELECT p.id, p.allow_comments FROM blog_posts p WHERE p.id = ? AND ${PUBLIC_POST_CONDITION}`, [post_id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!post.allow_comments) {
      return res.status(403).json({ error: 'Comments are closed for this post' });
    }

    await db.query(
      'INSERT INTO blog_comments (post_id, parent_id, name, email, comment, status) VALUES (?, ?, ?, ?, ?, ?)',
      [post_id, null, trimmedName, trimmedEmail, trimmedComment, 'approved']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Staff replies from the admin panel; these are the only replies shown with the "Author" badge.
app.post('/api/blog/comments/reply', authMiddleware, async (req, res) => {
  try {
    const { post_id, parent_id, comment } = req.body || {};
    const text = typeof comment === 'string' ? comment.trim() : '';

    if (!post_id || !parent_id || !text) {
      return res.status(400).json({ error: 'Post, parent comment and reply text are required' });
    }

    if (text.length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({ error: `Reply must be ${COMMENT_MAX_LENGTH} characters or less` });
    }

    const [parent] = await db.query('SELECT id, post_id FROM blog_comments WHERE id = ?', [parent_id]);
    if (!parent || String(parent.post_id) !== String(post_id)) {
      return res.status(400).json({ error: 'The comment you are replying to was not found on this post' });
    }

    const name = req.user?.name || 'KN Softic';
    const email = req.user?.email || '';
    const staffFlag = await hasColumn('blog_comments', 'is_staff');

    const result = staffFlag
      ? await db.query(
        'INSERT INTO blog_comments (post_id, parent_id, name, email, comment, status, is_staff) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [post_id, parent_id, name, email, text, 'approved']
      )
      : await db.query(
        'INSERT INTO blog_comments (post_id, parent_id, name, email, comment, status) VALUES (?, ?, ?, ?, ?, ?)',
        [post_id, parent_id, name, email, text, 'approved']
      );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error posting reply:', err);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// Admin-only: the full list includes commenters' email addresses.
const blogCommentsController = createCRUDController('blog_comments', [
  'id', 'post_id', 'parent_id', 'name', 'email', 'comment', 'status'
], { autoId: true });
app.use('/api/blog/comments', createCRUDRouter(blogCommentsController, { publicRead: false }));

// Public route to fetch approved comments for a post (including parent_id for threaded replies)
app.get('/api/blog/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const staffColumn = (await hasColumn('blog_comments', 'is_staff')) ? 'is_staff' : '0 AS is_staff';
    const comments = await db.query(
      `SELECT id, post_id, parent_id, name, comment, created_at, ${staffColumn} FROM blog_comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC`,
      [id]
    );
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Public route to like a post
app.post('/api/blog/posts/:id/like', blogPublicLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    // Assigning updated_at to itself keeps a like from changing the post's "Updated" date.
    const result = await db.query(
      `UPDATE blog_posts p SET p.like_count = p.like_count + 1, p.updated_at = p.updated_at WHERE p.id = ? AND ${PUBLIC_POST_CONDITION}`,
      [id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const [post] = await db.query('SELECT like_count FROM blog_posts WHERE id = ?', [id]);
    res.json({ success: true, like_count: post ? post.like_count : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blog/posts', blogRoutes);

// Unknown API routes get JSON instead of Express's HTML page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Last-resort handler: log the details, send the client a plain message.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : (err.expose && err.message) || 'Bad request' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Printed so a deployment with missing pictures can be diagnosed from the panel's log alone.
  const describe = (dir) => {
    try {
      return `${dir} (${fs.readdirSync(dir).filter((name) => !name.startsWith('.')).length} files)`;
    } catch (err) {
      return `${dir} (MISSING - uploaded images will not load)`;
    }
  };
  console.log(`Uploads served from: ${describe(UPLOAD_DIR)}`);
  for (const dir of LEGACY_UPLOAD_DIRS) {
    console.log(`Also serving older uploads from: ${describe(dir)}`);
  }
});
