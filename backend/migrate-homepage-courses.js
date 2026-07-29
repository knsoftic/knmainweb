const db = require('./src/config/db');

async function run() {
  try {
    console.log('Creating homepage_featured_courses table...');
    const query = `
      CREATE TABLE IF NOT EXISTS homepage_featured_courses (
        course_id VARCHAR(100) NOT NULL,
        display_order INT NOT NULL,
        PRIMARY KEY (course_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(query);
    console.log('Table created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  }
  process.exit();
}
run();
