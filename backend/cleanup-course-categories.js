// Lists (and with --apply, deletes) service categories that the old Courses admin page created by
// mistake: categories no service uses whose slug matches a course's category.
//
//   npm run cleanup-course-categories            # show what would be removed
//   npm run cleanup-course-categories -- --apply # remove them
const db = require('./config/db');

const slugify = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

(async () => {
  const apply = process.argv.includes('--apply');
  try {
    const courses = await db.query('SELECT category, filter_slug FROM courses');
    const courseSlugs = new Set(courses.flatMap((c) => [slugify(c.filter_slug), slugify(c.category)]).filter(Boolean));

    const unused = await db.query(
      'SELECT sc.id, sc.name, sc.filter_slug FROM service_categories sc LEFT JOIN services s ON s.category_id = sc.id WHERE s.id IS NULL'
    );
    const strays = unused.filter((c) => courseSlugs.has(slugify(c.filter_slug)) || courseSlugs.has(slugify(c.id)));

    if (strays.length === 0) {
      console.log('No leftover course categories found.');
      process.exit(0);
    }

    for (const category of strays) {
      console.log(`${apply ? 'Removing' : 'Would remove'}: "${category.name}" (id ${category.id})`);
      if (apply) {
        await db.query('DELETE FROM service_categories WHERE id = ?', [category.id]);
      }
    }
    if (!apply) console.log('\nNothing was changed. Run again with --apply to remove these.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
})();
