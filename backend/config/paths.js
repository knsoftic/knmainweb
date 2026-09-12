const path = require('path');

// Where uploaded images are written and served from. Defaults to <repo>/public/uploads,
// the location production uses today; set UPLOAD_DIR to move it.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'public', 'uploads');

module.exports = { UPLOAD_DIR };
