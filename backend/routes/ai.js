import express from 'express';
import { protect } from '../middleware/auth.js';
import { askGemini } from '../utils/gemini.js';
import { httpError, asyncHandler } from '../utils/httpError.js';

const router = express.Router();
router.use(protect);

const LENGTHS = { short: '400 words', medium: '800 words', long: '1200 words' };
const stripFence = (t) => t.replace(/^```(?:markdown|md)?\s*\n/i, '').replace(/\n```\s*$/, '').trim();

// 1) AI Blog Generator
router.post('/generate', asyncHandler(async (req, res) => {
  const { topic, tone = 'friendly', length = 'medium', keywords = '' } = req.body;
  if (!topic?.trim()) throw httpError(400, 'Topic likho');
  const words = LENGTHS[length] || LENGTHS.medium;

  const prompt = `You are an expert blog writer. Write a complete, well-structured blog post in Markdown.

Topic: ${topic}
Tone: ${tone}
Target length: about ${words}
${keywords ? `Keywords to include naturally: ${keywords}` : ''}

Rules:
- Start with a single H1 title (# Title), then an engaging introduction.
- Use H2/H3 headings, short paragraphs, and bullet lists where useful.
- Include code blocks with a language tag (e.g. \`\`\`js) ONLY if the topic is technical.
- End with a short conclusion.
- Write in the same language as the topic.
- Return ONLY the Markdown. No commentary, and do not wrap it in a code fence.`;

  const content = stripFence(await askGemini(prompt));
  const m = content.match(/^#\s+(.+)$/m);
  res.json({ title: m ? m[1].trim() : '', content });
}));

// 2) AI Blog Ideas
router.post('/ideas', asyncHandler(async (req, res) => {
  const { topic, count = 6 } = req.body;
  if (!topic?.trim()) throw httpError(400, 'Topic ya category likho');
  const n = Math.min(Math.max(parseInt(count, 10) || 6, 3), 10);

  const prompt = `Suggest ${n} fresh, specific blog post ideas about: "${topic}".
Return ONLY a JSON array of ${n} objects. Each object has "title" (catchy, under 90 characters) and "description" (one sentence on what the post covers).
Write in the same language as the topic.`;

  const raw = await askGemini(prompt, { json: true });
  let ideas;
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    ideas = JSON.parse(clean.slice(clean.indexOf('['), clean.lastIndexOf(']') + 1));
  } catch {
    throw httpError(502, 'AI ka response samajh nahi aaya, dobara try karo');
  }
  res.json({ ideas: ideas.filter((i) => i?.title).slice(0, n) });
}));

// 3) AI Blog Summary
router.post('/summary', asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim().length < 50) throw httpError(400, 'Summary ke liye thoda aur content likho');

  const prompt = `Summarize the following blog post in 2-3 clear sentences (maximum 60 words). Plain text only, no Markdown, no preamble. Use the same language as the post.

${content.slice(0, 12000)}`;

  res.json({ summary: (await askGemini(prompt)).replace(/\s+/g, ' ').trim() });
}));

export default router;
