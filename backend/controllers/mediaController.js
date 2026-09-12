const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');
const { UPLOAD_DIR } = require('../config/paths');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// file-type is ESM-only; importing it lazily keeps require() working on every Node version.
let fileTypeModule;
const detectFileType = async (buffer) => {
  fileTypeModule = fileTypeModule || await import('file-type');
  return fileTypeModule.fileTypeFromBuffer(buffer);
};

// Use memoryStorage to validate magic bytes before writing to disk
const storage = multer.memoryStorage();

const MAX_FILE_SIZE_MB = 5;

const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/x-icon'
];

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG, ICO) are allowed'), false);
    }
  }
});

const singleImage = upload.single('image');

// Turns multer's errors (too large, wrong type) into a 400 the admin can read.
exports.uploadMiddleware = (req, res, next) => {
  singleImage(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? `Image is too large. The maximum size is ${MAX_FILE_SIZE_MB} MB.`
      : err.message || 'Upload failed';
    res.status(400).json({ error: message });
  });
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    let ext;

    if (req.file.mimetype === 'image/svg+xml') {
      // file-type can't identify SVG (it's XML), so check the content and never trust the client's extension.
      const head = buffer.subarray(0, 2048).toString('utf8');
      if (!/<svg[\s>]/i.test(head)) {
        return res.status(400).json({ error: 'The file is not a valid SVG image.' });
      }
      ext = '.svg';
    } else {
      // Validate magic bytes for everything else
      const type = await detectFileType(buffer);
      if (!type || !allowedMimeTypes.includes(type.mime)) {
        return res.status(400).json({ error: 'The file content does not match a supported image format.' });
      }
      ext = '.' + type.ext;
    }

    // Generate random secure filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const secureFilename = req.file.fieldname + '-' + uniqueSuffix + ext;
    const filePath = path.join(UPLOAD_DIR, secureFilename);

    // Save to disk securely
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${secureFilename}`;
    const originalName = req.file.originalname;

    await db.query('INSERT INTO media_library (url, title) VALUES (?, ?)', [fileUrl, originalName]);

    res.json({ url: fileUrl });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
};
