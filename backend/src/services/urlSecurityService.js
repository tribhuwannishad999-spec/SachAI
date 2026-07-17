const tls = require('tls');
const { URL } = require('url');
const fetch = require('node-fetch');
const env = require('../config/env');
const logger = require('../config/logger');
const rapidApiService = require('./rapidApiService');

/**
 * REAL, deterministic checks (no AI, no guessing) for a website link:
 *  - is it HTTPS
 *  - does the TLS certificate check out (valid chain, not expired)
 *  - basic suspicious-pattern heuristics (IP-address host, punycode/lookalike,
 *    excessive subdomains, known URL-shortener redirect chains)
 *  - urlscan.io search history for this domain (real prior-scan data — was
 *    this domain flagged/scanned before, does it have a known verdict)
 * Domain age is looked up via RapidAPI WHOIS if configured; otherwise marked
 * unavailable rather than fabricated.
 */

/**
 * Looks up whether urlscan.io has any prior public scans of this hostname.
 * Uses the read-only /search/ endpoint (immediate results, no submission or
 * polling needed) so this stays fast enough for a synchronous request.
 * Returns { available: false, reason } if URLSCAN_API_KEY isn't configured
 * or the lookup fails — never fabricated.
 */
async function lookupUrlscan(hostname) {
  if (!env.urlscan.key) {
    return { available: false, reason: 'URLSCAN_API_KEY not configured' };
  }
  try {
    const res = await fetch(
      `https://urlscan.io/api/v1/search/?q=domain:${encodeURIComponent(hostname)}&size=5`,
      {
        method: 'GET',
        headers: { 'API-Key': env.urlscan.key },
        timeout: 8000,
      }
    );
    if (!res.ok) throw new Error(`urlscan.io HTTP ${res.status}`);
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return {
      available: true,
      totalPriorScans: data.total ?? results.length,
      recentScans: results.slice(0, 5).map((r) => ({
        pageUrl: r.page?.url || null,
        scanDate: r.task?.time || null,
        malicious: r.verdicts?.overall?.malicious ?? null,
        score: r.verdicts?.overall?.score ?? null,
      })),
    };
  } catch (err) {
    logger.warn(`urlscan.io lookup failed: ${err.message}`);
    return { available: false, reason: err.message };
  }
}
function getCertInfo(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: 8000, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          return resolve({ available: false });
        }
        resolve({
          available: true,
          authorized,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'unknown',
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          validNow: new Date(cert.valid_to) > new Date(),
        });
      }
    );
    socket.on('error', () => resolve({ available: false }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ available: false });
    });
  });
}

function suspiciousPatterns(u) {
  const flags = [];
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname);
  if (isIpHost) flags.push('डोमेन नाम की जगह सीधे IP एड्रेस का उपयोग');
  if (u.hostname.includes('xn--')) flags.push('Punycode/लुकअलाइक डोमेन के संकेत');
  const subdomainCount = u.hostname.split('.').length - 2;
  if (subdomainCount >= 3) flags.push('असामान्य रूप से अधिक सब-डोमेन');
  if (/-{2,}/.test(u.hostname)) flags.push('डोमेन में संदिग्ध पैटर्न (कई हाइफ़न)');
  const knownShorteners = ['bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co'];
  if (knownShorteners.some((s) => u.hostname.includes(s))) {
    flags.push('URL Shortener — असली गंतव्य छिपा हो सकता है');
  }
  return flags;
}

async function analyzeUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    return { valid: false };
  }

  const https = u.protocol === 'https:';
  const [cert, whois, urlscan] = await Promise.all([
    https ? getCertInfo(u.hostname) : Promise.resolve({ available: false }),
    rapidApiService.lookupWhois(u.hostname),
    lookupUrlscan(u.hostname),
  ]);
  const flags = suspiciousPatterns(u);

  return {
    valid: true,
    hostname: u.hostname,
    https,
    certificate: cert,
    suspiciousFlags: flags,
    whois, // { available: false, reason } if RapidAPI whois isn't configured
    urlscan, // { available: false, reason } if URLSCAN_API_KEY isn't configured
  };
}

module.exports = { analyzeUrl };
