import express from 'express';
import Post from '../models/Post.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { removeUpload } from '../middleware/upload.js';
import { httpError, asyncHandler } from '../utils/httpError.js';
import { uniqueSlug } from '../utils/slug.js';

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const makeExcerpt = (md = '') =>
  md.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`~[\]()!|-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
const normTags = (t) =>
  (Array.isArray(t) ? t : String(t || '').split(','))
    .map((x) => String(x).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
const canManage = (post, user) => String(post.author) === String(user._id) || user.role === 'admin';

// Public: published posts (search + pagination)
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 24);
  const filter = { status: 'published' };
  if (req.query.q) {
    const r = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ title: r }, { tags: r }, { excerpt: r }];
  }
  if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();

  const [posts, total] = await Promise.all([
    Post.find(filter).select('-content').populate('author', 'name')
      .sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter),
  ]);
  res.json({ posts, page, total, pages: Math.ceil(total / limit), hasMore: page * limit < total });
}));

// Logged-in user's own posts (dashboard)
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 8, 24);
  const filter = { author: req.user._id };
  if (['draft', 'published'].includes(req.query.status)) filter.status = req.query.status;

  const [posts, total, draft, published] = await Promise.all([
    Post.find(filter).select('-content').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter),
    Post.countDocuments({ author: req.user._id, status: 'draft' }),
    Post.countDocuments({ author: req.user._id, status: 'published' }),
  ]);
  res.json({ posts, page, total, hasMore: page * limit < total, counts: { all: draft + published, draft, published } });
}));

// Public by slug (drafts only visible to owner/admin)
router.get('/slug/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name bio');
  if (!post) throw httpError(404, 'Post nahi mila');
  if (post.status === 'draft' && !(req.user && canManage({ author: post.author._id }, req.user))) {
    throw httpError(404, 'Post nahi mila');
  }
  res.json({ post });
}));

// Owner: single post for editing
router.get('/id/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post nahi mila');
  if (!canManage(post, req.user)) throw httpError(403, 'Ye post tumhara nahi hai');
  res.json({ post });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { title, content = '', summary = '', coverImage = '', tags, status = 'draft' } = req.body;
  if (!title?.trim()) throw httpError(400, 'Title zaroori hai');
  const st = status === 'published' ? 'published' : 'draft';
  const post = await Post.create({
    title, content, summary, coverImage,
    tags: normTags(tags),
    excerpt: makeExcerpt(content),
    slug: await uniqueSlug(Post, title),
    status: st,
    publishedAt: st === 'published' ? new Date() : undefined,
    author: req.user._id,
  });
  res.status(201).json({ post });
}));

router.put('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post nahi mila');
  if (!canManage(post, req.user)) throw httpError(403, 'Ye post tumhara nahi hai');

  const { title, content, summary, coverImage, tags, status } = req.body;
  if (title !== undefined) {
    if (!title.trim()) throw httpError(400, 'Title khali nahi ho sakta');
    // Published URL stable rehta hai; sirf draft ka slug title ke saath badalta hai
    if (title !== post.title && post.status === 'draft') post.slug = await uniqueSlug(Post, title, post._id);
    post.title = title;
  }
  if (content !== undefined) { post.content = content; post.excerpt = makeExcerpt(content); }
  if (summary !== undefined) post.summary = summary;
  if (coverImage !== undefined) {
    if (coverImage !== post.coverImage) removeUpload(post.coverImage);
    post.coverImage = coverImage;
  }
  if (tags !== undefined) post.tags = normTags(tags);
  if (status === 'published' || status === 'draft') {
    if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
    post.status = status;
  }
  await post.save();
  res.json({ post });
}));

router.patch('/:id/status', protect, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) throw httpError(400, 'Status draft ya published hona chahiye');
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post nahi mila');
  if (!canManage(post, req.user)) throw httpError(403, 'Ye post tumhara nahi hai');
  if (status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  post.status = status;
  await post.save();
  res.json({ post });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post nahi mila');
  if (!canManage(post, req.user)) throw httpError(403, 'Ye post tumhara nahi hai');
  removeUpload(post.coverImage);
  await post.deleteOne();
  res.json({ message: 'Post delete ho gaya' });
}));

export default router;
