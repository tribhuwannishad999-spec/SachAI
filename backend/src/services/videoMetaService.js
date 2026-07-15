const fetch = require('node-fetch');
const logger = require('../config/logger');

/**
 * Pulls REAL public metadata for a video link via oEmbed (no API key
 * required for YouTube/Vimeo's public oEmbed endpoints). This gives the AI
 * model genuine title/author/thumbnail context instead of guessing blindly
 * from a bare URL. Platforms without public oEmbed (private Instagram/
 * WhatsApp shares) simply return unavailable — never fabricated.
 */
const OEMBED_PROVIDERS = [
  { test: /youtube\.com|youtu\.be/, endpoint: (u) => `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json` },
  { test: /vimeo\.com/, endpoint: (u) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(u)}` },
];

async function fetchVideoMeta(url) {
  const provider = OEMBED_PROVIDERS.find((p) => p.test.test(url));
  if (!provider) {
    return { available: false, reason: 'इस प्लेटफ़ॉर्म के लिए सार्वजनिक मेटाडेटा उपलब्ध नहीं है' };
  }
  try {
    const res = await fetch(provider.endpoint(url), { timeout: 10000 });
    if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
    const data = await res.json();
    return {
      available: true,
      title: data.title || null,
      authorName: data.author_name || null,
      thumbnailUrl: data.thumbnail_url || null,
      providerName: data.provider_name || null,
    };
  } catch (err) {
    logger.warn(`Video oEmbed fetch failed: ${err.message}`);
    return { available: false, reason: err.message };
  }
}

module.exports = { fetchVideoMeta };
