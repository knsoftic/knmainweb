// Checks a deployed installation: settings, database, uploads folder and the live API.
//
//   cd ~/domains/knsoftic.com/knsoftic/backend && npm run check
//
// Reads only - it never changes data. Exits 1 if anything is broken, so it is safe to run
// at the end of a deployment. Pass a different API address as an argument if yours differs:
//   npm run check -- https://api.example.com
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

let failures = 0;
let warnings = 0;

const ok = (label, detail) => console.log(`  OK    ${label}${detail ? ' - ' + detail : ''}`);
const bad = (label, detail) => { failures++; console.log(`  FAIL  ${label}${detail ? ' - ' + detail : ''}`); };
const warn = (label, detail) => { warnings++; console.log(`  WARN  ${label}${detail ? ' - ' + detail : ''}`); };
const hint = (text) => console.log(`        ${text}`);
const section = (title) => console.log(`\n${title}`);

// ------------------------------------------------------------------ Settings
const REQUIRED = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'CORS_ORIGIN'];

const checkSettings = () => {
  section('1. Settings file (.env)');

  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    bad('required values', 'missing: ' + missing.join(', '));
    hint('Copy backend/.env.example to backend/.env and fill it in.');
  } else {
    ok('all required values present');
  }

  const examples = REQUIRED.filter((key) => /CHANGE THIS|YOUR_|your_db_|long-random/.test(process.env[key] || ''));
  if (examples.length) bad('example values left in place', examples.join(', '));

  if (process.env.NODE_ENV === 'production') {
    ok('NODE_ENV', 'production');
  } else {
    warn('NODE_ENV', `is "${process.env.NODE_ENV || 'not set'}" - set it to production, or sign-in cookies travel unencrypted`);
  }

  const secret = process.env.JWT_SECRET || '';
  if (secret.length >= 32) ok('JWT_SECRET', `${secret.length} characters`);
  else bad('JWT_SECRET', 'too short - use at least 32 random characters');

  if (/^https:\/\//.test(process.env.CORS_ORIGIN || '')) ok('CORS_ORIGIN', process.env.CORS_ORIGIN);
  else bad('CORS_ORIGIN', `must start with https:// - got "${process.env.CORS_ORIGIN || 'nothing'}"`);
};

// ------------------------------------------------------------------ Database
const KEY_TABLES = ['settings', 'admin_users', 'services', 'courses', 'portfolio_projects', 'team_members', 'blog_posts', 'contact_messages'];
const COUNTED = ['settings', 'services', 'courses', 'portfolio_projects', 'team_members', 'blog_posts'];

const checkDatabase = async () => {
  section('2. Database');

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 8000,
    });
    ok('connected', `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } catch (err) {
    bad('cannot connect', err.message);
    hint('Check DB_USER, DB_PASSWORD and DB_NAME against hPanel -> Databases.');
    return;
  }

  try {
    const [tables] = await conn.query('SHOW TABLES');
    const names = tables.map((row) => Object.values(row)[0]);

    if (names.length >= 25) {
      ok('tables', `${names.length} found`);
    } else {
      bad('tables', `only ${names.length} found`);
      hint('Import database/knsoftic_complete.sql in phpMyAdmin, then run: npm run migrate');
    }

    const absent = KEY_TABLES.filter((name) => !names.includes(name));
    if (absent.length) bad('missing tables', absent.join(', '));
    else ok('all key tables present');

    for (const table of COUNTED) {
      if (!names.includes(table)) continue;
      const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
      const n = rows[0].n;
      if (n > 0) ok(table, `${n} row${n === 1 ? '' : 's'}`);
      else warn(table, 'empty - this part of the website will have nothing to show');
    }

    if (names.includes('admin_users')) {
      const [rows] = await conn.query('SELECT COUNT(*) AS n FROM admin_users WHERE is_active = 1');
      if (rows[0].n > 0) {
        ok('admin accounts', `${rows[0].n} active`);
      } else {
        bad('admin accounts', 'none - you cannot sign in');
        hint("Create one with: ADMIN_EMAIL=you@example.com ADMIN_NAME='Your Name' ADMIN_PASSWORD='...' npm run create-admin");
      }
    }
  } catch (err) {
    bad('reading the database failed', err.message);
  } finally {
    await conn.end();
  }
};

// ------------------------------------------------------------------- Uploads
const checkUploads = () => {
  section('3. Uploaded images');

  const { UPLOAD_DIR } = require('./config/paths');
  if (!fs.existsSync(UPLOAD_DIR)) {
    bad('folder missing', UPLOAD_DIR);
    hint('Copy public/uploads across from the old server, or correct UPLOAD_DIR in .env.');
    return;
  }

  const files = fs.readdirSync(UPLOAD_DIR).filter((name) => !name.startsWith('.'));
  if (files.length) ok('folder', `${UPLOAD_DIR} (${files.length} files)`);
  else warn('folder is empty', `${UPLOAD_DIR} - pictures will be missing from the website`);

  const probe = path.join(UPLOAD_DIR, `.write-test-${Date.now()}`);
  try {
    fs.writeFileSync(probe, 'x');
    fs.unlinkSync(probe);
    ok('writable', 'the admin panel can upload images');
  } catch (err) {
    bad('not writable', err.message);
  }
};

// ------------------------------------------------------------------ Live API
const LIST_ROUTES = ['/api/services', '/api/courses', '/api/projects', '/api/team', '/api/blog/posts'];

const get = async (url, headers) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  return { status: res.status, headers: res.headers, body: await res.text() };
};

const checkApi = async () => {
  const base = (process.argv[2] || 'https://api.knsoftic.com').replace(/\/+$/, '');
  section(`4. The running API (${base})`);

  const site = (process.env.CORS_ORIGIN || '').split(',')[0].trim();

  try {
    const root = await get(`${base}/`);
    if (root.status === 200) {
      ok('API is running', 'replied 200');
    } else {
      bad('API replied unexpectedly', `${root.status}`);
      hint('Restart it in hPanel -> Node.js.');
    }
  } catch (err) {
    bad('API unreachable', err.message);
    hint('The app is stopped, or the domain does not point at it yet.');
    return;
  }

  try {
    const res = await get(`${base}/api/settings`, site ? { Origin: site } : undefined);
    let parsed = null;
    try { parsed = JSON.parse(res.body); } catch (err) { /* not JSON */ }

    if (res.status === 200 && parsed && !parsed.error) {
      ok('database reachable through the API', '/api/settings returned data');
    } else if (res.status === 500) {
      bad('the API cannot read the database', 'it is running, but its .env is wrong');
      hint('Fix the database values in .env, then restart the API.');
    } else {
      bad('/api/settings', `returned ${res.status}`);
    }

    const allow = res.headers.get('access-control-allow-origin');
    if (!site) warn('CORS', 'CORS_ORIGIN is not set, so this could not be checked');
    else if (allow === site) ok('CORS', `${site} is allowed`);
    else {
      bad('CORS', `${site} is blocked (header was "${allow || 'absent'}")`);
      hint('The website would load with no content. Fix CORS_ORIGIN, then restart the API.');
    }
  } catch (err) {
    bad('/api/settings failed', err.message);
  }

  for (const route of LIST_ROUTES) {
    try {
      const res = await get(`${base}${route}`);
      const data = JSON.parse(res.body);
      const rows = Array.isArray(data) ? data : (data.data || data.posts || []);
      if (res.status !== 200 || !Array.isArray(rows)) bad(route, `returned ${res.status}`);
      else if (rows.length) ok(route, `${rows.length} items`);
      else warn(route, 'returned nothing - add content in the admin panel');
    } catch (err) {
      bad(route, err.message);
    }
  }

  try {
    const res = await get(`${base}/api/this-does-not-exist`);
    if (res.status === 404) ok('unknown addresses', 'answered with a clean 404');
    else warn('unknown addresses', `returned ${res.status} instead of 404`);
  } catch (err) { /* not important enough to fail on */ }
};

const main = async () => {
  console.log('Checking this installation. Nothing is changed - every check only reads.');
  console.log(`\nProject: ${path.resolve(__dirname, '..')}`);
  console.log(`Node:    ${process.version}`);

  checkSettings();
  await checkDatabase();
  checkUploads();
  await checkApi();

  console.log('\n----------------------------------------------------------');
  if (failures) {
    console.log(`${failures} problem${failures === 1 ? '' : 's'} found${warnings ? `, and ${warnings} thing${warnings === 1 ? '' : 's'} worth a look` : ''}.`);
    console.log('Fix the FAIL lines above, then run this again.');
    process.exit(1);
  }
  console.log(warnings ? `Everything works. ${warnings} thing${warnings === 1 ? '' : 's'} worth a look above.` : 'Everything works.');
};

main().catch((err) => {
  console.error('\nThe check itself failed to run:', err.message);
  process.exit(1);
});
