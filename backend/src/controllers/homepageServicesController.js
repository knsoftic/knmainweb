const db = require('../config/db');

exports.getFeaturedServices = async (req, res) => {
  try {
    const query = `
      SELECT s.*, hfs.display_order as homepage_order
      FROM services s
      JOIN homepage_featured_services hfs ON s.id = hfs.service_id
      ORDER BY hfs.display_order ASC
    `;
    const services = await db.query(query);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch featured services' });
  }
};

exports.updateFeaturedServices = async (req, res) => {
  try {
    const { serviceIds } = req.body;
    
    if (!Array.isArray(serviceIds)) {
      return res.status(400).json({ error: 'serviceIds must be an array' });
    }
    
    if (serviceIds.length > 3) {
      return res.status(400).json({ error: 'Maximum of 3 services can be featured on the homepage' });
    }

    await db.query('DELETE FROM homepage_featured_services');

    for (let i = 0; i < serviceIds.length; i++) {
      await db.query(
        'INSERT INTO homepage_featured_services (service_id, display_order) VALUES (?, ?)',
        [serviceIds[i], i + 1]
      );
    }

    res.json({ success: true, message: 'Featured services updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update featured services' });
  }
};
