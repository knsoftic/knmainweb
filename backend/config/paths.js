const path = require('path');
const fs = require('fs');

// Where uploaded images are written and served from. Defaults to <repo>/public/uploads;
// set UPLOAD_DIR to move it.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'public', 'uploads');

// Earlier installations kept images in backend/public/uploads, and the database still points at
// files from that era. Serve any such folder as well - read-only, and only when it exists - so an
// installation whose images sit in the older place does not show a page full of broken pictures.
// Writes always go to UPLOAD_DIR alone.
const LEGACY_UPLOAD_DIRS = [
  path.join(__dirname, '..', 'public', 'uploads'),
  path.join(__dirname, '..', '..', 'public', 'uploads'),
]
  .map((dir) => path.resolve(dir))
  .filter((dir, index, all) => all.indexOf(dir) === index && dir !== UPLOAD_DIR && fs.existsSync(dir));

module.exports = { UPLOAD_DIR, LEGACY_UPLOAD_DIRS };
