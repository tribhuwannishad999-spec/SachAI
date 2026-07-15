/**
 * Unified AI gateway.
 *
 * Tries providers in the priority order specified in the brief:
 *   1. OpenRouter  2. Gemini  3. Groq  4. Hugging Face
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

async function callOpenRouter({ systemPrompt, userPrompt, imageBase64, imageMimeType }) {
  if (!env.ai.openrouter.key) throw new Error('OpenRouter not configured');
  const model = imageBase64 ? env.ai.openrouter.visionModel : env.ai.openrouter.model;

  const userContent = imageBase64
    ? [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ]
    : userPrompt;

  const res = await withTimeout(
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ai.openrouter.key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sachai.in',
        'X-Title': 'SachAI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
      }),
    }),
    TIMEOUT_MS,
    'OpenRouter'
  );
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

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

async function callGroq({ systemPrompt, userPrompt }) {
  if (!env.ai.groq.key) throw new Error('Groq not configured');
  // Groq's current vision support is model-specific and changes frequently;
  // this gateway uses Groq for TEXT analysis only (messages, links, phone,
  // news) and relies on OpenRouter/Gemini for image/video vision tasks.
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

async function callHuggingFace({ systemPrompt, userPrompt, imageBase64, imageMimeType }) {
  if (!env.ai.huggingface.token) throw new Error('Hugging Face not configured');
  const model = imageBase64 ? env.ai.huggingface.visionModel : env.ai.huggingface.model;

  const userContent = imageBase64
    ? [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ]
    : userPrompt;

  const res = await withTimeout(
    fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ai.huggingface.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
      }),
    }),
    TIMEOUT_MS,
    'HuggingFace'
  );
  if (!res.ok) throw new Error(`HuggingFace HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

const PROVIDER_CHAIN = [
  { name: 'openrouter', call: callOpenRouter },
  { name: 'gemini', call: callGemini },
  { name: 'groq', call: callGroq },
  { name: 'huggingface', call: callHuggingFace },
];

/**
 * Runs the prompt through the provider chain and returns parsed JSON plus
 * which provider actually answered (useful for logging/debugging, and shown
 * in the API response so nothing is hidden from the caller).
 */
async function analyze(input) {
  const errors = [];
  for (const provider of PROVIDER_CHAIN) {
    // Vision requests skip Groq (see callGroq note above) so we don't burn a
    // guaranteed-to-fail call before falling through to HuggingFace.
    if (input.imageBase64 && provider.name === 'groq') continue;
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
  throw new AppError(
    'सभी AI सेवाएँ अभी उपलब्ध नहीं हैं। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    503,
    'ALL_PROVIDERS_FAILED'
  );
}

module.exports = { analyze };
