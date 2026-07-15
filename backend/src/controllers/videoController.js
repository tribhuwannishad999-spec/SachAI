const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const videoMetaService = require('../services/videoMetaService');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');

const verifyVideo = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    throw new AppError('कृपया एक मान्य वीडियो लिंक भेजें।', 400, 'NO_URL');
  }

  const cacheKey = cacheService.makeKey('video', url);
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const videoMeta = await videoMetaService.fetchVideoMeta(url);

  const userPrompt = `वीडियो लिंक: ${url}\nउपलब्ध सार्वजनिक मेटाडेटा: ${JSON.stringify(videoMeta)}\n\nइस जानकारी के आधार पर विश्लेषण कीजिए।`;

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.video,
    userPrompt,
  });

  const envelope = buildSuccessEnvelope({
    category: 'video',
    aiResult: normalizeAiResult(result),
    provider,
    extra: { videoMeta, url },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyVideo };
