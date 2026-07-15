require('dotenv').config();

function list(val) {
  return (val || '').split(',').map((s) => s.trim()).filter(Boolean);
}

module.exports = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: list(process.env.CORS_ORIGIN),

  ai: {
    openrouter: {
      key: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'google/gemini-3.5-flash',
      visionModel: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-3.5-flash',
    },
    gemini: {
      key: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    },
    groq: {
      key: process.env.GROQ_API_KEY || '',
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    },
    huggingface: {
      token: process.env.HF_TOKEN || '',
      model: process.env.HF_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
      visionModel: process.env.HF_VISION_MODEL || 'meta-llama/Llama-3.2-11B-Vision-Instruct',
    },
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
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
