/**
 * Unified AI gateway.
 *
 * Tries providers in this priority order (matches the existing Render env
 * vars — names are never changed):
 *   1. GEMINI_API_KEY   2. GROQ_API_KEY   3. DEEPSEEK_API_KEY   4. OPENAI_API_KEY
 *
 * If a provider is not configured (no key) or its call fails/times out, the
 * gateway automatically retries the SAME prompt on the next provider. If
 * every provider fails, it throws — the caller must surface an honest
 * "verification service unavailable" error. It never fabricates a result.
 *
 * All providers are called with a strict instruction to return ONLY JSON
 * matching a fixed schema (see prompts/systemPrompts.js) so the rest of the
 * app never has to invent a confidence number itself.
 */
const fetch = require('node-fetch');
const env = require('../config/env');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

const TIMEOUT_MS = 25000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function extractJson(text) {
  if (!text) throw new Error('empty model response');
  // Models occasionally wrap JSON in ```json fences despite instructions.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object found in model response');
  return JSON.parse(raw.slice(start, end + 1));
}

// ---------- Provider callers (each returns raw text) ----------

// 1. Gemini (Google AI Studio) — supports text + vision (images) natively.
async function callGemini({ systemPrompt, userPrompt, imageBase64, imageMimeType }) {
  if (!env.ai.gemini.key) throw new Error('Gemini not configured');
  const model = env.ai.gemini.model;

  const parts = [{ text: `${systemPrompt}\n\n${userPrompt}` }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
  }

  const res = await withTimeout(
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.ai.gemini.key,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    ),
    TIMEOUT_MS,
    'Gemini'
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n');
}

// 2. Groq — OpenAI-compatible chat completions. Groq's hosted vision models
// change frequently and are not guaranteed available on every account, so
// this gateway uses Groq for TEXT analysis only (messages, links, phone,
// news) and lets Gemini/OpenAI handle image/video vision tasks.
async function callGroq({ systemPrompt, userPrompt }) {
  if (!env.ai.groq.key) throw new Error('Groq not configured');
  const res = await withTimeout(
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ai.groq.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.ai.groq.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    }),
    TIMEOUT_MS,
    'Groq'
  );
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

// 3. DeepSeek — OpenAI-compatible chat completions, text only.
async function callDeepSeek({ systemPrompt, userPrompt, imageBase64 }) {
  if (!env.ai.deepseek.key) throw new Error('DeepSeek not configured');
  if (imageBase64) throw new Error('DeepSeek does not support vision in this gateway');
  const res = await withTimeout(
    fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ai.deepseek.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.ai.deepseek.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    }),
    TIMEOUT_MS,
    'DeepSeek'
  );
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

// 4. OpenAI — chat completions, supports vision too (final fallback for images).
async function callOpenAI({ systemPrompt, userPrompt, imageBase64, imageMimeType }) {
  if (!env.ai.openai.key) throw new Error('OpenAI not configured');

  const userContent = imageBase64
    ? [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ]
    : userPrompt;

  const res = await withTimeout(
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ai.openai.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.ai.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
      }),
    }),
    TIMEOUT_MS,
    'OpenAI'
  );
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

const PROVIDER_CHAIN = [
  { name: 'gemini', call: callGemini, supportsVision: true },
  { name: 'groq', call: callGroq, supportsVision: false },
  { name: 'deepseek', call: callDeepSeek, supportsVision: false },
  { name: 'openai', call: callOpenAI, supportsVision: true },
];

/**
 * Runs the prompt through the provider chain and returns parsed JSON plus
 * which provider actually answered (useful for logging/debugging, and shown
 * in the API response so nothing is hidden from the caller).
 */
async function analyze(input) {
  const errors = [];
  for (const provider of PROVIDER_CHAIN) {
    // Skip text-only providers for vision requests instead of burning a
    // guaranteed-to-fail call before falling through to a vision-capable one.
    if (input.imageBase64 && !provider.supportsVision) continue;
    try {
      const raw = await provider.call(input);
      const json = extractJson(raw);
      logger.info(`AI analysis served by ${provider.name}`);
      return { result: json, provider: provider.name };
    } catch (err) {
      logger.warn(`Provider ${provider.name} failed: ${err.message}`);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }
  logger.error(`All AI providers failed: ${errors.join(' | ')}`);
  throw new AppError(
    'सभी AI सेवाएँ अभी उपलब्ध नहीं हैं। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    503,
    'ALL_PROVIDERS_FAILED'
  );
}

module.exports = { analyze };
