require('dotenv').config();

function list(val) {
  return (val || '').split(',').map((s) => s.trim()).filter(Boolean);
}

// Origins that are always allowed even if CORS_ORIGIN is left empty, so the
// site works out of the box on the standard Render + Vercel + local-dev
// combination without the user having to configure anything extra.
const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /\.vercel\.app$/,
  /\.onrender\.com$/,
];

module.exports = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: list(process.env.CORS_ORIGIN),
  defaultAllowedOriginPatterns: DEFAULT_ALLOWED_ORIGIN_PATTERNS,

  // Priority order used automatically by aiGateway.js: 1 -> 2 -> 3 -> 4.
  // Variable NAMES below are fixed to match what already exists in the
  // Render dashboard — do not rename these env var names.
  ai: {
    gemini: {
      key: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    },
    groq: {
      key: process.env.GROQ_API_KEY || '',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    deepseek: {
      key: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    },
    openai: {
      key: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  urlscan: {
    key: process.env.URLSCAN_API_KEY || '',
  },

  github: {
    token: process.env.GITHUB_TOKEN || '',
  },

  rapidapi: {
    key: process.env.RAPIDAPI_KEY || '',
    phoneHost: process.env.RAPIDAPI_PHONE_HOST || '',
    phoneEndpoint: process.env.RAPIDAPI_PHONE_ENDPOINT || '',
    whoisHost: process.env.RAPIDAPI_WHOIS_HOST || '',
    whoisEndpoint: process.env.RAPIDAPI_WHOIS_ENDPOINT || '',
  },

  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '1800', 10),
  },

  rateLimit: {
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10),
  },
};
