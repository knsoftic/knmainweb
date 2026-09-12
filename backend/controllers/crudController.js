const db = require('../config/db');

/**
 * @param {string} tableName
 * @param {string[]} fields Columns clients may write. Include 'id' for tables whose ids the client chooses.
 * @param {{ autoId?: boolean }} [options] autoId: the table has an AUTO_INCREMENT id, so any client-sent id is ignored on create.
 */
exports.createCRUDController = (tableName, fields, { autoId = false } = {}) => {
  const orderBy = fields.includes('display_order') ? 'display_order ASC, id ASC' : 'id ASC';
  const createFields = autoId ? fields.filter((f) => f !== 'id') : fields;
  const updateFields = fields.filter((f) => f !== 'id');

  return {
    getAll: async (req, res) => {
      try {
        const data = await db.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy}`);
        res.json(data);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch' });
      }
    },

    create: async (req, res) => {
      try {
        const body = req.body || {};
        // Include fields that are present in the request body, and exclude undefined
        const presentFields = createFields.filter((f) => body[f] !== undefined);
        if (presentFields.length === 0) {
          return res.status(400).json({ error: 'No valid fields to save' });
        }

        const values = presentFields.map((f) => body[f]);
        const placeholders = presentFields.map(() => '?').join(', ');

        const result = await db.query(
          `INSERT INTO ${tableName} (${presentFields.join(', ')}) VALUES (${placeholders})`,
          values
        );
        res.json({ success: true, id: autoId ? result.insertId : body.id });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create' });
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        const body = req.body || {};
        // Only columns sent in the request are changed; everything else keeps its value.
        const presentFields = updateFields.filter((f) => body[f] !== undefined);
        if (presentFields.length === 0) {
          return res.status(400).json({ error: 'No valid fields to update' });
        }

        const setClause = presentFields.map((f) => `${f} = ?`).join(', ');
        const values = [...presentFields.map((f) => body[f]), id];

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
  };
};
