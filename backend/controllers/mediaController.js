const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileTypeFromBuffer } = require('file-type');
const crypto = require('crypto');
const db = require('../config/db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memoryStorage to validate magic bytes before writing to disk
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/x-icon'
];

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG, ICO) are allowed'), false);
    }
  }
});

exports.uploadMiddleware = upload.single('image');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    let mime = req.file.mimetype;
    let ext = path.extname(req.file.originalname).toLowerCase();

    // Validate magic bytes for non-SVG files (file-type doesn't detect SVG reliably since it's XML)
    if (mime !== 'image/svg+xml') {
      const type = await fileTypeFromBuffer(buffer);
      if (!type || !allowedMimeTypes.includes(type.mime)) {
        return res.status(400).json({ error: 'Invalid file format detected (magic bytes mismatch).' });
      }
      mime = type.mime;
      ext = '.' + type.ext;
    }

    // Generate random secure filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const secureFilename = req.file.fieldname + '-' + uniqueSuffix + ext;
    const filePath = path.join(uploadDir, secureFilename);

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
