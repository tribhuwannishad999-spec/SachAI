/**
 * Thin fetch wrapper around the SachAI backend. Every function here makes a
 * REAL network call — there is no mock branch, no random fallback. If the
 * backend/API call fails, the error is thrown up to the caller to display
 * honestly (e.g. "verification service unavailable"), never papered over
 * with a fabricated result.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.success === false) {
    const message = data?.error?.message || 'सर्वर से जवाब नहीं मिला। कृपया पुनः प्रयास करें।';
    throw new Error(message);
  }
  return data;
}

export async function verifyMessage(message) {
  const res = await fetch(`${API_URL}/api/verify/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return handle(res);
}

export async function verifyLink(url) {
  const res = await fetch(`${API_URL}/api/verify/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handle(res);
}

export async function verifyVideo(url) {
  const res = await fetch(`${API_URL}/api/verify/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handle(res);
}

export async function verifyPhone(phone) {
  const res = await fetch(`${API_URL}/api/verify/phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return handle(res);
}

export async function verifyNews(claim) {
  const res = await fetch(`${API_URL}/api/verify/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim }),
  });
  return handle(res);
}

export async function verifyPhoto(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/verify/photo`, { method: 'POST', body: form });
  return handle(res);
}

export async function verifyScreenshot(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/verify/screenshot`, { method: 'POST', body: form });
  return handle(res);
}
