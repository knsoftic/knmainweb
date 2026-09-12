const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { hasColumn } = require('../config/schema');
const { verifyAdminToken, readToken } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';
const MIN_PASSWORD_LENGTH = 8;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

// Compared against when the email is unknown, so both failure paths take about as long.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', 10);

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

const loadActiveUser = async (where, value) => {
  const versioned = await hasColumn('admin_users', 'token_version');
  const users = await db.query(
    `SELECT id, email, full_name, role_id, password_hash, ${versioned ? 'token_version' : '0 AS token_version'} FROM admin_users WHERE ${where} = ? AND is_active = 1`,
    [value]
  );
  return users[0] || null;
};

const toSessionData = (user) => ({
  user: {
    id: user.id,
    email: user.email,
    name: user.full_name,
    roleId: user.role_id,
  },
  tv: Number(user.token_version || 0),
});

// Short-lived access token plus a long-lived refresh token in an httpOnly cookie.
const issueSession = (res, user) => {
  const sessionData = toSessionData(user);
  const accessToken = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(sessionData, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('refresh_token', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, user: sessionData.user };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await loadActiveUser('email', email.trim());
    const passwordMatch = await bcrypt.compare(password, user ? user.password_hash : DUMMY_PASSWORD_HASH);

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

    const session = issueSession(res, user);
    res.json({ success: true, user: session.user, token: session.accessToken });
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

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    res.clearCookie('refresh_token', refreshCookieOptions);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }

  try {
    // Verify user still exists, is active, and hasn't changed password since this token was issued
    const user = await loadActiveUser('id', decoded?.user?.id);
    if (!user || Number(user.token_version || 0) !== Number(decoded.tv || 0)) {
      res.clearCookie('refresh_token', refreshCookieOptions);
      return res.status(401).json({ error: 'Session is no longer valid' });
    }

    const sessionData = toSessionData(user);
    const newAccessToken = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '15m' });

    res.json({ token: newAccessToken, user: sessionData.user });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('session', refreshCookieOptions); // In case old session cookies exist
  res.clearCookie('refresh_token', refreshCookieOptions);
  res.json({ success: true });
};

exports.me = async (req, res) => {
  try {
    const user = await verifyAdminToken(readToken(req));
    if (!user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user });
  } catch (err) {
    console.error('Session check error:', err);
    res.status(500).json({ authenticated: false });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const userId = req.user.id;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await loadActiveUser('id', userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Bumping token_version signs out every other session that used the old password.
    if (await hasColumn('admin_users', 'token_version')) {
      await db.query('UPDATE admin_users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [newPasswordHash, userId]);
    } else {
      await db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);
    }

    const updatedUser = await loadActiveUser('id', userId);
    const session = issueSession(res, updatedUser);

    res.json({ success: true, message: 'Password changed successfully', token: session.accessToken });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
