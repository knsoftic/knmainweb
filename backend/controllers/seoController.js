const db = require('../config/db');

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
    const payload = req.body;
    const fields = Object.keys(payload);
    
    // Prevent updating 'id'
    const updateFields = fields.filter(f => f !== 'id');
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
    const payload = req.body;
    
    const existing = await db.query('SELECT id FROM seo_pages WHERE page_slug = ?', [slug]);
    
    if (existing && existing.length > 0) {
      const updateFields = Object.keys(payload).filter(f => f !== 'id' && f !== 'page_slug');
      const values = updateFields.map(f => payload[f]);
      
      if (updateFields.length > 0) {
        await db.query(
          `UPDATE seo_pages SET ${updateFields.map(f => `${f} = ?`).join(', ')} WHERE page_slug = ?`,
          [...values, slug]
        );
      }
    } else {
      payload.page_slug = slug;
      const insertFields = Object.keys(payload).filter(f => f !== 'id');
      const values = insertFields.map(f => payload[f]);
      const placeholders = insertFields.map(() => '?').join(', ');
      
      await db.query(
        `INSERT INTO seo_pages (${insertFields.join(', ')}) VALUES (${placeholders})`,
        values
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
    // Collect all standard pages explicitly from seo_pages
    const customPages = await db.query('SELECT page_slug FROM seo_pages WHERE is_index = 1');
    
    // Dynamic content
    const posts = await db.query('SELECT slug, updated_at FROM blog_posts WHERE status = "published"');
    const projects = await db.query('SELECT filter_slug, created_at FROM projects WHERE status = "active"');
    const courses = await db.query('SELECT filter_slug FROM courses WHERE is_active = 1');
    
    res.json({
      pages: customPages.map(p => p.page_slug),
      posts: posts.map(p => ({ slug: p.slug, updated_at: p.updated_at })),
      projects: projects.map(p => ({ slug: p.filter_slug, updated_at: p.created_at })),
      courses: courses.map(p => p.filter_slug)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sitemap data' });
  }
};
