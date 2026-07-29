const db = require('../config/db');

exports.getAllServices = async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services ORDER BY display_order ASC');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

exports.createService = async (req, res) => {
  try {
    const { id, category_id, icon, image_url, title, page_title, description, home_description, display_order } = req.body;
    await db.query(
      `INSERT INTO services (id, category_id, icon, image_url, title, page_title, description, home_description, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category_id || 1, icon, image_url, title, page_title, description, home_description, display_order || 0]
    );
    res.json({ success: true, message: 'Service created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, icon, image_url, title, page_title, description, home_description, display_order, is_active } = req.body;
    await db.query(
      `UPDATE services SET category_id = ?, icon = ?, image_url = ?, title = ?, page_title = ?, description = ?, home_description = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [category_id, icon, image_url, title, page_title, description, home_description, display_order, is_active, id]
    );
    res.json({ success: true, message: 'Service updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
