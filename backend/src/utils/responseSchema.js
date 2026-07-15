/**
 * Normalizes whatever JSON the AI model returned into a fixed, honest shape.
 * Per the brief: NEVER a fabricated numeric confidence score. Status must be
 * one of a fixed categorical set. If the model's output doesn't fit, we
 * degrade to "स्पष्ट नहीं" (unclear) rather than guessing a number.
 */
const ALLOWED_STATUS = [
  'अधिक विश्वसनीय',   // Likely genuine / safe
  'सत्यापन आवश्यक',    // Needs verification
  'संदेहास्पद',         // Suspicious / likely fake or risky
  'स्पष्ट नहीं',        // Not enough signal to say
];

function coerceStatus(raw) {
  if (ALLOWED_STATUS.includes(raw)) return raw;
  const normalized = String(raw || '').toLowerCase();
  if (/likely|genuine|safe|अधिक/.test(normalized)) return 'अधिक विश्वसनीय';
  if (/suspicious|fake|risky|scam|संदेह/.test(normalized)) return 'संदेहास्पद';
  if (/verification|possible|needs|सत्यापन/.test(normalized)) return 'सत्यापन आवश्यक';
  return 'स्पष्ट नहीं';
}

function statusEmoji(status) {
  return {
    'अधिक विश्वसनीय': '🟢',
    'सत्यापन आवश्यक': '🟠',
    'संदेहास्पद': '🔴',
    'स्पष्ट नहीं': '⚪',
  }[status] || '⚪';
}

function normalizeAiResult(aiJson) {
  const status = coerceStatus(aiJson.status);
  return {
    status,
    emoji: statusEmoji(status),
    summary: String(aiJson.summary || '').slice(0, 1200),
    reasons: Array.isArray(aiJson.reasons) ? aiJson.reasons.slice(0, 8).map(String) : [],
    riskLevel: ['low', 'medium', 'high'].includes(aiJson.risk_level) ? aiJson.risk_level : 'unknown',
    safetyTips: Array.isArray(aiJson.safety_tips) && aiJson.safety_tips.length
      ? aiJson.safety_tips.slice(0, 6).map(String)
      : [
          'Official Source देखें',
          'Reverse Image Search करें',
          'विश्वसनीय समाचार स्रोत देखें',
          'व्यक्तिगत जानकारी साझा न करें',
        ],
  };
}

module.exports = { normalizeAiResult, ALLOWED_STATUS };
