const logger = require('./logger');
const env = require('./env');

/**
 * Logs the real configuration state at boot. This NEVER throws/crashes the
 * process — missing optional keys just mean that specific feature degrades
 * honestly at request time (see aiGateway/urlSecurityService/rapidApiService)
 * instead of the whole server failing to start. Render/Vercel deploys must
 * succeed even before every key is filled in.
 */
function validateEnv() {
  const aiProviders = [
    ['GEMINI_API_KEY', env.ai.gemini.key],
    ['GROQ_API_KEY', env.ai.groq.key],
    ['DEEPSEEK_API_KEY', env.ai.deepseek.key],
    ['OPENAI_API_KEY', env.ai.openai.key],
  ];
  const configuredAi = aiProviders.filter(([, key]) => key).map(([name]) => name);
  const missingAi = aiProviders.filter(([, key]) => !key).map(([name]) => name);

  if (configuredAi.length === 0) {
    logger.warn(
      'कोई भी AI प्रोवाइडर कॉन्फ़िगर नहीं है (GEMINI/GROQ/DEEPSEEK/OPENAI में से कोई भी key सेट नहीं)। /api/verify/* सभी 503 देंगे जब तक कम से कम एक key न जोड़ी जाए।'
    );
  } else {
    logger.info(`AI providers configured (priority order): ${configuredAi.join(' -> ')}`);
    if (missingAi.length) {
      logger.info(`AI providers not configured (will be skipped): ${missingAi.join(', ')}`);
    }
  }

  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    logger.warn('Cloudinary पूरी तरह कॉन्फ़िगर नहीं है — photo/screenshot upload endpoints 500 देंगे।');
  }

  if (!env.urlscan.key) {
    logger.warn('URLSCAN_API_KEY सेट नहीं है — link जांच में urlscan.io reputation data शामिल नहीं होगा।');
  }

  if (!env.rapidapi.key) {
    logger.info('RAPIDAPI_KEY सेट नहीं है — phone/WHOIS lookup "unavailable" के रूप में दिखेगा (कोई fabricated data नहीं)।');
  }

  logger.info(`CORS: explicit origins = [${env.corsOrigins.join(', ') || 'none'}] + localhost/vercel.app/onrender.com always allowed`);
  logger.info(`Server environment: ${env.nodeEnv}, PORT=${env.port}`);
}

module.exports = validateEnv;
