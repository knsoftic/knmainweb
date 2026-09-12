// Migration test: runs migrate.js against an in-memory stand-in seeded with the data problems found in production.
// Run with `npm test` (no MySQL needed).
const path = require('path');
const Module = require('module');
const BACKEND = path.join(__dirname, '..');
Object.assign(process.env, { DB_HOST: 'x', DB_PORT: '1', DB_USER: 'x', DB_PASSWORD: 'x', DB_NAME: 'x' });

const existingColumns = new Set(['blog_comments.status', 'blog_posts.like_count', 'blog_posts.og_title', 'blog_posts.og_description', 'blog_posts.twitter_title', 'blog_posts.twitter_description', 'blog_posts.twitter_image', 'blog_posts.schema_markup', 'contact_messages.phone', 'contact_messages.subject', 'seo_global.gtm_id', 'seo_global.bing_verification', 'seo_global.facebook_pixel_id', 'seo_global.clarity_id', 'seo_global.author', 'seo_global.language', 'seo_global.timezone', 'seo_pages.schema_markup', 'seo_pages.h1_heading', 'seo_pages.h2_heading', 'seo_pages.h3_heading', 'seo_pages.h4_heading', 'seo_pages.h5_heading', 'seo_pages.h6_heading']);
const data = {
  admin_users: [{ id: 1, email: 'admin@knsoftic.com' }],
  blog_comments: [{ id: 1, parent_id: null, email: 'visitor@x.com' }, { id: 2, parent_id: 1, email: 'Admin@KnSoftic.com ' }, { id: 3, parent_id: 1, email: 'someone@else.com' }],
  blog_posts: [{ id: 5, slug: ' what-is-seo-simple-guide' }, { id: 6, slug: 'why-every-business' }],
  hero_slides: [{ id: 1 }, { id: 2147483647 }],
};
const log = [];
const fakeDb = {
  query: async (sql, values = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    log.push({ sql: s, values });
    if (/information_schema\.tables WHERE table_schema = DATABASE\(\) AND table_name = \?/.test(s)) return [{ count: 1 }];
    if (/information_schema\.columns/.test(s)) return [{ count: existingColumns.has(`${values[0]}.${values[1]}`) ? 1 : 0 }];
    if (/SELECT AUTO_INCREMENT AS counter/.test(s)) return [{ counter: 2147483648 }];
    if (/SELECT \* FROM settings WHERE id = 1/.test(s)) return [{ id: 1 }];
    if (/SELECT id FROM seo_global/.test(s)) return [{ id: 1 }];
    if (s === 'SELECT email FROM admin_users') return data.admin_users;
    if (/SELECT id, email FROM blog_comments WHERE parent_id IS NOT NULL/.test(s)) return data.blog_comments.filter((c) => c.parent_id !== null);
    if (s === 'SELECT id, slug FROM blog_posts') return data.blog_posts;
    if (/SELECT id FROM blog_posts WHERE slug = \? AND id <> \?/.test(s)) return data.blog_posts.filter((p) => p.slug === values[0] && p.id !== values[1]);
    if (/SELECT id FROM hero_slides WHERE id = \?/.test(s)) return data.hero_slides.filter((h) => h.id === values[0]);
    if (/SELECT COALESCE\(MAX\(id\), 0\) AS maxId FROM hero_slides WHERE id < \?/.test(s)) return [{ maxId: Math.max(...data.hero_slides.filter((h) => h.id < values[0]).map((h) => h.id)) }];
    if (/UPDATE hero_slides SET id = \? WHERE id = \?/.test(s)) { data.hero_slides.find((h) => h.id === values[1]).id = values[0]; return { affectedRows: 1 }; }
    if (/SELECT COALESCE\(MAX\(id\), 0\) \+ 1 AS nextId FROM hero_slides/.test(s)) return [{ nextId: Math.max(...data.hero_slides.map((h) => h.id)) + 1 }];
    return [];
  },
};
const dbPath = require.resolve(path.join(BACKEND, 'config/db.js'));
const stub = new Module(dbPath); stub.filename = dbPath; stub.loaded = true; stub.exports = fakeDb;
require.cache[dbPath] = stub;

const out = console.log; const lines = []; console.log = (...a) => lines.push(a.join(' ')); console.error = (...a) => lines.push('ERR ' + a.join(' '));
// migrate.js calls process.exit when it finishes; intercept that to run the checks.
const realExit = process.exit.bind(process);
process.exit = (code) => {
  const find = (re) => log.filter((q) => re.test(q.sql));
  const checks = [
    ['adds blog_comments.is_staff', find(/ALTER TABLE blog_comments ADD COLUMN is_staff/).length === 1],
    ['flags only the admin reply (id 2) as staff', JSON.stringify(find(/UPDATE blog_comments SET is_staff = 1/).map((q) => q.values[0])) === '[2]'],
    ['adds admin_users.token_version', find(/ALTER TABLE admin_users ADD COLUMN token_version/).length === 1],
    ['trims the padded slug, keeps updated_at', find(/UPDATE blog_posts SET slug = \?, updated_at = updated_at/).map((q) => q.values.join('|')).join() === 'what-is-seo-simple-guide|5'],
    ['renumbers hero slide 2147483647 to 2', find(/UPDATE hero_slides SET id = \?/).map((q) => q.values.join('|')).join() === '2|2147483647'],
    ['resets hero_slides AUTO_INCREMENT to 3', find(/ALTER TABLE hero_slides AUTO_INCREMENT = 3/).length === 1],
    ['exits cleanly', code === 0],
  ];
  checks.forEach(([n, ok]) => out(`${ok ? 'PASS' : 'FAIL'}  ${n}`));
  out('--- migration output ---\n' + lines.join('\n'));
  realExit(checks.every(([, ok]) => ok) ? 0 : 1);
};
require(path.join(BACKEND, 'migrate.js'));
