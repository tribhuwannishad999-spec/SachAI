const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const aiGateway = require('../services/aiGateway');
const cacheService = require('../services/cacheService');
const prompts = require('../prompts/systemPrompts');
const { normalizeAiResult } = require('../utils/responseSchema');
const { buildSuccessEnvelope } = require('../utils/buildEnvelope');

const OFFICIAL_VERIFICATION_LINKS = [
  { name: 'PIB Fact Check', url: 'https://factcheck.pib.gov.in/' },
  { name: 'Google Fact Check Explorer', url: 'https://toolbox.google.com/factcheck/explorer' },
  { name: 'Election Commission of India', url: 'https://www.eci.gov.in/' },
];

const verifyNews = asyncHandler(async (req, res) => {
  const { claim } = req.body;
  if (!claim || typeof claim !== 'string' || !claim.trim()) {
    throw new AppError('कृपया जांचने के लिए समाचार/दावा भेजें।', 400, 'NO_CLAIM');
  }

  const cacheKey = cacheService.makeKey('news', claim.trim());
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { result, provider } = await aiGateway.analyze({
    systemPrompt: prompts.news,
    userPrompt: `दावा/समाचार: """${claim.trim()}"""`,
  });

  const envelope = buildSuccessEnvelope({
    category: 'news',
    aiResult: normalizeAiResult(result),
    provider,
    extra: { officialVerificationLinks: OFFICIAL_VERIFICATION_LINKS },
  });

  cacheService.set(cacheKey, envelope);
  res.json(envelope);
});

module.exports = { verifyNews };
