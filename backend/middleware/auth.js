import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { httpError, asyncHandler } from '../utils/httpError.js';

const getToken = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

export const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw httpError(401, 'Pehle login karo');
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expire ho gaya, dobara login karo');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User nahi mila');
  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      /* invalid token = guest */
    }
  }
  next();
});

export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : next(httpError(403, 'Sirf admin ke liye'));
