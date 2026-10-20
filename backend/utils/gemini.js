import { httpError } from './httpError.js';

export async function askGemini(prompt, { json = false } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw httpError(500, 'GEMINI_API_KEY .env file mein set nahi hai');

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
          ...(json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });
  } catch {
    throw httpError(502, 'AI service tak pahunch nahi paye. Internet check karo.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(502, data?.error?.message || 'AI request fail ho gayi');

  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) throw httpError(502, 'AI ne khali response diya, dobara try karo');
  return text;
}
