const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const cloudinaryService = require('../services/cloudinaryService');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');
const crypto = require('crypto');

const verifyScreenshot = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('कृपया एक स्क्रीनशॉट अपलोड करें।', 400, 'NO_FILE');
  }

  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
  const cacheKey = cacheService.makeKey('screenshot', fileHash);
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const uploaded = await cloudinaryService.uploadBuffer(req.file.buffer, { resourceType: 'image' });
  const imageBase64 = req.file.buffer.toString('base64');

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.screenshot,
    userPrompt: 'संलग्न स्क्रीनशॉट का विश्लेषण कीजिए।',
    imageBase64,
    imageMimeType: req.file.mimetype,
  });

  const envelope = buildSuccessEnvelope({
    category: 'screenshot',
    aiResult: normalizeAiResult(result),
    provider,
    extra: { hostedUrl: uploaded.secure_url },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyScreenshot };
