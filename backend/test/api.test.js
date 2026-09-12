// API tests: loads the real server with an in-memory stand-in for the database and checks behaviour over HTTP.
// Run with `npm test` (no MySQL needed).
const path = require('path');
const fs = require('fs');
const os = require('os');
const Module = require('module');

const BACKEND = path.join(__dirname, '..');
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kn-uploads-'));
Object.assign(process.env, {
  PORT: String(40000 + Math.floor(Math.random() * 20000)), NODE_ENV: 'production', JWT_SECRET: 'test-secret-'.padEnd(64, 'x'),
  CORS_ORIGIN: 'https://knsoftic.com', DB_HOST: 'x', DB_PORT: '1', DB_USER: 'x', DB_PASSWORD: 'x', DB_NAME: 'x',
  UPLOAD_DIR: uploadDir,
});

const bcrypt = require(path.join(BACKEND, 'node_modules/bcryptjs'));
const jwt = require(path.join(BACKEND, 'node_modules/jsonwebtoken'));
const PASSWORD_HASH = bcrypt.hashSync('correct-password', 4);

const state = { tokenVersion: 0, log: [], affected: 1, post: null, parent: null };
const COLUMNS = {
  admin_users: ['id', 'email', 'full_name', 'role_id', 'password_hash', 'is_active', 'token_version'],
  blog_comments: ['id', 'post_id', 'parent_id', 'name', 'email', 'comment', 'status', 'is_staff', 'created_at'],
  seo_global: ['id', 'website_title', 'meta_title', 'site_url', 'google_analytics_id', 'created_at', 'updated_at'],
  seo_pages: ['id', 'page_slug', 'seo_title', 'meta_description', 'is_index', 'created_at', 'updated_at'],
};
const fakeDb = {
  query: async (sql, values = []) => {
    state.log.push({ sql: sql.replace(/\s+/g, ' ').trim(), values });
    if (/information_schema\.columns/.test(sql)) return (COLUMNS[values[0]] || []).map((name) => ({ name }));
    if (/SELECT token_version FROM admin_users/.test(sql)) return [{ token_version: state.tokenVersion }];
    if (/FROM admin_users WHERE (email|id) = \?/.test(sql)) {
      const ok = values[0] === 'admin@knsoftic.com' || values[0] === 1;
      return ok ? [{ id: 1, email: 'admin@knsoftic.com', full_name: 'KN Admin', role_id: 1, password_hash: PASSWORD_HASH, token_version: state.tokenVersion }] : [];
    }
    if (/SELECT p\.id, p\.allow_comments FROM blog_posts/.test(sql)) return state.post ? [state.post] : [];
    if (/SELECT id, post_id FROM blog_comments WHERE id = \?/.test(sql)) return state.parent ? [state.parent] : [];
    if (/SELECT p\.\*, c\.name as category_name/.test(sql) && /LIMIT 1/.test(sql)) return [{ id: 7, slug: ' what-is-seo', category_id: null, published_at: new Date('2026-01-01'), created_at: new Date('2026-01-01') }];
    if (/SELECT id, status, published_at FROM blog_posts WHERE id = \?/.test(sql)) return [{ id: 7, status: 'draft', published_at: null }];
    if (/SELECT id FROM blog_posts WHERE slug/.test(sql)) return [];
    if (/SELECT like_count/.test(sql)) return [{ like_count: 5 }];
    if (/^\s*INSERT/i.test(sql)) return { insertId: 42, affectedRows: 1 };
    if (/^\s*(UPDATE|DELETE)/i.test(sql)) return { affectedRows: state.affected };
    return [];
  },
  transaction: async (work) => work(fakeDb.query),
};
const dbPath = require.resolve(path.join(BACKEND, 'config/db.js'));
const stub = new Module(dbPath); stub.filename = dbPath; stub.loaded = true; stub.exports = fakeDb;
require.cache[dbPath] = stub;

const origLog = console.log; console.log = () => {}; console.error = () => {}; console.warn = () => {};
process.chdir(BACKEND);
require(path.join(BACKEND, 'server.js'));

const BASE = `http://127.0.0.1:${process.env.PORT}`;
const token = (tv = 0) => jwt.sign({ user: { id: 1, email: 'admin@knsoftic.com', name: 'KN Admin', roleId: 1 }, tv }, process.env.JWT_SECRET, { expiresIn: '15m' });
const call = async (method, url, { body, auth, headers = {}, raw } = {}) => {
  const h = { ...headers };
  if (auth) h.Authorization = `Bearer ${auth === true ? token() : auth}`;
  if (body && !raw) h['Content-Type'] = 'application/json';
  const res = await fetch(BASE + url, { method, headers: h, body: raw || (body ? JSON.stringify(body) : undefined) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
};
const lastSql = (re) => [...state.log].reverse().find((q) => re.test(q.sql));
let pass = 0, fail = 0;
const check = (name, cond, detail = '') => { cond ? pass++ : fail++; origLog(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail ? `  -> ${detail}` : ''}`); };

(async () => {
  await new Promise((r) => setTimeout(r, 400));

  // H1: CORS allows www and bare domain, nothing else
  let r = await call('GET', '/api/settings', { headers: { Origin: 'https://www.knsoftic.com' } });
  check('CORS allows www origin', r.headers.get('access-control-allow-origin') === 'https://www.knsoftic.com', r.headers.get('access-control-allow-origin'));
  r = await call('GET', '/api/settings', { headers: { Origin: 'https://evil.example' } });
  check('CORS rejects other origins', !r.headers.get('access-control-allow-origin'));

  // C2: comment list needs login
  r = await call('GET', '/api/blog/comments');
  check('GET /blog/comments without login -> 401', r.status === 401, r.status);
  r = await call('GET', '/api/blog/comments', { auth: true });
  check('GET /blog/comments with login -> 200', r.status === 200, r.status);

  // M4: revoked token version
  state.tokenVersion = 1;
  r = await call('GET', '/api/blog/comments', { auth: token(0) });
  check('token from before a password change -> 401', r.status === 401, r.status);
  state.tokenVersion = 0;

  // C3 + H8: public comments ignore parent_id; post must be public and open
  state.post = null;
  r = await call('POST', '/api/blog/comments/public', { body: { post_id: 9, name: 'A', email: 'a@b.co', comment: 'hi' } });
  check('comment on a missing/draft post -> 404', r.status === 404, r.status);
  state.post = { id: 7, allow_comments: 0 };
  r = await call('POST', '/api/blog/comments/public', { body: { post_id: 7, name: 'A', email: 'a@b.co', comment: 'hi' } });
  check('comment when comments closed -> 403', r.status === 403, r.status);
  state.post = { id: 7, allow_comments: 1 };
  r = await call('POST', '/api/blog/comments/public', { body: { post_id: 7, parent_id: 3, name: 'Ali', email: 'a@b.co', comment: 'fake reply' } });
  const ins = lastSql(/INSERT INTO blog_comments/);
  check('public comment stored with parent_id NULL', r.status === 200 && ins.values[1] === null, JSON.stringify(ins?.values));
  for (const name of ['KN Softic', 'admin', '  Kn   SOFTIC ']) {
    r = await call('POST', '/api/blog/comments/public', { body: { post_id: 7, name, email: 'a@b.co', comment: 'hi' } });
    check(`reserved comment name "${name.trim()}" -> 400`, r.status === 400, r.status);
  }
  r = await call('POST', '/api/blog/comments/public', { body: { post_id: 7, name: 'A', email: 'a@b.co', comment: 'x'.repeat(5001) } });
  check('over-long comment -> 400', r.status === 400, r.status);
  r = await call('GET', '/api/blog/posts/7/comments');
  const pub = lastSql(/FROM blog_comments WHERE post_id = \?/);
  check('public comment list: approved only, no email, has is_staff', /status = 'approved'/.test(pub.sql) && !/email/.test(pub.sql) && /is_staff/.test(pub.sql), pub.sql);

  // C3: staff replies
  r = await call('POST', '/api/blog/comments/reply', { body: { post_id: 7, parent_id: 3, comment: 'Thanks!' } });
  check('staff reply without login -> 401', r.status === 401, r.status);
  state.parent = { id: 3, post_id: 7 };
  r = await call('POST', '/api/blog/comments/reply', { auth: true, body: { post_id: 7, parent_id: 3, comment: 'Thanks!' } });
  const reply = lastSql(/INSERT INTO blog_comments/);
  check('staff reply stored with is_staff = 1 and admin identity', r.status === 200 && r.json.id === 42 && /is_staff\) VALUES \(.*1\)/.test(reply.sql) && reply.values[2] === 'KN Admin', reply.sql + ' ' + JSON.stringify(reply.values));
  state.parent = { id: 3, post_id: 99 };
  r = await call('POST', '/api/blog/comments/reply', { auth: true, body: { post_id: 7, parent_id: 3, comment: 'x' } });
  check('reply to a comment on another post -> 400', r.status === 400, r.status);

  // H7: drafts hidden from visitors
  await call('GET', '/api/blog/posts');
  check('visitor post list filters to public posts', /p\.status = 'published' OR/.test(lastSql(/FROM blog_posts p LEFT JOIN/).sql));
  await call('GET', '/api/blog/posts', { auth: true });
  check('admin post list includes drafts', !/p\.status = 'published' OR/.test(lastSql(/FROM blog_posts p LEFT JOIN/).sql));
  await call('GET', '/api/blog/posts?limit=abc&page=-3');
  check('bad limit/page are clamped, not passed to SQL', /LIMIT 10 OFFSET 0/.test(lastSql(/FROM blog_posts p LEFT JOIN/).sql), lastSql(/FROM blog_posts p LEFT JOIN/).sql);
  await call('GET', '/api/blog/posts?tag=' + encodeURIComponent('a"b'));
  check('tag filter is JSON-encoded', lastSql(/JSON_CONTAINS/).values.includes('"a\\"b"'), JSON.stringify(lastSql(/JSON_CONTAINS/).values));

  // H5 + M3: padded slug lookup, view counting
  state.log = [];
  r = await call('GET', '/api/blog/posts/%20what-is-seo');
  const bySlug = lastSql(/TRIM\(p\.slug\)/);
  const view = lastSql(/view_count = view_count \+ 1/);
  check('slug lookup trims and matches padded slugs', r.status === 200 && bySlug.values[0] === 'what-is-seo' && /PUBLIC|p\.status = 'published'/.test(bySlug.sql), JSON.stringify(bySlug?.values));
  check('view count keeps updated_at', view && /updated_at = updated_at/.test(view.sql), view?.sql);
  state.log = [];
  await call('GET', '/api/blog/posts/what-is-seo', { auth: true });
  check('admin preview does not count a view', !lastSql(/view_count/));

  // Blog create/update
  r = await call('POST', '/api/blog/posts', { auth: true, body: { title: 'What Is SEO?', slug: '  What Is SEO?  ', content: '<p>x</p>', status: 'published' } });
  const create = lastSql(/INSERT INTO blog_posts/);
  const cols = create.sql.match(/\(([^)]+)\) VALUES/)[1].split(', ');
  check('create normalizes slug', r.json.slug === 'what-is-seo', r.json.slug);
  check('publishing without a date stamps published_at', create.values[cols.indexOf('published_at')] instanceof Date, String(create.values[cols.indexOf('published_at')]));
  r = await call('PUT', '/api/blog/posts/7', { auth: true, body: { status: 'scheduled' } });
  check('scheduling without a date -> 400', r.status === 400, r.status);
  r = await call('PUT', '/api/blog/posts/7', { auth: true, body: { status: 'published' } });
  check('first publish via update stamps published_at', /published_at = \?/.test(lastSql(/UPDATE blog_posts SET/).sql), lastSql(/UPDATE blog_posts SET/).sql);
  r = await call('PUT', '/api/blog/posts/7', { auth: true, body: { published_at: 'not a date' } });
  check('invalid publish date -> 400', r.status === 400, r.status);

  // Likes
  state.affected = 0;
  r = await call('POST', '/api/blog/posts/7/like');
  check('liking a non-public post -> 404', r.status === 404, r.status);
  state.affected = 1;
  r = await call('POST', '/api/blog/posts/7/like');
  check('like keeps updated_at', r.status === 200 && /updated_at = p\.updated_at/.test(lastSql(/like_count = p\.like_count/).sql));

  // M1 + M2: partial settings update and mirroring
  r = await call('PUT', '/api/settings', { auth: true, body: { about_title: 'Hello', primary_email: 'new@knsoftic.com' } });
  const set = lastSql(/UPDATE settings SET/);
  check('settings update touches only sent fields (+ mirror)', r.status === 200 && /about_title = \?/.test(set.sql) && /contact_email = \?/.test(set.sql) && !/logo_url/.test(set.sql) && !/phone_number/.test(set.sql), set.sql);
  check('primary_email is mirrored to contact_email', set.values.filter((v) => v === 'new@knsoftic.com').length === 2);

  // H9: SEO column whitelist
  r = await call('PUT', '/api/seo/global', { auth: true, body: { meta_title: 'T', 'meta_title = (SELECT password_hash FROM admin_users LIMIT 1), website_title': 'x', created_at: 'z', id: 5 } });
  const seo = lastSql(/UPDATE seo_global/);
  check('SEO save ignores unknown/protected keys', r.status === 200 && seo.sql === 'UPDATE seo_global SET meta_title = ? WHERE id = 1', seo?.sql);
  r = await call('PUT', '/api/seo/global', { auth: true, body: { site_url: 'knsoftic.com' } });
  check('SEO site_url without scheme -> 400', r.status === 400, r.status);
  r = await call('PUT', '/api/seo/pages/about', { auth: true, body: { seo_title: 'About', updated_at: 'x', evil: 1 } });
  const pageIns = lastSql(/seo_pages/);
  check('page SEO insert uses page_slug + known columns only', /INSERT INTO seo_pages \(page_slug, seo_title\)/.test(pageIns.sql), pageIns.sql);

  // H3: contact limiter only on the public form
  let adminLimited = false;
  for (let i = 0; i < 12; i++) { const x = await call('GET', '/api/contact-messages', { auth: true }); if (x.status === 429) adminLimited = true; }
  check('admin inbox is not rate limited', !adminLimited);
  r = await call('POST', '/api/contact-messages', { body: { name: 'A', email: 'a@b.com?bcc=x@y.com', message: 'hi' } });
  check('contact email with header injection -> 400', r.status === 400, r.status);
  let lastStatus;
  for (let i = 0; i < 11; i++) { lastStatus = (await call('POST', '/api/contact-messages', { body: { name: 'A', email: 'a@b.com', message: 'hi' } })).status; }
  check('public contact form still limited (11th -> 429)', lastStatus === 429, lastStatus);

  // CRUD
  r = await call('POST', '/api/hero_slides', { auth: true, body: { id: Date.now(), title: 'Slide', display_order: 1 } });
  const hero = lastSql(/INSERT INTO hero_slides/);
  check('hero slide create ignores client id, returns insertId', r.json.id === 42 && !/\bid\b/.test(hero.sql.match(/\(([^)]+)\) VALUES/)[1]), hero.sql);
  r = await call('POST', '/api/homepage_cards', { auth: true, body: { id: 'card-1', title: 'Card' } });
  check('text-id tables keep client id', r.json.id === 'card-1' && /\(id, title\)/.test(lastSql(/INSERT INTO homepage_cards/).sql));
  r = await call('PUT', '/api/services/web', { auth: true, body: { is_active: 0 } });
  check('CRUD update writes only sent fields', lastSql(/UPDATE services SET/).sql === 'UPDATE services SET is_active = ? WHERE id = ?', lastSql(/UPDATE services SET/).sql);
  await call('GET', '/api/fun_facts');
  check('lists ordered by display_order', /ORDER BY display_order ASC, id ASC/.test(lastSql(/FROM fun_facts/).sql));

  // Auth
  r = await call('POST', '/api/auth/login', { body: {} });
  check('login without fields -> 400', r.status === 400, r.status);
  r = await call('POST', '/api/auth/login', { body: { email: 'admin@knsoftic.com', password: 'correct-password' } });
  check('login works and sets refresh cookie', r.status === 200 && !!r.json.token && /refresh_token=/.test(r.headers.get('set-cookie') || ''), r.status);
  r = await call('PUT', '/api/auth/change-password', { auth: true, body: { currentPassword: 'correct-password', newPassword: 'short' } });
  check('short new password -> 400', r.status === 400, r.status);
  r = await call('PUT', '/api/auth/change-password', { auth: true, body: { currentPassword: 'correct-password', newPassword: 'longer-password' } });
  check('password change bumps token_version and returns a token', r.status === 200 && !!r.json.token && /token_version = token_version \+ 1/.test(lastSql(/UPDATE admin_users SET password_hash/).sql), r.status);

  // Uploads
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  const form = (buf, name, type) => { const f = new FormData(); f.append('image', new Blob([buf], { type }), name); return f; };
  r = await call('POST', '/api/upload', { auth: true, raw: form(png, 'x.png', 'image/png') });
  check('PNG upload succeeds', r.status === 200 && /^\/uploads\/image-.*\.png$/.test(r.json.url), JSON.stringify(r.json));
  const served = await fetch(BASE + r.json.url);
  check('uploaded file served with sandbox CSP', served.status === 200 && /sandbox/.test(served.headers.get('content-security-policy') || ''), served.headers.get('content-security-policy'));
  r = await call('POST', '/api/upload', { auth: true, raw: form(Buffer.alloc(6 * 1024 * 1024, 1), 'big.png', 'image/png') });
  check('oversized upload -> 400 with reason', r.status === 400 && /too large/i.test(r.json.error), JSON.stringify(r.json));
  r = await call('POST', '/api/upload', { auth: true, raw: form(Buffer.from('<html><script>alert(1)</script></html>'), 'x.html', 'image/svg+xml') });
  check('fake SVG -> 400', r.status === 400, JSON.stringify(r.json));
  r = await call('POST', '/api/upload', { auth: true, raw: form(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'evil.html', 'image/svg+xml') });
  check('SVG saved with .svg extension regardless of name', r.status === 200 && /\.svg$/.test(r.json.url), JSON.stringify(r.json));
  r = await call('POST', '/api/upload', { auth: true, raw: form(Buffer.from('hello'), 'x.txt', 'text/plain') });
  check('non-image upload -> 400 with reason', r.status === 400 && /Only image files/.test(r.json.error), JSON.stringify(r.json));

  // Misc
  r = await call('GET', '/api/does-not-exist');
  check('unknown API route -> JSON 404', r.status === 404 && r.json.error === 'Not found', r.status);
  r = await call('POST', '/api/contact-messages', { raw: '{bad json', headers: { 'Content-Type': 'application/json' } });
  check('malformed JSON -> 400 JSON', r.status === 400 && typeof r.json === 'object', `${r.status} ${JSON.stringify(r.json)}`);

  origLog(`\n${pass} passed, ${fail} failed`);
  fs.rmSync(uploadDir, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
})().catch((e) => { origLog('HARNESS ERROR', e); process.exit(2); });
