const exifr = require('exifr');
const logger = require('../config/logger');

/**
 * Extracts REAL EXIF/metadata from an uploaded image buffer, when present.
 * Many AI-generated images and re-saved/edited images strip or lack EXIF
 * data entirely — that absence is itself a genuine (not fabricated) signal
 * we pass to the AI model as context, we never invent metadata values.
 */
async function extractImageMetadata(buffer) {
  try {
    const data = await exifr.parse(buffer, {
      tiff: true, exif: true, gps: true, iptc: true, xmp: true,
    });
    if (!data) return { present: false };
    return {
      present: true,
      make: data.Make || null,
      model: data.Model || null,
      software: data.Software || null,
      dateTimeOriginal: data.DateTimeOriginal || null,
      gps: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null,
    };
  } catch (err) {
    logger.warn(`EXIF parse failed: ${err.message}`);
    return { present: false };
  }
}

module.exports = { extractImageMetadata };
