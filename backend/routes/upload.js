import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { httpError } from '../utils/httpError.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) throw httpError(400, 'Image select karo');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
