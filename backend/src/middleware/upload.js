const multer = require('multer');
const { AppError } = require('./errorHandler');

// Files are held in memory only long enough to stream to Cloudinary; nothing
// touches disk, and nothing is retained after the request completes (no
// history / no database, per V1 scope).
const storage = multer.memoryStorage();

const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm',
];

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new AppError('असमर्थित फ़ाइल प्रकार।', 400, 'UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  },
});

module.exports = upload;
