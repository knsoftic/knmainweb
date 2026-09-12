const db = require('./config/db');

const tableExists = async (tableName) => {
  const rows = await db.query(
    `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0]?.count > 0;
};

const columnExists = async (tableName, columnName) => {
  const rows = await db.query(
    `SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  return rows[0]?.count > 0;
};

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
const dbString = (value) => `'${String(value).replace(/'/g, "''")}'`;

const ensureContactStorage = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(150) NOT NULL,
      email varchar(150) NOT NULL,
      phone varchar(50) DEFAULT NULL,
      subject varchar(255) NOT NULL,
      message text NOT NULL,
      status enum('new', 'read', 'replied', 'closed') NOT NULL DEFAULT 'new',
      admin_notes text DEFAULT NULL,
      created_at timestamp NULL DEFAULT current_timestamp(),
      updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY status (status),
      KEY created_at (created_at),
      KEY email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('contact_messages', 'phone'))) {
    await db.query(`ALTER TABLE contact_messages ADD COLUMN phone varchar(50) DEFAULT NULL AFTER email`);
  }

  if (!(await columnExists('contact_messages', 'subject'))) {
    await db.query(`ALTER TABLE contact_messages ADD COLUMN subject varchar(255) NOT NULL DEFAULT '' AFTER phone`);
    await db.query(`UPDATE contact_messages SET subject = 'Website Contact' WHERE subject = ''`);
  }

  await db.query(`ALTER TABLE contact_messages MODIFY COLUMN status enum('new', 'read', 'replied', 'closed') NOT NULL DEFAULT 'new'`);
};

const ensureSettingsStorage = async () => {
  for (const [field, defaultValue] of settingsFieldDefinitions) {
    const exists = await columnExists('settings', field);
    if (!exists) {
      const columnType = field === 'working_hours' ? 'varchar(255)' : field.includes('description') || field.includes('text') || field.includes('address') || field === 'social_links' ? 'longtext' : 'varchar(500)';
      const defaultSql = columnType === 'longtext' || defaultValue === null || defaultValue === '' ? '' : ` DEFAULT ${dbString(defaultValue)}`;
      await db.query(`ALTER TABLE settings ADD COLUMN ${field} ${columnType} NULL${defaultSql}`);
    }
  }

  const currentSettings = await db.query('SELECT * FROM settings WHERE id = 1');
  if (!currentSettings || currentSettings.length === 0) {
    const insertColumns = ['id', ...settingsFields];
    const insertValues = [1, ...settingsFieldDefinitions.map(([, defaultValue]) => defaultValue)];
    const placeholders = insertColumns.map(() => '?').join(', ');
    await db.query(`INSERT INTO settings (${insertColumns.join(', ')}) VALUES (${placeholders})`, insertValues);
    return;
  }

  const existing = currentSettings[0] || {};
  for (const [field, defaultValue] of settingsFieldDefinitions) {
    if (existing[field] === undefined || existing[field] === null || existing[field] === '') {
      if (defaultValue !== null && defaultValue !== '') {
        await db.query(`UPDATE settings SET ${field} = ? WHERE id = 1`, [defaultValue]);
      }
    }
  }
};

const ensureProjectStorage = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS service_categories (
      id varchar(100) NOT NULL PRIMARY KEY,
      name varchar(255) NOT NULL,
      filter_slug varchar(100) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id varchar(100) NOT NULL,
      filter_slug varchar(100) NOT NULL,
      icon varchar(50) DEFAULT NULL,
      image_url varchar(500) DEFAULT NULL,
      title varchar(255) NOT NULL,
      description text NOT NULL,
      category varchar(100) NOT NULL,
      badge varchar(100) DEFAULT NULL,
      label varchar(100) DEFAULT NULL,
      client_name varchar(255) DEFAULT NULL,
      technologies text DEFAULT NULL,
      features text DEFAULT NULL,
      primary_link_label varchar(100) DEFAULT NULL,
      primary_link_url varchar(500) DEFAULT NULL,
      secondary_link_label varchar(100) DEFAULT NULL,
      secondary_link_url varchar(500) DEFAULT NULL,
      status enum('active', 'inactive', 'draft') NOT NULL DEFAULT 'active',
      display_order int(11) NOT NULL DEFAULT 0,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY filter_slug (filter_slug),
      KEY category (category),
      KEY status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const portfolioExists = await tableExists('portfolio_projects');
  const productsExists = await tableExists('products');

  if (portfolioExists) {
    await db.query(`
      INSERT IGNORE INTO projects (
        id, filter_slug, icon, title, description, category, badge, label, client_name, display_order, status
      )
      SELECT
        id, filter_slug, icon, title, description, COALESCE(NULLIF(label, ''), 'Portfolio'), label, label, client_name, display_order, CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END
      FROM portfolio_projects
    `);
  }

  if (productsExists) {
    await db.query(`
      INSERT IGNORE INTO projects (
        id, filter_slug, icon, title, description, category, badge, display_order, status
      )
      SELECT
        id, filter_slug, icon, title, description, category, badge, display_order, CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END
      FROM products
    `);
  }
};

const ensureBlogStorage = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      slug varchar(255) NOT NULL,
      description text DEFAULT NULL,
      image_url varchar(500) DEFAULT NULL,
      display_order int(11) NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS blog_tags (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(100) NOT NULL,
      slug varchar(100) NOT NULL,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id int(11) NOT NULL AUTO_INCREMENT,
      title varchar(255) NOT NULL,
      slug varchar(255) NOT NULL,
      excerpt text DEFAULT NULL,
      content longtext NOT NULL,
      featured_image varchar(500) DEFAULT NULL,
      gallery_images longtext DEFAULT NULL,
      author varchar(255) DEFAULT NULL,
      category_id int(11) DEFAULT NULL,
      tags_json text DEFAULT NULL,
      status enum('draft', 'published', 'scheduled') NOT NULL DEFAULT 'draft',
      published_at datetime DEFAULT NULL,
      reading_time int(11) DEFAULT NULL,
      is_featured boolean NOT NULL DEFAULT false,
      allow_comments boolean NOT NULL DEFAULT true,
      meta_title varchar(255) DEFAULT NULL,
      meta_description text DEFAULT NULL,
      meta_keywords text DEFAULT NULL,
      canonical_url varchar(500) DEFAULT NULL,
      og_title varchar(255) DEFAULT NULL,
      og_description text DEFAULT NULL,
      og_image varchar(500) DEFAULT NULL,
      twitter_card varchar(100) DEFAULT NULL,
      display_order int(11) NOT NULL DEFAULT 0,
      view_count int(11) NOT NULL DEFAULT 0,
      created_at timestamp NULL DEFAULT current_timestamp(),
      updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (slug),
      KEY (category_id),
      KEY (status),
      KEY (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('blog_posts', 'like_count'))) {
    await db.query(`ALTER TABLE blog_posts ADD COLUMN like_count int(11) NOT NULL DEFAULT 0 AFTER view_count`);
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS blog_comments (
      id int(11) NOT NULL AUTO_INCREMENT,
      post_id int(11) NOT NULL,
      parent_id int(11) DEFAULT NULL,
      name varchar(150) NOT NULL,
      email varchar(150) NOT NULL,
      comment text NOT NULL,
      status enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY (post_id),
      KEY (parent_id),
      KEY (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('blog_posts', 'og_title'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN og_title varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('blog_posts', 'og_description'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN og_description text DEFAULT NULL`); }
  if (!(await columnExists('blog_posts', 'twitter_title'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN twitter_title varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('blog_posts', 'twitter_description'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN twitter_description text DEFAULT NULL`); }
  if (!(await columnExists('blog_posts', 'twitter_image'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN twitter_image varchar(500) DEFAULT NULL`); }
  if (!(await columnExists('blog_posts', 'schema_markup'))) { await db.query(`ALTER TABLE blog_posts ADD COLUMN schema_markup text DEFAULT NULL`); }
};

const ensureSeoStorage = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS seo_global (
      id int(11) NOT NULL AUTO_INCREMENT,
      website_title varchar(255) DEFAULT NULL,
      meta_title varchar(255) DEFAULT NULL,
      meta_description text DEFAULT NULL,
      keywords text DEFAULT NULL,
      logo_url varchar(500) DEFAULT NULL,
      favicon_url varchar(500) DEFAULT NULL,
      default_og_image varchar(500) DEFAULT NULL,
      site_url varchar(255) DEFAULT NULL,
      google_analytics_id varchar(100) DEFAULT NULL,
      search_console_code varchar(255) DEFAULT NULL,
      robots_txt_content text DEFAULT NULL,
      sitemap_status boolean NOT NULL DEFAULT true,
      schema_organization text DEFAULT NULL,
      schema_local_business text DEFAULT NULL,
      schema_website text DEFAULT NULL,
      created_at timestamp NULL DEFAULT current_timestamp(),
      updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const currentGlobal = await db.query('SELECT id FROM seo_global WHERE id = 1');
  if (!currentGlobal || currentGlobal.length === 0) {
    await db.query('INSERT INTO seo_global (id, website_title, sitemap_status) VALUES (1, "KN Softic", 1)');
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS seo_pages (
      id int(11) NOT NULL AUTO_INCREMENT,
      page_slug varchar(255) NOT NULL,
      seo_title varchar(255) DEFAULT NULL,
      meta_description text DEFAULT NULL,
      keywords text DEFAULT NULL,
      canonical_url varchar(500) DEFAULT NULL,
      is_index boolean NOT NULL DEFAULT true,
      is_follow boolean NOT NULL DEFAULT true,
      og_title varchar(255) DEFAULT NULL,
      og_description text DEFAULT NULL,
      og_image varchar(500) DEFAULT NULL,
      twitter_title varchar(255) DEFAULT NULL,
      twitter_description text DEFAULT NULL,
      twitter_image varchar(500) DEFAULT NULL,
      h1_heading varchar(255) DEFAULT NULL,
      h2_heading varchar(255) DEFAULT NULL,
      h3_heading varchar(255) DEFAULT NULL,
      h4_heading varchar(255) DEFAULT NULL,
      h5_heading varchar(255) DEFAULT NULL,
      h6_heading varchar(255) DEFAULT NULL,
      created_at timestamp NULL DEFAULT current_timestamp(),
      updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (page_slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS seo_redirects (
      id int(11) NOT NULL AUTO_INCREMENT,
      source_url varchar(500) NOT NULL,
      target_url varchar(500) NOT NULL,
      status_code int(11) NOT NULL DEFAULT 301,
      created_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (source_url)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS media_library (
      id int(11) NOT NULL AUTO_INCREMENT,
      url varchar(500) NOT NULL,
      alt_text varchar(255) DEFAULT NULL,
      title varchar(255) DEFAULT NULL,
      caption text DEFAULT NULL,
      description text DEFAULT NULL,
      uploaded_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY (url)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('seo_global', 'gtm_id'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN gtm_id varchar(100) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'bing_verification'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN bing_verification varchar(100) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'facebook_pixel_id'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN facebook_pixel_id varchar(100) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'clarity_id'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN clarity_id varchar(100) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'author'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN author varchar(100) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'language'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN language varchar(20) DEFAULT NULL`); }
  if (!(await columnExists('seo_global', 'timezone'))) { await db.query(`ALTER TABLE seo_global ADD COLUMN timezone varchar(100) DEFAULT NULL`); }
  
  if (!(await columnExists('seo_pages', 'schema_markup'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN schema_markup text DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h1_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h1_heading varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h2_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h2_heading varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h3_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h3_heading varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h4_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h4_heading varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h5_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h5_heading varchar(255) DEFAULT NULL`); }
  if (!(await columnExists('seo_pages', 'h6_heading'))) { await db.query(`ALTER TABLE seo_pages ADD COLUMN h6_heading varchar(255) DEFAULT NULL`); }

  if (await columnExists('seo_pages', 'custom_headings')) { await db.query(`ALTER TABLE seo_pages DROP COLUMN custom_headings`); }
};

const ensureHomepageTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS homepage_featured_services (
      id int(11) NOT NULL AUTO_INCREMENT,
      service_id varchar(100) NOT NULL,
      display_order int(11) NOT NULL DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS homepage_featured_courses (
      id int(11) NOT NULL AUTO_INCREMENT,
      course_id varchar(100) NOT NULL,
      display_order int(11) NOT NULL DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

const ensureCommentStaffFlag = async () => {
  // Older databases (and the packaged schema before this fix) had no parent_id, which the
  // replies below and the blog API both rely on.
  if (!(await columnExists('blog_comments', 'parent_id'))) {
    await db.query('ALTER TABLE blog_comments ADD COLUMN parent_id int(11) DEFAULT NULL AFTER post_id');
    await db.query('ALTER TABLE blog_comments ADD KEY (parent_id)');
  }

  if (await columnExists('blog_comments', 'is_staff')) return;

  // Only replies flagged here get the "Author" badge; visitors can no longer post official-looking replies.
  await db.query(`ALTER TABLE blog_comments ADD COLUMN is_staff tinyint(1) NOT NULL DEFAULT 0 AFTER status`);

  // Replies already written from the admin panel used an admin account's email; keep their badge.
  if (await tableExists('admin_users')) {
    const admins = await db.query('SELECT email FROM admin_users');
    const adminEmails = new Set(admins.map((a) => String(a.email || '').trim().toLowerCase()).filter(Boolean));
    const replies = await db.query('SELECT id, email FROM blog_comments WHERE parent_id IS NOT NULL');
    const staffIds = replies.filter((r) => adminEmails.has(String(r.email || '').trim().toLowerCase())).map((r) => r.id);
    for (const id of staffIds) {
      await db.query('UPDATE blog_comments SET is_staff = 1 WHERE id = ?', [id]);
    }
    console.log(`Marked ${staffIds.length} existing admin repl${staffIds.length === 1 ? 'y' : 'ies'} as staff.`);
  }
};

const ensureTokenVersion = async () => {
  // Bumped on password change so older sessions stop working.
  if ((await tableExists('admin_users')) && !(await columnExists('admin_users', 'token_version'))) {
    await db.query(`ALTER TABLE admin_users ADD COLUMN token_version int(11) NOT NULL DEFAULT 0`);
  }
};

const trimBlogSlugs = async () => {
  // A slug saved with surrounding whitespace produced URLs like /blog/%20my-post.
  const posts = await db.query('SELECT id, slug FROM blog_posts');
  for (const post of posts) {
    const current = String(post.slug || '');
    const trimmed = current.trim();
    if (!trimmed || trimmed === current) continue;

    const taken = await db.query('SELECT id FROM blog_posts WHERE slug = ? AND id <> ?', [trimmed, post.id]);
    const slug = taken.length > 0 ? `${trimmed}-${post.id}` : trimmed;
    await db.query('UPDATE blog_posts SET slug = ?, updated_at = updated_at WHERE id = ?', [slug, post.id]);
    console.log(`Fixed blog slug for post ${post.id}: "${current}" -> "${slug}"`);
  }
};

const repairHeroSlideIds = async () => {
  if (!(await tableExists('hero_slides'))) return;

  // Slides created with a millisecond timestamp as their id were clamped to the INT maximum,
  // which makes every later insert collide with that row.
  const INT_MAX = 2147483647;
  const overflow = await db.query('SELECT id FROM hero_slides WHERE id = ?', [INT_MAX]);
  if (overflow.length > 0) {
    const [{ maxId }] = await db.query('SELECT COALESCE(MAX(id), 0) AS maxId FROM hero_slides WHERE id < ?', [INT_MAX]);
    await db.query('UPDATE hero_slides SET id = ? WHERE id = ?', [Number(maxId) + 1, INT_MAX]);
    console.log(`Renumbered hero slide ${INT_MAX} to ${Number(maxId) + 1}.`);
  }

  const [{ counter }] = await db.query(
    `SELECT AUTO_INCREMENT AS counter FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'hero_slides'`
  );
  if (overflow.length > 0 || Number(counter) >= INT_MAX) {
    const [{ nextId }] = await db.query('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM hero_slides');
    await db.query(`ALTER TABLE hero_slides AUTO_INCREMENT = ${Number(nextId)}`);
  }
};

// One-time data changes are recorded here so a later `npm run migrate` never re-applies them
// (e.g. after an admin deliberately changed the data back).
const runOnce = async (name, work) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      name varchar(100) NOT NULL,
      ran_at timestamp NULL DEFAULT current_timestamp(),
      PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const done = await db.query('SELECT name FROM app_migrations WHERE name = ?', [name]);
  if (done.length > 0) return;
  await work();
  await db.query('INSERT INTO app_migrations (name) VALUES (?)', [name]);
};

const hideTemplateHomepageCards = async () => {
  if (!(await tableExists('homepage_cards'))) return;

  // The homepage didn't render these cards before, so the three template cards were never public.
  // Hide them if still untouched rather than publishing placeholder text; re-enable in Admin → Homepage Cards.
  const result = await db.query(`
    UPDATE homepage_cards SET is_active = 0
    WHERE is_active = 1
      AND id IN ('card1', 'card2', 'card3')
      AND title IN ('Expert Craftsmanship', 'Cloud Infrastructure', 'Strategic Growth')
      AND (read_more_url IS NULL OR read_more_url IN ('', '#'))
  `);
  if (result.affectedRows) {
    console.log(`Hid ${result.affectedRows} template homepage card(s); edit and re-enable them in Admin → Homepage Cards.`);
  }
};

// Fields the admin forms treat as optional. Under strict SQL mode (the MySQL/MariaDB default), a NOT NULL
// column with no default makes any insert that leaves it out fail with "doesn't have a default value".
const OPTIONAL_COLUMNS = {
  hero_slides: ['badge_text', 'description', 'image_url'],
  homepage_cards: ['description', 'image_url'],
  services: ['icon', 'image_url', 'page_title', 'home_description'],
  courses: ['image_url', 'duration', 'enroll_url'],
  team_members: ['image_url', 'category'],
  testimonials: ['category'],
};

const relaxOptionalColumns = async () => {
  for (const [table, columns] of Object.entries(OPTIONAL_COLUMNS)) {
    if (!(await tableExists(table))) continue;

    for (const column of columns) {
      const [info] = await db.query(
        `SELECT COLUMN_TYPE AS columnType, DATA_TYPE AS dataType, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS defaultValue,
                CHARACTER_SET_NAME AS charset, COLLATION_NAME AS collation
         FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column]
      );
      if (!info || info.nullable === 'YES' || info.defaultValue !== null) continue;

      // Keep the column's own charset/collation so joins and comparisons behave as before.
      const charset = info.charset ? ` CHARACTER SET ${info.charset} COLLATE ${info.collation}` : '';
      const definition = /text|blob/i.test(info.dataType)
        ? `${info.columnType}${charset} NULL`
        : `${info.columnType}${charset} NOT NULL DEFAULT ''`;
      await db.query(`ALTER TABLE ${table} MODIFY ${column} ${definition}`);
      console.log(`Made ${table}.${column} optional.`);
    }
  }
};

(async () => {
  try {
    console.log('Starting database migrations...');
    await ensureProjectStorage();
    await ensureContactStorage();
    await ensureSettingsStorage();
    await ensureBlogStorage();
    await ensureSeoStorage();
    await ensureHomepageTables();
    await ensureCommentStaffFlag();
    await ensureTokenVersion();
    await trimBlogSlugs();
    await repairHeroSlideIds();
    await relaxOptionalColumns();
    await runOnce('hide-template-homepage-cards', hideTemplateHomepageCards);
    console.log('Database migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database schema', err);
    process.exit(1);
  }
})();
