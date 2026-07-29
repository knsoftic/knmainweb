const db = require('../config/db');

exports.getFeaturedCourses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, hfc.display_order as homepage_order
      FROM courses c
      JOIN homepage_featured_courses hfc ON c.id = hfc.course_id
      ORDER BY hfc.display_order ASC
    `;
    const courses = await db.query(query);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch featured courses' });
  }
};

exports.updateFeaturedCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;
    
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'courseIds must be an array' });
    }
    
    if (courseIds.length > 3) {
      return res.status(400).json({ error: 'Maximum of 3 courses can be featured on the homepage' });
    }

    await db.query('DELETE FROM homepage_featured_courses');

    for (let i = 0; i < courseIds.length; i++) {
      await db.query(
        'INSERT INTO homepage_featured_courses (course_id, display_order) VALUES (?, ?)',
        [courseIds[i], i + 1]
      );
    }

    res.json({ success: true, message: 'Featured courses updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update featured courses' });
  }
};
