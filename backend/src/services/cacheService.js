const NodeCache = require('node-cache');
const env = require('../config/env');

// Simple in-memory cache. Same input (same URL / same message / same file
// hash) within the TTL window returns the previously computed *real* result
// instead of re-billing the AI APIs — this is a cost/latency optimization,
// never a substitute for a real analysis on first request.
const cache = new NodeCache({ stdTTL: env.cache.ttlSeconds, checkperiod: 120 });

module.exports = {
  get(key) {
    return cache.get(key);
  },
  set(key, value) {
    cache.set(key, value);
  },
  makeKey(namespace, value) {
    return `${namespace}:${Buffer.from(String(value)).toString('base64').slice(0, 180)}`;
  },
};
