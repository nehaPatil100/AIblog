import express from 'express';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { httpError, asyncHandler } from '../utils/httpError.js';

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) throw httpError(400, 'Name, email aur password daalo');
  if (password.length < 6) throw httpError(400, 'Password kam se kam 6 characters ka hona chahiye');
  if (await User.findOne({ email: email.toLowerCase().trim() })) throw httpError(409, 'Is email se account pehle se hai');

  const isAdmin = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase().trim();
  const user = await User.create({ name, email, password, role: isAdmin ? 'admin' : 'user' });
  res.status(201).json({ token: signToken(user._id), user: user.toPublic() });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email aur password daalo');
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Email ya password galat hai');
  res.json({ token: signToken(user._id), user: user.toPublic() });
}));

router.get('/me', protect, (req, res) => res.json({ user: req.user.toPublic() }));

router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  if (name !== undefined) {
    if (!name.trim()) throw httpError(400, 'Name khali nahi ho sakta');
    req.user.name = name;
  }
  if (bio !== undefined) req.user.bio = bio;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
}));

router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw httpError(400, 'Dono passwords daalo');
  if (newPassword.length < 6) throw httpError(400, 'Naya password kam se kam 6 characters ka ho');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw httpError(401, 'Current password galat hai');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password change ho gaya' });
}));

export default router;
