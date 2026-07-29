const db = require('./src/config/db');

async function run() {
  try {
    console.log('Fixing collation of homepage_featured_courses table...');
    const query = `
      ALTER TABLE homepage_featured_courses
      CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
    await db.query(query);
    console.log('Collation fixed successfully!');
  } catch (err) {
    console.error('Error fixing collation:', err);
  }
  process.exit();
}
run();
