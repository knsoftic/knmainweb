// Creates an admin account, or resets the password of an existing one.
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' [ADMIN_NAME='Your Name'] npm run create-admin
//
// The password is read from the environment (not a command-line argument) so it doesn't end up in
// process listings. Resetting an existing account also signs out its other sessions.
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const MIN_PASSWORD_LENGTH = 8;
const SUPER_ADMIN_ROLE_ID = 1;

const columnExists = async (table, column) => {
  const rows = await db.query(
    'SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    [table, column]
  );
  return rows[0]?.count > 0;
};

(async () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const name = String(process.env.ADMIN_NAME || 'KN Softic Admin').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Set ADMIN_EMAIL to the admin\'s email address.');
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Set ADMIN_PASSWORD to a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [existing] = await db.query('SELECT id FROM admin_users WHERE email = ?', [email]);

    if (existing) {
      const revokeSessions = (await columnExists('admin_users', 'token_version')) ? ', token_version = token_version + 1' : '';
      await db.query(`UPDATE admin_users SET password_hash = ?, is_active = 1${revokeSessions} WHERE id = ?`, [passwordHash, existing.id]);
      console.log(`Password reset for ${email}; its other sessions are signed out.`);
    } else {
      await db.query(
        'INSERT INTO admin_users (role_id, full_name, email, password_hash, is_active) VALUES (?, ?, ?, ?, 1)',
        [SUPER_ADMIN_ROLE_ID, name, email, passwordHash]
      );
      console.log(`Admin account created for ${email}.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Could not create the admin account:', err.message);
    process.exit(1);
  }
})();
