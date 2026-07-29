const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await db.query('SELECT * FROM admin_users WHERE email = ? AND is_active = 1', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        roleId: user.role_id,
      },
    };

    // Short-lived access token
    const accessToken = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '15m' });
    
    // Long-lived refresh token
    const refreshToken = jwt.sign(sessionData, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, user: sessionData.user, token: accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Verify user still exists and is active
    const users = await db.query('SELECT * FROM admin_users WHERE id = ? AND is_active = 1', [decoded.user.id]);
    if (!users || users.length === 0) {
      res.clearCookie('refresh_token');
      return res.status(401).json({ error: 'User is no longer active' });
    }

    const sessionData = {
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].full_name,
        roleId: users[0].role_id,
      }
    };

    const newAccessToken = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '15m' });

    res.json({ token: newAccessToken, user: sessionData.user });
  } catch (err) {
    console.error('Refresh error:', err);
    res.clearCookie('refresh_token');
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('session'); // In case old session cookies exist
  res.clearCookie('refresh_token');
  res.json({ success: true });
};

exports.me = (req, res) => {
  const token = req.cookies?.session || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ authenticated: false });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, user: decoded.user });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const users = await db.query('SELECT * FROM admin_users WHERE id = ? AND is_active = 1', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
