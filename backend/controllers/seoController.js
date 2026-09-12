const db = require('../config/db');
const { getColumns } = require('../config/schema');
const { PUBLIC_POST_CONDITION } = require('./blogController');

// Never written from a request body.
const PROTECTED_COLUMNS = new Set(['id', 'page_slug', 'created_at', 'updated_at']);

/**
 * Keeps only keys that are real, writable columns of the table. Column names are interpolated
 * into SQL, so anything else in the body must never reach the query.
 */
const pickWritable = async (table, payload) => {
  const columns = await getColumns(table);
  return Object.keys(payload || {}).filter((key) => columns.has(key) && !PROTECTED_COLUMNS.has(key));
};

const isAbsoluteHttpUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

exports.getGlobalSeo = async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM seo_global WHERE id = 1');
    res.json(data[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch global SEO' });
  }
};

exports.updateGlobalSeo = async (req, res) => {
  try {
    const payload = req.body || {};

    if (payload.site_url && !isAbsoluteHttpUrl(payload.site_url)) {
      return res.status(400).json({ error: 'Site URL must be a full address starting with https://' });
    }

    const updateFields = await pickWritable('seo_global', payload);
    const values = updateFields.map(f => payload[f]);

    if (updateFields.length > 0) {
      await db.query(
        `UPDATE seo_global SET ${updateFields.map(f => `${f} = ?`).join(', ')} WHERE id = 1`,
        values
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update global SEO' });
  }
};

exports.getAllPagesSeo = async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM seo_pages');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pages SEO' });
  }
};

exports.getPageSeo = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await db.query('SELECT * FROM seo_pages WHERE page_slug = ?', [slug]);
    res.json(data[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch page SEO' });
  }
};

exports.updatePageSeo = async (req, res) => {
  try {
    const { slug } = req.params;
    const payload = req.body || {};
    const fields = await pickWritable('seo_pages', payload);
    const values = fields.map(f => payload[f]);

    const existing = await db.query('SELECT id FROM seo_pages WHERE page_slug = ?', [slug]);

    if (existing && existing.length > 0) {
      if (fields.length > 0) {
        await db.query(
          `UPDATE seo_pages SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE page_slug = ?`,
          [...values, slug]
        );
      }
    } else {
      const insertFields = ['page_slug', ...fields];
      const placeholders = insertFields.map(() => '?').join(', ');

      await db.query(
        `INSERT INTO seo_pages (${insertFields.join(', ')}) VALUES (${placeholders})`,
        [slug, ...values]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update page SEO' });
  }
};

exports.getSitemapData = async (req, res) => {
  try {
    // Pages configured in Admin → SEO; `noindex` lists the ones explicitly hidden from search engines
    const customPages = await db.query('SELECT page_slug FROM seo_pages WHERE is_index = 1');
    const hiddenPages = await db.query('SELECT page_slug FROM seo_pages WHERE is_index = 0');

    // Dynamic content
    const posts = await db.query(`SELECT p.slug, p.updated_at FROM blog_posts p WHERE ${PUBLIC_POST_CONDITION}`);
    const projects = await db.query('SELECT filter_slug, created_at FROM projects WHERE status = "active"');
    const courses = await db.query('SELECT filter_slug FROM courses WHERE is_active = 1');

    res.json({
      pages: customPages.map(p => p.page_slug),
      noindex: hiddenPages.map(p => p.page_slug),
      posts: posts.map(p => ({ slug: p.slug, updated_at: p.updated_at })),
      projects: projects.map(p => ({ slug: p.filter_slug, updated_at: p.created_at })),
      courses: courses.map(p => p.filter_slug)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sitemap data' });
  }
};
