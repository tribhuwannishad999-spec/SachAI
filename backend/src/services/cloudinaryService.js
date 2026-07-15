const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new AppError(
      'Cloudinary कॉन्फ़िगर नहीं है। सर्वर के .env में CLOUDINARY_* वेरिएबल जोड़ें।',
      500,
      'CLOUDINARY_NOT_CONFIGURED'
    );
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  configured = true;
}

/**
 * Uploads an in-memory file buffer (from multer) to Cloudinary and returns
 * the hosted URL + basic metadata. This is real storage, not a mock path.
 */
function uploadBuffer(buffer, { resourceType = 'auto', folder = 'sachai' } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (err, result) => {
        if (err) {
          logger.error('Cloudinary upload failed', { err: err.message });
          return reject(new AppError('फ़ाइल अपलोड करने में समस्या हुई।', 502, 'UPLOAD_FAILED'));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
