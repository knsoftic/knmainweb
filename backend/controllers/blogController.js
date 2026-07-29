const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { category, tag, status, is_featured, limit, page } = req.query;
    
    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM blog_posts p LEFT JOIN blog_categories c ON p.category_id = c.id WHERE 1=1';
    const values = [];

    if (category) {
      query += ' AND c.slug = ?';
      values.push(category);
    }
    
    if (tag) {
      query += ' AND JSON_CONTAINS(p.tags_json, ?)';
      values.push(`"${tag}"`);
    }

    if (status) {
      query += ' AND p.status = ?';
      values.push(status);
    }

    if (is_featured === 'true' || is_featured === '1') {
      query += ' AND p.is_featured = 1';
    }

    query += ' ORDER BY p.created_at DESC';

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page || 1, 10);
      const offset = (parsedPage - 1) * parsedLimit;
      query += ' LIMIT ? OFFSET ?';
      values.push(parsedLimit, offset);
    }

    const data = await db.query(query, values);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await db.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM blog_posts p LEFT JOIN blog_categories c ON p.category_id = c.id WHERE p.slug = ?', 
      [slug]
    );

    if (data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = data[0];

    // Fetch related posts (same category)
    let relatedPosts = [];
    if (post.category_id) {
       relatedPosts = await db.query(
         'SELECT id, title, slug, excerpt, featured_image, published_at, created_at FROM blog_posts WHERE category_id = ? AND id != ? AND status = "published" ORDER BY published_at DESC LIMIT 3',
         [post.category_id, post.id]
       );
    }

    // Fetch previous post (older)
    const prevPost = await db.query(
       'SELECT title, slug FROM blog_posts WHERE status = "published" AND published_at < ? ORDER BY published_at DESC LIMIT 1',
       [post.published_at || post.created_at]
    );

    // Fetch next post (newer)
    const nextPost = await db.query(
       'SELECT title, slug FROM blog_posts WHERE status = "published" AND published_at > ? ORDER BY published_at ASC LIMIT 1',
       [post.published_at || post.created_at]
    );

    post.related_posts = relatedPosts;
    post.prev_post = prevPost.length > 0 ? prevPost[0] : null;
    post.next_post = nextPost.length > 0 ? nextPost[0] : null;

    // Increment view count
    await db.query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;
    // ensure slug is unique
    let slug = body.slug;
    const existing = await db.query('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const fields = [
      'title', 'slug', 'excerpt', 'content', 'featured_image', 'gallery_images', 
      'author', 'category_id', 'tags_json', 'status', 'published_at', 'reading_time', 
      'is_featured', 'allow_comments', 'meta_title', 'meta_description', 
      'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 
      'twitter_card', 'display_order'
    ];

    const insertFields = [];
    const values = [];

    fields.forEach(f => {
      if (f === 'slug') {
        insertFields.push(f);
        values.push(slug);
      } else if (f === 'tags_json') {
        insertFields.push(f);
        values.push(body[f] ? JSON.stringify(body[f]) : null);
      } else if (f === 'is_featured' || f === 'allow_comments') {
        insertFields.push(f);
        values.push(body[f] ? 1 : 0);
      } else if (f === 'display_order') {
        insertFields.push(f);
        values.push(body[f] !== undefined ? body[f] : 0);
      } else if (body[f] !== undefined) {
        insertFields.push(f);
        values.push(body[f]);
      }
    });

    const placeholders = insertFields.map(() => '?').join(', ');
    
    await db.query(
      `INSERT INTO blog_posts (${insertFields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    res.json({ success: true, slug });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ error: err ? (err.stack || err.toString()) : 'Unknown error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    // ensure slug is unique if it changed
    let slug = body.slug;
    if (slug) {
      const existing = await db.query('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const fields = [
      'title', 'slug', 'excerpt', 'content', 'featured_image', 'gallery_images', 
      'author', 'category_id', 'tags_json', 'status', 'published_at', 'reading_time', 
      'is_featured', 'allow_comments', 'meta_title', 'meta_description', 
      'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 
      'twitter_card', 'display_order'
    ];

    // Build update query dynamically based on provided fields
    const setClause = [];
    const values = [];

    fields.forEach(f => {
      if (body[f] !== undefined) {
        setClause.push(`${f} = ?`);
        if (f === 'slug') {
          values.push(slug);
        } else if (f === 'tags_json') {
          values.push(JSON.stringify(body[f]));
        } else if (f === 'is_featured' || f === 'allow_comments') {
          values.push(body[f] ? 1 : 0);
        } else {
          values.push(body[f]);
        }
      }
    });

    if (setClause.length === 0) {
      return res.json({ success: true });
    }

    values.push(id);
    
    await db.query(`UPDATE blog_posts SET ${setClause.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

exports.duplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = data[0];
    
    const fields = [
      'title', 'slug', 'excerpt', 'content', 'featured_image', 'gallery_images', 
      'author', 'category_id', 'tags_json', 'status', 'published_at', 'reading_time', 
      'is_featured', 'allow_comments', 'meta_title', 'meta_description', 
      'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 
      'twitter_card', 'display_order'
    ];

    const slug = `${post.slug}-copy-${Date.now()}`;
    
    const values = fields.map(f => {
      if (f === 'title') return `${post.title} (Copy)`;
      if (f === 'slug') return slug;
      if (f === 'status') return 'draft';
      return post[f];
    });

    const placeholders = fields.map(() => '?').join(', ');
    
    await db.query(
      `INSERT INTO blog_posts (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to duplicate blog post' });
  }
};
