const { v4: uuidv4 } = require('uuid');

/**
 * Standard success envelope for every /api/verify/* route. `provider` tells
 * the caller which real AI backend actually answered (transparency, and
 * useful for support/debugging) and `extra` carries category-specific real
 * data (metadata, whois, oEmbed, etc).
 */
function buildSuccessEnvelope({ category, aiResult, provider, extra = {} }) {
  return {
    success: true,
    id: uuidv4(),
    category,
    provider,
    disclaimer: 'यह AI आधारित विश्लेषण है। इसे अंतिम प्रमाण या कानूनी निर्णय न मानें।',
    result: aiResult,
    details: extra,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildSuccessEnvelope };
