const db = require('../config/db');

const normalize = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// Strict on purpose: the admin inbox builds a mailto: link from this value.
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const FIELD_LIMITS = {
  name: 150,
  email: 150,
  phone: 50,
  subject: 255,
  message: 5000,
};

const buildSearchClause = (search) => {
  if (!search) {
    return { clause: '', values: [] };
  }

  const likeValue = `%${search}%`;
  return {
    clause: ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ? OR status LIKE ?)` ,
    values: [likeValue, likeValue, likeValue, likeValue, likeValue, likeValue]
  };
};

exports.createMessage = async (req, res) => {
  try {
    const name = normalize(req.body.name);
    const email = normalize(req.body.email);
    const phone = normalize(req.body.phone);
    const subject = normalize(req.body.subject) || 'Website Contact';
    const message = normalize(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const fields = { name, email, phone, subject, message };
    for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
      if (fields[field] && fields[field].length > limit) {
        return res.status(400).json({ error: `${field.charAt(0).toUpperCase()}${field.slice(1)} must be ${limit} characters or less` });
      }
    }

    await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, email, phone, subject, message]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const status = normalize(req.query.status);
    const search = normalize(req.query.search);

    const whereParts = [];
    const values = [];

    if (status && status !== 'all') {
      whereParts.push('status = ?');
      values.push(status);
    }

    const searchClause = buildSearchClause(search);
    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : 'WHERE 1 = 1';

    const rows = await db.query(
      `SELECT * FROM contact_messages ${whereClause}${searchClause.clause} ORDER BY created_at DESC, id DESC`,
      [...values, ...searchClause.values]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load contact messages' });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM contact_messages WHERE id = ?', [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load message' });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const status = normalize(req.body.status);
    const adminNotes = req.body.admin_notes !== undefined ? normalize(req.body.admin_notes) : undefined;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (adminNotes !== undefined) {
      updates.push('admin_notes = ?');
      values.push(adminNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db.query(`UPDATE contact_messages SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};