const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const rapidApiService = require('../services/rapidApiService');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');

const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

const verifyPhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone || !PHONE_REGEX.test(phone)) {
    throw new AppError('कृपया एक मान्य फ़ोन नंबर भेजें।', 400, 'INVALID_PHONE');
  }

  const cacheKey = cacheService.makeKey('phone', phone);
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const lookup = await rapidApiService.lookupPhone(phone);

  const userPrompt = lookup.available
    ? `फ़ोन नंबर: ${phone}\nसार्वजनिक स्रोत से प्राप्त वास्तविक डेटा: ${JSON.stringify(lookup.data)}`
    : `फ़ोन नंबर: ${phone}\nकोई सार्वजनिक सत्यापन डेटा उपलब्ध नहीं है (RapidAPI कॉन्फ़िगर नहीं है)। कृपया "स्पष्ट नहीं" स्थिति दें और केवल सामान्य सावधानियाँ बताएं।`;

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.phone,
    userPrompt,
  });

  const envelope = buildSuccessEnvelope({
    category: 'phone',
    aiResult: normalizeAiResult(result),
    provider,
    extra: { lookup },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyPhone };
