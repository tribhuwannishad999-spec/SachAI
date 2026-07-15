const express = require("express");
const multer = require("multer");
const path = require("path");
const exifr = require("exifr");
const sharp = require("sharp");

const aiGateway = require("../services/aiGateway");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }

    cb(null, true);
  },
});router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "कोई फोटो अपलोड नहीं की गई।",
        });
      }

      const metadata = await sharp(req.file.buffer).metadata();

      let exif = {};
      try {
        exif = (await exifr.parse(req.file.buffer)) || {};
      } catch (e) {
        exif = {};
      }

      const imageBase64 = req.file.buffer.toString("base64");

      const result = await aiGateway.analyzeImage({
        image: imageBase64,
        mimeType: req.file.mimetype,
        metadata,
        exif,
      });      return res.json({
        success: true,
        provider: result.provider || "unknown",
        report: {
          status: result.status || "Needs Verification",
          summary:
            result.summary ||
            "AI उपलब्ध जानकारी के आधार पर पूर्ण निष्कर्ष नहीं निकाल सका।",
          confidence: result.confidence ?? null,
          reasons: result.reasons || [],
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            hasExif: Object.keys(exif).length > 0,
          },
        },
      });
    } catch (error) {
      console.error("Photo verification error:", error);

      return res.status(500).json({
        success: false,
        message: "फोटो की जांच करते समय त्रुटि हुई।",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);module.exports = router;
