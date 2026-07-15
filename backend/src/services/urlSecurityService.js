const tls = require('tls');
const { URL } = require('url');
const rapidApiService = require('./rapidApiService');

/**
 * REAL, deterministic checks (no AI, no guessing) for a website link:
 *  - is it HTTPS
 *  - does the TLS certificate check out (valid chain, not expired)
 *  - basic suspicious-pattern heuristics (IP-address host, punycode/lookalike,
 *    excessive subdomains, known URL-shortener redirect chains)
 * Domain age is looked up via RapidAPI WHOIS if configured; otherwise marked
 * unavailable rather than fabricated.
 */
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
  const cert = https ? await getCertInfo(u.hostname) : { available: false };
  const flags = suspiciousPatterns(u);
  const whois = await rapidApiService.lookupWhois(u.hostname);

  return {
    valid: true,
    hostname: u.hostname,
    https,
    certificate: cert,
    suspiciousFlags: flags,
    whois, // { available: false, reason } if RapidAPI whois isn't configured
  };
}

module.exports = { analyzeUrl };
