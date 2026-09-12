const db = require('../config/db');

// A post is public once published, or once a scheduled post's publish time has passed.
// Expects the blog_posts table to be aliased as `p`.
const PUBLIC_POST_CONDITION = "(p.status = 'published' OR (p.status = 'scheduled' AND p.published_at <= NOW()))";
exports.PUBLIC_POST_CONDITION = PUBLIC_POST_CONDITION;

const POST_FIELDS = [
  'title', 'slug', 'excerpt', 'content', 'featured_image', 'gallery_images',
  'author', 'category_id', 'tags_json', 'status', 'published_at', 'reading_time',
  'is_featured', 'allow_comments', 'meta_title', 'meta_description',
  'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image',
  'twitter_card', 'display_order'
];

const STATUSES = ['draft', 'published', 'scheduled'];

// Lowercase, hyphen-separated, no leading/trailing spaces — a stray space produced URLs like /blog/%20my-post.
const normalizeSlug = (value) => String(value ?? '')
  .normalize('NFKC')
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, '')
  .replace(/[\s_]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '');

// Accepts ISO strings (with or without a timezone) and Dates; '' and null clear the date.
// Returns undefined for unparseable input.
const parsePublishedAt = (value) => {
  if (value === null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const clampInt = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const makeUniqueSlug = async (slug, excludeId = null) => {
  const existing = excludeId === null
    ? await db.query('SELECT id FROM blog_posts WHERE slug = ?', [slug])
    : await db.query('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, excludeId]);
  return existing.length > 0 ? `${slug}-${Date.now()}` : slug;
};

// Validates status/published_at together; returns an error message or null.
const checkSchedule = (status, publishedAt) => {
  if (status !== undefined && !STATUSES.includes(status)) {
    return 'Status must be draft, published or scheduled';
  }
  if (publishedAt === undefined) {
    return 'Publish date is not a valid date';
  }
  if (status === 'scheduled' && !publishedAt) {
    return 'Choose a publish date for a scheduled post';
  }
  return null;
};

exports.getAll = async (req, res) => {
  try {
    const { category, tag, status, is_featured, limit, page } = req.query;
    const isAdmin = Boolean(req.user);

    let query = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM blog_posts p LEFT JOIN blog_categories c ON p.category_id = c.id WHERE 1=1';
    const values = [];

    // Visitors only ever see public posts; the admin panel (logged in) sees every status.
    if (!isAdmin) {
      query += ` AND ${PUBLIC_POST_CONDITION}`;
    } else if (status) {
      query += ' AND p.status = ?';
      values.push(status);
    }

    if (category) {
      query += ' AND c.slug = ?';
      values.push(category);
    }

    if (tag) {
      query += ' AND JSON_CONTAINS(p.tags_json, ?)';
      values.push(JSON.stringify(String(tag)));
    }

    if (is_featured === 'true' || is_featured === '1') {
      query += ' AND p.is_featured = 1';
    }

    query += ' ORDER BY p.created_at DESC';

    if (limit) {
      const parsedLimit = clampInt(limit, 10, 1, 100);
      const parsedPage = clampInt(page, 1, 1, 100000);
      // Validated integers, inlined because some MySQL versions reject placeholders in LIMIT for prepared statements.
      query += ` LIMIT ${parsedLimit} OFFSET ${(parsedPage - 1) * parsedLimit}`;
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
    const slug = String(req.params.slug || '').trim();
    const isAdmin = Boolean(req.user);

    // TRIM() also finds posts saved before slugs were normalized (e.g. with a leading space).
    const data = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug FROM blog_posts p LEFT JOIN blog_categories c ON p.category_id = c.id WHERE (p.slug = ? OR TRIM(p.slug) = ?)${isAdmin ? '' : ` AND ${PUBLIC_POST_CONDITION}`} LIMIT 1`,
      [slug, slug]
    );

    if (data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = data[0];
    const postDate = post.published_at || post.created_at;

    // Fetch related posts (same category)
    let relatedPosts = [];
    if (post.category_id) {
      relatedPosts = await db.query(
        `SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, p.published_at, p.created_at FROM blog_posts p WHERE p.category_id = ? AND p.id != ? AND ${PUBLIC_POST_CONDITION} ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT 3`,
        [post.category_id, post.id]
      );
    }

    // Fetch previous post (older)
    const prevPost = await db.query(
      `SELECT p.title, p.slug FROM blog_posts p WHERE ${PUBLIC_POST_CONDITION} AND p.id != ? AND COALESCE(p.published_at, p.created_at) < ? ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT 1`,
      [post.id, postDate]
    );

    // Fetch next post (newer)
    const nextPost = await db.query(
      `SELECT p.title, p.slug FROM blog_posts p WHERE ${PUBLIC_POST_CONDITION} AND p.id != ? AND COALESCE(p.published_at, p.created_at) > ? ORDER BY COALESCE(p.published_at, p.created_at) ASC LIMIT 1`,
      [post.id, postDate]
    );

    post.related_posts = relatedPosts;
    post.prev_post = prevPost.length > 0 ? prevPost[0] : null;
    post.next_post = nextPost.length > 0 ? nextPost[0] : null;

    // Count visitor views only. Assigning updated_at to itself stops ON UPDATE CURRENT_TIMESTAMP
    // from turning every view into an "Updated" date.
    if (!isAdmin) {
      await db.query('UPDATE blog_posts SET view_count = view_count + 1, updated_at = updated_at WHERE id = ?', [post.id]);
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const baseSlug = normalizeSlug(body.slug || title);

    if (!title || !baseSlug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    const status = body.status || 'draft';
    let publishedAt = body.published_at === undefined ? null : parsePublishedAt(body.published_at);
    const scheduleError = checkSchedule(status, publishedAt);
    if (scheduleError) {
      return res.status(400).json({ error: scheduleError });
    }
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    // ensure slug is unique
    const slug = await makeUniqueSlug(baseSlug);

    const insertFields = [];
    const values = [];

    POST_FIELDS.forEach(f => {
      if (f === 'slug') {
        insertFields.push(f);
        values.push(slug);
      } else if (f === 'title') {
        insertFields.push(f);
        values.push(title);
      } else if (f === 'status') {
        insertFields.push(f);
        values.push(status);
      } else if (f === 'published_at') {
        insertFields.push(f);
        values.push(publishedAt);
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

    const result = await db.query(
      `INSERT INTO blog_posts (${insertFields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    res.json({ success: true, slug, id: result.insertId });
  } catch (err) {
    console.error('Failed to create blog post:', err);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const [current] = await db.query('SELECT id, status, published_at FROM blog_posts WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // ensure slug is unique if it changed
    let slug;
    if (body.slug !== undefined) {
      const baseSlug = normalizeSlug(body.slug);
      if (!baseSlug) {
        return res.status(400).json({ error: 'Slug cannot be empty' });
      }
      slug = await makeUniqueSlug(baseSlug, id);
    }

    const status = body.status !== undefined ? body.status : current.status;
    let publishedAt = body.published_at !== undefined ? parsePublishedAt(body.published_at) : current.published_at;
    const scheduleError = checkSchedule(status, publishedAt);
    if (scheduleError) {
      return res.status(400).json({ error: scheduleError });
    }
    // First publish without a chosen date: stamp it now so the post sorts and navigates correctly.
    const stampPublishDate = status === 'published' && !publishedAt;
    if (stampPublishDate) {
      publishedAt = new Date();
    }

    // Build update query dynamically based on provided fields
    const setClause = [];
    const values = [];

    POST_FIELDS.forEach(f => {
      if (f === 'published_at') {
        if (body[f] !== undefined || stampPublishDate) {
          setClause.push(`${f} = ?`);
          values.push(publishedAt);
        }
        return;
      }
      if (body[f] === undefined) return;

      setClause.push(`${f} = ?`);
      if (f === 'slug') {
        values.push(slug);
      } else if (f === 'title') {
        values.push(String(body[f]).trim());
      } else if (f === 'tags_json') {
        values.push(JSON.stringify(body[f]));
      } else if (f === 'is_featured' || f === 'allow_comments') {
        values.push(body[f] ? 1 : 0);
      } else {
        values.push(body[f]);
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

    const slug = `${normalizeSlug(post.slug)}-copy-${Date.now()}`;

    const values = POST_FIELDS.map(f => {
      if (f === 'title') return `${post.title} (Copy)`;
      if (f === 'slug') return slug;
      if (f === 'status') return 'draft';
      if (f === 'published_at') return null;
      return post[f];
    });

    const placeholders = POST_FIELDS.map(() => '?').join(', ');

    await db.query(
      `INSERT INTO blog_posts (${POST_FIELDS.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to duplicate blog post' });
  }
};
