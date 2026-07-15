const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');

const verifyMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError('कृपया जांचने के लिए मैसेज भेजें।', 400, 'NO_MESSAGE');
  }
  if (message.length > 4000) {
    throw new AppError('मैसेज बहुत लंबा है (अधिकतम 4000 अक्षर)।', 400, 'MESSAGE_TOO_LONG');
  }

  const cacheKey = cacheService.makeKey('message', message.trim());
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.message,
    userPrompt: `संदेश: """${message.trim()}"""`,
  });

  const envelope = buildSuccessEnvelope({
    category: 'message',
    aiResult: normalizeAiResult(result),
    provider,
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyMessage };
