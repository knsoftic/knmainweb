const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { hasColumn } = require('../config/schema');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}

const readToken = (req) => req.cookies?.session || req.header('Authorization')?.replace('Bearer ', '');

/**
 * Returns the admin a token belongs to, or null if the token is missing, invalid, expired,
 * belongs to a deactivated account, or was revoked by a password change (token_version).
 */
const verifyAdminToken = async (token) => {
  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }

  const userId = decoded?.user?.id;
  if (!userId) return null;

  const versioned = await hasColumn('admin_users', 'token_version');
  const rows = await db.query(
    `SELECT ${versioned ? 'token_version' : '0 AS token_version'} FROM admin_users WHERE id = ? AND is_active = 1`,
    [userId]
  );
  if (!rows.length || Number(rows[0].token_version || 0) !== Number(decoded.tv || 0)) {
    return null;
  }

  return decoded.user;
};

const authMiddleware = async (req, res, next) => {
  try {
    const user = await verifyAdminToken(readToken(req));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// For public routes that show more to a logged-in admin (e.g. draft blog posts).
const optionalAuth = async (req, res, next) => {
  try {
    const user = await verifyAdminToken(readToken(req));
    if (user) req.user = user;
  } catch (err) {
    console.error('Optional auth check failed:', err);
  }
  next();
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
module.exports.verifyAdminToken = verifyAdminToken;
module.exports.readToken = readToken;
