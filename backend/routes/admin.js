import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { removeUpload } from '../middleware/upload.js';
import { httpError, asyncHandler } from '../utils/httpError.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, posts, published] = await Promise.all([
    User.countDocuments(), Post.countDocuments(), Post.countDocuments({ status: 'published' }),
  ]);
  res.json({ users, posts, published, drafts: posts - published });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const counts = await Post.aggregate([{ $group: { _id: '$author', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ users: users.map((u) => ({ ...u.toPublic(), createdAt: u.createdAt, posts: map[String(u._id)] || 0 })) });
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw httpError(400, 'Apna khud ka account yahan se delete nahi ho sakta');
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User nahi mila');
  const posts = await Post.find({ author: user._id });
  posts.forEach((p) => removeUpload(p.coverImage));
  await Post.deleteMany({ author: user._id });
  await user.deleteOne();
  res.json({ message: 'User aur uske posts delete ho gaye' });
}));

router.get('/posts', asyncHandler(async (req, res) => {
  const posts = await Post.find().select('-content').populate('author', 'name email').sort({ createdAt: -1 }).limit(200);
  res.json({ posts });
}));

export default router;
