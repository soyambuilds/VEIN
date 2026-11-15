const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Upload a PDF, JPG or PNG file')),
});

// Wraps multer so upload problems come back as clean 400 responses
exports.single = (field) => (req, res, next) =>
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File must be 5 MB or smaller' : err.message;
    res.status(400).json({ message });
  });
exports.dir = dir;
