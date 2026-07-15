const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const cloudinaryService = require('../services/cloudinaryService');
const metadataService = require('../services/metadataService');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');
const crypto = require('crypto');

const verifyPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('कृपया एक फोटो अपलोड करें।', 400, 'NO_FILE');
  }

  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
  const cacheKey = cacheService.makeKey('photo', fileHash);
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const metadata = await metadataService.extractImageMetadata(req.file.buffer);
  const uploaded = await cloudinaryService.uploadBuffer(req.file.buffer, { resourceType: 'image' });
  const imageBase64 = req.file.buffer.toString('base64');

  const userPrompt = `छवि की उपलब्ध EXIF/metadata जानकारी: ${JSON.stringify(metadata)}\n\nइस जानकारी और संलग्न छवि के आधार पर विश्लेषण कीजिए।`;

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.photo,
    userPrompt,
    imageBase64,
    imageMimeType: req.file.mimetype,
  });

  const envelope = buildSuccessEnvelope({
    category: 'photo',
    aiResult: normalizeAiResult(result),
    provider,
    extra: {
      metadata,
      hostedUrl: uploaded.secure_url,
      reverseSearchLinks: {
        google: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(uploaded.secure_url)}`,
        tineye: `https://tineye.com/search?url=${encodeURIComponent(uploaded.secure_url)}`,
      },
    },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyPhoto };
