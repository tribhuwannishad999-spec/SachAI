const fetch = require('node-fetch');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Generic RapidAPI caller. RapidAPI is a marketplace, not a single fixed
 * endpoint — you must subscribe to a specific API (e.g. a phone-validator or
 * WHOIS API) and put its exact host + path into .env. If those are not
 * configured, this returns `available: false` rather than inventing data.
 */
async function callRapidApi({ host, endpoint, query }) {
  if (!env.rapidapi.key || !host || !endpoint) {
    return { available: false, reason: 'RapidAPI not configured for this lookup' };
  }
  const qs = query ? `?${new URLSearchParams(query).toString()}` : '';
  try {
    const res = await fetch(`https://${host}${endpoint}${qs}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': env.rapidapi.key,
        'X-RapidAPI-Host': host,
      },
    });
    if (!res.ok) throw new Error(`RapidAPI HTTP ${res.status}`);
    const data = await res.json();
    return { available: true, data };
  } catch (err) {
    logger.warn(`RapidAPI call failed: ${err.message}`);
    return { available: false, reason: err.message };
  }
}

function lookupPhone(phoneNumber) {
  return callRapidApi({
    host: env.rapidapi.phoneHost,
    endpoint: env.rapidapi.phoneEndpoint,
    query: { phone: phoneNumber, number: phoneNumber },
  });
}

function lookupWhois(domain) {
  return callRapidApi({
    host: env.rapidapi.whoisHost,
    endpoint: env.rapidapi.whoisEndpoint,
    query: { domain },
  });
}

module.exports = { lookupPhone, lookupWhois };
