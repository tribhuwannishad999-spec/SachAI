const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Protects every /api/verify/* route from abuse. Each analysis call hits paid
// third-party AI APIs, so this limit is deliberately conservative.
const apiRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMinutes * 60 * 1000,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'बहुत अधिक अनुरोध भेजे गए हैं। कृपया कुछ समय बाद पुनः प्रयास करें।',
    },
  },
});

module.exports = { apiRateLimiter };
