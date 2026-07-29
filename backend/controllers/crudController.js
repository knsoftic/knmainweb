const db = require('../config/db');

exports.createCRUDController = (tableName, fields) => ({
  getAll: async (req, res) => {
    try {
      const data = await db.query(`SELECT * FROM ${tableName}`);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch' });
    }
  },
  
  create: async (req, res) => {
    try {
      // Include fields that are present in the request body, and exclude undefined
      const createFields = fields.filter(f => req.body[f] !== undefined);
      const values = createFields.map(f => req.body[f]);
      const placeholders = createFields.map(() => '?').join(', ');
      
      await db.query(
        `INSERT INTO ${tableName} (${createFields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create' });
    }
  },
  
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = fields.filter(f => f !== 'id');
      const setClause = updateFields.map(f => `${f} = ?`).join(', ');
      const values = [...updateFields.map(f => req.body[f] !== undefined ? req.body[f] : null), id];
      
      await db.query(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, values);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update' });
    }
  },
  
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete' });
    }
  }
});
