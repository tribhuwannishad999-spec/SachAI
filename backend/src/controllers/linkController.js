const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const urlSecurityService = require('../services/urlSecurityService');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');

const verifyLink = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    throw new AppError('कृपया एक मान्य वेबसाइट लिंक भेजें।', 400, 'NO_URL');
  }

  const cacheKey = cacheService.makeKey('link', url);
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const facts = await urlSecurityService.analyzeUrl(url);
  if (!facts.valid) {
    throw new AppError('यह एक मान्य URL प्रतीत नहीं होता।', 400, 'INVALID_URL');
  }

  const userPrompt = `URL: ${url}\nवास्तविक तकनीकी तथ्य: ${JSON.stringify(facts)}\n\nकेवल इन्हीं तथ्यों के आधार पर विश्लेषण कीजिए।`;

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.link,
    userPrompt,
  });

  const envelope = buildSuccessEnvelope({
    category: 'link',
    aiResult: normalizeAiResult(result),
    provider,
    extra: { facts },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyLink };
